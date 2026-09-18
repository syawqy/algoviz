import { describe, test, expect, beforeAll } from 'bun:test';
import { app } from '../index';
import { getDB } from '../db';
import { seed } from '../seed';

beforeAll(async () => {
  await seed();
});

describe('content seed', () => {
  test('seeds at least 20 problems across patterns', () => {
    const n = (getDB().query('SELECT COUNT(*) AS n FROM problems').get() as { n: number }).n;
    expect(n).toBeGreaterThanOrEqual(20);
    const patterns = (getDB().query('SELECT COUNT(*) AS n FROM patterns').get() as { n: number }).n;
    expect(patterns).toBeGreaterThanOrEqual(6);
  });

  test('every problem references a real pattern and carries visual data', () => {
    const bad = getDB()
      .query(
        `SELECT p.slug FROM problems p LEFT JOIN patterns pt ON p.pattern_id = pt.id
         WHERE pt.id IS NULL OR p.visual_kind = '' OR p.visual_data = ''`
      )
      .all();
    expect(bad).toEqual([]);
  });

  test('seed is idempotent', async () => {
    const before = (getDB().query('SELECT COUNT(*) AS n FROM problems').get() as { n: number }).n;
    await seed();
    const after = (getDB().query('SELECT COUNT(*) AS n FROM problems').get() as { n: number }).n;
    expect(after).toBe(before);
  });
});

describe('GET /api/health', () => {
  test('reports ok with a problem count', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.status).toBe('ok');
    expect(body.problems).toBeGreaterThanOrEqual(20);
  });
});

describe('GET /api/problems', () => {
  test('lists every problem with pattern joined', async () => {
    const res = await app.request('/api/problems');
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.problems.length).toBeGreaterThanOrEqual(20);
    expect(body.problems[0].pattern_name).toBeTruthy();
  });

  test('filters by difficulty', async () => {
    const res = await app.request('/api/problems?difficulty=mudah');
    const body = (await res.json()) as any;
    expect(body.problems.length).toBeGreaterThan(0);
    expect(body.problems.every((p: any) => p.difficulty === 'mudah')).toBe(true);
  });

  test('filters by pattern slug', async () => {
    const res = await app.request('/api/problems?pattern=two-pointer');
    const body = (await res.json()) as any;
    expect(body.problems.length).toBeGreaterThan(0);
    expect(body.problems.every((p: any) => p.pattern_slug === 'two-pointer')).toBe(true);
  });

  test('search matches title text', async () => {
    const res = await app.request('/api/problems?q=palindrom');
    const body = (await res.json()) as any;
    expect(body.problems.length).toBeGreaterThan(0);
  });

  test('escapes search input instead of erroring', async () => {
    const res = await app.request('/api/problems?q=' + encodeURIComponent("' OR 1=1 --"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.problems).toEqual([]);
  });
});

describe('GET /api/problems/:slug', () => {
  test('returns full detail with parsed visual data', async () => {
    const res = await app.request('/api/problems/two-sum-ii');
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.problem.visual_kind).toBeTruthy();
    expect(typeof body.problem.visual_data).toBe('object');
    expect(body.problem.walkthrough).toBeTruthy();
  });

  test('404s on unknown slug', async () => {
    const res = await app.request('/api/problems/tidak-ada-soal-ini');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/daily', () => {
  test('is stable for the same day', async () => {
    const a = await (await app.request('/api/daily?day=2026-03-01')).json() as any;
    const b = await (await app.request('/api/daily?day=2026-03-01')).json() as any;
    expect(a.problem.slug).toBe(b.problem.slug);
  });

  test('advances across consecutive days', async () => {
    const days = ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04'];
    const slugs: string[] = [];
    for (const d of days) {
      const body = (await (await app.request(`/api/daily?day=${d}`)).json()) as any;
      slugs.push(body.problem.slug);
    }
    expect(new Set(slugs).size).toBeGreaterThan(1);
  });

  test('covers the whole corpus over time', async () => {
    const total = (getDB().query('SELECT COUNT(*) AS n FROM problems').get() as { n: number }).n;
    const seen = new Set<string>();
    for (let i = 0; i < total * 3; i++) {
      const d = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
      const body = (await (await app.request(`/api/daily?day=${d}`)).json()) as any;
      seen.add(body.problem.slug);
    }
    expect(seen.size).toBe(total);
  });

  test('rejects malformed day', async () => {
    const res = await app.request('/api/daily?day=01-03-2026');
    expect(res.status).toBe(400);
  });

  test('includes a hint for the learner', async () => {
    const body = (await (await app.request('/api/daily?day=2026-05-05')).json()) as any;
    expect(body.problem.hint).toBeTruthy();
  });
});

describe('GET /api/patterns', () => {
  test('returns patterns with problem counts', async () => {
    const res = await app.request('/api/patterns');
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.patterns.length).toBeGreaterThanOrEqual(6);
    const withCount = body.patterns.filter((p: any) => p.problem_count > 0);
    expect(withCount.length).toBe(body.patterns.length);
    expect(body.patterns.every((p: any) => p.recognition)).toBe(true);
  });
});

describe('progress routes require auth', () => {
  // The security middleware runs before auth, so an unauthenticated write is
  // rejected by the CSRF guard (403) rather than the auth guard (401). A test
  // that wants 401 must present same-origin headers.
  test('GET /api/progress is rejected without a session', async () => {
    const res = await app.request('/api/progress');
    expect(res.status).toBe(401);
  });

  test('POST /api/progress is rejected without a session', async () => {
    const res = await app.request('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'two-sum-ii', status: 'selesai' }),
    });
    expect(res.status).toBe(403);
  });

  test('POST /api/progress fails auth with same-origin headers but no session', async () => {
    const res = await app.request('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://127.0.0.1:8807',
        Host: '127.0.0.1:8807',
      },
      body: JSON.stringify({ slug: 'two-sum-ii', status: 'selesai' }),
    });
    expect(res.status).toBe(401);
  });
});
