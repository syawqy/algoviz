import { useEffect, useMemo, useState } from 'react';
import { api, type Pattern, type Problem } from './api';
import { useTranslation } from './i18n/useTranslation';

// Difficulty arrives from the API as a stable lowercase token (mudah/sedang/
// sulit) so the styling keys off a value that never changes with the language.
const DIFF_CLASS: Record<string, string> = {
  mudah: 'diff-easy',
  sedang: 'diff-mid',
  sulit: 'diff-hard',
};

export function DifficultyBadge({ value }: { value: string }) {
  const { t } = useTranslation();
  const key = String(value).toLowerCase();
  return <span className={`badge ${DIFF_CLASS[key] ?? 'diff-mid'}`}>{t(`difficulty.${key}`)}</span>;
}

export function StatusBadge({ status }: { status: string | null }) {
  const { t } = useTranslation();
  if (!status) return null;
  return (
    <span className={`badge ${status === 'selesai' ? 'status-done' : 'status-review'}`}>
      {status === 'selesai' ? t('status.done') : t('status.review')}
    </span>
  );
}

interface Props {
  onOpen: (slug: string) => void;
  onPattern: (slug: string) => void;
  loggedIn: boolean;
}

export default function Home({ onOpen, onPattern, loggedIn }: Props) {
  const { t, locale } = useTranslation();
  const [daily, setDaily] = useState<(Problem & { hint: string }) | null>(null);
  const [day, setDay] = useState<string>('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [q, setQ] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [err, setErr] = useState('');

  // Refetch when the locale changes: the API returns already-localised copy, so
  // stale responses would otherwise keep rendering the previous language.
  useEffect(() => {
    setErr('');
    api
      .daily()
      .then((d) => {
        setDaily(d.problem);
        setDay(d.day);
      })
      .catch((e) => setErr(String(e.message ?? e)));
    api
      .patterns()
      .then((d) => setPatterns(d.patterns))
      .catch(() => {});
  }, [locale]);

  useEffect(() => {
    const id = setTimeout(() => {
      api
        .problems({ q, difficulty })
        .then((d) => setProblems(d.problems))
        .catch((e) => setErr(String(e.message ?? e)));
    }, 180);
    return () => clearTimeout(id);
  }, [q, difficulty, locale]);

  // Values stay as the API tokens; only the visible labels are translated.
  const difficultyOptions = useMemo(() => ['mudah', 'sedang', 'sulit'], []);

  const localeTag = locale === 'en' ? 'en-US' : 'id-ID';
  const prettyDay = day
    ? new Date(day + 'T00:00:00').toLocaleDateString(localeTag, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="page">
      <section className="daily-card">
        <div className="daily-head">
          <span className="tag">{t('home.dailyLabel')}</span>
          {prettyDay ? <span className="daily-date">{prettyDay}</span> : null}
        </div>
        {daily ? (
          <>
            <h2>{daily.title}</h2>
            <div className="row-tight">
              <DifficultyBadge value={daily.difficulty} />
              <span className="pill">{daily.pattern_name}</span>
              <StatusBadge status={daily.status} />
            </div>
            <p className="daily-sub">{t('home.dailyNote')}</p>
            {showHint ? (
              <p className="hint-box">
                <strong>{t('problem.hintHeading')}:</strong> {daily.hint}
              </p>
            ) : null}
            <div className="row-tight">
              <button className="btn-primary" onClick={() => onOpen(daily.slug)}>
                {t('home.openVisual')}
              </button>
              <button className="btn-ghost" onClick={() => setShowHint((s) => !s)}>
                {showHint ? t('home.hideHint') : t('home.showHint')}
              </button>
            </div>
          </>
        ) : (
          <p className="muted">{err || t('home.loadingDaily')}</p>
        )}
      </section>

      <section className="block">
        <h3 className="block-title">{t('home.byPattern')}</h3>
        <p className="block-sub">{t('home.byPatternNote')}</p>
        <div className="pattern-grid">
          {patterns.map((p) => (
            <button key={p.slug} className="pattern-card" onClick={() => onPattern(p.slug)}>
              <span className="pattern-name">{p.name}</span>
              <span className="pattern-count">{t('pattern.problemCount', { count: p.problem_count })}</span>
              <span className="pattern-blurb">{p.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <h3 className="block-title">{t('home.allProblems')}</h3>
          <div className="filters">
            <input
              className="search"
              placeholder={t('home.searchPlaceholder')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label={t('home.searchPlaceholder')}
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              aria-label={t('difficulty.all')}
            >
              <option value="">{t('difficulty.all')}</option>
              {difficultyOptions.map((d) => (
                <option key={d} value={d}>
                  {t(`difficulty.${d}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {problems.length === 0 ? (
          <p className="muted">{err ? t('error.generic', { error: err }) : t('home.noMatch')}</p>
        ) : (
          <ul className="problem-list">
            {problems.map((p) => (
              <li key={p.slug}>
                <button className="problem-row" onClick={() => onOpen(p.slug)}>
                  <span className="problem-main">
                    <span className="problem-title">{p.title}</span>
                    <span className="problem-meta">
                      {p.pattern_name} · {p.time_complexity} · {p.space_complexity}
                    </span>
                  </span>
                  <span className="problem-tags">
                    <StatusBadge status={p.status} />
                    <DifficultyBadge value={p.difficulty} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {!loggedIn ? <p className="muted small">{t('progress.needLogin')}</p> : null}
      </section>
    </div>
  );
}
