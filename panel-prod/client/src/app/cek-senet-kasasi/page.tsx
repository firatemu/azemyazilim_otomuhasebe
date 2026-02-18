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
  Typography,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Alert,
  AlertTitle,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Description,
  CheckCircle,
  HourglassEmpty,
  CompareArrows,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface CekSenetKasa {
  toplamBakiye: number;
  toplamAlacak: number;
  toplamBorc: number;
  toplamKayit: number;
  hareketler: Array<{
    id: string;
    tarih: string;
    tip: 'CEK' | 'SENET';
    portfoyTip: 'ALACAK' | 'BORC';
    islemTipi: 'GIRIS' | 'CIKIS';
    cari: {
      id: string;
      cariKodu: string;
      unvan: string;
    };
    tutar: number;
    durum: string;
    banka?: string;
    sube?: string;
    cekNo?: string;
    seriNo?: string;
    tahsilTarihi?: string;
    tahsilKasa?: {
      id: string;
      kasaKodu: string;
      kasaAdi: string;
    };
    aciklama?: string;
    bakiye: number;
  }>;
  istatistikler: {
    portfoyde: { adet: number; tutar: number };
    bankayaVerildi: { adet: number; tutar: number };
    tahsilEdildi: { adet: number; tutar: number };
    odendi: { adet: number; tutar: number };
    ciroEdildi: { adet: number; tutar: number };
    iadeEdildi: { adet: number; tutar: number };
    karsilikiz: { adet: number; tutar: number };
  };
}

export default function CekSenetKasasiPage() {
  const [data, setData] = useState<CekSenetKasa | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterTip, setFilterTip] = useState<'ALL' | 'CEK' | 'SENET'>('ALL');
  const [filterPortfoyTip, setFilterPortfoyTip] = useState<'ALL' | 'ALACAK' | 'BORC'>('ALL');
  const [filterDurum, setFilterDurum] = useState<string>('ALL');

  useEffect(() => {
    fetchKasaBakiyesi();
  }, []);

  const fetchKasaBakiyesi = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/cek-senet/kasa-bakiyesi');
      setData(response.data);
    } catch (error: any) {
      console.error('Çek/Senet kasa bakiyesi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case 'PORTFOYDE': return 'info';
      case 'BANKAYA_VERILDI': return 'warning';
      case 'TAHSIL_EDILDI': return 'success';
      case 'ODENDI': return 'success';
      case 'CIRO_EDILDI': return 'primary';
      case 'IADE_EDILDI': return 'error';
      case 'KARSILIKIZ': return 'error';
      default: return 'default';
    }
  };

  const getDurumText = (durum: string) => {
    switch (durum) {
      case 'PORTFOYDE': return 'Portföyde';
      case 'BANKAYA_VERILDI': return 'Bankaya Verildi';
      case 'TAHSIL_EDILDI': return 'Tahsil Edildi';
      case 'ODENDI': return 'Ödendi';
      case 'CIRO_EDILDI': return 'Ciro Edildi';
      case 'IADE_EDILDI': return 'İade Edildi';
      case 'KARSILIKIZ': return 'Karşılıksız';
      default: return durum;
    }
  };

  const filteredHareketler = data?.hareketler.filter((hareket) => {
    if (filterTip !== 'ALL' && hareket.tip !== filterTip) return false;
    if (filterPortfoyTip !== 'ALL' && hareket.portfoyTip !== filterPortfoyTip) return false;
    if (filterDurum !== 'ALL' && hareket.durum !== filterDurum) return false;
    return true;
  }) || [];

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress size={60} />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Description sx={{ fontSize: 40, color: '#f59e0b' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                📄 Çek & Senet Kasası
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Evraklı işlemlerinizin bakiyesini görüntüleyin
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* İstatistik Kartları */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Toplam Bakiye */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '100%',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Toplam Bakiye
                  </Typography>
                  <AccountBalanceWallet sx={{ fontSize: 32, opacity: 0.8 }} />
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(data?.toplamBakiye || 0)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                  {data?.toplamKayit || 0} adet evrak
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Alınan Çek/Senet (Alacak) */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              height: '100%',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Alınan (Alacak)
                  </Typography>
                  <TrendingUp sx={{ fontSize: 32, opacity: 0.8 }} />
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(data?.toplamAlacak || 0)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                  ➕ Kasaya giriş
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Verilen Çek/Senet (Borç) */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              height: '100%',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Verilen (Borç)
                  </Typography>
                  <TrendingDown sx={{ fontSize: 32, opacity: 0.8 }} />
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(data?.toplamBorc || 0)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                  ➖ Kasadan çıkış
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Portföyde */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              height: '100%',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Portföyde Bekleyen
                  </Typography>
                  <HourglassEmpty sx={{ fontSize: 32, opacity: 0.8 }} />
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(data?.istatistikler.portfoyde.tutar || 0)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                  {data?.istatistikler.portfoyde.adet || 0} adet
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Durum İstatistikleri */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              📊 Durum Bazlı İstatistikler
            </Typography>
            <Grid container spacing={2}>
              {data && Object.entries(data.istatistikler).map(([key, value]) => (
                <Grid item xs={12} sm={6} md={3} key={key}>
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 2,
                    bgcolor: '#f9fafb',
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {getDurumText(key.replace(/([A-Z])/g, '_$1').toUpperCase())}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {formatCurrency(value.tutar)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {value.adet} adet
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Filtreler */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              🔍 Filtreler
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Evrak Tipi</InputLabel>
                  <Select
                    value={filterTip}
                    onChange={(e) => setFilterTip(e.target.value as any)}
                    label="Evrak Tipi"
                  >
                    <MenuItem value="ALL">Tümü</MenuItem>
                    <MenuItem value="CEK">Çek</MenuItem>
                    <MenuItem value="SENET">Senet</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Portföy Tipi</InputLabel>
                  <Select
                    value={filterPortfoyTip}
                    onChange={(e) => setFilterPortfoyTip(e.target.value as any)}
                    label="Portföy Tipi"
                  >
                    <MenuItem value="ALL">Tümü</MenuItem>
                    <MenuItem value="ALACAK">Alınan (Alacak)</MenuItem>
                    <MenuItem value="BORC">Verilen (Borç)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={filterDurum}
                    onChange={(e) => setFilterDurum(e.target.value)}
                    label="Durum"
                  >
                    <MenuItem value="ALL">Tümü</MenuItem>
                    <MenuItem value="PORTFOYDE">Portföyde</MenuItem>
                    <MenuItem value="BANKAYA_VERILDI">Bankaya Verildi</MenuItem>
                    <MenuItem value="TAHSIL_EDILDI">Tahsil Edildi</MenuItem>
                    <MenuItem value="ODENDI">Ödendi</MenuItem>
                    <MenuItem value="CIRO_EDILDI">Ciro Edildi</MenuItem>
                    <MenuItem value="IADE_EDILDI">İade Edildi</MenuItem>
                    <MenuItem value="KARSILIKIZ">Karşılıksız</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Açıklama */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>💡 Kasa Mantığı Nasıl Çalışır?</AlertTitle>
          <Typography variant="body2">
            • <strong>Alınan Çek/Senet (Alacak):</strong> Müşterilerden aldığınız çek ve senetler kasanıza <strong>➕ artı</strong> olarak işlenir.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • <strong>Verilen Çek/Senet (Borç):</strong> Tedarikçilere verdiğiniz çek ve senetler kasanızdan <strong>➖ eksi</strong> olarak düşülür.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • <strong>Bakiye:</strong> Yürüyen bakiye, tüm evraklı işlemlerinizin toplamıdır. Pozitif bakiye alacaklarınızın fazla olduğunu gösterir.
          </Typography>
        </Alert>

        {/* Hareketler Tablosu */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Tarih (Vade)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>İşlem</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cari</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Banka/Çek-Seri No</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Tutar</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Bakiye</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHareketler.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      Kayıt bulunamadı
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredHareketler.map((hareket) => (
                  <TableRow key={hareket.id} hover>
                    <TableCell>{formatDate(hareket.tarih)}</TableCell>
                    <TableCell>
                      <Chip
                        label={hareket.tip}
                        size="small"
                        color={hareket.tip === 'CEK' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {hareket.portfoyTip === 'ALACAK' ? (
                          <>
                            <TrendingUp sx={{ color: '#10b981', fontSize: 20 }} />
                            <Chip label="Alınan" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46' }} />
                          </>
                        ) : (
                          <>
                            <TrendingDown sx={{ color: '#ef4444', fontSize: 20 }} />
                            <Chip label="Verilen" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b' }} />
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {hareket.cari.unvan}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {hareket.cari.cariKodu}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {hareket.banka && (
                        <Box>
                          <Typography variant="body2">{hareket.banka}</Typography>
                          {hareket.sube && (
                            <Typography variant="caption" color="text.secondary">
                              {hareket.sube}
                            </Typography>
                          )}
                        </Box>
                      )}
                      {hareket.cekNo && (
                        <Typography variant="caption" display="block">
                          Çek No: {hareket.cekNo}
                        </Typography>
                      )}
                      {hareket.seriNo && (
                        <Typography variant="caption" display="block">
                          Seri No: {hareket.seriNo}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight="700"
                        sx={{ 
                          color: hareket.portfoyTip === 'ALACAK' ? '#10b981' : '#ef4444' 
                        }}
                      >
                        {hareket.portfoyTip === 'ALACAK' ? '+' : '-'} {formatCurrency(hareket.tutar)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getDurumText(hareket.durum)}
                        size="small"
                        color={getDurumColor(hareket.durum) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight="700"
                        sx={{ color: hareket.bakiye >= 0 ? '#10b981' : '#ef4444' }}
                      >
                        {formatCurrency(hareket.bakiye)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </MainLayout>
  );
}

