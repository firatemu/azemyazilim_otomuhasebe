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
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Search, Visibility } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import axios from '@/lib/axios';
import CustomerVehicleDialog from '@/components/servis/CustomerVehicleDialog';
import type { CustomerVehicle } from '@/types/servis';

export default function MusteriAraclariPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [cariler, setCariler] = useState<{ id: string; cariKodu?: string; unvan?: string }[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<CustomerVehicle | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchVehicles();
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchCariler = async () => {
      try {
        const res = await axios.get('/account', { params: { limit: 1000 } });
        const data = res.data?.data ?? res.data;
        setCariler(Array.isArray(data) ? data : []);
      } catch {
        setSnackbar({ open: true, message: 'Cari listesi yüklenemedi', severity: 'error' });
      }
    };
    fetchCariler();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/customer-vehicle', {
        params: { search: debouncedSearch, limit: 100 },
      });
      const data = res.data?.data ?? res.data;
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setSnackbar({ open: true, message: 'Araç listesi yüklenemedi', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = () => {
    setSelectedVehicle(null);
    setOpenDialog(true);
  };

  const handleEdit = (v: CustomerVehicle) => {
    setSelectedVehicle(v);
    setOpenDialog(true);
  };

  const handleDeleteClick = (v: CustomerVehicle) => {
    setSelectedVehicle(v);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVehicle) return;
    try {
      await axios.delete(`/customer-vehicle/${selectedVehicle.id}`);
      showSnackbar('Araç silindi', 'success');
      setOpenDelete(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Silme işlemi başarısız', 'error');
    }
  };

  const handleDialogSubmit = async (data: any) => {
    if (selectedVehicle) {
      await axios.patch(`/customer-vehicle/${selectedVehicle.id}`, data);
      showSnackbar('Araç güncellendi', 'success');
    } else {
      await axios.post('/customer-vehicle', data);
      showSnackbar('Araç eklendi', 'success');
    }
    fetchVehicles();
  };

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
        Müşteri Araçları
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
        Müşteri araçlarını görüntüleyin ve yönetin
      </Typography>

      <Paper
        sx={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            id="musteri-araclari-search"
            size="small"
            placeholder="Plaka, şase no, marka veya model ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
            sx={{
              bgcolor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Yeni Araç
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Plaka</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Şase No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Marka / Model</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Yıl</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>KM</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  İşlemler
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'var(--muted-foreground)' }}>
                    Kayıt bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v) => (
                  <TableRow key={v.id} hover>
                    <TableCell>{v.plaka}</TableCell>
                    <TableCell>{v.saseno || '-'}</TableCell>
                    <TableCell>{`${v.aracMarka} ${v.aracModel}`}</TableCell>
                    <TableCell>{v.yil ?? '-'}</TableCell>
                    <TableCell>{v.km != null ? v.km.toLocaleString('tr-TR') : '-'}</TableCell>
                    <TableCell>{v.cari?.unvan ?? v.cari?.cariKodu ?? '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => router.push(`/servis/musteri-araclari/${v.id}`)} title="Detay">
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(v)} title="Düzenle">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(v)} color="error" title="Sil">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <CustomerVehicleDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleDialogSubmit}
        vehicle={selectedVehicle}
        cariler={cariler}
      />

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedVehicle?.plaka} plakalı araç silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

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
