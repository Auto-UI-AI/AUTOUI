import { useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'theme-mode';

export const useTheme = () => {
  const getSystemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const getInitialMode = (): ThemeMode => {
    if (typeof window === 'undefined') return 'auto';
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'auto';
  };

  const [mode, setMode] = useState<ThemeMode>(getInitialMode);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(mode === 'auto' ? getSystemTheme() : mode);

  const applyTheme = useCallback((newMode: ThemeMode) => {
    const theme = newMode === 'auto' ? getSystemTheme() : newMode;

    setMode(newMode);
    setResolvedTheme(theme);
    localStorage.setItem(STORAGE_KEY, newMode);

    document.documentElement.dataset.theme = theme;
  }, []);

  useEffect(() => {
    applyTheme(mode);
  }, [mode, applyTheme]);

  useEffect(() => {
    if (mode !== 'auto') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const listener = () => {
      const systemTheme = media.matches ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
      document.documentElement.dataset.theme = systemTheme;
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [mode]);

  return {
    mode,
    theme: resolvedTheme,
    setTheme: applyTheme,
  };
};
