# Plan: AlgoViz — Tambah Soal Real-World Use Case

## Goal
Menambahkan 10 soal baru yang konteksnya real-use case kerja sehari-hari developer, bukan soal LeetCode klasik. Total soal menjadi 30 (dari 20 saat ini).

## Current Context
- 20 soal existing, 8 patterns, 8 visual kinds
- Semua soal sekarang academic/classic — belum ada yang konteks kerja
- Visual engine sudah support: `two-pointer`, `sliding-window`, `hash-map`, `binary-search`, `grid-bfs`, `stack`, `intervals`, `dp-1d`
- **Semua soal baru pakai visual kind yang sudah ada** — tidak perlu ubah engine

## New Problems (10)

### Pattern: Sliding Window
| # | Slug | Judul | Konteks Kerja | Visual Kind | Difficulty |
|---|------|-------|---------------|-------------|------------|
| 1 | `rate-limiter` | API Rate Limiter | Hitung request per window, tolak jika over limit | `sliding-window` | sedang |
| 2 | `max-consecutive-ones-iii` | Server Uptime Tracker | Subarray terpanjang 1s (server up) dengan maksimum k zeros (allowed downtime) | `sliding-window` | sedang |

### Pattern: Hash Map
| # | Slug | Judul | Konteks Kerja | Visual Kind | Difficulty |
|---|------|-------|---------------|-------------|------------|
| 3 | `first-unique-character` | First Unique Log Level | Cari karakter pertama yang tidak duplikat di stream log | `hash-map` | mudah |
| 4 | `isomorphic-strings` | Encoding Validator | Cek apakah dua string punya pola mapping karakter yang sama (validasi encoding) | `hash-map` | mudah |

### Pattern: Binary Search
| # | Slug | Judul | Konteks Kerja | Visual Kind | Difficulty |
|---|------|-------|---------------|-------------|------------|
| 5 | `search-insert-position` | Autocomplete Position | Cari posisi insert di sorted list (autocomplete suggestion ranking) | `binary-search` | mudah |
| 6 | `peak-element` | Peak Traffic Detector | Cari peak di mountain array (traffic spike detection) | `binary-search` | sedang |

### Pattern: Dynamic Programming
| # | Slug | Judul | Konteks Kerja | Visual Kind | Difficulty |
|---|------|-------|---------------|-------------|------------|
| 7 | `best-time-buy-sell-stock` | Budget Optimizer | Max profit dari buy/sell (resource trading / budget optimization) | `dp-1d` | sedang |
| 8 | `longest-increasing-subsequence` | Request ID Tracker | LIS dari sequence ID (finding longest increasing request chain) | `dp-1d` | sulit |

### Pattern: Stack
| # | Slug | Judul | Konteks Kerja | Visual Kind | Difficulty |
|---|------|-------|---------------|-------------|------------|
| 9 | `min-stack` | Min Cost Tracker | Stack yang support getMin() O(1) (tracking minimum cost/latency) | `stack` | sedang |
| 10 | `eval-reverse-polish-notation` | Expression Calculator | Evaluasi expression postfix (kalkulator, eval user input) | `stack` | sedang |

## Implementation Steps

### Phase 1: Add Problem Seeds (problems.ts)
Tambahkan 10 entry baru di `server/data/problems.ts`:
- Pattern, slug, title (ID), difficulty
- Statement, hint, walkthrough (Indonesian)
- Solution (Python), solution_lang
- visual_kind, visual_data
- time_complexity, space_complexity
- sort_order: 21-30

### Phase 2: Add English Translations (content-en.ts)
Tambahkan 10 entry baru di `server/data/content-en.ts`:
- title, statement, hint, walkthrough (English)
- solution, time_complexity, space_complexity (if needed)

### Phase 3: Rebuild & Test
```bash
bun run build
bun test server/test
```

### Phase 4: Rebuild Static Data & Deploy
```bash
GITHUB_PAGES=1 bun run build
bun run scripts/build-static.ts
# push ke gh-pages branch
```

## Files to Modify
1. `server/data/problems.ts` — add 10 ProblemSeed entries
2. `server/data/content-en.ts` — add 10 ProblemTranslation entries

## Files NOT Modified (no engine changes needed)
- `web/src/visual/engine.ts` — all new problems use existing visual kinds
- `web/src/Visualizer.tsx` — generic, no changes needed
- `web/src/ProblemView.tsx` — layout already updated

## Validation
1. `bun test server/test` — all 70+ tests pass
2. Manual check: open each new problem, verify visualizer loads and steps through correctly
3. Check bilingual toggle works for all new problems
4. Build static data and verify JSON output

## Risk
- Visual data format must match what each visual kind's engine expects
- Some visual kinds may not have modes that perfectly fit the new context, but we can use existing modes (e.g., `sliding-window` mode `fixed`/`no-repeat`/`minimum`, `hash-map` mode `duplicate`/`anagram`/`two-sum`)
