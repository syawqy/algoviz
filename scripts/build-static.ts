#!/usr/bin/env bun
/**
 * Dump all API responses to static JSON files so the app can run on
 * GitHub Pages (no backend).  Run after `vite build`:
 *
 *   bun run build          # produces web/dist/
 *   bun run scripts/build-static.ts   # adds web/dist/api/*.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Database from 'bun:sqlite';

const root = resolve(import.meta.dir, '..');
const db = new Database(resolve(root, 'algoviz.db'), { readonly: true });
const outDir = resolve(process.env.OUT_DIR || resolve(root, 'web', 'dist'), 'api');
mkdirSync(outDir, { recursive: true });

// Import English translations from the TypeScript source
const { PROBLEM_EN, PATTERN_EN } = await import(resolve(root, 'server', 'data', 'content-en.ts'));

/* ── helpers ────────────────────────────────────────────────────────── */

function json(name: string, data: unknown) {
  const filePath = resolve(outDir, name);
  mkdirSync(resolve(filePath, '..'), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data));
  console.log(`  ✓ ${name}`);
}

/* ── dump every endpoint the SPA calls ─────────────────────────────── */

function problems(locale: string) {
  return db.query(`
    SELECT p.id, p.slug, p.title, p.difficulty, p.time_complexity, p.space_complexity,
           pt.slug AS pattern_slug, pt.name AS pattern_name, NULL AS status
    FROM problems p
    JOIN patterns pt ON p.pattern_id = pt.id
    ORDER BY p.sort_order
  `).all().map((r: any) => {
    if (locale === 'en') {
      const en = PROBLEM_EN[r.slug];
      if (en) {
        if (en.title) r.title = en.title;
        if (en.difficulty) r.difficulty = en.difficulty;
      }
      const pen = PATTERN_EN[r.pattern_slug];
      if (pen?.name) r.pattern_name = pen.name;
    }
    return r;
  });
}

function problem(slug: string, locale: string) {
  const row = db.query(`
    SELECT p.*, pt.slug AS pattern_slug, pt.name AS pattern_name, NULL AS status
    FROM problems p JOIN patterns pt ON p.pattern_id = pt.id
    WHERE p.slug = ?
  `).get(slug) as any;
  if (!row) return null;
  // visual_data is stored as JSON text in SQLite — parse it like the server does
  if (row.visual_data) {
    try { row.visual_data = JSON.parse(row.visual_data); } catch { /* already object */ }
  }
  if (locale === 'en') {
    const en = PROBLEM_EN[slug];
    if (en) {
      if (en.title) row.title = en.title;
      if (en.difficulty) row.difficulty = en.difficulty;
      if (en.statement) row.statement = en.statement;
      if (en.hint) row.hint = en.hint;
      if (en.walkthrough) row.walkthrough = en.walkthrough;
      if (en.solution) row.solution = en.solution;
      if (en.time_complexity) row.time_complexity = en.time_complexity;
      if (en.space_complexity) row.space_complexity = en.space_complexity;
    }
    const pen = PATTERN_EN[row.pattern_slug];
    if (pen?.name) row.pattern_name = pen.name;
  }
  return { problem: row };
}

function patterns(locale: string) {
  const rows = db.query('SELECT * FROM patterns ORDER BY id').all() as any[];
  return rows.map(r => {
    if (locale === 'en') {
      const en = PATTERN_EN[r.slug];
      if (en) {
        if (en.name) r.name = en.name;
        if (en.blurb) r.blurb = en.blurb;
        if (en.recognition) r.recognition = en.recognition;
        if (en.complexity) r.complexity = en.complexity;
      }
    }
    const count = db.query("SELECT COUNT(*) as c FROM problems WHERE pattern_id = ?").get(r.id) as any;
    r.problem_count = count?.c ?? 0;
    return r;
  });
}

function daily(locale: string) {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const allProblems = db.query("SELECT slug FROM problems ORDER BY sort_order").all() as any[];
  const idx = dayOfYear % allProblems.length;
  const slug = allProblems[idx].slug;
  const p = problem(slug, locale);
  return { day: now.toISOString().split('T')[0], total: allProblems.length, problem: p?.problem };
}

/* ── write files ───────────────────────────────────────────────────── */

console.log('Building static API data...');

for (const locale of ['id', 'en']) {
  json(`${locale}/problems.json`, { problems: problems(locale) });
  json(`${locale}/patterns.json`, { patterns: patterns(locale) });
  json(`${locale}/daily.json`, daily(locale));

  const slugs = db.query('SELECT slug FROM problems ORDER BY sort_order').all() as any[];
  for (const { slug } of slugs) {
    json(`${locale}/problems/${slug}.json`, problem(slug, locale));
  }
}

json('auth/me.json', { user: null });

console.log(`\nDone — static API data written to ${outDir}`);
