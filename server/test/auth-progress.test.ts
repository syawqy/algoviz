import { describe, test, expect, beforeAll } from 'bun:test';
import { app } from '../index';
import { getDB } from '../db';
import { seed } from '../seed';
import { config } from '../env';

const ORIGIN = 'http://127.0.0.1:8807';

// Writes must look same-origin to clear the CSRF guard, otherwise they are
// rejected with 403 before authentication is ever evaluated.
function jsonHeaders(cookie = '') {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Origin: ORIGIN,
    Host: '127.0.0.1:8807',
  };
  if (cookie) h.Cookie = cookie;
  return h;
}

async function loginAs(username: string, password: string) {
  const res = await app.request('/api/auth/login', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ username, password }),
  });
  const cookie = res.headers.get('set-cookie') ?? '';
  return { status: res.status, cookie: cookie.split(';')[0] };
}

beforeAll(async () => {
  await seed();
});

describe('auth', () => {
  test('rejects a wrong password', async () => {
    const { status } = await loginAs('learner', 'kata-sandi-salah');
    expect(status).toBe(401);
  });

  test('rejects an unknown user', async () => {
    const { status } = await loginAs('tidak-ada-user-ini', 'apa-saja');
    expect(status).toBe(401);
  });

  test('accepts the seeded learner and issues a session cookie', async () => {
    const { status, cookie } = await loginAs('learner', config.seed.learnerPass);
    expect(status).toBe(200);
    expect(cookie).toContain('sid=');
  });

  test('leaks no password material in the login response', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ username: 'learner', password: config.seed.learnerPass }),
    });
    const raw = await res.text();
    expect(raw).not.toContain(config.seed.learnerPass);
    expect(raw.toLowerCase()).not.toContain('password_hash');
    expect(raw.toLowerCase()).not.toContain('$2b$');
  });

  test('session endpoint reports the logged-in user', async () => {
    const { cookie } = await loginAs('learner', config.seed.learnerPass);
    const res = await app.request('/api/auth/me', { headers: { Cookie: cookie } });
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.user?.username).toBe('learner');
  });

  test('session endpoint rejects without a cookie', async () => {
    const res = await app.request('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('session endpoint rejects a tampered token', async () => {
    const { cookie } = await loginAs('learner', config.seed.learnerPass);
    const forged = cookie.slice(0, -4) + 'AAAA';
    const res = await app.request('/api/auth/me', { headers: { Cookie: forged } });
    expect(res.status).toBe(401);
  });

  test('logout clears the session cookie', async () => {
    const { cookie } = await loginAs('learner', config.seed.learnerPass);
    const res = await app.request('/api/auth/logout', {
      method: 'POST',
      headers: { ...jsonHeaders(cookie) },
    });
    const cleared = res.headers.get('set-cookie') ?? '';
    expect(cleared).toMatch(/sid=;|sid=$|Max-Age=0/i);
  });

  test('rejects login without same-origin headers', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'learner', password: config.seed.learnerPass }),
    });
    expect(res.status).toBe(403);
  });
});

describe('progress tracking', () => {
  const slug = 'two-sum-ii';

  test('marks a problem done and reflects it in the list', async () => {
    const { cookie } = await loginAs('learner', config.seed.learnerPass);
    const userId = (getDB().query('SELECT id FROM users WHERE username = ?').get('learner') as { id: number }).id;
    const problemId = (getDB().query('SELECT id FROM problems WHERE slug = ?').get(slug) as { id: number }).id;
    getDB().query('DELETE FROM progress WHERE user_id = ? AND problem_id = ?').run(userId, problemId);

    const post = await app.request('/api/progress', {
      method: 'POST',
      headers: jsonHeaders(cookie),
      body: JSON.stringify({ slug, status: 'selesai' }),
    });
    expect(post.status).toBe(200);

    const list = await app.request('/api/problems', { headers: { Cookie: cookie } });
    const body = (await list.json()) as any;
    const row = body.problems.find((p: any) => p.slug === slug);
    expect(row.status).toBe('selesai');
  });

  test('flags a problem for review', async () => {
    const { cookie } = await loginAs('learner', config.seed.learnerPass);
    const res = await app.request('/api/progress', {
      method: 'POST',
      headers: jsonHeaders(cookie),
      body: JSON.stringify({ slug: 'valid-palindrome', status: 'ulang' }),
    });
    expect(res.status).toBe(200);
    const summary = await app.request('/api/progress', { headers: { Cookie: cookie } });
    const body = (await summary.json()) as any;
    const row = body.progress.find((p: any) => p.slug === 'valid-palindrome');
    expect(row.status).toBe('ulang');
  });

  test('rejects an invalid status value', async () => {
    const { cookie } = await loginAs('learner', config.seed.learnerPass);
    const res = await app.request('/api/progress', {
      method: 'POST',
      headers: jsonHeaders(cookie),
      body: JSON.stringify({ slug, status: 'setengah-jalan' }),
    });
    expect(res.status).toBe(400);
  });

  test('rejects an unknown slug', async () => {
    const { cookie } = await loginAs('learner', config.seed.learnerPass);
    const res = await app.request('/api/progress', {
      method: 'POST',
      headers: jsonHeaders(cookie),
      body: JSON.stringify({ slug: 'slug-tidak-ada', status: 'selesai' }),
    });
    expect(res.status).toBe(404);
  });

  test('summary reports counts and a streak of at least one on an active day', async () => {
    const { cookie } = await loginAs('learner', config.seed.learnerPass);
    const res = await app.request('/api/progress', { headers: { Cookie: cookie } });
    const body = (await res.json()) as any;
    expect(body.total).toBeGreaterThanOrEqual(20);
    expect(body.selesai).toBeGreaterThanOrEqual(1);
    expect(body.streak).toBeGreaterThanOrEqual(1);
  });

  test('one learner cannot see another learner progress', async () => {
    const admin = await loginAs('admin', config.seed.adminPass);
    const learner = await loginAs('learner', config.seed.learnerPass);

    await app.request('/api/progress', {
      method: 'POST',
      headers: jsonHeaders(learner.cookie),
      body: JSON.stringify({ slug, status: 'selesai' }),
    });

    const adminView = await app.request('/api/progress', { headers: { Cookie: admin.cookie } });
    const body = (await adminView.json()) as any;
    expect(body.progress.find((p: any) => p.slug === slug)).toBeUndefined();
  });

  test('unmark removes the row', async () => {
    const { cookie } = await loginAs('learner', config.seed.learnerPass);
    const del = await app.request(`/api/progress/${slug}`, {
      method: 'DELETE',
      headers: jsonHeaders(cookie),
    });
    expect(del.status).toBe(200);
    const list = await app.request('/api/problems', { headers: { Cookie: cookie } });
    const body = (await list.json()) as any;
    expect(body.problems.find((p: any) => p.slug === slug).status).toBeNull();
  });
});
