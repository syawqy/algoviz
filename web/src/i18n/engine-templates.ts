// Template translation for engine narration that contains interpolated values.
//
// The engine builds most of its narration with template literals
// (`Volume = min(${a}, ${b}) x ${lebar} = ${volume}.`), so an exact-string
// lookup table cannot match them. Instead the few dozen sentence shapes are
// matched as regexes and the captured numbers are re-inserted into the English
// phrasing. Rules are tried in order; the first match wins.
//
// Anything unmatched falls through to the exact-string table, then to the
// Indonesian original. That keeps a newly added engine sentence readable rather
// than replacing it with a placeholder.

type Rule = [RegExp, (...args: string[]) => string];

const RULES: Rule[] = [
  // --- Generic value comparisons ---
  [/^Bandingkan "(.+)" dengan "(.+)": (cocok|berbeda)\.$/, (a, b, v) =>
    `Compare "${a}" with "${b}": ${v === 'cocok' ? 'match' : 'not a match'}.`],
  [/^Jumlahkan (.+) \+ (.+) = (.+)\.$/, (a, b, s) => `Add ${a} + ${b} = ${s}.`],
  [/^Volume = min\((.+), (.+)\) x (.+) = (.+)\.$/, (a, b, w, v) =>
    `Volume = min(${a}, ${b}) x ${w} = ${v}.`],
  [/^Volume terbaik sekarang (.+)\.$/, (v) => `Best volume so far is ${v}.`],
  [/^Penunjuk bertemu\. Volume maksimum (.+)\.$/, (b) =>
    `Pointers met. Maximum volume is ${b}.`],
  [/^Nilai tengah (.+) sama dengan target\.$/, (v) => `Middle value ${v} equals the target.`],
  [/^Nilai tengah (.+) (lebih kecil|lebih besar) dari (.+)\.$/, (v, dir, t) =>
    `Middle value ${v} is ${dir === 'lebih kecil' ? 'smaller' : 'larger'} than ${t}.`],
  [/^Target ditemukan pada indeks (.+)\.$/, (i) => `Target found at index ${i}.`],
  [/^Ruang pencarian awal mencakup seluruh array\.$/, () =>
    `The initial search space covers the whole array.`],
  [/^Buang separuh kiri \(indeks (.+) sampai (.+)\), cari di (.+) sampai (.+)\.$/, (a, b, c, d) =>
    `Discard the left half (indices ${a} to ${b}), search in ${c} to ${d}.`],
  [/^Buang separuh kanan \(indeks (.+) sampai (.+)\), cari di (.+) sampai (.+)\.$/, (a, b, c, d) =>
    `Discard the right half (indices ${a} to ${b}), search in ${c} to ${d}.`],
  [/^ruang tersisa (.+) elemen$/, (n) => `${n} elements remaining`],
  [/^indeks ([^.,|]+)$/, (i) => `index ${i}`],

  // --- Two pointer / palindrome / container ---
  [/^Pasangan ditemukan pada indeks (.+) dan (.+)\.$/, (a, b) =>
    `Pair found at indices ${a} and ${b}.`],
  [/^jawaban \[(.+), (.+)\]$/, (a, b) => `answer [${a}, ${b}]`],
  [/^Dinding kiri lebih pendek, geser kiri ke dalam\.$/, () =>
    `Left wall is shorter, move left inward.`],
  [/^Dinding kanan lebih pendek, geser kanan ke dalam\.$/, () =>
    `Right wall is shorter, move right inward.`],
  [/"(.+)" bukan huruf atau angka, dilewati\.$/, (ch) =>
    `"${ch}" is not a letter or digit, skipped.`],

  // --- Sliding window ---
  [/^Jendela pertama berukuran (.+) berisi (.+)\.$/, (k, items) =>
    `The first window has size ${k} and holds ${items}.`],
  [/^Jendela sekarang "(.+)" dengan panjang (.+)\.$/, (s, len) =>
    `The window is now "${s}" with length ${len}.`],
  [/^Geser jendela: keluarkan (.+), masukkan (.+)\.$/, (out, inn) =>
    `Slide the window: remove ${out}, add ${inn}.`],
  [/^Jendela masih valid, sempitkan dari kiri dengan membuang "(.+)"\.$/, (ch) =>
    `The window is still valid, narrow it from the left by dropping "${ch}".`],
  [/^Jendela terpendek ditemukan: "(.+)" \(panjang (.+)\)\.$/, (s, len) =>
    `Shortest window found: "${s}" (length ${len}).`],
  [/^Jendela valid dengan panjang (.+)\.$/, (len) => `Valid window with length ${len}.`],
  [/^Karakter "(.+)" sudah ada di jendela pada indeks (.+)\.$/, (ch, i) =>
    `Character "${ch}" is already in the window at index ${i}.`],
  [/^Geser batas kiri ke (.+) agar jendela kembali unik\.$/, (i) =>
    `Move the left boundary to ${i} so the window is unique again.`],
  [/^Masukkan "(.+)" ke jendela, sisa kebutuhan (.+) karakter\.$/, (ch, need) =>
    `Add "${ch}" to the window, ${need} characters still needed.`],
  [/^Cari potongan yang memuat semua karakter "(.+)"\.$/, (need) =>
    `Look for a slice containing all characters of "${need}".`],
  [/^Tidak ada jendela yang memuat seluruh karakter target\.$/, () =>
    `No window contains all the target characters.`],
  [/^Substring terpanjang "(.+)" dengan panjang (.+)\.$/, (s, len) =>
    `Longest substring "${s}" with length ${len}.`],
  [/^terbaik "(.+)"$/, (s) => `best "${s}"`],

  // --- Prefix sums / max average ---
  [/^Jumlah (.+), rata-rata (.+)\.$/, (total, avg) => `Sum ${total}, average ${avg}.`],
  [/^Jumlah menjadi (.+) tanpa menjumlahkan ulang seluruh jendela\. Rata-rata (.+)\.$/, (t, avg) =>
    `Sum becomes ${t} without re-adding the whole window. Average ${avg}.`],
  [/^Rata-rata maksimum (.+)\.$/, (b) => `Maximum average ${b}.`],
  [/^Rekam sebagai kandidat terbaik\.$/, () => `Record this as the best candidate.`],

  // --- Hash map ---
  [/^Nilai (.+) belum pernah ada, simpan ke tabel\.$/, (x) =>
    `Value ${x} has not been seen, store it in the table.`],
  [/^Pasangan (.+) \+ (.+) = (.+)\.$/, (a, b, t) => `Pair ${a} + ${b} = ${t}.`],
  [/^Untuk (.+), pasangannya (.+) sudah ada di tabel\.$/, (x, need) =>
    `For ${x}, its complement ${need} is already in the table.`],
  [/^Untuk (.+), butuh (.+) yang belum ada di tabel\.$/, (x, need) =>
    `For ${x}, we need ${need}, which is not in the table yet.`],
  [/^Simpan (.+) pada indeks (.+) untuk diperiksa nanti\.$/, (x, i) =>
    `Store ${x} at index ${i} to check later.`],
  [/^butuh (.+) - x$/, (t) => `need ${t} - x`],
  [/^Urutkan huruf "(.+)" menjadi kunci "(.+)"\.$/, (x, k) =>
    `Sort the letters of "${x}" into key "${k}".`],
  [/^Kelompok baru "(.+)" dibuat\.$/, (k) => `New group "${k}" created.`],
  [/^Kata dengan kunci sama akan berada di kelompok yang sama\.$/, () =>
    `Words with the same key end up in the same group.`],
  [/^Pengelompokan selesai, terbentuk (.+) kelompok\.$/, (n) =>
    `Grouping complete, ${n} groups formed.`],
  [/^(.+) \((.+) kata\)$/, (k, n) => `${k} (${n} words)`],

  // --- Dynamic programming: coin change ---
  [/^Tabel berisi jumlah koin minimum untuk setiap jumlah uang dari 0 sampai (.+)\.$/, (t) =>
    `The table holds the minimum coin count for every amount from 0 to ${t}.`],
  [/^Nilai awal tak terhingga berarti kombinasi belum ditemukan\.$/, () =>
    `An initial value of infinity means no combination has been found yet.`],
  [/^Untuk membentuk (.+), coba setiap koin sebagai koin terakhir\.$/, (v) =>
    `To make ${v}, try each coin as the last coin.`],
  [/^Jumlah (.+) dapat dibentuk dengan (.+) koin\.$/, (t, c) =>
    `Amount ${t} can be formed with ${c} coins.`],
  [/^Jumlah (.+) tidak dapat dibentuk dari koin yang tersedia\.$/, (t) =>
    `Amount ${t} cannot be formed from the available coins.`],
  [/^koin ([^.,|]+)$/, (c) => `coins ${c}`],

  // --- Dynamic programming: stairs / house robber ---
  [/^Cara mencapai tangga (.+) = cara tangga (.+) \+ cara tangga (.+)\.$/, (i, a, b) =>
    `Ways to reach step ${i} = ways to step ${a} + ways to step ${b}.`],
  [/^(.+) \+ (.+) = (.+)\. Langkah terakhir hanya bisa 1 atau 2 anak tangga\.$/, (a, b, c) =>
    `${a} + ${b} = ${c}. The final move is either 1 or 2 steps.`],
  [/^Ada (.+) cara mencapai anak tangga ke-(.+)\.$/, (n, i) =>
    `There are ${n} ways to reach step ${i}.`],
  [/^Rumah (.+) berisi (.+)\.$/, (i, v) => `House ${i} holds ${v}.`],
  [/^Jika diambil: lewati sebelumnya (.+) \+ (.+) = (.+)\. Jika dilewati: tetap (.+)\.$/, (a, b, c, d) =>
    `If robbed: previous skip ${a} + ${b} = ${c}. If skipped: stays ${d}.`],
  [/^Jumlah maksimum yang bisa diambil adalah (.+)\.$/, (m) =>
    `The maximum that can be taken is ${m}.`],
  [/^Masih di bawah terbaik (.+)\.$/, (b) => `Still below the best ${b}.`],
  [/^terbaik = (.+)$/, (b) => `best = ${b}`],
  [/^terisi (.+)\/(.+)$/, (a, b) => `filled ${a}/${b}`],

  // --- Grid / islands / BFS ---
  [/^Sel \((.+), (.+)\) adalah daratan yang belum dikunjungi\.$/, (r, c) =>
    `Cell (${r}, ${c}) is unvisited land.`],
  [/^Mulai pulau ke-(.+) dari sel ini\.$/, (n) => `Start island ${n} from this cell.`],
  [/^Daratan \((.+), (.+)\) terhubung ke \((.+), (.*)\), ikut masuk pulau ke-(.+)\.$/, (...a) =>
    `Land (${a[0]}, ${a[1]}) connects to (${a[2]}, ${a[3]}), joining island ${a[4]}.`],
  [/^Pulau ke-(.+) selesai dengan (.+) sel daratan\.$/, (n, c) =>
    `Island ${n} complete with ${c} land cells.`],
  [/^Penelusuran selesai, ditemukan (.+) pulau\.$/, (n) =>
    `Traversal complete, ${n} islands found.`],
  [/^Mulai dari \((.+), (.+)\) dengan jarak 0\.$/, (r, c) =>
    `Start at (${r}, ${c}) with distance 0.`],
  [/^Tujuan di \((.+), (.+)\)\. Penelusuran melebar lapis demi lapis\.$/, (r, c) =>
    `Goal at (${r}, ${c}). The search expands layer by layer.`],
  [/^Keluar \((.+), (.+)\) jarak (.+), masukkan (.+) sel tetangga baru\.$/, (r, c, d, n) =>
    `Dequeue (${r}, ${c}) at distance ${d}, enqueue ${n} new neighbour cells.`],
  [/^Tujuan tercapai pada jarak (.+)\.$/, (d) => `Goal reached at distance ${d}.`],
  [/^([^.,|]+) sel$/, (n) => `${n} cells`],
  [/^lapis ([^.,|]+)$/, (n) => `layer ${n}`],

  // --- Stack ---
  [/^"(.+)" adalah kurung buka, dorong ke tumpukan\.$/, (ch) =>
    `"${ch}" is an opening bracket, push it onto the stack.`],
  [/^"(.+)" cocok dengan "(.+)" di puncak, pasangan dikeluarkan\.$/, (ch, top) =>
    `"${ch}" matches "${top}" on top, the pair is popped.`],
  [/^"(.+)" muncul, tetapi tumpukan kosong\.$/, (ch) =>
    `"${ch}" appears, but the stack is empty.`],
  [/^"(.+)" tidak cocok dengan "(.+)" di puncak\.$/, (ch, top) =>
    `"${ch}" does not match "${top}" on top.`],
  [/^Masih tersisa (.+) kurung buka tanpa penutup\.$/, (n) =>
    `${n} opening brackets are still unclosed.`],
  [/^Suhu (.+) tidak lebih tinggi dari puncak tumpukan, hanya disimpan\.$/, (t) =>
    `Temperature ${t} is not higher than the stack top, so it is just stored.`],
  [/^tumpukan ([^.,|]+)$/, (n) => `stack ${n}`],
  [/^hasil \[(.+)\]$/, (h) => `result [${h}]`],

  // --- Greedy / intervals ---
  [/^\[(.+),(.+)\] tumpang tindih dengan \[(.+),(.+)\]\.$/, (s, e, ts, te) =>
    `[${s},${e}] overlaps with [${ts},${te}].`],
  [/^\[(.+),(.+)\] tidak tumpang tindih dengan interval sebelumnya\.$/, (s, e) =>
    `[${s},${e}] does not overlap with the previous interval.`],
  [/^Titik awal (.+) tidak melebihi titik akhir (.+), jadi digabung menjadi \[(.+),(.+)\]\.$/, (s, l, a, b) =>
    `Start ${s} does not exceed end ${l}, so it merges into [${a},${b}].`],
  [/^Titik awal (.+) melebihi titik akhir terakhir, jadi mulai interval baru\.$/, (s) =>
    `Start ${s} exceeds the last end, so a new interval begins.`],
  [/^Penggabungan selesai, tersisa (.+) interval\.$/, (n) =>
    `Merging complete, ${n} intervals remain.`],
  [/^Rapat yang selesai pukul (.+) membebaskan ruangan\.$/, (t) =>
    `The meeting ending at ${t} frees a room.`],
  [/^Rapat mulai pukul (.+) sementara rapat terawal baru selesai pukul (.+)\.$/, (a, b) =>
    `A meeting starts at ${a} while the earliest ending one finishes at ${b}.`],
  [/^(.+) rapat berjalan bersamaan, ruangan bertambah menjadi (.+)\.$/, (a, b) =>
    `${a} meetings run concurrently, rooms grow to ${b}.`],
  [/^(.+) rapat berjalan bersamaan, ruangan bisa dipakai ulang\.$/, (a) =>
    `${a} meetings run concurrently, the room can be reused.`],
  [/^Jumlah ruangan paling sedikit adalah (.+)\.$/, (n) =>
    `The minimum number of rooms is ${n}.`],
  [/^lewati: 0$/, () => `skip: 0`],
  [/^ambil: 0$/, () => `take: 0`],
  [/^target = (.+)$/, (t) => `target = ${t}`],

  // --- Chip counters and short labels that appear verbatim in the UI ---
  [/^pulau ([^.,|]+)$/, (n) => `island ${n}`],
  [/^jarak ([^.,|]+)$/, (n) => `distance ${n}`],
  [/^ruangan ([^.,|]+)$/, (n) => `rooms ${n}`],
  [/^kelompok ([^.,|]+)$/, (n) => `groups ${n}`],
  [/^(.+) kelompok$/, (n) => `${n} groups`],
  [/^kunci ([^.,|]+)$/, (k) => `key ${k}`],
  [/^panjang ([^.,|]+)$/, (n) => `length ${n}`],
  [/^ambil: (.+)$/, (n) => `take: ${n}`],
  [/^lewati: (.+)$/, (n) => `skip: ${n}`],
  [/^sisa ([^.,|]+)$/, (n) => `${n} remaining`],
  [/^total ([^.,|]+)$/, (n) => `total ${n}`],
  [/^memeriksa$/, () => `checking`],
  [/^memproses$/, () => `processing`],
  [/^valid$/, () => `valid`],
  [/^sunyi$/, () => `quiet`],
  [/^(.+) karakter unik$/, (n) => `${n} unique characters`],
  [/^Kebutuhan: (.+)$/, (need) => `Needed: ${need}`],
  [/^(.+) interval$/, (n) => `${n} intervals`],

  // --- Coin change per-coin reasoning (single and pipe-joined variants) ---
  // The engine joins several candidates with ' | ', so the same phrase shape is
  // translated piecewise and re-joined rather than matched as one anchored rule.
  // Only the final ' | ' segment carries a period, so the trailing full stop is
  // optional here and the period is re-added to every piece.
  [/^(.+?) -> sisa (.+?) butuh (.+?), total (.+?)\.?$/, (coin, rest, need, total) =>
    `${coin} -> remaining ${rest}, needs ${need}, total ${total}.`],

  // --- Daily temperatures ---
  [/^Suhu (.+) menyelesaikan (.+) hari yang menunggu \((.*)\)\.$/, (t, n, days) =>
    `Temperature ${t} resolves ${n} waiting days (${translateTemplate(days)}).`],
  [/^Selisih hari: (.+)$/, (gaps) => `Day gaps: ${gaps}.`],
  [/^hari ([^.,|]+)$/, (n) => `day ${n}`],

  // --- Interval sorting / running result chips ---
  [/^Urutan: (.+)\.$/, (list) => `Order: ${list}.`],
  [/^Nilai (.+) sudah ada di tabel pada indeks (.+)\.$/, (v, i) =>
    `Value ${v} is already in the table at index ${i}.`],
  [/^Pasangan (.+) \+ (.+) = (.+)\.$/, (a, b, s) => `Pair ${a} + ${b} = ${s}.`],

  // --- DP stairs, second phrasing variant ---
  [/^(.+) \+ (.+) = (.+)\. Langkah terakhir hanya bisa 1 atau 2 anak tangga\.$/, (a, b, c) =>
    `${a} + ${b} = ${c}. The final move is either 1 or 2 steps.`],

  // --- House robber, second phrasing variant ---
  [/^Jika diambil: lewati sebelumnya (.+) \+ (.+) = (.+)\. Jika dilewati: tetap (.+)\.$/, (a, b, c, d) =>
    `If robbed: previous skip ${a} + ${b} = ${c}. If skipped: stays ${d}.`],

  // --- Bare answer / best / target / need labels (checked after specific rules) ---
  [/^jawaban (.+)$/, (a) => `answer ${a}`],
  [/^terbaik ([^|]+?)\.?$/, (h) => `best ${h}`],
  [/^target ([^.,|]+)$/, (t) => `target ${t}`],
  [/^butuh ([^.,|]+)$/, (n) => `need ${n}`],
];

export function translateTemplate(text: string): string {
  // The engine joins alternative candidates with ' | ' (for example the per-coin
  // totals for one amount). Translate each piece on its own so the separator does
  // not defeat the anchored rules above.
  if (text.includes(' | ')) {
    return text
      .split(' | ')
      .map((part) => translateTemplate(part))
      .join(' | ');
  }

  // Comma-separated lists of the same label ("hari 1, hari 0") are translated
  // item by item, again so the separator does not defeat the anchored rules.
  if (text.includes(', ') && /^[a-z]+ /.test(text)) {
    const parts = text.split(', ');
    const translated = parts.map((part) => translateTemplate(part));
    if (translated.some((p, i) => p !== parts[i])) return translated.join(', ');
  }

  for (const [re, fn] of RULES) {
    const m = text.match(re);
    if (m) return fn(...m.slice(1));
  }
  return text;
}
