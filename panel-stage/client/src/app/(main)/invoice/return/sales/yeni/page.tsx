'use client';

import React, { Suspense, useState, useEffect } from 'react';
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
  InputAdornment,
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
  Popover,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Delete, Save, ArrowBack, ToggleOn, ToggleOff, Add as AddIcon,
  LocalShipping, AccountBalanceWallet, QrCodeScanner,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';

const TEVKIFAT_KODLARI = [
  { kod: '601', ad: 'Yapım İşleri (2/10)', oran: 0.2 },
  { kod: '602', ad: 'Etüt, Plan-Proje (9/10)', oran: 0.9 },
  { kod: '603', ad: 'Makine Bakım Onarım (7/10)', oran: 0.7 },
  { kod: '604', ad: 'Yemek Servis (5/10)', oran: 0.5 },
  { kod: '605', ad: 'Danışmanlık (9/10)', oran: 0.9 },
  { kod: '606', ad: 'Temizlik Hizmetleri (7/10)', oran: 0.7 },
  { kod: '607', ad: 'Güvenlik Hizmetleri (7/10)', oran: 0.7 },
  { kod: '608', ad: 'Taşımacılık Hizmetleri (2/10)', oran: 0.2 },
  { kod: '609', ad: 'İşgücü Temini (9/10)', oran: 0.9 },
  { kod: '610', ad: 'Yapı Denetim (9/10)', oran: 0.9 },
  { kod: '611', ad: 'Fason Tekstil (5/10)', oran: 0.5 },
  { kod: '612', ad: 'Turistik Mağazalar (5/10)', oran: 0.5 },
  { kod: '624', ad: 'Ticari Reklam Hizmetleri (3/10)', oran: 0.3 },
];

// Number input spinner gizleme stili
const numberInputSx = {
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
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`fatura-tabpanel-${index}`}
      aria-labelledby={`fatura-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

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
  barkod?: string;
  miktar?: number;
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
  birim?: string;
}

interface OdemePlaniItem {
  vade: string;
  tutar: number;
  odemeTipi: string;
  aciklama: string;
  odendi: boolean;
}

interface SatisElemani {
  id: string;
  adSoyad: string;
}

function YeniSatisIadeFaturasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const originalId = searchParams.get('originalId');
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [satisElemanlari, setSatisElemanlari] = useState<SatisElemani[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    faturaNo: '',
    faturaTipi: 'SATIS_IADE' as const,
    cariId: '',
    warehouseId: '',
    tarih: new Date().toISOString().split('T')[0],
    vade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    durum: 'APPROVED' as 'OPEN' | 'APPROVED',
    genelIskontoOran: 0,
    genelIskontoTutar: 0,
    aciklama: '',
    satisElemaniId: '',
    kalemler: [] as FaturaKalemi[],
    odemePlani: [] as OdemePlaniItem[],
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [autocompleteOpenStates, setAutocompleteOpenStates] = useState<Record<number, boolean>>({});
  const [calculatorAnchor, setCalculatorAnchor] = useState<HTMLElement | null>(null);
  const [calculatorRowIndex, setCalculatorRowIndex] = useState<number | null>(null);
  const [calculatorExpression, setCalculatorExpression] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [openIrsaliyeDialog, setOpenIrsaliyeDialog] = useState(false);
  const [irsaliyeler, setIrsaliyeler] = useState<any[]>([]);
  const [selectedIrsaliyeler, setSelectedIrsaliyeler] = useState<string[]>([]);
  const [loadingIrsaliyeler, setLoadingIrsaliyeler] = useState(false);
  const [openOdemePlaniDialog, setOpenOdemePlaniDialog] = useState(false);
  const [taksitSayisi, setTaksitSayisi] = useState(1);
  const [barcode, setBarcode] = useState('');
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

  // Mobilecard component
  const MobileItemCard = ({ kalem, index }: { kalem: FaturaKalemi, index: number }) => (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        position: 'relative',
        bgcolor: 'var(--card)',
      }}
    >
      {/* Satır Toplamı - En üstte belirgin */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1.5,
        pb: 1,
        borderBottom: '1px solid var(--border)',
      }}>
        <Typography variant="caption" color="var(--muted-foreground)">Satır Toplamı:</Typography>
        <Typography variant="subtitle1" fontWeight="700" color="var(--primary)">
          {formatCurrency(calculateKalemTutar(kalem))}
        </Typography>
      </Box>

      {/* Checkbox ve Stok Seçimi */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Autocomplete
            size="small"
            open={autocompleteOpenStates[index] || false}
            onOpen={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: true }))}
            onClose={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }))}
            slotProps={{
              popper: {
                sx: {
                  '& .MuiAutocomplete-paper': {
                    minWidth: 'min(560px, 92vw)',
                  },
                  '& .MuiAutocomplete-listbox': {
                    minWidth: 'min(560px, 92vw)',
                  },
                },
              },
            }}
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
              if (option.miktar !== undefined) {
                if (option.miktar <= 0) stockColor = 'var(--destructive)';
                else if (option.miktar < 10) stockColor = 'var(--warning)';
              }

              return (
                <Box component="li" key={key} {...otherProps}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="600">
                        {option.stokAdi}
                      </Typography>
                      {option.miktar !== undefined && (
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
                      )}
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
                label="Stok / Hizmet"
                placeholder="Kod veya ad ile ara"
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
          <Checkbox
            checked={selectedRows.includes(index)}
            onChange={() => handleToggleRow(index)}
            size="small"
            sx={{ ml: 0.5, mt: 0.5 }}
          />
          <IconButton
            size="small"
            color="error"
            onClick={() => handleRemoveKalem(index)}
            sx={{ ml: 0.5 }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Miktar ve Birim Fiyat - Daha büyük touch target */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
        <TextField
          label="Miktar"
          type="number"
          size="small"
          value={kalem.miktar}
          onChange={(e) => handleKalemChange(index, 'miktar', e.target.value)}
          inputProps={{ min: 1, style: { height: 44 } }}
          sx={numberInputSx}
        />
        <Box sx={{ position: 'relative' }}>
          <TextField
            label="Birim Fiyat"
            type="number"
            size="small"
            value={kalem.birimFiyat}
            onChange={(e) => handleKalemChange(index, 'birimFiyat', e.target.value)}
            onKeyDown={(e) => {
              if (['+', '-', '*', '/'].includes(e.key)) {
                e.preventDefault();
                setCalculatorRowIndex(index);
                setCalculatorExpression(kalem.birimFiyat?.toString() || '0');
                setCalculatorAnchor(e.currentTarget);
              }
            }}
            inputProps={{ min: 0, step: 0.01, style: { height: 44 } }}
            sx={numberInputSx}
          />
          <IconButton
            size="small"
            onClick={(e) => {
              setCalculatorRowIndex(index);
              setCalculatorExpression(kalem.birimFiyat?.toString() || '0');
              setCalculatorAnchor(e.currentTarget);
            }}
            sx={{
              position: 'absolute',
              right: 4,
              top: 4,
              width: 36,
              height: 36,
              bgcolor: 'var(--muted)',
              '&:hover': { bgcolor: 'var(--primary)' }
            }}
          >
            🧮
          </IconButton>
        </Box>
      </Box>

      {/* KDV ve Birim */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
        <TextField
          label="KDV %"
          type="number"
          size="small"
          value={kalem.kdvOrani}
          onChange={(e) => handleKalemChange(index, 'kdvOrani', e.target.value)}
          inputProps={{ style: { height: 44 } }}
          sx={numberInputSx}
        />
        <TextField
          label="Birim"
          size="small"
          value={kalem.birim || 'ADET'}
          onChange={(e) => handleKalemChange(index, 'birim', e.target.value)}
          inputProps={{ style: { height: 44 } }}
        />
      </Box>

      {/* Çoklu İskonto Toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, p: 1, bgcolor: 'var(--muted)', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">Çoklu İskonto</Typography>
        <IconButton
          size="small"
          onClick={() => handleKalemChange(index, 'cokluIskonto', !kalem.cokluIskonto)}
          sx={{ color: kalem.cokluIskonto ? 'var(--primary)' : 'var(--muted-foreground)' }}
        >
          {kalem.cokluIskonto ? <ToggleOn /> : <ToggleOff />}
        </IconButton>
      </Box>

      {/* İskonto Alanları */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        {kalem.cokluIskonto ? (
          <TextField
            label="İskonto Oranı (10+5)"
            size="small"
            value={kalem.iskontoFormula || ''}
            onChange={(e) => /^[\d+]*$/.test(e.target.value) && handleKalemChange(index, 'iskontoFormula', e.target.value)}
            helperText={kalem.iskontoOran > 0 ? `Eff: %${kalem.iskontoOran.toFixed(2)}` : ''}
            inputProps={{ style: { height: 44 } }}
          />
        ) : (
          <TextField
            label="İskonto Oranı %"
            type="number"
            size="small"
            value={kalem.iskontoOran || ''}
            onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)}
            inputProps={{ style: { height: 44 } }}
            sx={numberInputSx}
          />
        )}
        <TextField
          label="İskonto Tutarı"
          type="number"
          size="small"
          value={kalem.iskontoTutar || ''}
          onChange={(e) => handleKalemChange(index, 'iskontoTutar', e.target.value)}
          disabled={kalem.cokluIskonto}
          inputProps={{ style: { height: 44 } }}
          sx={numberInputSx}
        />
      </Box>
    </Paper>
  );

  useEffect(() => {
    fetchCariler();
    fetchStoklar();
    fetchSatisElemanlari();
    fetchWarehouses();
    generateFaturaNo();

    // Orijinal faturadan iade oluşturma
    if (originalId) {
      loadOriginalFatura(originalId);
    }
  }, [originalId]);

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

  const fetchSatisElemanlari = async () => {
    try {
      const response = await axios.get('/sales-agent');
      setSatisElemanlari(response.data || []);
    } catch (error) {
      console.error('Satış elemanları yüklenirken hata:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/warehouses?active=true');
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
        setFormData(prev => ({ ...prev, warehouseId: warehouseList[0].id }));
      }
    } catch (error) {
      console.error('Ambar listesi alınamadı:', error);
      showSnackbar('Ambar listesi alınamadı', 'error');
    }
  };

  const generateFaturaNo = async () => {
    try {
      const response = await axios.get('/invoices', {
        params: { faturaTipi: 'SATIS_IADE', page: 1, limit: 1 },
      });
      const faturalar = response.data?.data || [];
      const lastFaturaNo = faturalar[0]?.faturaNo;
      const lastNoRaw = typeof lastFaturaNo === 'string' ? (lastFaturaNo.split('-')[2] || '0') : '0';
      const lastNo = parseInt(lastNoRaw, 10);
      const seq = (isNaN(lastNo) ? 0 : lastNo) + 1;
      const newNo = String(seq).padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        faturaNo: `SIF-${new Date().getFullYear()}-${newNo}`,
      }));
    } catch (error: any) {
      setFormData(prev => ({
        ...prev,
        faturaNo: `SIF-${new Date().getFullYear()}-001`,
      }));
      console.error('Fatura numarası oluşturulurken hata:', error);
      showSnackbar('Fatura numarası oluşturulamadı, varsayılan atandı', 'info');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadOriginalFatura = async (faturaId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/fatura/${faturaId}`);
      const originalFatura = response.data;

      // Orijinal fatura bilgilerini form'a yükle
      setFormData(prev => ({
        ...prev,
        cariId: originalFatura.cariId,
        tarih: new Date().toISOString().split('T')[0], // İade tarihi bugün
        vade: originalFatura.vade ? new Date(originalFatura.vade).toISOString().split('T')[0] : prev.vade,
        genelIskontoOran: 0,
        genelIskontoTutar: originalFatura.iskonto || 0,
        aciklama: `${originalFatura.faturaNo} nolu faturanın iadesi`,
        kalemler: originalFatura.kalemler.map((k: any) => ({
          stokId: k.stokId,
          miktar: k.miktar,
          birimFiyat: k.birimFiyat,
          kdvOrani: k.kdvOrani,
          iskontoOran: 0,
          iskontoTutar: 0,
          cokluIskonto: false,
          iskontoFormula: '',
        })),
      }));

      showSnackbar(`${originalFatura.faturaNo} nolu fatura bilgileri yüklendi`, 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Orijinal fatura yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateMultiDiscount = (baseAmount: number, formula: string): { finalAmount: number; totalDiscount: number; effectiveRate: number } => {
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
        birim: 'ADET',
      }],
    }));
  };

  const handleTaksitHesapla = () => {
    const totals = calculateTotals();
    const toplam = totals.genelToplam;
    if (toplam <= 0 || taksitSayisi <= 0) return;

    const taksitTutari = Math.floor((toplam / taksitSayisi) * 100) / 100;
    const fark = Math.round((toplam - (taksitTutari * taksitSayisi)) * 100) / 100;

    const yeniPlan: OdemePlaniItem[] = [];
    let currentVade = new Date(formData.tarih);

    for (let i = 0; i < taksitSayisi; i++) {
      currentVade = new Date(currentVade);
      currentVade.setMonth(currentVade.getMonth() + 1);

      yeniPlan.push({
        vade: currentVade.toISOString().split('T')[0],
        tutar: i === taksitSayisi - 1 ? taksitTutari + fark : taksitTutari,
        odemeTipi: 'KREDI_KARTI',
        aciklama: `${i + 1}. Taksit`,
        odendi: false,
      });
    }

    setFormData(prev => ({ ...prev, odemePlani: yeniPlan }));
  };

  const handleBarcodeSubmit = (barkod: string) => {
    if (!barkod) return;
    const stok = stoklar.find(s => (s.barkod || '') === barkod.trim());
    if (stok) {
      const existingIndex = formData.kalemler.findIndex(k => k.stokId === stok.id);
      if (existingIndex > -1) {
        const newKalemler = [...formData.kalemler];
        newKalemler[existingIndex].miktar += 1;
        setFormData(prev => ({ ...prev, kalemler: newKalemler }));
      } else {
        setFormData(prev => ({
          ...prev,
          kalemler: [...prev.kalemler, {
            stokId: stok.id,
            stok: stok,
            miktar: 1,
            birimFiyat: Number(stok.satisFiyati) || 0,
            kdvOrani: stok.kdvOrani || 20,
            iskontoOran: 0,
            iskontoTutar: 0,
            birim: 'ADET',
          }]
        }));
      }
      setBarcode('');
      showSnackbar(`${stok.stokAdi} eklendi`, 'success');
    } else {
      showSnackbar('Barkod bulunamadı', 'error');
    }
  };

  const handleToggleRow = (index: number) => {
    setSelectedRows(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleToggleAll = () => {
    if (selectedRows.length === formData.kalemler.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(formData.kalemler.map((_, i) => i));
    }
  };

  const handleBulkDelete = () => {
    const newKalemler = formData.kalemler.filter((_, i) => !selectedRows.includes(i));
    setFormData(prev => ({ ...prev, kalemler: newKalemler }));
    setSelectedRows([]);
    showSnackbar('Seçilen kalemler silindi', 'info');
  };

  const fetchIrsaliyeler = async (cariId: string) => {
    if (!cariId) {
      showSnackbar('Lütfen önce bir cari seçiniz', 'error');
      return;
    }
    try {
      setLoadingIrsaliyeler(true);
      setOpenIrsaliyeDialog(true);
      const response = await axios.get('/delivery-notes', {
        params: {
          cariId,
          faturaId: null,
          limit: 100,
        },
      });
      setIrsaliyeler(response.data.data || []);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İrsaliyeler yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingIrsaliyeler(false);
    }
  };

  const handleIrsaliyeleriEkle = () => {
    if (selectedIrsaliyeler.length === 0) {
      showSnackbar('Lütfen en az bir irsaliye seçiniz', 'error');
      return;
    }

    const secilenIrsaliyeler = irsaliyeler.filter((i: any) => selectedIrsaliyeler.includes(i.id));
    const yeniKalemler: FaturaKalemi[] = [];

    secilenIrsaliyeler.forEach((irsaliye: any) => {
      irsaliye.kalemler?.forEach((kalem: any) => {
        const mevcutKalem = formData.kalemler.find(k => k.stokId === kalem.stokId);
        if (mevcutKalem) {
          mevcutKalem.miktar += kalem.miktar;
        } else {
          yeniKalemler.push({
            stokId: kalem.stokId,
            stok: kalem.stok,
            miktar: kalem.miktar,
            birimFiyat: kalem.birimFiyat,
            kdvOrani: kalem.kdvOrani,
            iskontoOran: 0,
            iskontoTutar: 0,
            birim: kalem.birim || 'ADET',
          });
        }
      });
    });

    setFormData(prev => ({
      ...prev,
      kalemler: [...prev.kalemler, ...yeniKalemler],
    }));

    setOpenIrsaliyeDialog(false);
    setSelectedIrsaliyeler([]);
    showSnackbar(`${selectedIrsaliyeler.length} irsaliyedeki kalemler eklendi`, 'success');
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
          kalem.birim = stok.birim || 'ADET';
        }
      } else if (field === 'cokluIskonto') {
        kalem.cokluIskonto = value;
        if (!value) {
          kalem.iskontoFormula = '';
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        } else {
          if (kalem.iskontoOran > 0) {
            kalem.iskontoFormula = kalem.iskontoOran.toString();
          }
        }
      } else if (field === 'iskontoFormula') {
        kalem.iskontoFormula = value;
        const araToplam = kalem.miktar * kalem.birimFiyat;
        const result = calculateMultiDiscount(araToplam, value);
        kalem.iskontoTutar = result.totalDiscount;
        kalem.iskontoOran = result.effectiveRate;
      } else if (field === 'iskontoOran') {
        if (kalem.cokluIskonto) {
          kalem.iskontoFormula = value;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          const result = calculateMultiDiscount(araToplam, value);
          kalem.iskontoTutar = result.totalDiscount;
          kalem.iskontoOran = result.effectiveRate;
        } else {
          kalem.iskontoOran = parseFloat(value) || 0;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        }
      } else if (field === 'iskontoTutar') {
        if (!kalem.cokluIskonto) {
          kalem.iskontoTutar = parseFloat(value) || 0;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoOran = araToplam > 0 ? (kalem.iskontoTutar / araToplam) * 100 : 0;
        }
      } else if (field === 'miktar' || field === 'birimFiyat') {
        kalem[field] = parseFloat(value) || 0;
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
      const response = await axios.post('/invoices', {
        faturaNo: formData.faturaNo,
        faturaTipi: formData.faturaTipi,
        cariId: formData.cariId,
        tarih: new Date(formData.tarih).toISOString(),
        vade: formData.vade ? new Date(formData.vade).toISOString() : null,
        iskonto: Number(formData.genelIskontoTutar) || 0,
        aciklama: formData.aciklama || null,
        satisElemaniId: formData.satisElemaniId || null,
        durum: formData.durum,
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

      // Fatura ID'sini al
      const faturaId = response.data.id || response.data.fatura?.id;

      // Eğer ödeme planı varsa kaydet
      if (faturaId && formData.odemePlani.length > 0) {
        await axios.post(`/invoices/${faturaId}/payment-plan`, formData.odemePlani);
      }

      showSnackbar('İade faturası başarıyla oluşturuldu', 'success');
      setTimeout(() => {
        router.push('/invoices/iade/satis');
      }, 1500);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
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
            onClick={() => router.push('/invoices/iade/satis')}
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
              Yeni Satış İade Faturası
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
              Satış iade faturası oluşturun
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', bgcolor: 'var(--card)' }}>
        <Stack spacing={3}>
          {/* Fatura Bilgileri */}
          {warehouses.length === 0 && (
            <Alert severity="error">
              Sistemde tanımlı ambar bulunmamaktadır. İşlem yapabilmek için lütfen önce ambar tanımlayınız.
            </Alert>
          )}

          {/* Tab Interface - Desktop only */}
          {!isMobile && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }
                }}
              >
                <Tab label="Genel Bilgiler" />
              </Tabs>
            </Box>
          )}

          {/* Mobilde: Tüm alanlar tek kolonda */}
          {isMobile ? (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'var(--foreground)' }}>Genel Bilgiler</Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
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
              </Box>

              <Box sx={{ mt: 2 }}>
                <Autocomplete
                  fullWidth
                  value={cariler.find(c => c.id === formData.cariId) || null}
                  onChange={async (_, newValue) => {
                    const cariId = newValue?.id || '';
                    setFormData(prev => ({ ...prev, cariId }));
                    if (cariId) {
                      try {
                        const response = await axios.get(`/account/${cariId}`);
                        if (response.data?.satisElemaniId) {
                          setFormData(prev => ({ ...prev, satisElemaniId: response.data.satisElemaniId }));
                        }
                      } catch (error) {
                        console.error('Cari detayları yüklenirken hata:', error);
                      }
                    }
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

              <Box sx={{ mt: 2 }}>
                <FormControl className="form-control-select" fullWidth>
                  <InputLabel>Satış Elemanı</InputLabel>
                  <Select
                    value={formData.satisElemaniId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, satisElemaniId: e.target.value }))}
                    label="Satış Elemanı"
                  >
                    <MenuItem value=""><em>Seçiniz</em></MenuItem>
                    {satisElemanlari.map((se) => (
                      <MenuItem key={se.id} value={se.id}>
                        {se.adSoyad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          ) : (
            /* Desktop: TabPanel */
            <TabPanel value={tabValue} index={0}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                <Box sx={{ flex: '2 1 400px' }}>
                  <Autocomplete
                    fullWidth
                    value={cariler.find(c => c.id === formData.cariId) || null}
                    onChange={async (_, newValue) => {
                      const cariId = newValue?.id || '';
                      setFormData(prev => ({ ...prev, cariId }));
                      if (cariId) {
                        try {
                          const response = await axios.get(`/account/${cariId}`);
                          if (response.data?.satisElemaniId) {
                            setFormData(prev => ({ ...prev, satisElemaniId: response.data.satisElemaniId }));
                          }
                        } catch (error) {
                          console.error('Cari detayları yüklenirken hata:', error);
                        }
                      }
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

                <Box sx={{ flex: '1 1 200px' }}>
                  <FormControl className="form-control-select" fullWidth>
                    <InputLabel>Satış Elemanı</InputLabel>
                    <Select
                      value={formData.satisElemaniId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, satisElemaniId: e.target.value }))}
                      label="Satış Elemanı"
                    >
                      <MenuItem value=""><em>Seçiniz</em></MenuItem>
                      {satisElemanlari.map((se) => (
                        <MenuItem key={se.id} value={se.id}>
                          {se.adSoyad}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </TabPanel>
          )}

          {/* Kalemler */}
          <Box>
            <Box sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: 2,
              mb: 2
            }}>
              <Typography variant="h6" fontWeight="bold">Fatura Kalemleri</Typography>
              <Box sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'center',
                flexWrap: 'wrap',
                width: isMobile ? '100%' : 'auto'
              }}>
                <TextField
                  size="small"
                  label="Barkod Okut"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleBarcodeSubmit(barcode);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeScanner sx={{ color: 'var(--muted-foreground)' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ width: isMobile ? '100%' : 220 }}
                  placeholder="Barkodu okutun..."
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AccountBalanceWallet />}
                  onClick={() => setOpenOdemePlaniDialog(true)}
                  fullWidth={isMobile}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    height: 40,
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  Ödeme Planı {formData.odemePlani.length > 0 && `(${formData.odemePlani.length})`}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LocalShipping />}
                  onClick={() => fetchIrsaliyeler(formData.cariId)}
                  disabled={!formData.cariId}
                  fullWidth={isMobile}
                  sx={{
                    height: 40,
                    textTransform: 'none',
                    borderColor: 'var(--primary)',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'var(--primary)',
                      bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    },
                  }}
                >
                  İRSALİYEDEN GETİR
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAddKalem}
                  startIcon={<AddIcon />}
                  size="small"
                  fullWidth={isMobile}
                  sx={{
                    height: 40,
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
                  Satır Ekle
                </Button>
                {selectedRows.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    fullWidth={isMobile}
                    onClick={handleBulkDelete}
                    startIcon={<Delete />}
                    sx={{ height: 40, textTransform: 'none', fontWeight: 600 }}
                  >
                    Seçilenleri Sil ({selectedRows.length})
                  </Button>
                )}
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
                  overflowX: 'auto',
                }}
              >
                <Table stickyHeader size="small" sx={{ minWidth: 1300, tableLayout: 'auto' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                      <TableCell padding="checkbox" sx={{ width: 50 }}>
                        <Checkbox
                          indeterminate={selectedRows.length > 0 && selectedRows.length < formData.kalemler.length}
                          checked={formData.kalemler.length > 0 && selectedRows.length === formData.kalemler.length}
                          onChange={handleToggleAll}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'var(--muted-foreground)', minWidth: 305 }}>Stok Adı / Ürün</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 5 }}>Miktar</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 120 }}>Birim</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 80 }}>Birim Fiyat</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 90 }}>KDV %</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 60 }} title="Çoklu İskonto">Ç.İ.</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 10 }}>İsk. Oran %</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 140 }}>İsk. Tutar</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 140 }}>Toplam</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.kalemler.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                            Henüz kalem eklenmedi. Yukarıdaki butonu kullanarak kalem ekleyin.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.kalemler.map((kalem, index) => (
                        <TableRow
                          key={index}
                          hover
                          selected={selectedRows.includes(index)}
                          sx={{
                            bgcolor: 'var(--background)',
                            '&:hover': {
                              bgcolor: 'var(--muted) !important',
                            },
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedRows.includes(index)}
                              onChange={() => handleToggleRow(index)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Autocomplete
                              size="small"
                              open={autocompleteOpenStates[index] || false}
                              onOpen={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: true }))}
                              onClose={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }))}
                              slotProps={{
                                popper: {
                                  sx: {
                                    '& .MuiAutocomplete-paper': {
                                      minWidth: 'min(560px, 92vw)',
                                    },
                                    '& .MuiAutocomplete-listbox': {
                                      minWidth: 'min(560px, 92vw)',
                                    },
                                  },
                                },
                              }}
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
                          <TableCell sx={{ minWidth: 120 }}>
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
                              sx={numberInputSx}
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 120 }}>
                            <TextField
                              fullWidth
                              size="small"
                              className="form-control-textfield"
                              value={kalem.birim || 'ADET'}
                              onChange={(e) => handleKalemChange(index, 'birim', e.target.value)}
                              placeholder="Birim"
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 250 }}>
                            <Box sx={{ position: 'relative' }}>
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
                                  } else if (['+', '-', '*', '/'].includes(e.key)) {
                                    e.preventDefault();
                                    setCalculatorRowIndex(index);
                                    setCalculatorExpression(kalem.birimFiyat?.toString() || '0');
                                    setCalculatorAnchor(e.currentTarget);
                                  }
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                                sx={numberInputSx}
                              />
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setCalculatorRowIndex(index);
                                  setCalculatorExpression(kalem.birimFiyat?.toString() || '0');
                                  setCalculatorAnchor(e.currentTarget);
                                }}
                                sx={{
                                  position: 'absolute',
                                  right: 4,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  padding: 2,
                                  bgcolor: 'var(--muted)',
                                  '&:hover': { bgcolor: 'var(--primary)' }
                                }}
                              >
                                🧮
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ minWidth: 90 }}>
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
                              inputProps={{ min: 0, max: 100, step: 1 }}
                              sx={numberInputSx}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ minWidth: 60 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleKalemChange(index, 'cokluIskonto', !kalem.cokluIskonto)}
                              title={kalem.cokluIskonto ? 'Çoklu İskonto: Açık (10+5 formatı)' : 'Çoklu İskonto: Kapalı (Tek oran)'}
                              sx={{
                                color: kalem.cokluIskonto ? 'var(--chart-2)' : 'var(--muted-foreground)',
                                '&:hover': {
                                  bgcolor: kalem.cokluIskonto ? 'color-mix(in srgb, var(--chart-2) 15%, transparent)' : 'var(--muted)',
                                }
                              }}
                            >
                              {kalem.cokluIskonto ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
                            </IconButton>
                          </TableCell>
                          <TableCell sx={{ minWidth: 100 }}>
                            {kalem.cokluIskonto ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={kalem.iskontoFormula || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^[\d+]*$/.test(value)) {
                                    handleKalemChange(index, 'iskontoFormula', value);
                                  }
                                }}
                                placeholder="10+5"
                                helperText={kalem.iskontoOran > 0 ? `Eff: %${kalem.iskontoOran.toFixed(2)}` : ''}
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
                                value={kalem.iskontoOran || ''}
                                onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)}
                                inputProps={{
                                  min: 0,
                                  max: 100,
                                  step: 0.01,
                                }}
                                sx={numberInputSx}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ minWidth: 140 }}>
                            <TextField
                              fullWidth
                              type="number"
                              size="small"
                              value={kalem.iskontoTutar || ''}
                              onChange={(e) => handleKalemChange(index, 'iskontoTutar', e.target.value)}
                              disabled={kalem.cokluIskonto}
                              inputProps={{
                                min: 0,
                                step: 0.01,
                              }}
                              sx={numberInputSx}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ minWidth: 140 }}>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {formatCurrency(calculateKalemTutar(kalem))}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Calculator Popover */}
          <Popover
            open={calculatorAnchor !== null}
            anchorEl={calculatorAnchor}
            onClose={() => {
              setCalculatorAnchor(null);
              setCalculatorRowIndex(null);
              setCalculatorExpression('');
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Box sx={{ p: 2, minWidth: 280 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Hesap Makinesi
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={calculatorExpression}
                onChange={(e) => setCalculatorExpression(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    try {
                      const result = Function('"use strict"; return (' + calculatorExpression + ')')();
                      if (typeof result === 'number' && !isNaN(result)) {
                        handleKalemChange(calculatorRowIndex!, 'birimFiyat', result.toString());
                        setCalculatorAnchor(null);
                        setCalculatorExpression('');
                      }
                    } catch (error) {
                      console.error('Invalid expression:', error);
                    }
                  } else if (e.key === 'Escape') {
                    setCalculatorAnchor(null);
                    setCalculatorExpression('');
                  }
                }}
                placeholder="Örn: 100+20 veya 50*1.18"
                autoFocus
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                Operatörler: + - * / | Enter: Hesapla | Esc: İptal
              </Typography>
            </Box>
          </Popover>

          {/* Genel İskonto */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <TextField
              type="number"
              label="Genel İskonto %"
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

          {/* Açıklama ve Fatura Özeti - Yan Yana */}
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
            {/* Açıklama */}
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Açıklama / Notlar"
                value={formData.aciklama}
                onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
              />
            </Box>

            {/* Toplam Bilgileri */}
            <Paper variant="outlined" sx={{ flex: 1, p: isMobile ? 2 : 3, bgcolor: 'var(--card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'var(--foreground)' }}>
              Fatura Özeti
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 4 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="var(--muted-foreground)">Ara Toplam:</Typography>
                  <Typography variant="body2" fontWeight="600">{formatCurrency(totals.araToplam)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="var(--muted-foreground)">Kalem İndirimleri:</Typography>
                  <Typography variant="body2" fontWeight="600" color={totals.toplamKalemIskontosu > 0 ? "error.main" : "inherit"}>
                    {totals.toplamKalemIskontosu > 0 ? '- ' : ''}{formatCurrency(totals.toplamKalemIskontosu)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="var(--muted-foreground)">Genel İskonto:</Typography>
                  <Typography variant="body2" fontWeight="600" color={totals.genelIskonto > 0 ? "error.main" : "inherit"}>
                    {totals.genelIskonto > 0 ? '- ' : ''}{formatCurrency(totals.genelIskonto)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="var(--muted-foreground)" fontWeight="bold">Toplam İndirim:</Typography>
                  <Typography variant="body2" fontWeight="bold" color={totals.toplamIskonto > 0 ? "error.main" : "inherit"}>
                    {totals.toplamIskonto > 0 ? '- ' : ''}{formatCurrency(totals.toplamIskonto)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="var(--muted-foreground)">KDV Toplamı:</Typography>
                  <Typography variant="body2" fontWeight="600">{formatCurrency(totals.toplamKdv)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="800">Genel Toplam:</Typography>
                  <Typography
                    variant="h6"
                    fontWeight="900"
                    sx={{
                      color: 'var(--primary)',
                    }}
                  >
                    {formatCurrency(totals.genelToplam)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
          </Box>

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
                onClick={() => router.push('/invoices/iade/satis')}
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

      {/* İrsaliye Seçim Dialogu */}
      <Dialog
        open={openIrsaliyeDialog}
        onClose={() => {
          setOpenIrsaliyeDialog(false);
          setSelectedIrsaliyeler([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>İrsaliye Seçin</DialogTitle>
        <DialogContent>
          {loadingIrsaliyeler ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : irsaliyeler.length === 0 ? (
            <Typography variant="body2" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              Seçilebilir irsaliye bulunamadı.
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {isMobile ? (
                <Stack spacing={2}>
                  {irsaliyeler.map((irsaliye: any) => (
                    <Paper
                      key={irsaliye.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: selectedIrsaliyeler.includes(irsaliye.id) ? 'var(--primary)' : 'var(--card)',
                        color: selectedIrsaliyeler.includes(irsaliye.id) ? 'var(--primary-foreground)' : 'var(--foreground)',
                      }}
                      onClick={() => {
                        setSelectedIrsaliyeler(prev =>
                          prev.includes(irsaliye.id)
                            ? prev.filter(id => id !== irsaliye.id)
                            : [...prev, irsaliye.id]
                        );
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {irsaliye.irsaliyeNo || irsaliye.deliveryNoteNo}
                      </Typography>
                      <Typography variant="caption">
                        {new Date(irsaliye.tarih).toLocaleDateString('tr-TR')} - {irsaliye.kalemSayisi || 0} kalem
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedIrsaliyeler.length > 0 && selectedIrsaliyeler.length < irsaliyeler.length}
                            checked={irsaliyeler.length > 0 && selectedIrsaliyeler.length === irsaliyeler.length}
                            onChange={() => {
                              if (selectedIrsaliyeler.length === irsaliyeler.length) {
                                setSelectedIrsaliyeler([]);
                              } else {
                                setSelectedIrsaliyeler(irsaliyeler.map((i: any) => i.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>İrsaliye No</TableCell>
                        <TableCell>Tarih</TableCell>
                        <TableCell>Kalem Sayısı</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {irsaliyeler.map((irsaliye: any) => (
                        <TableRow
                          key={irsaliye.id}
                          hover
                          selected={selectedIrsaliyeler.includes(irsaliye.id)}
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
                            <Checkbox checked={selectedIrsaliyeler.includes(irsaliye.id)} />
                          </TableCell>
                          <TableCell>{irsaliye.irsaliyeNo || irsaliye.deliveryNoteNo}</TableCell>
                          <TableCell>{new Date(irsaliye.tarih).toLocaleDateString('tr-TR')}</TableCell>
                          <TableCell>{irsaliye.kalemSayisi || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIrsaliyeDialog(false)}>İptal</Button>
          <Button
            onClick={handleIrsaliyeleriEkle}
            variant="contained"
            disabled={selectedIrsaliyeler.length === 0}
          >
            Ekle ({selectedIrsaliyeler.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ödeme Planı Dialogu */}
      <Dialog
        open={openOdemePlaniDialog}
        onClose={() => setOpenOdemePlaniDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ödeme Planı</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label="Taksit Sayısı"
              type="number"
              size="small"
              value={taksitSayisi}
              onChange={(e) => setTaksitSayisi(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: 36 }}
              sx={{ width: 120 }}
            />
            <Button
              variant="outlined"
              onClick={handleTaksitHesapla}
              disabled={formData.kalemler.length === 0}
            >
              Hesapla
            </Button>
          </Box>

          {formData.odemePlani.length === 0 ? (
            <Typography variant="body2" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              Ödeme planı oluşturmak için taksit sayısı girin ve "Hesapla" butonuna tıklayın.
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {isMobile ? (
                <Stack spacing={2}>
                  {formData.odemePlani.map((odeme, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {odeme.aciklama}
                      </Typography>
                      <Typography variant="body2">
                        Vade: {new Date(odeme.vade).toLocaleDateString('tr-TR')}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        Tutar: {formatCurrency(odeme.tutar)}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Taksit</TableCell>
                        <TableCell>Vade Tarihi</TableCell>
                        <TableCell>Tutar</TableCell>
                        <TableCell>Ödeme Tipi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.odemePlani.map((odeme, index) => (
                        <TableRow key={index}>
                          <TableCell>{odeme.aciklama}</TableCell>
                          <TableCell>{new Date(odeme.vade).toLocaleDateString('tr-TR')}</TableCell>
                          <TableCell>{formatCurrency(odeme.tutar)}</TableCell>
                          <TableCell>{odeme.odemeTipi}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOdemePlaniDialog(false)}>Kapat</Button>
          <Button
            onClick={() => {
              setFormData(prev => ({ ...prev, odemePlani: [] }));
              setOpenOdemePlaniDialog(false);
            }}
            color="error"
            disabled={formData.odemePlani.length === 0}
          >
            Planı Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stok Hatası Dialogu */}
      <Dialog
        open={stockErrorDialog.open}
        onClose={() => setStockErrorDialog({ open: false, products: [] })}
      >
        <DialogTitle>⚠️ Yetersiz Stok Uyarısı</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Aşağıdaki ürünlerin stoğu yetersiz:
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Stok Kodu</TableCell>
                  <TableCell>Ürün Adı</TableCell>
                  <TableCell>Mevcut</TableCell>
                  <TableCell>Talep</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockErrorDialog.products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.stokKodu}</TableCell>
                    <TableCell>{product.stokAdi}</TableCell>
                    <TableCell>{product.mevcutStok}</TableCell>
                    <TableCell>{product.talep}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockErrorDialog({ open: false, products: [] })}>Kapat</Button>
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
    </MainLayout>
  );
}

export default function YeniSatisIadeFaturasiPage() {
  return (
    <Suspense
      fallback={(
        <MainLayout>
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </MainLayout>
      )}
    >
      <YeniSatisIadeFaturasiContent />
    </Suspense>
  );
}

