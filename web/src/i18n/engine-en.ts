// Translation bridge for engine-generated text.
//
// The visualizer engine emits Indonesian narration strings (frame notes,
// details, answers, legend labels). Rather than reworking the engine's 90-odd
// literals into keys and invalidating its test suite, the exact engine strings
// are mapped to English here and looked up at the render boundary.
//
// Keys are the source strings verbatim. Any string not present falls back to
// its Indonesian original, so a newly added engine step degrades to Indonesian
// instead of rendering a raw key.

export const ENGINE_EN: Record<string, string> = {
  // Legend tokens.
  'Penunjuk aktif': 'Active pointer',
  'Cocok / jawaban': 'Match / answer',
  'Sedang diperiksa': 'Being checked',
  Dibuang: 'Discarded',

  // Pointer labels.
  kiri: 'left',
  kanan: 'right',
  tengah: 'mid',

  // Two pointer / palindrome / container.
  'Mulai dari kedua ujung array.': 'Start from both ends of the array.',
  'Penunjuk diletakkan di ujung kiri dan kanan.': 'Pointers are placed at the left and right ends.',
  'Penunjuk kiri maju satu langkah.': 'The left pointer advances one step.',
  'Penunjuk kanan mundur satu langkah.': 'The right pointer retreats one step.',
  'Pasangan benar, kedua penunjuk maju.': 'The pair matches, both pointers advance.',
  'Bukan palindrom, pencarian berhenti.': 'Not a palindrome, the search stops.',
  'Sama dengan target, pasangan ditemukan.': 'Equal to the target, the pair is found.',
  'Terlalu kecil, geser kiri ke kanan.': 'Too small, move left to the right.',
  'Terlalu besar, geser kanan ke kiri.': 'Too large, move right to the left.',
  'Penunjuk bertemu atau bersilangan, seluruh pasangan sudah diperiksa.':
    'The pointers meet or cross, every pair has been checked.',
  'Menggeser dinding yang lebih tinggi tidak mungkin menambah volume.':
    'Moving the taller wall cannot increase the volume.',
  'pemeriksaan selesai': 'check complete',
  'masih palindrom': 'still a palindrome',
  'bukan palindrom': 'not a palindrome',

  // Hash map.
  'Siapkan tabel kosong untuk menyimpan yang sudah dilihat.': 'Prepare an empty table to store what has been seen.',
  'Setiap nilai yang dilewati akan dicatat.': 'Every value passed will be recorded.',
  'Duplikat ditemukan, jawaban benar tanpa perlu membaca sisa array.':
    'Duplicate found, the answer is true without reading the rest of the array.',
  'Seluruh array selesai dibaca tanpa pengulangan.': 'The whole array was read with no repetition.',
  'ada duplikat': 'duplicate present',
  'tidak ada duplikat': 'no duplicate',
  'lanjut memeriksa': 'keep checking',
  'belum ditemukan': 'not found yet',

  // Sliding window.
  'jendela valid': 'window valid',
  'perlebar jendela': 'widen the window',
  'Menyempitkan bisa menemukan jendela yang lebih pendek.': 'Narrowing may find a shorter window.',
  'masih valid': 'still valid',
  'perlu diperlebar': 'needs widening',
  'Jendela dimulai kosong.': 'The window starts empty.',
  'terbaik 0': 'best 0',
  'Panjang terbaik diperbarui.': 'The best length was updated.',
  'tidak ada': 'none',

  // Binary search.
  'lebih kecil': 'smaller',
  'lebih besar': 'larger',
  'Ruang pencarian habis tanpa menemukan target.': 'The search space ran out without finding the target.',
  'jawaban -1': 'answer -1',

  // Grid.
  'mencari jalur': 'searching for a path',
  'Karena lapis dikunjungi berurutan, ini jarak terpendek.': 'Because layers are visited in order, this is the shortest distance.',
  'Antrean habis, tujuan tidak dapat dicapai.': 'The queue is empty, the destination cannot be reached.',
  'Telusuri grid dari kiri atas ke kanan bawah.': 'Traverse the grid from top left to bottom right.',
  'Setiap daratan yang belum dikunjungi akan memicu satu pulau baru.':
    'Every unvisited piece of land triggers one new island.',
  'pulau 0': 'island 0',

  // Stack.
  'Tumpukan masih kosong.': 'The stack is still empty.',
  'Kurung buka harus menunggu penutupnya.': 'An opening bracket must wait for its closing bracket.',
  'String tidak valid.': 'The string is not valid.',
  'tidak valid': 'not valid',
  'tumpukan kosong': 'empty stack',
  'Seluruh kurung berpasangan, tumpukan kosong.': 'All brackets are paired, the stack is empty.',
  'Tumpukan menyimpan indeks hari yang masih menunggu suhu lebih tinggi.':
    'The stack holds the indices of days still waiting for a warmer temperature.',
  'Hari ini menunggu suhu yang lebih tinggi.': 'This day is waiting for a warmer temperature.',
  'Hari yang tersisa di tumpukan tidak punya suhu lebih tinggi, nilainya tetap nol.':
    'The days left on the stack have no warmer temperature, so their values stay zero.',

  // Intervals / meeting rooms.
  'Urutkan interval berdasarkan waktu mulai.': 'Sort the intervals by start time.',
  'menghitung ruangan': 'counting rooms',
  'belum digabung': 'not merged yet',
  'rapat aktif': 'meetings active',
  'ruangan maksimum': 'maximum rooms',

  // DP.
  'Dua anak tangga pertama adalah kasus dasar.': 'The first two steps are the base case.',
  'Cara mencapai tangga 1 ada 1, tangga 2 ada 2.': 'There is 1 way to reach step 1, and 2 ways to reach step 2.',
  'kasus dasar': 'base case',
  'Dua status: ambil rumah ini, atau lewati.': 'Two states: take this house, or skip it.',
  'Status "mulai" hanya menyimpan dua nilai terakhir, jadi ruang konstan.':
    'The "start" state keeps only the last two values, so the space is constant.',
  'mulai': 'start',

  // Summaries.
  'Dua penunjuk bergerak dari kedua ujung array.': 'Two pointers move from both ends of the array.',
  'Tabel menyimpan nilai yang sudah dilewati agar pencarian menjadi konstan.':
    'A table stores the values already passed so lookups are constant.',
  'Jendela melebar dan menyempit sambil menjaga kondisi tetap valid.':
    'The window widens and narrows while keeping the condition valid.',
  'Separuh ruang pencarian dibuang setiap langkah.': 'Half the search space is discarded each step.',
  'Sel dikunjungi lapis demi lapis menggunakan antrean.': 'Cells are visited layer by layer using a queue.',
  'Tumpukan menyimpan item yang belum terselesaikan.': 'The stack holds items that are not yet resolved.',
  'Interval diurutkan lalu diproses satu lintasan.': 'Intervals are sorted, then processed in one pass.',
  'Jawaban submasalah disimpan untuk menghindari hitung ulang.':
    'Subproblem answers are stored to avoid recomputation.',
  'Visualisasi belum tersedia untuk pola ini.': 'No visualisation is available for this pattern yet.',
};
