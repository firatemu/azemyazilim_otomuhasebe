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

export default function FaturaPrintPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
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

      // Fetch company settings
      try {
        const settingsRes = await axios.get('/tenants/settings');
        setCompanyInfo(settingsRes.data);
      } catch (err) {
        console.error('Firma bilgileri yüklenemedi:', err);
      }
    } catch (error) {
      console.error('Fatura yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Fatura-${fatura?.faturaNo}`,
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
        allowTaint: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: paperSize === 'A5-landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: paperSize === 'A4' ? 'a4' : 'a5',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Çok sayfalı PDF'de sayfa sonu/başı boşluk (mm)
      const marginTop = 12;
      const marginBottom = 12;
      const contentHeight = pdfHeight - marginTop - marginBottom;

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height / canvas.width) * pdfWidth;
      const numPages = Math.ceil(imgHeight / contentHeight) || 1;

      for (let i = 0; i < numPages; i++) {
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, marginTop - i * contentHeight, imgWidth, imgHeight);
      }

      pdf.save(`Fatura-${fatura?.faturaNo}.pdf`);
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
      p: { xs: 1, sm: 2, md: 2 },
      overflowX: 'auto',
      width: '100%',
      maxWidth: '100vw',
    }}>
      {/* Kontrol Paneli */}
      <Paper sx={{
        p: { xs: 1, sm: 2 },
        mb: 2,
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
              Fatura Önizleme - {companyInfo?.companyName || 'Firma'}
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
              sx={{ bgcolor: '#191970', '&:hover': { bgcolor: '#0f0f40' } }}
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
            <ClassicTemplate fatura={fatura} companyInfo={companyInfo} paperSize={paperSize} formatDate={formatDate} formatMoney={formatMoney} />
          ) : (
            <ModernTemplate fatura={fatura} companyInfo={companyInfo} paperSize={paperSize} formatDate={formatDate} formatMoney={formatMoney} />
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

// Klasik Şablon - Kağıt her zaman içerik yüksekliğinde, footer normal akışta (taşma olmasın)
function ClassicTemplate({
  fatura,
  companyInfo,
  paperSize,
  formatDate,
  formatMoney,
}: {
  fatura: Fatura;
  companyInfo: any;
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
        minHeight: height,
        height: 'auto',
        overflow: 'visible',
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
      <Box sx={{ borderBottom: '3px solid #191970', pb: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={2} alignItems="center">
            {companyInfo?.logoUrl && (
              <img
                src={companyInfo.logoUrl}
                alt="Logo"
                style={{
                  height: paperSize === 'A4' ? '80px' : '60px',
                  maxWidth: '150px',
                  objectFit: 'contain'
                }}
              />
            )}
            <Box>
              <Typography variant="h4" sx={{ color: '#191970', fontWeight: 'bold', fontSize: paperSize === 'A4' ? '18pt' : '14pt', lineHeight: 1.2 }}>
                {companyInfo?.companyName || 'Firma Adı'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5, maxWidth: '300px' }}>
                {companyInfo?.address}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {companyInfo?.phone && `Tel: ${companyInfo.phone}`} {companyInfo?.email && `| E-posta: ${companyInfo.email}`}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" sx={{ color: '#191970', fontWeight: 'bold', fontSize: paperSize === 'A4' ? '18pt' : '14pt' }}>
              SATIŞ FATURASI
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Fatura No:</strong> {fatura.faturaNo}
            </Typography>
            <Typography variant="body2">
              <strong>Tarih:</strong> {formatDate(fatura.tarih)}
            </Typography>
            <Typography variant="body2">
              <strong>Vade:</strong> {formatDate(fatura.vadeTarihi)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Müşteri Bilgileri */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#191970' }}>
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
            <TableRow sx={{ bgcolor: '#191970' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>Ürün Kodu</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '45%' }}>Ürün Adı</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>Miktar</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>Birim Fiyat</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', width: '5%' }}>KDV %</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>Toplam</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fatura.kalemler.map((kalem, index) => (
              <TableRow key={kalem.id} sx={{ '&:nth-of-type(even)': { bgcolor: '#f8f9fa' } }}>
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
          <Stack spacing={0.5} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
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
                GENEL TOPLAM:
              </Typography>
              <Typography sx={{ fontWeight: 'bold', fontSize: '10pt', color: '#191970' }}>
                {formatMoney(fatura.genelToplam)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Açıklama */}
      {fatura.aciklama && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Açıklama:</Typography>
          <Typography variant="body2">{fatura.aciklama}</Typography>
        </Box>
      )}

      {/* Footer her zaman içeriğin sonunda, normal akışta (tabloya taşmaz) */}
      <Box sx={{ mt: 3, pt: 2 }}>
        <Divider sx={{ mb: 1 }} />
        <Typography variant="caption" align="center" display="block" sx={{ color: '#666' }}>
          Bu belge bilgi amaçlı hazırlanmıştır herhangi bir mali değeri yoktur.
        </Typography>
      </Box>
    </Paper>
  );
}

// Modern Şablon - Kağıt her zaman içerik yüksekliğinde, footer normal akışta
function ModernTemplate({
  fatura,
  companyInfo,
  paperSize,
  formatDate,
  formatMoney,
}: {
  fatura: Fatura;
  companyInfo: any;
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
        minHeight: height,
        height: 'auto',
        overflow: 'visible',
        p: 0,
        bgcolor: 'white',
        boxShadow: 3,
        fontSize: { xs: '8pt', sm: fontSize },
        fontFamily: 'Helvetica, sans-serif',
        position: 'relative',
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: paperSize === 'A4' ? 4 : 2,
        pb: paperSize === 'A4' ? 3 : 2,
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={2} alignItems="center">
            {companyInfo?.logoUrl && (
              <Box
                component="img"
                src={companyInfo.logoUrl}
                alt="Logo"
                sx={{
                  height: paperSize === 'A4' ? '70px' : '50px',
                  maxWidth: '120px',
                  filter: 'brightness(0) invert(1)',
                  objectFit: 'contain'
                }}
              />
            )}
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 300, mb: 0.5, fontSize: paperSize === 'A4' ? '24pt' : '18pt' }}>
                {companyInfo?.companyName || 'INVOICE'}
              </Typography>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                {companyInfo?.address}
              </Typography>
            </Box>
          </Stack>
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
        {/* Müşteri Bilgileri - Modern Card */}
        <Box sx={{
          mb: 3,
          p: 2,
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}>
          <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
            Fatura Edilen
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

        {/* Ürün Tablosu - Minimalist */}
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
              <TableRow sx={{ borderBottom: '2px solid #667eea' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#667eea', width: '60%' }}>ÜRÜN</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#667eea', width: '10%' }}>ADET</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#667eea', width: '15%' }}>FİYAT</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#667eea', width: '15%' }}>TOPLAM</TableCell>
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

        {/* Toplamlar - Modern Card */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Box sx={{
            width: paperSize === 'A4' ? '280px' : '200px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  Toplam
                </Typography>
                <Typography sx={{ fontWeight: 'bold', fontSize: '10pt' }}>
                  {formatMoney(fatura.genelToplam)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Vade Bilgisi */}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1, borderLeft: '4px solid #667eea' }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            <strong>Vade Tarihi:</strong> {formatDate(fatura.vadeTarihi)}
          </Typography>
        </Box>

        {/* Açıklama */}
        {fatura.aciklama && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Notlar
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: '#666' }}>
              {fatura.aciklama}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer her zaman içeriğin sonunda, normal akışta */}
      <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="caption" align="center" display="block" sx={{ color: '#999' }}>
          Bu belge bilgi amaçlı hazırlanmıştır herhangi bir mali değeri yoktur.
        </Typography>
      </Box>
    </Paper>
  );
}

