'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import { useTabStore } from '@/stores/tabStore';
import {
  Add,
  Assessment,
  Close,
  Delete,
  Edit,
  Print,
  Search,
  Visibility,
  Cancel,
  Download,
  RefreshOutlined,
  ArrowDownward,
  ArrowUpward,
  FilterList,
  ExpandMore,
  Description,
  MoreVert,
  Receipt,
  ShoppingCart,
  Assignment,
  LocalShipping,
  Inventory,
  ContentCopy,
  CheckCircle,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemIcon,
  Autocomplete,
  Link as MuiLink,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  LinearProgress,
} from '@mui/material';
import { GridColDef, GridRenderCellParams, GridPaginationModel, GridSortModel, GridFilterModel } from '@mui/x-data-grid';
import KPIHeader from '@/components/Fatura/KPIHeader';
import InvoiceDataGrid from '@/components/Fatura/InvoiceDataGrid';
import StatusBadge from '@/components/Fatura/StatusBadge';
import { StandardCard, StandardPage } from '@/components/common';

interface Cari {
  id: string;
  accountCode: string;
  title: string;
  type: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  satisFiyati: number;
  kdvOrani: number;
}

interface SiparisKalemi {
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
  discountAmount: number;
  amount?: number;
  vatAmount?: number;
  sevkEdilenMiktar?: number;
}

interface Siparis {
  id: string;
  siparisNo: string;
  siparisTipi: 'SATIS' | 'SATIN_ALMA';
  tarih: string;
  vade: string | null;
  account: Cari;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  durum: 'BEKLEMEDE' | 'ONAYLANDI' | 'KISMI_IHALE' | 'TAMAMLANDI' | 'IPTAL';
  iskonto?: number;
  aciklama?: string;
  faturaNo?: string | null;
  deliveryNoteId?: string | null;
  deliveryNote?: {
    id: string;
    deliveryNoteNo: string;
  };
  kalemler?: SiparisKalemi[];
  createdByUser?: { fullName?: string; username?: string };
  createdAt?: string;
  updatedByUser?: { fullName?: string; username?: string };
  updatedAt?: string;
  logs?: Array<{ createdAt: string; message: string; actionType?: string; user?: any }>;
}

interface OrderStats {
  monthlyOrders: { totalAmount: number; count: number };
  pendingOrders: { totalAmount: number; count: number };
  completedOrders: { totalAmount: number; count: number };
}

const orderStatusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactElement }> = {
  BEKLEMEDE: {
    label: 'Beklemede',
    color: '#d97706',
    bgColor: 'color-mix(in srgb, #d97706 15%, transparent)',
    icon: <Assignment sx={{ fontSize: 16 }} />,
  },
  ONAYLANDI: {
    label: 'Onaylandı',
    color: '#2563eb',
    bgColor: 'color-mix(in srgb, #2563eb 15%, transparent)',
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
  },
  KISMI_IHALE: {
    label: 'Kısmi İhalet',
    color: '#0891b2',
    bgColor: 'color-mix(in srgb, #0891b2 15%, transparent)',
    icon: <LocalShipping sx={{ fontSize: 16 }} />,
  },
  TAMAMLANDI: {
    label: 'Tamamlandı',
    color: '#059669',
    bgColor: 'color-mix(in srgb, #059669 15%, transparent)',
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
  },
  IPTAL: {
    label: 'İptal',
    color: '#dc2626',
    bgColor: 'color-mix(in srgb, #dc2626 15%, transparent)',
    icon: <Cancel sx={{ fontSize: 16 }} />,
  },
};

function OrderStatusBadge({ status }: { status: string }) {
  const config = orderStatusConfig[status] || {
    label: status,
    color: '#4b5563',
    bgColor: 'var(--muted)',
    icon: <Assignment sx={{ fontSize: 16 }} />,
  };

  return (
    <Chip
      label={config.label}
      icon={config.icon}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        color: config.color,
        bgcolor: config.bgColor,
        border: '1px solid',
        borderColor: `${config.color}30`,
        borderRadius: '6px',
        '& .MuiChip-icon': {
          color: 'inherit',
          ml: 0.5,
        },
      }}
    />
  );
}

export default function SatisSiparisleriPage() {
  const { addTab, setActiveTab } = useTabStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' },
  ]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [rowCount, setRowCount] = useState(0);

  // Dialog states
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openIptal, setOpenIptal] = useState(false);
  const [selectedSiparis, setSelectedSiparis] = useState<Siparis | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // Açılır menü state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSiparisId, setMenuSiparisId] = useState<string | null>(null);

  // Summary Cards stats
  const [stats, setStats] = useState<OrderStats | null>(null);

  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterDurum, setFilterDurum] = useState<string[]>([]);
  const [filterCariId, setFilterCariId] = useState('');

  useEffect(() => {
    addTab({
      id: 'orders-sales',
      label: 'Satış Siparişleri',
      path: '/orders/satis',
    });
    fetchSiparisler();
    fetchCariler();
    fetchStoklar();
    fetchStats();
  }, [paginationModel, sortModel, filterModel, filterCariId, filterStartDate, filterEndDate, filterDurum]);

  const fetchSiparisler = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        siparisTipi: 'SATIS',
        search: searchTerm,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        sortBy: sortModel[0]?.field || 'createdAt',
        sortOrder: sortModel[0]?.sort || 'desc',
      };

      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.durum = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/orders', { params });

      const siparisData = response.data?.data || [];
      const totalCount = response.data?.meta?.total || response.data?.total || siparisData.length;

      setSiparisler(siparisData);
      setRowCount(totalCount);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Siparişler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCariler = async () => {
    try {
      const response = await axios.get('/account', {
        params: { limit: 1000 },
      });
      setCariler(response.data.data || []);
    } catch (error) {
      console.error('Cariler yüklenirken hata:', error);
    }
  };

  const fetchStoklar = async () => {
    try {
      const response = await axios.get('/products', {
        params: { limit: 1000 },
      });
      setStoklar(response.data.data || []);
    } catch (error) {
      console.error('Stoklar yüklenirken hata:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, siparisId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuSiparisId(siparisId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuSiparisId(null);
  };

  // Excel Export
  const handleExportExcel = async () => {
    try {
      const params: Record<string, string> = { siparisTipi: 'SATIS' };
      if (searchTerm) params.search = searchTerm;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.durum = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/orders/export/excel', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `satis_siparisler_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSnackbar('Excel dosyası indirildi', 'success');
    } catch (error: any) {
      showSnackbar('Excel aktarımı başarısız', 'error');
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterDurum([]);
    setFilterCariId('');
    setSearchTerm('');
  };

  const handleEdit = (row: Siparis) => {
    const tabId = `orders-sales-edit-${row.id}`;
    addTab({
      id: tabId,
      label: `Düzenle: ${row.siparisNo}`,
      path: `/orders/satis/duzenle/${row.id}`,
    });
    setActiveTab(tabId);
    router.push(`/orders/satis/duzenle/${row.id}`);
  };

  const handleCreate = () => {
    addTab({ id: 'orders-sales-yeni', label: 'Yeni Satış Siparişi', path: '/orders/satis/yeni' });
    setActiveTab('orders-sales-yeni');
    router.push('/orders/satis/yeni');
  };

  const handleView = async (row: Siparis) => {
    try {
      const response = await axios.get(`/orders/${row.id}`);
      setSelectedSiparis(response.data);
      setOpenView(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş detayı yüklenirken hata oluştu', 'error');
    }
  };

  const handlePrint = (siparis: Siparis) => {
    window.open(`/orders/satis/print/${siparis.id}`, '_blank');
  };

  const handleHazirlama = (siparis: Siparis) => {
    router.push(`/orders/satis/hazirlama/${siparis.id}`);
  };

  const handleCreateIrsaliye = async (siparis: Siparis) => {
    try {
      setLoading(true);
      const response = await axios.post(`/orders/${siparis.id}/irsaliye-olustur`);
      showSnackbar('İrsaliye başarıyla oluşturuldu', 'success');
      router.push(`/sales-waybills/${response.data.id}`);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İrsaliye oluşturulurken hata oluştu', 'error');
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleConvertToInvoice = (siparis: Siparis) => {
    router.push(`/invoice/sales/yeni?siparisId=${siparis.id}`);
  };

  const handleDurumChange = async (yeniDurum: string) => {
    if (!selectedSiparis) return;
    try {
      await axios.put(`/orders/${selectedSiparis.id}/durum`, { durum: yeniDurum });
      showSnackbar(`Sipariş durumu "${orderStatusConfig[yeniDurum]?.label || yeniDurum}" olarak güncellendi`, 'success');
      fetchSiparisler();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Durum değiştirilirken hata oluştu', 'error');
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedSiparis) return;
    try {
      await axios.delete(`/orders/${selectedSiparis.id}`);
      showSnackbar('Sipariş başarıyla silindi', 'success');
      setOpenDelete(false);
      fetchSiparisler();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş silinirken hata oluştu', 'error');
    }
    handleMenuClose();
  };

  const openIptalDialog = (siparis: Siparis) => {
    setSelectedSiparis(siparis);
    setOpenIptal(true);
    handleMenuClose();
  };

  const openDeleteDialog = (siparis: Siparis) => {
    setSelectedSiparis(siparis);
    setOpenDelete(true);
    handleMenuClose();
  };

  const handleIptal = async () => {
    if (!selectedSiparis) return;
    try {
      await axios.put(`/orders/${selectedSiparis.id}/iptal`);
      showSnackbar('Sipariş başarıyla iptal edildi', 'success');
      setOpenIptal(false);
      fetchSiparisler();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İptal işlemi başarısız', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    return orderStatusConfig[status]?.label || status;
  };

  const kpiData = useMemo(
    () =>
      stats
        ? {
            aylikSatis: { tutar: stats.monthlyOrders?.totalAmount || 0, adet: stats.monthlyOrders?.count || 0 },
            tahsilatBekleyen: { tutar: stats.pendingOrders?.totalAmount || 0, adet: stats.pendingOrders?.count || 0 },
            vadesiGecmis: { tutar: stats.completedOrders?.totalAmount || 0, adet: stats.completedOrders?.count || 0 },
          }
        : null,
    [stats]
  );

  const pageGrandTotal = useMemo(
    () => siparisler.reduce((sum, s) => sum + (s.genelToplam || 0), 0),
    [siparisler]
  );

  const fetchStats = async () => {
    try {
      const params: Record<string, any> = { siparisTipi: 'SATIS' };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.durum = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/orders/stats', {
        params
      });
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'siparisNo',
      headerName: 'Sipariş No',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
          {params.row.deliveryNote && (
            <Chip label="İrsaliye" size="small" color="info" sx={{ height: 20, fontSize: '0.65rem', mt: 0.5 }} />
          )}
        </Box>
      )
    },
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 120,
      valueFormatter: (value) => new Date(value).toLocaleDateString('tr-TR'),
    },
    {
      field: 'accountCode',
      headerName: 'Cari Kod',
      width: 130,
      valueGetter: (value, row) => row.account?.accountCode || '',
    },
    {
      field: 'account',
      headerName: 'Cari Ünvan',
      flex: 1.5,
      minWidth: 200,
      valueGetter: (account: any) => account?.title || '',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
      )
    },
    {
      field: 'vade',
      headerName: 'Vade',
      width: 120,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString('tr-TR') : '-',
    },
    {
      field: 'genelToplam',
      headerName: 'Tutar',
      width: 150,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
          <ArrowDownward sx={{ fontSize: 14, color: 'var(--chart-1)' }} />
          <Typography variant="body2" fontWeight="700" sx={{ color: 'var(--chart-1)' }}>
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(params.value)}
          </Typography>
        </Box>
      )
    },
    {
      field: 'durum',
      headerName: 'Durum',
      width: 140,
      renderCell: (params) => <OrderStatusBadge status={params.value} />
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 160,
      getActions: (params) => [
        <Tooltip key="edit" title="Düzenle">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(params.row); }}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip key="print" title="Yazdır">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePrint(params.row); }}>
            <Print fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip key="view" title="Detay">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleView(params.row); }}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip key="menu" title="Diğer İşlemler">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, params.row.id); }}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>,
      ],
    },
  ], []);

  return (
    <StandardPage maxWidth={false}>
      {/* Header & Aksiyon Butonları */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'color-mix(in srgb, var(--chart-1) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart sx={{ color: 'var(--chart-1)', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight="700" color="text.primary">
            Satış Siparişleri
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Assessment />}
            onClick={() => router.push('/raporlama/satis-elemani')}
            sx={{ fontWeight: 600, fontSize: '0.8rem', px: 1.5, py: 0.75, minWidth: 0, boxShadow: 'none' }}
          >
            Raporlar
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={handleCreate}
            sx={{
              bgcolor: 'var(--chart-1)',
              fontWeight: 600,
              fontSize: '0.8rem',
              px: 1.5,
              py: 0.75,
              minWidth: 0,
              boxShadow: 'none',
              '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-1) 85%, var(--background))', boxShadow: 'none' },
            }}
          >
            Yeni Sipariş
          </Button>
        </Stack>
      </Box>

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 3 }} color="primary" />}

      {/* KPI Kartları */}
      <KPIHeader loading={loading} data={kpiData} type="SATIS" />

      {/* Entegre Toolbar ve DataGrid */}
      <StandardCard padding={0} sx={{ boxShadow: 'none', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'var(--card)' }}>
          <TextField
            size="small"
            placeholder="Sipariş Ara (No, Cari vb.)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
              endAdornment: searchTerm && (
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <Close fontSize="small" />
                </IconButton>
              ),
            }}
          />
          {/* Hızlı Tarih Çipleri */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {['TÜMÜ', 'BUGÜN', 'BU HAFTA', 'BU AY', 'BU YIL'].map((label) => {
              const today = new Date();
              const toISODate = (d: Date) => d.toISOString().split('T')[0];
              const getQuickRange = (quickLabel: string) => {
                if (quickLabel === 'TÜMÜ') return { start: '', end: '' };
                if (quickLabel === 'BUGÜN') return { start: toISODate(today), end: toISODate(today) };
                if (quickLabel === 'BU HAFTA') {
                  const day = today.getDay();
                  const diffToMonday = (day === 0 ? -6 : 1 - day);
                  const monday = new Date(today);
                  monday.setDate(today.getDate() + diffToMonday);
                  const sunday = new Date(monday);
                  sunday.setDate(monday.getDate() + 6);
                  return { start: toISODate(monday), end: toISODate(sunday) };
                }
                if (quickLabel === 'BU AY') {
                  return { start: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)), end: toISODate(today) };
                }
                if (quickLabel === 'BU YIL') {
                  return { start: toISODate(new Date(today.getFullYear(), 0, 1)), end: toISODate(today) };
                }
                return { start: '', end: '' };
              };
              const range = getQuickRange(label);
              const isSelected = label === 'TÜMÜ'
                ? !filterStartDate && !filterEndDate
                : filterStartDate === range.start && filterEndDate === range.end;
              return (
                <Chip
                  key={label}
                  label={label}
                  onClick={() => {
                    if (label === 'TÜMÜ') {
                      setFilterStartDate('');
                      setFilterEndDate('');
                      return;
                    }
                    setFilterStartDate(range.start);
                    setFilterEndDate(range.end);
                  }}
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? 'primary' : 'default'}
                  sx={{ borderRadius: 2, cursor: 'pointer', fontWeight: 500, fontSize: '0.75rem' }}
                />
              )
            })}
          </Stack>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            <Tooltip title="Filtreler">
              <IconButton size="small" onClick={() => setShowFilters(!showFilters)} color={showFilters ? 'primary' : 'default'}>
                <FilterList fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excel İndir">
              <IconButton size="small" onClick={handleExportExcel}>
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Yenile">
              <IconButton size="small" onClick={fetchSiparisler}>
                <RefreshOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Collapse in={showFilters}>
          <Box sx={{ p: 2, bgcolor: 'var(--muted)', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <TextField
                  fullWidth type="date" size="small" label="Başlangıç Tarihi"
                  value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <TextField
                  fullWidth type="date" size="small" label="Bitiş Tarihi"
                  value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <FormControl fullWidth size="small">
                  <InputLabel>Durum</InputLabel>
                  <Select
                    multiple
                    value={filterDurum}
                    onChange={(e) => setFilterDurum(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    label="Durum"
                    renderValue={(selected: any) => (selected as string[]).map(s => getStatusLabel(s)).join(', ')}
                  >
                    <MenuItem value="BEKLEMEDE">Beklemede</MenuItem>
                    <MenuItem value="ONAYLANDI">Onaylandı</MenuItem>
                    <MenuItem value="KISMI_IHALE">Kısmi İhalet</MenuItem>
                    <MenuItem value="TAMAMLANDI">Tamamlandı</MenuItem>
                    <MenuItem value="IPTAL">İptal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <Autocomplete
                  size="small"
                  options={cariler}
                  getOptionLabel={(option: Cari) => `${option.accountCode} - ${option.title}`}
                  value={cariler.find(c => c.id === filterCariId) || null}
                  onChange={(_: any, newValue: Cari | null) => setFilterCariId(newValue?.id || '')}
                  renderInput={(params) => <TextField {...params} label="Cari" />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <Button variant="outlined" color="secondary" fullWidth onClick={handleClearFilters} sx={{ height: '40px' }}>
                  Filtreleri Temizle
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Tablo Satır Özeti */}
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Toplam <b>{rowCount}</b> sipariş listeleniyor
          </Typography>
        </Box>

        {/* DataGrid */}
        <Box sx={{ width: '100%' }}>
          <InvoiceDataGrid
            rows={siparisler}
            columns={columns}
            loading={loading}
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            onFilterModelChange={setFilterModel}
            checkboxSelection={false}
            height={900}
          />
        </Box>
        {/* Tablo footer sum */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Bu sayfadaki toplam <b>Tutar</b>:
          </Typography>
          <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--chart-1)' }}>
            {formatCurrency(pageGrandTotal)}
          </Typography>
        </Box>
      </StandardCard>

      {/* Dialogs */}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>
          Sipariş Detayı
        </DialogTitle>
        <DialogContent>
          {selectedSiparis && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">Sipariş No:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" fontWeight="bold">{selectedSiparis.siparisNo}</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">Tarih:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDate(selectedSiparis.tarih)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Cari:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedSiparis.account.title}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Durum:</Typography>
                <OrderStatusBadge status={selectedSiparis.durum} />
              </Box>

              {selectedSiparis.kalemler && selectedSiparis.kalemler.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Kalemler:</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Malzeme Kodu</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Stok</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Miktar</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Sevk Edilen</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Birim Fiyat</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>KDV %</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Tutar</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedSiparis.kalemler.map((kalem: any, index: any) => (
                          <TableRow key={index} hover>
                            <TableCell>{kalem.product?.code || '-'}</TableCell>
                            <TableCell>{kalem.product?.name || '-'}</TableCell>
                            <TableCell>{kalem.quantity}</TableCell>
                            <TableCell>{kalem.sevkEdilenMiktar || 0}</TableCell>
                            <TableCell>{formatCurrency(kalem.unitPrice)}</TableCell>
                            <TableCell>%{kalem.vatRate}</TableCell>
                            <TableCell align="right">
                              {formatCurrency((Number(kalem.amount) || 0) + (Number(kalem.vatAmount) || 0))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'var(--muted)', borderRadius: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="body2" color="text.secondary">Ara Toplam:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(Number(selectedSiparis.toplamTutar || 0))}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="body2" color="text.secondary">İskonto:</Typography>
                    <Typography variant="body2" fontWeight={500} color="error.main">
                      -{formatCurrency(selectedSiparis.iskonto || 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="body2" color="text.secondary">KDV Toplamı:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(selectedSiparis.kdvTutar || 0)}
                    </Typography>
                  </Box>
                  <Divider sx={{ width: '250px', my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="h6" fontWeight="bold">Genel Toplam:</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'var(--chart-1)' }}>
                      {formatCurrency(selectedSiparis.genelToplam)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Audit Bilgileri */}
              <Accordion variant="outlined" sx={{ bgcolor: 'color-mix(in srgb, var(--chart-1) 10%, transparent)', mt: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary
                  expandIcon={<ExpandMore color="primary" />}
                  sx={{
                    minHeight: '48px',
                    '& .MuiAccordionSummary-content': { my: 1 }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--chart-1)' }}>
                    📋 Denetim Bilgileri
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Oluşturan:
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {selectedSiparis.createdByUser?.fullName || 'Sistem'}
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({selectedSiparis.createdByUser?.username || '-'})
                          </Typography>
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Oluşturma Tarihi:
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {selectedSiparis.createdAt
                            ? new Date(selectedSiparis.createdAt).toLocaleString('tr-TR')
                            : '-'}
                        </Typography>
                      </Box>
                    </Box>

                    {selectedSiparis.updatedByUser && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Son Güncelleyen:
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedSiparis.updatedByUser.fullName}
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                              ({selectedSiparis.updatedByUser.username})
                            </Typography>
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Son Güncelleme:
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedSiparis.updatedAt
                              ? new Date(selectedSiparis.updatedAt).toLocaleString('tr-TR')
                              : '-'}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {selectedSiparis.logs && selectedSiparis.logs.length > 0 && (
                      <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid var(--border)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          Son İşlemler:
                        </Typography>
                        {selectedSiparis.logs.slice(0, 3).map((log: any, index: number) => (
                          <Typography key={index} variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                            • {new Date(log.createdAt).toLocaleString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - {log.actionType || log.message}
                            {log.user && ` (${log.user.fullName})`}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>Sipariş Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedSiparis?.siparisNo}</strong> nolu siparişi silmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Bu işlem geri alınamaz!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>İptal</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openIptal} onClose={() => setOpenIptal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(135deg, var(--destructive) 0%, var(--destructive) 100%)',
          color: 'var(--primary-foreground)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
        }}>
          Sipariş İptal
          <IconButton size="small" onClick={() => setOpenIptal(false)} sx={{ color: 'var(--primary-foreground)' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedSiparis && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Bu işlem geri alınamaz!
                </Typography>
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>{selectedSiparis.siparisNo}</strong> nolu siparişi iptal etmek istediğinizden emin misiniz?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenIptal(false)}>Vazgeç</Button>
          <Button
            onClick={handleIptal}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, var(--destructive) 0%, var(--destructive) 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, var(--destructive) 0%, var(--destructive) 100%)',
              }
            }}
          >
            İptal Et
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 220, mt: 1 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {(() => {
          const siparis = siparisler.find(s => s.id === menuSiparisId);
          if (!siparis) return null;

          return [
            <MenuItem key="detail" onClick={() => { handleMenuClose(); handleView(siparis); }}>
              <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Detayları Görüntüle</Typography>
            </MenuItem>,
            <MenuItem key="edit" onClick={() => { handleMenuClose(); handleEdit(siparis); }} disabled={siparis.durum === 'TAMAMLANDI' || siparis.durum === 'IPTAL'}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Düzenle</Typography>
            </MenuItem>,
            <MenuItem key="print" onClick={() => { handleMenuClose(); handlePrint(siparis); }}>
              <ListItemIcon><Print fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Yazdır</Typography>
            </MenuItem>,
            <MenuItem
              key="copy"
              onClick={() => {
                handleMenuClose();
                const path = `/orders/satis/yeni?kopyala=${siparis.id}`;
                const tabId = `siparis-satis-kopyala-${siparis.id}`;
                addTab({ id: tabId, label: `Kopya: ${siparis.siparisNo}`, path });
                setActiveTab(tabId);
                router.push(path);
              }}
            >
              <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Kopyasını Oluştur</Typography>
            </MenuItem>,
            siparis.durum === 'ONAYLANDI' && (
              <MenuItem key="prepare" onClick={() => { handleMenuClose(); handleHazirlama(siparis); }}>
                <ListItemIcon><Inventory fontSize="small" /></ListItemIcon>
                <Typography variant="body2">Sipariş Hazırla</Typography>
              </MenuItem>
            ),
            (siparis.durum === 'ONAYLANDI' || siparis.durum === 'KISMI_IHALE') && (
              <MenuItem key="convert-invoice" onClick={() => { handleMenuClose(); handleConvertToInvoice(siparis); }}>
                <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
                <Typography variant="body2">Faturaya Çevir</Typography>
              </MenuItem>
            ),
            (siparis.durum === 'ONAYLANDI' || siparis.durum === 'KISMI_IHALE') && (
              <MenuItem key="create-waybill" onClick={() => { handleMenuClose(); handleCreateIrsaliye(siparis); }}>
                <ListItemIcon><LocalShipping fontSize="small" /></ListItemIcon>
                <Typography variant="body2">İrsaliye Oluştur</Typography>
              </MenuItem>
            ),
            <MenuItem
              key="cancel"
              onClick={() => openIptalDialog(siparis)}
              disabled={siparis.durum === 'IPTAL' || siparis.durum === 'TAMAMLANDI'}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><Cancel fontSize="small" color="error" /></ListItemIcon>
              <Typography variant="body2">İptal Et</Typography>
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => openDeleteDialog(siparis)}
              disabled={siparis.durum === 'TAMAMLANDI' || siparis.durum === 'IPTAL'}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
              <Typography variant="body2">Sil</Typography>
            </MenuItem>
          ];
        })()}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StandardPage>
  );
}
