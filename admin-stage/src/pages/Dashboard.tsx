import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  alpha,
} from '@mui/material';
import {
  Users,
  TrendingUp,
  CreditCard,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '@/lib/axios';
import MetricCard from '@/components/ui/MetricCard';
import MainLayout from '@/components/Layout/MainLayout';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    },
    retry: 1,
    staleTime: 30000,
  });

  const { data: revenue } = useQuery({
    queryKey: ['revenue'],
    queryFn: async () => {
      const response = await api.get('/analytics/revenue');
      return response.data;
    },
    retry: 1,
    staleTime: 30000,
  });

  const { data: userGrowth } = useQuery({
    queryKey: ['user-growth'],
    queryFn: async () => {
      const response = await api.get('/analytics/users-growth');
      return response.data;
    },
    retry: 1,
    staleTime: 30000,
  });

  const statsCards = [
    {
      title: 'Toplam Kullanıcı',
      value: metrics?.totalUsers || 0,
      change: 12.5,
      trend: 'up' as const,
      icon: Users,
      color: 'primary' as const,
    },
    {
      title: 'Aylık Gelir (MRR)',
      value: `₺${(metrics?.totalRevenue || 0).toLocaleString('tr-TR')}`,
      change: 8.3,
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'success' as const,
    },
    {
      title: 'Aktif Abonelik',
      value: metrics?.activeSubscriptions || 0,
      change: -2.1,
      trend: 'down' as const,
      icon: CreditCard,
      color: 'warning' as const,
    },
    {
      title: 'Bugünkü İşlem',
      value: 47,
      change: 15.2,
      trend: 'up' as const,
      icon: Activity,
      color: 'info' as const,
    },
  ];

  const subscriptionData = [
    { name: 'Basic', value: 45 },
    { name: 'Professional', value: 30 },
    { name: 'Enterprise', value: 15 },
    { name: 'Free', value: 10 },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: '1px solid',
            borderColor: alpha('#ef4444', 0.2),
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Veri Yüklenirken Hata Oluştu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </Typography>
        </Paper>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sistem özeti ve istatistikler
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {statsCards.map((card, idx) => (
          <MetricCard key={idx} {...card} />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
        <Box>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Gelir Trendi
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.1)} />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis stroke="#64748b" style={{ fontSize: '0.75rem' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        <Box>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Abonelik Dağılımı
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => {
                    const { name, percent } = props;
                    return `${name || ''} ${percent ? (percent * 100).toFixed(0) : 0}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      </Box>

      <Paper
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          Kullanıcı Büyümesi
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={userGrowth || []}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.1)} />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              style={{ fontSize: '0.75rem' }}
            />
            <YAxis stroke="#64748b" style={{ fontSize: '0.75rem' }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Bar
              dataKey="count"
              fill="url(#colorGradient)"
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </MainLayout>
  );
}
