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
  Card,
  CardContent,
  Autocomplete,
  TextField,
  CircularProgress,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  CalendarToday,
  Warning,
  CheckCircle,
  AccessTime,
  TrendingUp,
  TrendingDown,
  Info,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
}

interface Fatura {
  id: string;
  faturaNo: string;
  faturaTipi: string;
  cari: Cari;
  tarih: string;
  vade: string;
  genelToplam: number;
  odenenTutar: number;
  odenecekTutar: number;
  kalanGun: number;
  vadeDurumu: 'GECMIS' | 'BUGUN' | 'YAKLASAN' | 'NORMAL';
  gecenGun: number;
}

interface VadeAnaliz {
  ozet: {
    toplam: number;
    toplamTutar: number;
    toplamKalanTutar: number;
    vadesiGecenler: { adet: number; tutar: number };
    bugunVadenler: { adet: number; tutar: number };
    yaklaşanlar: { adet: number; tutar: number };
    normalFaturalar: { adet: number; tutar: number };
  };
  cariOzet: Array<{
    cari: Cari;
    toplamFatura: number;
    toplamKalan: number;
    vadesiGecen: number;
    vadesiGecenTutar: number;
  }> | null;
  faturalar: Fatura[];
}

export default function VadeAnalizPage() {
  const [loading, setLoading] = useState(false);
  const [analiz, setAnaliz] = useState<VadeAnaliz | null>(null);
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [selectedCari, setSelectedCari] = useState<Cari | null>(null);
  const [cariLoading, setCariLoading] = useState(false);

  // Carileri yükle
  useEffect(() => {
    fetchCariler();
  }, []);

  // İlk yükleme - tüm faturalar
  useEffect(() => {
    fetchVadeAnaliz();
  }, []);

  const fetchCariler = async () => {
    try {
      setCariLoading(true);
      const response = await axios.get('/cari', {
        params: { page: 1, limit: 1000 },
      });
      setCariler(response.data.data || []);
    } catch (error) {
      console.error('Cariler yüklenemedi:', error);
    } finally {
      setCariLoading(false);
    }
  };

  const fetchVadeAnaliz = async (cariId?: string) => {
    try {
      setLoading(true);
      const params = cariId ? { cariId } : {};
      const response = await axios.get('/fatura/vade-analiz', { params });
      setAnaliz(response.data);
    } catch (error) {
      console.error('Vade analizi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCariChange = (_: any, value: Cari | null) => {
    setSelectedCari(value);
    if (value) {
      fetchVadeAnaliz(value.id);
    } else {
      fetchVadeAnaliz();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const getVadeDurumuColor = (durum: string) => {
    switch (durum) {
      case 'GECMIS':
        return 'error';
      case 'BUGUN':
        return 'warning';
      case 'YAKLASAN':
        return 'info';
      default:
        return 'success';
    }
  };

  const getVadeDurumuLabel = (fatura: Fatura) => {
    switch (fatura.vadeDurumu) {
      case 'GECMIS':
        return `${fatura.gecenGun} gün geçti`;
      case 'BUGUN':
        return 'Bugün';
      case 'YAKLASAN':
        return `${fatura.kalanGun} gün kaldı`;
      default:
        return `${fatura.kalanGun} gün`;
    }
  };

  if (loading && !analiz) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          📅 Vade Analizi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vadesi geçen ve yaklaşan faturaları takip edin
        </Typography>
      </Box>

      {/* Cari Filtresi */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Autocomplete
          options={cariler}
          getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
          value={selectedCari}
          onChange={handleCariChange}
          loading={cariLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Cari Seçiniz (Tümü için boş bırakın)"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {cariLoading ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {analiz && (
        <>
          {/* Özet Kartlar */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Vadesi Geçenler
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {analiz.ozet.vadesiGecenler.adet}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {formatCurrency(analiz.ozet.vadesiGecenler.tutar)}
                      </Typography>
                    </Box>
                    <Warning sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Bugün Vadenler
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {analiz.ozet.bugunVadenler.adet}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {formatCurrency(analiz.ozet.bugunVadenler.tutar)}
                      </Typography>
                    </Box>
                    <CalendarToday sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Yaklaşanlar (7 gün)
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {analiz.ozet.yaklaşanlar.adet}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {formatCurrency(analiz.ozet.yaklaşanlar.tutar)}
                      </Typography>
                    </Box>
                    <AccessTime sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Normal Faturalar
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {analiz.ozet.normalFaturalar.adet}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {formatCurrency(analiz.ozet.normalFaturalar.tutar)}
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Cari Bazlı Özet (sadece tüm faturalar gösterilirken) */}
          {analiz.cariOzet && analiz.cariOzet.length > 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                👥 Cari Bazlı Vade Durumu (En Riskli Cariler)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Cari Kodu</strong></TableCell>
                      <TableCell><strong>Ünvan</strong></TableCell>
                      <TableCell align="right"><strong>Toplam Fatura</strong></TableCell>
                      <TableCell align="right"><strong>Toplam Kalan</strong></TableCell>
                      <TableCell align="right"><strong>Vadesi Geçen</strong></TableCell>
                      <TableCell align="right"><strong>Vadesi Geçen Tutar</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analiz.cariOzet.slice(0, 10).map((cariData) => (
                      <TableRow key={cariData.cari.id} hover>
                        <TableCell>{cariData.cari.cariKodu}</TableCell>
                        <TableCell>{cariData.cari.unvan}</TableCell>
                        <TableCell align="right">{cariData.toplamFatura}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(cariData.toplamKalan)}
                        </TableCell>
                        <TableCell align="right">
                          {cariData.vadesiGecen > 0 ? (
                            <Chip
                              label={cariData.vadesiGecen}
                              color="error"
                              size="small"
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={cariData.vadesiGecenTutar > 0 ? 'error.main' : 'text.secondary'}
                          >
                            {formatCurrency(cariData.vadesiGecenTutar)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Fatura Listesi */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              📋 Fatura Detayları {selectedCari && `- ${selectedCari.unvan}`}
            </Typography>

            {analiz.faturalar.length === 0 ? (
              <Alert severity="info">Ödenmemiş fatura bulunamadı.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Fatura No</strong></TableCell>
                      {!selectedCari && <TableCell><strong>Cari</strong></TableCell>}
                      <TableCell><strong>Tip</strong></TableCell>
                      <TableCell><strong>Tarih</strong></TableCell>
                      <TableCell><strong>Vade</strong></TableCell>
                      <TableCell align="right"><strong>Toplam</strong></TableCell>
                      <TableCell align="right"><strong>Kalan</strong></TableCell>
                      <TableCell align="center"><strong>Vade Durumu</strong></TableCell>
                      <TableCell align="center"><strong>Durum</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analiz.faturalar.map((fatura) => (
                      <TableRow
                        key={fatura.id}
                        hover
                        sx={{
                          bgcolor:
                            fatura.vadeDurumu === 'GECMIS'
                              ? 'error.lighter'
                              : fatura.vadeDurumu === 'BUGUN'
                              ? 'warning.lighter'
                              : 'inherit',
                        }}
                      >
                        <TableCell>{fatura.faturaNo}</TableCell>
                        {!selectedCari && (
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">
                              {fatura.cari.cariKodu}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {fatura.cari.unvan}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Chip
                            label={fatura.faturaTipi}
                            size="small"
                            color={fatura.faturaTipi === 'SATIS' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>{formatDate(fatura.tarih)}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={fatura.vadeDurumu === 'GECMIS' ? 'bold' : 'normal'}
                            color={fatura.vadeDurumu === 'GECMIS' ? 'error' : 'inherit'}
                          >
                            {formatDate(fatura.vade)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(fatura.genelToplam)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="error.main">
                            {formatCurrency(fatura.odenecekTutar)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getVadeDurumuLabel(fatura)}
                            color={getVadeDurumuColor(fatura.vadeDurumu)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {fatura.vadeDurumu === 'GECMIS' && (
                            <Tooltip title={`${fatura.gecenGun} gün gecikme`}>
                              <TrendingDown color="error" />
                            </Tooltip>
                          )}
                          {fatura.vadeDurumu === 'BUGUN' && (
                            <Tooltip title="Bugün vade sonu">
                              <Warning color="warning" />
                            </Tooltip>
                          )}
                          {fatura.vadeDurumu === 'YAKLASAN' && (
                            <Tooltip title={`${fatura.kalanGun} gün içinde`}>
                              <AccessTime color="info" />
                            </Tooltip>
                          )}
                          {fatura.vadeDurumu === 'NORMAL' && (
                            <Tooltip title={`${fatura.kalanGun} gün var`}>
                              <CheckCircle color="success" />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}
    </MainLayout>
  );
}

