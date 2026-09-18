# AlgoViz

A mobile-first web app for learning algorithm patterns through step-by-step visualisation, instead of memorising solutions.

Each problem ships with an interactive trace: press play, step forward and back, and watch the data structure change while a plain-language note explains what the step did and why.

Live demo: <https://algoviz.syawqy.my.id>

## Features

- **Interactive visualiser** for 20 problems covering 8 patterns (two pointers, sliding window, hash map, binary search, stack, interval, DP, BFS/grid).
- **Step-by-step controls** — play, pause, next/previous, jump to first/last, and a scrub slider for any step.
- **Bilingual UI (Indonesian and English)** with a toggle. Both the interface and the problem content, including the solution code and complexity notation, switch language.
- **Problem of the day** that rotates deterministically by calendar date, so it is stable for everyone within the same day.
- **Progress tracking** behind a login, so solved problems are remembered.
- Mobile-first: single column on phones, split view only from 860px and up.

## Visualisation kinds

The engine is a pure function, `buildSteps(kind, data)` to an ordered list of frames of plain data. No DOM, no timers, no side effects, which is what makes it testable.

| Kind | Used by |
| --- | --- |
| `array-two-pointer` | Two Sum II, Valid Palindrome, Container With Most Water |
| `window` | Longest Substring Without Repeating Characters, Minimum Window Substring, Maximum Average Subarray |
| `hash` | Two Sum, Contains Duplicate, Group Anagrams |
| `binary-search` | Binary Search, Search in Rotated Sorted Array |
| `stack` | Valid Parentheses, Daily Temperatures |
| `interval` | Merge Intervals, Meeting Rooms |
| `dp-1d` | Coin Change, House Robber, Climbing Stairs |
| `grid-bfs` | Number of Islands, Shortest Path in Binary Matrix |

## Tech stack

- **Bun** as runtime, package manager and test runner
- **Hono** for the HTTP API
- **bun:sqlite** for storage (WAL mode)
- **React 19** with **Vite** for the frontend

## Getting started

```bash
bun install
cp .env.example .env      # then edit AUTH_SECRET
bun run dev               # API on http://127.0.0.1:8807
```

Build the frontend and serve everything from the API:

```bash
bun run build
bun run start
```

Seed accounts come from `.env` (`SEED_LEARNER_USER` / `SEED_LEARNER_PASS`). Change them before exposing the app to the internet.

## Tests

```bash
bun test
```

The suite covers the visualisation engine, the HTTP API, auth and CSRF behaviour, progress routes, localisation, and the translation tables. Two test files are worth calling out because they generate their own fixtures rather than asserting against hand-written strings:

- `web/test/engine-i18n.test.ts` runs the real engine over every problem's `visual_kind` and `visual_data`, collects the narration it produces, and asserts that no Indonesian survives into English, that no `${...}` placeholder or `undefined`/`NaN` leaks into the output, and that numeric values are preserved by translation.
- `server/test/i18n.test.ts` walks every problem through the English API and fails if any field still contains an Indonesian identifier, which catches stored solution code and Big-O notation that the prose checks miss.

## Project layout

```
server/
  data/          problem corpus, pattern metadata, English translations
  routes/        HTTP handlers
  visual/        nothing here, the engine lives in web/
  index.ts       entry point
web/
  src/i18n/      locale store, dictionaries, engine-narration translation
  src/visual/    the pure visualisation engine
  src/           React shell, views and visualiser components
  test/          engine and translation tests
```

## Notes on the localisation

Two locales, a few hundred strings, so the i18n layer is hand-rolled rather than a dependency. Indonesian is the base dictionary and the fallback for a missing key; English mirrors the same key order.

Engine narration is generated as prose containing interpolated values, so it is translated at the render boundary, by matching the source string rather than by key. Those are mostly template literals, so the matcher works on patterns too. Unknown strings pass through unchanged, which keeps a newly added engine step readable instead of blanked out.

## License

MIT
