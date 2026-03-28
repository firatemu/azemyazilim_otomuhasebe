'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import { useTabStore } from '@/stores/tabStore';
import {
  Add,
  Close,
  Delete,
  Edit,
  Print,
  Search,
  Visibility,
  Cancel,
  Download,
  RefreshOutlined,
  ArrowUpward,
  FilterList,
  ExpandMore,
  Description,
  MoreVert,
  ContentCopy,
  Assignment,
  ShoppingCart,
  Receipt,
  LocalShipping,
  Send,
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

interface SiparisKalemi {
  id: string;
  stokId: string;
  miktar: number;
  sevkEdilenMiktar?: number;
  birimFiyat: number;
  kdvOrani: number;
  stok?: {
    id: string;
    stokKodu: string;
    stokAdi: string;
  };
}

interface SatinAlmaIrsaliyesi {
  id: string;
  irsaliyeNo: string;
  durum: string;
}

interface SatinAlmaSiparisi {
  id: string;
  siparisNo: string;
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
  kaynakIrsaliyeleri?: SatinAlmaIrsaliyesi[];
  kalemler?: SiparisKalemi[];
}

interface SiparisStats {
  total: number;
  pending: { totalAmount: number; count: number };
  approved: { totalAmount: number; count: number };
  monthly: { totalAmount: number; count: number };
}

export default function SatinAlmaSiparisleriPage() {
  const { addTab, setActiveTab } = useTabStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [siparisler, setSiparisler] = useState<SatinAlmaSiparisi[]>([]);
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [loading, setLoading] = useState(false);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'tarih', sort: 'desc' },
  ]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [rowCount, setRowCount] = useState(0);
  const [stats, setStats] = useState<SiparisStats | null>(null);
  const [filterDurum, setFilterDurum] = useState<string[]>([]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSiparis, setSelectedSiparis] = useState<SatinAlmaSiparisi | null>(null);
  const [openSevkDialog, setOpenSevkDialog] = useState(false);
  const [sevkKalemler, setSevkKalemler] = useState<Array<{ kalemId: string; sevkMiktar: number }>>([]);
  const [fullSiparis, setFullSiparis] = useState<SatinAlmaSiparisi | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openIptal, setOpenIptal] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterCariId, setFilterCariId] = useState('');

  useEffect(() => {
    addTab({
      id: 'orders-purchase',
      label: 'Satın Alma Siparişleri',
      path: '/orders/satin-alma',
    });
    fetchSiparisler();
    fetchCariler();
    fetchStats();
  }, [paginationModel, sortModel, filterModel, filterCariId, filterStartDate, filterEndDate, filterDurum]);

  const fetchSiparisler = async () => {
    try {
      setLoading(true);
      const page = paginationModel.page + 1;
      const limit = paginationModel.pageSize;
      const params: Record<string, any> = {
        page,
        limit,
        search: searchTerm || undefined,
        sortBy: sortModel[0]?.field || 'tarih',
        sortOrder: sortModel[0]?.sort || 'desc',
      };

      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/purchase-orders', { params });
      const data = response.data?.data || [];
      const total = response.data?.meta?.total ?? data.length;
      setSiparisler(data);
      setRowCount(total);
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

  const fetchStats = async () => {
    try {
      const params: Record<string, any> = {};
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/purchase-orders/stats', { params });
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = () => {
    addTab({ id: 'yeni-satin-alma-siparis', label: 'Yeni Satın Alma Siparişi', path: '/orders/satin-alma/yeni' });
    setActiveTab('yeni-satin-alma-siparis');
    router.push('/orders/satin-alma/yeni');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, siparisId: string) => {
    setAnchorEl(event.currentTarget);
    const siparis = siparisler.find(s => s.id === siparisId) || null;
    setSelectedSiparis(siparis);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSiparis(null);
  };

  const handleView = (row: SatinAlmaSiparisi) => {
    router.push(`/orders/satin-alma/detay/${row.id}`);
  };

  const handleEdit = (row: SatinAlmaSiparisi) => {
    const tabId = `siparis-satin-alma-duzenle-${row.id}`;
    addTab({ id: tabId, label: `Düzenle: ${row.siparisNo}`, path: `/orders/satin-alma/duzenle/${row.id}` });
    setActiveTab(tabId);
    router.push(`/orders/satin-alma/duzenle/${row.id}`);
  };

  const handlePrint = (row: SatinAlmaSiparisi) => {
    window.open(`/orders/satin-alma/print/${row.id}`, '_blank');
  };

  const handleConvertToInvoice = (siparis: SatinAlmaSiparisi) => {
    router.push(`/fatura/alis/yeni?siparisId=${siparis.id}`);
  };

  const handleIptal = async () => {
    if (!selectedSiparis) return;
    try {
      await axios.put(`/purchase-orders/${selectedSiparis.id}/cancel`);
      showSnackbar('Sipariş başarıyla iptal edildi', 'success');
      setOpenIptal(false);
      fetchSiparisler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İptal işlemi başarısız', 'error');
    }
    handleMenuClose();
  };

  const handleSevkClick = async (siparis: SatinAlmaSiparisi) => {
    try {
      setLoading(true);
      const response = await axios.get(`/purchase-orders/${siparis.id}`);
      const siparisDetay = response.data;
      setFullSiparis(siparisDetay);
      setSevkKalemler((siparisDetay.kalemler || []).map((kalem: SiparisKalemi) => ({
        kalemId: kalem.id,
        sevkMiktar: kalem.miktar - (kalem.sevkEdilenMiktar || 0),
      })));
      setOpenSevkDialog(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş detayları yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSevkSubmit = async () => {
    if (!fullSiparis) return;
    const hasSevk = sevkKalemler.some(k => k.sevkMiktar > 0);
    if (!hasSevk) {
      showSnackbar('En az bir kalem için sevk miktarı girmelisiniz', 'error');
      return;
    }
    for (const sevkKalem of sevkKalemler) {
      if (sevkKalem.sevkMiktar > 0) {
        const kalem = fullSiparis.kalemler?.find(k => k.id === sevkKalem.kalemId);
        if (kalem) {
          const kalanMiktar = kalem.miktar - (kalem.sevkEdilenMiktar || 0);
          if (sevkKalem.sevkMiktar > kalanMiktar) {
            showSnackbar(`${kalem.stok?.stokAdi || 'Ürün'} için sevk miktarı kalan miktarı (${kalanMiktar}) aşamaz`, 'error');
            return;
          }
        }
      }
    }
    try {
      setLoading(true);
      await axios.post(`/purchase-orders/${fullSiparis.id}/sevk-et`, {
        kalemler: sevkKalemler.filter(k => k.sevkMiktar > 0),
      });
      showSnackbar('Sipariş başarıyla sevk edildi', 'success');
      setOpenSevkDialog(false);
      setSevkKalemler([]);
      setFullSiparis(null);
      fetchSiparisler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sevk işlemi başarısız', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSevkMiktarChange = (kalemId: string, value: number) => {
    setSevkKalemler(prev =>
      prev.map(k => (k.kalemId === kalemId ? { ...k, sevkMiktar: Math.max(0, value) } : k))
    );
  };

  const handleCreateIrsaliye = async (siparis: SatinAlmaSiparisi) => {
    try {
      setLoading(true);
      const response = await axios.post(`/purchase-orders/${siparis.id}/create-irsaliye`);
      showSnackbar('İrsaliye başarıyla oluşturuldu', 'success');
      router.push(`/satin-alma-irsaliyesi/${response.data.id}`);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İrsaliye oluşturulurken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (siparis: SatinAlmaSiparisi) => {
    setSelectedSiparis(siparis);
    setOpenDelete(true);
  };

  const openIptalDialog = (siparis: SatinAlmaSiparisi) => {
    setSelectedSiparis(siparis);
    setOpenIptal(true);
  };

  const handleDelete = async () => {
    if (!selectedSiparis) return;
    try {
      await axios.delete(`/purchase-orders/${selectedSiparis.id}`);
      showSnackbar('Sipariş başarıyla silindi', 'success');
      setOpenDelete(false);
      setSelectedSiparis(null);
      fetchSiparisler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş silinirken hata oluştu', 'error');
    }
  };

  // Excel Export
  const handleExportExcel = async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/purchase-orders/export/excel', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `satin_alma_siparisleri_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

  const formatDate = (dateString: string) =>
    dateString ? new Date(dateString).toLocaleDateString('tr-TR') : '-';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'BEKLEMEDE':
        return 'Beklemede';
      case 'ONAYLANDI':
        return 'Onaylandı';
      case 'KISMI_IHALE':
        return 'Kısmi İhalen';
      case 'TAMAMLANDI':
        return 'Tamamlandı';
      case 'IPTAL':
        return 'İptal';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'ONAYLANDI':
        return 'info';
      case 'KISMI_IHALE':
        return 'warning';
      case 'TAMAMLANDI':
        return 'success';
      case 'IPTAL':
        return 'error';
      case 'BEKLEMEDE':
      default:
        return 'default';
    }
  };

  const kpiData = useMemo(
    () =>
      stats
        ? {
            aylikSatis: { tutar: stats.monthly?.totalAmount || 0, adet: stats.monthly?.count || 0 },
            tahsilatBekleyen: { tutar: stats.pending?.totalAmount || 0, adet: stats.pending?.count || 0 },
            vadesiGecmis: { tutar: stats.approved?.totalAmount || 0, adet: stats.approved?.count || 0 },
          }
        : null,
    [stats]
  );

  const pageGrandTotal = useMemo(
    () => siparisler.reduce((sum, s) => sum + (s.genelToplam || 0), 0),
    [siparisler]
  );

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'siparisNo',
      headerName: 'Sipariş No',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
      ),
    },
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 120,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString('tr-TR') : ''),
      renderCell: (params) => (
        <Box sx={{ alignSelf: 'flex-end' }}>{params.value ? new Date(params.value).toLocaleDateString('tr-TR') : ''}</Box>
      ),
    },
    {
      field: 'accountCode',
      headerName: 'Cari Kod',
      width: 130,
      valueGetter: (value, row) => row.account?.accountCode || '',
    },
    {
      field: 'account',
      headerName: 'Tedarikçi',
      flex: 1.5,
      minWidth: 200,
      valueGetter: (account: any) => account?.title || '',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.account?.accountCode || ''}</Typography>
        </Box>
      ),
    },
    {
      field: 'vade',
      headerName: 'Vade',
      width: 120,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString('tr-TR') : '-'),
      renderCell: (params) => (
        <Box sx={{ alignSelf: 'flex-end' }}>{params.value ? new Date(params.value).toLocaleDateString('tr-TR') : '-'}</Box>
      ),
    },
    {
      field: 'genelToplam',
      headerName: 'Tutar',
      width: 150,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value ?? 0),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
          <ArrowUpward sx={{ fontSize: 14, color: 'var(--chart-2)' }} />
          <Typography variant="body2" fontWeight="700" sx={{ fontFamily: 'monospace', color: 'var(--chart-2)' }}>
            {formatCurrency(params.value ?? 0)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'durum',
      headerName: 'Durum',
      width: 140,
      renderCell: (params) => (
        <StatusBadge status={params.value} />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 160,
      getActions: (params) => {
        const row = params.row as SatinAlmaSiparisi;
        return [
          <Tooltip key="view" title="Detay">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleView(row); }}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>,
          <Tooltip key="edit" title="Düzenle">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
              disabled={row.durum === 'TAMAMLANDI' || row.durum === 'IPTAL'}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>,
          <Tooltip key="print" title="Yazdır">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePrint(row); }}>
              <Print fontSize="small" />
            </IconButton>
          </Tooltip>,
          <Tooltip key="more" title="Diğer İşlemler">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e as any, row.id); }}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Tooltip>,
        ];
      },
    },
  ], []);

  return (
    <StandardPage maxWidth={false}>
      {/* Header & Action Buttons */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'color-mix(in srgb, var(--chart-2) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart sx={{ color: 'var(--chart-2)', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight="700" color="text.primary">
            Satın Alma Siparişleri
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={handleCreate}
            sx={{
              bgcolor: 'var(--chart-2)',
              fontWeight: 600,
              fontSize: '0.8rem',
              px: 1.5,
              py: 0.75,
              minWidth: 0,
              boxShadow: 'none',
              '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-2) 85%, var(--background))', boxShadow: 'none' },
            }}
          >
            Yeni Sipariş
          </Button>
        </Stack>
      </Box>

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 3 }} color="info" />}

      {/* KPI Cards */}
      <KPIHeader loading={loading} data={kpiData} type="ALIS_SIPARIS" />

      {/* Integrated Toolbar and DataGrid */}
      <StandardCard padding={0} sx={{ boxShadow: 'none', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'var(--card)' }}>
          <TextField
            size="small"
            placeholder="Sipariş Ara (No, Tedarikçi vb.)"
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
          {/* Quick Date Chips */}
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
                  color={isSelected ? 'info' : 'default'}
                  sx={{ borderRadius: 2, cursor: 'pointer', fontWeight: 500, fontSize: '0.75rem' }}
                />
              );
            })}
          </Stack>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            <Tooltip title="Filtreler">
              <IconButton size="small" onClick={() => setShowFilters(!showFilters)} color={showFilters ? 'info' : 'default'}>
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth type="date" size="small" label="Başlangıç Tarihi"
                  value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth type="date" size="small" label="Bitiş Tarihi"
                  value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                    <MenuItem value="KISMI_IHALE">Kısmi İhalen</MenuItem>
                    <MenuItem value="TAMAMLANDI">Tamamlandı</MenuItem>
                    <MenuItem value="IPTAL">İptal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Autocomplete
                  size="small"
                  options={cariler}
                  getOptionLabel={(option: Cari) => `${option.accountCode} - ${option.title}`}
                  value={cariler.find(c => c.id === filterCariId) || null}
                  onChange={(_: any, newValue: Cari | null) => setFilterCariId(newValue?.id || '')}
                  renderInput={(params) => <TextField {...params} label="Tedarikçi" />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button variant="outlined" color="secondary" fullWidth onClick={handleClearFilters} sx={{ height: '40px' }}>
                  Filtreleri Temizle
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Table Row Summary */}
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
            onRowClick={(params) => handleView(params.row as SatinAlmaSiparisi)}
            checkboxSelection={false}
            height={900}
          />
        </Box>

        {/* Table footer sum */}
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
          <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--chart-2)' }}>
            {formatCurrency(pageGrandTotal)}
          </Typography>
        </Box>
      </StandardCard>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ elevation: 3, sx: { minWidth: 220, mt: 1 } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {selectedSiparis && (
          <>
            <MenuItem onClick={() => { handleMenuClose(); handleView(selectedSiparis); }}>
              <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Detayları Görüntüle</Typography>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); handleEdit(selectedSiparis); }} disabled={selectedSiparis.durum === 'TAMAMLANDI' || selectedSiparis.durum === 'IPTAL'}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Düzenle</Typography>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); handlePrint(selectedSiparis); }}>
              <ListItemIcon><Print fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Yazdır</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleMenuClose(); handleSevkClick(selectedSiparis); }} disabled={selectedSiparis.durum === 'IPTAL'}>
              <ListItemIcon><Send fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Sevk Et</Typography>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); handleConvertToInvoice(selectedSiparis); }} disabled={selectedSiparis.durum === 'BEKLEMEDE' || selectedSiparis.durum === 'IPTAL'}>
              <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Faturalandır</Typography>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); handleCreateIrsaliye(selectedSiparis); }} disabled={selectedSiparis.durum === 'BEKLEMEDE' || selectedSiparis.durum === 'IPTAL'}>
              <ListItemIcon><LocalShipping fontSize="small" /></ListItemIcon>
              <Typography variant="body2">İrsaliye Oluştur</Typography>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); openIptalDialog(selectedSiparis); }} disabled={selectedSiparis.durum === 'IPTAL'} sx={{ color: 'error.main' }}>
              <ListItemIcon><Cancel fontSize="small" color="error" /></ListItemIcon>
              <Typography variant="body2">İptal Et</Typography>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); openDeleteDialog(selectedSiparis); }} disabled={selectedSiparis.durum === 'TAMAMLANDI'} sx={{ color: 'error.main' }}>
              <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
              <Typography variant="body2">Sil</Typography>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Sevk Dialog */}
      <Dialog open={openSevkDialog} onClose={() => { setOpenSevkDialog(false); setFullSiparis(null); setSevkKalemler([]); }} maxWidth="md" fullWidth>
        <DialogTitle>Sipariş Sevk Et - {fullSiparis?.siparisNo}</DialogTitle>
        <DialogContent>
          {fullSiparis && (
            <Box sx={{ mt: 2 }}>
              <DialogContentText sx={{ mb: 3 }}>Sipariş kalemlerini sevk edin. Kısmi sevk yapabilirsiniz.</DialogContentText>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Malzeme Kodu</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ürün</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Sipariş Miktarı</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Sevk Edilen</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Kalan</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Bu Sevk Miktarı</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fullSiparis.kalemler?.map((kalem) => {
                      const sevkKalem = sevkKalemler.find(k => k.kalemId === kalem.id);
                      const sevkMiktar = sevkKalem?.sevkMiktar || 0;
                      const kalanMiktar = kalem.miktar - (kalem.sevkEdilenMiktar || 0);
                      return (
                        <TableRow key={kalem.id}>
                          <TableCell>{kalem.stok?.stokKodu || '-'}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">{kalem.stok?.stokAdi || 'Ürün'}</Typography>
                          </TableCell>
                          <TableCell align="right">{kalem.miktar}</TableCell>
                          <TableCell align="right">{kalem.sevkEdilenMiktar || 0}</TableCell>
                          <TableCell align="right">{kalanMiktar}</TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={sevkMiktar}
                              onChange={(e) => handleSevkMiktarChange(kalem.id, parseInt(e.target.value) || 0)}
                              inputProps={{ min: 0, max: kalanMiktar }}
                              sx={{ width: 100 }}
                              disabled={kalanMiktar === 0}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenSevkDialog(false); setFullSiparis(null); setSevkKalemler([]); }}>İptal</Button>
          <Button onClick={handleSevkSubmit} variant="contained" disabled={loading} sx={{ bgcolor: 'var(--chart-2)', '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-2) 85%, var(--background))' } }}>
            {loading ? 'Sevk Ediliyor...' : 'Sevk Et'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => { setOpenDelete(false); setSelectedSiparis(null); }}>
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>Sipariş Sil</DialogTitle>
        <DialogContent>
          <Typography><strong>{selectedSiparis?.siparisNo}</strong> numaralı siparişi silmek istediğinizden emin misiniz?</Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>Bu işlem geri alınamaz!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDelete(false); setSelectedSiparis(null); }}>İptal</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Sil</Button>
        </DialogActions>
      </Dialog>

      {/* İptal Dialog */}
      <Dialog open={openIptal} onClose={() => { setOpenIptal(false); setSelectedSiparis(null); }} maxWidth="sm" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>Sipariş İptal</DialogTitle>
        <DialogContent>
          <Typography><strong>{selectedSiparis?.siparisNo}</strong> numaralı siparişi iptal etmek istediğinizden emin misiniz?</Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>Bu işlem geri alınamaz!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenIptal(false); setSelectedSiparis(null); }}>İptal</Button>
          <Button onClick={handleIptal} variant="contained" color="error">İptal Et</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StandardPage>
  );
}
