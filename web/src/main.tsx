import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initLocale } from './i18n';
import { id } from './i18n/id';
import { en } from './i18n/en';
import './styles.css';

// Both dictionaries are registered up front so switching language at runtime is
// a pointer swap rather than a reload. The saved locale is applied before the
// first render, so the app never flashes the wrong language on load.
initLocale({ id, en }, id);

const el = document.getElementById('root');
if (!el) throw new Error('#root not found');
createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
