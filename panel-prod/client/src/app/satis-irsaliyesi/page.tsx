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

interface SatisIrsaliyesi {
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

export default function SatisIrsaliyeleriPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [irsaliyeler, setIrsaliyeler] = useState<SatisIrsaliyesi[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedIrsaliye, setSelectedIrsaliye] = useState<SatisIrsaliyesi | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIrsaliyeForMenu, setSelectedIrsaliyeForMenu] = useState<SatisIrsaliyesi | null>(null);

  useEffect(() => {
    fetchIrsaliyeler();
  }, []);

  const fetchIrsaliyeler = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/satis-irsaliyesi', {
        params: {
          search: searchTerm,
        },
      });
      setIrsaliyeler(response.data.data || []);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İrsaliyeler yüklenirken hata oluştu', 'error');
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, irsaliye: SatisIrsaliyesi) => {
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
      await axios.delete(`/satis-irsaliyesi/${selectedIrsaliye.id}`);
      showSnackbar('İrsaliye başarıyla silindi', 'success');
      setOpenDelete(false);
      fetchIrsaliyeler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İrsaliye silinirken hata oluştu', 'error');
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
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.875rem',
                color: 'var(--foreground)',
                letterSpacing: '-0.02em',
                mb: 0.5,
              }}
            >
              Satış İrsaliyeleri
            </Typography>
            <Typography 
              variant="body2" 
              sx={{
                color: 'var(--muted-foreground)',
                fontSize: '0.875rem',
              }}
            >
              Satış irsaliyelerini görüntüleyin ve yönetin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/satis-irsaliyesi/yeni')}
            sx={{
              bgcolor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
              '&:hover': {
                bgcolor: 'var(--secondary-hover)',
                boxShadow: 'var(--shadow-md)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Yeni İrsaliye
          </Button>
        </Box>

        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)',
          bgcolor: 'var(--card)',
        }}>
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
              className="form-control-textfield"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'var(--muted-foreground)' }} />,
              }}
            />
            <Button
              variant="outlined"
              onClick={handleSearch}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                '&:hover': {
                  borderColor: 'var(--primary)',
                  bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                },
              }}
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
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)',
              bgcolor: 'var(--card)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>İrsaliye No</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Cari</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Sipariş No</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Kaynak Tip</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Toplam Tutar</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>KDV</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Genel Toplam</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Durum</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {irsaliyeler.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                        İrsaliye bulunamadı
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  irsaliyeler.map((irsaliye) => (
                    <TableRow 
                      key={irsaliye.id} 
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: 'var(--muted)',
                        },
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <TableCell sx={{ color: 'var(--primary)' }}>{irsaliye.irsaliyeNo}</TableCell>
                      <TableCell sx={{ color: 'var(--foreground)' }}>{formatDate(irsaliye.irsaliyeTarihi)}</TableCell>
                      <TableCell sx={{ color: 'var(--foreground)' }}>{irsaliye.cari?.unvan || '-'}</TableCell>
                      <TableCell>
                        {irsaliye.kaynakSiparis?.siparisNo ? (
                          <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                            {irsaliye.kaynakSiparis.siparisNo}
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getKaynakTipLabel(irsaliye.kaynakTip)}
                          size="small"
                          sx={{
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)',
                          }}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'var(--foreground)' }}>{formatCurrency(irsaliye.toplamTutar)}</TableCell>
                      <TableCell align="right" sx={{ color: 'var(--foreground)' }}>{formatCurrency(irsaliye.kdvTutar)}</TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 700,
                            color: 'var(--primary)',
                          }}
                        >
                          {formatCurrency(irsaliye.genelToplam)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getDurumLabel(irsaliye.durum)}
                          size="small"
                          sx={{
                            bgcolor: irsaliye.durum === 'FATURALANDI' 
                              ? 'color-mix(in srgb, var(--chart-2) 15%, transparent)' 
                              : 'color-mix(in srgb, var(--chart-3) 15%, transparent)',
                            color: irsaliye.durum === 'FATURALANDI' 
                              ? 'var(--chart-2)' 
                              : 'var(--chart-3)',
                            borderColor: irsaliye.durum === 'FATURALANDI' 
                              ? 'var(--chart-2)' 
                              : 'var(--chart-3)',
                          }}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/satis-irsaliyesi/${irsaliye.id}`)}
                            sx={{
                              color: 'var(--primary)',
                              '&:hover': { 
                                bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                              },
                            }}
                            title="Görüntüle"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/satis-irsaliyesi/print/${irsaliye.id}`)}
                            sx={{
                              color: 'var(--chart-2)',
                              '&:hover': { 
                                bgcolor: 'color-mix(in srgb, var(--chart-2) 10%, transparent)',
                              },
                            }}
                            title="Yazdır"
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, irsaliye)}
                            sx={{
                              color: 'var(--muted-foreground)',
                              '&:hover': { 
                                bgcolor: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)',
                              },
                            }}
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
              if (selectedIrsaliyeForMenu) router.push(`/satis-irsaliyesi/${selectedIrsaliyeForMenu.id}`);
            }}
          >
            Görüntüle
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClose();
              if (selectedIrsaliyeForMenu) router.push(`/satis-irsaliyesi/print/${selectedIrsaliyeForMenu.id}`);
            }}
          >
            Yazdır
          </MenuItem>
          {selectedIrsaliyeForMenu?.durum === 'FATURALANMADI' && (
            <>
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuClose();
                  if (selectedIrsaliyeForMenu) router.push(`/fatura/satis/yeni?irsaliyeId=${selectedIrsaliyeForMenu.id}`);
                }}
              >
                Faturalandır
              </MenuItem>
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuClose();
                  if (selectedIrsaliyeForMenu) router.push(`/satis-irsaliyesi/${selectedIrsaliyeForMenu.id}/duzenle`);
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
                sx={{ color: 'var(--destructive)' }}
              >
                Sil
              </MenuItem>
            </>
          )}
        </Menu>

        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle>İrsaliye Sil</DialogTitle>
          <DialogContent>
            <Typography>
              <strong>{selectedIrsaliye?.irsaliyeNo}</strong> numaralı irsaliyeyi silmek istediğinize emin misiniz?
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
