import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', String(isDark));

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle, setIsDark };
}

export function initDarkMode() {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('darkMode');
  const isDark = stored !== null ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
