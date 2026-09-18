// Centralized environment config with safe defaults.
import { readFileSync } from 'node:fs';

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined) env[k] = v;
  }
  try {
    const raw = readFileSync('.env', 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // .env optional in some environments
  }
  return env;
}

const env = loadEnv();

export const config = {
  port: Number(env.PORT ?? 8807),
  host: env.HOST ?? '127.0.0.1',
  dbPath: env.DB_PATH ?? 'algoviz.db',
  authSecret: env.AUTH_SECRET ?? 'dev-insecure-secret-change-me',
  logLevel: (env.LOG_LEVEL ?? 'info') as 'debug' | 'info' | 'warn' | 'error',
  seed: {
    adminUser: env.SEED_ADMIN_USER ?? '',
    adminPass: env.SEED_ADMIN_PASS ?? '',
    learnerUser: env.SEED_LEARNER_USER ?? '',
    learnerPass: env.SEED_LEARNER_PASS ?? '',
  },
};

export type AppConfig = typeof config;
