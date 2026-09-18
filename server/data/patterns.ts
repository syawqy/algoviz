// Pattern metadata. `recognition` is the cue learners should notice in a
// problem statement, which is the actual transferable skill.
export interface PatternSeed {
  slug: string;
  name: string;
  blurb: string;
  recognition: string;
  complexity: string;
}

export const PATTERNS: PatternSeed[] = [
  {
    slug: 'two-pointer',
    name: 'Two Pointer',
    blurb: 'Dua indeks berjalan dari arah berlawanan atau searah untuk membuang pencarian bersarang.',
    recognition: 'Array terurut dan diminta mencari pasangan atau kondisi tertentu.',
    complexity: 'O(n) waktu, O(1) ruang',
  },
  {
    slug: 'sliding-window',
    name: 'Sliding Window',
    blurb: 'Jendela yang melebar dan menyempit untuk menjaga subset yang valid.',
    recognition: 'Diminta subarray atau substring terpanjang/terpendek yang memenuhi syarat.',
    complexity: 'O(n) waktu, O(k) ruang',
  },
  {
    slug: 'hash-map',
    name: 'Hash Map',
    blurb: 'Simpan apa yang sudah dilihat supaya pencarian O(1) menggantikan pemindaian ulang.',
    recognition: 'Butuh menanyakan "apakah nilai ini pernah muncul" berulang kali.',
    complexity: 'O(n) waktu, O(n) ruang',
  },
  {
    slug: 'binary-search',
    name: 'Binary Search',
    blurb: 'Setengah ruang pencarian dibuang setiap langkah dengan membandingkan titik tengah.',
    recognition: 'Data terurut, atau ruang jawaban monotonik sehingga bisa diuji di tengah.',
    complexity: 'O(log n) waktu, O(1) ruang',
  },
  {
    slug: 'dynamic-programming',
    name: 'Dynamic Programming',
    blurb: 'Jawaban submasalah disimpan agar tidak dihitung berulang kali.',
    recognition: 'Ada pilihan berulang yang tumpang tindih, dan jawaban besar dibangun dari jawaban kecil.',
    complexity: 'O(n) sampai O(n^2) waktu, O(n) ruang',
  },
  {
    slug: 'bfs-dfs',
    name: 'BFS & DFS',
    blurb: 'Telusuri graf atau grid lapis demi lapis (BFS) atau menukik sedalam mungkin (DFS).',
    recognition: 'Struktur berbentuk grid, pohon, atau graf; diminta jarak terpendek atau eksplorasi menyeluruh.',
    complexity: 'O(V + E) waktu, O(V) ruang',
  },
  {
    slug: 'stack',
    name: 'Stack',
    blurb: 'Simpan item yang belum terselesaikan, lalu cocokkan saat penutupnya muncul.',
    recognition: 'Ada pasangan buka-tutup, atau butuh elemen terbesar berikutnya.',
    complexity: 'O(n) waktu, O(n) ruang',
  },
  {
    slug: 'greedy-interval',
    name: 'Greedy & Interval',
    blurb: 'Urutkan berdasarkan batas, lalu ambil keputusan yang optimal untuk langkah sekarang.',
    recognition: 'Interval waktu yang saling tumpang tindih atau penjadwalan bertabrakan.',
    complexity: 'O(n log n) waktu, O(1) ruang',
  },
];
