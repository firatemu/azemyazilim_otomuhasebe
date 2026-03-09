'use client';

import React, { useState, useEffect } from 'react';
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
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
} from '@mui/material';
import { ArrowBack, Edit, Print as PrintIcon, Receipt } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  birim: string;
}

interface SiparisKalemi {
  id: string;
  stokId: string;
  miktar: number;
  birimFiyat: number;
  kdvOrani: number;
  iskontoOran: number;
  iskontoTutar: number;
  tutar: number;
  kdvTutar: number;
  stok?: Stok;
}

interface SatinAlmaSiparisi {
  id: string;
  siparisNo: string;
  tarih: string;
  vade: string | null;
  cari: Cari;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  iskonto: number;
  aciklama: string | null;
  durum: 'PENDING' | 'ORDER_PLACED' | 'INVOICED' | 'CANCELLED';
  faturaNo: string | null;
  kalemler: SiparisKalemi[];
}

const durumRenkleri: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  BEKLEMEDE: 'default',
  SIPARIS_VERILDI: 'warning',
  FATURALANDI: 'success',
  IPTAL: 'error',
};

const durumMetinleri: Record<string, string> = {
  BEKLEMEDE: 'Beklemede',
  SIPARIS_VERILDI: 'Sipariş Verildi',
  FATURALANDI: 'Faturalandı',
  IPTAL: 'İptal',
};

export default function SatinAlmaSiparisDetayPage() {
  const params = useParams();
  const router = useRouter();
  const [siparis, setSiparis] = useState<SatinAlmaSiparisi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiparis();
  }, [params.id]);

  const fetchSiparis = async () => {
    try {
      const response = await axios.get(`/satin-alma-siparisi/${params.id}`);
      setSiparis(response.data);
    } catch (error: any) {
      console.error('Sipariş yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const calculateKalemToplam = (kalem: SiparisKalemi) => {
    const araToplam = kalem.miktar * kalem.birimFiyat;
    const netTutar = araToplam - (kalem.iskontoTutar || 0);
    const kdv = (netTutar * kalem.kdvOrani) / 100;
    return netTutar + kdv;
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!siparis) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" color="error">
            Sipariş bulunamadı
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push('/order/satin-alma')}
              sx={{
                bgcolor: '#f3f4f6',
                '&:hover': { bgcolor: '#e5e7eb' }
              }}
            >
              Geri
            </Button>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{
                background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Satın Alma Siparişi Detayı
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {siparis.siparisNo}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {siparis.durum !== 'INVOICED' && siparis.durum !== 'CANCELLED' && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => router.push(`/siparis/satin-alma/duzenle/${siparis.id}`)}
                sx={{
                  background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                }}
              >
                Düzenle
              </Button>
            )}
            {siparis.durum === 'SIPARIS_VERILDI' && (
              <Button
                variant="contained"
                startIcon={<Receipt />}
                onClick={() => router.push(`/fatura/satin-alma/yeni?siparisId=${siparis.id}`)}
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                }}
              >
                Fatura Oluştur
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => router.push(`/siparis/satin-alma/print/${siparis.id}`)}
            >
              Yazdır
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Sipariş Bilgileri */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Sipariş Bilgileri
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Sipariş No
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {siparis.siparisNo}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tarih
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {formatDate(siparis.tarih)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Vade
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {formatDate(siparis.vade)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Durum
                </Typography>
                <Chip
                  label={durumMetinleri[siparis.durum]}
                  color={durumRenkleri[siparis.durum]}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Cari
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {siparis.cari?.unvan || '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {siparis.cari?.cariKodu || ''}
                </Typography>
              </Grid>
              {siparis.faturaNo && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fatura No
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {siparis.faturaNo}
                  </Typography>
                </Grid>
              )}
              {siparis.aciklama && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Açıklama
                  </Typography>
                  <Typography variant="body1">
                    {siparis.aciklama}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Özet Bilgiler */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Özet
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Ara Toplam
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {formatCurrency(siparis.toplamTutar)}
                </Typography>
              </Box>
              {siparis.iskonto > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Genel İskonto
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="error">
                    - {formatCurrency(siparis.iskonto)}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  KDV Toplamı
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {formatCurrency(siparis.kdvTutar)}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight="bold">
                  Genel Toplam
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#0891b2' }}>
                  {formatCurrency(siparis.genelToplam)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Kalemler */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Sipariş Kalemleri
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Malzeme Kodu</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Stok Adı</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Miktar</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Birim Fiyat</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>KDV %</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>İskonto</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {siparis.kalemler && siparis.kalemler.length > 0 ? (
                    siparis.kalemler.map((kalem, index) => (
                      <TableRow key={kalem.id || index}>
                        <TableCell>{kalem.stok?.stokKodu || '-'}</TableCell>
                        <TableCell>{kalem.stok?.stokAdi || '-'}</TableCell>
                        <TableCell align="right">{kalem.miktar} {kalem.stok?.birim || ''}</TableCell>
                        <TableCell align="right">{formatCurrency(kalem.birimFiyat)}</TableCell>
                        <TableCell align="right">%{kalem.kdvOrani}</TableCell>
                        <TableCell align="right">
                          {kalem.iskontoTutar > 0 && (
                            <Typography variant="body2" color="error">
                              -{formatCurrency(kalem.iskontoTutar)}
                            </Typography>
                          )}
                          {kalem.iskontoTutar === 0 && '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="600">
                            {formatCurrency(calculateKalemToplam(kalem))}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Kalem bulunamadı
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
}

