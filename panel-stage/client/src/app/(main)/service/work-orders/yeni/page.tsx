'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/lib/axios';
import WorkOrderAssignmentForm from '@/components/servis/WorkOrderAssignmentForm';
import type { CustomerVehicle } from '@/types/servis';
import type { CreateWorkOrderDto } from '@/types/servis';

function YeniIsEmriContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledVehicleId = searchParams.get('customerVehicleId') ?? '';
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [cariler, setCariler] = useState<{ id: string; cariKodu?: string; unvan?: string }[]>([]);
  const [form, setForm] = useState<CreateWorkOrderDto>({
    customerVehicleId: prefilledVehicleId,
    cariId: '',
    technicianId: '',
    description: '',
    estimatedCompletionDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [vRes, cRes] = await Promise.all([
          axios.get('/customer-vehicle', { params: { limit: 500 } }),
          axios.get('/account', { params: { limit: 1000 } }),
        ]);
        const vData = vRes.data?.data ?? vRes.data;
        const cData = cRes.data?.data ?? cRes.data;
        setVehicles(Array.isArray(vData) ? vData : []);
        setCariler(Array.isArray(cData) ? cData : []);
      } catch {
        setSnackbar({ open: true, message: 'Veriler yüklenemedi', severity: 'error' });
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (prefilledVehicleId && vehicles.length) {
      const v = vehicles.find((x) => x.id === prefilledVehicleId);
      if (v) setForm((p) => ({ ...p, customerVehicleId: v.id, cariId: v.cariId }));
    }
  }, [prefilledVehicleId, vehicles]);

  const selectedVehicle = vehicles.find((v) => v.id === form.customerVehicleId);
  const selectedCari = cariler.find((c) => c.id === form.cariId);

  const handleVehicleChange = (v: CustomerVehicle | null) => {
    if (v) {
      setForm((p) => ({
        ...p,
        customerVehicleId: v.id,
        cariId: v.cariId,
      }));
    } else {
      setForm((p) => ({ ...p, customerVehicleId: '', cariId: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerVehicleId || !form.cariId) {
      setSnackbar({ open: true, message: 'Araç ve müşteri seçimi zorunludur', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/work-order', {
        customerVehicleId: form.customerVehicleId,
        cariId: form.cariId,
        technicianId: form.technicianId || undefined,
        description: form.description || undefined,
        estimatedCompletionDate: form.estimatedCompletionDate || undefined,
      });
      const wo = res.data?.data ?? res.data;
      const woId = typeof wo === 'object' ? wo?.id : wo;
      setSnackbar({ open: true, message: 'İş emri oluşturuldu', severity: 'success' });
      if (woId) router.push(`/servis/is-emirleri/${woId}`);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'İş emri oluşturulamadı',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/servis/is-emirleri')}
          sx={{ textTransform: 'none' }}
        >
          Geri
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Yeni İş Emri
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Autocomplete
              options={vehicles}
              getOptionLabel={(v) =>
                `${v.plaka} - ${v.aracMarka} ${v.aracModel}${v.cari?.unvan ? ` (${v.cari.unvan})` : ''}`.trim()
              }
              value={selectedVehicle ?? null}
              onChange={(_, v) => handleVehicleChange(v)}
              renderInput={(params) => (
                <TextField {...params} label="Araç" required />
              )}
            />
            <Autocomplete
              options={cariler}
              getOptionLabel={(c) => `${c.cariKodu || ''} - ${c.unvan || c.id}`.trim() || c.id}
              value={selectedCari ?? null}
              onChange={(_, v) => setForm((p) => ({ ...p, cariId: v?.id ?? '' }))}
              renderInput={(params) => (
                <TextField {...params} label="Müşteri (Cari)" required />
              )}
            />
            <WorkOrderAssignmentForm
              technicianId={form.technicianId || null}
              onChange={(technicianId) =>
                setForm((p) => ({
                  ...p,
                  technicianId: technicianId ?? '',
                }))
              }
            />
            <TextField
              label="Şikayet/Yapılacaklar"
              multiline
              rows={2}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <TextField
              label="Tahmini Bitiş Tarihi ve Saati"
              type="datetime-local"
              value={
                form.estimatedCompletionDate
                  ? form.estimatedCompletionDate.slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  estimatedCompletionDate: e.target.value ? `${e.target.value}:00` : '',
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading}
                sx={{
                  bgcolor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => router.push('/servis/is-emirleri')}
                sx={{ textTransform: 'none' }}
              >
                İptal
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default function YeniIsEmriPage() {
  return (
    <React.Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    }>
      <YeniIsEmriContent />
    </React.Suspense>
  );
}
