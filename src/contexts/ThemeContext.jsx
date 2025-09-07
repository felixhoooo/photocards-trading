
import React, { createContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

export const ThemeContext = createContext();

const theme = createTheme({
  palette: {
    mode: 'light',
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
});

export const ThemeContextProvider = ({ children }) => {
  return (
    <MuiThemeProvider theme={theme}>
      {children}
    </MuiThemeProvider>
  );
};
