import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'ment2be-theme';

export const ThemeContext = createContext(null);

function applyThemeToDocument(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function getInitialTheme() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
  } catch {
    // ignore
  }

  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  return 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => getInitialTheme());
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    applyThemeToDocument(theme);

    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [theme]);

  const setTheme = useCallback((nextTheme) => {
    const normalized = nextTheme === 'light' ? 'light' : 'dark';

    // Add a short-lived transition class for smooth theme changes.
    const root = document.documentElement;
    root.classList.add('theme-transition');
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    setThemeState(normalized);
    applyThemeToDocument(normalized);

    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      // ignore
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 250);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
