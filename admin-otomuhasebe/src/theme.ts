import { createTheme, alpha } from '@mui/material/styles';

// Helper function to get CSS variable value
const getCSSVar = (varName: string) => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }
  return '';
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(216, 121, 67)', // --primary
      light: 'rgb(231, 138, 83)',
      dark: 'rgb(200, 105, 50)',
      contrastText: 'rgb(255, 255, 255)', // --primary-foreground
    },
    secondary: {
      main: 'rgb(82, 117, 117)', // --secondary
      light: 'rgb(95, 135, 135)',
      dark: 'rgb(70, 100, 100)',
      contrastText: 'rgb(255, 255, 255)', // --secondary-foreground
    },
    error: {
      main: 'rgb(239, 68, 68)', // --destructive
      light: 'rgb(248, 113, 113)',
      dark: 'rgb(220, 38, 38)',
      contrastText: 'rgb(250, 250, 250)', // --destructive-foreground
    },
    warning: {
      main: 'rgb(245, 158, 11)',
      light: 'rgb(251, 191, 36)',
      dark: 'rgb(217, 119, 6)',
    },
    info: {
      main: 'rgb(59, 130, 246)',
      light: 'rgb(96, 165, 250)',
      dark: 'rgb(37, 99, 235)',
    },
    success: {
      main: 'rgb(16, 185, 129)',
      light: 'rgb(52, 211, 153)',
      dark: 'rgb(5, 150, 105)',
    },
    background: {
      default: 'rgb(255, 255, 255)', // --background
      paper: 'rgb(255, 255, 255)', // --card
    },
    text: {
      primary: 'rgb(17, 24, 39)', // --foreground
      secondary: 'rgb(107, 114, 128)', // --muted-foreground
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: [
      'AR One Sans',
      'ui-sans-serif',
      'sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // 0.75rem = 12px from CSS --radius
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(216, 121, 67, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, rgb(216, 121, 67) 0%, rgb(231, 138, 83) 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, rgb(200, 105, 50) 0%, rgb(220, 125, 70) 100%)',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgb(216, 121, 67)',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
                borderColor: 'rgb(216, 121, 67)',
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.8125rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9375rem',
          minHeight: 48,
          '&.Mui-selected': {
            color: 'rgb(216, 121, 67)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgb(231, 138, 83)', // --primary in dark mode
      light: 'rgb(251, 203, 151)',
      dark: 'rgb(220, 125, 70)',
      contrastText: 'rgb(18, 17, 19)', // --primary-foreground in dark mode
    },
    secondary: {
      main: 'rgb(95, 135, 135)', // --secondary in dark mode
      light: 'rgb(110, 150, 150)',
      dark: 'rgb(80, 120, 120)',
      contrastText: 'rgb(18, 17, 19)', // --secondary-foreground in dark mode
    },
    error: {
      main: 'rgb(95, 135, 135)', // --destructive in dark mode
      light: 'rgb(110, 150, 150)',
      dark: 'rgb(80, 120, 120)',
      contrastText: 'rgb(18, 17, 19)', // --destructive-foreground in dark mode
    },
    background: {
      default: 'rgb(18, 17, 19)', // --background in dark mode
      paper: 'rgb(18, 18, 18)', // --card in dark mode
    },
    text: {
      primary: 'rgb(193, 193, 193)', // --foreground in dark mode
      secondary: 'rgb(136, 136, 136)', // --muted-foreground in dark mode
    },
  },
});
