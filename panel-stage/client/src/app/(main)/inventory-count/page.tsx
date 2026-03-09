'use client';

import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import MainLayout from '@/components/Layout/MainLayout';
import { useRouter } from 'next/navigation';
import { Inventory, QrCode2 } from '@mui/icons-material';

const menuItems = [
  {
    title: 'Ürün Bazlı Sayım',
    description: 'Sadece ürün toplamını sayın, raf adresleri önemli değil',
    icon: Inventory,
    href: '/sayim/urun-bazli',
    color: 'var(--chart-1)',
    badge: 'Barkod okuma destekli',
  },
  {
    title: 'Raf Bazlı Sayım',
    description: 'Her rafta ne kadar ürün var detaylı sayın',
    icon: QrCode2,
    href: '/sayim/raf-bazli',
    color: 'var(--secondary)',
    badge: 'Barkod okuma destekli',
  },
  {
    title: 'Sayım Listesi',
    description: 'Geçmiş sayımları görüntüleyin ve onaylayın',
    icon: Inventory,
    href: '/sayim/liste',
    color: 'var(--chart-2)',
    badge: null,
  },
];

export default function SayimPage() {
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
          Stok Sayım Modülü
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Grid key={index} size={{ xs: 12, md: 4 }}>
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
                  onClick={() => router.push(item.href)}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 'var(--radius-md)',
                      bgcolor: `color-mix(in srgb, ${item.color} 15%, transparent)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <IconComponent sx={{ fontSize: 48, color: item.color }} />
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
                    {item.title}
                  </Typography>
                  <Typography 
                    sx={{
                      color: 'var(--muted-foreground)',
                      fontSize: '0.875rem',
                      mb: item.badge ? 1 : 0,
                    }}
                  >
                    {item.description}
                  </Typography>
                  {item.badge && (
                    <Typography 
                      variant="caption" 
                      sx={{
                        color: item.color,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'block',
                        mt: 1,
                      }}
                    >
                      {item.badge}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </MainLayout>
  );
}
