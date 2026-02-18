'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  Autocomplete,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  AccountBalance,
  CreditCard,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Visibility,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { turkiyeBankalari, kartTipleri } from '@/lib/banks';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Kasa {
  id: string;
  kasaKodu: string;
  kasaAdi: string;
  kasaTipi: 'NAKIT' | 'BANKA' | 'FIRMA_KREDI_KARTI' | 'CEK_SENET';
  bakiye: number;
  aktif: boolean;
  bankaHesaplari?: BankaHesabi[];
  firmaKrediKartlari?: FirmaKrediKarti[];
}

interface BankaHesabi {
  id: string;
  hesapKodu: string;
  hesapAdi: string;
  bankaAdi: string;
  subeKodu?: string;
  subeAdi?: string;
  hesapNo?: string;
  iban?: string;
  hesapTipi: 'VADESIZ' | 'POS';
  bakiye: number;
  aktif: boolean;
}

interface FirmaKrediKarti {
  id: string;
  kartKodu: string;
  kartAdi: string;
  bankaAdi: string;
  kartTipi?: string;
  sonDortHane?: string;
  limit?: number;
  bakiye: number;
  hesapKesimTarihi?: string;
  sonOdemeTarihi?: string;
  aktif: boolean;
}

interface Tahsilat {
  id: string;
  tip: 'TAHSILAT' | 'ODEME';
  tutar: number;
  tarih: string;
  odemeTipi: 'NAKIT' | 'KREDI_KARTI';
  aciklama?: string;
  createdAt?: string;
  cari: {
    cariKodu: string;
    unvan: string;
  };
  kasa: {
    kasaKodu: string;
    kasaAdi: string;
    kasaTipi: string;
  } | null;
}

interface BankaHavale {
  id: string;
  hareketTipi: 'GELEN' | 'GIDEN';
  bankaHesabiId: string;
  cariId: string;
  tutar: number;
  tarih: string;
  aciklama?: string;
  referansNo?: string;
  cari: {
    cariKodu: string;
    unvan: string;
  };
}

interface KasaHareketi {
  id: string;
  hareketTipi: 'TAHSILAT' | 'ODEME' | 'GELEN_HAVALE' | 'GIDEN_HAVALE';
  tutar: number;
  tarih: string;
  cari?: {
    cariKodu: string;
    unvan: string;
  };
  aciklama?: string;
  referansNo?: string;
  odemeTipi?: 'NAKIT' | 'KREDI_KARTI';
}

interface BankaHesapHareket {
  id: string;
  hareketTipi: string; // HAVALE_GELEN, HAVALE_GIDEN, KREDI_KARTI_TAHSILAT
  tutar: number;
  bakiye: number;
  tarih: string;
  aciklama?: string;
  referansNo?: string;
  cari?: {
    id: string;
    cariKodu: string;
    unvan: string;
  };
}

interface BankaHesabiWithKasa {
  id: string;
  hesapKodu: string;
  hesapAdi?: string;
  bankaAdi: string;
  bakiye: number;
  kasaId: string;
  kasa?: {
    id: string;
    kasaKodu: string;
    kasaAdi: string;
  };
}

// Banka Hesabı Hareketleri Component
interface BankaHesabiHareketleriProps {
  bankaHesabiId: string;
}

const BankaHesabiHareketleri: React.FC<BankaHesabiHareketleriProps> = ({ bankaHesabiId }) => {
  // Önce banka hesabı bilgisini al (kasaId'yi öğrenmek için)
  const { data: hesapData, isLoading: hesapLoading } = useQuery<BankaHesabiWithKasa>({
    queryKey: ['banka-hesap', bankaHesabiId],
    queryFn: async () => {
      const response = await axios.get(`/banka-hesap/${bankaHesabiId}`);
      return response.data;
    },
    enabled: !!bankaHesabiId,
  });

  // BankaHesapHareket kayıtlarını al (spesifik hesap için)
  const { data: hareketlerData, isLoading: hareketlerLoading } = useQuery<{ hareketler: any[] }>({
    queryKey: ['banka-hesap', 'hareketler', bankaHesabiId],
    queryFn: async () => {
      const response = await axios.get(`/banka-hesap/${bankaHesabiId}`);
      return response.data;
    },
    enabled: !!bankaHesabiId,
  });

  const havaleHareketleri = hareketlerData?.hareketler || [];

  const isLoading = hesapLoading || hareketlerLoading;

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hesapData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Banka hesabı bilgileri yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (!havaleHareketleri || havaleHareketleri.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Toplam Bakiye
          </Typography>
          <Typography variant="h6" fontWeight="bold" color={hesapData.bakiye >= 0 ? 'success.main' : 'error.main'}>
            {formatMoney(hesapData.bakiye)}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" align="center">
          Bu banka hesabı için henüz havale işlemi bulunamadı
        </Typography>
      </Box>
    );
  }

  const columns: GridColDef[] = [
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 120,
      renderCell: (params: any) => {
        const row = params.row as BankaHesapHareket;
        return (
          <Typography variant="body2">
            {formatDate(row?.tarih)}
          </Typography>
        );
      },
      valueGetter: (params: any) => {
        const row = params.row as BankaHesapHareket;
        return row?.tarih ? new Date(row.tarih).getTime() : 0;
      },
    },
    {
      field: 'hareketTipi',
      headerName: 'Tip',
      width: 160,
      renderCell: (params: any) => {
        const tip = params.row.hareketTipi;
        const labels: Record<string, string> = {
          HAVALE_GELEN: 'Gelen Havale',
          HAVALE_GIDEN: 'Giden Havale',
          KREDI_KARTI_TAHSILAT: 'Kredi Kartı Tahsilat',
        };
        const colors: Record<string, { bg: string; color: string }> = {
          HAVALE_GELEN: { bg: '#eff6ff', color: '#3b82f6' },
          HAVALE_GIDEN: { bg: '#fef3c7', color: '#f59e0b' },
          KREDI_KARTI_TAHSILAT: { bg: '#ecfdf5', color: '#10b981' },
        };
        const color = colors[tip] || { bg: '#f3f4f6', color: '#6b7280' };
        return (
          <Chip
            label={labels[tip] || tip}
            size="small"
            sx={{
              bgcolor: color.bg,
              color: color.color,
              fontWeight: 600,
            }}
          />
        );
      },
    },
    {
      field: 'cari',
      headerName: 'Cari',
      width: 250,
      renderCell: (params: any) => {
        const row = params.row as BankaHesapHareket;
        if (row?.cari) {
          return (
            <Typography variant="body2">
              {row.cari.cariKodu} - {row.cari.unvan}
            </Typography>
          );
        }
        return (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        );
      },
    },
    {
      field: 'tutar',
      headerName: 'Tutar',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: any) => {
        const row = params.row as BankaHesapHareket;
        const tutar = row?.tutar || 0;
        const tip = row?.hareketTipi;
        const isPositive = tip === 'HAVALE_GELEN' || tip === 'KREDI_KARTI_TAHSILAT';
        return (
          <Typography
            variant="body2"
            fontWeight={600}
            color={isPositive ? 'success.main' : 'error.main'}
          >
            {isPositive ? '+' : '-'}{formatMoney(tutar)}
          </Typography>
        );
      },
      valueGetter: (params: any) => params?.row?.tutar || 0,
    },
    {
      field: 'bakiye',
      headerName: 'Bakiye',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: any) => {
        const row = params.row as BankaHesapHareket;
        const bakiye = row?.bakiye || 0;
        return (
          <Typography
            variant="body2"
            fontWeight={600}
            color={bakiye >= 0 ? 'success.main' : 'error.main'}
          >
            {formatMoney(bakiye)}
          </Typography>
        );
      },
      valueGetter: (params: any) => params?.row?.bakiye || 0,
    },
    {
      field: 'referansNo',
      headerName: 'Referans No',
      width: 150,
      renderCell: (params: any) => {
        const row = params.row as BankaHesapHareket;
        return (
          <Typography variant="body2">
            {row?.referansNo || '-'}
          </Typography>
        );
      },
    },
    {
      field: 'aciklama',
      headerName: 'Açıklama',
      width: 250,
      renderCell: (params: any) => {
        const row = params.row as BankaHesapHareket;
        return (
          <Typography variant="body2">
            {row?.aciklama || '-'}
          </Typography>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam Bakiye
        </Typography>
        <Typography variant="h6" fontWeight="bold" color={hesapData.bakiye >= 0 ? 'success.main' : 'error.main'}>
          {formatMoney(hesapData.bakiye)}
        </Typography>
      </Box>
      <Paper>
        <DataGrid
          rows={havaleHareketleri}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#f8f9fa',
              fontWeight: 600,
            },
          }}
          initialState={{
            sorting: {
              sortModel: [{ field: 'tarih', sort: 'desc' }],
            },
          }}
        />
      </Paper>
    </Box>
  );
};

// Kasa Hareketleri Component
interface KasaHareketleriProps {
  kasaId: string;
  kasaTipi: 'NAKIT' | 'BANKA' | 'FIRMA_KREDI_KARTI' | 'CEK_SENET';
}

const KasaHareketleri: React.FC<KasaHareketleriProps> = ({ kasaId, kasaTipi }) => {
  // Tahsilat/Ödeme hareketleri
  const { data: tahsilatHareketleri, isLoading: tahsilatLoading } = useQuery<Tahsilat[]>({
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

  // Banka havale hareketleri (sadece BANKA kasası için)
  const { data: havaleHareketleri, isLoading: havaleLoading } = useQuery<BankaHavale[]>({
    queryKey: ['banka-havale', 'kasa', kasaId],
    queryFn: async () => {
      const response = await axios.get('/banka-havale', {
        params: {
          bankaHesabiId: kasaId,
        },
      });
      return response.data ?? [];
    },
    enabled: !!kasaId && kasaTipi === 'BANKA',
  });

  // Birleştirilmiş hareketler
  const hareketler: KasaHareketi[] = useMemo(() => {
    const allHareketler: KasaHareketi[] = [];

    // Tahsilat/Ödeme hareketlerini ekle
    if (tahsilatHareketleri) {
      tahsilatHareketleri.forEach((tahsilat) => {
        allHareketler.push({
          id: `tahsilat-${tahsilat.id}`,
          hareketTipi: tahsilat.tip === 'TAHSILAT' ? 'TAHSILAT' : 'ODEME',
          tutar: tahsilat.tutar,
          tarih: tahsilat.tarih,
          cari: tahsilat.cari,
          aciklama: tahsilat.aciklama,
          odemeTipi: tahsilat.odemeTipi,
        });
      });
    }

    // Banka havale hareketlerini ekle (sadece BANKA kasası için)
    if (kasaTipi === 'BANKA' && havaleHareketleri) {
      havaleHareketleri.forEach((havale) => {
        allHareketler.push({
          id: `havale-${havale.id}`,
          hareketTipi: havale.hareketTipi === 'GELEN' ? 'GELEN_HAVALE' : 'GIDEN_HAVALE',
          tutar: havale.tutar,
          tarih: havale.tarih,
          cari: havale.cari,
          aciklama: havale.aciklama,
          referansNo: havale.referansNo,
        });
      });
    }

    // Tarihe göre sırala (yeni -> eski)
    return allHareketler.sort((a, b) => {
      const dateA = new Date(a.tarih).getTime();
      const dateB = new Date(b.tarih).getTime();
      return dateB - dateA;
    });
  }, [tahsilatHareketleri, havaleHareketleri, kasaTipi]);

  const isLoading = tahsilatLoading || (kasaTipi === 'BANKA' && havaleLoading);

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 120,
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        return (
          <Typography variant="body2">
            {formatDate(row?.tarih)}
          </Typography>
        );
      },
      valueGetter: (params: any) => {
        const row = params.row as KasaHareketi;
        return row?.tarih ? new Date(row.tarih).getTime() : 0;
      },
    },
    {
      field: 'hareketTipi',
      headerName: 'Tip',
      width: 140,
      renderCell: (params: any) => {
        const tip = params.row.hareketTipi;
        const labels: Record<string, string> = {
          TAHSILAT: 'Tahsilat',
          ODEME: 'Ödeme',
          GELEN_HAVALE: 'Gelen Havale',
          GIDEN_HAVALE: 'Giden Havale',
        };
        const colors: Record<string, { bg: string; color: string }> = {
          TAHSILAT: { bg: '#ecfdf5', color: '#10b981' },
          ODEME: { bg: '#fef2f2', color: '#ef4444' },
          GELEN_HAVALE: { bg: '#eff6ff', color: '#3b82f6' },
          GIDEN_HAVALE: { bg: '#fef3c7', color: '#f59e0b' },
        };
        const color = colors[tip] || { bg: '#f3f4f6', color: '#6b7280' };
        return (
          <Chip
            label={labels[tip] || tip}
            size="small"
            sx={{
              bgcolor: color.bg,
              color: color.color,
              fontWeight: 600,
            }}
          />
        );
      },
    },
    {
      field: 'cari',
      headerName: 'Cari',
      width: 250,
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        if (row?.cari) {
          return (
            <Typography variant="body2">
              {row.cari.cariKodu} - {row.cari.unvan}
            </Typography>
          );
        }
        return (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        );
      },
      valueGetter: (params: any) => {
        const row = params.row as KasaHareketi;
        return row?.cari ? `${row.cari.cariKodu} - ${row.cari.unvan}` : '';
      },
    },
    {
      field: 'tutar',
      headerName: 'Tutar',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        const tutar = row?.tutar || 0;
        const tip = row?.hareketTipi;
        const isPositive = tip === 'TAHSILAT' || tip === 'GELEN_HAVALE';
        return (
          <Typography
            variant="body2"
            fontWeight={600}
            color={isPositive ? 'success.main' : 'error.main'}
          >
            {isPositive ? '+' : '-'}{formatMoney(tutar)}
          </Typography>
        );
      },
      valueGetter: (params: any) => params?.row?.tutar || 0,
    },
    {
      field: 'odemeTipi',
      headerName: 'Ödeme Tipi',
      width: 130,
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        const tip = row.odemeTipi;
        if (!tip) return null;
        return (
          <Chip
            label={tip === 'NAKIT' ? 'Nakit' : 'Kredi Kartı'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'aciklama',
      headerName: 'Açıklama',
      width: 250,
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        return (
          <Typography variant="body2">
            {row?.aciklama || '-'}
          </Typography>
        );
      },
      valueGetter: (params: any) => params?.row?.aciklama || '',
    },
    {
      field: 'referansNo',
      headerName: 'Referans No',
      width: 150,
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        return (
          <Typography variant="body2">
            {row?.referansNo || '-'}
          </Typography>
        );
      },
      valueGetter: (params: any) => params?.row?.referansNo || '',
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hareketler || hareketler.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Bu kasa için henüz hareket bulunamadı
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <DataGrid
        rows={hareketler}
        columns={columns}
        getRowId={(row) => row.id}
        autoHeight
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: '#f8f9fa',
            fontWeight: 600,
          },
        }}
        initialState={{
          sorting: {
            sortModel: [{ field: 'tarih', sort: 'desc' }],
          },
        }}
      />
    </Paper>
  );
};

export default function KasaDetayPage() {
  const params = useParams();
  const router = useRouter();
  const kasaId = params.id as string;

  const [kasa, setKasa] = useState<Kasa | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openHareketlerDialog, setOpenHareketlerDialog] = useState(false);
  const [selectedBankaHesabi, setSelectedBankaHesabi] = useState<BankaHesabi | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Banka Hesabı Form
  const [bankaHesapForm, setBankaHesapForm] = useState({
    hesapKodu: '',
    hesapAdi: '',
    bankaAdi: '',
    subeKodu: '',
    subeAdi: '',
    hesapNo: '',
    iban: '',
    hesapTipi: 'VADESIZ' as 'VADESIZ' | 'POS',
    aktif: true,
  });

  // Firma Kredi Kartı Form
  const [firmaKartForm, setFirmaKartForm] = useState({
    kartKodu: '',
    kartAdi: '',
    bankaAdi: '',
    kartTipi: '',
    sonDortHane: '',
    limit: 0,
    hesapKesimTarihi: '',
    sonOdemeTarihi: '',
    aktif: true,
  });

  useEffect(() => {
    fetchKasa();
  }, [kasaId]);

  const fetchKasa = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/kasa/${kasaId}`);
      setKasa(response.data);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kasa yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  // ==================== BANKA HESAP YÖNETİMİ ====================

  const handleOpenBankaHesapDialog = (hesap?: BankaHesabi) => {
    if (hesap) {
      setEditingItem(hesap);
      setBankaHesapForm({
        hesapKodu: hesap.hesapKodu || '',
        hesapAdi: hesap.hesapAdi || '',
        bankaAdi: hesap.bankaAdi || '',
        subeKodu: hesap.subeKodu || '',
        subeAdi: hesap.subeAdi || '',
        hesapNo: hesap.hesapNo || '',
        iban: hesap.iban || '',
        hesapTipi: hesap.hesapTipi,
        aktif: hesap.aktif,
      });
    } else {
      setEditingItem(null);
      setBankaHesapForm({
        hesapKodu: '',
        hesapAdi: '',
        bankaAdi: '',
        subeKodu: '',
        subeAdi: '',
        hesapNo: '',
        iban: '',
        hesapTipi: 'VADESIZ',
        aktif: true,
      });
    }
    setOpenDialog(true);
  };

  const handleSaveBankaHesap = async () => {
    try {
      if (editingItem) {
        // Update: kasaId gönderilmez
        const dataToSend = {
          ...bankaHesapForm,
          hesapKodu: bankaHesapForm.hesapKodu.trim() || undefined,
        };
        await axios.put(`/banka-hesap/${editingItem.id}`, dataToSend);
        showSnackbar('Banka hesabı güncellendi', 'success');
      } else {
        // Create: kasaId gönderilir
        const dataToSend = {
          ...bankaHesapForm,
          kasaId: kasaId,
          hesapKodu: bankaHesapForm.hesapKodu.trim() || undefined,
        };
        await axios.post('/banka-hesap', dataToSend);
        showSnackbar('Banka hesabı eklendi', 'success');
      }
      setOpenDialog(false);
      fetchKasa();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
    }
  };

  const handleDeleteBankaHesap = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(`/banka-hesap/${deleteTarget.id}`);
      showSnackbar('Banka hesabı silindi', 'success');
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      fetchKasa();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme başarısız', 'error');
    }
  };

  // ==================== FİRMA KREDİ KARTI YÖNETİMİ ====================

  const handleOpenFirmaKartDialog = (kart?: FirmaKrediKarti) => {
    if (kart) {
      setEditingItem(kart);
      setFirmaKartForm({
        kartKodu: kart.kartKodu || '',
        kartAdi: kart.kartAdi || '',
        bankaAdi: kart.bankaAdi || '',
        kartTipi: kart.kartTipi || '',
        sonDortHane: kart.sonDortHane || '',
        limit: kart.limit || 0,
        hesapKesimTarihi: kart.hesapKesimTarihi ? new Date(kart.hesapKesimTarihi).toISOString().split('T')[0] : '',
        sonOdemeTarihi: kart.sonOdemeTarihi ? new Date(kart.sonOdemeTarihi).toISOString().split('T')[0] : '',
        aktif: kart.aktif,
      });
    } else {
      setEditingItem(null);
      setFirmaKartForm({
        kartKodu: '',
        kartAdi: '',
        bankaAdi: '',
        kartTipi: '',
        sonDortHane: '',
        limit: 0,
        hesapKesimTarihi: '',
        sonOdemeTarihi: '',
        aktif: true,
      });
    }
    setOpenDialog(true);
  };

  const handleSaveFirmaKart = async () => {
    try {
      if (editingItem) {
        // Update: kasaId gönderilmez, sadece form verileri gönderilir
        const dataToSend = {
          kartKodu: firmaKartForm.kartKodu.trim() || undefined,
          kartAdi: firmaKartForm.kartAdi,
          bankaAdi: firmaKartForm.bankaAdi,
          kartTipi: firmaKartForm.kartTipi || undefined,
          sonDortHane: firmaKartForm.sonDortHane || undefined,
          limit: firmaKartForm.limit || 0,
          hesapKesimTarihi: firmaKartForm.hesapKesimTarihi || undefined,
          sonOdemeTarihi: firmaKartForm.sonOdemeTarihi || undefined,
          aktif: firmaKartForm.aktif,
        };
        await axios.put(`/firma-kredi-karti/${editingItem.id}`, dataToSend);
        showSnackbar('Firma kredi kartı güncellendi', 'success');
      } else {
        // Create: kasaId gönderilir
        const dataToSend = {
          ...firmaKartForm,
          kasaId: kasaId,
          kartKodu: firmaKartForm.kartKodu.trim() || undefined,
          hesapKesimTarihi: firmaKartForm.hesapKesimTarihi || undefined,
          sonOdemeTarihi: firmaKartForm.sonOdemeTarihi || undefined,
        };
        await axios.post('/firma-kredi-karti', dataToSend);
        showSnackbar('Firma kredi kartı eklendi', 'success');
      }
      setOpenDialog(false);
      fetchKasa();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
    }
  };

  const handleDeleteFirmaKart = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(`/firma-kredi-karti/${deleteTarget.id}`);
      showSnackbar('Firma kredi kartı silindi', 'success');
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      fetchKasa();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme başarısız', 'error');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!kasa) {
    return (
      <MainLayout>
        <Alert severity="error">Kasa bulunamadı</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/kasa')}
            sx={{ mb: 2 }}
          >
            Kasalara Dön
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {kasa.kasaAdi}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {kasa.kasaKodu} - {kasa.kasaTipi}
              </Typography>
            </Box>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Toplam Bakiye
                </Typography>
                <Typography variant="h4" fontWeight="bold" color={kasa.bakiye >= 0 ? 'success.main' : 'error.main'}>
                  {formatMoney(kasa.bakiye)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* NAKİT KASA */}
        {kasa.kasaTipi === 'NAKIT' && (
          <Alert severity="info">
            💵 Nakit kasa için doğrudan tahsilat ve ödeme işlemleri yapılır.
            <br />
            <strong>Tahsilat & Ödeme</strong> menüsünden işlem yapabilirsiniz.
          </Alert>
        )}

        {/* ÇEK/SENET KASASI */}
        {kasa.kasaTipi === 'CEK_SENET' && (
          <Alert severity="info">
            📄 Çek ve Senet kasası için <strong>Bordro (Çek/Senet)</strong> menüsünden işlem yapabilirsiniz.
          </Alert>
        )}

        {/* KASA HAREKETLERİ - Tüm kasa tipleri için */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            💰 Kasa Hareketleri
          </Typography>
          <KasaHareketleri kasaId={kasaId} kasaTipi={kasa.kasaTipi} />
        </Box>

        {/* BANKA KASASI - Banka Hesapları */}
        {kasa.kasaTipi === 'BANKA' && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                🏦 Banka Hesapları
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenBankaHesapDialog()}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                }}
              >
                Yeni Hesap Ekle
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hesap Kodu</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hesap Adı</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Banka / Şube</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hesap No / IBAN</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Bakiye</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!kasa.bankaHesaplari || kasa.bankaHesaplari.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Henüz banka hesabı eklenmemiş
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    kasa.bankaHesaplari.map((hesap) => (
                      <TableRow key={hesap.id} hover>
                        <TableCell>
                          <Chip
                            label={hesap.hesapTipi}
                            size="small"
                            color={hesap.hesapTipi === 'POS' ? 'warning' : 'info'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {hesap.hesapKodu}
                          </Typography>
                        </TableCell>
                        <TableCell>{hesap.hesapAdi}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{hesap.bankaAdi}</Typography>
                            {hesap.subeAdi && (
                              <Typography variant="caption" color="text.secondary">
                                {hesap.subeAdi}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {hesap.hesapNo && (
                              <Typography variant="body2">{hesap.hesapNo}</Typography>
                            )}
                            {hesap.iban && (
                              <Typography variant="caption" color="text.secondary">
                                {hesap.iban}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color={hesap.bakiye >= 0 ? 'success.main' : 'error.main'}>
                            {formatMoney(hesap.bakiye)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedBankaHesabi(hesap);
                              setOpenHareketlerDialog(true);
                            }}
                            title="Hareketleri Görüntüle"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleOpenBankaHesapDialog(hesap)}
                            title="Düzenle"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setDeleteTarget(hesap);
                              setOpenDeleteDialog(true);
                            }}
                            title="Sil"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* FİRMA KREDİ KARTI KASASI - Kredi Kartları */}
        {kasa.kasaTipi === 'FIRMA_KREDI_KARTI' && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                💳 Firma Kredi Kartları
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenFirmaKartDialog()}
                sx={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                }}
              >
                Yeni Kart Ekle
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Kart Kodu</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Kart Adı</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Banka / Kart Tipi</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Son 4 Hane</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Limit</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Harcanan</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Kalan</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!kasa.firmaKrediKartlari || kasa.firmaKrediKartlari.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Henüz kredi kartı eklenmemiş
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    kasa.firmaKrediKartlari.map((kart) => (
                      <TableRow key={kart.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {kart.kartKodu}
                          </Typography>
                        </TableCell>
                        <TableCell>{kart.kartAdi}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{kart.bankaAdi}</Typography>
                            {kart.kartTipi && (
                              <Typography variant="caption" color="text.secondary">
                                {kart.kartTipi}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {kart.sonDortHane && (
                            <Chip label={`****${kart.sonDortHane}`} size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {kart.limit ? formatMoney(kart.limit) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="error.main">
                            {formatMoney(kart.bakiye)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color={kart.limit ? 'success.main' : 'text.secondary'}>
                            {kart.limit ? formatMoney(kart.limit - kart.bakiye) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleOpenFirmaKartDialog(kart)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setDeleteTarget(kart);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* BANKA HESAP DIALOG */}
        <Dialog open={openDialog && kasa.kasaTipi === 'BANKA'} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#3b82f6', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance />
              {editingItem ? 'Banka Hesabı Düzenle' : 'Yeni Banka Hesabı Ekle'}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Hesap Kodu"
                  value={bankaHesapForm.hesapKodu || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, hesapKodu: e.target.value })}
                  placeholder="Otomatik"
                  helperText="Boş bırakılırsa otomatik"
                  disabled={!!editingItem}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Hesap Adı"
                  value={bankaHesapForm.hesapAdi || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, hesapAdi: e.target.value })}
                  placeholder="Hesap adı (opsiyonel)"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  freeSolo
                  options={turkiyeBankalari}
                  value={bankaHesapForm.bankaAdi || ''}
                  onChange={(e, value) => setBankaHesapForm({ ...bankaHesapForm, bankaAdi: value || '' })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Banka Adı *"
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Hesap Tipi</InputLabel>
                  <Select
                    value={bankaHesapForm.hesapTipi}
                    label="Hesap Tipi"
                    onChange={(e: any) => setBankaHesapForm({ ...bankaHesapForm, hesapTipi: e.target.value })}
                    disabled={!!editingItem}
                  >
                    <MenuItem value="VADESIZ">
                      <Box>
                        <Typography variant="body2">💰 Vadesiz Hesap</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Gelen/giden havale işlemleri
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="POS">
                      <Box>
                        <Typography variant="body2">💳 POS Hesabı</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Kredi kartı tahsilatları
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Şube Kodu"
                  value={bankaHesapForm.subeKodu || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, subeKodu: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Şube Adı"
                  value={bankaHesapForm.subeAdi || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, subeAdi: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Hesap No"
                  value={bankaHesapForm.hesapNo || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, hesapNo: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="IBAN"
                  value={bankaHesapForm.iban || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, iban: e.target.value })}
                  placeholder="TR..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSaveBankaHesap} disabled={!bankaHesapForm.bankaAdi}>
              {editingItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* FİRMA KREDİ KARTI DIALOG */}
        <Dialog open={openDialog && kasa.kasaTipi === 'FIRMA_KREDI_KARTI'} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#ef4444', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCard />
              {editingItem ? 'Firma Kredi Kartı Düzenle' : 'Yeni Firma Kredi Kartı Ekle'}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Kart Kodu"
                  value={firmaKartForm.kartKodu || ''}
                  onChange={(e) => setFirmaKartForm({ ...firmaKartForm, kartKodu: e.target.value })}
                  placeholder="Otomatik"
                  helperText={editingItem ? "Kart kodu değiştirilemez" : "Boş bırakılırsa otomatik oluşturulur"}
                  disabled={!!editingItem}
                  sx={{ mt: 1 }}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Kart Adı"
                  value={firmaKartForm.kartAdi || ''}
                  onChange={(e) => setFirmaKartForm({ ...firmaKartForm, kartAdi: e.target.value })}
                  placeholder="Örn: Ziraat Visa - Ahmet Bey"
                  required
                  sx={{ mt: 1 }}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                      '&.Mui-error': {
                        color: 'error.main',
                      },
                    },
                  }}
                  error={!firmaKartForm.kartAdi}
                  helperText={!firmaKartForm.kartAdi ? "Kart adı zorunludur" : ""}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  freeSolo
                  options={turkiyeBankalari}
                  value={firmaKartForm.bankaAdi || ''}
                  onChange={(e, value) => setFirmaKartForm({ ...firmaKartForm, bankaAdi: value || '' })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Banka Adı"
                      required
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          fontSize: '1rem',
                          fontWeight: 500,
                          color: 'text.primary',
                          whiteSpace: 'nowrap',
                          overflow: 'visible',
                          textOverflow: 'clip',
                          maxWidth: '100%',
                          '&.Mui-focused': {
                            color: 'primary.main',
                          },
                          '&.Mui-error': {
                            color: 'error.main',
                          },
                        },
                      }}
                      error={!firmaKartForm.bankaAdi}
                      helperText={!firmaKartForm.bankaAdi ? "Banka adı zorunludur" : ""}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  freeSolo
                  options={kartTipleri}
                  value={firmaKartForm.kartTipi || ''}
                  onChange={(e, value) => setFirmaKartForm({ ...firmaKartForm, kartTipi: value || '' })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Kart Tipi"
                      placeholder="Visa, MasterCard vb."
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          fontSize: '1rem',
                          fontWeight: 500,
                          color: 'text.primary',
                          whiteSpace: 'nowrap',
                          overflow: 'visible',
                          textOverflow: 'clip',
                          maxWidth: '100%',
                          '&.Mui-focused': {
                            color: 'primary.main',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Son 4 Hane"
                  value={firmaKartForm.sonDortHane || ''}
                  onChange={(e) => setFirmaKartForm({ ...firmaKartForm, sonDortHane: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  inputProps={{ maxLength: 4 }}
                  placeholder="1234"
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                  helperText="Kart numarasının son 4 hanesi"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Kart Limiti"
                  value={firmaKartForm.limit}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFirmaKartForm({ ...firmaKartForm, limit: value === '' ? 0 : Math.max(0, parseFloat(value) || 0) });
                  }}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      step: 0.01,
                    },
                  }}
                  helperText={firmaKartForm.limit === 0 ? "0 = Limitsiz (limitsiz harcama)" : "Kartın maksimum harcama limiti"}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Hesap Kesim Tarihi"
                  value={firmaKartForm.hesapKesimTarihi || ''}
                  onChange={(e) => setFirmaKartForm({ ...firmaKartForm, hesapKesimTarihi: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                  helperText="Kredi kartı hesap kesim tarihi"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Son Ödeme Tarihi"
                  value={firmaKartForm.sonOdemeTarihi || ''}
                  onChange={(e) => setFirmaKartForm({ ...firmaKartForm, sonOdemeTarihi: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                  helperText="Son ödeme tarihi"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSaveFirmaKart} disabled={!firmaKartForm.kartAdi || !firmaKartForm.bankaAdi}>
              {editingItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* BANKA HESABI HAREKETLER DIALOG */}
        <Dialog
          open={openHareketlerDialog}
          onClose={() => setOpenHareketlerDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance />
              {selectedBankaHesabi
                ? `${selectedBankaHesabi.bankaAdi} - ${selectedBankaHesabi.hesapAdi || selectedBankaHesabi.hesapKodu} Hareketleri`
                : 'Banka Hesabı Hareketleri'}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {selectedBankaHesabi && (
              <BankaHesabiHareketleri
                bankaHesabiId={selectedBankaHesabi.id}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenHareketlerDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* SİLME ONAY DIALOG */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Silme Onayı</DialogTitle>
          <DialogContent>
            <Alert severity="warning">
              <Typography>
                <strong>{deleteTarget?.hesapAdi || deleteTarget?.kartAdi}</strong> kaydını silmek istediğinizden emin misiniz?
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>İptal</Button>
            <Button
              onClick={kasa.kasaTipi === 'BANKA' ? handleDeleteBankaHesap : handleDeleteFirmaKart}
              color="error"
              variant="contained"
            >
              Sil
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
      </Box>
    </MainLayout>
  );
}
