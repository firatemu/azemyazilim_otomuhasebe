'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CalendarMonth,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Visibility,
  Payment,
  Description,
  Schedule,
  ErrorOutline,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface CekSenet {
  id: string;
  tip: 'CEK' | 'SENET';
  portfoyTip: 'ALACAK' | 'BORC';
  cariId: string;
  tutar: number;
  vade: string;
  banka?: string;
  sube?: string;
  cekNo?: string;
  seriNo?: string;
  durum: string;
  aciklama?: string;
  createdAt: string;
  cari: {
    id: string;
    cariKodu: string;
    unvan: string;
    telefon?: string;
  };
}

export default function VadeTakvimPage() {
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedTip, setSelectedTip] = useState('');
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });

  // Kategorize edilmiş veriler
  const [vadesiGecenler, setVadesiGecenler] = useState<CekSenet[]>([]);
  const [bugun, setBugun] = useState<CekSenet[]>([]);
  const [yediGun, setYediGun] = useState<CekSenet[]>([]);
  const [onbesGun, setOnbesGun] = useState<CekSenet[]>([]);
  const [otuzGun, setOtuzGun] = useState<CekSenet[]>([]);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CekSenet | null>(null);

  useEffect(() => {
    fetchVadeTakvim();
  }, [selectedTip]);

  const fetchVadeTakvim = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedTip) params.tip = selectedTip;

      const response = await axios.get('/cek-senet', { params });
      // Tüm çekleri getir, sadece ODENDI ve TAHSIL_EDILDI olanları filtrele
      const tumKayitlar: CekSenet[] = (response.data || []).filter((item: CekSenet) => 
        item.durum !== 'ODENDI' && item.durum !== 'TAHSIL_EDILDI'
      );

      const bugun = new Date();
      bugun.setHours(0, 0, 0, 0);

      const yarin = new Date(bugun);
      yarin.setDate(yarin.getDate() + 1);

      const yediGunSonra = new Date(bugun);
      yediGunSonra.setDate(yediGunSonra.getDate() + 7);

      const onbesGunSonra = new Date(bugun);
      onbesGunSonra.setDate(onbesGunSonra.getDate() + 15);

      const otuzGunSonra = new Date(bugun);
      otuzGunSonra.setDate(otuzGunSonra.getDate() + 30);

      // Kategorize et
      const gecenler: CekSenet[] = [];
      const bugunler: CekSenet[] = [];
      const yediGunler: CekSenet[] = [];
      const onbesGunler: CekSenet[] = [];
      const otuzGunler: CekSenet[] = [];

      tumKayitlar.forEach(item => {
        const vade = new Date(item.vade);
        vade.setHours(0, 0, 0, 0);

        if (vade < bugun) {
          gecenler.push(item);
        } else if (vade.getTime() === bugun.getTime()) {
          bugunler.push(item);
        } else if (vade < yediGunSonra) {
          yediGunler.push(item);
        } else if (vade < onbesGunSonra) {
          onbesGunler.push(item);
        } else if (vade < otuzGunSonra) {
          otuzGunler.push(item);
        }
      });

      setVadesiGecenler(gecenler);
      setBugun(bugunler);
      setYediGun(yediGunler);
      setOnbesGun(onbesGunler);
      setOtuzGun(otuzGunler);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Veri yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (item: CekSenet) => {
    setSelectedItem(item);
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
      month: 'long',
      day: 'numeric',
    });
  };

  const getKalanGun = (vadeString: string) => {
    // Sadece tarih karşılaştırması yap (saat bilgisini sıfırla)
    const vade = new Date(vadeString);
    vade.setHours(0, 0, 0, 0);
    
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    
    const fark = Math.ceil((vade.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));
    return fark;
  };

  const renderTable = (items: CekSenet[], title: string, color: string, icon: any) => {
    const alacaklar = items.filter(i => i.portfoyTip === 'ALACAK');
    const borclar = items.filter(i => i.portfoyTip === 'BORC');
    const toplamAlacak = alacaklar.reduce((sum, i) => sum + Number(i.tutar), 0);
    const toplamBorc = borclar.reduce((sum, i) => sum + Number(i.tutar), 0);

    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color }}>
            {icon}
            {title} ({items.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              label={`Alacak: ${formatCurrency(toplamAlacak)} (${alacaklar.length})`}
              sx={{ bgcolor: '#ecfdf5', color: '#10b981', fontWeight: 600 }}
            />
            <Chip
              label={`Borç: ${formatCurrency(toplamBorc)} (${borclar.length})`}
              sx={{ bgcolor: '#fef2f2', color: '#ef4444', fontWeight: 600 }}
            />
          </Box>
        </Box>

        {items.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f9fafb' }}>
            <Typography color="textSecondary">Bu kategoride kayıt bulunmuyor</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Portföy</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cari</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tutar</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Kalan Gün</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const kalanGun = getKalanGun(item.vade);
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Chip
                          icon={item.tip === 'CEK' ? <Payment fontSize="small" /> : <Description fontSize="small" />}
                          label={item.tip}
                          size="small"
                          sx={{ 
                            bgcolor: item.tip === 'CEK' ? '#faf5ff' : '#eff6ff',
                            color: item.tip === 'CEK' ? '#7c3aed' : '#6366f1',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={item.portfoyTip === 'ALACAK' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                          label={item.portfoyTip === 'ALACAK' ? 'Alacak' : 'Borç'}
                          size="small"
                          sx={{ 
                            bgcolor: item.portfoyTip === 'ALACAK' ? '#ecfdf5' : '#fef2f2',
                            color: item.portfoyTip === 'ALACAK' ? '#10b981' : '#ef4444',
                            fontWeight: 600 
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{item.cari.unvan}</Typography>
                          <Typography variant="caption" color="textSecondary">{item.cari.cariKodu}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.cekNo || item.seriNo || '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(item.tutar)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(item.vade)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={kalanGun < 0 ? `${Math.abs(kalanGun)} gün geçti` : kalanGun === 0 ? 'Bugün' : `${kalanGun} gün`}
                          size="small"
                          sx={{ 
                            bgcolor: kalanGun < 0 ? '#fef2f2' : kalanGun === 0 ? '#fffbeb' : kalanGun <= 7 ? '#fff7ed' : '#f0fdf4',
                            color: kalanGun < 0 ? '#ef4444' : kalanGun === 0 ? '#f59e0b' : kalanGun <= 7 ? '#ea580c' : '#10b981',
                            fontWeight: 600 
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Detay">
                          <IconButton size="small" onClick={() => handleViewDetail(item)} sx={{ color: '#3b82f6' }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };

  const toplamAlacak = [...vadesiGecenler, ...bugun, ...yediGun, ...onbesGun, ...otuzGun]
    .filter(i => i.portfoyTip === 'ALACAK')
    .reduce((sum, i) => sum + Number(i.tutar), 0);

  const toplamBorc = [...vadesiGecenler, ...bugun, ...yediGun, ...onbesGun, ...otuzGun]
    .filter(i => i.portfoyTip === 'BORC')
    .reduce((sum, i) => sum + Number(i.tutar), 0);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth sx={{ fontSize: 40, color: '#f59e0b' }} />
            Vade Takvimi (Çek/Senet)
          </Typography>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filtre</InputLabel>
            <Select
              value={selectedTip}
              onChange={(e) => setSelectedTip(e.target.value)}
              label="Filtre"
              size="small"
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="CEK">Sadece Çek</MenuItem>
              <MenuItem value="SENET">Sadece Senet</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Özet Kartlar */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#fef2f2', border: '2px solid #ef4444' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ErrorOutline sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" color="textSecondary">Vadesi Geçenler</Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#ef4444', fontWeight: 600 }}>
                  {vadesiGecenler.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ef4444', mt: 1 }}>
                  {formatCurrency(vadesiGecenler.reduce((sum, i) => sum + Number(i.tutar), 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#fffbeb', border: '2px solid #f59e0b' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Warning sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="textSecondary">Bugün</Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                  {bugun.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#f59e0b', mt: 1 }}>
                  {formatCurrency(bugun.reduce((sum, i) => sum + Number(i.tutar), 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#ecfdf5', border: '1px solid #10b981' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUp sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="textSecondary">Toplam Alacak</Typography>
                </Box>
                <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 600 }}>
                  {formatCurrency(toplamAlacak)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Tahsil Edilecek
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: '#fef2f2', border: '1px solid #ef4444' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingDown sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" color="textSecondary">Toplam Borç</Typography>
                </Box>
                <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 600 }}>
                  {formatCurrency(toplamBorc)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Ödenecek
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={`Vadesi Geçenler (${vadesiGecenler.length})`}
              icon={<ErrorOutline />}
              iconPosition="start"
              sx={{ color: '#ef4444', '&.Mui-selected': { color: '#ef4444' } }}
            />
            <Tab 
              label={`Bugün (${bugun.length})`}
              icon={<Warning />}
              iconPosition="start"
              sx={{ color: '#f59e0b', '&.Mui-selected': { color: '#f59e0b' } }}
            />
            <Tab 
              label={`7 Gün İçinde (${yediGun.length})`}
              icon={<Schedule />}
              iconPosition="start"
              sx={{ color: '#ea580c', '&.Mui-selected': { color: '#ea580c' } }}
            />
            <Tab 
              label={`15 Gün İçinde (${onbesGun.length})`}
              icon={<Schedule />}
              iconPosition="start"
              sx={{ color: '#3b82f6', '&.Mui-selected': { color: '#3b82f6' } }}
            />
            <Tab 
              label={`30 Gün İçinde (${otuzGun.length})`}
              icon={<CheckCircle />}
              iconPosition="start"
              sx={{ color: '#10b981', '&.Mui-selected': { color: '#10b981' } }}
            />
          </Tabs>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tabValue === 0 && renderTable(vadesiGecenler, 'Vadesi Geçmiş Çek/Senetler', '#ef4444', <ErrorOutline sx={{ color: '#ef4444' }} />)}
            {tabValue === 1 && renderTable(bugun, 'Bugün Vadesi Gelen Çek/Senetler', '#f59e0b', <Warning sx={{ color: '#f59e0b' }} />)}
            {tabValue === 2 && renderTable(yediGun, '7 Gün İçinde Vadesi Gelecekler', '#ea580c', <Schedule sx={{ color: '#ea580c' }} />)}
            {tabValue === 3 && renderTable(onbesGun, '15 Gün İçinde Vadesi Gelecekler', '#3b82f6', <Schedule sx={{ color: '#3b82f6' }} />)}
            {tabValue === 4 && renderTable(otuzGun, '30 Gün İçinde Vadesi Gelecekler', '#10b981', <CheckCircle sx={{ color: '#10b981' }} />)}
          </>
        )}

        {/* Detay Dialog */}
        <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedItem?.tip === 'CEK' ? 'Çek' : 'Senet'} Detayı
          </DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: selectedItem.portfoyTip === 'ALACAK' ? '#ecfdf5' : '#fef2f2',
                      border: `1px solid ${selectedItem.portfoyTip === 'ALACAK' ? '#10b981' : '#ef4444'}`
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: selectedItem.portfoyTip === 'ALACAK' ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                        mb: 1
                      }}>
                        {selectedItem.portfoyTip === 'ALACAK' ? 'Tahsil Edilecek' : 'Ödenecek'}
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        color: selectedItem.portfoyTip === 'ALACAK' ? '#10b981' : '#ef4444',
                        fontWeight: 700
                      }}>
                        {formatCurrency(selectedItem.tutar)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Cari</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedItem.cari.unvan}</Typography>
                    <Typography variant="caption" color="textSecondary">{selectedItem.cari.cariKodu}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Vade Tarihi</Typography>
                    <Typography variant="body1" fontWeight={600}>{formatDate(selectedItem.vade)}</Typography>
                    <Chip
                      label={`${getKalanGun(selectedItem.vade)} gün ${getKalanGun(selectedItem.vade) < 0 ? 'geçti' : 'kaldı'}`}
                      size="small"
                      sx={{ 
                        mt: 0.5,
                        bgcolor: getKalanGun(selectedItem.vade) < 0 ? '#fef2f2' : '#fffbeb',
                        color: getKalanGun(selectedItem.vade) < 0 ? '#ef4444' : '#f59e0b',
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">
                      {selectedItem.tip === 'CEK' ? 'Çek No' : 'Seri No'}
                    </Typography>
                    <Typography variant="body1">{selectedItem.cekNo || selectedItem.seriNo || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Banka</Typography>
                    <Typography variant="body1">{selectedItem.banka || '-'}</Typography>
                  </Grid>
                  {selectedItem.cari.telefon && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="textSecondary">Telefon</Typography>
                      <Typography variant="body1">{selectedItem.cari.telefon}</Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="textSecondary">Açıklama</Typography>
                    <Typography variant="body1">{selectedItem.aciklama || '-'}</Typography>
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

