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
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { ArrowBack, Visibility, CheckCircle, Delete, FileDownload, PictureAsPdf, TableChart } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Sayim {
  id: string;
  sayimNo: string;
  sayimTipi: 'URUN_BAZLI' | 'RAF_BAZLI';
  tarih: string;
  durum: 'TASLAK' | 'TAMAMLANDI' | 'ONAYLANDI' | 'IPTAL';
  _count: {
    kalemler: number;
  };
  createdByUser?: {
    fullName: string;
  };
}

interface SayimDetay extends Sayim {
  kalemler: Array<{
    stok: {
      stokKodu: string;
      stokAdi: string;
    };
    location?: {
      code: string;
    };
    sistemMiktari: number;
    sayilanMiktar: number;
    farkMiktari: number;
  }>;
}

const durumRenkleri: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  TASLAK: 'default',
  TAMAMLANDI: 'warning',
  ONAYLANDI: 'success',
  IPTAL: 'error',
};

const durumMetinleri: Record<string, string> = {
  TASLAK: 'Taslak',
  TAMAMLANDI: 'Tamamlandı',
  ONAYLANDI: 'Onaylandı',
  IPTAL: 'İptal',
};

export default function SayimListePage() {
  const router = useRouter();
  const [sayimlar, setSayimlar] = useState<Sayim[]>([]);
  const [selectedSayim, setSelectedSayim] = useState<SayimDetay | null>(null);
  const [detayDialog, setDetayDialog] = useState(false);
  const [onayDialog, setOnayDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchSayimlar();
  }, []);

  const fetchSayimlar = async () => {
    try {
      const response = await axios.get('/sayim');
      setSayimlar(response.data || []);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sayımlar yüklenirken hata', 'error');
    }
  };

  const fetchSayimDetay = async (id: string) => {
    try {
      const response = await axios.get(`/sayim/${id}`);
      setSelectedSayim(response.data);
      setDetayDialog(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Detay yüklenirken hata', 'error');
    }
  };

  const handleTamamla = async (id: string) => {
    if (!confirm('Bu sayımı tamamlamak istediğinizden emin misiniz?')) return;
    
    try {
      setLoading(true);
      await axios.put(`/sayim/${id}/tamamla`);
      showSnackbar('Sayım tamamlandı! Onay için hazır.', 'success');
      fetchSayimlar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Tamamlama hatası', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOnayla = async () => {
    if (!selectedSayim) return;
    
    try {
      setLoading(true);
      await axios.put(`/sayim/${selectedSayim.id}/onayla`);
      showSnackbar('Sayım onaylandı ve stoklar güncellendi!', 'success');
      setOnayDialog(false);
      setDetayDialog(false);
      fetchSayimlar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Onaylama hatası', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sayımı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await axios.delete(`/sayim/${id}`);
      showSnackbar('Sayım silindi', 'success');
      fetchSayimlar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme hatası', 'error');
    }
  };

  const handleExportExcel = async (id: string, sayimNo: string) => {
    try {
      const response = await axios.get(`/sayim/${id}/export/excel`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sayim_${sayimNo}_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSnackbar('Excel dosyası indirildi', 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Excel indirme hatası', 'error');
    }
  };

  const handleExportPdf = async (id: string, sayimNo: string) => {
    try {
      const response = await axios.get(`/sayim/${id}/export/pdf`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sayim_${sayimNo}_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSnackbar('PDF dosyası indirildi', 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'PDF indirme hatası', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => router.push('/sayim')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ ml: 2 }} fontWeight="bold">
            Sayım Listesi
          </Typography>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sayım No</TableCell>
                <TableCell>Tip</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Kalem Sayısı</TableCell>
                <TableCell>Oluşturan</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sayimlar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    Sayım bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                sayimlar.map((sayim) => (
                  <TableRow key={sayim.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{sayim.sayimNo}</TableCell>
                    <TableCell>
                      <Chip
                        label={sayim.sayimTipi === 'URUN_BAZLI' ? 'Ürün Bazlı' : 'Raf Bazlı'}
                        size="small"
                        color={sayim.sayimTipi === 'URUN_BAZLI' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(sayim.tarih)}</TableCell>
                    <TableCell>{sayim._count.kalemler}</TableCell>
                    <TableCell>{sayim.createdByUser?.fullName || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={durumMetinleri[sayim.durum]}
                        color={durumRenkleri[sayim.durum]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => fetchSayimDetay(sayim.id)} title="Detay">
                        <Visibility />
                      </IconButton>
                      {sayim.durum === 'TASLAK' && (
                        <>
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleTamamla(sayim.id)}
                            title="Tamamla"
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(sayim.id)} title="Sil">
                            <Delete />
                          </IconButton>
                        </>
                      )}
                      {sayim.durum === 'TAMAMLANDI' && (
                        <IconButton 
                          size="small" 
                          color="success" 
                          onClick={() => {
                            fetchSayimDetay(sayim.id);
                            setTimeout(() => setOnayDialog(true), 500);
                          }}
                          title="Onayla"
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Detay Dialog */}
        <Dialog open={detayDialog} onClose={() => setDetayDialog(false)} maxWidth="md" fullWidth>
          {selectedSayim && (
            <>
              <DialogTitle component="div">
                <Box>
                  <Typography variant="h6">{selectedSayim.sayimNo}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedSayim.sayimTipi === 'URUN_BAZLI' ? 'Ürün Bazlı Sayım' : 'Raf Bazlı Sayım'}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {selectedSayim.sayimTipi === 'RAF_BAZLI' && <TableCell>Raf</TableCell>}
                        <TableCell>Ürün</TableCell>
                        <TableCell align="right">Sistem</TableCell>
                        <TableCell align="right">Sayılan</TableCell>
                        <TableCell align="right">Fark</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSayim.kalemler.map((kalem, index) => (
                        <TableRow key={index}>
                          {selectedSayim.sayimTipi === 'RAF_BAZLI' && (
                            <TableCell>
                              <Chip label={kalem.location?.code} size="small" />
                            </TableCell>
                          )}
                          <TableCell>
                            <Typography variant="body2">{kalem.stok.stokAdi}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {kalem.stok.stokKodu}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{kalem.sistemMiktari}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{kalem.sayilanMiktar}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={kalem.farkMiktari > 0 ? `+${kalem.farkMiktari}` : kalem.farkMiktari}
                              color={kalem.farkMiktari > 0 ? 'success' : kalem.farkMiktari < 0 ? 'error' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {selectedSayim.durum === 'TASLAK' && (
                  <Box sx={{ mt: 3 }}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Bu sayım taslak durumda. Tamamlamak için "Tamamla" butonuna tıklayın.
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {selectedSayim.durum === 'TAMAMLANDI' && (
                  <Box sx={{ mt: 3 }}>
                    <Alert severity="warning">
                      <Typography variant="body2">
                        Bu sayım onaylanmayı bekliyor. Onaylandığında stoklar otomatik güncellenecektir.
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {selectedSayim.durum === 'ONAYLANDI' && (
                  <Box sx={{ mt: 3 }}>
                    <Alert severity="success">
                      <Typography variant="body2">
                        Bu sayım onaylanmıştır ve stoklar güncellenmiştir.
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Box sx={{ display: 'flex', gap: 1, mr: 'auto' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TableChart />}
                    onClick={() => handleExportExcel(selectedSayim.id, selectedSayim.sayimNo)}
                  >
                    Excel
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PictureAsPdf />}
                    onClick={() => handleExportPdf(selectedSayim.id, selectedSayim.sayimNo)}
                  >
                    PDF
                  </Button>
                </Box>
                <Button onClick={() => setDetayDialog(false)}>Kapat</Button>
                {selectedSayim.durum === 'TASLAK' && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      setDetayDialog(false);
                      handleTamamla(selectedSayim.id);
                    }}
                  >
                    Sayımı Tamamla
                  </Button>
                )}
                {selectedSayim.durum === 'TAMAMLANDI' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => setOnayDialog(true)}
                  >
                    Sayımı Onayla
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Onay Dialog */}
        <Dialog open={onayDialog} onClose={() => setOnayDialog(false)}>
          <DialogTitle component="div">Sayımı Onayla</DialogTitle>
          <DialogContent>
            <Typography>
              Bu sayımı onaylamak istediğinizden emin misiniz? 
            </Typography>
            <Typography color="error" sx={{ mt: 2 }}>
              ⚠️ Onaylandığında stoklar otomatik olarak güncellenecektir!
            </Typography>
            {selectedSayim && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  • {selectedSayim.kalemler.filter(k => k.farkMiktari > 0).length} ürün için stok artacak
                </Typography>
                <Typography variant="body2">
                  • {selectedSayim.kalemler.filter(k => k.farkMiktari < 0).length} ürün için stok azalacak
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOnayDialog(false)}>İptal</Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleOnayla}
              disabled={loading}
            >
              {loading ? 'Onaylanıyor...' : 'Evet, Onayla'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}

