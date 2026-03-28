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
  ArrowDownward,
  FilterList,
  ExpandMore,
  MoreVert,
  LocalShipping,
  Receipt,
  ContentCopy,
  Description,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  Stack,
  LinearProgress,
} from '@mui/material';
import { GridColDef, GridPaginationModel, GridSortModel, GridFilterModel } from '@mui/x-data-grid';
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

interface IrsaliyeKalemi {
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
  discountAmount: number;
  amount?: number;
  vatAmount?: number;
}

interface SatisIrsaliyesi {
  id: string;
  deliveryNoteNo: string;
  date: string;
  account: Cari;
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  status: 'BEKLEMEDE' | 'TESLIM_EDILDI' | 'FATURAYA_BAGLANDI' | 'IPTAL';
  description?: string;
  items?: IrsaliyeKalemi[];
  sourceType: 'SIPARIS' | 'DOGRUDAN' | 'FATURA_OTOMATIK';
  sourceOrder?: {
    id: string;
    orderNo: string;
  };
  relatedInvoiceId?: string;
  relatedInvoice?: {
    id: string;
    invoiceNo: string;
  };
  createdByUser?: { fullName?: string; username?: string };
  createdAt?: string;
  updatedByUser?: { fullName?: string; username?: string };
  updatedAt?: string;
  logs?: Array<{ createdAt: string; message: string; actionType?: string; user?: any }>;
}

interface DeliveryNoteStats {
  monthlyNotes: { totalAmount: number; count: number };
  pendingNotes: { totalAmount: number; count: number };
  deliveredNotes: { totalAmount: number; count: number };
}

export default function SatisIrsaliyeleriPage() {
  const { addTab, setActiveTab } = useTabStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const [irsaliyeler, setIrsaliyeler] = useState<SatisIrsaliyesi[]>([]);
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
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedIrsaliye, setSelectedIrsaliye] = useState<SatisIrsaliyesi | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    deliveryNoteNo: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    items: [] as IrsaliyeKalemi[],
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // Açılır menü state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIrsaliyeId, setMenuIrsaliyeId] = useState<string | null>(null);

  // Summary Cards stats
  const [stats, setStats] = useState<DeliveryNoteStats | null>(null);

  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterDurum, setFilterDurum] = useState<string[]>([]);
  const [filterCariId, setFilterCariId] = useState('');

  useEffect(() => {
    addTab({
      id: 'sales-delivery-note-list',
      label: 'Satış İrsaliyeleri',
      path: '/sales-delivery-note',
    });
    fetchIrsaliyeler();
    fetchCariler();
    fetchStoklar();
    fetchStats();
  }, [paginationModel, sortModel, filterModel, filterCariId, filterStartDate, filterEndDate, filterDurum]);

  const fetchIrsaliyeler = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        type: 'SATIS_IRSALIYE',
        search: searchTerm,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        sortBy: sortModel[0]?.field || 'createdAt',
        sortOrder: sortModel[0]?.sort || 'desc',
      };

      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/delivery-notes', { params });

      const irsaliyeData = response.data?.data || [];
      const totalCount = response.data?.meta?.total || response.data?.total || irsaliyeData.length;

      setIrsaliyeler(irsaliyeData);
      setRowCount(totalCount);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İrsaliyeler yüklenirken hata oluştu', 'error');
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, irsaliyeId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuIrsaliyeId(irsaliyeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIrsaliyeId(null);
  };

  // Excel Export
  const handleExportExcel = async () => {
    try {
      const params: Record<string, string> = { type: 'SATIS_IRSALIYE' };
      if (searchTerm) params.search = searchTerm;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/delivery-notes/export/excel', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `satis_irsaliyeleri_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  const resetForm = () => {
    setFormData({
      deliveryNoteNo: '',
      accountId: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      items: [],
    });
    setOpenAdd(false);
    setOpenEdit(false);
    setSelectedIrsaliye(null);
  };

  const handleAddKalem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        discountRate: 0,
        discountAmount: 0
      }],
    }));
  };

  const handleRemoveKalem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleKalemChange = (index: number, field: keyof IrsaliyeKalemi, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      if (field === 'productId') {
        const stok = stoklar.find(s => s.id === value);
        if (stok) {
          newItems[index].unitPrice = stok.satisFiyati;
          newItems[index].vatRate = stok.kdvOrani;
        }
      }

      return { ...prev, items: newItems };
    });
  };

  const calculateTotal = () => {
    let totalAmount = 0;
    let vatAmount = 0;

    formData.items.forEach(item => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const rawTutar = quantity * unitPrice;

      const discountRate = item.discountRate || 0;
      const discountAmount = item.discountAmount || (rawTutar * discountRate) / 100;
      const amount = rawTutar - discountAmount;

      const itemVat = (amount * (item.vatRate || 0)) / 100;

      totalAmount += amount;
      vatAmount += itemVat;
    });

    const grandTotal = totalAmount + vatAmount;

    return { totalAmount, vatAmount, grandTotal };
  };

  const handleSave = async () => {
    try {
      if (!formData.accountId) {
        showSnackbar('Cari seçimi zorunludur', 'error');
        return;
      }

      if (formData.items.length === 0) {
        showSnackbar('En az bir kalem eklemelisiniz', 'error');
        return;
      }

      if (selectedIrsaliye) {
        await axios.put(`/delivery-notes/${selectedIrsaliye.id}`, formData);
        showSnackbar('İrsaliye başarıyla güncellendi', 'success');
        setOpenEdit(false);
      } else {
        await axios.post('/delivery-notes', formData);
        showSnackbar('İrsaliye başarıyla oluşturuldu', 'success');
        setOpenAdd(false);
      }

      fetchIrsaliyeler();
      resetForm();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedIrsaliye) {
        await axios.delete(`/delivery-notes/${selectedIrsaliye.id}`);
        showSnackbar('İrsaliye başarıyla silindi', 'success');
        setOpenDelete(false);
        fetchIrsaliyeler();
      }
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme işlemi başarısız', 'error');
    }
  };

  const openAddDialog = async () => {
    resetForm();
    try {
      const response = await axios.get('/code-templates/preview-code/DELIVERY_NOTE_SALES');
      if (response.data?.nextCode) {
        setFormData(prev => ({
          ...prev,
          deliveryNoteNo: response.data.nextCode,
        }));
      } else {
        const lastIrsaliye = irsaliyeler[0];
        const lastNo = lastIrsaliye ? parseInt(lastIrsaliye.deliveryNoteNo.split('-')[2] || '0') : 0;
        const newNo = (lastNo + 1).toString().padStart(3, '0');
        setFormData(prev => ({
          ...prev,
          deliveryNoteNo: `SI-${new Date().getFullYear()}-${newNo}`,
        }));
      }
    } catch (error: any) {
      const lastIrsaliye = irsaliyeler[0];
      const lastNo = lastIrsaliye ? parseInt(lastIrsaliye.deliveryNoteNo.split('-')[2] || '0') : 0;
      const newNo = (lastNo + 1).toString().padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        deliveryNoteNo: `SI-${new Date().getFullYear()}-${newNo}`,
      }));
    }
    setOpenAdd(true);
  };

  const openEditDialog = async (irsaliye: SatisIrsaliyesi) => {
    try {
      const response = await axios.get(`/delivery-notes/${irsaliye.id}`);
      const fullIrsaliye = response.data;

      setFormData({
        deliveryNoteNo: fullIrsaliye.deliveryNoteNo,
        accountId: fullIrsaliye.accountId,
        date: new Date(fullIrsaliye.date).toISOString().split('T')[0],
        description: fullIrsaliye.description || '',
        items: fullIrsaliye.items.map((k: any) => ({
          productId: k.productId,
          quantity: k.quantity,
          unitPrice: k.unitPrice,
          vatRate: k.vatRate,
          discountRate: k.discountRate || 0,
          discountAmount: k.discountAmount || 0,
        })),
      });

      setSelectedIrsaliye(irsaliye);
      setOpenEdit(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İrsaliye yüklenirken hata oluştu', 'error');
    }
  };

  const openViewDialog = async (irsaliye: SatisIrsaliyesi) => {
    try {
      const response = await axios.get(`/delivery-notes/${irsaliye.id}`);
      setSelectedIrsaliye(response.data);
      setOpenView(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İrsaliye yüklenirken hata oluştu', 'error');
    }
  };

  const openDeleteDialog = (irsaliye: SatisIrsaliyesi) => {
    setSelectedIrsaliye(irsaliye);
    setOpenDelete(true);
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

  const kpiData = useMemo(
    () =>
      stats
        ? {
            aylikSatis: { tutar: stats.monthlyNotes?.totalAmount || 0, adet: stats.monthlyNotes?.count || 0 },
            tahsilatBekleyen: { tutar: stats.pendingNotes?.totalAmount || 0, adet: stats.pendingNotes?.count || 0 },
            vadesiGecmis: { tutar: stats.deliveredNotes?.totalAmount || 0, adet: stats.deliveredNotes?.count || 0 },
          }
        : null,
    [stats]
  );

  const pageGrandTotal = useMemo(
    () => irsaliyeler.reduce((sum, i) => sum + (i.grandTotal || 0), 0),
    [irsaliyeler]
  );

  const fetchStats = async () => {
    try {
      const params: Record<string, any> = { type: 'SATIS_IRSALIYE' };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/delivery-notes/stats', {
        params
      });
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'TESLIM_EDILDI':
        return 'Teslim Edildi';
      case 'BEKLEMEDE':
        return 'Beklemede';
      case 'FATURAYA_BAGLANDI':
        return 'Faturaya Bağlandı';
      case 'IPTAL':
        return 'İptal';
      default:
        return status;
    }
  };

  const handleEdit = (row: SatisIrsaliyesi) => {
    const tabId = `sales-delivery-note-edit-${row.id}`;
    addTab({
      id: tabId,
      label: `Düzenle: ${row.deliveryNoteNo}`,
      path: `/sales-delivery-note/duzenle/${row.id}`,
    });
    setActiveTab(tabId);
    router.push(`/sales-delivery-note/duzenle/${row.id}`);
  };

  const handleView = (row: SatisIrsaliyesi) => {
    openViewDialog(row);
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'deliveryNoteNo',
      headerName: 'İrsaliye No',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'date',
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
      field: 'grandTotal',
      headerName: 'Tutar',
      width: 150,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
          <ArrowDownward sx={{ fontSize: 14, color: 'var(--ring)' }} />
          <Typography variant="body2" fontWeight="700" sx={{ color: 'var(--ring)' }}>
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(params.value)}
          </Typography>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 140,
      renderCell: (params) => {
        const statusMap: Record<string, { color: any; label: string }> = {
          'TESLIM_EDILDI': { color: 'success' as const, label: 'Teslim Edildi' },
          'BEKLEMEDE': { color: 'warning' as const, label: 'Beklemede' },
          'FATURAYA_BAGLANDI': { color: 'info' as const, label: 'Faturaya Bağlandı' },
          'IPTAL': { color: 'error' as const, label: 'İptal' },
        };
        const statusInfo = statusMap[params.value] || { color: 'default' as const, label: params.value };
        return <StatusBadge status={params.value} />;
      }
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
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); window.open(`/sales-delivery-note/print/${params.row.id}`, '_blank'); }}>
            <Print fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip key="view" title="Detay">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleView(params.row); }}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip key="more" title="Diğer İşlemler">
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
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'color-mix(in srgb, var(--ring) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalShipping sx={{ color: 'var(--ring)', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight="700" color="text.primary">
            Satış İrsaliyeleri
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => {
              addTab({
                id: 'sales-delivery-note-yeni',
                label: 'Yeni Satış İrsaliyesi',
                path: '/sales-delivery-note/yeni'
              });
              setActiveTab('sales-delivery-note-yeni');
              router.push('/sales-delivery-note/yeni');
            }}
            sx={{
              bgcolor: 'var(--ring)',
              fontWeight: 600,
              fontSize: '0.8rem',
              px: 1.5,
              py: 0.75,
              minWidth: 0,
              boxShadow: 'none',
              '&:hover': { bgcolor: 'color-mix(in srgb, var(--ring) 85%, var(--background))', boxShadow: 'none' },
            }}
          >
            Yeni İrsaliye
          </Button>
        </Stack>
      </Box>

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 3 }} color="primary" />}

      {/* KPI Kartları */}
      <KPIHeader loading={loading} data={kpiData} type="SATIS_IRSALIYE" />

      {/* Entegre Toolbar ve DataGrid */}
      <StandardCard padding={0} sx={{ boxShadow: 'none', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'var(--card)' }}>
          <TextField
            size="small"
            placeholder="İrsaliye Ara (No, Cari vb.)"
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
              <IconButton size="small" onClick={fetchIrsaliyeler}>
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
                    <MenuItem value="TESLIM_EDILDI">Teslim Edildi</MenuItem>
                    <MenuItem value="FATURAYA_BAGLANDI">Faturaya Bağlandı</MenuItem>
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
                  renderInput={(params) => <TextField {...params} label="Cari" />}
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

        {/* Tablo Satır Özeti */}
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Toplam <b>{rowCount}</b> irsaliye listeleniyor
          </Typography>
        </Box>

        {/* DataGrid */}
        <Box sx={{ width: '100%' }}>
          <InvoiceDataGrid
            rows={irsaliyeler}
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
          <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--ring)' }}>
            {formatCurrency(pageGrandTotal)}
          </Typography>
        </Box>
      </StandardCard>

      {/* View Dialog */}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>
          İrsaliye Detayı
        </DialogTitle>
        <DialogContent>
          {selectedIrsaliye && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">İrsaliye No:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" fontWeight="bold">{selectedIrsaliye.deliveryNoteNo}</Typography>
                    {selectedIrsaliye.relatedInvoice && (
                      <MuiLink
                        component={Link}
                        href={`/invoice/sales/${selectedIrsaliye.relatedInvoice.id}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          textDecoration: 'none',
                          color: 'var(--ring)',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        <Receipt fontSize="small" />
                        <Typography variant="body2" fontWeight={500}>
                          {selectedIrsaliye.relatedInvoice.invoiceNo}
                        </Typography>
                      </MuiLink>
                    )}
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">Tarih:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDate(selectedIrsaliye.date)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Cari:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedIrsaliye.account.title}
                </Typography>
              </Box>

              {selectedIrsaliye.items && selectedIrsaliye.items.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Kalemler:</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Malzeme Kodu</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Stok</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Miktar</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Birim Fiyat</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>İndirim (%)</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>İndirim (₺)</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>KDV %</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Tutar</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedIrsaliye.items.map((kalem: any, index: any) => (
                          <TableRow key={index} hover>
                            <TableCell>{kalem.product?.code || '-'}</TableCell>
                            <TableCell>{kalem.product?.name || '-'}</TableCell>
                            <TableCell>{kalem.quantity}</TableCell>
                            <TableCell>{formatCurrency(kalem.unitPrice)}</TableCell>
                            <TableCell>%{kalem.discountRate || 0}</TableCell>
                            <TableCell>{formatCurrency(kalem.discountAmount || 0)}</TableCell>
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
                      {formatCurrency(Number(selectedIrsaliye.totalAmount || 0))}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="body2" color="text.secondary">KDV Toplamı:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(selectedIrsaliye.vatAmount || 0)}
                    </Typography>
                  </Box>
                  <Divider sx={{ width: '250px', my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="h6" fontWeight="bold">Genel Toplam:</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'var(--ring)' }}>
                      {formatCurrency(selectedIrsaliye.grandTotal)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Audit Bilgileri */}
              <Accordion variant="outlined" sx={{ bgcolor: 'color-mix(in srgb, var(--ring) 10%, transparent)', mt: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary
                  expandIcon={<ExpandMore color="primary" />}
                  sx={{
                    minHeight: '48px',
                    '& .MuiAccordionSummary-content': { my: 1 }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--primary)' }}>
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
                          {selectedIrsaliye.createdByUser?.fullName || 'Sistem'}
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({selectedIrsaliye.createdByUser?.username || '-'})
                          </Typography>
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Oluşturma Tarihi:
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {selectedIrsaliye.createdAt
                            ? new Date(selectedIrsaliye.createdAt).toLocaleString('tr-TR')
                            : '-'}
                        </Typography>
                      </Box>
                    </Box>

                    {selectedIrsaliye.updatedByUser && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Son Güncelleyen:
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedIrsaliye.updatedByUser.fullName}
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                              ({selectedIrsaliye.updatedByUser.username})
                            </Typography>
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Son Güncelleme:
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedIrsaliye.updatedAt
                              ? new Date(selectedIrsaliye.updatedAt).toLocaleString('tr-TR')
                              : '-'}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {selectedIrsaliye.logs && selectedIrsaliye.logs.length > 0 && (
                      <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid var(--border)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          Son İşlemler:
                        </Typography>
                        {selectedIrsaliye.logs.slice(0, 3).map((log: any, index: number) => (
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
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>İrsaliye Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedIrsaliye?.deliveryNoteNo}</strong> numaralı irsaliyeyi silmek istediğinizden emin misiniz?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Bu işlem geri alınamaz!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>İptal</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Sil
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
          const irsaliye = irsaliyeler.find(i => i.id === menuIrsaliyeId);
          if (!irsaliye) return null;

          return [
            <MenuItem key="detail" onClick={() => { handleMenuClose(); handleView(irsaliye); }}>
              <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Detayları Görüntüle</Typography>
            </MenuItem>,
            <MenuItem key="edit" onClick={() => { handleMenuClose(); handleEdit(irsaliye); }} disabled={irsaliye.status === 'FATURAYA_BAGLANDI' || irsaliye.status === 'IPTAL'}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Düzenle</Typography>
            </MenuItem>,
            <MenuItem key="print" onClick={() => { handleMenuClose(); window.open(`/sales-delivery-note/print/${irsaliye.id}`, '_blank'); }}>
              <ListItemIcon><Print fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Yazdır</Typography>
            </MenuItem>,
            <MenuItem
              key="invoice"
              onClick={() => {
                handleMenuClose();
                router.push(`/invoice/sales/yeni?irsaliyeId=${irsaliye.id}`);
              }}
              disabled={irsaliye.status === 'FATURAYA_BAGLANDI' || irsaliye.status === 'IPTAL'}
            >
              <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Faturalandır</Typography>
            </MenuItem>,
            <MenuItem
              key="copy"
              onClick={() => {
                handleMenuClose();
                const path = `/sales-delivery-note/yeni?kopyala=${irsaliye.id}`;
                const tabId = `irsaliye-kopyala-${irsaliye.id}`;
                addTab({ id: tabId, label: `Kopya: ${irsaliye.deliveryNoteNo}`, path });
                setActiveTab(tabId);
                router.push(path);
              }}
            >
              <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Kopyasını Oluştur</Typography>
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => { handleMenuClose(); openDeleteDialog(irsaliye); }}
              disabled={irsaliye.status === 'FATURAYA_BAGLANDI' || irsaliye.status === 'IPTAL'}
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
