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
} from '@mui/material';
import { Print, Close, PictureAsPdf, ZoomIn, ZoomOut } from '@mui/icons-material';
import axios from '@/lib/axios';
import { useReactToPrint } from 'react-to-print';

interface Fatura {
  id: string;
  faturaNo: string;
  faturaTipi: string;
  durum: string;
  tarih: string;
  vadeTarihi: string;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  iskonto: number;
  aciklama?: string;
  cari: {
    cariKodu: string;
    unvan: string;
    adres?: string;
    telefon?: string;
    vergiNo?: string;
    vergiDairesi?: string;
  };
  kalemler: Array<{
    id: string;
    stokId: string;
    miktar: number;
    birimFiyat: number;
    kdvOrani: number;
    tutar: number;
    kdvTutar: number;
    stok: {
      stokKodu: string;
      stokAdi: string;
      birim: string;
    };
  }>;
}

export default function SatisIadeFaturaPrintPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [paperSize, setPaperSize] = useState<'A4' | 'A5' | 'A5-landscape'>('A4');
  const [template, setTemplate] = useState<'classic' | 'modern'>('classic');
  const [zoom, setZoom] = useState(100);
  
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFatura();
  }, [id]);

  const fetchFatura = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/fatura/${id}`);
      setFatura(response.data);
    } catch (error) {
      console.error('Fatura yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Iade-Fatura-${fatura?.faturaNo}`,
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
      pdf.save(`Iade-Fatura-${fatura?.faturaNo}.pdf`);
    } catch (error) {
      console.error('PDF oluşturulamadı:', error);
      alert('PDF oluşturulurken bir hata oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading || !fatura) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      minHeight: '100vh', 
      p: { xs: 1, sm: 2, md: 3 },
      overflowX: 'auto',
      width: '100%',
      maxWidth: '100vw',
    }}>
      {/* Kontrol Paneli */}
      <Paper sx={{ 
        p: { xs: 1, sm: 2 }, 
        mb: 3, 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '2px',
        },
      }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 2, sm: 2 }} 
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          justifyContent="space-between"
        >
          {/* Sol Taraf - Başlık ve Format Seçimleri */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1.5, sm: 2 }} 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ flex: { xs: '1 1 auto', sm: '0 1 auto' }, minWidth: 0 }}
          >
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, whiteSpace: 'nowrap' }}>
              İade Fatura Önizleme
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 1, sm: 2 }} 
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ flexWrap: 'wrap', gap: { xs: 1, sm: 0 } }}
            >
              <ButtonGroup size="small" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant={paperSize === 'A4' ? 'contained' : 'outlined'}
                  onClick={() => setPaperSize('A4')}
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  A4
                </Button>
                <Button
                  variant={paperSize === 'A5' ? 'contained' : 'outlined'}
                  onClick={() => setPaperSize('A5')}
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  A5 ⬍
                </Button>
                <Button
                  variant={paperSize === 'A5-landscape' ? 'contained' : 'outlined'}
                  onClick={() => setPaperSize('A5-landscape')}
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  A5 ⬌
                </Button>
              </ButtonGroup>

              <ButtonGroup size="small" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant={template === 'classic' ? 'contained' : 'outlined'}
                  onClick={() => setTemplate('classic')}
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  Klasik
                </Button>
                <Button
                  variant={template === 'modern' ? 'contained' : 'outlined'}
                  onClick={() => setTemplate('modern')}
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  Modern
                </Button>
              </ButtonGroup>

              <Divider 
                orientation="vertical" 
                flexItem 
                sx={{ display: { xs: 'none', sm: 'block' } }}
              />

              {/* Zoom Kontrolleri */}
              <Stack 
                direction="row" 
                spacing={0.5} 
                alignItems="center"
                sx={{ 
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  border: { xs: '1px solid #e0e0e0', sm: 'none' },
                  borderRadius: { xs: 1, sm: 0 },
                  p: { xs: 0.5, sm: 0 },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <Tooltip title="Uzaklaştır">
                  <IconButton 
                    size="small" 
                    onClick={() => setZoom(z => Math.max(z - 10, 50))}
                    sx={{ p: { xs: 0.75, sm: 0.5 } }}
                  >
                    <ZoomOut fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    minWidth: '45px', 
                    textAlign: 'center',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  {zoom}%
                </Typography>
                <Tooltip title="Yakınlaştır">
                  <IconButton 
                    size="small" 
                    onClick={() => setZoom(z => Math.min(z + 10, 150))}
                    sx={{ p: { xs: 0.75, sm: 0.5 } }}
                  >
                    <ZoomIn fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>

          {/* Sağ Taraf - Aksiyon Butonları */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1, sm: 2 }}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              '& > button': {
                width: { xs: '100%', sm: 'auto' },
              },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrint}
              sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
            >
              Yazdır
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={handleDownloadPDF}
              sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
            >
              PDF İndir
            </Button>
            <Button
              variant="outlined"
              startIcon={<Close />}
              onClick={() => router.back()}
            >
              Kapat
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Fatura Önizleme */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: { xs: 'flex-start', sm: 'center' },
        transform: { xs: 'none', sm: `scale(${zoom / 100})` },
        transformOrigin: 'top center',
        transition: 'transform 0.2s',
        overflowX: 'auto',
        width: '100%',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
      }}>
        <div ref={printRef} style={{ minWidth: 'fit-content' }}>
          {template === 'classic' ? (
            <ClassicTemplate fatura={fatura} paperSize={paperSize} formatDate={formatDate} formatMoney={formatMoney} />
          ) : (
            <ModernTemplate fatura={fatura} paperSize={paperSize} formatDate={formatDate} formatMoney={formatMoney} />
          )}
        </div>
      </Box>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            size: ${paperSize === 'A4' ? 'A4 portrait' : paperSize === 'A5' ? 'A5 portrait' : 'A5 landscape'};
            margin: 0;
          }
        }
      `}</style>
    </Box>
  );
}

// Klasik Şablon
function ClassicTemplate({ 
  fatura, 
  paperSize, 
  formatDate, 
  formatMoney 
}: { 
  fatura: Fatura; 
  paperSize: 'A4' | 'A5' | 'A5-landscape';
  formatDate: (date: string) => string;
  formatMoney: (amount: number) => string;
}) {
  const width = paperSize === 'A4' ? '210mm' : paperSize === 'A5' ? '148mm' : '210mm';
  const height = paperSize === 'A4' ? '297mm' : paperSize === 'A5' ? '210mm' : '148mm';
  const fontSize = paperSize === 'A4' ? '10pt' : '8pt';

  return (
    <Paper
      sx={{
        width: { xs: '100%', sm: width },
        minWidth: { xs: '600px', sm: width },
        height,
        p: paperSize === 'A4' ? { xs: 2, sm: 4 } : { xs: 1, sm: 2 },
        bgcolor: 'white',
        boxShadow: 3,
        fontSize: { xs: '8pt', sm: fontSize },
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        '@media print': {
          boxShadow: 'none',
          p: paperSize === 'A4' ? 3 : 1.5,
          width,
          minWidth: width,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ borderBottom: '3px solid #ef4444', pb: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" sx={{ color: '#ef4444', fontWeight: 'bold', fontSize: paperSize === 'A4' ? '24pt' : '18pt' }}>
              YEDEK PARÇA
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
              Otomasyon Sistemi
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 'bold', fontSize: paperSize === 'A4' ? '18pt' : '14pt' }}>
              SATIŞ İADE FATURASI
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Fatura No:</strong> {fatura.faturaNo}
            </Typography>
            <Typography variant="body2">
              <strong>Tarih:</strong> {formatDate(fatura.tarih)}
            </Typography>
            {fatura.vadeTarihi && (
              <Typography variant="body2">
                <strong>Vade:</strong> {formatDate(fatura.vadeTarihi)}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Müşteri Bilgileri */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#fef2f2', borderRadius: 1, border: '1px solid #fecaca' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ef4444' }}>
          MÜŞTERİ BİLGİLERİ
        </Typography>
        <Stack direction="row" spacing={3}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2"><strong>Müşteri Kodu:</strong> {fatura.cari.cariKodu}</Typography>
            <Typography variant="body2"><strong>Ünvan:</strong> {fatura.cari.unvan}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            {fatura.cari.telefon && (
              <Typography variant="body2"><strong>Telefon:</strong> {fatura.cari.telefon}</Typography>
            )}
            {fatura.cari.adres && (
              <Typography variant="body2"><strong>Adres:</strong> {fatura.cari.adres}</Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Ürün Tablosu */}
      <TableContainer sx={{ 
        mb: 2,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': {
          height: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
      }}>
        <Table size="small" sx={{ 
          '& td, & th': { fontSize: 'inherit', py: 0.5 },
          minWidth: { xs: '600px', sm: 'auto' },
        }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#ef4444' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ürün Kodu</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ürün Adı</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Miktar</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Birim Fiyat</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>KDV %</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Toplam</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fatura.kalemler.map((kalem, index) => (
              <TableRow key={kalem.id} sx={{ '&:nth-of-type(even)': { bgcolor: '#fef2f2' } }}>
                <TableCell>{kalem.stok.stokKodu}</TableCell>
                <TableCell>{kalem.stok.stokAdi}</TableCell>
                <TableCell align="center">{kalem.miktar} {kalem.stok.birim}</TableCell>
                <TableCell align="right">{formatMoney(kalem.birimFiyat)}</TableCell>
                <TableCell align="center">{kalem.kdvOrani}%</TableCell>
                <TableCell align="right"><strong>{formatMoney(kalem.tutar + kalem.kdvTutar)}</strong></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Toplamlar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Box sx={{ width: paperSize === 'A4' ? '250px' : '180px' }}>
          <Stack spacing={0.5} sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 1, border: '1px solid #fecaca' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '9pt' }}>Ara Toplam:</Typography>
              <Typography sx={{ fontSize: '9pt' }}>{formatMoney(fatura.toplamTutar)}</Typography>
            </Stack>
            {fatura.iskonto > 0 && (
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '9pt' }}>İskonto:</Typography>
                <Typography sx={{ fontSize: '9pt', color: '#dc2626' }}>-{formatMoney(fatura.iskonto)}</Typography>
              </Stack>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '9pt' }}>KDV:</Typography>
              <Typography sx={{ fontSize: '9pt' }}>{formatMoney(fatura.kdvTutar)}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontWeight: 'bold', fontSize: '10pt' }}>
                İADE TOPLAMI:
              </Typography>
              <Typography sx={{ fontWeight: 'bold', fontSize: '10pt', color: '#ef4444' }}>
                {formatMoney(fatura.genelToplam)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Açıklama */}
      {fatura.aciklama && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fef2f2', borderRadius: 1, border: '1px solid #fecaca' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Açıklama:</Typography>
          <Typography variant="body2">{fatura.aciklama}</Typography>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ position: 'absolute', bottom: paperSize === 'A4' ? 30 : 15, left: paperSize === 'A4' ? 30 : 15, right: paperSize === 'A4' ? 30 : 15 }}>
        <Divider sx={{ mb: 1 }} />
        <Typography variant="caption" align="center" display="block" sx={{ color: '#666' }}>
          Bu belge iade faturası bilgi amaçlı hazırlanmıştır.
        </Typography>
      </Box>
    </Paper>
  );
}

// Modern Şablon
function ModernTemplate({ 
  fatura, 
  paperSize, 
  formatDate, 
  formatMoney 
}: { 
  fatura: Fatura; 
  paperSize: 'A4' | 'A5' | 'A5-landscape';
  formatDate: (date: string) => string;
  formatMoney: (amount: number) => string;
}) {
  const width = paperSize === 'A4' ? '210mm' : paperSize === 'A5' ? '148mm' : '210mm';
  const height = paperSize === 'A4' ? '297mm' : paperSize === 'A5' ? '210mm' : '148mm';
  const fontSize = paperSize === 'A4' ? '10pt' : '8pt';

  return (
    <Paper
      sx={{
        width: { xs: '100%', sm: width },
        minWidth: { xs: '600px', sm: width },
        height,
        p: 0,
        bgcolor: 'white',
        boxShadow: 3,
        fontSize: { xs: '8pt', sm: fontSize },
        fontFamily: 'Helvetica, sans-serif',
        position: 'relative',
        overflow: { xs: 'visible', sm: 'hidden' },
        '@media print': {
          boxShadow: 'none',
          width,
          minWidth: width,
          overflow: 'hidden',
        },
      }}
    >
      {/* Modern Header with Gradient */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        p: paperSize === 'A4' ? 4 : 2,
        pb: paperSize === 'A4' ? 3 : 2,
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 300, mb: 0.5, fontSize: paperSize === 'A4' ? '28pt' : '20pt' }}>
              RETURN INVOICE
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              Satış İade Faturası
            </Typography>
          </Box>
          <Box sx={{ 
            textAlign: 'right',
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            p: 1.5,
            borderRadius: 2,
          }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: paperSize === 'A4' ? '14pt' : '11pt' }}>
              #{fatura.faturaNo}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {formatDate(fatura.tarih)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: paperSize === 'A4' ? 4 : 2 }}>
        {/* Müşteri Bilgileri */}
        <Box sx={{ 
          mb: 3, 
          p: 2,
          border: '1px solid #fecaca',
          borderRadius: 2,
          bgcolor: '#fef2f2',
        }}>
          <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
            İade Edilen
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1, mb: 0.5 }}>
            {fatura.cari.unvan}
          </Typography>
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <strong>Müşteri Kodu:</strong> {fatura.cari.cariKodu}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              {fatura.cari.telefon && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Telefon:</strong> {fatura.cari.telefon}
                </Typography>
              )}
              {fatura.cari.adres && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Adres:</strong> {fatura.cari.adres}
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>

        {/* Ürün Tablosu */}
        <TableContainer sx={{ 
          mb: 2,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
        }}>
          <Table size="small" sx={{ 
            '& td, & th': { fontSize: 'inherit', border: 'none', py: 1 },
            minWidth: { xs: '600px', sm: 'auto' },
          }}>
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid #ef4444' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#ef4444' }}>ÜRÜN</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#ef4444' }}>ADET</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#ef4444' }}>FİYAT</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#ef4444' }}>TOPLAM</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fatura.kalemler.map((kalem, index) => (
                <TableRow key={kalem.id} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{kalem.stok.stokAdi}</Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>{kalem.stok.stokKodu} • KDV %{kalem.kdvOrani}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{kalem.miktar}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{formatMoney(kalem.birimFiyat)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatMoney(kalem.tutar + kalem.kdvTutar)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Toplamlar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Box sx={{ 
            width: paperSize === 'A4' ? '280px' : '200px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            p: 2,
            borderRadius: 2,
          }}>
            <Stack spacing={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '9pt' }}>Ara Toplam</Typography>
                <Typography sx={{ fontSize: '9pt' }}>{formatMoney(fatura.toplamTutar)}</Typography>
              </Stack>
              {fatura.iskonto > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '9pt' }}>İskonto</Typography>
                  <Typography sx={{ fontSize: '9pt' }}>-{formatMoney(fatura.iskonto)}</Typography>
                </Stack>
              )}
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '9pt' }}>KDV</Typography>
                <Typography sx={{ fontSize: '9pt' }}>{formatMoney(fatura.kdvTutar)}</Typography>
              </Stack>
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 'bold', fontSize: '10pt', textTransform: 'uppercase', letterSpacing: 1 }}>
                  İade Toplamı
                </Typography>
                <Typography sx={{ fontWeight: 'bold', fontSize: '10pt' }}>
                  {formatMoney(fatura.genelToplam)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Açıklama */}
        {fatura.aciklama && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Notlar
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: '#666' }}>
              {fatura.aciklama}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        p: 2,
        bgcolor: '#fef2f2',
        borderTop: '1px solid #fecaca',
      }}>
        <Typography variant="caption" align="center" display="block" sx={{ color: '#999' }}>
          Bu belge satış iade faturası bilgi amaçlı hazırlanmıştır.
        </Typography>
      </Box>
    </Paper>
  );
}

