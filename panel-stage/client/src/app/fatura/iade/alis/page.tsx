'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add, Search, Visibility, Delete, Print } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
}

interface Fatura {
  id: string;
  faturaNo: string;
  faturaTipi: 'SATIS' | 'ALIS';
  tarih: string;
  vade: string | null;
  cari: Cari;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  durum: 'ACIK' | 'ONAYLANDI';
  iskonto?: number;
  aciklama?: string;
}

export default function AlisIadeFaturalariPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [faturalar, setFaturalar] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchFaturalar();
  }, []);

  const fetchFaturalar = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/fatura', {
        params: {
          faturaTipi: 'ALIS_IADE',
          search: searchTerm,
        },
      });
      setFaturalar(response.data.data || []);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İade faturaları yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = async () => {
    if (!selectedFatura) return;

    try {
      setLoading(true);
      await axios.delete(`/fatura/${selectedFatura.id}`);
      showSnackbar('İade faturası başarıyla silindi', 'success');
      setOpenDelete(false);
      fetchFaturalar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İade faturası silinirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case 'ONAYLANDI':
        return 'success';
      case 'ACIK':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDurumText = (durum: string) => {
    switch (durum) {
      case 'ONAYLANDI':
        return 'Onaylandı';
      case 'ACIK':
        return 'Beklemede';
      default:
        return durum;
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Satınalma İade Faturaları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Satınalma iade faturalarını görüntüleyin ve yönetin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/fatura/iade/alis/yeni')}
            sx={{ 
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              }
            }}
          >
            Yeni İade Faturası
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <TextField
            fullWidth
            placeholder="Fatura no, cari ünvanı veya açıklama ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                fetchFaturalar();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setSearchTerm(''); fetchFaturalar(); }}>
                    <Delete />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Paper>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600 }}>Fatura No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cari</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vade</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Ara Toplam</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>KDV</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Genel Toplam</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faturalar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      Henüz satınalma iade faturası bulunmamaktadır.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      sx={{ mt: 2 }}
                      onClick={() => router.push('/fatura/iade/alis/yeni')}
                    >
                      İlk İade Faturasını Oluştur
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                faturalar.map((fatura) => (
                  <TableRow key={fatura.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {fatura.faturaNo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {fatura.cari.unvan}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fatura.cari.cariKodu}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(fatura.tarih)}</TableCell>
                    <TableCell>{fatura.vade ? formatDate(fatura.vade) : '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(fatura.toplamTutar)}</TableCell>
                    <TableCell align="right">{formatCurrency(fatura.kdvTutar)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(fatura.genelToplam)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getDurumText(fatura.durum)}
                        color={getDurumColor(fatura.durum)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          sx={{ color: '#06b6d4' }}
                          title="Görüntüle"
                          onClick={() => window.open(`/fatura/iade/alis/print/${fatura.id}`, '_blank')}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: '#10b981' }}
                          title="Yazdır"
                          onClick={() => window.open(`/fatura/iade/alis/print/${fatura.id}`, '_blank')}
                        >
                          <Print fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: '#ef4444' }}
                          title="Sil"
                          onClick={() => {
                            setSelectedFatura(fatura);
                            setOpenDelete(true);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Dialog */}
      {openDelete && (
        <Paper
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            p: 3,
            zIndex: 1300,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            İade Faturasını Sil
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            {selectedFatura?.faturaNo} numaralı iade faturasını silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => setOpenDelete(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Siliniyor...' : 'Sil'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Backdrop for dialog */}
      {openDelete && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200,
          }}
          onClick={() => setOpenDelete(false)}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

