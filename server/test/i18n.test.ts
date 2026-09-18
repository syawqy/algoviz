import { describe, expect, test, beforeEach } from 'bun:test';
import { Hono } from 'hono';
import { problemRoutes } from '../routes/problems';
import { getDB } from '../db';
import { seed } from '../seed';

// Localisation is served from the API, so these tests exercise the real routes
// rather than a copy of the dictionary: a missing English string must degrade
// to the Indonesian original, never to an empty or undefined field.
const app = new Hono();
app.route('/api', problemRoutes);

function req(path: string) {
  return app.request(path);
}

describe('localisation', () => {
  beforeEach(() => {
    seed();
  });

  test('defaults to Indonesian when no locale is given', async () => {
    const res = await req('/api/problems');
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    const one = body.problems[0];
    expect(typeof one.title).toBe('string');
    expect(one.title.length).toBeGreaterThan(0);
  });

  test('serves English content for locale=en', async () => {
    const idRes = await req('/api/problems');
    const enRes = await req('/api/problems?locale=en');
    const idBody = (await idRes.json()) as any;
    const enBody = (await enRes.json()) as any;

    expect(enBody.problems.length).toBe(idBody.problems.length);

    // At least one title must differ, otherwise the locale is being ignored.
    const idTitles = idBody.problems.map((p: any) => p.title).join('|');
    const enTitles = enBody.problems.map((p: any) => p.title).join('|');
    expect(enTitles).not.toBe(idTitles);
  });

  test('translates problem detail fields for locale=en', async () => {
    const res = await req('/api/problems/coin-change?locale=en');
    expect(res.status).toBe(200);
    const { problem } = (await res.json()) as any;

    // Every prose field must be present and non-empty in both locales.
    for (const field of ['title', 'statement', 'hint', 'walkthrough']) {
      expect(typeof problem[field]).toBe('string');
      expect(problem[field].length).toBeGreaterThan(0);
    }
    // Visual data is language independent and must survive localisation.
    expect(problem.visual_data).toBeDefined();
  });

  test('translates pattern metadata for locale=en', async () => {
    const idRes = await req('/api/patterns');
    const enRes = await req('/api/patterns?locale=en');
    const idBody = (await idRes.json()) as any;
    const enBody = (await enRes.json()) as any;

    expect(enBody.patterns.length).toBe(idBody.patterns.length);

    // Pattern names are algorithm names that stay in English by convention
    // (Two Pointer, Stack), so the blurb is what proves localisation happened.
    const idBlurbs = idBody.patterns.map((p: any) => p.blurb).join('|');
    const enBlurbs = enBody.patterns.map((p: any) => p.blurb).join('|');
    expect(enBlurbs).not.toBe(idBlurbs);

    for (const p of enBody.patterns) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.blurb.length).toBeGreaterThan(0);
      expect(p.recognition.length).toBeGreaterThan(0);
    }

    // Every pattern must have a localised blurb, not a passthrough of the
    // Indonesian source. English blurbs are the ones without Indonesian
    // function words, so a leftover Indonesian string would be caught here.
    const indonesianMarkers = /\b(yang|untuk|dengan|dari|agar|atau|setiap)\b/;
    const untranslated = enBody.patterns.filter((p: any) => indonesianMarkers.test(p.blurb));
    expect(untranslated.map((p: any) => p.slug)).toEqual([]);
  });

  test('unknown locale falls back to Indonesian instead of failing', async () => {
    const res = await req('/api/problems?locale=de');
    expect(res.status).toBe(200);
    const { problems } = (await res.json()) as any;
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0].title.length).toBeGreaterThan(0);
  });

  test('every problem has English prose, with no Indonesian left behind', async () => {
    const res = await req('/api/problems?locale=en');
    const { problems } = (await res.json()) as any;

    // Indonesian function words are a reliable tell for a string that was
    // never translated. Algorithm terms shared by both languages (array,
    // target, stack) are deliberately not treated as markers.
    const idMarkers = /\b(yang|untuk|dengan|dari|agar|atau|setiap|adalah|tidak|bisa|harus|jika|maka|dan|ini|itu|pada|dalam|akan|sudah|belum)\b/;

    const offenders: string[] = [];
    for (const p of problems) {
      const prose = [p.statement, p.hint, p.walkthrough].join(' ');
      if (idMarkers.test(prose)) offenders.push(p.slug);
    }
    expect(offenders).toEqual([]);
  });

  test('localised daily problem keeps the same slug as the Indonesian one', async () => {
    const idRes = await req('/api/daily?day=2026-09-18');
    const enRes = await req('/api/daily?day=2026-09-18&locale=en');
    const idBody = (await idRes.json()) as any;
    const enBody = (await enRes.json()) as any;

    // The problem of the day must not change when the language changes.
    expect(enBody.problem.slug).toBe(idBody.problem.slug);
    expect(enBody.day).toBe(idBody.day);
  });

  test('no Indonesian identifiers leak into EN code or complexity notation', async () => {
    // The solution body and the Big-O notation are stored text, so they were
    // missed by the prose checks above. The coin-change entry shipped
    // "O(jumlah * len(koin))" and a koin_minimum() body in English mode.
    // The word list covers every Indonesian identifier that actually shipped in
    // the stored code (kiri/kanan, tengah, terbaik, kelompok, rampok, pulau,
    // baris/kolom, antre, jendela, butuh, kurang, sumber, kunci, kata, ...).
    const idWords =
      /\b(jumlah|koin|nilai|tabel|karakter|kata|huruf|indeks|bilangan|panjang|lebar|sel|urut|balik|cari|hitung|simpan|ambil|kiri|kanan|tengah|terbaik|kelompok|rampok|pulau|lewati|baris|kolom|antre|jendela|butuh|kurang|sumber|kunci|posisi|tinggi|sisa|mungkin|dipakai|masalah|kasus|dicari)\b/;

    const listRes = await req('/api/problems?locale=en');
    const list = ((await listRes.json()) as any).problems as Array<{ slug: string }>;
    expect(list.length).toBeGreaterThan(10);

    const offenders: string[] = [];
    for (const item of list) {
      const res = await req(`/api/problems/${item.slug}?locale=en`);
      const { problem } = (await res.json()) as any;
      for (const field of ['solution', 'time_complexity', 'space_complexity'] as const) {
        const value = String(problem[field] ?? '');
        if (idWords.test(value)) offenders.push(`${item.slug}.${field}: ${value.slice(0, 60)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test('EN responses still carry a solution and complexity for every problem', async () => {
    // Guards the fallback: an optional translation must never blank a field out.
    const listRes = await req('/api/problems?locale=en');
    const list = ((await listRes.json()) as any).problems as Array<{ slug: string }>;

    for (const item of list) {
      const res = await req(`/api/problems/${item.slug}?locale=en`);
      const { problem } = (await res.json()) as any;
      expect(String(problem.solution ?? '').length).toBeGreaterThan(20);
      expect(String(problem.time_complexity ?? '').length).toBeGreaterThan(1);
      expect(String(problem.space_complexity ?? '').length).toBeGreaterThan(1);
      expect(String(problem.solution)).not.toContain('undefined');
    }
  });

  test('the list and daily endpoints localise complexity notation too', async () => {
    // The detail route was localised first, which left the list rendering
    // "O(jumlah * len(koin))" in English mode. These endpoints share a mapper,
    // so they need their own check rather than trusting the detail one.
    const idWords = /\b(jumlah|koin|nilai|tabel|baris|kolom|karakter|indeks|bilangan|panjang|urut)\b/;

    const listRes = await req('/api/problems?locale=en');
    const list = ((await listRes.json()) as any).problems as Array<Record<string, string>>;
    expect(list.length).toBeGreaterThan(10);

    const offenders: string[] = [];
    for (const item of list) {
      for (const field of ['time_complexity', 'space_complexity', 'title'] as const) {
        const value = String(item[field] ?? '');
        if (idWords.test(value)) offenders.push(`list ${item.slug}.${field}: ${value}`);
      }
    }

    const dailyRes = await req('/api/daily?day=2026-09-18&locale=en');
    const daily = ((await dailyRes.json()) as any).problem as Record<string, string>;
    for (const field of ['time_complexity', 'space_complexity', 'title'] as const) {
      const value = String(daily[field] ?? '');
      if (idWords.test(value)) offenders.push(`daily ${daily.slug}.${field}: ${value}`);
    }

    expect(offenders).toEqual([]);
  });
});
