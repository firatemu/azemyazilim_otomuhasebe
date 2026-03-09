'use client';

import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Add, Search, Visibility, Delete, Close, Cancel, Print, MoreVert, ExpandMore } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useTabStore } from '@/stores/tabStore';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  satisFiyati?: number;
  alisFiyati?: number;
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
  faturaTipi: 'PURCHASE' | 'PURCHASE_RETURN';
  tarih: string;
  vade: string | null;
  cari: Cari;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  durum: 'OPEN' | 'APPROVED' | 'PARTIALLY_PAID' | 'CLOSED' | 'CANCELLED';
  iskonto?: number;
  aciklama?: string;
  kalemler?: FaturaKalemi[];
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
    actionType?: string;
    user?: { fullName?: string };
  }>;
  satinAlmaIrsaliyesi?: {
    id: string;
    irsaliyeNo: string;
  };
  satinAlmaIrsaliye?: {
    id: string;
    irsaliyeNo: string;
  };
}

export default function AlisIadeFaturalariPage() {
  const { addTab, setActiveTab } = useTabStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [faturalar, setFaturalar] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(false);

  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openIptal, setOpenIptal] = useState(false);
  const [openDurumOnay, setOpenDurumOnay] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);
  const [pendingDurum, setPendingDurum] = useState<{ faturaId: string; eskiDurum: string; yeniDurum: string } | null>(null);
  const [faturaDurumlari, setFaturaDurumlari] = useState<Record<string, string>>({});
  const [irsaliyeIptal, setIrsaliyeIptal] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFaturaId, setMenuFaturaId] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchFaturalar();
  }, []);

  const fetchFaturalar = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/invoice', {
        params: {
          faturaTipi: 'ALIS_IADE',
          search: searchTerm,
        },
      });
      const faturaData = response.data.data || [];
      setFaturalar(faturaData);
      const durumMap: Record<string, string> = {};
      faturaData.forEach((fatura: Fatura) => {
        durumMap[fatura.id] = fatura.durum;
      });
      setFaturaDurumlari(durumMap);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İade faturaları yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, faturaId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuFaturaId(faturaId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuFaturaId(null);
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

  const handleDelete = async () => {
    if (!selectedFatura) return;
    try {
      setLoading(true);
      await axios.delete(`/fatura/${selectedFatura.id}`);
      showSnackbar('İade faturası başarıyla silindi', 'success');
      setOpenDelete(false);
      fetchFaturalar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İade faturası silinirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIptal = async () => {
    try {
      if (selectedFatura) {
        await axios.put(`/fatura/${selectedFatura.id}/iptal`, {
          irsaliyeIptal: irsaliyeIptal,
        });
        const mesaj = irsaliyeIptal
          ? 'Fatura ve bağlı irsaliye iptal edildi. Stok hareketleri geri alındı ve cari bakiye güncellendi.'
          : 'İade faturası iptal edildi. Stok hareketleri geri alındı ve cari bakiye güncellendi.';
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
    if (eskiDurum === yeniDurum) return;
    const fatura = faturalar.find(f => f.id === faturaId);
    if (!fatura) return;
    setFaturaDurumlari(prev => ({ ...prev, [faturaId]: yeniDurum }));
    setSelectedFatura(fatura);
    setPendingDurum({ faturaId, eskiDurum, yeniDurum });
    setOpenDurumOnay(true);
  };

  const handleDurumChangeConfirm = async () => {
    if (!pendingDurum) return;
    try {
      await axios.put('/invoice/bulk/durum', {
        ids: [pendingDurum.faturaId],
        durum: pendingDurum.yeniDurum as any,
      });
      let mesaj = 'Fatura durumu güncellendi';
      if (pendingDurum.yeniDurum === 'APPROVED') {
        mesaj = 'İade faturası onaylandı. Stoklar düşülecek ve cari bakiye güncellenecek.';
      } else if (pendingDurum.yeniDurum === 'CANCELLED') {
        mesaj = 'İade faturası iptal edildi. Stok hareketleri geri alındı ve cari bakiye düzeltildi.';
      } else if (pendingDurum.yeniDurum === 'OPEN') {
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
      fetchFaturalar();
    }
  };

  const handleDurumChangeCancel = () => {
    if (pendingDurum) {
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
      case 'CLOSED':
        return 'success';
      case 'APPROVED':
        return 'info';
      case 'OPEN':
        return 'warning';
      case 'KISMEN_ODENDI':
        return 'primary';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CLOSED':
        return 'Ödendi';
      case 'APPROVED':
        return 'Onaylandı';
      case 'OPEN':
        return 'Beklemede';
      case 'KISMEN_ODENDI':
        return 'Kısmen Ödendi';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Satınalma İade Faturaları
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Satınalma iade faturalarını görüntüleyin ve yönetin
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            addTab({ id: 'fatura-iade-alis-yeni', label: 'Yeni Satın Alma İade Faturası', path: '/invoice/iade/alis/yeni' });
            setActiveTab('fatura-iade-alis-yeni');
            router.push('/invoice/iade/alis/yeni');
          }}
          sx={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              boxShadow: '0 6px 16px rgba(6, 182, 212, 0.6)',
            }
          }}
        >
          Yeni İade Faturası
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Fatura No veya Cari Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchFaturalar()}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Button
            variant="contained"
            onClick={fetchFaturalar}
            sx={{ minWidth: 100 }}
          >
            Ara
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'var(--muted)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Fatura No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Cari</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vade</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Tutar</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Onay Durumu</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Yükleniyor...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : faturalar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    Henüz satınalma iade faturası bulunmamaktadır.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Yeni iade faturası eklemek için yukarıdaki butonu kullanın
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    sx={{ mt: 2 }}
                    onClick={() => {
                      addTab({ id: 'fatura-iade-alis-yeni', label: 'Yeni Satın Alma İade Faturası', path: '/invoice/iade/alis/yeni' });
                      setActiveTab('fatura-iade-alis-yeni');
                      router.push('/invoice/iade/alis/yeni');
                    }}
                  >
                    İlk İade Faturasını Oluştur
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              faturalar.map((fatura) => (
                <TableRow
                  key={fatura.id}
                  hover
                  sx={{ '&:hover': { bgcolor: 'var(--muted)' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" sx={{ color: '#06b6d4' }}>
                      {fatura.faturaNo}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(fatura.tarih)}</TableCell>
                  <TableCell>{fatura.cari.unvan}</TableCell>
                  <TableCell>{fatura.vade ? formatDate(fatura.vade) : '-'}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {formatCurrency(fatura.genelToplam)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(fatura.durum)}
                      color={getStatusColor(fatura.durum)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      aria-label="more"
                      id={`long-button-${fatura.id}`}
                      aria-controls={Boolean(anchorEl) ? 'long-menu' : undefined}
                      aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                      aria-haspopup="true"
                      onClick={(event) => handleMenuOpen(event, fatura.id)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
            minWidth: 200,
          }
        }}
      >
        {(() => {
          const fatura = faturalar.find(f => f.id === menuFaturaId);
          if (!fatura) return null;

          return [
            <MenuItem
              key="view"
              onClick={() => {
                openViewDialog(fatura);
                handleMenuClose();
              }}
              sx={{ gap: 1.5, py: 1, '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)' } }}
            >
              <Visibility fontSize="small" sx={{ color: '#3b82f6' }} />
              <Typography variant="body2">Görüntüle</Typography>
            </MenuItem>,
            <MenuItem
              key="print"
              onClick={() => {
                window.open(`/fatura/iade/alis/print/${fatura.id}`, '_blank');
                handleMenuClose();
              }}
              sx={{ gap: 1.5, py: 1, '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-3) 15%, transparent)' } }}
            >
              <Print fontSize="small" sx={{ color: '#10b981' }} />
              <Typography variant="body2">Yazdır</Typography>
            </MenuItem>,
            <MenuItem
              key="cancel"
              onClick={() => {
                openIptalDialog(fatura);
                handleMenuClose();
              }}
              disabled={fatura.durum !== 'APPROVED'}
              sx={{ gap: 1.5, py: 1, '&:hover': { bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)' }, '&.Mui-disabled': { opacity: 0.5 } }}
            >
              <Cancel fontSize="small" sx={{ color: fatura.durum === 'IPTAL' ? '#9ca3af' : '#ef4444' }} />
              <Typography variant="body2">İptal Et</Typography>
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => {
                openDeleteDialog(fatura);
                handleMenuClose();
              }}
              disabled={fatura.durum === 'APPROVED' || fatura.durum === 'CANCELLED'}
              sx={{ gap: 1.5, py: 1, '&:hover': { bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)' }, '&.Mui-disabled': { opacity: 0.5 } }}
            >
              <Delete fontSize="small" sx={{ color: '#ef4444' }} />
              <Typography variant="body2">Sil</Typography>
            </MenuItem>,
          ];
        })()}
      </Menu>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam {faturalar.length} kayıt gösteriliyor
        </Typography>
      </Box>

      {/* View Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>
          İade Faturası Detayı
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
                  <Typography variant="body1" fontWeight="bold">{formatDate(selectedFatura.tarih)}</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Cari:</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedFatura.cari.unvan}</Typography>
              </Box>

              {selectedFatura.kalemler && selectedFatura.kalemler.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Kalemler:</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Malzeme Kodu</TableCell>
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
                          const araToplam = kalem.miktar * (typeof kalem.birimFiyat === 'object' && kalem.birimFiyat != null && 'toNumber' in kalem.birimFiyat ? (kalem.birimFiyat as any).toNumber() : Number(kalem.birimFiyat));
                          const iskontoTutar = kalem.iskontoTutari ?? (araToplam * (kalem.iskontoOrani ?? 0)) / 100;
                          const netTutar = araToplam - iskontoTutar;
                          const kdvTutar = (netTutar * (kalem.kdvOrani ?? 0)) / 100;
                          const satirToplami = netTutar + kdvTutar;
                          return (
                            <TableRow key={index} hover>
                              <TableCell>{kalem.stok?.stokKodu || '-'}</TableCell>
                              <TableCell>{kalem.stok?.stokAdi || '-'}</TableCell>
                              <TableCell>{kalem.miktar}</TableCell>
                              <TableCell>{formatCurrency(typeof kalem.birimFiyat === 'object' && kalem.birimFiyat != null && 'toNumber' in kalem.birimFiyat ? (kalem.birimFiyat as any).toNumber() : Number(kalem.birimFiyat))}</TableCell>
                              <TableCell>%{kalem.iskontoOrani ?? 0}</TableCell>
                              <TableCell>{formatCurrency(kalem.iskontoTutari ?? 0)}</TableCell>
                              <TableCell>%{kalem.kdvOrani}</TableCell>
                              <TableCell align="right">{formatCurrency(satirToplami)}</TableCell>
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
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#06b6d4' }}>
                      {formatCurrency(selectedFatura.genelToplam)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Accordion variant="outlined" sx={{ bgcolor: 'color-mix(in srgb, var(--chart-1) 10%, transparent)', mt: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary
                  expandIcon={<ExpandMore color="primary" />}
                  sx={{
                    minHeight: '48px',
                    '& .MuiAccordionSummary-content': { my: 1 }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0369a1' }}>
                    📋 Denetim Bilgileri
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">Oluşturan:</Typography>
                        <Typography variant="body2" fontWeight="500">
                          {selectedFatura.createdByUser?.fullName || 'Sistem'}
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({selectedFatura.createdByUser?.username || '-'})
                          </Typography>
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">Oluşturma Tarihi:</Typography>
                        <Typography variant="body2" fontWeight="500">
                          {selectedFatura.createdAt ? new Date(selectedFatura.createdAt).toLocaleString('tr-TR') : '-'}
                        </Typography>
                      </Box>
                    </Box>
                    {selectedFatura.updatedByUser && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">Son Güncelleyen:</Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedFatura.updatedByUser.fullName}
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                              ({selectedFatura.updatedByUser.username})
                            </Typography>
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">Son Güncelleme:</Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedFatura.updatedAt ? new Date(selectedFatura.updatedAt).toLocaleString('tr-TR') : '-'}
                          </Typography>
                        </Box>
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

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>İade Faturasını Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedFatura?.faturaNo}</strong> nolu iade faturasını silmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Bu işlem geri alınamaz!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>İptal</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={loading}>
            {loading ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Durum Değişikliği Onay Dialog */}
      <Dialog open={openDurumOnay} onClose={handleDurumChangeCancel} maxWidth="sm" fullWidth>
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
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
                <strong>{selectedFatura.faturaNo}</strong> nolu iade faturası durumunu değiştirmek istiyorsunuz.
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'var(--muted)', borderRadius: 1, mb: 2, border: '1px solid var(--border)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">Mevcut Durum:</Typography>
                    <Chip label={getStatusLabel(pendingDurum.eskiDurum)} color={getStatusColor(pendingDurum.eskiDurum)} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary">→</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">Yeni Durum:</Typography>
                    <Chip label={getStatusLabel(pendingDurum.yeniDurum)} color={getStatusColor(pendingDurum.yeniDurum)} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              </Box>
              {pendingDurum.yeniDurum === 'APPROVED' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    • Stok hareketi oluşturulacak (çıkış - iade)<br />
                    • Cari bakiye azalacak
                  </Typography>
                </Alert>
              )}
              {pendingDurum.yeniDurum === 'CANCELLED' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    • İade stok hareketleri geri alınacak (iptal giriş)<br />
                    • Cari bakiye düzeltilecek
                  </Typography>
                </Alert>
              )}
              {pendingDurum.yeniDurum === 'OPEN' && (
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
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }
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
          İade Faturası İptal
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
                <strong>{selectedFatura.faturaNo}</strong> nolu iade faturasını iptal etmek istediğinizden emin misiniz?
              </Typography>
              {(selectedFatura.satinAlmaIrsaliyesi || selectedFatura.satinAlmaIrsaliye) && (
                <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1, mb: 2, border: '1px solid #e5e7eb' }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Bu faturaya bağlı bir irsaliye bulunmaktadır:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    İrsaliye No: <strong>{(selectedFatura.satinAlmaIrsaliyesi || selectedFatura.satinAlmaIrsaliye)?.irsaliyeNo}</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="checkbox"
                      id="irsaliyeIptal"
                      checked={irsaliyeIptal}
                      onChange={(e) => setIrsaliyeIptal(e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <Typography variant="body2" component="label" htmlFor="irsaliyeIptal" sx={{ cursor: 'pointer', userSelect: 'none' }}>
                      Bağlı olduğu irsaliye de iptal edilsin mi?
                    </Typography>
                  </Box>
                  {irsaliyeIptal && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        İrsaliye iptal edildiğinde, irsaliye durumu güncellenir. (Stok sadece onaylı faturalardan hesaplanır)
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
              '&:hover': { background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }
            }}
          >
            İptal Et
          </Button>
        </DialogActions>
      </Dialog>

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
    </MainLayout>
  );
}
