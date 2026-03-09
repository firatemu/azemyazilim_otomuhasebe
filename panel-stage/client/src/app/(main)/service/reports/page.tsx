'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Assignment,
  Schedule,
  Inventory,
  TrendingUp,
  CheckCircle,
  HourglassEmpty,
  Receipt,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import axios from '@/lib/axios';

type ServisStats = {
  workOrders?: {
    total: number;
    waitingDiagnosis: number;
    pendingApproval: number;
    inProgress: number;
    invoiced: number;
    byStatus?: Record<string, number>;
  };
  partRequests?: { pending: number };
  revenue?: { thisMonth: number; invoiceCount: number };
};

const STATUS_LABELS: Record<string, string> = {
  WAITING_DIAGNOSIS: 'Beklemede',
  PENDING_APPROVAL: 'Müşteri Onayı Bekliyor',
  APPROVED_IN_PROGRESS: 'Yapım Aşamasında',
  PART_WAITING: 'Parça Bekliyor',
  PARTS_SUPPLIED: 'Parçalar Tedarik Edildi',
  VEHICLE_READY: 'Araç Hazır',
  INVOICED_CLOSED: 'Fatura Oluşturuldu',
  CLOSED_WITHOUT_INVOICE: 'Faturasız Kapandı',
  CANCELLED: 'İptal',
};

const STATUS_COLORS: Record<string, string> = {
  WAITING_DIAGNOSIS: 'var(--chart-4)',
  PENDING_APPROVAL: 'var(--chart-2)',
  APPROVED_IN_PROGRESS: 'var(--chart-1)',
  PART_WAITING: 'var(--chart-2)',
  PARTS_SUPPLIED: 'var(--chart-4)',
  VEHICLE_READY: 'var(--chart-2)',
  INVOICED_CLOSED: 'var(--chart-3)',
  CLOSED_WITHOUT_INVOICE: 'var(--muted-foreground)',
  CANCELLED: 'var(--destructive)',
};

export default function ServisRaporlarPage() {
  const [stats, setStats] = useState<ServisStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/work-order/stats')
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

  const chartData = stats?.workOrders?.byStatus
    ? Object.entries(stats.workOrders.byStatus)
        .filter(([, v]) => v > 0)
        .map(([status, count]) => ({
          name: STATUS_LABELS[status] ?? status,
          count,
          fill: STATUS_COLORS[status] ?? 'var(--primary)',
        }))
    : [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Servis Raporları
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <CardContent sx={{ py: 2, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment sx={{ color: 'var(--primary)', fontSize: 28 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.workOrders?.total ?? 0}
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
          <Card sx={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <CardContent sx={{ py: 2, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ color: 'var(--chart-4)', fontSize: 28 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.workOrders?.inProgress ?? 0}
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
          <Card sx={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <CardContent sx={{ py: 2, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Inventory sx={{ color: 'var(--chart-2)', fontSize: 28 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.partRequests?.pending ?? 0}
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
          <Card sx={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <CardContent sx={{ py: 2, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: 'var(--chart-3)', fontSize: 28 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(stats?.revenue?.thisMonth ?? 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bu Ay Gelir ({stats?.revenue?.invoiceCount ?? 0} fatura)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          İş Emri Durum Dağılımı
        </Typography>
        {chartData.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Henüz veri bulunmuyor.
          </Typography>
        ) : (
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fill: 'var(--muted-foreground)' }} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                  formatter={(value: number) => [value, 'Adet']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Durum Özeti
            </Typography>
            {stats?.workOrders?.total ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <HourglassEmpty sx={{ fontSize: 18, color: 'var(--chart-4)' }} />
                  <Typography variant="body2">Beklemede: {stats.workOrders.waitingDiagnosis ?? 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Schedule sx={{ fontSize: 18, color: 'var(--chart-2)' }} />
                  <Typography variant="body2">Müşteri Onayı Bekliyor: {stats.workOrders.pendingApproval ?? 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Assignment sx={{ fontSize: 18, color: 'var(--chart-1)' }} />
                  <Typography variant="body2">Yapım Aşamasında: {stats.workOrders.inProgress ?? 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Inventory sx={{ fontSize: 18, color: 'var(--chart-2)' }} />
                  <Typography variant="body2">Parça Bekliyor: {(stats.workOrders as any).partWaiting ?? 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Inventory sx={{ fontSize: 18, color: 'var(--chart-4)' }} />
                  <Typography variant="body2">Parçalar Tedarik Edildi: {(stats.workOrders as any).partsSupplied ?? 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Schedule sx={{ fontSize: 18, color: 'var(--chart-2)' }} />
                  <Typography variant="body2">Araç Hazır: {(stats.workOrders as any).vehicleReady ?? 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 18, color: 'var(--chart-3)' }} />
                  <Typography variant="body2">Fatura Oluşturuldu: {stats.workOrders.invoiced ?? 0}</Typography>
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Henüz iş emri bulunmuyor.
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Gelir Özeti
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Receipt sx={{ fontSize: 18, color: 'var(--chart-3)' }} />
              <Typography variant="body2">
                Bu ay kesilen fatura: {stats?.revenue?.invoiceCount ?? 0} adet
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ fontSize: 18, color: 'var(--chart-3)' }} />
              <Typography variant="body2" fontWeight={600}>
                Toplam gelir: {formatCurrency(stats?.revenue?.thisMonth ?? 0)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
