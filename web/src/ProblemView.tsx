import { useEffect, useState } from 'react';
import { api, type ProblemDetail } from './api';
import Visualizer from './Visualizer';
import { DifficultyBadge, StatusBadge } from './Home';
import { useTranslation } from './i18n/useTranslation';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  slug: string;
  onBack: () => void;
}

export default function ProblemView({ slug, onBack }: Props) {
  const { t, locale } = useTranslation();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [err, setErr] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    setProblem(null);
    setErr('');
    setShowSolution(false);
    api
      .problem(slug)
      .then((d) => setProblem(d.problem))
      .catch((e) => setErr(String(e.message ?? e)));
  }, [slug, locale]);

  if (err) {
    return (
      <div className="page">
        <button className="btn-ghost" onClick={onBack}>
          {t('problem.back')}
        </button>
        <p className="error-box">{t('error.generic', { error: err })}</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="page">
        <button className="btn-ghost" onClick={onBack}>
          {t('problem.back')}
        </button>
        <p className="muted">{t('problem.loading')}</p>
      </div>
    );
  }

  const langLabel: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    go: 'Go',
    sql: 'SQL',
  };

  return (
    <div className="page problem-page">
      <div className="problem-bar">
        <button className="btn-ghost" onClick={onBack}>
          ← {t('problem.back')}
        </button>
        <div className="problem-bar-main">
          <h2>{problem.title}</h2>
          <div className="row-tight">
            <DifficultyBadge value={problem.difficulty} />
            <span className="pill">{problem.pattern_name}</span>
            <StatusBadge status={problem.status} />
          </div>
        </div>
      </div>

      <div className="split">
        {/* Left: Visualizer (glassmorphism treatment) */}
        <section className="panel panel-left viz-panel">
          <Visualizer kind={problem.visual_kind} data={problem.visual_data} />
        </section>

        {/* Right: Explanation (sticky scroll on desktop) */}
        <section className="panel panel-right">
          <h3 className="panel-title">{t('problem.statementHeading')}</h3>
          <p className="statement">{problem.statement}</p>

          <div className="complexity">
            <div>
              <span className="muted small">{t('problem.timeComplexity')}</span>
              <strong>{problem.time_complexity}</strong>
            </div>
            <div>
              <span className="muted small">{t('problem.spaceComplexity')}</span>
              <strong>{problem.space_complexity}</strong>
            </div>
          </div>

          <div className="callout callout-accent">
            <h4>{t('problem.hintHeading')}</h4>
            <p>{problem.hint}</p>
          </div>

          <div className="callout">
            <h4>{t('problem.walkthroughHeading')}</h4>
            <ol className="walkthrough">
              {problem.walkthrough.split('\n').filter(Boolean).map((line, i) => (
                <li key={i}>{line.replace(/^\d+[.)]\s*/, '')}</li>
              ))}
            </ol>
          </div>

          <div className="solution-wrap">
            <button className="btn-ghost" onClick={() => setShowSolution((s) => !s)}>
              {showSolution ? (
                <><ChevronDown size={16} /> {t('problem.hideSolution')}</>
              ) : (
                <><ChevronRight size={16} /> {t('problem.showSolution')}</>
              )}
            </button>
            {showSolution ? (
              <>
                <p className="muted small">{langLabel[problem.solution_lang] ?? problem.solution_lang}</p>
                <pre className="code">
                  <code>{problem.solution}</code>
                </pre>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
