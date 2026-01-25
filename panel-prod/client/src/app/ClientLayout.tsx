'use client';

import InactivityTracker from '@/components/InactivityTracker';
import { theme } from '@/lib/theme';
import QueryProvider from '@/providers/QueryProvider';
import StorageGuard from '@/providers/StorageGuard';
import { useThemeStore } from '@/stores/themeStore';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect } from 'react';
import './globals.css';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDarkMode, setDarkMode } = useThemeStore();

  useEffect(() => {
    // Clear corrupted cache on first load
    if (typeof window !== 'undefined') {
      try {
        // Use safe access with try-catch
        const authData = window.localStorage?.getItem('auth-storage');
        if (authData) {
          try {
            JSON.parse(authData);
          } catch (e) {
            try {
              window.localStorage?.removeItem('auth-storage');
            } catch (removeError) {
              // Ignore remove errors
            }
          }
        }
      } catch (e) {
        // ignore localStorage errors - storage might not be available
      }

      // Initialize dark mode from localStorage
      try {
        const themeData = window.localStorage?.getItem('theme-storage');
        if (themeData) {
          const parsed = JSON.parse(themeData);
          if (parsed.state?.isDarkMode !== undefined) {
            setDarkMode(parsed.state.isDarkMode);
          }
        }
      } catch (e) {
        // ignore localStorage errors
      }
    }
  }, [setDarkMode]);

  return (
    <StorageGuard>
    <QueryProvider>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
          <InactivityTracker />
        </ThemeProvider>
      </AppRouterCacheProvider>
    </QueryProvider>
    </StorageGuard>
  );
}
