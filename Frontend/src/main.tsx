import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './index.css';
 // Importimi i konfigurimit të i18n
import App from './App.tsx';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#1976d2' },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </StrictMode>
);
