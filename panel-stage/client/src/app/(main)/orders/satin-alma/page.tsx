'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  ListItemIcon,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  LocalShipping,
  MoreVert,
  Print as PrintIcon,
  Receipt,
  Send,
  Visibility,
  ShoppingCart,
  HourglassEmpty,
  Event,
} from '@mui/icons-material';
import { GridColDef, GridPaginationModel, GridSortModel, GridFilterModel } from '@mui/x-data-grid';
import MainLayout from '@/components/Layout/MainLayout';
import InvoiceDataGrid from '@/components/Fatura/InvoiceDataGrid';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useTabStore } from '@/stores/tabStore';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
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
  cari: Cari;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  durum: 'BEKLEMEDE' | 'SIPARIS_VERILDI' | 'SEVK_EDILDI' | 'KISMI_SEVK' | 'FATURALANDI' | 'IPTAL';
  iskonto?: number;
  aciklama?: string;
  faturaNo?: string | null;
  kaynakIrsaliyeleri?: SatinAlmaIrsaliyesi[];
  kalemler?: SiparisKalemi[];
}

const durumRenkleri: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  BEKLEMEDE: 'default',
  SIPARIS_VERILDI: 'warning',
  SEVK_EDILDI: 'success',
  KISMI_SEVK: 'warning',
  FATURALANDI: 'success',
  IPTAL: 'error',
};

const durumMetinleri: Record<string, string> = {
  BEKLEMEDE: 'Beklemede',
  SIPARIS_VERILDI: 'Sipariş Verildi',
  SEVK_EDILDI: 'Sevk Edildi',
  KISMI_SEVK: 'Kısmi Sevk',
  FATURALANDI: 'Faturalandı',
  IPTAL: 'İptal',
};

interface SiparisStats {
  total: number;
  bekleyen: number;
  buAy: number;
}

export default function SatinAlmaSiparisleriPage() {
  const { addTab, setActiveTab } = useTabStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [siparisler, setSiparisler] = useState<SatinAlmaSiparisi[]>([]);
  const [loading, setLoading] = useState(false);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' },
  ]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [rowCount, setRowCount] = useState(0);
  const [stats, setStats] = useState<SiparisStats | null>(null);
  const [filterDurum, setFilterDurum] = useState<string>('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSiparis, setSelectedSiparis] = useState<SatinAlmaSiparisi | null>(null);
  const [openSevkDialog, setOpenSevkDialog] = useState(false);
  const [sevkKalemler, setSevkKalemler] = useState<Array<{ kalemId: string; sevkMiktar: number }>>([]);
  const [fullSiparis, setFullSiparis] = useState<SatinAlmaSiparisi | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchSiparisler();
  }, [paginationModel, sortModel, filterModel, searchTerm, filterDurum]);

  const fetchSiparisler = async () => {
    try {
      setLoading(true);
      const page = paginationModel.page + 1;
      const limit = paginationModel.pageSize;
      const params: Record<string, string | number> = {
        page,
        limit,
        search: searchTerm || undefined,
      };
      if (filterDurum) params.durum = filterDurum;

      const response = await axios.get('/purchase-order', { params });
      const data = response.data?.data || [];
      const total = response.data?.meta?.total ?? data.length;
      setSiparisler(data);
      setRowCount(total);
      setStats({
        total,
        bekleyen: 0,
        buAy: 0,
      });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Siparişler yüklenirken hata oluştu', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = () => {
    addTab({ id: 'yeni-satin-alma-siparis', label: 'Yeni Satın Alma Siparişi', path: '/order/satin-alma/yeni' });
    setActiveTab('yeni-satin-alma-siparis');
    router.push('/order/satin-alma/yeni');
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
    router.push(`/siparis/satin-alma/detay/${row.id}`);
  };

  const handleEdit = (row: SatinAlmaSiparisi) => {
    const tabId = `siparis-satin-alma-duzenle-${row.id}`;
    addTab({ id: tabId, label: `Düzenle: ${row.siparisNo}`, path: `/siparis/satin-alma/duzenle/${row.id}` });
    setActiveTab(tabId);
    router.push(`/siparis/satin-alma/duzenle/${row.id}`);
  };

  const handlePrint = (row: SatinAlmaSiparisi) => {
    window.open(`/siparis/satin-alma/print/${row.id}`, '_blank');
  };

  const handleDurumChange = async (yeniDurum: string) => {
    if (!selectedSiparis) return;
    try {
      await axios.put(`/satin-alma-siparisi/${selectedSiparis.id}/durum`, { durum: yeniDurum });
      showSnackbar(`Sipariş durumu "${durumMetinleri[yeniDurum]}" olarak güncellendi`, 'success');
      fetchSiparisler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Durum değiştirilirken hata oluştu', 'error');
    }
    handleMenuClose();
  };

  const handleSevkClick = async (siparis: SatinAlmaSiparisi) => {
    try {
      setLoading(true);
      const response = await axios.get(`/satin-alma-siparisi/${siparis.id}`);
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
      await axios.post(`/satin-alma-siparisi/${fullSiparis.id}/sevk-et`, {
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
      const response = await axios.post(`/satin-alma-siparisi/${siparis.id}/create-irsaliye`);
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

  const handleDelete = async () => {
    if (!selectedSiparis) return;
    try {
      await axios.delete(`/satin-alma-siparisi/${selectedSiparis.id}`);
      showSnackbar('Sipariş başarıyla silindi', 'success');
      setOpenDelete(false);
      setSelectedSiparis(null);
      fetchSiparisler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş silinirken hata oluştu', 'error');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

  const formatDate = (dateString: string) =>
    dateString ? new Date(dateString).toLocaleDateString('tr-TR') : '-';

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
      field: 'cari',
      headerName: 'Tedarikçi',
      flex: 1.5,
      minWidth: 200,
      valueGetter: (params: any) => params?.unvan || '',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.cari?.cariKodu || ''}</Typography>
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
        <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
          {formatCurrency(params.value ?? 0)}
        </Typography>
      ),
    },
    {
      field: 'durum',
      headerName: 'Durum',
      width: 140,
      renderCell: (params) => (
        <Box
          component="span"
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: params.value === 'FATURALANDI' || params.value === 'SEVK_EDILDI' ? 'success.light' :
              params.value === 'IPTAL' ? 'error.light' :
                params.value === 'BEKLEMEDE' ? 'grey.200' : 'warning.light',
            color: params.value === 'IPTAL' ? 'error.dark' : 'text.primary',
          }}
        >
          {durumMetinleri[params.value] || params.value}
        </Box>
      ),
    },
    {
      field: 'irsaliyeFatura',
      headerName: 'İrsaliye / Fatura',
      width: 140,
      renderCell: (params) => {
        const row = params.row as SatinAlmaSiparisi;
        if (row.kaynakIrsaliyeleri?.length) {
          return (
            <Typography variant="caption" color="info.main">İrsaliyeli</Typography>
          );
        }
        if (row.faturaNo) {
          return <Typography variant="caption">{row.faturaNo}</Typography>;
        }
        return <Typography variant="caption" color="text.secondary">-</Typography>;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 180,
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
              disabled={row.durum === 'FATURALANDI' || row.durum === 'IPTAL'}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>,
          <Tooltip key="print" title="Yazdır">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePrint(row); }}>
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>,
          (row.durum !== 'FATURALANDI' && row.durum !== 'IPTAL') && (
            <Tooltip key="sevk" title="Sevk Et">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleSevkClick(row); }}>
                <Send fontSize="small" />
              </IconButton>
            </Tooltip>
          ),
          (row.durum === 'SEVK_EDILDI' || row.durum === 'KISMI_SEVK') && (
            <Tooltip key="irsaliye" title="İrsaliye Oluştur">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCreateIrsaliye(row); }}>
                <LocalShipping fontSize="small" />
              </IconButton>
            </Tooltip>
          ),
          <Tooltip key="more" title="Diğer İşlemler">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e as any, row.id); }}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Tooltip>,
        ].filter(Boolean) as React.ReactElement[];
      },
    },
  ], []);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ letterSpacing: '-0.5px' }}>
              Satın Alma Siparişleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tedarikçilere verdiğiniz siparişleri buradan yönetebilirsiniz.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              sx={{ textTransform: 'none', fontWeight: 600 }}
              disabled
            >
              Excel İndir
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              sx={{
                bgcolor: 'var(--primary)',
                '&:hover': { bgcolor: 'var(--primary-hover)' },
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              }}
            >
              Yeni Sipariş
            </Button>
          </Box>
        </Box>

        {/* KPI Cards - fatura/alis ile aynı görünüm */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { title: 'Toplam Sipariş', value: stats?.total ?? 0, icon: <ShoppingCart />, color: '#06b6d4', bgColor: 'color-mix(in srgb, #06b6d4 15%, transparent)' },
            { title: 'Bekleyen', value: stats?.bekleyen ?? 0, icon: <HourglassEmpty />, color: '#3b82f6', bgColor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)' },
            { title: 'Bu Ay', value: stats?.buAy ?? 0, icon: <Event />, color: '#10b981', bgColor: 'color-mix(in srgb, var(--chart-3) 15%, transparent)' },
          ].map((card, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
                }}
              >
                <CardContent sx={{ p: '20px !important' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
                        {card.title}
                      </Typography>
                      {loading ? (
                        <Skeleton width={120} height={40} />
                      ) : (
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', letterSpacing: '-0.5px' }}>
                          {card.value ?? 0}
                        </Typography>
                      )}
                      {loading ? (
                        <Skeleton width={80} height={20} />
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {card.title === 'Toplam Sipariş' ? `${stats?.total ?? 0} sipariş` : `${card.value ?? 0} sipariş`}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ background: card.bgColor, color: card.color, borderRadius: 2, p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Durum filtreleri - fatura sayfasındaki gibi */}
        <Paper sx={{ p: 2, mb: 2, border: '1px solid var(--border)', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" variant={filterDurum === '' ? 'contained' : 'outlined'} onClick={() => setFilterDurum('')} sx={{ textTransform: 'none' }}>Tümü</Button>
            {(Object.keys(durumMetinleri) as Array<keyof typeof durumMetinleri>).map((d) => (
              <Button key={d} size="small" variant={filterDurum === d ? 'contained' : 'outlined'} onClick={() => setFilterDurum(d)} sx={{ textTransform: 'none' }}>
                {durumMetinleri[d]}
              </Button>
            ))}
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Sipariş No, cari unvan veya cari kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mt: 2 }}
          />
        </Paper>

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
            <MenuItem onClick={() => { handleMenuClose(); handleEdit(selectedSiparis); }} disabled={selectedSiparis.durum === 'FATURALANDI' || selectedSiparis.durum === 'IPTAL'}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Düzenle</Typography>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); handlePrint(selectedSiparis); }}>
              <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Yazdır</Typography>
            </MenuItem>
            <Divider />
            {selectedSiparis.durum === 'BEKLEMEDE' && (
              <MenuItem onClick={() => handleDurumChange('SIPARIS_VERILDI')}>
                <ListItemIcon /><Typography variant="body2">Sipariş Verildi Olarak İşaretle</Typography>
              </MenuItem>
            )}
            {(selectedSiparis.durum === 'SIPARIS_VERILDI' || selectedSiparis.durum === 'SEVK_EDILDI' || selectedSiparis.durum === 'KISMI_SEVK') && (
              <MenuItem onClick={() => { handleMenuClose(); router.push(`/fatura/alis/yeni?siparisId=${selectedSiparis.id}`); }}>
                <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
                <Typography variant="body2">Faturalandır</Typography>
              </MenuItem>
            )}
            {(selectedSiparis.durum === 'SEVK_EDILDI' || selectedSiparis.durum === 'KISMI_SEVK') && (
              <MenuItem onClick={() => { handleMenuClose(); handleCreateIrsaliye(selectedSiparis); }}>
                <ListItemIcon><LocalShipping fontSize="small" /></ListItemIcon>
                <Typography variant="body2">İrsaliye Oluştur</Typography>
              </MenuItem>
            )}
            {selectedSiparis.durum !== 'FATURALANDI' && selectedSiparis.durum !== 'IPTAL' && (
              <MenuItem onClick={() => handleDurumChange('IPTAL')} sx={{ color: 'error.main' }}>
                <ListItemIcon /><Typography variant="body2">İptal Et</Typography>
              </MenuItem>
            )}
            <MenuItem onClick={() => { handleMenuClose(); openDeleteDialog(selectedSiparis); }} disabled={selectedSiparis.durum === 'FATURALANDI'} sx={{ color: 'error.main' }}>
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
          <Button onClick={handleSevkSubmit} variant="contained" disabled={loading} sx={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}>
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

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
