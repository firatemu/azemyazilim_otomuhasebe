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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  FilterList,
  Refresh,
  AccountBalance,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { getBankLogo } from '@/constants/bankalar';

interface BankaHesabi {
  id: string;
  kasaKodu: string;
  kasaAdi: string;
  bankaAdi?: string;
  subeAdi?: string;
  hesapNo?: string;
  iban?: string;
  kasa?: {
    id: string;
    kasaKodu: string;
    kasaAdi: string;
  };
}

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  telefon?: string;
}

interface BankaHavale {
  id: string;
  hareketTipi: 'GELEN' | 'GIDEN';
  bankaHesabiId: string;
  bankaHesapId?: string;
  cariId: string;
  tutar: number;
  tarih: string;
  aciklama?: string;
  referansNo?: string;
  gonderen?: string;
  alici?: string;
  createdAt: string;
  updatedAt: string;
  bankaHesabi: BankaHesabi;
  bankaHesap?: {
    id: string;
    hesapKodu: string;
    hesapAdi: string;
    banka: {
      ad: string;
      logo?: string;
    };
  };
  cari: Cari;
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
  gelenHavale: {
    adet: number;
    toplam: number;
  };
  gidenHavale: {
    adet: number;
    toplam: number;
  };
  net: number;
}

// ✅ ÇÖZÜM: Dialog Component - Local State kullanıyor (FORM-PING-SORUNU-COZUMU.md)
const HavaleDialog = memo(({
  open,
  editMode,
  initialFormData,
  bankaHesaplari,
  cariler,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  editMode: boolean;
  initialFormData: any;
  bankaHesaplari: BankaHesabi[];
  cariler: Cari[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  // 1. LOCAL STATE - Parent'ı etkilemez!
  const [localFormData, setLocalFormData] = useState(initialFormData);

  // 2. initialFormData değiştiğinde local state'i güncelle
  useEffect(() => {
    setLocalFormData(initialFormData);
  }, [initialFormData]);

  // 3. Local değişiklik fonksiyonu
  const handleLocalChange = (field: string, value: any) => {
    setLocalFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // 4. Local submit
  const handleLocalSubmit = () => {
    onSubmit(localFormData);
  };

  // 5. Hook'lar bittikten SONRA conditional return
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? 'Gelen Havale Düzenle' : 'Yeni Gelen Havale'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Tarih - En başta */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Tarih *"
              value={localFormData.tarih}
              onChange={(e) => handleLocalChange('tarih', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Banka Hesabı - Banka adı ve Hesap No / IBAN göster */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              fullWidth
              options={bankaHesaplari}
              getOptionLabel={(option) => {
                const bankaAdi = option.bankaAdi || '';
                const hesapAdi = option.kasaAdi || '';
                const hesapInfo = option.hesapNo || option.iban || '';

                // Banka Adı - Hesap Adı (Hesap No/IBAN)
                return `${bankaAdi} - ${hesapAdi}${hesapInfo ? ` (${hesapInfo})` : ''}`;
              }}
              value={bankaHesaplari.find(b => b.id === localFormData.bankaHesabiId) || null}
              onChange={(_, newValue) => handleLocalChange('bankaHesabiId', newValue?.id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Banka Hesabı *"
                  placeholder="Banka hesabı ara..."
                  autoComplete="off"
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                const hesapInfo = option.hesapNo || option.iban || '';
                return (
                  <li key={option.id} {...otherProps}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {option.bankaAdi} - {option.kasaAdi}
                      </Typography>
                      {hesapInfo && (
                        <Typography variant="caption" color="text.secondary">
                          {option.hesapNo ? `Hesap No: ${option.hesapNo}` : `IBAN: ${option.iban}`}
                        </Typography>
                      )}
                    </Box>
                  </li>
                );
              }}
              noOptionsText="Banka hesabı bulunamadı"
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>

          {/* Cari */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              fullWidth
              options={cariler}
              getOptionLabel={(option) => `${option.unvan} (${option.cariKodu})`}
              value={cariler.find(c => c.id === localFormData.cariId) || null}
              onChange={(_, newValue) => handleLocalChange('cariId', newValue?.id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cari *"
                  placeholder="Cari ara..."
                  autoComplete="off"
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={option.id} {...otherProps}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {option.unvan}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.cariKodu}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              noOptionsText="Cari bulunamadı"
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>

          {/* Tutar */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Tutar *"
              value={localFormData.tutar}
              onChange={(e) => handleLocalChange('tutar', e.target.value)}
              inputProps={{ min: 0.01, step: 0.01 }}
              sx={{
                '& input[type=number]': {
                  MozAppearance: 'textfield',
                },
                '& input[type=number]::-webkit-outer-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
                '& input[type=number]::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
              }}
            />
          </Grid>

          {/* Referans No */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Referans No"
              value={localFormData.referansNo}
              onChange={(e) => handleLocalChange('referansNo', e.target.value)}
              placeholder="Havale referans numarası"
            />
          </Grid>

          {/* Açıklama */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Açıklama"
              value={localFormData.aciklama}
              onChange={(e) => handleLocalChange('aciklama', e.target.value)}
              placeholder="Havale açıklaması"
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
          sx={{
            bgcolor: 'var(--chart-2)',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'color-mix(in srgb, var(--chart-2) 90%, black)',
            },
          }}
        >
          {editMode ? 'Güncelle' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

HavaleDialog.displayName = 'HavaleDialog';

export default function GelenHavalePage() {
  const [havaleler, setHavaleler] = useState<BankaHavale[]>([]);
  const [bankaHesaplari, setBankaHesaplari] = useState<BankaHesabi[]>([]);
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedHavale, setSelectedHavale] = useState<BankaHavale | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });

  // Filter state
  const [filterBankaId, setFilterBankaId] = useState('');
  const [filterCariId, setFilterCariId] = useState('');
  const [filterBaslangic, setFilterBaslangic] = useState('');
  const [filterBitis, setFilterBitis] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // ✅ ÇÖZÜM: initialFormData - Parent'ta sadece initial değerleri tut
  const [initialFormData, setInitialFormData] = useState({
    hareketTipi: 'GELEN' as 'GELEN' | 'GIDEN',
    bankaHesabiId: '',
    cariId: '',
    tutar: '',
    tarih: new Date().toISOString().split('T')[0],
    aciklama: '',
    referansNo: '',
    gonderen: '',
    alici: '',
  });

  useEffect(() => {
    fetchHavaleler();
    fetchBankaHesaplari();
    fetchCariler();
    fetchStats();
  }, [filterBankaId, filterCariId, filterBaslangic, filterBitis]);

  const fetchHavaleler = async () => {
    try {
      setLoading(true);
      const params: any = {
        hareketTipi: 'GELEN',
      };
      if (filterBankaId) params.bankaHesabiId = filterBankaId;
      if (filterCariId) params.cariId = filterCariId;
      if (filterBaslangic) params.baslangicTarihi = filterBaslangic;
      if (filterBitis) params.bitisTarihi = filterBitis;

      const response = await axios.get('/banka-havale', { params });
      setHavaleler(response.data);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kayıtlar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankaHesaplari = async () => {
    try {
      // ✅ ÇÖZÜM: Yeni Banka API'sini kullan (/api/banka)
      // Bu endpoint bankaları ve altındaki hesapları getirir.
      // Biz sadece VADESIZ hesapları düz bir liste olarak alacağız.
      const response = await axios.get('/banka');
      const bankalar = response.data || [];

      const vadesizHesaplar: BankaHesabi[] = [];

      bankalar.forEach((banka: any) => {
        if (banka.hesaplar && Array.isArray(banka.hesaplar)) {
          banka.hesaplar.forEach((hesap: any) => {
            if (hesap.hesapTipi === 'VADESIZ') {
              vadesizHesaplar.push({
                id: hesap.id,
                kasaKodu: 'BANKA', // Varsayılan değer
                kasaAdi: hesap.hesapAdi || banka.ad, // Hesap adı yoksa banka adını kullan
                bankaAdi: banka.ad,
                subeAdi: banka.sube,
                hesapNo: hesap.hesapNo,
                iban: hesap.iban,
                // Eski yapıya uyumluluk için kasa objesi (gerekirse)
                kasa: {
                  id: hesap.id,
                  kasaKodu: 'BANKA',
                  kasaAdi: hesap.hesapAdi || banka.ad,
                }
              });
            }
          });
        }
      });

      setBankaHesaplari(vadesizHesaplar);
    } catch (error) {
      console.error('Banka hesapları yüklenirken hata:', error);
      showSnackbar('Banka hesapları yüklenirken hata oluştu', 'error');
    }
  };

  const fetchCariler = async () => {
    try {
      const response = await axios.get('/cari', { params: { limit: 1000 } });
      // Cari API pagination ile döner: { data: [...], meta: {...} }
      setCariler(response.data.data || []);
    } catch (error) {
      console.error('Cariler yüklenirken hata:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const params: any = {
        hareketTipi: 'GELEN',
      };
      if (filterBankaId) params.bankaHesabiId = filterBankaId;
      if (filterBaslangic) params.baslangicTarihi = filterBaslangic;
      if (filterBitis) params.bitisTarihi = filterBitis;

      const response = await axios.get('/banka-havale/stats', { params });
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const handleOpenDialog = useCallback((havale?: BankaHavale) => {
    if (havale) {
      setEditMode(true);
      setSelectedHavale(havale);
      // Kasa.id'yi BankaHesabi.id'ye çevir (edit mode için)
      const bankaHesabiId = bankaHesaplari.find(b => b.kasa?.id === havale.bankaHesabiId)?.id || '';
      setInitialFormData({
        hareketTipi: 'GELEN',
        bankaHesabiId: bankaHesabiId,
        cariId: havale.cariId,
        tutar: String(havale.tutar),
        tarih: new Date(havale.tarih).toISOString().split('T')[0],
        aciklama: havale.aciklama || '',
        referansNo: havale.referansNo || '',
        gonderen: havale.gonderen || '',
        alici: havale.alici || '',
      });
    } else {
      setEditMode(false);
      setSelectedHavale(null);
      setInitialFormData({
        hareketTipi: 'GELEN',
        bankaHesabiId: '',
        cariId: '',
        tutar: '',
        tarih: new Date().toISOString().split('T')[0],
        aciklama: '',
        referansNo: '',
        gonderen: '',
        alici: '',
      });
    }
    setOpenDialog(true);
  }, [bankaHesaplari]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedHavale(null);
  }, []);

  // ❌ KALDIRILDI - handleFormChange artık gerekli değil (local state kullanılıyor)

  // ✅ ÇÖZÜM: handleSubmit - Dialog'dan gelen veriyi al ve kaydet
  const handleSubmit = useCallback(async (submitFormData: any) => {
    try {
      const tutarNumber = typeof submitFormData.tutar === 'string' ? parseFloat(submitFormData.tutar) : submitFormData.tutar;

      if (!submitFormData.bankaHesabiId || !submitFormData.cariId || !tutarNumber || tutarNumber <= 0) {
        showSnackbar('Lütfen tüm zorunlu alanları doldurun ve geçerli bir tutar girin', 'error');
        return;
      }

      // BankaHesabi.id'yi Kasa.id'ye çevir
      const selectedBankaHesabi = bankaHesaplari.find(b => b.id === submitFormData.bankaHesabiId);
      if (!selectedBankaHesabi || !selectedBankaHesabi.kasa?.id) {
        showSnackbar('Banka hesabı bulunamadı', 'error');
        return;
      }

      setLoading(true);

      const submitData: any = {
        hareketTipi: submitFormData.hareketTipi,
        cariId: submitFormData.cariId,
        tutar: tutarNumber,
        tarih: submitFormData.tarih,
        aciklama: submitFormData.aciklama || '',
        referansNo: submitFormData.referansNo || '',
      };

      // ID Yapılandırması: 
      // Biz her zaman yeni BankaHesabi.id'yi bankaHesapId olarak göndereceğiz.
      // Eğer geriye dönük bir kasa eşleşmesi varsa (mock objemizdeki gibi), 
      // backend her ikisini de kontrol ediyor zaten.
      submitData.bankaHesapId = selectedBankaHesabi.id;


      if (editMode && selectedHavale) {
        await axios.put(`/banka-havale/${selectedHavale.id}`, submitData);
        showSnackbar('Gelen havale kaydı güncellendi', 'success');
      } else {
        await axios.post('/banka-havale', submitData);
        showSnackbar('Gelen havale kaydı oluşturuldu', 'success');
      }

      handleCloseDialog();
      fetchHavaleler();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [editMode, selectedHavale, bankaHesaplari]);

  const handleDelete = async () => {
    if (!selectedHavale) return;

    try {
      setLoading(true);
      const params = deleteReason ? { reason: deleteReason } : {};
      await axios.delete(`/banka-havale/${selectedHavale.id}`, { params });
      showSnackbar('Gelen havale kaydı silindi', 'success');
      setOpenDelete(false);
      setSelectedHavale(null);
      setDeleteReason('');
      fetchHavaleler();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (havale: BankaHavale) => {
    try {
      const response = await axios.get(`/banka-havale/${havale.id}`);
      setSelectedHavale(response.data);
      setOpenDetail(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Detay yüklenirken hata oluştu', 'error');
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
      hour: '2-digit',
      minute: '2-digit',
    });
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
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <TrendingUp sx={{ fontSize: 40, color: 'var(--chart-2)' }} />
              Gelen Havale İşlemleri
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--muted-foreground)',
                fontSize: '0.875rem',
              }}
            >
              Gelen havale kayıtlarını görüntüleyin ve yönetin
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchHavaleler}
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
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: 'var(--chart-2)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'color-mix(in srgb, var(--chart-2) 90%, black)',
                },
              }}
            >
              Yeni Gelen Havale
            </Button>
          </Box>
        </Box>

        {/* İstatistikler */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{
                bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
                borderLeft: '4px solid var(--chart-2)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <CardContent>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--muted-foreground)',
                      fontSize: '0.875rem',
                      mb: 1,
                    }}
                  >
                    Toplam Kayıt
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'var(--chart-2)',
                      fontWeight: 700,
                      fontSize: '1.875rem',
                    }}
                  >
                    {stats.toplamKayit}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{
                bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
                borderLeft: '4px solid var(--chart-2)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <CardContent>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--muted-foreground)',
                      fontSize: '0.875rem',
                      mb: 1,
                    }}
                  >
                    Gelen Havale Sayısı
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'var(--chart-2)',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                    }}
                  >
                    {stats.gelenHavale.adet}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{
                bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
                borderLeft: '4px solid var(--chart-2)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <CardContent>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--muted-foreground)',
                      fontSize: '0.875rem',
                      mb: 1,
                    }}
                  >
                    Toplam Gelen
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'var(--chart-2)',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                    }}
                  >
                    {formatCurrency(stats.gelenHavale.toplam)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filtreler */}
        <Paper sx={{
          p: 2,
          mb: 3,
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)',
          bgcolor: 'var(--card)',
        }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 700,
              color: 'var(--foreground)',
            }}
          >
            <FilterList sx={{ color: 'var(--primary)' }} />
            Filtreler
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Banka Hesabı</InputLabel>
                <Select
                  value={filterBankaId}
                  onChange={(e) => setFilterBankaId(e.target.value)}
                  label="Banka Hesabı"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {bankaHesaplari.map((banka) => (
                    <MenuItem key={banka.id} value={banka.id}>
                      {banka.kasaAdi} - {banka.bankaAdi}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
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
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Başlangıç Tarihi"
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
                label="Bitiş Tarihi"
                value={filterBitis}
                onChange={(e) => setFilterBitis(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Tablo */}
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
                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Banka Hesabı</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Cari</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Tutar</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Referans No</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Açıklama</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Kayıt Tarihi</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }} align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : havaleler.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">Kayıt bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                havaleler.map((havale) => (
                  <TableRow key={havale.id} hover>
                    <TableCell>{formatDate(havale.tarih)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          overflow: 'hidden',
                          border: '1px solid var(--border)',
                          p: 0.5
                        }}>
                          {getBankLogo(havale.bankaHesabi?.bankaAdi || havale.bankaHesap?.banka?.ad || '', havale.bankaHesap?.banka?.logo) ? (
                            <Box component="img" src={getBankLogo(havale.bankaHesabi?.bankaAdi || havale.bankaHesap?.banka?.ad || '', havale.bankaHesap?.banka?.logo)!} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <AccountBalance sx={{ fontSize: 16 }} />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {havale.bankaHesabi?.kasaAdi || havale.bankaHesap?.hesapAdi || 'Bilinmiyor'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {havale.bankaHesabi?.bankaAdi || havale.bankaHesap?.banka?.ad || ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {havale.cari.unvan}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {havale.cari.cariKodu}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatCurrency(havale.tutar)}
                        size="small"
                        sx={{
                          bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
                          color: 'var(--chart-2)',
                          fontWeight: 700,
                          border: '1px solid color-mix(in srgb, var(--chart-2) 30%, transparent)',
                        }}
                      />
                    </TableCell>
                    <TableCell>{havale.referansNo || '-'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {havale.aciklama || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(havale.createdAt)}
                        </Typography>
                        {havale.updatedAt !== havale.createdAt && (
                          <Typography variant="caption" color="warning.main">
                            Güncellendi: {formatDate(havale.updatedAt)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Detay">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(havale)}
                          sx={{
                            color: 'var(--primary)',
                            '&:hover': {
                              bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                            },
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(havale)}
                          sx={{
                            color: 'var(--chart-1)',
                            '&:hover': {
                              bgcolor: 'color-mix(in srgb, var(--chart-1) 10%, transparent)',
                            },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedHavale(havale);
                            setOpenDelete(true);
                          }}
                          sx={{
                            color: 'var(--destructive)',
                            '&:hover': {
                              bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Yeni/Düzenle Dialog */}
        {/* ✅ ÇÖZÜM: initialFormData ve onSubmit kullanılıyor, onFormChange kaldırıldı */}
        <HavaleDialog
          open={openDialog}
          editMode={editMode}
          initialFormData={initialFormData}
          bankaHesaplari={bankaHesaplari}
          cariler={cariler}
          loading={loading}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
        />

        {/* Silme Onay Dialog */}
        <Dialog open={openDelete} onClose={() => {
          setOpenDelete(false);
          setDeleteReason('');
        }}>
          <DialogTitle>Silme Onayı</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Bu gelen havale kaydını silmek istediğinizden emin misiniz?
              <br />
              <strong>Cari: </strong>{selectedHavale?.cari.unvan}
              <br />
              <strong>Tutar: </strong>{selectedHavale && formatCurrency(selectedHavale.tutar)}
              <br />
              <br />
              Bu işlem geri alınamaz ve kayıt silinen kayıtlar arşivine taşınacaktır.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Silme Nedeni (Opsiyonel)"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Bu kaydı neden siliyorsunuz?"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDelete(false);
              setDeleteReason('');
            }}>İptal</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={loading}
            >
              Sil
            </Button>
          </DialogActions>
        </Dialog>

        {/* Detay Dialog */}
        <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Gelen Havale Detayı</DialogTitle>
          <DialogContent>
            {selectedHavale && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Banka Hesabı</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        p: 0.5
                      }}>
                        {getBankLogo(selectedHavale.bankaHesabi.bankaAdi || selectedHavale.bankaHesap?.banka?.ad || '', selectedHavale.bankaHesap?.banka?.logo) ? (
                          <Box component="img" src={getBankLogo(selectedHavale.bankaHesabi.bankaAdi || selectedHavale.bankaHesap?.banka?.ad || '', selectedHavale.bankaHesap?.banka?.logo)!} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <AccountBalance sx={{ fontSize: 20 }} />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body1" fontWeight={500} sx={{ lineHeight: 1.2 }}>
                          {selectedHavale.bankaHesabi.kasaAdi}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {selectedHavale.bankaHesabi.bankaAdi}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Cari</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedHavale.cari.unvan}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {selectedHavale.cari.cariKodu}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Tutar</Typography>
                    <Typography variant="h5" sx={{ color: 'var(--chart-2)', fontWeight: 700 }}>
                      {formatCurrency(selectedHavale.tutar)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Tarih</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(selectedHavale.tarih)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Referans No</Typography>
                    <Typography variant="body1">{selectedHavale.referansNo || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="textSecondary">Açıklama</Typography>
                    <Typography variant="body1">{selectedHavale.aciklama || '-'}</Typography>
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
                            {formatDate(selectedHavale.createdAt)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="textSecondary">Güncelleme Tarihi</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDate(selectedHavale.updatedAt)}
                          </Typography>
                          {selectedHavale.updatedAt !== selectedHavale.createdAt && (
                            <Chip
                              label="Güncellendi"
                              size="small"
                              color="warning"
                              sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Grid>
                        {selectedHavale.createdByUser && (
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="textSecondary">Oluşturan Kullanıcı</Typography>
                            <Typography variant="body2">
                              {selectedHavale.createdByUser.fullName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              @{selectedHavale.createdByUser.username}
                            </Typography>
                          </Grid>
                        )}
                        {selectedHavale.updatedByUser && (
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="textSecondary">Güncelleyen Kullanıcı</Typography>
                            <Typography variant="body2">
                              {selectedHavale.updatedByUser.fullName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              @{selectedHavale.updatedByUser.username}
                            </Typography>
                          </Grid>
                        )}
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
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}

