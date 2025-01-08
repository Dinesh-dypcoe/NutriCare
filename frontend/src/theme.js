import { createTheme } from '@mui/material';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#1d4ed8',
        },
        secondary: {
            main: '#8b5cf6',
            light: '#a78bfa',
            dark: '#6d28d9',
        },
        background: {
            default: '#0f172a', // Dark blue
            paper: '#1e293b',   // Slightly lighter blue
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
        },
        divider: 'rgba(148, 163, 184, 0.12)',
        error: {
            main: '#ef4444',
        },
        warning: {
            main: '#f59e0b',
        },
        success: {
            main: '#10b981',
        },
        info: {
            main: '#3b82f6',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 600 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: "#6b6b6b #2b2b2b",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "#2b2b2b",
                        width: 8,
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: "#6b6b6b",
                        minHeight: 24,
                    },
                    "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                        backgroundColor: "#959595",
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                },
                contained: {
                    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
                    '&:hover': {
                        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.3)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    backgroundImage: 'none',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#1e293b',
                    backgroundImage: 'none',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                },
            },
        },
    },
}); 