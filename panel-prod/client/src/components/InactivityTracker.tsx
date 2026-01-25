'use client';

import { useAuthStore } from '@/stores/authStore';
import { Alert, Snackbar } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 saat
const CHECK_INTERVAL_MS = 60 * 1000; // 1 dakikada bir kontrol
const THROTTLE_MS = 800; // mousemove/scroll için throttle
const WARNING_BEFORE_MS = 5 * 60 * 1000; // 5 dakika önce uyarı (55. dakika)

function useThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  delayMs: number
): T {
  const lastRun = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const elapsed = now - lastRun.current;

      const run = () => {
        lastRun.current = Date.now();
        callback(...args);
      };

      if (elapsed >= delayMs) {
        run();
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          run();
        }, delayMs - elapsed);
      }
    }) as T,
    [callback, delayMs]
  );
}

export default function InactivityTracker() {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, clearAuth } = useAuthStore();
  const lastActivityAt = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const updateActivity = useCallback(() => {
    lastActivityAt.current = Date.now();
    setShowWarning(false);
  }, []);

  const throttledUpdate = useThrottledCallback(updateActivity, THROTTLE_MS);

  const handleActivity = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  const handleThrottledActivity = useCallback(() => {
    throttledUpdate();
  }, [throttledUpdate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isActive = !!accessToken && pathname !== '/login';
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setShowWarning(false);
      return;
    }

    lastActivityAt.current = Date.now();
    setShowWarning(false);

    const events: { name: string; handler: () => void }[] = [
      { name: 'mousedown', handler: handleActivity },
      { name: 'click', handler: handleActivity },
      { name: 'keydown', handler: handleActivity },
      { name: 'touchstart', handler: handleActivity },
      { name: 'touchmove', handler: handleActivity },
      { name: 'mousemove', handler: handleThrottledActivity },
      { name: 'scroll', handler: handleThrottledActivity },
    ];

    events.forEach(({ name, handler }) => {
      window.addEventListener(name, handler);
    });

    intervalRef.current = setInterval(() => {
      const idleMs = Date.now() - lastActivityAt.current;

      if (idleMs >= IDLE_TIMEOUT_MS) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        events.forEach(({ name, handler }) => {
          window.removeEventListener(name, handler);
        });
        clearAuth();
        router.push('/login');
        return;
      }

      if (idleMs >= IDLE_TIMEOUT_MS - WARNING_BEFORE_MS) {
        setShowWarning(true);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      events.forEach(({ name, handler }) => {
        window.removeEventListener(name, handler);
      });
    };
  }, [accessToken, pathname, clearAuth, router, handleActivity, handleThrottledActivity]);

  return (
    <Snackbar
      open={showWarning}
      autoHideDuration={null}
      onClose={() => {}}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 80, sm: 24 } }}
    >
      <Alert severity="warning" variant="filled" onClose={() => setShowWarning(false)}>
        5 dakika içinde hareketsizlik nedeniyle çıkış yapacaksınız. Devam etmek için sayfada
        herhangi bir işlem yapın.
      </Alert>
    </Snackbar>
  );
}
