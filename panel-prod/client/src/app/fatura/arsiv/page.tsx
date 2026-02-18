'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
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
  TextField,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { Search, Restore, Visibility, Delete as DeleteForeverIcon } from '@mui/icons-material';
import axios from '@/lib/axios';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

interface Fatura {
  id: string;
  faturaNo: string;
  faturaTipi: 'SATIS' | 'ALIS';
  tarih: string;
  vade?: string;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  durum: string;
  deletedAt: string;
  deletedByUser?: {
    id: string;
    fullName: string;
    username: string;
  };
  cari: {
    id: string;
    cariKodu: string;
    unvan: string;
  };
  kalemler?: FaturaKalemi[];
}

interface FaturaKalemi {
  id: string;
  stokId: string;
  stok?: {
    id: string;
    stokKodu: string;
    stokAdi: string;
    birim: string;
  };
  miktar: number;
  birimFiyat: number;
  kdvOrani: number;
  tutar?: number;
  kdvTutar?: number;
}

function FaturaArsivContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = (searchParams.get('tab') as 'SATIS' | 'ALIS') || 'SATIS';

  const [activeTab, setActiveTab] = useState<'SATIS' | 'ALIS'>(initialTab);
  const [faturalar, setFaturalar] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);
  const [openView, setOpenView] = useState(false);
  const [openRestore, setOpenRestore] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentDetailId, setCurrentDetailId] = useState<string | null>(null);

  const updateUrl = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      router.replace(query ? `/fatura/arsiv?${query}` : '/fatura/arsiv', { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    fetchDeletedFaturalar();
  }, [activeTab]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && (tabParam === 'SATIS' || tabParam === 'ALIS') && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  const fetchDeletedFaturalar = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/fatura/deleted', {
        params: {
          faturaTipi: activeTab,
          search: searchTerm,
          limit: 100,
        },
      });
      setFaturalar(response.data.data || []);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Faturalar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedFatura) return;

    try {
      await axios.put(`/fatura/${selectedFatura.id}/restore`);
      showSnackbar('Fatura başarıyla geri yüklendi', 'success');
      setOpenRestore(false);
      fetchDeletedFaturalar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Geri yükleme sırasında hata oluştu', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount: number | null | undefined) => {
    const value = typeof amount === 'number' ? amount : Number(amount ?? 0);
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const loadFaturaDetay = useCallback(
    async (id: string) => {
      try {
        setDetailLoading(true);
        const response = await axios.get<Fatura>(`/fatura/${id}`);
        setSelectedFatura(response.data);
        setCurrentDetailId(id);
        setOpenView(true);
      } catch (error: any) {
        console.error('Fatura detayı yüklenemedi:', error);
        showSnackbar(error.response?.data?.message || 'Fatura detayı yüklenirken bir hata oluştu', 'error');
        setSelectedFatura(null);
        setOpenView(false);
        const params = new URLSearchParams(searchParams.toString());
        params.delete('view');
        updateUrl(params);
      } finally {
        setDetailLoading(false);
      }
    },
    [searchParams, updateUrl],
  );

  const openViewDialog = (fatura: Fatura) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', fatura.id);
    params.set('tab', activeTab);
    updateUrl(params);
    setDetailLoading(true);
    setOpenView(true);
  };

  const openRestoreDialog = (fatura: Fatura) => {
    setSelectedFatura(fatura);
    setOpenRestore(true);
  };

  useEffect(() => {
    const viewParam = searchParams.get('view');

    if (viewParam) {
      if (viewParam !== currentDetailId) {
        loadFaturaDetay(viewParam);
      } else {
        setOpenView(true);
      }
    } else {
      setOpenView(false);
      setSelectedFatura(null);
      setCurrentDetailId(null);
      setDetailLoading(false);
    }
  }, [searchParams, currentDetailId, loadFaturaDetay]);

  const kalemRows = useMemo(() => {
    if (!selectedFatura?.kalemler || selectedFatura.kalemler.length === 0) {
      return [];
    }

    return selectedFatura.kalemler.map((kalem) => {
      const miktar = Number(kalem.miktar ?? 0);
      const birimFiyat = Number(kalem.birimFiyat ?? 0);
      const tutar = kalem.tutar != null ? Number(kalem.tutar) : miktar * birimFiyat;
      const kdvTutar = kalem.kdvTutar != null ? Number(kalem.kdvTutar) : (tutar * kalem.kdvOrani) / 100;

      return {
        ...kalem,
        miktar,
        birimFiyat,
        tutar,
        kdvTutar,
      };
    });
  }, [selectedFatura?.kalemler]);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
              📦 Fatura Arşivi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Silinmiş faturaları görüntüleyin ve geri yükleyin
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, value) => {
              setActiveTab(value);
              const params = new URLSearchParams(searchParams.toString());
              params.set('tab', value);
              params.delete('view');
              updateUrl(params);
            }}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.95rem',
              },
            }}
          >
            <Tab 
              label="💜 Satış Faturaları" 
              value="SATIS"
              sx={{
                '&.Mui-selected': {
                  color: '#8b5cf6',
                },
              }}
            />
            <Tab 
              label="🟠 Satın Alma Faturaları" 
              value="ALIS"
              sx={{
                '&.Mui-selected': {
                  color: '#f59e0b',
                },
              }}
            />
          </Tabs>
        </Paper>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Fatura No veya Cari Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchDeletedFaturalar()}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                fetchDeletedFaturalar();
                const params = new URLSearchParams(searchParams.toString());
                if (searchTerm) {
                  params.set('search', searchTerm);
                } else {
                  params.delete('search');
                }
                updateUrl(params);
              }}
              sx={{ minWidth: 100 }}
            >
              Ara
            </Button>
          </Box>
        </Paper>

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Fatura No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cari</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Tutar</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Silme Tarihi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Silen Kullanıcı</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Yükleniyor...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : faturalar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      Silinmiş fatura bulunamadı
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {activeTab === 'SATIS' ? 'Satış' : 'Satın Alma'} faturaları arşivinde kayıt yok
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                faturalar.map((fatura) => (
                  <TableRow
                    key={fatura.id}
                    hover
                    sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}
                  >
                    <TableCell>
                      <Tooltip title="Yeni sekmede aç">
                        <Link
                          href={`/fatura/arsiv?tab=${activeTab}&view=${fatura.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: activeTab === 'SATIS' ? '#8b5cf6' : '#f59e0b', fontWeight: 600 }}
                        >
                          {fatura.faturaNo}
                        </Link>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{formatDate(fatura.tarih)}</TableCell>
                    <TableCell>{fatura.cari.unvan}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="600">
                        {formatCurrency(fatura.genelToplam)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(fatura.deletedAt).toLocaleString('tr-TR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {fatura.deletedByUser?.fullName || 'Sistem'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({fatura.deletedByUser?.username || '-'})
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Görüntüle">
                          <IconButton
                            size="small"
                            onClick={() => openViewDialog(fatura)}
                            sx={{
                              color: '#3b82f6',
                              '&:hover': { bgcolor: '#eff6ff' }
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Geri Yükle">
                          <IconButton
                            size="small"
                            onClick={() => openRestoreDialog(fatura)}
                            sx={{
                              color: '#10b981',
                              '&:hover': { bgcolor: '#ecfdf5' }
                            }}
                          >
                            <Restore fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* View Dialog */}
        <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>
            Fatura Detayı (Silinmiş)
          </DialogTitle>
          <DialogContent>
            {detailLoading ? (
              <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : selectedFatura ? (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Chip 
                    label="SİLİNMİŞ" 
                    color="error" 
                    size="small" 
                    sx={{ mb: 2, fontWeight: 600 }} 
                  />
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="body2" color="text.secondary">Fatura No:</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedFatura.faturaNo}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="body2" color="text.secondary">Tarih:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatDate(selectedFatura.tarih)}
                      </Typography>
                    </Box>
                    {selectedFatura.vade && (
                      <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Typography variant="body2" color="text.secondary">Vade:</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formatDate(selectedFatura.vade)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Cari:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedFatura.cari.unvan}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedFatura.cari.cariKodu}
                    </Typography>
                  </Box>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fef2f2' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Silme Bilgileri:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Silen:</strong> {selectedFatura.deletedByUser?.fullName || 'Sistem'}
                      {' '}({selectedFatura.deletedByUser?.username || '-'})
                    </Typography>
                    <Typography variant="body2">
                      <strong>Silme Tarihi:</strong> {new Date(selectedFatura.deletedAt).toLocaleString('tr-TR')}
                    </Typography>
                  </Paper>
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    Kalemler
                  </Typography>
                  {kalemRows.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Bu fatura için kalem bilgisi bulunamadı.
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 360 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Stok Kodu</TableCell>
                            <TableCell>Ürün</TableCell>
                            <TableCell align="right">Miktar</TableCell>
                            <TableCell align="center">Birim</TableCell>
                            <TableCell align="right">Birim Fiyat</TableCell>
                            <TableCell align="right">KDV (%)</TableCell>
                            <TableCell align="right">KDV Tutarı</TableCell>
                            <TableCell align="right">Tutar</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {kalemRows.map((kalem) => (
                            <TableRow key={kalem.id} hover>
                              <TableCell>{kalem.stok?.stokKodu || '-'}</TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {kalem.stok?.stokAdi || '—'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">{kalem.miktar.toLocaleString('tr-TR')}</TableCell>
                              <TableCell align="center">{kalem.stok?.birim || 'Adet'}</TableCell>
                              <TableCell align="right">{formatCurrency(kalem.birimFiyat)}</TableCell>
                              <TableCell align="right">{kalem.kdvOrani}%</TableCell>
                              <TableCell align="right">{formatCurrency(kalem.kdvTutar)}</TableCell>
                              <TableCell align="right">{formatCurrency(kalem.tutar)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                Fatura detayı bulunamadı.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenView(false);
                const params = new URLSearchParams(searchParams.toString());
                params.delete('view');
                updateUrl(params);
              }}
            >
              Kapat
            </Button>
          </DialogActions>
        </Dialog>

        {/* Restore Dialog */}
        <Dialog
          open={openRestore}
          onClose={() => {
            setOpenRestore(false);
            const params = new URLSearchParams(searchParams.toString());
            params.delete('view');
            updateUrl(params);
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>Fatura Geri Yükle</DialogTitle>
          <DialogContent>
            <Typography>
              <strong>{selectedFatura?.faturaNo}</strong> nolu faturayı geri yüklemek istediğinizden emin misiniz?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Fatura aktif faturalar listesine geri dönecek.
              {selectedFatura?.durum === 'ONAYLANDI' && (
                <strong> Onaylanmış bir fatura olduğu için stok ve cari işlemleri de geri yüklenecektir.</strong>
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRestore(false)}>İptal</Button>
            <Button onClick={handleRestore} variant="contained" color="success">
              Geri Yükle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
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

export default function FaturaArsivPage() {
  return (
    <Suspense
      fallback={(
        <MainLayout>
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </MainLayout>
      )}
    >
      <FaturaArsivContent />
    </Suspense>
  );
}

