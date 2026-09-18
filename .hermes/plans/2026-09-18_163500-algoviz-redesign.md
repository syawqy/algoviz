# AlgoViz Redesign Plan

## Current State Analysis

AlgoViz sekarang menggunakan dark mode standar yang umum di educational platform:
- Background: `#0d1117` (GitHub-like dark)
- Surface: `#161b22`
- Accent: `#4f8cff` (blue)
- Font: system sans-serif stack
- Layout: card grid + flat list

**Yang bikin terlihat "standard":**
1. **Warna gelap generik** — terlihat seperti GitHub/VS Code clone
2. **Card grid flat** — pattern cards semua sama, tidak ada visual hierarchy
3. **Problem list seperti tabel** — row-based, tidak engaging
4. **Visualizer minimalis** — array boxes tanpa personality
5. **Tidak ada micro-interaction** — transisi antar halaman abrupt
6. **Font system** — system font stack, tidak distinctive
7. **Tidak ada brand identity** — tidak ada logo/mascot yang memorable

## Design Direction: "Violet Void" (Algorithmia)

Konsep: **Buku catatan algoritma yang interaktif** — gabungan aesthetic Linear (precision dark mode) + The Odin Project (educational warmth) + Notion (clean information hierarchy).

**Visual Identity (Violet Void palette — recommended by research):**
- Background: `#0a0614` (purple-tinged void)
- Surface: `#1a1428` (elevated cards)
- Surface-2: `#231c36` (interactive elements)
- Brand: `#8b5cf6` (violet — distinctive, bukan generic blue)
- Accent: `#34d399` (emerald — untuk success/algorithm found)
- Text: `#f0eef5` (warm white, bukan pure white)
- Muted: `#6b6186` (purple-tinted gray)
- Border: `rgba(255,255,255,0.08)` (semi-transparent)

**Typography:**
- Headings: Inter Variable, weight 510 (Linear's signature), letter-spacing -0.02em
- Body: Inter Variable, weight 400, letter-spacing 0.01em
- Code: JetBrains Mono, weight 400
- OpenType: `"cv01", "ss03"` globally untuk distinctive Inter
- Display: 48px-72px di hero, aggressive negative tracking

**Algorithm States:**
- `--state-idle: #6b7280` (unvisited)
- `--state-active: #8b5cf6` (currently processing)
- `--state-comparing: #f59e0b` (comparison)
- `--state-sorted: #10b981` (correctly positioned)
- `--state-swapping: #ef4444` (swap in progress)
- `--state-found: #22d3ee` (target found)

**Anti-Slop Rules (from research):**
- NO background grids/patterns (#1 AI slop indicator)
- NO scale transforms on card hover
- NO floating/bouncing loops
- NO confetti/decoration
- Max 1 glassmorphism element per page
- Card hover: border/background change, NOT scale

## Redesign Scope

### Phase 1: CSS Variables + Typography Foundation (30 min)
**Files:** `web/src/styles.css`, `web/index.html`

1. Tambah Google Fonts link: Inter Variable + JetBrains Mono
2. Update CSS custom properties ke Violet Void palette
3. Tambah OpenType features: `font-feature-settings: 'cv01', 'ss03'`
4. Update letter-spacing system: -0.03em di display, 0.01em di body
5. Update border system: semi-transparent white `rgba(255,255,255,0.05-0.12)`
6. Update shadow system: luminance-based depth (bukan dark shadows)
7. Tambah algorithm state colors
8. Tambah animation timing variables

**CSS Custom Properties (complete system):**
```css
:root {
  --bg-deep: #0a0614;
  --bg-panel: #120d1e;
  --bg-surface: #1a1428;
  --bg-hover: #231c36;
  --text-primary: #f0eef5;
  --text-secondary: #b8b2c6;
  --text-muted: #6b6186;
  --accent: #8b5cf6;
  --accent-hover: #a78bfa;
  --accent-glow: rgba(139, 92, 246, 0.2);
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #22d3ee;
  --border-1: rgba(255, 255, 255, 0.05);
  --border-2: rgba(255, 255, 255, 0.08);
  --border-3: rgba(255, 255, 255, 0.12);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 9999px;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Phase 2: Home Page Redesign (1-2 hours)
**Files:** `web/src/Home.tsx`, `web/src/styles.css`

**Daily Problem Card:**
- Hero treatment: gradient background `#8b5cf6` → `#6d28d9` dengan subtle noise texture
- Problem title: 32px Inter weight 600, letter-spacing -0.03em
- Difficulty badge: pill shape (9999px radius) dengan subtle glow
- CTAs: primary pill button (violet bg) + ghost button (border only)
- Date: smaller, muted, positioned above title

**Pattern Cards:**
- 2-column grid di mobile, 3-column di desktop
- Setiap card: subtle gradient background berbeda per pattern
- Hover: card border brighten + background lighten (NO scale transform)
- Icon/emoji per pattern: 👉 Two Pointer, 🪟 Sliding Window, 🗺️ Hash Map, 🔍 Binary Search, 📊 DP, 🌊 BFS/DFS, 📚 Stack, 🎯 Greedy
- Problem count badge: small pill dengan accent color

**Problem List:**
- Compact card grid bukan row-based
- Setiap problem: title + difficulty pill + pattern name
- Hover: border highlight + background lighten
- Staggered entrance animation (60ms delay per item)

### Phase 3: Problem Page + Split Layout (1-2 hours)
**Files:** `web/src/ProblemView.tsx`, `web/src/styles.css`

**Split View (desktop):**
- Left: Visualizer (60% width)
- Right: Explanation (40% width), sticky scroll
- Mobile: stacked, visualizer sticky di top

**Visualizer Container:**
- Glassmorphism treatment (ONLY glass element per page)
- `backdrop-filter: blur(18px) saturate(180%)`
- Semi-transparent background `rgba(255,255,255,0.06)`
- Violet left border accent

**Problem Explanation:**
- Collapsible sections: Statement, Hint, Walkthrough, Solution
- Smooth expand/collapse animation (max-height transition)
- Code blocks: JetBrains Mono, violet accent background

### Phase 4: Visualizer Canvas Upgrade (2-3 hours)
**Files:** `web/src/Visualizer.tsx`

**Step Indicators:**
- Horizontal dot indicators (●○○○○) bukan text "1 dari 6"
- Active dot: violet fill + glow
- Completed dots: emerald fill
- Clickable untuk jump ke step

**Array Visualization:**
- Rounded boxes dengan subtle gradient
- Active element: violet border + glow animation
- Comparison: amber flash
- Sorted: emerald border
- Pointer labels: animated arrows dengan smooth transitions

**Narration Card:**
- Below visualization
- Violet left border
- Smooth text transition between steps
- Main text: 16px weight 500
- Detail text: 14px weight 400, muted color

**Controls:**
- Play/Pause: large pill button dengan violet bg
- Step forward/back: smaller ghost buttons
- Speed: dropdown dengan modern styling
- All buttons: opacity transition hover (Raycast-style)

### Phase 5: Transitions + Micro-interactions (1 hour)
**Files:** `web/src/styles.css`, `web/src/App.tsx`

**Page Transitions:**
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.page { animation: fade-in 300ms var(--ease-out); }
```

**Loading States:**
- Skeleton screens dengan shimmer animation
- Bukan spinners

**Micro-interactions:**
- Button hover: opacity 0.8 (bukan color change)
- Card hover: border brighten (bukan scale)
- Focus ring: violet glow `0 0 0 2px var(--accent-glow)`
- Language toggle: smooth slide transition

### Phase 6: Mobile Optimization (1 hour)
**Files:** `web/src/styles.css`

- Breakpoints: 640px, 768px, 1024px
- Touch targets: minimum 44px
- Pattern grid: 1 column mobile, 2 tablet, 3 desktop
- Visualizer: full-width mobile, stacked layout
- Navigation: hamburger menu di mobile

### Phase 7: Deploy + Test (30 min)
- `bun test` — 76/76 pass
- `npx tsc --noEmit` — clean
- `bun run build` — successful
- Browser verify: home, pattern page, problem page, visualizer play
- Mobile responsive check (375px, 768px, 1024px)
- GitHub Pages deploy + verify

## Animation Patterns

### Card Hover (Linear-style)
```css
.card {
  border: 1px solid var(--border-1);
  transition: border-color var(--duration-normal) var(--ease-smooth),
              background-color var(--duration-normal) var(--ease-smooth);
}
.card:hover {
  border-color: var(--border-3);
  background-color: var(--bg-hover);
  /* NO transform: scale() */
}
```

### Algorithm Node Pulse
```css
@keyframes node-pulse {
  0% { box-shadow: 0 0 0 0 var(--accent-glow); }
  70% { box-shadow: 0 0 0 10px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
.node-active { animation: node-pulse 1.5s ease-in-out infinite; }
```

### Staggered Entrance
```css
.stagger-children > * {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.4s var(--ease-out), transform 0.4s var(--ease-out);
}
.stagger-children.visible > *:nth-child(1) { transition-delay: 0ms; }
.stagger-children.visible > *:nth-child(2) { transition-delay: 60ms; }
.stagger-children.visible > *:nth-child(3) { transition-delay: 120ms; }
.stagger-children.visible > * { opacity: 1; transform: translateY(0); }
```

### Button Interaction (Raycast-style)
```css
.btn {
  background: transparent;
  border: 1px solid var(--border-2);
  border-radius: var(--radius-md);
  transition: opacity var(--duration-fast) var(--ease-smooth);
}
.btn:hover { opacity: 0.8; }
.btn-primary {
  background: var(--accent);
  border-color: transparent;
  color: #ffffff;
}
```

## Design References

| Source | What to Learn |
|--------|---------------|
| Linear.app | Near-black bg, Inter 510 weight, semi-transparent borders, luminance-based depth |
| Raycast | macOS-native shadows, positive letter-spacing, opacity transitions |
| The Odin Project | Educational warmth, progress tracking UI |
| Notion | Clean information hierarchy, card layouts |
| Figma | Canvas-based visualizations |
| Brilliant.org | Interactive learning, step-by-step visualizations |

## Implementation Order

1. **CSS Variables + Typography** (30 min) — foundation
2. **Home Page** (1-2 hours) — biggest visual impact
3. **Problem Page + Layout** (1-2 hours) — split view
4. **Visualizer Redesign** (2-3 hours) — core experience
5. **Transitions + Micro-interactions** (1 hour) — polish
6. **Mobile Optimization** (1 hour) — responsive fine-tuning
7. **GitHub Pages deploy + test** (30 min)

## Estimated Total: 8-12 hours

## Risks & Tradeoffs

- **Canvas vs DOM rendering**: Canvas lebih performant untuk complex animations, tapi DOM lebih mudah di-accessibility. Untuk visualizer, gunakan canvas. Untuk UI lainnya, tetap DOM.
- **Animation performance**: Pastikan semua animations menggunakan `transform` dan `opacity` saja (GPU-accelerated), bukan `width`/`height`/`top`/`left`.
- **Bundle size**: Tambah font = lebih besar. Gunakan `font-display: swap` dan subset fonts.
- **GitHub Pages**: Static deployment harus tetap work. Semua changes hanya CSS + React components.

## Verification

1. `bun test` — 76/76 pass
2. `npx tsc --noEmit` — clean
3. `bun run build` — successful
4. Browser verify: home, pattern page, problem page, visualizer play
5. Mobile responsive check (375px, 768px, 1024px)
6. GitHub Pages deploy + verify
