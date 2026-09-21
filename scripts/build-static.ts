#!/usr/bin/env bun
/**
 * Generate static JSON files for GitHub Pages — NO database required.
 * Reads directly from TypeScript data files (problems.ts, patterns.ts,
 * content-en.ts).
 *
 *   bun run scripts/build-static.ts   # adds api/*.json to web/dist/
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const outDir = resolve(process.env.OUT_DIR || resolve(root, 'web', 'dist'), 'api');
mkdirSync(outDir, { recursive: true });

// Import data directly from TS source — no SQLite needed
const { PROBLEMS } = await import(resolve(root, 'server', 'data', 'problems.ts'));
const { PATTERNS } = await import(resolve(root, 'server', 'data', 'patterns.ts'));
const { PROBLEM_EN, PATTERN_EN } = await import(resolve(root, 'server', 'data', 'content-en.ts'));

/* ── helpers ────────────────────────────────────────────────────────── */

function json(name: string, data: unknown) {
  const filePath = resolve(outDir, name);
  mkdirSync(resolve(filePath, '..'), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data));
  console.log(`  ✓ ${name}`);
}

function localize(p: Record<string, any>, locale: string, type: 'problem' | 'pattern') {
  const r = { ...p };
  if (locale === 'en') {
    if (type === 'problem') {
      const en = PROBLEM_EN[r.slug];
      if (en) {
        for (const k of ['title', 'difficulty', 'statement', 'hint', 'walkthrough', 'solution', 'time_complexity', 'space_complexity'] as const) {
          if (en[k]) (r as any)[k] = en[k];
        }
      }
      const pen = PATTERN_EN[r.pattern];
      if (pen?.name) r.pattern_name = pen.name;
    } else {
      const pen = PATTERN_EN[r.slug];
      if (pen) {
        for (const k of ['name', 'blurb', 'recognition', 'complexity'] as const) {
          if (pen[k]) (r as any)[k] = pen[k];
        }
      }
    }
  }
  return r;
}

/* ── build data ─────────────────────────────────────────────────────── */

function problems(locale: string) {
  const patternMap = new Map(PATTERNS.map(p => [p.slug, p]));
  return PROBLEMS.sort((a, b) => a.sort_order - b.sort_order).map(p => {
    const pattern = patternMap.get(p.pattern);
    const row: Record<string, any> = {
      id: p.sort_order,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      time_complexity: p.time_complexity,
      space_complexity: p.space_complexity,
      pattern_slug: p.pattern,
      pattern_name: pattern?.name ?? p.pattern,
      status: null,
    };
    if (locale === 'en') {
      const en = PROBLEM_EN[p.slug];
      if (en?.title) row.title = en.title;
      if (en?.difficulty) row.difficulty = en.difficulty;
      const pen = PATTERN_EN[p.pattern];
      if (pen?.name) row.pattern_name = pen.name;
    }
    return row;
  });
}

function problem(slug: string, locale: string) {
  const p = PROBLEMS.find(x => x.slug === slug);
  if (!p) return null;
  const pattern = PATTERNS.find(pt => pt.slug === p.pattern);
  const row: Record<string, any> = {
    ...p,
    id: p.sort_order,
    pattern_slug: p.pattern,
    pattern_name: pattern?.name ?? p.pattern,
    status: null,
  };
  if (locale === 'en') {
    const en = PROBLEM_EN[slug];
    if (en) {
      for (const k of ['title', 'difficulty', 'statement', 'hint', 'walkthrough', 'solution', 'time_complexity', 'space_complexity'] as const) {
        if (en[k]) (row as any)[k] = en[k];
      }
    }
    const pen = PATTERN_EN[p.pattern];
    if (pen?.name) row.pattern_name = pen.name;
  }
  return { problem: row };
}

function patterns(locale: string) {
  return PATTERNS.map(p => {
    const r: Record<string, any> = { ...p, problem_count: PROBLEMS.filter(x => x.pattern === p.slug).length };
    if (locale === 'en') {
      const pen = PATTERN_EN[p.slug];
      if (pen) {
        for (const k of ['name', 'blurb', 'recognition', 'complexity'] as const) {
          if (pen[k]) (r as any)[k] = pen[k];
        }
      }
    }
    return r;
  });
}

function daily(locale: string) {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const sorted = [...PROBLEMS].sort((a, b) => a.sort_order - b.sort_order);
  const idx = dayOfYear % sorted.length;
  const slug = sorted[idx].slug;
  const p = problem(slug, locale);
  return { day: now.toISOString().split('T')[0], total: sorted.length, problem: p?.problem };
}

/* ── write files ───────────────────────────────────────────────────── */

console.log('Building static API data (no database)...');

for (const locale of ['id', 'en']) {
  json(`${locale}/problems.json`, { problems: problems(locale) });
  json(`${locale}/patterns.json`, { patterns: patterns(locale) });
  json(`${locale}/daily.json`, daily(locale));

  for (const p of [...PROBLEMS].sort((a, b) => a.sort_order - b.sort_order)) {
    json(`${locale}/problems/${p.slug}.json`, problem(p.slug, locale));
  }
}

console.log(`\nDone — static API data written to ${outDir}`);
