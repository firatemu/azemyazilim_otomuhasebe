'use client';

import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { Receipt, ShoppingCart, CloudDownload } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useRouter } from 'next/navigation';

const menuItems = [
  {
    title: 'Satış Faturaları',
    description: 'Müşterilerinize kestiğiniz faturaları görüntüleyin ve yönetin',
    icon: Receipt,
    href: '/invoice/sales',
    color: 'var(--primary)',
  },
  {
    title: 'Satın Alma Faturaları',
    description: 'Tedarikçilerden aldığınız faturaları görüntüleyin ve yönetin',
    icon: ShoppingCart,
    href: '/invoice/purchase',
    color: 'var(--secondary)',
  },
  {
    title: 'Gelen E-Faturalar',
    description: 'Hızlı Teknoloji entegratöründen gelen e-faturaları görüntüleyin ve yönetin',
    icon: CloudDownload,
    href: '/efatura/gelen',
    color: 'var(--chart-1)',
  },
];

export default function FaturaPage() {
  const router = useRouter();

  return (
    <MainLayout>
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
        Fatura Yönetimi
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: 4,
          color: 'var(--muted-foreground)',
          fontSize: '0.875rem',
        }}
      >
        Lütfen işlem yapmak istediğiniz fatura türünü seçiniz
      </Typography>

      <Grid container spacing={3}>
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Grid key={index} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  bgcolor: 'var(--card)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 'var(--shadow-md)',
                    borderColor: 'var(--ring)',
                  }
                }}
              >
                <CardActionArea onClick={() => router.push(item.href)}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
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
                      <IconComponent sx={{ fontSize: 40, color: item.color }} />
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
                      variant="body2"
                      sx={{
                        color: 'var(--muted-foreground)',
                        fontSize: '0.875rem',
                      }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </MainLayout>
  );
}
