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
      `Kamu punya array angka yang sudah diurut dari kecil ke besar, dan sebuah target. Tugasnya: cari dua angka yang dijumlahkan hasilnya tepat sama dengan target, lalu kembalikan posisi kedua angka itu. Tiap soal dijamin punya tepat satu jawaban, dan angka yang sama tidak boleh dipakai dua kali.`,
    hint: 'Karena array sudah urut, angka paling kecil ada di kiri dan paling besar di kanan. Kalau jumlahnya terlalu kecil, pasti harus geser yang kiri. Kalau terlalu besar, geser yang kanan. Coba pikirkan: berapa banyak kandidat yang bisa dibuang tiap langkah?',
    walkthrough:
      `Coba ini dengan angka: [2, 7, 11, 15, 19] dan target 26.

Awalnya: kiri di 2, kanan di 19. Jumlah = 21, kurang dari 26, berarti kiri harus digeser ke kanan.
Sekarang: kiri di 7, kanan di 19. Jumlah = 26. Ketemu!

Kuncinya: karena array sudah urut, kalau jumlahnya kurang, satu-satunya cara memperbesar adalah membuang angka terkecil (geser kiri). Kalau kelebihan, buang angka terbesar (geser kanan). Tiap langkah membuang tepat satu kandidat, jadi maksimal sebanyak panjang array langkah saja.`,
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
      `Tentukan apakah sebuah string terbaca sama dari depan dan belakang (palindrom). Huruf besar dan kecil dianggap sama, dan karakter selain huruf/angka (spasi, tanda baca) diabaikan.`,
    hint: 'Mulai dari kedua ujung string, lalu geser ke tengah. Kalau ada spasi atau tanda baca, lewati dulu sebelum membandingkan. Contoh: A man a plan a canal Panama - apakah palindrom?',
    walkthrough:
      `Coba dengan A man, a plan, a canal, Panama.

Tulis ulang tanpa spasi/tanda baca: amanaplanacanalpanama.

Sekarang taruh dua jari: satu di awal (a), satu di akhir (a). Cocok? Geser ke dalam.
Kedua: m dan m. Cocok. Geser lagi.
Lanjut terus sampai kedua jari bertemu di tengah. Tidak ada yang beda? Berarti palindrom.

Triknya: tidak perlu membalik seluruh string. Cukup bandingkan pasangan dari luar ke dalam. Kalau semua cocok, itu palindrom. Kalau ada satu saja yang beda, langsung berhenti.`,
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
      `Kamu punya sejumlah dinding dengan tinggi berbeda. Pilih dua dinding yang jika dipasang berhadapan, bisa menampung air paling banyak. Kembalikan volume air maksimum yang bisa ditampung.`,
    hint: 'Volume air = jarak antara dinding x tinggi dinding yang lebih pendek. Kalau kamu geser dinding yang lebih tinggi, apakah volume bisa naik? Coba pikirkan: dinding mana yang harus digeser?',
    walkthrough:
      `Misal tinggi dinding: [1, 8, 6, 2, 5, 4, 8, 3, 7].

Mulai dari ujung paling lebar: kiri=1, kanan=7. Volume = min(1,7) x 8 = 8.
Geser kiri (yang lebih pendek) ke 8. Volume = min(8,7) x 7 = 49. Lebih besar!
Geser kanan ke 3. Volume = min(8,3) x 6 = 18. Kecil.
...dst.

Logikanya: mulai dari jarak paling lebar. Tiap langkah, geser dinding yang LEBIH PENDEK, karena dinding yang lebih tinggi tidak menghalangi. Dengan begini setiap langkah aman dibuang, dan cukup satu lintasan saja.`,
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
      `Cari panjang substring terpanjang yang hurufnya tidak ada yang duplikat. Substring = potongan string yang berurutan (bisa dimana saja).`,
    hint: 'Bayangkan ada jendela yang bisa melebar ke kanan. Kalau huruf yang baru masuk sudah ada di dalam jendela, geser batas kiri sampai huruf lama keluar. Panjang jendela terbesar adalah jawabannya.',
    walkthrough:
      `Misal string: abcabcbb.

Mulai jendela kosong, geser kanan satu per satu:
a (0): jendela = a, panjang 1
b (1): jendela = ab, panjang 2
c (2): jendela = abc, panjang 3
a (3): a sudah ada! Geser kiri sampai a lama keluar. Jendela = bca, panjang 3
b (4): b sudah ada! Geser kiri. Jendela = cab, panjang 3
c (5): c sudah ada! Geser kiri. Jendela = abc, panjang 3
b (6): b sudah ada! Geser kiri. Jendela = cb, panjang 2
b (7): b sudah ada! Geser kiri. Jendela = b, panjang 1

Jawaban: 3.

Kuncinya: jendela selalu valid (tidak ada duplikat), dan tiap huruf masuk-keluar jendela tepat satu kali.`,
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
      `Diberikan array angka dan angka k. Temukan subarray berurutan dengan panjang tepat k yang rata-ratanya paling besar. Kembalikan nilai rata-ratanya.`,
    hint: 'Kalau panjang jendela tetap k, kamu tidak perlu menjumlahkan ulang semua isi jendela tiap bergeser. Cukup tambahkan yang masuk, kurangkan yang keluar.',
    walkthrough:
      `Misal array [1, 12, -5, -6, 50, 3] dan k=4.

Jendela pertama: [1, 12, -5, -6]. Jumlah = 2. Rata-rata = 0.5.
Geser kanan: keluar 1, masuk 50. Jumlah = 2 - 1 + 50 = 51. Rata-rata = 12.75.
Geser kanan lagi: keluar 12, masuk 3. Jumlah = 51 - 12 + 3 = 42. Rata-rata = 10.5.

Jawaban: 12.75.

Kuncinya: jangan menjumlahkan ulang dari awal! Cukup hitung delta: jumlah sekarang - yang keluar + yang masuk. Ini yang bikin solusinya cepat (linear, bukan kuadratik).`,
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
      `Diberikan array angka dan sebuah target. Cari dua angka yang dijumlahkan hasilnya sama dengan target, lalu kembalikan posisinya. Tiap soal punya tepat satu jawaban.`,
    hint: 'Kalau angka sekarang adalah x, maka pasangannya harus target - x. Pertanyaannya: apakah pasangan itu sudah pernah muncul sebelumnya?',
    walkthrough:
      `Misal array [3, 8, 11, 2, 7] dan target = 9.

Lihat 3: pasangannya = 9 - 3 = 6. Belum pernah muncul. Simpan 3 di buku catatan.
Lihat 8: pasangannya = 9 - 8 = 1. Belum ada. Simpan 8.
Lihat 11: pasangannya = 9 - 11 = -2. Belum ada. Simpan 11.
Lihat 2: pasangannya = 9 - 2 = 7. Belum ada. Simpan 2.
Lihat 7: pasangannya = 9 - 7 = 2. Ada! 2 ada di buku catatan. Jawaban: posisi 3 dan 4.

Kuncinya: pakai hash map (buku catatan) supaya bisa cek apakah pasangan sudah ada dalam waktu instan. Cukup satu lintasan.`,
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
      `Cek apakah ada angka yang muncul lebih dari sekali dalam array. Kalau ya, kembalikan true. Kalau semua angka unik, kembalikan false.`,
    hint: 'Kamu tidak perlu membandingkan setiap pasang angka (itu lambat). Cukup simpan angka yang sudah dilihat, lalu cek apakah angka berikutnya sudah ada di catatan.',
    walkthrough:
      `Misal array [4, 9, 2, 7, 4, 1].

Lihat 4: catatan kosong. Simpan 4.
Lihat 9: tidak ada di catatan. Simpan 9.
Lihat 2: tidak ada. Simpan 2.
Lihat 7: tidak ada. Simpan 7.
Lihat 4: ADA di catatan! Langsung jawab true.

Tidak perlu cek sisa array. Satu kali temu, langsung selesai.
Kalau semua sudah dicek dan tidak ada duplikat, jawab false.`,
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
      `Diberikan sejumlah kata. Kelompokkan kata yang merupakan anagram (huruf sama, urutan beda). Contoh: eat, tea, ate adalah anagram.`,
    hint: 'Kalau kamu urutkan huruf setiap kata, anagram akan punya bentuk yang sama persis. Misal eat jadi aet, tea juga jadi aet. Apa yang bisa dijadikan kunci pengelompokan?',
    walkthrough:
      `Misal kata-kata: [eat, tea, tan, ate, nat, bat].

Urutkan huruf setiap kata:
eat -> aet
tea -> aet
tan -> ant
ate -> aet
nat -> ant
bat -> abt

Sekarang kelompokkan berdasarkan bentuk terurut:
aet -> [eat, tea, ate]
ant -> [tan, nat]
abt -> [bat]

Kuncinya: urutan huruf yang sama = anagram. Gunakan bentuk terurut sebagai kunci di hash map, lalu masukkan kata ke kelompok yang sesuai.`,
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
      `Array sudah diurut dari kecil ke besar. Cari posisi target. Kalau ketemu, kembalikan indeksnya. Kalau tidak, kembalikan -1.`,
    hint: 'Bayangkan buku telepon: kalau kamu cari nama M, langsung buka tengah. Kalau M lebih besar dari tengah, cari di kanan. Kalau lebih kecil, cari di kiri. Berapa kali kamu bisa membagi dua?',
    walkthrough:
      `Misal array [3, 9, 14, 21, 27, 33, 41, 56, 68, 75] dan target = 41.

Langkah 1: tengah = 27. 41 > 27, cari di kanan.
Langkah 2: tengah = 56. 41 < 56, cari di kiri.
Langkah 3: tengah = 41. Ketemu! Kembalikan indeks.

Kalau target = 50:
Langkah 1: tengah = 27. Cari kanan.
Langkah 2: tengah = 56. Cari kiri.
Langkah 3: tengah = 41. Cari kanan.
Langkah 4: tengah = 68. Cari kiri.
Ruang habis. Kembalikan -1.

Kuncinya: tiap langkah membuang SETENGAH sisa pencarian. Dari 10 angka, cukup 4 langkah. Dari 1000, cukup 10 langkah.`,
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
      `Array awalnya terurut, tapi sudah diputar (rotasi) pada titik tertentu. Misal [4, 5, 6, 7, 0, 1, 2] adalah rotasi dari [0, 1, 2, 4, 5, 6, 7]. Cari target dalam array yang sudah dirotasi ini.`,
    hint: 'Setelah rotasi, selalu ada minimal satu bagian yang masih terurut (kiri atau kanan). Kalau bagian kiri terurut, kamu bisa cek: apakah target ada di rentang kiri? Kalau tidak, pasti di kanan.',
    walkthrough:
      `Misal array [27, 33, 41, 56, 68, 3, 9, 14, 21] dan target = 9.

Langkah 1: kiri=27, tengah=56. Kiri <= Tengah? Ya. Berarti kiri [27..56] terurut. Apakah 9 ada di sana? Tidak (9 < 27). Cari di kanan.
Langkah 2: kiri=3, tengah=9. Kiri <= Tengah? Ya. Apakah 9 ada di [3..9]? Ya! Cari di kiri.
Langkah 3: ketemu di indeks tengah!

Kuncinya: setiap langkah, pastikan dulu bagian mana yang terurut, lalu cek apakah target mungkin ada di bagian itu.`,
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
      `Kamu punya tangga dengan n anak tangga. Setiap langkah, kamu bisa naik 1 atau 2 anak tangga. Berapa banyak cara berbeda untuk sampai ke puncak?`,
    hint: 'Untuk sampai ke anak tangga ke-6, kamu pasti datang dari anak tangga ke-5 (langkah 1) atau ke-4 (langkah 2). Jadi: cara ke-6 = cara ke-5 + cara ke-4.',
    walkthrough:
      `Coba hitung manual untuk n = 6:
Anak tangga 1: 1 cara (langsung naik 1)
Anak tangga 2: 2 cara (1+1 atau langsung 2)
Anak tangga 3: 3 cara (1+1+1, 1+2, 2+1)

Pola: 1, 2, 3, 5, 8, 13...
Ini deret Fibonacci!

Caranya: cukup simpan dua angka terakhir.
sebelum=1, sekarang=2
Langkah 3: baru = 1+2 = 3
Langkah 4: baru = 2+3 = 5
Langkah 5: baru = 3+5 = 8
Langkah 6: baru = 5+8 = 13

Jawaban: 13 cara.
Kuncinya: tidak perlu menghitung semua kemungkinan dari awal. Cukup jumlahkan dua langkah sebelumnya.`,
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
      `Ada deretan rumah, masing-masing berisi sejumlah uang. Aturannya: kamu tidak boleh merampok dua rumah yang bersebelahan (alarm berbunyi). Hitung jumlah uang maksimum yang bisa diambil.`,
    hint: 'Di setiap rumah, kamu hanya punya dua pilihan: ambil rumah ini atau lewati. Kalau ambil, rumah sebelumnya pasti dilewati. Kalau lewati, ambil yang terbaik dari sebelumnya. Coba hitung dua nilai sekaligus di setiap langkah.',
    walkthrough:
      `Misal uang di rumah: [2, 7, 9, 3, 1].

Rumah 1 (2): ambil=2, lewati=0
Rumah 2 (7): ambil=0+7=7, lewati=max(2,0)=2
Rumah 3 (9): ambil=2+9=11, lewati=max(7,2)=7
Rumah 4 (3): ambil=7+3=10, lewati=max(11,7)=11
Rumah 5 (1): ambil=11+1=12, lewati=max(10,11)=11

Jawaban: max(12, 11) = 12. (Ambil rumah 1 + 3 + 5 = 2+9+1 = 12)

Kuncinya: di tiap rumah, hitung dua nilai: kalau ambil rumah ini dan kalau lewati. Pindah ke rumah berikutnya, dua nilai ini diperbarui.`,
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
      `Ada grid berisi 1 (tanah) dan 0 (air). Pulau = kumpulan tanah yang terhubung horizontal atau vertikal. Hitung jumlah pulau.`,
    hint: 'Setiap kali kamu menemukan 1 yang belum dikunjungi, itu awal pulau baru. Lalu tandai semua tanah yang terhubung agar tidak dihitung lagi.',
    walkthrough:
      `Misal grid:
1 1 0 0 0
1 0 0 1 1
0 0 0 1 0
0 1 0 0 0
0 1 0 1 1

Mulai dari kiri atas:
Ketemu (0,0) = 1. Pulau baru! Tandai semua yang terhubung: (0,0), (0,1), (1,0) = 3 sel.
Ketemu (1,3) = 1. Pulau baru! Tandai: (1,3), (1,4), (2,3) = 3 sel.
Ketemu (3,1) = 1. Pulau baru! Tandai: (3,1), (4,1) = 2 sel.
Ketemu (4,3) = 1. Pulau baru! Tandai: (4,3), (4,4) = 2 sel.

Jawaban: 4 pulau.

Kuncinya: scan semua sel. Kalau ketemu tanah, tambah hitungan, lalu warnai seluruh pulau supaya tidak dihitung dua kali.`,
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
      `Grid berisi 0 (bisa dilewati) dan 1 (rintangan). Mulai dari pojok kiri atas, tujuan ke pojok kanan bawah. Cari jumlah langkah paling sedikit (gerakan: atas, bawah, kiri, kanan). Kalau tidak ada jalur, kembalikan -1.`,
    hint: 'Penelusuran BFS (lapis demi lapis) selalu menemukan jalur terpendek pertama kali. Kenapa? Karena semua titik jarak 1 dikunjungi dulu, lalu jarak 2, dst.',
    walkthrough:
      `Misal grid:
0 0 0 0 0
1 1 0 1 0
0 0 0 1 0
0 1 1 1 0
0 0 0 0 0

Mulai dari (0,0). Tandai sudah dikunjungi.
Jarak 1: semua tetangga yang bisa dilewati.
Jarak 2: tetangga dari jarak 1.
...dst.
Sampai (4,4) tercapai.

Jalur terpendek: 8 langkah.

Kuncinya: dengan BFS, pertama kali kamu mencapai tujuan, itu PASTI jalur terpendek. Tidak perlu cek semua kemungkinan jalur.`,
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
      `Tentukan apakah string kurung valid. Valid artinya: setiap kurung buka harus ditutup oleh jenis yang sama, dan urutannya benar. Contoh valid: ([{}]). Contoh tidak valid: ([)].`,
    hint: 'Kalau kamu buka kurung {, kurung penutup yang cocok harus datang SETELAH semua kurung di dalamnya tertutup dulu. Struktur data apa yang cocok untuk menunggu?',
    walkthrough:
      `Misal string: ([{}]).

Baca (: tumpukan kosong. Dorong (. Tumpukan: [(]
Baca [: cocok. Dorong [. Tumpukan: [(,[]
Baca {: cocok. Dorong {. Tumpukan: [(,[,{]
Baca }: cocok dengan { di atas. Pop. Tumpukan: [(,[]
Baca ]: cocok dengan [ di atas. Pop. Tumpukan: [(]
Baca ): cocok dengan ( di atas. Pop. Tumpukan: []

Selesai, tumpukan kosong = valid!

Contoh tidak valid ([)]:
Baca (: tumpukan [(]
Baca [: tumpukan [(,[]
Baca ): harusnya cocok [, tapi nemunya ). TIDAK VALID!

Kuncinya: tumpukan selalu menyimpan kurung buka yang masih menunggu pasangannya.`,
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
      `Diberikan daftar suhu setiap hari. Untuk setiap hari, hitung: berapa hari lagi sampai ada suhu yang lebih panas? Kalau tidak ada yang lebih panas, isi 0.`,
    hint: 'Kalau suhu hari ini lebih panas dari suhu beberapa hari lalu, maka hari-hari lalu itu sudah punya jawaban. Simpan hari-hari yang masih menunggu di tumpukan.',
    walkthrough:
      `Misal suhu: [71, 69, 72, 76, 73].

Hari 0 (71): tumpukan kosong, dorong 0. Tumpukan: [0]
Hari 1 (69): 69 < 71, tidak ada yang selesai. Dorong 1. Tumpukan: [0, 1]
Hari 2 (72): 72 > 69! Hari 1 selesai: 2-1 = 1 hari lagi. Pop 1.
       72 > 71! Hari 0 selesai: 2-0 = 2 hari lagi. Pop 0.
       Dorong 2. Tumpukan: [2]
Hari 3 (76): 76 > 72! Hari 2 selesai: 3-2 = 1. Pop 2.
       Dorong 3. Tumpukan: [3]
Hari 4 (73): 73 < 76, tidak selesai. Dorong 4. Tumpukan: [3, 4]

Sisa di tumpukan [3, 4] tidak punya suhu lebih panas = 0.
Jawaban: [2, 1, 1, 0, 0]

Kuncinya: tumpukan menyimpan indeks hari yang belum menemukan suhu lebih panas. Kalau hari ini lebih panas, hari-hari di tumpukan langsung dapat jawaban.`,
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
      `Diberikan daftar interval (pasangan waktu mulai-selesai). Gabungkan semua interval yang saling tumpang tindih. Misal [1,3] dan [2,6] tumpang tindih jadi [1,6].`,
    hint: 'Kalau interval diurutkan berdasarkan waktu mulai, kamu hanya perlu membandingkan satu per satu dari kiri ke kanan. Kapan dua interval pasti tumpang tindih?',
    walkthrough:
      `Misal interval: [[1,3], [2,6], [8,10], [9,12], [15,18]].

Urutkan (sudah urut): [1,3], [2,6], [8,10], [9,12], [15,18]

Ambil [1,3] sebagai awal.
[2,6]: mulai 2 <= selesai 3? Ya! Tumpang tindih. Gabung: [1, max(3,6)] = [1,6].
[8,10]: mulai 8 <= selesai 6? Tidak. Interval baru: [8,10].
[9,12]: mulai 9 <= selesai 10? Ya! Gabung: [8, max(10,12)] = [8,12].
[15,18]: mulai 15 <= selesai 12? Tidak. Interval baru: [15,18].

Jawaban: [[1,6], [8,12], [15,18]]

Kuncinya: urutkan dulu berdasarkan awal, lalu cek satu per satu: masih tumpang tindih? Gabung. Sudah terpisah? Mulai interval baru.`,
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
      `Kamu punya daftar jadwal rapat (waktu mulai, waktu selesai). Hitung jumlah ruangan minimum yang dibutuhkan agar semua rapat bisa berjalan tanpa bentrok.`,
    hint: 'Setiap kali rapat baru mulai sebelum yang lain selesai, kamu butuh ruangan baru. Kalau sudah selesai, ruangan itu bisa dipakai ulang. Coba urutkan waktu mulai dan waktu selesai secara terpisah.',
    walkthrough:
      `Misal rapat: [[9,10], [9,11], [10,12], [11,13], [14,15]].

Urutkan waktu mulai: [9, 9, 10, 11, 14]
Urutkan waktu selesai: [10, 11, 12, 13, 15]

Mulai dengan 2 pointer:
9 < 10: rapat mulai, butuh ruangan baru. Ruangan = 1.
9 < 10: rapat mulai lagi, butuh ruangan baru. Ruangan = 2. (MAX)
10 >= 10: rapat pertama selesai. Ruangan = 1.
11 >= 11: rapat kedua selesai. Ruangan = 0.
11 < 12: rapat mulai. Ruangan = 1.
14 >= 13: rapat selesai. Ruangan = 0.
14 < 15: rapat mulai. Ruangan = 1.

Jawaban: 2 ruangan.

Kuncinya: hitung berapa banyak rapat yang aktif bersamaan di waktu tertinggi. Itu jumlah ruangan minimum.`,
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
      `Diberikan dua string: sumber dan target. Cari potongan terpendek dari sumber yang memuat semua karakter dari target (termasuk jumlah kemunculannya). Kalau tidak ada, kembalikan string kosong.`,
    hint: 'Perbesar jendela ke kanan sampai semua karakter target tercakup. Kalau sudah tercakup, coba perkecil dari kiri untuk cari yang lebih pendek. Kapan jendela boleh diperkecil?',
    walkthrough:
      `Misal sumber = ADOBECODEBANC, target = ABC.

Cari A, B, C dalam sumber:
Perbesar jendela dari kiri:
A (0): sudah ada A. Kebutuhan: A=0, B=1, C=1
D (1): bukan target.
O (2): bukan target.
B (3): sudah ada B. Kebutuhan: A=0, B=0, C=1
C (4): sudah ada C. Kebutuhan: A=0, B=0, C=0

Semua tercakup! Jendela saat ini = ADOBEC, panjang 6.
Sekarang perkecil dari kiri:
Buang A: kebutuhan A=1, jendela tidak valid. Catat panjang 6.
Mulai dari D, perbesar lagi sampai semua tercakup...
...Akhirnya jendela BANC (panjang 4) adalah yang terpendek.

Kuncinya: perbesar sampai valid, lalu perkecil sampai hampir tidak valid. Ulangi.`,
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
      `Kamu punya beberapa jenis koin (misal 1, 3, 4) dan jumlah uang tertentu. Hitung jumlah koin paling sedikit yang dibutuhkan untuk membentuk jumlah uang itu. Kalau tidak mungkin, kembalikan -1.`,
    hint: 'Untuk jumlah uang N, koin terakhir yang dipakai bisa bernilai 1, 3, atau 4. Jadi: cara minimum untuk N = 1 + minimum untuk (N - nilai koin). Coba hitung dari jumlah terkecil ke besar.',
    walkthrough:
      `Misal koin [1, 3, 4] dan target = 6.

Bangun tabel dari 0 sampai 6:
Jumlah 0: 0 koin (sudah di titik awal)
Jumlah 1: pakai koin 1. Sisa 0. Total = 1.
Jumlah 2: pakai koin 1, sisa 1 (butuh 1 lagi). Total = 2.
Jumlah 3: pakai koin 3, sisa 0. Total = 1. (Lebih baik dari 3x koin 1)
Jumlah 4: pakai koin 4, sisa 0. Total = 1.
Jumlah 5: pakai koin 1 + sisa 4 (total 2) ATAU koin 3 + sisa 2 (total 3). Ambil 2.
Jumlah 6: pakai koin 1 + sisa 5 (total 3) ATAU koin 3 + sisa 3 (total 2) ATAU koin 4 + sisa 2 (total 3). Ambil 2.

Jawaban: 2 koin (3+3).

Kuncinya: hitung dari bawah ke atas. Untuk setiap jumlah, coba semua jenis koin, ambil yang paling sedikit.`,
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
  {
    pattern: 'sliding-window',
    slug: 'rate-limiter',
    title: 'API Rate Limiter',
    difficulty: 'sedang',
    statement:
      'Kamu membangun API rate limiter. Server mencatat waktu setiap request masuk dalam satu window (misal 1 detik). Tentukan apakah request baru boleh masuk atau harus ditolak berdasarkan batas jumlah request per window.',
    hint: 'Bayangkan sebuah jendela bergerak yang mencakup N detik terakhir. Kalau jumlah request di dalam jendela masih di bawah batas, request diterima. Kalau sudah penuh, ditolak.',
    walkthrough:
      'Misal batas = 3 request per detik.\\n\\nRequest pada detik 1: window kosong. Terima.\\nRequest pada detik 1: window masih 1. Terima.\\nRequest pada detik 1: window masih 2. Terima.\\nRequest pada detik 1: window sudah 3, BATAS TERCAPAI! Tolak.\\nRequest pada detik 2: detik 1 keluar dari window. Sisa 0. Terima.\\n\\nKuncinya: setiap request yang lebih tua dari N detik dikeluarkan dari jendela.',
    solution: `from collections import deque

def is_allowed(requests, limit, window):
    queue = deque()
    for t in requests:
        while queue and queue[0] <= t - window:
            queue.popleft()
        if len(queue) < limit:
            queue.append(t)
        else:
            print(f"Request at {t}: TOLAK")`,
    solution_lang: 'python',
    visual_kind: 'sliding-window',
    visual_data: { array: [1, 1, 1, 1, 2, 2, 3, 3, 3, 4], target: 3, mode: 'fixed' },
    time_complexity: 'O(n)',
    space_complexity: 'O(k)',
    sort_order: 21,
  },
  {
    pattern: 'sliding-window',
    slug: 'uptime-tracker',
    title: 'Server Uptime Tracker',
    difficulty: 'sedang',
    statement:
      'Kamu memantau status server selama N menit. Server bisa UP (1) atau DOWN (0). Temukan durasi terpanjang server tetap aktif dengan memperbolehkan maksimum k menit downtime di dalamnya.',
    hint: 'Ini variasi sliding window: perbesar jendela ke kanan, hitung jumlah zeros (down) di dalamnya. Kalau zeros melebihi k, geser batas kiri sampai zeros kembali valid.',
    walkthrough:
      'Misal status: [1, 1, 0, 1, 1, 1, 0, 1] dan k=1.\\n\\nJendela [1,1,0] zeros=1. Panjang 3.\\nPerlebar: [1,1,0,1] zeros=1. Panjang 4.\\nPerlebar: [1,1,0,1,1] zeros=1. Panjang 5.\\nPerlebar: [1,1,0,1,1,1] zeros=1. Panjang 6.\\n\\nKuncinya: jendela selalu valid dengan maksimum k zeros.',
    solution: `def max_uptime(status, k):
    kiri = 0
    zeros = 0
    terbaik = 0
    for kanan in range(len(status)):
        if status[kanan] == 0:
            zeros += 1
        while zeros > k:
            if status[kiri] == 0:
                zeros -= 1
            kiri += 1
        terbaik = max(terbaik, kanan - kiri + 1)
    return terbaik`,
    solution_lang: 'python',
    visual_kind: 'sliding-window',
    visual_data: { array: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], target: 1, mode: 'no-repeat' },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    sort_order: 22,
  },
  {
    pattern: 'hash-map',
    slug: 'first-unique-char',
    title: 'First Unique Log Level',
    difficulty: 'mudah',
    statement:
      'Diberikan string berisi huruf-huruf (misal level log: "aabbc"). Cari indeks karakter pertama yang hanya muncul satu kali. Kalau tidak ada, kembalikan -1.',
    hint: 'Pertama, hitung berapa kali setiap huruf muncul menggunakan hash map. Lalu telusuri string dari awal: huruf pertama dengan jumlah kemunculan 1 adalah jawabannya.',
    walkthrough:
      'Misal string: "aabbcdc".\\n\\nHitung kemunculan: a=2, b=2, c=2, d=1.\\nTelusuri dari kiri: a (2 kali, skip), b (skip), c (skip), d (1 kali!).\\nJawaban: indeks 5.\\n\\nKuncinya: dua lintasan. Lintasan pertama mengisi tabel frekuensi. Lintasan kedua mencari yang frekuensinya tepat 1.',
    solution: `def karakter_unik_pertama(s):
    frekuensi = {}
    for ch in s:
        frekuensi[ch] = frekuensi.get(ch, 0) + 1
    for i, ch in enumerate(s):
        if frekuensi[ch] == 1:
            return i
    return -1`,
    solution_lang: 'python',
    visual_kind: 'hash-map',
    visual_data: { array: ['a', 'a', 'b', 'b', 'c', 'd', 'c'], target: null, mode: 'duplicate' },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    sort_order: 23,
  },
  {
    pattern: 'hash-map',
    slug: 'encoding-validator',
    title: 'Encoding Validator',
    difficulty: 'mudah',
    statement:
      'Diberikan dua string, tentukan apakah keduanya isomorf (bisa dipetakan satu-satu dari karakter pertama ke karakter kedua). Misal "egg" dan "add" isomorf karena e->a, g->d.',
    hint: 'Untuk setiap pasangan karakter di posisi yang sama, pastikan mapping-nya konsisten. Kalau e sudah dipetakan ke a, maka e tidak boleh dipetakan ke yang lain.',
    walkthrough:
      'Misal s = "egg", t = "add".\\n\\ne -> a: simpan mapping e->a.\\ng -> d: simpan mapping g->d.\\ng -> d: sudah ada mapping g->d, cocok!\\n\\nKuncinya: dua hash map dibutuhkan: satu untuk mapping s->t, satu lagi untuk t->s.',
    solution: `def is_isomorphic(s, t):
    if len(s) != len(t):
        return False
    s_ke_t = {}
    t_ke_s = {}
    for cs, ct in zip(s, t):
        if cs in s_ke_t and s_ke_t[cs] != ct:
            return False
        if ct in t_ke_s and t_ke_s[ct] != cs:
            return False
        s_ke_t[cs] = ct
        t_ke_s[ct] = cs
    return True`,
    solution_lang: 'python',
    visual_kind: 'hash-map',
    visual_data: { array: ['e', 'g', 'g', 'a', 'b', 'b'], target: null, mode: 'anagram' },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    sort_order: 24,
  },
  {
    pattern: 'binary-search',
    slug: 'peak-element',
    title: 'Peak Traffic Detector',
    difficulty: 'sedang',
    statement:
      'Kamu punya data traffic per jam dalam bentuk array. Array ini "mountain" \u2014 naik dulu lalu turun. Cari indeks peak (nilai terbesar) menggunakan binary search.',
    hint: 'Di posisi tengah, kalau elemen tengah lebih kecil dari tetangga kanannya, pasti peak ada di sebelah kanan. Kalau lebih besar dari keduanya, itu peak-nya!',
    walkthrough:
      'Misal traffic: [1, 3, 5, 7, 6, 4, 2].\\n\\nLangkah 1: tengah=3 (nilai 7). 7 > tetangga kanan (6)? Ya! 7 adalah peak.\\n\\nKuncinya: arah pencarian ditentukan oleh perbandingan dengan tetangga.',
    solution: `def cari_peak(traffic):
    kiri, kanan = 0, len(traffic) - 1
    while kiri < kanan:
        tengah = (kiri + kanan) // 2
        if traffic[tengah] < traffic[tengah + 1]:
            kiri = tengah + 1
        else:
            kanan = tengah
    return kiri`,
    solution_lang: 'python',
    visual_kind: 'binary-search',
    visual_data: { array: [1, 3, 5, 7, 6, 4, 2], target: 7, mode: 'rotated' },
    time_complexity: 'O(log n)',
    space_complexity: 'O(1)',
    sort_order: 25,
  },
  {
    pattern: 'dynamic-programming',
    slug: 'budget-optimizer',
    title: 'Budget Optimizer',
    difficulty: 'sedang',
    statement:
      'Kamu punya proyek-proyek dengan profit berbeda. Pilih proyek untuk memaksimalkan profit, tapi tidak boleh memilih dua proyek yang berdekatan (conflict of interest). Hitung profit maksimum.',
    hint: 'Di setiap proyek, kamu punya dua pilihan: ambil proyek ini atau lewati. Kalau ambil, proyek sebelumnya pasti dilewati.',
    walkthrough:
      'Misal profit: [5, 10, 8, 3, 7, 4].\\n\\nProyek 1 (5): ambil=5, lewati=0\\nProyek 2 (10): ambil=0+10=10, lewati=max(5,0)=5\\nProyek 3 (8): ambil=5+8=13, lewati=max(10,5)=10\\n...dst.\\n\\nJawaban: 20.\\n\\nKuncinya: di tiap langkah, hitung dua nilai: profit jika diambil dan jika dilewati.',
    solution: `def profit_maksimal(proyek):
    ambil, lewati = 0, 0
    for p in proyek:
        ambil, lewati = lewati + p, max(lewati, ambil)
    return max(ambil, lewati)`,
    solution_lang: 'python',
    visual_kind: 'dp-1d',
    visual_data: { array: [5, 10, 8, 3, 7, 4], mode: 'robber' },
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    sort_order: 26,
  },
  {
    pattern: 'dynamic-programming',
    slug: 'min-coin-change',
    title: 'Minimum Coins for Payment',
    difficulty: 'sedang',
    statement:
      'Kamu punya beberapa denominasi koin (misal 1, 5, 10, 25). Hitung jumlah koin paling sedikit untuk membentuk jumlah uang tertentu.',
    hint: 'Bangun tabel dari jumlah 0 ke target. Untuk setiap jumlah, coba setiap denominasi koin.',
    walkthrough:
      'Misal koin [1, 5, 10, 25] dan target = 30.\\n\\n30 = koin 25 + koin 5 = 2 koin.\\n\\nKuncinya: hitung dari bawah ke atas. Untuk setiap jumlah, coba semua denominasi.',
    solution: `def koin_minimum(denom, jumlah):
    TAK_MUNGKIN = float("inf")
    tabel = [0] + [TAK_MUNGKIN] * jumlah
    for nilai in range(1, jumlah + 1):
        for k in denom:
            if k <= nilai and tabel[nilai - k] + 1 < tabel[nilai]:
                tabel[nilai] = tabel[nilai - k] + 1
    return -1 if tabel[jumlah] == TAK_MUNGKIN else tabel[jumlah]`,
    solution_lang: 'python',
    visual_kind: 'dp-1d',
    visual_data: { coins: [1, 5, 10, 25], target: 30, mode: 'coin' },
    time_complexity: 'O(amount * len(denom))',
    space_complexity: 'O(amount)',
    sort_order: 27,
  },
  {
    pattern: 'stack',
    slug: 'min-cost-tracker',
    title: 'Min Cost Tracker',
    difficulty: 'sedang',
    statement:
      'Kamu punya log biaya operasional harian. Untuk setiap hari, tentukan berapa hari lagi sampai ada biaya yang lebih tinggi dari hari ini. Kalau tidak ada, isi 0.',
    hint: 'Gunakan stack untuk menyimpan indeks hari yang masih menunggu biaya lebih tinggi.',
    walkthrough:
      'Misal biaya: [100, 80, 120, 150, 90].\\n\\nHari 0 (100): tumpukan kosong, dorong 0.\\nHari 1 (80): 80 < 100, dorong 1.\\nHari 2 (120): 120 > 80! Hari 1 selesai: 1 hari. Pop 1.\\n       120 > 100! Hari 0 selesai: 2 hari. Pop 0.\\n...dst.\\n\\nJawaban: [2, 1, 1, 0, 0]',
    solution: `def biaya_naik(biaya):
    hasil = [0] * len(biaya)
    tumpukan = []
    for i, b in enumerate(biaya):
        while tumpukan and biaya[tumpukan[-1]] < b:
            j = tumpukan.pop()
            hasil[j] = i - j
        tumpukan.append(i)
    return hasil`,
    solution_lang: 'python',
    visual_kind: 'stack',
    visual_data: { array: [100, 80, 120, 150, 90], mode: 'next-greater', target: null },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    sort_order: 28,
  },
  {
    pattern: 'stack',
    slug: 'expression-calculator',
    title: 'Expression Calculator',
    difficulty: 'sedang',
    statement:
      'Kamu membangun kalkulator postfix (Reverse Polish Notation). Contoh: "3 4 + 2 *" = (3+4)*2 = 14.',
    hint: 'Baca token dari kiri ke kanan. Kalau angka, dorong ke tumpukan. Kalau operator, keluarkan dua angka teratas, hitung, dorong hasilnya.',
    walkthrough:
      'Ekspresi: 3 4 + 2 *\\n\\nBaca 3: dorong. [3]\\nBaca 4: dorong. [3, 4]\\nBaca +: keluarkan 4 dan 3. 3+4=7. Dorong 7. [7]\\nBaca 2: dorong. [7, 2]\\nBaca *: keluarkan 2 dan 7. 7*2=14. Dorong 14. [14]\\n\\nJawaban: 14.',
    solution: `def eval_postfix(tokens):
    tumpukan = []
    for token in tokens:
        if token in "+-*/":
            b = tumpukan.pop()
            a = tumpukan.pop()
            if token == "+": tumpukan.append(a + b)
            elif token == "-": tumpukan.append(a - b)
            elif token == "*": tumpukan.append(a * b)
            elif token == "/": tumpukan.append(int(a / b))
        else:
            tumpukan.append(int(token))
    return tumpukan[0]`,
    solution_lang: 'python',
    visual_kind: 'stack',
    visual_data: { array: ['3', '4', '+', '2', '*'], mode: 'bracket', target: null },
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    sort_order: 29,
  },
  {
    pattern: 'greedy-interval',
    slug: 'task-scheduler',
    title: 'Task Batch Scheduler',
    difficulty: 'sedang',
    statement:
      'Kamu punya daftar task dengan waktu mulai dan selesai. Gabungkan task yang tumpang tindih menjadi batch. Hitung jumlah batch minimum.',
    hint: 'Urutkan task berdasarkan waktu mulai. Kalau task berikutnya mulai sebelum task sebelumnya selesai, mereka bisa digabung.',
    walkthrough:
      'Misal task: [[1, 4], [2, 3], [5, 7], [6, 8], [9, 10]].\\n\\n[1,4] dan [2,3] overlap -> batch 1.\\n[5,7] dan [6,8] overlap -> batch 2.\\n[9,10] -> batch 3.\\n\\nJawaban: 3 batch.',
    solution: `def batch_minimum(task):
    task.sort(key=lambda x: x[0])
    hasil = []
    for mulai, selesai in task:
        if hasil and mulai <= hasil[-1][1]:
            hasil[-1][1] = max(hasil[-1][1], selesai)
        else:
            hasil.append([mulai, selesai])
    return hasil`,
    solution_lang: 'python',
    visual_kind: 'intervals',
    visual_data: { intervals: [[1, 4], [2, 3], [5, 7], [6, 8], [9, 10]] },
    time_complexity: 'O(n log n)',
    space_complexity: 'O(n)',
    sort_order: 30,
  },
];
