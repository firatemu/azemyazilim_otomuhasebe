'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Chip,
} from '@mui/material';
import {
  Assignment,
  Dashboard,
  DirectionsCar,
  NotificationsActive,
  Build,
  TrendingUp,
  ArrowForward,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

const menuItemsConfig = [
  {
    title: 'İş Emirleri',
    description: 'Tüm iş emirlerini listele, filtrele ve yönet',
    Icon: Assignment,
    href: '/servis/is-emirleri',
    color: 'var(--chart-1)',
  },
  {
    title: 'Atölye Panosu',
    description: 'Kanban görünümünde iş akışını takip et',
    Icon: Dashboard,
    href: '/servis/atolye-panosu',
    color: 'var(--primary)',
  },
  {
    title: 'Araçlar',
    description: 'Araç kayıtlarını ve servis geçmişlerini görüntüle',
    Icon: DirectionsCar,
    href: '/servis/araclar',
    color: 'var(--chart-2)',
  },
  {
    title: 'Bakım Hatırlatmaları',
    description: 'Yaklaşan ve geciken bakım hatırlatmalarını yönet',
    Icon: NotificationsActive,
    href: '/servis/bakim-hatirlatmalari',
    color: 'var(--primary)',
  },
  {
    title: 'Teknisyenler',
    description: 'Teknisyen kadrolarını ve iş yüklerini görüntüle',
    Icon: Build,
    href: '/servis/teknisyenler',
    color: 'var(--destructive)',
  },
];

export default function ServisPage() {
  const router = useRouter();

  // Quick stats
  const { data: workOrdersData } = useQuery({
    queryKey: ['work-orders-summary'],
    queryFn: async () => {
      const response = await axios.get('/work-orders', { params: { limit: 100 } });
      return response.data;
    },
  });

  const workOrders = workOrdersData?.data || [];
  const activeWorkOrders = workOrders.filter(
    (wo: any) => wo.status !== 'CLOSED' && wo.status !== 'CANCELLED'
  ).length;
  const waitingApproval = workOrders.filter(
    (wo: any) => wo.status === 'WAITING_FOR_APPROVAL'
  ).length;
  const readyForDelivery = workOrders.filter(
    (wo: any) => wo.status === 'READY_FOR_DELIVERY'
  ).length;

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: '2rem',
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
              color: 'var(--muted-foreground)',
              fontSize: '0.875rem',
            }}
          >
            Araç servis operasyonlarınızı tek noktadan yönetin
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2.5,
                textAlign: 'center',
                bgcolor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  boxShadow: 'var(--shadow-md)',
                  borderColor: 'var(--ring)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => router.push('/servis/is-emirleri')}
            >
              <Typography 
                variant="h3" 
                sx={{
                  fontWeight: 700,
                  fontSize: '2rem',
                  color: 'var(--chart-1)',
                  mb: 0.5,
                }}
              >
                {activeWorkOrders}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'var(--muted-foreground)',
                  fontSize: '0.8125rem',
                }}
              >
                Aktif İş Emri
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2.5,
                textAlign: 'center',
                bgcolor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  boxShadow: 'var(--shadow-md)',
                  borderColor: 'var(--ring)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => router.push('/servis/is-emirleri?status=WAITING_FOR_APPROVAL')}
            >
              <Typography 
                variant="h3" 
                sx={{
                  fontWeight: 700,
                  fontSize: '2rem',
                  color: 'var(--primary)',
                  mb: 0.5,
                }}
              >
                {waitingApproval}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'var(--muted-foreground)',
                  fontSize: '0.8125rem',
                }}
              >
                Onay Bekliyor
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2.5,
                textAlign: 'center',
                bgcolor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  boxShadow: 'var(--shadow-md)',
                  borderColor: 'var(--ring)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => router.push('/servis/is-emirleri?status=READY_FOR_DELIVERY')}
            >
              <Typography 
                variant="h3" 
                sx={{
                  fontWeight: 700,
                  fontSize: '2rem',
                  color: 'var(--chart-2)',
                  mb: 0.5,
                }}
              >
                {readyForDelivery}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'var(--muted-foreground)',
                  fontSize: '0.8125rem',
                }}
              >
                Teslime Hazır
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2.5,
                textAlign: 'center',
                bgcolor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  boxShadow: 'var(--shadow-md)',
                  borderColor: 'var(--ring)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => router.push('/servis/atolye-panosu')}
            >
              <TrendingUp sx={{ fontSize: 32, color: 'var(--primary)', mb: 0.5 }} />
              <Typography 
                variant="body2" 
                sx={{
                  color: 'var(--muted-foreground)',
                  fontSize: '0.8125rem',
                }}
              >
                Panoyu Aç
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Menu Cards */}
        <Grid container spacing={3}>
          {menuItemsConfig.map((item) => {
            const IconComponent = item.Icon;
            const badge = item.title === 'İş Emirleri' && activeWorkOrders > 0 
              ? `${activeWorkOrders} Aktif` 
              : item.title === 'Atölye Panosu' && waitingApproval > 0
              ? `${waitingApproval} Onay Bekliyor`
              : null;
            
            return (
              <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    bgcolor: 'var(--card)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 'var(--shadow-md)',
                      borderColor: 'var(--ring)',
                    },
                  }}
                  onClick={() => router.push(item.href)}
                >
                  <CardContent sx={{ flex: 1, textAlign: 'center', py: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 'var(--radius-md)',
                        bgcolor: `color-mix(in srgb, ${item.color} 15%, transparent)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <IconComponent sx={{ fontSize: 40, color: item.color }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Typography 
                        variant="h6" 
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.125rem',
                          color: 'var(--foreground)',
                        }}
                      >
                        {item.title}
                      </Typography>
                      {badge && (
                        <Chip
                          label={badge}
                          size="small"
                          sx={{
                            bgcolor: item.color,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                    </Box>
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
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                      endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(item.href);
                      }}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: item.color,
                        '&:hover': {
                          bgcolor: `color-mix(in srgb, ${item.color} 10%, transparent)`,
                        },
                      }}
                    >
                      Git
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </MainLayout>
  );
}
