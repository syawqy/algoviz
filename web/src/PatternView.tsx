import { useEffect, useState } from 'react';
import { api, type Pattern, type Problem } from './api';
import { DifficultyBadge, StatusBadge } from './Home';
import { useTranslation } from './i18n/useTranslation';

interface Props {
  slug: string;
  onOpen: (slug: string) => void;
  onBack: () => void;
}

export default function PatternView({ slug, onOpen, onBack }: Props) {
  const { t, locale } = useTranslation();
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    setPattern(null);
    api
      .patterns()
      .then((d) => setPattern(d.patterns.find((p) => p.slug === slug) ?? null))
      .catch(() => {});
    api
      .problems({ pattern: slug })
      .then((d) => setProblems(d.problems))
      .catch((e) => setErr(String(e.message ?? e)));
  }, [slug, locale]);

  if (err) return <div className="page"><p className="error-box">{t('error.generic', { error: err })}</p></div>;
  if (!pattern) return <div className="page"><p className="muted">{t('pattern.loading')}</p></div>;

  const selesai = problems.filter((p) => p.status === 'selesai').length;

  return (
    <div className="page">
      <button className="btn-ghost" onClick={onBack}>
        ← {t('pattern.back')}
      </button>
      <h2 className="page-title">{pattern.name}</h2>
      <p className="block-sub">{pattern.blurb}</p>

      <div className="callout callout-accent">
        <h4>{t('pattern.recognition')}</h4>
        <p>{pattern.recognition}</p>
        <p className="muted small">
          {t('pattern.complexity')}: {pattern.complexity}
        </p>
      </div>

      <div className="progress-line">
        <span>
          {selesai} / {problems.length} {t('status.done').toLowerCase()}
        </span>
        <div className="bar">
          <span style={{ width: `${problems.length ? (selesai / problems.length) * 100 : 0}%` }} />
        </div>
      </div>

      <ul className="problem-list">
        {problems.map((p) => (
          <li key={p.slug}>
            <button className="problem-row" onClick={() => onOpen(p.slug)}>
              <span className="problem-main">
                <span className="problem-title">{p.title}</span>
                <span className="problem-meta">
                  {p.time_complexity} · {p.space_complexity}
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
    </div>
  );
}
