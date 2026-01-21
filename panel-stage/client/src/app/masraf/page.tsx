'use client';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import {
  Add,
  AttachMoney,
  Category,
  Delete,
  Edit,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
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
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

interface MasrafKategori {
  id: string;
  kategoriAdi: string;
  aciklama?: string;
  _count?: {
    masraflar: number;
  };
}

interface Masraf {
  id: string;
  kategoriId: string;
  aciklama: string;
  tutar: number;
  tarih: string;
  odemeTipi: string;
  createdAt: string;
  updatedAt: string;
  kategori: MasrafKategori;
}

interface Stats {
  toplamMasraf: number;
  toplamAdet: number;
  kategoriler: Array<{
    kategoriId: string;
    kategoriAdi: string;
    adet: number;
    toplam: number;
  }>;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value);

const formatDate = (dateString: string | Date | undefined | null) => {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    return '-';
  }
};

const ODEME_TIPI_LABELS: Record<string, string> = {
  NAKIT: 'Nakit',
  KREDI_KARTI: 'Kredi Kartı',
  BANKA_HAVALESI: 'Banka Havalesi',
  CEK: 'Çek',
  SENET: 'Senet',
};

const ODEME_TIPI_COLORS: Record<string, string> = {
  NAKIT: '#10b981',
  KREDI_KARTI: '#3b82f6',
  BANKA_HAVALESI: '#0891b2',
  CEK: '#7c3aed',
  SENET: '#6366f1',
};

const getOdemeTipiLabel = (tip: string) => ODEME_TIPI_LABELS[tip] || tip;
const getOdemeTipiColor = (tip: string) => ODEME_TIPI_COLORS[tip] || '#6b7280';

const DataGridNoRowsOverlay = () => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--muted-foreground)',
    }}
  >
    Kayıt bulunamadı
  </Box>
);

// Form Dialog
const MasrafFormDialog = memo(({
  open,
  editMode,
  formData,
  kategoriler,
  loading,
  onClose,
  onSubmit,
  onFormChange
}: any) => {
  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'var(--card)',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'var(--destructive)', 
        color: 'var(--destructive-foreground)',
        borderBottom: '1px solid var(--border)',
      }}>
        {editMode ? 'Masraf Düzenle' : 'Yeni Masraf'}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: 'var(--background)' }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required className="form-control-select">
              <InputLabel>Kategori</InputLabel>
              <Select
                value={formData.kategoriId}
                onChange={(e) => onFormChange('kategoriId', e.target.value)}
                label="Kategori"
              >
                {kategoriler.map((kat: MasrafKategori) => (
                  <MenuItem key={kat.id} value={kat.id}>
                    {kat.kategoriAdi}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required className="form-control-select">
              <InputLabel>Ödeme Tipi</InputLabel>
              <Select
                value={formData.odemeTipi}
                onChange={(e) => onFormChange('odemeTipi', e.target.value)}
                label="Ödeme Tipi"
              >
                <MenuItem value="NAKIT">Nakit</MenuItem>
                <MenuItem value="KREDI_KARTI">Kredi Kartı</MenuItem>
                <MenuItem value="BANKA_HAVALESI">Banka Havalesi</MenuItem>
                <MenuItem value="CEK">Çek</MenuItem>
                <MenuItem value="SENET">Senet</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="number"
              className="form-control-textfield"
              label="Tutar"
              value={formData.tutar}
              onChange={(e) => onFormChange('tutar', e.target.value)}
              inputProps={{ min: 0.01, step: 0.01 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              className="form-control-textfield"
              label="Tarih"
              value={formData.tarih}
              onChange={(e) => onFormChange('tarih', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Açıklama"
              className="form-control-textfield"
              value={formData.aciklama}
              onChange={(e) => onFormChange('aciklama', e.target.value)}
              multiline
              rows={3}
              placeholder="Masraf açıklaması (opsiyonel)..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ bgcolor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <Button 
          onClick={onClose}
          sx={{
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
            '&:hover': {
              borderColor: 'var(--primary)',
              bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
            },
          }}
        >
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          sx={{ 
            bgcolor: 'var(--destructive)', 
            color: 'var(--destructive-foreground)',
            '&:hover': { 
              bgcolor: 'color-mix(in srgb, var(--destructive) 90%, #000 10%)',
            },
          }}
        >
          {editMode ? 'Güncelle' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

MasrafFormDialog.displayName = 'MasrafFormDialog';

export default function MasrafPage() {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openKategoriDialog, setOpenKategoriDialog] = useState(false);
  const [openKategoriDelete, setOpenKategoriDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMasraf, setSelectedMasraf] = useState<Masraf | null>(null);
  const [selectedKategori, setSelectedKategori] = useState<MasrafKategori | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });

  const showSnackbar = useCallback(
    (message: string, severity: 'success' | 'error' | 'info') => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const [filterKategori, setFilterKategori] = useState('');
  const [filterBaslangic, setFilterBaslangic] = useState('');
  const [filterBitis, setFilterBitis] = useState('');

  const [formData, setFormData] = useState({
    kategoriId: '',
    aciklama: '',
    tutar: '',
    tarih: new Date().toISOString().split('T')[0],
    odemeTipi: 'NAKIT',
  });

  const [kategoriFormData, setKategoriFormData] = useState({
    kategoriAdi: '',
    aciklama: '',
  });

  const masrafQueryKey = useMemo(
    () => ['masraflar', filterKategori || null, filterBaslangic || null, filterBitis || null],
    [filterKategori, filterBaslangic, filterBitis],
  );

  const {
    data: masraflar = [],
    isLoading: masrafLoading,
    isFetching: masrafFetching,
    error: masrafError,
  } = useQuery<Masraf[]>({
    queryKey: masrafQueryKey,
    queryFn: async () => {
      const params: Record<string, string | number> = { limit: 100 };
      if (filterKategori) params.kategoriId = filterKategori;
      if (filterBaslangic) params.baslangicTarihi = filterBaslangic;
      if (filterBitis) params.bitisTarihi = filterBitis;

      const response = await axios.get('/masraf', { params });
      const data = response.data?.data ?? [];
      // Debug: Tarih alanını kontrol et
      if (data.length > 0) {
        console.log('Masraf verisi örneği:', data[0]);
        console.log('Tarih alanı:', data[0].tarih, 'Tip:', typeof data[0].tarih);
      }
      return data;
    },
  });

  useEffect(() => {
    if (masrafError) {
      const message =
        (masrafError as any)?.response?.data?.message || 'Kayıtlar yüklenirken hata oluştu';
      showSnackbar(message, 'error');
    }
  }, [masrafError, showSnackbar]);

  const { data: kategoriler = [], isLoading: kategorilerLoading } = useQuery<MasrafKategori[]>({
    queryKey: ['masraf-kategoriler'],
    queryFn: async () => {
      const response = await axios.get('/masraf/kategoriler');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: stats = null, isLoading: statsLoading } = useQuery<Stats | null>({
    queryKey: ['masraf-stats', filterKategori || null, filterBaslangic || null, filterBitis || null],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filterKategori) params.kategoriId = filterKategori;
      if (filterBaslangic) params.baslangicTarihi = filterBaslangic;
      if (filterBitis) params.bitisTarihi = filterBitis;

      const response = await axios.get('/masraf/stats', { params });
      return response.data ?? null;
    },
  });

  const isMasrafLoading = masrafLoading || masrafFetching || actionLoading;

  const handleOpenDialog = useCallback((masraf?: Masraf) => {
    if (masraf) {
      setEditMode(true);
      setSelectedMasraf(masraf);
      setFormData({
        kategoriId: masraf.kategoriId,
        aciklama: masraf.aciklama,
        tutar: String(masraf.tutar),
        tarih: new Date(masraf.tarih).toISOString().split('T')[0],
        odemeTipi: masraf.odemeTipi,
      });
    } else {
      setEditMode(false);
      setSelectedMasraf(null);
      setFormData({
        kategoriId: '',
        aciklama: '',
        tutar: '',
        tarih: new Date().toISOString().split('T')[0],
        odemeTipi: 'NAKIT',
      });
    }
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedMasraf(null);
  }, []);

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    try {
      const tutarNumber = parseFloat(formData.tutar);

      if (!formData.kategoriId || !tutarNumber || tutarNumber <= 0) {
        showSnackbar('Lütfen tüm zorunlu alanları doldurun', 'error');
        return;
      }

      setActionLoading(true);

      const submitData = {
        ...formData,
        tutar: tutarNumber,
      };

      if (editMode && selectedMasraf) {
        await axios.put(`/masraf/${selectedMasraf.id}`, submitData);
        showSnackbar('Masraf kaydı güncellendi', 'success');
      } else {
        await axios.post('/masraf', submitData);
        showSnackbar('Masraf kaydı oluşturuldu', 'success');
      }

      handleCloseDialog();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['masraflar'] }),
        queryClient.invalidateQueries({ queryKey: ['masraf-stats'] }),
      ]);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMasraf) return;

    try {
      setActionLoading(true);
      await axios.delete(`/masraf/${selectedMasraf.id}`);
      showSnackbar('Masraf kaydı silindi', 'success');
      setOpenDelete(false);
      setSelectedMasraf(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['masraflar'] }),
        queryClient.invalidateQueries({ queryKey: ['masraf-stats'] }),
      ]);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Kategori yönetimi
  const [kategoriEditMode, setKategoriEditMode] = useState(false);

  const handleOpenKategoriDialog = (kategori?: MasrafKategori) => {
    if (kategori) {
      setKategoriEditMode(true);
      setSelectedKategori(kategori);
      setKategoriFormData({
        kategoriAdi: kategori.kategoriAdi,
        aciklama: kategori.aciklama || '',
      });
    } else {
      setKategoriEditMode(false);
      setSelectedKategori(null);
      setKategoriFormData({
        kategoriAdi: '',
        aciklama: '',
      });
    }
    setOpenKategoriDialog(true);
  };

  const handleKategoriSubmit = async () => {
    try {
      if (!kategoriFormData.kategoriAdi.trim()) {
        showSnackbar('Kategori adı gereklidir', 'error');
        return;
      }

      setActionLoading(true);

      if (kategoriEditMode && selectedKategori) {
        await axios.put(`/masraf/kategoriler/${selectedKategori.id}`, kategoriFormData);
        showSnackbar('Kategori güncellendi', 'success');
      } else {
        await axios.post('/masraf/kategoriler', kategoriFormData);
        showSnackbar('Kategori oluşturuldu', 'success');
      }

      setOpenKategoriDialog(false);
      setKategoriFormData({ kategoriAdi: '', aciklama: '' });
      setKategoriEditMode(false);
      setSelectedKategori(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['masraf-kategoriler'] }),
        queryClient.invalidateQueries({ queryKey: ['masraf-stats'] }),
      ]);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kategori işlemi sırasında hata oluştu', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleKategoriDelete = async () => {
    if (!selectedKategori) return;

    try {
      setActionLoading(true);
      await axios.delete(`/masraf/kategoriler/${selectedKategori.id}`);
      showSnackbar('Kategori silindi', 'success');
      setOpenKategoriDelete(false);
      setSelectedKategori(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['masraf-kategoriler'] }),
        queryClient.invalidateQueries({ queryKey: ['masraf-stats'] }),
      ]);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kategori silinemedi', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const masrafColumns = useMemo<GridColDef[]>(() => [
    {
      field: 'tarih',
      headerName: 'Tarih',
      minWidth: 130,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        if (!row?.tarih) return <Typography variant="body2">-</Typography>;
        return <Typography variant="body2">{formatDate(row.tarih)}</Typography>;
      },
      valueGetter: (params: any) => {
        if (!params?.row?.tarih) return '';
        return formatDate(params.row.tarih);
      },
    },
    {
      field: 'kategori',
      headerName: 'Kategori',
      flex: 1,
      minWidth: 160,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        if (!row) return <Typography variant="body2">-</Typography>;
        return (
          <Chip
            label={row.kategori?.kategoriAdi || '-'}
            size="small"
            sx={{ 
              bgcolor: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)',
            }}
            variant="outlined"
          />
        );
      },
      valueGetter: (params: any) => params?.row?.kategori?.kategoriAdi || '-',
    },
    {
      field: 'aciklama',
      headerName: 'Açıklama',
      flex: 1.5,
      minWidth: 220,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        return (
          <Typography variant="body2" noWrap sx={{ maxWidth: '100%' }}>
            {row?.aciklama || '-'}
          </Typography>
        );
      },
    },
    {
      field: 'tutar',
      headerName: 'Tutar',
      minWidth: 140,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        if (!row?.tutar) return <Typography variant="body2">-</Typography>;
        return (
          <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--destructive)' }}>
            {formatCurrency(row.tutar)}
          </Typography>
        );
      },
      valueGetter: (params: any) => params?.row?.tutar ? formatCurrency((params.row as Masraf).tutar) : '-',
    },
    {
      field: 'odemeTipi',
      headerName: 'Ödeme Tipi',
      minWidth: 160,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        if (!row?.odemeTipi) return <Typography variant="body2">-</Typography>;
        const colorMap: Record<string, string> = {
          NAKIT: 'var(--chart-2)',
          KREDI_KARTI: 'var(--chart-1)',
          BANKA_HAVALESI: 'var(--secondary)',
          CEK: 'var(--chart-3)',
          SENET: 'var(--primary)',
        };
        const chipColor = colorMap[row.odemeTipi] || 'var(--muted-foreground)';
        return (
          <Chip
            label={getOdemeTipiLabel(row.odemeTipi)}
            size="small"
            sx={{
              bgcolor: `color-mix(in srgb, ${chipColor} 15%, transparent)`,
              color: chipColor,
              borderColor: chipColor,
            }}
            variant="outlined"
          />
        );
      },
      valueGetter: (params: any) => params?.row?.odemeTipi ? getOdemeTipiLabel((params.row as Masraf).odemeTipi) : '-',
    },
    {
      field: 'createdAt',
      headerName: 'Kayıt Tarihi',
      minWidth: 170,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        if (!row) return <Typography variant="body2">-</Typography>;
        return (
          <Box>
            <Typography variant="body2">{formatDate(row.createdAt)}</Typography>
            {row.updatedAt && row.updatedAt !== row.createdAt && (
              <Typography variant="caption" sx={{ color: 'var(--chart-3)' }}>
                Güncellendi
              </Typography>
            )}
          </Box>
        );
      },
      valueGetter: (params: any) => params?.row?.createdAt ? formatDate((params.row as Masraf).createdAt) : '-',
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      sortable: false,
      filterable: false,
      width: 140,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        if (!row) return null;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Düzenle">
              <IconButton 
                size="small" 
                onClick={() => handleOpenDialog(row)}
                sx={{
                  color: 'var(--chart-3)',
                  '&:hover': {
                    bgcolor: 'color-mix(in srgb, var(--chart-3) 10%, transparent)',
                  },
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sil">
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedMasraf(row);
                  setOpenDelete(true);
                }}
                sx={{ 
                  color: 'var(--destructive)',
                  '&:hover': {
                    bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                  },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [handleOpenDialog]);

  return (
    <MainLayout>
      <Box sx={{ p: 3, bgcolor: 'var(--background)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'var(--foreground)',
                letterSpacing: '-0.02em',
                mb: 0.5,
              }}
            >
              <AttachMoney sx={{ fontSize: 40, color: 'var(--destructive)' }} />
              Masraf Yönetimi
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Category />}
              onClick={() => handleOpenKategoriDialog()}
              sx={{ 
                color: 'var(--secondary)', 
                borderColor: 'var(--secondary)',
                '&:hover': {
                  borderColor: 'var(--secondary-hover)',
                  bgcolor: 'color-mix(in srgb, var(--secondary) 10%, transparent)',
                },
              }}
            >
              Kategori Yönetimi
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['masraflar'] });
                queryClient.invalidateQueries({ queryKey: ['masraf-stats'] });
              }}
              sx={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                '&:hover': {
                  borderColor: 'var(--primary)',
                  bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                },
              }}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                bgcolor: 'var(--destructive)', 
                color: 'var(--destructive-foreground)',
                '&:hover': { 
                  bgcolor: 'color-mix(in srgb, var(--destructive) 90%, #000 10%)',
                },
              }}
            >
              Yeni Masraf
            </Button>
          </Box>
        </Box>

        {/* İstatistikler */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ bgcolor: 'var(--card)', border: '1px solid var(--destructive)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>Toplam Masraf</Typography>
                  <Typography variant="h4" sx={{ color: 'var(--destructive)', fontWeight: 700 }}>
                    {formatCurrency(stats.toplamMasraf)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ bgcolor: 'var(--card)', border: '1px solid var(--chart-3)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>Toplam Kayıt</Typography>
                  <Typography variant="h4" sx={{ color: 'var(--chart-3)', fontWeight: 700 }}>
                    {stats.toplamAdet}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ bgcolor: 'var(--card)', border: '1px solid var(--chart-2)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>Kategori Sayısı</Typography>
                  <Typography variant="h4" sx={{ color: 'var(--chart-2)', fontWeight: 700 }}>
                    {kategoriler.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ bgcolor: 'var(--card)', border: '1px solid var(--chart-1)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>Ortalama Masraf</Typography>
                  <Typography variant="h5" sx={{ color: 'var(--chart-1)', fontWeight: 700 }}>
                    {stats.toplamAdet > 0 ? formatCurrency(stats.toplamMasraf / stats.toplamAdet) : '₺0'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filtreler */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'var(--foreground)', fontWeight: 700 }}>
            <FilterList sx={{ color: 'var(--muted-foreground)' }} />
            Filtreler
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small" className="form-control-select">
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  label="Kategori"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {kategoriler.map((kat) => (
                    <MenuItem key={kat.id} value={kat.id}>
                      {kat.kategoriAdi}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                className="form-control-textfield"
                type="date"
                label="Başlangıç Tarihi"
                value={filterBaslangic}
                onChange={(e) => setFilterBaslangic(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                className="form-control-textfield"
                type="date"
                label="Bitiş Tarihi"
                value={filterBitis}
                onChange={(e) => setFilterBitis(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Tablo */}
        <Paper sx={{ height: 520, p: 1, bgcolor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
          <DataGrid
            rows={masraflar}
            columns={masrafColumns}
            loading={isMasrafLoading}
            disableColumnMenu
            disableColumnSelector
            disableDensitySelector
            disableRowSelectionOnClick
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25, page: 0 },
              },
            }}
            density="comfortable"
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'var(--muted)',
                fontWeight: 700,
                color: 'var(--foreground)',
                borderBottom: '2px solid var(--border)',
              },
              '& .MuiDataGrid-row': {
                backgroundColor: 'var(--background)',
                '&:hover': {
                  backgroundColor: 'var(--muted) !important',
                },
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
              },
            }}
            slots={{
              noRowsOverlay: DataGridNoRowsOverlay,
            }}
          />
        </Paper>

        {/* Kategori Bazlı Özet */}
        {stats && stats.kategoriler.length > 0 && (
          <Paper sx={{ p: 2, mt: 3, bgcolor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'var(--foreground)', fontWeight: 700 }}>
              <Category sx={{ color: 'var(--muted-foreground)' }} />
              Kategori Bazlı Masraflar
            </Typography>
            <Grid container spacing={2}>
              {stats.kategoriler.map((kat) => (
                <Grid size={{ xs: 12, md: 4 }} key={kat.kategoriId}>
                  <Card variant="outlined" sx={{ bgcolor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>{kat.kategoriAdi}</Typography>
                      <Typography variant="h6" sx={{ color: 'var(--destructive)', fontWeight: 700 }}>
                        {formatCurrency(kat.toplam)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                        {kat.adet} kayıt
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Form Dialog */}
        <MasrafFormDialog
          open={openDialog}
          editMode={editMode}
          formData={formData}
          kategoriler={kategoriler}
          loading={actionLoading}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          onFormChange={handleFormChange}
        />

        {/* Silme Dialog */}
        <Dialog 
          open={openDelete} 
          onClose={() => setOpenDelete(false)}
          PaperProps={{
            sx: {
              bgcolor: 'var(--card)',
              backgroundImage: 'none',
            },
          }}
        >
          <DialogTitle sx={{ color: 'var(--foreground)', borderBottom: '1px solid var(--border)' }}>Silme Onayı</DialogTitle>
          <DialogContent sx={{ bgcolor: 'var(--background)' }}>
            <Typography sx={{ color: 'var(--foreground)' }}>
              Bu masraf kaydını silmek istediğinizden emin misiniz?
              <br />
              <strong>Kategori: </strong>{selectedMasraf?.kategori.kategoriAdi}
              <br />
              <strong>Tutar: </strong>{selectedMasraf && formatCurrency(selectedMasraf.tutar)}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ bgcolor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
            <Button 
              onClick={() => setOpenDelete(false)}
              sx={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                '&:hover': {
                  borderColor: 'var(--primary)',
                  bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                },
              }}
            >
              İptal
            </Button>
            <Button 
              variant="contained" 
              onClick={handleDelete} 
              disabled={actionLoading}
              sx={{
                bgcolor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                '&:hover': {
                  bgcolor: 'color-mix(in srgb, var(--destructive) 90%, #000 10%)',
                },
              }}
            >
              Sil
            </Button>
          </DialogActions>
        </Dialog>

        {/* Kategori Yönetimi Dialog */}
        <Dialog 
          open={openKategoriDialog} 
          onClose={() => setOpenKategoriDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'var(--card)',
              backgroundImage: 'none',
            },
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'var(--secondary)', 
            color: 'var(--secondary-foreground)',
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            borderBottom: '1px solid var(--border)',
          }}>
            <Category sx={{ color: 'var(--secondary-foreground)' }} />
            Masraf Kategorileri
          </DialogTitle>
          <DialogContent sx={{ bgcolor: 'var(--background)' }}>
            <Box sx={{ mt: 2 }}>
              {/* Yeni/Düzenle Kategori Formu */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'var(--foreground)' }}>
                  {kategoriEditMode ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Kategori Adı *"
                      className="form-control-textfield"
                      value={kategoriFormData.kategoriAdi}
                      onChange={(e) => setKategoriFormData(prev => ({ ...prev, kategoriAdi: e.target.value }))}
                      placeholder="Örn: Ofis Giderleri"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Açıklama"
                      className="form-control-textfield"
                      value={kategoriFormData.aciklama}
                      onChange={(e) => setKategoriFormData(prev => ({ ...prev, aciklama: e.target.value }))}
                      placeholder="Kategori açıklaması (opsiyonel)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={kategoriEditMode ? <Edit /> : <Add />}
                        onClick={handleKategoriSubmit}
                        disabled={actionLoading}
                        sx={{ 
                          bgcolor: 'var(--secondary)', 
                          color: 'var(--secondary-foreground)',
                          '&:hover': { 
                            bgcolor: 'var(--secondary-hover)',
                          },
                        }}
                      >
                        {kategoriEditMode ? 'Güncelle' : 'Kategori Ekle'}
                      </Button>
                      {kategoriEditMode && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setKategoriEditMode(false);
                            setSelectedKategori(null);
                            setKategoriFormData({ kategoriAdi: '', aciklama: '' });
                          }}
                          sx={{
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)',
                            '&:hover': {
                              borderColor: 'var(--primary)',
                              bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                            },
                          }}
                        >
                          İptal
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Mevcut Kategoriler Listesi */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'var(--foreground)' }}>
                Mevcut Kategoriler ({kategoriler.length})
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>Kategori Adı</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>Açıklama</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>Masraf Sayısı</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kategoriler.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography sx={{ color: 'var(--muted-foreground)' }}>Kategori bulunamadı</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      kategoriler.map((kat) => (
                        <TableRow 
                          key={kat.id} 
                          hover
                          sx={{
                            bgcolor: 'var(--background)',
                            '&:hover': {
                              bgcolor: 'var(--muted) !important',
                            },
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={500} sx={{ color: 'var(--foreground)' }}>
                              {kat.kategoriAdi}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                              {kat.aciklama || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={kat._count?.masraflar || 0}
                              size="small"
                              sx={{
                                bgcolor: kat._count?.masraflar 
                                  ? 'color-mix(in srgb, var(--chart-2) 15%, transparent)' 
                                  : 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)',
                                color: kat._count?.masraflar ? 'var(--chart-2)' : 'var(--muted-foreground)',
                                borderColor: kat._count?.masraflar ? 'var(--chart-2)' : 'var(--border)',
                              }}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Düzenle">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenKategoriDialog(kat)}
                                sx={{ 
                                  color: 'var(--chart-3)',
                                  '&:hover': {
                                    bgcolor: 'color-mix(in srgb, var(--chart-3) 10%, transparent)',
                                  },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedKategori(kat);
                                  setOpenKategoriDelete(true);
                                }}
                                sx={{ 
                                  color: 'var(--destructive)',
                                  '&:hover': {
                                    bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                                  },
                                }}
                                disabled={!!kat._count?.masraflar}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </DialogContent>
          <DialogActions sx={{ bgcolor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
            <Button 
              onClick={() => setOpenKategoriDialog(false)}
              sx={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                '&:hover': {
                  borderColor: 'var(--primary)',
                  bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                },
              }}
            >
              Kapat
            </Button>
          </DialogActions>
        </Dialog>

        {/* Kategori Silme Dialog */}
        <Dialog 
          open={openKategoriDelete} 
          onClose={() => setOpenKategoriDelete(false)}
          PaperProps={{
            sx: {
              bgcolor: 'var(--card)',
              backgroundImage: 'none',
            },
          }}
        >
          <DialogTitle sx={{ color: 'var(--foreground)', borderBottom: '1px solid var(--border)' }}>Kategori Silme Onayı</DialogTitle>
          <DialogContent>
            <Typography>
              Bu kategoriyi silmek istediğinizden emin misiniz?
              <br />
              <strong>Kategori: </strong>{selectedKategori?.kategoriAdi}
              <br />
              <br />
              {selectedKategori?._count?.masraflar ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Bu kategoride {selectedKategori._count.masraflar} adet masraf kaydı var. Önce bu kayıtları silmeniz veya başka kategoriye taşımanız gerekir.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Bu işlem geri alınamaz!
                </Alert>
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenKategoriDelete(false)}>İptal</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleKategoriDelete}
              disabled={actionLoading || !!selectedKategori?._count?.masraflar}
            >
              Sil
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
