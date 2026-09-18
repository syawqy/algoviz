import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from './i18n/useTranslation';
import { tEngine } from './i18n';
import { ENGINE_EN } from './i18n/engine-en';
import { buildSteps, type Frame, type Highlight } from './visual/engine';

const STATE_CLASS: Record<Highlight, string> = {
  active: 'cell-active',
  match: 'cell-match',
  reject: 'cell-reject',
  compare: 'cell-compare',
  done: 'cell-done',
};

function cellClass(frame: Frame | undefined, index: number): string {
  const state = frame?.highlights?.[index];
  const inWindow =
    frame?.window && frame.window.kanan >= frame.window.kiri && index >= frame.window.kiri && index <= frame.window.kanan;
  return ['cell', state ? STATE_CLASS[state] : '', inWindow ? 'cell-in-window' : ''].filter(Boolean).join(' ');
}

function pointerAt(frame: Frame | undefined, index: number): string | null {
  const hit = frame?.pointers?.filter((p: { index: number; label: string }) => p.index === index).map((p: { index: number; label: string }) => p.label);
  // Pointer labels come straight from the engine as Indonesian words, so they
  // need the same render-boundary translation as the rest of its narration.
  return hit && hit.length ? hit.map((l) => tEngine(l, ENGINE_EN)).join(' / ') : null;
}

export default function Visualizer({ kind, data }: { kind: string; data: any }) {
  const { t, locale } = useTranslation();
  const step = useMemo(() => buildSteps(kind, data), [kind, JSON.stringify(data)]);
  // Engine output is Indonesian prose; translate it at the render boundary.
  const te = (s: string) => tEngine(s, ENGINE_EN);
  void locale;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const timer = useRef<number | null>(null);

  const frames = step.frames;
  const frame = frames[idx];
  const total = frames.length;

  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [kind, JSON.stringify(data)]);

  useEffect(() => {
    if (!playing) return;
    if (idx >= total - 1) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setIdx((i) => Math.min(i + 1, total - 1)), speed);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, idx, total, speed]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') {
        setPlaying(false);
        setIdx((i) => Math.min(i + 1, total - 1));
      } else if (e.key === 'ArrowLeft') {
        setPlaying(false);
        setIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  if (!total) {
    return (
      <div className="viz-empty">
        <p>{t('viz.noVisual')}</p>
        <p className="muted">{t('viz.noVisualNote')}</p>
      </div>
    );
  }

  return (
    <div className="viz">
      <div className="viz-head">
        <div>
          <p className="viz-kind">{te(step.summary)}</p>
          <p className="viz-counter">
            {t('viz.step')} <strong>{idx + 1}</strong> {t('viz.of')} {total}
          </p>
        </div>
        <div className="viz-controls">
          <button className="btn-icon" onClick={() => { setPlaying(false); setIdx(0); }} disabled={idx === 0} aria-label={t('viz.first')}>
            ⏮
          </button>
          <button className="btn-icon" onClick={() => { setPlaying(false); setIdx((i) => Math.max(i - 1, 0)); }} disabled={idx === 0} aria-label={t('viz.prev')}>
            ◀
          </button>
          <button className="btn-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t('viz.pause') : t('viz.play')}>
            {playing ? t('viz.pauseLabel') : t('viz.playLabel')}
          </button>
          <button className="btn-icon" onClick={() => { setPlaying(false); setIdx((i) => Math.min(i + 1, total - 1)); }} disabled={idx === total - 1} aria-label={t('viz.next')}>
            ▶
          </button>
          <button className="btn-icon" onClick={() => { setPlaying(false); setIdx(total - 1); }} disabled={idx === total - 1} aria-label={t('viz.last')}>
            ⏭
          </button>
        </div>
      </div>

      <input
        className="viz-scrub"
        type="range"
        min={0}
        max={Math.max(total - 1, 0)}
        value={idx}
        onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)); }}
        aria-label={t('viz.scrub')}
      />

      <div className="viz-stage">{renderStage(kind, data, frame, idx, t, te)}</div>

      <div className="viz-note" role="status" aria-live="polite">
        <p className="viz-note-main">{te(frame?.note ?? '')}</p>
        {frame?.detail ? <p className="viz-note-detail">{te(frame.detail)}</p> : null}
        {frame?.counter ? <p className="viz-note-detail">{te(frame.counter)}</p> : null}
        {frame?.extra ? (
          <dl className="viz-extra">
            {Object.entries(frame.extra).map(([k, v]) => (
              <div key={k}>
                <dt>{te(k)}</dt>
                <dd>{te(String(v))}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {frame?.answer ? (
          <p className="viz-answer">
            <span>{t('viz.status')}</span> {te(frame.answer ?? '')}
          </p>
        ) : null}
      </div>

      <div className="viz-foot">
        <div className="viz-legend">
          {step.legend.map((l: { token: string; text: string }) => (
            <span key={l.token} className="legend-item">
              <span className={`legend-swatch swatch-${l.token}`} />
              {te(l.text)}
            </span>
          ))}
        </div>
        <label className="viz-speed">
          {t('viz.speed')}
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            <option value={1600}>{t('viz.speed.slow')}</option>
            <option value={900}>{t('viz.speed.normal')}</option>
            <option value={420}>{t('viz.speed.fast')}</option>
          </select>
        </label>
      </div>
      <p className="viz-keyhint muted">
        {t('viz.keyHint')}
      </p>
    </div>
  );
}

function renderStage(
  kind: string,
  data: any,
  frame: Frame | undefined,
  idx: number,
  t: (k: string, p?: Record<string, string | number>) => string,
  te: (s: string) => string,
) {
  const arr: any[] = data.array ?? [];
  switch (kind) {
    case 'two-pointer':
    case 'sliding-window':
      return (
        <div className="row-scroll">
          <div className="row">
            {arr.map((v, i) => (
              <div key={i} className="cell-wrap">
                <span className="pointer-tag">{pointerAt(frame, i) ?? '\u00A0'}</span>
                <div className={cellClass(frame, i)}>{String(v)}</div>
                <span className="cell-idx">{i}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'hash-map':
      return (
        <>
          <div className="row-scroll">
            <div className="row">
              {arr.map((v, i) => (
                <div key={i} className="cell-wrap">
                  <span className="pointer-tag">{'\u00A0'}</span>
                  <div className={cellClass(frame, i)}>{String(v)}</div>
                  <span className="cell-idx">{i}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel-block">
            <p className="panel-block-title">{t('viz.seenTable')}</p>
            <div className="chip-row">
              {frame?.seen?.length ? (
                frame.seen.map((c: { label: string; state?: Highlight }, i: number) => (
                  <span key={i} className={c.state ? `chip ${STATE_CLASS[c.state]}` : 'chip'}>
                    {c.label}
                  </span>
                ))
              ) : (
                <span className="muted">{t('viz.stillEmpty')}</span>
              )}
            </div>
          </div>
        </>
      );
    case 'stack':
      return (
        <>
          {arr.length ? (
            <div className="row-scroll">
              <div className="row">
                {arr.map((v, i) => (
                  <div key={i} className="cell-wrap">
                    <span className="pointer-tag">{'\u00A0'}</span>
                    <div className={cellClass(frame, i)}>{String(v)}</div>
                    <span className="cell-idx">{i}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {frame?.extra?.interval ? (
            <p className="panel-note">{frame.extra.interval}</p>
          ) : null}
          <div className="panel-block">
            <p className="panel-block-title">{t('viz.stack')}</p>
            <div className="chip-row">
              {frame?.stack?.length ? (
                frame.stack.map((c: { label: string; state?: Highlight }, i: number) => (
                  <span key={i} className={c.state ? `chip ${STATE_CLASS[c.state]}` : 'chip'}>
                    {c.label}
                  </span>
                ))
              ) : (
                <span className="muted">{t('viz.emptyStack')}</span>
              )}
            </div>
          </div>
        </>
      );
    case 'binary-search':
      return (
        <div className="row-scroll">
          <div className="row">
            {arr.map((v, i) => (
              <div key={i} className="cell-wrap">
                <span className="pointer-tag">{pointerAt(frame, i) ?? '\u00A0'}</span>
                <div className={cellClass(frame, i)}>{String(v)}</div>
                <span className="cell-idx">{i}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'grid-bfs':
      return <GridStage grid={data.grid ?? []} frame={frame} />;
    case 'intervals':
      return <IntervalStage intervals={data.intervals ?? []} frame={frame} />;
    case 'dp-1d':
      return (
        <div className="panel-block">
          <p className="panel-block-title">
            {data.mode === 'coin' ? t('viz.dpCoin') : data.mode === 'robber' ? t('viz.dpRobber') : t('viz.dpTable')}
          </p>
          <div className="chip-row">
            {frame?.seen?.length ? (
              frame.seen.map((c: { label: string; state?: Highlight }, i: number) => (
                <span key={i} className={c.state ? `chip ${STATE_CLASS[c.state]}` : 'chip'}>
                  {c.label}
                </span>
              ))
            ) : (
              <span className="muted">{t('viz.noValue')}</span>
            )}
          </div>
          {idx >= 0 ? null : null}
        </div>
      );
    default:
      return <p className="muted">{t('viz.noRenderer')}</p>;
  }
}

function GridStage({ grid, frame }: { grid: Array<Array<string | number>>; frame: Frame | undefined }) {
  const kolom = grid[0]?.length ?? 0;
  return (
    <div className="grid-stage">
      {grid.map((row, r) => (
        <div className="grid-row" key={r}>
          {row.map((v, c) => {
            const i = r * kolom + c;
            return (
              <div
                key={c}
                className={`grid-cell ${cellClass(frame, i).replace('cell', 'grid-cell')} ${
                  String(v) === '1' ? 'grid-land' : String(v) === '0' ? 'grid-water' : ''
                }`}
                title={`(${r}, ${c})`}
              >
                {String(v)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function IntervalStage({
  intervals,
  frame,
}: {
  intervals: Array<[number, number]>;
  frame: Frame | undefined;
}) {
  const { t } = useTranslation();
  const maxEnd = Math.max(...intervals.map((i) => i[1]), 1);
  const minStart = Math.min(...intervals.map((i) => i[0]), 0);
  const span = maxEnd - minStart || 1;
  return (
    <div className="interval-stage">
      {intervals.map(([s, e], i) => (
        <div className="interval-row" key={i}>
          <span className="interval-label">
            [{s}, {e}]
          </span>
          <div className="interval-track">
            <div
              className="interval-bar"
              style={{ left: `${((s - minStart) / span) * 100}%`, width: `${Math.max(((e - s) / span) * 100, 3)}%` }}
            >
              <span>{e - s}</span>
            </div>
          </div>
        </div>
      ))}
      {frame?.extra?.hasil ? (
        <p className="panel-note">
          <strong>{t('viz.answerSoFar')}</strong> {frame.extra.hasil}
        </p>
      ) : null}
    </div>
  );
}
