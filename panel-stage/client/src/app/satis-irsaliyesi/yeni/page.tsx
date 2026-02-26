'use client';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { ArrowBack, Delete, Save, ToggleOff, ToggleOn } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
  vadeSuresi?: number;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  satisFiyati: number;
  kdvOrani: number;
  barkod?: string;
  miktar: number;
}

interface IrsaliyeKalemi {
  stokId: string;
  stok?: Stok;
  miktar: number;
  birimFiyat: number;
  kdvOrani: number;
  iskontoOran: number;
  iskontoTutar: number;
  cokluIskonto?: boolean;
  iskontoFormula?: string;
}

function YeniSatisIrsaliyesiPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siparisId = searchParams.get('siparisId');

  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSiparis, setLoadingSiparis] = useState(false);

  const [formData, setFormData] = useState({
    irsaliyeNo: '',
    cariId: '',
    irsaliyeTarihi: new Date().toISOString().split('T')[0],
    durum: 'FATURALANMADI' as 'FATURALANMADI' | 'FATURALANDI',
    kaynakTip: 'DOGRUDAN' as 'DOGRUDAN' | 'SIPARIS',
    kaynakId: '',
    genelIskontoOran: 0,
    genelIskontoTutar: 0,
    aciklama: '',
    warehouseId: '',
    kalemler: [] as IrsaliyeKalemi[],
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [autocompleteOpenStates, setAutocompleteOpenStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchCariler();
    fetchCariler();
    fetchStoklar();
    fetchWarehouses();

    if (siparisId) {
      fetchSiparisBilgileri(siparisId);
      setFormData(prev => ({ ...prev, kaynakTip: 'SIPARIS', kaynakId: siparisId }));
    } else {
      generateIrsaliyeNo();
    }
  }, [siparisId]);

  const fetchCariler = async () => {
    try {
      const response = await axios.get('/cari', {
        params: { limit: 1000 },
      });
      setCariler(response.data.data || []);
    } catch (error) {
      console.error('Cariler yüklenirken hata:', error);
    }
  };

  const fetchStoklar = async () => {
    try {
      const response = await axios.get('/stok', {
        params: { limit: 1000 },
      });
      setStoklar(response.data.data || []);
    } catch (error) {
      console.error('Stoklar yüklenirken hata:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/warehouse?active=true');
      const warehouseList = response.data || [];
      setWarehouses(warehouseList);

      if (warehouseList.length === 0) {
        showSnackbar('Sistemde tanımlı ambar bulunamadı! Lütfen önce bir ambar tanımlayın.', 'error');
        return;
      }

      const defaultWarehouse = warehouseList.find((w: any) => w.isDefault);
      if (defaultWarehouse && !formData.warehouseId) {
        setFormData(prev => ({ ...prev, warehouseId: defaultWarehouse.id }));
      } else if (warehouseList.length === 1 && !formData.warehouseId) {
        setFormData(prev => ({ ...prev, warehouseId: warehouseList[0].id }));
      }
    } catch (error) {
      console.error('Ambar listesi alınamadı:', error);
    }
  };

  const fetchSiparisBilgileri = async (id: string) => {
    try {
      setLoadingSiparis(true);
      const response = await axios.get(`/siparis/${id}`);
      const siparis = response.data;

      if (siparis.cari) {
        setFormData(prev => ({
          ...prev,
          cariId: siparis.cari.id,
          irsaliyeTarihi: new Date(siparis.tarih).toISOString().split('T')[0],
          aciklama: siparis.aciklama || prev.aciklama,
          kaynakTip: 'SIPARIS',
          kaynakId: siparis.id,
          warehouseId: siparis.warehouseId || prev.warehouseId,
        }));
      }

      if (siparis.kalemler && siparis.kalemler.length > 0) {
        const kalemler: IrsaliyeKalemi[] = siparis.kalemler.map((kalem: any) => ({
          stokId: kalem.stokId,
          stok: kalem.stok ? {
            id: kalem.stok.id,
            stokKodu: kalem.stok.stokKodu,
            stokAdi: kalem.stok.stokAdi,
            satisFiyati: kalem.birimFiyat,
            kdvOrani: kalem.kdvOrani,
          } : undefined,
          miktar: kalem.miktar,
          birimFiyat: kalem.birimFiyat,
          kdvOrani: kalem.kdvOrani,
          iskontoOran: kalem.iskontoOran || 0,
          iskontoTutar: kalem.iskontoTutar || 0,
          cokluIskonto: false,
          iskontoFormula: '',
        }));

        setFormData(prev => ({
          ...prev,
          kalemler,
        }));
      }

      if (siparis.iskonto && siparis.iskonto > 0) {
        const toplamKalemTutari = siparis.kalemler?.reduce((sum: number, kalem: any) => {
          return sum + (kalem.miktar * kalem.birimFiyat - (kalem.iskontoTutar || 0));
        }, 0) || 0;

        const genelIskontoOran = toplamKalemTutari > 0
          ? (siparis.iskonto / toplamKalemTutari) * 100
          : 0;

        setFormData(prev => ({
          ...prev,
          genelIskontoOran,
          genelIskontoTutar: siparis.iskonto,
        }));
      }

      generateIrsaliyeNo();
      showSnackbar('Sipariş bilgileri yüklendi', 'success');
    } catch (error: any) {
      console.error('Sipariş bilgileri yüklenirken hata:', error);
      showSnackbar(error.response?.data?.message || 'Sipariş bilgileri yüklenirken hata oluştu', 'error');
      generateIrsaliyeNo();
    } finally {
      setLoadingSiparis(false);
    }
  };

  const generateIrsaliyeNo = async () => {
    try {
      const templateResponse = await axios.get('/code-template/next-code/DELIVERY_NOTE_SALES');
      if (templateResponse.data?.nextCode) {
        setFormData(prev => ({
          ...prev,
          irsaliyeNo: templateResponse.data.nextCode,
        }));
        return;
      }
    } catch (templateError: any) {
      console.warn('Şablon numarası alınamadı, manuel oluşturuluyor:', templateError.message);
    }

    try {
      const response = await axios.get('/satis-irsaliyesi', {
        params: { page: '1', limit: '1' },
      });
      const irsaliyeler = response.data?.data || [];
      const lastIrsaliyeNo = irsaliyeler[0]?.irsaliyeNo;
      const lastNoRaw = typeof lastIrsaliyeNo === 'string' ? (lastIrsaliyeNo.split('-').pop() || '0') : '0';
      const lastNo = parseInt(lastNoRaw, 10);
      const seq = (isNaN(lastNo) ? 0 : lastNo) + 1;
      const newNo = String(seq).padStart(6, '0');
      setFormData(prev => ({
        ...prev,
        irsaliyeNo: `IRS-${new Date().getFullYear()}-${newNo}`,
      }));
    } catch (error: any) {
      // 404 veya başka bir hata durumunda varsayılan numara oluştur
      setFormData(prev => ({
        ...prev,
        irsaliyeNo: `IRS-${new Date().getFullYear()}-000001`,
      }));
      // Sadece 404 dışındaki hataları logla (404 normal bir durum olabilir)
      if (error.response?.status !== 404) {
        console.error('İrsaliye numarası oluşturulurken hata:', error);
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const calculateMultiDiscount = (baseAmount: number, formula: string): { finalAmount: number; totalDiscount: number; effectiveRate: number } => {
    const discounts = formula.split('+').map(d => parseFloat(d.trim())).filter(d => !isNaN(d) && d > 0);
    if (discounts.length === 0) {
      return { finalAmount: baseAmount, totalDiscount: 0, effectiveRate: 0 };
    }
    let currentAmount = baseAmount;
    let totalDiscount = 0;
    for (const discount of discounts) {
      const discountAmount = (currentAmount * discount) / 100;
      currentAmount -= discountAmount;
      totalDiscount += discountAmount;
    }
    const effectiveRate = baseAmount > 0 ? (totalDiscount / baseAmount) * 100 : 0;
    return { finalAmount: currentAmount, totalDiscount, effectiveRate };
  };

  const handleAddKalem = () => {
    setFormData(prev => ({
      ...prev,
      kalemler: [...prev.kalemler, {
        stokId: '',
        miktar: 1,
        birimFiyat: 0,
        kdvOrani: 20,
        iskontoOran: 0,
        iskontoTutar: 0,
        cokluIskonto: false,
        iskontoFormula: '',
      }],
    }));
  };

  const handleRemoveKalem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      kalemler: prev.kalemler.filter((_, i) => i !== index),
    }));
  };

  const handleKalemChange = (index: number, field: keyof IrsaliyeKalemi, value: any) => {
    setFormData(prev => {
      const newKalemler = [...prev.kalemler];
      const kalem = { ...newKalemler[index] };

      if (field === 'stokId') {
        const stok = stoklar.find(s => s.id === value);
        if (stok) {
          kalem.stokId = value;
          kalem.birimFiyat = stok.satisFiyati;
          kalem.kdvOrani = stok.kdvOrani;
        }
      } else if (field === 'cokluIskonto') {
        kalem.cokluIskonto = value;
        if (!value) {
          kalem.iskontoFormula = '';
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        } else {
          if (kalem.iskontoOran > 0) {
            kalem.iskontoFormula = kalem.iskontoOran.toString();
          }
        }
      } else if (field === 'iskontoFormula') {
        kalem.iskontoFormula = value;
        const araToplam = kalem.miktar * kalem.birimFiyat;
        const result = calculateMultiDiscount(araToplam, value);
        kalem.iskontoTutar = result.totalDiscount;
        kalem.iskontoOran = result.effectiveRate;
      } else if (field === 'iskontoOran') {
        if (kalem.cokluIskonto) {
          kalem.iskontoFormula = value;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          const result = calculateMultiDiscount(araToplam, value);
          kalem.iskontoTutar = result.totalDiscount;
          kalem.iskontoOran = result.effectiveRate;
        } else {
          kalem.iskontoOran = parseFloat(value) || 0;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        }
      } else if (field === 'iskontoTutar') {
        if (!kalem.cokluIskonto) {
          kalem.iskontoTutar = parseFloat(value) || 0;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoOran = araToplam > 0 ? (kalem.iskontoTutar / araToplam) * 100 : 0;
        }
      } else if (field === 'miktar' || field === 'birimFiyat') {
        kalem[field] = parseFloat(value) || 0;
        const araToplam = kalem.miktar * kalem.birimFiyat;
        if (kalem.cokluIskonto && kalem.iskontoFormula) {
          const result = calculateMultiDiscount(araToplam, kalem.iskontoFormula);
          kalem.iskontoTutar = result.totalDiscount;
          kalem.iskontoOran = result.effectiveRate;
        } else {
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        }
      } else {
        kalem[field] = value;
      }

      newKalemler[index] = kalem;
      return { ...prev, kalemler: newKalemler };
    });
  };

  const calculateKalemTutar = (kalem: IrsaliyeKalemi) => {
    const araToplam = kalem.miktar * kalem.birimFiyat;
    const netTutar = araToplam - kalem.iskontoTutar;
    const kdv = (netTutar * kalem.kdvOrani) / 100;
    return netTutar + kdv;
  };

  const calculateTotals = () => {
    let araToplam = 0;
    let toplamKalemIskontosu = 0;
    let toplamKdv = 0;

    formData.kalemler.forEach(kalem => {
      const kalemAraToplam = kalem.miktar * kalem.birimFiyat;
      araToplam += kalemAraToplam;
      toplamKalemIskontosu += kalem.iskontoTutar;
      const netTutar = kalemAraToplam - kalem.iskontoTutar;
      const kdv = (netTutar * kalem.kdvOrani) / 100;
      toplamKdv += kdv;
    });

    const genelIskonto = formData.genelIskontoTutar || 0;
    const toplamIskonto = toplamKalemIskontosu + genelIskonto;
    const netToplam = araToplam - toplamKalemIskontosu - genelIskonto;
    const genelToplam = netToplam + toplamKdv;

    return { araToplam, toplamKalemIskontosu, genelIskonto, toplamIskonto, toplamKdv, netToplam, genelToplam };
  };

  const handleGenelIskontoOranChange = (value: string) => {
    const oran = parseFloat(value) || 0;
    const araToplam = formData.kalemler.reduce((sum, k) => sum + (k.miktar * k.birimFiyat - k.iskontoTutar), 0);
    const tutar = (araToplam * oran) / 100;
    setFormData(prev => ({ ...prev, genelIskontoOran: oran, genelIskontoTutar: tutar }));
  };

  const handleGenelIskontoTutarChange = (value: string) => {
    const tutar = parseFloat(value) || 0;
    const araToplam = formData.kalemler.reduce((sum, k) => sum + (k.miktar * k.birimFiyat - k.iskontoTutar), 0);
    const oran = araToplam > 0 ? (tutar / araToplam) * 100 : 0;
    setFormData(prev => ({ ...prev, genelIskontoOran: oran, genelIskontoTutar: tutar }));
  };

  const handleSave = async () => {
    try {
      if (!formData.cariId) {
        showSnackbar('Cari seçimi zorunludur', 'error');
        return;
      }

      if (!formData.warehouseId) {
        showSnackbar('Ambar seçimi zorunludur. Lütfen bir ambar seçiniz.', 'error');
        return;
      }

      // Boş stok satırlarını filtrele (stokId boş olanları sil)
      const validKalemler = formData.kalemler.filter(k => k.stokId && k.stokId.trim() !== '');

      if (validKalemler.length === 0) {
        showSnackbar('En az bir kalem eklemelisiniz', 'error');
        return;
      }

      const removedCount = formData.kalemler.length - validKalemler.length;
      if (removedCount > 0) {
        showSnackbar(`${removedCount} adet boş satır otomatik olarak kaldırıldı`, 'info');
      }

      setLoading(true);

      // İskonto hesaplama: Kalem iskontoları toplamı + genel iskonto = toplam iskonto
      const toplamKalemIskontosu = validKalemler.reduce((sum, k) => {
        const araToplam = k.miktar * k.birimFiyat;
        return sum + (k.iskontoTutar || 0);
      }, 0);
      const toplamIskonto = toplamKalemIskontosu + (formData.genelIskontoTutar || 0);

      await axios.post('/satis-irsaliyesi', {
        irsaliyeNo: formData.irsaliyeNo,
        irsaliyeTarihi: new Date(formData.irsaliyeTarihi).toISOString(),
        cariId: formData.cariId,
        kaynakTip: formData.kaynakTip,
        ...(formData.kaynakId && { kaynakId: formData.kaynakId }),
        durum: formData.durum,
        iskonto: toplamIskonto,
        aciklama: formData.aciklama || null,
        warehouseId: formData.warehouseId || null,
        kalemler: validKalemler.map(k => ({
          stokId: k.stokId,
          miktar: Number(k.miktar),
          birimFiyat: Number(k.birimFiyat),
          kdvOrani: Number(k.kdvOrani),
          iskontoOrani: Number(k.iskontoOran) || 0,
          iskontoTutari: Number(k.iskontoTutar) || 0,
        })),
      });

      showSnackbar('İrsaliye başarıyla oluşturuldu', 'success');
      setTimeout(() => {
        router.push('/satis-irsaliyesi');
      }, 1500);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
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

  const totals = calculateTotals();

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton
            onClick={() => router.push('/satis-irsaliyesi')}
            sx={{
              bgcolor: 'var(--muted)',
              color: 'var(--foreground)',
              '&:hover': {
                bgcolor: 'var(--accent)',
                transform: 'translateX(-2px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowBack />
          </IconButton>
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
              Yeni Satış İrsaliyesi
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--muted-foreground)',
                fontSize: '0.875rem',
              }}
            >
              {siparisId ? 'Siparişten irsaliye oluşturuluyor...' : 'Satış irsaliyesi oluşturun'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {loadingSiparis ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Sipariş bilgileri yükleniyor...
            </Typography>
          </Box>
        </Box>
      ) : (
        <Paper sx={{
          p: 3,
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)',
          bgcolor: 'var(--card)',
        }}>
          <Stack spacing={3}>
            {siparisId && (
              <Box sx={{
                p: 2,
                bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                borderRadius: 'var(--radius)',
                border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
              }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--primary)',
                    fontWeight: 600,
                  }}
                >
                  ℹ️ Bu irsaliye sipariş bilgilerinden otomatik olarak doldurulmuştur.
                </Typography>
              </Box>
            )}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'var(--foreground)',
                  mb: 2,
                }}
              >
                İrsaliye Bilgileri
              </Typography>
              <Divider sx={{ mb: 2, borderColor: 'var(--border)' }} />
              {warehouses.length === 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Sistemde tanımlı ambar bulunmamaktadır. İşlem yapabilmek için lütfen önce ambar tanımlayınız.
                </Alert>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: '1 1 200px' }}
                label="İrsaliye No"
                value={formData.irsaliyeNo}
                onChange={(e) => setFormData(prev => ({ ...prev, irsaliyeNo: e.target.value }))}
                required
              />
              <TextField
                sx={{ flex: '1 1 200px' }}
                className="form-control-textfield"
                type="date"
                label="İrsaliye Tarihi"
                value={formData.irsaliyeTarihi}
                onChange={(e) => setFormData(prev => ({ ...prev, irsaliyeTarihi: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
              <FormControl sx={{ flex: '1 1 200px' }} className="form-control-select" required>
                <InputLabel>Ambar</InputLabel>
                <Select
                  value={formData.warehouseId}
                  onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                  label="Ambar"
                >
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} {warehouse.isDefault && '(Varsayılan)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Autocomplete
                fullWidth
                value={cariler.find(c => c.id === formData.cariId) || null}
                onChange={(_, newValue) => {
                  setFormData(prev => ({ ...prev, cariId: newValue?.id || '' }));
                }}
                options={cariler}
                getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {option.unvan}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.cariKodu} - {option.tip === 'MUSTERI' ? 'Müşteri' : 'Tedarikçi'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    className="form-control-textfield"
                    label="Cari Seçiniz"
                    placeholder="Cari kodu veya ünvanı ile ara..."
                    required
                  />
                )}
                noOptionsText="Cari bulunamadı"
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Box>

            {/* Kalemler */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'var(--foreground)',
                  }}
                >
                  İrsaliye Kalemleri
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleAddKalem}
                  sx={{
                    bgcolor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'var(--primary-hover)',
                      transform: 'translateY(-1px)',
                      boxShadow: 'var(--shadow-md)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  + Yeni Kalem Ekle
                </Button>
              </Box>
              <Divider sx={{ mb: 2, borderColor: 'var(--border)' }} />

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  maxHeight: 400,
                  borderRadius: 'var(--radius)',
                  borderColor: 'var(--border)',
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                      <TableCell width="25%" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Stok</TableCell>
                      <TableCell width="8%" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Miktar</TableCell>
                      <TableCell width="10%" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Birim Fiyat</TableCell>
                      <TableCell width="8%" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>KDV %</TableCell>
                      <TableCell width="3%" sx={{ fontWeight: 700, color: 'var(--foreground)' }} title="Çoklu İskonto">Ç.İ.</TableCell>
                      <TableCell width="10%" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>İsk. Oran %</TableCell>
                      <TableCell width="12%" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>İsk. Tutar</TableCell>
                      <TableCell width="12%" align="right" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Toplam</TableCell>
                      <TableCell width="5%" align="center" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Sil</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.kalemler.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            Henüz kalem eklenmedi. Yukarıdaki butonu kullanarak kalem ekleyin.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.kalemler.map((kalem, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Autocomplete
                              size="small"
                              open={autocompleteOpenStates[index] || false}
                              onOpen={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: true }))}
                              onClose={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }))}
                              value={stoklar.find(s => s.id === kalem.stokId) || null}
                              onChange={(_, newValue) => {
                                handleKalemChange(index, 'stokId', newValue?.id || '');
                                setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }));
                              }}
                              options={stoklar}
                              getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                              filterOptions={(options, params) => {
                                const { inputValue } = params;
                                if (!inputValue) return options;
                                const lowerInput = inputValue.toLowerCase();
                                return options.filter(option =>
                                  option.stokKodu.toLowerCase().includes(lowerInput) ||
                                  option.stokAdi.toLowerCase().includes(lowerInput) ||
                                  (option.barkod && option.barkod.toLowerCase().includes(lowerInput))
                                );
                              }}
                              renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                let stockColor = 'var(--success)';
                                if (option.miktar <= 0) stockColor = 'var(--destructive)';
                                else if (option.miktar < 10) stockColor = 'var(--warning)';

                                return (
                                  <Box component="li" key={key} {...otherProps}>
                                    <Box sx={{ width: '100%' }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" fontWeight="600">
                                          {option.stokAdi}
                                        </Typography>
                                        <Chip
                                          label={`Stok: ${option.miktar}`}
                                          size="small"
                                          sx={{
                                            height: 20,
                                            fontSize: '0.7rem',
                                            bgcolor: `color-mix(in srgb, ${stockColor} 10%, transparent)`,
                                            color: stockColor,
                                            border: `1px solid ${stockColor}`,
                                          }}
                                        />
                                      </Box>
                                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                          Kod: {option.stokKodu}
                                        </Typography>
                                        {option.barkod && (
                                          <Typography variant="caption" color="text.secondary">
                                            | Barkod: {option.barkod}
                                          </Typography>
                                        )}
                                      </Box>
                                    </Box>
                                  </Box>
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  className="form-control-textfield"
                                  placeholder="Stok kodu, adı veya barkod ile ara..."
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !(autocompleteOpenStates[index])) {
                                      e.preventDefault();
                                      handleAddKalem();
                                    }
                                  }}
                                />
                              )}
                              noOptionsText="Stok bulunamadı"
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              type="number"
                              size="small"
                              className="form-control-textfield"
                              value={kalem.miktar}
                              onChange={(e) => handleKalemChange(index, 'miktar', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddKalem();
                                }
                              }}
                              inputProps={{ min: 1, step: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              type="number"
                              size="small"
                              className="form-control-textfield"
                              value={kalem.birimFiyat}
                              onChange={(e) => handleKalemChange(index, 'birimFiyat', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddKalem();
                                }
                              }}
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              type="number"
                              size="small"
                              className="form-control-textfield"
                              value={kalem.kdvOrani}
                              onChange={(e) => handleKalemChange(index, 'kdvOrani', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddKalem();
                                }
                              }}
                              inputProps={{ min: 0, max: 100 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleKalemChange(index, 'cokluIskonto', !kalem.cokluIskonto)}
                              title={kalem.cokluIskonto ? 'Çoklu İskonto: Açık (10+5 formatı)' : 'Çoklu İskonto: Kapalı (Tek oran)'}
                              sx={{
                                color: kalem.cokluIskonto ? 'var(--chart-2)' : 'var(--muted-foreground)',
                                '&:hover': {
                                  bgcolor: kalem.cokluIskonto
                                    ? 'color-mix(in srgb, var(--chart-2) 10%, transparent)'
                                    : 'var(--muted)',
                                }
                              }}
                            >
                              {kalem.cokluIskonto ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            {kalem.cokluIskonto ? (
                              <TextField
                                fullWidth
                                size="small"
                                className="form-control-textfield"
                                value={kalem.iskontoFormula || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^[\d+]*$/.test(value)) {
                                    handleKalemChange(index, 'iskontoFormula', value);
                                  }
                                }}
                                placeholder="10+5"
                                helperText={kalem.iskontoOran > 0 ? `Efektif: %${kalem.iskontoOran.toFixed(2)}` : ''}
                                sx={{
                                  '& .MuiInputBase-input': {
                                    fontFamily: 'monospace',
                                    fontWeight: 600,
                                    color: 'var(--chart-2)',
                                  },
                                  '& .MuiFormHelperText-root': {
                                    fontSize: '0.65rem',
                                    mt: 0.5,
                                  }
                                }}
                              />
                            ) : (
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                className="form-control-textfield"
                                value={kalem.iskontoOran || ''}
                                onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)}
                                inputProps={{
                                  min: 0,
                                  max: 100,
                                  step: 0.01,
                                }}
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
                            )}
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              type="number"
                              size="small"
                              className="form-control-textfield"
                              value={kalem.iskontoTutar || ''}
                              onChange={(e) => handleKalemChange(index, 'iskontoTutar', e.target.value)}
                              disabled={kalem.cokluIskonto}
                              inputProps={{
                                min: 0,
                                step: 0.01,
                              }}
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
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: 'var(--primary)',
                              }}
                            >
                              {formatCurrency(calculateKalemTutar(kalem))}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveKalem(index)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Genel İskonto */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <TextField
                type="number"
                label="Genel İskonto %"
                className="form-control-textfield"
                value={formData.genelIskontoOran || ''}
                onChange={(e) => handleGenelIskontoOranChange(e.target.value)}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                helperText="İskonto oranı"
                sx={{
                  width: { xs: '100%', sm: '200px' },
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
              <TextField
                type="number"
                label="Genel İskonto (₺)"
                className="form-control-textfield"
                value={formData.genelIskontoTutar || ''}
                onChange={(e) => handleGenelIskontoTutarChange(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="İskonto tutarı"
                sx={{
                  width: { xs: '100%', sm: '200px' },
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
            </Box>

            {/* Açıklama */}
            <Box>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Açıklama / Notlar"
                className="form-control-textfield"
                value={formData.aciklama}
                onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
              />
            </Box>

            {/* Toplam Bilgileri */}
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                bgcolor: 'color-mix(in srgb, var(--muted) 50%, transparent)',
                borderRadius: 'var(--radius)',
                borderColor: 'var(--border)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'var(--foreground)',
                  mb: 2,
                }}
              >
                İrsaliye Özeti
              </Typography>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Ara Toplam:</Typography>
                    <Typography variant="body1" fontWeight="600">{formatCurrency(totals.araToplam)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Kalem İndirimleri:</Typography>
                    <Typography variant="body1" fontWeight="600" color={totals.toplamKalemIskontosu > 0 ? "error" : "inherit"}>
                      {totals.toplamKalemIskontosu > 0 ? '- ' : ''}{formatCurrency(totals.toplamKalemIskontosu)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Genel İskonto:</Typography>
                    <Typography variant="body1" fontWeight="600" color={totals.genelIskonto > 0 ? "error" : "inherit"}>
                      {totals.genelIskonto > 0 ? '- ' : ''}{formatCurrency(totals.genelIskonto)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" fontWeight="bold">Toplam İndirim:</Typography>
                    <Typography variant="body1" fontWeight="bold" color={totals.toplamIskonto > 0 ? "error" : "inherit"}>
                      {totals.toplamIskonto > 0 ? '- ' : ''}{formatCurrency(totals.toplamIskonto)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">KDV Toplamı:</Typography>
                    <Typography variant="body1" fontWeight="600">{formatCurrency(totals.toplamKdv)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1, borderColor: 'var(--border)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: 'var(--foreground)',
                      }}
                    >
                      Genel Toplam:
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: 'var(--primary)',
                      }}
                    >
                      {formatCurrency(totals.genelToplam)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Action Buttons */}
            <Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/satis-irsaliyesi')}
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
                  İptal
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    bgcolor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 150,
                    boxShadow: 'var(--shadow-sm)',
                    '&:hover': {
                      bgcolor: 'var(--primary-hover)',
                      boxShadow: 'var(--shadow-md)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {loading ? 'Kaydediliyor...' : 'İrsaliyeyi Kaydet'}
                </Button>
              </Box>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

export default function YeniSatisIrsaliyesiPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    }>
      <YeniSatisIrsaliyesiPageContent />
    </Suspense>
  );
}
