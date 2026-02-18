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
  Snackbar,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { Add, Search, Visibility, Edit, Delete, MoreVert, Receipt, Print as PrintIcon, Inventory, LocalShipping, Send } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

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

export default function SatisSiparisleriPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [loading, setLoading] = useState(false);
  const [durumFilter, setDurumFilter] = useState<'ALL' | 'BEKLEMEDE' | 'HAZIRLANIYOR' | 'HAZIRLANDI' | 'SEVK_EDILDI' | 'KISMI_SEVK' | 'FATURALANDI'>('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSiparis, setSelectedSiparis] = useState<Siparis | null>(null);
  const [openSevkDialog, setOpenSevkDialog] = useState(false);
  const [sevkKalemler, setSevkKalemler] = useState<Array<{ kalemId: string; sevkMiktar: number }>>([]);
  const [fullSiparis, setFullSiparis] = useState<Siparis | null>(null);

  useEffect(() => {
    fetchSiparisler();
  }, [searchTerm]);

  const fetchSiparisler = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/siparis', {
        params: {
          siparisTipi: 'SATIS',
          search: searchTerm,
        },
      });
      console.log('Sipariş API yanıtı:', response.data);
      setSiparisler(response.data.data || []);
    } catch (error: any) {
      console.error('Sipariş yükleme hatası:', error);
      showSnackbar(error.response?.data?.message || 'Siparişler yüklenirken hata oluştu', 'error');
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

  const handleMenuClose = (event?: {}, reason?: string) => {
    setAnchorEl(null);
    setSelectedSiparis(null);
  };

  const handleDurumChange = async (yeniDurum: string) => {
    if (!selectedSiparis) return;

    try {
      await axios.put(`/siparis/${selectedSiparis.id}/durum`, { durum: yeniDurum });
      showSnackbar(`Sipariş durumu "${durumMetinleri[yeniDurum]}" olarak güncellendi`, 'success');
      fetchSiparisler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Durum değiştirilirken hata oluştu', 'error');
    } finally {
      handleMenuClose();
    }
  };



  const handleHazirlama = (siparis: Siparis) => {
    router.push(`/siparis/satis/hazirlama/${siparis.id}`);
  };

  const handlePrint = (siparis: Siparis) => {
    router.push(`/siparis/satis/print/${siparis.id}`);
  };

  const handleSevkClick = async (siparis: Siparis) => {
    try {
      setLoading(true);
      // Sipariş detaylarını al (kalemler dahil)
      const response = await axios.get(`/siparis/${siparis.id}`);
      const siparisDetay = response.data;
      setFullSiparis(siparisDetay);

      // Kalemler için sevk miktarlarını başlat (kalan miktar kadar)
      const initialSevkKalemler = (siparisDetay.kalemler || []).map((kalem: SiparisKalemi) => ({
        kalemId: kalem.id,
        sevkMiktar: kalem.miktar - (kalem.sevkEdilenMiktar || 0), // Kalan miktar
      }));
      setSevkKalemler(initialSevkKalemler);
      setOpenSevkDialog(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş detayları yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSevkSubmit = async () => {
    if (!fullSiparis) return;

    // En az bir kalem sevk edilmeli
    const hasSevk = sevkKalemler.some(k => k.sevkMiktar > 0);
    if (!hasSevk) {
      showSnackbar('En az bir kalem için sevk miktarı girmelisiniz', 'error');
      return;
    }

    // Validasyon: Sevk miktarı kalan miktarı aşamaz
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
      // Sadece sevk miktarı > 0 olan kalemleri gönder
      const sevkEdilecekKalemler = sevkKalemler.filter(k => k.sevkMiktar > 0);

      await axios.post(`/siparis/${fullSiparis.id}/sevk-et`, {
        kalemler: sevkEdilecekKalemler,
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
      prev.map(k =>
        k.kalemId === kalemId
          ? { ...k, sevkMiktar: Math.max(0, value) }
          : k
      )
    );
  };

  const handleCreateIrsaliye = async (siparis: Siparis) => {
    if (!confirm(`"${siparis.siparisNo}" numaralı siparişten irsaliye oluşturmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/siparis/${siparis.id}/irsaliye-olustur`);
      showSnackbar('İrsaliye başarıyla oluşturuldu', 'success');
      // İrsaliye sayfasına yönlendir
      router.push(`/satis-irsaliyesi/${response.data.id}`);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İrsaliye oluşturulurken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSiparis) return;

    if (!confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      handleMenuClose();
      return;
    }

    try {
      await axios.delete(`/siparis/${selectedSiparis.id}`);
      showSnackbar('Sipariş başarıyla silindi', 'success');
      fetchSiparisler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş silinirken hata oluştu', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Satış Siparişleri
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/siparis/satis/yeni')}
          >
            Yeni Sipariş
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Sipariş No, Cari Unvan veya Cari Kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
            <Chip
              label="Tümü"
              color={durumFilter === 'ALL' ? 'primary' : 'default'}
              onClick={() => setDurumFilter('ALL')}
              size="small"
            />
            <Chip label="Beklemede" color={durumFilter === 'BEKLEMEDE' ? 'primary' : 'default'} onClick={() => setDurumFilter('BEKLEMEDE')} size="small" />
            <Chip label="Hazırlanıyor" color={durumFilter === 'HAZIRLANIYOR' ? 'primary' : 'default'} onClick={() => setDurumFilter('HAZIRLANIYOR')} size="small" />
            <Chip label="Hazırlandı" color={durumFilter === 'HAZIRLANDI' ? 'primary' : 'default'} onClick={() => setDurumFilter('HAZIRLANDI')} size="small" />
            <Chip label="Sevk Edildi" color={durumFilter === 'SEVK_EDILDI' ? 'primary' : 'default'} onClick={() => setDurumFilter('SEVK_EDILDI')} size="small" />
            <Chip label="Kısmi Sevk" color={durumFilter === 'KISMI_SEVK' ? 'primary' : 'default'} onClick={() => setDurumFilter('KISMI_SEVK')} size="small" />
            <Chip label="Faturalandı" color={durumFilter === 'FATURALANDI' ? 'primary' : 'default'} onClick={() => setDurumFilter('FATURALANDI')} size="small" />
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sipariş No</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Cari</TableCell>
                  <TableCell align="right">Tutar</TableCell>
                  <TableCell align="right">KDV</TableCell>
                  <TableCell align="right">Genel Toplam</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İrsaliye Durumu / Fatura No</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {siparisler.filter(s => durumFilter === 'ALL' ? true : s.durum === durumFilter).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Sipariş bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  siparisler
                    .filter(s => durumFilter === 'ALL' ? true : s.durum === durumFilter)
                    .map((siparis) => (
                    <TableRow key={siparis.id} hover>
                      <TableCell>{siparis.siparisNo}</TableCell>
                      <TableCell>{formatDate(siparis.tarih)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{siparis.cari.unvan}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {siparis.cari.cariKodu}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(siparis.toplamTutar)}</TableCell>
                      <TableCell align="right">{formatCurrency(siparis.kdvTutar)}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(siparis.genelToplam)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={durumMetinleri[siparis.durum]}
                          color={durumRenkleri[siparis.durum]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {siparis.kaynakIrsaliyeleri && siparis.kaynakIrsaliyeleri.length > 0 ? (
                          <Chip
                            label="İrsaliyendirilmiş"
                            color="info"
                            size="small"
                          />
                        ) : siparis.faturaNo ? (
                          <Typography variant="caption">{siparis.faturaNo}</Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/siparis/satis/duzenle/${siparis.id}`)}
                          disabled={siparis.durum === 'FATURALANDI' || siparis.durum === 'IPTAL'}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handlePrint(siparis)}
                          color="primary"
                        >
                          <PrintIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleHazirlama(siparis)}
                          color="secondary"
                          title="Hazırlama Formu"
                        >
                          <Inventory />
                        </IconButton>
                        {siparis.durum !== 'FATURALANDI' && siparis.durum !== 'IPTAL' && (
                          <IconButton
                            size="small"
                            onClick={() => handleSevkClick(siparis)}
                            color="primary"
                            title="Sevk Et"
                          >
                            <Send />
                          </IconButton>
                        )}
                        {(siparis.durum === 'SEVK_EDILDI' || siparis.durum === 'KISMI_SEVK') && (
                          <IconButton
                            size="small"
                            onClick={() => handleCreateIrsaliye(siparis)}
                            color="primary"
                            title="İrsaliye Oluştur"
                          >
                            <LocalShipping />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, siparis)}
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
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          disableAutoFocusItem
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {selectedSiparis && selectedSiparis.durum !== 'FATURALANDI' && selectedSiparis.durum !== 'IPTAL' && (
            [
              selectedSiparis.durum === 'BEKLEMEDE' && (
                <MenuItem
                  key="hazirlaniyor"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDurumChange('HAZIRLANIYOR');
                  }}
                >
                  Hazırlanıyor Olarak İşaretle
                </MenuItem>
              ),
              selectedSiparis.durum === 'HAZIRLANIYOR' && (
                <MenuItem
                  key="hazirla"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose();
                    router.push(`/siparis/hazirla/${selectedSiparis.id}`);
                  }}
                >
                  Sipariş Hazırla
                </MenuItem>
              ),
              selectedSiparis.durum === 'HAZIRLANIYOR' && (
                <MenuItem
                  key="hazirlandi"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDurumChange('HAZIRLANDI');
                  }}
                >
                  Hazırlandı Olarak İşaretle
                </MenuItem>
              ),
              selectedSiparis.durum === 'HAZIRLANDI' && (
                <MenuItem
                  key="faturalandir"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose();
                    router.push(`/fatura/satis/yeni?siparisId=${selectedSiparis.id}`);
                  }}
                >
                  <Receipt sx={{ mr: 1 }} fontSize="small" />
                  Faturalandır
                </MenuItem>
              ),
              (selectedSiparis.durum === 'SEVK_EDILDI' || selectedSiparis.durum === 'KISMI_SEVK') && (
                <MenuItem
                  key="irsaliye_olustur_menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose();
                    if (selectedSiparis) handleCreateIrsaliye(selectedSiparis);
                  }}
                >
                  <LocalShipping sx={{ mr: 1 }} fontSize="small" />
                  İrsaliye Oluştur
                </MenuItem>
              ),
              (selectedSiparis.durum === 'SEVK_EDILDI' || selectedSiparis.durum === 'KISMI_SEVK') && (
                <MenuItem
                  key="faturalandir_sevk"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose();
                    router.push(`/fatura/satis/yeni?siparisId=${selectedSiparis.id}`);
                  }}
                >
                  <Receipt sx={{ mr: 1 }} fontSize="small" />
                  Faturalandır
                </MenuItem>
              ),
              <MenuItem
                key="iptal"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDurumChange('IPTAL');
                }}
              >
                İptal Et
              </MenuItem>
            ].filter(Boolean)
          )}
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClose();
              if (selectedSiparis) handlePrint(selectedSiparis);
            }}
          >
            <PrintIcon sx={{ mr: 1 }} fontSize="small" />
            Yazdır
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Sil
          </MenuItem>
        </Menu>

        {/* Sevk Dialog */}
        <Dialog open={openSevkDialog} onClose={() => { setOpenSevkDialog(false); setFullSiparis(null); setSevkKalemler([]); }} maxWidth="md" fullWidth>
          <DialogTitle>
            Sipariş Sevk Et - {fullSiparis?.siparisNo}
          </DialogTitle>
          <DialogContent>
            {fullSiparis && (
              <Box sx={{ mt: 2 }}>
                <DialogContentText sx={{ mb: 3 }}>
                  Sipariş kalemlerini sevk edin. Kısmi sevk yapabilirsiniz.
                </DialogContentText>
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
                        const sevkKalem = sevkKalemler.find(k => k.kalemId === kalem.id);
                        const sevkMiktar = sevkKalem?.sevkMiktar || 0;
                        const kalanMiktar = kalem.miktar - (kalem.sevkEdilenMiktar || 0);
                        const isTamSevk = sevkMiktar === kalanMiktar;

                        return (
                          <TableRow key={kalem.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="500">
                                {kalem.stok?.stokAdi || 'Ürün'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {kalem.stok?.stokKodu || ''}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{kalem.miktar}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="text.secondary">
                                {kalem.sevkEdilenMiktar || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color={kalanMiktar > 0 ? 'text.primary' : 'success.main'}>
                                {kalanMiktar}
                              </Typography>
                            </TableCell>
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
                              {isTamSevk && kalanMiktar > 0 && (
                                <Button
                                  size="small"
                                  onClick={() => handleSevkMiktarChange(kalem.id, 0)}
                                  sx={{ ml: 1 }}
                                >
                                  Temizle
                                </Button>
                              )}
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
            <Button onClick={() => { setOpenSevkDialog(false); setFullSiparis(null); setSevkKalemler([]); }}>
              İptal
            </Button>
            <Button
              onClick={handleSevkSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              }}
            >
              {loading ? 'Sevk Ediliyor...' : 'Sevk Et'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}

