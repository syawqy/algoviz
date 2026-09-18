import { describe, test, expect } from 'bun:test';
import { buildSteps } from '../../web/src/visual/engine';

describe('visualizer engine', () => {
  test('two-pointer two-sum finds the pair and marks it', () => {
    const step = buildSteps('two-pointer', { array: [2, 7, 11, 15], target: 9, mode: 'sum' });
    expect(step.frames.length).toBeGreaterThan(2);
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toContain('0');
    const found = step.frames.some((f) => f.answer?.includes('jawaban'));
    expect(found).toBe(true);
  });

  test('two-pointer container reports max volume', () => {
    const step = buildSteps('two-pointer', { array: [1, 8, 6, 2, 5, 4, 8, 3, 7], mode: 'container' });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('terbaik = 49');
  });

  test('two-pointer palindrome detects mismatch', () => {
    // "kodok" reads the same both ways, so it must NOT be reported as a mismatch.
    const step = buildSteps('two-pointer', { array: 'katak'.split(''), mode: 'palindrome' });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('pemeriksaan selesai');
    expect(step.frames.some((f) => f.answer === 'bukan palindrom')).toBe(false);

    const bad = buildSteps('two-pointer', { array: 'kodok'.split(''), mode: 'palindrome' });
    expect(bad.frames[bad.frames.length - 1].answer).toBe('pemeriksaan selesai');

    const bukan = buildSteps('two-pointer', { array: 'makan'.split(''), mode: 'palindrome' });
    expect(bukan.frames.some((f) => f.answer === 'bukan palindrom')).toBe(true);
  });

  test('two-pointer palindrome skips non-alphanumeric characters', () => {
    const step = buildSteps('two-pointer', {
      array: 'A man, a plan, a canal: Panama'.split(''),
      mode: 'palindrome',
    });
    expect(step.frames.some((f) => f.note.includes('bukan huruf atau angka'))).toBe(true);
    expect(step.frames.some((f) => f.answer === 'bukan palindrom')).toBe(false);
    expect(step.frames[step.frames.length - 1].answer).toBe('pemeriksaan selesai');
  });

  test('hashmap two-sum maps complement to index', () => {
    const step = buildSteps('hash-map', { array: [2, 7, 11, 15], target: 9, mode: 'sum' });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('jawaban [0, 1]');
  });

  test('hashmap duplicate stops early on repeat', () => {
    const step = buildSteps('hash-map', { array: [1, 2, 3, 1], mode: 'duplicate' });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('ada duplikat');
  });

  test('hashmap anagram groups words by sorted key', () => {
    const step = buildSteps('hash-map', { array: ['eat', 'tea', 'tan', 'ate'], mode: 'anagram' });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('2 kelompok');
  });

  test('sliding window longest substring updates best length', () => {
    const step = buildSteps('sliding-window', { array: 'abcabcbb'.split(''), mode: 'longest' });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('terbaik 3');
  });

  test('sliding window fixed size computes rolling average', () => {
    const step = buildSteps('sliding-window', { array: [1, 12, -5, -6, 50, 3], target: 4, mode: 'fixed' });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('terbaik 12.75');
  });

  test('sliding window minimum records shortest valid window', () => {
    const step = buildSteps('sliding-window', {
      array: 'ADOBECODEBANC'.split(''),
      target: 'ABC',
      mode: 'minimum',
    });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('panjang 4');
  });

  test('binary search finds target index', () => {
    const step = buildSteps('binary-search', { array: [-1, 0, 3, 5, 9, 12], target: 9 });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('indeks 4');
  });

  test('binary search reports -1 when absent', () => {
    const step = buildSteps('binary-search', { array: [1, 3, 5], target: 4 });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('jawaban -1');
  });

  test('grid bfs counts islands', () => {
    const grid = [
      ['1', '1', '0', '0'],
      ['1', '0', '0', '1'],
      ['0', '0', '1', '1'],
    ];
    const step = buildSteps('grid-bfs', { grid, mode: 'islands' });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('jawaban 2');
  });

  test('grid bfs separates diagonal land into distinct islands', () => {
    const grid = [
      ['1', '0', '1'],
      ['0', '1', '0'],
      ['1', '0', '1'],
    ];
    const step = buildSteps('grid-bfs', { grid, mode: 'islands' });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('jawaban 5');
  });

  test('grid bfs returns shortest path length', () => {
    const grid = [
      [0, 0, 1, 0],
      [1, 0, 1, 0],
      [0, 0, 0, 0],
    ];
    const step = buildSteps('grid-bfs', { grid, mode: 'path', start: [0, 0], goal: [2, 3] });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('jarak 5');
  });

  test('stack validates balanced brackets', () => {
    const ok = buildSteps('stack', { array: '({[]})'.split(''), mode: 'bracket' });
    expect(ok.frames[ok.frames.length - 1].answer).toBe('valid');
    const bad = buildSteps('stack', { array: '([)]'.split(''), mode: 'bracket' });
    expect(bad.frames[bad.frames.length - 1].answer).toBe('tidak valid');
  });

  test('stack next-greater computes day distances', () => {
    const step = buildSteps('stack', { array: [73, 74, 75, 71, 69, 72, 76, 73], mode: 'next-greater' });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('hasil [1, 1, 4, 2, 1, 1, 0, 0]');
  });

  test('intervals merge overlapping ranges', () => {
    const step = buildSteps('intervals', {
      intervals: [
        [1, 3],
        [2, 6],
        [8, 10],
        [15, 18],
      ],
      mode: 'merge',
    });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('3 interval');
    expect(last.extra?.hasil).toBe('[1,6] [8,10] [15,18]');
  });

  test('intervals counts meeting rooms', () => {
    const step = buildSteps('intervals', {
      intervals: [
        [0, 30],
        [5, 10],
        [15, 20],
      ],
      mode: 'rooms',
    });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('jawaban 2');
  });

  test('dp stairs counts distinct ways', () => {
    const step = buildSteps('dp-1d', { mode: 'stairs', n: 5 });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('jawaban 8');
  });

  test('dp robber keeps constant space state', () => {
    const step = buildSteps('dp-1d', { mode: 'robber', array: [2, 7, 9, 3, 1] });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('jawaban 12');
  });

  test('dp coin change finds minimum coins', () => {
    const step = buildSteps('dp-1d', { mode: 'coin', coins: [1, 2, 5], target: 11 });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('jawaban 3');
  });

  test('dp coin change reports impossible amount', () => {
    const step = buildSteps('dp-1d', { mode: 'coin', coins: [2], target: 3 });
    const last = step.frames[step.frames.length - 1];
    expect(last.answer).toBe('jawaban -1');
  });

  test('unknown kind yields empty frame list instead of throwing', () => {
    const step = buildSteps('nonexistent', {});
    expect(step.frames).toEqual([]);
  });
});
