'use client';

import { theme } from '@/lib/theme';
import QueryProvider from '@/providers/QueryProvider';
import StorageGuard from '@/providers/StorageGuard';
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
    }
  }, []);

  return (
    <StorageGuard>
    <QueryProvider>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </AppRouterCacheProvider>
    </QueryProvider>
    </StorageGuard>
  );
}
