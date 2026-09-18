import { Hono } from 'hono';
import { getDB } from '../db';
import { requireAuth, type AuthPayload } from '../auth';
import { PROBLEM_EN, PATTERN_EN } from '../data/content-en';

export const problemRoutes = new Hono();

// Content is localised on read rather than duplicated per locale in the
// database. The database stays the single source of truth for structure and
// visualizer inputs, and adding a third language is a new file plus one lookup
// instead of a schema migration.
type Locale = 'id' | 'en';

export function requestLocale(c: any): Locale {
  const raw = String(c.req.query('locale') ?? '').toLowerCase();
  return raw === 'en' ? 'en' : 'id';
}

// Indonesian lives in the database, so it is the fallback: a slug with no
// English entry keeps rendering in Indonesian instead of going blank.
function localizeProblem<T extends { slug: string }>(row: T, locale: Locale): T {
  if (locale !== 'en') return row;
  const tr = PROBLEM_EN[row.slug];
  if (!tr) return row;
  return {
    ...row,
    title: tr.title,
    statement: tr.statement,
    hint: tr.hint,
    walkthrough: tr.walkthrough,
  };
}

function localizePattern<T extends { slug: string }>(row: T, locale: Locale): T {
  if (locale !== 'en') return row;
  const tr = PATTERN_EN[row.slug];
  if (!tr) return row;
  return {
    ...row,
    name: tr.name,
    blurb: tr.blurb,
    recognition: tr.recognition,
    complexity: tr.complexity,
  };
}

interface ProblemRow {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
  statement: string;
  hint: string;
  walkthrough: string;
  solution: string;
  solution_lang: string;
  visual_kind: string;
  visual_data: string;
  time_complexity: string;
  space_complexity: string;
  pattern_slug: string;
  pattern_name: string;
}

function mapProblem(r: ProblemRow, status: string | null = null) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    difficulty: r.difficulty,
    time_complexity: r.time_complexity,
    space_complexity: r.space_complexity,
    pattern_slug: r.pattern_slug,
    pattern_name: r.pattern_name,
    status,
  };
}

// Deterministic daily pick: the same calendar day always returns the same
// problem for everyone, and consecutive days advance through the corpus.
function dailyIndex(day: string, total: number): number {
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) % 1_000_003;
  const epochDay = Math.floor(Date.parse(day + 'T00:00:00Z') / 86_400_000);
  return (h + epochDay) % total;
}

export function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

const LIST_SQL = `
  SELECT p.id, p.slug, p.title, p.difficulty, p.statement, p.hint, p.walkthrough, p.solution,
         p.solution_lang, p.visual_kind, p.visual_data, p.time_complexity, p.space_complexity,
         pt.slug AS pattern_slug, pt.name AS pattern_name
  FROM problems p JOIN patterns pt ON p.pattern_id = pt.id
`;

// Public: catalogue with optional pattern + difficulty filters and search.
problemRoutes.get('/problems', (c: any) => {
  const user = c.get('user') as AuthPayload | undefined;
  const db = getDB();
  const pattern = c.req.query('pattern') ?? '';
  const difficulty = c.req.query('difficulty') ?? '';
  const q = (c.req.query('q') ?? '').trim();

  let sql = LIST_SQL;
  const where: string[] = [];
  const args: Array<string> = [];
  if (pattern) {
    where.push('pt.slug = ?');
    args.push(pattern);
  }
  if (difficulty) {
    where.push('p.difficulty = ?');
    args.push(difficulty);
  }
  if (q) {
    where.push('(p.title LIKE ? OR p.statement LIKE ?)');
    args.push(`%${q}%`, `%${q}%`);
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY p.sort_order';

  const locale = requestLocale(c);
  const rows = (db.query(sql).all(...args) as ProblemRow[]).map((r) => localizeProblem(r, locale));
  let statusByProblem = new Map<number, string>();
  if (user) {
    const st = db
      .query('SELECT problem_id, status FROM progress WHERE user_id = ?')
      .all(user.sub) as Array<{ problem_id: number; status: string }>;
    statusByProblem = new Map(st.map((s) => [s.problem_id, s.status]));
  }

  return c.json({ problems: rows.map((r) => mapProblem(r, statusByProblem.get(r.id) ?? null)) });
});

// Public: full detail for one problem, including visualizer inputs.
problemRoutes.get('/problems/:slug', (c: any) => {
  const user = c.get('user') as AuthPayload | undefined;
  const db = getDB();
  const slug = c.req.param('slug');
  const locale = requestLocale(c);
  const found = db.query(LIST_SQL + ' WHERE p.slug = ?').get(slug) as ProblemRow | null;
  if (!found) return c.json({ error: 'problem not found' }, 404);
  const row = localizeProblem(found, locale);

  let status: string | null = null;
  if (user) {
    const st = db
      .query('SELECT status FROM progress WHERE user_id = ? AND problem_id = ?')
      .get(user.sub, row.id) as { status: string } | null;
    status = st?.status ?? null;
  }

  let visualData: unknown = {};
  try {
    visualData = JSON.parse(row.visual_data);
  } catch {
    visualData = {};
  }

  // The solution body and the complexity notation are translated too, but only
  // where the English version is supplied: most solutions are language-neutral,
  // so a missing entry falls back to the stored text rather than blanking out.
  const tr2 = PROBLEM_EN[row.slug];

  return c.json({
    problem: {
      ...mapProblem(row, status),
      time_complexity: tr2?.time_complexity ?? row.time_complexity,
      space_complexity: tr2?.space_complexity ?? row.space_complexity,
      statement: row.statement,
      hint: row.hint,
      walkthrough: row.walkthrough,
      solution: tr2?.solution ?? row.solution,
      solution_lang: row.solution_lang,
      visual_kind: row.visual_kind,
      visual_data: visualData,
    },
  });
});

// Public: the daily problem for a given day (defaults to today).
problemRoutes.get('/daily', (c: any) => {
  const user = c.get('user') as AuthPayload | undefined;
  const db = getDB();
  const day = c.req.query('day') || todayKey();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return c.json({ error: 'invalid day format, expected YYYY-MM-DD' }, 400);

  const total = (db.query('SELECT COUNT(*) AS n FROM problems').get() as { n: number }).n;
  if (total === 0) return c.json({ error: 'no problems seeded' }, 503);

  const offset = dailyIndex(day, total);
  const locale = requestLocale(c);
  const found = db
    .query(LIST_SQL + ' ORDER BY p.sort_order LIMIT 1 OFFSET ?')
    .get(offset) as ProblemRow | null;
  if (!found) return c.json({ error: 'problem not found' }, 404);
  const row = localizeProblem(found, locale);

  let status: string | null = null;
  if (user) {
    const st = db
      .query('SELECT status FROM progress WHERE user_id = ? AND problem_id = ?')
      .get(user.sub, row.id) as { status: string } | null;
    status = st?.status ?? null;
  }

  return c.json({
    day,
    total,
    problem: {
      ...mapProblem(row, status),
      hint: row.hint,
    },
  });
});

// Public: pattern catalogue with per-pattern problem counts.
problemRoutes.get('/patterns', (c: any) => {
  const db = getDB();
  const rows = db
    .query(
      `SELECT pt.id, pt.slug, pt.name, pt.blurb, pt.recognition, pt.complexity,
              COUNT(p.id) AS problem_count
       FROM patterns pt LEFT JOIN problems p ON p.pattern_id = pt.id
       GROUP BY pt.id ORDER BY pt.id`
    )
    .all();
  const locale = requestLocale(c);
  return c.json({ patterns: rows.map((r: any) => localizePattern(r, locale)) });
});

// Authenticated: mark a problem done or flag it for review.
problemRoutes.post('/progress', requireAuth(), async (c: any) => {
  const user = c.get('user') as AuthPayload;
  const body = await c.req.json().catch(() => ({}));
  const slug = String(body?.slug ?? '');
  const status = String(body?.status ?? '');
  if (!slug || !['selesai', 'ulang'].includes(status)) {
    return c.json({ error: 'slug and status (selesai|ulang) required' }, 400);
  }
  const db = getDB();
  const problem = db.query('SELECT id FROM problems WHERE slug = ?').get(slug) as { id: number } | null;
  if (!problem) return c.json({ error: 'problem not found' }, 404);

  db.query(
    `INSERT INTO progress (user_id, problem_id, status, updated_at) VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, problem_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`
  ).run(user.sub, problem.id, status);

  return c.json({ ok: true, slug, status });
});

problemRoutes.delete('/progress/:slug', requireAuth(), (c: any) => {
  const user = c.get('user') as AuthPayload;
  const db = getDB();
  const problem = db.query('SELECT id FROM problems WHERE slug = ?').get(c.req.param('slug')) as {
    id: number;
  } | null;
  if (!problem) return c.json({ error: 'problem not found' }, 404);
  db.query('DELETE FROM progress WHERE user_id = ? AND problem_id = ?').run(user.sub, problem.id);
  return c.json({ ok: true });
});

// Authenticated: learner's own progress summary + streak over recent days.
problemRoutes.get('/progress', requireAuth(), (c: any) => {
  const user = c.get('user') as AuthPayload;
  const db = getDB();
  const locale = requestLocale(c);
  const rows = (
    db
      .query(
        `SELECT p.id, p.slug, p.title, p.difficulty, pt.slug AS pattern_slug, pt.name AS pattern_name,
              pr.status, pr.updated_at
       FROM progress pr JOIN problems p ON pr.problem_id = p.id
       JOIN patterns pt ON p.pattern_id = pt.id
       WHERE pr.user_id = ? ORDER BY pr.updated_at DESC`
      )
      .all(user.sub) as Array<{
      status: string;
      updated_at: string;
      slug: string;
      title: string;
      difficulty: string;
      pattern_slug: string;
      pattern_name: string;
    }>
  ).map((r) => {
    const loc = localizeProblem(r, locale);
    const p = localizePattern({ slug: loc.pattern_slug, name: loc.pattern_name }, locale);
    return { ...loc, pattern_name: p.name };
  });

  const selesai = rows.filter((r) => r.status === 'selesai').length;
  const ulang = rows.filter((r) => r.status === 'ulang').length;
  const total = (db.query('SELECT COUNT(*) AS n FROM problems').get() as { n: number }).n;

  // Streak: count back from today over days that have at least one update.
  const days = new Set(rows.map((r) => String(r.updated_at).slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = todayKey(cursor);
    if (days.has(key)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else break;
  }

  return c.json({ progress: rows, selesai, ulang, total, streak });
});
