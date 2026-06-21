// Entry for the self-contained single-file build (esbuild → one HTML).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './ui/theme.css';
import { initTheme } from './ui/theme';
import App from './App';
import { injectFontFaces } from './assets';

injectFontFaces();
initTheme();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
