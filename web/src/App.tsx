import { useEffect, useState } from 'react';
import { api } from './api';
import Home from './Home';
import ProblemView from './ProblemView';
import PatternView from './PatternView';
import ProgressView from './ProgressView';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from './i18n/useTranslation';

type Route = { name: 'home' } | { name: 'problem'; slug: string } | { name: 'pattern'; slug: string } | { name: 'progress' };

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [part, slug] = h.split('/');
  if (part === 'soal' && slug) return { name: 'problem', slug };
  if (part === 'pola' && slug) return { name: 'pattern', slug };
  if (part === 'perkembangan') return { name: 'progress' };
  return { name: 'home' };
}

function toHash(r: Route): string {
  switch (r.name) {
    case 'problem':
      return `#/soal/${r.slug}`;
    case 'pattern':
      return `#/pola/${r.slug}`;
    case 'progress':
      return '#/perkembangan';
    default:
      return '#/';
  }
}

export default function App() {
  const { t, locale } = useTranslation();
  const [route, setRoute] = useState<Route>(parseHash);
  const [session, setSession] = useState<{ username: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    // /api/auth/me answers 401 when there is no session, which is a normal
    // logged-out state rather than an error worth surfacing.
    api
      .me()
      .then((s) => setSession({ username: s.user.username }))
      .catch(() => setSession(null))
      .finally(() => setChecking(false));
  }, []);

  function go(r: Route) {
    window.location.hash = toHash(r);
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr('');
    try {
      await api.login(username, password);
      const s = await api.me();
      setSession({ username: s.user.username });
      setShowLogin(false);
      setUsername('');
      setPassword('');
    } catch {
      // The server message is an English API error string, so the user-facing
      // text comes from the dictionary instead of being passed through.
      setLoginErr(t('auth.failed'));
    }
  }

  async function doLogout() {
    await api.logout().catch(() => {});
    setSession(null);
    go({ name: 'home' });
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
          <button className={route.name === 'progress' ? 'nav-on' : ''} onClick={() => go({ name: 'progress' })}>
            {t('nav.progress')}
          </button>
        </nav>

        <div className="auth">
          <LanguageToggle />
          {checking ? (
            <span className="muted small">…</span>
          ) : session ? (
            <>
              <span className="user-chip">{session.username}</span>
              <button className="btn-ghost" onClick={doLogout}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setShowLogin(true)}>
              {t('nav.login')}
            </button>
          )}
        </div>
      </header>

      <main className="main" key={locale}>
        {route.name === 'home' ? (
          <Home
            loggedIn={!!session}
            onOpen={(slug) => go({ name: 'problem', slug })}
            onPattern={(slug) => go({ name: 'pattern', slug })}
          />
        ) : null}
        {route.name === 'problem' ? (
          <ProblemView slug={route.slug} loggedIn={!!session} onBack={() => go({ name: 'home' })} />
        ) : null}
        {route.name === 'pattern' ? (
          <PatternView slug={route.slug} onOpen={(slug) => go({ name: 'problem', slug })} onBack={() => go({ name: 'home' })} />
        ) : null}
        {route.name === 'progress' ? (
          <ProgressView loggedIn={!!session} onOpen={(slug) => go({ name: 'problem', slug })} />
        ) : null}
      </main>

      <footer className="footer">
        <span>{t('app.footer')}</span>
      </footer>

      {showLogin ? (
        <div className="modal-backdrop" onClick={() => setShowLogin(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submitLogin}>
            <h3>{t('nav.login')}</h3>
            <label>
              {t('auth.username')}
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
            </label>
            <label>
              {t('auth.password')}
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {loginErr ? <p className="error-box small">{loginErr}</p> : null}
            <div className="row-tight">
              <button className="btn-primary" type="submit">
                {t('nav.login')}
              </button>
              <button className="btn-ghost" type="button" onClick={() => setShowLogin(false)}>
                {t('auth.cancel')}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
