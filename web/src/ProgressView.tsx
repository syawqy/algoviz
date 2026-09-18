import { useEffect, useState } from 'react';
import { api, type ProgressRow } from './api';
import { DifficultyBadge } from './Home';
import { useTranslation } from './i18n/useTranslation';

interface Props {
  onOpen: (slug: string) => void;
}

export default function ProgressView({ onOpen }: Props) {
  const { t, locale } = useTranslation();
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [stats, setStats] = useState({ selesai: 0, ulang: 0, total: 0, streak: 0 });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .progress()
      .then((d) => {
        setRows(d.progress as unknown as ProgressRow[]);
        setStats({ selesai: d.selesai, ulang: d.ulang, total: d.total, streak: d.streak });
      })
      .catch(() => setErr(''))
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) return <div className="page"><p className="muted">{t('progress.loading')}</p></div>;
  if (err) return <div className="page"><p className="error-box">{t('error.generic', { error: err })}</p></div>;

  const persen = stats.total ? Math.round((stats.selesai / stats.total) * 100) : 0;

  return (
    <div className="page">
      <h2 className="page-title">{t('progress.title')}</h2>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.selesai}</span>
          <span className="stat-label">{t('progress.done')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">{t('progress.total')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.ulang}</span>
          <span className="stat-label">{t('progress.review')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.streak}</span>
          <span className="stat-label">{t('progress.streak')}</span>
        </div>
      </div>

      <div className="progress-line">
        <span>
          {t('progress.percent', { percent: persen })}
        </span>
        <div className="bar">
          <span style={{ width: `${persen}%` }} />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="muted">{t('progress.empty')}</p>
      ) : (
        <ul className="problem-list">
          {rows.map((r) => (
            <li key={r.slug}>
              <button className="problem-row" onClick={() => onOpen(r.slug)}>
                <span className="problem-main">
                  <span className="problem-title">{r.title}</span>
                  <span className="problem-meta">
                    {r.pattern_name} · {String(r.updated_at).slice(0, 10)}
                  </span>
                </span>
                <span className="problem-tags">
                  <span className={`badge ${r.status === 'selesai' ? 'status-done' : 'status-review'}`}>
                    {r.status === 'selesai' ? t('status.done') : t('status.review')}
                  </span>
                  <DifficultyBadge value={r.difficulty} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
