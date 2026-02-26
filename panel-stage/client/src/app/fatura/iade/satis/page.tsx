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
  Select,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Divider,
} from '@mui/material';
import { Add, Search, Visibility, Edit, Delete, Close, Cancel, Print, Undo, MoreVert } from '@mui/icons-material';
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
  satisFiyati: number;
  kdvOrani: number;
}

interface FaturaKalemi {
  stokId: string;
  stok?: Stok;
  miktar: number;
  birimFiyat: number;
  kdvOrani: number;
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
  irsaliye?: {
    id: string;
    irsaliyeNo: string;
  };
}

export default function SatisIadeFaturalariPage() {
  const { addTab, setActiveTab } = useTabStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [faturalar, setFaturalar] = useState<Fatura[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [loading, setLoading] = useState(false);

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
    faturaTipi: 'SATIS_IADE' as 'SATIS_IADE' | 'ALIS_IADE',
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
  }, []);

  const fetchFaturalar = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/fatura', {
        params: {
          faturaTipi: 'SATIS_IADE',
          search: searchTerm,
        },
      });
      const faturaData = response.data.data || [];
      setFaturalar(faturaData);
      // Her fatura için mevcut durumu state'e kaydet
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
      faturaTipi: 'SATIS_IADE',
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
      kalemler: [...prev.kalemler, { stokId: '', miktar: 1, birimFiyat: 0, kdvOrani: 20 }],
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
      const tutar = kalem.miktar * kalem.birimFiyat;
      const kalemKdv = (tutar * kalem.kdvOrani) / 100;
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
        mesaj = 'İade faturası iptal edildi. Stok hareketleri geri alındı ve cari bakiye düzeltildi.';
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

  const renderFormDialog = () => {
    const { toplamTutar, kdvTutar, genelToplam } = calculateTotal();

    return (
      <Dialog
        open={openAdd || openEdit}
        onClose={() => { setOpenAdd(false); setOpenEdit(false); }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }} component="div">
          {openAdd ? 'Yeni Satış İade Faturası' : 'Satış İade Faturası Düzenle'}
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
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
                                onChange={(e) => handleKalemChange(index, 'miktar', parseFloat(e.target.value))}
                                inputProps={{ min: 1 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.birimFiyat}
                                onChange={(e) => handleKalemChange(index, 'birimFiyat', parseFloat(e.target.value))}
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
                                onChange={(e) => handleKalemChange(index, 'kdvOrani', parseInt(e.target.value))}
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
                      color: '#ef4444',
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
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Satış İade Faturaları
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Satış iade faturalarını görüntüleyin ve yönetin
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            addTab({ id: 'fatura-iade-satis-yeni', label: 'Yeni Satış İade Faturası', path: '/fatura/iade/satis/yeni' });
            setActiveTab('fatura-iade-satis-yeni');
            router.push('/fatura/iade/satis/yeni');
          }}
          sx={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              boxShadow: '0 6px 16px rgba(239, 68, 68, 0.6)',
            }
          }}
        >
          Yeni Satış İade Faturası
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
                    Fatura bulunamadı
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Yeni fatura eklemek için yukarıdaki butonu kullanın
                  </Typography>
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
                    <Typography variant="body2" fontWeight="600" color="#ef4444">
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
              sx={{
                gap: 1.5,
                py: 1,
                '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)' }
              }}
            >
              <Visibility fontSize="small" sx={{ color: '#3b82f6' }} />
              <Typography variant="body2">Görüntüle</Typography>
            </MenuItem>,

            <MenuItem
              key="edit"
              onClick={() => {
                router.push(`/fatura/iade/satis/duzenle/${fatura.id}`);
                handleMenuClose();
              }}
              sx={{
                gap: 1.5,
                py: 1,
                '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)' }
              }}
            >
              <Edit fontSize="small" sx={{ color: '#ef4444' }} />
              <Typography variant="body2">Düzenle</Typography>
            </MenuItem>,

            <MenuItem
              key="print"
              onClick={() => {
                router.push(`/fatura/iade/satis/print/${fatura.id}`);
                handleMenuClose();
              }}
              sx={{
                gap: 1.5,
                py: 1,
                '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-3) 15%, transparent)' }
              }}
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
              disabled={fatura.durum !== 'ONAYLANDI'}
              sx={{
                gap: 1.5,
                py: 1,
                '&:hover': { bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)' },
                '&.Mui-disabled': { opacity: 0.5 }
              }}
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
              disabled={fatura.durum === 'ONAYLANDI' || fatura.durum === 'IPTAL'}
              sx={{
                gap: 1.5,
                py: 1,
                '&:hover': { bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)' },
                '&.Mui-disabled': { opacity: 0.5 }
              }}
            >
              <Delete fontSize="small" sx={{ color: '#ef4444' }} />
              <Typography variant="body2">Sil</Typography>
            </MenuItem>
          ];
        })()}
      </Menu>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam {faturalar.length} kayıt gösteriliyor
        </Typography>
      </Box>

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
                          const araToplam = kalem.miktar * kalem.birimFiyat;
                          const iskontoTutar = kalem.iskontoTutari || (araToplam * (kalem.iskontoOrani || 0)) / 100;
                          const netTutar = araToplam - iskontoTutar;
                          const kdvTutar = (netTutar * kalem.kdvOrani) / 100;
                          const satirToplami = netTutar + kdvTutar;

                          return (
                            <TableRow key={index} hover>
                              <TableCell>{kalem.stok?.stokKodu || '-'}</TableCell>
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
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#ef4444' }}>
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
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
                    • İade stok hareketleri geri alınacak (iptal çıkış)<br />
                    • Cari bakiye düzeltilecek
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
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
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
              {selectedFatura.irsaliye && (
                <Box sx={{
                  p: 2,
                  bgcolor: '#f9fafb',
                  borderRadius: 1,
                  mb: 2,
                  border: '1px solid #e5e7eb'
                }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Bu faturaya bağlı bir irsaliye bulunmaktadır:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    İrsaliye No: <strong>{selectedFatura.irsaliye.irsaliyeNo}</strong>
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
