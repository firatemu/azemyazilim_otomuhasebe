'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  ButtonGroup,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Print, Close, PictureAsPdf, ZoomIn, ZoomOut, ArrowBack } from '@mui/icons-material';
import axios from '@/lib/axios';
import { useReactToPrint } from 'react-to-print';

interface Lokasyon {
  kod: string;
  adres: string;
  miktar: number;
}

interface SiparisKalem {
  id: string;
  stokId: string;
  miktar: number;
  stok: {
    stokKodu: string;
    stokAdi: string;
    birim: string;
    mevcutStok?: number;
    rafAdresi?: string;
    lokasyonlar?: Lokasyon[];
  };
}

interface Siparis {
  id: string;
  siparisNo: string;
  siparisTipi: string;
  durum: string;
  tarih: string;
  vadeTarihi: string;
  aciklama?: string;
  cari: {
    cariKodu: string;
    unvan: string;
    adres?: string;
    telefon?: string;
    vergiNo?: string;
    vergiDairesi?: string;
  };
  kalemler: SiparisKalem[];
}

export default function SiparisHazirlamaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [siparis, setSiparis] = useState<Siparis | null>(null);
  const [loading, setLoading] = useState(true);
  const [paperSize, setPaperSize] = useState<'A4' | 'A5' | 'A5-landscape'>('A4');
  const [zoom, setZoom] = useState(100);
  
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSiparis();
  }, [id]);

  const fetchSiparis = async () => {
    try {
      setLoading(true);
      // Hazırlama detaylarını çek (lokasyon bilgileri ile)
      let data;
      try {
        const response = await axios.get(`/siparis/${id}/hazirlama-detaylari`);
        data = response.data;
        console.log('Hazırlama detayları alındı:', data);
      } catch (e) {
        console.error('Hazırlama detayları alınamadı, normal detay kullanılıyor:', e);
        // Hazırlama detayları yoksa normal detayı çek
        const response = await axios.get(`/siparis/${id}`);
        data = response.data;
      }
      
      // Kalemler için stok ve lokasyon bilgilerini parse et
      const kalemlerWithStok = data.kalemler.map((kalem: any) => {
        // Backend'den gelen locations array'ini parse et
        // Yapı: { location: { code, name, warehouse }, qtyOnHand }
        const locations = kalem.locations || [];
        const lokasyonlar: Lokasyon[] = locations
          .filter((loc: any) => (loc.qtyOnHand || loc.miktar || 0) > 0) // Boş rafları filtrele
          .map((loc: any) => {
            // Location objesi içinde code ve name var
            const location = loc.location || {};
            return {
              kod: location.code || loc.code || '',
              adres: location.name || loc.name || '',
              miktar: loc.qtyOnHand || loc.miktar || 0,
            };
          });
        
        // Stok miktarını hesapla (tüm lokasyonlardaki miktarların toplamı)
        const mevcutStok = lokasyonlar.reduce((sum, loc) => sum + loc.miktar, 0);
        
        console.log(`Kalem ${kalem.stok?.stokKodu}: ${lokasyonlar.length} lokasyon, toplam stok: ${mevcutStok}`, lokasyonlar);
        
        return {
          ...kalem,
          stok: {
            ...kalem.stok,
            mevcutStok: mevcutStok,
            lokasyonlar: lokasyonlar,
          },
        };
      });
      
      setSiparis({
        ...data,
        kalemler: kalemlerWithStok,
      });
    } catch (error) {
      console.error('Sipariş yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Siparis-Hazirlama-${siparis?.siparisNo}`,
  });

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: paperSize === 'A5-landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: paperSize === 'A4' ? 'a4' : 'a5',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Siparis-Hazirlama-${siparis?.siparisNo}.pdf`);
    } catch (error) {
      console.error('PDF oluşturulamadı:', error);
      alert('PDF oluşturulurken bir hata oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading || !siparis) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
      {/* Kontrol Paneli */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
          >
            Geri
          </Button>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Kağıt Boyutu</InputLabel>
            <Select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as 'A4' | 'A5' | 'A5-landscape')}
              label="Kağıt Boyutu"
            >
              <MenuItem value="A4">A4</MenuItem>
              <MenuItem value="A5">A5</MenuItem>
              <MenuItem value="A5-landscape">A5 Yatay</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Uzaklaştır">
              <IconButton
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
                size="small"
              >
                <ZoomOut />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center' }}>
              {zoom}%
            </Typography>
            <Tooltip title="Yakınlaştır">
              <IconButton
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                disabled={zoom >= 150}
                size="small"
              >
                <ZoomIn />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Yazdır
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={handleDownloadPDF}
          >
            PDF İndir
          </Button>
        </Stack>
      </Paper>

      {/* Yazdırılacak İçerik */}
      <Box
        ref={printRef}
        sx={{
          bgcolor: 'white',
          p: paperSize === 'A4' ? 4 : 3,
          maxWidth: paperSize === 'A4' ? '210mm' : paperSize === 'A5-landscape' ? '210mm' : '148mm',
          margin: '0 auto',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.3s',
        }}
      >
        {/* Başlık */}
        <Box sx={{ mb: 3, textAlign: 'center', borderBottom: '2px solid #191970', pb: 2 }}>
          <Typography variant="h4" sx={{ color: '#191970', fontWeight: 'bold', mb: 1 }}>
            SİPARİŞ HAZIRLAMA FORMU
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Yedek Parça Otomasyon
          </Typography>
        </Box>

        {/* Sipariş Bilgileri */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Sipariş No:
            </Typography>
            <Typography variant="body1">{siparis.siparisNo}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Tarih:
            </Typography>
            <Typography variant="body1">{formatDate(siparis.tarih)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Durum:
            </Typography>
            <Chip
              label={siparis.durum}
              color={
                siparis.durum === 'FATURALANDI'
                  ? 'success'
                  : siparis.durum === 'HAZIRLANDI'
                  ? 'info'
                  : siparis.durum === 'HAZIRLANIYOR'
                  ? 'warning'
                  : 'default'
              }
              size="small"
            />
          </Box>
        </Box>

        {/* Cari Bilgileri */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
            Cari Bilgileri
          </Typography>
          <Typography variant="body2">
            <strong>Ünvan:</strong> {siparis.cari.unvan}
          </Typography>
          {siparis.cari.adres && (
            <Typography variant="body2">
              <strong>Adres:</strong> {siparis.cari.adres}
            </Typography>
          )}
          {siparis.cari.telefon && (
            <Typography variant="body2">
              <strong>Telefon:</strong> {siparis.cari.telefon}
            </Typography>
          )}
        </Box>

        {/* Ürün Listesi */}
        <TableContainer>
          <Table sx={{ border: '1px solid #ddd' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#191970', color: 'white' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  #
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  Stok Kodu
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  Stok Adı
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  Sipariş Miktarı
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  Mevcut Stok
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  Raf Adresi
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Birim
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {siparis.kalemler.map((kalem, index) => {
                const lokasyonlar = kalem.stok.lokasyonlar || [];
                const rafAdresi = lokasyonlar.length > 0 
                  ? (() => {
                      const adresler = lokasyonlar.map(loc => {
                        // Kod ve miktarı birleştir
                        const kodVeMiktar = `${loc.kod} (${loc.miktar} adet)`;
                        
                        // Eğer adres varsa ve kod'dan farklıysa, adres bilgisini de ekle
                        if (loc.adres && loc.adres !== loc.kod && loc.adres.trim() !== '') {
                          return `${kodVeMiktar} - ${loc.adres}`;
                        }
                        return kodVeMiktar;
                      }).filter(addr => addr && addr !== '-');
                      return adresler.length > 0 ? adresler.join(', ') : '-';
                    })()
                  : '-';
                const mevcutStok = kalem.stok.mevcutStok || 0;
                
                return (
                  <TableRow key={kalem.id}>
                    <TableCell sx={{ borderRight: '1px solid #ddd' }}>{index + 1}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #ddd' }}>{kalem.stok.stokKodu}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #ddd' }}>{kalem.stok.stokAdi}</TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #ddd', fontWeight: 'bold' }}>
                      {kalem.miktar}
                    </TableCell>
                    <TableCell 
                      align="center" 
                      sx={{ 
                        borderRight: '1px solid #ddd',
                        color: mevcutStok < kalem.miktar ? 'error.main' : 'success.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {mevcutStok}
                    </TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #ddd', fontSize: '0.875rem' }}>
                      {rafAdresi}
                    </TableCell>
                    <TableCell align="center">{kalem.stok.birim}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Açıklama */}
        {siparis.aciklama && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Açıklama:
            </Typography>
            <Typography variant="body2">{siparis.aciklama}</Typography>
          </Box>
        )}

        {/* İmza Alanı */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', pt: 3, borderTop: '2px solid #ddd' }}>
          <Box sx={{ textAlign: 'center', width: '45%' }}>
            <Typography variant="body2" sx={{ mb: 4, borderBottom: '1px solid #ddd', pb: 1 }}>
              Hazırlayan
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              İmza
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', width: '45%' }}>
            <Typography variant="body2" sx={{ mb: 4, borderBottom: '1px solid #ddd', pb: 1 }}>
              Kontrol Eden
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              İmza
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 3, textAlign: 'center', pt: 2, borderTop: '1px solid #ddd' }}>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Bu belge elektronik ortamda oluşturulmuştur.
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
            Yazdırma Tarihi: {new Date().toLocaleDateString('tr-TR')} {new Date().toLocaleTimeString('tr-TR')}
          </Typography>
        </Box>
      </Box>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            size: ${paperSize === 'A4' ? 'A4' : paperSize === 'A5-landscape' ? 'A5 landscape' : 'A5'};
            margin: 10mm;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
