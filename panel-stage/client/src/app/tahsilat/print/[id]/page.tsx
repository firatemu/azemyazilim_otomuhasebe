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
import { numberToTurkishText } from '@/lib/number-to-text';

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
  kalanBakiye?: number;
}

interface TenantSettings {
  logoUrl?: string;
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNo?: string;
  taxOffice?: string;
  mersisNo?: string;
  tradeRegistryNo?: string;
  website?: string;
}

interface Tenant {
  id: string;
  name: string;
  settings?: TenantSettings;
}

type PaperSize = 'A4' | 'A5' | 'A5-landscape';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatMoney = (amount: number | string) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(Number(amount));

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
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [paperSize, setPaperSize] = useState<PaperSize>('A5');
  const [zoom, setZoom] = useState(100);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tahsilatRes, tenantRes] = await Promise.all([
          axios.get(`/tahsilat/${id}`),
          axios.get('/tenants/current'),
        ]);
        setTahsilat(tahsilatRes.data);
        setTenant(tenantRes.data);
      } catch (error) {
        console.error('Veri alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void fetchData();
    }
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: tahsilat ? `Makbuz-${receiptNo(tahsilat.id)}` : 'Tahsilat-Makbuzu',
  });

  const handleDownloadPDF = async () => {
    if (!printRef.current || !tahsilat) return;

    try {
      setExportLoading(true);
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: paperSize === 'A5-landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: paperSize === 'A4' ? 'a4' : 'a5',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`Makbuz-${receiptNo(tahsilat.id)}.pdf`);
    } catch (error) {
      console.error('PDF oluşturulamadı:', error);
      alert('PDF oluşturulurken bir hata oluştu: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setExportLoading(false);
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
              disabled={exportLoading}
              sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
            >
              {exportLoading ? 'Hazırlanıyor...' : 'PDF İndir'}
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
            tenant={tenant}
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
  tenant,
  paperSize,
  formatDate,
  formatMoney,
}: {
  tahsilat: TahsilatDetail;
  tenant: Tenant | null;
  paperSize: PaperSize;
  formatDate: (date: string) => string;
  formatMoney: (amount: number | string) => string;
}) {
  const isLandscape = paperSize === 'A5-landscape';
  const width = paperSize === 'A4' ? '210mm' : paperSize === 'A5' ? '148mm' : '210mm';
  const height = paperSize === 'A4' ? '297mm' : paperSize === 'A5' ? '210mm' : '148mm';
  const fontSize = paperSize === 'A4' ? '10pt' : isLandscape ? '8.5pt' : '9pt';
  const makbuzNo = receiptNo(tahsilat.id);
  const amountInWords = numberToTurkishText(tahsilat.tutar);

  // Design tokens
  const colors = {
    primary: '#1e293b', // Slate 800
    secondary: '#64748b', // Slate 500
    accent: '#0f172a', // Slate 900
    border: '#e2e8f0', // Slate 200
    bgLight: '#f8fafc', // Slate 50
    bgAmount: 'white',
  };

  // Logo URL construction
  const logoUrl = tenant?.settings?.logoUrl;
  const fullLogoUrl = logoUrl ? (logoUrl.startsWith('http') ? logoUrl : logoUrl) : null;

  return (
    <Paper
      sx={{
        width,
        height,
        p: 0,
        bgcolor: 'white',
        boxShadow: 4,
        fontSize,
        fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        '@media print': {
          boxShadow: 'none',
          p: 0,
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        bgcolor: colors.bgLight,
        p: isLandscape ? 2 : 3,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {fullLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fullLogoUrl}
              alt="Logo"
              style={{ height: isLandscape ? '40px' : '50px', objectFit: 'contain' }}
            />
          ) : (
            <Box sx={{
              width: isLandscape ? 40 : 50,
              height: isLandscape ? 40 : 50,
              bgcolor: colors.accent,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              fontWeight: 'bold',
              fontSize: isLandscape ? '1rem' : '1.2rem'
            }}>
              {tenant?.name?.substring(0, 2).toUpperCase() || 'OM'}
            </Box>
          )}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.primary, lineHeight: 1.2 }}>
              {tenant?.settings?.companyName || tenant?.name || 'Firma Adı'}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.secondary, display: 'block', maxWidth: isLandscape ? '400px' : '300px', fontSize: '0.75rem' }}>
              {tenant?.settings?.address}
            </Typography>
            {(tenant?.settings?.phone || tenant?.settings?.email) && (
              <Typography variant="caption" sx={{ color: colors.secondary, display: 'block', fontSize: '0.7rem' }}>
                {[tenant?.settings?.phone, tenant?.settings?.email].filter(Boolean).join(' • ')}
              </Typography>
            )}
          </Box>
        </Stack>

        <Box sx={{ textAlign: 'right' }}>
          <Typography
            variant={isLandscape ? 'h6' : 'h5'}
            sx={{
              color: colors.accent,
              fontWeight: 800,
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}
          >
            {tahsilat.tip === 'TAHSILAT' ? 'TAHSİLAT MAKBUZU' : 'ÖDEME MAKBUZU'}
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: colors.secondary }}>No: <strong>{makbuzNo}</strong></Typography>
            <Typography variant="caption" sx={{ color: colors.secondary }}> | </Typography>
            <Typography variant="caption" sx={{ color: colors.secondary }}>Tarih: <strong>{formatDate(tahsilat.tarih)}</strong></Typography>
          </Stack>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ p: isLandscape ? 2 : 3, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Info Grid */}
        <Grid container spacing={isLandscape ? 2 : 3} sx={{ mb: isLandscape ? 2 : 4 }}>
          <Grid size={{ xs: 6 }}>
            <Box sx={{
              p: 2,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              height: '100%',
              position: 'relative',
              '&::before': {
                content: '"SAYIN"',
                position: 'absolute',
                top: -10,
                left: 12,
                bgcolor: 'white',
                px: 1,
                fontSize: '0.65rem',
                fontWeight: 700,
                color: colors.secondary,
                letterSpacing: '0.05em'
              }
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.primary, mb: 0.5 }}>
                {tahsilat.cari.unvan}
              </Typography>
              {tahsilat.cari.adres && (
                <Typography variant="body2" sx={{ color: colors.primary, mb: 0.5, fontSize: '0.8rem', opacity: 0.8 }}>
                  {tahsilat.cari.adres}
                </Typography>
              )}
              {tahsilat.cari.vergiNo && (
                <Typography variant="caption" sx={{ color: colors.secondary, fontSize: '0.75rem', display: 'block', mt: 1 }}>
                  <strong>VN:</strong> {tahsilat.cari.vergiNo} <strong>VD:</strong> {tahsilat.cari.vergiDairesi || '-'}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Box sx={{
              p: 2,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              height: '100%',
              bgcolor: colors.bgLight
            }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${colors.border}`, pb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 600 }}>ÖDEME ŞEKLİ</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary }}>{formatOdemeTipi(tahsilat.odemeTipi)}</Typography>
                </Box>
                {(tahsilat.kasa || (tahsilat.fatura && tahsilat.fatura.faturaNo) || tahsilat.kalanBakiye !== undefined) && (
                  <>
                    {tahsilat.kasa && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${colors.border}`, pb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 600 }}>KASA / HESAP</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary }}>{tahsilat.kasa.kasaAdi}</Typography>
                      </Box>
                    )}
                    {tahsilat.fatura && tahsilat.fatura.faturaNo && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 600 }}>İLGİLİ FATURA</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary }}>{tahsilat.fatura.faturaNo}</Typography>
                      </Box>
                    )}
                    {tahsilat.kalanBakiye !== undefined && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px dashed ${colors.border}`, pt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 600 }}>KALAN BAKİYE</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary }}>{formatMoney(tahsilat.kalanBakiye)}</Typography>
                      </Box>
                    )}
                  </>
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Amount Section */}
        <Box sx={{ mb: isLandscape ? 2 : 4 }}>
          <Grid container spacing={0} sx={{ border: `2px solid ${colors.accent}`, borderRadius: 2, overflow: 'hidden' }}>
            <Grid size={{ xs: 8 }} sx={{ p: 2, bgcolor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 700, mb: 0.5, letterSpacing: '0.05em' }}>
                YALNIZ
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: colors.primary, fontStyle: 'italic' }}>
                # {amountInWords} #
              </Typography>
            </Grid>
            <Grid size={{ xs: 4 }} sx={{ bgcolor: colors.bgAmount, color: colors.accent, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
              <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 600, mb: 0.5 }}>
                TOPLAM TUTAR
              </Typography>
              <Typography variant={isLandscape ? 'h5' : 'h4'} sx={{ fontWeight: 800 }}>
                {formatMoney(tahsilat.tutar)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Description */}
        {tahsilat.aciklama && (
          <Box sx={{ mb: isLandscape ? 1 : 4 }}>
            <Typography variant="caption" sx={{ color: colors.secondary, fontWeight: 700, letterSpacing: '0.05em', mb: 0.5, display: 'block' }}>
              AÇIKLAMA / NOTLAR
            </Typography>
            <Box sx={{ p: 1.5, border: `1px solid ${colors.border}`, borderRadius: 2, bgcolor: 'white' }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', color: colors.primary }}>{tahsilat.aciklama}</Typography>
            </Box>
          </Box>
        )}

        {/* Footer / Signatures */}
        <Box sx={{ mt: 'auto', pt: isLandscape ? 1 : 2 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.secondary, mb: isLandscape ? 2 : 4, display: 'block', textTransform: 'uppercase' }}>
                  {tahsilat.tip === 'TAHSILAT' ? 'TAHSİL EDEN' : 'ÖDEME YAPAN'}
                </Typography>
                <Box sx={{ height: isLandscape ? 30 : 50, borderBottom: `1px solid ${colors.secondary}`, width: '70%', mx: 'auto', opacity: 0.3 }} />
                <Typography variant="caption" sx={{ color: colors.secondary, display: 'block', mt: 1, fontSize: '0.65rem' }}>
                  İmza / Kaşe
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.secondary, mb: isLandscape ? 2 : 4, display: 'block', textTransform: 'uppercase' }}>
                  {tahsilat.tip === 'TAHSILAT' ? 'ÖDEME YAPAN' : 'TAHSİL EDEN'}
                </Typography>
                <Box sx={{ height: isLandscape ? 30 : 50, borderBottom: `1px solid ${colors.secondary}`, width: '70%', mx: 'auto', opacity: 0.3 }} />
                <Typography variant="caption" sx={{ color: colors.secondary, display: 'block', mt: 1, fontSize: '0.65rem' }}>
                  İmza
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{
            mt: isLandscape ? 2 : 4,
            pt: 1.5,
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Typography variant="caption" sx={{ color: colors.secondary, fontSize: '0.65rem', opacity: 0.6 }}>
              Bu belge dijital olarak <strong>OTOMUHASEBE</strong> üzerinden oluşturulmuştur.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
