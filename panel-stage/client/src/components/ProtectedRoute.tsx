'use client';

import { useAuthStore } from '@/stores/authStore';
import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = setTimeout(() => {
      if (!accessToken) {
        router.push('/login');
      }
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [accessToken, router]);

  if (isChecking || !accessToken) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
