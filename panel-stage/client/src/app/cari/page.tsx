'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Menu,
} from '@mui/material';
import { Add, Edit, Delete, Search, Visibility, Close, Receipt, ToggleOn, ToggleOff, AccountBalance, MoreVert } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import CariForm from '@/components/CariForm';
import axios from '@/lib/axios';
import { cities, getDistricts } from '@/lib/cities';
import { useDebounce } from '@/hooks/useDebounce';
import TableSkeleton from '@/components/Loading/TableSkeleton';
import { useTabStore } from '@/stores/tabStore';

export default function CariPage() {
  const router = useRouter();
  const { addTab, setActiveTab } = useTabStore();
  const [cariler, setCariler] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCari, setSelectedCari] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [selectedCity, setSelectedCity] = useState('İstanbul');

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCariId, setMenuCariId] = useState<string | null>(null);

  // Memoize districts to prevent unnecessary re-renders
  const availableDistricts = useMemo(() => getDistricts(selectedCity), [selectedCity]);

  // Tab ekleme - sayfa yüklendiğinde (sadece bir kez)
  useEffect(() => {
    addTab({
      id: 'cari-liste',
      label: 'Cari Listesi',
      path: '/cari',
    });
    setActiveTab('cari-liste');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sadece component mount olduğunda çalış

  const [formData, setFormData] = useState({
    cariKodu: '',
    unvan: '',
    tip: 'MUSTERI',
    sirketTipi: 'KURUMSAL', // KURUMSAL veya SAHIS
    vergiNo: '',
    vergiDairesi: '',
    tcKimlikNo: '',
    isimSoyisim: '',
    telefon: '',
    email: '',
    yetkili: '',
    ulke: 'Türkiye',
    il: 'İstanbul',
    ilce: 'Kadıköy',
    adres: '',
    vadeSuresi: '',
    aktif: true,
  });

  useEffect(() => {
    fetchCariler();
  }, [debouncedSearch]); // Debounced search ile arama

  const fetchCariler = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/cari', {
        params: { search: debouncedSearch, limit: 100 },
      });
      setCariler(response.data.data || []);
    } catch (error) {
      console.error('Cari verisi alınamadı:', error);
      showSnackbar('Cari listesi yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, cariId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuCariId(cariId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCariId(null);
  };

  const resetForm = async () => {
    // Yeni kayıt için bir sonraki kodu backend'den al
    let nextCode = '';
    try {
      const response = await axios.get('/code-template/next-code/CUSTOMER');
      nextCode = response.data.nextCode || '';
    } catch (error) {
      console.log('Otomatik kod alınamadı, boş bırakılacak');
    }

    setFormData({
      cariKodu: nextCode || '',
      unvan: '',
      tip: 'MUSTERI',
      sirketTipi: 'KURUMSAL',
      vergiNo: '',
      vergiDairesi: '',
      tcKimlikNo: '',
      isimSoyisim: '',
      telefon: '',
      email: '',
      yetkili: '',
      ulke: 'Türkiye',
      il: 'İstanbul',
      ilce: 'Kadıköy',
      adres: '',
      vadeSuresi: '',
      aktif: true,
    });
    setSelectedCity('İstanbul');
  };

  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);
    const districts = getDistricts(city);
    setFormData(prev => ({ ...prev, il: city, ilce: districts[0] || 'Merkez' }));
  }, []);

  const handleAdd = async () => {
    try {
      // Validasyon: Sadece unvan zorunlu (cariKodu boşsa backend otomatik üretir)
      if (!formData.unvan || !formData.unvan.trim()) {
        showSnackbar('Ünvan boş olamaz', 'error');
        return;
      }

      // Adres bilgilerini birleştir
      const fullAdres = `${formData.ilce}, ${formData.il}${formData.adres ? ', ' + formData.adres : ''}`;
      const dataToSend: any = { ...formData, adres: fullAdres };

      // vadeSuresi'yi number'a çevir veya null yap
      if (dataToSend.vadeSuresi) {
        dataToSend.vadeSuresi = parseInt(dataToSend.vadeSuresi);
      } else {
        delete dataToSend.vadeSuresi; // Boşsa gönderme
      }

      delete dataToSend.ulke;
      delete dataToSend.il;
      delete dataToSend.ilce;

      // Şahıs şirketi değilse TC ve isim-soyisim kaldır
      if (formData.sirketTipi !== 'SAHIS') {
        delete dataToSend.tcKimlikNo;
        delete dataToSend.isimSoyisim;
      } else {
        // Şahıs şirketi ise vergi no ve vergi dairesi kaldır
        delete dataToSend.vergiNo;
        delete dataToSend.vergiDairesi;
      }

      // sirketTipi alanını kaldır (veritabanında bu alan yok)
      delete dataToSend.sirketTipi;

      // cariKodu boşsa veya sadece boşluklardan oluşuyorsa undefined yap (backend otomatik üretsin)
      if (!dataToSend.cariKodu || !dataToSend.cariKodu.trim()) {
        dataToSend.cariKodu = undefined;
      } else {
        dataToSend.cariKodu = dataToSend.cariKodu.trim();
      }

      // Boş alanları temizle (undefined yap)
      if (!dataToSend.telefon || !dataToSend.telefon.trim()) delete dataToSend.telefon;
      if (!dataToSend.email || !dataToSend.email.trim()) delete dataToSend.email;
      if (!dataToSend.yetkili || !dataToSend.yetkili.trim()) delete dataToSend.yetkili;
      if (!dataToSend.vergiNo || !dataToSend.vergiNo.trim()) delete dataToSend.vergiNo;
      if (!dataToSend.vergiDairesi || !dataToSend.vergiDairesi.trim()) delete dataToSend.vergiDairesi;
      if (!dataToSend.tcKimlikNo || !dataToSend.tcKimlikNo.trim()) delete dataToSend.tcKimlikNo;
      if (!dataToSend.isimSoyisim || !dataToSend.isimSoyisim.trim()) delete dataToSend.isimSoyisim;
      if (!dataToSend.adres || !dataToSend.adres.trim()) delete dataToSend.adres;
      if (!dataToSend.tip) delete dataToSend.tip; // tip opsiyonel, verilmezse backend MUSTERI kullanır

      await axios.post('/cari', dataToSend);
      showSnackbar('Cari başarıyla eklendi', 'success');
      setOpenAdd(false);
      resetForm();
      fetchCariler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Cari eklenemedi', 'error');
    }
  };

  const handleEdit = async () => {
    try {
      // Adres bilgilerini birleştir
      const fullAdres = `${formData.ilce}, ${formData.il}${formData.adres ? ', ' + formData.adres : ''}`;
      const dataToSend: any = { ...formData, adres: fullAdres };

      // vadeSuresi'yi number'a çevir veya null yap
      if (dataToSend.vadeSuresi) {
        dataToSend.vadeSuresi = parseInt(dataToSend.vadeSuresi);
      } else {
        delete dataToSend.vadeSuresi; // Boşsa gönderme
      }

      delete dataToSend.ulke;
      delete dataToSend.il;
      delete dataToSend.ilce;

      // Şahıs şirketi değilse TC ve isim-soyisim kaldır
      if (formData.sirketTipi !== 'SAHIS') {
        delete dataToSend.tcKimlikNo;
        delete dataToSend.isimSoyisim;
      } else {
        // Şahıs şirketi ise vergi no ve vergi dairesi kaldır
        delete dataToSend.vergiNo;
        delete dataToSend.vergiDairesi;
      }

      // sirketTipi alanını kaldır (veritabanında bu alan yok)
      delete dataToSend.sirketTipi;

      await axios.patch(`/cari/${selectedCari.id}`, dataToSend);
      showSnackbar('Cari başarıyla güncellendi', 'success');
      setOpenEdit(false);
      resetForm();
      setSelectedCari(null);
      fetchCariler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Cari güncellenemedi', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/cari/${selectedCari.id}`);
      showSnackbar('Cari başarıyla silindi', 'success');
      setOpenDelete(false);
      setSelectedCari(null);
      fetchCariler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Cari silinemedi', 'error');
    }
  };

  const openEditDialog = (cari: any) => {
    setSelectedCari(cari);

    // Eski adres formatını parse et (varsa)
    const adresParts = cari.adres ? cari.adres.split(',').map((s: string) => s.trim()) : [];
    const ilce = adresParts.length > 0 ? adresParts[0] : 'Kadıköy';
    const il = adresParts.length > 1 ? adresParts[1] : 'İstanbul';
    const adresDetay = adresParts.length > 2 ? adresParts.slice(2).join(', ') : '';

    setSelectedCity(il);

    // Şahıs şirketi kontrolü (TC kimlik no varsa veya vergi no yoksa)
    const isSahis = cari.tcKimlikNo || (!cari.vergiNo && cari.isimSoyisim);

    setFormData({
      cariKodu: cari.cariKodu,
      unvan: cari.unvan,
      tip: cari.tip,
      sirketTipi: isSahis ? 'SAHIS' : 'KURUMSAL',
      vergiNo: cari.vergiNo || '',
      vergiDairesi: cari.vergiDairesi || '',
      tcKimlikNo: cari.tcKimlikNo || '',
      isimSoyisim: cari.isimSoyisim || '',
      telefon: cari.telefon || '',
      email: cari.email || '',
      yetkili: cari.yetkili || '',
      ulke: 'Türkiye',
      il: il,
      ilce: ilce,
      adres: adresDetay,
      vadeSuresi: cari.vadeSuresi?.toString() || '',
      aktif: cari.aktif !== undefined ? cari.aktif : true,
    });
    setOpenEdit(true);
  };

  const openViewDialog = async (cari: any) => {
    try {
      const response = await axios.get(`/cari/${cari.id}`);
      setSelectedCari(response.data);
      setOpenView(true);
    } catch (error) {
      showSnackbar('Cari detayları yüklenemedi', 'error');
    }
  };

  const openDeleteDialog = (cari: any) => {
    setSelectedCari(cari);
    setOpenDelete(true);
  };

  const handleFormChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);


  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{
              fontWeight: 700,
              fontSize: '1.875rem',
              color: 'var(--foreground)',
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Cari Yönetimi
          </Typography>
          <Typography 
            variant="body2" 
            sx={{
              color: 'var(--muted-foreground)',
              fontSize: '0.875rem',
            }}
          >
            Müşteri ve tedarikçi bilgilerini yönetin
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AccountBalance />}
            onClick={() => router.push('/cari/fatura-kapatma')}
            sx={{
              borderColor: 'var(--secondary)',
              color: 'var(--secondary)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: 'var(--secondary-hover)',
                bgcolor: 'var(--secondary-light)',
              }
            }}
          >
            Fatura Kapatma
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => { resetForm(); setOpenAdd(true); }}
            sx={{
              bgcolor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              boxShadow: 'var(--shadow-sm)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'var(--secondary-hover)',
                boxShadow: 'var(--shadow-md)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Yeni Cari Ekle
          </Button>
        </Box>
      </Box>

      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        bgcolor: 'var(--card)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            className="form-control-textfield"
            placeholder="Cari kodu, ünvan veya yetkili bilgisi ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchCariler()}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'var(--muted-foreground)' }} />,
            }}
          />
          <Button
            variant="contained"
            onClick={fetchCariler}
            sx={{ 
              minWidth: 100,
              bgcolor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'var(--secondary-hover)',
              },
            }}
          >
            Ara
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <IconButton
          size="small"
          onClick={() => setShowInactive(!showInactive)}
          sx={{
            color: showInactive ? 'var(--destructive)' : 'var(--chart-2)',
            bgcolor: showInactive 
              ? 'color-mix(in srgb, var(--destructive) 10%, transparent)' 
              : 'color-mix(in srgb, var(--chart-2) 10%, transparent)',
            '&:hover': {
              bgcolor: showInactive 
                ? 'color-mix(in srgb, var(--destructive) 20%, transparent)' 
                : 'color-mix(in srgb, var(--chart-2) 20%, transparent)',
            },
            borderRadius: 'var(--radius-md)',
            px: 2,
            py: 1,
          }}
          title={showInactive ? 'Kullanım İçi Carileri Göster' : 'Kullanım Dışı Carileri Göster'}
        >
          {showInactive ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
          <Typography 
            variant="caption" 
            sx={{ 
              ml: 1, 
              fontWeight: 600,
              fontSize: '0.8125rem',
            }}
          >
            {showInactive ? 'Kullanım Dışı' : 'Kullanım İçi'}
          </Typography>
        </IconButton>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          bgcolor: 'var(--card)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'var(--muted)' }}>
              <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.875rem' }}>Tip</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.875rem' }}>Cari Kodu</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.875rem' }}>Ünvan</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.875rem' }}>Yetkili</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.875rem' }}>Bakiye</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.875rem' }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : cariler.filter((cari: any) => showInactive ? cari.aktif === false : cari.aktif !== false).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" sx={{ color: 'var(--muted-foreground)' }}>
                    {showInactive ? 'Kullanım dışı cari bulunamadı' : 'Kullanım içi cari bulunamadı'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', mt: 1 }}>
                    {showInactive ? 'Tüm cariler kullanım içi durumda' : 'Yeni cari eklemek için yukarıdaki butonu kullanın'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              cariler.filter((cari: any) => showInactive ? cari.aktif === false : cari.aktif !== false).map((cari: any) => (
                <TableRow 
                  key={cari.id} 
                  hover
                  sx={{
                    bgcolor: 'var(--background)',
                    '&:hover': {
                      bgcolor: 'var(--muted) !important',
                    },
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <TableCell>
                    <Chip
                      label={cari.tip === 'MUSTERI' ? 'Müşteri' : 'Tedarikçi'}
                      size="small"
                      sx={{
                        bgcolor: cari.tip === 'MUSTERI' 
                          ? 'color-mix(in srgb, var(--chart-1) 15%, transparent)' 
                          : 'color-mix(in srgb, var(--primary) 15%, transparent)',
                        color: cari.tip === 'MUSTERI' ? 'var(--chart-1)' : 'var(--primary)',
                        borderColor: cari.tip === 'MUSTERI' ? 'var(--chart-1)' : 'var(--primary)',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'var(--primary)' }}>{cari.cariKodu}</TableCell>
                  <TableCell sx={{ color: 'var(--foreground)' }}>{cari.unvan}</TableCell>
                  <TableCell sx={{ color: 'var(--muted-foreground)' }}>{cari.yetkili || '-'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
                    ₺{parseFloat(cari.bakiye || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, cari.id)}
                      sx={{
                        color: 'var(--muted-foreground)',
                        '&:hover': {
                          bgcolor: 'var(--muted)',
                          color: 'var(--secondary)'
                        }
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && menuCariId === cari.id}
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
                      <MenuItem
                        onClick={() => {
                          router.push(`/cari/${cari.id}`);
                          handleMenuClose();
                        }}
                        sx={{
                          gap: 1.5,
                          py: 1,
                          '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-2) 10%, transparent)' }
                        }}
                      >
                        <Receipt fontSize="small" sx={{ color: 'var(--chart-2)' }} />
                        <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>Ekstre</Typography>
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          openViewDialog(cari);
                          handleMenuClose();
                        }}
                        sx={{
                          gap: 1.5,
                          py: 1,
                          '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-1) 10%, transparent)' }
                        }}
                      >
                        <Visibility fontSize="small" sx={{ color: 'var(--chart-1)' }} />
                        <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>İncele</Typography>
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          openEditDialog(cari);
                          handleMenuClose();
                        }}
                        sx={{
                          gap: 1.5,
                          py: 1,
                          '&:hover': { bgcolor: 'color-mix(in srgb, var(--secondary) 10%, transparent)' }
                        }}
                      >
                        <Edit fontSize="small" sx={{ color: 'var(--secondary)' }} />
                        <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>Düzenle</Typography>
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          openDeleteDialog(cari);
                          handleMenuClose();
                        }}
                        disabled={!!(cari.hareketSayisi && cari.hareketSayisi > 0)}
                        sx={{
                          gap: 1.5,
                          py: 1,
                          '&:hover': { bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)' },
                          '&.Mui-disabled': { opacity: 0.5 }
                        }}
                      >
                        <Delete fontSize="small" sx={{ color: 'var(--destructive)' }} />
                        <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>Sil</Typography>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Yeni Cari Ekle Dialog */}
      <Dialog 
        open={openAdd} 
        onClose={() => setOpenAdd(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          },
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'var(--secondary)',
          color: 'var(--secondary-foreground)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 700,
          fontSize: '1.125rem',
        }}>
          Yeni Cari Ekle
          <IconButton size="small" onClick={() => setOpenAdd(false)} sx={{ color: 'var(--secondary-foreground)' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <CariForm
            data={formData}
            onChange={handleFormChange}
            onCityChange={handleCityChange}
            availableDistricts={availableDistricts}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenAdd(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'var(--muted-foreground)',
              '&:hover': {
                bgcolor: 'var(--muted)',
              },
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            sx={{
              bgcolor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'var(--secondary-hover)',
              },
            }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cari Düzenle Dialog */}
      <Dialog 
        open={openEdit} 
        onClose={() => setOpenEdit(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          },
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'var(--secondary)',
          color: 'var(--secondary-foreground)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 700,
          fontSize: '1.125rem',
        }}>
          Cari Düzenle
          <IconButton size="small" onClick={() => setOpenEdit(false)} sx={{ color: 'var(--secondary-foreground)' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <CariForm
            data={formData}
            onChange={handleFormChange}
            onCityChange={handleCityChange}
            availableDistricts={availableDistricts}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenEdit(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'var(--muted-foreground)',
              '&:hover': {
                bgcolor: 'var(--muted)',
              },
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleEdit}
            sx={{
              bgcolor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'var(--secondary-hover)',
              },
            }}
          >
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cari İncele Dialog */}
      <Dialog 
        open={openView} 
        onClose={() => setOpenView(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          },
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'var(--chart-1)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 700,
          fontSize: '1.125rem',
        }}>
          Cari Detayları
          <IconButton size="small" onClick={() => setOpenView(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedCari && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Cari Kodu</Typography>
                  <Typography variant="body1" fontWeight="600">{selectedCari.cariKodu}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Ünvan</Typography>
                  <Typography variant="body1" fontWeight="600">{selectedCari.unvan}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Tip</Typography>
                  <Chip
                    label={selectedCari.tip}
                    size="small"
                    sx={{
                      bgcolor: selectedCari.tip === 'MUSTERI' ? 'var(--chart-1)' : 'var(--primary)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Bakiye</Typography>
                  <Typography 
                    variant="h6" 
                    sx={{
                      fontWeight: 700,
                      color: parseFloat(selectedCari.bakiye) >= 0 ? 'var(--chart-2)' : 'var(--destructive)',
                    }}
                  >
                    ₺{parseFloat(selectedCari.bakiye || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Vergi No</Typography>
                  <Typography variant="body1">{selectedCari.vergiNo || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Vergi Dairesi</Typography>
                  <Typography variant="body1">{selectedCari.vergiDairesi || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Telefon</Typography>
                  <Typography variant="body1">{selectedCari.telefon || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedCari.email || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Yetkili</Typography>
                  <Typography variant="body1">{selectedCari.yetkili || '-'}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Adres</Typography>
                <Typography variant="body1">{selectedCari.adres || '-'}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenView(false)} variant="contained">Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Cari Sil Dialog */}
      <Dialog 
        open={openDelete} 
        onClose={() => setOpenDelete(false)}
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          },
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'var(--destructive)',
          color: 'var(--destructive-foreground)',
          fontWeight: 700,
          fontSize: '1.125rem',
        }}>
          Cari Sil
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2,
              bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Bu işlem geri alınamaz!
          </Alert>
          <Typography sx={{ color: 'var(--foreground)' }}>
            <strong>{selectedCari?.unvan}</strong> carisini silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDelete(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'var(--muted-foreground)',
              '&:hover': {
                bgcolor: 'var(--muted)',
              },
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{
              bgcolor: 'var(--destructive)',
              color: 'var(--destructive-foreground)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'var(--destructive-hover)',
              },
            }}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

