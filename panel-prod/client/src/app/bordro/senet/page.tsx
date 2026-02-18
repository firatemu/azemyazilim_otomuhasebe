'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  Grid,
  Card,
  CardContent,
  Autocomplete,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Description,
  FilterList,
  Refresh,
  CheckCircle,
  HourglassEmpty,
  SwapHoriz,
  Cancel,
  AttachMoney,
  AccountBalance,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  telefon?: string;
}

interface Kasa {
  id: string;
  kasaKodu: string;
  kasaAdi: string;
}

interface SenetSenet {
  id: string;
  tip: 'SENET' | 'SENET';
  portfoyTip: 'ALACAK' | 'BORC';
  cariId: string;
  tutar: number;
  vade: string;
  banka?: string;
  sube?: string;
  hesapNo?: string;
  seriNo?: string;
  durum: string;
  tahsilTarihi?: string;
  tahsilKasaId?: string;
  ciroEdildi: boolean;
  ciroTarihi?: string;
  ciroEdilen?: string;
  aciklama?: string;
  createdAt: string;
  updatedAt: string;
  cari: Cari;
  tahsilKasa?: Kasa;
  createdByUser?: {
    id: string;
    fullName: string;
    username: string;
  };
  updatedByUser?: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface Stats {
  toplamKayit: number;
  toplamTutar: number;
  portfoyde: number;
  tahsilEdildi: number;
  ciroEdildi: number;
  karsilikiz: number;
}

// Form Dialog Component
const SenetFormDialog = memo(({
  open,
  editMode,
  initialFormData,
  cariler,
  kasalar,
  loading,
  onClose,
  onSubmit,
}: any) => {
  // Local state - parent component'i etkilemez
  const [localFormData, setLocalFormData] = useState(initialFormData);

  // initialFormData değiştiğinde local state'i güncelle
  useEffect(() => {
    setLocalFormData(initialFormData);
  }, [initialFormData]);

  // Çek/Senet kasalarını filtrele - useMemo ile optimize et
  const cekSenetKasalar = useMemo(() =>
    kasalar.filter((k: any) => k.kasaTipi === 'CEK_SENET' && k.aktif),
    [kasalar]
  );

  const handleLocalChange = (field: string, value: any) => {
    setLocalFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleLocalSubmit = () => {
    onSubmit(localFormData);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? 'Senet Düzenle' : 'Yeni Senet'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Portföy Tipi</InputLabel>
              <Select
                value={localFormData.portfoyTip}
                onChange={(e) => handleLocalChange('portfoyTip', e.target.value)}
                label="Portföy Tipi"
              >
                <MenuItem value="ALACAK">Alacak (Müşteriden Alınan)</MenuItem>
                <MenuItem value="BORC">Borç (Tedarikçiye Verilen)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              fullWidth
              options={cariler}
              getOptionLabel={(option: any) => `${option.unvan} (${option.cariKodu})`}
              value={cariler.find((c: any) => c.id === localFormData.cariId) || null}
              onChange={(_, newValue) => handleLocalChange('cariId', newValue?.id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cari *"
                  placeholder="Cari ara..."
                  autoComplete="off"
                />
              )}
              renderOption={(props, option: any) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={option.id} {...otherProps}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{option.unvan}</Typography>
                      <Typography variant="caption" color="text.secondary">{option.cariKodu}</Typography>
                    </Box>
                  </li>
                );
              }}
              noOptionsText="Cari bulunamadı"
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              fullWidth
              options={cekSenetKasalar}
              getOptionLabel={(option: any) => `${option.kasaAdi} (${option.kasaKodu})`}
              value={cekSenetKasalar.find((k: any) => k.id === localFormData.kasaId) || null}
              onChange={(_, newValue) => handleLocalChange('kasaId', newValue?.id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Çek/Senet Kasası *"
                  placeholder="Kasa seç..."
                  autoComplete="off"
                />
              )}
              renderOption={(props, option: any) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={option.id} {...otherProps}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{option.kasaAdi}</Typography>
                      <Typography variant="caption" color="text.secondary">{option.kasaKodu}</Typography>
                    </Box>
                  </li>
                );
              }}
              noOptionsText={
                cekSenetKasalar.length === 0
                  ? "Aktif Çek/Senet kasası bulunamadı. Lütfen önce Çek/Senet kasası oluşturun."
                  : "Kasa bulunamadı"
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Tutar"
              value={localFormData.tutar}
              onChange={(e) => {
                const value = e.target.value;
                // Sadece sayı ve ondalık nokta kabul et
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleLocalChange('tutar', value);
                }
              }}
              onKeyDown={(e) => {
                // e, E, +, - gibi karakterleri engelle
                if (['e', 'E', '+', '-'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              inputProps={{ min: 0.01, step: 0.01 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Vade Tarihi"
              value={localFormData.vade}
              onChange={(e) => handleLocalChange('vade', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Senet No"
              value={localFormData.seriNo}
              onChange={(e) => handleLocalChange('seriNo', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Banka"
              value={localFormData.banka}
              onChange={(e) => handleLocalChange('banka', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Şube"
              value={localFormData.sube}
              onChange={(e) => handleLocalChange('sube', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Hesap No"
              value={localFormData.hesapNo}
              onChange={(e) => handleLocalChange('hesapNo', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Açıklama"
              value={localFormData.aciklama}
              onChange={(e) => handleLocalChange('aciklama', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button
          variant="contained"
          onClick={handleLocalSubmit}
          disabled={loading}
          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#6d28d9' } }}
        >
          {editMode ? 'Güncelle' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

SenetFormDialog.displayName = 'SenetFormDialog';

export default function SenetPage() {
  const [senetler, setSenetler] = useState<SenetSenet[]>([]);
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [kasalar, setKasalar] = useState<Kasa[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openTahsil, setOpenTahsil] = useState(false);
  const [openCiro, setOpenCiro] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSenet, setSelectedSenet] = useState<SenetSenet | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });

  const [filterPortfoyTip, setFilterPortfoyTip] = useState('');
  const [filterDurum, setFilterDurum] = useState('');
  const [filterCariId, setFilterCariId] = useState('');
  const [filterVadeBaslangic, setFilterVadeBaslangic] = useState('');
  const [filterVadeBitis, setFilterVadeBitis] = useState('');

  const [formData, setFormData] = useState({
    tip: 'SENET',
    portfoyTip: 'ALACAK',
    cariId: '',
    tutar: '',
    vade: new Date().toISOString().split('T')[0],
    banka: '',
    sube: '',
    hesapNo: '',
    seriNo: '',
    aciklama: '',
    kasaId: '', // Çek/Senet Kasası
  });

  const [tahsilFormData, setTahsilFormData] = useState({
    kasaId: '',
    tahsilTarihi: new Date().toISOString().split('T')[0],
    aciklama: '',
  });

  const [ciroFormData, setCiroFormData] = useState({
    ciroEdilen: '', // Cari ID
    ciroTarihi: new Date().toISOString().split('T')[0],
    aciklama: '',
  });

  useEffect(() => {
    fetchSenetler();
    fetchCariler();
    fetchKasalar();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPortfoyTip, filterDurum, filterCariId, filterVadeBaslangic, filterVadeBitis]);

  const fetchSenetler = async () => {
    try {
      setLoading(true);
      const params: any = { tip: 'SENET' };
      if (filterPortfoyTip) params.portfoyTip = filterPortfoyTip;
      if (filterDurum) params.durum = filterDurum;
      if (filterCariId) params.cariId = filterCariId;
      if (filterVadeBaslangic) params.vadeBaslangic = filterVadeBaslangic;
      if (filterVadeBitis) params.vadeBitis = filterVadeBitis;

      const response = await axios.get('/cek-senet', { params });
      setSenetler(response.data);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kayıtlar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCariler = async () => {
    try {
      const response = await axios.get('/cari', { params: { limit: 1000 } });
      setCariler(response.data.data || []);
    } catch (error) {
      console.error('Cariler yüklenirken hata:', error);
    }
  };

  const fetchKasalar = useCallback(async () => {
    try {
      const response = await axios.get('/kasa');
      setKasalar(response.data);
    } catch (error) {
      console.error('Kasalar yüklenirken hata:', error);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const params: any = { tip: 'SENET' };
      if (filterPortfoyTip) params.portfoyTip = filterPortfoyTip;
      if (filterVadeBaslangic) params.vadeBaslangic = filterVadeBaslangic;
      if (filterVadeBitis) params.vadeBitis = filterVadeBitis;

      const response = await axios.get('/cek-senet/stats', { params });
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const handleOpenDialog = useCallback(async (cek?: SenetSenet) => {
    // Yeni senet ekleniyorsa, Çek/Senet kasası kontrolü
    if (!cek) {
      try {
        // Kasaları yeniden fetch et
        const response = await axios.get('/kasa');
        const allKasalar = response.data;

        if (!Array.isArray(allKasalar)) {
          setSnackbar({
            open: true,
            message: '❌ Kasalar yüklenirken hata oluştu. Lütfen sayfayı yenileyin.',
            severity: 'error'
          });
          return;
        }

        // Çek/Senet kasalarını filtrele
        const cekSenetKasalar = allKasalar.filter((k: any) =>
          k.kasaTipi === 'CEK_SENET' && k.aktif === true
        );

        // State'i güncelle
        setKasalar(allKasalar);

        if (cekSenetKasalar.length === 0) {
          setSnackbar({
            open: true,
            message: '⚠️ Aktif Çek/Senet kasası bulunamadı! Lütfen önce Kasa Yönetimi\'nden bir Çek/Senet kasası oluşturun.',
            severity: 'info'
          });
          return;
        }
      } catch (error) {
        console.error('Kasalar yüklenirken hata:', error);
        setSnackbar({
          open: true,
          message: '❌ Kasalar yüklenirken hata oluştu.',
          severity: 'error'
        });
        return;
      }
    }

    if (cek) {
      setEditMode(true);
      setSelectedSenet(cek);
      setFormData({
        tip: 'SENET',
        portfoyTip: cek.portfoyTip,
        cariId: cek.cariId,
        tutar: String(cek.tutar),
        vade: new Date(cek.vade).toISOString().split('T')[0],
        banka: cek.banka || '',
        sube: cek.sube || '',
        hesapNo: cek.hesapNo || '',
        seriNo: cek.seriNo || '',
        aciklama: cek.aciklama || '',
        kasaId: '', // Edit modda kasaId gerekmiyor
      });
    } else {
      setEditMode(false);
      setSelectedSenet(null);
      setFormData({
        tip: 'SENET',
        portfoyTip: 'ALACAK',
        cariId: '',
        tutar: '',
        vade: new Date().toISOString().split('T')[0],
        banka: '',
        sube: '',
        hesapNo: '',
        seriNo: '',
        aciklama: '',
        kasaId: '',
      });
    }
    setOpenDialog(true);
  }, [fetchKasalar]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedSenet(null);
  }, []);

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (submitFormData?: any) => {
    try {
      const dataToSubmit = submitFormData || formData;
      const tutarNumber = parseFloat(dataToSubmit.tutar);

      if (!dataToSubmit.cariId || !tutarNumber || tutarNumber <= 0) {
        showSnackbar('Lütfen tüm zorunlu alanları doldurun ve geçerli bir tutar girin', 'error');
        return;
      }

      if (!dataToSubmit.kasaId) {
        showSnackbar('Lütfen Çek/Senet kasası seçin', 'error');
        return;
      }

      setLoading(true);

      const submitData = {
        ...dataToSubmit,
        tutar: tutarNumber,
      };

      if (editMode && selectedSenet) {
        await axios.put(`/cek-senet/${selectedSenet.id}`, submitData);
        showSnackbar('Senet kaydı güncellendi', 'success');
      } else {
        await axios.post('/cek-senet', submitData);
        showSnackbar('Senet kaydı oluşturuldu', 'success');
      }

      handleCloseDialog();
      fetchSenetler();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [editMode, selectedSenet, handleCloseDialog, fetchSenetler, fetchStats, formData]);

  const handleDelete = async () => {
    if (!selectedSenet) return;

    try {
      setLoading(true);
      await axios.delete(`/cek-senet/${selectedSenet.id}`);
      showSnackbar('Senet kaydı silindi', 'success');
      setOpenDelete(false);
      setSelectedSenet(null);
      fetchSenetler();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (cek: SenetSenet) => {
    try {
      const response = await axios.get(`/cek-senet/${cek.id}`);
      setSelectedSenet(response.data);
      setOpenDetail(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Detay yüklenirken hata oluştu', 'error');
    }
  };

  const handleTahsil = async () => {
    if (!selectedSenet || !tahsilFormData.kasaId) {
      showSnackbar('Lütfen kasa seçin', 'error');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/cek-senet/${selectedSenet.id}/tahsil`, tahsilFormData);
      showSnackbar('Senet başarıyla tahsil edildi', 'success');
      setOpenTahsil(false);
      setSelectedSenet(null);
      fetchSenetler();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Tahsil işlemi sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCiro = async () => {
    if (!selectedSenet || !ciroFormData.ciroEdilen) {
      showSnackbar('Lütfen ciro edilecek cariyi seçin', 'error');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/cek-senet/${selectedSenet.id}/ciro`, ciroFormData);
      showSnackbar('Senet başarıyla ciro edildi', 'success');
      setOpenCiro(false);
      setSelectedSenet(null);
      setCiroFormData({
        ciroEdilen: '',
        ciroTarihi: new Date().toISOString().split('T')[0],
        aciklama: '',
      });
      fetchSenetler();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ciro işlemi sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
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
    });
  };

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case 'PORTFOYDE': return '#f59e0b';
      case 'TAHSIL_EDILDI': return '#10b981';
      case 'CIRO_EDILDI': return '#3b82f6';
      case 'KARSILIKIZ': return '#ef4444';
      case 'BANKAYA_VERILDI': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getDurumLabel = (durum: string) => {
    switch (durum) {
      case 'PORTFOYDE': return 'Portföyde';
      case 'TAHSIL_EDILDI': return 'Tahsil Edildi';
      case 'CIRO_EDILDI': return 'Ciro Edildi';
      case 'KARSILIKIZ': return 'Karşılıksız';
      case 'BANKAYA_VERILDI': return 'Bankaya Verildi';
      case 'IADE_EDILDI': return 'İade Edildi';
      case 'ODENDI': return 'Ödendi';
      default: return durum;
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description sx={{ fontSize: 40, color: '#6366f1' }} />
            Senet Yönetimi
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchSenetler}>
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#6d28d9' } }}
            >
              Yeni Senet
            </Button>
          </Box>
        </Box>

        {/* İstatistikler */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Card sx={{ bgcolor: '#faf5ff', border: '1px solid #6366f1' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Toplam Senet</Typography>
                  <Typography variant="h5" sx={{ color: '#6366f1', fontWeight: 600 }}>
                    {stats.toplamKayit}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Card sx={{ bgcolor: '#fffbeb', border: '1px solid #f59e0b' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Portföyde</Typography>
                  <Typography variant="h5" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                    {stats.portfoyde}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Card sx={{ bgcolor: '#ecfdf5', border: '1px solid #10b981' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Tahsil Edildi</Typography>
                  <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 600 }}>
                    {stats.tahsilEdildi}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Card sx={{ bgcolor: '#eff6ff', border: '1px solid #3b82f6' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Ciro Edildi</Typography>
                  <Typography variant="h5" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                    {stats.ciroEdildi}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Card sx={{ bgcolor: '#fef2f2', border: '1px solid #ef4444' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Karşılıksız</Typography>
                  <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 600 }}>
                    {stats.karsilikiz}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filtreler */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            Filtreler
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Portföy Tipi</InputLabel>
                <Select
                  value={filterPortfoyTip}
                  onChange={(e) => setFilterPortfoyTip(e.target.value)}
                  label="Portföy Tipi"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="ALACAK">Alacak</MenuItem>
                  <MenuItem value="BORC">Borç</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={filterDurum}
                  onChange={(e) => setFilterDurum(e.target.value)}
                  label="Durum"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="PORTFOYDE">Portföyde</MenuItem>
                  <MenuItem value="TAHSIL_EDILDI">Tahsil Edildi</MenuItem>
                  <MenuItem value="CIRO_EDILDI">Ciro Edildi</MenuItem>
                  <MenuItem value="BANKAYA_VERILDI">Bankaya Verildi</MenuItem>
                  <MenuItem value="KARSILIKIZ">Karşılıksız</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Cari</InputLabel>
                <Select
                  value={filterCariId}
                  onChange={(e) => setFilterCariId(e.target.value)}
                  label="Cari"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {cariler.map((cari) => (
                    <MenuItem key={cari.id} value={cari.id}>
                      {cari.unvan}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Vade Başlangıç"
                value={filterVadeBaslangic}
                onChange={(e) => setFilterVadeBaslangic(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Vade Bitiş"
                value={filterVadeBitis}
                onChange={(e) => setFilterVadeBitis(e.target.value)}
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
                <TableCell sx={{ fontWeight: 600 }}>Portföy</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cari</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Senet No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Banka</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tutar</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vade</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kayıt Tarihi</TableCell>
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
              ) : senetler.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">Kayıt bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                senetler.map((cek) => (
                  <TableRow key={cek.id} hover>
                    <TableCell>
                      <Chip
                        label={cek.portfoyTip === 'ALACAK' ? 'Alacak' : 'Borç'}
                        size="small"
                        sx={{
                          bgcolor: cek.portfoyTip === 'ALACAK' ? '#ecfdf5' : '#fef2f2',
                          color: cek.portfoyTip === 'ALACAK' ? '#10b981' : '#ef4444',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{cek.cari.unvan}</Typography>
                        <Typography variant="caption" color="textSecondary">{cek.cari.cariKodu}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{cek.seriNo || '-'}</TableCell>
                    <TableCell>
                      {cek.banka ? (
                        <Box>
                          <Typography variant="body2">{cek.banka}</Typography>
                          {cek.sube && <Typography variant="caption" color="textSecondary">{cek.sube}</Typography>}
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(cek.tutar)}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(cek.vade)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getDurumLabel(cek.durum)}
                        size="small"
                        sx={{
                          bgcolor: `${getDurumColor(cek.durum)}20`,
                          color: getDurumColor(cek.durum),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(cek.createdAt)}</Typography>
                      {cek.updatedAt !== cek.createdAt && (
                        <Typography variant="caption" color="warning.main">Güncellendi</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Detay">
                        <IconButton size="small" onClick={() => handleViewDetail(cek)} sx={{ color: '#3b82f6' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {/* Tahsil Et (ALACAK + PORTFOYDE için) */}
                      {cek.portfoyTip === 'ALACAK' && cek.durum === 'PORTFOYDE' && (
                        <>
                          <Tooltip title="Tahsil Et">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedSenet(cek);
                                setOpenTahsil(true);
                              }}
                              sx={{ color: '#10b981' }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Bankaya Ver">
                            <IconButton 
                              size="small" 
                              onClick={async () => {
                                try {
                                  await axios.put(`/cek-senet/${cek.id}/durum?durum=BANKAYA_VERILDI&aciklama=Bankaya tahsile verildi`);
                                  showSnackbar('Senet bankaya verildi', 'success');
                                  fetchSenetler();
                                } catch (error: any) {
                                  showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
                                }
                              }}
                              sx={{ color: '#3b82f6' }}
                            >
                              <AccountBalance fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ciro Et">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setSelectedSenet(cek);
                                setOpenCiro(true);
                              }}
                              sx={{ color: '#8b5cf6' }}
                            >
                              <SwapHoriz fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
                      {/* Ödeme Yap (BORC + ODENMEDI için) */}
                      {cek.portfoyTip === 'BORC' && cek.durum === 'ODENMEDI' && (
                        <Tooltip title="Ödeme Yap">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedSenet(cek);
                              setOpenTahsil(true);
                            }}
                            sx={{ color: '#3b82f6' }}
                          >
                            <AttachMoney fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Düzenle ve Sil (Tamamlanmamış işlemler için) */}
                      {(cek.durum === 'PORTFOYDE' || cek.durum === 'ODENMEDI') && (
                        <>
                          <Tooltip title="Düzenle">
                            <IconButton size="small" onClick={() => handleOpenDialog(cek)} sx={{ color: '#f59e0b' }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedSenet(cek);
                                setOpenDelete(true);
                              }}
                              sx={{ color: '#ef4444' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Form Dialog */}
        <SenetFormDialog
          open={openDialog}
          editMode={editMode}
          initialFormData={formData}
          cariler={cariler}
          kasalar={kasalar}
          loading={loading}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
        />

        {/* Tahsil/Ödeme Dialog */}
        <Dialog open={openTahsil} onClose={() => setOpenTahsil(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedSenet?.portfoyTip === 'ALACAK' ? 'Senet Tahsil Et' : 'Senet Ödemesi Yap'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Kasa</InputLabel>
                  <Select
                    value={tahsilFormData.kasaId}
                    onChange={(e) => setTahsilFormData(prev => ({ ...prev, kasaId: e.target.value }))}
                    label="Kasa"
                  >
                    {kasalar.map((kasa) => (
                      <MenuItem key={kasa.id} value={kasa.id}>
                        {kasa.kasaAdi}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tahsil Tarihi"
                  value={tahsilFormData.tahsilTarihi}
                  onChange={(e) => setTahsilFormData(prev => ({ ...prev, tahsilTarihi: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTahsil(false)}>İptal</Button>
            <Button
              variant="contained"
              onClick={handleTahsil}
              disabled={loading}
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            >
              Tahsil Et
            </Button>
          </DialogActions>
        </Dialog>

        {/* Ciro Dialog */}
        <Dialog open={openCiro} onClose={() => setOpenCiro(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Senet Ciro Et</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  options={cariler}
                  getOptionLabel={(option) => `${option.unvan} (${option.cariKodu})`}
                  value={cariler.find(c => c.id === ciroFormData.ciroEdilen) || null}
                  onChange={(_, newValue) => {
                    setCiroFormData(prev => ({ ...prev, ciroEdilen: newValue?.id || '' }));
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Ciro Edilecek Cari" required />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Ciro Tarihi"
                  value={ciroFormData.ciroTarihi}
                  onChange={(e) => setCiroFormData(prev => ({ ...prev, ciroTarihi: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Açıklama"
                  value={ciroFormData.aciklama}
                  onChange={(e) => setCiroFormData(prev => ({ ...prev, aciklama: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCiro(false)}>İptal</Button>
            <Button
              variant="contained"
              onClick={handleCiro}
              disabled={loading}
              sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
            >
              Ciro Et
            </Button>
          </DialogActions>
        </Dialog>

        {/* Silme Dialog */}
        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle>Silme Onayı</DialogTitle>
          <DialogContent>
            <Typography>
              Bu senet kaydını silmek istediğinizden emin misiniz?
              <br />
              <strong>Cari: </strong>{selectedSenet?.cari.unvan}
              <br />
              <strong>Tutar: </strong>{selectedSenet && formatCurrency(selectedSenet.tutar)}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDelete(false)}>İptal</Button>
            <Button variant="contained" color="error" onClick={handleDelete} disabled={loading}>
              Sil
            </Button>
          </DialogActions>
        </Dialog>

        {/* Detay Dialog */}
        <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
          <DialogTitle>Senet Detayı</DialogTitle>
          <DialogContent>
            {selectedSenet && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Portföy Tipi</Typography>
                    <Chip
                      label={selectedSenet.portfoyTip === 'ALACAK' ? 'Alacak' : 'Borç'}
                      sx={{
                        bgcolor: selectedSenet.portfoyTip === 'ALACAK' ? '#ecfdf5' : '#fef2f2',
                        color: selectedSenet.portfoyTip === 'ALACAK' ? '#10b981' : '#ef4444',
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Durum</Typography>
                    <Chip
                      label={getDurumLabel(selectedSenet.durum)}
                      sx={{
                        bgcolor: `${getDurumColor(selectedSenet.durum)}20`,
                        color: getDurumColor(selectedSenet.durum),
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="textSecondary">Cari</Typography>
                    <Typography variant="h6">{selectedSenet.cari.unvan}</Typography>
                    <Typography variant="caption" color="textSecondary">{selectedSenet.cari.cariKodu}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Tutar</Typography>
                    <Typography variant="h5" sx={{ color: '#6366f1', fontWeight: 600 }}>
                      {formatCurrency(selectedSenet.tutar)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Vade Tarihi</Typography>
                    <Typography variant="h6">{formatDate(selectedSenet.vade)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Senet No</Typography>
                    <Typography variant="body1">{selectedSenet.seriNo || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Banka</Typography>
                    <Typography variant="body1">{selectedSenet.banka || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Şube</Typography>
                    <Typography variant="body1">{selectedSenet.sube || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Hesap No</Typography>
                    <Typography variant="body1">{selectedSenet.hesapNo || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="textSecondary">Açıklama</Typography>
                    <Typography variant="body1">{selectedSenet.aciklama || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ bgcolor: '#f9fafb', p: 2, borderRadius: 1, mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        Kayıt Bilgileri
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="textSecondary">Oluşturma Tarihi</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDate(selectedSenet.createdAt)}
                          </Typography>
                          {selectedSenet.createdByUser && (
                            <Typography variant="caption" color="textSecondary">
                              {selectedSenet.createdByUser.fullName}
                            </Typography>
                          )}
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="textSecondary">Güncelleme Tarihi</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDate(selectedSenet.updatedAt)}
                          </Typography>
                          {selectedSenet.updatedByUser && (
                            <Typography variant="caption" color="textSecondary">
                              {selectedSenet.updatedByUser.fullName}
                            </Typography>
                          )}
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

