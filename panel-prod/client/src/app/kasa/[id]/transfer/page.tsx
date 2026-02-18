'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  SwapHoriz,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';

interface BekleyenTransfer {
  hareketler: any[];
  ozet: {
    adet: number;
    toplamBrutTutar: number;
    toplamKomisyon: number;
    toplamBSMV: number;
    toplamNetTutar: number;
  };
}

interface Kasa {
  id: string;
  kasaAdi: string;
  kasaTipi: string;
  bakiye: number;
  komisyonOrani?: number;
  bagliKasa?: {
    kasaAdi: string;
    bakiye: number;
  };
}

export default function POSTransferPage() {
  const params = useParams();
  const router = useRouter();
  const kasaId = params.id as string;

  const [kasa, setKasa] = useState<Kasa | null>(null);
  const [bekleyenTransfer, setBekleyenTransfer] = useState<BekleyenTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchKasa();
    fetchBekleyenTransferler();
  }, [kasaId]);

  const fetchKasa = async () => {
    try {
      const response = await axios.get(`/kasa/${kasaId}`);
      setKasa(response.data);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kasa yüklenirken hata oluştu', 'error');
    }
  };

  const fetchBekleyenTransferler = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/kasa/${kasaId}/bekleyen-transferler`);
      setBekleyenTransfer(response.data);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Transferler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    try {
      setTransferring(true);
      const response = await axios.post(`/kasa/${kasaId}/transfer-pos`);
      showSnackbar(
        `${response.data.transferEdilen} adet işlem başarıyla transfer edildi. Net tutar: ${formatCurrency(response.data.toplamNetTutar)}`,
        'success'
      );
      setOpenConfirm(false);
      fetchKasa();
      fetchBekleyenTransferler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Transfer sırasında hata oluştu', 'error');
    } finally {
      setTransferring(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('tr-TR');
  };

  if (loading || !kasa || !bekleyenTransfer) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  const ozet = bekleyenTransfer.ozet;

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton onClick={() => router.push(`/kasa/${kasaId}`)} sx={{ bgcolor: '#f3f4f6' }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="bold">
                POS → Banka Transferi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {kasa.kasaAdi} kasasından {kasa.bagliKasa?.kasaAdi} hesabına transfer
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Özet Kartlar */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, bgcolor: '#f0f9ff', borderLeft: '4px solid #3b82f6' }}>
            <Typography variant="caption" color="text.secondary">Bekleyen İşlem</Typography>
            <Typography variant="h5" fontWeight="bold" color="#3b82f6">
              {ozet.adet}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, bgcolor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
            <Typography variant="caption" color="text.secondary">Toplam Brüt</Typography>
            <Typography variant="h5" fontWeight="bold" color="#10b981">
              {formatCurrency(ozet.toplamBrutTutar)}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, bgcolor: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
            <Typography variant="caption" color="text.secondary">Komisyon + BSMV</Typography>
            <Typography variant="h5" fontWeight="bold" color="#ef4444">
              -{formatCurrency(ozet.toplamKomisyon + ozet.toplamBSMV)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (Kom: {formatCurrency(ozet.toplamKomisyon)} + BSMV: {formatCurrency(ozet.toplamBSMV)})
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, bgcolor: '#f5f3ff', borderLeft: '4px solid #8b5cf6' }}>
            <Typography variant="caption" color="text.secondary">Net Transfer Tutarı</Typography>
            <Typography variant="h5" fontWeight="bold" color="#8b5cf6">
              {formatCurrency(ozet.toplamNetTutar)}
            </Typography>
          </Paper>
        </Box>

        {/* Bekleyen Hareketler */}
        {ozet.adet > 0 ? (
          <>
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#fffbeb', border: '1px solid #f59e0b' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Warning sx={{ color: '#f59e0b' }} />
                <Typography variant="subtitle1" fontWeight="bold" color="#f59e0b">
                  Transfer Bilgilendirmesi
                </Typography>
              </Box>
              <Typography variant="body2">
                1 günden eski {ozet.adet} adet kredi kartı tahsilatı transfer edilmeyi bekliyor.
                Transfer işlemi sonrasında <strong>{formatCurrency(ozet.toplamNetTutar)}</strong> tutarında 
                virman hareketi <strong>{kasa.bagliKasa?.kasaAdi}</strong> hesabına aktarılacaktır.
              </Typography>
            </Paper>

            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cari</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Brüt Tutar</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Komisyon</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>BSMV</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Net Tutar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bekleyenTransfer.hareketler.map((hareket) => (
                    <TableRow key={hareket.id} hover>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDateTime(hareket.tarih)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {hareket.cari?.unvan || hareket.aciklama || '-'}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(hareket.tutar)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" color="error">
                          -{formatCurrency(hareket.komisyonTutari || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" color="error">
                          -{formatCurrency(hareket.bsmvTutari || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="700" color="success.main">
                          {formatCurrency(hareket.netTutar || 0)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#f9fafb' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 700 }}>TOPLAM</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatCurrency(ozet.toplamBrutTutar)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#ef4444' }}>
                      -{formatCurrency(ozet.toplamKomisyon)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#ef4444' }}>
                      -{formatCurrency(ozet.toplamBSMV)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#10b981' }}>
                      {formatCurrency(ozet.toplamNetTutar)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SwapHoriz />}
                onClick={() => setOpenConfirm(true)}
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  px: 4,
                  py: 1.5,
                }}
              >
                Transfer İşlemini Başlat ({formatCurrency(ozet.toplamNetTutar)})
              </Button>
            </Box>
          </>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Transfer Edilecek İşlem Yok
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1 günden eski bekleyen kredi kartı tahsilatı bulunamadı.
            </Typography>
          </Paper>
        )}

        {/* Confirm Dialog */}
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            Transfer Onayı
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Transfer işlemi geri alınamaz!
            </Alert>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>{ozet.adet} adet</strong> kredi kartı tahsilatını transfer etmek üzeresiniz:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9fafb' }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Toplam Brüt Tutar:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(ozet.toplamBrutTutar)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="error">Toplam Komisyon:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error">
                    -{formatCurrency(ozet.toplamKomisyon)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="error">Toplam BSMV:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error">
                    -{formatCurrency(ozet.toplamBSMV)}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Net Transfer Tutarı:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {formatCurrency(ozet.toplamNetTutar)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Bu tutar <strong>{kasa?.bagliKasa?.kasaAdi}</strong> hesabına aktarılacaktır.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>İptal</Button>
            <Button 
              onClick={handleTransfer} 
              variant="contained" 
              color="success"
              disabled={transferring}
              startIcon={transferring ? <CircularProgress size={16} /> : <SwapHoriz />}
            >
              {transferring ? 'Transfer Ediliyor...' : 'Transfer Et'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}

