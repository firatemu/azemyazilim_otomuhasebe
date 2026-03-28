'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery,
  Divider,
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  Print,
  PictureAsPdf,
  TableChart,
  TrendingUp,
  TrendingDown,
  Business,
  ContactPage,
  Phone,
  Email,
  LocationOn,
  CreditCard,
  Person,
  Warning,
  Block,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import FaturaOzetDialog from '@/components/Cari/FaturaOzetDialog';

interface CariYetkili {
  id: string;
  adSoyad: string;
  unvan?: string;
  telefon?: string;
  email?: string;
  varsayilan: boolean;
}

interface CariAdres {
  id: string;
  baslik: string;
  tip: 'FATURA' | 'SEVK' | 'DIGER';
  adres: string;
  il?: string;
  ilce?: string;
}

interface CariBanka {
  id: string;
  bankaAdi: string;
  subeAdi?: string;
  iban: string;
  paraBirimi: string;
}

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
  vergiNo?: string;
  vergiDairesi?: string;
  tcKimlikNo?: string;
  isimSoyisim?: string;
  telefon?: string;
  email?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  bakiye: string;
  riskLimiti?: number;
  riskDurumu?: 'NORMAL' | 'RISKLI' | 'BLOKELI' | 'TAKIPTE';
  teminatTutar?: number;
  sektor?: string;
  webSite?: string;
  yetkililer?: CariYetkili[];
  ekAdresler?: CariAdres[];
  tedarikciBankalar?: CariBanka[];
  efaturaPostaKutusu?: string;
  efaturaGondericiBirim?: string;
}

interface Product {
  name: string;
  code: string;
}

interface InvoiceItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: string;
  vatRate: number;
  vatAmount: string;
  amount: string;
  unit?: string;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceType: string;
  date: string;
  totalAmount: string;
  vatAmount: string;
  grandTotal: string;
  currency: string;
  notes?: string;
  status: string;
  items: InvoiceItem[];
}

interface CariHareket {
  id: string;
  tip: 'BORC' | 'ALACAK' | 'DEVIR';
  tutar: string;
  bakiye: string;
  belgeTipi?: string;
  belgeNo?: string;
  tarih: string;
  aciklama: string;
  invoice?: Invoice;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CariDetayPage() {
  const params = useParams();
  const router = useRouter();
  const cariId = params.id as string;

  const [cari, setCari] = useState<Cari | null>(null);
  const [hareketler, setHareketler] = useState<CariHareket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIncele, setOpenIncele] = useState(false);
  const [selectedHareket, setSelectedHareket] = useState<CariHareket | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [tabValue, setTabValue] = useState(0);
  const [openInvoice, setOpenInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');

  useEffect(() => {
    fetchCari();
    fetchHareketler();
  }, [cariId]);

  const fetchCari = async () => {
    try {
      const response = await axios.get(`/account/${cariId}`);
      setCari(response.data);
    } catch (error) {
      console.error('Cari bilgisi alınamadı:', error);
      showSnackbar('Cari bilgisi yüklenemedi', 'error');
    }
  };

  const fetchHareketler = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/account/${cariId}/movements`, {
        params: { limit: 1000 },
      });

      // Backend AccountMovement response: { type, amount, balance, documentNo, date, notes, ... }
      // Frontend CariHareket bekliyor: { tip, tutar, bakiye, belgeNo, tarih, aciklama, ... }
      const raw = response.data?.data ?? response.data ?? [];
      const normalized: CariHareket[] = Array.isArray(raw)
        ? raw.map((m: any) => {
          const backendType = m?.type;
          const tip: CariHareket['tip'] =
            backendType === 'DEBIT' || backendType === 'BORC'
              ? 'BORC'
              : backendType === 'CREDIT' || backendType === 'ALACAK'
                ? 'ALACAK'
                : 'DEVIR';

          return {
            id: String(m?.id ?? Math.random().toString(36).slice(2)),
            tip,
            tutar: m?.amount != null ? String(m.amount) : (m?.tutar != null ? String(m.tutar) : '0'),
            bakiye: m?.balance != null ? String(m.balance) : (m?.bakiye != null ? String(m.bakiye) : '0'),
            belgeNo: m?.documentNo ?? m?.belgeNo,
            tarih: m?.date ?? m?.tarih ?? new Date(0).toISOString(),
            aciklama: m?.notes ?? m?.aciklama ?? '',
            invoice: m?.invoice,
          };
        })
        : [];

      setHareketler(normalized);
    } catch (error) {
      console.error('Hareketler alınamadı:', error);
      showSnackbar('Hareketler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totals = hareketler.reduce(
    (acc, h) => {
      const val = parseFloat(h.tutar);
      if (h.tip === 'BORC') acc.borc += val;
      else if (h.tip === 'ALACAK') acc.alacak += val;
      return acc;
    },
    { borc: 0, alacak: 0 }
  );

  const handleIncele = (hareket: CariHareket) => {
    setSelectedHareket(hareket);
    setOpenIncele(true);
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenInvoice(true);
  };

  const handleExportExcel = async () => {
    try {
      showSnackbar('Excel indiriliyor...', 'info');
      const response = await axios.get(`/account/${cariId}/statement/export/excel`, {
        params: { baslangicTarihi, bitisTarihi },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cari_Ekstre_${cari?.unvan}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Excel başarıyla indirildi', 'success');
    } catch (error) {
      console.error('Excel indirme hatası:', error);
      showSnackbar('Excel indirilirken hata oluştu', 'error');
    }
  };

  const handleExportPdf = async () => {
    try {
      showSnackbar('PDF hazırlanıyor...', 'info');
      const response = await axios.get(`/account/${cariId}/statement/export/pdf`, {
        params: { baslangicTarihi, bitisTarihi },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cari_Ekstre_${cari?.unvan}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('PDF başarıyla indirildi', 'success');
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      showSnackbar('PDF indirilirken hata oluştu', 'error');
    }
  };

  const handlePrint = () => {
    handleExportPdf();
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getTipColor = (tip: string) => {
    switch (tip) {
      case 'BORC': return 'error';
      case 'ALACAK': return 'success';
      case 'DEVIR': return 'default';
      default: return 'default';
    }
  };

  const getTipLabel = (tip: string) => {
    switch (tip) {
      case 'BORC': return 'Borç';
      case 'ALACAK': return 'Alacak';
      case 'DEVIR': return 'Devir';
      default: return tip;
    }
  };

  const getRiskColor = (status?: string) => {
    switch (status) {
      case 'RISKLI': return 'warning';
      case 'BLOKELI': return 'error';
      case 'TAKIPTE': return 'error';
      case 'NORMAL': return 'success';
      default: return 'default';
    }
  };

  const getRiskLabel = (status?: string) => {
    switch (status) {
      case 'RISKLI': return 'Riskli';
      case 'BLOKELI': return 'Blokeli';
      case 'TAKIPTE': return 'Takipte';
      case 'NORMAL': return 'Normal';
      default: return 'Belirsiz';
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mobile movement card component
  const MobileMovementCard = ({ hareket }: { hareket: CariHareket }) => (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        bgcolor: 'var(--card)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body2" fontWeight="700" color="text.secondary">
          {new Date(hareket.tarih).toLocaleDateString('tr-TR')}
        </Typography>
        <Chip
          label={getTipLabel(hareket.tip)}
          color={getTipColor(hareket.tip)}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>
        {hareket.aciklama}
      </Typography>

      {hareket.belgeNo && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Belge No: {hareket.belgeNo}
        </Typography>
      )}

      <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">Tutar:</Typography>
          <Typography variant="body2" fontWeight="700" color={hareket.tip === 'BORC' ? '#ef4444' : '#10b981'}>
            {hareket.tip === 'BORC' ? 'Borç: ' : 'Alacak: '}
            ₺{parseFloat(hareket.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">Bakiye:</Typography>
          <Typography variant="body2" fontWeight="800">
            ₺{parseFloat(hareket.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
      </Box>

      <Button
        fullWidth
        size="small"
        variant="outlined"
        startIcon={<Visibility />}
        onClick={() => handleIncele(hareket)}
        sx={{ mt: 2, textTransform: 'none' }}
      >
        Detayları İncele
      </Button>
    </Paper>
  );

  if (!cari) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header & Hero Section */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/accounts')}
          sx={{ mb: 2, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          Cari Listesine Dön
        </Button>

        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          gap: 3
        }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: isMobile ? '1.5rem' : '1.875rem',
                color: 'var(--foreground)',
                letterSpacing: '-0.03em',
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <Box sx={{ width: 8, height: 32, bgcolor: 'var(--primary)', borderRadius: 'var(--radius-sm)' }} />
              {cari.unvan}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ ml: 2.5, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                {cari.cariKodu}
              </Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'var(--border)' }} />
              <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                {cari.tip === 'ALICI' ? 'Müşteri' : cari.tip === 'SATICI' ? 'Tedarikçi' : 'Müşteri + Tedarikçi'}
              </Typography>
              {cari.riskDurumu && cari.riskDurumu !== 'NORMAL' && (
                <Chip
                  label={getRiskLabel(cari.riskDurumu)}
                  color={getRiskColor(cari.riskDurumu)}
                  size="small"
                  icon={cari.riskDurumu === 'BLOKELI' ? <Block /> : <Warning />}
                  sx={{ ml: 2, fontWeight: 700 }}
                />
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="cari detay tabs">
          <Tab label="Genel Bakış" />
          <Tab label="Hareketler" />
          <Tab label="Profil & İletişim" />
          <Tab label="E-Dönüşüm Bilgileri" />
        </Tabs>
      </Box>

      {/* GENEL BAKIŞ TAB */}
      <TabPanel value={tabValue} index={0}>
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
            <Box sx={{ flex: '1 1 120px', p: 2, borderRight: '1px solid', borderColor: 'divider', minWidth: '140px' }}>
              <Typography variant="caption" fontSize="0.7rem" color="text.secondary" fontWeight={700}>Toplam Borç</Typography>
              <Typography variant="body2" fontSize="0.85rem" fontWeight="700" color="#ef4444">₺{totals.borc.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 120px', p: 2, borderRight: '1px solid', borderColor: 'divider', minWidth: '140px' }}>
              <Typography variant="caption" fontSize="0.7rem" color="text.secondary" fontWeight={700}>Toplam Alacak</Typography>
              <Typography variant="body2" fontSize="0.85rem" fontWeight="700" color="#10b981">₺{totals.alacak.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 120px', p: 2, borderRight: '1px solid', borderColor: 'divider', minWidth: '140px' }}>
              <Typography variant="caption" fontSize="0.7rem" color="text.secondary" fontWeight={700}>Net Bakiye</Typography>
              <Typography variant="body2" fontSize="0.85rem" fontWeight={700} color={totals.borc > totals.alacak ? '#ef4444' : '#10b981'}>
                ₺{Math.abs(totals.borc - totals.alacak).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 120px', p: 2, minWidth: '140px' }}>
              <Typography variant="caption" fontSize="0.7rem" color="text.secondary" fontWeight={700}>Risk Durumu</Typography>
              <Typography variant="body2" fontSize="0.85rem" fontWeight={700}>{getRiskLabel(cari.riskDurumu)}</Typography>
            </Box>
          </Box>
        </Paper>
      </TabPanel>

      {/* HAREKETLER TAB - AI Kurallarına Göre Tasarlanmış */}
      <TabPanel value={tabValue} index={1}>
        {/* Toolbar - Kompakt Filtreler */}
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, p: 2 }}>
            <Box sx={{ flexGrow: 1, minWidth: '8px' }} />

            {/* Tarih Filtreleri */}
            <TextField
              type="date"
              label="Başlangıç"
              value={baslangicTarihi}
              onChange={(e) => setBaslangicTarihi(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            />
            <TextField
              type="date"
              label="Bitiş"
              value={bitisTarihi}
              onChange={(e) => setBitisTarihi(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            />

            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <IconButton size="small" onClick={handleExportExcel} title="Excel'e Aktar" sx={{ border: '1px solid var(--border)', borderRadius: 1 }}>
                <TableChart fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleExportPdf} title="PDF'e Aktar" sx={{ border: '1px solid var(--border)', borderRadius: 1 }}>
                <PictureAsPdf fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handlePrint} title="Yazdır" sx={{ border: '1px solid var(--border)', borderRadius: 1 }}>
                <Print fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Özet Info Bar - Tablo Hemen Üstünde */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, px: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Toplam {hareketler.length} hareket gösteriliyor
          </Typography>
        </Box>

        {/* DataGrid - AI Kurallarına Göre Tasarlanmış */}
        <Paper
          variant="outlined"
          sx={{
            overflow: 'hidden',
            border: 'none'
          }}
        >
          <Box sx={{ height: 650, width: '100%' }}>
            <Table sx={{
              border: 'none',
              '& thead th': {
                bgcolor: '#f8fafc',
                borderBottom: '2px solid #e2e8f0',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              },
              '& tbody tr': {
                '&:hover': { bgcolor: '#f0fdf4' },
                '&:nth-of-type(even)': { bgcolor: '#fafafa' },
              },
              '& tbody td': {
                borderBottom: '1px solid #f1f5f9',
                fontSize: '0.875rem',
              },
            }}>
              <TableHead>
                <TableRow>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Tip</TableCell>
                  <TableCell>Belge No</TableCell>
                  <TableCell align="right">Borç</TableCell>
                  <TableCell align="right">Alacak</TableCell>
                  <TableCell align="right">Bakiye</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : hareketler.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">
                        Henüz hareket kaydı bulunmuyor
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  hareketler.map((hareket) => (
                    <TableRow
                      key={hareket.id}
                      hover
                      onClick={() => hareket.invoice && handleInvoiceClick(hareket.invoice)}
                      sx={{
                        cursor: hareket.invoice ? 'pointer' : 'default',
                        '&:hover': {
                          bgcolor: hareket.invoice ? 'var(--muted) !important' : 'inherit'
                        }
                      }}
                    >
                      <TableCell sx={{ color: 'var(--foreground)' }}>
                        {new Date(hareket.tarih).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getTipLabel(hareket.tip)}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: getTipColor(hareket.tip) === 'error'
                              ? 'rgba(239, 68, 68, 0.1)'
                              : getTipColor(hareket.tip) === 'success'
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(100, 116, 139, 0.1)',
                            color: getTipColor(hareket.tip) === 'error'
                              ? '#ef4444'
                              : getTipColor(hareket.tip) === 'success'
                                ? '#10b981'
                                : '#64748b',
                            borderColor: getTipColor(hareket.tip) === 'error'
                              ? 'rgba(239, 68, 68, 0.3)'
                              : getTipColor(hareket.tip) === 'success'
                                ? 'rgba(16, 185, 129, 0.3)'
                                : 'rgba(100, 116, 139, 0.3)',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {hareket.belgeNo || '-'}
                      </TableCell>
                      <TableCell align="right">
                        {hareket.tip === 'BORC' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, color: '#ef4444' }}>
                            <TrendingUp fontSize="small" />
                            <Typography fontWeight={700} fontSize="0.875rem">
                              ₺{parseFloat(hareket.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </Typography>
                          </Box>
                        ) : <Typography color="text.secondary">-</Typography>}
                      </TableCell>
                      <TableCell align="right">
                        {hareket.tip === 'ALACAK' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, color: '#10b981' }}>
                            <TrendingDown fontSize="small" />
                            <Typography fontWeight={700} fontSize="0.875rem">
                              ₺{parseFloat(hareket.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </Typography>
                          </Box>
                        ) : <Typography color="text.secondary">-</Typography>}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={800} fontSize="0.875rem" sx={{ color: 'var(--foreground)' }}>
                          ₺{parseFloat(hareket.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </TabPanel>

      {/* PROFIL & İLETİŞİM TAB */}
      <TabPanel value={tabValue} index={2}>
        {!cari ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
            {/* Sol Kolon: Temel Bilgiler */}
            <Box>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business fontSize="small" /> Firma Bilgileri
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText primary="Vergi No / Tc" secondary={cari.vergiNo || cari.tcKimlikNo || '-'} />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText primary="Vergi Dairesi" secondary={cari.vergiDairesi || '-'} />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText primary="Sektör" secondary={cari.sektor || '-'} />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText primary="Web Sitesi" secondary={cari.webSite || '-'} />
                  </ListItem>
                </List>
              </Paper>

              <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" /> Adres Bilgileri
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="primary">Merkez Adres</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {cari.adres || '-'} <br /> {cari.ilce || '-'} / {cari.il || '-'}
                </Typography>

                {cari.ekAdresler && cari.ekAdresler.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="primary">Diğer Adresler</Typography>
                    <List dense>
                      {cari.ekAdresler.map(adres => (
                        <ListItem key={adres.id} disablePadding sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}><LocationOn fontSize="small" color="action" /></ListItemIcon>
                          <ListItemText
                            primary={adres.baslik}
                            secondary={`${adres.adres} ${adres.ilce || ''}/${adres.il || ''}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Orta Kolon: İletişim & Yetkililer */}
            <Box>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ContactPage fontSize="small" /> İletişim
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon><Phone fontSize="small" /></ListItemIcon>
                    <ListItemText primary={cari.telefon || '-'} secondary="Telefon" />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon><Email fontSize="small" /></ListItemIcon>
                    <ListItemText primary={cari.email || '-'} secondary="E-posta" />
                  </ListItem>
                </List>
              </Paper>

              {cari.yetkililer && cari.yetkililer.length > 0 && (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" /> Yetkililer
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {cari.yetkililer.map((yetkili) => (
                      <ListItem key={yetkili.id} alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: yetkili.varsayilan ? 'primary.main' : 'grey.400' }}>
                            {yetkili.adSoyad.charAt(0)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2">
                              {yetkili.adSoyad} {yetkili.varsayilan && <Chip label="Varsayılan" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem', ml: 1 }} />}
                            </Typography>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary" display="block">
                                {yetkili.unvan}
                              </Typography>
                              {yetkili.telefon && <Typography component="span" variant="caption" display="block"><Phone fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />{yetkili.telefon}</Typography>}
                              {yetkili.email && <Typography component="span" variant="caption" display="block"><Email fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />{yetkili.email}</Typography>}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>

            {/* Sağ Kolon: Banka Bilgileri */}
            <Box>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCard fontSize="small" /> Banka Hesapları
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {cari.tedarikciBankalar && cari.tedarikciBankalar.length > 0 ? (
                  <List>
                    {cari.tedarikciBankalar.map(banka => (
                      <ListItem key={banka.id} sx={{ px: 0, borderBottom: '1px solid var(--border)' }}>
                        <ListItemText
                          primary={banka.bankaAdi}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="caption" display="block" color="text.primary" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                                {banka.iban}
                              </Typography>
                              <Chip label={banka.paraBirimi} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', mt: 0.5 }} />
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">Kayıtlı banka bilgisi yok.</Typography>
                )}
              </Paper>
            </Box>
          </Box>
        )}
      </TabPanel>

      {/* E-DÖNÜŞÜM BİLGİLERİ TAB */}
      <TabPanel value={tabValue} index={3}>
        {!cari ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Paper variant="outlined" sx={{
              p: 4,
              borderRadius: 'var(--radius-lg)',
              bgcolor: 'var(--card)',
              border: '1px solid var(--border)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Email sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: 'var(--foreground)' }}>
                    E-Fatura Bilgileri
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                    e-Fatura kullanıcıları için posta kutusu ve gönderici birim bilgileri
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Posta Kutusu Etiketi */}
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1.5, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '1.2rem' }}>📮</span> Posta Kutusu Etiketi
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: 'var(--muted-foreground)' }}>
                    e-Fatura adresi (örn: urn:mail:firmaalias@urn.ettn.tr)
                  </Typography>
                  <TextField
                    fullWidth
                    value={cari.efaturaPostaKutusu || ''}
                    placeholder="urn:mail:firmaalias@urn.ettn.tr"
                    disabled
                    size="small"
                    sx={{
                      '& .MuiInputBase-root.Mui-disabled': {
                        bgcolor: 'var(--muted)',
                      },
                    }}
                    helperText="Bu bilgi cari kartı düzenleme ekranından güncellenebilir"
                  />
                </Box>

                {/* Gönderici Birim Etiketi */}
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1.5, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '1.2rem' }}>🏢</span> Gönderici Birim Etiketi
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: 'var(--muted-foreground)' }}>
                    GİB sistemine kayıtlı gönderici birim kodu
                  </Typography>
                  <TextField
                    fullWidth
                    value={cari.efaturaGondericiBirim || ''}
                    placeholder="Örn: 1234567890"
                    disabled
                    size="small"
                    sx={{
                      '& .MuiInputBase-root.Mui-disabled': {
                        bgcolor: 'var(--muted)',
                      },
                    }}
                    helperText="Bu bilgi cari kartı düzenleme ekranından güncellenebilir"
                  />
                </Box>

                {/* Bilgi Kutusu */}
                <Alert severity="info" sx={{
                  borderRadius: 'var(--radius-md)',
                  bgcolor: 'color-mix(in srgb, var(--info) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--info) 20%, transparent)',
                }}>
                  <Typography variant="body2" fontWeight="500">
                    Bu bilgileri düzenlemek için cari kartı düzenleme ekranını kullanın.
                  </Typography>
                </Alert>
              </Box>
            </Paper>
          </Box>
        )}
      </TabPanel>

      {/* İncele Dialog */}
      <Dialog open={openIncele} onClose={() => setOpenIncele(false)} maxWidth="sm" fullWidth>
        <DialogTitle component="div">Hareket Detayı</DialogTitle>
        <DialogContent>
          {selectedHareket && (
            <List>
              <ListItem>
                <ListItemText primary="Tarih" secondary={new Date(selectedHareket.tarih).toLocaleDateString()} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Tip" secondary={getTipLabel(selectedHareket.tip)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Tutar" secondary={`₺${parseFloat(selectedHareket.tutar).toLocaleString()}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Açıklama" secondary={selectedHareket.aciklama} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Belge No" secondary={selectedHareket.belgeNo || '-'} />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIncele(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <FaturaOzetDialog
        open={openInvoice}
        onClose={() => setOpenInvoice(false)}
        invoice={selectedInvoice}
      />
    </MainLayout>
  );
}