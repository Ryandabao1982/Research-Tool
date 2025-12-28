/**
 * Main entry point for KnowledgeBase Pro
 * Initializes the React application with Tauri integration
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import { App } from './app/App';
import { ThemeProvider } from './shared/theme/ThemeProvider';
import './shared/theme/globals.css';

// Configure React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

// Configure React DevTools (only in development)
const isDev = import.meta.env.DEV;

import { ServiceProvider } from './shared/services/serviceContext';

// Root render function
function renderApp() {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <ServiceProvider>
                    <ThemeProvider>
                        <BrowserRouter>
                            <App />
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    className: 'toast',
                                    duration: 4000,
                                    style: {
                                        background: 'var(--glass-bg)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)',
                                    },
                                }}
                            />
                        </BrowserRouter>
                    </ThemeProvider>
                </ServiceProvider>
                {isDev && <ReactQueryDevtools initialIsOpen={false} />}
            </QueryClientProvider>
        </React.StrictMode>,
    );
}

// Handle Tauri initialization
if (typeof window !== 'undefined' && window.__TAURI__) {
    import('@tauri-apps/api/tauri').then(({ invoke }) => {
        // Initialize Tauri app
        invoke('initialize_app');
        renderApp();
    }).catch((error) => {
        console.error('Failed to initialize Tauri:', error);
        renderApp();
    });
} else {
    // Web development mode
    renderApp();
}