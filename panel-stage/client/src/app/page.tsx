'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication only once on mount
    const checkAuth = setTimeout(() => {
      // If already on login, don't redirect
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath === '/login') {
          setIsChecking(false);
          return;
        }
      }

      if (accessToken) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
      setIsChecking(false);
    }, 50);

    return () => clearTimeout(checkAuth);
  }, []); // Only run once on mount

  if (isChecking) {
    return null;
  }

  return null;
}

