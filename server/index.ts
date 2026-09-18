import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { readFileSync } from 'node:fs';
import { config } from './env';
import { getDB } from './db';
import { logLine, logError, genReqId } from './logger';
import { securityMiddleware } from './security';
import { authRoutes, sessionMiddleware } from './auth';
import { problemRoutes } from './routes/problems';
import { seed } from './seed';

const app = new Hono();

// 0. Security headers + rate limit + CSRF
app.use('*', securityMiddleware);

// 1. Observability: request logging + request id
app.use('*', async (c, next) => {
  const reqId = genReqId();
  c.header('X-Request-Id', reqId);
  const start = Date.now();
  try {
    await next();
  } catch (err) {
    logError(reqId, 'unhandled', err);
    if (!c.res) c.json({ error: 'internal', req_id: reqId }, 500);
  } finally {
    logLine({
      ts: new Date().toISOString(),
      level: 'info',
      req_id: reqId,
      method: c.req.method,
      path: c.req.path,
      status: c.res?.status ?? 0,
      dur_ms: Date.now() - start,
    });
  }
});

// 2. Session (optional) so public GETs can still personalise progress
app.use('/api/*', sessionMiddleware);

// 3. API routes
app.route('/api/auth', authRoutes);
app.route('/api', problemRoutes);

// 4. Health check
app.get('/api/health', (c) => {
  let dbOk = false;
  let problems = 0;
  try {
    problems = (getDB().query('SELECT COUNT(*) AS n FROM problems').get() as { n: number }).n;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  return c.json({ status: dbOk ? 'ok' : 'degraded', db: dbOk, problems, ts: Date.now() });
});

// 5. Serve static SPA build
app.use('/assets/*', serveStatic({ root: './web/dist' }));

// 6. SPA fallback (client-side routing)
app.get('*', (c) => {
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'not found' }, 404);
  let html = '';
  try {
    html = readFileSync('./web/dist/index.html', 'utf8');
  } catch {
    html = '<!doctype html><html><body><h1>AlgoViz</h1><p>Build not found. Run `bun run build`.</p></body></html>';
  }
  return c.html(html);
});

export { app };

if (import.meta.main) {
  await seed();
  Bun.serve({
    fetch: app.fetch,
    port: config.port,
    hostname: config.host,
  });
  logLine({
    ts: new Date().toISOString(),
    level: 'info',
    req_id: '-',
    msg: `algoviz listening on http://${config.host}:${config.port}`,
  });

  // Fold the WAL back into the main db file on exit. Without this the -wal file
  // is left behind at whatever size it reached, and it only gets reclaimed the
  // next time the database is opened and checkpointed.
  const shutdown = () => {
    try {
      getDB().exec('PRAGMA wal_checkpoint(TRUNCATE);');
      getDB().close();
    } catch {
      // Nothing useful to do while exiting; the WAL is recovered on next open.
    }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
