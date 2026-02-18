'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  Visibility,
  DeleteForever,
  FilterList,
  Refresh,
  Payment,
  Description,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface DeletedCekSenet {
  id: string;
  originalId: string;
  tip: 'CEK' | 'SENET';
  portfoyTip: 'ALACAK' | 'BORC';
  cariId: string;
  cariUnvan: string;
  tutar: number;
  vade: string;
  banka?: string;
  sube?: string;
  hesapNo?: string;
  cekNo?: string;
  seriNo?: string;
  durum: string;
  aciklama?: string;
  originalCreatedAt: string;
  originalUpdatedAt: string;
  deletedAt: string;
  deleteReason?: string;
  deletedByUser?: {
    id: string;
    fullName: string;
    username: string;
  };
}

export default function SilinenCekSenetPage() {
  const [kayitlar, setKayitlar] = useState<DeletedCekSenet[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedKayit, setSelectedKayit] = useState<DeletedCekSenet | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });

  const [filterTip, setFilterTip] = useState('');
  const [filterPortfoyTip, setFilterPortfoyTip] = useState('');
  const [filterBaslangic, setFilterBaslangic] = useState('');
  const [filterBitis, setFilterBitis] = useState('');

  useEffect(() => {
    fetchSilinenKayitlar();
  }, []);

  const fetchSilinenKayitlar = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/cek-senet/deleted');
      setKayitlar(response.data);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kayıtlar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (kayit: DeletedCekSenet) => {
    setSelectedKayit(kayit);
    setOpenDetail(true);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredKayitlar = kayitlar.filter(kayit => {
    if (filterTip && kayit.tip !== filterTip) return false;
    if (filterPortfoyTip && kayit.portfoyTip !== filterPortfoyTip) return false;
    if (filterBaslangic && new Date(kayit.deletedAt) < new Date(filterBaslangic)) return false;
    if (filterBitis && new Date(kayit.deletedAt) > new Date(filterBitis)) return false;
    return true;
  });

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteForever sx={{ fontSize: 40, color: '#6b7280' }} />
            Silinen Çek/Senet Kayıtları
          </Typography>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchSilinenKayitlar}>
            Yenile
          </Button>
        </Box>

        {/* İstatistikler */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#f9fafb', border: '1px solid #6b7280' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Toplam Silinen</Typography>
                <Typography variant="h4" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  {kayitlar.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#faf5ff', border: '1px solid #7c3aed' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Çek</Typography>
                <Typography variant="h5" sx={{ color: '#7c3aed', fontWeight: 600 }}>
                  {kayitlar.filter(k => k.tip === 'CEK').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#eff6ff', border: '1px solid #6366f1' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Senet</Typography>
                <Typography variant="h5" sx={{ color: '#6366f1', fontWeight: 600 }}>
                  {kayitlar.filter(k => k.tip === 'SENET').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#fffbeb', border: '1px solid #f59e0b' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Toplam Tutar</Typography>
                <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                  {formatCurrency(kayitlar.reduce((sum, k) => sum + Number(k.tutar), 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtreler */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            Filtreler
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tip</InputLabel>
                <Select value={filterTip} onChange={(e) => setFilterTip(e.target.value)} label="Tip">
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="CEK">Çek</MenuItem>
                  <MenuItem value="SENET">Senet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Portföy Tipi</InputLabel>
                <Select value={filterPortfoyTip} onChange={(e) => setFilterPortfoyTip(e.target.value)} label="Portföy Tipi">
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="ALACAK">Alacak</MenuItem>
                  <MenuItem value="BORC">Borç</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Silinme Başlangıç"
                value={filterBaslangic}
                onChange={(e) => setFilterBaslangic(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Silinme Bitiş"
                value={filterBitis}
                onChange={(e) => setFilterBitis(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Tablo */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Portföy</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cari</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tutar</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vade</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Silinme Tarihi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Silen Kullanıcı</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredKayitlar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">Silinen kayıt bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredKayitlar.map((kayit) => (
                  <TableRow key={kayit.id} hover sx={{ bgcolor: '#fafafa' }}>
                    <TableCell>
                      <Chip
                        icon={kayit.tip === 'CEK' ? <Payment fontSize="small" /> : <Description fontSize="small" />}
                        label={kayit.tip === 'CEK' ? 'Çek' : 'Senet'}
                        size="small"
                        sx={{ 
                          bgcolor: kayit.tip === 'CEK' ? '#faf5ff' : '#eff6ff',
                          color: kayit.tip === 'CEK' ? '#7c3aed' : '#6366f1',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={kayit.portfoyTip === 'ALACAK' ? 'Alacak' : 'Borç'}
                        size="small"
                        sx={{ 
                          bgcolor: kayit.portfoyTip === 'ALACAK' ? '#ecfdf5' : '#fef2f2',
                          color: kayit.portfoyTip === 'ALACAK' ? '#10b981' : '#ef4444',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{kayit.cariUnvan}</Typography>
                    </TableCell>
                    <TableCell>{kayit.cekNo || kayit.seriNo || '-'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(kayit.tutar)}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(kayit.vade)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error.main" fontWeight={500}>
                        {formatDate(kayit.deletedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {kayit.deletedByUser ? (
                        <Box>
                          <Typography variant="body2">{kayit.deletedByUser.fullName}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            @{kayit.deletedByUser.username}
                          </Typography>
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Detay Görüntüle">
                        <IconButton size="small" onClick={() => handleViewDetail(kayit)} sx={{ color: '#3b82f6' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Detay Dialog */}
        <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#f9fafb' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeleteForever sx={{ color: '#ef4444' }} />
              Silinen {selectedKayit?.tip === 'CEK' ? 'Çek' : 'Senet'} Detayı
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedKayit && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: '2px solid #e5e7eb' }}>
                      Temel Bilgiler
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Tip</Typography>
                    <Chip
                      icon={selectedKayit.tip === 'CEK' ? <Payment fontSize="small" /> : <Description fontSize="small" />}
                      label={selectedKayit.tip === 'CEK' ? 'Çek' : 'Senet'}
                      sx={{ 
                        mt: 1,
                        bgcolor: selectedKayit.tip === 'CEK' ? '#faf5ff' : '#eff6ff',
                        color: selectedKayit.tip === 'CEK' ? '#7c3aed' : '#6366f1',
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Portföy Tipi</Typography>
                    <Chip
                      label={selectedKayit.portfoyTip === 'ALACAK' ? 'Alacak' : 'Borç'}
                      sx={{ 
                        mt: 1,
                        bgcolor: selectedKayit.portfoyTip === 'ALACAK' ? '#ecfdf5' : '#fef2f2',
                        color: selectedKayit.portfoyTip === 'ALACAK' ? '#10b981' : '#ef4444',
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Cari</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedKayit.cariUnvan}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Tutar</Typography>
                    <Typography variant="h5" sx={{ color: '#7c3aed', fontWeight: 600, mt: 1 }}>
                      {formatCurrency(selectedKayit.tutar)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Vade Tarihi</Typography>
                    <Typography variant="body1">{formatDate(selectedKayit.vade)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">{selectedKayit.tip === 'CEK' ? 'Çek No' : 'Seri No'}</Typography>
                    <Typography variant="body1">{selectedKayit.cekNo || selectedKayit.seriNo || '-'}</Typography>
                  </Grid>
                  {selectedKayit.banka && (
                    <>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="textSecondary">Banka</Typography>
                        <Typography variant="body1">{selectedKayit.banka}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="textSecondary">Şube</Typography>
                        <Typography variant="body1">{selectedKayit.sube || '-'}</Typography>
                      </Grid>
                    </>
                  )}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="textSecondary">Açıklama</Typography>
                    <Typography variant="body1">{selectedKayit.aciklama || '-'}</Typography>
                  </Grid>

                  {/* Silme Bilgileri */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 2, pb: 1, borderBottom: '2px solid #e5e7eb' }}>
                      Silme Bilgileri
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ bgcolor: '#fef2f2', p: 2, borderRadius: 1, border: '1px solid #ef4444' }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="textSecondary">Silinme Tarihi</Typography>
                          <Typography variant="body1" fontWeight={600} color="error.main">
                            {formatDate(selectedKayit.deletedAt)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="textSecondary">Silen Kullanıcı</Typography>
                          {selectedKayit.deletedByUser ? (
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {selectedKayit.deletedByUser.fullName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                @{selectedKayit.deletedByUser.username}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body1">-</Typography>
                          )}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="textSecondary">Silme Nedeni</Typography>
                          <Typography variant="body1" sx={{ mt: 0.5 }}>
                            {selectedKayit.deleteReason || 'Belirtilmemiş'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Orijinal Kayıt Bilgileri */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 2, pb: 1, borderBottom: '2px solid #e5e7eb' }}>
                      Orijinal Kayıt Bilgileri
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ bgcolor: '#f9fafb', p: 2, borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="textSecondary">Oluşturulma Tarihi</Typography>
                          <Typography variant="body2">{formatDate(selectedKayit.originalCreatedAt)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="textSecondary">Son Güncelleme</Typography>
                          <Typography variant="body2">{formatDate(selectedKayit.originalUpdatedAt)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="textSecondary">Orijinal ID</Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mt: 0.5 }}>
                            {selectedKayit.originalId}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetail(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}

