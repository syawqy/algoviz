import { getDB } from './db';
import { hashPassword } from './auth';
import { config } from './env';
import { PATTERNS } from './data/patterns';
import { PROBLEMS } from './data/problems';

// Seeds users (from env, idempotent by username) then content (idempotent by slug).
// Content rows are updated on every boot so edits to the data files take effect
// without a manual migration step.
export async function seed(): Promise<void> {
  const db = getDB();

  const accounts: Array<{ user: string; pass: string; role: 'admin' | 'learner' }> = [];
  if (config.seed.adminUser && config.seed.adminPass) {
    accounts.push({ user: config.seed.adminUser, pass: config.seed.adminPass, role: 'admin' });
  }
  if (config.seed.learnerUser && config.seed.learnerPass) {
    accounts.push({ user: config.seed.learnerUser, pass: config.seed.learnerPass, role: 'learner' });
  }

  for (const a of accounts) {
    const existing = db.query('SELECT id FROM users WHERE username = ?').get(a.user) as { id: number } | null;
    if (existing) continue;
    db.query('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(
      a.user,
      await hashPassword(a.pass),
      a.role
    );
  }

  for (const p of PATTERNS) {
    db.query(
      `INSERT INTO patterns (slug, name, blurb, recognition, complexity) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET name = excluded.name, blurb = excluded.blurb,
         recognition = excluded.recognition, complexity = excluded.complexity`
    ).run(p.slug, p.name, p.blurb, p.recognition, p.complexity);
  }

  const patternId = new Map<string, number>();
  for (const row of db.query('SELECT id, slug FROM patterns').all() as Array<{ id: number; slug: string }>) {
    patternId.set(row.slug, row.id);
  }

  for (const p of PROBLEMS) {
    const pid = patternId.get(p.pattern);
    if (!pid) continue;
    db.query(
      `INSERT INTO problems (pattern_id, slug, title, difficulty, statement, hint, walkthrough, solution,
         solution_lang, visual_kind, visual_data, time_complexity, space_complexity, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET pattern_id = excluded.pattern_id, title = excluded.title,
         difficulty = excluded.difficulty, statement = excluded.statement, hint = excluded.hint,
         walkthrough = excluded.walkthrough, solution = excluded.solution,
         solution_lang = excluded.solution_lang, visual_kind = excluded.visual_kind,
         visual_data = excluded.visual_data, time_complexity = excluded.time_complexity,
         space_complexity = excluded.space_complexity, sort_order = excluded.sort_order`
    ).run(
      pid,
      p.slug,
      p.title,
      p.difficulty,
      p.statement,
      p.hint,
      p.walkthrough,
      p.solution,
      p.solution_lang,
      p.visual_kind,
      JSON.stringify(p.visual_data),
      p.time_complexity,
      p.space_complexity,
      p.sort_order
    );
  }
}
