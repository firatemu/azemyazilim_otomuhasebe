'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, CircularProgress } from '@mui/material';
import { Build, DirectionsCar, Assignment, Receipt, AccountBalance, Inventory, Engineering, TrendingUp, Schedule } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import axios from '@/lib/axios';

type ServisStats = {
  workOrders?: { total: number; waitingDiagnosis: number; pendingApproval: number; inProgress: number; invoiced: number };
  partRequests?: { pending: number };
  revenue?: { thisMonth: number; invoiceCount: number };
};

const menuItems = [
  {
    title: 'Müşteri Araçları',
    description: 'Müşteri araçlarını görüntüleyin, ekleyin ve yönetin',
    icon: DirectionsCar,
    href: '/servis/musteri-araclari',
    color: '#0ea5e9',
  },
  {
    title: 'İş Emirleri',
    description: 'Servis iş emirlerini oluşturun ve takip edin',
    icon: Assignment,
    href: '/servis/is-emirleri',
    color: '#0ea5e9',
  },
  {
    title: 'Parça Tedarik ve Yönetimi',
    description: 'İş emirlerine parça ekleyin ve teknisyen taleplerini karşılayın',
    icon: Inventory,
    href: '/servis/parca-tedarik-yonetimi',
    color: '#0ea5e9',
  },
  {
    title: 'Teknisyenler',
    description: 'Teknisyenleri yönetin',
    icon: Engineering,
    href: '/servis/teknisyenler',
    color: '#0ea5e9',
    hideForTechnician: true,
  },
  {
    title: 'Servis Faturaları',
    description: 'Servis faturalarını görüntüleyin ve yönetin',
    icon: Receipt,
    href: '/servis/faturalar',
    color: '#0ea5e9',
    hideForTechnician: true,
  },
  {
    title: 'Muhasebe Kayıtları',
    description: 'Servis ile ilgili muhasebe kayıtlarını inceleyin',
    icon: AccountBalance,
    href: '/servis/muhasebe-kayitlari',
    color: '#0ea5e9',
    hideForTechnician: true,
  },
  {
    title: 'Servis Raporları',
    description: 'İş emri durumları, gelir ve parça talebi özeti',
    icon: TrendingUp,
    href: '/servis/raporlar',
    color: '#0ea5e9',
    hideForTechnician: true,
  },
];

export default function ServisHubPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isTechnician = user?.role === 'TECHNICIAN';
  const visibleItems = menuItems.filter((item) => !(item as any).hideForTechnician || !isTechnician);
  const [stats, setStats] = useState<ServisStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/work-order/stats')
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

  return (
    <>
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
        Servis Yönetimi
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: 4,
          color: 'var(--muted-foreground)',
          fontSize: '0.875rem',
        }}
      >
        Lütfen işlem yapmak istediğiniz modülü seçiniz
      </Typography>

      {!isTechnician && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {statsLoading ? (
            <Grid size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            </Grid>
          ) : stats ? (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    bgcolor: 'var(--card)',
                  }}
                >
                  <CardContent sx={{ py: 2, px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assignment sx={{ color: 'var(--primary)', fontSize: 28 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {stats.workOrders?.total ?? 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Toplam İş Emri
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    bgcolor: 'var(--card)',
                  }}
                >
                  <CardContent sx={{ py: 2, px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ color: 'var(--warning)', fontSize: 28 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {stats.workOrders?.inProgress ?? 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Devam Eden
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    bgcolor: 'var(--card)',
                  }}
                >
                  <CardContent sx={{ py: 2, px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Inventory sx={{ color: 'var(--info)', fontSize: 28 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {stats.partRequests?.pending ?? 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Bekleyen Parça Talebi
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    bgcolor: 'var(--card)',
                  }}
                >
                  <CardContent sx={{ py: 2, px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp sx={{ color: 'var(--success)', fontSize: 28 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {formatCurrency(stats.revenue?.thisMonth ?? 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Bu Ay Gelir
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : null}
        </Grid>
      )}

      <Grid container spacing={3}>
        {visibleItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
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
                  },
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
    </>
  );
}
