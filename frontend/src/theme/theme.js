import { createTheme } from '@mui/material/styles';

/**
 * Builds an MUI theme for the given mode. Kept as a factory so
 * ThemeModeContext can regenerate it whenever the user toggles dark mode.
 */
export function buildTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#0B5FFF',
      },
      secondary: {
        main: '#FF7A00',
      },
      background: {
        default: mode === 'dark' ? '#0F1115' : '#F5F7FA',
        paper: mode === 'dark' ? '#161A22' : '#FFFFFF',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
    },
  });
}
