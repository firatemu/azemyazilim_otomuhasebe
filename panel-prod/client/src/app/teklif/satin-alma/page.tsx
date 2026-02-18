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
import { Add, Search, Visibility, Edit, Delete, MoreVert, ShoppingCart } from '@mui/icons-material';
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

export default function SatinAlmaTeklifleriPage() {
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
        teklifTipi: 'SATIN_ALMA',
      };
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const response = await axios.get('/teklif', { params });
      setTeklifler(response.data.data || []);
    } catch (error: any) {
      console.error('Teklif yükleme hatası:', error);
      // API yoksa boş liste göster
      if (error.response?.status === 404) {
        setTeklifler([]);
      } else {
        showSnackbar(error.response?.data?.message || 'Teklifler yüklenirken hata oluştu', 'error');
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

  const handleMenuClose = () => {
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
        router.push(`/siparis/satin-alma/duzenle/${response.data.siparisId}`);
      }, 1500);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Teklif siparişe dönüştürülürken hata oluştu', 'error');
    } finally {
      handleMenuClose();
    }
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
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Satın Alma Teklifleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tedarikçilerden gelen teklifleri yönetin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/teklif/satin-alma/yeni')}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
          >
            Yeni Teklif
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Teklif No, Cari Unvan veya Cari Kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
            <Chip
              label="Tümü"
              color={durumFilter === 'ALL' ? 'primary' : 'default'}
              onClick={() => setDurumFilter('ALL')}
              size="small"
            />
            <Chip label="Teklif" color={durumFilter === 'TEKLIF' ? 'primary' : 'default'} onClick={() => setDurumFilter('TEKLIF')} size="small" />
            <Chip label="Onaylandı" color={durumFilter === 'ONAYLANDI' ? 'primary' : 'default'} onClick={() => setDurumFilter('ONAYLANDI')} size="small" />
            <Chip label="Reddedildi" color={durumFilter === 'REDDEDILDI' ? 'primary' : 'default'} onClick={() => setDurumFilter('REDDEDILDI')} size="small" />
            <Chip label="Siparişe Dönüştü" color={durumFilter === 'SIPARISE_DONUSTU' ? 'primary' : 'default'} onClick={() => setDurumFilter('SIPARISE_DONUSTU')} size="small" />
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teklif No</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Geçerlilik Tarihi</TableCell>
                  <TableCell>Tedarikçi</TableCell>
                  <TableCell align="right">Tutar</TableCell>
                  <TableCell align="right">KDV</TableCell>
                  <TableCell align="right">Genel Toplam</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
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
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {teklif.teklifNo}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(teklif.tarih)}</TableCell>
                      <TableCell>
                        {teklif.gecerlilikTarihi ? formatDate(teklif.gecerlilikTarihi) : '-'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{teklif.cari.unvan}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {teklif.cari.cariKodu}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(teklif.toplamTutar)}</TableCell>
                      <TableCell align="right">{formatCurrency(teklif.kdvTutar)}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(teklif.genelToplam)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={durumMetinleri[teklif.durum]}
                          color={durumRenkleri[teklif.durum]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/teklif/satin-alma/duzenle/${teklif.id}`)}
                          disabled={teklif.durum === 'SIPARISE_DONUSTU' || teklif.durum === 'REDDEDILDI'}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, teklif)}
                        >
                          <MoreVert />
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
        >
          {selectedTeklif && selectedTeklif.durum !== 'SIPARISE_DONUSTU' && (
            [
              selectedTeklif.durum === 'TEKLIF' && (
                <MenuItem key="onaylandi" onClick={() => handleDurumChange('ONAYLANDI')}>
                  Onaylandı Olarak İşaretle
                </MenuItem>
              ),
              selectedTeklif.durum === 'TEKLIF' && (
                <MenuItem key="reddedildi" onClick={() => handleDurumChange('REDDEDILDI')}>
                  Reddedildi Olarak İşaretle
                </MenuItem>
              ),
              selectedTeklif.durum === 'TEKLIF' && (
                <MenuItem key="siparise-donustur-teklif" onClick={handleConvertToSiparis}>
                  <ShoppingCart sx={{ mr: 1 }} fontSize="small" />
                  Siparişe Dönüştür
                </MenuItem>
              ),
              selectedTeklif.durum === 'ONAYLANDI' && (
                <MenuItem key="siparise-donustur-onaylandi" onClick={handleConvertToSiparis}>
                  <ShoppingCart sx={{ mr: 1 }} fontSize="small" />
                  Siparişe Dönüştür
                </MenuItem>
              ),
            ].filter(Boolean)
          )}
          {selectedTeklif && selectedTeklif.siparisId && (
            <MenuItem onClick={() => router.push(`/siparis/satin-alma/duzenle/${selectedTeklif.siparisId}`)}>
              <Visibility sx={{ mr: 1 }} fontSize="small" />
              İlgili Siparişi Görüntüle
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete}>
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

