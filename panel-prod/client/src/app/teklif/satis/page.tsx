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
  Menu,
  MenuItem,
} from '@mui/material';
import { Add, Search, Visibility, Edit, Delete, MoreVert, ShoppingCart, Print as PrintIcon } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
}

interface Teklif {
  id: string;
  teklifNo: string;
  teklifTipi: 'SATIS' | 'SATIN_ALMA';
  tarih: string;
  gecerlilikTarihi: string | null;
  cari: Cari;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  durum: 'TEKLIF' | 'ONAYLANDI' | 'REDDEDILDI' | 'SIPARISE_DONUSTU';
  iskonto?: number;
  aciklama?: string;
  siparisId?: string | null;
}

const durumRenkleri: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  TEKLIF: 'default',
  ONAYLANDI: 'info',
  REDDEDILDI: 'error',
  SIPARISE_DONUSTU: 'success',
};

const durumMetinleri: Record<string, string> = {
  TEKLIF: 'Teklif',
  ONAYLANDI: 'Onaylandı',
  REDDEDILDI: 'Reddedildi',
  SIPARISE_DONUSTU: 'Siparişe Dönüştü',
};

export default function SatisTeklifleriPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [teklifler, setTeklifler] = useState<Teklif[]>([]);
  const [loading, setLoading] = useState(false);
  const [durumFilter, setDurumFilter] = useState<'ALL' | 'TEKLIF' | 'ONAYLANDI' | 'REDDEDILDI' | 'SIPARISE_DONUSTU'>('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTeklif, setSelectedTeklif] = useState<Teklif | null>(null);

  useEffect(() => {
    fetchTeklifler();
  }, [searchTerm]);

  const fetchTeklifler = async () => {
    try {
      setLoading(true);
      const params: any = {
        teklifTipi: 'SATIS',
      };
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      console.log('Fetching teklifler with params:', params);
      const response = await axios.get('/teklif', { params });
      console.log('Teklifler response:', response.data);
      setTeklifler(response.data.data || []);
    } catch (error: any) {
      console.error('Teklif yükleme hatası:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      // API yoksa boş liste göster
      if (error.response?.status === 404) {
        setTeklifler([]);
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Teklifler yüklenirken hata oluştu';
        showSnackbar(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, teklif: Teklif) => {
    setAnchorEl(event.currentTarget);
    setSelectedTeklif(teklif);
  };

  const handleMenuClose = (event?: {}, reason?: string) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return;
    }
    setAnchorEl(null);
  };

  const handleDurumChange = async (yeniDurum: string) => {
    if (!selectedTeklif) return;
    
    try {
      await axios.put(`/teklif/${selectedTeklif.id}/durum`, { durum: yeniDurum });
      showSnackbar(`Teklif durumu "${durumMetinleri[yeniDurum]}" olarak güncellendi`, 'success');
      fetchTeklifler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Durum değiştirilirken hata oluştu', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const handleConvertToSiparis = async () => {
    if (!selectedTeklif) return;
    
    if (!confirm('Bu teklifi siparişe dönüştürmek istediğinizden emin misiniz?')) {
      handleMenuClose();
      return;
    }
    
    try {
      const response = await axios.post(`/teklif/${selectedTeklif.id}/siparise-donustur`);
      showSnackbar('Teklif başarıyla siparişe dönüştürüldü', 'success');
      setTimeout(() => {
        router.push(`/siparis/satis/duzenle/${response.data.siparisId}`);
      }, 1500);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Teklif siparişe dönüştürülürken hata oluştu', 'error');
    } finally {
      handleMenuClose();
    }
  };

  

  const handlePrint = (teklif: Teklif) => {
    router.push(`/teklif/satis/print/${teklif.id}`);
  };

  const handleDelete = async () => {
    if (!selectedTeklif) return;
    
    if (!confirm('Bu teklifi silmek istediğinizden emin misiniz?')) {
      handleMenuClose();
      return;
    }
    
    try {
      await axios.delete(`/teklif/${selectedTeklif.id}`);
      showSnackbar('Teklif başarıyla silindi', 'success');
      fetchTeklifler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Teklif silinirken hata oluştu', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, overflowX: 'auto', width: '100%', maxWidth: '100vw' }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 3,
          gap: { xs: 2, sm: 0 },
        }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}>
              Satış Teklifleri
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Müşterilere sunulan teklifleri yönetin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/teklif/satis/yeni')}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Yeni Teklif
          </Button>
        </Box>

        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Teklif No, Cari Unvan veya Cari Kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            <Chip
              label="Tümü"
              color={durumFilter === 'ALL' ? 'primary' : 'default'}
              onClick={() => setDurumFilter('ALL')}
              size="small"
            />
            <Chip label="Teklif" color={durumFilter === 'TEKLIF' ? 'primary' : 'default'} onClick={() => setDurumFilter('TEKLIF')} size="small" />
            <Chip label="Onaylandı" color={durumFilter === 'ONAYLANDI' ? 'primary' : 'default'} onClick={() => setDurumFilter('ONAYLANDI')} size="small" />
            <Chip label="Reddedildi" color={durumFilter === 'REDDEDILDI' ? 'primary' : 'default'} onClick={() => setDurumFilter('REDDEDILDI')} size="small" />
            <Chip 
              label="Siparişe Dönüştü" 
              color={durumFilter === 'SIPARISE_DONUSTU' ? 'primary' : 'default'} 
              onClick={() => setDurumFilter('SIPARISE_DONUSTU')} 
              size="small"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            />
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer 
            component={Paper}
            sx={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
            }}
          >
            <Table sx={{ minWidth: { xs: '800px', sm: 'auto' } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                  }}>Teklif No</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    whiteSpace: 'nowrap',
                  }}>Tarih</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    whiteSpace: 'nowrap',
                    display: { xs: 'none', md: 'table-cell' },
                  }}>Geçerlilik Tarihi</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    whiteSpace: 'nowrap',
                  }}>Cari</TableCell>
                  <TableCell align="right" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    whiteSpace: 'nowrap',
                  }}>Tutar</TableCell>
                  <TableCell align="right" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    whiteSpace: 'nowrap',
                    display: { xs: 'none', lg: 'table-cell' },
                  }}>KDV</TableCell>
                  <TableCell align="right" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                  }}>Genel Toplam</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    whiteSpace: 'nowrap',
                  }}>Durum</TableCell>
                  <TableCell align="center" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    whiteSpace: 'nowrap',
                  }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teklifler.filter(t => durumFilter === 'ALL' ? true : t.durum === durumFilter).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Teklif bulunamadı</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  teklifler
                    .filter(t => durumFilter === 'ALL' ? true : t.durum === durumFilter)
                    .map((teklif) => (
                    <TableRow key={teklif.id} hover>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        <Typography variant="body2" fontWeight="600">
                          {teklif.teklifNo}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatDate(teklif.tarih)}
                      </TableCell>
                      <TableCell sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: { xs: 'none', md: 'table-cell' },
                      }}>
                        {teklif.gecerlilikTarihi ? formatDate(teklif.gecerlilikTarihi) : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {teklif.cari.unvan}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          {teklif.cari.cariKodu}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatCurrency(teklif.toplamTutar)}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: { xs: 'none', lg: 'table-cell' },
                      }}>
                        {formatCurrency(teklif.kdvTutar)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {formatCurrency(teklif.genelToplam)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        <Chip
                          label={durumMetinleri[teklif.durum]}
                          color={durumRenkleri[teklif.durum]}
                          size="small"
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/teklif/satis/duzenle/${teklif.id}`)}
                          disabled={teklif.durum === 'SIPARISE_DONUSTU' || teklif.durum === 'REDDEDILDI'}
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handlePrint(teklif)}
                          color="primary"
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, teklif)}
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          disableAutoFocusItem
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {selectedTeklif && selectedTeklif.durum !== 'SIPARISE_DONUSTU' && (
            [
              selectedTeklif.durum === 'TEKLIF' && (
                <MenuItem 
                  key="onaylandi" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDurumChange('ONAYLANDI');
                  }}
                >
                  Onaylandı Olarak İşaretle
                </MenuItem>
              ),
              selectedTeklif.durum === 'TEKLIF' && (
                <MenuItem 
                  key="reddedildi" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDurumChange('REDDEDILDI');
                  }}
                >
                  Reddedildi Olarak İşaretle
                </MenuItem>
              ),
              selectedTeklif.durum === 'TEKLIF' && (
                <MenuItem 
                  key="siparise-donustur-teklif" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConvertToSiparis();
                  }}
                >
                  <ShoppingCart sx={{ mr: 1 }} fontSize="small" />
                  Siparişe Dönüştür
                </MenuItem>
              ),
              selectedTeklif.durum === 'ONAYLANDI' && (
                <MenuItem 
                  key="siparise-donustur-onaylandi" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConvertToSiparis();
                  }}
                >
                  <ShoppingCart sx={{ mr: 1 }} fontSize="small" />
                  Siparişe Dönüştür
                </MenuItem>
              ),
            ].filter(Boolean)
          )}
          {selectedTeklif && selectedTeklif.siparisId && (
            <MenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClose();
                router.push(`/siparis/satis/duzenle/${selectedTeklif.siparisId}`);
              }}
            >
              <Visibility sx={{ mr: 1 }} fontSize="small" />
              İlgili Siparişi Görüntüle
            </MenuItem>
          )}
          <MenuItem 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Sil
          </MenuItem>
        </Menu>

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

