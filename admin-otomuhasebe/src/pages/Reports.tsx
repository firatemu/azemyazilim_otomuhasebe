import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Download, Calendar } from 'lucide-react';
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
import MainLayout from '@/components/Layout/MainLayout';
import api from '@/lib/axios';

const COLORS = [
  'rgb(95, 135, 135)',   // --chart-1
  'rgb(231, 138, 83)',   // --chart-2
  'rgb(251, 203, 151)',  // --chart-3
  'rgb(136, 136, 136)',  // --chart-4
];

export default function Reports() {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState('last-month');

  const { data: revenue } = useQuery({
    queryKey: ['revenue-report', dateRange],
    queryFn: async () => {
      const response = await api.get('/analytics/revenue');
      return response.data;
    },
  });

  const { data: userGrowth } = useQuery({
    queryKey: ['user-growth-report', dateRange],
    queryFn: async () => {
      const response = await api.get('/analytics/users-growth');
      return response.data;
    },
  });

  const { data: churn } = useQuery({
    queryKey: ['churn-report'],
    queryFn: async () => {
      const response = await api.get('/analytics/churn');
      return response.data;
    },
  });

  const subscriptionDistribution = [
    { name: 'Basic', value: 45 },
    { name: 'Professional', value: 30 },
    { name: 'Enterprise', value: 15 },
    { name: 'Free', value: 10 },
  ];

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Raporlar
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tarih Aralığı</InputLabel>
            <Select
              value={dateRange}
              label="Tarih Aralığı"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="last-week">Son 1 Hafta</MenuItem>
              <MenuItem value="last-month">Son 1 Ay</MenuItem>
              <MenuItem value="last-3-months">Son 3 Ay</MenuItem>
              <MenuItem value="last-year">Son 1 Yıl</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Download />}>
            Export PDF
          </Button>
          <Button variant="outlined" startIcon={<Download />}>
            Export Excel
          </Button>
        </Box>
      </Box>

      <Paper>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Gelir Raporları" />
          <Tab label="Kullanıcı Raporları" />
          <Tab label="Ödeme Raporları" />
          <Tab label="Abonelik Raporları" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Gelir Trendi
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="rgb(95, 135, 135)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Kullanıcı Büyümesi
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="rgb(231, 138, 83)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Churn Rate
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="error.main">
                    %{churn?.churnRate?.toFixed(1) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    İptal: {churn?.cancelled || 0} / Toplam: {churn?.total || 0}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
          {tabValue === 2 && (
            <Typography>Ödeme raporları yakında eklenecek</Typography>
          )}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Abonelik Dağılımı
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={subscriptionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const { name, percent } = props;
                      return `${name || ''} ${percent ? (percent * 100).toFixed(0) : 0}%`;
                    }}
                    outerRadius={120}
                    fill="rgb(95, 135, 135)"
                    dataKey="value"
                  >
                    {subscriptionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Box>
      </Paper>
    </MainLayout>
  );
}
