// Visualizer engine.
//
// Each builder is a pure function: input data in, ordered animation frames out.
// Frames carry only plain data (indices, pointers, counters), which keeps them
// trivially testable and lets the React layer stay a dumb renderer.

export type Highlight = 'active' | 'match' | 'reject' | 'compare' | 'done';

export interface Pointer {
  index: number;
  label: string;
}

export interface Cell {
  label: string;
  state?: Highlight;
}

export interface Frame {
  note: string;
  detail?: string;
  pointers?: Pointer[];
  highlights?: Record<number, Highlight>;
  window?: { kiri: number; kanan: number } | null;
  seen?: Cell[];
  stack?: Cell[];
  answer?: string;
  counter?: string;
  extra?: Record<string, string>;
}

export interface VisualStep {
  kind: string;
  frames: Frame[];
  summary: string;
  legend: Array<{ token: Highlight | 'pointer' | 'window' | 'seen' | 'stack'; text: string }>;
}

const LEGEND_BASE = [
  { token: 'pointer' as const, text: 'Penunjuk aktif' },
  { token: 'match' as const, text: 'Cocok / jawaban' },
  { token: 'compare' as const, text: 'Sedang diperiksa' },
  { token: 'reject' as const, text: 'Dibuang' },
];

export function buildTwoPointer(data: any): Frame[] {
  const arr: any[] = data.array ?? [];
  const mode: string = data.mode ?? 'sum';
  const target = data.target;
  const frames: Frame[] = [];
  let kiri = 0;
  let kanan = arr.length - 1;
  let best = 0;

  frames.push({
    note: 'Mulai dari kedua ujung array.',
    detail: target != null ? `target = ${target}` : 'Penunjuk diletakkan di ujung kiri dan kanan.',
    pointers: [
      { index: kiri, label: 'kiri' },
      { index: kanan, label: 'kanan' },
    ],
    window: { kiri, kanan },
    answer: target != null ? `target ${target}` : '',
  });

  while (kiri < kanan) {
    const a = arr[kiri];
    const b = arr[kanan];

    if (mode === 'container') {
      const tinggi = Math.min(Number(a), Number(b));
      const lebar = kanan - kiri;
      const volume = tinggi * lebar;
      if (volume > best) best = volume;
      frames.push({
        note: `Volume = min(${a}, ${b}) x ${lebar} = ${volume}.`,
        detail: volume >= best ? `Volume terbaik sekarang ${volume}.` : `Masih di bawah terbaik ${best}.`,
        pointers: [
          { index: kiri, label: 'kiri' },
          { index: kanan, label: 'kanan' },
        ],
        window: { kiri, kanan },
        highlights: { [kiri]: 'compare', [kanan]: 'compare' },
        answer: `terbaik = ${best}`,
      });
      if (Number(a) < Number(b)) {
        frames.push({
          note: `Dinding kiri lebih pendek, geser kiri ke dalam.`,
          detail: 'Menggeser dinding yang lebih tinggi tidak mungkin menambah volume.',
          pointers: [{ index: kiri + 1, label: 'kiri' }],
          window: { kiri: kiri + 1, kanan },
          highlights: { [kiri]: 'reject' },
          answer: `terbaik = ${best}`,
        });
        kiri++;
      } else {
        frames.push({
          note: `Dinding kanan lebih pendek, geser kanan ke dalam.`,
          detail: 'Menggeser dinding yang lebih tinggi tidak mungkin menambah volume.',
          pointers: [{ index: kanan - 1, label: 'kanan' }],
          window: { kiri, kanan: kanan - 1 },
          highlights: { [kanan]: 'reject' },
          answer: `terbaik = ${best}`,
        });
        kanan--;
      }
      continue;
    }

    if (mode === 'palindrome') {
      const luar = String(a);
      const dalam = String(b);
      const normalisasi = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalisasi(luar) === '' || normalisasi(dalam) === '') {
        // Skip whichever side is non-alphanumeric, then re-read that side on the
        // next pass. Reading `a`/`b` from the values captured before this
        // adjustment would compare the same stale characters again.
        const buangKiri = normalisasi(luar) === '';
        if (buangKiri) kiri++;
        else kanan--;
        frames.push({
          note: `Karakter "${(buangKiri ? luar : dalam) === ' ' ? 'spasi' : buangKiri ? luar : dalam}" bukan huruf atau angka, dilewati.`,
          detail: buangKiri ? 'Penunjuk kiri maju satu langkah.' : 'Penunjuk kanan mundur satu langkah.',
          pointers: [
            { index: kiri, label: 'kiri' },
            { index: kanan, label: 'kanan' },
          ],
          window: { kiri, kanan },
          highlights: { [buangKiri ? kiri - 1 : kiri]: 'reject', [buangKiri ? kanan : kanan + 1]: 'reject' },
        });
        continue;
      }
      const cocok = normalisasi(luar) === normalisasi(dalam);
      frames.push({
        note: `Bandingkan "${luar}" dengan "${dalam}": ${cocok ? 'cocok' : 'berbeda'}.`,
        detail: cocok ? 'Pasangan benar, kedua penunjuk maju.' : 'Bukan palindrom, pencarian berhenti.',
        pointers: [
          { index: kiri, label: 'kiri' },
          { index: kanan, label: 'kanan' },
        ],
        window: { kiri, kanan },
        highlights: { [kiri]: cocok ? 'match' : 'reject', [kanan]: cocok ? 'match' : 'reject' },
        answer: cocok ? 'masih palindrom' : 'bukan palindrom',
      });
      if (!cocok) break;
      kiri++;
      kanan--;
      continue;
    }

    // default: sorted two-sum
    const jumlah = Number(a) + Number(b);
    frames.push({
      note: `Jumlahkan ${a} + ${b} = ${jumlah}.`,
      detail: jumlah === target ? 'Sama dengan target, pasangan ditemukan.' : jumlah < target ? 'Terlalu kecil, geser kiri ke kanan.' : 'Terlalu besar, geser kanan ke kiri.',
      pointers: [
        { index: kiri, label: 'kiri' },
        { index: kanan, label: 'kanan' },
      ],
      window: { kiri, kanan },
      highlights: { [kiri]: 'compare', [kanan]: 'compare' },
      answer: `target ${target}`,
    });
    if (jumlah === target) {
      frames.push({
        note: `Pasangan ditemukan pada indeks ${kiri} dan ${kanan}.`,
        detail: `${arr[kiri]} + ${arr[kanan]} = ${target}.`,
        pointers: [
          { index: kiri, label: 'kiri' },
          { index: kanan, label: 'kanan' },
        ],
        window: { kiri, kanan },
        highlights: { [kiri]: 'match', [kanan]: 'match' },
        answer: `jawaban [${kiri}, ${kanan}]`,
      });
      break;
    }
    if (jumlah < Number(target)) kiri++;
    else kanan--;
  }

  if (mode === 'container') {
    frames.push({
      note: `Penunjuk bertemu. Volume maksimum ${best}.`,
      highlights: {},
      window: null,
      answer: `terbaik = ${best}`,
    });
  } else if (mode === 'palindrome') {
    frames.push({
      note: 'Penunjuk bertemu atau bersilangan, seluruh pasangan sudah diperiksa.',
      window: null,
      answer: 'pemeriksaan selesai',
    });
  }

  return frames;
}

export function buildHashmap(data: any): Frame[] {
  const arr: any[] = data.array ?? [];
  const mode: string = data.mode ?? 'sum';
  const target = data.target;
  const frames: Frame[] = [];
  const seen = new Map<string, number>();
  let keepNilai: any = null;

  frames.push({
    note: 'Siapkan tabel kosong untuk menyimpan yang sudah dilihat.',
    detail: target != null ? `target = ${target}` : 'Setiap nilai yang dilewati akan dicatat.',
    seen: [],
    answer: target != null ? `butuh ${target} - x` : '',
  });

  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];

    if (mode === 'duplicate') {
      if (seen.has(String(x))) {
        frames.push({
          note: `Nilai ${x} sudah ada di tabel pada indeks ${seen.get(String(x))}.`,
          detail: 'Duplikat ditemukan, jawaban benar tanpa perlu membaca sisa array.',
          highlights: { [i]: 'match', [seen.get(String(x))!]: 'match' },
          seen: [...seen.entries()].map(([k, v]) => ({ label: `${k} -> ${v}`, state: 'done' as const })),
          answer: 'ada duplikat',
        });
        break;
      }
      seen.set(String(x), i);
      frames.push({
        note: `Nilai ${x} belum pernah ada, simpan ke tabel.`,
        highlights: { [i]: 'compare' },
        seen: [...seen.entries()].map(([k, v]) => ({ label: `${k} -> ${v}` })),
        answer: 'lanjut memeriksa',
      });
      continue;
    }

    if (mode === 'anagram') {
      const kunci = String(x).split('').sort().join('');
      frames.push({
        note: `Urutkan huruf "${x}" menjadi kunci "${kunci}".`,
        detail: `Kata dengan kunci sama akan berada di kelompok yang sama.`,
        highlights: { [i]: 'compare' },
        seen: [...seen.entries()].map(([k, v]) => ({ label: `${k} (${v} kata)` })),
        answer: `kunci ${kunci}`,
      });
      if (seen.has(kunci)) seen.set(kunci, seen.get(kunci)! + 1);
      else {
        seen.set(kunci, 1);
        frames.push({
          note: `Kelompok baru "${kunci}" dibuat.`,
          highlights: { [i]: 'match' },
          seen: [...seen.entries()].map(([k, v]) => ({ label: `${k} (${v} kata)` })),
          answer: `kunci ${kunci}`,
        });
      }
      continue;
    }

    // default: two-sum
    const butuh = Number(target) - Number(x);
    if (seen.has(String(butuh))) {
      frames.push({
        note: `Untuk ${x}, pasangannya ${butuh} sudah ada di tabel.`,
        detail: `Pasangan ${butuh} + ${x} = ${target}.`,
        highlights: { [seen.get(String(butuh))!]: 'match', [i]: 'match' },
        seen: [...seen.entries()].map(([k, v]) => ({ label: `${k} -> ${v}`, state: 'done' as const })),
        answer: `jawaban [${seen.get(String(butuh))}, ${i}]`,
      });
      break;
    }
    seen.set(String(x), i);
    frames.push({
      note: `Untuk ${x}, butuh ${butuh} yang belum ada di tabel.`,
      detail: `Simpan ${x} pada indeks ${i} untuk diperiksa nanti.`,
      highlights: { [i]: 'compare' },
      seen: [...seen.entries()].map(([k, v]) => ({ label: `${k} -> ${v}` })),
      answer: `butuh ${butuh}`,
    });
  }

  if (mode === 'duplicate' && !frames.some((f) => f.answer === 'ada duplikat')) {
    frames.push({
      note: 'Seluruh array selesai dibaca tanpa pengulangan.',
      seen: [...seen.entries()].map(([k, v]) => ({ label: `${k} -> ${v}`, state: 'done' as const })),
      answer: 'tidak ada duplikat',
    });
  }
  if (mode === 'anagram') {
    frames.push({
      note: `Pengelompokan selesai, terbentuk ${seen.size} kelompok.`,
      seen: [...seen.entries()].map(([k, v]) => ({ label: `${k} (${v} kata)`, state: 'done' as const })),
      answer: `${seen.size} kelompok`,
    });
  }
  void keepNilai;

  return frames;
}

export function buildSlidingWindow(data: any): Frame[] {
  const arr: any[] = data.array ?? [];
  const mode: string = data.mode ?? 'fixed';
  const frames: Frame[] = [];

  if (mode === 'fixed') {
    const k = Number(data.target);
    let total = 0;
    for (let i = 0; i < k && i < arr.length; i++) total += Number(arr[i]);
    let best = total / k;
    frames.push({
      note: `Jendela pertama berukuran ${k} berisi ${arr.slice(0, k).join(', ')}.`,
      detail: `Jumlah ${total}, rata-rata ${(total / k).toFixed(2)}.`,
      window: { kiri: 0, kanan: k - 1 },
      highlights: Object.fromEntries(arr.slice(0, k).map((_, i) => [i, 'compare' as Highlight])),
      answer: `terbaik ${best.toFixed(2)}`,
    });
    for (let i = k; i < arr.length; i++) {
      const keluar = Number(arr[i - k]);
      const masuk = Number(arr[i]);
      total += masuk - keluar;
      const rata = total / k;
      if (rata > best) best = rata;
      frames.push({
        note: `Geser jendela: keluarkan ${keluar}, masukkan ${masuk}.`,
        detail: `Jumlah menjadi ${total} tanpa menjumlahkan ulang seluruh jendela. Rata-rata ${rata.toFixed(2)}.`,
        window: { kiri: i - k + 1, kanan: i },
        highlights: { [i - k]: 'reject', [i]: 'match' },
        answer: `terbaik ${best.toFixed(2)}`,
      });
    }
    frames.push({
      note: `Rata-rata maksimum ${best.toFixed(2)}.`,
      window: null,
      answer: `terbaik ${best.toFixed(2)}`,
    });
    return frames;
  }

  if (mode === 'minimum') {
    const need = String(data.target ?? '');
    const butuh = new Map<string, number>();
    for (const ch of need) butuh.set(ch, (butuh.get(ch) ?? 0) + 1);
    let kurang = need.length;
    let kiri = 0;
    let bestLen = Infinity;
    let bestRange: [number, number] | null = null;

    frames.push({
      note: `Cari potongan yang memuat semua karakter "${need}".`,
      detail: `Kebutuhan: ${[...butuh.entries()].map(([k, v]) => `${k}x${v}`).join(', ')}.`,
      window: { kiri: 0, kanan: -1 },
      extra: { kebutuhan: `${butuh.size} karakter unik` },
      answer: 'belum ditemukan',
    });

    for (let kanan = 0; kanan < arr.length; kanan++) {
      const ch = String(arr[kanan]);
      if ((butuh.get(ch) ?? 0) > 0) kurang--;
      butuh.set(ch, (butuh.get(ch) ?? 0) - 1);
      frames.push({
        note: `Masukkan "${ch}" ke jendela, sisa kebutuhan ${Math.max(kurang, 0)} karakter.`,
        window: { kiri, kanan },
        highlights: { [kanan]: kurang === 0 ? 'match' : 'compare' },
        answer: kurang === 0 ? 'jendela valid' : 'perlebar jendela',
      });

      while (kurang === 0) {
        if (kanan - kiri + 1 < bestLen) {
          bestLen = kanan - kiri + 1;
          bestRange = [kiri, kanan];
          frames.push({
            note: `Jendela valid dengan panjang ${bestLen}.`,
            detail: `Rekam sebagai kandidat terbaik.`,
            window: { kiri, kanan },
            highlights: Object.fromEntries(
              Array.from({ length: bestLen }, (_, i) => [kiri + i, 'match' as Highlight])
            ),
            answer: `terbaik "${arr.slice(kiri, kanan + 1).join('')}"`,
          });
        }
        const keluar = String(arr[kiri]);
        if (butuh.get(keluar) === 0) kurang++;
        butuh.set(keluar, (butuh.get(keluar) ?? 0) + 1);
        frames.push({
          note: `Jendela masih valid, sempitkan dari kiri dengan membuang "${keluar}".`,
          detail: 'Menyempitkan bisa menemukan jendela yang lebih pendek.',
          window: { kiri: kiri + 1, kanan },
          highlights: { [kiri]: 'reject' },
          answer: kurang === 0 ? 'masih valid' : 'perlu diperlebar',
        });
        kiri++;
      }
    }
    frames.push({
      note: bestRange ? `Jendela terpendek ditemukan: "${arr.slice(bestRange[0], bestRange[1] + 1).join('')}" (panjang ${bestLen}).` : 'Tidak ada jendela yang memuat seluruh karakter target.',
      window: bestRange ? { kiri: bestRange[0], kanan: bestRange[1] } : null,
      answer: bestRange ? `panjang ${bestLen}` : 'tidak ada',
    });
    return frames;
  }

  // default: longest substring without repeat
  const posisi = new Map<string, number>();
  let kiri = 0;
  let best = 0;
  let bestRange: [number, number] = [0, -1];

  frames.push({ note: 'Jendela dimulai kosong.', window: { kiri: 0, kanan: -1 }, answer: 'terbaik 0' });

  for (let kanan = 0; kanan < arr.length; kanan++) {
    const ch = String(arr[kanan]);
    const lama = posisi.get(ch);
    if (lama !== undefined && lama >= kiri) {
      frames.push({
        note: `Karakter "${ch}" sudah ada di jendela pada indeks ${lama}.`,
        detail: `Geser batas kiri ke ${lama + 1} agar jendela kembali unik.`,
        window: { kiri, kanan },
        highlights: { [lama]: 'reject', [kanan]: 'compare' },
        answer: `terbaik ${best}`,
      });
      kiri = lama + 1;
    }
    posisi.set(ch, kanan);
    const len = kanan - kiri + 1;
    if (len > best) {
      best = len;
      bestRange = [kiri, kanan];
    }
    frames.push({
      note: `Jendela sekarang "${arr.slice(kiri, kanan + 1).join('')}" dengan panjang ${len}.`,
      detail: len >= best ? 'Panjang terbaik diperbarui.' : `Masih di bawah terbaik ${best}.`,
      window: { kiri, kanan },
      highlights: Object.fromEntries(
        Array.from({ length: len }, (_, i) => [kiri + i, len >= best ? ('match' as Highlight) : ('compare' as Highlight)])
      ),
      answer: `terbaik ${best}`,
    });
  }

  frames.push({
    note: `Substring terpanjang "${arr.slice(bestRange[0], bestRange[1] + 1).join('')}" dengan panjang ${best}.`,
    window: { kiri: bestRange[0], kanan: bestRange[1] },
    answer: `terbaik ${best}`,
  });
  return frames;
}

export function buildBinarySearch(data: any): Frame[] {
  const arr: any[] = data.array ?? [];
  const target = Number(data.target);
  const frames: Frame[] = [];
  let kiri = 0;
  let kanan = arr.length - 1;

  frames.push({
    note: `Ruang pencarian awal mencakup seluruh array.`,
    detail: `target = ${target}`,
    window: { kiri, kanan },
    answer: `target ${target}`,
  });

  while (kiri <= kanan) {
    const tengah = Math.floor((kiri + kanan) / 2);
    const nilai = Number(arr[tengah]);
    const range = Array.from({ length: kanan - kiri + 1 }, (_, i) => kiri + i);

    if (nilai === target) {
      frames.push({
        note: `Nilai tengah ${nilai} sama dengan target.`,
        detail: `Target ditemukan pada indeks ${tengah}.`,
        pointers: [{ index: tengah, label: 'tengah' }],
        window: { kiri, kanan },
        highlights: { [tengah]: 'match' },
        answer: `indeks ${tengah}`,
      });
      break;
    }

    const terlaluKecil = nilai < target;
    frames.push({
      note: `Nilai tengah ${nilai} ${terlaluKecil ? 'lebih kecil' : 'lebih besar'} dari ${target}.`,
      detail: terlaluKecil
        ? `Buang separuh kiri (indeks ${kiri} sampai ${tengah}), cari di ${tengah + 1} sampai ${kanan}.`
        : `Buang separuh kanan (indeks ${tengah} sampai ${kanan}), cari di ${kiri} sampai ${tengah - 1}.`,
      pointers: [{ index: tengah, label: 'tengah' }],
      window: { kiri, kanan },
      highlights: Object.fromEntries(
        range.map((i) => [i, terlaluKecil ? (i <= tengah ? ('reject' as Highlight) : ('compare' as Highlight)) : i >= tengah ? ('reject' as Highlight) : ('compare' as Highlight)])
      ),
      answer: `ruang tersisa ${terlaluKecil ? kanan - tengah : tengah - kiri} elemen`,
    });

    if (terlaluKecil) kiri = tengah + 1;
    else kanan = tengah - 1;
  }

  const found = arr.some((v) => Number(v) === target);
  if (!found) {
    frames.push({
      note: 'Ruang pencarian habis tanpa menemukan target.',
      window: null,
      answer: 'jawaban -1',
    });
  }
  return frames;
}

export function buildGridBfs(data: any): Frame[] {
  const grid: Array<Array<string | number>> = data.grid ?? [];
  const mode: string = data.mode ?? 'islands';
  const baris = grid.length;
  const kolom = grid[0]?.length ?? 0;
  const frames: Frame[] = [];

  const isOpen = (r: number, c: number) =>
    mode === 'path' ? Number(grid[r][c]) === 0 : String(grid[r][c]) === '1';

  if (mode === 'path') {
    const start = data.start ?? [0, 0];
    const goal = data.goal ?? [baris - 1, kolom - 1];
    const queue: Array<[number, number, number]> = [[start[0], start[1], 0]];
    const visited = new Set<string>([`${start[0]},${start[1]}`]);
    const dist = new Map<string, number>([[`${start[0]},${start[1]}`, 0]]);
    let ditemukan = -1;

    frames.push({
      note: `Mulai dari (${start[0]}, ${start[1]}) dengan jarak 0.`,
      detail: `Tujuan di (${goal[0]}, ${goal[1]}). Penelusuran melebar lapis demi lapis.`,
      extra: { antrean: `1 sel` },
      answer: 'mencari jalur',
    });

    while (queue.length) {
      const [r, c, d] = queue.shift()!;
      if (r === goal[0] && c === goal[1]) {
        ditemukan = d;
        frames.push({
          note: `Tujuan tercapai pada jarak ${d}.`,
          detail: 'Karena lapis dikunjungi berurutan, ini jarak terpendek.',
          highlights: { [r * kolom + c]: 'match' },
          extra: { antrean: `${queue.length} sel` },
          answer: `jarak ${d}`,
        });
        break;
      }
      const masuk: number[] = [];
      for (const [dr, dc] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= baris || nc < 0 || nc >= kolom) continue;
        if (!isOpen(nr, nc)) continue;
        const key = `${nr},${nc}`;
        if (visited.has(key)) continue;
        visited.add(key);
        dist.set(key, d + 1);
        queue.push([nr, nc, d + 1]);
        masuk.push(nr * kolom + nc);
      }
      frames.push({
        note: `Keluar (${r}, ${c}) jarak ${d}, masukkan ${masuk.length} sel tetangga baru.`,
        highlights: {
          ...Object.fromEntries([...dist.keys()].map((k) => {
            const [rr, cc] = k.split(',').map(Number);
            return [rr * kolom + cc, 'done' as Highlight];
          })),
          [r * kolom + c]: 'compare',
          ...Object.fromEntries(masuk.map((idx) => [idx, 'active' as Highlight])),
        },
        extra: { antrean: `${queue.length} sel` },
        answer: `lapis ${d + 1}`,
      });
    }

    if (ditemukan === -1) {
      frames.push({ note: 'Antrean habis, tujuan tidak dapat dicapai.', answer: 'jawaban -1' });
    }
    return frames;
  }

  // islands mode
  const visited = new Set<string>();
  let jumlah = 0;
  const highlightsBase: Record<number, Highlight> = {};

  const label = (r: number, c: number) => r * kolom + c;

  frames.push({
    note: 'Telusuri grid dari kiri atas ke kanan bawah.',
    detail: 'Setiap daratan yang belum dikunjungi akan memicu satu pulau baru.',
    answer: 'pulau 0',
  });

  for (let r = 0; r < baris; r++) {
    for (let c = 0; c < kolom; c++) {
      if (!isOpen(r, c) || visited.has(`${r},${c}`)) continue;
      jumlah++;
      const queue: Array<[number, number]> = [[r, c]];
      visited.add(`${r},${c}`);
      const anggota: number[] = [label(r, c)];
      frames.push({
        note: `Sel (${r}, ${c}) adalah daratan yang belum dikunjungi.`,
        detail: `Mulai pulau ke-${jumlah} dari sel ini.`,
        highlights: { ...highlightsBase, [label(r, c)]: 'active' },
        answer: `pulau ${jumlah}`,
      });

      while (queue.length) {
        const [cr, cc] = queue.shift()!;
        for (const [dr, dc] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nr >= baris || nc < 0 || nc >= kolom) continue;
          if (!isOpen(nr, nc)) continue;
          if (visited.has(`${nr},${nc}`)) continue;
          visited.add(`${nr},${nc}`);
          queue.push([nr, nc]);
          anggota.push(label(nr, nc));
          frames.push({
            note: `Daratan (${nr}, ${nc}) terhubung ke (${cr}, ${cc}), ikut masuk pulau ke-${jumlah}.`,
            highlights: {
              ...highlightsBase,
              ...Object.fromEntries(anggota.map((a) => [a, 'match' as Highlight])),
              [label(nr, nc)]: 'active',
            },
            answer: `pulau ${jumlah}`,
          });
        }
      }

      for (const a of anggota) highlightsBase[a] = 'done';
      frames.push({
        note: `Pulau ke-${jumlah} selesai dengan ${anggota.length} sel daratan.`,
        highlights: { ...highlightsBase },
        answer: `pulau ${jumlah}`,
      });
    }
  }

  frames.push({
    note: `Penelusuran selesai, ditemukan ${jumlah} pulau.`,
    highlights: { ...highlightsBase },
    answer: `jawaban ${jumlah}`,
  });
  return frames;
}

export function buildStack(data: any): Frame[] {
  const arr: any[] = data.array ?? [];
  const mode: string = data.mode ?? 'bracket';
  const frames: Frame[] = [];

  if (mode === 'bracket') {
    const pasangan: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    const stack: string[] = [];
    const push = (state?: Highlight) => stack.map((s) => ({ label: s, state }));

    frames.push({ note: 'Tumpukan masih kosong.', stack: [], answer: 'memeriksa' });

    for (let i = 0; i < arr.length; i++) {
      const ch = String(arr[i]);
      if ('([{'.includes(ch)) {
        stack.push(ch);
        frames.push({
          note: `"${ch}" adalah kurung buka, dorong ke tumpukan.`,
          detail: 'Kurung buka harus menunggu penutupnya.',
          highlights: { [i]: 'active' },
          stack: push(),
          answer: `tumpukan ${stack.length}`,
        });
      } else {
        const cocok = stack.length > 0 && stack[stack.length - 1] === pasangan[ch];
        if (!cocok) {
          frames.push({
            note: stack.length === 0 ? `"${ch}" muncul, tetapi tumpukan kosong.` : `"${ch}" tidak cocok dengan "${stack[stack.length - 1]}" di puncak.`,
            detail: 'String tidak valid.',
            highlights: { [i]: 'reject' },
            stack: push(),
            answer: 'tidak valid',
          });
          return frames;
        }
        stack.pop();
        frames.push({
          note: `"${ch}" cocok dengan "${pasangan[ch]}" di puncak, pasangan dikeluarkan.`,
          highlights: { [i]: 'match' },
          stack: push(),
          answer: stack.length === 0 ? 'tumpukan kosong' : `tumpukan ${stack.length}`,
        });
      }
    }

    frames.push({
      note: stack.length === 0 ? 'Seluruh kurung berpasangan, tumpukan kosong.' : `Masih tersisa ${stack.length} kurung buka tanpa penutup.`,
      stack: push(stack.length === 0 ? 'match' : 'reject'),
      answer: stack.length === 0 ? 'valid' : 'tidak valid',
    });
    return frames;
  }

  // next-greater mode (daily temperatures)
  const tumpukan: number[] = [];
  const hasil: number[] = new Array(arr.length).fill(0);

  frames.push({
    note: 'Tumpukan menyimpan indeks hari yang masih menunggu suhu lebih tinggi.',
    stack: [],
    answer: 'memproses',
  });

  for (let i = 0; i < arr.length; i++) {
    const t = Number(arr[i]);
    const dibuang: number[] = [];
    while (tumpukan.length && Number(arr[tumpukan[tumpukan.length - 1]]) < t) {
      const j = tumpukan.pop()!;
      hasil[j] = i - j;
      dibuang.push(j);
    }
    tumpukan.push(i);
    frames.push({
      note: dibuang.length
        ? `Suhu ${t} menyelesaikan ${dibuang.length} hari yang menunggu (${dibuang.map((j) => `hari ${j}`).join(', ')}).`
        : `Suhu ${t} tidak lebih tinggi dari puncak tumpukan, hanya disimpan.`,
      detail: dibuang.length
        ? `Selisih hari: ${dibuang.map((j) => `${i}-${j}=${i - j}`).join(', ')}.`
        : 'Hari ini menunggu suhu yang lebih tinggi.',
      highlights: {
        ...Object.fromEntries(Object.entries(hasil).map(([k, v]) => [Number(k), v > 0 ? ('done' as Highlight) : ('reject' as Highlight)])),
        ...Object.fromEntries(dibuang.map((j) => [j, 'match' as Highlight])),
        [i]: 'active',
      },
      stack: tumpukan.map((idx) => ({ label: `${idx}:${arr[idx]}`, state: 'compare' as Highlight })),
      answer: `terisi ${hasil.filter((v) => v > 0).length}/${arr.length}`,
    });
  }

  frames.push({
    note: 'Hari yang tersisa di tumpukan tidak punya suhu lebih tinggi, nilainya tetap nol.',
    highlights: Object.fromEntries(Object.entries(hasil).map(([k, v]) => [Number(k), v > 0 ? ('done' as Highlight) : ('reject' as Highlight)])),
    stack: [],
    answer: `hasil [${hasil.join(', ')}]`,
  });
  return frames;
}

export function buildIntervals(data: any): Frame[] {
  const raw: Array<[number, number]> = data.intervals ?? [];
  const mode: string = data.mode ?? 'merge';
  const frames: Frame[] = [];

  const sorted = [...raw].sort((a, b) => a[0] - b[0]);
  frames.push({
    note: 'Urutkan interval berdasarkan waktu mulai.',
    detail: `Urutan: ${sorted.map(([s, e]) => `[${s},${e}]`).join(', ')}.`,
    extra: {
      interval: sorted.map(([s, e]) => `${s}-${e}`).join(' | '),
    },
    answer: mode === 'rooms' ? 'menghitung ruangan' : 'belum digabung',
  });

  if (mode === 'rooms') {
    const mulai = sorted.map((i) => i[0]).sort((a, b) => a - b);
    const selesai = sorted.map((i) => i[1]).sort((a, b) => a - b);
    let i = 0;
    let j = 0;
    let aktif = 0;
    let terbaik = 0;
    while (i < sorted.length) {
      if (mulai[i] < selesai[j]) {
        aktif++;
        terbaik = Math.max(terbaik, aktif);
        frames.push({
          note: `Rapat mulai pukul ${mulai[i]} sementara rapat terawal baru selesai pukul ${selesai[j]}.`,
          detail: `${aktif} rapat berjalan bersamaan, ruangan bertambah menjadi ${aktif}.`,
          extra: { 'rapat aktif': String(aktif), 'ruangan maksimum': String(terbaik) },
          answer: `ruangan ${terbaik}`,
        });
        i++;
      } else {
        aktif--;
        frames.push({
          note: `Rapat yang selesai pukul ${selesai[j]} membebaskan ruangan.`,
          detail: `${aktif} rapat berjalan bersamaan, ruangan bisa dipakai ulang.`,
          extra: { 'rapat aktif': String(aktif), 'ruangan maksimum': String(terbaik) },
          answer: `ruangan ${terbaik}`,
        });
        j++;
      }
    }
    frames.push({
      note: `Jumlah ruangan paling sedikit adalah ${terbaik}.`,
      extra: { 'ruangan maksimum': String(terbaik) },
      answer: `jawaban ${terbaik}`,
    });
    return frames;
  }

  const hasil: Array<[number, number]> = [];
  for (const [s, e] of sorted) {
    const terakhir = hasil[hasil.length - 1];
    if (terakhir && s <= terakhir[1]) {
      const lama = terakhir[1];
      terakhir[1] = Math.max(terakhir[1], e);
      frames.push({
        note: `[${s},${e}] tumpang tindih dengan [${terakhir[0]},${lama}].`,
        detail: `Titik awal ${s} tidak melebihi titik akhir ${lama}, jadi digabung menjadi [${terakhir[0]},${terakhir[1]}].`,
        extra: { hasil: hasil.map(([a, b]) => `[${a},${b}]`).join(' ') },
        answer: `${hasil.length} interval`,
      });
    } else {
      frames.push({
        note: `[${s},${e}] tidak tumpang tindih dengan interval sebelumnya.`,
        detail: `Titik awal ${s} melebihi titik akhir terakhir, jadi mulai interval baru.`,
        extra: { hasil: [...hasil, [s, e]].map(([a, b]) => `[${a},${b}]`).join(' ') },
        answer: `${hasil.length + 1} interval`,
      });
      hasil.push([s, e]);
    }
  }

  frames.push({
    note: `Penggabungan selesai, tersisa ${hasil.length} interval.`,
    extra: { hasil: hasil.map(([a, b]) => `[${a},${b}]`).join(' ') },
    answer: `${hasil.length} interval`,
  });
  return frames;
}

export function buildDp1d(data: any): Frame[] {
  const mode: string = data.mode ?? 'stairs';
  const frames: Frame[] = [];

  if (mode === 'stairs') {
    const n = Number(data.n);
    const dp: number[] = new Array(n + 1).fill(0);
    dp[1] = 1;
    if (n >= 2) dp[2] = 2;
    frames.push({
      note: 'Dua anak tangga pertama adalah kasus dasar.',
      detail: 'Cara mencapai tangga 1 ada 1, tangga 2 ada 2.',
      seen: dp.slice(0, Math.min(n, 2) + 1).map((v, i) => ({ label: `${i}: ${i <= 1 ? v || 1 : v}`, state: i >= 1 ? ('done' as Highlight) : undefined })),
      answer: 'kasus dasar',
    });
    for (let i = 3; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      frames.push({
        note: `Cara mencapai tangga ${i} = cara tangga ${i - 1} + cara tangga ${i - 2}.`,
        detail: `${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}. Langkah terakhir hanya bisa 1 atau 2 anak tangga.`,
        seen: dp.slice(0, i + 1).map((v, idx) => ({
          label: `${idx}: ${v}`,
          state: idx === i ? 'match' : idx >= i - 2 ? 'compare' : idx >= 1 ? 'done' : undefined,
        })),
        answer: `dp[${i}] = ${dp[i]}`,
      });
    }
    frames.push({
      note: `Ada ${dp[Math.min(n, dp.length - 1)]} cara mencapai anak tangga ke-${n}.`,
      seen: dp.slice(1).map((v, idx) => ({ label: `${idx + 1}: ${v}`, state: idx === dp.length - 2 ? 'match' : 'done' })),
      answer: `jawaban ${dp[Math.min(n, dp.length - 1)]}`,
    });
    return frames;
  }

  if (mode === 'robber') {
    const arr: number[] = data.array ?? [];
    let ambil = 0;
    let lewati = 0;
    frames.push({
      note: 'Dua status: ambil rumah ini, atau lewati.',
      detail: 'Status "mulai" hanya menyimpan dua nilai terakhir, jadi ruang konstan.',
      seen: [
        { label: 'ambil: 0', state: 'compare' },
        { label: 'lewati: 0', state: 'compare' },
      ],
      answer: 'mulai',
    });
    for (let i = 0; i < arr.length; i++) {
      const baruAmbil = lewati + arr[i];
      const baruLewati = Math.max(lewati, ambil);
      frames.push({
        note: `Rumah ${i} berisi ${arr[i]}.`,
        detail: `Jika diambil: lewati sebelumnya ${lewati} + ${arr[i]} = ${baruAmbil}. Jika dilewati: tetap ${baruLewati}.`,
        highlights: { [i]: 'active' },
        seen: [
          { label: `ambil: ${baruAmbil}`, state: 'match' },
          { label: `lewati: ${baruLewati}`, state: 'compare' },
        ],
        answer: `terbaik ${Math.max(baruAmbil, baruLewati)}`,
      });
      ambil = baruAmbil;
      lewati = baruLewati;
    }
    frames.push({
      note: `Jumlah maksimum yang bisa diambil adalah ${Math.max(ambil, lewati)}.`,
      seen: [
        { label: `ambil: ${ambil}`, state: 'done' },
        { label: `lewati: ${lewati}`, state: 'done' },
      ],
      answer: `jawaban ${Math.max(ambil, lewati)}`,
    });
    return frames;
  }

  // coin change
  const coins: number[] = data.coins ?? [];
  const target = Number(data.target);
  const TAK = Infinity;
  const tabel: number[] = [0, ...new Array(target).fill(TAK)];

  frames.push({
    note: `Tabel berisi jumlah koin minimum untuk setiap jumlah uang dari 0 sampai ${target}.`,
    detail: `Nilai awal tak terhingga berarti kombinasi belum ditemukan.`,
    seen: tabel.map((v, i) => ({ label: `${i}: ${v === TAK ? '∞' : v}`, state: i === 0 ? ('done' as Highlight) : ('compare' as Highlight) })),
    answer: `koin ${coins.join(', ')}`,
  });

  for (let nilai = 1; nilai <= target; nilai++) {
    for (const k of coins) {
      if (k <= nilai && tabel[nilai - k] + 1 < tabel[nilai]) {
        tabel[nilai] = tabel[nilai - k] + 1;
      }
    }
    frames.push({
      note: `Untuk membentuk ${nilai}, coba setiap koin sebagai koin terakhir.`,
      detail: coins
        .filter((k) => k <= nilai)
        .map((k) => `${k} -> sisa ${nilai - k} butuh ${tabel[nilai - k] === TAK ? '∞' : tabel[nilai - k]}, total ${tabel[nilai - k] === TAK ? '∞' : tabel[nilai - k] + 1}`)
        .join(' | ') + `.`,
      seen: tabel.map((v, i) => ({
        label: `${i}: ${v === TAK ? '∞' : v}`,
        state: i === nilai ? 'match' : i <= nilai ? 'done' : 'compare',
      })),
      answer: `dp[${nilai}] = ${tabel[nilai] === TAK ? '∞' : tabel[nilai]}`,
    });
  }

  frames.push({
    note: tabel[target] === TAK ? `Jumlah ${target} tidak dapat dibentuk dari koin yang tersedia.` : `Jumlah ${target} dapat dibentuk dengan ${tabel[target]} koin.`,
    seen: tabel.map((v, i) => ({ label: `${i}: ${v === TAK ? '∞' : v}`, state: i === target ? 'match' : 'done' })),
    answer: tabel[target] === TAK ? 'jawaban -1' : `jawaban ${tabel[target]}`,
  });
  return frames;
}

export function buildSteps(kind: string, data: any): VisualStep {
  switch (kind) {
    case 'two-pointer':
      return { kind, frames: buildTwoPointer(data), summary: 'Dua penunjuk bergerak dari kedua ujung array.', legend: LEGEND_BASE };
    case 'hash-map':
      return { kind, frames: buildHashmap(data), summary: 'Tabel menyimpan nilai yang sudah dilewati agar pencarian menjadi konstan.', legend: LEGEND_BASE };
    case 'sliding-window':
      return { kind, frames: buildSlidingWindow(data), summary: 'Jendela melebar dan menyempit sambil menjaga kondisi tetap valid.', legend: LEGEND_BASE };
    case 'binary-search':
      return { kind, frames: buildBinarySearch(data), summary: 'Separuh ruang pencarian dibuang setiap langkah.', legend: LEGEND_BASE };
    case 'grid-bfs':
      return { kind, frames: buildGridBfs(data), summary: 'Sel dikunjungi lapis demi lapis menggunakan antrean.', legend: LEGEND_BASE };
    case 'stack':
      return { kind, frames: buildStack(data), summary: 'Tumpukan menyimpan item yang belum terselesaikan.', legend: LEGEND_BASE };
    case 'intervals':
      return { kind, frames: buildIntervals(data), summary: 'Interval diurutkan lalu diproses satu lintasan.', legend: LEGEND_BASE };
    case 'dp-1d':
      return { kind, frames: buildDp1d(data), summary: 'Jawaban submasalah disimpan untuk menghindari hitung ulang.', legend: LEGEND_BASE };
    default:
      return { kind, frames: [], summary: 'Visualisasi belum tersedia untuk pola ini.', legend: [] };
  }
}
