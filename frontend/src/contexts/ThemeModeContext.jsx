import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { buildTheme } from '../theme/theme';

const ThemeModeContext = createContext(null);

const STORAGE_KEY = 'anuradha_tms_theme_mode';

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || 'light');

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}
