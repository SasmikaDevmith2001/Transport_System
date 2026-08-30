import { createTheme } from '@mui/material/styles';
import { forwardRef } from 'react';

// No-op transition to disable dialog animations
const NoTransition = forwardRef(function NoTransition({ children, in: inProp }, ref) {
  return inProp ? children : null;
});


/**
 * Navy Blue & White design system for an enterprise logistics dashboard.
 * Built as a factory so ThemeModeContext can regenerate it on dark-mode toggle.
 *
 * Palette: navy blue is the single dominant accent (brand, actions, active
 * states); white/near-white surfaces everywhere else. No secondary accent
 * color - status colors (success/warning/error/info) are used sparingly
 * for chips and alerts only.
 */
export function buildTheme(mode) {
  const isDark = mode === 'dark';

  const navy = {
    main: '#0A2F5C',
    light: '#1E4D85',
    dark: '#061D3B',
    contrastText: '#FFFFFF',
  };

  return createTheme({
    palette: {
      mode,
      primary: navy,
      secondary: navy,
      success: { main: '#16A34A' },
      warning: { main: '#D97706' },
      error: { main: '#DC2626' },
      info: { main: '#0A2F5C' },
      background: {
        default: isDark ? '#0A1220' : '#FFFFFF',
        paper: isDark ? '#0F1B2E' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#EEF2F8' : '#0F1A2B',
        secondary: isDark ? '#8FA3BF' : '#5B6B85',
      },
      divider: isDark ? 'rgba(143,163,191,0.14)' : 'rgba(10,47,92,0.12)',
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: ['"Inter Variable"', '"Inter"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
      h4: { fontWeight: 700, letterSpacing: -0.5 },
      h5: { fontWeight: 700, letterSpacing: -0.3 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12.5 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shadows: [
      'none',
      '0px 1px 2px rgba(10,47,92,0.06)',
      '0px 2px 6px rgba(10,47,92,0.08)',
      '0px 4px 10px rgba(10,47,92,0.08)',
      ...Array(21).fill('0px 8px 24px rgba(10,47,92,0.10)'),
    ],
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 6, paddingInline: 16 },
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
            borderRadius: 12,
            border: `1px solid ${isDark ? 'rgba(143,163,191,0.12)' : 'rgba(10,47,92,0.10)'}`,
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
              color: isDark ? '#8FA3BF' : '#5B6B85',
              backgroundColor: isDark ? 'rgba(143,163,191,0.04)' : 'rgba(10,47,92,0.03)',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(143,163,191,0.06)' : 'rgba(10,47,92,0.03)',
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
        defaultProps: { size: 'medium' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 6 },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#081527' : '#FFFFFF',
            borderRadius: '0 !important',
            border: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#081527' : '#FFFFFF',
            borderBottom: `1px solid ${isDark ? 'rgba(143,163,191,0.12)' : 'rgba(10,47,92,0.10)'}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            marginInline: 8,
            marginBottom: 2,
          },
        },
      },
      MuiDialog: {
        defaultProps: {
          TransitionComponent: NoTransition,
          transitionDuration: 0,
        },
        styleOverrides: {
          paper: {
            borderRadius: 14,
            border: `1px solid ${isDark ? 'rgba(148,163,184,0.10)' : 'rgba(15,23,42,0.07)'}`,
            '@media (max-width: 600px)': {
              margin: 8,
              maxHeight: 'calc(100% - 16px)',
              width: 'calc(100% - 16px)',
              maxWidth: '100%',
              borderRadius: 10,
            },
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: '1.25rem',
            paddingBottom: 8,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            paddingTop: '12px !important',
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '16px 24px',
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            transition: 'none !important',
          },
        },
      },
    },
  });
}
