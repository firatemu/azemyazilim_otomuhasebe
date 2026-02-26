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
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Divider,
  ListItemIcon,
} from '@mui/material';
import { Add, Assessment, Delete, Edit, Visibility, Print as PrintIcon, MoreVert, Inventory, LocalShipping, Receipt, Send } from '@mui/icons-material';
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
  stok?: { id: string; stokKodu: string; stokAdi: string };
}

interface SatisIrsaliyesi {
  id: string;
  irsaliyeNo: string;
  durum: string;
}

interface Siparis {
  id: string;
  siparisNo: string;
  siparisTipi: 'SATIS' | 'SATIN_ALMA';
  tarih: string;
  vade: string | null;
  cari: Cari;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  durum: 'BEKLEMEDE' | 'HAZIRLANIYOR' | 'HAZIRLANDI' | 'SEVK_EDILDI' | 'KISMI_SEVK' | 'FATURALANDI' | 'IPTAL';
  iskonto?: number;
  aciklama?: string;
  faturaNo?: string | null;
  deliveryNoteId?: string | null;
  kaynakIrsaliyeleri?: SatisIrsaliyesi[];
  kalemler?: SiparisKalemi[];
}

const durumRenkleri: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  BEKLEMEDE: 'default',
  HAZIRLANIYOR: 'warning',
  HAZIRLANDI: 'info',
  SEVK_EDILDI: 'success',
  KISMI_SEVK: 'warning',
  FATURALANDI: 'success',
  IPTAL: 'error',
};

const durumMetinleri: Record<string, string> = {
  BEKLEMEDE: 'Beklemede',
  HAZIRLANIYOR: 'Hazırlanıyor',
  HAZIRLANDI: 'Hazırlandı',
  SEVK_EDILDI: 'Sevk Edildi',
  KISMI_SEVK: 'Kısmi Sevk',
  FATURALANDI: 'Faturalandı',
  IPTAL: 'İptal',
};

interface SiparisStats {
  total: number;
  bekleyen: number;
  faturalandi: number;
  iptal: number;
}

export default function SatisSiparisleriPage() {
  const router = useRouter();
  const { addTab, setActiveTab } = useTabStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SiparisStats | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [rowCount, setRowCount] = useState(0);
  const [filterDurum, setFilterDurum] = useState<string>('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSiparis, setSelectedSiparis] = useState<Siparis | null>(null);
  const [openView, setOpenView] = useState(false);
  const [openSevkDialog, setOpenSevkDialog] = useState(false);
  const [sevkKalemler, setSevkKalemler] = useState<Array<{ kalemId: string; sevkMiktar: number }>>([]);
  const [fullSiparis, setFullSiparis] = useState<Siparis | null>(null);

  useEffect(() => {
    fetchSiparisler();
  }, [paginationModel, sortModel, filterModel, filterDurum]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [allRes, faturalandiRes, iptalRes] = await Promise.all([
        axios.get('/siparis', { params: { siparisTipi: 'SATIS', limit: 1 } }),
        axios.get('/siparis', { params: { siparisTipi: 'SATIS', limit: 1, durum: 'FATURALANDI' } }).catch(() => ({ data: { meta: { total: 0 } } })),
        axios.get('/siparis', { params: { siparisTipi: 'SATIS', limit: 1, durum: 'IPTAL' } }).catch(() => ({ data: { meta: { total: 0 } } })),
      ]);
      const total = allRes.data?.meta?.total ?? 0;
      const faturalandi = faturalandiRes.data?.meta?.total ?? 0;
      const iptal = iptalRes.data?.meta?.total ?? 0;
      const bekleyen = Math.max(0, total - faturalandi - iptal);
      setStats({ total, bekleyen, faturalandi, iptal });
    } catch {
      setStats({ total: 0, bekleyen: 0, faturalandi: 0, iptal: 0 });
    }
  };

  const fetchSiparisler = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        siparisTipi: 'SATIS',
        search: searchTerm || undefined,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      };
      if (filterDurum) params.durum = filterDurum;
      const response = await axios.get('/siparis', { params });
      const data = response.data?.data || [];
      const total = response.data?.meta?.total ?? data.length;
      setSiparisler(data);
      setRowCount(total);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Siparişler yüklenirken hata oluştu', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, siparis: Siparis) => {
    setAnchorEl(event.currentTarget);
    setSelectedSiparis(siparis);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSiparis(null);
  };

  const handleEdit = (row: Siparis) => {
    const tabId = `siparis-satis-duzenle-${row.id}`;
    addTab({ id: tabId, label: `Düzenle: ${row.siparisNo}`, path: `/siparis/satis/duzenle/${row.id}` });
    setActiveTab(tabId);
    router.push(`/siparis/satis/duzenle/${row.id}`);
  };

  const handleCreate = () => {
    addTab({ id: 'siparis-satis-yeni', label: 'Yeni Satış Siparişi', path: '/siparis/satis/yeni' });
    setActiveTab('siparis-satis-yeni');
    router.push('/siparis/satis/yeni');
  };

  const handleView = async (row: Siparis) => {
    try {
      const response = await axios.get(`/siparis/${row.id}`);
      setSelectedSiparis(response.data);
      setOpenView(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş detayı yüklenirken hata oluştu', 'error');
    }
  };

  const handlePrint = (siparis: Siparis) => {
    window.open(`/siparis/satis/print/${siparis.id}`, '_blank');
  };

  const handleHazirlama = (siparis: Siparis) => {
    router.push(`/siparis/satis/hazirlama/${siparis.id}`);
  };

  const handleSevkClick = async (siparis: Siparis) => {
    try {
      setLoading(true);
      const response = await axios.get(`/siparis/${siparis.id}`);
      const siparisDetay = response.data;
      setFullSiparis(siparisDetay);
      setSevkKalemler((siparisDetay.kalemler || []).map((k: SiparisKalemi) => ({
        kalemId: k.id,
        sevkMiktar: k.miktar - (k.sevkEdilenMiktar || 0),
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
    for (const sk of sevkKalemler) {
      if (sk.sevkMiktar > 0) {
        const kalem = fullSiparis.kalemler?.find(k => k.id === sk.kalemId);
        if (kalem) {
          const kalan = kalem.miktar - (kalem.sevkEdilenMiktar || 0);
          if (sk.sevkMiktar > kalan) {
            showSnackbar(`${kalem.stok?.stokAdi || 'Ürün'} için sevk miktarı kalan (${kalan}) aşamaz`, 'error');
            return;
          }
        }
      }
    }
    try {
      setLoading(true);
      await axios.post(`/siparis/${fullSiparis.id}/sevk-et`, {
        kalemler: sevkKalemler.filter(k => k.sevkMiktar > 0),
      });
      showSnackbar('Sipariş başarıyla sevk edildi', 'success');
      setOpenSevkDialog(false);
      setSevkKalemler([]);
      setFullSiparis(null);
      fetchSiparisler();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sevk işlemi başarısız', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSevkMiktarChange = (kalemId: string, value: number) => {
    setSevkKalemler(prev => prev.map(k => k.kalemId === kalemId ? { ...k, sevkMiktar: Math.max(0, value) } : k));
  };

  const handleCreateIrsaliye = async (siparis: Siparis) => {
    try {
      setLoading(true);
      const response = await axios.post(`/siparis/${siparis.id}/irsaliye-olustur`);
      showSnackbar('İrsaliye başarıyla oluşturuldu', 'success');
      router.push(`/satis-irsaliyesi/${response.data.id}`);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İrsaliye oluşturulurken hata oluştu', 'error');
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleDurumChange = async (yeniDurum: string) => {
    if (!selectedSiparis) return;
    try {
      await axios.put(`/siparis/${selectedSiparis.id}/durum`, { durum: yeniDurum });
      showSnackbar(`Sipariş durumu "${durumMetinleri[yeniDurum]}" olarak güncellendi`, 'success');
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
      await axios.delete(`/siparis/${selectedSiparis.id}`);
      showSnackbar('Sipariş başarıyla silindi', 'success');
      fetchSiparisler();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş silinirken hata oluştu', 'error');
    }
    handleMenuClose();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('tr-TR');

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'siparisNo',
      headerName: 'Sipariş No',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => <Typography variant="body2" fontWeight="bold">{params.value}</Typography>,
    },
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 120,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString('tr-TR') : '-',
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
          <Typography variant="caption" color="text.secondary">{params.row.cari?.cariKodu}</Typography>
        </Box>
      ),
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
        <Chip
          label={durumMetinleri[params.value] || params.value}
          color={durumRenkleri[params.value] || 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 180,
      getActions: (params) => {
        const row = params.row as Siparis;
        return [
          <IconButton key="edit" size="small" onClick={(e) => { e.stopPropagation(); handleEdit(row); }} title="Düzenle" disabled={row.durum === 'FATURALANDI' || row.durum === 'IPTAL'}>
            <Edit fontSize="small" />
          </IconButton>,
          <IconButton key="print" size="small" onClick={(e) => { e.stopPropagation(); handlePrint(row); }} title="Yazdır">
            <PrintIcon fontSize="small" />
          </IconButton>,
          <IconButton key="view" size="small" onClick={(e) => { e.stopPropagation(); handleView(row); }} title="Detay">
            <Visibility fontSize="small" />
          </IconButton>,
          <IconButton key="menu" size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, row); }} title="Diğer İşlemler">
            <MoreVert fontSize="small" />
          </IconButton>,
        ];
      },
    },
  ], []);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header - aynı fatura/satis */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ letterSpacing: '-0.5px' }}>
              Satış Siparişleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Müşteri siparişlerinizi buradan yönetebilir, sevk ve fatura süreçlerini takip edebilirsiniz.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Assessment />} onClick={() => router.push('/raporlama/satis-elemani')}>
              Raporlar
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-hover)' } }}
            >
              Yeni Sipariş
            </Button>
          </Box>
        </Box>

        {/* KPI - fatura ile aynı stil */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { title: 'Toplam Sipariş', value: stats?.total ?? 0, color: '#10b981', bgColor: 'color-mix(in srgb, var(--chart-3) 15%, transparent)' },
            { title: 'Bekleyen', value: stats?.bekleyen ?? 0, color: '#3b82f6', bgColor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)' },
            { title: 'Faturalandı', value: stats?.faturalandi ?? 0, color: '#059669', bgColor: 'color-mix(in srgb, #059669 15%, transparent)' },
          ].map((card, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }, transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <CardContent sx={{ p: '20px !important' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>{card.title}</Typography>
                      {loading && !siparisler.length ? (
                        <Skeleton width={80} height={40} />
                      ) : (
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', letterSpacing: '-0.5px' }}>{card.value}</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>adet sipariş</Typography>
                    </Box>
                    <Box sx={{ background: card.bgColor, color: card.color, borderRadius: 2, p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Assessment />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filtre - durum chip'leri fatura tarzı */}
        <Paper sx={{ p: 2, mb: 2, border: '1px solid var(--border)', borderRadius: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Sipariş No, Cari Unvan veya Cari Kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchSiparisler()}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['', 'BEKLEMEDE', 'HAZIRLANIYOR', 'HAZIRLANDI', 'SEVK_EDILDI', 'KISMI_SEVK', 'FATURALANDI', 'IPTAL'].map((d) => (
              <Chip
                key={d || 'ALL'}
                label={d ? durumMetinleri[d] : 'Tümü'}
                onClick={() => setFilterDurum(d)}
                color={filterDurum === d ? 'primary' : 'default'}
                size="small"
                sx={{ fontWeight: filterDurum === d ? 600 : 500 }}
              />
            ))}
          </Box>
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
          checkboxSelection={false}
        />
      </Box>

      {/* View Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Sipariş Detayı</DialogTitle>
        <DialogContent>
          {selectedSiparis && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">Sipariş No:</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedSiparis.siparisNo}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">Tarih:</Typography>
                  <Typography variant="body1" fontWeight="bold">{formatDate(selectedSiparis.tarih)}</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Cari:</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedSiparis.cari?.unvan}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Durum:</Typography>
                <Chip label={durumMetinleri[selectedSiparis.durum]} color={durumRenkleri[selectedSiparis.durum]} size="small" />
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
                          <TableCell sx={{ fontWeight: 600 }}>Birim Fiyat</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Tutar</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedSiparis.kalemler.map((kalem, idx) => (
                          <TableRow key={kalem.id || idx} hover>
                            <TableCell>{kalem.stok?.stokKodu || '-'}</TableCell>
                            <TableCell>{kalem.stok?.stokAdi || '-'}</TableCell>
                            <TableCell>{kalem.miktar}</TableCell>
                            <TableCell>{formatCurrency(kalem.birimFiyat)}</TableCell>
                            <TableCell align="right">{formatCurrency(kalem.miktar * kalem.birimFiyat)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Genel Toplam:</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">{formatCurrency(selectedSiparis.genelToplam)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Menü - Diğer İşlemler */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} disableAutoFocusItem>
        {selectedSiparis && selectedSiparis.durum !== 'FATURALANDI' && selectedSiparis.durum !== 'IPTAL' && (
          <>
            {selectedSiparis.durum === 'BEKLEMEDE' && (
              <MenuItem onClick={() => handleDurumChange('HAZIRLANIYOR')}>Hazırlanıyor Olarak İşaretle</MenuItem>
            )}
            {selectedSiparis.durum === 'HAZIRLANIYOR' && (
              <MenuItem onClick={() => { handleMenuClose(); router.push(`/siparis/satis/hazirlama/${selectedSiparis.id}`); }}>
                <ListItemIcon><Inventory fontSize="small" /></ListItemIcon>
                Sipariş Hazırla
              </MenuItem>
            )}
            {selectedSiparis.durum === 'HAZIRLANIYOR' && (
              <MenuItem onClick={() => handleDurumChange('HAZIRLANDI')}>Hazırlandı Olarak İşaretle</MenuItem>
            )}
            {selectedSiparis.durum === 'HAZIRLANDI' && (
              <MenuItem onClick={() => { handleMenuClose(); router.push(`/fatura/satis/yeni?siparisId=${selectedSiparis.id}`); }}>
                <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
                Faturalandır
              </MenuItem>
            )}
            {(selectedSiparis.durum === 'SEVK_EDILDI' || selectedSiparis.durum === 'KISMI_SEVK') && (
              <MenuItem onClick={() => { handleMenuClose(); handleCreateIrsaliye(selectedSiparis); }}>
                <ListItemIcon><LocalShipping fontSize="small" /></ListItemIcon>
                İrsaliye Oluştur
              </MenuItem>
            )}
            {(selectedSiparis.durum === 'SEVK_EDILDI' || selectedSiparis.durum === 'KISMI_SEVK') && (
              <MenuItem onClick={() => { handleMenuClose(); router.push(`/fatura/satis/yeni?siparisId=${selectedSiparis.id}`); }}>
                <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
                Faturalandır
              </MenuItem>
            )}
            <MenuItem onClick={() => handleDurumChange('IPTAL')} sx={{ color: 'error.main' }}>İptal Et</MenuItem>
            <Divider />
          </>
        )}
        <MenuItem onClick={() => { handleMenuClose(); if (selectedSiparis) handlePrint(selectedSiparis); }}>
          <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
          Yazdır
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          Sil
        </MenuItem>
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
                      <TableCell sx={{ fontWeight: 600 }}>Ürün</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Sipariş Miktarı</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Sevk Edilen</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Kalan</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Bu Sevk Miktarı</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fullSiparis.kalemler?.map((kalem) => {
                      const sk = sevkKalemler.find(k => k.kalemId === kalem.id);
                      const sevkMiktar = sk?.sevkMiktar ?? 0;
                      const kalanMiktar = kalem.miktar - (kalem.sevkEdilenMiktar || 0);
                      return (
                        <TableRow key={kalem.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">{kalem.stok?.stokAdi || 'Ürün'}</Typography>
                            <Typography variant="caption" color="text.secondary">{kalem.stok?.stokKodu || ''}</Typography>
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
          <Button onClick={handleSevkSubmit} variant="contained" disabled={loading} sx={{ bgcolor: 'var(--primary)' }}>
            {loading ? 'Sevk Ediliyor...' : 'Sevk Et'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 'var(--radius)' }}>{snackbar.message}</Alert>
      </Snackbar>
    </MainLayout>
  );
}
