'use client';

import { createTheme } from '@mui/material/styles';
import { WHITELABEL } from '@/config/whitelabel';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { ...WHITELABEL.colors.primary },
    secondary: { ...WHITELABEL.colors.secondary },
    success: {
      main: '#22c55e',
      light: '#4ade80',
      dark: '#16a34a',
    },
    warning: {
      main: '#facc15',
      light: '#fde047',
      dark: '#eab308',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#3b82f6',
    },
    background: { ...WHITELABEL.colors.background },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  typography: {
    fontFamily: WHITELABEL.fonts.body,
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.8125rem',
    },
    caption: {
      fontSize: '0.75rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f3a 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(30, 64, 175, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1e40af',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 44,
          height: 24,
          padding: 0,
        },
        switchBase: {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            '& + .MuiSwitch-track': {
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              opacity: 1,
            },
          },
        },
        thumb: {
          width: 20,
          height: 20,
        },
        track: {
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.1)',
          opacity: 1,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(10, 15, 28, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 15, 28, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(135deg, rgba(10, 15, 28, 0.98) 0%, rgba(26, 31, 58, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 20,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginBottom: 4,
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(30, 64, 175, 0.1) 100%)',
            border: '1px solid rgba(30, 64, 175, 0.5)',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        },
        list: {
          padding: '8px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 0',
          padding: '10px 16px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(30, 64, 175, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(30, 64, 175, 0.4)',
            },
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        },
        option: {
          borderRadius: 8,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
          '&[aria-selected="true"]': {
            backgroundColor: 'rgba(30, 64, 175, 0.3)',
          },
        },
      },
    },
  },
});

export default theme;