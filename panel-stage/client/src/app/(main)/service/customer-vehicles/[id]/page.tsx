'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Add, Visibility } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import axios from '@/lib/axios';
import WorkOrderStatusChip from '@/components/servis/WorkOrderStatusChip';
import type { CustomerVehicle, WorkOrder } from '@/types/servis';

const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

export default function MusteriAracDetayPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [vehicle, setVehicle] = useState<CustomerVehicle | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [vRes, woRes] = await Promise.all([
          axios.get(`/customer-vehicle/${id}`),
          axios.get('/work-order', { params: { customerVehicleId: id, limit: 100 } }),
        ]);
        setVehicle(vRes.data);
        const woData = woRes.data?.data ?? woRes.data;
        setWorkOrders(Array.isArray(woData) ? woData : []);
      } catch {
        router.push('/servis/musteri-araclari');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading || !vehicle) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/servis/musteri-araclari')}
          sx={{ textTransform: 'none' }}
        >
          Geri
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Araç Detayı
        </Typography>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            Plaka
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {vehicle.plaka}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Araç
          </Typography>
          <Typography variant="body1">
            {vehicle.aracMarka} {vehicle.aracModel}
            {vehicle.yil && ` (${vehicle.yil})`}
            {vehicle.km != null && ` • ${vehicle.km.toLocaleString('tr-TR')} km`}
          </Typography>
          {vehicle.saseno && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                Şase No
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {vehicle.saseno}
              </Typography>
            </>
          )}
          {vehicle.cari && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                Müşteri
              </Typography>
              <Typography variant="body1">{vehicle.cari.unvan ?? vehicle.cari.cariKodu ?? '-'}</Typography>
            </>
          )}
        </CardContent>
      </Card>

      <Paper sx={{ p: 2, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Servis Geçmişi
          </Typography>
          <Button
            startIcon={<Add />}
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
            onClick={() => router.push(`/servis/is-emirleri/yeni?customerVehicleId=${id}`)}
          >
            Yeni İş Emri
          </Button>
        </Box>

        {workOrders.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Bu araç için henüz iş emri bulunmuyor.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>İş Emri No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workOrders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell>{wo.workOrderNo}</TableCell>
                    <TableCell>
                      <WorkOrderStatusChip status={wo.status} />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>{wo.description ?? '-'}</TableCell>
                    <TableCell>{formatDate(wo.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => router.push(`/servis/is-emirleri/${wo.id}`)}
                        sx={{ textTransform: 'none' }}
                      >
                        Detay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
}
