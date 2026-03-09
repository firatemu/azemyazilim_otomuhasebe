'use client';

import axios from '@/lib/axios';
import { Close, PictureAsPdf, Print, ZoomIn, ZoomOut } from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

interface Siparis {
  id: string;
  siparisNo: string;
  siparisTarihi: string;
  durum: string;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  aciklama?: string;
  vade?: string;
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

export default function SiparisPrintPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [siparis, setSiparis] = useState<Siparis | null>(null);
  const [loading, setLoading] = useState(true);
  const [paperSize, setPaperSize] = useState<'A4' | 'A5' | 'A5-landscape'>('A4');
  const [template, setTemplate] = useState<'classic' | 'modern'>('classic');
  const [zoom, setZoom] = useState(100);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSiparis();
  }, [id]);

  const fetchSiparis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/satin-alma-siparisi/${id}`);
      setSiparis(response.data);
    } catch (error) {
      console.error('Sipariş yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Sipariş-${siparis?.siparisNo}`,
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
      pdf.save(`Sipariş-${siparis?.siparisNo}.pdf`);
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
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">Satın Alma Siparişi Önizleme</Typography>

            <ButtonGroup size="small">
              <Button
                variant={paperSize === 'A4' ? 'contained' : 'outlined'}
                onClick={() => setPaperSize('A4')}
              >
                A4
              </Button>
              <Button
                variant={paperSize === 'A5' ? 'contained' : 'outlined'}
                onClick={() => setPaperSize('A5')}
              >
                A5 ⬍
              </Button>
              <Button
                variant={paperSize === 'A5-landscape' ? 'contained' : 'outlined'}
                onClick={() => setPaperSize('A5-landscape')}
              >
                A5 ⬌
              </Button>
            </ButtonGroup>

            <ButtonGroup size="small">
              <Button
                variant={template === 'classic' ? 'contained' : 'outlined'}
                onClick={() => setTemplate('classic')}
              >
                Klasik
              </Button>
              <Button
                variant={template === 'modern' ? 'contained' : 'outlined'}
                onClick={() => setTemplate('modern')}
              >
                Modern
              </Button>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem />

            <Tooltip title="Yakınlaştır">
              <IconButton size="small" onClick={() => setZoom(z => Math.min(z + 10, 150))}>
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Typography variant="body2">{zoom}%</Typography>
            <Tooltip title="Uzaklaştır">
              <IconButton size="small" onClick={() => setZoom(z => Math.max(z - 10, 50))}>
                <ZoomOut />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrint}
              sx={{ bgcolor: '#06b6d4', '&:hover': { bgcolor: '#0891b2' } }}
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

      {/* Sipariş Önizleme */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s',
      }}>
        <div ref={printRef}>
          {template === 'classic' ? (
            <ClassicTemplate siparis={siparis} paperSize={paperSize} formatDate={formatDate} formatMoney={formatMoney} />
          ) : (
            <ModernTemplate siparis={siparis} paperSize={paperSize} formatDate={formatDate} formatMoney={formatMoney} />
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
  siparis,
  paperSize,
  formatDate,
  formatMoney
}: {
  siparis: Siparis;
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
        width,
        height,
        p: paperSize === 'A4' ? 4 : 2,
        bgcolor: 'white',
        boxShadow: 3,
        fontSize,
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        '@media print': {
          boxShadow: 'none',
          p: paperSize === 'A4' ? 3 : 1.5,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ borderBottom: '3px solid #06b6d4', pb: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" sx={{ color: '#06b6d4', fontWeight: 'bold', fontSize: paperSize === 'A4' ? '24pt' : '18pt' }}>
              YEDEK PARÇA
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
              Otomasyon Sistemi
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" sx={{ color: '#06b6d4', fontWeight: 'bold', fontSize: paperSize === 'A4' ? '18pt' : '14pt' }}>
              SATIN ALMA SİPARİŞİ
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Sipariş No:</strong> {siparis.siparisNo}
            </Typography>
            <Typography variant="body2">
              <strong>Tarih:</strong> {formatDate(siparis.siparisTarihi)}
            </Typography>
            {siparis.vade && (
              <Typography variant="body2">
                <strong>Vade:</strong> {formatDate(siparis.vade)}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Tedarikçi Bilgileri */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#06b6d4' }}>
          TEDARİKÇİ BİLGİLERİ
        </Typography>
        <Stack direction="row" spacing={3}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2"><strong>Tedarikçi Kodu:</strong> {siparis.cari.cariKodu}</Typography>
            <Typography variant="body2"><strong>Ünvan:</strong> {siparis.cari.unvan}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            {siparis.cari.telefon && (
              <Typography variant="body2"><strong>Telefon:</strong> {siparis.cari.telefon}</Typography>
            )}
            {siparis.cari.adres && (
              <Typography variant="body2"><strong>Adres:</strong> {siparis.cari.adres}</Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Ürün Tablosu */}
      <TableContainer sx={{ mb: 2 }}>
        <Table size="small" sx={{ '& td, & th': { fontSize: 'inherit', py: 0.5 } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#06b6d4' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ürün Kodu</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ürün Adı</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Miktar</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Birim Fiyat</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>KDV %</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Toplam</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {siparis.kalemler.map((kalem, index) => (
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
              <Typography sx={{ fontSize: '9pt' }}>{formatMoney(siparis.toplamTutar)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '9pt' }}>KDV:</Typography>
              <Typography sx={{ fontSize: '9pt' }}>{formatMoney(siparis.kdvTutar)}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontWeight: 'bold', fontSize: '10pt' }}>
                GENEL TOPLAM:
              </Typography>
              <Typography sx={{ fontWeight: 'bold', fontSize: '10pt', color: '#06b6d4' }}>
                {formatMoney(siparis.genelToplam)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ position: 'absolute', bottom: paperSize === 'A4' ? 30 : 15, left: paperSize === 'A4' ? 30 : 15, right: paperSize === 'A4' ? 30 : 15 }}>
        <Divider sx={{ mb: 1 }} />
        <Typography variant="caption" align="center" display="block" sx={{ color: '#666' }}>
          Bu belge bilgi amaçlı hazırlanmıştır herhangi bir mali değeri yoktur.
        </Typography>
      </Box>
    </Paper>
  );
}

// Modern Şablon
function ModernTemplate({
  siparis,
  paperSize,
  formatDate,
  formatMoney
}: {
  siparis: Siparis;
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
        width,
        height,
        p: 0,
        bgcolor: 'white',
        boxShadow: 3,
        fontSize,
        fontFamily: 'Helvetica, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        '@media print': {
          boxShadow: 'none',
        },
      }}
    >
      {/* Modern Header with Gradient */}
      <Box sx={{
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        color: 'white',
        p: paperSize === 'A4' ? 4 : 2,
        pb: paperSize === 'A4' ? 3 : 2,
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 300, mb: 0.5, fontSize: paperSize === 'A4' ? '28pt' : '20pt' }}>
              SATIN ALMA SİPARİŞİ
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              Yedek Parça Otomasyon
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
              #{siparis.siparisNo}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {formatDate(siparis.siparisTarihi)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: paperSize === 'A4' ? 4 : 2 }}>
        {/* Tedarikçi Bilgileri - Modern Card */}
        <Box sx={{
          mb: 3,
          p: 2,
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}>
          <Typography variant="caption" sx={{ color: '#06b6d4', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
            Sipariş Edilen
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1, mb: 0.5 }}>
            {siparis.cari.unvan}
          </Typography>
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <strong>Tedarikçi Kodu:</strong> {siparis.cari.cariKodu}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              {siparis.cari.telefon && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Telefon:</strong> {siparis.cari.telefon}
                </Typography>
              )}
              {siparis.cari.adres && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Adres:</strong> {siparis.cari.adres}
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>

        {/* Ürün Tablosu - Minimalist */}
        <TableContainer sx={{ mb: 2 }}>
          <Table size="small" sx={{ '& td, & th': { fontSize: 'inherit', border: 'none', py: 1 } }}>
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid #06b6d4' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#06b6d4' }}>ÜRÜN</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#06b6d4' }}>ADET</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#06b6d4' }}>FİYAT</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#06b6d4' }}>TOPLAM</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {siparis.kalemler.map((kalem, index) => (
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
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            color: 'white',
            p: 2,
            borderRadius: 2,
          }}>
            <Stack spacing={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '9pt' }}>Ara Toplam</Typography>
                <Typography sx={{ fontSize: '9pt' }}>{formatMoney(siparis.toplamTutar)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '9pt' }}>KDV</Typography>
                <Typography sx={{ fontSize: '9pt' }}>{formatMoney(siparis.kdvTutar)}</Typography>
              </Stack>
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 'bold', fontSize: '10pt', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Toplam
                </Typography>
                <Typography sx={{ fontWeight: 'bold', fontSize: '10pt' }}>
                  {formatMoney(siparis.genelToplam)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Modern Footer */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        bgcolor: '#f8f9fa',
        borderTop: '1px solid #e0e0e0',
      }}>
        <Typography variant="caption" align="center" display="block" sx={{ color: '#999' }}>
          Bu belge bilgi amaçlı hazırlanmıştır herhangi bir mali değeri yoktur.
        </Typography>
      </Box>
    </Paper>
  );
}

