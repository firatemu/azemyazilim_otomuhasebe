'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Stack,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  DialogContentText,
  CircularProgress,
} from '@mui/material';
import { Delete, Save, ArrowBack, ToggleOn, ToggleOff, LocalShipping } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  satisFiyati: number;
  alisFiyati: number;
  kdvOrani: number;
  barkod?: string;
}

interface FaturaKalemi {
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

function YeniAlisFaturasiPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const irsaliyeId = searchParams.get('irsaliyeId');

  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingIrsaliye, setLoadingIrsaliye] = useState(false);

  const [formData, setFormData] = useState({
    faturaNo: '',
    faturaTipi: 'ALIS' as 'SATIS' | 'ALIS',
    cariId: '',
    tarih: new Date().toISOString().split('T')[0],
    vade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    durum: 'ONAYLANDI' as 'ACIK' | 'ONAYLANDI',
    genelIskontoOran: 0,
    genelIskontoTutar: 0,
    aciklama: '',
    kalemler: [] as FaturaKalemi[],
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [autocompleteOpenStates, setAutocompleteOpenStates] = useState<Record<number, boolean>>({});
  const [openIrsaliyeDialog, setOpenIrsaliyeDialog] = useState(false);
  const [irsaliyeler, setIrsaliyeler] = useState<any[]>([]);
  const [selectedIrsaliyeler, setSelectedIrsaliyeler] = useState<string[]>([]);
  const [loadingIrsaliyeler, setLoadingIrsaliyeler] = useState(false);

  useEffect(() => {
    fetchCariler();
    fetchStoklar();

    if (irsaliyeId) {
      fetchIrsaliyeBilgileri(irsaliyeId);
    } else {
      generateFaturaNo();
    }
  }, [irsaliyeId]);

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

  const generateFaturaNo = async () => {
    try {
      const response = await axios.get('/fatura', {
        params: { faturaTipi: 'ALIS', page: 1, limit: 1 },
      });
      const faturalar = response.data?.data || [];
      const lastFaturaNo = faturalar[0]?.faturaNo;
      const lastNoRaw = typeof lastFaturaNo === 'string' ? (lastFaturaNo.split('-')[2] || '0') : '0';
      const lastNo = parseInt(lastNoRaw, 10);
      const seq = (isNaN(lastNo) ? 0 : lastNo) + 1;
      const newNo = String(seq).padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        faturaNo: `AF-${new Date().getFullYear()}-${newNo}`,
      }));
    } catch (error: any) {
      setFormData(prev => ({
        ...prev,
        faturaNo: `AF-${new Date().getFullYear()}-001`,
      }));
      console.error('Fatura numarası oluşturulurken hata:', error);
      showSnackbar('Fatura numarası oluşturulamadı, varsayılan atandı', 'info');
    }
  };

  const fetchIrsaliyeBilgileri = async (id: string) => {
    try {
      setLoadingIrsaliye(true);
      const response = await axios.get(`/satin-alma-irsaliyesi/${id}`);
      const irsaliye = response.data;

      console.log('Satın alma irsaliyesi bilgileri yüklendi:', irsaliye);

      // Cari bilgisini set et
      if (irsaliye.cari) {
        setFormData(prev => ({
          ...prev,
          cariId: irsaliye.cari.id,
          tarih: new Date(irsaliye.irsaliyeTarihi).toISOString().split('T')[0],
          vade: irsaliye.cari.vadeSuresi && irsaliye.cari.vadeSuresi > 0
            ? new Date(Date.now() + irsaliye.cari.vadeSuresi * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          aciklama: irsaliye.aciklama || prev.aciklama,
        }));
      }

      // Kalemleri set et
      if (irsaliye.kalemler && irsaliye.kalemler.length > 0) {
        const kalemler: FaturaKalemi[] = irsaliye.kalemler.map((kalem: any) => ({
          stokId: kalem.stokId,
          stok: kalem.stok ? {
            id: kalem.stok.id,
            stokKodu: kalem.stok.stokKodu,
            stokAdi: kalem.stok.stokAdi,
            satisFiyati: kalem.birimFiyat,
            alisFiyati: kalem.birimFiyat,
            kdvOrani: kalem.kdvOrani,
          } : undefined,
          miktar: kalem.miktar,
          birimFiyat: kalem.birimFiyat,
          kdvOrani: kalem.kdvOrani,
          iskontoOran: 0,
          iskontoTutar: 0,
          cokluIskonto: false,
          iskontoFormula: '',
        }));

        setFormData(prev => ({
          ...prev,
          kalemler,
        }));
      }

      // Genel iskonto varsa set et
      if (irsaliye.iskonto && irsaliye.iskonto > 0) {
        const toplamKalemTutari = irsaliye.kalemler?.reduce((sum: number, kalem: any) => {
          return sum + (kalem.miktar * kalem.birimFiyat);
        }, 0) || 0;

        const genelIskontoOran = toplamKalemTutari > 0
          ? (irsaliye.iskonto / toplamKalemTutari) * 100
          : 0;

        setFormData(prev => ({
          ...prev,
          genelIskontoOran,
          genelIskontoTutar: irsaliye.iskonto,
        }));
      }

      showSnackbar('İrsaliye bilgileri başarıyla yüklendi', 'success');
    } catch (error: any) {
      console.error('İrsaliye bilgileri yüklenirken hata:', error);
      showSnackbar(error.response?.data?.message || 'İrsaliye bilgileri yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingIrsaliye(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const calculateMultiDiscount = (baseAmount: number, formula: string): { finalAmount: number; totalDiscount: number; effectiveRate: number } => {
    // Formula: "10+5" veya "10+5+3"
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

  const handleKalemChange = (index: number, field: keyof FaturaKalemi, value: any) => {
    setFormData(prev => {
      const newKalemler = [...prev.kalemler];
      const kalem = { ...newKalemler[index] };

      if (field === 'stokId') {
        const stok = stoklar.find(s => s.id === value);
        if (stok) {
          kalem.stokId = value;
          kalem.birimFiyat = stok.alisFiyati || stok.satisFiyati;
          kalem.kdvOrani = stok.kdvOrani;
        }
      } else if (field === 'cokluIskonto') {
        kalem.cokluIskonto = value;
        if (!value) {
          // Çoklu iskonto kapatıldı, normal hesaplamaya dön
          kalem.iskontoFormula = '';
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        } else {
          // Çoklu iskonto açıldı, mevcut oranı formula'ya çevir
          if (kalem.iskontoOran > 0) {
            kalem.iskontoFormula = kalem.iskontoOran.toString();
          }
        }
      } else if (field === 'iskontoFormula') {
        // Çoklu iskonto formülü değişti
        kalem.iskontoFormula = value;
        const araToplam = kalem.miktar * kalem.birimFiyat;
        const result = calculateMultiDiscount(araToplam, value);
        kalem.iskontoTutar = result.totalDiscount;
        kalem.iskontoOran = result.effectiveRate;
      } else if (field === 'iskontoOran') {
        if (kalem.cokluIskonto) {
          // Çoklu iskonto modunda oran alanı formül olarak kullanılır
          kalem.iskontoFormula = value;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          const result = calculateMultiDiscount(araToplam, value);
          kalem.iskontoTutar = result.totalDiscount;
          kalem.iskontoOran = result.effectiveRate;
        } else {
          // Normal mod: İskonto oranı değişti, tutarı hesapla
          kalem.iskontoOran = parseFloat(value) || 0;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        }
      } else if (field === 'iskontoTutar') {
        if (!kalem.cokluIskonto) {
          // İskonto tutarı değişti, oranı hesapla (sadece normal modda)
          kalem.iskontoTutar = parseFloat(value) || 0;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoOran = araToplam > 0 ? (kalem.iskontoTutar / araToplam) * 100 : 0;
        }
      } else if (field === 'miktar' || field === 'birimFiyat') {
        kalem[field] = parseFloat(value) || 0;
        // Miktar veya birim fiyat değişti, iskonto tutarını yeniden hesapla
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

  const calculateKalemTutar = (kalem: FaturaKalemi) => {
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

      // Boş stok satırlarını filtrele (stokId boş olanları sil)
      const validKalemler = formData.kalemler.filter(k => k.stokId && k.stokId.trim() !== '');

      if (validKalemler.length === 0) {
        showSnackbar('En az bir kalem eklemelisiniz', 'error');
        return;
      }

      // Boş satır sayısı varsa kullanıcıyı bilgilendir
      const removedCount = formData.kalemler.length - validKalemler.length;
      if (removedCount > 0) {
        showSnackbar(`${removedCount} adet boş satır otomatik olarak kaldırıldı`, 'info');
      }

      setLoading(true);
      await axios.post('/fatura', {
        faturaNo: formData.faturaNo,
        faturaTipi: formData.faturaTipi,
        cariId: formData.cariId,
        tarih: new Date(formData.tarih).toISOString(),
        vade: formData.vade ? new Date(formData.vade).toISOString() : null,
        iskonto: Number(formData.genelIskontoTutar) || 0,
        aciklama: formData.aciklama || null,
        durum: formData.durum,
        kalemler: validKalemler.map(k => ({
          stokId: k.stokId,
          miktar: Number(k.miktar),
          birimFiyat: Number(k.birimFiyat),
          kdvOrani: Number(k.kdvOrani),
        })),
      });

      showSnackbar('Fatura başarıyla oluşturuldu', 'success');
      setTimeout(() => {
        router.push('/fatura/alis');
      }, 1500);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchIrsaliyeler = async (cariId: string) => {
    if (!cariId) {
      showSnackbar('Önce cari hesap seçmelisiniz', 'error');
      return;
    }

    try {
      setLoadingIrsaliyeler(true);
      const response = await axios.get('/satin-alma-irsaliyesi', {
        params: {
          cariId,
          durum: 'FATURALANMADI',
          limit: 100,
        },
      });
      setIrsaliyeler(response.data.data || []);
      setOpenIrsaliyeDialog(true);
    } catch (error: any) {
      console.error('İrsaliyeler yüklenirken hata:', error);
      showSnackbar(error.response?.data?.message || 'İrsaliyeler yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingIrsaliyeler(false);
    }
  };

  const handleIrsaliyelerdenEkle = async () => {
    if (selectedIrsaliyeler.length === 0) {
      showSnackbar('En az bir irsaliye seçmelisiniz', 'error');
      return;
    }

    try {
      setLoadingIrsaliyeler(true);
      const tumKalemler: FaturaKalemi[] = [];

      // Seçilen her irsaliye için kalemleri topla
      for (const irsaliyeId of selectedIrsaliyeler) {
        const response = await axios.get(`/satin-alma-irsaliyesi/${irsaliyeId}`);
        const irsaliye = response.data;

        if (irsaliye.kalemler && irsaliye.kalemler.length > 0) {
          const kalemler: FaturaKalemi[] = irsaliye.kalemler.map((kalem: any) => ({
            stokId: kalem.stokId,
            stok: kalem.stok ? {
              id: kalem.stok.id,
              stokKodu: kalem.stok.stokKodu,
              stokAdi: kalem.stok.stokAdi,
              satisFiyati: kalem.birimFiyat,
              alisFiyati: kalem.birimFiyat,
              kdvOrani: kalem.kdvOrani,
            } : undefined,
            miktar: kalem.miktar,
            birimFiyat: kalem.birimFiyat,
            kdvOrani: kalem.kdvOrani,
            iskontoOran: 0,
            iskontoTutar: 0,
            cokluIskonto: false,
            iskontoFormula: '',
          }));

          tumKalemler.push(...kalemler);
        }
      }

      // Mevcut kalemlere ekle (aynı stok varsa miktarını artır)
      setFormData(prev => {
        const yeniKalemler = [...prev.kalemler];

        tumKalemler.forEach(yeniKalem => {
          const mevcutIndex = yeniKalemler.findIndex(k => k.stokId === yeniKalem.stokId);
          if (mevcutIndex >= 0) {
            // Aynı stok varsa miktarı artır
            yeniKalemler[mevcutIndex].miktar += yeniKalem.miktar;
          } else {
            // Yeni kalem ekle
            yeniKalemler.push(yeniKalem);
          }
        });

        return {
          ...prev,
          kalemler: yeniKalemler,
        };
      });

      setOpenIrsaliyeDialog(false);
      setSelectedIrsaliyeler([]);
      showSnackbar(`${selectedIrsaliyeler.length} irsaliyeden ${tumKalemler.length} kalem eklendi`, 'success');
    } catch (error: any) {
      console.error('İrsaliye kalemleri yüklenirken hata:', error);
      showSnackbar(error.response?.data?.message || 'İrsaliye kalemleri yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingIrsaliyeler(false);
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
            onClick={() => router.push('/fatura/alis')}
            sx={{
              bgcolor: '#f3f4f6',
              '&:hover': { bgcolor: '#e5e7eb' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Yeni Satın Alma Faturası
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Satın alma faturası oluşturun
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={3}>
          {/* Fatura Bilgileri */}
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Fatura Bilgileri
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ flex: '1 1 200px' }}
              label="Fatura No"
              value={formData.faturaNo}
              onChange={(e) => setFormData(prev => ({ ...prev, faturaNo: e.target.value }))}
              required
            />
            <TextField
              sx={{ flex: '1 1 200px' }}
              type="date"
              label="Tarih"
              value={formData.tarih}
              onChange={(e) => setFormData(prev => ({ ...prev, tarih: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              sx={{ flex: '1 1 200px' }}
              type="date"
              label="Vade"
              value={formData.vade}
              onChange={(e) => setFormData(prev => ({ ...prev, vade: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl sx={{ flex: '1 1 200px' }} required>
              <InputLabel>Durum</InputLabel>
              <Select
                value={formData.durum}
                onChange={(e) => setFormData(prev => ({ ...prev, durum: e.target.value as 'ACIK' | 'ONAYLANDI' }))}
                label="Durum"
              >
                <MenuItem value="ACIK">Beklemede</MenuItem>
                <MenuItem value="ONAYLANDI">Onaylandı</MenuItem>
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
              <Typography variant="h6" fontWeight="bold">Fatura Kalemleri</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<LocalShipping />}
                  onClick={() => fetchIrsaliyeler(formData.cariId)}
                  disabled={!formData.cariId || loadingIrsaliyeler}
                  sx={{
                    borderColor: '#f59e0b',
                    color: '#f59e0b',
                    '&:hover': {
                      borderColor: '#d97706',
                      bgcolor: '#fef3c7',
                    },
                  }}
                >
                  İrsaliyeden Ekle
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAddKalem}
                  sx={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  }}
                >
                  + Yeni Kalem Ekle
                </Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="25%" sx={{ fontWeight: 600 }}>Stok</TableCell>
                    <TableCell width="8%" sx={{ fontWeight: 600 }}>Miktar</TableCell>
                    <TableCell width="10%" sx={{ fontWeight: 600 }}>Birim Fiyat</TableCell>
                    <TableCell width="8%" sx={{ fontWeight: 600 }}>KDV %</TableCell>
                    <TableCell width="3%" sx={{ fontWeight: 600 }} title="Çoklu İskonto">Ç.İ.</TableCell>
                    <TableCell width="10%" sx={{ fontWeight: 600 }}>İsk. Oran %</TableCell>
                    <TableCell width="12%" sx={{ fontWeight: 600 }}>İsk. Tutar</TableCell>
                    <TableCell width="12%" align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                    <TableCell width="5%" align="center" sx={{ fontWeight: 600 }}>Sil</TableCell>
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
                              return (
                                <Box component="li" key={key} {...otherProps}>
                                  <Box>
                                    <Typography variant="body2" fontWeight="600">
                                      {option.stokAdi}
                                    </Typography>
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
                                placeholder="Stok kodu, adı veya barkod ile ara..."
                                onKeyDown={(e) => {
                                  // Dropdown açık değilse ve Enter tuşuna basıldıysa yeni kalem ekle
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
                              color: kalem.cokluIskonto ? '#10b981' : '#9ca3af',
                              '&:hover': {
                                bgcolor: kalem.cokluIskonto ? '#ecfdf5' : '#f3f4f6',
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
                              value={kalem.iskontoFormula || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Sadece rakam ve + işaretine izin ver
                                if (/^[\d+]*$/.test(value)) {
                                  handleKalemChange(index, 'iskontoFormula', value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddKalem();
                                }
                              }}
                              placeholder="10+5"
                              helperText={kalem.iskontoOran > 0 ? `Efektif: %${kalem.iskontoOran.toFixed(2)}` : ''}
                              sx={{
                                '& .MuiInputBase-input': {
                                  fontFamily: 'monospace',
                                  fontWeight: 600,
                                  color: '#10b981',
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
                              value={kalem.iskontoOran || ''}
                              onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddKalem();
                                }
                              }}
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
                            value={kalem.iskontoTutar || ''}
                            onChange={(e) => handleKalemChange(index, 'iskontoTutar', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddKalem();
                              }
                            }}
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
                          <Typography variant="body2" fontWeight="bold" color="primary">
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
              value={formData.aciklama}
              onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
            />
          </Box>

          {/* Toplam Bilgileri */}
          <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f9fafb' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Fatura Özeti
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
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">Genel Toplam:</Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        color: '#f59e0b',
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
                onClick={() => router.push('/fatura/alis')}
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
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  minWidth: 150,
                }}
              >
                {loading ? 'Kaydediliyor...' : 'Faturayı Kaydet'}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* İrsaliye Seçim Dialog */}
      <Dialog
        open={openIrsaliyeDialog}
        onClose={() => {
          setOpenIrsaliyeDialog(false);
          setSelectedIrsaliyeler([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Faturalandırılmamış İrsaliyeleri Seçin</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Seçili cari hesaba ait faturalandırılmamış irsaliyelerden kalemleri faturaya ekleyebilirsiniz.
          </DialogContentText>
          {loadingIrsaliyeler ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : irsaliyeler.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              Bu cari hesaba ait faturalandırılmamış irsaliye bulunamadı.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ width: 50 }}></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>İrsaliye No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Genel Toplam</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Kalem Sayısı</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {irsaliyeler.map((irsaliye) => (
                    <TableRow
                      key={irsaliye.id}
                      hover
                      onClick={() => {
                        setSelectedIrsaliyeler(prev =>
                          prev.includes(irsaliye.id)
                            ? prev.filter(id => id !== irsaliye.id)
                            : [...prev, irsaliye.id]
                        );
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIrsaliyeler.includes(irsaliye.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedIrsaliyeler(prev =>
                              prev.includes(irsaliye.id)
                                ? prev.filter(id => id !== irsaliye.id)
                                : [...prev, irsaliye.id]
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {irsaliye.irsaliyeNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(irsaliye.irsaliyeTarihi).toLocaleDateString('tr-TR')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="500">
                          {formatCurrency(Number(irsaliye.genelToplam))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {irsaliye._count?.kalemler || 0} kalem
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenIrsaliyeDialog(false);
              setSelectedIrsaliyeler([]);
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleIrsaliyelerdenEkle}
            variant="contained"
            disabled={selectedIrsaliyeler.length === 0 || loadingIrsaliyeler}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            }}
          >
            {loadingIrsaliyeler ? 'Ekleniyor...' : `Seçilenleri Ekle (${selectedIrsaliyeler.length})`}
          </Button>
        </DialogActions>
      </Dialog>

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

export default function YeniAlisFaturasiPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>}>
      <YeniAlisFaturasiPageContent />
    </Suspense>
  );
}
