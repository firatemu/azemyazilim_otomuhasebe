'use client';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import {
  Add,
  CurrencyLira,
  Category,
  Delete,
  Edit,
  FilterList,
  Refresh,
  Visibility,
  Search,
  CalendarToday,
  TableRows,
  TrendingDown,
  TrendingUp,
  History,
  Download,
  MoreVert,
  Close,
  FileDownload,
  TableChart,
  PictureAsPdf
} from '@mui/icons-material';
import {
  useTheme,
  useMediaQuery,
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
  Stack,
  InputAdornment,
  Divider,
  Popover,
  Menu,
} from '@mui/material';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import StandardPage from '@/components/common/StandardPage';
import StandardCard from '@/components/common/StandardCard';
import ExpensePrintForm from '@/components/PrintForm/ExpensePrintForm';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

interface MasrafKategori {
  id: string;
  name: string;
  notes?: string;
  _count?: {
    expenses: number;
  };
}

interface Masraf {
  id: string;
  categoryId: string;
  referenceNo?: string;
  notes?: string;
  amount: number;
  date: string;
  paymentType?: string;
  createdAt: string;
  updatedAt: string;
  category: MasrafKategori;
}

interface Stats {
  toplamExpense: number;
  toplamAdet: number;
  categoryler: Array<{
    categoryId: string;
    name: string;
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
  CASH: 'Nakit',
  CREDIT_CARD: 'Kredi Kartı',
  BANK_TRANSFER: 'Havale/EFT',
};

const ODEME_TIPI_COLORS: Record<string, string> = {
  CASH: '#10b981',
  CREDIT_CARD: '#3b82f6',
  BANK_TRANSFER: '#0891b2',
};

const getOdemeTipiLabel = (tip: string | undefined | null) => tip ? (ODEME_TIPI_LABELS[tip] || tip) : '-';
const getOdemeTipiColor = (tip: string | undefined | null) => tip ? (ODEME_TIPI_COLORS[tip] || '#6b7280') : '#6b7280';

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

const AuditPopover = ({ anchorEl, onClose, data }: any) => (
  <Popover
    open={Boolean(anchorEl)}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    PaperProps={{
      sx: {
        p: 2,
        width: 280,
        bgcolor: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-lg)',
      },
    }}
  >
    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 1 }}>
      <History sx={{ fontSize: 18, color: 'var(--primary)' }} />
      Kayıt Geçmişi
    </Typography>
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="caption" display="block" sx={{ color: 'var(--muted-foreground)', mb: 0.5 }}>Oluşturulma</Typography>
        <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>
          {formatDate(data?.createdAt)}
        </Typography>
      </Box>
      <Divider />
      <Box>
        <Typography variant="caption" display="block" sx={{ color: 'var(--muted-foreground)', mb: 0.5 }}>Son Güncelleme</Typography>
        <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>
          {formatDate(data?.updatedAt)}
        </Typography>
      </Box>
    </Stack>
  </Popover>
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
  onFormChange,
  isMobile
}: any) => {
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: 'var(--card)',
          backgroundImage: 'none',
          borderRadius: isMobile ? 0 : 'var(--radius-xl)',
          border: isMobile ? 'none' : '1px solid var(--border)',
          boxShadow: 'var(--shadow-2xl)',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(to right, var(--card), color-mix(in srgb, var(--primary) 3%, transparent))',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--destructive)',
          }}>
            <CurrencyLira sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--foreground)', lineHeight: 1.2 }}>
              {editMode ? 'Masraf Düzenle' : 'Yeni Masraf Kaydı'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
              Harcama detaylarını buraya girin
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'var(--muted-foreground)',
            transition: 'all 0.2s',
            '&:hover': {
              color: 'var(--destructive)',
              bgcolor: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
              transform: 'rotate(90deg)',
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: 'var(--card)' }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth required className="form-control-select">
              <InputLabel>Masraf Kategorisi</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) => onFormChange('categoryId', e.target.value)}
                label="Masraf Kategorisi"
                sx={{ borderRadius: 'var(--radius-md)' }}
              >
                {kategoriler.map((kat: MasrafKategori) => (
                  <MenuItem key={kat.id} value={kat.id}>
                    {kat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              className="form-control-textfield"
              label="Fiş/Fatura No"
              value={formData.referenceNo}
              onChange={(e) => onFormChange('referenceNo', e.target.value)}
              placeholder="Örn: ABC20240001"
              InputProps={{
                startAdornment: <InputAdornment position="start"><History sx={{ fontSize: 18 }} /></InputAdornment>,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="number"
              className="form-control-textfield"
              label="Tutar"
              value={formData.amount}
              onChange={(e) => onFormChange('amount', e.target.value)}
              inputProps={{ min: 0.01, step: 0.01 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth className="form-control-select">
              <InputLabel>Ödeme Tipi</InputLabel>
              <Select
                value={formData.paymentType}
                onChange={(e) => onFormChange('paymentType', e.target.value)}
                label="Ödeme Tipi"
              >
                <MenuItem value="">
                  <em>Belirtilmedi</em>
                </MenuItem>
                <MenuItem value="CASH">Nakit</MenuItem>
                <MenuItem value="CREDIT_CARD">Kredi Kartı</MenuItem>
                <MenuItem value="BANK_TRANSFER">Havale/EFT</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              className="form-control-textfield"
              label="Harcama Tarihi"
              value={formData.date}
              onChange={(e) => onFormChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Açıklama"
              className="form-control-textfield"
              value={formData.notes}
              onChange={(e) => onFormChange('notes', e.target.value)}
              multiline
              rows={2}
              placeholder="Masraf hakkında kısa bilgi..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2,
        bgcolor: 'color-mix(in srgb, var(--primary) 2%, var(--card))',
        borderTop: '1px solid var(--border)',
        gap: 1.5
      }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 'var(--radius-lg)',
            textTransform: 'none',
            fontWeight: 600,
            color: 'var(--foreground)',
            borderColor: 'var(--border)',
            py: 1.2,
            '&:hover': {
              borderColor: 'var(--primary)',
              bgcolor: 'transparent',
            },
          }}
        >
          İptal
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          sx={{
            borderRadius: 'var(--radius-lg)',
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: 'var(--destructive)',
            color: 'var(--destructive-foreground)',
            py: 1.2,
            boxShadow: '0 4px 12px color-mix(in srgb, var(--destructive) 30%, transparent)',
            '&:hover': {
              bgcolor: 'color-mix(in srgb, var(--destructive) 90%, black)',
              boxShadow: '0 6px 16px color-mix(in srgb, var(--destructive) 40%, transparent)',
            },
            '&.Mui-disabled': {
              bgcolor: 'var(--muted)',
              color: 'var(--muted-foreground)',
            }
          }}
        >
          {loading ? 'İşleniyor...' : (editMode ? 'Güncellemeyi Kaydet' : 'Masrafı Kaydet')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

MasrafFormDialog.displayName = 'MasrafFormDialog';

export default function MasrafPage() {
  const router = useRouter();
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

  const [auditAnchor, setAuditAnchor] = useState<{ el: HTMLElement | null, data: any }>({ el: null, data: null });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleQuickFilter = (type: string) => {
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0];

    if (type === 'today') {
      start = end;
    } else if (type === 'week') {
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      start = lastWeek.toISOString().split('T')[0];
    } else if (type === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    }

    setFilterBaslangic(start);
    setFilterBitis(end);
  };

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
    categoryId: '',
    referenceNo: '',
    notes: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentType: 'CASH',
  });

  const [kategoriFormData, setKategoriFormData] = useState({
    name: '',
    notes: '',
  });

  const [categorySearch, setCategorySearch] = useState('');

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
      if (filterKategori) params.categoryId = filterKategori;
      if (filterBaslangic) params.startDate = filterBaslangic;
      if (filterBitis) params.endDate = filterBitis;

      const response = await axios.get('/expenses', { params });
      const data = response.data?.data ?? [];
      // Debug: Tarih alanını kontrol et
      if (data.length > 0) {
        console.log('Masraf verisi örneği:', data[0]);
        console.log('Tarih alanı:', data[0].date, 'Tip:', typeof data[0].date);
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
      const response = await axios.get('/expenses/categoryler');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: stats = null, isLoading: statsLoading } = useQuery<Stats | null>({
    queryKey: ['masraf-stats', filterKategori || null, filterBaslangic || null, filterBitis || null],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filterKategori) params.categoryId = filterKategori;
      if (filterBaslangic) params.startDate = filterBaslangic;
      if (filterBitis) params.endDate = filterBitis;

      const response = await axios.get('/expenses/stats', { params });
      return response.data ?? null;
    },
  });

  const isMasrafLoading = masrafLoading || masrafFetching || actionLoading;

  const handleViewDetail = useCallback((id: string) => {
    router.push(`/masraf/${id}`);
  }, [router]);

  const handleOpenDialog = useCallback((masraf?: Masraf) => {
    if (masraf) {
      setEditMode(true);
      setSelectedMasraf(masraf);
      setFormData({
        categoryId: masraf.categoryId,
        referenceNo: masraf.referenceNo || '',
        notes: masraf.notes || '',
        amount: String(masraf.amount),
        date: new Date(masraf.date).toISOString().split('T')[0],
        paymentType: masraf.paymentType || 'CASH',
      });
    } else {
      setEditMode(false);
      setSelectedMasraf(null);
      setFormData({
        categoryId: '',
        referenceNo: '',
        notes: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentType: 'CASH',
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
      const amountNumber = parseFloat(formData.amount);

      if (!formData.categoryId || !amountNumber || amountNumber <= 0) {
        showSnackbar('Lütfen tüm zorunlu alanları doldurun', 'error');
        return;
      }

      setActionLoading(true);

      const submitData = {
        ...formData,
        amount: amountNumber,
        paymentType: formData.paymentType || null,
      };

      if (editMode && selectedMasraf) {
        await axios.put(`/expenses/${selectedMasraf.id}`, submitData);
        showSnackbar('Masraf kaydı güncellendi', 'success');
      } else {
        await axios.post('/expenses', submitData);
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

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const openExportMenu = Boolean(exportAnchorEl);

  const handleExportExcel = () => {
    try {
      if (masraflar.length === 0) {
        showSnackbar('Dışa aktarılacak veri bulunamadı', 'info');
        return;
      }

      const exportData = masraflar.map(m => ({
        'Tarih': format(new Date(m.date), 'dd.MM.yyyy'),
        'Kategori': m.category?.name || '-',
        'Açıklama': m.notes || '-',
        'Fiş/Fatura No': m.referenceNo || '-',
        'Ödeme Şekli': m.paymentType || 'Belirtilmedi',
        'Tutar': m.amount
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Masraflar');

      // Kolon genişliklerini ayarla
      const wscols = [
        { wch: 12 }, // Tarih
        { wch: 25 }, // Kategori
        { wch: 40 }, // Açıklama
        { wch: 20 }, // Fiş No
        { wch: 15 }, // Ödeme Şekli
        { wch: 15 }  // Tutar
      ];
      ws['!cols'] = wscols;

      XLSX.writeFile(wb, `Masraf_Raporu_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
      setExportAnchorEl(null);
    } catch (error) {
      console.error('Excel export error:', error);
      showSnackbar('Excel oluşturulurken hata oluştu', 'error');
    }
  };

  const handleExportPdf = () => {
    if (masraflar.length === 0) {
      showSnackbar('Dışa aktarılacak veri bulunamadı', 'info');
      return;
    }
    setPrintOpen(true);
    setExportAnchorEl(null);
  };

  const handleDelete = async () => {
    if (!selectedMasraf) return;

    try {
      setActionLoading(true);
      await axios.delete(`/expenses/${selectedMasraf.id}`);
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
        name: kategori.name,
        notes: kategori.notes || '',
      });
    } else {
      setKategoriEditMode(false);
      setSelectedKategori(null);
      setKategoriFormData({
        name: '',
        notes: '',
      });
    }
    setOpenKategoriDialog(true);
  };

  const handleKategoriSubmit = async () => {
    try {
      if (!kategoriFormData.name.trim()) {
        showSnackbar('Kategori adı gereklidir', 'error');
        return;
      }

      setActionLoading(true);

      if (kategoriEditMode && selectedKategori) {
        await axios.put(`/expenses/categoryler/${selectedKategori.id}`, kategoriFormData);
        showSnackbar('Kategori güncellendi', 'success');
      } else {
        await axios.post('/expenses/categoryler', kategoriFormData);
        showSnackbar('Kategori oluşturuldu', 'success');
      }

      setOpenKategoriDialog(false);
      setKategoriFormData({ name: '', notes: '' });
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
      await axios.delete(`/expenses/categoryler/${selectedKategori.id}`);
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
      field: 'date',
      headerName: 'Tarih',
      minWidth: 120,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        if (!row?.date) return <Typography variant="body2">-</Typography>;
        return <Typography variant="body2">{formatDate(row.date)}</Typography>;
      },
      valueGetter: (params: any) => params?.row?.date ? formatDate(params.row.date) : '',
    },
    {
      field: 'referenceNo',
      headerName: 'Fiş/Fatura No',
      minWidth: 140,
      renderCell: (params: any) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--foreground)', fontFamily: 'monospace' }}>
          {params.row.referenceNo || '-'}
        </Typography>
      ),
    },
    {
      field: 'category',
      headerName: 'Kategori',
      flex: 1,
      minWidth: 160,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        if (!row) return <Typography variant="body2">-</Typography>;
        return (
          <Chip
            label={row.category?.name || '-'}
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
      valueGetter: (params: any) => params?.row?.category?.name || '-',
    },
    {
      field: 'notes',
      headerName: 'Açıklama',
      flex: 1.5,
      minWidth: 220,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        return (
          <Typography variant="body2" noWrap sx={{ maxWidth: '100%' }}>
            {row?.notes || '-'}
          </Typography>
        );
      },
    },
    {
      field: 'amount',
      headerName: 'Tutar',
      minWidth: 140,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        if (!row?.amount) return <Typography variant="body2">-</Typography>;
        return (
          <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--destructive)' }}>
            {formatCurrency(row.amount)}
          </Typography>
        );
      },
      valueGetter: (params: any) => params?.row?.amount ? formatCurrency((params.row as Masraf).amount) : '-',
    },
    {
      field: 'paymentType',
      headerName: 'Ödeme Tipi',
      minWidth: 160,
      renderCell: (params: any) => {
        const row = params.row as Masraf;
        if (!row?.paymentType) return <Typography variant="body2">-</Typography>;
        const colorMap: Record<string, string> = {
          CASH: 'var(--chart-2)',
          CREDIT_CARD: 'var(--chart-1)',
          BANK_TRANSFER: 'var(--secondary)',
        };
        const chipColor = colorMap[row.paymentType] || 'var(--muted-foreground)';
        return (
          <Chip
            label={getOdemeTipiLabel(row.paymentType)}
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
      valueGetter: (params: any) => params?.row?.paymentType ? getOdemeTipiLabel((params.row as Masraf).paymentType) : '-',
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
            <Tooltip title="Detay">
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
            </Tooltip>
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
  ], [handleOpenDialog, handleViewDetail]);

  return (
    <StandardPage>
      <Box sx={{ pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              background: 'linear-gradient(135deg, var(--destructive), #f87171)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px color-mix(in srgb, var(--destructive) 40%, transparent)',
            }}>
              <CurrencyLira sx={{ color: 'white', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--foreground)', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Masraf Yönetimi
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                Harcamalarınızı takip edin ve kategorize edin
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Category />}
              onClick={() => handleOpenKategoriDialog()}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 600,
                color: 'var(--secondary)',
                borderColor: 'var(--secondary)',
                px: 2,
                '&:hover': {
                  borderColor: 'var(--secondary)',
                  bgcolor: 'color-mix(in srgb, var(--secondary) 8%, transparent)',
                },
              }}
            >
              Kategoriler
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                px: 2,
                boxShadow: '0 4px 12px color-mix(in srgb, var(--destructive) 30%, transparent)',
                '&:hover': {
                  bgcolor: 'color-mix(in srgb, var(--destructive) 90%, black)',
                  boxShadow: '0 6px 16px color-mix(in srgb, var(--destructive) 40%, transparent)',
                },
              }}
            >
              Yeni Masraf
            </Button>
          </Box>
        </Box>

        {/* KPI / Metrics strip */}
        {/* KPI Stats */}
        <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper variant="outlined" sx={{
              p: 2, borderRadius: 4, height: '100%', bgcolor: 'var(--card)', border: '1px solid var(--border)',
              position: 'relative', overflow: 'hidden',
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: 'var(--destructive)' }
            }}>
              <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                <TrendingDown sx={{ fontSize: 14, color: 'var(--destructive)' }} /> TOPLAM MASRAF
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--destructive)', mt: 0.5, fontSize: isMobile ? '1.1rem' : '1.5rem' }}>
                {formatCurrency(stats?.toplamExpense || 0)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, height: '100%', bgcolor: 'var(--card)', border: '1px solid var(--border)' }}>
              <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                <TableRows sx={{ fontSize: 14, color: 'var(--primary)' }} /> KAYIT SAYISI
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--foreground)', mt: 0.5, fontSize: isMobile ? '1.1rem' : '1.5rem' }}>
                {stats?.toplamAdet || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, height: '100%', bgcolor: 'var(--card)', border: '1px solid var(--border)' }}>
              <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                <Category sx={{ fontSize: 14, color: 'var(--secondary)' }} /> KATEGORİ
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--foreground)', mt: 0.5, fontSize: isMobile ? '1.1rem' : '1.5rem' }}>
                {kategoriler.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, height: '100%', bgcolor: 'var(--card)', border: '1px solid var(--border)' }}>
              <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                <TrendingUp sx={{ fontSize: 14, color: 'var(--chart-2)' }} /> ORTALAMA
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--foreground)', mt: 0.5, fontSize: isMobile ? '1.1rem' : '1.5rem' }}>
                {(stats?.toplamAdet ?? 0) > 0 ? formatCurrency((stats?.toplamExpense ?? 0) / (stats?.toplamAdet ?? 1)) : '₺0'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Toolbar */}
        <Paper variant="outlined" sx={{
          mb: 3,
          borderRadius: 4,
          bgcolor: 'var(--card)',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          <Stack
            direction={isTablet ? 'column' : 'row'}
            spacing={2}
            sx={{ p: 2, alignItems: isTablet ? 'stretch' : 'center' }}
          >
            <TextField
              size="small"
              placeholder="Açıklama veya kategori ara..."
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'var(--muted-foreground)', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2.5, bgcolor: 'var(--background)' }
              }}
            />

            {!isTablet && <Divider orientation="vertical" flexItem />}

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                overflowX: 'auto',
                pb: isMobile ? 1 : 0,
                '&::-webkit-scrollbar': { display: 'none' }
              }}
            >
              <Chip
                label="Bugün"
                onClick={() => handleQuickFilter('today')}
                size="small"
                variant={filterBaslangic === new Date().toISOString().split('T')[0] ? 'filled' : 'outlined'}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: filterBaslangic === new Date().toISOString().split('T')[0] ? 'var(--primary)' : 'transparent',
                  color: filterBaslangic === new Date().toISOString().split('T')[0] ? 'white' : 'var(--muted-foreground)',
                }}
              />
              <Chip
                label="Bu Hafta"
                onClick={() => handleQuickFilter('week')}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 2, fontWeight: 600, color: 'var(--muted-foreground)' }}
              />
              <Chip
                label="Bu Ay"
                onClick={() => handleQuickFilter('month')}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 2, fontWeight: 600, color: 'var(--muted-foreground)' }}
              />
            </Stack>

            {!isTablet && <Divider orientation="vertical" flexItem />}

            <Stack
              direction={isMobile ? 'column' : 'row'}
              spacing={isMobile ? 1.5 : 1}
              sx={{ flex: isTablet ? 'none' : '1 1 300px' }}
            >
              <TextField
                size="small"
                type="date"
                label="Başlangıç"
                fullWidth={isMobile}
                value={filterBaslangic}
                onChange={(e) => setFilterBaslangic(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2.5 } }}
              />
              <TextField
                size="small"
                type="date"
                label="Bitiş"
                fullWidth={isMobile}
                value={filterBitis}
                onChange={(e) => setFilterBitis(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2.5 } }}
              />

              {isMobile && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['masraflar'] });
                    queryClient.invalidateQueries({ queryKey: ['masraf-stats'] });
                  }}
                  sx={{ borderRadius: 2.5, height: 40 }}
                >
                  Yenile
                </Button>
              )}
            </Stack>

            {!isMobile && (
              <IconButton
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['masraflar'] });
                  queryClient.invalidateQueries({ queryKey: ['masraf-stats'] });
                }}
                sx={{ color: 'var(--primary)', bgcolor: 'color-mix(in srgb, var(--primary) 8%, transparent)', borderRadius: 2 }}
              >
                <Refresh />
              </IconButton>
            )}

            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                height: 40,
                px: 2,
                '&:hover': { borderColor: 'var(--primary)', bgcolor: 'color-mix(in srgb, var(--primary) 4%, transparent)' }
              }}
            >
              Dışa Aktar
            </Button>

            <Menu
              anchorEl={exportAnchorEl}
              open={openExportMenu}
              onClose={() => setExportAnchorEl(null)}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  mt: 1,
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)'
                }
              }}
            >
              <MenuItem onClick={handleExportExcel} sx={{ gap: 1.5, py: 1.2 }}>
                <TableChart sx={{ color: '#16a34a' }} />
                Excel (.xlsx)
              </MenuItem>
              <MenuItem onClick={handleExportPdf} sx={{ gap: 1.5, py: 1.2 }}>
                <PictureAsPdf sx={{ color: '#dc2626' }} />
                PDF (.pdf)
              </MenuItem>
            </Menu>
          </Stack>
        </Paper>

        {/* Kategori Bazlı Özet - Minimalist Bar */}
        {stats && stats.categoryler && stats.categoryler.length > 0 && (
          <Box sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            pb: 1,
            mb: 1.5,
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}>
            {stats.categoryler.map((kat) => (
              <Paper
                key={kat.categoryId}
                variant="outlined"
                sx={{
                  px: 1.8,
                  py: 1.2,
                  borderRadius: 3,
                  minWidth: 'fit-content',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: 'var(--card)',
                  borderColor: 'var(--border)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'var(--primary)',
                    bgcolor: 'color-mix(in srgb, var(--primary) 2%, var(--card))'
                  }
                }}
              >
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'var(--primary)',
                  opacity: 0.6
                }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                  {kat.name}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                  {formatCurrency(kat.toplam)}
                </Typography>
                <Box sx={{
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1,
                  bgcolor: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>
                    {kat.adet}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* DataGrid Area */}
        <StandardCard padding={isMobile ? 0 : 1} sx={{ borderRadius: { xs: 2, md: 4 }, overflow: 'hidden', border: isMobile ? 'none' : '1px solid var(--border)' }}>
          <Box sx={{ height: { xs: 500, md: 650 }, width: '100%' }}>
            <DataGrid
              rows={masraflar}
              columns={masrafColumns}
              loading={isMasrafLoading}
              disableColumnMenu
              disableRowSelectionOnClick
              density={isMobile ? 'compact' : 'standard'}
              columnHeaderHeight={48}
              rowHeight={isMobile ? 52 : 60}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25, page: 0 },
                },
              }}
              slots={{
                noRowsOverlay: DataGridNoRowsOverlay,
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontWeight: 800,
                  fontSize: isMobile ? '0.7rem' : '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                },
                '& .MuiDataGrid-cell': {
                  borderColor: 'var(--border)',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: 'color-mix(in srgb, var(--primary) 4%, transparent) !important',
                },
              }}
            />
          </Box>
        </StandardCard>

        {/* Audit Popover */}
        <AuditPopover
          anchorEl={auditAnchor.el}
          data={auditAnchor.data}
          onClose={() => setAuditAnchor({ el: null, data: null })}
        />


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
          isMobile={isMobile}
        />

        {/* Kurumsal Yazdırma Formu */}
        <ExpensePrintForm
          open={printOpen}
          expenses={masraflar}
          onClose={() => setPrintOpen(false)}
          dateRange={{ start: filterBaslangic, end: filterBitis }}
        />

        {/* Silme Dialog */}
        <Dialog
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          PaperProps={{
            sx: {
              bgcolor: 'var(--card)',
              backgroundImage: 'none',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-2xl)',
              overflow: 'hidden',
              minWidth: 320,
            },
          }}
        >
          <DialogTitle sx={{
            fontWeight: 800,
            color: 'var(--foreground)',
            borderBottom: '1px solid var(--border)',
            textAlign: 'center',
            py: 2
          }}>
            Kayıt Silme Onayı
          </DialogTitle>
          <DialogContent sx={{ p: 3, bgcolor: 'var(--card)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, pt: 1 }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--destructive)',
                mb: 1
              }}>
                <Delete sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="body1" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>
                Bu masraf kaydını silmek istediğinizden emin misiniz?
              </Typography>
              <Box sx={{
                width: '100%',
                p: 2,
                bgcolor: 'var(--background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                textAlign: 'left'
              }}>
                <Typography variant="caption" display="block" sx={{ color: 'var(--muted-foreground)', mb: 0.5 }}>MASRAF DETAYI</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
                  {selectedMasraf?.category?.name} - {selectedMasraf && formatCurrency(selectedMasraf.amount)}
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: 'var(--muted-foreground)', mt: 1 }}>TARİH</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
                  {selectedMasraf && formatDate(selectedMasraf.date)}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: 'color-mix(in srgb, var(--primary) 2%, var(--card))', borderTop: '1px solid var(--border)', gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenDelete(false)}
              sx={{
                borderRadius: 'var(--radius-lg)',
                textTransform: 'none',
                fontWeight: 600,
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
                '&:hover': { borderColor: 'var(--primary)', bgcolor: 'transparent' }
              }}
            >
              Vazgeç
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleDelete}
              disabled={actionLoading}
              sx={{
                borderRadius: 'var(--radius-lg)',
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                boxShadow: '0 4px 12px color-mix(in srgb, var(--destructive) 30%, transparent)',
                '&:hover': {
                  bgcolor: 'color-mix(in srgb, var(--destructive) 90%, black)',
                  boxShadow: '0 6px 16px color-mix(in srgb, var(--destructive) 40%, transparent)',
                }
              }}
            >
              Evet, Sil
            </Button>
          </DialogActions>
        </Dialog>

        {/* Kategori Yönetimi Dialog */}
        <Dialog
          open={openKategoriDialog}
          onClose={() => setOpenKategoriDialog(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              bgcolor: 'var(--card)',
              backgroundImage: 'none',
              borderRadius: isMobile ? 0 : 'var(--radius-xl)',
              border: isMobile ? 'none' : '1px solid var(--border)',
              boxShadow: 'var(--shadow-2xl)',
              overflow: 'hidden',
            },
          }}
        >
          <Box sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(to right, var(--card), color-mix(in srgb, var(--primary) 3%, transparent))',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: 'color-mix(in srgb, var(--secondary) 10%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--secondary)',
              }}>
                <Category sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--foreground)', lineHeight: 1.2 }}>
                  Masraf Kategorileri
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                  Gider kalemlerinizi gruplandırın ve yönetin
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setOpenKategoriDialog(false)}
              sx={{
                color: 'var(--muted-foreground)',
                transition: 'all 0.2s',
                '&:hover': {
                  color: 'var(--destructive)',
                  bgcolor: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
                  transform: 'rotate(90deg)',
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <DialogContent sx={{ p: 0, bgcolor: 'var(--card)', height: isMobile ? '100%' : '70vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Sidebar: Liste ve Arama */}
            <Box sx={{
              width: { xs: '100%', md: '360px' },
              borderRight: { xs: 'none', md: '1px solid var(--border)' },
              borderBottom: { xs: '1px solid var(--border)', md: 'none' },
              display: (isMobile && kategoriEditMode) ? 'none' : 'flex',
              flexDirection: 'column',
              bgcolor: 'color-mix(in srgb, var(--primary) 1%, var(--card))',
              height: { xs: '100%', md: 'auto' }
            }}>
              <Box sx={{ p: 2, borderBottom: '1px solid var(--border)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Kategori Listesi</Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => {
                      setKategoriEditMode(false);
                      setSelectedKategori(null);
                      setKategoriFormData({ name: '', notes: '' });
                    }}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Yeni Ekle
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Kategori ara..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ fontSize: 18, color: 'var(--muted-foreground)' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 'var(--radius-md)', bgcolor: 'var(--card)' }
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                <Stack spacing={1}>
                  {kategoriler
                    .filter(k => k.name.toLowerCase().includes(categorySearch.toLowerCase()))
                    .map((kat) => {
                      const stat = stats?.categoryler?.find(s => s.categoryId === kat.id);
                      const percentage = stats?.toplamExpense ? ((stat?.toplam || 0) / stats.toplamExpense) * 100 : 0;
                      const isActive = selectedKategori?.id === kat.id && kategoriEditMode;

                      return (
                        <Box
                          key={kat.id}
                          onClick={() => handleOpenKategoriDialog(kat)}
                          sx={{
                            p: 1.5,
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: '1px solid',
                            borderColor: isActive ? 'var(--primary)' : 'transparent',
                            bgcolor: isActive ? 'color-mix(in srgb, var(--primary) 5%, var(--card))' : 'transparent',
                            '&:hover': {
                              bgcolor: isActive ? 'color-mix(in srgb, var(--primary) 8%, var(--card))' : 'var(--muted)',
                              transform: 'translateX(4px)',
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                              {kat.name}
                            </Typography>
                            <Chip
                              label={kat._count?.expenses || 0}
                              size="small"
                              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'var(--background)', color: 'var(--muted-foreground)' }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ flex: 1, height: 4, bgcolor: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                              <Box sx={{
                                width: `${Math.min(100, percentage)}%`,
                                height: '100%',
                                bgcolor: 'var(--secondary)',
                                borderRadius: 2
                              }} />
                            </Box>
                            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, minWidth: 35 }}>
                              %{Math.round(percentage)}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block', mt: 0.5 }}>
                            {formatCurrency(stat?.toplam || 0)} harcama
                          </Typography>
                        </Box>
                      );
                    })}
                </Stack>
              </Box>
            </Box>

            {/* Main: Form ve Detay */}
            <Box sx={{
              flex: 1,
              p: { xs: 2.5, md: 4 },
              display: (isMobile && !kategoriEditMode) ? 'none' : 'flex',
              flexDirection: 'column',
              bgcolor: 'var(--card)',
              overflowY: 'auto'
            }}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {isMobile && kategoriEditMode && (
                    <IconButton
                      size="small"
                      onClick={() => setKategoriEditMode(false)}
                      sx={{ mr: 1, color: 'var(--primary)' }}
                    >
                      <Visibility sx={{ transform: 'rotate(180deg)' }} />
                    </IconButton>
                  )}
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--foreground)' }}>
                    {kategoriEditMode ? 'Kategori Düzenle' : 'Yeni Kategori Tanımla'}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                  {kategoriEditMode
                    ? 'Kategori bilgilerini güncelleyerek harcamalarınızı daha iyi organize edin.'
                    : 'Masraflarınızı gruplandırmak için yeni bir kategori adı ve isteğe bağlı açıklama girin.'}
                </Typography>
              </Box>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Kategori Başlığı *"
                  className="form-control-textfield"
                  value={kategoriFormData.name}
                  onChange={(e) => setKategoriFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Harcama grubunu isimlendirin..."
                />
                <TextField
                  fullWidth
                  label="Açıklama"
                  className="form-control-textfield"
                  value={kategoriFormData.notes}
                  onChange={(e) => setKategoriFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Bu kategori neleri kapsıyor? (Opsiyonel)"
                  multiline
                  rows={3}
                />

                <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleKategoriSubmit}
                    disabled={actionLoading}
                    sx={{
                      px: 4,
                      height: 44,
                      borderRadius: 'var(--radius-lg)',
                      bgcolor: 'var(--secondary)',
                      color: 'var(--secondary-foreground)',
                      textTransform: 'none',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px color-mix(in srgb, var(--secondary) 25%, transparent)',
                      '&:hover': {
                        bgcolor: 'color-mix(in srgb, var(--secondary) 90%, black)',
                        boxShadow: '0 6px 16px color-mix(in srgb, var(--secondary) 35%, transparent)',
                      },
                    }}
                  >
                    {kategoriEditMode ? 'Değişiklikleri Kaydet' : 'Kategoriyi Oluştur'}
                  </Button>
                  {kategoriEditMode && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setKategoriEditMode(false);
                          setSelectedKategori(null);
                          setKategoriFormData({ name: '', notes: '' });
                        }}
                        sx={{
                          height: 44,
                          borderRadius: 'var(--radius-lg)',
                          textTransform: 'none',
                          fontWeight: 600,
                          color: 'var(--muted-foreground)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        Vazgeç
                      </Button>
                      <IconButton
                        onClick={() => {
                          setOpenKategoriDelete(true);
                        }}
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--radius-lg)',
                          color: 'var(--destructive)',
                          bgcolor: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
                          '&:hover': { bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)' }
                        }}
                        disabled={!!selectedKategori?._count?.expenses}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Stack>

              {kategoriEditMode && (selectedKategori?._count?.expenses ?? 0) > 0 && (
                <Alert severity="info" sx={{ mt: 'auto', borderRadius: 'var(--radius-lg)', bgcolor: 'color-mix(in srgb, var(--primary) 5%, var(--card))', border: 'none' }}>
                  Bu kategoride {selectedKategori?._count?.expenses} adet harcama kaydı bulunmaktadır.
                </Alert>
              )}
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
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-2xl)',
              overflow: 'hidden',
              minWidth: 320,
            },
          }}
        >
          <DialogTitle sx={{
            fontWeight: 800,
            color: 'var(--foreground)',
            borderBottom: '1px solid var(--border)',
            textAlign: 'center',
            py: 2
          }}>
            Kategori Silme Onayı
          </DialogTitle>
          <DialogContent sx={{ p: 3, bgcolor: 'var(--card)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, pt: 1 }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--destructive)',
                mb: 1
              }}>
                <Delete sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="body1" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>
                Bu kategoriyi silmek istediğinizden emin misiniz?
              </Typography>

              <Box sx={{
                width: '100%',
                p: 2,
                bgcolor: 'var(--background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                textAlign: 'left',
                mt: 1
              }}>
                <Typography variant="caption" display="block" sx={{ color: 'var(--muted-foreground)', mb: 0.5 }}>KATEGORİ ADI</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
                  {selectedKategori?.name}
                </Typography>
              </Box>

              {selectedKategori?._count?.expenses ? (
                <Alert severity="error" sx={{ mt: 2, width: '100%', borderRadius: 'var(--radius-md)' }}>
                  Bu kategoride **{selectedKategori._count.expenses}** adet masraf kaydı var. Önce bu kayıtları silmeniz gerekir.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2, width: '100%', borderRadius: 'var(--radius-md)' }}>
                  Bu işlem geri alınamaz!
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: 'color-mix(in srgb, var(--primary) 2%, var(--card))', borderTop: '1px solid var(--border)', gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenKategoriDelete(false)}
              sx={{
                borderRadius: 'var(--radius-lg)',
                textTransform: 'none',
                fontWeight: 600,
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
                '&:hover': { borderColor: 'var(--primary)', bgcolor: 'transparent' }
              }}
            >
              Vazgeç
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleKategoriDelete}
              disabled={actionLoading || !!selectedKategori?._count?.expenses}
              sx={{
                borderRadius: 'var(--radius-lg)',
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                boxShadow: '0 4px 12px color-mix(in srgb, var(--destructive) 30%, transparent)',
                '&:hover': {
                  bgcolor: 'color-mix(in srgb, var(--destructive) 90%, black)',
                  boxShadow: '0 6px 16px color-mix(in srgb, var(--destructive) 40%, transparent)',
                }
              }}
            >
              Evet, Sil
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
    </StandardPage >
  );
}
