// Problem corpus. Every entry carries its own visualizer input data so the
// client renderer stays generic: `visual_kind` picks the renderer, `visual_data`
// is the concrete input the user steps through.
export interface ProblemSeed {
  pattern: string;
  slug: string;
  title: string;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  statement: string;
  hint: string;
  walkthrough: string;
  solution: string;
  solution_lang: string;
  visual_kind: string;
  visual_data: Record<string, unknown>;
  time_complexity: string;
  space_complexity: string;
  sort_order: number;
}

export const PROBLEMS: ProblemSeed[] = [
  {
    pattern: 'two-pointer',
    slug: 'two-sum-ii',
    title: 'Two Sum II (Array Terurut)',
    difficulty: 'mudah',
    statement:
      'Diberikan array bilangan bulat yang sudah terurut menaik dan sebuah target. Kembalikan indeks dua angka yang jumlahnya sama dengan target. Setiap input punya tepat satu solusi dan satu elemen tidak boleh dipakai dua kali.',
    hint: 'Karena array terurut, jumlah terkecil ada di kiri dan terbesar di kanan. Bagaimana memanfaatkan itu untuk membuang separuh kandidat?',
    walkthrough:
      'Mulai dengan kiri di indeks 0 dan kanan di indeks terakhir. Jumlahkan keduanya. Jika jumlahnya terlalu kecil, satu-satunya cara memperbesar adalah menggeser kiri ke kanan, karena kanan sudah nilai terbesar. Jika terlalu besar, geser kanan ke kiri. Setiap langkah membuang satu kandidat secara pasti, sehingga total langkah maksimum sebanyak panjang array.',
    solution: `def two_sum_sorted(nums, target):
    kiri, kanan = 0, len(nums) - 1
    while kiri < kanan:
        jumlah = nums[kiri] + nums[kanan]
        if jumlah == target:
            return [kiri, kanan]
        if jumlah < target:
            kiri += 1
        else:
            kanan -= 1
    return []`,
    solution_lang: 'python',
    visual_kind: 'two-pointer',
    visual_data: { array: [2, 7, 11, 15, 19], target: 26, labels: ['kiri', 'kanan'] },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    sort_order: 1,
  },
  {
    pattern: 'two-pointer',
    slug: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'mudah',
    statement:
      'Diberikan sebuah string. Periksa apakah string tersebut palindrom dengan hanya mempertimbangkan huruf dan angka, lalu mengabaikan perbedaan huruf besar dan kecil.',
    hint: 'Bandingkan karakter dari kedua ujung. Karakter apa yang boleh dilewati saat bertemu?',
    walkthrough:
      'Tempatkan dua penunjuk di ujung string. Lewati karakter yang bukan huruf atau angka, lalu bandingkan. Jika berbeda, string bukan palindrom. Jika kedua penunjuk bertemu atau bersilangan, seluruh pasangan sudah cocok dan string adalah palindrom. Setiap karakter diperiksa paling banyak satu kali.',
    solution: `def is_palindrome(s):
    kiri, kanan = 0, len(s) - 1
    while kiri < kanan:
        while kiri < kanan and not s[kiri].isalnum():
            kiri += 1
        while kiri < kanan and not s[kanan].isalnum():
            kanan -= 1
        if s[kiri].lower() != s[kanan].lower():
            return False
        kiri += 1
        kanan -= 1
    return True`,
    solution_lang: 'python',
    visual_kind: 'two-pointer',
    visual_data: {
      array: ['k', 'a', 's', 'u', 'r', ' ', 'r', 'u', 's', 'a', 'k'],
      target: null,
      mode: 'palindrome',
      labels: ['kiri', 'kanan'],
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    sort_order: 2,
  },
  {
    pattern: 'two-pointer',
    slug: 'container-with-most-water',
    title: 'Container With Most Water',
    difficulty: 'sedang',
    statement:
      'Diberikan array tinggi, di mana setiap elemen adalah tinggi dinding pada posisi tersebut. Pilih dua dinding yang bersama alas membentuk penampung air terbesar. Kembalikan volume maksimumnya.',
    hint: 'Volume dibatasi dinding yang lebih pendek. Jika kita menggeser dinding yang lebih tinggi, apakah volume bisa membesar?',
    walkthrough:
      'Mulai dari kedua ujung, karena itu alas terlebar. Volume adalah alas dikali dinding terpendek. Setiap langkah, geser dinding yang lebih pendek ke dalam. Alas selalu mengecil, jadi satu-satunya harapan memperbesar volume adalah menemukan dinding yang lebih tinggi. Dengan alasan itu, setiap langkah aman dibuang dan kita hanya perlu satu lintasan.',
    solution: `def max_area(heights):
    kiri, kanan = 0, len(heights) - 1
    terbaik = 0
    while kiri < kanan:
        tinggi = min(heights[kiri], heights[kanan])
        terbaik = max(terbaik, tinggi * (kanan - kiri))
        if heights[kiri] < heights[kanan]:
            kiri += 1
        else:
            kanan -= 1
    return terbaik`,
    solution_lang: 'python',
    visual_kind: 'two-pointer',
    visual_data: {
      array: [1, 8, 6, 2, 5, 4, 8, 3, 7],
      target: null,
      mode: 'container',
      labels: ['kiri', 'kanan'],
    },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    sort_order: 3,
  },
  {
    pattern: 'sliding-window',
    slug: 'longest-substring-no-repeat',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'sedang',
    statement:
      'Diberikan sebuah string. Temukan panjang substring terpanjang yang tidak memuat karakter berulang.',
    hint: 'Saat menemukan karakter yang sudah ada di dalam jendela, apa yang harus dilakukan pada batas kiri?',
    walkthrough:
      'Lebarkan jendela ke kanan satu karakter setiap langkah. Jika karakter itu sudah berada di dalam jendela, geser batas kiri tepat melewati kemunculan sebelumnya, karena setiap jendela yang memuat karakter ganda pasti tidak valid. Catat panjang jendela terbesar sepanjang proses. Setiap indeks masuk dan keluar jendela satu kali, sehingga total kerja linear.',
    solution: `def panjang_terpanjang(s):
    posisi = {}
    kiri = 0
    terbaik = 0
    for kanan, ch in enumerate(s):
        if ch in posisi and posisi[ch] >= kiri:
            kiri = posisi[ch] + 1
        posisi[ch] = kanan
        terbaik = max(terbaik, kanan - kiri + 1)
    return terbaik`,
    solution_lang: 'python',
    visual_kind: 'sliding-window',
    visual_data: { array: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'], target: null, mode: 'no-repeat' },
    time_complexity: 'O(n)',
    space_complexity: 'O(min(n, m))',
    sort_order: 4,
  },
  {
    pattern: 'sliding-window',
    slug: 'maximum-average-subarray',
    title: 'Maximum Average Subarray',
    difficulty: 'mudah',
    statement:
      'Diberikan array bilangan bulat dan sebuah bilangan k. Temukan subarray berurutan dengan panjang tepat k yang memiliki rata-rata terbesar, lalu kembalikan nilai rata-ratanya.',
    hint: 'Saat jendela bergeser satu langkah, apakah perlu menjumlahkan ulang seluruh isi jendela?',
    walkthrough:
      'Hitung jumlah jendela pertama yang panjangnya k. Untuk setiap pergeseran, tambahkan elemen yang baru masuk dan kurangi elemen yang keluar. Karena panjang jendela tetap, jumlah maksimum langsung memberi rata-rata maksimum. Total penjumlahan yang dilakukan linear, bukan kuadratik.',
    solution: `def rata_rata_maks(nums, k):
    total = sum(nums[:k])
    terbaik = total / k
    for i in range(k, len(nums)):
        total += nums[i] - nums[i - k]
        terbaik = max(terbaik, total / k)
    return terbaik`,
    solution_lang: 'python',
    visual_kind: 'sliding-window',
    visual_data: { array: [1, 12, -5, -6, 50, 3], target: 4, mode: 'fixed' },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    sort_order: 5,
  },
  {
    pattern: 'hash-map',
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'mudah',
    statement:
      'Diberikan array bilangan bulat dan sebuah target. Kembalikan indeks dua angka yang jumlahnya sama dengan target. Setiap input punya tepat satu solusi dan satu elemen tidak boleh dipakai dua kali.',
    hint: 'Untuk setiap angka, angka pasangannya sudah bisa dihitung. Apa yang perlu diingat dari langkah sebelumnya?',
    walkthrough:
      'Karena array tidak terurut, dua penunjuk tidak berlaku. Alih-alih itu, untuk setiap angka x kita perlu tahu apakah target dikurangi x pernah muncul sebelumnya. Simpan setiap angka yang sudah dilewati beserta indeksnya di dalam hash map, lalu periksa pasangannya dalam waktu konstan. Satu lintasan sudah cukup karena pasangan selalu ditemukan saat elemen keduanya dibaca.',
    solution: `def two_sum(nums, target):
    terlihat = {}
    for i, x in enumerate(nums):
        butuh = target - x
        if butuh in terlihat:
            return [terlihat[butuh], i]
        terlihat[x] = i
    return []`,
    solution_lang: 'python',
    visual_kind: 'hash-map',
    visual_data: { array: [3, 8, 11, 2, 7], target: 9 },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    sort_order: 6,
  },
  {
    pattern: 'hash-map',
    slug: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'mudah',
    statement:
      'Diberikan array bilangan bulat. Kembalikan nilai benar jika ada nilai yang muncul lebih dari satu kali, dan salah jika semua nilai unik.',
    hint: 'Berapa banyak riwayat nilai yang perlu disimpan sebelum jawabannya pasti diketahui?',
    walkthrough:
      'Cukup catat setiap nilai yang sudah dilihat di dalam himpunan. Saat membaca sebuah nilai, periksa dulu apakah ia sudah ada di himpunan. Jika ya, jawabannya langsung benar dan tidak perlu membaca sisa array. Jika seluruh array selesai dibaca tanpa pengulangan, jawabannya salah. Pemindaian ulang tidak diperlukan sehingga waktu tetap linear.',
    solution: `def ada_duplikat(nums):
    terlihat = set()
    for x in nums:
        if x in terlihat:
            return True
        terlihat.add(x)
    return False`,
    solution_lang: 'python',
    visual_kind: 'hash-map',
    visual_data: { array: [4, 9, 2, 7, 4, 1], target: null, mode: 'duplicate' },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    sort_order: 7,
  },
  {
    pattern: 'hash-map',
    slug: 'group-anagrams',
    title: 'Group Anagrams',
    difficulty: 'sedang',
    statement:
      'Diberikan daftar string. Kelompokkan string yang merupakan anagram satu sama lain. Anagram adalah kata yang hurufnya sama tetapi urutannya berbeda.',
    hint: 'Dua anagram punya bentuk yang identik jika hurufnya diurutkan. Apa yang bisa dijadikan kunci pengelompokan?',
    walkthrough:
      'Dua kata merupakan anagram jika dan hanya jika huruf-huruf yang sama muncul dengan frekuensi yang sama. Karena itu, urutkan huruf setiap kata menjadi kunci yang stabil, lalu tempatkan kata tersebut di dalam kelompok dengan kunci itu. Setiap kata diproses sekali, sehingga waktu mengikuti jumlah total karakter.',
    solution: `from collections import defaultdict

def kelompok_anagram(kata_kata):
    kelompok = defaultdict(list)
    for kata in kata_kata:
        kunci = ''.join(sorted(kata))
        kelompok[kunci].append(kata)
    return list(kelompok.values())`,
    solution_lang: 'python',
    visual_kind: 'hash-map',
    visual_data: {
      array: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
      target: null,
      mode: 'anagram',
    },
    time_complexity: 'O(n * k log k)',
    space_complexity: 'O(n * k)',
    sort_order: 8,
  },
  {
    pattern: 'binary-search',
    slug: 'binary-search-classic',
    title: 'Binary Search Klasik',
    difficulty: 'mudah',
    statement:
      'Diberikan array bilangan bulat yang terurut menaik dan sebuah target. Jika target ditemukan, kembalikan indeksnya. Jika tidak, kembalikan nilai negatif satu.',
    hint: 'Setelah memeriksa titik tengah, bagian mana dari array yang pasti tidak berisi target?',
    walkthrough:
      'Bandingkan target dengan nilai titik tengah. Jika sama, target ditemukan. Jika target lebih besar, seluruh bagian kiri termasuk titik tengah pasti terlalu kecil sehingga ruang pencarian menjadi separuh kanan. Jika target lebih kecil, berlaku sebaliknya. Ruang pencarian terbagi dua setiap langkah, sehingga paling banyak dilakukan sebanyak logaritma jumlah elemen.',
    solution: `def cari_biner(nums, target):
    kiri, kanan = 0, len(nums) - 1
    while kiri <= kanan:
        tengah = (kiri + kanan) // 2
        if nums[tengah] == target:
            return tengah
        if nums[tengah] < target:
            kiri = tengah + 1
        else:
            kanan = tengah - 1
    return -1`,
    solution_lang: 'python',
    visual_kind: 'binary-search',
    visual_data: { array: [3, 9, 14, 21, 27, 33, 41, 56, 68, 75], target: 41 },
    time_complexity: 'O(log n)',
    space_complexity: 'O(1)',
    sort_order: 9,
  },
  {
    pattern: 'binary-search',
    slug: 'search-rotated',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'sedang',
    statement:
      'Array terurut telah diputar pada titik tertentu yang tidak diketahui. Diberikan target, kembalikan indeksnya atau nilai negatif satu jika tidak ditemukan.',
    hint: 'Setelah diputar, setidaknya satu dari dua separuh selalu terurut. Bagaimana memeriksanya dengan cepat?',
    walkthrough:
      'Bandingkan nilai paling kiri dengan nilai tengah. Jika kiri tidak lebih besar dari tengah, berarti separuh kiri terurut, sehingga target bisa diuji dengan mudah berada di dalam rentang tersebut atau tidak. Jika tidak terurut, berarti separuh kanan yang terurut dan pengujian serupa dilakukan di sana. Setiap langkah tetap membuang separuh ruang pencarian sehingga tetap logaritmik.',
    solution: `def cari_terputar(nums, target):
    kiri, kanan = 0, len(nums) - 1
    while kiri <= kanan:
        tengah = (kiri + kanan) // 2
        if nums[tengah] == target:
            return tengah
        if nums[kiri] <= nums[tengah]:
            if nums[kiri] <= target < nums[tengah]:
                kanan = tengah - 1
            else:
                kiri = tengah + 1
        else:
            if nums[tengah] < target <= nums[kanan]:
                kiri = tengah + 1
            else:
                kanan = tengah - 1
    return -1`,
    solution_lang: 'python',
    visual_kind: 'binary-search',
    visual_data: { array: [27, 33, 41, 56, 68, 3, 9, 14, 21], target: 9, mode: 'rotated' },
    time_complexity: 'O(log n)',
    space_complexity: 'O(1)',
    sort_order: 10,
  },
  {
    pattern: 'dynamic-programming',
    slug: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'mudah',
    statement:
      'Sebuah tangga memiliki n anak tangga. Setiap langkah naik bisa menempuh satu atau dua anak tangga. Berapa banyak cara berbeda untuk mencapai puncak?',
    hint: 'Untuk sampai ke anak tangga ke-n, dari anak tangga mana saja kita bisa melangkah?',
    walkthrough:
      'Cara mencapai anak tangga ke-n adalah jumlah dari cara mencapai anak tangga ke-(n-1) dan ke-(n-2), karena langkah terakhir hanya mungkin satu atau dua anak tangga. Rekursi ini memunculkan nilai yang sama berulang kali, sehingga hasil submasalah disimpan di dalam array. Perhitungan dijalankan dari bawah ke atas, dan karena hanya dua nilai terakhir yang dibutuhkan, ruang bisa dipadatkan menjadi konstan.',
    solution: `def cara_naik(n):
    if n <= 2:
        return n
    sebelum, sekarang = 1, 2
    for _ in range(3, n + 1):
        sebelum, sekarang = sekarang, sebelum + sekarang
    return sekarang`,
    solution_lang: 'python',
    visual_kind: 'dp-1d',
    visual_data: { n: 6, mode: 'stairs' },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    sort_order: 11,
  },
  {
    pattern: 'dynamic-programming',
    slug: 'house-robber',
    title: 'House Robber',
    difficulty: 'sedang',
    statement:
      'Diberikan array jumlah uang di setiap rumah yang berjajar. Perampok tidak boleh merampok dua rumah yang bersebelahan karena alarm akan berbunyi. Hitung jumlah maksimum yang bisa diambil.',
    hint: 'Di setiap rumah ada dua pilihan: ambil rumah ini atau lewati. Bagaimana menyatakan keduanya sebagai dua status?',
    walkthrough:
      'Untuk setiap rumah, hitung dua nilai: jumlah terbaik jika rumah tersebut diambil, dan jumlah terbaik jika tidak diambil. Jika rumah diambil, rumah sebelumnya harus dilewati. Jika tidak diambil, nilai terbaik sejauh ini tetap berlaku. Kedua nilai ini diperbarui berurutan sehingga hanya dua variabel diperlukan. Setiap rumah diproses satu kali.',
    solution: `def rampok(nums):
    ambil, lewati = 0, 0
    for x in nums:
        ambil, lewati = lewati + x, max(lewati, ambil)
    return max(ambil, lewati)`,
    solution_lang: 'python',
    visual_kind: 'dp-1d',
    visual_data: { array: [2, 7, 9, 3, 1], mode: 'robber' },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    sort_order: 12,
  },
  {
    pattern: 'bfs-dfs',
    slug: 'number-of-islands',
    title: 'Jumlah Pulau',
    difficulty: 'sedang',
    statement:
      'Diberikan grid dua dimensi berisi karakter satu untuk daratan dan nol untuk air. Pulau adalah kumpulan daratan yang terhubung secara horizontal atau vertikal. Hitung jumlah pulau.',
    hint: 'Setiap kali menemukan daratan yang belum pernah dikunjungi, berapa banyak pulau baru yang ditemukan?',
    walkthrough:
      'Telusuri setiap sel grid. Saat menemukan daratan yang belum dikunjungi, tambahkan penghitung pulau, lalu telusuri seluruh daratan yang terhubung dengan cara apa pun, baik menggunakan antrean untuk penelusuran lapis demi lapis maupun tumpukan untuk penelusuran mendalam. Setiap sel yang dikunjungi ditandai agar tidak dihitung dua kali. Total kerja mengikuti jumlah sel.',
    solution: `from collections import deque

def jumlah_pulau(grid):
    if not grid:
        return 0
    baris, kolom = len(grid), len(grid[0])
    jumlah = 0
    for r in range(baris):
        for c in range(kolom):
            if grid[r][c] == '1':
                jumlah += 1
                grid[r][c] = '0'
                antre = deque([(r, c)])
                while antre:
                    cr, cc = antre.popleft()
                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nr, nc = cr + dr, cc + dc
                        if 0 <= nr < baris and 0 <= nc < kolom and grid[nr][nc] == '1':
                            grid[nr][nc] = '0'
                            antre.append((nr, nc))
    return jumlah`,
    solution_lang: 'python',
    visual_kind: 'grid-bfs',
    visual_data: {
      grid: [
        ['1', '1', '0', '0', '0'],
        ['1', '0', '0', '1', '1'],
        ['0', '0', '0', '1', '0'],
        ['0', '1', '0', '0', '0'],
        ['0', '1', '0', '1', '1'],
      ],
      start: [0, 0],
    },
    time_complexity: 'O(baris * kolom)',
    space_complexity: 'O(baris * kolom)',
    sort_order: 13,
  },
  {
    pattern: 'bfs-dfs',
    slug: 'shortest-path-grid',
    title: 'Jalur Terpendek di Grid',
    difficulty: 'sedang',
    statement:
      'Diberikan grid berisi sel kosong dan rintangan, ditambah titik awal dan titik tujuan. Temukan jumlah langkah paling sedikit untuk berpindah dari awal ke tujuan dengan gerakan empat arah, atau kembalikan negatif satu jika tidak ada jalur.',
    hint: 'Strategi penelusuran mana yang menjamin jarak terpendek ditemukan lebih dulu?',
    walkthrough:
      'Penelusuran lapis demi lapis mengunjungi semua sel berjarak satu langkah, lalu dua langkah, dan seterusnya. Karena itu sel tujuan pertama kali yang dicapai pasti melalui jalur terpendek. Simpan jarak setiap sel bersamaan dengan posisinya di dalam antrean, dan tandai sel yang sudah dimasuki agar tidak diproses ulang.',
    solution: `from collections import deque

def jalur_terpendek(grid, awal, tujuan):
    baris, kolom = len(grid), len(grid[0])
    antre = deque([(awal[0], awal[1], 0)])
    terlihat = {tuple(awal)}
    while antre:
        r, c, jarak = antre.popleft()
        if [r, c] == list(tujuan):
            return jarak
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < baris and 0 <= nc < kolom and grid[nr][nc] == 0 and (nr, nc) not in terlihat:
                terlihat.add((nr, nc))
                antre.append((nr, nc, jarak + 1))
    return -1`,
    solution_lang: 'python',
    visual_kind: 'grid-bfs',
    visual_data: {
      grid: [
        [0, 0, 0, 0, 0],
        [1, 1, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ],
      start: [0, 0],
      goal: [4, 4],
      mode: 'path',
    },
    time_complexity: 'O(baris * kolom)',
    space_complexity: 'O(baris * kolom)',
    sort_order: 14,
  },
  {
    pattern: 'stack',
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'mudah',
    statement:
      'Diberikan string yang hanya berisi karakter kurung. Tentukan apakah string tersebut valid, yaitu setiap kurung buka ditutup oleh kurung dengan jenis yang sama dan dalam urutan yang benar.',
    hint: 'Kurung penutup harus berpasangan dengan kurung buka terakhir yang belum tertutup. Struktur data apa yang sesuai?',
    walkthrough:
      'Saat membaca kurung buka, dorong ke dalam tumpukan. Saat membaca kurung penutup, tumpukan harus berisi pasangan yang cocok di posisi teratas, lalu pasangan itu dikeluarkan. Jika tumpukan kosong saat kurung penutup muncul, atau jenisnya tidak cocok, string langsung tidak valid. Di akhir pemindaian, tumpukan harus kosong. Setiap karakter diproses satu kali.',
    solution: `def valid_kurung(s):
    pasangan = {')': '(', ']': '[', '}': '{'}
    tumpukan = []
    for ch in s:
        if ch in '([{':
            tumpukan.append(ch)
        else:
            if not tumpukan or tumpukan[-1] != pasangan[ch]:
                return False
            tumpukan.pop()
    return not tumpukan`,
    solution_lang: 'python',
    visual_kind: 'stack',
    visual_data: { array: ['(', '[', '{', '}', ']', ')'], mode: 'bracket', target: null },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    sort_order: 15,
  },
  {
    pattern: 'stack',
    slug: 'daily-temperatures',
    title: 'Suhu Harian',
    difficulty: 'sedang',
    statement:
      'Diberikan daftar suhu harian. Untuk setiap hari, hitung berapa hari lagi sampai muncul suhu yang lebih tinggi. Jika tidak ada, isi dengan nol.',
    hint: 'Simpan hari-hari yang belum menemukan suhu lebih tinggi. Kapan sebuah hari bisa diselesaikan?',
    walkthrough:
      'Telusuri suhu dari kiri ke kanan dan simpan indeks hari yang masih menunggu di dalam tumpukan, dengan suhu yang menurun dari bawah ke atas. Saat suhu hari ini lebih tinggi daripada suhu pada indeks teratas, hari itu sudah menemukan jawabannya, yaitu selisih indeks. Keluarkan dan ulangi selama kondisi masih terpenuhi, lalu dorong indeks hari ini. Setiap indeks masuk dan keluar tumpukan satu kali sehingga total kerja linear.',
    solution: `def suhu_lebih_tinggi(suhu):
    hasil = [0] * len(suhu)
    tumpukan = []
    for i, t in enumerate(suhu):
        while tumpukan and suhu[tumpukan[-1]] < t:
            j = tumpukan.pop()
            hasil[j] = i - j
        tumpukan.append(i)
    return hasil`,
    solution_lang: 'python',
    visual_kind: 'stack',
    visual_data: { array: [31, 27, 34, 29, 33, 36], mode: 'next-greater', target: null },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    sort_order: 16,
  },
  {
    pattern: 'greedy-interval',
    slug: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'sedang',
    statement:
      'Diberikan daftar interval. Gabungkan semua interval yang saling tumpang tindih dan kembalikan daftar interval yang tidak tumpang tindih.',
    hint: 'Jika daftar diurutkan berdasarkan titik awal, kapan dua interval pasti tumpang tindih?',
    walkthrough:
      'Urutkan interval berdasarkan titik awal. Setelah itu interval yang tumpang tindih selalu berdekatan, sehingga cukup satu lintasan. Bandingkan titik awal interval berikutnya dengan titik akhir interval terakhir yang sudah digabungkan. Jika tidak melebihi, keduanya tumpang tindih dan titik akhir diperpanjang bila perlu. Jika melebihi, interval baru dimulai. Dominasi waktu ada pada pengurutan.',
    solution: `def gabung_interval(interval):
    interval.sort(key=lambda x: x[0])
    hasil = []
    for mulai, selesai in interval:
        if hasil and mulai <= hasil[-1][1]:
            hasil[-1][1] = max(hasil[-1][1], selesai)
        else:
            hasil.append([mulai, selesai])
    return hasil`,
    solution_lang: 'python',
    visual_kind: 'intervals',
    visual_data: {
      intervals: [
        [1, 3],
        [2, 6],
        [8, 10],
        [9, 12],
        [15, 18],
      ],
    },
    time_complexity: 'O(n log n)',
    space_complexity: 'O(n)',
    sort_order: 17,
  },
  {
    pattern: 'greedy-interval',
    slug: 'meeting-rooms',
    title: 'Ruangan Rapat Minimum',
    difficulty: 'sedang',
    statement:
      'Diberikan daftar jadwal rapat berupa waktu mulai dan selesai. Hitung jumlah ruangan paling sedikit yang dibutuhkan agar semua rapat dapat berlangsung.',
    hint: 'Ruangan hanya bisa dipakai ulang jika rapat sebelumnya sudah selesai. Kapan sebuah ruangan boleh dibebaskan?',
    walkthrough:
      'Urutkan waktu mulai dan waktu selesai secara terpisah, lalu jalankan dua penunjuk. Saat waktu mulai berikutnya lebih kecil daripada waktu selesai paling awal yang masih aktif, sebuah ruangan baru dibutuhkan. Jika tidak, ruangan yang paling awal selesai bisa langsung dipakai ulang. Penghitung maksimum selama proses adalah jawaban. Pengurutan mendominasi waktu.',
    solution: `def ruangan_minimum(jadwal):
    mulai = sorted(j[0] for j in jadwal)
    selesai = sorted(j[1] for j in jadwal)
    i = j = 0
    ruangan = terbaik = 0
    while i < len(jadwal):
        if mulai[i] < selesai[j]:
            ruangan += 1
            terbaik = max(terbaik, ruangan)
            i += 1
        else:
            ruangan -= 1
            j += 1
    return terbaik`,
    solution_lang: 'python',
    visual_kind: 'intervals',
    visual_data: {
      intervals: [
        [9, 10],
        [9, 11],
        [10, 12],
        [11, 13],
        [14, 15],
      ],
      mode: 'rooms',
    },
    time_complexity: 'O(n log n)',
    space_complexity: 'O(n)',
    sort_order: 18,
  },
  {
    pattern: 'sliding-window',
    slug: 'min-window-substring',
    title: 'Minimum Window Substring',
    difficulty: 'sulit',
    statement:
      'Diberikan string sumber dan string target. Temukan potongan terpendek dari sumber yang memuat semua karakter target beserta jumlah kemunculannya. Jika tidak ada, kembalikan string kosong.',
    hint: 'Jendela sudah valid ketika semua kebutuhan terpenuhi. Setelah valid, apa gunanya menggeser batas kiri?',
    walkthrough:
      'Lebarkan batas kanan sambil melacak kebutuhan setiap karakter. Ketika semua kebutuhan terpenuhi, jendela dinyatakan valid. Selama masih valid, catat panjangnya bila lebih pendek dari yang terbaik, lalu geser batas kiri untuk mencari jendela yang lebih rapat. Proses ini berulang sampai batas kanan mencapai akhir string. Setiap karakter masuk dan keluar jendela satu kali.',
    solution: `from collections import Counter

def jendela_minimum(sumber, target):
    butuh = Counter(target)
    kurang = len(target)
    kiri = terbaik_kiri = terbaik_panjang = 0
    terbaik_panjang = len(sumber) + 1
    for kanan, ch in enumerate(sumber):
        if butuh[ch] > 0:
            kurang -= 1
        butuh[ch] -= 1
        while kurang == 0:
            if kanan - kiri + 1 < terbaik_panjang:
                terbaik_panjang = kanan - kiri + 1
                terbaik_kiri = kiri
            if butuh[sumber[kiri]] == 0:
                kurang += 1
            butuh[sumber[kiri]] += 1
            kiri += 1
    if terbaik_panjang > len(sumber):
        return ''
    return sumber[terbaik_kiri:terbaik_kiri + terbaik_panjang]`,
    solution_lang: 'python',
    visual_kind: 'sliding-window',
    visual_data: {
      array: ['a', 'd', 'o', 'b', 'e', 'c', 'o', 'd', 'e', 'b', 'a', 'n', 'c'],
      target: 'abc',
      mode: 'minimum',
    },
    time_complexity: 'O(n + m)',
    space_complexity: 'O(m)',
    sort_order: 19,
  },
  {
    pattern: 'dynamic-programming',
    slug: 'coin-change',
    title: 'Coin Change',
    difficulty: 'sedang',
    statement:
      'Diberikan daftar nilai koin dan sebuah jumlah uang. Kembalikan jumlah koin paling sedikit untuk membentuk jumlah tersebut, atau negatif satu jika tidak mungkin.',
    hint: 'Untuk setiap jumlah, koin terakhir yang dipakai bisa berasal dari nilai koin mana saja. Berapa nilai terbaik sebelumnya?',
    walkthrough:
      'Bangun tabel di mana setiap sel menyatakan jumlah koin minimum untuk membentuk sejumlah uang. Untuk setiap jumlah dari satu sampai target, coba setiap nilai koin sebagai koin terakhir, lalu ambil nilai terbaik dari jumlah yang tersisa. Nilai awal diisi dengan penanda tak terhingga agar kombinasi yang tidak mungkin tidak dianggap sah. Jawaban ada di sel terakhir.',
    solution: `def koin_minimum(koin, jumlah):
    TAK_MUNGKIN = float('inf')
    tabel = [0] + [TAK_MUNGKIN] * jumlah
    for nilai in range(1, jumlah + 1):
        for k in koin:
            if k <= nilai and tabel[nilai - k] + 1 < tabel[nilai]:
                tabel[nilai] = tabel[nilai - k] + 1
    return -1 if tabel[jumlah] == TAK_MUNGKIN else tabel[jumlah]`,
    solution_lang: 'python',
    visual_kind: 'dp-1d',
    visual_data: { coins: [1, 3, 4], target: 6, mode: 'coin' },
    time_complexity: 'O(jumlah * len(koin))',
    space_complexity: 'O(jumlah)',
    sort_order: 20,
  },
];
