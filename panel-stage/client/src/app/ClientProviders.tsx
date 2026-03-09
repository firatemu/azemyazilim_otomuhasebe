'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { lightTheme, darkTheme } from '@/lib/theme';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import QueryProvider from '@/providers/QueryProvider';
import StorageGuard from '@/providers/StorageGuard';
import './globals.css';

interface ClientProvidersProps {
    children: React.ReactNode;
    initialAuth?: {
        user: any;
        accessToken: string | null;
        refreshToken: string | null;
    };
    initialTheme?: {
        isDarkMode: boolean;
    };
}

export function ClientProviders({ children, initialAuth, initialTheme }: ClientProvidersProps) {
    const { isDarkMode, setDarkMode } = useThemeStore();
    const { hydrateAuth } = useAuthStore();

    useEffect(() => {
        // Hydrate from server-provided data if available
        if (initialAuth) {
            hydrateAuth(initialAuth.user, initialAuth.accessToken, initialAuth.refreshToken);
        }
        if (initialTheme !== undefined) {
            setDarkMode(initialTheme.isDarkMode);
        }
    }, [initialAuth, initialTheme, hydrateAuth, setDarkMode]);

    useEffect(() => {
        // Synchronize HTML class with Theme State
        if (typeof window !== 'undefined') {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [isDarkMode]);

    useEffect(() => {
        // Cleanup and legacy storage fix on mount
        if (typeof window !== 'undefined' && !initialAuth) {
            try {
                const authData = window.localStorage?.getItem('auth-storage');
                if (authData) {
                    try {
                        JSON.parse(authData);
                    } catch (e) {
                        window.localStorage?.removeItem('auth-storage');
                    }
                }
            } catch (e) { }

            // Theme fallback from localStorage if no server-provided theme
            if (initialTheme === undefined) {
                try {
                    const themeData = window.localStorage?.getItem('theme-storage');
                    if (themeData) {
                        const parsed = JSON.parse(themeData);
                        if (parsed.state?.isDarkMode !== undefined) {
                            setDarkMode(parsed.state.isDarkMode);
                        }
                    }
                } catch (e) { }
            }
        }
    }, [setDarkMode, initialAuth, initialTheme]);

    return (
        <StorageGuard>
            <QueryProvider>
                <AppRouterCacheProvider>
                    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
                        <CssBaseline />
                        {children}
                    </ThemeProvider>
                </AppRouterCacheProvider>
            </QueryProvider>
        </StorageGuard>
    );
}
