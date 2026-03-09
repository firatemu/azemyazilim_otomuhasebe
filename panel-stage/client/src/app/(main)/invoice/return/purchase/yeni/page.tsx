'use client';

import React, { Suspense, useState, useEffect } from 'react';
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
  CircularProgress,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { Delete, Save, ArrowBack, ToggleOn, ToggleOff, ShoppingCart } from '@mui/icons-material';
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
  alisFiyati: number;
  kdvOrani: number;
  barkod?: string;
  miktar?: number;
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

function YeniAlisIadeFaturasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const originalId = searchParams.get('originalId');
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    faturaNo: '',
    faturaTipi: 'ALIS_IADE' as const,
    cariId: '',
    warehouseId: '',
    tarih: new Date().toISOString().split('T')[0],
    vade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    durum: 'ONAYLANDI' as 'ACIK' | 'ONAYLANDI',
    genelIskontoOran: 0,
    genelIskontoTutar: 0,
    aciklama: '',
    dovizCinsi: 'TRY' as 'TRY' | 'USD' | 'EUR' | 'GBP',
    dovizKuru: 1,
    kalemler: [] as FaturaKalemi[],
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [autocompleteOpenStates, setAutocompleteOpenStates] = useState<Record<number, boolean>>({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const MobileItemCard = ({ kalem, index }: { kalem: FaturaKalemi, index: number }) => (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        position: 'relative',
        bgcolor: 'var(--card)',
      }}
    >
      <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
        <IconButton
          size="small"
          color="error"
          onClick={() => handleRemoveKalem(index)}
          sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>

      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, mb: 0.5, display: 'block' }}>
            Stok / Hizmet
          </Typography>
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
              if (option.miktar !== undefined) {
                if (option.miktar <= 0) stockColor = 'var(--destructive)';
                else if (option.miktar < 10) stockColor = 'var(--warning)';
              }

              return (
                <Box component="li" key={key} {...otherProps}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="600">
                        {option.stokAdi}
                      </Typography>
                      {option.miktar !== undefined && (
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
                      )}
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
              <TextField {...params} placeholder="Stok kodu, adı veya barkod ile ara..." />
            )}
            noOptionsText="Stok bulunamadı"
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, mb: 0.5, display: 'block' }}>
              Miktar
            </Typography>
            <TextField
              fullWidth
              type="number"
              size="small"
              value={kalem.miktar}
              onChange={(e) => handleKalemChange(index, 'miktar', e.target.value)}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, mb: 0.5, display: 'block' }}>
              Birim Fiyat
            </Typography>
            <TextField
              fullWidth
              type="number"
              size="small"
              value={kalem.birimFiyat}
              onChange={(e) => handleKalemChange(index, 'birimFiyat', e.target.value)}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, mb: 0.5, display: 'block' }}>
              KDV %
            </Typography>
            <TextField
              fullWidth
              type="number"
              size="small"
              value={kalem.kdvOrani}
              onChange={(e) => handleKalemChange(index, 'kdvOrani', e.target.value)}
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                İskonto
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleKalemChange(index, 'cokluIskonto', !kalem.cokluIskonto)}
                sx={{ p: 0, color: kalem.cokluIskonto ? '#10b981' : '#9ca3af' }}
              >
                {kalem.cokluIskonto ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
              </IconButton>
            </Box>
            {kalem.cokluIskonto ? (
              <TextField
                fullWidth
                size="small"
                value={kalem.iskontoFormula || ''}
                onChange={(e) => handleKalemChange(index, 'iskontoFormula', e.target.value)}
                placeholder="10+5"
              />
            ) : (
              <TextField
                fullWidth
                type="number"
                size="small"
                value={kalem.iskontoOran || ''}
                onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)}
              />
            )}
          </Box>
        </Box>

        <Box sx={{
          pt: 1,
          mt: 1,
          borderTop: '1px dashed var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body2" fontWeight="700">Satır Toplamı:</Typography>
          <Typography variant="body1" fontWeight="800" color="primary">
            {formatCurrency(calculateKalemTutar(kalem))}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );

  useEffect(() => {
    fetchCariler();
    fetchStoklar();
    fetchWarehouses();
    generateFaturaNo();

    // Orijinal faturadan iade oluşturma
    if (originalId) {
      loadOriginalFatura(originalId);
    }
  }, [originalId]);

  const fetchCariler = async () => {
    try {
      const response = await axios.get('/account', {
        params: { limit: 1000 },
      });
      setCariler(response.data.data || []);
    } catch (error) {
      console.error('Cariler yüklenirken hata:', error);
    }
  };

  const fetchStoklar = async () => {
    try {
      const response = await axios.get('/product', {
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
      showSnackbar('Ambar listesi alınamadı', 'error');
    }
  };

  const generateFaturaNo = async () => {
    try {
      const response = await axios.get('/invoice', {
        params: { faturaTipi: 'ALIS_IADE', page: 1, limit: 1 },
      });
      const faturalar = response.data?.data || [];
      const lastFaturaNo = faturalar[0]?.faturaNo;
      const lastNoRaw = typeof lastFaturaNo === 'string' ? (lastFaturaNo.split('-')[2] || '0') : '0';
      const lastNo = parseInt(lastNoRaw, 10);
      const seq = (isNaN(lastNo) ? 0 : lastNo) + 1;
      const newNo = String(seq).padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        faturaNo: `AIF-${new Date().getFullYear()}-${newNo}`,
      }));
    } catch (error: any) {
      setFormData(prev => ({
        ...prev,
        faturaNo: `AIF-${new Date().getFullYear()}-001`,
      }));
      console.error('Fatura numarası oluşturulurken hata:', error);
      showSnackbar('Fatura numarası oluşturulamadı, varsayılan atandı', 'info');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadOriginalFatura = async (faturaId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/fatura/${faturaId}`);
      const originalFatura = response.data;

      // Orijinal fatura bilgilerini form'a yükle
      setFormData(prev => ({
        ...prev,
        cariId: originalFatura.cariId,
        warehouseId: originalFatura.warehouseId || prev.warehouseId,
        tarih: new Date().toISOString().split('T')[0], // İade tarihi bugün
        vade: originalFatura.vade ? new Date(originalFatura.vade).toISOString().split('T')[0] : prev.vade,
        genelIskontoOran: 0,
        genelIskontoTutar: originalFatura.iskonto || 0,
        aciklama: `${originalFatura.faturaNo} nolu faturanın iadesi`,
        kalemler: originalFatura.kalemler.map((k: any) => ({
          stokId: k.stokId,
          miktar: k.miktar,
          birimFiyat: k.birimFiyat,
          kdvOrani: k.kdvOrani,
          iskontoOran: 0,
          iskontoTutar: 0,
          cokluIskonto: false,
          iskontoFormula: '',
        })),
      }));

      showSnackbar(`${originalFatura.faturaNo} nolu fatura bilgileri yüklendi`, 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Orijinal fatura yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
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

  const handleKalemChange = (index: number, field: keyof FaturaKalemi, value: any) => {
    setFormData(prev => {
      const newKalemler = [...prev.kalemler];
      const kalem = { ...newKalemler[index] };

      if (field === 'stokId') {
        const stok = stoklar.find(s => s.id === value);
        if (stok) {
          kalem.stokId = value;
          kalem.birimFiyat = (stok as any).alisFiyati || 0;
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

  const handleCurrencyChange = async (currency: 'TRY' | 'USD' | 'EUR' | 'GBP') => {
    if (currency === 'TRY') {
      setFormData(prev => ({ ...prev, dovizCinsi: currency, dovizKuru: 1 }));
      return;
    }

    try {
      setFormData(prev => ({ ...prev, dovizCinsi: currency }));
      const response = await axios.get('/invoice/exchange-rate', {
        params: { currency }
      });

      if (response.data.rate) {
        setFormData(prev => ({ ...prev, dovizKuru: response.data.rate }));
      }
    } catch (error) {
      console.error('Kur alınamadı:', error);
      showSnackbar('Döviz kuru alınamadı, lütfen manuel giriniz.', 'info');
      setFormData(prev => ({ ...prev, dovizKuru: 0 }));
    }
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

      // Boş satır sayısı varsa kullanıcıyı bilgilendir
      const removedCount = formData.kalemler.length - validKalemler.length;
      if (removedCount > 0) {
        showSnackbar(`${removedCount} adet boş satır otomatik olarak kaldırıldı`, 'info');
      }

      setLoading(true);
      await axios.post('/invoice', {
        faturaNo: formData.faturaNo,
        faturaTipi: formData.faturaTipi,
        cariId: formData.cariId,
        tarih: new Date(formData.tarih).toISOString(),
        vade: formData.vade ? new Date(formData.vade).toISOString() : null,
        iskonto: Number(formData.genelIskontoTutar) || 0,
        aciklama: formData.aciklama || null,
        durum: formData.durum,
        dovizCinsi: formData.dovizCinsi,
        dovizKuru: formData.dovizKuru,
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

      showSnackbar('İade faturası başarıyla oluşturuldu', 'success');
      setTimeout(() => {
        router.push('/invoice/iade/alis');
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
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'flex-start',
          gap: 2,
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <IconButton
            onClick={() => router.push('/invoice/iade/alis')}
            sx={{
              bgcolor: 'var(--slate-100)',
              '&:hover': { bgcolor: 'var(--slate-200)' },
              width: 48,
              height: 48
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: isMobile ? 'center' : 'flex-start', mb: 0.5 }}>
              <ShoppingCart sx={{ color: 'var(--primary)', fontSize: isMobile ? 24 : 32 }} />
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" sx={{
                color: 'var(--foreground)',
                letterSpacing: '-0.02em',
              }}>
                Yeni Satınalma İade Faturası
              </Typography>
            </Box>
            <Typography variant="body2" color="var(--muted-foreground)" sx={{ fontWeight: 500 }}>
              Satınalma iade faturası oluşturun
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', bgcolor: 'var(--card)' }}>
        <Stack spacing={isMobile ? 2 : 3}>
          {/* Fatura Bilgileri */}
          <Box>
            <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 1.5, color: 'var(--foreground)' }}>
              Fatura Bilgileri
            </Typography>
            <Divider sx={{ mb: isMobile ? 2 : 3, borderColor: 'var(--border)' }} />
            {warehouses.length === 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Sistemde tanımlı ambar bulunmamaktadır. İşlem yapabilmek için lütfen önce ambar tanımlayınız.
              </Alert>
            )}
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 2
          }}>
            <TextField
              fullWidth
              label="Fatura No"
              value={formData.faturaNo}
              onChange={(e) => setFormData(prev => ({ ...prev, faturaNo: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              type="date"
              label="Tarih"
              value={formData.tarih}
              onChange={(e) => setFormData(prev => ({ ...prev, tarih: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              type="date"
              label="Vade"
              value={formData.vade}
              onChange={(e) => setFormData(prev => ({ ...prev, vade: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth required>
              <InputLabel>Ambar</InputLabel>
              <Select
                value={formData.warehouseId}
                onChange={(e) => setFormData(prev => ({ ...prev, warehouseId: e.target.value }))}
                label="Ambar"
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} {warehouse.isDefault && '(Varsayılan)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Döviz</InputLabel>
              <Select
                value={formData.dovizCinsi}
                onChange={(e) => handleCurrencyChange(e.target.value as any)}
                label="Döviz"
              >
                <MenuItem value="TRY">Türk Lirası (₺)</MenuItem>
                <MenuItem value="USD">Amerikan Doları ($)</MenuItem>
                <MenuItem value="EUR">Euro (€)</MenuItem>
                <MenuItem value="GBP">İngiliz Sterlini (£)</MenuItem>
              </Select>
            </FormControl>
            {formData.dovizCinsi !== 'TRY' && (
              <TextField
                fullWidth
                type="number"
                label="Döviz Kuru"
                value={formData.dovizKuru}
                onChange={(e) => setFormData(prev => ({ ...prev, dovizKuru: parseFloat(e.target.value) || 1 }))}
                inputProps={{ min: 0, step: 0.01 }}
              />
            )}
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
              <Button
                variant="contained"
                onClick={handleAddKalem}
                sx={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                }}
              >
                + Yeni Kalem Ekle
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {isMobile ? (
              <Box>
                {formData.kalemler.length === 0 ? (
                  <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: 'var(--muted-foreground)' }}>
                    Henüz kalem eklenmedi.
                  </Typography>
                ) : (
                  formData.kalemler.map((kalem, index) => (
                    <MobileItemCard key={index} kalem={kalem} index={index} />
                  ))
                )}
              </Box>
            ) : (
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
                                let stockColor = 'var(--success)';
                                if (option.miktar !== undefined) {
                                  if (option.miktar <= 0) stockColor = 'var(--destructive)';
                                  else if (option.miktar < 10) stockColor = 'var(--warning)';
                                }

                                return (
                                  <Box component="li" key={key} {...otherProps}>
                                    <Box sx={{ width: '100%' }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" fontWeight="600">
                                          {option.stokAdi}
                                        </Typography>
                                        {option.miktar !== undefined && (
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
                                        )}
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
                              value={kalem.miktar}
                              onChange={(e) => handleKalemChange(index, 'miktar', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              type="number"
                              size="small"
                              value={kalem.birimFiyat}
                              onChange={(e) => handleKalemChange(index, 'birimFiyat', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              type="number"
                              size="small"
                              value={kalem.kdvOrani}
                              onChange={(e) => handleKalemChange(index, 'kdvOrani', e.target.value)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleKalemChange(index, 'cokluIskonto', !kalem.cokluIskonto)}
                              sx={{ color: kalem.cokluIskonto ? '#10b981' : '#9ca3af' }}
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
                                onChange={(e) => handleKalemChange(index, 'iskontoFormula', e.target.value)}
                                placeholder="10+5"
                              />
                            ) : (
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.iskontoOran || ''}
                                onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)}
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
                              disabled={kalem.cokluIskonto}
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
            )}
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
          <Paper
            variant="outlined"
            sx={{
              p: isMobile ? 2 : 3,
              bgcolor: 'var(--card)',
              borderRadius: 'var(--radius-md)',
              borderColor: 'var(--border)',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: 'var(--foreground)',
                mb: isMobile ? 1 : 2,
                letterSpacing: '-0.01em',
              }}
            >
              Fatura Özeti
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 0 : 4,
            }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1 }}>
                  <Typography variant="body2" color="var(--muted-foreground)">Ara Toplam:</Typography>
                  <Typography variant="body2" fontWeight="600" color="var(--foreground)">{formatCurrency(totals.araToplam)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1 }}>
                  <Typography variant="body2" color="var(--muted-foreground)">Kalem İndirimleri:</Typography>
                  <Typography variant="body2" fontWeight="600" color={totals.toplamKalemIskontosu > 0 ? "error" : "var(--foreground)"}>
                    {totals.toplamKalemIskontosu > 0 ? '- ' : ''}{formatCurrency(totals.toplamKalemIskontosu)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1 }}>
                  <Typography variant="body2" color="var(--muted-foreground)">Genel İskonto:</Typography>
                  <Typography variant="body2" fontWeight="600" color={totals.genelIskonto > 0 ? "error" : "var(--foreground)"}>
                    {totals.genelIskonto > 0 ? '- ' : ''}{formatCurrency(totals.genelIskonto)}
                  </Typography>
                </Box>
              </Box>

              {!isMobile && <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--border)' }} />}

              <Box sx={{ flex: 1, mt: isMobile ? 1 : 0, pt: isMobile ? 1 : 0, borderTop: isMobile ? '1px dashed var(--border)' : 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1 }}>
                  <Typography variant="body2" fontWeight="700" color="var(--foreground)">Toplam İndirim:</Typography>
                  <Typography variant="body2" fontWeight="700" color={totals.toplamIskonto > 0 ? "error" : "var(--foreground)"}>
                    {totals.toplamIskonto > 0 ? '- ' : ''}{formatCurrency(totals.toplamIskonto)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 1 : 1 }}>
                  <Typography variant="body2" color="var(--muted-foreground)">KDV Toplamı:</Typography>
                  <Typography variant="body2" fontWeight="600" color="var(--foreground)">{formatCurrency(totals.toplamKdv)}</Typography>
                </Box>
                <Divider sx={{ my: 1.5, borderColor: 'var(--border)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="800" color="var(--foreground)" sx={{ letterSpacing: '-0.02em' }}>Genel Toplam:</Typography>
                  <Typography variant="h5" fontWeight="900" color="var(--primary)" sx={{ letterSpacing: '-0.02em' }}>
                    {formatCurrency(totals.genelToplam)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Box>
            <Box sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column-reverse' : 'row',
              gap: 2,
              justifyContent: 'flex-end'
            }}>
              <Button
                variant="outlined"
                fullWidth={isMobile}
                size="large"
                onClick={() => router.push('/invoice/iade/alis')}
                sx={{
                  borderRadius: 'var(--radius-md)',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: isMobile ? 1.5 : 1
                }}
              >
                İptal
              </Button>
              <Button
                variant="contained"
                fullWidth={isMobile}
                size="large"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                  borderRadius: 'var(--radius-md)',
                  textTransform: 'none',
                  fontWeight: 700,
                  minWidth: isMobile ? '100%' : 180,
                  py: isMobile ? 1.5 : 1,
                  boxShadow: '0 4px 12px var(--shadow-sm)'
                }}
              >
                {loading ? 'Kaydediliyor...' : 'Faturayı Kaydet'}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>

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

export default function YeniAlisIadeFaturasiPage() {
  return (
    <Suspense
      fallback={(
        <MainLayout>
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </MainLayout>
      )}
    >
      <YeniAlisIadeFaturasiContent />
    </Suspense>
  );
}

