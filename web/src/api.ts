import { getLocale, type Locale } from './i18n';

/* ── Static-mode detection ──────────────────────────────────────────── *
 * When deployed to GitHub Pages there is no backend.  The build script
 * (scripts/build-static.ts) pre-bakes every API response under /api/<locale>/
 * so we can satisfy the same fetch contract from static files alone.
 */
const IS_STATIC = import.meta.env.BASE_URL !== '/'   // Vite sets BASE_URL in prod
  || window.location.hostname.endsWith('.github.io');

/* ── helpers ────────────────────────────────────────────────────────── */

function withLocale(path: string, locale: Locale = getLocale()): string {
  return path + (path.includes('?') ? '&' : '?') + 'locale=' + locale;
}

/** Build the URL for a static API file.  For problem detail pages the path
 *  contains a slug segment that must map to a file name:
 *    /api/problems/two-sum-ii?locale=en  →  /api/en/problems/two-sum-ii.json
 *  Other endpoints map straightforwardly:
 *    /api/problems?locale=id             →  /api/id/problems.json
 *    /api/patterns?locale=en             →  /api/en/patterns.json
 */
function staticUrl(path: string): string {
  const m = path.match(/^\/api\/(\w+)(?:\/(.+?))?(?:\?.*)?$/);
  if (!m) return path;                       // fallback: return as-is
  const [, endpoint, slug] = m;
  if (slug)  return `api/${endpoint}/${slug}.json`;
  return `api/${endpoint}.json`;
}

export interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
  time_complexity?: string;
  space_complexity?: string;
  pattern_slug: string;
  pattern_name: string;
  status: string | null;
}

export interface ProblemDetail extends Problem {
  statement: string;
  hint: string;
  walkthrough: string;
  solution: string;
  solution_lang: string;
  visual_kind: string;
  visual_data: any;
}

export interface Pattern {
  id: number;
  slug: string;
  name: string;
  blurb: string;
  recognition: string;
  complexity: string;
  problem_count: number;
}

export interface ProgressRow {
  slug: string;
  title: string;
  difficulty: string;
  pattern_slug: string;
  pattern_name: string;
  status: string;
  updated_at: string;
}

export interface SessionUser {
  id: number;
  username: string;
  role: string;
  sub: number;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const url = IS_STATIC ? staticUrl(path) : path;
  const res = await fetch(url, {
    credentials: IS_STATIC ? 'same-origin' : 'include',
    headers: IS_STATIC
      ? {}
      : { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any)?.error ?? `HTTP ${res.status}`);
  return body as T;
}

export const api = {
  me: () => req<{ user: SessionUser }>('/api/auth/me'),
  login: (username: string, password: string) =>
    req<{ ok: boolean; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => req<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  problems: (params: { pattern?: string; difficulty?: string; q?: string } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as Array<[string, string]>
    ).toString();
    return req<{ problems: Problem[] }>(withLocale(`/api/problems${qs ? `?${qs}` : ''}`));
  },
  problem: (slug: string) => req<{ problem: ProblemDetail }>(withLocale(`/api/problems/${slug}`)),
  daily: (day?: string) =>
    req<{ day: string; total: number; problem: Problem & { hint: string } }>(
      withLocale(`/api/daily${day ? `?day=${day}` : ''}`)
    ),
  patterns: () => req<{ patterns: Pattern[] }>(withLocale('/api/patterns')),
  mark: (slug: string, status: 'selesai' | 'ulang') =>
    req<{ ok: boolean }>('/api/progress', { method: 'POST', body: JSON.stringify({ slug, status }) }),
  unmark: (slug: string) => req<{ ok: boolean }>(`/api/progress/${slug}`, { method: 'DELETE' }),
  progress: () =>
    req<{
      progress: ProgressRow[];
      selesai: number;
      ulang: number;
      total: number;
      streak: number;
    }>(withLocale('/api/progress')),
};
