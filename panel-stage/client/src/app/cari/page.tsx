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
import { CariFormData, initialCariFormData } from '@/components/cari/types';
import NewCariDialog from '@/components/cari/NewCariDialog';

export default function CariPage() {
  const router = useRouter();
  const { addTab, setActiveTab } = useTabStore();
  const [cariler, setCariler] = useState<any[]>([]);
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
  const [formData, setFormData] = useState<CariFormData>(initialCariFormData);
  const [satisElemanlari, setSatisElemanlari] = useState<any[]>([]);

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

  useEffect(() => {
    fetchCariler();
  }, [debouncedSearch]); // Debounced search ile arama

  useEffect(() => {
    const fetchSatisElemanlari = async () => {
      try {
        const response = await axios.get('/satis-elemani');
        setSatisElemanlari(response.data || []);
      } catch (error) {
        console.error('Satış elemanları yüklenirken hata:', error);
      }
    };
    fetchSatisElemanlari();
  }, []);

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
      ...initialCariFormData,
      cariKodu: nextCode || '',
    });
    setSelectedCity('İstanbul');
  };

  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);
    const districts = getDistricts(city);
    setFormData(prev => ({ ...prev, il: city, ilce: districts[0] || 'Merkez' }));
  }, []);

  const prepareDataToSend = (data: CariFormData) => {
    const dataToSend: any = { ...data };

    // Tip dönüşümleri
    if (dataToSend.vadeSuresi) {
      dataToSend.vadeSuresi = parseInt(dataToSend.vadeSuresi) || 0;
    } else {
      dataToSend.vadeSuresi = undefined;
    }

    if (!dataToSend.vadeGun && dataToSend.vadeSuresi) {
      dataToSend.vadeGun = dataToSend.vadeSuresi;
    }

    // Şahıs şirketi değilse TC ve isim-soyisim temizle
    if (data.sirketTipi !== 'SAHIS') {
      dataToSend.tcKimlikNo = undefined;
      dataToSend.isimSoyisim = undefined;
    } else {
      dataToSend.vergiNo = undefined;
      dataToSend.vergiDairesi = undefined;
    }

    // Boş risk değerleri
    if (!dataToSend.riskLimiti) dataToSend.riskLimiti = 0;
    if (!dataToSend.teminatTutar) dataToSend.teminatTutar = 0;

    // cariKodu temizliği
    if (!dataToSend.cariKodu || !dataToSend.cariKodu.trim()) {
      dataToSend.cariKodu = undefined;
    } else {
      dataToSend.cariKodu = dataToSend.cariKodu.trim();
    }

    // Boş alanları temizle
    const nullableFields = ['telefon', 'email', 'yetkili', 'vergiNo', 'vergiDairesi', 'tcKimlikNo', 'isimSoyisim', 'adres', 'webSite', 'faks', 'sektor', 'ozelKod1', 'ozelKod2', 'bankaBilgileri'];
    nullableFields.forEach(field => {
      if (dataToSend[field] !== undefined && (dataToSend[field] === '' || dataToSend[field] === null)) {
        dataToSend[field] = undefined;
      }
    });

    // İlişkili tabloları temizle (Prisma ID'lerini ve relation ID'lerini sil)
    if (dataToSend.yetkililer) {
      dataToSend.yetkililer = dataToSend.yetkililer.map((y: any) => {
        const { id, cariId, createdAt, updatedAt, ...rest } = y;
        return rest;
      });
    }

    if (dataToSend.ekAdresler) {
      dataToSend.ekAdresler = dataToSend.ekAdresler.map((a: any) => {
        const { id, cariId, createdAt, updatedAt, ...rest } = a;
        return rest;
      });
    }

    if (dataToSend.tedarikciBankalar) {
      dataToSend.tedarikciBankalar = dataToSend.tedarikciBankalar.map((b: any) => {
        const { id, cariId, createdAt, updatedAt, ...rest } = b;
        return rest;
      });
    }

    return dataToSend;
  };



  const handleEdit = async () => {
    try {
      if (!selectedCari) return;

      const dataToSend = prepareDataToSend(formData);

      delete dataToSend.id;
      delete dataToSend.createdAt;
      delete dataToSend.updatedAt;
      delete dataToSend.tenantId;
      delete dataToSend.bakiye; // Bakiye guncellenemez
      delete dataToSend.cariHareketler;
      delete dataToSend.faturalar;
      delete dataToSend.tahsilatlar;

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

  const openEditDialog = async (cariSummary: any) => {
    try {
      // Detaylı veriyi çek (ilişkisel tablolar için)
      const response = await axios.get(`/cari/${cariSummary.id}`);
      const cari = response.data;

      setSelectedCari(cari);

      // Adres ayrıştırma (Eski veri uyumluluğu)
      let il = cari.il || 'İstanbul';
      let ilce = cari.ilce || 'Kadıköy';
      let adresDetay = cari.adres || '';

      if (!cari.il && cari.adres && cari.adres.includes(',')) {
        const parts = cari.adres.split(',').map((s: string) => s.trim());
        if (parts.length >= 2) {
          ilce = parts[0];
          il = parts[1];
          adresDetay = parts.slice(2).join(', ');
        }
      }

      setSelectedCity(il);

      // Şahıs şirketi kontrolü
      const isSahis = cari.tcKimlikNo || (!cari.vergiNo && cari.isimSoyisim);

      setFormData({
        ...initialCariFormData,
        ...cari,
        cariKodu: cari.cariKodu,
        unvan: cari.unvan,
        tip: cari.tip,
        sirketTipi: cari.sirketTipi || (isSahis ? 'SAHIS' : 'KURUMSAL'),
        vergiNo: cari.vergiNo || '',
        vergiDairesi: cari.vergiDairesi || '',
        tcKimlikNo: cari.tcKimlikNo || '',
        isimSoyisim: cari.isimSoyisim || '',
        telefon: cari.telefon || '',
        email: cari.email || '',
        yetkili: cari.yetkili || '',
        ulke: cari.ulke || 'Türkiye',
        il: il,
        ilce: ilce,
        adres: adresDetay,
        vadeSuresi: cari.vadeSuresi?.toString() || '',
        vadeGun: cari.vadeGun || 0,
        aktif: cari.aktif !== undefined ? cari.aktif : true,
        riskLimiti: cari.riskLimiti || 0,
        riskDurumu: cari.riskDurumu || 'NORMAL',
        teminatTutar: cari.teminatTutar || 0,
        sektor: cari.sektor || '',
        ozelKod1: cari.ozelKod1 || '',
        ozelKod2: cari.ozelKod2 || '',
        webSite: cari.webSite || '',
        faks: cari.faks || '',
        paraBirimi: cari.paraBirimi || 'TRY',
        bankaBilgileri: cari.bankaBilgileri || '',
        yetkililer: cari.yetkililer || [],
        ekAdresler: cari.ekAdresler || [],
        tedarikciBankalar: cari.tedarikciBankalar || [],
      });
      setOpenEdit(true);
    } catch (error) {
      console.error("Cari detay yüklenemedi", error);
      showSnackbar('Cari bilgileri yüklenirken hata oluştu', 'error');
    }
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

  const handleFormChange = useCallback((field: string, value: any) => {
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
            onClick={() => {
              setOpenAdd(true);
            }}
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
              <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.875rem' }}>Satış Elemanı</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.875rem' }}>Yetkili</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.875rem' }}>Bakiye</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.875rem' }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={7} />
            ) : cariler.filter((cari: any) => showInactive ? cari.aktif === false : cari.aktif !== false).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
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
                      label={cari.tip === 'MUSTERI' ? 'Müşteri' : (cari.tip === 'HER_IKISI' ? 'Müşteri & Tedarikçi' : 'Tedarikçi')}
                      size="small"
                      sx={{
                        bgcolor: cari.tip === 'MUSTERI'
                          ? 'color-mix(in srgb, var(--chart-1) 15%, transparent)'
                          : (cari.tip === 'HER_IKISI' ? 'color-mix(in srgb, var(--chart-2) 15%, transparent)' : 'color-mix(in srgb, var(--primary) 15%, transparent)'),
                        color: cari.tip === 'MUSTERI' ? 'var(--chart-1)' : (cari.tip === 'HER_IKISI' ? 'var(--chart-2)' : 'var(--primary)'),
                        borderColor: cari.tip === 'MUSTERI' ? 'var(--chart-1)' : (cari.tip === 'HER_IKISI' ? 'var(--chart-2)' : 'var(--primary)'),
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'var(--primary)' }}>{cari.cariKodu}</TableCell>
                  <TableCell sx={{ color: 'var(--foreground)' }}>{cari.unvan}</TableCell>
                  <TableCell sx={{ color: 'var(--muted-foreground)' }}>{cari.satisElemani?.adSoyad || '-'}</TableCell>
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu (Moved outside for performance and accessibility) */}
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
          const cari = cariler.find((c: any) => c.id === menuCariId);
          if (!cari) return null;

          return [
            <MenuItem
              key="statement"
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
            </MenuItem>,

            <MenuItem
              key="view"
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
            </MenuItem>,

            <MenuItem
              key="edit"
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
            </MenuItem>,

            <MenuItem
              key="delete"
              onClick={() => {
                openDeleteDialog(cari);
                handleMenuClose();
              }}
              disabled={!!(cari?.hareketSayisi && cari.hareketSayisi > 0)}
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
          ];
        })()}
      </Menu>

      {/* Yeni Cari Ekle Dialog */}
      <NewCariDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchCariler}
        showSnackbar={showSnackbar}
      />

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
            bgcolor: 'var(--card)',
            backgroundImage: 'none',
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
        <DialogContent sx={{ bgcolor: 'var(--background)' }}>
          <CariForm
            data={formData}
            onChange={handleFormChange}
            onCityChange={handleCityChange}
            availableDistricts={availableDistricts}
            satisElemanlari={satisElemanlari}
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
            bgcolor: 'var(--card)',
            backgroundImage: 'none',
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
        <DialogContent sx={{ bgcolor: 'var(--background)' }}>
          {selectedCari && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>Cari Kodu</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ color: 'var(--foreground)' }}>{selectedCari.cariKodu}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>Ünvan</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ color: 'var(--foreground)' }}>{selectedCari.unvan}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>Tip</Typography>
                  <Chip
                    label={selectedCari.tip === 'MUSTERI' ? 'Müşteri' : (selectedCari.tip === 'HER_IKISI' ? 'Müşteri & Tedarikçi' : 'Tedarikçi')}
                    size="small"
                    sx={{
                      bgcolor: selectedCari.tip === 'MUSTERI'
                        ? 'color-mix(in srgb, var(--chart-1) 15%, transparent)'
                        : (selectedCari.tip === 'HER_IKISI' ? 'color-mix(in srgb, var(--chart-2) 15%, transparent)' : 'color-mix(in srgb, var(--primary) 15%, transparent)'),
                      color: selectedCari.tip === 'MUSTERI' ? 'var(--chart-1)' : (selectedCari.tip === 'HER_IKISI' ? 'var(--chart-2)' : 'var(--primary)'),
                      borderColor: selectedCari.tip === 'MUSTERI' ? 'var(--chart-1)' : (selectedCari.tip === 'HER_IKISI' ? 'var(--chart-2)' : 'var(--primary)'),
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                    variant="outlined"
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>Bakiye</Typography>
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
                  <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>Vergi No</Typography>
                  <Typography variant="body1" sx={{ color: 'var(--foreground)' }}>{selectedCari.vergiNo || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>Vergi Dairesi</Typography>
                  <Typography variant="body1" sx={{ color: 'var(--foreground)' }}>{selectedCari.vergiDairesi || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>Telefon</Typography>
                  <Typography variant="body1" sx={{ color: 'var(--foreground)' }}>{selectedCari.telefon || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>Email</Typography>
                  <Typography variant="body1" sx={{ color: 'var(--foreground)' }}>{selectedCari.email || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>Yetkili</Typography>
                  <Typography variant="body1" sx={{ color: 'var(--foreground)' }}>{selectedCari.yetkili || '-'}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>Adres</Typography>
                <Typography variant="body1" sx={{ color: 'var(--foreground)' }}>{selectedCari.adres || '-'}</Typography>
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
            bgcolor: 'var(--card)',
            backgroundImage: 'none',
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
