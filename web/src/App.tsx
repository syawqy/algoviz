import { useEffect, useState } from 'react';
import { api } from './api';
import Home from './Home';
import ProblemView from './ProblemView';
import PatternView from './PatternView';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from './i18n/useTranslation';

type Route = { name: 'home' } | { name: 'problem'; slug: string } | { name: 'pattern'; slug: string };

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [part, slug] = h.split('/');
  if (part === 'soal' && slug) return { name: 'problem', slug };
  if (part === 'pola' && slug) return { name: 'pattern', slug };
  return { name: 'home' };
}

function toHash(r: Route): string {
  switch (r.name) {
    case 'problem':
      return `#/soal/${r.slug}`;
    case 'pattern':
      return `#/pola/${r.slug}`;
    default:
      return '#/';
  }
}

export default function App() {
  const { t, locale } = useTranslation();
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function go(r: Route) {
    window.location.hash = toHash(r);
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => go({ name: 'home' })}>
          <span className="brand-mark">A</span>
          <span className="brand-text">
            <strong>AlgoViz</strong>
            <small>{t('app.tagline')}</small>
          </span>
        </button>

        <nav className="nav">
          <button className={route.name === 'home' ? 'nav-on' : ''} onClick={() => go({ name: 'home' })}>
            {t('nav.home')}
          </button>
        </nav>

        <div className="auth">
          <LanguageToggle />
        </div>
      </header>

      <main className="main" key={locale}>
        {route.name === 'home' ? (
          <Home
            onOpen={(slug) => go({ name: 'problem', slug })}
            onPattern={(slug) => go({ name: 'pattern', slug })}
          />
        ) : null}
        {route.name === 'problem' ? (
          <ProblemView slug={route.slug} onBack={() => go({ name: 'home' })} />
        ) : null}
        {route.name === 'pattern' ? (
          <PatternView slug={route.slug} onOpen={(slug) => go({ name: 'problem', slug })} onBack={() => go({ name: 'home' })} />
        ) : null}
      </main>

      <footer className="footer">
        <span>{t('app.footer')}</span>
      </footer>
    </div>
  );
}
