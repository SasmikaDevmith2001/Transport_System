import { createTheme } from '@mui/material/styles';

/**
 * Modern, professional design system for an enterprise logistics dashboard.
 * Built as a factory so ThemeModeContext can regenerate it on dark-mode toggle.
 *
 * Palette: deep navy/indigo primary (trust, logistics/enterprise feel),
 * amber accent for highlights/CTAs, neutral slate greys for surfaces.
 */
export function buildTheme(mode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#1E3A8A',
        light: '#3B5BC4',
        dark: '#152A63',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#B45309',
        contrastText: '#1A1A1A',
      },
      success: { main: '#16A34A' },
      warning: { main: '#F59E0B' },
      error: { main: '#DC2626' },
      info: { main: '#0EA5E9' },
      background: {
        default: isDark ? '#0B0F19' : '#F4F6FA',
        paper: isDark ? '#131A2B' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#E5E9F0' : '#1A2233',
        secondary: isDark ? '#94A3B8' : '#64748B',
      },
      divider: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.08)',
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: ['"Inter"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
      h4: { fontWeight: 700, letterSpacing: -0.5 },
      h5: { fontWeight: 700, letterSpacing: -0.3 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shadows: [
      'none',
      '0px 1px 2px rgba(15,23,42,0.06)',
      '0px 2px 6px rgba(15,23,42,0.07)',
      '0px 4px 10px rgba(15,23,42,0.08)',
      ...Array(21).fill('0px 8px 24px rgba(15,23,42,0.10)'),
    ],
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, paddingInline: 16 },
          sizeMedium: { paddingTop: 8, paddingBottom: 8 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: `1px solid ${isDark ? 'rgba(148,163,184,0.10)' : 'rgba(15,23,42,0.07)'}`,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 700,
              fontSize: 12.5,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
              color: isDark ? '#94A3B8' : '#64748B',
              backgroundColor: isDark ? 'rgba(148,163,184,0.04)' : 'rgba(15,23,42,0.02)',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(148,163,184,0.05)' : 'rgba(15,23,42,0.02)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 6 },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#0D1220' : '#FFFFFF',
            borderRight: `1px solid ${isDark ? 'rgba(148,163,184,0.10)' : 'rgba(15,23,42,0.07)'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#0D1220' : '#FFFFFF',
            borderBottom: `1px solid ${isDark ? 'rgba(148,163,184,0.10)' : 'rgba(15,23,42,0.07)'}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginInline: 8,
            marginBottom: 2,
          },
        },
      },
    },
  });
}
