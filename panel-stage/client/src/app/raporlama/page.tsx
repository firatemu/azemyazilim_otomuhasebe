'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Assessment,
  Autorenew,
  Event,
  Inventory2,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from '@mui/icons-material';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface FinancialSummary {
  totalSales: number;
  totalSalesCount: number;
  totalSalesReturns: number;
  totalPurchases: number;
  totalPurchaseCount: number;
  totalPurchaseReturns: number;
  grossProfit: number;
  collections: number;
  collectionsCount: number;
  payments: number;
  paymentsCount: number;
  expenses: number;
  expensesCount: number;
  netCashFlow: number;
}

interface SalespersonPerformance {
  satisElemaniId: string;
  adSoyad: string;
  toplamSatis: number;
  satisAdedi: number;
  toplamTahsilat: number;
  tahsilatAdedi: number;
}

interface OverviewResponse {
  range: {
    startDate: string;
    endDate: string;
    preset: string;
  };
  financialSummary: FinancialSummary;
  receivables: {
    total: number;
    overdue: number;
  };
  payables: {
    total: number;
    overdue: number;
  };
  topCustomers: Array<{
    cariId: string;
    cariKodu: string;
    unvan: string;
    toplamTutar: number;
    faturaAdedi: number;
  }>;
  topProducts: Array<{
    stokId: string;
    stokKodu: string;
    stokAdi: string;
    birim: string;
    toplamTutar: number;
    toplamMiktar: number;
    satilanKalemSayisi: number;
  }>;
  lowStockItems: Array<{
    stokId: string;
    stokKodu: string;
    stokAdi: string;
    birim: string;
    miktar: number;
    kritikStokMiktari: number;
    acik: number;
  }>;
  salespersonPerformance?: SalespersonPerformance[];
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'decimal',
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value || 0);
const formatNumber = (value: number) => numberFormatter.format(value || 0);

const formatDateLabel = (input: string) =>
  new Date(input).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatDateTimeLabel = (input: string) =>
  new Date(input).toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatTimeLabel = (input: string) =>
  new Date(input).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

type PresetKey = 'today' | 'last7' | 'last30' | 'thisMonth' | 'custom';

const presetOptions: Array<{ value: PresetKey; label: string }> = [
  { value: 'today', label: 'Bugün' },
  { value: 'last7', label: 'Son 7 Gün' },
  { value: 'last30', label: 'Son 30 Gün' },
  { value: 'thisMonth', label: 'Bu Ay' },
  { value: 'custom', label: 'Özel Tarih Aralığı' },
];

export default function RaporlamaPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [preset, setPreset] = useState<PresetKey>('last30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isApplyingCustom, setIsApplyingCustom] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const fetchOverview = useCallback(
    async (options?: { showLoader?: boolean; preset?: PresetKey; startDate?: string; endDate?: string }) => {
      try {
        if (options?.showLoader !== false) {
          setLoading(true);
        }
        setError(null);

        const selectedPreset = options?.preset ?? preset;
        const start = options?.startDate ?? customStart;
        const end = options?.endDate ?? customEnd;

        const params: Record<string, string> = { preset: selectedPreset };

        if (selectedPreset === 'custom') {
          if (!start || !end) {
            setError('Özel tarih aralığı için başlangıç ve bitiş tarihlerini seçiniz.');
            return;
          }
          params.startDate = start;
          params.endDate = end;
        }

        const response = await axios.get<OverviewResponse>('/raporlama/overview', {
          params,
        });
        setData(response.data);
        setLastUpdated(new Date().toISOString());
      } catch (err: any) {
        console.error('Raporlama verisi alınamadı:', err);
        setError(err?.response?.data?.message || 'Raporlama verisi alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
        setIsApplyingCustom(false);
      }
    },
    [preset, customStart, customEnd],
  );

  useEffect(() => {
    if (preset === 'custom') {
      return;
    }
    fetchOverview({ showLoader: true, preset });
  }, [fetchOverview, preset]);

  const handleExportPdf = useCallback(async () => {
    if (!reportRef.current) {
      return;
    }

    try {
      setExportingPdf(true);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * pageWidth) / canvas.width;

      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imageWidth, imageHeight, '', 'FAST');

      let heightLeft = imageHeight - pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imageWidth, imageHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      pdf.save(`raporlama-${timestamp}.pdf`);
    } catch (err: any) {
      console.error('PDF oluşturulamadı:', err);
      setError(err?.message || 'PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setExportingPdf(false);
    }
  }, [reportRef, setError]);

  const summaryCards = useMemo(() => {
    if (!data) {
      return [];
    }

    const items = [
      {
        title: 'Net Satış',
        value: data.financialSummary.totalSales,
        subtitle: `${formatNumber(data.financialSummary.totalSalesCount)} fatura | İade: ${formatCurrency(data.financialSummary.totalSalesReturns)}`,
        icon: <TrendingUp sx={{ color: 'var(--chart-1)' }} />,
        color: 'var(--chart-1)',
      },
      {
        title: 'Net Satın Alma',
        value: data.financialSummary.totalPurchases,
        subtitle: `${formatNumber(data.financialSummary.totalPurchaseCount)} fatura | İade: ${formatCurrency(data.financialSummary.totalPurchaseReturns)}`,
        icon: <TrendingDown sx={{ color: 'var(--destructive)' }} />,
        color: 'var(--destructive)',
      },
      {
        title: 'Tahsilatlar',
        value: data.financialSummary.collections,
        subtitle: `${formatNumber(data.financialSummary.collectionsCount)} işlem`,
        icon: <ShoppingCart sx={{ color: 'var(--secondary)' }} />,
        color: 'var(--secondary)',
      },
      {
        title: 'Ödemeler',
        value: data.financialSummary.payments,
        subtitle: `${formatNumber(data.financialSummary.paymentsCount)} işlem`,
        icon: <TrendingDown sx={{ color: 'var(--primary)' }} />,
        color: 'var(--primary)',
      },
      {
        title: 'Masraflar',
        value: data.financialSummary.expenses,
        subtitle: `${formatNumber(data.financialSummary.expensesCount)} kayıt`,
        icon: <Inventory2 sx={{ color: 'var(--muted-foreground)' }} />,
        color: 'var(--muted-foreground)',
      },
      {
        title: 'Net Nakit Akışı',
        value: data.financialSummary.netCashFlow,
        subtitle:
          data.financialSummary.netCashFlow >= 0
            ? 'Pozitif nakit akışı'
            : 'Negatif nakit akışı',
        icon: <Assessment sx={{ color: data.financialSummary.netCashFlow >= 0 ? 'var(--chart-2)' : 'var(--destructive)' }} />,
        color: data.financialSummary.netCashFlow >= 0 ? 'var(--chart-2)' : 'var(--destructive)',
      },
    ];

    return items;
  }, [data]);

  const receivableCoverage = useMemo(() => {
    if (!data || data.receivables.total <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          ((data.receivables.total - data.receivables.overdue) / data.receivables.total) * 100,
        ),
      ),
    );
  }, [data]);

  const payableCoverage = useMemo(() => {
    if (!data || data.payables.total <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          ((data.payables.total - data.payables.overdue) / data.payables.total) * 100,
        ),
      ),
    );
  }, [data]);

  const renderSummarySkeleton = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, md: 6, lg: 4 }}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Skeleton variant="text" height={28} width="60%" />
            <Skeleton variant="text" height={42} width="50%" sx={{ mt: 1 }} />
            <Skeleton variant="rectangular" height={40} sx={{ mt: 2, borderRadius: 1 }} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <MainLayout>
      <Box ref={reportRef}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📈 Raporlama ve Analiz
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Finansal performans, kasa akışı ve stok durumunu tek ekran üzerinden izleyin.
            </Typography>
            {data && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Tarih aralığı: {formatDateLabel(data.range.startDate)} - {formatDateLabel(data.range.endDate)}
              </Typography>
            )}
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            data-html2canvas-ignore="true"
          >
            {lastUpdated && (
              <Tooltip title={`Son güncelleme: ${formatDateTimeLabel(lastUpdated)}`}>
                <Chip label={`Son Güncelleme: ${formatTimeLabel(lastUpdated)}`} size="small" color="info" />
              </Tooltip>
            )}
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPdf}
              disabled={exportingPdf || loading || !data}
              sx={{ textTransform: 'none' }}
            >
              {exportingPdf ? 'PDF Oluşturuluyor...' : 'PDF İndir'}
            </Button>
            <IconButton
              onClick={() => fetchOverview({ showLoader: true, preset, startDate: customStart, endDate: customEnd })}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : <Autorenew />}
            </IconButton>
          </Stack>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <Box sx={{ minWidth: 220 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Tarih aralığı
              </Typography>
              <TextField
                select
                fullWidth
                value={preset}
                size="small"
                onChange={(event) => {
                  const nextPreset = event.target.value as PresetKey;
                  setPreset(nextPreset);
                  if (nextPreset !== 'custom') {
                    setCustomStart('');
                    setCustomEnd('');
                  }
                }}
              >
                {presetOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {preset === 'custom' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flex={1}>
                <TextField
                  label="Başlangıç"
                  type="date"
                  size="small"
                  value={customStart}
                  InputLabelProps={{ shrink: true }}
                  onChange={(event) => setCustomStart(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Bitiş"
                  type="date"
                  size="small"
                  value={customEnd}
                  InputLabelProps={{ shrink: true }}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  startIcon={<Event />}
                  onClick={() => {
                    setIsApplyingCustom(true);
                    fetchOverview({ preset: 'custom', startDate: customStart, endDate: customEnd });
                  }}
                  disabled={loading || isApplyingCustom}
                  sx={{ minWidth: 160 }}
                >
                  {isApplyingCustom ? 'Uygulanıyor...' : 'Filtreyi Uygula'}
                </Button>
              </Stack>
            )}
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {loading && !data ? (
          renderSummarySkeleton()
        ) : (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {summaryCards.map((card) => (
              <Grid key={card.title} size={{ xs: 12, md: 6, lg: 4 }}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: `color-mix(in srgb, ${card.color} 15%, transparent)`,
                    height: '100%',
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 1,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {card.title}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                        {formatCurrency(card.value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {card.subtitle}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {data && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Cari Alacak Durumu
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Toplam alacaklar ve vadesi geçmiş tutarlar
                </Typography>

                <Stack spacing={1.5}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">Toplam Alacak</Typography>
                      <Chip label={formatCurrency(data.receivables.total)} size="small" color="primary" />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={receivableCoverage}
                      sx={{ mt: 1, borderRadius: 2, height: 8 }}
                      color={receivableCoverage < 60 ? 'warning' : 'primary'}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Vadesi geçmiş: {formatCurrency(data.receivables.overdue)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">Toplam Borç</Typography>
                      <Chip label={formatCurrency(data.payables.total)} size="small" color="secondary" />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={payableCoverage}
                      sx={{ mt: 1, borderRadius: 2, height: 8 }}
                      color={payableCoverage < 60 ? 'warning' : 'secondary'}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Vadesi geçmiş: {formatCurrency(data.payables.overdue)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Öne Çıkan Metrikler
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Finansal performansı etkileyen öne çıkan değerler
                </Typography>

                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2">Tahsilat / Ödeme Dengesi</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tahsilatların ödemelere oranı
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        data.financialSummary.payments > 0
                          ? `${Math.round(
                            (data.financialSummary.collections /
                              data.financialSummary.payments) *
                            100,
                          )}%`
                          : '—'
                      }
                      size="small"
                      color="success"
                    />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2">Nakit Akışı</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tahsilat ve ödemeler arasındaki fark
                      </Typography>
                    </Box>
                    <Chip
                      label={formatCurrency(data.financialSummary.netCashFlow)}
                      size="small"
                      color={data.financialSummary.netCashFlow >= 0 ? 'success' : 'error'}
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {data && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  En Çok Satış Yapılan Cariler
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Belirlenen tarih aralığında satış hacmine göre ilk 5 cari
                </Typography>

                {data.topCustomers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Kayıt bulunamadı.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Cari</TableCell>
                          <TableCell align="right">Fatura Adedi</TableCell>
                          <TableCell align="right">Satış Tutarı</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.topCustomers.map((customer) => (
                          <TableRow key={customer.cariId} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {customer.unvan}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {customer.cariKodu}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{formatNumber(customer.faturaAdedi)}</TableCell>
                            <TableCell align="right">{formatCurrency(customer.toplamTutar)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  En Çok Satılan Ürünler
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Satış tutarına göre ilk 5 ürün
                </Typography>

                {data.topProducts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Kayıt bulunamadı.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Ürün</TableCell>
                          <TableCell align="right">Satış Miktarı</TableCell>
                          <TableCell align="right">Ciro</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.topProducts.map((product) => (
                          <TableRow key={product.stokId} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {product.stokAdi}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {product.stokKodu}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {formatNumber(product.toplamMiktar)} {product.birim}
                            </TableCell>
                            <TableCell align="right">{formatCurrency(product.toplamTutar)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Satış Elemanı Performansı
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Satış elemanlarının toplam satış ve tahsilat performansları
                </Typography>

                {!data.salespersonPerformance || data.salespersonPerformance.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Kayıt bulunamadı.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Satış Elemanı</TableCell>
                          <TableCell align="right">Satış Adedi</TableCell>
                          <TableCell align="right">Toplam Satış</TableCell>
                          <TableCell align="right">Tahsilat Adedi</TableCell>
                          <TableCell align="right">Toplam Tahsilat</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.salespersonPerformance.map((item) => (
                          <TableRow key={item.satisElemaniId} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {item.adSoyad}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{formatNumber(item.satisAdedi)}</TableCell>
                            <TableCell align="right">{formatCurrency(item.toplamSatis)}</TableCell>
                            <TableCell align="right">{formatNumber(item.tahsilatAdedi)}</TableCell>
                            <TableCell align="right">{formatCurrency(item.toplamTahsilat)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Kritik Stok Uyarıları
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Kritik stok seviyesinin altındaki ürünler
                </Typography>

                {data.lowStockItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Kritik stok seviyesinin altında ürün bulunmuyor.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {data.lowStockItems.map((item) => {
                      const progress = item.kritikStokMiktari > 0
                        ? Math.min(100, Math.max(0, Math.round((item.miktar / item.kritikStokMiktari) * 100)))
                        : 0;

                      return (
                        <Card key={item.stokId} variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {item.stokAdi}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {item.stokKodu}
                                </Typography>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Stok Seviyesi
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={progress}
                                  sx={{ mt: 0.5, borderRadius: 2, height: 8 }}
                                  color={progress < 40 ? 'error' : progress < 70 ? 'warning' : 'success'}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  Mevcut: {formatNumber(item.miktar)} {item.birim} • Kritik: {formatNumber(item.kritikStokMiktari)} {item.birim}
                                </Typography>
                              </Box>
                              <Chip
                                icon={<Inventory2 />}
                                label={`Açık: ${formatNumber(Math.max(0, item.acik))} ${item.birim}`}
                                color={item.acik > 0 ? 'error' : 'success'}
                              />
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </MainLayout>
  );
}
