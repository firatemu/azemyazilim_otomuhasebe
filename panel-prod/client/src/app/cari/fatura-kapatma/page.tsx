'use client';

import React, { useState, useEffect } from 'react';
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
  Chip,
  Autocomplete,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Stack,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { AccountBalance, TrendingUp, TrendingDown, Receipt, CheckCircle, Warning } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
  bakiye: number;
}

interface FaturaDetay {
  id: string;
  faturaNo: string;
  faturaTipi: string;
  tarih: string;
  vade: string | null;
  genelToplam: number;
  odenenTutar: number;
  odenecekTutar: number;
  durum: string;
  faturaTahsilatlar: Array<{
    id: string;
    tutar: number;
    tahsilat: {
      id: string;
      tarih: string;
      tip: string;
      odemeTipi: string;
    };
  }>;
}

export default function FaturaKapatmaPage() {
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [selectedCari, setSelectedCari] = useState<Cari | null>(null);
  const [faturalar, setFaturalar] = useState<FaturaDetay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCariler();
  }, []);

  useEffect(() => {
    if (selectedCari) {
      fetchCariFaturalar(selectedCari.id);
    }
  }, [selectedCari]);

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

  const fetchCariFaturalar = async (cariId: string) => {
    try {
      setLoading(true);
      const response = await axios.get('/fatura', {
        params: { 
          cariId,
          page: 1,
          limit: 100,
        },
      });
      setFaturalar(response.data.data || []);
    } catch (error) {
      console.error('Faturalar yüklenirken hata:', error);
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
      case 'KAPALI': return 'success';
      case 'KISMEN_ODENDI': return 'info';
      case 'ACIK': return 'warning';
      case 'ONAYLANDI': return 'warning';
      default: return 'default';
    }
  };

  const getDurumText = (durum: string) => {
    switch (durum) {
      case 'KAPALI': return 'Kapalı';
      case 'KISMEN_ODENDI': return 'Kısmen Ödendi';
      case 'ACIK': return 'Açık';
      case 'ONAYLANDI': return 'Onaylandı';
      default: return durum;
    }
  };

  const getOdemeTipiText = (tip: string) => {
    const types: any = {
      NAKIT: 'Nakit',
      KREDI_KARTI: 'Kredi Kartı',
      BANKA_HAVALESI: 'Havale',
      CEK: 'Çek',
      SENET: 'Senet',
    };
    return types[tip] || tip;
  };

  // Özet hesaplamalar - Decimal tiplerini Number'a çevir
  const ozet = {
    toplamFatura: faturalar.reduce((sum, f) => sum + Number(f.genelToplam || 0), 0),
    toplamOdenen: faturalar.reduce((sum, f) => sum + Number(f.odenenTutar || 0), 0),
    toplamKalan: faturalar.reduce((sum, f) => sum + Number(f.odenecekTutar || 0), 0),
    acikFaturaSayisi: faturalar.filter(f => f.durum === 'ACIK' || f.durum === 'ONAYLANDI').length,
    kismenOdenenSayisi: faturalar.filter(f => f.durum === 'KISMEN_ODENDI').length,
    kapaliSayisi: faturalar.filter(f => f.durum === 'KAPALI').length,
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1,
        }}>
          Fatura Kapatma & Ekstre
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cari bazında fatura durumları ve ödeme takibi
        </Typography>
      </Box>

      {/* Cari Seçimi */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Cari Seçimi
        </Typography>
        <Autocomplete
          options={cariler}
          getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
          value={selectedCari}
          onChange={(_, newValue) => setSelectedCari(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Cari Seçiniz"
              placeholder="Cari kodu veya ünvanı ile ara..."
            />
          )}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            return (
              <Box component="li" key={key} {...otherProps}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" fontWeight="600">
                        {option.unvan}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.cariKodu} • {option.tip === 'MUSTERI' ? 'Müşteri' : 'Tedarikçi'}
                      </Typography>
                    </Box>
                    <Chip
                      label={formatCurrency(option.bakiye)}
                      size="small"
                      color={option.bakiye > 0 ? 'error' : option.bakiye < 0 ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          }}
          noOptionsText="Cari bulunamadı"
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </Paper>

      {selectedCari && (
        <>
          {/* Özet Kartlar */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ bgcolor: '#eff6ff', border: '1px solid #dbeafe' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Receipt sx={{ color: '#3b82f6' }} />
                    <Typography variant="body2" color="text.secondary">
                      Toplam Fatura
                    </Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight="bold" color="#3b82f6">
                    {formatCurrency(ozet.toplamFatura)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {faturalar.length} adet
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <CheckCircle sx={{ color: '#10b981' }} />
                    <Typography variant="body2" color="text.secondary">
                      Ödenen
                    </Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight="bold" color="#10b981">
                    {formatCurrency(ozet.toplamOdenen)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ozet.kapaliSayisi} fatura kapalı
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Warning sx={{ color: '#ef4444' }} />
                    <Typography variant="body2" color="text.secondary">
                      Kalan
                    </Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight="bold" color="#ef4444">
                    {formatCurrency(ozet.toplamKalan)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ozet.acikFaturaSayisi + ozet.kismenOdenenSayisi} açık
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ bgcolor: '#fef9c3', border: '1px solid #fde68a' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <AccountBalance sx={{ color: '#f59e0b' }} />
                    <Typography variant="body2" color="text.secondary">
                      Cari Bakiye
                    </Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight="bold" color="#f59e0b">
                    {formatCurrency(selectedCari.bakiye)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedCari.tip === 'MUSTERI' ? 'Alacak' : 'Borç'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Fatura Listesi */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fatura No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vade</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Ödenen</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Kalan</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Ödeme %</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Durum</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Tahsilat Detayı</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {faturalar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="text.secondary">
                          Bu cari için fatura bulunamadı.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    faturalar.map((fatura) => {
                      const genelToplam = Number(fatura.genelToplam || 0);
                      const odenenTutar = Number(fatura.odenenTutar || 0);
                      const odenecekTutar = Number(fatura.odenecekTutar || 0);
                      const odemOrani = genelToplam > 0 
                        ? (odenenTutar / genelToplam) * 100 
                        : 0;

                      return (
                        <TableRow 
                          key={fatura.id} 
                          hover
                          sx={{
                            bgcolor: fatura.durum === 'KAPALI' ? '#f0fdf4' : 'inherit',
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {fatura.faturaNo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fatura.faturaTipi === 'SATIS' || fatura.faturaTipi === 'SATIS_IADE' ? 'Satış' : 'Alış'}
                              size="small"
                              color={fatura.faturaTipi === 'SATIS' || fatura.faturaTipi === 'SATIS_IADE' ? 'primary' : 'secondary'}
                            />
                          </TableCell>
                          <TableCell>{formatDate(fatura.tarih)}</TableCell>
                          <TableCell>
                            {fatura.vade ? (
                              <Box>
                                <Typography variant="body2">{formatDate(fatura.vade)}</Typography>
                                {new Date(fatura.vade) < new Date() && fatura.durum !== 'KAPALI' && (
                                  <Typography variant="caption" color="error">
                                    Vadesi geçmiş!
                                  </Typography>
                                )}
                              </Box>
                            ) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600">
                              {formatCurrency(genelToplam)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600" color="success.main">
                              {formatCurrency(odenenTutar)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              fontWeight="600" 
                              color={odenecekTutar > 0 ? 'error.main' : 'text.secondary'}
                            >
                              {formatCurrency(odenecekTutar)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ width: 80, mx: 'auto' }}>
                              <Tooltip title={`${odemOrani.toFixed(1)}% ödendi`}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(odemOrani, 100)}
                                  sx={{
                                    height: 8,
                                    borderRadius: 1,
                                    bgcolor: '#e5e7eb',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: odemOrani >= 100 ? '#10b981' : odemOrani > 0 ? '#3b82f6' : '#9ca3af',
                                    }
                                  }}
                                />
                              </Tooltip>
                              <Typography variant="caption" color="text.secondary" align="center" display="block">
                                {odemOrani.toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getDurumText(fatura.durum)}
                              color={getDurumColor(fatura.durum)}
                              size="small"
                              icon={fatura.durum === 'KAPALI' ? <CheckCircle fontSize="small" /> : undefined}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {fatura.faturaTahsilatlar.length > 0 ? (
                              <Tooltip
                                title={
                                  <Box>
                                    <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                                      Tahsilat Geçmişi:
                                    </Typography>
                                    {fatura.faturaTahsilatlar.map((ft, idx) => (
                                      <Typography key={ft.id} variant="caption" display="block">
                                        {idx + 1}. {formatDate(ft.tahsilat.tarih)} - {formatCurrency(ft.tutar)} ({getOdemeTipiText(ft.tahsilat.odemeTipi)})
                                      </Typography>
                                    ))}
                                  </Box>
                                }
                                arrow
                              >
                                <Chip
                                  label={`${fatura.faturaTahsilatlar.length} ödeme`}
                                  size="small"
                                  color="info"
                                  sx={{ cursor: 'pointer' }}
                                />
                              </Tooltip>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Özet Çubuk */}
          {faturalar.length > 0 && (
            <Paper sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: '#f9fafb' }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Fatura Durumu
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Chip label={`${ozet.acikFaturaSayisi} Açık`} color="warning" size="small" />
                      <Chip label={`${ozet.kismenOdenenSayisi} Kısmen`} color="info" size="small" />
                      <Chip label={`${ozet.kapaliSayisi} Kapalı`} color="success" size="small" />
                    </Stack>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Ödeme Durumu
                    </Typography>
                    <Box sx={{ position: 'relative', height: 30 }}>
                      <LinearProgress
                        variant="determinate"
                        value={ozet.toplamFatura > 0 ? (ozet.toplamOdenen / ozet.toplamFatura) * 100 : 0}
                        sx={{
                          height: 30,
                          borderRadius: 2,
                          bgcolor: '#e5e7eb',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#10b981',
                            borderRadius: 2,
                          }
                        }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        }}
                      >
                        {formatCurrency(ozet.toplamOdenen)} / {formatCurrency(ozet.toplamFatura)} 
                        ({((ozet.toplamOdenen / ozet.toplamFatura) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
        </>
      )}

      {/* Cari Seçilmediğinde */}
      {!selectedCari && (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
          <AccountBalance sx={{ fontSize: 80, color: '#d1d5db', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Cari Seçiniz
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fatura kapatma ve ekstre görüntülemek için yukarıdan bir cari seçin
          </Typography>
        </Paper>
      )}
    </MainLayout>
  );
}

