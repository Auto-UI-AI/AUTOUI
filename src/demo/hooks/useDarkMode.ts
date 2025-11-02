import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dark mode state.
 * Persists preference in localStorage and syncs with system preference on first load.
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Fall back to system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem('darkMode', String(isDark));

    // Toggle dark class on document element
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Initialize theme on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle, setIsDark };
}

/**
 * Initialize dark mode on app load.
 * Call this in your app's entry point.
 */
export function initDarkMode() {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('darkMode');
  const isDark =
    stored !== null ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

