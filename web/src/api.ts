import { getLocale, type Locale } from './i18n';

// Thin fetch wrapper. Cookies carry the session, so every call includes them.
//
// Content endpoints receive the active locale as a query parameter. The locale
// is read at call time rather than captured once, so a language switch is
// picked up by the next request instead of needing a client rebuild.
function withLocale(path: string, locale: Locale = getLocale()): string {
  return path + (path.includes('?') ? '&' : '?') + 'locale=' + locale;
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
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
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
