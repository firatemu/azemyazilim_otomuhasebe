'use client';

import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Autocomplete,
  InputAdornment,
  Stack,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Skeleton,
  Drawer,
  Fab,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add,
  Delete,
  AccountBalance,
  CreditCard,
  Payments,
  TrendingDown,
  TrendingUp,
  AttachMoney,
  Print,
  SwapHoriz,
  Close,
  Info,
  Visibility,
  ExpandMore,
  FilterList,
  Download,
  PictureAsPdf,
  Search,
  TableRows,
  ViewCompact,
  CloudUpload,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMediaQuery, useTheme } from '@mui/material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import CaprazOdemeDialog from './components/CaprazOdemeDialog';
import TahsilatFormDialog from './components/TahsilatFormDialog';
import { TahsilatFormData, CaprazOdemeFormData, Cari, Kasa, BankaHesap, SatisElemani } from './types';



interface Tahsilat {
  id: string;
  tip: 'COLLECTION' | 'PAYMENT';
  tutar: number;
  tarih: string;
  odemeTipi: 'NAKIT' | 'KREDI_KARTI';
  aciklama?: string;
  createdAt?: string; // Sıralama için
  cari: {
    cariKodu: string;
    unvan: string;
  };
  kasa: {
    kasaKodu: string;
    kasaAdi: string;
    kasaTipi: string;
  } | null;
  bankaHesap?: {
    id: string;
    hesapAdi: string;
    bankaAdi: string;
  } | null;
  firmaKrediKarti?: {
    id: string;
    kartAdi: string;
    bankaAdi: string;
    kartTipi: string;
  } | null;
}

const EMPTY_STATS = {
  toplamTahsilat: 0,
  toplamOdeme: 0,
  aylikTahsilat: 0,
  aylikOdeme: 0,
  nakitTahsilat: 0,
  krediKartiTahsilat: 0,
};


// Kasa Detay Component
interface KasaDetayContentProps {
  kasaId: string;
}

const KasaDetayContent: React.FC<KasaDetayContentProps> = ({ kasaId }) => {
  const { data: kasaDetay, isLoading: kasaDetayLoading } = useQuery({
    queryKey: ['kasa', kasaId],
    queryFn: async () => {
      const response = await axios.get(`/kasa/${kasaId}`);
      return response.data;
    },
    enabled: !!kasaId,
  });

  const { data: tahsilatlar, isLoading: tahsilatLoading } = useQuery<Tahsilat[]>({
    queryKey: ['tahsilat', 'kasa', kasaId],
    queryFn: async () => {
      const response = await axios.get('/collection', {
        params: {
          page: 1,
          limit: 1000,
          kasaId: kasaId,
        },
      });
      return response.data?.data ?? [];
    },
    enabled: !!kasaId,
  });

  if (kasaDetayLoading) {
    return <Box sx={{ p: 3, textAlign: 'center' }}>Yükleniyor...</Box>;
  }

  if (!kasaDetay) {
    return <Box sx={{ p: 3, textAlign: 'center' }}>Kasa bulunamadı</Box>;
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Kasa Bilgileri */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Kasa Bilgileri
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Kasa Adı
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {kasaDetay.kasaAdi}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Kasa Tipi
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {kasaDetay.kasaTipi}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Bakiye
            </Typography>
            <Typography variant="body1" fontWeight={600} color="primary">
              {formatMoney(Number(kasaDetay.bakiye) || 0)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Alt Hesaplar */}
      {(kasaDetay.bankaHesaplari?.length > 0 || kasaDetay.firmaKrediKartlari?.length > 0) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Alt Hesaplar
          </Typography>

          {/* Banka Hesapları */}
          {kasaDetay.bankaHesaplari?.length > 0 && (
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Banka Hesapları ({kasaDetay.bankaHesaplari.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {kasaDetay.bankaHesaplari.map((hesap: any) => (
                  <Paper key={hesap.id} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {hesap.hesapAdi}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hesap.bankaAdi}
                    </Typography>
                    <BankaHesapHareketleri bankaHesapId={hesap.id} />
                  </Paper>
                ))}
              </AccordionDetails>
            </Accordion>
          )}

          {/* Firma Kredi Kartları */}
          {kasaDetay.firmaKrediKartlari?.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Firma Kredi Kartları ({kasaDetay.firmaKrediKartlari.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {kasaDetay.firmaKrediKartlari.map((kart: any) => (
                  <Paper key={kart.id} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {kart.kartAdi}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {kart.bankaAdi} - {kart.kartTipi}
                    </Typography>
                    <FirmaKrediKartiHareketleri firmaKrediKartiId={kart.id} />
                  </Paper>
                ))}
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      )}
    </Box>
  );
};

// Banka Hesap Hareketleri Component
interface BankaHesapHareketleriProps {
  bankaHesapId: string;
}

const BankaHesapHareketleri: React.FC<BankaHesapHareketleriProps> = ({ bankaHesapId }) => {
  const { data: hareketler, isLoading } = useQuery<Tahsilat[]>({
    queryKey: ['tahsilat', 'bankaHesap', bankaHesapId],
    queryFn: async () => {
      const response = await axios.get('/collection', {
        params: {
          page: 1,
          limit: 1000,
          bankaHesapId: bankaHesapId,
        },
      });
      return response.data?.data ?? [];
    },
    enabled: !!bankaHesapId,
  });

  if (isLoading) {
    return <Typography variant="body2">Yükleniyor...</Typography>;
  }

  if (!hareketler || hareketler.length === 0) {
    return <Typography variant="body2" color="text.secondary">Hareket bulunamadı</Typography>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        Hareketler ({hareketler.length})
      </Typography>
      <DataGrid
        rows={hareketler}
        columns={[
          {
            field: 'tarih',
            headerName: 'Tarih',
            width: 120,
            renderCell: (params: any) => (
              <Typography variant="body2">
                {new Date(params.value).toLocaleDateString('tr-TR')}
              </Typography>
            ),
          },
          {
            field: 'cari',
            headerName: 'Cari',
            width: 200,
            renderCell: (params: any) => (
              <Typography variant="body2">
                {params.row.cari?.unvan || '-'}
              </Typography>
            ),
          },
          {
            field: 'tip',
            headerName: 'Tip',
            width: 120,
            renderCell: (params: any) => (
              <Chip
                label={params.value === 'COLLECTION' ? 'Tahsilat' : 'Ödeme'}
                color={params.value === 'COLLECTION' ? 'success' : 'error'}
                size="small"
              />
            ),
          },
          {
            field: 'tutar',
            headerName: 'Tutar',
            width: 150,
            renderCell: (params: any) => (
              <Typography variant="body2" fontWeight={500}>
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                }).format(params.value || 0)}
              </Typography>
            ),
          },
        ]}
        autoHeight
        hideFooter
      />
    </Box>
  );
};

// Firma Kredi Kartı Hareketleri Component
interface FirmaKrediKartiHareketleriProps {
  firmaKrediKartiId: string;
}

const FirmaKrediKartiHareketleri: React.FC<FirmaKrediKartiHareketleriProps> = ({ firmaKrediKartiId }) => {
  const { data: hareketler, isLoading } = useQuery<Tahsilat[]>({
    queryKey: ['tahsilat', 'firmaKrediKarti', firmaKrediKartiId],
    queryFn: async () => {
      const response = await axios.get('/collection', {
        params: {
          page: 1,
          limit: 1000,
          firmaKrediKartiId: firmaKrediKartiId,
        },
      });
      return response.data?.data ?? [];
    },
    enabled: !!firmaKrediKartiId,
  });

  if (isLoading) {
    return <Typography variant="body2">Yükleniyor...</Typography>;
  }

  if (!hareketler || hareketler.length === 0) {
    return <Typography variant="body2" color="text.secondary">Hareket bulunamadı</Typography>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        Hareketler ({hareketler.length})
      </Typography>
      <DataGrid
        rows={hareketler}
        columns={[
          {
            field: 'tarih',
            headerName: 'Tarih',
            width: 120,
            renderCell: (params: any) => (
              <Typography variant="body2">
                {new Date(params.value).toLocaleDateString('tr-TR')}
              </Typography>
            ),
          },
          {
            field: 'cari',
            headerName: 'Cari',
            width: 200,
            renderCell: (params: any) => (
              <Typography variant="body2">
                {params.row.cari?.unvan || '-'}
              </Typography>
            ),
          },
          {
            field: 'tip',
            headerName: 'Tip',
            width: 120,
            renderCell: (params: any) => (
              <Chip
                label={params.value === 'COLLECTION' ? 'Tahsilat' : 'Ödeme'}
                color={params.value === 'COLLECTION' ? 'success' : 'error'}
                size="small"
              />
            ),
          },
          {
            field: 'tutar',
            headerName: 'Tutar',
            width: 150,
            renderCell: (params: any) => (
              <Typography variant="body2" fontWeight={500}>
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                }).format(params.value || 0)}
              </Typography>
            ),
          },
        ]}
        autoHeight
        hideFooter
      />
    </Box>
  );
};


const DataGridNoRowsOverlay = () => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'text.secondary',
      py: 8,
      gap: 2,
    }}
  >
    <Payments sx={{ fontSize: 80, opacity: 0.3 }} />
    <Typography variant="h6" fontWeight={600} sx={{
      background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>
      Kayıt Bulunamadı
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Seçili filtrelere uygun tahsilat/ödeme kaydı bulunmuyor
    </Typography>
  </Box>
);

export default function TahsilatPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('xl'));

  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [openCaprazOdemeDialog, setOpenCaprazOdemeDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTahsilat, setSelectedTahsilat] = useState<Tahsilat | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [activeTab, setActiveTab] = useState(0); // 0: Tahsilat, 1: Ödeme
  const [searchQuery, setSearchQuery] = useState(''); // Global arama
  const [denseMode, setDenseMode] = useState(false); // Compact görünüm
  const [actionLoading, setActionLoading] = useState(false);

  const [openKasaDetayDialog, setOpenKasaDetayDialog] = useState(false);
  const [selectedKasa, setSelectedKasa] = useState<any>(null);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [chartTab, setChartTab] = useState(0); // 0: Ödeme Tipi, 1: Kasa Dağılımı
  const [trendPeriod, setTrendPeriod] = useState<string>('WEEKLY'); // WEEKLY, MONTHLY

  // Mobil Pagination State
  const [mobilePage, setMobilePage] = useState(1);

  // Tarih filtresi state
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [quickFilter, setQuickFilter] = useState<string>('TÜMÜ'); // TÜMÜ, BUGÜN, BU_HAFTA, BU_AY, BU_YIL

  // Filtre değiştiğinde mobil sayfayı başa al
  useEffect(() => {
    setMobilePage(1);
  }, [dateRange, quickFilter, activeTab, searchQuery]);

  const openDeleteConfirmation = useCallback((row: Tahsilat) => {
    setSelectedTahsilat(row);
    setOpenDeleteDialog(true);
  }, []);

  const handleViewDetail = useCallback((id: string) => {
    router.push(`/tahsilat/${id}`);
  }, [router]);

  // Tarih aralığı hesaplama fonksiyonu
  const getDateRange = useCallback((filter: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'BUGÜN': {
        const start = new Date(today);
        const end = new Date(today);
        end.setHours(23, 59, 59, 999);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      case 'BU_HAFTA': {
        const start = new Date(today);
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Pazartesi
        start.setDate(diff);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      case 'BU_AY': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      case 'BU_YIL': {
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31);
        end.setHours(23, 59, 59, 999);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      default:
        return { start: '', end: '' };
    }
  }, []);

  // Hızlı filtre değiştiğinde tarih aralığını güncelle
  useEffect(() => {
    if (quickFilter !== 'TÜMÜ') {
      const range = getDateRange(quickFilter);
      setDateRange(range);
    } else {
      setDateRange({ start: '', end: '' });
    }
  }, [quickFilter, getDateRange]);

  const { data: tahsilatData = [], isLoading: tahsilatLoading, isFetching: tahsilatFetching } = useQuery<Tahsilat[]>({
    queryKey: ['tahsilat', 'list', dateRange.start, dateRange.end, activeTab],
    queryFn: async () => {
      const params: any = {
        page: 1,
        limit: 1000,
      };

      if (activeTab === 0) {
        params.tip = 'COLLECTION';
      } else if (activeTab === 1) {
        params.tip = 'PAYMENT';
      }

      if (dateRange.start) {
        params.baslangicTarihi = dateRange.start;
      }
      if (dateRange.end) {
        params.bitisTarihi = dateRange.end;
      }

      const response = await axios.get('/collection', { params });
      return response.data?.data ?? [];
    },
  });

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();

      if (activeTab === 0) {
        params.append('tip', 'COLLECTION');
      } else if (activeTab === 1) {
        params.append('tip', 'PAYMENT');
      }

      if (dateRange.start) {
        params.append('baslangicTarihi', dateRange.start);
      }
      if (dateRange.end) {
        params.append('bitisTarihi', dateRange.end);
      }

      const response = await axios.get(`/tahsilat/export/excel?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tahsilat_Raporu_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSnackbar('Excel raporu başarıyla indirildi', 'success');
    } catch (error) {
      console.error('Excel export hatası:', error);
      showSnackbar('Excel raporu indirilemedi', 'error');
    }
  };

  const handleExportPdf = async () => {
    try {
      const params = new URLSearchParams();

      if (activeTab === 0) {
        params.append('tip', 'COLLECTION');
      } else if (activeTab === 1) {
        params.append('tip', 'PAYMENT');
      }

      if (dateRange.start) {
        params.append('baslangicTarihi', dateRange.start);
      }
      if (dateRange.end) {
        params.append('bitisTarihi', dateRange.end);
      }

      const response = await axios.get(`/tahsilat/export/pdf?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tahsilat_Raporu_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSnackbar('PDF raporu başarıyla indirildi', 'success');
    } catch (error) {
      console.error('PDF export hatası:', error);
      showSnackbar('PDF raporu indirilemedi', 'error');
    }
  };

  const { data: stats = EMPTY_STATS, isFetching: statsFetching } = useQuery<typeof EMPTY_STATS>({
    queryKey: ['tahsilat', 'stats'],
    queryFn: async () => {
      const response = await axios.get('/collection/stats');
      return response.data ?? EMPTY_STATS;
    },
    initialData: EMPTY_STATS,
  });

  const {
    data: cariler = [],
    isFetching: carilerFetching,
    error: carilerError,
  } = useQuery<Cari[]>({
    queryKey: ['cari', 'tahsilat'],
    queryFn: async () => {
      try {
        const response = await axios.get('/account', { params: { limit: 1000 } });
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        console.error('Cariler yüklenirken hata:', error);
        throw error;
      }
    },
    enabled: openDialog || openCaprazOdemeDialog,
    staleTime: 5 * 60 * 1000, // 5 dakika cache (sonsuz döngüyü önlemek için)
    refetchOnMount: false, // Dialog açıldığında refetch yapma (cache kullan)
    refetchOnWindowFocus: false, // Window focus olduğunda refetch yapma
    retry: 2, // Hata durumunda 2 kez daha dene
  });

  const {
    data: bankaHesaplari = [],
    isFetching: bankaHesaplariLoading,
  } = useQuery<any[]>({
    queryKey: ['banka', 'hesaplar', 'tahsilat'],
    queryFn: async () => {
      const response = await axios.get('/bank/ozet');
      // response.data.bankalar içinden tüm hesapları çıkar
      const hesaplar: any[] = [];
      response.data.bankalar?.forEach((banka: any) => {
        banka.hesaplar?.forEach((hesap: any) => {
          hesaplar.push({
            ...hesap,
            bankaAdi: banka.ad || banka.bankaAdi || 'Banka Adı Yok',
            bankaId: banka.id,
          });
        });
      });
      return hesaplar;
    },
    enabled: openDialog || openCaprazOdemeDialog,
  });

  const {
    data: kasalar = [],
    isFetching: kasalarFetching,
  } = useQuery<Kasa[]>({
    queryKey: ['kasa', 'tahsilat'],
    queryFn: async () => {
      const response = await axios.get('/cashbox', { params: { aktif: true } });
      return response.data ?? [];
    },
    enabled: openDialog || openCaprazOdemeDialog,
  });

  const {
    data: satisElemanlari = [],
    isFetching: satisElemanlariLoading,
  } = useQuery<any[]>({
    queryKey: ['satis-elemani', 'tahsilat'],
    queryFn: async () => {
      const response = await axios.get('/sales-agent');
      return response.data ?? [];
    },
    enabled: openDialog,
  });


  // ✅ ÇÖZÜM: initialFormData - Parent'ta sadece initial değerleri tut
  const [initialFormData, setInitialFormData] = useState({
    cariId: '',
    satisElemaniId: '',
    tip: 'COLLECTION' as 'COLLECTION' | 'PAYMENT',
    tutar: '' as string | number,
    tarih: new Date().toISOString().split('T')[0],
    odemeTipi: 'NAKIT' as 'NAKIT' | 'KREDI_KARTI',
    kasaId: '',
    bankaHesapId: '',
    aciklama: '',
    kartSahibi: '',
    kartSonDort: '',
    bankaAdi: '',
    firmaKrediKartiId: '',
  });

  const [caprazOdemeFormData, setCaprazOdemeFormData] = useState<CaprazOdemeFormData>({
    tahsilatCariId: '',
    odemeCariId: '',
    tutar: 0,
    tarih: new Date().toISOString().split('T')[0],
    aciklama: '',
  });

  const showSnackbar = useCallback(
    (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const handleOpenDialog = useCallback((tip: 'COLLECTION' | 'PAYMENT') => {
    // ✅ ÇÖZÜM: initialFormData'yı set et, dialog kendi local state'ini kullanacak
    setInitialFormData({
      cariId: '',
      satisElemaniId: '',
      tip,
      tutar: 0,
      tarih: new Date().toISOString().split('T')[0],
      odemeTipi: 'NAKIT',
      kasaId: '',
      bankaHesapId: '',
      aciklama: '',
      kartSahibi: '',
      kartSonDort: '',
      bankaAdi: '',
      firmaKrediKartiId: '',
    });
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedTahsilat(null);
  }, []);

  const handleQuickFilter = useCallback((filter: string) => {
    setQuickFilter(filter);
    const today = new Date();

    switch (filter) {
      case 'BUGÜN':
        const todayStr = today.toISOString().split('T')[0];
        setDateRange({ start: todayStr, end: todayStr });
        break;
      case 'BU_HAFTA':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        setDateRange({
          start: weekStart.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        });
        break;
      case 'BU_AY':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({
          start: monthStart.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        });
        break;
      case 'BU_YIL':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        setDateRange({
          start: yearStart.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        });
        break;
      case 'TÜMÜ':
      default:
        setDateRange({ start: '', end: '' });
        break;
    }
  }, []);

  // ✅ ÇÖZÜM: handleSubmit - Dialog'dan gelen veriyi al ve kaydet
  const handleSubmit = useCallback(
    async (submitFormData: any) => {
      try {
        if (!submitFormData.cariId || submitFormData.tutar <= 0) {
          showSnackbar('Lütfen tüm gerekli alanları doldurun', 'warning');
          return;
        }

        // Kasa veya POS Banka Hesabı seçimi kontrolü
        if (submitFormData.odemeTipi === 'CREDIT_CARD' && submitFormData.tip === 'COLLECTION') {
          // POS tahsilat için banka hesabı zorunlu
          if (!submitFormData.bankaHesapId) {
            showSnackbar('POS banka hesabı seçimi zorunludur', 'warning');
            return;
          }
        } else {
          // Diğer durumlar için kasa zorunlu
          if (!submitFormData.kasaId) {
            showSnackbar('Kasa seçimi zorunludur', 'warning');
            return;
          }
        }

        setActionLoading(true);

        const dataToSend: any = {
          cariId: submitFormData.cariId,
          satisElemaniId: submitFormData.satisElemaniId || null,
          tip: submitFormData.tip,
          tutar: Number(submitFormData.tutar),
          tarih: submitFormData.tarih,
          odemeTipi: submitFormData.odemeTipi,
          kasaId: submitFormData.kasaId,
          aciklama: submitFormData.aciklama,
        };

        // Firma kredi kartı ID'si gönderilir (ödeme için)
        if (submitFormData.firmaKrediKartiId) {
          dataToSend.firmaKrediKartiId = submitFormData.firmaKrediKartiId;
        }

        // Banka hesabı ID'si gönderilir (POS tahsilat için)
        if (submitFormData.bankaHesapId) {
          dataToSend.bankaHesapId = submitFormData.bankaHesapId;
        }

        // Kart bilgileri sadece tahsilat için gönderilir (POS ile müşteriden alırken)
        // Ödeme için (Firma Kredi Kartı) kart bilgileri kasa içinde zaten var, göndermeye gerek yok
        if (submitFormData.odemeTipi === 'CREDIT_CARD' && submitFormData.tip === 'COLLECTION') {
          dataToSend.kartSahibi = submitFormData.kartSahibi;
          dataToSend.kartSonDort = submitFormData.kartSonDort;
          dataToSend.bankaAdi = submitFormData.bankaAdi;
        }

        await axios.post('/collection', dataToSend);
        showSnackbar(
          `${submitFormData.tip === 'COLLECTION' ? 'Tahsilat' : 'Ödeme'} başarıyla kaydedildi`,
          'success',
        );
        handleCloseDialog();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['tahsilat', 'list'] }),
          queryClient.invalidateQueries({ queryKey: ['tahsilat', 'stats'] }),
          queryClient.invalidateQueries({ queryKey: ['cari', 'tahsilat'] }),
          queryClient.invalidateQueries({ queryKey: ['kasa', 'tahsilat'] }),
        ]);
      } catch (error: any) {
        showSnackbar(error?.response?.data?.message || 'İşlem başarısız', 'error');
      } finally {
        setActionLoading(false);
      }
    },
    [handleCloseDialog, queryClient, showSnackbar],
  );

  const handleDelete = useCallback(async () => {
    if (!selectedTahsilat) return;

    try {
      setActionLoading(true);
      await axios.delete(`/tahsilat/${selectedTahsilat.id}`);
      showSnackbar('Kayıt silindi', 'success');
      setOpenDeleteDialog(false);
      setSelectedTahsilat(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tahsilat', 'list'] }),
        queryClient.invalidateQueries({ queryKey: ['tahsilat', 'stats'] }),
        queryClient.invalidateQueries({ queryKey: ['cari', 'tahsilat'] }),
        queryClient.invalidateQueries({ queryKey: ['kasa', 'tahsilat'] }),
      ]);
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Silme başarısız', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [queryClient, selectedTahsilat, showSnackbar]);

  const handleCaprazOdeme = useCallback(async () => {
    try {
      if (!caprazOdemeFormData.tahsilatCariId) {
        showSnackbar('Tahsilat cari seçilmelidir', 'error');
        return;
      }

      if (!caprazOdemeFormData.odemeCariId) {
        showSnackbar('Ödeme cari seçilmelidir', 'error');
        return;
      }

      if (caprazOdemeFormData.tahsilatCariId === caprazOdemeFormData.odemeCariId) {
        showSnackbar('Tahsilat ve ödeme carileri farklı olmalıdır', 'error');
        return;
      }

      const tutarNum = typeof caprazOdemeFormData.tutar === 'string' ? parseFloat(caprazOdemeFormData.tutar) : caprazOdemeFormData.tutar;
      if (!tutarNum || tutarNum <= 0) {
        showSnackbar('Tutar 0\'dan büyük olmalıdır', 'error');
        return;
      }

      // Kasa seçimi çapraz ödemede opsiyonel (para kasaya girmez)
      // if (!caprazOdemeFormData.kasaId) {
      //   showSnackbar('Kasa seçilmelidir', 'error');
      //   return;
      // }

      setActionLoading(true);

      const tahsilatCari = cariler.find(c => c.id === caprazOdemeFormData.tahsilatCariId);
      const odemeCari = cariler.find(c => c.id === caprazOdemeFormData.odemeCariId);

      await axios.post('/collection/capraz-odeme', {
        tahsilatCariId: caprazOdemeFormData.tahsilatCariId,
        odemeCariId: caprazOdemeFormData.odemeCariId,
        tutar: caprazOdemeFormData.tutar,
        tarih: caprazOdemeFormData.tarih,
        // odemeTipi ve kasaId gönderilmez - Çapraz ödemede para kasaya girmez
        aciklama: caprazOdemeFormData.aciklama || `Çapraz ödeme: ${tahsilatCari?.unvan || ''} -> ${odemeCari?.unvan || ''}`,
      });

      showSnackbar('Çapraz ödeme tahsilat başarıyla oluşturuldu', 'success');
      setOpenCaprazOdemeDialog(false);

      setCaprazOdemeFormData({
        tahsilatCariId: '',
        odemeCariId: '',
        tutar: 0,
        tarih: new Date().toISOString().split('T')[0],
        aciklama: '',
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tahsilat', 'list'] }),
        queryClient.invalidateQueries({ queryKey: ['tahsilat', 'stats'] }),
        queryClient.invalidateQueries({ queryKey: ['cari', 'tahsilat'] }),
        queryClient.invalidateQueries({ queryKey: ['kasa', 'tahsilat'] }),
      ]);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Çapraz ödeme tahsilat oluşturulurken hata oluştu', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [caprazOdemeFormData, cariler, queryClient, showSnackbar]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  }, []);

  const getOdemeTipiLabel = useCallback((tip: string) => {
    const labels: Record<string, string> = {
      NAKIT: 'Nakit',
      KREDI_KARTI: 'Kredi Kartı',
      BANKA_HAVALESI: 'Banka Havalesi',
      CEK: 'Çek',
      SENET: 'Senet',
    };
    return labels[tip] || tip;
  }, []);

  const getOdemeTipiIcon = useCallback((tip: string) => {
    switch (tip) {
      case 'NAKIT':
        return <AttachMoney fontSize="small" />;
      case 'KREDI_KARTI':
        return <CreditCard fontSize="small" />;
      case 'BANKA_HAVALESI':
        return <AccountBalance fontSize="small" />;
      default:
        return <Payments fontSize="small" />;
    }
  }, []);

  // ✅ En son eklenen en üstte - DESC sıralama + Global arama
  const filteredTahsilatlar = useMemo<Tahsilat[]>(() => {
    return tahsilatData
      .filter((t) => (activeTab === 0 ? t.tip === 'COLLECTION' : t.tip === 'PAYMENT'))
      .filter((t) => {
        // Global arama filtresi
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase().trim();

        // Aranacak alanlar
        const cariUnvan = t.cari?.unvan?.toLowerCase() || '';
        const cariKodu = t.cari?.cariKodu?.toLowerCase() || '';
        const tutar = t.tutar?.toString() || '';
        const aciklama = t.aciklama?.toLowerCase() || '';
        const kasaAdi = t.kasa?.kasaAdi?.toLowerCase() || '';
        const bankaHesapAdi = t.bankaHesap?.hesapAdi?.toLowerCase() || '';
        const firmaKrediKartiAdi = t.firmaKrediKarti?.kartAdi?.toLowerCase() || '';

        return (
          cariUnvan.includes(query) ||
          cariKodu.includes(query) ||
          tutar.includes(query) ||
          aciklama.includes(query) ||
          kasaAdi.includes(query) ||
          bankaHesapAdi.includes(query) ||
          firmaKrediKartiAdi.includes(query)
        );
      })
      .sort((a, b) => {
        // Önce tarihe göre DESC (en yeni tarih en üstte)
        const dateCompare = new Date(b.tarih).getTime() - new Date(a.tarih).getTime();
        if (dateCompare !== 0) return dateCompare;

        // Aynı tarihteyse createdAt'e göre DESC (en son eklenen en üstte)
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        // createdAt yoksa id'ye göre DESC (UUID'ler timestamp içerir)
        return b.id.localeCompare(a.id);
      });
  }, [tahsilatData, activeTab, searchQuery]);

  // Grafik Verisi Hazırlama
  const chartData = useMemo(() => {
    if (!filteredTahsilatlar.length) return { pie: [], kasa: [], trend: [] };

    const typeMap = new Map();
    const kasaMap = new Map();
    const dateMap = new Map();

    filteredTahsilatlar.forEach((item) => {
      // Pie Data - Ödeme Tipi
      const type = item.odemeTipi || 'Diğer';
      const label = getOdemeTipiLabel(type);
      const amount = Number(item.tutar) || 0;
      typeMap.set(label, (typeMap.get(label) || 0) + amount);

      // Pie Data - Kasa Dağılımı
      let kasaLabel = 'Diğer';
      if (item.kasa) kasaLabel = item.kasa.kasaAdi;
      else if (item.bankaHesap) kasaLabel = item.bankaHesap.hesapAdi;
      else if (item.firmaKrediKarti) kasaLabel = item.firmaKrediKarti.kartAdi;

      kasaMap.set(kasaLabel, (kasaMap.get(kasaLabel) || 0) + amount);

      // Trend Data - Tarih
      const date = item.tarih.split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          displayDate: new Date(item.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
          tahsilat: 0,
          odeme: 0
        });
      }
      const dayStats = dateMap.get(date);
      if (item.tip === 'COLLECTION') dayStats.tahsilat += amount;
      else dayStats.odeme += amount;
    });

    const pieData = Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const kasaData = Array.from(kasaMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Tarihe göre sırala
    const allTrendData = Array.from(dateMap.values())
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Periyot Filtresi
    const limit = trendPeriod === 'WEEKLY' ? 7 : 30;
    const trendData = allTrendData.slice(-limit);

    return { pie: pieData, kasa: kasaData, trend: trendData };
  }, [filteredTahsilatlar, getOdemeTipiLabel, trendPeriod]);

  const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  const columns = useMemo<GridColDef<Tahsilat>[]>(() => [
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 110,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;
        return (
          <Typography variant="body2">
            {new Date(row.tarih).toLocaleDateString('tr-TR')}
          </Typography>
        );
      },
    },
    {
      field: 'cariKodu',
      headerName: 'Cari Kodu',
      width: isLargeDesktop ? 120 : 100,
      sortable: true,
      hideable: true,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;
        return (
          <Typography variant="body2" fontWeight={500}>
            {row.cari.cariKodu}
          </Typography>
        );
      },
    },
    {
      field: 'cariUnvan',
      headerName: 'Cari Ünvan',
      flex: 1.5,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;
        return (
          <Typography variant="body2" fontWeight={600}>
            {row.cari.unvan}
          </Typography>
        );
      },
    },
    {
      field: 'odemeTipi',
      headerName: 'Ödeme Tipi',
      width: isLargeDesktop ? 150 : 120,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;
        return (
          <Chip
            icon={getOdemeTipiIcon(row.odemeTipi)}
            label={getOdemeTipiLabel(row.odemeTipi)}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        );
      },
    },
    {
      field: 'kasa',
      headerName: 'Kasa',
      width: 130,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;
        // Kasa varsa kasa adını göster
        if (row.kasa) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                {row.kasa.kasaAdi}
              </Typography>
              <Tooltip title="Kasa Detayları">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedKasa(row.kasa);
                    setOpenKasaDetayDialog(true);
                  }}
                  sx={{ p: 0.5 }}
                >
                  <Info fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }

        // POS (Banka Hesabı) varsa
        if (row.bankaHesap) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                {row.bankaHesap.bankaAdi || 'Banka'} {'>'} {row.bankaHesap.hesapAdi}
              </Typography>
            </Box>
          );
        }

        // Firma Kredi Kartı varsa
        if (row.firmaKrediKarti) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                {row.firmaKrediKarti.kartAdi}
              </Typography>
            </Box>
          );
        }

        // Hiçbiri yoksa
        return (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            -
          </Typography>
        );
      },
    },

    {
      field: 'kasaTipi',
      headerName: 'Kasa Tipi',
      width: isLargeDesktop ? 140 : 110,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;
        // Kasa yoksa Ödeme Tipine bak
        if (!row.kasa) {
          let label = '-';
          if (row.odemeTipi === 'KREDI_KARTI') label = '💳 POS';
          else if ((row.odemeTipi as string) === 'BANKA_HAVALESI') label = '🏦 Havale/EFT';
          else if (row.firmaKrediKarti) label = '💳 Firma Kredi Kartı';
          else if (row.tip === 'COLLECTION' && !row.odemeTipi) label = 'Çapraz Ödeme'; // Çapraz ödemede odemeTipi null olabilir veya özel bir şey olabilir

          // Eğer gerçekten çapraz ödeme ise (backend create'de odemeTipi set ediyor mu?)
          // Create servisine bakarsak createCaprazOdeme'de odemeTipi 'KREDI_KARTI' set ediliyor veya parametre.
          // Ama kasaId null.

          // Neyse, basitçe:
          if (row.bankaHesap) label = '💳 POS';
          else if (row.firmaKrediKarti) label = '💳 Firma Kredi Kartı';
          else label = 'Çapraz Ödeme';

          return (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          );
        }

        const kasaTipiLabels: Record<string, string> = {
          NAKIT: '💵 Nakit',
          POS: '💳 POS',
          FIRMA_KREDI_KARTI: '💳 Firma Kredi Kartı',
          BANKA: '🏦 Banka',

        };

        return (
          <Typography variant="body2" color="text.secondary">
            {kasaTipiLabels[row.kasa.kasaTipi] || row.kasa.kasaTipi}
          </Typography>
        );
      },
    },

    {
      field: 'kartAdi',
      headerName: 'Kart Adı',
      width: 130,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;

        // Kasa kontrolünü kaldırıyoruz


        // Firma kredi kartı bilgisi
        if (row.firmaKrediKarti && row.firmaKrediKarti.kartAdi) {
          return (
            <Typography variant="body2" fontWeight={500} color="primary">
              {row.firmaKrediKarti.kartAdi}
            </Typography>
          );
        }

        // Banka hesabı bilgisi (hesap adı)
        if (row.bankaHesap && row.bankaHesap.hesapAdi) {
          return (
            <Typography variant="body2" fontWeight={500} color="primary">
              {row.bankaHesap.hesapAdi}
            </Typography>
          );
        }

        // Diğer durumlar (Nakit, POS vb.)
        return (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            -
          </Typography>
        );
      },
    },
    {
      field: 'tutar',
      headerName: 'Tutar',
      width: isLargeDesktop ? 160 : 130,
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;
        return (
          <Typography
            fontWeight="bold"
            color={row.tip === 'COLLECTION' ? 'success.main' : 'error.main'}
          >
            {formatCurrency(row.tutar)}
          </Typography>
        );
      },
    },
    {
      field: 'aciklama',
      headerName: 'Açıklama',
      flex: 3,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;
        return (
          <Typography variant="body2" sx={{ maxWidth: '100%', wordBreak: 'break-word' }}>
            {row.aciklama || '-'}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      sortable: false,
      filterable: false,
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Detay">
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleViewDetail(row.id)}
                  sx={{
                    color: 'var(--primary)',
                    '&:hover': {
                      bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    },
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Makbuz Yazdır">
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() =>
                    window.open(`/tahsilat/print/${row.id}`, '_blank', 'noopener,noreferrer')
                  }
                >
                  <Print fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Sil">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => openDeleteConfirmation(row)}
                  disabled={actionLoading}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ], [actionLoading, formatCurrency, getOdemeTipiIcon, getOdemeTipiLabel, openDeleteConfirmation, handleViewDetail]);

  // İstatistik Kartları Verisi
  const statCards = [
    {
      title: 'Toplam Tahsilat',
      value: stats.toplamTahsilat,
      icon: <AccountBalance sx={{ fontSize: isMobile ? 32 : 40, opacity: 0.8 }} />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      shadowColor: '37, 99, 235',
      id: 'toplam-tahsilat'
    },
    {
      title: 'Toplam Ödeme',
      value: stats.toplamOdeme,
      icon: <Payments sx={{ fontSize: isMobile ? 32 : 40, opacity: 0.8 }} />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      shadowColor: '239, 68, 68',
      id: 'toplam-odeme'
    },
    {
      title: 'Nakit Tahsilat',
      value: stats.nakitTahsilat,
      icon: <AttachMoney sx={{ fontSize: isMobile ? 32 : 40, opacity: 0.8 }} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      shadowColor: '16, 185, 129',
      id: 'nakit-tahsilat'
    },
    {
      title: 'K.Kartı Tahsilat',
      value: stats.krediKartiTahsilat,
      icon: <CreditCard sx={{ fontSize: isMobile ? 32 : 40, opacity: 0.8 }} />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      shadowColor: '139, 92, 246',
      id: 'kk-tahsilat'
    },
  ];

  // Filtre İçeriği (Hem Drawer hem Desktop için tekrar kullanılabilir)
  const filterContent = (
    <Box sx={{ p: isMobile ? 1 : 0 }}>
      {/* Hızlı Filtreler */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList fontSize="small" color="action" />
          Hızlı Tarih Seçimi
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
          {['TÜMÜ', 'BUGÜN', 'BU_HAFTA', 'BU_AY', 'BU_YIL'].map((filter) => (
            <Chip
              key={filter}
              label={
                filter === 'TÜMÜ' ? 'Tümü' :
                  filter === 'BUGÜN' ? 'Bugün' :
                    filter === 'BU_HAFTA' ? 'Bu Hafta' :
                      filter === 'BU_AY' ? 'Bu Ay' : 'Bu Yıl'
              }
              onClick={() => handleQuickFilter(filter)}
              color={quickFilter === filter ? 'primary' : 'default'}
              variant={quickFilter === filter ? 'filled' : 'outlined'}
              sx={{
                fontWeight: quickFilter === filter ? 600 : 400,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                },
                bgcolor: quickFilter !== filter ? 'background.paper' : undefined,
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Özel Tarih Aralığı */}
      <Box>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          Özel Tarih Aralığı
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Başlangıç Tarihi"
            type="date"
            size="small"
            value={dateRange.start}
            onChange={(e) => {
              setDateRange({ ...dateRange, start: e.target.value });
              setQuickFilter('');
            }}
            slotProps={{
              inputLabel: { shrink: true }
            }}
            fullWidth
          />
          <TextField
            label="Bitiş Tarihi"
            type="date"
            size="small"
            value={dateRange.end}
            onChange={(e) => {
              setDateRange({ ...dateRange, end: e.target.value });
              setQuickFilter('');
            }}
            slotProps={{
              inputLabel: { shrink: true }
            }}
            fullWidth
          />
        </Stack>
      </Box>

      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportExcel}
            color="success"
            size="small"
            fullWidth={isMobile}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPdf}
            color="error"
            size="small"
            fullWidth={isMobile}
          >
            PDF
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            mb: 3,
            position: isMobile ? 'sticky' : 'static',
            top: isMobile ? -1 : 'auto',
            zIndex: 10,
            bgcolor: 'background.default',
            pb: 1,
            pt: isMobile ? 1 : 0,
            borderBottom: isMobile ? 1 : 0,
            borderColor: 'divider'
          }}
        >
          <Typography variant="h4" fontWeight="bold" sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: isMobile ? '1.75rem' : '2.125rem',
          }}>
            Tahsilat & Ödeme
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            💵 Nakit ve 💳 Kredi Kartı işlemleri (🏦 Havale, 📄 Çek, 📋 Senet kendi sayfalarında)
          </Typography>
        </Box>

        {/* İstatistik Kartları */}
        {isMobile ? (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              mb: 2,
              mx: -2,
              px: 2,
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {statsFetching
              ? [1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ minWidth: '85%', scrollSnapAlign: 'center', flexShrink: 0 }}>
                  <Card sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
                          <Skeleton variant="text" width="60%" height={32} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))
              : statCards.map((card) => (
                <Box key={card.id} sx={{ minWidth: '85%', scrollSnapAlign: 'center', flexShrink: 0 }}>
                  <Card
                    sx={{
                      background: card.gradient,
                      color: 'white',
                      boxShadow: `0 4px 6px rgba(${card.shadowColor}, 0.3)`,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {card.icon}
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9, whiteSpace: 'nowrap' }}>
                            {card.title}
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {formatCurrency(card.value)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {statsFetching
              ? [1, 2, 3, 4].map((i) => (
                <Grid key={i} size={{ xs: 6, md: 6, lg: 3 }}>
                  <Card sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
                          <Skeleton variant="text" width="60%" height={32} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
              : statCards.map((card) => (
                <Grid key={card.id} size={{ xs: 6, md: 6, lg: 3 }}>
                  <Card
                    sx={{
                      background: card.gradient,
                      color: 'white',
                      boxShadow: `0 4px 6px rgba(${card.shadowColor}, 0.3)`,
                      transition: 'all 0.3s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        boxShadow: `0 8px 16px rgba(${card.shadowColor}, 0.4)`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {card.icon}
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {card.title}
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {formatCurrency(card.value)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}

        {/* Grafikler (Sadece veri varsa ve loading değilse göster) */}
        {!statsFetching && (chartData.pie.length > 0 || chartData.trend.length > 0) && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Pie Chart: Ödeme ve Kasa Dağılımı (Tablı) */}
            <Grid size={{ xs: 12, md: 12, lg: 4 }}>
              <Card sx={{ height: '100%', minHeight: 450, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={chartTab}
                    onChange={(e, v) => setChartTab(v)}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                  >
                    <Tab label="Ödeme Tipi" />
                    <Tab label="Kasa Dağılımı" />
                  </Tabs>
                </Box>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom align="center" sx={{ mb: 2 }}>
                    {chartTab === 0 ? 'Ödeme Yöntemi Dağılımı' : 'Kasa/Banka Dağılımı'}
                  </Typography>
                  <Box sx={{ height: 300, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartTab === 0 ? chartData.pie : chartData.kasa}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(chartTab === 0 ? chartData.pie : chartData.kasa).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value) => formatCurrency(value as number)}
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Bar Chart: Tahsilat Trendi */}
            <Grid size={{ xs: 12, md: 12, lg: 8 }}>
              <Card sx={{ height: '100%', minHeight: 450, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={600}>İşlem Trendi</Typography>
                  <ToggleButtonGroup
                    value={trendPeriod}
                    exclusive
                    onChange={(e, val) => val && setTrendPeriod(val)}
                    size="small"
                    color="primary"
                  >
                    <ToggleButton value="WEEKLY">Haftalık</ToggleButton>
                    <ToggleButton value="MONTHLY">Aylık</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <CardContent>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.trend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                          dataKey="displayDate"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          tickFormatter={(value) => `₺${value / 1000}k`}
                        />
                        <RechartsTooltip
                          formatter={(value) => formatCurrency(value as number)}
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        />
                        <Legend />
                        <Bar dataKey="tahsilat" name="Tahsilat" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        <Bar dataKey="odeme" name="Ödeme" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              '& .MuiTab-root': {
                minHeight: 72,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },
              },
              '& .Mui-selected': {
                fontWeight: 700,
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">Tahsilatlar</Typography>
                  <Chip
                    label={tahsilatData.filter(t => t.tip === 'COLLECTION').length}
                    size="small"
                    sx={{
                      bgcolor: activeTab === 0 ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                      color: activeTab === 0 ? 'white' : '#10b981',
                      fontWeight: 600,
                      minWidth: 36,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 600 }}>
                    {formatCurrency(tahsilatData.filter(t => t.tip === 'COLLECTION').reduce((sum, t) => sum + Number(t.tutar || 0), 0))}
                  </Typography>
                </Box>
              }
              icon={<TrendingDown />}
              iconPosition="start"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">Ödemeler</Typography>
                  <Chip
                    label={tahsilatData.filter(t => t.tip === 'PAYMENT').length}
                    size="small"
                    sx={{
                      bgcolor: activeTab === 1 ? '#ef4444' : 'rgba(239, 68, 68, 0.1)',
                      color: activeTab === 1 ? 'white' : '#ef4444',
                      fontWeight: 600,
                      minWidth: 36,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 600 }}>
                    {formatCurrency(tahsilatData.filter(t => t.tip === 'PAYMENT').reduce((sum, t) => sum + Number(t.tutar || 0), 0))}
                  </Typography>
                </Box>
              }
              icon={<TrendingUp />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Global Arama */}
        <Paper sx={{ p: 2, mb: 3, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
          <Stack direction="row" spacing={1} alignItems="stretch">
            <TextField
              fullWidth
              placeholder="Cari adı, kodu, tutar, açıklama veya hesap adı ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`${filteredTahsilatlar.length} sonuç`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'rotate(90deg)',
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease-in-out',
                  height: '100%',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                  },
                },
              }}
            />
            {isMobile && (
              <Button
                variant="outlined"
                onClick={() => setOpenFilterDrawer(true)}
                sx={{
                  minWidth: 'auto',
                  width: 56,
                  borderRadius: 1,
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  color: 'text.secondary',
                  '&:hover': {
                    border: '1px solid rgba(0, 0, 0, 0.87)',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <FilterList />
              </Button>
            )}
          </Stack>
        </Paper>



        {/* Tarih Filtresi (Mobile: Drawer, Desktop: Accordion) */}
        {isMobile ? (
          <Drawer
            anchor="bottom"
            open={openFilterDrawer}
            onClose={() => setOpenFilterDrawer(false)}
            PaperProps={{
              sx: {
                borderRadius: '16px 16px 0 0',
                maxHeight: '85vh'
              }
            }}
          >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
              <Typography variant="h6" fontWeight={600}>Filtrele</Typography>
              <IconButton onClick={() => setOpenFilterDrawer(false)} edge="end">
                <Close />
              </IconButton>
            </Box>

            <Box sx={{ p: 2, overflowY: 'auto' }}>
              {filterContent}
            </Box>

            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setOpenFilterDrawer(false)}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  fontWeight: 600
                }}
              >
                Uygula
              </Button>
            </Box>
          </Drawer>
        ) : (
          <Accordion
            defaultExpanded
            sx={{
              mb: 3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              '&:before': { display: 'none' },
              borderRadius: '4px !important',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  📅 Tarih Filtreleri
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {filterContent}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Aktif Filtreler */}
        {(searchQuery || dateRange.start || dateRange.end || quickFilter !== 'TÜMÜ') && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'var(--muted)', boxShadow: 'var(--shadow-md)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Aktif Filtreler:
                </Typography>

                {searchQuery && (
                  <Chip
                    label={`Arama: "${searchQuery}"`}
                    onDelete={() => setSearchQuery('')}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                )}

                {quickFilter && quickFilter !== 'TÜMÜ' && (
                  <Chip
                    label={`Tarih: ${quickFilter === 'BUGÜN' ? 'Bugün' :
                      quickFilter === 'BU_HAFTA' ? 'Bu Hafta' :
                        quickFilter === 'BU_AY' ? 'Bu Ay' :
                          quickFilter === 'BU_YIL' ? 'Bu Yıl' : quickFilter
                      }`}
                    onDelete={() => handleQuickFilter('TÜMÜ')}
                    color="secondary"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                )}

                {(dateRange.start || dateRange.end) && (
                  <Chip
                    label={`Özel Tarih: ${dateRange.start || '...'} - ${dateRange.end || '...'}`}
                    onDelete={() => {
                      setDateRange({ start: '', end: '' });
                      setQuickFilter('TÜMÜ');
                    }}
                    color="info"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>

              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => {
                  setSearchQuery('');
                  setDateRange({ start: '', end: '' });
                  setQuickFilter('TÜMÜ');
                }}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                Tümünü Temizle
              </Button>
            </Box>
          </Paper>
        )}

        {/* Butonlar */}
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog('COLLECTION')}
            disabled={actionLoading}
            fullWidth={isMobile}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
              fontSize: isMobile ? '0.875rem' : '1rem',
            }}
          >
            Tahsilat Ekle
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog('PAYMENT')}
            disabled={actionLoading}
            fullWidth={isMobile}
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              },
              fontSize: isMobile ? '0.875rem' : '1rem',
            }}
          >
            Ödeme Ekle
          </Button>
          <Button
            variant="contained"
            startIcon={<SwapHoriz />}
            onClick={() => setOpenCaprazOdemeDialog(true)}
            disabled={actionLoading}
            fullWidth={isMobile}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              }
            }}
          >
            Çapraz Ödeme Tahsilat
          </Button>
        </Box>

        {/* Görünüm Ayarları */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Tooltip title={denseMode ? "Normal Görünüm" : "Kompakt Görünüm"}>
            <Button
              size="small"
              variant="outlined"
              startIcon={denseMode ? <TableRows /> : <ViewCompact />}
              onClick={() => setDenseMode(!denseMode)}
              sx={{
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              {denseMode ? "Normal" : "Kompakt"}
            </Button>
          </Tooltip>
        </Box>

        {/* Tablo / Mobil Kart Görünümü */}
        {isMobile ? (
          <Stack spacing={2}>
            {(tahsilatLoading || tahsilatFetching) && filteredTahsilatlar.length === 0 ? (
              [1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                  </CardContent>
                </Card>
              ))
            ) : filteredTahsilatlar.length > 0 ? (
              <>
                {filteredTahsilatlar.slice(0, mobilePage * 20).map((row) => (
                  <Card key={row.id} sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            {row.cari.unvan}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.cari.cariKodu}
                          </Typography>
                        </Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          color={row.tip === 'COLLECTION' ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(row.tutar)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                        <Chip
                          icon={getOdemeTipiIcon(row.odemeTipi)}
                          label={getOdemeTipiLabel(row.odemeTipi)}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 1 }}
                        />
                        {row.kasa ? (
                          <Chip label={row.kasa.kasaAdi} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                        ) : row.bankaHesap ? (
                          <Chip label={`${row.bankaHesap.bankaAdi || 'Banka'} > ${row.bankaHesap.hesapAdi}`} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                        ) : row.firmaKrediKarti ? (
                          <Chip label={row.firmaKrediKarti.kartAdi} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                        ) : (
                          <Chip label="Çapraz Ödeme" size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                        )}
                      </Box>

                      {row.aciklama && (
                        <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {row.aciklama}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(row.tarih).toLocaleDateString('tr-TR')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => window.open(`/tahsilat/print/${row.id}`, '_blank', 'noopener,noreferrer')}
                          >
                            <Print fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openDeleteConfirmation(row)}
                            disabled={actionLoading}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {filteredTahsilatlar.length > mobilePage * 20 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, pb: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setMobilePage(prev => prev + 1)}
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.5,
                        borderColor: 'divider',
                        color: 'text.secondary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          bgcolor: 'rgba(59, 130, 246, 0.04)'
                        }
                      }}
                    >
                      Daha Fazla Göster ({filteredTahsilatlar.length - mobilePage * 20} kayıt daha)
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <DataGridNoRowsOverlay />
              </Box>
            )}
          </Stack>
        ) : (
          <Paper sx={{ p: 1, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', height: 700 }}>
            <DataGrid<Tahsilat>
              rows={filteredTahsilatlar}
              columns={columns}
              loading={tahsilatLoading || tahsilatFetching || actionLoading}
              density={denseMode ? 'compact' : 'standard'}
              disableRowSelectionOnClick
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 25 },
                },
                columns: {
                  columnVisibilityModel: {
                    cariKodu: isLargeDesktop,
                    kasaTipi: isLargeDesktop,
                    kartAdi: isLargeDesktop,
                  },
                },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  borderRadius: '8px 8px 0 0',
                  borderBottom: '2px solid #dee2e6',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 700,
                },
                '& .MuiDataGrid-row': {
                  transition: 'all 0.2s ease-in-out',
                  '&:nth-of-type(odd)': {
                    backgroundColor: '#fafafa',
                  },
                  '&:nth-of-type(even)': {
                    backgroundColor: '#ffffff',
                  },
                  '&:hover': {
                    backgroundColor: '#f0f9ff !important',
                    transform: 'scale(1.001)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '0.875rem',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '2px solid #dee2e6',
                  backgroundColor: '#f8f9fa',
                },
              }}
              slots={{
                noRowsOverlay: DataGridNoRowsOverlay,
              }}
            />
          </Paper>
        )}
      </Box>

      {/* FAB - Yeni Ekle (Sadece Mobil) */}
      {
        isMobile && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            }}
            onClick={() => setOpenDialog(true)}
          >
            <Add />
          </Fab>
        )
      }

      {/* ❌ ESKİ DIALOG KALDIRILDI - Artık TahsilatFormDialog kullanılıyor */}

      {/* Silme Onay Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle component="div">Silme Onayı</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve
            cari/kasa bakiyeleri güncellenecektir.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>İptal</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={actionLoading}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ ÇÖZÜM: Yeni Dialog Component - Local State ile */}
      <TahsilatFormDialog
        open={openDialog}
        initialFormData={initialFormData}
        cariler={cariler}
        bankaHesaplari={bankaHesaplari}
        kasalar={kasalar}
        satisElemanlari={satisElemanlari}
        carilerLoading={carilerFetching}
        bankaHesaplariLoading={bankaHesaplariLoading}
        kasalarLoading={kasalarFetching}
        satisElemanlariLoading={satisElemanlariLoading}
        submitting={actionLoading}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        formatMoney={formatCurrency}
      />

      {/* Çapraz Ödeme Tahsilat Dialog */}
      <CaprazOdemeDialog
        open={openCaprazOdemeDialog}
        onClose={() => setOpenCaprazOdemeDialog(false)}
        onSubmit={handleCaprazOdeme}
        formData={caprazOdemeFormData}
        setFormData={(data: CaprazOdemeFormData) => setCaprazOdemeFormData(data)}
        cariler={cariler as Cari[]}
        loading={carilerFetching}
        submitting={actionLoading}
        carilerError={!!carilerError}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Kasa Detay Dialog */}
      <Dialog
        open={openKasaDetayDialog}
        onClose={() => setOpenKasaDetayDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle component="div">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              Kasa Detayları: {selectedKasa?.kasaAdi || ''}
            </Typography>
            <IconButton onClick={() => setOpenKasaDetayDialog(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedKasa && <KasaDetayContent kasaId={selectedKasa.id} />}
        </DialogContent>
      </Dialog>

    </MainLayout >
  );
}

