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
  Alert,
  Divider,
} from '@mui/material';
import { ArrowBack, Edit, Receipt } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

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
}

interface IrsaliyeKalemi {
  id: string;
  stokId: string;
  stok?: Stok;
  miktar: number;
  birimFiyat: number;
  kdvOrani: number;
  kdvTutar: number;
  tutar: number;
}

interface SatisIrsaliyesi {
  id: string;
  irsaliyeNo: string;
  irsaliyeTarihi: string;
  cari: Cari;
  durum: 'FATURALANMADI' | 'FATURALANDI';
  kaynakTip: 'SIPARIS' | 'DOGRUDAN' | 'FATURA_OTOMATIK';
  kaynakSiparis?: {
    id: string;
    siparisNo: string;
  };
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  iskonto: number;
  aciklama?: string;
  kalemler: IrsaliyeKalemi[];
  faturalar?: Array<{
    id: string;
    faturaNo: string;
    tarih: string;
  }>;
  createdByUser?: {
    id: string;
    fullName?: string;
    username?: string;
  };
  updatedByUser?: {
    id: string;
    fullName?: string;
    username?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function SatisIrsaliyesiDetayPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [irsaliye, setIrsaliye] = useState<SatisIrsaliyesi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIrsaliye();
  }, [id]);

  const fetchIrsaliye = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/satis-irsaliyesi/${id}`);
      setIrsaliye(response.data);
      setError(null);
    } catch (err: any) {
      console.error('İrsaliye yüklenirken hata:', err);
      setError(err.response?.data?.message || 'İrsaliye yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDurumColor = (durum: string): 'default' | 'warning' | 'success' => {
    switch (durum) {
      case 'FATURALANDI':
        return 'success';
      case 'FATURALANMADI':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDurumLabel = (durum: string) => {
    switch (durum) {
      case 'FATURALANDI':
        return 'Faturalandı';
      case 'FATURALANMADI':
        return 'Faturalanmadı';
      default:
        return durum;
    }
  };

  const getKaynakTipLabel = (kaynakTip: string) => {
    switch (kaynakTip) {
      case 'SIPARIS':
        return 'Sipariş';
      case 'DOGRUDAN':
        return 'Doğrudan';
      case 'FATURA_OTOMATIK':
        return 'Fatura Otomatik';
      default:
        return kaynakTip;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error || !irsaliye) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'İrsaliye yüklenemedi'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/satis-irsaliyesi')}
          >
            Geri Dön
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/satis-irsaliyesi')}
            >
              Geri Dön
            </Button>
            <Typography variant="h4" fontWeight="bold">
              Satış İrsaliyesi Detayı
            </Typography>
          </Box>
          {irsaliye.durum === 'FATURALANMADI' && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Receipt />}
                onClick={() => router.push(`/fatura/satis/yeni?irsaliyeId=${irsaliye.id}`)}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }}
              >
                Faturalandır
              </Button>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => router.push(`/satis-irsaliyesi/${irsaliye.id}/duzenle`)}
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                }}
              >
                Düzenle
              </Button>
            </Box>
          )}
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">İrsaliye No:</Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                {irsaliye.irsaliyeNo}
              </Typography>
              <Chip
                label={getDurumLabel(irsaliye.durum)}
                color={getDurumColor(irsaliye.durum)}
                size="small"
              />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">Tarih:</Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatDate(irsaliye.irsaliyeTarihi)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Cari:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {irsaliye.cari.unvan}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {irsaliye.cari.cariKodu}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Kaynak Tip:
              </Typography>
              <Chip
                label={getKaynakTipLabel(irsaliye.kaynakTip)}
                size="small"
                variant="outlined"
              />
              {irsaliye.kaynakSiparis && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'inline-block' }}>
                  ({irsaliye.kaynakSiparis.siparisNo})
                </Typography>
              )}
            </Box>
          </Box>

          {irsaliye.faturalar && irsaliye.faturalar.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Bağlı Faturalar:
              </Typography>
              {irsaliye.faturalar.map((fatura) => (
                <Chip
                  key={fatura.id}
                  icon={<Receipt />}
                  label={fatura.faturaNo}
                  onClick={() => router.push(`/fatura/satis/duzenle/${fatura.id}`)}
                  sx={{ mr: 1, mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}

          {irsaliye.aciklama && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Açıklama:
              </Typography>
              <Typography variant="body1">{irsaliye.aciklama}</Typography>
            </Box>
          )}

          {irsaliye.kalemler && irsaliye.kalemler.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                İrsaliye Kalemleri
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f9fafb' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Malzeme Kodu</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Stok</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Miktar</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Birim Fiyat</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>KDV %</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Tutar</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>KDV Tutar</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {irsaliye.kalemler.map((kalem, index) => (
                      <TableRow key={kalem.id || index} hover>
                        <TableCell>{kalem.stok?.stokKodu || '-'}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">
                            {kalem.stok?.stokAdi || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{kalem.miktar}</TableCell>
                        <TableCell align="right">{formatCurrency(kalem.birimFiyat)}</TableCell>
                        <TableCell align="right">%{kalem.kdvOrani}</TableCell>
                        <TableCell align="right">{formatCurrency(kalem.tutar)}</TableCell>
                        <TableCell align="right">{formatCurrency(kalem.kdvTutar)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(kalem.tutar + kalem.kdvTutar)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9fafb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" align="right">
                  Ara Toplam:
                </Typography>
                <Typography variant="body2" color="text.secondary" align="right">
                  İskonto:
                </Typography>
                <Typography variant="body2" color="text.secondary" align="right">
                  KDV Toplam:
                </Typography>
                <Typography variant="h6" fontWeight="bold" align="right" sx={{ mt: 1, color: '#8b5cf6' }}>
                  Genel Toplam:
                </Typography>
              </Box>
              <Box sx={{ minWidth: 150 }}>
                <Typography variant="body2" align="right" fontWeight="500">
                  {formatCurrency(irsaliye.toplamTutar)}
                </Typography>
                <Typography variant="body2" align="right" fontWeight="500">
                  {formatCurrency(irsaliye.iskonto)}
                </Typography>
                <Typography variant="body2" align="right" fontWeight="500">
                  {formatCurrency(irsaliye.kdvTutar)}
                </Typography>
                <Typography variant="h6" fontWeight="bold" align="right" sx={{ mt: 1, color: '#8b5cf6' }}>
                  {formatCurrency(irsaliye.genelToplam)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Audit Bilgileri */}
          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f0f9ff', mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#0369a1' }}>
              📋 Denetim Bilgileri
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Oluşturan:
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {irsaliye.createdByUser?.fullName || 'Sistem'}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      ({irsaliye.createdByUser?.username || '-'})
                    </Typography>
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Oluşturma Tarihi:
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {irsaliye.createdAt ? formatDateTime(irsaliye.createdAt) : '-'}
                  </Typography>
                </Box>
              </Box>

              {irsaliye.updatedByUser && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Son Güncelleyen:
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {irsaliye.updatedByUser.fullName}
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({irsaliye.updatedByUser.username})
                      </Typography>
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Son Güncelleme:
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {irsaliye.updatedAt ? formatDateTime(irsaliye.updatedAt) : '-'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Paper>
      </Box>
    </MainLayout>
  );
}

