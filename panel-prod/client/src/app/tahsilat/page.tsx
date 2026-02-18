'use client';

import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
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
  Download,
  PictureAsPdf,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  bakiye: number;
}

interface Kasa {
  id: string;
  kasaKodu: string;
  kasaAdi: string;
  bakiye: number;
  kasaTipi: 'NAKIT' | 'POS' | 'FIRMA_KREDI_KARTI' | 'BANKA' | 'CEK_SENET';
}

interface Tahsilat {
  id: string;
  tip: 'TAHSILAT' | 'ODEME';
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
      const response = await axios.get('/tahsilat', {
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
              {formatMoney(kasaDetay.bakiye?.toNumber() || 0)}
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
      const response = await axios.get('/tahsilat', {
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
                label={params.value === 'TAHSILAT' ? 'Tahsilat' : 'Ödeme'}
                color={params.value === 'TAHSILAT' ? 'success' : 'error'}
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
      const response = await axios.get('/tahsilat', {
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
                label={params.value === 'TAHSILAT' ? 'Tahsilat' : 'Ödeme'}
                color={params.value === 'TAHSILAT' ? 'success' : 'error'}
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
      alignItems: 'center',
      justifyContent: 'center',
      color: 'text.secondary',
      typography: 'body2',
    }}
  >
    Kayıt bulunamadı
  </Box>
);

export default function TahsilatPage() {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [openCaprazOdemeDialog, setOpenCaprazOdemeDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTahsilat, setSelectedTahsilat] = useState<Tahsilat | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [activeTab, setActiveTab] = useState(0); // 0: Tahsilat, 1: Ödeme
  const [actionLoading, setActionLoading] = useState(false);
  const [openKasaDetayDialog, setOpenKasaDetayDialog] = useState(false);
  const [selectedKasa, setSelectedKasa] = useState<any>(null);

  // Tarih filtresi state
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [quickFilter, setQuickFilter] = useState<string>('TÜMÜ'); // TÜMÜ, BUGÜN, BU_HAFTA, BU_AY, BU_YIL
  const openDeleteConfirmation = useCallback((row: Tahsilat) => {
    setSelectedTahsilat(row);
    setOpenDeleteDialog(true);
  }, []);

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
        params.tip = 'TAHSILAT';
      } else if (activeTab === 1) {
        params.tip = 'ODEME';
      }

      if (dateRange.start) {
        params.baslangicTarihi = dateRange.start;
      }
      if (dateRange.end) {
        params.bitisTarihi = dateRange.end;
      }

      const response = await axios.get('/tahsilat', { params });
      return response.data?.data ?? [];
    },
  });

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();

      if (activeTab === 0) {
        params.append('tip', 'TAHSILAT');
      } else if (activeTab === 1) {
        params.append('tip', 'ODEME');
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
        params.append('tip', 'TAHSILAT');
      } else if (activeTab === 1) {
        params.append('tip', 'ODEME');
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
      const response = await axios.get('/tahsilat/stats');
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
        const response = await axios.get('/cari', { params: { limit: 1000 } });
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
    data: kasalar = [],
    isFetching: kasalarFetching,
  } = useQuery<Kasa[]>({
    queryKey: ['kasa', 'tahsilat'],
    queryFn: async () => {
      const response = await axios.get('/kasa', { params: { aktif: true } });
      return response.data ?? [];
    },
    enabled: openDialog || openCaprazOdemeDialog,
  });

  // ✅ ÇÖZÜM: initialFormData - Parent'ta sadece initial değerleri tut
  const [initialFormData, setInitialFormData] = useState({
    cariId: '',
    tip: 'TAHSILAT' as 'TAHSILAT' | 'ODEME',
    tutar: 0,
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

  const [caprazOdemeFormData, setCaprazOdemeFormData] = useState({
    tahsilatCariId: '',
    odemeCariId: '',
    tutar: 0,
    tarih: new Date().toISOString().split('T')[0],
    odemeTipi: 'NAKIT' as 'NAKIT' | 'KREDI_KARTI',
    kasaId: '',
    aciklama: '',
  });

  const showSnackbar = useCallback(
    (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const handleOpenDialog = useCallback((tip: 'TAHSILAT' | 'ODEME') => {
    // ✅ ÇÖZÜM: initialFormData'yı set et, dialog kendi local state'ini kullanacak
    setInitialFormData({
      cariId: '',
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
        if (submitFormData.odemeTipi === 'KREDI_KARTI' && submitFormData.tip === 'TAHSILAT') {
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
        if (submitFormData.odemeTipi === 'KREDI_KARTI' && submitFormData.tip === 'TAHSILAT') {
          dataToSend.kartSahibi = submitFormData.kartSahibi;
          dataToSend.kartSonDort = submitFormData.kartSonDort;
          dataToSend.bankaAdi = submitFormData.bankaAdi;
        }

        await axios.post('/tahsilat', dataToSend);
        showSnackbar(
          `${submitFormData.tip === 'TAHSILAT' ? 'Tahsilat' : 'Ödeme'} başarıyla kaydedildi`,
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

      if (!caprazOdemeFormData.tutar || caprazOdemeFormData.tutar <= 0) {
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

      await axios.post('/tahsilat/capraz-odeme', {
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
        odemeTipi: 'NAKIT',
        kasaId: '',
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

const formatMoney = useCallback((value: number) => {
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

  // ✅ En son eklenen en üstte - DESC sıralama
  const filteredTahsilatlar = useMemo<Tahsilat[]>(() => {
    return tahsilatData
      .filter((t) => (activeTab === 0 ? t.tip === 'TAHSILAT' : t.tip === 'ODEME'))
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
  }, [tahsilatData, activeTab]);

  const columns = useMemo<GridColDef<Tahsilat>[]>(() => [
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 110,
      sortable: false,
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
      minWidth: 120,
      sortable: false,
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
      flex: 1.2,
      minWidth: 200,
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
      minWidth: 150,
      sortable: false,
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
        // Çapraz ödemede kasa kullanılmaz (kasaId: null)
        if (!row.kasa) {
          return (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              Çapraz Ödeme
            </Typography>
          );
        }

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
      },
    },
    {
      field: 'kasaTipi',
      headerName: 'Kasa Tipi',
      minWidth: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;
        // Çapraz ödemede kasa tipi yok
        if (!row.kasa) {
          return (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              -
            </Typography>
          );
        }

        const kasaTipiLabels: Record<string, string> = {
          NAKIT: '💵 Nakit',
          POS: '💳 POS',
          FIRMA_KREDI_KARTI: '💳 Firma Kredi Kartı',
          BANKA: '🏦 Banka',
          CEK_SENET: '📄 Çek/Senet',
        };

        return (
          <Typography variant="body2" color="text.secondary">
            {kasaTipiLabels[row.kasa.kasaTipi] || row.kasa.kasaTipi}
          </Typography>
        );
      },
    },
    {
      field: 'banka',
      headerName: 'Banka',
      width: 130,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;

        // Çapraz ödemede banka bilgisi yok
        if (!row.kasa) {
          return (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              -
            </Typography>
          );
        }

        // Firma kredi kartı bilgisi
        if (row.firmaKrediKarti && row.firmaKrediKarti.bankaAdi) {
          return (
            <Typography variant="body2" fontWeight={500} color="primary">
              {row.firmaKrediKarti.bankaAdi}
            </Typography>
          );
        }

        // Banka hesabı bilgisi
        if (row.bankaHesap && row.bankaHesap.bankaAdi) {
          return (
            <Typography variant="body2" fontWeight={500} color="primary">
              {row.bankaHesap.bankaAdi}
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
      field: 'kartAdi',
      headerName: 'Kart Adı',
      width: 130,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;

        // Çapraz ödemede kart adı bilgisi yok
        if (!row.kasa) {
          return (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              -
            </Typography>
          );
        }

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
      minWidth: 160,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tahsilat;
        return (
          <Typography
            fontWeight="bold"
            color={row.tip === 'TAHSILAT' ? 'success.main' : 'error.main'}
          >
            {formatMoney(row.tutar)}
          </Typography>
        );
      },
    },
    {
      field: 'aciklama',
      headerName: 'Açıklama',
      flex: 3.5,
      minWidth: 350,
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
  ], [actionLoading, formatMoney, getOdemeTipiIcon, getOdemeTipiLabel, openDeleteConfirmation]);

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Tahsilat & Ödeme
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            💵 Nakit ve 💳 Kredi Kartı işlemleri (🏦 Havale, 📄 Çek, 📋 Senet kendi sayfalarında)
          </Typography>
        </Box>

        {/* İstatistik Kartları */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingDown sx={{ fontSize: 40, opacity: 0.8 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Toplam Tahsilat
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatMoney(stats.toplamTahsilat)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Toplam Ödeme
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatMoney(stats.toplamOdeme)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Nakit Tahsilat
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatMoney(stats.nakitTahsilat)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CreditCard sx={{ fontSize: 40, opacity: 0.8 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      K.Kartı Tahsilat
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatMoney(stats.krediKartiTahsilat)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab
              label="Tahsilatlar"
              icon={<TrendingDown />}
              iconPosition="start"
            />
            <Tab
              label="Ödemeler"
              icon={<TrendingUp />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>



        {/* Tarih Filtresi */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Hızlı Filtreler
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Button
                size="small"
                variant={quickFilter === 'TÜMÜ' ? 'contained' : 'outlined'}
                onClick={() => setQuickFilter('TÜMÜ')}
              >
                Tümü
              </Button>
              <Button
                size="small"
                variant={quickFilter === 'BUGÜN' ? 'contained' : 'outlined'}
                onClick={() => setQuickFilter('BUGÜN')}
              >
                Bugün
              </Button>
              <Button
                size="small"
                variant={quickFilter === 'BU_HAFTA' ? 'contained' : 'outlined'}
                onClick={() => setQuickFilter('BU_HAFTA')}
              >
                Bu Hafta
              </Button>
              <Button
                size="small"
                variant={quickFilter === 'BU_AY' ? 'contained' : 'outlined'}
                onClick={() => setQuickFilter('BU_AY')}
              >
                Bu Ay
              </Button>
              <Button
                size="small"
                variant={quickFilter === 'BU_YIL' ? 'contained' : 'outlined'}
                onClick={() => setQuickFilter('BU_YIL')}
              >
                Bu Yıl
              </Button>
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Tarih Aralığı
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={2}>
              <TextField
                type="date"
                label="Başlangıç Tarihi"
                size="small"
                value={dateRange.start}
                onChange={(e) => {
                  setDateRange((prev) => ({ ...prev, start: e.target.value }));
                  setQuickFilter('TÜMÜ');
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 180 }}
              />
              <TextField
                type="date"
                label="Bitiş Tarihi"
                size="small"
                value={dateRange.end}
                onChange={(e) => {
                  setDateRange((prev) => ({ ...prev, end: e.target.value }));
                  setQuickFilter('TÜMÜ');
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 180 }}
              />
              {(dateRange.start || dateRange.end) && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setDateRange({ start: '', end: '' });
                    setQuickFilter('TÜMÜ');
                  }}
                >
                  Temizle
                </Button>
              )}
            </Stack>
          </Box>

          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportExcel}
                color="success"
              >
                Excel İndir
              </Button>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={handleExportPdf}
                color="error"
              >
                PDF İndir
              </Button>
            </Stack>
          </Box>
</Paper>

        {/* Butonlar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog('TAHSILAT')}
            disabled={actionLoading}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              }
            }}
          >
            Tahsilat Ekle
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog('ODEME')}
            disabled={actionLoading}
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              }
            }}
          >
            Ödeme Ekle
          </Button>
          <Button
            variant="contained"
            startIcon={<SwapHoriz />}
            onClick={() => setOpenCaprazOdemeDialog(true)}
            disabled={actionLoading}
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

        {/* Tablo */}
        <Paper sx={{ p: 1 }}>
          <DataGrid<Tahsilat>
            rows={filteredTahsilatlar}
            columns={columns}
            loading={tahsilatLoading || tahsilatFetching || actionLoading}
            autoHeight
            disableColumnMenu
            disableColumnSelector
            disableDensitySelector
            disableRowSelectionOnClick
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 25 },
              },
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f8f9fa',
                fontWeight: 600,
              },
            }}
            slots={{
              noRowsOverlay: DataGridNoRowsOverlay,
            }}
          />
        </Paper>
      </Box>

      {/* ❌ ESKİ DIALOG KALDIRILDI - Artık TahsilatFormDialog kullanılıyor */}

      {/* Silme Onay Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Silme Onayı</DialogTitle>
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
        kasalar={kasalar}
        carilerLoading={carilerFetching}
        kasalarLoading={kasalarFetching}
        submitting={actionLoading}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        formatMoney={formatMoney}
      />

      {/* Çapraz Ödeme Tahsilat Dialog */}
      <Dialog
        open={openCaprazOdemeDialog}
        onClose={() => setOpenCaprazOdemeDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SwapHoriz sx={{ color: '#8b5cf6' }} />
            <Typography variant="h6">Çapraz Ödeme Tahsilat</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={Array.isArray(cariler) ? cariler : []}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  return `${option.cariKodu || ''} - ${option.unvan || ''}`;
                }}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  return option.id === value.id;
                }}
                value={cariler.find(c => c && c.id === caprazOdemeFormData.tahsilatCariId) || null}
                onChange={(e, newValue) => {
                  setCaprazOdemeFormData({
                    ...caprazOdemeFormData,
                    tahsilatCariId: newValue?.id || '',
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tahsilat Cari *"
                    required
                    fullWidth
                    helperText={carilerFetching ? 'Yükleniyor...' : cariler.length === 0 ? 'Cari bulunamadı' : 'Tahsilat yapılacak cari'}
                    error={false}
                  />
                )}
                loading={carilerFetching}
                noOptionsText={carilerFetching ? 'Yükleniyor...' : cariler.length === 0 ? 'Hiç cari bulunamadı' : 'Cari bulunamadı'}
                disabled={carilerFetching || !Array.isArray(cariler) || cariler.length === 0}
                filterOptions={(options, params) => {
                  const filtered = options.filter((option) => {
                    if (!option) return false;
                    const searchTerm = params.inputValue.toLowerCase();
                    return (
                      option.cariKodu?.toLowerCase().includes(searchTerm) ||
                      option.unvan?.toLowerCase().includes(searchTerm)
                    );
                  });
                  return filtered;
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={Array.isArray(cariler) ? cariler.filter(c => c && c.id !== caprazOdemeFormData.tahsilatCariId) : []}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  return `${option.cariKodu || ''} - ${option.unvan || ''}`;
                }}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  return option.id === value.id;
                }}
                value={cariler.find(c => c && c.id === caprazOdemeFormData.odemeCariId) || null}
                onChange={(e, newValue) => {
                  setCaprazOdemeFormData({
                    ...caprazOdemeFormData,
                    odemeCariId: newValue?.id || '',
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ödeme Cari *"
                    required
                    fullWidth
                    helperText={carilerFetching ? 'Yükleniyor...' : cariler.length === 0 ? 'Cari bulunamadı' : 'Ödeme yapılacak cari'}
                    error={false}
                  />
                )}
                loading={carilerFetching}
                noOptionsText={carilerFetching ? 'Yükleniyor...' : cariler.length === 0 ? 'Hiç cari bulunamadı' : 'Cari bulunamadı'}
                disabled={carilerFetching || !Array.isArray(cariler) || cariler.length === 0}
                filterOptions={(options, params) => {
                  const filtered = options.filter((option) => {
                    if (!option) return false;
                    const searchTerm = params.inputValue.toLowerCase();
                    return (
                      option.cariKodu?.toLowerCase().includes(searchTerm) ||
                      option.unvan?.toLowerCase().includes(searchTerm)
                    );
                  });
                  return filtered;
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Tutar *"
                type="number"
                required
                value={caprazOdemeFormData.tutar || ''}
                onChange={(e) => {
                  setCaprazOdemeFormData({
                    ...caprazOdemeFormData,
                    tutar: parseFloat(e.target.value) || 0,
                  });
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
                helperText="Tahsilat ve ödeme için ortak tutar"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Tarih *"
                type="date"
                required
                value={caprazOdemeFormData.tarih}
                onChange={(e) => {
                  setCaprazOdemeFormData({
                    ...caprazOdemeFormData,
                    tarih: e.target.value,
                  });
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            {carilerError && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  Cariler yüklenirken hata oluştu. Lütfen sayfayı yenileyin.
                </Alert>
              </Grid>
            )}
            {!carilerFetching && cariler.length === 0 && !carilerError && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Hiç cari bulunamadı. Lütfen önce cari ekleyin.
                </Alert>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Çapraz Ödeme:</strong> Para kasaya girmez, doğrudan bir cariden diğerine transfer edilir.
                  Bu nedenle ödeme tipi ve kasa seçimi yapmanıza gerek yoktur.
                </Typography>
              </Alert>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Açıklama"
                multiline
                rows={2}
                value={caprazOdemeFormData.aciklama}
                onChange={(e) => {
                  setCaprazOdemeFormData({
                    ...caprazOdemeFormData,
                    aciklama: e.target.value,
                  });
                }}
                placeholder="Çapraz ödeme açıklaması (opsiyonel)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCaprazOdemeDialog(false)}>İptal</Button>
          <Button
            onClick={handleCaprazOdeme}
            variant="contained"
            disabled={actionLoading}
            sx={{
              bgcolor: '#8b5cf6',
              '&:hover': {
                bgcolor: '#7c3aed',
              }
            }}
          >
            {actionLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

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
        <DialogTitle>
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

    </MainLayout>
  );
}

// ✅ ÇÖZÜM: Dialog Component - Local State kullanıyor (FORM-PING-SORUNU-COZUMU.md)
interface FirmaKrediKarti {
  id: string;
  kartKodu: string;
  kartAdi: string;
  bankaAdi: string;
  kartTipi: string;
  sonDortHane: string;
  limit: number;
  aktif: boolean;
  kasaId: string;
}

const TahsilatFormDialog = memo(({
  open,
  initialFormData,
  cariler,
  kasalar,
  carilerLoading,
  kasalarLoading,
  submitting,
  onClose,
  onSubmit,
  formatMoney,
}: {
  open: boolean;
  initialFormData: any;
  cariler: Cari[];
  kasalar: Kasa[];
  carilerLoading: boolean;
  kasalarLoading: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  formatMoney: (value: number) => string;
}) => {
  // 1. LOCAL STATE - Parent'ı etkilemez!
  const [localFormData, setLocalFormData] = useState(initialFormData);

  // 2. Firma kredi kartları - Kasa seçildiğinde çekilecek
  const [firmaKrediKartlari, setFirmaKrediKartlari] = useState<FirmaKrediKarti[]>([]);
  const [firmaKrediKartlariLoading, setFirmaKrediKartlariLoading] = useState(false);

  // 3. POS Banka hesapları - Kredi kartı tahsilat için
  const [posBankaHesaplari, setPosBankaHesaplari] = useState<BankaHesabi[]>([]);
  const [posBankaHesaplariLoading, setPosBankaHesaplariLoading] = useState(false);

  // 2. initialFormData değiştiğinde local state'i güncelle
  useEffect(() => {
    setLocalFormData(initialFormData);
  }, [initialFormData]);

  // 4. POS Banka hesaplarını çek - Kredi kartı tahsilat için
  useEffect(() => {
    const fetchPosBankaHesaplari = async () => {
      // Sadece tahsilat (TAHSILAT) ve kredi kartı (KREDI_KARTI) için POS banka hesaplarını çek
      if (localFormData.tip === 'TAHSILAT' && localFormData.odemeTipi === 'KREDI_KARTI') {
        try {
          setPosBankaHesaplariLoading(true);
          // Önce banka kasalarını bul
          const bankaKasalari = kasalar.filter(k => k.kasaTipi === 'BANKA');

          // Her banka kasası için POS tipindeki hesapları çek
          const allPosHesaplari: BankaHesabi[] = [];
          for (const bankaKasa of bankaKasalari) {
            try {
              const response = await axios.get('/banka-hesap', {
                params: { kasaId: bankaKasa.id, hesapTipi: 'POS' },
              });
              if (response.data && Array.isArray(response.data)) {
                allPosHesaplari.push(...response.data);
              }
            } catch (error) {
              console.error(`Banka kasası ${bankaKasa.id} için POS hesapları yüklenirken hata:`, error);
            }
          }

          setPosBankaHesaplari(allPosHesaplari);
        } catch (error) {
          console.error('POS banka hesapları yüklenirken hata:', error);
          setPosBankaHesaplari([]);
        } finally {
          setPosBankaHesaplariLoading(false);
        }
      } else {
        // Diğer durumlarda POS banka hesaplarını temizle
        setPosBankaHesaplari([]);
        setLocalFormData((prev: any) => ({
          ...prev,
          bankaHesapId: '',
        }));
      }
    };

    fetchPosBankaHesaplari();
  }, [kasalar, localFormData.tip, localFormData.odemeTipi]);

  // 5. useMemo ile filtre - kasalar değişmedikçe hesaplanmaz
  const availableKasalar = useMemo(() => {
    if (localFormData.odemeTipi === 'NAKIT') {
      return kasalar.filter(k => k.kasaTipi === 'NAKIT');
    } else if (localFormData.odemeTipi === 'KREDI_KARTI') {
      // Tahsilat için artık POS kasası kullanılmıyor, banka hesapları kullanılıyor
      if (localFormData.tip === 'TAHSILAT') {
        return []; // POS kasası yerine banka hesapları kullanılacak
      } else {
        return kasalar.filter(k => k.kasaTipi === 'FIRMA_KREDI_KARTI');
      }
    }
    return [];
  }, [kasalar, localFormData.odemeTipi, localFormData.tip]);

  // 6. Firma kredi kartlarını çek - Kasa seçildiğinde ve ödeme tipi kredi kartı olduğunda
  useEffect(() => {
    const fetchFirmaKrediKartlari = async () => {
      // Sadece ödeme (ODEME) ve kredi kartı (KREDI_KARTI) için firma kredi kartlarını çek
      if (localFormData.tip === 'ODEME' && localFormData.odemeTipi === 'KREDI_KARTI' && localFormData.kasaId) {
        try {
          setFirmaKrediKartlariLoading(true);
          const response = await axios.get('/firma-kredi-karti', {
            params: { kasaId: localFormData.kasaId },
          });
          setFirmaKrediKartlari(response.data || []);
        } catch (error) {
          console.error('Firma kredi kartları yüklenirken hata:', error);
          setFirmaKrediKartlari([]);
        } finally {
          setFirmaKrediKartlariLoading(false);
        }
      } else {
        // Diğer durumlarda firma kredi kartlarını temizle
        setFirmaKrediKartlari([]);
        setLocalFormData((prev: any) => ({
          ...prev,
          firmaKrediKartiId: '',
          kartSahibi: '',
          kartSonDort: '',
          bankaAdi: '',
        }));
      }
    };

    fetchFirmaKrediKartlari();
  }, [localFormData.tip, localFormData.odemeTipi, localFormData.kasaId]);

  // 7. Local değişiklik fonksiyonu
  const handleLocalChange = (field: string, value: any) => {
    // Firma kredi kartı seçildiğinde, kart bilgilerini de form'a kaydet
    if (field === 'firmaKrediKartiId' && value) {
      const selectedKart = firmaKrediKartlari.find((kart) => kart.id === value);
      if (selectedKart) {
        setLocalFormData((prev: any) => ({
          ...prev,
          [field]: value,
          kartSahibi: selectedKart.kartAdi || '',
          kartSonDort: selectedKart.sonDortHane || '',
          bankaAdi: selectedKart.bankaAdi || '',
        }));
        return;
      }
    }

    // Ödeme tipi değiştiğinde, kasa ve banka hesabı seçimlerini sıfırla
    if (field === 'odemeTipi') {
      setLocalFormData((prev: any) => ({
        ...prev,
        [field]: value,
        kasaId: '',
        bankaHesapId: '',
      }));
      return;
    }

    // Normal alan değişikliği
    setLocalFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // 8. Local submit - Parent'a sadece burada veri gönderilir
  const handleLocalSubmit = () => {
    onSubmit(localFormData);
  };

  // 9. Hook'lar bittikten SONRA conditional return
  if (!open) return null;

  // Dialog kapatma handler - Material-UI Dialog event verir
  const handleDialogClose = (event?: {}, reason?: string) => {
    // Her durumda dialog'u kapat (backdrop click, escape key, vs.)
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{
        bgcolor: localFormData.tip === 'TAHSILAT' ? '#10b981' : '#ef4444',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {localFormData.tip === 'TAHSILAT' ? <TrendingDown /> : <TrendingUp />}
          {localFormData.tip === 'TAHSILAT' ? 'Tahsilat Ekle' : 'Ödeme Ekle'}
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Ödeme Tipi - En yukarıda */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Ödeme Tipi *</InputLabel>
              <Select
                value={localFormData.odemeTipi}
                label="Ödeme Tipi *"
                onChange={(e) => handleLocalChange('odemeTipi', e.target.value)}
              >
                <MenuItem value="NAKIT">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney fontSize="small" />
                    <Box>
                      <Typography variant="body2">Nakit</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Nakit Kasa
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="KREDI_KARTI">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCard fontSize="small" />
                    <Box>
                      <Typography variant="body2">Kredi Kartı</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {localFormData.tip === 'TAHSILAT' ? 'Pos Kasası (Müşteriden)' : 'Firma Kredi Kartı (Tedarikçiye)'}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Kasa Seçimi - Kredi Kartı Tahsilat durumunda POS Banka Hesapları göster */}
          {localFormData.odemeTipi === 'KREDI_KARTI' && localFormData.tip === 'TAHSILAT' ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>POS Banka Hesabı Seçin *</InputLabel>
                <Select
                  value={localFormData.bankaHesapId || ''}
                  label="POS Banka Hesabı Seçin *"
                  onChange={(e) => handleLocalChange('bankaHesapId', e.target.value)}
                  disabled={posBankaHesaplariLoading}
                >
                  {posBankaHesaplariLoading && (
                    <MenuItem disabled>
                      <Typography variant="caption" color="text.secondary">
                        POS hesapları yükleniyor...
                      </Typography>
                    </MenuItem>
                  )}
                  {posBankaHesaplari.map((hesap) => (
                    <MenuItem key={hesap.id} value={hesap.id}>
                      <Box>
                        <Typography variant="body2">
                          {hesap.bankaAdi} - {hesap.hesapAdi || hesap.hesapKodu}
                        </Typography>
                        {hesap.kasa && (
                          <Typography variant="caption" color="text.secondary">
                            {hesap.kasa.kasaAdi} - {hesap.kasa.kasaKodu}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                  {!posBankaHesaplariLoading && posBankaHesaplari.length === 0 && (
                    <MenuItem disabled>
                      <Typography variant="caption" color="error">
                        POS banka hesabı bulunamadı
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          ) : (
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Kasa Seçin *</InputLabel>
                <Select
                  value={localFormData.kasaId}
                  label="Kasa Seçin *"
                  onChange={(e) => handleLocalChange('kasaId', e.target.value)}
                  disabled={kasalarLoading}
                >
                  {kasalarLoading && (
                    <MenuItem disabled>
                      <Typography variant="caption" color="text.secondary">
                        Kasalar yükleniyor...
                      </Typography>
                    </MenuItem>
                  )}
                  {availableKasalar.map((kasa) => (
                    <MenuItem key={kasa.id} value={kasa.id}>
                      <Box>
                        <Typography variant="body2">
                          {kasa.kasaAdi} - Bakiye: {formatMoney(kasa.bakiye)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {kasa.kasaKodu}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                  {availableKasalar.length === 0 && (
                    <MenuItem disabled>
                      <Typography variant="caption" color="error">
                        {localFormData.odemeTipi === 'NAKIT'
                          ? 'Nakit kasa bulunamadı'
                          : 'Firma kredi kartı kasası bulunamadı'}
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Cari Seçimi */}
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              options={cariler}
              getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
              loading={carilerLoading}
              loadingText="Cariler yükleniyor..."
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cari Seçin *"
                  fullWidth
                />
              )}
              onChange={(e, value) => handleLocalChange('cariId', value?.id || '')}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {option.cariKodu} - {option.unvan}
                      </Typography>
                      <Typography variant="caption" color={option.bakiye >= 0 ? 'success.main' : 'error.main'}>
                        Bakiye: {formatMoney(option.bakiye)}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
            />
          </Grid>

          {/* Tutar */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Tutar *"
              type="number"
              value={localFormData.tutar}
              onChange={(e) => handleLocalChange('tutar', parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
              sx={{
                '& input[type=number]': {
                  MozAppearance: 'textfield',
                },
                '& input[type=number]::-webkit-outer-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
                '& input[type=number]::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
              }}
            />
          </Grid>

          {/* Tarih */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Tarih *"
              type="date"
              value={localFormData.tarih}
              onChange={(e) => handleLocalChange('tarih', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Bilgilendirme */}
          <Grid size={{ xs: 12 }}>
            <Alert severity="info" sx={{ mb: 0 }}>
              <Typography variant="body2">
                <strong>Bu sayfada sadece Nakit ve Kredi Kartı işlemleri yapılır.</strong>
                <br />
                • Banka Havalesi → <strong>Banka İşlemleri</strong> menüsünde
                <br />
                • Çek/Senet → <strong>Bordro (Çek/Senet)</strong> menüsünde
              </Typography>
            </Alert>
          </Grid>

          {/* Firma Kredi Kartı Seçimi - Sadece ödeme (ODEME) ve kredi kartı (KREDI_KARTI) için */}
          {localFormData.tip === 'ODEME' && localFormData.odemeTipi === 'KREDI_KARTI' && localFormData.kasaId && (
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Firma Kredi Kartı Seçin *</InputLabel>
                <Select
                  value={localFormData.firmaKrediKartiId || ''}
                  label="Firma Kredi Kartı Seçin *"
                  onChange={(e) => handleLocalChange('firmaKrediKartiId', e.target.value)}
                  disabled={firmaKrediKartlariLoading}
                >
                  {firmaKrediKartlariLoading && (
                    <MenuItem disabled>
                      <Typography variant="caption" color="text.secondary">
                        Firma kredi kartları yükleniyor...
                      </Typography>
                    </MenuItem>
                  )}
                  {firmaKrediKartlari.filter(kart => kart.aktif).map((kart) => (
                    <MenuItem key={kart.id} value={kart.id}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {kart.kartAdi} - {kart.bankaAdi}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {kart.kartKodu} - Son 4 Hane: {kart.sonDortHane} - Limit: {formatMoney(kart.limit)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                  {!firmaKrediKartlariLoading && firmaKrediKartlari.filter(kart => kart.aktif).length === 0 && (
                    <MenuItem disabled>
                      <Typography variant="caption" color="error">
                        Bu kasa için aktif firma kredi kartı bulunamadı
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Kart bilgileri sadece tahsilat için gösterilir (POS ile müşteriden alırken) */}
          {/* Ödeme için (Firma Kredi Kartı) kart bilgileri kasa içinde zaten var, göstermeye gerek yok */}
          {localFormData.odemeTipi === 'KREDI_KARTI' && localFormData.tip === 'TAHSILAT' && (
            <>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Kart Sahibi"
                  value={localFormData.kartSahibi}
                  onChange={(e) => handleLocalChange('kartSahibi', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Kart Son 4 Hanesi"
                  value={localFormData.kartSonDort}
                  onChange={(e) => handleLocalChange('kartSonDort', e.target.value)}
                  inputProps={{ maxLength: 4 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Banka Adı"
                  value={localFormData.bankaAdi}
                  onChange={(e) => handleLocalChange('bankaAdi', e.target.value)}
                />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Açıklama"
              multiline
              rows={2}
              value={localFormData.aciklama}
              onChange={(e) => handleLocalChange('aciklama', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button
          onClick={handleLocalSubmit}
          variant="contained"
          disabled={submitting}
          sx={{
            bgcolor: localFormData.tip === 'TAHSILAT' ? '#10b981' : '#ef4444',
            '&:hover': {
              bgcolor: localFormData.tip === 'TAHSILAT' ? '#059669' : '#dc2626',
            }
          }}
        >
          {submitting ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

TahsilatFormDialog.displayName = 'TahsilatFormDialog';
