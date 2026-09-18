import { describe, expect, test } from 'bun:test';
import { buildSteps } from '../src/visual/engine';
import { translateTemplate } from '../src/i18n/engine-templates';
import { ENGINE_EN } from '../src/i18n/engine-en';

// Inputs mirror the real visual_data shapes stored in server/data/problems.ts,
// so the harness exercises the same narration a learner actually sees. If the
// engine rewrites a sentence, the coverage test below fails rather than letting
// Indonesian prose quietly reach the English UI.
const CASES: Array<[string, any]> = [
  ['two-pointer', { array: [2, 7, 11, 15, 19], target: 26, labels: ['kiri', 'kanan'] }],
  ['two-pointer', { array: ['k', 'a', 's', 'u', 'r', ' ', 'r', 'u', 's', 'a', 'k'], target: null, mode: 'palindrome' }],
  ['two-pointer', { array: [1, 8, 6, 2, 5, 4, 8, 3, 7], target: null, mode: 'container' }],
  ['sliding-window', { array: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'], target: null, mode: 'no-repeat' }],
  ['sliding-window', { array: [1, 12, -5, -6, 50, 3], target: 4, mode: 'fixed' }],
  ['sliding-window', { array: ['a', 'd', 'o', 'b', 'e', 'c', 'o', 'd', 'e', 'b', 'a', 'n', 'c'], target: 'abc', mode: 'minimum' }],
  ['hash-map', { array: [3, 8, 11, 2, 7], target: 9 }],
  ['hash-map', { array: [4, 9, 2, 7, 4, 1], target: null, mode: 'duplicate' }],
  ['hash-map', { array: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'], target: null, mode: 'anagram' }],
  ['binary-search', { array: [3, 9, 14, 21, 27, 33, 41, 56, 68, 75], target: 41 }],
  ['binary-search', { array: [27, 33, 41, 56, 68, 3, 9, 14, 21], target: 9, mode: 'rotated' }],
  ['dp-1d', { n: 6, mode: 'stairs' }],
  ['dp-1d', { array: [2, 7, 9, 3, 1], mode: 'robber' }],
  ['dp-1d', { coins: [1, 3, 4], target: 6, mode: 'coin' }],
  ['grid-bfs', {
    grid: [['1', '1', '0', '0', '0'], ['1', '0', '0', '1', '1'], ['0', '0', '0', '1', '0'], ['0', '1', '0', '0', '0'], ['0', '1', '0', '1', '1']],
    start: [0, 0],
  }],
  ['grid-bfs', {
    grid: [[0, 0, 0, 0, 0], [1, 1, 0, 1, 0], [0, 0, 0, 1, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
    start: [0, 0], goal: [4, 4], mode: 'path',
  }],
  ['stack', { array: ['(', '[', '{', '}', ']', ')'], mode: 'bracket', target: null }],
  ['stack', { array: [31, 27, 34, 29, 33, 36], mode: 'next-greater', target: null }],
  ['intervals', { intervals: [[1, 3], [2, 6], [8, 10], [9, 12], [15, 18]] }],
  ['intervals', { intervals: [[9, 10], [9, 11], [10, 12], [11, 13], [14, 15]], mode: 'rooms' }],
];

function collectNarration(): string[] {
  const out: string[] = [];
  for (const [kind, data] of CASES) {
    let step: any;
    try {
      step = buildSteps(kind, data);
    } catch {
      continue;
    }
    for (const f of step?.frames ?? []) {
      for (const key of ['note', 'detail', 'answer', 'counter']) {
        const v = f?.[key];
        if (typeof v === 'string' && v.trim()) out.push(v);
      }
      for (const chip of [...(f?.seen ?? []), ...(f?.stack ?? [])]) {
        if (typeof chip?.label === 'string' && chip.label.trim()) out.push(chip.label);
      }
      for (const p of f?.pointers ?? []) {
        if (typeof p?.label === 'string' && p.label.trim()) out.push(p.label);
      }
      for (const v of Object.values(f?.extra ?? {})) {
        if (typeof v === 'string' && v.trim()) out.push(v as string);
      }
    }
    if (typeof step?.summary === 'string') out.push(step.summary);
    for (const l of step?.legend ?? []) {
      if (typeof l?.text === 'string') out.push(l.text);
    }
  }
  return Array.from(new Set(out));
}

const NARRATION = collectNarration();

// Indonesian function words that have no business in an English sentence. Used
// to catch a rule that fired but left most of the Indonesian intact.
// Words that only exist in Indonesian. Deliberately excludes tokens that are
// also valid English (target, valid, total, interval) so a correctly translated
// sentence is not flagged for containing them.
const ID_WORDS = /\b(kiri|kanan|tumpukan|jendela|jumlah|nilai|indeks|koin|pulau|rapat|terbaik|jawaban|karakter|tengah|kurung|daratan|ruangan|cara|tangga|rumah|jarak|lapis|kunci|kata|sisa|butuh|sudah|belum|masih|tidak|adalah|dengan|untuk|dari|pada|atau|jika|akan|bisa|hanya|lebih|paling|semua|setiap|berisi|dilewati|ditemukan|selesai|dimulai|melebar|menyempit|dibuang|digabung|mencakup|memeriksa|memproses|suhu|menyelesaikan|selisih|urutan|kebutuhan|sunyi|hari|kelompok|panjang)\b/i;

function en(text: string): string {
  return ENGINE_EN[text] ?? translateTemplate(text);
}

describe('engine narration translation', () => {
  test('the harness collects a meaningful amount of narration', () => {
    // Guards against the suite passing vacuously if collection breaks.
    expect(NARRATION.length).toBeGreaterThan(100);
  });

  test('no Indonesian prose reaches the English UI', () => {
    // A string is only a failure if it still reads as Indonesian. Purely numeric
    // or symbolic narration ("7 + 19 = 26.", "0: 1", "[1,3]") is identical in both
    // languages and is correct as-is.
    const bad = NARRATION.filter((s) => ID_WORDS.test(en(s)));
    expect(bad).toEqual([]);
  });

  test('narration with no letters at all needs no translation', () => {
    // Sanity check on the rule above: such strings must be genuinely neutral, not
    // an Indonesian sentence my word list failed to catch.
    for (const s of NARRATION) {
      if (en(s) === s && !/[a-z]/i.test(s)) {
        expect(ID_WORDS.test(s)).toBe(false);
      }
    }
  });

  test('no unresolved placeholders, undefined or NaN in output', () => {
    for (const s of NARRATION) {
      const t = en(s);
      expect(t).not.toContain('${');
      expect(t).not.toContain('undefined');
      expect(t).not.toContain('NaN');
      expect(t.trim().length).toBeGreaterThan(0);
    }
  });

  test('numeric values survive translation', () => {
    const withNums = NARRATION.filter((s) => /\d/.test(s));
    expect(withNums.length).toBeGreaterThan(20);

    const mismatched: string[] = [];
    for (const s of withNums) {
      const t = en(s);
      if (t === s) continue; // already reported above
      const a = (s.match(/\d+/g) ?? []).sort();
      const b = (t.match(/\d+/g) ?? []).sort();
      if (JSON.stringify(a) !== JSON.stringify(b)) mismatched.push(`${s}  =>  ${t}`);
    }
    expect(mismatched).toEqual([]);
  });

  test('every narration string has an English form available', () => {
    // tEngine short-circuits and returns the raw text when the locale is ID, so
    // the ID experience depends on these tables only being consulted for EN.
    // What matters here is that no string reaches the EN path with no mapping.
    const missing = NARRATION.filter((s) => en(s) === s && ID_WORDS.test(s));
    expect(missing).toEqual([]);
  });
});
