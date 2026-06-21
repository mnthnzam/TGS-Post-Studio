import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
const KEY = 'tgs.theme';

export function initTheme(): void {
  const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) as Theme | null;
  document.documentElement.dataset.theme = saved ?? 'dark';
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme as Theme) || 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}
