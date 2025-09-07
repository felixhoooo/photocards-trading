
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E91E63', // Strong Pink
    },
    secondary: {
      main: '#F8BBD0', // Light Pink
    },
    background: {
      default: '#FCE4EC', // Very Light Pink
      paper: '#FFFFFF',   // White
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '3rem',
    },
    h3: {
        fontWeight: 700,
        fontSize: '2.5rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23F48FB1' fill-opacity='0.4'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
        }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0px 15px 25px rgba(0, 0, 0, 0.15), 0px 5px 10px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          }
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '999px',
          padding: '10px 24px',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)'
        },
        containedPrimary: {
            background: '#E91E63',
            color: 'white',
            '&:hover': {
                background: '#C2185B',
                boxShadow: '0px 8px 20px rgba(248, 187, 208, 0.5)',
            }
        }
      },
    },
  },
});

export default theme;
