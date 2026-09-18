import { useCallback, useSyncExternalStore } from 'react';
import { getLocale, subscribeLocale, setLocale, t as translate, LOCALES, type Locale } from './index';

// useSyncExternalStore is the correct primitive for an external store: it
// subscribes the component and re-renders it on every locale change, including
// changes made outside React. A plain useState + useEffect pair silently misses
// updates when the subscription is registered after the store has already
// changed, which is exactly the bug that left half the UI in the old language.
export function useTranslation() {
  const locale = useSyncExternalStore<Locale>(subscribeLocale, getLocale, getLocale);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(key, params),
    // locale is a dependency because the dictionaries swap when it changes.
    [locale],
  );

  return { t, locale, setLocale, locales: LOCALES };
}
