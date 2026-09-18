// Minimal i18n core. Deliberately hand-rolled rather than pulling in a library:
// this app has two locales and a few hundred strings, so a runtime with
// interpolation and a React hook is smaller than any dependency would be.
//
// The active locale lives in localStorage and is mirrored onto
// <html lang="...">, which keeps screen readers and the browser's own
// translation heuristics in sync with what the user sees.

export type Locale = 'id' | 'en';

import { translateTemplate } from './engine-templates';

export const LOCALES: Locale[] = ['id', 'en'];
export const LOCALE_LABELS: Record<Locale, string> = {
  id: 'Bahasa',
  en: 'English',
};

const STORAGE_KEY = 'algoviz-locale';

let current: Locale = 'id';
const listeners = new Set<(l: Locale) => void>();

// Registered dictionaries per locale. Declared before setLocale because setLocale
// reads it, and const bindings are not hoisted.
const DICTS: Partial<Record<Locale, Dict>> = {};

// Translation values may be plain strings or functions receiving named params,
// which keeps pluralisation and mid-sentence values out of string concatenation.
export type Entry = string | ((params: Record<string, string | number>) => string);
export type Dict = Record<string, Entry>;

export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'id' || saved === 'en') return saved;
  } catch {
    // Private mode or storage disabled: fall through to the default.
  }
  return 'id';
}

export function getLocale(): Locale {
  return current;
}

export function setLocale(next: Locale) {
  if (next === current) return;
  current = next;
  // Swap the dictionary before notifying subscribers, so the re-render triggered
  // by the listener already reads the new language. Without this line the UI
  // re-renders and re-runs t() but still gets the old strings back.
  if (DICTS[next]) dict = DICTS[next] as Dict;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Persisting is a convenience; the in-memory value still applies.
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next;
  }
  for (const fn of listeners) fn(next);
}

export function onLocaleChange(fn: (l: Locale) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// Subscribe contract for useSyncExternalStore: the listener receives no
// arguments, because the hook re-reads the current value via the snapshot
// getter. Kept separate from onLocaleChange, which passes the new locale.
export function subscribeLocale(onStoreChange: () => void): () => void {
  const wrapped = () => onStoreChange();
  listeners.add(wrapped);
  return () => {
    listeners.delete(wrapped);
  };
}

let dict: Dict = {};
let fallback: Dict = {};

export function registerDicts(active: Dict, base: Dict) {
  dict = active;
  fallback = base;
}

export function registerLocaleDicts(map: Record<Locale, Dict>, base: Dict) {
  for (const key of Object.keys(map) as Locale[]) DICTS[key] = map[key];
  fallback = base;
  dict = DICTS[current] ?? base;
}

export function initLocale(map: Record<Locale, Dict>, base: Dict) {
  current = detectLocale();
  registerLocaleDicts(map, base);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = current;
  }
}

// Missing keys fall back to the base dictionary, then to the key itself. A
// visible key is better than a blank screen, and it makes gaps obvious in
// review rather than silently rendering nothing.
export function t(key: string, params: Record<string, string | number> = {}): string {
  const entry = dict[key];
  if (entry !== undefined) return typeof entry === 'function' ? entry(params) : entry;
  const fb = fallback[key];
  if (fb !== undefined) return typeof fb === 'function' ? fb(params) : fb;
  return key;
}

// Engine narration is generated as Indonesian prose, so it is translated by
// matching the source string rather than by key. Unknown strings pass through,
// which keeps a new engine step readable instead of showing a placeholder.
//
// Narration that embeds values arrives as a template with the numbers already
// substituted in, so it cannot match an exact-string table. Those sentences are
// handled by the pattern rules first, then by the exact table.
export function tEngine(text: string, map: Record<string, string>): string {
  if (current === 'id') return text;
  const exact = map[text];
  if (exact !== undefined) return exact;
  return translateTemplate(text);
}
