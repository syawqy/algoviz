import { useTranslation } from './i18n/useTranslation';
import { LOCALE_LABELS, type Locale } from './i18n';

// Segmented toggle rather than a <select>: both options stay visible, so the
// current language and the alternative are legible at a glance, and each target
// is a full-size tap target on a phone.
export default function LanguageToggle() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div className="lang-toggle" role="group" aria-label={t('nav.language')}>
      {(Object.keys(LOCALE_LABELS) as Locale[]).map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            className={active ? 'lang-btn lang-on' : 'lang-btn'}
            aria-pressed={active}
            aria-label={t('nav.language.switchTo', { language: LOCALE_LABELS[code] })}
            onClick={() => setLocale(code)}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
