'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Select,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
  ListItemIcon,
} from '@mui/material';
import { Add, Visibility, Edit, Delete, Close, Cancel, Print, Undo, MoreVert } from '@mui/icons-material';
import { GridColDef, GridPaginationModel, GridSortModel, GridFilterModel } from '@mui/x-data-grid';
import MainLayout from '@/components/Layout/MainLayout';
import KPIHeader from '@/components/Fatura/KPIHeader';
import InvoiceDataGrid from '@/components/Fatura/InvoiceDataGrid';
import StatusBadge from '@/components/Fatura/StatusBadge';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useTabStore } from '@/stores/tabStore';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
  vergiNo?: string;
  tcKimlikNo?: string;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  satisFiyati: number;
  kdvOrani: number;
}

interface FaturaKalemi {
  stokId: string;
  stok?: Stok;
  miktar: number;
  birimFiyat: number;
  kdvOrani: number;
  iskontoOrani?: number;
  iskontoTutari?: number;
  tutar?: number;
  kdvTutar?: number;
}

interface Fatura {
  id: string;
  faturaNo: string;
  faturaTipi: 'SATIS' | 'ALIS';
  tarih: string;
  vade: string | null;
  cari: Cari;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  durum: 'ACIK' | 'ONAYLANDI' | 'KISMEN_ODENDI' | 'KAPALI' | 'IPTAL';
  iskonto?: number;
  aciklama?: string;
  kalemler?: FaturaKalemi[];
  odenenTutar?: number;    // FIFO: Ödenen tutar
  odenecekTutar?: number;  // FIFO: Kalan tutar
  createdByUser?: {
    fullName?: string;
    username?: string;
  };
  createdAt?: string;
  updatedByUser?: {
    fullName?: string;
    username?: string;
  };
  updatedAt?: string;
  logs?: Array<{
    createdAt: string;
    message: string;
  }>;
  satinAlmaIrsaliyesi?: {
    id: string;
    irsaliyeNo: string;
  };
}

interface PurchaseStats {
  aylikSatis: { tutar: number; adet: number };
  tahsilatBekleyen: { tutar: number; adet: number };
  vadesiGecmis: { tutar: number; adet: number };
}

export default function AlisFaturalariPage() {
  const { addTab, setActiveTab } = useTabStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [faturalar, setFaturalar] = useState<Fatura[]>([]);
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
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
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterDurum, setFilterDurum] = useState<string[]>([]);

  // Dialog states
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openIptal, setOpenIptal] = useState(false);
  const [openDurumOnay, setOpenDurumOnay] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);
  const [pendingDurum, setPendingDurum] = useState<{ faturaId: string; eskiDurum: string; yeniDurum: string } | null>(null);
  const [faturaDurumlari, setFaturaDurumlari] = useState<Record<string, string>>({});
  const [irsaliyeIptal, setIrsaliyeIptal] = useState(false);

  // Açılır menü state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFaturaId, setMenuFaturaId] = useState<string | null>(null);


  // Form data
  const [formData, setFormData] = useState({
    faturaNo: '',
    faturaTipi: 'ALIS' as 'SATIS' | 'ALIS',
    cariId: '',
    tarih: new Date().toISOString().split('T')[0],
    vade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    iskonto: 0,
    aciklama: '',
    kalemler: [] as FaturaKalemi[],
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchFaturalar();
    fetchCariler();
    fetchStoklar();
    fetchStats();
  }, [paginationModel, sortModel, filterModel]);

  const fetchFaturalar = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        faturaTipi: 'ALIS',
        search: searchTerm,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        sortBy: sortModel[0]?.field || 'tarih',
        sortOrder: sortModel[0]?.sort || 'desc',
      };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.durum = filterDurum.join(',');

      const response = await axios.get('/fatura', { params });
      const faturaData = response.data?.data || [];
      const totalCount = response.data?.meta?.total ?? response.data?.total ?? faturaData.length;
      setFaturalar(faturaData);
      setRowCount(totalCount);
      const durumMap: Record<string, string> = {};
      faturaData.forEach((fatura: Fatura) => {
        durumMap[fatura.id] = fatura.durum;
      });
      setFaturaDurumlari(durumMap);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Faturalar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/fatura/stats', {
        params: { faturaTipi: 'ALIS' },
      });
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const fetchCariler = async () => {
    try {
      const response = await axios.get('/cari', {
        params: { limit: 1000 },
      });
      setCariler(response.data.data || []);
    } catch (error) {
      console.error('Cariler yüklenirken hata:', error);
    }
  };

  const fetchStoklar = async () => {
    try {
      const response = await axios.get('/stok', {
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

  const handleClearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterDurum([]);
    setSearchTerm('');
  };

  const handleExportExcel = async () => {
    try {
      const params: Record<string, string> = { faturaTipi: 'ALIS' };
      if (searchTerm) params.search = searchTerm;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.durum = filterDurum.join(',');

      const response = await axios.get('/fatura/export/excel', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `satin_alma_faturalari_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSnackbar('Excel dosyası indirildi', 'success');
    } catch (error: any) {
      showSnackbar('Excel aktarımı başarısız', 'error');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, faturaId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuFaturaId(faturaId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuFaturaId(null);
  };


  const resetForm = () => {
    setFormData({
      faturaNo: '',
      faturaTipi: 'ALIS',
      cariId: '',
      tarih: new Date().toISOString().split('T')[0],
      vade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      iskonto: 0,
      aciklama: '',
      kalemler: [],
    });
  };

  const handleAddKalem = () => {
    setFormData(prev => ({
      ...prev,
      kalemler: [...prev.kalemler, { stokId: '', miktar: 1, birimFiyat: 0, kdvOrani: 20, iskontoOrani: 0, iskontoTutari: 0 }],
    }));
  };

  const handleRemoveKalem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      kalemler: prev.kalemler.filter((_, i) => i !== index),
    }));
  };

  const handleKalemChange = (index: number, field: keyof FaturaKalemi, value: any) => {
    setFormData(prev => {
      const newKalemler = [...prev.kalemler];
      newKalemler[index] = { ...newKalemler[index], [field]: value };

      // Stok seçildiğinde fiyat ve KDV oranını otomatik doldur
      if (field === 'stokId') {
        const stok = stoklar.find(s => s.id === value);
        if (stok) {
          newKalemler[index].birimFiyat = stok.satisFiyati;
          newKalemler[index].kdvOrani = stok.kdvOrani;
        }
      }

      return { ...prev, kalemler: newKalemler };
    });
  };

  const calculateTotal = () => {
    let toplamTutar = 0;
    let kdvTutar = 0;

    formData.kalemler.forEach(kalem => {
      const miktar = kalem.miktar || 0;
      const birimFiyat = kalem.birimFiyat || 0;
      const rawTutar = miktar * birimFiyat;
      const iskontoOrani = kalem.iskontoOrani || 0;
      const iskontoTutari = kalem.iskontoTutari ?? (rawTutar * iskontoOrani) / 100;
      const tutar = rawTutar - iskontoTutari;
      const kalemKdv = (tutar * (kalem.kdvOrani || 0)) / 100;
      toplamTutar += tutar;
      kdvTutar += kalemKdv;
    });

    toplamTutar -= formData.iskonto || 0;
    const genelToplam = toplamTutar + kdvTutar;

    return { toplamTutar, kdvTutar, genelToplam };
  };

  const handleSave = async () => {
    try {
      if (!formData.cariId) {
        showSnackbar('Cari seçimi zorunludur', 'error');
        return;
      }

      if (formData.kalemler.length === 0) {
        showSnackbar('En az bir kalem eklemelisiniz', 'error');
        return;
      }

      if (selectedFatura) {
        await axios.put(`/fatura/${selectedFatura.id}`, formData);
        showSnackbar('Fatura başarıyla güncellendi', 'success');
        setOpenEdit(false);
      } else {
        await axios.post('/fatura', formData);
        showSnackbar('Fatura başarıyla oluşturuldu', 'success');
        setOpenAdd(false);
      }

      fetchFaturalar();
      resetForm();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedFatura) {
        await axios.delete(`/fatura/${selectedFatura.id}`);
        showSnackbar('Fatura başarıyla silindi', 'success');
        setOpenDelete(false);
        fetchFaturalar();
      }
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme işlemi başarısız', 'error');
    }
  };

  const openAddDialog = () => {
    resetForm();
    // Otomatik fatura numarası oluştur
    const lastFatura = faturalar[0];
    const lastNo = lastFatura ? parseInt(lastFatura.faturaNo.split('-')[2]) : 0;
    const newNo = (lastNo + 1).toString().padStart(3, '0');
    setFormData(prev => ({
      ...prev,
      faturaNo: `SF-${new Date().getFullYear()}-${newNo}`,
    }));
    setOpenAdd(true);
  };

  const openEditDialog = async (fatura: Fatura) => {
    try {
      const response = await axios.get(`/fatura/${fatura.id}`);
      const fullFatura = response.data;

      setFormData({
        faturaNo: fullFatura.faturaNo,
        faturaTipi: fullFatura.faturaTipi,
        cariId: fullFatura.cariId,
        tarih: new Date(fullFatura.tarih).toISOString().split('T')[0],
        vade: fullFatura.vade ? new Date(fullFatura.vade).toISOString().split('T')[0] : '',
        iskonto: fullFatura.iskonto || 0,
        aciklama: fullFatura.aciklama || '',
        kalemler: fullFatura.kalemler.map((k: any) => ({
          stokId: k.stokId,
          miktar: k.miktar,
          birimFiyat: k.birimFiyat,
          kdvOrani: k.kdvOrani,
          iskontoOrani: k.iskontoOrani ?? 0,
          iskontoTutari: k.iskontoTutari ?? 0,
        })),
      });

      setSelectedFatura(fatura);
      setOpenEdit(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Fatura yüklenirken hata oluştu', 'error');
    }
  };

  const openViewDialog = async (fatura: Fatura) => {
    try {
      const response = await axios.get(`/fatura/${fatura.id}`);
      setSelectedFatura(response.data);
      setOpenView(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Fatura yüklenirken hata oluştu', 'error');
    }
  };

  const openDeleteDialog = (fatura: Fatura) => {
    setSelectedFatura(fatura);
    setOpenDelete(true);
  };

  const openIptalDialog = (fatura: Fatura) => {
    setSelectedFatura(fatura);
    setOpenIptal(true);
  };

  const handleIptal = async () => {
    try {
      if (selectedFatura) {
        await axios.put(`/fatura/${selectedFatura.id}/iptal`, {
          irsaliyeIptal: irsaliyeIptal,
        });
        const mesaj = irsaliyeIptal
          ? 'Fatura ve bağlı irsaliye başarıyla iptal edildi. Stoklar ve cari bakiye güncellendi.'
          : 'Fatura başarıyla iptal edildi. Stoklar ve cari bakiye güncellendi.';
        showSnackbar(mesaj, 'success');
        setOpenIptal(false);
        setIrsaliyeIptal(false);
        fetchFaturalar();
      }
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İptal işlemi başarısız', 'error');
    }
  };

  const handleDurumChangeRequest = (faturaId: string, eskiDurum: string, yeniDurum: string) => {
    // Eğer aynı duruma geçilmeye çalışılıyorsa, işlem yapma
    if (eskiDurum === yeniDurum) {
      return;
    }

    // Faturayı bul
    const fatura = faturalar.find(f => f.id === faturaId);
    if (!fatura) {
      return;
    }

    // Select değerini anında güncelle (UI için)
    setFaturaDurumlari(prev => ({ ...prev, [faturaId]: yeniDurum }));

    // Onay dialogunu aç
    setSelectedFatura(fatura);
    setPendingDurum({ faturaId, eskiDurum, yeniDurum });
    setOpenDurumOnay(true);
  };

  const handleDurumChangeConfirm = async () => {
    if (!pendingDurum) {
      return;
    }

    try {
      await axios.put(`/fatura/${pendingDurum.faturaId}/durum`, { durum: pendingDurum.yeniDurum });

      let mesaj = 'Fatura durumu güncellendi';
      if (pendingDurum.yeniDurum === 'ONAYLANDI') {
        mesaj = 'Fatura onaylandı. Stoklar eklendi ve cari bakiye güncellendi.';
      } else if (pendingDurum.yeniDurum === 'IPTAL') {
        mesaj = 'Fatura iptal edildi. Stoklar geri çıkarıldı ve cari bakiye düzeltildi.';
      } else if (pendingDurum.yeniDurum === 'ACIK') {
        mesaj = 'Fatura beklemeye alındı. Stok ve cari işlemleri geri alındı.';
      }

      showSnackbar(mesaj, 'success');
      setOpenDurumOnay(false);
      setPendingDurum(null);
      fetchFaturalar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Durum değiştirme başarısız', 'error');
      setOpenDurumOnay(false);
      setPendingDurum(null);
      fetchFaturalar(); // Hata durumunda da listeyi yenile (eski duruma dön)
    }
  };

  const handleDurumChangeCancel = () => {
    if (pendingDurum) {
      // Select değerini eski duruma geri döndür
      setFaturaDurumlari(prev => ({ ...prev, [pendingDurum.faturaId]: pendingDurum.eskiDurum }));
    }
    setOpenDurumOnay(false);
    setPendingDurum(null);
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
      currency: 'TRY'
    }).format(amount);
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'KAPALI':
        return 'success'; // Yeşil - Tamamen ödendi
      case 'ONAYLANDI':
        return 'info'; // Mavi - Onaylandı
      case 'ACIK':
        return 'warning'; // Turuncu - Beklemede
      case 'KISMEN_ODENDI':
        return 'primary'; // Mavi - Kısmen ödendi
      case 'IPTAL':
        return 'error'; // Kırmızı - İptal
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'KAPALI':
        return 'Ödendi';
      case 'ONAYLANDI':
        return 'Onaylandı';
      case 'ACIK':
        return 'Beklemede';
      case 'KISMEN_ODENDI':
        return 'Kısmen Ödendi';
      case 'IPTAL':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const handleEdit = (row: Fatura) => {
    openEditDialog(row);
  };

  const handleView = (row: Fatura) => {
    openViewDialog(row);
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'faturaNo',
      headerName: 'Fatura No',
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
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString('tr-TR') : '',
      renderCell: (params) => (
        <Box sx={{ alignSelf: 'flex-end' }}>{params.value ? new Date(params.value).toLocaleDateString('tr-TR') : ''}</Box>
      ),
    },
    {
      field: 'cari',
      headerName: 'Cari',
      flex: 1.5,
      minWidth: 200,
      valueGetter: (params: any) => params?.unvan || '',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.cari?.vergiNo || params.row.cari?.tcKimlikNo || ''}</Typography>
        </Box>
      ),
    },
    {
      field: 'vade',
      headerName: 'Vade',
      width: 120,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString('tr-TR') : '-',
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
        <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(params.value ?? 0)}
        </Typography>
      ),
    },
    {
      field: 'durum',
      headerName: 'Durum',
      width: 140,
      renderCell: (params) => <StatusBadge status={params.value} />,
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
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); window.open(`/fatura/alis/print/${params.row.id}`, '_blank'); }}>
            <Print fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip key="view" title="Detay">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleView(params.row); }}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip key="more" title="Diğer İşlemler">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e as any, params.row.id); }}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>,
      ],
    },
  ], []);

  const renderFormDialog = () => {
    const { toplamTutar, kdvTutar, genelToplam } = calculateTotal();

    return (
      <Dialog
        open={openAdd || openEdit}
        onClose={() => { setOpenAdd(false); setOpenEdit(false); }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>
          {openAdd ? 'Yeni Satın Alma Faturası' : 'Satın Alma Faturası Düzenle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Fatura No"
                value={formData.faturaNo}
                onChange={(e) => setFormData(prev => ({ ...prev, faturaNo: e.target.value }))}
                required
              />
              <TextField
                sx={{ flex: 1 }}
                type="date"
                label="Tarih"
                value={formData.tarih}
                onChange={(e) => setFormData(prev => ({ ...prev, tarih: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                sx={{ flex: 1 }}
                type="date"
                label="Vade"
                value={formData.vade}
                onChange={(e) => setFormData(prev => ({ ...prev, vade: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Cari</InputLabel>
                <Select
                  value={formData.cariId}
                  onChange={(e) => setFormData(prev => ({ ...prev, cariId: e.target.value }))}
                  label="Cari"
                >
                  {cariler.map((cari) => (
                    <MenuItem key={cari.id} value={cari.id}>
                      {cari.cariKodu} - {cari.unvan}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Kalemler */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Fatura Kalemleri</Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddKalem}
                  sx={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  }}
                >
                  Kalem Ekle
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="30%">Stok</TableCell>
                      <TableCell width="10%">Miktar</TableCell>
                      <TableCell width="12%">Birim Fiyat</TableCell>
                      <TableCell width="10%">İsk (%)</TableCell>
                      <TableCell width="12%">İsk (₺)</TableCell>
                      <TableCell width="10%">KDV %</TableCell>
                      <TableCell width="11%" align="right">Satır Toplamı</TableCell>
                      <TableCell width="5%">İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.kalemler.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Kalem eklenmedi
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.kalemler.map((kalem, index) => {
                        const rawTutar = (kalem.miktar || 0) * (kalem.birimFiyat || 0);
                        const lineIskonto = kalem.iskontoTutari || (rawTutar * (kalem.iskontoOrani || 0)) / 100;
                        const lineNet = rawTutar - lineIskonto;
                        const lineKdv = (lineNet * (kalem.kdvOrani || 0)) / 100;
                        const lineTotal = lineNet + lineKdv;

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <FormControl fullWidth size="small">
                                <Select
                                  value={kalem.stokId}
                                  onChange={(e) => handleKalemChange(index, 'stokId', e.target.value)}
                                >
                                  {stoklar.map((stok) => (
                                    <MenuItem key={stok.id} value={stok.id}>
                                      {stok.stokKodu} - {stok.stokAdi}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.miktar}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  handleKalemChange(index, 'miktar', isNaN(value) ? 1 : value);
                                }}
                                inputProps={{ min: 1 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.birimFiyat}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  handleKalemChange(index, 'birimFiyat', isNaN(value) ? 0 : value);
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.iskontoOrani}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  handleKalemChange(index, 'iskontoOrani', isNaN(value) ? 0 : value);
                                }}
                                inputProps={{ min: 0, max: 100, step: 0.1 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.iskontoTutari}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  handleKalemChange(index, 'iskontoTutari', isNaN(value) ? 0 : value);
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.kdvOrani}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10);
                                  handleKalemChange(index, 'kdvOrani', isNaN(value) ? 0 : value);
                                }}
                                inputProps={{ min: 0, max: 100 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(lineTotal)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveKalem(index)}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                type="number"
                label="İskonto"
                value={formData.iskonto}
                onChange={(e) => setFormData(prev => ({ ...prev, iskonto: parseFloat(e.target.value) || 0 }))}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                sx={{ flex: 1 }}
                multiline
                rows={1}
                label="Açıklama"
                value={formData.aciklama}
                onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
              />
            </Box>

            {/* Toplam */}
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'var(--muted)' }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Ara Toplam:</Typography>
                  <Typography variant="h6" fontWeight="bold">{formatCurrency(toplamTutar)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">KDV Toplamı:</Typography>
                  <Typography variant="h6" fontWeight="bold">{formatCurrency(kdvTutar)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Genel Toplam:</Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      color: '#f59e0b',
                    }}
                  >
                    {formatCurrency(genelToplam)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAdd(false); setOpenEdit(false); }}>
            İptal
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            }}
          >
            {openAdd ? 'Oluştur' : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ letterSpacing: '-0.5px' }}>
              Satın Alma Faturaları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tedarikçilerden aldığınız tüm faturaları buradan yönetebilirsiniz.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleExportExcel}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Excel İndir
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                addTab({ id: 'fatura-alis-yeni', label: 'Yeni Satın Alma Faturası', path: '/fatura/alis/yeni' });
                setActiveTab('fatura-alis-yeni');
                router.push('/fatura/alis/yeni');
              }}
              sx={{
                bgcolor: 'var(--primary)',
                '&:hover': { bgcolor: 'var(--primary-hover)' },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Yeni Fatura
            </Button>
          </Box>
        </Box>

        <KPIHeader loading={loading} data={stats} type="ALIS" />

        <InvoiceDataGrid
          rows={faturalar}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 220, mt: 1 },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {(() => {
          const fatura = faturalar.find(f => f.id === menuFaturaId);
          if (!fatura) return null;

          return [
            <MenuItem key="detail" onClick={() => { handleMenuClose(); handleView(fatura); }}>
              <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Detayları Görüntüle</Typography>
            </MenuItem>,
            <MenuItem key="edit" onClick={() => { handleMenuClose(); handleEdit(fatura); }}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Düzenle</Typography>
            </MenuItem>,
            <MenuItem key="print" onClick={() => { handleMenuClose(); window.open(`/fatura/alis/print/${fatura.id}`, '_blank'); }}>
              <ListItemIcon><Print fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Yazdır</Typography>
            </MenuItem>,
            <Divider key="d1" />,
            <MenuItem
              key="return"
              onClick={() => {
                const path = `/fatura/iade/alis/yeni?originalId=${fatura.id}`;
                addTab({ id: 'fatura-iade-alis-yeni', label: 'Yeni Satın Alma İade Faturası', path });
                setActiveTab('fatura-iade-alis-yeni');
                router.push(path);
                handleMenuClose();
              }}
            >
              <ListItemIcon><Undo fontSize="small" /></ListItemIcon>
              <Typography variant="body2">İade Oluştur</Typography>
            </MenuItem>,
            fatura.durum === 'ACIK' && (
              <MenuItem
                key="approve"
                onClick={() => {
                  handleDurumChangeRequest(fatura.id, fatura.durum, 'ONAYLANDI');
                  handleMenuClose();
                }}
              >
                <ListItemIcon />
                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>Onayla</Typography>
              </MenuItem>
            ),
            fatura.durum !== 'ACIK' && fatura.durum !== 'IPTAL' && (
              <MenuItem
                key="pending"
                onClick={() => {
                  handleDurumChangeRequest(fatura.id, fatura.durum, 'ACIK');
                  handleMenuClose();
                }}
              >
                <ListItemIcon />
                <Typography variant="body2">Beklemeye Al</Typography>
              </MenuItem>
            ),
            <MenuItem
              key="cancel"
              onClick={() => { handleMenuClose(); openIptalDialog(fatura); }}
              disabled={fatura.durum === 'IPTAL'}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><Cancel fontSize="small" color="error" /></ListItemIcon>
              <Typography variant="body2">İptal Et</Typography>
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => { handleMenuClose(); openDeleteDialog(fatura); }}
              disabled={fatura.durum === 'ONAYLANDI' || fatura.durum === 'IPTAL'}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
              <Typography variant="body2">Sil</Typography>
            </MenuItem>,
          ];
        })()}
      </Menu>

      {/* Form Dialog */}
      {renderFormDialog()}

      {/* View Dialog */}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }} component="div">
          Fatura Detayı
        </DialogTitle>
        <DialogContent>
          {selectedFatura && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">Fatura No:</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedFatura.faturaNo}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">Tarih:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDate(selectedFatura.tarih)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Cari:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedFatura.cari.unvan}
                </Typography>
              </Box>

              {selectedFatura.kalemler && selectedFatura.kalemler.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Kalemler:</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Stok</TableCell>
                          <TableCell>Miktar</TableCell>
                          <TableCell>Birim Fiyat</TableCell>
                          <TableCell>İndirim (%)</TableCell>
                          <TableCell>İndirim (₺)</TableCell>
                          <TableCell>KDV %</TableCell>
                          <TableCell align="right">Tutar</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedFatura.kalemler.map((kalem, index) => {
                          const araToplam = kalem.miktar * kalem.birimFiyat;
                          const iskontoTutar = kalem.iskontoTutari || (araToplam * (kalem.iskontoOrani || 0)) / 100;
                          const netTutar = araToplam - iskontoTutar;
                          const kdvTutar = (netTutar * kalem.kdvOrani) / 100;
                          const satirToplami = netTutar + kdvTutar;

                          return (
                            <TableRow key={index} hover>
                              <TableCell>{kalem.stok?.stokAdi || '-'}</TableCell>
                              <TableCell>{kalem.miktar}</TableCell>
                              <TableCell>{formatCurrency(kalem.birimFiyat)}</TableCell>
                              <TableCell>%{kalem.iskontoOrani || 0}</TableCell>
                              <TableCell>{formatCurrency(kalem.iskontoTutari || 0)}</TableCell>
                              <TableCell>%{kalem.kdvOrani}</TableCell>
                              <TableCell align="right">
                                {formatCurrency(satirToplami)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'var(--card)', borderRadius: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="body2" color="text.secondary">Ara Toplam:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(Number(selectedFatura.toplamTutar || 0) + Number(selectedFatura.iskonto || 0))}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="body2" color="text.secondary">İskonto:</Typography>
                    <Typography variant="body2" fontWeight={500} color="error.main">
                      -{formatCurrency(selectedFatura.iskonto || 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="body2" color="text.secondary">KDV Toplamı:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(selectedFatura.kdvTutar || 0)}
                    </Typography>
                  </Box>
                  <Divider sx={{ width: '250px', my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="h6" fontWeight="bold">Genel Toplam:</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#f59e0b' }}>
                      {formatCurrency(selectedFatura.genelToplam)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Audit Bilgileri */}
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'color-mix(in srgb, var(--chart-1) 10%, transparent)' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#0369a1' }}>
                  📋 Denetim Bilgileri
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Oluşturan:
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {selectedFatura.createdByUser?.fullName || 'Sistem'}
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                          ({selectedFatura.createdByUser?.username || '-'})
                        </Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Oluşturma Tarihi:
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {selectedFatura.createdAt
                          ? new Date(selectedFatura.createdAt).toLocaleString('tr-TR')
                          : '-'}
                      </Typography>
                    </Box>
                  </Box>

                  {selectedFatura.updatedByUser && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Son Güncelleyen:
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {selectedFatura.updatedByUser.fullName}
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({selectedFatura.updatedByUser.username})
                          </Typography>
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Son Güncelleme:
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {selectedFatura.updatedAt
                            ? new Date(selectedFatura.updatedAt).toLocaleString('tr-TR')
                            : '-'}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {selectedFatura.logs && selectedFatura.logs.length > 0 && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Son İşlemler:
                      </Typography>
                      {selectedFatura.logs.slice(0, 3).map((log: any, index: number) => (
                        <Typography key={index} variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                          • {new Date(log.createdAt).toLocaleString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {log.actionType}
                          {log.user && ` (${log.user.fullName})`}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }} component="div">Fatura Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedFatura?.faturaNo}</strong> nolu faturayı silmek istediğinizden emin misiniz?
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

      {/* Durum Değişikliği Onay Dialog */}
      <Dialog open={openDurumOnay} onClose={handleDurumChangeCancel} maxWidth="sm" fullWidth>
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
        }}>
          Durum Değişikliği Onayı
          <IconButton size="small" onClick={handleDurumChangeCancel} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {pendingDurum && selectedFatura && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Bu işlem stok ve cari hareketlerini etkileyecektir!
                </Typography>
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>{selectedFatura.faturaNo}</strong> nolu fatura durumunu değiştirmek istiyorsunuz.
              </Typography>
              <Box sx={{
                p: 2,
                bgcolor: 'var(--muted)',
                borderRadius: 1,
                mb: 2,
                border: '1px solid var(--border)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">Mevcut Durum:</Typography>
                    <Chip
                      label={getStatusLabel(pendingDurum.eskiDurum)}
                      color={getStatusColor(pendingDurum.eskiDurum)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Typography variant="h6" color="text.secondary">→</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">Yeni Durum:</Typography>
                    <Chip
                      label={getStatusLabel(pendingDurum.yeniDurum)}
                      color={getStatusColor(pendingDurum.yeniDurum)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </Box>
              {pendingDurum.yeniDurum === 'ONAYLANDI' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    • Stok hareketi oluşturulacak (giriş)<br />
                    • Cari bakiye artacak
                  </Typography>
                </Alert>
              )}
              {pendingDurum.yeniDurum === 'IPTAL' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    • Stok hareketi oluşturulacak (çıkış - iptal)<br />
                    • Cari bakiye azalacak
                  </Typography>
                </Alert>
              )}
              {pendingDurum.yeniDurum === 'ACIK' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    • Önceki stok ve cari hareketleri geri alınacak<br />
                    • Fatura tekrar beklemede durumuna dönecek
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDurumChangeCancel}>İptal</Button>
          <Button
            onClick={handleDurumChangeConfirm}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              }
            }}
          >
            Onayla ve Değiştir
          </Button>
        </DialogActions>
      </Dialog>

      {/* İptal Dialog */}
      <Dialog open={openIptal} onClose={() => { setOpenIptal(false); setIrsaliyeIptal(false); }} maxWidth="sm" fullWidth>
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
        }}>
          Fatura İptal
          <IconButton size="small" onClick={() => { setOpenIptal(false); setIrsaliyeIptal(false); }} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedFatura && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Bu işlem geri alınamaz! Stoklar ve cari hareketleri etkilenecektir.
                </Typography>
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>{selectedFatura.faturaNo}</strong> nolu faturayı iptal etmek istediğinizden emin misiniz?
              </Typography>
              {selectedFatura.satinAlmaIrsaliyesi && (
                <Box sx={{
                  p: 2,
                  bgcolor: 'var(--muted)',
                  borderRadius: 1,
                  mb: 2,
                  border: '1px solid var(--border)'
                }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Bu faturaya bağlı bir irsaliye bulunmaktadır:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    İrsaliye No: <strong>{selectedFatura.satinAlmaIrsaliyesi.irsaliyeNo}</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="checkbox"
                      id="irsaliyeIptal"
                      checked={irsaliyeIptal}
                      onChange={(e) => setIrsaliyeIptal(e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <Typography
                      variant="body2"
                      component="label"
                      htmlFor="irsaliyeIptal"
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      Bağlı olduğu irsaliye de iptal edilsin mi?
                    </Typography>
                  </Box>
                  {irsaliyeIptal && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        İrsaliye iptal edildiğinde, irsaliye kalemleri stoğa geri çıkarılacaktır.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setOpenIptal(false); setIrsaliyeIptal(false); }}>Vazgeç</Button>
          <Button
            onClick={handleIptal}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              }
            }}
          >
            İptal Et
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout >
  );
}
