'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Divider,
  Stack,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { Delete, Save, ArrowBack, ToggleOn, ToggleOff, ShoppingCart, Print } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useReactToPrint } from 'react-to-print';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip?: string;
  vadeSuresi?: number;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  alisFiyati: number;
  kdvOrani: number;
}

interface TeklifKalemi {
  stokId: string;
  miktar: number;
  birimFiyat: number;
  kdvOrani: number;
  iskontoOran: number;
  iskontoTutar: number;
  cokluIskonto?: boolean;
  iskontoFormula?: string;
}

export default function DuzenleSatinAlmaTeklifiPage() {
  const params = useParams();
  const router = useRouter();
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  
  const [teklifDetails, setTeklifDetails] = useState<any | null>(null);
  const printContentRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    teklifTipi: 'SATIN_ALMA' as 'SATIS' | 'SATIN_ALMA',
    cariId: '',
    tarih: new Date().toISOString().split('T')[0],
    gecerlilikTarihi: '',
    genelIskontoOran: 0,
    genelIskontoTutar: 0,
    aciklama: '',
    kalemler: [] as TeklifKalemi[],
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const handlePrint = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: teklifDetails?.teklifNo ? `${teklifDetails.teklifNo}` : 'SatinAlmaTeklifi',
  });

  useEffect(() => {
    fetchCariler();
    fetchStoklar();
    fetchTeklif();
  }, [params.id]);

  const fetchTeklif = async () => {
    try {
      const response = await axios.get(`/teklif/${params.id}`);
      const teklif = response.data;
      setTeklifDetails(teklif);
      
      setFormData({
        teklifTipi: teklif.teklifTipi,
        cariId: teklif.cariId,
        tarih: new Date(teklif.tarih).toISOString().split('T')[0],
        gecerlilikTarihi: teklif.gecerlilikTarihi ? new Date(teklif.gecerlilikTarihi).toISOString().split('T')[0] : '',
        genelIskontoOran: 0,
        genelIskontoTutar: teklif.iskonto || 0,
        aciklama: teklif.aciklama || '',
        kalemler: teklif.kalemler?.map((k: any) => ({
          stokId: k.stokId,
          miktar: k.miktar,
          birimFiyat: k.birimFiyat,
          kdvOrani: k.kdvOrani,
          iskontoOran: k.iskontoOran || 0,
          iskontoTutar: k.iskontoTutar || 0,
          cokluIskonto: false,
          iskontoFormula: '',
        })) || [],
      });
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Teklif yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

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
    if (isReadOnly) {
      showSnackbar('Siparişe dönüştürülen teklifler üzerinde değişiklik yapılamaz.', 'info');
      return;
    }
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
    if (isReadOnly) {
      showSnackbar('Siparişe dönüştürülen teklifler üzerinde değişiklik yapılamaz.', 'info');
      return;
    }
    setFormData(prev => ({
      ...prev,
      kalemler: prev.kalemler.filter((_, i) => i !== index),
    }));
  };

  const handleKalemChange = (index: number, field: keyof TeklifKalemi, value: any) => {
    if (isReadOnly) {
      showSnackbar('Siparişe dönüştürülen teklifler üzerinde değişiklik yapılamaz.', 'info');
      return;
    }
    setFormData(prev => {
      const newKalemler = [...prev.kalemler];
      const kalem = { ...newKalemler[index] };
      
      if (field === 'stokId') {
        const stok = stoklar.find(s => s.id === value);
        if (stok) {
          kalem.stokId = value;
          kalem.birimFiyat = stok.alisFiyati;
          kalem.kdvOrani = stok.kdvOrani;
        }
      } else if (field === 'cokluIskonto') {
        kalem.cokluIskonto = value;
        if (!value) {
          kalem.iskontoFormula = '';
        }
      } else if (field === 'iskontoFormula') {
        kalem.iskontoFormula = value;
        const { finalAmount, totalDiscount, effectiveRate } = calculateMultiDiscount(kalem.miktar * kalem.birimFiyat, value);
        kalem.iskontoTutar = totalDiscount;
        kalem.iskontoOran = effectiveRate;
        kalem.birimFiyat = finalAmount / kalem.miktar || 0;
      } else {
        (kalem as any)[field] = value;
      }
      
      newKalemler[index] = kalem;
      return { ...prev, kalemler: newKalemler };
    });
  };

  const calculateKalemTutar = (kalem: TeklifKalemi) => {
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
    if (isReadOnly) {
      showSnackbar('Siparişe dönüştürülen teklifler üzerinde değişiklik yapılamaz.', 'info');
      return;
    }
    const oran = parseFloat(value) || 0;
    const araToplam = formData.kalemler.reduce((sum, k) => sum + (k.miktar * k.birimFiyat - k.iskontoTutar), 0);
    const tutar = (araToplam * oran) / 100;
    setFormData(prev => ({ ...prev, genelIskontoOran: oran, genelIskontoTutar: tutar }));
  };
  
  const handleGenelIskontoTutarChange = (value: string) => {
    if (isReadOnly) {
      showSnackbar('Siparişe dönüştürülen teklifler üzerinde değişiklik yapılamaz.', 'info');
      return;
    }
    const tutar = parseFloat(value) || 0;
    const araToplam = formData.kalemler.reduce((sum, k) => sum + (k.miktar * k.birimFiyat - k.iskontoTutar), 0);
    const oran = araToplam > 0 ? (tutar / araToplam) * 100 : 0;
    setFormData(prev => ({ ...prev, genelIskontoOran: oran, genelIskontoTutar: tutar }));
  };

  const selectedCari = useMemo(() => {
    if (formData.cariId) {
      const cari = cariler.find(c => c.id === formData.cariId);
      if (cari) {
        return cari;
      }
    }
    return teklifDetails?.cari || null;
  }, [cariler, formData.cariId, teklifDetails]);

  const formatDateForPrint = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleDateString('tr-TR');
  };

  const printKalemler = useMemo(() => {
    return formData.kalemler.map((kalem, index) => {
      const stok = stoklar.find(s => s.id === kalem.stokId) || teklifDetails?.kalemler?.find((k: any) => k.stokId === kalem.stokId)?.stok;
      const miktar = Number(kalem.miktar) || 0;
      const birimFiyat = Number(kalem.birimFiyat) || 0;
      const araToplam = miktar * birimFiyat;
      const iskontoTutar = Number(kalem.iskontoTutar) || 0;
      const netTutar = araToplam - iskontoTutar;
      const kdvOrani = Number(kalem.kdvOrani) || 0;
      const kdvTutar = (netTutar * kdvOrani) / 100;
      const genelTutar = netTutar + kdvTutar;

      return {
        id: index + 1,
        stokKodu: stok?.stokKodu || '',
        stokAdi: stok?.stokAdi || 'Ürün',
        miktar,
        birim: 'Adet',
        birimFiyat,
        iskontoOran: Number(kalem.iskontoOran) || 0,
        iskontoTutar,
        kdvOrani,
        kdvTutar,
        netTutar,
        genelTutar,
      };
    });
  }, [formData.kalemler, stoklar, teklifDetails]);

  const isReadOnly = useMemo(() => teklifDetails?.durum === 'SIPARISE_DONUSTU', [teklifDetails]);

  const handleSave = async () => {
    if (isReadOnly) {
      showSnackbar('Siparişe dönüştürülen teklifler üzerinde değişiklik yapılamaz.', 'info');
      return;
    }
    try {
      if (!formData.cariId) {
        showSnackbar('Cari seçimi zorunludur', 'error');
        return;
      }
      
      if (formData.kalemler.length === 0) {
        showSnackbar('En az bir kalem eklemelisiniz', 'error');
        return;
      }

      setSaving(true);
      await axios.put(`/teklif/${params.id}`, {
        teklifTipi: formData.teklifTipi,
        cariId: formData.cariId,
        tarih: new Date(formData.tarih).toISOString(),
        gecerlilikTarihi: formData.gecerlilikTarihi ? new Date(formData.gecerlilikTarihi).toISOString() : null,
        iskonto: Number(formData.genelIskontoTutar) || 0,
        aciklama: formData.aciklama || null,
        kalemler: formData.kalemler.map(k => ({
          stokId: k.stokId,
          miktar: Number(k.miktar),
          birimFiyat: Number(k.birimFiyat),
          kdvOrani: Number(k.kdvOrani),
          iskontoOran: Number(k.iskontoOran) || 0,
          iskontoTutar: Number(k.iskontoTutar) || 0,
        })),
      });
      
      showSnackbar('Teklif başarıyla güncellendi', 'success');
      setTimeout(() => {
        router.push('/teklif/satin-alma');
      }, 1500);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToSiparis = async () => {
    if (isReadOnly) {
      showSnackbar('Siparişe dönüştürülen teklifler yeniden dönüştürülemez.', 'info');
      return;
    }
    try {
      setSaving(true);
      const response = await axios.post(`/teklif/${params.id}/siparise-donustur`);
      showSnackbar('Teklif başarıyla siparişe dönüştürüldü', 'success');
      setConvertDialogOpen(false);
      setTimeout(() => {
        router.push(`/siparis/satin-alma/duzenle/${response.data.siparisId}`);
      }, 1500);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Teklif siparişe dönüştürülürken hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    }).format(amount);
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton 
            onClick={() => router.push('/teklif/satin-alma')}
            sx={{
              bgcolor: '#f3f4f6',
              '&:hover': { bgcolor: '#e5e7eb' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Satın Alma Teklifini Düzenle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tedarikçilerden alınan teklifleri güncelleyin veya siparişe dönüştürün
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrint}
              sx={{
                borderColor: '#059669',
                color: '#047857',
                '&:hover': {
                  borderColor: '#047857',
                  background: 'rgba(5,150,105,0.08)',
                },
              }}
            >
              Yazdır
            </Button>
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              disabled={isReadOnly}
              onClick={() => {
                if (isReadOnly) {
                  showSnackbar('Siparişe dönüştürülen teklifler üzerinde değişiklik yapılamaz.', 'info');
                  return;
                }
                setConvertDialogOpen(true);
              }}
              sx={{
                background: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)',
              }}
            >
              Siparişe Dönüştür
            </Button>
          </Stack>
        </Box>
      </Box>

      {isReadOnly && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Bu teklif siparişe dönüştürüldü. Değişiklik yapmak için ilgili siparişi düzenleyin.
        </Alert>
      )}

      <Paper component="fieldset" disabled={isReadOnly} sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={3}>
          {/* Teklif Bilgileri */}
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Teklif Bilgileri
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
              label="Geçerlilik Tarihi"
              value={formData.gecerlilikTarihi}
              onChange={(e) => setFormData(prev => ({ ...prev, gecerlilikTarihi: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          
          <Box>
            <Autocomplete
              disabled={isReadOnly}
              options={cariler}
              getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
              value={cariler.find(c => c.id === formData.cariId) || null}
              onChange={(_, newValue) => {
                if (newValue) {
                  setFormData(prev => ({ ...prev, cariId: newValue.id }));
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tedarikçi Seçiniz"
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
              <Typography variant="h6" fontWeight="bold">Teklif Kalemleri</Typography>
              <Button 
                variant="contained" 
                onClick={handleAddKalem}
                disabled={isReadOnly}
                sx={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                }}
              >
                + Yeni Kalem Ekle
              </Button>
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
                          Henüz kalem eklenmedi.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.kalemler.map((kalem, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Autocomplete
                            disabled={isReadOnly}
                            size="small"
                            options={stoklar}
                            getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                            value={stoklar.find(s => s.id === kalem.stokId) || null}
                            onChange={(_, newValue) => {
                              if (newValue) {
                                handleKalemChange(index, 'stokId', newValue.id);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Stok seçin..."
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
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            disabled={isReadOnly}
                            onClick={() => handleKalemChange(index, 'cokluIskonto', !kalem.cokluIskonto)}
                            sx={{
                              color: kalem.cokluIskonto ? '#10b981' : '#9ca3af',
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
                                if (/^[\d+]*$/.test(value)) {
                                  handleKalemChange(index, 'iskontoFormula', value);
                                }
                              }}
                              placeholder="10+5"
                            />
                          ) : (
                            <TextField
                              fullWidth
                              type="number"
                              size="small"
                              value={kalem.iskontoOran || ''}
                              onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)}
                              inputProps={{ min: 0, max: 100, step: 0.01 }}
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
                            inputProps={{ min: 0, step: 0.01 }}
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
                            disabled={isReadOnly}
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
              sx={{ width: { xs: '100%', sm: '200px' } }}
            />
            <TextField
              type="number"
              label="Genel İskonto (₺)"
              value={formData.genelIskontoTutar || ''}
              onChange={(e) => handleGenelIskontoTutarChange(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ width: { xs: '100%', sm: '200px' } }}
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
              Teklif Özeti
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
                    sx={{ color: '#10b981' }}
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
                onClick={() => router.push('/teklif/satin-alma')}
              >
                İptal
              </Button>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving || isReadOnly}
                sx={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                  minWidth: 150,
                }}
              >
                {saving ? 'Kaydediliyor...' : 'Teklifi Güncelle'}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Siparişe Dönüştürme Dialog */}
      <Dialog open={convertDialogOpen && !isReadOnly} onClose={() => setConvertDialogOpen(false)}>
        <DialogTitle component="div">Siparişe Dönüştür</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu teklifi siparişe dönüştürmek istediğinizden emin misiniz? Teklif durumu "Siparişe Dönüştü" olarak işaretlenecek ve yeni bir sipariş oluşturulacaktır.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConvertDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleConvertToSiparis} 
            variant="contained"
            disabled={saving || isReadOnly}
            sx={{
              background: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)',
            }}
          >
            {saving ? 'Dönüştürülüyor...' : 'Dönüştür'}
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

      {/* Print Template */}
      <Box
        ref={printContentRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: '-9999px',
          width: '210mm',
          bgcolor: '#ffffff',
          color: '#111827',
          p: 4,
          fontFamily: "'Inter', 'Arial', sans-serif",
        }}
      >
        <style>{`
          @page { size: A4 portrait; margin: 12mm; }
          body { -webkit-print-color-adjust: exact; font-family: 'Inter', 'Arial', sans-serif; }
          .print-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .print-table th { background: #ecfdf5; font-weight: 600; }
          .print-table th, .print-table td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; }
          .print-summary { margin-top: 16px; width: 280px; margin-left: auto; }
          .print-summary td { padding: 6px 8px; font-size: 12px; }
          .print-summary tr:last-child td { font-weight: 600; border-top: 2px solid #d1d5db; }
        `}</style>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Box component="h2" sx={{ fontSize: 24, fontWeight: 700, m: 0 }}>
              Satın Alma Teklifi
            </Box>
            <Box component="p" sx={{ m: 0, fontSize: 12, color: '#6b7280' }}>
              Teklif No: {teklifDetails?.teklifNo || '-'}
            </Box>
            <Box component="p" sx={{ m: 0, fontSize: 12, color: '#6b7280' }}>
              Tarih: {formatDateForPrint(formData.tarih)}
            </Box>
            <Box component="p" sx={{ m: 0, fontSize: 12, color: '#6b7280' }}>
              Geçerlilik Tarihi: {formatDateForPrint(formData.gecerlilikTarihi)}
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Box component="p" sx={{ m: 0, fontSize: 18, fontWeight: 600 }}>
              Yedek Parça Otomasyon
            </Box>
            <Box component="p" sx={{ m: 0, fontSize: 12, color: '#6b7280' }}>
              www.stnoto.com
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box component="h3" sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>
            Tedarikçi Bilgileri
          </Box>
          <table className="print-table">
            <tbody>
              <tr>
                <th style={{ width: '30%' }}>Firma</th>
                <td>{selectedCari?.unvan || '-'}</td>
              </tr>
              <tr>
                <th>Cari Kodu</th>
                <td>{selectedCari?.cariKodu || '-'}</td>
              </tr>
              <tr>
                <th>Cari Tipi</th>
                <td>{selectedCari?.tip || '-'}</td>
              </tr>
            </tbody>
          </table>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Box component="h3" sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>
            Teklif Kalemleri
          </Box>
          <table className="print-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Stok Kodu</th>
                <th>Ürün Adı</th>
                <th>Miktar</th>
                <th>Birim</th>
                <th>Birim Fiyat</th>
                <th>İskonto</th>
                <th>KDV</th>
                <th>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {printKalemler.length > 0 ? (
                printKalemler.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.stokKodu}</td>
                    <td>{item.stokAdi}</td>
                    <td>{item.miktar}</td>
                    <td>{item.birim}</td>
                    <td>{formatCurrency(item.birimFiyat)}</td>
                    <td>
                      {item.iskontoTutar > 0
                        ? `${formatCurrency(item.iskontoTutar)} (${item.iskontoOran.toFixed(2)}%)`
                        : '-'}
                    </td>
                    <td>
                      {item.kdvOrani > 0
                        ? `${formatCurrency(item.kdvTutar)} (${item.kdvOrani}%)`
                        : '-'}
                    </td>
                    <td>{formatCurrency(item.genelTutar)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>Kalem bulunmuyor</td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        <Box sx={{ mt: 3 }}>
          <table className="print-summary">
            <tbody>
              <tr>
                <td>Ara Toplam</td>
                <td>{formatCurrency(totals.araToplam || 0)}</td>
              </tr>
              <tr>
                <td>Kalem İskontoları</td>
                <td>{formatCurrency(totals.toplamKalemIskontosu || 0)}</td>
              </tr>
              <tr>
                <td>Genel İskonto</td>
                <td>{formatCurrency(totals.genelIskonto || 0)}</td>
              </tr>
              <tr>
                <td>KDV Toplamı</td>
                <td>{formatCurrency(totals.toplamKdv || 0)}</td>
              </tr>
              <tr>
                <td>Genel Toplam</td>
                <td>{formatCurrency(totals.genelToplam || 0)}</td>
              </tr>
            </tbody>
          </table>
        </Box>

        {formData.aciklama && (
          <Box sx={{ mt: 3 }}>
            <Box component="h3" sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>
              Notlar
            </Box>
            <Box component="p" sx={{ fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {formData.aciklama}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
          <Box>
            <Box component="p" sx={{ fontSize: 12, color: '#6b7280', mb: '40px' }}>
              Teklifi Hazırlayan
            </Box>
            <Box component="p" sx={{ fontSize: 12, borderTop: '1px solid #d1d5db', pt: 1, width: '200px' }}>
              {teklifDetails?.createdByUser?.fullName || '____________________'}
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Box component="p" sx={{ fontSize: 12, color: '#6b7280', mb: '40px' }}>
              Onay
            </Box>
            <Box component="p" sx={{ fontSize: 12, borderTop: '1px solid #d1d5db', pt: 1, width: '200px' }}>
              ____________________
            </Box>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
}

