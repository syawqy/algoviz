import { Hono } from 'hono';

const MAX = 240; // requests per window (visualizer stepping is chatty)
const WINDOW_MS = 60_000;

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX;
}

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
};

export async function securityMiddleware(c: any, next: any) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) c.header(k, v);

  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    c.header('Retry-After', '60');
    return c.json({ error: 'too many requests' }, 429);
  }

  const method = c.req.method;
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    const origin = c.req.header('Origin');
    const host = c.req.header('Host');
    const xrw = c.req.header('X-Requested-With');
    const sameOrigin = origin && host && origin.endsWith(host);
    if (!sameOrigin && xrw !== 'XMLHttpRequest') {
      return c.json({ error: 'csrf check failed' }, 403);
    }
  }

  await next();
}

export const securityRoutes = new Hono();
