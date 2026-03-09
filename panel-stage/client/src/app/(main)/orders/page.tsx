'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import MainLayout from '@/components/Layout/MainLayout';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from '@mui/icons-material';

export default function SiparisPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography 
          variant="h4" 
          sx={{
            fontWeight: 700,
            fontSize: '1.875rem',
            color: 'var(--foreground)',
            letterSpacing: '-0.02em',
            mb: 1,
          }}
        >
          Sipariş Yönetimi
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, mt: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                bgcolor: 'var(--card)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  bgcolor: 'var(--muted)',
                  borderColor: 'var(--ring)',
                  boxShadow: 'var(--shadow-md)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => router.push('/order/satis')}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 'var(--radius-md)',
                  bgcolor: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <ShoppingCart sx={{ fontSize: 48, color: 'var(--primary)' }} />
              </Box>
              <Typography 
                variant="h5" 
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: 'var(--foreground)',
                  mb: 1,
                }}
              >
                Satış Siparişleri
              </Typography>
              <Typography 
                sx={{
                  color: 'var(--muted-foreground)',
                  fontSize: '0.875rem',
                }}
              >
                Müşterilerden gelen sipariş emirlerini yönetin
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
}
