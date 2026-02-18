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
  Button,
  Chip,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import { Print, CheckCircle, Warning, ArrowBack } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';

interface RafBilgisi {
  depoKodu: string;
  depoAdi: string;
  rafKodu: string;
  rafBarkod: string;
  rafAciklama: string | null;
  kat: number;
  koridor: string;
  taraf: number;
  bolum: number;
  seviye: number;
  mevcutMiktar: number;
}

interface Kalem {
  stokId: string;
  stokKodu: string;
  stokAdi: string;
  birim: string;
  barkod: string | null;
  marka: string | null;
  model: string | null;
  istenenMiktar: number;
  birimFiyat: number;
  kdvOrani: number;
  eskiRaf: string | null;
  raflar: RafBilgisi[];
  toplamMevcutMiktar: number;
  toplamRafSayisi: number;
}

interface Fatura {
  id: string;
  faturaNo: string;
  faturaTipi: string;
  tarih: string;
  vade: string | null;
  durum: string;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  aciklama: string | null;
}

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  telefon: string | null;
  adres: string | null;
}

interface HazirlamaBilgisi {
  toplamKalemSayisi: number;
  toplamUrunAdedi: number;
  eksikUrunler: Kalem[];
  tamUrunler: Kalem[];
}

interface MalzemeHazirlamaData {
  fatura: Fatura;
  cari: Cari;
  kalemler: Kalem[];
  hazirlamaBilgisi: HazirlamaBilgisi;
  olusturmaTarihi: string;
}

export default function MalzemeHazirlamaFisiPage() {
  const params = useParams();
  const router = useRouter();
  const faturaId = params.id as string;

  const [data, setData] = useState<MalzemeHazirlamaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [faturaId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/fatura/${faturaId}/malzeme-hazirlama`);
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Veri yüklenirken hata:', err);
      setError(err.response?.data?.message || 'Veri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Veri yüklenemedi'}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/fatura/satis')}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, '@media print': { p: 2 } }}>
      {/* Yazdırma Butonları - Sadece ekranda görünür */}
      <Box className="no-print" sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={handlePrint}
          color="primary"
        >
          Yazdır
        </Button>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/fatura/satis')}
        >
          Geri Dön
        </Button>
      </Box>

      {/* Başlık */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '2px solid #000',
          '@media print': { boxShadow: 'none' },
        }}
      >
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          MALZEME HAZIRLAMA FİŞİ
        </Typography>
        <Divider sx={{ my: 2, borderWidth: 1, borderColor: '#000' }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Typography variant="body1">
              <strong>Fatura No:</strong> {data.fatura.faturaNo}
            </Typography>
            <Typography variant="body1">
              <strong>Tarih:</strong> {new Date(data.fatura.tarih).toLocaleDateString('tr-TR')}
            </Typography>
            {data.fatura.vade && (
              <Typography variant="body1">
                <strong>Vade:</strong> {new Date(data.fatura.vade).toLocaleDateString('tr-TR')}
              </Typography>
            )}
            <Typography variant="body1" component="div">
              <strong>Durum:</strong>{' '}
              <Chip
                label={data.fatura.durum}
                size="small"
                color={data.fatura.durum === 'ONAYLANDI' ? 'success' : 'default'}
                sx={{ '@media print': { border: '1px solid #000' } }}
              />
            </Typography>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Typography variant="body1">
              <strong>Müşteri:</strong> {data.cari.cariKodu} - {data.cari.unvan}
            </Typography>
            {data.cari.telefon && (
              <Typography variant="body1">
                <strong>Telefon:</strong> {data.cari.telefon}
              </Typography>
            )}
            {data.cari.adres && (
              <Typography variant="body1">
                <strong>Adres:</strong> {data.cari.adres}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Hazırlama Özeti */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: data.hazirlamaBilgisi.eksikUrunler.length > 0 ? '#fff3e0' : '#e8f5e9',
          border: '1px solid #000',
          '@media print': { boxShadow: 'none' },
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Typography variant="body2" color="text.secondary">
              Toplam Kalem
            </Typography>
            <Typography variant="h6">{data.hazirlamaBilgisi.toplamKalemSayisi}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Typography variant="body2" color="text.secondary">
              Toplam Adet
            </Typography>
            <Typography variant="h6">{data.hazirlamaBilgisi.toplamUrunAdedi}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Typography variant="body2" color="text.secondary">
              Hazır Ürün
            </Typography>
            <Typography variant="h6" color="success.main">
              <CheckCircle sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              {data.hazirlamaBilgisi.tamUrunler.length}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Typography variant="body2" color="text.secondary">
              Eksik Ürün
            </Typography>
            <Typography variant="h6" color="error.main">
              <Warning sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              {data.hazirlamaBilgisi.eksikUrunler.length}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Ürün Listesi */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #000',
          '@media print': { boxShadow: 'none', pageBreakInside: 'avoid' },
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Sıra</TableCell>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Stok Kodu</TableCell>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Ürün Adı</TableCell>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }} align="center">
                İstenen
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }} align="center">
                Mevcut
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>
                Raf Lokasyonu
              </TableCell>
              <TableCell
                sx={{ fontWeight: 'bold', border: '1px solid #000' }}
                align="center"
                className="no-print"
              >
                Durum
              </TableCell>
              <TableCell
                sx={{ fontWeight: 'bold', border: '1px solid #000', width: 80 }}
                align="center"
              >
                ☐ Hazır
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.kalemler.map((kalem, index) => (
              <TableRow
                key={kalem.stokId}
                sx={{
                  bgcolor:
                    kalem.toplamMevcutMiktar < kalem.istenenMiktar ? '#ffebee' : '#f1f8e9',
                  '@media print': {
                    pageBreakInside: 'avoid',
                  },
                }}
              >
                <TableCell sx={{ border: '1px solid #000' }}>{index + 1}</TableCell>
                <TableCell sx={{ border: '1px solid #000' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {kalem.stokKodu}
                  </Typography>
                  {kalem.barkod && (
                    <Typography variant="caption" color="text.secondary">
                      {kalem.barkod}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000' }}>
                  <Typography variant="body2">{kalem.stokAdi}</Typography>
                  {(kalem.marka || kalem.model) && (
                    <Typography variant="caption" color="text.secondary">
                      {[kalem.marka, kalem.model].filter(Boolean).join(' - ')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000' }} align="center">
                  <Typography variant="h6" fontWeight="bold">
                    {kalem.istenenMiktar}
                  </Typography>
                  <Typography variant="caption">{kalem.birim}</Typography>
                </TableCell>
                <TableCell sx={{ border: '1px solid #000' }} align="center">
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={
                      kalem.toplamMevcutMiktar >= kalem.istenenMiktar
                        ? 'success.main'
                        : 'error.main'
                    }
                  >
                    {kalem.toplamMevcutMiktar}
                  </Typography>
                  <Typography variant="caption">{kalem.birim}</Typography>
                </TableCell>
                <TableCell sx={{ border: '1px solid #000' }}>
                  {kalem.raflar.length > 0 ? (
                    kalem.raflar.map((raf, rafIndex) => (
                      <Box
                        key={rafIndex}
                        sx={{
                          mb: rafIndex < kalem.raflar.length - 1 ? 1 : 0,
                          pb: rafIndex < kalem.raflar.length - 1 ? 1 : 0,
                          borderBottom:
                            rafIndex < kalem.raflar.length - 1 ? '1px dashed #ccc' : 'none',
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          📍 {raf.rafKodu}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {raf.depoAdi} - Stok: {raf.mevcutMiktar} {kalem.birim}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Kat:{raf.kat} | Koridor:{raf.koridor} | Taraf:{raf.taraf} | Bölüm:
                          {raf.bolum} | Seviye:{raf.seviye}
                        </Typography>
                      </Box>
                    ))
                  ) : kalem.eskiRaf ? (
                    <Typography variant="body2">📍 {kalem.eskiRaf}</Typography>
                  ) : (
                    <Typography variant="body2" color="error">
                      ⚠️ Raf bilgisi yok
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000' }} align="center" className="no-print">
                  {kalem.toplamMevcutMiktar >= kalem.istenenMiktar ? (
                    <Chip
                      icon={<CheckCircle />}
                      label="Tamam"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip icon={<Warning />} label="Eksik" color="error" size="small" />
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    border: '1px solid #000',
                    bgcolor: '#fff',
                    textAlign: 'center',
                    fontSize: '24px',
                  }}
                >
                  ☐
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Alt Bilgi */}
      <Box
        sx={{
          mt: 4,
          pt: 3,
          borderTop: '1px solid #ccc',
          '@media print': { mt: 3, pt: 2 },
        }}
      >
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Hazırlayan
            </Typography>
            <Box sx={{ borderBottom: '1px solid #000', height: 40, mt: 2 }} />
            <Typography variant="caption" color="text.secondary">
              İsim / İmza / Tarih
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Kontrol Eden
            </Typography>
            <Box sx={{ borderBottom: '1px solid #000', height: 40, mt: 2 }} />
            <Typography variant="caption" color="text.secondary">
              İsim / İmza / Tarih
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Teslim Alan
            </Typography>
            <Box sx={{ borderBottom: '1px solid #000', height: 40, mt: 2 }} />
            <Typography variant="caption" color="text.secondary">
              İsim / İmza / Tarih
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Fiş Oluşturma Tarihi: {new Date(data.olusturmaTarihi).toLocaleString('tr-TR')}
          </Typography>
        </Box>
      </Box>

      {/* CSS for Print */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </Box>
  );
}

