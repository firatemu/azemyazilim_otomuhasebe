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
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  AccountBalance,
  AttachMoney,
  CreditCard,
  ToggleOn,
  ToggleOff,
  AccountBalanceWallet,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Kasa {
  id: string;
  kasaKodu: string;
  kasaAdi: string;
  kasaTipi: 'NAKIT';
  bakiye: number;
  aktif: boolean;
  _count?: {
    hareketler: number;
  };
}

export default function KasaPage() {
  const router = useRouter();
  const [kasalar, setKasalar] = useState<Kasa[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedKasa, setSelectedKasa] = useState<Kasa | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const [formData, setFormData] = useState({
    kasaKodu: '',
    kasaAdi: '',
    kasaTipi: 'NAKIT' as const,
    aktif: true,
  });

  useEffect(() => {
    fetchKasalar();
  }, [showInactive]);

  const fetchKasalar = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/cashbox', {
        params: { aktif: !showInactive },
      });
      setKasalar(response.data || []);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kasalar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = async () => {
    // Otomatik kod al
    let nextCode = '';
    try {
      const response = await axios.get('/code-template/next-code/CASHBOX');
      nextCode = response.data.nextCode || '';
    } catch (error) {
      console.log('Otomatik kod alınamadı');
    }

    setFormData({
      kasaKodu: nextCode || '',
      kasaAdi: '',
      kasaTipi: 'NAKIT',
      aktif: true,
    });
  };

  const openAddDialog = async () => {
    setEditMode(false);
    await resetForm();
    setOpenDialog(true);
  };

  const openEditDialog = (kasa: Kasa) => {
    setFormData({
      kasaKodu: kasa.kasaKodu,
      kasaAdi: kasa.kasaAdi,
      kasaTipi: kasa.kasaTipi,
      aktif: kasa.aktif,
    });
    setSelectedKasa(kasa);
    setEditMode(true);
    setOpenDialog(true);
  };

  const openDeleteDialog = (kasa: Kasa) => {
    setSelectedKasa(kasa);
    setOpenDelete(true);
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        ...formData,
        kasaKodu: formData.kasaKodu && formData.kasaKodu.trim().length > 0 ? formData.kasaKodu : undefined,
      };

      if (editMode && selectedKasa) {
        await axios.put(`/kasa/${selectedKasa.id}`, dataToSend);
        showSnackbar('Kasa başarıyla güncellendi', 'success');
      } else {
        await axios.post('/cashbox', dataToSend);
        showSnackbar('Kasa başarıyla oluşturuldu', 'success');
      }
      setOpenDialog(false);
      fetchKasalar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedKasa) return;

    try {
      await axios.delete(`/kasa/${selectedKasa.id}`);
      showSnackbar('Kasa başarıyla silindi', 'success');
      setOpenDelete(false);
      fetchKasalar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme sırasında hata oluştu', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const getKasaIcon = (tip: string) => {
    return <AttachMoney sx={{ color: 'var(--chart-2)' }} />;
  };

  const getKasaColor = (tip: string) => {
    return 'var(--chart-2)';
  };

  const getKasaTipLabel = (tip: string) => {
    return 'Nakit Kasa';
  };

  const getKasaAciklama = (tip: string) => {
    return 'Nakit tahsilat ve ödeme';
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
              💰 Kasa Yönetimi
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--muted-foreground)',
                fontSize: '0.875rem',
              }}
            >
              Nakit kasalarınızı yönetin
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton
              onClick={() => setShowInactive(!showInactive)}
              title={showInactive ? 'Kullanım İçi Kasaları Göster' : 'Kullanım Dışı Kasaları Göster'}
              sx={{
                color: showInactive ? 'var(--primary)' : 'var(--chart-2)',
                bgcolor: showInactive
                  ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
                  : 'color-mix(in srgb, var(--chart-2) 10%, transparent)',
                '&:hover': {
                  bgcolor: showInactive
                    ? 'color-mix(in srgb, var(--primary) 20%, transparent)'
                    : 'color-mix(in srgb, var(--chart-2) 20%, transparent)',
                },
              }}
            >
              {showInactive ? <ToggleOff /> : <ToggleOn />}
            </IconButton>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openAddDialog}
              sx={{
                bgcolor: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'var(--secondary-hover)',
                },
              }}
            >
              Yeni Kasa Ekle
            </Button>
          </Box>
        </Box>

        {/* Kasa Tipleri Bilgilendirme */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{
              bgcolor: 'color-mix(in srgb, var(--chart-2) 10%, transparent)',
              borderLeft: '4px solid var(--chart-2)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachMoney sx={{ color: 'var(--chart-2)' }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      color: 'var(--foreground)',
                    }}
                  >
                    Nakit Kasa
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--muted-foreground)',
                    fontSize: '0.8125rem',
                  }}
                >
                  Nakit tahsilat ve ödeme işlemleri
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--muted)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kasa Kodu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kasa Adı</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Bakiye</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : kasalar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      {showInactive ? 'Kullanım dışı kasa bulunamadı' : 'Kasa bulunamadı'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                kasalar.map((kasa) => (
                  <TableRow key={kasa.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getKasaIcon(kasa.kasaTipi)}
                        <Chip
                          label={getKasaTipLabel(kasa.kasaTipi)}
                          size="small"
                          sx={{
                            bgcolor: `${getKasaColor(kasa.kasaTipi)}20`,
                            color: getKasaColor(kasa.kasaTipi),
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {kasa.kasaKodu}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {kasa.kasaAdi}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="700" color={kasa.bakiye >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(kasa.bakiye)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={kasa.aktif ? 'Aktif' : 'Pasif'}
                        size="small"
                        color={kasa.aktif ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Detay / Hesapları Yönet">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/kasa/${kasa.id}`)}
                            sx={{
                              color: '#3b82f6',
                              '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)' }
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(kasa)}
                            sx={{
                              color: '#f59e0b',
                              '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)' }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {(!kasa._count?.hareketler || kasa._count.hareketler === 0) && (
                          <Tooltip title="Sil">
                            <IconButton
                              size="small"
                              onClick={() => openDeleteDialog(kasa)}
                              sx={{
                                color: '#ef4444',
                                '&:hover': { bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)' }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle component="div" sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }} component="div">
            {editMode ? 'Kasa Düzenle' : 'Yeni Kasa Ekle'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Kasa Kodu"
                value={formData.kasaKodu}
                onChange={(e) => setFormData(prev => ({ ...prev, kasaKodu: e.target.value }))}
                disabled={editMode}
                placeholder="Otomatik"
                helperText={!editMode && formData.kasaKodu ? "Önerilen kod (değiştirilebilir)" : "Boş bırakılırsa otomatik"}
                sx={{
                  '& .MuiInputBase-input': {
                    color: formData.kasaKodu && !editMode ? '#0066cc' : 'inherit',
                    fontWeight: formData.kasaKodu && !editMode ? 500 : 'normal'
                  }
                }}
              />

              <TextField
                fullWidth
                label="Kasa Adı"
                value={formData.kasaAdi}
                onChange={(e) => setFormData(prev => ({ ...prev, kasaAdi: e.target.value }))}
                required
                autoFocus
                placeholder="Örn: Ana Kasa, Ziraat Bankası, vb."
              />


              {!editMode && (formData.kasaTipi === 'BANKA' || formData.kasaTipi === 'FIRMA_KREDI_KARTI') && (
                <Alert severity="info">
                  <Typography variant="body2">
                    {formData.kasaTipi === 'BANKA'
                      ? '💡 Kasa oluşturduktan sonra banka hesaplarını (Vadesiz, POS) ekleyebilirsiniz.'
                      : '💡 Kasa oluşturduktan sonra firma kredi kartlarını ekleyebilirsiniz.'}
                  </Typography>
                </Alert>
              )}

              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={formData.aktif}
                  onChange={(e) => setFormData(prev => ({ ...prev, aktif: e.target.value as boolean }))}
                  label="Durum"
                >
                  <MenuItem value={true as any}>Kullanım İçi</MenuItem>
                  <MenuItem value={false as any}>Kullanım Dışı</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>İptal</Button>
            <Button onClick={handleSave} variant="contained" disabled={!formData.kasaAdi}>
              {editMode ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle component="div" sx={{ fontWeight: 'bold' }} component="div">Kasa Sil</DialogTitle>
          <DialogContent>
            <Typography>
              <strong>{selectedKasa?.kasaAdi}</strong> kasasını silmek istediğinizden emin misiniz?
            </Typography>
            {selectedKasa?._count && selectedKasa._count.hareketler > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Bu kasa hareket görmüştür ve silinemez. Kullanım dışı yapabilirsiniz.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDelete(false)}>İptal</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Sil
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
