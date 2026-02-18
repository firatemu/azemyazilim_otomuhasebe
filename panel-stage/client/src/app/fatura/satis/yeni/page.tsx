'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Stack,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
  CircularProgress,
  Checkbox,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Delete, Save, ArrowBack, ToggleOn, ToggleOff, LocalShipping } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
  vadeSuresi?: number;
  satisElemaniId?: string;
}

interface SatisElemani {
  id: string;
  adSoyad: string;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  satisFiyati: number;
  kdvOrani: number;
  barkod?: string;
}

interface FaturaKalemi {
  stokId: string;
  stok?: Stok;
  miktar: number;
  birimFiyat: number;
  kdvOrani: number;
  iskontoOran: number;
  iskontoTutar: number;
  cokluIskonto?: boolean;
  iskontoFormula?: string;
}

function YeniSatisFaturasiPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siparisId = searchParams.get('siparisId');
  const irsaliyeId = searchParams.get('irsaliyeId');

  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [satisElemanlari, setSatisElemanlari] = useState<SatisElemani[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSiparis, setLoadingSiparis] = useState(false);

  const [formData, setFormData] = useState({
    faturaNo: '',
    faturaTipi: 'SATIS' as 'SATIS' | 'ALIS',
    cariId: '',
    warehouseId: '',
    tarih: new Date().toISOString().split('T')[0],
    vade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    durum: 'ONAYLANDI' as 'ACIK' | 'ONAYLANDI',
    genelIskontoOran: 0,
    genelIskontoTutar: 0,
    aciklama: '',
    satisElemaniId: '',
    dovizCinsi: 'TRY' as 'TRY' | 'USD' | 'EUR' | 'GBP',
    dovizKuru: 1,
    kalemler: [] as FaturaKalemi[],
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [autocompleteOpenStates, setAutocompleteOpenStates] = useState<Record<number, boolean>>({});
  const [openIrsaliyeDialog, setOpenIrsaliyeDialog] = useState(false);
  const [irsaliyeler, setIrsaliyeler] = useState<any[]>([]);
  const [selectedIrsaliyeler, setSelectedIrsaliyeler] = useState<string[]>([]);
  const [loadingIrsaliyeler, setLoadingIrsaliyeler] = useState(false);
  const [openSiparisDialog, setOpenSiparisDialog] = useState(false);
  const [siparisler, setSiparisler] = useState<any[]>([]);
  const [selectedSiparisler, setSelectedSiparisler] = useState<string[]>([]);
  const [loadingSiparisler, setLoadingSiparisler] = useState(false);
  const [siparisSearch, setSiparisSearch] = useState('');
  const [stockErrorDialog, setStockErrorDialog] = useState<{
    open: boolean;
    products: Array<{
      stokKodu: string;
      stokAdi: string;
      mevcutStok: number;
      talep: number;
    }>;
  }>({ open: false, products: [] });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Mobile item card component
  const MobileItemCard = ({ kalem, index }: { kalem: FaturaKalemi, index: number }) => (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        position: 'relative',
        bgcolor: 'var(--card)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Autocomplete
            size="small"
            open={autocompleteOpenStates[index] || false}
            onOpen={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: true }))}
            onClose={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }))}
            value={stoklar.find(s => s.id === kalem.stokId) || null}
            onChange={(_, newValue) => {
              handleKalemChange(index, 'stokId', newValue?.id || '');
              setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }));
            }}
            options={stoklar}
            getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Stok / Hizmet"
                placeholder="Kod veya ad ile ara"
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Box>
        <IconButton
          size="small"
          color="error"
          onClick={() => handleRemoveKalem(index)}
          sx={{ ml: 1, mt: 0.5 }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
        <TextField
          label="Miktar"
          type="number"
          size="small"
          value={kalem.miktar}
          onChange={(e) => handleKalemChange(index, 'miktar', e.target.value)}
          inputProps={{ min: 1 }}
        />
        <TextField
          label="Birim Fiyat"
          type="number"
          size="small"
          value={kalem.birimFiyat}
          onChange={(e) => handleKalemChange(index, 'birimFiyat', e.target.value)}
          inputProps={{ min: 0, step: 0.01 }}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
        <TextField
          label="KDV %"
          type="number"
          size="small"
          value={kalem.kdvOrani}
          onChange={(e) => handleKalemChange(index, 'kdvOrani', e.target.value)}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">Çoklu İskonto:</Typography>
          <IconButton
            size="small"
            onClick={() => handleKalemChange(index, 'cokluIskonto', !kalem.cokluIskonto)}
            sx={{ color: kalem.cokluIskonto ? 'var(--primary)' : 'var(--muted-foreground)' }}
          >
            {kalem.cokluIskonto ? <ToggleOn /> : <ToggleOff />}
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
        {kalem.cokluIskonto ? (
          <TextField
            label="İskonto Oranı (10+5)"
            size="small"
            value={kalem.iskontoFormula || ''}
            onChange={(e) => /^[\d+]*$/.test(e.target.value) && handleKalemChange(index, 'iskontoFormula', e.target.value)}
            helperText={kalem.iskontoOran > 0 ? `Eff: %${kalem.iskontoOran.toFixed(2)}` : ''}
          />
        ) : (
          <TextField
            label="İskonto Oranı %"
            type="number"
            size="small"
            value={kalem.iskontoOran || ''}
            onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)}
          />
        )}
        <TextField
          label="İskonto Tutarı"
          type="number"
          size="small"
          value={kalem.iskontoTutar || ''}
          onChange={(e) => handleKalemChange(index, 'iskontoTutar', e.target.value)}
          disabled={kalem.cokluIskonto}
        />
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pt: 1.5,
        borderTop: '1px dashed var(--border)',
        mt: 1
      }}>
        <Typography variant="subtitle2" color="var(--muted-foreground)">Satır Toplamı:</Typography>
        <Typography variant="subtitle1" fontWeight="700" color="var(--primary)">
          {formatCurrency(calculateKalemTutar(kalem))}
        </Typography>
      </Box>
    </Paper>
  );

  useEffect(() => {
    fetchCariler();
    fetchStoklar();
    fetchSatisElemanlari();
    fetchWarehouses();

    if (irsaliyeId) {
      fetchIrsaliyeBilgileri(irsaliyeId);
    } else if (siparisId) {
      fetchSiparisBilgileri(siparisId);
    } else {
      generateFaturaNo();
    }
  }, [siparisId, irsaliyeId]);

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

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/warehouse?active=true');
      const warehouseList = response.data || [];
      setWarehouses(warehouseList);

      if (warehouseList.length === 0) {
        showSnackbar('Sistemde tanımlı ambar bulunamadı! Lütfen önce bir ambar tanımlayın.', 'error');
        return;
      }

      const defaultWarehouse = warehouseList.find((w: any) => w.isDefault);
      if (defaultWarehouse && !formData.warehouseId) {
        setFormData(prev => ({ ...prev, warehouseId: defaultWarehouse.id }));
      } else if (warehouseList.length === 1 && !formData.warehouseId) {
        // Sadece 1 ambar varsa otomatik seç
        setFormData(prev => ({ ...prev, warehouseId: warehouseList[0].id }));
      }
    } catch (error) {
      console.error('Ambar listesi alınamadı:', error);
      showSnackbar('Ambar listesi alınamadı', 'error');
    }
  };

  const fetchSatisElemanlari = async () => {
    try {
      const response = await axios.get('/satis-elemani');
      setSatisElemanlari(response.data || []);
    } catch (error) {
      console.error('Satış elemanları yüklenirken hata:', error);
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

  const fetchSiparisBilgileri = async (id: string) => {
    try {
      setLoadingSiparis(true);
      const response = await axios.get(`/siparis/${id}`);
      const siparis = response.data;

      console.log('Sipariş bilgileri yüklendi:', siparis);

      // Cari bilgisini set et
      if (siparis.cari) {
        setFormData(prev => ({
          ...prev,
          cariId: siparis.cari.id,
          tarih: new Date(siparis.tarih).toISOString().split('T')[0],
          vade: siparis.vade ? new Date(siparis.vade).toISOString().split('T')[0] : prev.vade,
          aciklama: siparis.aciklama || prev.aciklama,
          satisElemaniId: siparis.satisElemaniId || prev.satisElemaniId,
        }));

        // Carinin vade süresine göre otomatik vade hesapla (eğer vade yoksa)
        if (!siparis.vade && siparis.cari.vadeSuresi && siparis.cari.vadeSuresi > 0) {
          const faturaDate = new Date(siparis.tarih);
          const vadeDate = new Date(faturaDate);
          vadeDate.setDate(vadeDate.getDate() + siparis.cari.vadeSuresi);
          setFormData(prev => ({
            ...prev,
            vade: vadeDate.toISOString().split('T')[0],
          }));
        }
      }

      // Kalemleri set et
      if (siparis.kalemler && siparis.kalemler.length > 0) {
        const kalemler: FaturaKalemi[] = siparis.kalemler.map((kalem: any) => ({
          stokId: kalem.stokId,
          stok: kalem.stok ? {
            id: kalem.stok.id,
            stokKodu: kalem.stok.stokKodu,
            stokAdi: kalem.stok.stokAdi,
            satisFiyati: kalem.birimFiyat,
            kdvOrani: kalem.kdvOrani,
            miktar: 0,
          } : undefined,
          miktar: kalem.miktar,
          birimFiyat: kalem.birimFiyat,
          kdvOrani: kalem.kdvOrani,
          iskontoOran: kalem.iskontoOran || 0,
          iskontoTutar: kalem.iskontoTutar || 0,
          cokluIskonto: false,
          iskontoFormula: '',
        }));

        setFormData(prev => ({
          ...prev,
          kalemler,
        }));
      }

      // Genel iskonto varsa set et
      if (siparis.iskonto && siparis.iskonto > 0) {
        // Genel iskonto tutarından oran hesapla
        const toplamKalemTutari = siparis.kalemler?.reduce((sum: number, kalem: any) => {
          return sum + (kalem.miktar * kalem.birimFiyat - (kalem.iskontoTutar || 0));
        }, 0) || 0;

        const genelIskontoOran = toplamKalemTutari > 0
          ? (siparis.iskonto / toplamKalemTutari) * 100
          : 0;

        setFormData(prev => ({
          ...prev,
          genelIskontoOran,
          genelIskontoTutar: siparis.iskonto,
        }));
      }

      // Fatura numarasını oluştur
      generateFaturaNo();

      showSnackbar('Sipariş bilgileri yüklendi', 'success');
    } catch (error: any) {
      console.error('Sipariş bilgileri yüklenirken hata:', error);
      showSnackbar(error.response?.data?.message || 'Sipariş bilgileri yüklenirken hata oluştu', 'error');
      // Hata durumunda normal fatura numarası oluştur
      generateFaturaNo();
    } finally {
      setLoadingSiparis(false);
    }
  };
  const fetchIrsaliyeler = async (cariId: string) => {
    if (!cariId) {
      showSnackbar('Önce cari hesap seçmelisiniz', 'error');
      return;
    }

    try {
      setLoadingIrsaliyeler(true);
      const response = await axios.get('/satis-irsaliyesi', {
        params: {
          cariId,
          durum: 'FATURALANMADI',
          limit: 100,
        },
      });
      setIrsaliyeler(response.data.data || []);
      setOpenIrsaliyeDialog(true);
    } catch (error: any) {
      console.error('İrsaliyeler yüklenirken hata:', error);
      showSnackbar(error.response?.data?.message || 'İrsaliyeler yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingIrsaliyeler(false);
    }
  };

  const fetchSiparisler = async () => {
    try {
      setLoadingSiparisler(true);
      const response = await axios.get('/siparis/fatura-icin-siparisler', {
        params: {
          cariId: formData.cariId || undefined,
          search: siparisSearch || undefined,
        },
      });

      setSiparisler(response.data.data || []);
    } catch (error: any) {
      console.error('Siparişler yüklenirken hata:', error);
      showSnackbar(error.response?.data?.message || 'Siparişler yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingSiparisler(false);
    }
  };

  const handleIrsaliyelerdenEkle = async () => {
    if (selectedIrsaliyeler.length === 0) {
      showSnackbar('En az bir irsaliye seçmelisiniz', 'error');
      return;
    }

    try {
      setLoadingIrsaliyeler(true);
      const tumKalemler: FaturaKalemi[] = [];

      // Seçilen her irsaliye için kalemleri topla
      for (const irsaliyeId of selectedIrsaliyeler) {
        const response = await axios.get(`/satis-irsaliyesi/${irsaliyeId}`);
        const irsaliye = response.data;

        if (irsaliye.kalemler && irsaliye.kalemler.length > 0) {
          const kalemler: FaturaKalemi[] = irsaliye.kalemler.map((kalem: any) => {
            const kalanMiktar = kalem.miktar - (kalem.faturalananMiktar || 0);
            return {
              stokId: kalem.stokId,
              stok: kalem.stok ? {
                id: kalem.stok.id,
                stokKodu: kalem.stok.stokKodu,
                stokAdi: kalem.stok.stokAdi,
                satisFiyati: kalem.birimFiyat,
                kdvOrani: kalem.kdvOrani,
                miktar: 0,
              } : undefined,
              miktar: kalanMiktar > 0 ? kalanMiktar : 0,
              birimFiyat: kalem.birimFiyat,
              kdvOrani: kalem.kdvOrani,
              iskontoOran: 0,
              iskontoTutar: 0,
              cokluIskonto: false,
              iskontoFormula: '',
            };
          }).filter((k: any) => k.miktar > 0);

          tumKalemler.push(...kalemler);
        }
      }

      if (tumKalemler.length === 0) {
        showSnackbar('Seçilen irsaliyelerde faturalanacak ürün kalmamış.', 'info');
        return;
      }

      // Mevcut kalemlere ekle (aynı stok varsa miktarını artır)
      setFormData(prev => {
        const yeniKalemler = [...prev.kalemler];

        tumKalemler.forEach(yeniKalem => {
          const mevcutIndex = yeniKalemler.findIndex(k => k.stokId === yeniKalem.stokId);
          if (mevcutIndex >= 0) {
            // Aynı stok varsa miktarı artır
            yeniKalemler[mevcutIndex].miktar += yeniKalem.miktar;
          } else {
            // Yeni kalem ekle
            yeniKalemler.push(yeniKalem);
          }
        });

        return {
          ...prev,
          kalemler: yeniKalemler,
        };
      });

      setOpenIrsaliyeDialog(false);
      setSelectedIrsaliyeler([]);
      showSnackbar(`${selectedIrsaliyeler.length} irsaliyeden ${tumKalemler.length} kalem eklendi`, 'success');
    } catch (error: any) {
      console.error('İrsaliye kalemleri yüklenirken hata:', error);
      showSnackbar(error.response?.data?.message || 'İrsaliye kalemleri yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingIrsaliyeler(false);
    }
  };

  const handleSiparislerdenEkle = async () => {
    if (selectedSiparisler.length === 0) {
      showSnackbar('Lütfen en az bir sipariş seçin', 'error');
      return;
    }

    try {
      setLoadingSiparisler(true);
      const tumKalemler: FaturaKalemi[] = [];

      // Seçilen her sipariş için kalemleri topla
      for (const siparisId of selectedSiparisler) {
        const response = await axios.get(`/siparis/${siparisId}`);
        const siparis = response.data;

        // Cari otomatik seç (eğer boşsa)
        if (!formData.cariId && siparis.cariId) {
          setFormData(prev => ({ ...prev, cariId: siparis.cariId }));
        }

        if (siparis.kalemler && siparis.kalemler.length > 0) {
          const kalemler: FaturaKalemi[] = siparis.kalemler.map((kalem: any) => ({
            stokId: kalem.stokId,
            stok: kalem.stok ? {
              id: kalem.stok.id,
              stokKodu: kalem.stok.stokKodu,
              stokAdi: kalem.stok.stokAdi,
              satisFiyati: kalem.birimFiyat,
              kdvOrani: kalem.kdvOrani,
              miktar: 0,
            } : undefined,
            miktar: kalem.miktar,
            birimFiyat: kalem.birimFiyat,
            kdvOrani: kalem.kdvOrani,
            iskontoOran: 0,
            iskontoTutar: 0,
            cokluIskonto: false,
            iskontoFormula: '',
          }));

          tumKalemler.push(...kalemler);
        }
      }

      // Mevcut kalemlere ekle (aynı stok varsa miktarını artır)
      setFormData(prev => {
        const yeniKalemler = [...prev.kalemler];

        tumKalemler.forEach(yeniKalem => {
          const mevcutIndex = yeniKalemler.findIndex(k => k.stokId === yeniKalem.stokId);
          if (mevcutIndex >= 0) {
            // Aynı stok varsa miktarı artır
            yeniKalemler[mevcutIndex].miktar += yeniKalem.miktar;
          } else {
            // Yeni kalem ekle
            yeniKalemler.push(yeniKalem);
          }
        });

        return {
          ...prev,
          kalemler: yeniKalemler,
        };
      });

      setOpenSiparisDialog(false);
      setSelectedSiparisler([]);
      showSnackbar(`${selectedSiparisler.length} siparişten ${tumKalemler.length} kalem eklendi`, 'success');
    } catch (error: any) {
      console.error('Siparişlerden eklenirken hata:', error);
      showSnackbar(error.response?.data?.message || 'Siparişlerden eklenirken hata oluştu', 'error');
    } finally {
      setLoadingSiparisler(false);
    }
  };

  const fetchIrsaliyeBilgileri = async (id: string) => {
    try {
      setLoadingSiparis(true);
      const response = await axios.get(`/satis-irsaliyesi/${id}`);
      const irsaliye = response.data;

      console.log('İrsaliye bilgileri yüklendi:', irsaliye);

      // Cari bilgisini set et
      if (irsaliye.cari) {
        setFormData(prev => ({
          ...prev,
          cariId: irsaliye.cari.id,
          tarih: new Date(irsaliye.irsaliyeTarihi).toISOString().split('T')[0],
          vade: irsaliye.cari.vadeSuresi && irsaliye.cari.vadeSuresi > 0
            ? new Date(Date.now() + irsaliye.cari.vadeSuresi * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          aciklama: irsaliye.aciklama || prev.aciklama,
          satisElemaniId: irsaliye.satisElemaniId || irsaliye.cari?.satisElemaniId || prev.satisElemaniId,
        }));
      }

      // Kalemleri set et
      if (irsaliye.kalemler && irsaliye.kalemler.length > 0) {
        const kalemler: FaturaKalemi[] = irsaliye.kalemler.map((kalem: any) => ({
          stokId: kalem.stokId,
          stok: kalem.stok ? {
            id: kalem.stok.id,
            stokKodu: kalem.stok.stokKodu,
            stokAdi: kalem.stok.stokAdi,
            satisFiyati: kalem.birimFiyat,
            kdvOrani: kalem.kdvOrani,
            miktar: 0,
          } : undefined,
          miktar: kalem.miktar,
          birimFiyat: kalem.birimFiyat,
          kdvOrani: kalem.kdvOrani,
          iskontoOran: 0,
          iskontoTutar: 0,
          cokluIskonto: false,
          iskontoFormula: '',
        }));

        setFormData(prev => ({
          ...prev,
          kalemler,
        }));
      }

      // Genel iskonto varsa set et
      if (irsaliye.iskonto && irsaliye.iskonto > 0) {
        const toplamKalemTutari = irsaliye.kalemler?.reduce((sum: number, kalem: any) => {
          return sum + (kalem.miktar * kalem.birimFiyat);
        }, 0) || 0;

        const genelIskontoOran = toplamKalemTutari > 0
          ? (irsaliye.iskonto / toplamKalemTutari) * 100
          : 0;

        setFormData(prev => ({
          ...prev,
          genelIskontoOran,
          genelIskontoTutar: irsaliye.iskonto,
        }));
      }

      // Fatura numarasını oluştur
      generateFaturaNo();

      showSnackbar('İrsaliye bilgileri yüklendi', 'success');
    } catch (error: any) {
      console.error('İrsaliye bilgileri yüklenirken hata:', error);
      showSnackbar(error.response?.data?.message || 'İrsaliye bilgileri yüklenirken hata oluştu', 'error');
      // Hata durumunda normal fatura numarası oluştur
      generateFaturaNo();
    } finally {
      setLoadingSiparis(false);
    }
  };

  const generateFaturaNo = async () => {
    try {
      // Önce şablondan numara çekmeyi dene
      const templateResponse = await axios.get('/code-template/next-code/INVOICE_SALES');
      if (templateResponse.data?.nextCode) {
        setFormData(prev => ({
          ...prev,
          faturaNo: templateResponse.data.nextCode,
        }));
        return;
      }
    } catch (templateError: any) {
      // Şablon yoksa veya hata varsa, eski yöntemi kullan
      console.warn('Şablon numarası alınamadı, manuel oluşturuluyor:', templateError.message);
    }

    // Fallback: Eski yöntem (şablon yoksa)
    try {
      const response = await axios.get('/fatura', {
        params: { faturaTipi: 'SATIS', page: 1, limit: 1 },
      });
      const faturalar = response.data?.data || [];
      const lastFaturaNo = faturalar[0]?.faturaNo;
      const lastNoRaw = typeof lastFaturaNo === 'string' ? (lastFaturaNo.split('-')[2] || '0') : '0';
      const lastNo = parseInt(lastNoRaw, 10);
      const seq = (isNaN(lastNo) ? 0 : lastNo) + 1;
      const newNo = String(seq).padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        faturaNo: `SF-${new Date().getFullYear()}-${newNo}`,
      }));
    } catch (error: any) {
      setFormData(prev => ({
        ...prev,
        faturaNo: `SF-${new Date().getFullYear()}-001`,
      }));
      console.error('Fatura numarası oluşturulurken hata:', error);
      showSnackbar('Fatura numarası oluşturulamadı, varsayılan atandı', 'info');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const calculateMultiDiscount = (baseAmount: number, formula: string): { finalAmount: number; totalDiscount: number; effectiveRate: number } => {
    // Formula: "10+5" veya "10+5+3"
    const discounts = formula.split('+').map(d => parseFloat(d.trim())).filter(d => !isNaN(d) && d > 0);

    if (discounts.length === 0) {
      return { finalAmount: baseAmount, totalDiscount: 0, effectiveRate: 0 };
    }

    let currentAmount = baseAmount;
    let totalDiscount = 0;

    for (const discount of discounts) {
      const discountAmount = (currentAmount * discount) / 100;
      currentAmount -= discountAmount;
      totalDiscount += discountAmount;
    }

    const effectiveRate = baseAmount > 0 ? (totalDiscount / baseAmount) * 100 : 0;

    return { finalAmount: currentAmount, totalDiscount, effectiveRate };
  };

  const handleAddKalem = () => {
    setFormData(prev => ({
      ...prev,
      kalemler: [...prev.kalemler, {
        stokId: '',
        miktar: 1,
        birimFiyat: 0,
        kdvOrani: 20,
        iskontoOran: 0,
        iskontoTutar: 0,
        cokluIskonto: false,
        iskontoFormula: '',
      }],
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
      const kalem = { ...newKalemler[index] };

      if (field === 'stokId') {
        const stok = stoklar.find(s => s.id === value);
        if (stok) {
          kalem.stokId = value;
          kalem.birimFiyat = stok.satisFiyati;
          kalem.kdvOrani = stok.kdvOrani;
        }
      } else if (field === 'cokluIskonto') {
        kalem.cokluIskonto = value;
        if (!value) {
          // Çoklu iskonto kapatıldı, normal hesaplamaya dön
          kalem.iskontoFormula = '';
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        } else {
          // Çoklu iskonto açıldı, mevcut oranı formula'ya çevir
          if (kalem.iskontoOran > 0) {
            kalem.iskontoFormula = kalem.iskontoOran.toString();
          }
        }
      } else if (field === 'iskontoFormula') {
        // Çoklu iskonto formülü değişti
        kalem.iskontoFormula = value;
        const araToplam = kalem.miktar * kalem.birimFiyat;
        const result = calculateMultiDiscount(araToplam, value);
        kalem.iskontoTutar = result.totalDiscount;
        kalem.iskontoOran = result.effectiveRate;
      } else if (field === 'iskontoOran') {
        if (kalem.cokluIskonto) {
          // Çoklu iskonto modunda oran alanı formül olarak kullanılır
          kalem.iskontoFormula = value;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          const result = calculateMultiDiscount(araToplam, value);
          kalem.iskontoTutar = result.totalDiscount;
          kalem.iskontoOran = result.effectiveRate;
        } else {
          // Normal mod: İskonto oranı değişti, tutarı hesapla
          kalem.iskontoOran = parseFloat(value) || 0;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        }
      } else if (field === 'iskontoTutar') {
        if (!kalem.cokluIskonto) {
          // İskonto tutarı değişti, oranı hesapla (sadece normal modda)
          kalem.iskontoTutar = parseFloat(value) || 0;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoOran = araToplam > 0 ? (kalem.iskontoTutar / araToplam) * 100 : 0;
        }
      } else if (field === 'miktar' || field === 'birimFiyat') {
        kalem[field] = parseFloat(value) || 0;
        // Miktar veya birim fiyat değişti, iskonto tutarını yeniden hesapla
        const araToplam = kalem.miktar * kalem.birimFiyat;
        if (kalem.cokluIskonto && kalem.iskontoFormula) {
          const result = calculateMultiDiscount(araToplam, kalem.iskontoFormula);
          kalem.iskontoTutar = result.totalDiscount;
          kalem.iskontoOran = result.effectiveRate;
        } else {
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        }
      } else {
        kalem[field] = value;
      }

      newKalemler[index] = kalem;
      return { ...prev, kalemler: newKalemler };
    });

  };

  const calculateKalemTutar = (kalem: FaturaKalemi) => {
    const araToplam = kalem.miktar * kalem.birimFiyat;
    const netTutar = araToplam - kalem.iskontoTutar;
    const kdv = (netTutar * kalem.kdvOrani) / 100;
    return netTutar + kdv;
  };

  const calculateTotals = () => {
    let araToplam = 0;
    let toplamKalemIskontosu = 0;
    let toplamKdv = 0;

    formData.kalemler.forEach(kalem => {
      const kalemAraToplam = kalem.miktar * kalem.birimFiyat;
      araToplam += kalemAraToplam;
      toplamKalemIskontosu += kalem.iskontoTutar;

      const netTutar = kalemAraToplam - kalem.iskontoTutar;
      const kdv = (netTutar * kalem.kdvOrani) / 100;
      toplamKdv += kdv;
    });

    const genelIskonto = formData.genelIskontoTutar || 0;
    const toplamIskonto = toplamKalemIskontosu + genelIskonto;
    const netToplam = araToplam - toplamKalemIskontosu - genelIskonto;
    const genelToplam = netToplam + toplamKdv;

    return { araToplam, toplamKalemIskontosu, genelIskonto, toplamIskonto, toplamKdv, netToplam, genelToplam };
  };

  const handleGenelIskontoOranChange = (value: string) => {
    const oran = parseFloat(value) || 0;
    const araToplam = formData.kalemler.reduce((sum, k) => sum + (k.miktar * k.birimFiyat - k.iskontoTutar), 0);
    const tutar = (araToplam * oran) / 100;
    setFormData(prev => ({ ...prev, genelIskontoOran: oran, genelIskontoTutar: tutar }));
  };

  const handleGenelIskontoTutarChange = (value: string) => {
    const tutar = parseFloat(value) || 0;
    const araToplam = formData.kalemler.reduce((sum, k) => sum + (k.miktar * k.birimFiyat - k.iskontoTutar), 0);
    const oran = araToplam > 0 ? (tutar / araToplam) * 100 : 0;
    setFormData(prev => ({ ...prev, genelIskontoOran: oran, genelIskontoTutar: tutar }));
  };

  const handleCurrencyChange = async (currency: 'TRY' | 'USD' | 'EUR' | 'GBP') => {
    if (currency === 'TRY') {
      setFormData(prev => ({ ...prev, dovizCinsi: currency, dovizKuru: 1 }));
      return;
    }

    try {
      setFormData(prev => ({ ...prev, dovizCinsi: currency }));
      // Fetch rate
      const response = await axios.get('/fatura/exchange-rate', {
        params: { currency }
      });

      if (response.data.rate) {
        setFormData(prev => ({ ...prev, dovizKuru: response.data.rate }));
      }
    } catch (error) {
      console.error('Kur alınamadı:', error);
      showSnackbar('Döviz kuru alınamadı, lütfen manuel giriniz.', 'info');
      setFormData(prev => ({ ...prev, dovizKuru: 0 }));
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.cariId) {
        showSnackbar('Cari seçimi zorunludur', 'error');
        return;
      }

      if (!formData.warehouseId) {
        showSnackbar('Ambar seçimi zorunludur. Lütfen bir ambar seçiniz.', 'error');
        return;
      }

      // Boş stok satırlarını filtrele (stokId boş olanları sil)
      const validKalemler = formData.kalemler.filter(k => k.stokId && k.stokId.trim() !== '');

      if (validKalemler.length === 0) {
        showSnackbar('En az bir kalem eklemelisiniz', 'error');
        return;
      }

      // Boş satır sayısı varsa kullanıcıyı bilgilendir
      const removedCount = formData.kalemler.length - validKalemler.length;
      if (removedCount > 0) {
        showSnackbar(`${removedCount} adet boş satır otomatik olarak kaldırıldı`, 'info');
      }

      setLoading(true);
      await axios.post('/fatura', {
        faturaNo: formData.faturaNo,
        faturaTipi: formData.faturaTipi,
        cariId: formData.cariId,
        tarih: new Date(formData.tarih).toISOString(),
        vade: formData.vade ? new Date(formData.vade).toISOString() : null,
        iskonto: Number(formData.genelIskontoTutar) || 0,
        aciklama: formData.aciklama || null,
        satisElemaniId: formData.satisElemaniId || null,
        durum: formData.durum,
        dovizCinsi: formData.dovizCinsi,
        dovizKuru: formData.dovizKuru,
        ...(siparisId && { siparisId }), // Sipariş ID'sini gönder (varsa)
        ...(irsaliyeId && { irsaliyeId }), // İrsaliye ID'sini gönder (varsa)
        warehouseId: formData.warehouseId || null,
        kalemler: validKalemler.map(k => ({
          stokId: k.stokId,
          miktar: Number(k.miktar),
          birimFiyat: Number(k.birimFiyat),
          kdvOrani: Number(k.kdvOrani),
          iskontoOrani: Number(k.iskontoOran) || 0,
          iskontoTutari: Number(k.iskontoTutar) || 0,
        })),
      });

      showSnackbar('Fatura başarıyla oluşturuldu', 'success');
      setTimeout(() => {
        router.push('/fatura/satis');
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'İşlem sırasında hata oluştu';

      // Check if this is a stock error (contains product details)
      if (errorMessage.includes('Yetersiz stok!') && errorMessage.includes('•')) {
        // Parse the error message to extract product details
        const lines = errorMessage.split('\n').filter(line => line.trim().startsWith('•'));
        const products = lines.map(line => {
          // Format: • PROD-001 - Ürün Adı: Mevcut stok 5, talep edilen 10
          const match = line.match(/•\s*(.+?)\s*-\s*(.+?):\s*Mevcut stok\s*(\d+),\s*talep edilen\s*(\d+)/);
          if (match) {
            return {
              stokKodu: match[1].trim(),
              stokAdi: match[2].trim(),
              mevcutStok: parseInt(match[3]),
              talep: parseInt(match[4]),
            };
          }
          return null;
        }).filter(p => p !== null) as Array<{
          stokKodu: string;
          stokAdi: string;
          mevcutStok: number;
          talep: number;
        }>;

        if (products.length > 0) {
          setStockErrorDialog({ open: true, products });
        } else {
          showSnackbar(errorMessage, 'error');
        }
      } else {
        showSnackbar(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const totals = calculateTotals();

  return (
    <MainLayout>
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 2,
          mb: 2
        }}>
          <IconButton
            onClick={() => router.push('/fatura/satis')}
            sx={{
              bgcolor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              '&:hover': { bgcolor: 'var(--secondary-hover)' },
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" sx={{
              color: 'var(--foreground)',
              letterSpacing: '-0.02em'
            }}>
              Yeni Satış Faturası
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
              {siparisId ? 'Siparişten fatura oluşturuluyor...' : 'Satış faturası oluşturun'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {loadingSiparis ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Sipariş bilgileri yükleniyor...
            </Typography>
          </Box>
        </Box>
      ) : (
        <Paper sx={{
          p: 3,
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)',
          bgcolor: 'var(--card)',
        }}>
          <Stack spacing={3}>
            {/* Fatura Bilgileri */}
            {siparisId && (
              <Box sx={{
                p: 2,
                bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                borderRadius: 'var(--radius)',
                border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
              }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--primary)',
                    fontWeight: 600,
                  }}
                >
                  ℹ️ Bu fatura sipariş bilgilerinden otomatik olarak doldurulmuştur.
                </Typography>
              </Box>
            )}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'var(--foreground)',
                  mb: 2,
                }}
              >
                Fatura Bilgileri
              </Typography>
              <Divider sx={{ mb: 2, borderColor: 'var(--border)' }} />
              {warehouses.length === 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Sistemde tanımlı ambar bulunmamaktadır. İşlem yapabilmek için lütfen önce ambar tanımlayınız.
                </Alert>
              )}
            </Box>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 2
            }}>
              <TextField
                className="form-control-textfield"
                label="Fatura No"
                value={formData.faturaNo}
                onChange={(e) => setFormData(prev => ({ ...prev, faturaNo: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                className="form-control-textfield"
                type="date"
                label="Tarih"
                value={formData.tarih}
                onChange={(e) => setFormData(prev => ({ ...prev, tarih: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
              <TextField
                className="form-control-textfield"
                type="date"
                label="Vade"
                value={formData.vade}
                onChange={(e) => setFormData(prev => ({ ...prev, vade: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <FormControl className="form-control-select" required fullWidth>
                <InputLabel>Ambar</InputLabel>
                <Select
                  value={formData.warehouseId}
                  onChange={(e) => setFormData(prev => ({ ...prev, warehouseId: e.target.value }))}
                  label="Ambar"
                >
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} {warehouse.isDefault && '(Varsayılan)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl className="form-control-select" required fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={formData.durum}
                  onChange={(e) => setFormData(prev => ({ ...prev, durum: e.target.value as 'ACIK' | 'ONAYLANDI' }))}
                  label="Durum"
                >
                  <MenuItem value="ACIK">Beklemede</MenuItem>
                  <MenuItem value="ONAYLANDI">Onaylandı</MenuItem>
                </Select>
              </FormControl>

              <FormControl className="form-control-select" required fullWidth>
                <InputLabel>Döviz</InputLabel>
                <Select
                  value={formData.dovizCinsi}
                  onChange={(e) => handleCurrencyChange(e.target.value as any)}
                  label="Döviz"
                >
                  <MenuItem value="TRY">Türk Lirası (₺)</MenuItem>
                  <MenuItem value="USD">Amerikan Doları ($)</MenuItem>
                  <MenuItem value="EUR">Euro (€)</MenuItem>
                  <MenuItem value="GBP">İngiliz Sterlini (£)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                className="form-control-textfield"
                type="number"
                label="Döviz Kuru"
                value={formData.dovizKuru}
                onChange={(e) => setFormData(prev => ({ ...prev, dovizKuru: parseFloat(e.target.value) || 0 }))}
                disabled={formData.dovizCinsi === 'TRY'}
                required
                fullWidth
                inputProps={{ step: "0.0001", min: "0" }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
              <Box sx={{ flex: isMobile ? '1 1 100%' : '2 1 400px' }}>
                <Autocomplete
                  fullWidth
                  value={cariler.find(c => c.id === formData.cariId) || null}
                  onChange={(_, newValue) => {
                    setFormData(prev => {
                      const updated = { ...prev, cariId: newValue?.id || '' };

                      // Carinin vadeSuresi varsa otomatik vade hesapla
                      if (newValue?.vadeSuresi && newValue.vadeSuresi > 0) {
                        const faturaDate = new Date(prev.tarih);
                        const vadeDate = new Date(faturaDate);
                        vadeDate.setDate(vadeDate.getDate() + newValue.vadeSuresi);
                        updated.vade = vadeDate.toISOString().split('T')[0];
                      }

                      // Carinin tanımlı satış elemanı varsa otomatik seç
                      if (newValue?.satisElemaniId) {
                        updated.satisElemaniId = newValue.satisElemaniId;
                      } else {
                        updated.satisElemaniId = '';
                      }

                      return updated;
                    });
                  }}
                  options={cariler}
                  getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box component="li" key={key} {...otherProps}>
                        <Box>
                          <Typography variant="body1" fontWeight="600" sx={{ color: 'var(--foreground)' }}>
                            {option.unvan}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                            {option.cariKodu} - {option.tip === 'MUSTERI' ? 'Müşteri' : 'Tedarikçi'}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      className="form-control-textfield"
                      label="Cari Seçiniz"
                      placeholder="Cari kodu veya ünvanı ile ara..."
                      required
                    />
                  )}
                  noOptionsText="Cari bulunamadı"
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Box>

              <Box sx={{ flex: isMobile ? '1 1 100%' : '1 1 200px' }}>
                <Autocomplete
                  fullWidth
                  value={satisElemanlari.find(s => s.id === formData.satisElemaniId) || null}
                  onChange={(_, newValue) => {
                    setFormData(prev => ({ ...prev, satisElemaniId: newValue?.id || '' }));
                  }}
                  options={satisElemanlari}
                  getOptionLabel={(option) => option.adSoyad}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      className="form-control-textfield"
                      label="Satış Elemanı"
                      placeholder="Satış Elemanı Seçiniz"
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={option.id} {...otherProps}>
                        <Typography variant="body2">{option.adSoyad}</Typography>
                      </li>
                    );
                  }}
                  noOptionsText="Satış elemanı bulunamadı"
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Box>
            </Box>

            {/* Kalemler */}
            <Box>
              <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: 2,
                mb: 2
              }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'var(--foreground)',
                  }}
                >
                  Fatura Kalemleri
                </Typography>
                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <Button
                    variant="outlined"
                    startIcon={<LocalShipping />}
                    onClick={() => fetchIrsaliyeler(formData.cariId)}
                    disabled={!formData.cariId || loadingIrsaliyeler}
                    fullWidth={isMobile}
                    sx={{
                      borderColor: 'var(--primary)',
                      color: 'var(--primary)',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'var(--primary)',
                        bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                      },
                    }}
                  >
                    İrsaliyeden Ekle
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LocalShipping />}
                    onClick={() => {
                      setSiparisSearch('');
                      fetchSiparisler();
                      setOpenSiparisDialog(true);
                    }}
                    disabled={loadingSiparisler}
                    fullWidth={isMobile}
                    sx={{
                      borderColor: 'var(--secondary)',
                      color: 'var(--secondary)',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'var(--secondary)',
                        bgcolor: 'color-mix(in srgb, var(--secondary) 10%, transparent)',
                      },
                    }}
                  >
                    SİPARİŞTEN EKLE
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddKalem}
                    fullWidth={isMobile}
                    sx={{
                      bgcolor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'var(--primary-hover)',
                        transform: 'translateY(-1px)',
                        boxShadow: 'var(--shadow-md)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    + Yeni Kalem Ekle
                  </Button>
                </Box>
              </Box>
              <Divider sx={{ mb: 2, borderColor: 'var(--border)' }} />

              {isMobile ? (
                <Box sx={{ mb: 3 }}>
                  {formData.kalemler.length === 0 ? (
                    <Paper
                      variant="outlined"
                      sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--muted)', borderRadius: 'var(--radius)' }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Henüz kalem eklenmedi.
                      </Typography>
                    </Paper>
                  ) : (
                    formData.kalemler.map((kalem, index) => (
                      <MobileItemCard
                        key={index}
                        index={index}
                        kalem={kalem}
                      />
                    ))
                  )}
                </Box>
              ) : (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    maxHeight: 400,
                    borderRadius: 'var(--radius)',
                    borderColor: 'var(--border)',
                    bgcolor: 'var(--card)',
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                        <TableCell width="25%" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>Stok</TableCell>
                        <TableCell width="8%" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>Miktar</TableCell>
                        <TableCell width="10%" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>Birim Fiyat</TableCell>
                        <TableCell width="8%" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>KDV %</TableCell>
                        <TableCell width="3%" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }} title="Çoklu İskonto">Ç.İ.</TableCell>
                        <TableCell width="10%" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>İsk. Oran %</TableCell>
                        <TableCell width="12%" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>İsk. Tutar</TableCell>
                        <TableCell width="12%" align="right" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>Toplam</TableCell>
                        <TableCell width="5%" align="center" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}>Sil</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.kalemler.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                              Henüz kalem eklenmedi. Yukarıdaki butonu kullanarak kalem ekleyin.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        formData.kalemler.map((kalem, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              bgcolor: 'var(--background)',
                              '&:hover': {
                                bgcolor: 'var(--muted) !important',
                              },
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            <TableCell>
                              <Autocomplete
                                size="small"
                                open={autocompleteOpenStates[index] || false}
                                onOpen={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: true }))}
                                onClose={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }))}
                                value={stoklar.find(s => s.id === kalem.stokId) || null}
                                onChange={(_, newValue) => {
                                  handleKalemChange(index, 'stokId', newValue?.id || '');
                                  setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }));
                                }}
                                options={stoklar}
                                getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                                filterOptions={(options, params) => {
                                  const { inputValue } = params;
                                  if (!inputValue) return options;

                                  const lowerInput = inputValue.toLowerCase();
                                  return options.filter(option =>
                                    option.stokKodu.toLowerCase().includes(lowerInput) ||
                                    option.stokAdi.toLowerCase().includes(lowerInput) ||
                                    (option.barkod && option.barkod.toLowerCase().includes(lowerInput))
                                  );
                                }}
                                renderOption={(props, option) => {
                                  const { key, ...otherProps } = props;
                                  let stockColor = 'var(--success)';
                                  if (option.miktar <= 0) stockColor = 'var(--destructive)';
                                  else if (option.miktar < 10) stockColor = 'var(--warning)';

                                  return (
                                    <Box component="li" key={key} {...otherProps}>
                                      <Box sx={{ width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <Typography variant="body2" fontWeight="600">
                                            {option.stokAdi}
                                          </Typography>
                                          <Chip
                                            label={`Stok: ${option.miktar}`}
                                            size="small"
                                            sx={{
                                              height: 20,
                                              fontSize: '0.7rem',
                                              bgcolor: `color-mix(in srgb, ${stockColor} 10%, transparent)`,
                                              color: stockColor,
                                              border: `1px solid ${stockColor}`,
                                            }}
                                          />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                          <Typography variant="caption" color="text.secondary">
                                            Kod: {option.stokKodu}
                                          </Typography>
                                          {option.barkod && (
                                            <Typography variant="caption" color="text.secondary">
                                              | Barkod: {option.barkod}
                                            </Typography>
                                          )}
                                        </Box>
                                      </Box>
                                    </Box>
                                  );
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    className="form-control-textfield"
                                    placeholder="Stok kodu, adı veya barkod ile ara..."
                                    onKeyDown={(e) => {
                                      // Dropdown açık değilse ve Enter tuşuna basıldıysa yeni kalem ekle
                                      if (e.key === 'Enter' && !(autocompleteOpenStates[index])) {
                                        e.preventDefault();
                                        handleAddKalem();
                                      }
                                    }}
                                  />
                                )}
                                noOptionsText="Stok bulunamadı"
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                className="form-control-textfield"
                                value={kalem.miktar}
                                onChange={(e) => handleKalemChange(index, 'miktar', e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddKalem();
                                  }
                                }}
                                inputProps={{ min: 1, step: 1 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                className="form-control-textfield"
                                value={kalem.birimFiyat}
                                onChange={(e) => handleKalemChange(index, 'birimFiyat', e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddKalem();
                                  }
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                className="form-control-textfield"
                                value={kalem.kdvOrani}
                                onChange={(e) => handleKalemChange(index, 'kdvOrani', e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddKalem();
                                  }
                                }}
                                inputProps={{ min: 0, max: 100 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => handleKalemChange(index, 'cokluIskonto', !kalem.cokluIskonto)}
                                title={kalem.cokluIskonto ? 'Çoklu İskonto: Açık (10+5 formatı)' : 'Çoklu İskonto: Kapalı (Tek oran)'}
                                sx={{
                                  color: kalem.cokluIskonto ? 'var(--chart-2)' : 'var(--muted-foreground)',
                                  '&:hover': {
                                    bgcolor: kalem.cokluIskonto
                                      ? 'color-mix(in srgb, var(--chart-2) 10%, transparent)'
                                      : 'var(--muted)',
                                  }
                                }}
                              >
                                {kalem.cokluIskonto ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              {kalem.cokluIskonto ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  className="form-control-textfield"
                                  value={kalem.iskontoFormula || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Sadece rakam ve + işaretine izin ver
                                    if (/^[\d+]*$/.test(value)) {
                                      handleKalemChange(index, 'iskontoFormula', value);
                                    }
                                  }}
                                  placeholder="10+5"
                                  helperText={kalem.iskontoOran > 0 ? `Efektif: %${kalem.iskontoOran.toFixed(2)}` : ''}
                                  sx={{
                                    '& .MuiInputBase-input': {
                                      fontFamily: 'monospace',
                                      fontWeight: 600,
                                      color: 'var(--chart-2)',
                                    },
                                    '& .MuiFormHelperText-root': {
                                      fontSize: '0.65rem',
                                      mt: 0.5,
                                    }
                                  }}
                                />
                              ) : (
                                <TextField
                                  fullWidth
                                  type="number"
                                  size="small"
                                  className="form-control-textfield"
                                  value={kalem.iskontoOran || ''}
                                  onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)}
                                  inputProps={{
                                    min: 0,
                                    max: 100,
                                    step: 0.01,
                                  }}
                                  sx={{
                                    '& input[type=number]': {
                                      MozAppearance: 'textfield',
                                    },
                                    '& input[type=number]::-webkit-outer-spin-button': {
                                      WebkitAppearance: 'none',
                                      margin: 0,
                                    },
                                    '& input[type=number]::-webkit-inner-spin-button': {
                                      WebkitAppearance: 'none',
                                      margin: 0,
                                    },
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                className="form-control-textfield"
                                value={kalem.iskontoTutar || ''}
                                onChange={(e) => handleKalemChange(index, 'iskontoTutar', e.target.value)}
                                disabled={kalem.cokluIskonto}
                                inputProps={{
                                  min: 0,
                                  step: 0.01,
                                }}
                                sx={{
                                  '& input[type=number]': {
                                    MozAppearance: 'textfield',
                                  },
                                  '& input[type=number]::-webkit-outer-spin-button': {
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                  '& input[type=number]::-webkit-inner-spin-button': {
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  color: 'var(--primary)',
                                }}
                              >
                                {formatCurrency(calculateKalemTutar(kalem))}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveKalem(index)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            {/* Genel İskonto */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <TextField
                type="number"
                label="Genel İskonto %"
                className="form-control-textfield"
                value={formData.genelIskontoOran || ''}
                onChange={(e) => handleGenelIskontoOranChange(e.target.value)}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                helperText="İskonto oranı"
                sx={{
                  width: { xs: '100%', sm: '200px' },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                  '& input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '& input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                }}
              />
              <TextField
                type="number"
                label="Genel İskonto (₺)"
                className="form-control-textfield"
                value={formData.genelIskontoTutar || ''}
                onChange={(e) => handleGenelIskontoTutarChange(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="İskonto tutarı"
                sx={{
                  width: { xs: '100%', sm: '200px' },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                  '& input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '& input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                }}
              />
            </Box>

            {/* Açıklama */}
            <Box>
              <TextField
                fullWidth
                multiline
                rows={2}
                className="form-control-textfield"
                label="Açıklama / Notlar"
                value={formData.aciklama}
                onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
              />
            </Box>

            {/* Toplam Bilgileri */}
            <Paper
              variant="outlined"
              sx={{
                p: isMobile ? 2 : 3,
                bgcolor: 'var(--card)',
                borderRadius: 'var(--radius)',
                borderColor: 'var(--border)',
                borderWidth: '1px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'var(--foreground)',
                  mb: isMobile ? 1 : 2,
                  letterSpacing: '-0.01em',
                }}
              >
                Fatura Özeti
              </Typography>
              <Divider sx={{ mb: isMobile ? 1.5 : 2, borderColor: 'var(--border)' }} />
              <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 4,
              }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1.5 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: 'var(--muted-foreground)' }}>Ara Toplam:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="600" sx={{ color: 'var(--foreground)' }}>{formatCurrency(totals.araToplam)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1.5 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: 'var(--muted-foreground)' }}>Kalem İndirimleri:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="600" sx={{ color: totals.toplamKalemIskontosu > 0 ? 'var(--destructive)' : 'var(--foreground)' }}>
                      {totals.toplamKalemIskontosu > 0 ? '- ' : ''}{formatCurrency(totals.toplamKalemIskontosu)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1.5 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: 'var(--muted-foreground)' }}>Genel İskonto:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="600" sx={{ color: totals.genelIskonto > 0 ? 'var(--destructive)' : 'var(--foreground)' }}>
                      {totals.genelIskonto > 0 ? '- ' : ''}{formatCurrency(totals.genelIskonto)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1.5 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="bold" sx={{ color: 'var(--foreground)' }}>Toplam İndirim:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="bold" sx={{ color: totals.toplamIskonto > 0 ? 'var(--destructive)' : 'var(--foreground)' }}>
                      {totals.toplamIskonto > 0 ? '- ' : ''}{formatCurrency(totals.toplamIskonto)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1.5 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: 'var(--muted-foreground)' }}>KDV Toplamı:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="600" sx={{ color: 'var(--foreground)' }}>{formatCurrency(totals.toplamKdv)}</Typography>
                  </Box>
                  <Divider sx={{ my: isMobile ? 1 : 2, borderColor: 'var(--border)' }} />
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    pt: 0.5,
                    pb: 0.5,
                  }}>
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      sx={{
                        fontWeight: 700,
                        color: 'var(--foreground)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Genel Toplam:
                    </Typography>
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      sx={{
                        fontWeight: 700,
                        color: 'var(--primary)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {formatCurrency(totals.genelToplam)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Action Buttons */}
            <Box>
              <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column-reverse' : 'row',
                gap: 2,
                justifyContent: 'flex-end'
              }}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth={isMobile}
                  onClick={() => router.push('/fatura/satis')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                    '&:hover': {
                      borderColor: 'var(--primary)',
                      bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    },
                  }}
                >
                  İptal
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth={isMobile}
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    bgcolor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: isMobile ? '100%' : 150,
                    boxShadow: 'var(--shadow-sm)',
                    '&:hover': {
                      bgcolor: 'var(--primary-hover)',
                      boxShadow: 'var(--shadow-md)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {loading ? 'Kaydediliyor...' : 'Faturayı Kaydet'}
                </Button>
              </Box>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* İrsaliye Seçim Dialog */}
      <Dialog
        open={openIrsaliyeDialog}
        onClose={() => {
          setOpenIrsaliyeDialog(false);
          setSelectedIrsaliyeler([]);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Faturalandırılmamış İrsaliyeleri Seçin</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Seçili cari hesaba ait faturalandırılmamış irsaliyelerden kalemleri faturaya ekleyebilirsiniz.
          </DialogContentText>
          {loadingIrsaliyeler ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : irsaliyeler.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              Bu cari hesaba ait faturalandırılmamış irsaliye bulunamadı.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ width: 50 }}></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>İrsaliye No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Detaylar (Kalan/Toplam)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Kalan Tutar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {irsaliyeler.map((irsaliye) => {
                    const totalQty = irsaliye.kalemler?.reduce((sum: number, k: any) => sum + k.miktar, 0) || 0;
                    const invoicedQty = irsaliye.kalemler?.reduce((sum: number, k: any) => sum + (k.faturalananMiktar || 0), 0) || 0;
                    const remainingQty = totalQty - invoicedQty;

                    // Simple remaining total calculation (approximation for UI)
                    const remainingTotal = Number(irsaliye.genelToplam) * (totalQty > 0 ? remainingQty / totalQty : 0);

                    return (
                      <TableRow
                        key={irsaliye.id}
                        hover
                        onClick={() => {
                          setSelectedIrsaliyeler(prev =>
                            prev.includes(irsaliye.id)
                              ? prev.filter(id => id !== irsaliye.id)
                              : [...prev, irsaliye.id]
                          );
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedIrsaliyeler.includes(irsaliye.id)}
                            stepId={1157}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedIrsaliyeler(prev =>
                                prev.includes(irsaliye.id)
                                  ? prev.filter(id => id !== irsaliye.id)
                                  : [...prev, irsaliye.id]
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">
                            {irsaliye.irsaliyeNo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(irsaliye.irsaliyeTarihi).toLocaleDateString('tr-TR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip
                              size="small"
                              label={`${remainingQty} / ${totalQty} Br.`}
                              color={remainingQty === totalQty ? "primary" : "warning"}
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="500">
                            {formatCurrency(remainingTotal)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenIrsaliyeDialog(false);
              setSelectedIrsaliyeler([]);
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleIrsaliyelerdenEkle}
            variant="contained"
            disabled={selectedIrsaliyeler.length === 0 || loadingIrsaliyeler}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            }}
          >
            {loadingIrsaliyeler ? 'Ekleniyor...' : `Seçilenleri Ekle (${selectedIrsaliyeler.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Siparişten Ekle Dialog */}
      <Dialog
        open={openSiparisDialog}
        onClose={() => {
          setOpenSiparisDialog(false);
          setSelectedSiparisler([]);
        }}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Siparişten Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Arama (Sipariş No, Cari Unvan)"
              value={siparisSearch}
              onChange={(e) => setSiparisSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchSiparisler();
                }
              }}
              placeholder="Ara..."
            />
          </Box>

          {loadingSiparisler ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : siparisler.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                {siparisSearch ? 'Arama kriterlerine uygun sipariş bulunamadı' : 'Sevk edilmiş ve irsaliyesi oluşturulmamış sipariş bulunamadı'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedSiparisler.length > 0 && selectedSiparisler.length < siparisler.length}
                        checked={siparisler.length > 0 && selectedSiparisler.length === siparisler.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSiparisler(siparisler.map(s => s.id));
                          } else {
                            setSelectedSiparisler([]);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>Sipariş No</TableCell>
                    <TableCell>Cari</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Kalem Sayısı</TableCell>
                    <TableCell>Tutar</TableCell>
                    <TableCell>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {siparisler.map((siparis) => (
                    <TableRow
                      key={siparis.id}
                      hover
                      onClick={() => {
                        setSelectedSiparisler(prev =>
                          prev.includes(siparis.id)
                            ? prev.filter(id => id !== siparis.id)
                            : [...prev, siparis.id]
                        );
                      }}
                      selected={selectedSiparisler.includes(siparis.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedSiparisler.includes(siparis.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedSiparisler(prev =>
                              prev.includes(siparis.id)
                                ? prev.filter(id => id !== siparis.id)
                                : [...prev, siparis.id]
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {siparis.siparisNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {siparis.cari?.unvan}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(siparis.tarih).toLocaleDateString('tr-TR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {siparis.kalemler?.length || 0} kalem
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="500">
                          {formatCurrency(siparis.genelToplam)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={siparis.durum}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenSiparisDialog(false);
              setSelectedSiparisler([]);
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleSiparislerdenEkle}
            variant="contained"
            disabled={selectedSiparisler.length === 0 || loadingSiparisler}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            }}
          >
            {loadingSiparisler ? 'Ekleniyor...' : `Seçilenleri Ekle (${selectedSiparisler.length})`}
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

      {/* Stock Error Dialog */}
      <Dialog
        open={stockErrorDialog.open}
        onClose={() => setStockErrorDialog({ open: false, products: [] })}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ fontSize: 24 }}>⚠️</Box>
          Yetersiz Stok Uyarısı
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Aşağıdaki ürünler için depoda yeterli stok bulunmamaktadır:
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Stok Kodu</strong></TableCell>
                  <TableCell><strong>Ürün Adı</strong></TableCell>
                  <TableCell align="right"><strong>Mevcut Stok</strong></TableCell>
                  <TableCell align="right"><strong>Talep Edilen</strong></TableCell>
                  <TableCell align="right"><strong>Eksik</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockErrorDialog.products.map((product, index) => (
                  <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' } }}>
                    <TableCell>{product.stokKodu}</TableCell>
                    <TableCell>{product.stokAdi}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={product.mevcutStok}
                        size="small"
                        color={product.mevcutStok === 0 ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="right">{product.talep}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={product.talep - product.mevcutStok}
                        size="small"
                        color="error"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setStockErrorDialog({ open: false, products: [] })}
            variant="contained"
            color="primary"
          >
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export default function YeniSatisFaturasiPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    }>
      <YeniSatisFaturasiPageContent />
    </Suspense>
  );
}

