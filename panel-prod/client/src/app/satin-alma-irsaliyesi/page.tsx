'use client';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { Add, MoreVert, Print as PrintIcon, Search, Visibility } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
}

interface SatinAlmaIrsaliyesi {
  id: string;
  irsaliyeNo: string;
  irsaliyeTarihi: string;
  cari: Cari;
  durum: 'FATURALANMADI' | 'FATURALANDI';
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  kaynakTip: 'SIPARIS' | 'DOGRUDAN' | 'FATURA_OTOMATIK';
  kaynakSiparis?: {
    id: string;
    siparisNo: string;
  };
  createdAt?: string;
}

export default function SatinAlmaIrsaliyeleriPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [irsaliyeler, setIrsaliyeler] = useState<SatinAlmaIrsaliyesi[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedIrsaliye, setSelectedIrsaliye] = useState<SatinAlmaIrsaliyesi | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIrsaliyeForMenu, setSelectedIrsaliyeForMenu] = useState<SatinAlmaIrsaliyesi | null>(null);

  useEffect(() => {
    fetchIrsaliyeler();
  }, []);

  const fetchIrsaliyeler = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/satin-alma-irsaliyesi', {
        params: {
          search: searchTerm,
        },
      });
      setIrsaliyeler(response.data.data || []);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Satın alma irsaliyeleri yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchIrsaliyeler();
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, irsaliye: SatinAlmaIrsaliyesi) => {
    setAnchorEl(event.currentTarget);
    setSelectedIrsaliyeForMenu(irsaliye);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedIrsaliyeForMenu(null);
  };

  const handleDelete = async () => {
    if (!selectedIrsaliye) return;

    try {
      setLoading(true);
      await axios.delete(`/satin-alma-irsaliyesi/${selectedIrsaliye.id}`);
      showSnackbar('Satın alma irsaliyesi başarıyla silindi', 'success');
      setOpenDelete(false);
      fetchIrsaliyeler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Satın alma irsaliyesi silinirken hata oluştu', 'error');
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
      case 'FATURALANDI':
        return 'success';
      case 'FATURALANMADI':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDurumLabel = (durum: string) => {
    switch (durum) {
      case 'FATURALANDI':
        return 'Faturalandı';
      case 'FATURALANMADI':
        return 'Faturalanmadı';
      default:
        return durum;
    }
  };

  const getKaynakTipLabel = (kaynakTip: string) => {
    switch (kaynakTip) {
      case 'SIPARIS':
        return 'Sipariş';
      case 'DOGRUDAN':
        return 'Doğrudan';
      case 'FATURA_OTOMATIK':
        return 'Fatura Otomatik';
      default:
        return kaynakTip;
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Satın Alma İrsaliyeleri
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/satin-alma-irsaliyesi/yeni')}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            }}
          >
            Yeni Satın Alma İrsaliyesi
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="İrsaliye No, Cari Adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="outlined"
              onClick={handleSearch}
            >
              Ara
            </Button>
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600 }}>İrsaliye No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cari</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Sipariş No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Kaynak Tip</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Toplam Tutar</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>KDV</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Genel Toplam</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {irsaliyeler.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Satın alma irsaliyesi bulunamadı
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  irsaliyeler.map((irsaliye) => (
                    <TableRow key={irsaliye.id} hover>
                      <TableCell>{irsaliye.irsaliyeNo}</TableCell>
                      <TableCell>{formatDate(irsaliye.irsaliyeTarihi)}</TableCell>
                      <TableCell>{irsaliye.cari?.unvan || '-'}</TableCell>
                      <TableCell>
                        {irsaliye.kaynakSiparis?.siparisNo ? (
                          <Typography variant="body2" color="text.secondary">
                            {irsaliye.kaynakSiparis.siparisNo}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getKaynakTipLabel(irsaliye.kaynakTip)}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(irsaliye.toplamTutar)}</TableCell>
                      <TableCell align="right">{formatCurrency(irsaliye.kdvTutar)}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(irsaliye.genelToplam)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getDurumLabel(irsaliye.durum)}
                          size="small"
                          color={getDurumColor(irsaliye.durum) as any}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/satin-alma-irsaliyesi/${irsaliye.id}`)}
                            sx={{
                              color: '#3b82f6',
                              '&:hover': { bgcolor: '#eff6ff' }
                            }}
                            title="Görüntüle"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/satin-alma-irsaliyesi/print/${irsaliye.id}`)}
                            sx={{
                              color: '#10b981',
                              '&:hover': { bgcolor: '#ecfdf5' }
                            }}
                            title="Yazdır"
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, irsaliye)}
                          >
                            <MoreVert fontSize="small" />
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

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          disableAutoFocusItem
        >
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClose();
              if (selectedIrsaliyeForMenu) router.push(`/satin-alma-irsaliyesi/${selectedIrsaliyeForMenu.id}`);
            }}
          >
            Görüntüle
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClose();
              if (selectedIrsaliyeForMenu) router.push(`/satin-alma-irsaliyesi/print/${selectedIrsaliyeForMenu.id}`);
            }}
          >
            Yazdır
          </MenuItem>
          {selectedIrsaliyeForMenu?.durum === 'FATURALANMADI' && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClose();
                if (selectedIrsaliyeForMenu) router.push(`/fatura/alis/yeni?irsaliyeId=${selectedIrsaliyeForMenu.id}`);
              }}
            >
              Faturalandır
            </MenuItem>
          )}
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClose();
              if (selectedIrsaliyeForMenu) router.push(`/satin-alma-irsaliyesi/${selectedIrsaliyeForMenu.id}/duzenle`);
            }}
          >
            Düzenle
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClose();
              setSelectedIrsaliye(selectedIrsaliyeForMenu);
              setOpenDelete(true);
            }}
            sx={{ color: '#ef4444' }}
          >
            Sil
          </MenuItem>
        </Menu>

        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle>Satın Alma İrsaliye Sil</DialogTitle>
          <DialogContent>
            <Typography>
              <strong>{selectedIrsaliye?.irsaliyeNo}</strong> numaralı satın alma irsaliyesini silmek istediğinizden emin misiniz?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Bu işlem geri alınamaz.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDelete(false)}>İptal</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Sil
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
