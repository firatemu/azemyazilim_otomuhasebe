'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import { Print, Close, PictureAsPdf, ZoomIn, ZoomOut } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import axios from '@/lib/axios';

interface TahsilatDetail {
  id: string;
  tip: 'TAHSILAT' | 'ODEME';
  tutar: number;
  tarih: string;
  odemeTipi: 'NAKIT' | 'KREDI_KARTI' | string;
  aciklama?: string | null;
  createdAt?: string | null;
  cari: {
    cariKodu: string;
    unvan: string;
    adres?: string | null;
    telefon?: string | null;
    vergiNo?: string | null;
    vergiDairesi?: string | null;
  };
  kasa?: {
    kasaKodu: string;
    kasaAdi: string;
    kasaTipi: string;
  } | null;
  fatura?: {
    faturaNo: string | null;
  } | null;
}

type PaperSize = 'A4' | 'A5' | 'A5-landscape';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);

const formatOdemeTipi = (tip: string) => {
  const map: Record<string, string> = {
    NAKIT: 'Nakit',
    KREDI_KARTI: 'Kredi Kartı',
    BANKA_HAVALESI: 'Banka Havalesi',
    CEK: 'Çek',
    SENET: 'Senet',
  };
  return map[tip] || tip;
};

export default function TahsilatPrintPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tahsilat, setTahsilat] = useState<TahsilatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paperSize, setPaperSize] = useState<PaperSize>('A5');
  const [zoom, setZoom] = useState(100);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTahsilat = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/tahsilat/${id}`);
        setTahsilat(response.data);
      } catch (error) {
        console.error('Tahsilat kaydı alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void fetchTahsilat();
    }
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: tahsilat ? `Makbuz-${receiptNo(tahsilat.id)}` : 'Tahsilat-Makbuzu',
  });

  const handleDownloadPDF = async () => {
    if (!printRef.current || !tahsilat) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(printRef.current, {
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
      pdf.save(`Makbuz-${receiptNo(tahsilat.id)}.pdf`);
    } catch (error) {
      console.error('PDF oluşturulamadı:', error);
      alert('PDF oluşturulurken bir hata oluştu');
    }
  };

  if (loading || !tahsilat) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Typography variant="h6">
              {tahsilat.tip === 'TAHSILAT' ? 'Tahsilat Makbuzu' : 'Ödeme Makbuzu'}
            </Typography>
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
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Yakınlaştır">
                <IconButton size="small" onClick={() => setZoom((z) => Math.min(z + 10, 160))}>
                  <ZoomIn />
                </IconButton>
              </Tooltip>
              <Typography variant="body2">{zoom}%</Typography>
              <Tooltip title="Uzaklaştır">
                <IconButton size="small" onClick={() => setZoom((z) => Math.max(z - 10, 50))}>
                  <ZoomOut />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrint}
              sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
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

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s',
        }}
      >
        <div ref={printRef}>
          <ReceiptTemplate
            tahsilat={tahsilat}
            paperSize={paperSize}
            formatDate={formatDate}
            formatMoney={formatMoney}
          />
        </div>
      </Box>

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

function receiptNo(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function ReceiptTemplate({
  tahsilat,
  paperSize,
  formatDate,
  formatMoney,
}: {
  tahsilat: TahsilatDetail;
  paperSize: PaperSize;
  formatDate: (date: string) => string;
  formatMoney: (amount: number) => string;
}) {
  const width = paperSize === 'A4' ? '210mm' : paperSize === 'A5' ? '148mm' : '210mm';
  const height = paperSize === 'A4' ? '297mm' : paperSize === 'A5' ? '210mm' : '148mm';
  const fontSize = paperSize === 'A4' ? '11pt' : '9pt';
  const makbuzNo = receiptNo(tahsilat.id);

  return (
    <Paper
      sx={{
        width,
        height,
        p: paperSize === 'A4' ? 4 : 2,
        bgcolor: 'white',
        boxShadow: 4,
        fontSize,
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        '@media print': {
          boxShadow: 'none',
          p: paperSize === 'A4' ? 3 : 1.5,
        },
      }}
    >
      <Box sx={{ borderBottom: '3px solid #0f172a', pb: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: '#0f172a',
                fontWeight: 'bold',
                fontSize: paperSize === 'A4' ? '24pt' : '18pt',
              }}
            >
              YEDEK PARÇA
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
              Otomasyon Sistemi
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant="h5"
              sx={{
                color: '#0f172a',
                fontWeight: 'bold',
                fontSize: paperSize === 'A4' ? '18pt' : '14pt',
              }}
            >
              {tahsilat.tip === 'TAHSILAT' ? 'TAHSİLAT MAKBUZU' : 'ÖDEME MAKBUZU'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Makbuz No:</strong> {makbuzNo}
            </Typography>
            <Typography variant="body2">
              <strong>Tarih:</strong> {formatDate(tahsilat.tarih)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 1 }}>
              CARİ BİLGİLERİ
            </Typography>
            <Typography variant="body2">
              <strong>Cari Kodu:</strong> {tahsilat.cari.cariKodu}
            </Typography>
            <Typography variant="body2">
              <strong>Ünvan:</strong> {tahsilat.cari.unvan}
            </Typography>
            {tahsilat.cari.vergiNo && (
              <Typography variant="body2">
                <strong>Vergi No:</strong> {tahsilat.cari.vergiNo} ({tahsilat.cari.vergiDairesi || '-'})
              </Typography>
            )}
            {tahsilat.cari.telefon && (
              <Typography variant="body2">
                <strong>Telefon:</strong> {tahsilat.cari.telefon}
              </Typography>
            )}
            {tahsilat.cari.adres && (
              <Typography variant="body2">
                <strong>Adres:</strong> {tahsilat.cari.adres}
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 1 }}>
              MAKBUZ BİLGİLERİ
            </Typography>
            <Typography variant="body2">
              <strong>Makbuz Tipi:</strong> {tahsilat.tip === 'TAHSILAT' ? 'Tahsilat' : 'Ödeme'}
            </Typography>
            <Typography variant="body2">
              <strong>Ödeme Şekli:</strong> {formatOdemeTipi(tahsilat.odemeTipi)}
            </Typography>
            {tahsilat.kasa && (
              <Typography variant="body2">
                <strong>Kasa:</strong> {tahsilat.kasa.kasaAdi} ({tahsilat.kasa.kasaKodu})
              </Typography>
            )}
            {tahsilat.fatura && tahsilat.fatura.faturaNo && (
              <Typography variant="body2">
                <strong>İlgili Fatura:</strong> {tahsilat.fatura.faturaNo}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Paper
          variant="outlined"
          sx={{
            bgcolor: '#0f172a',
            color: 'white',
            p: 2,
            borderRadius: 2,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems="center">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Tahsil Edilen Tutar
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatMoney(tahsilat.tutar)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Yazı ile
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {formatMoney(tahsilat.tutar)} ({formatOdemeTipi(tahsilat.odemeTipi)})
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {tahsilat.aciklama && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 1 }}>
            Açıklama
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2">{tahsilat.aciklama}</Typography>
          </Paper>
        </Box>
      )}

      <Grid container spacing={4} sx={{ mt: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 1 }}>
            Teslim Eden
          </Typography>
          <Paper variant="outlined" sx={{ p: 3, minHeight: '100px' }}>
            <Typography variant="body2" color="text.secondary">
              İmza / Kaşe
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 1 }}>
            Teslim Alan
          </Typography>
          <Paper variant="outlined" sx={{ p: 3, minHeight: '100px' }}>
            <Typography variant="body2" color="text.secondary">
              İmza / Kaşe
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}

