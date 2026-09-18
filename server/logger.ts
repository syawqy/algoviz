import { config } from './env';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
type Level = keyof typeof LEVELS;

export function genReqId(): string {
  return crypto.randomUUID();
}

interface LogEntry {
  ts: string;
  level: Level;
  req_id: string;
  method?: string;
  path?: string;
  status?: number;
  dur_ms?: number;
  msg?: string;
  err?: string;
}

export function logLine(e: LogEntry): void {
  if (LEVELS[e.level] < LEVELS[config.logLevel]) return;
  process.stdout.write(JSON.stringify(e) + '\n');
}

export function logError(reqId: string, msg: string, err: unknown): void {
  logLine({
    ts: new Date().toISOString(),
    level: 'error',
    req_id: reqId,
    msg,
    err: err instanceof Error ? err.stack ?? err.message : String(err),
  });
}
