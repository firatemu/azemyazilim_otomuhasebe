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
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Popover,
} from '@mui/material';
import {
  Delete, Save, ArrowBack, ToggleOn, ToggleOff, LocalShipping, Description,
  AccountBalanceWallet,
  QrCodeScanner,
  Add,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTabStore } from '@/stores/tabStore';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
  vadeSuresi?: number;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  birim: string;
  satisFiyati: number;
  alisFiyati: number;
  kdvOrani: number;
  barkod?: string;
  miktar: number;
}

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
  tevkifatKodu?: string;
  tevkifatOran?: number;
  otvOran?: number;
  kdvIstisnaNedeni?: string;
  birim?: string;
  isSpecialPrice?: boolean;
}

interface OdemePlaniItem {
  vade: string;
  tutar: number;
  odemeTipi: string;
  aciklama: string;
  odendi: boolean;
}

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

type DurumType = 'OPEN' | 'APPROVED' | 'CANCELLED';

export function AlisFaturaForm({ faturaId: editFaturaId, onBack }: { faturaId?: string; onBack?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(editFaturaId);
  const irsaliyeId = isEdit ? null : searchParams.get('irsaliyeId');
  const kopyalaId = isEdit ? null : searchParams.get('kopyala');

  const [isMounted, setIsMounted] = useState(false);
  const { addTab, removeTab, setActiveTab } = useTabStore();

  useEffect(() => {
    setIsMounted(true);
    // Sayfa doğrudan açılırsa sekmeyi ekle
    if (!isEdit) {
      addTab({
        id: 'invoice-purchase-yeni',
        label: 'Yeni Satın Alma Faturası',
        path: '/invoice/purchase/yeni'
      });
      setActiveTab('invoice-purchase-yeni');
    }
  }, []);

  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingIrsaliye, setLoadingIrsaliye] = useState(false);
  const [loadingFatura, setLoadingFatura] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    faturaNo: '',
    faturaTipi: 'PURCHASE' as 'SALE' | 'PURCHASE',
    cariId: '',
    warehouseId: '',
    tarih: new Date().toISOString().split('T')[0], // Hydration stability - initialized
    vade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hydration stability - initialized
    durum: 'APPROVED' as DurumType,
    genelIskontoOran: 0,
    genelIskontoTutar: 0,
    aciklama: '',
    dovizCinsi: 'TRY' as 'TRY' | 'USD' | 'EUR' | 'GBP',
    dovizKuru: 1,
    kalemler: [] as FaturaKalemi[],
    // e-Dönüşüm alanları
    eScenario: 'TICARI_FATURA' as string,
    eInvoiceType: 'PURCHASE' as string,
    gibAlias: '',
    gonderimSekli: 'ELEKTRONIK' as string,
    odemePlani: [] as OdemePlaniItem[],
  });

  const [tabValue, setTabValue] = useState(0);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [autocompleteOpenStates, setAutocompleteOpenStates] = useState<Record<number, boolean>>({});
  const [openIrsaliyeDialog, setOpenIrsaliyeDialog] = useState(false);
  const [irsaliyeler, setIrsaliyeler] = useState<any[]>([]);
  const [selectedIrsaliyeler, setSelectedIrsaliyeler] = useState<string[]>([]);
  const [loadingIrsaliyeler, setLoadingIrsaliyeler] = useState(false);
  const [warehousesFetched, setWarehousesFetched] = useState(false);
  const [openOdemePlaniDialog, setOpenOdemePlaniDialog] = useState(false);
  const [taksitSayisi, setTaksitSayisi] = useState(1);
  const [barcode, setBarcode] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [stockErrorDialog, setStockErrorDialog] = useState<{
    open: boolean;
    products: Array<{
      stokKodu: string;
      stokAdi: string;
      mevcutStok: number;
      talep: number;
    }>;
  }>({ open: false, products: [] });

  // Calculator state
  const [calculatorAnchor, setCalculatorAnchor] = useState<HTMLElement | null>(null);
  const [calculatorRowIndex, setCalculatorRowIndex] = useState<number | null>(null);
  const [calculatorExpression, setCalculatorExpression] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Initialize dates after mount if not editing or loading from external source
  useEffect(() => {
    if (isMounted && !isEdit && !irsaliyeId && !kopyalaId && !formData.tarih) {
      setFormData(prev => ({
        ...prev,
        tarih: new Date().toISOString().split('T')[0],
        vade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));
    }
  }, [isMounted, isEdit, irsaliyeId, kopyalaId]);

  // Mobilecard component - Kompakt ve mobil dostu
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
        <FormControl fullWidth size="small">
          <InputLabel>Birim</InputLabel>
          <Select
            value={kalem.birim || ''}
            onChange={(e) => handleKalemChange(index, 'birim', e.target.value)}
            label="Birim"
            className="form-control-select"
          >
            <MenuItem value={kalem.birim || 'ADET'}>{kalem.birim || 'ADET'}</MenuItem>
          </Select>
        </FormControl>
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

      {/* ÖTV ve Tevkifat - Purchase invoice için ek alanlar */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <TextField
          label="ÖTV %"
          type="number"
          size="small"
          value={kalem.otvOran || 0}
          onChange={(e) => handleKalemChange(index, 'otvOran', e.target.value)}
          inputProps={{ style: { height: 44 } }}
          sx={numberInputSx}
        />
        <FormControl fullWidth size="small">
          <InputLabel>Tevkifat</InputLabel>
          <Select
            value={kalem.tevkifatKodu || ''}
            onChange={(e) => handleKalemChange(index, 'tevkifatKodu', e.target.value)}
            label="Tevkifat"
            className="form-control-select"
          >
            <MenuItem value="">Yok</MenuItem>
            {TEVKIFAT_KODLARI.map((t) => (
              <MenuItem key={t.kod} value={t.kod}>
                {t.kod} - {t.ad}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );

  const toNumEdit = (v: any): number => {
    if (v == null || v === '') return 0;
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'object' && v != null && typeof (v as any).toNumber === 'function') return (v as any).toNumber();
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  };

  const fetchFatura = async () => {
    if (!editFaturaId) return;
    try {
      setLoadingFatura(true);
      const response = await axios.get(`/invoices/${editFaturaId}`);
      const fatura = response.data;
      const durumValue = (fatura.durum || 'APPROVED') as DurumType;
      const warehouseId = fatura.warehouseId ?? fatura.irsaliye?.depoId ?? '';

      // Güvenli tarih dönüştürme fonksiyonu
      const safeDateToISO = (dateValue: any, fallbackDate: string): string => {
        if (!dateValue) return fallbackDate || new Date().toISOString().split('T')[0];
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? fallbackDate || new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
      };

      setFormData(prev => ({
        ...prev,
        faturaNo: fatura.faturaNo,
        faturaTipi: fatura.faturaTipi,
        cariId: fatura.cariId,
        warehouseId: String(warehouseId || ''),
        tarih: safeDateToISO(fatura.tarih, prev.tarih),
        vade: fatura.vade ? safeDateToISO(fatura.vade, prev.tarih) : '',
        durum: durumValue,
        genelIskontoOran: 0,
        genelIskontoTutar: toNumEdit(fatura.iskonto),
        aciklama: fatura.aciklama || '',
        dovizCinsi: (fatura.dovizCinsi || 'TRY') as 'TRY' | 'USD' | 'EUR' | 'GBP',
        dovizKuru: toNumEdit(fatura.dovizKuru),
        kalemler: (fatura.kalemler || []).map((k: any) => {
          const miktar = toNumEdit(k.miktar) || 1;
          const birimFiyat = toNumEdit(k.birimFiyat);
          const baseAmount = miktar * birimFiyat;
          const iskOran = toNumEdit(k.iskontoOrani);
          const v = k.kdvOrani ?? (k as any).kdv_orani;
          const kdvOrani = (v === 0 || v === '0' || (typeof v === 'number' && Number.isFinite(v) && v === 0))
            ? 0
            : (v !== undefined && v !== null && v !== '' ? (Number.isFinite(Number(v)) ? Number(v) : 0) : 0);
          return {
            stokId: k.stokId,
            stok: k.stok ? {
              id: k.stok.id,
              stokKodu: k.stok.stokKodu,
              stokAdi: k.stok.stokAdi,
              satisFiyati: toNumEdit(k.stok.satisFiyati),
              kdvOrani: toNumEdit(k.stok.kdvOrani),
              birim: k.stok.birim || 'ADET',
              alisFiyati: toNumEdit(k.stok.alisFiyati),
            } : undefined,
            miktar,
            birimFiyat,
            kdvOrani,
            iskontoOran: iskOran,
            iskontoTutar: toNumEdit(k.iskontoTutari) || (baseAmount * iskOran) / 100,
            cokluIskonto: Boolean(k.cokluIskonto),
            iskontoFormula: k.iskontoFormula ?? '',
            tevkifatKodu: k.tevkifatKodu || '',
            tevkifatOran: toNumEdit(k.tevkifatOrani),
            otvOran: toNumEdit(k.otvOrani),
            kdvIstisnaNedeni: k.kdvIstisnaNedeni || '',
            birim: k.birim || '',
          };
        }),
      }));
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Fatura yüklenirken hata oluştu', 'error');
      onBack?.();
    } finally {
      setLoadingFatura(false);
    }
  };

  useEffect(() => {
    fetchCariler();
    fetchStoklar();
    fetchWarehouses();

    if (isEdit && editFaturaId) {
      fetchFatura();
      return;
    }

    const copyId = kopyalaId;

    if (irsaliyeId) {
      fetchIrsaliyeBilgileri(irsaliyeId);
    } else if (copyId) {
      fetchFaturaKopyala(copyId);
    } else {
      generateFaturaNo();
    }
  }, [editFaturaId, isEdit]);

  const fetchCariler = async () => {
    try {
      const response = await axios.get('/account', {
        params: { limit: 1000 },
      });
      console.log('Cari response:', response.data);
      const mappedCariler = (response.data.data || []).map((c: any) => ({
        ...c,
        cariKodu: c.code,
        unvan: c.title,
        vadeSuresi: c.dueDays || c.paymentTermDays || 0,
      }));
      setCariler(mappedCariler);
    } catch (error) {
      console.error('Cariler yüklenirken hata:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/warehouses?active=true');
      const warehouseList = response.data || [];
      setWarehouses(warehouseList);
      setWarehousesFetched(true);

      if (warehouseList.length === 0) {
        showSnackbar('Sistemde tanımlı ambar bulunamadı! Lütfen önce bir ambar tanımlayın.', 'error');
        return;
      }

      const isCopyMode = kopyalaId;
      if (isCopyMode || isEdit) return;

      const defaultWarehouse = warehouseList.find((w: any) => w.isDefault);
      if (defaultWarehouse && !formData.warehouseId) {
        setFormData(prev => ({ ...prev, warehouseId: defaultWarehouse.id }));
      } else if (warehouseList.length === 1 && !formData.warehouseId) {
        setFormData(prev => ({ ...prev, warehouseId: warehouseList[0].id }));
      }
    } catch (error) {
      console.error('Ambar listesi alınamadı:', error);
      setWarehousesFetched(true);
      showSnackbar('Ambar listesi alınamadı', 'error');
    }
  };

  const fetchStoklar = async () => {
    try {
      const response = await axios.get('/products', {
        params: { limit: 2000 },
      });
      const mappedStoklar = (response.data.data || []).map((s: any) => ({
        ...s,
        stokKodu: s.code,
        stokAdi: s.name,
        barkod: s.barcode,
        miktar: s.quantity ?? 0,
        kdvOrani: s.vatRate || 20,
        birim: s.unit || 'ADET',
      }));
      setStoklar(mappedStoklar);
    } catch (error) {
      console.error('Stoklar yüklenirken hata:', error);
    }
  };

  const fetchIrsaliyeBilgileri = async (id: string) => {
    try {
      setLoadingIrsaliye(true);
      const response = await axios.get(`/purchase-waybills/${id}`);
      const irsaliye = response.data;

      console.log('İrsaliye bilgileri yüklendi:', irsaliye);

      if (irsaliye.cari) {
        setFormData(prev => ({
          ...prev,
          cariId: irsaliye.cari.id,
          tarih: new Date(irsaliye.irsaliyeTarihi).toISOString().split('T')[0],
          vade: irsaliye.cari.vadeSuresi && irsaliye.cari.vadeSuresi > 0
            ? new Date(Date.now() + irsaliye.cari.vadeSuresi * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          aciklama: irsaliye.aciklama || prev.aciklama,
        }));
      }

      if (irsaliye.kalemler && irsaliye.kalemler.length > 0) {
        const kalemler: FaturaKalemi[] = irsaliye.kalemler.map((kalem: any) => ({
          stokId: kalem.stokId,
          stok: kalem.stok ? {
            id: kalem.stok.id,
            stokKodu: kalem.stok.stokKodu,
            stokAdi: kalem.stok.stokAdi,
            satisFiyati: kalem.birimFiyat,
            alisFiyati: kalem.birimFiyat,
            kdvOrani: kalem.kdvOrani,
            birim: kalem.stok.birim || 'ADET',
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

      generateFaturaNo();
      showSnackbar('İrsaliye bilgileri yüklendi', 'success');
    } catch (error: any) {
      console.error('İrsaliye bilgileri yüklenirken hata:', error);
      showSnackbar(error.response?.data?.message || 'İrsaliye bilgileri yüklenirken hata oluştu', 'error');
      generateFaturaNo();
    } finally {
      setLoadingIrsaliye(false);
    }
  };

  const toNum = (v: any): number | undefined => {
    if (v == null || v === '') return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };

  const fetchFaturaKopyala = async (faturaId: string) => {
    try {
      setLoadingIrsaliye(true);
      const response = await axios.get(`/invoices/${faturaId}`);
      const fatura = response.data;

      const warehouseId = fatura.warehouseId ?? fatura.irsaliye?.depoId ?? '';

      const kalemler: FaturaKalemi[] = (fatura.kalemler || []).map((k: any) => {
        const miktar = toNum(k.miktar) ?? 1;
        const birimFiyat = toNum(k.birimFiyat) ?? 0;
        const baseAmount = miktar * birimFiyat;
        const iskOran = toNum(k.iskontoOrani) ?? 0;
        const v = k.kdvOrani;
        const n = v === undefined || v === null ? NaN : Number(v);
        const kdvOrani = Number.isFinite(n) && n >= 0 ? n : 0;
        return {
          stokId: k.stokId,
          stok: k.stok ? {
            id: k.stok.id,
            stokKodu: k.stok.stokKodu,
            stokAdi: k.stok.stokAdi,
            satisFiyati: toNum(k.stok.satisFiyati) ?? 0,
            kdvOrani: toNum(k.stok.kdvOrani) ?? 0,
            birim: k.stok.birim || 'ADET',
          } : undefined,
          miktar,
          birimFiyat,
          kdvOrani,
          iskontoOran: iskOran,
          iskontoTutar: toNum(k.iskontoTutari) ?? (baseAmount * iskOran) / 100,
          cokluIskonto: false,
          iskontoFormula: '',
        };
      });

      setFormData(prev => ({
        ...prev,
        cariId: fatura.cariId || '',
        warehouseId: String(warehouseId || prev.warehouseId),
        tarih: fatura.tarih ? new Date(fatura.tarih).toISOString().split('T')[0] : prev.tarih,
        vade: fatura.vade ? new Date(fatura.vade).toISOString().split('T')[0] : prev.vade,
        aciklama: fatura.aciklama || '',
        dovizCinsi: (fatura.dovizCinsi || 'TRY') as 'TRY' | 'USD' | 'EUR' | 'GBP',
        dovizKuru: toNum(fatura.dovizKuru) ?? 1,
        genelIskontoOran: 0,
        genelIskontoTutar: toNum(fatura.iskonto) ?? 0,
        kalemler,
      }));

      await generateFaturaNo();
      showSnackbar('Fatura kopyalandı. Yeni fatura numarası atandı.', 'success');
    } catch (error: any) {
      console.error('Fatura kopyalanırken hata:', error);
      showSnackbar(error.response?.data?.message || 'Fatura kopyalanırken hata oluştu', 'error');
      generateFaturaNo();
    } finally {
      setLoadingIrsaliye(false);
    }
  };

  const fetchIrsaliyeler = async (cariId: string) => {
    if (!cariId) {
      showSnackbar('Önce cari hesap seçmelisiniz', 'error');
      return;
    }

    try {
      setLoadingIrsaliyeler(true);
      const response = await axios.get('/purchase-waybills', {
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

  const handleIrsaliyelerdenEkle = async () => {
    if (selectedIrsaliyeler.length === 0) {
      showSnackbar('En az bir irsaliye seçmelisiniz', 'error');
      return;
    }

    try {
      setLoadingIrsaliyeler(true);
      const tumKalemler: FaturaKalemi[] = [];

      for (const irsaliyeId of selectedIrsaliyeler) {
        const response = await axios.get(`/purchase-waybills/${irsaliyeId}`);
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
                alisFiyati: kalem.birimFiyat,
                kdvOrani: kalem.kdvOrani,
                birim: kalem.stok.birim || 'ADET',
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

      setFormData(prev => {
        const yeniKalemler = [...prev.kalemler];

        tumKalemler.forEach(yeniKalem => {
          const mevcutIndex = yeniKalemler.findIndex(k => k.stokId === yeniKalem.stokId);
          if (mevcutIndex >= 0) {
            yeniKalemler[mevcutIndex].miktar += yeniKalem.miktar;
          } else {
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

  const generateFaturaNo = async () => {
    try {
      const templateResponse = await axios.get('/code-templates/preview-code/INVOICE_PURCHASE');
      if (templateResponse.data?.nextCode) {
        setFormData(prev => ({
          ...prev,
          faturaNo: templateResponse.data.nextCode,
        }));
        return;
      }
    } catch (templateError: any) {
      console.warn('Şablon numarası alınamadı, manuel oluşturuluyor:', templateError.message);
    }

    try {
      const response = await axios.get('/invoices', {
        params: { faturaTipi: 'PURCHASE', page: 1, limit: 1 },
      });
      const faturalar = response.data?.data || [];
      const lastFaturaNo = faturalar[0]?.faturaNo;
      const lastNoRaw = typeof lastFaturaNo === 'string' ? (lastFaturaNo.split('-')[2] || '0') : '0';
      const lastNo = parseInt(lastNoRaw, 10);
      const seq = (isNaN(lastNo) ? 0 : lastNo) + 1;
      const newNo = String(seq).padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        faturaNo: `AF-${new Date().getFullYear()}-${newNo}`,
      }));
    } catch (error: any) {
      setFormData(prev => ({
        ...prev,
        faturaNo: `AF-${new Date().getFullYear()}-001`,
      }));
      console.error('Fatura numarası oluşturulurken hata:', error);
      showSnackbar('Fatura numarası oluşturulamadı, varsayılan atandı', 'info');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
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
        birim: 'ADET',
      }],
    }));
  };

  const handleTaksitHesapla = () => {
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
        odemeTipi: 'HAVALE',
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
            birimFiyat: Number(stok.alisFiyati) || 0,
            kdvOrani: stok.kdvOrani || 20,
            iskontoOran: 0,
            iskontoTutar: 0,
            birim: stok.birim || 'ADET',
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
          kalem.birimFiyat = stok.alisFiyati || stok.satisFiyati;
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
      } else if (field === 'miktar' || field === 'birimFiyat' || field === 'otvOran' || field === 'tevkifatOran') {
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
        (kalem as any)[field] = value;
      }

      newKalemler[index] = kalem;
      return { ...prev, kalemler: newKalemler };
    });

  };

  const calculateKalemTutar = (kalem: FaturaKalemi) => {
    const araToplam = kalem.miktar * kalem.birimFiyat;
    const netTutar = araToplam - kalem.iskontoTutar;

    const otvOran = kalem.otvOran || 0;
    const kalemOtv = (netTutar * otvOran) / 100;

    const kdvMatrahi = netTutar + kalemOtv;
    const kdv = (kdvMatrahi * kalem.kdvOrani) / 100;

    const tevkifatOran = kalem.tevkifatOran || 0;
    const kalemTevkifat = kdv * tevkifatOran;

    return netTutar + kalemOtv + kdv - kalemTevkifat;
  };

  const calculateTotals = () => {
    let araToplam = 0;
    let toplamKalemIskontosu = 0;
    let toplamKdv = 0;
    let toplamOtv = 0;
    let toplamTevkifat = 0;

    formData.kalemler.forEach(kalem => {
      const kalemAraToplam = kalem.miktar * kalem.birimFiyat;
      araToplam += kalemAraToplam;
      toplamKalemIskontosu += kalem.iskontoTutar;

      const netTutar = kalemAraToplam - kalem.iskontoTutar;

      const otvOran = kalem.otvOran || 0;
      const kalemOtv = (netTutar * otvOran) / 100;
      toplamOtv += kalemOtv;

      const kdvMatrahi = netTutar + kalemOtv;
      const kdv = (kdvMatrahi * kalem.kdvOrani) / 100;
      toplamKdv += kdv;

      const tevkifatOran = kalem.tevkifatOran || 0;
      const kalemTevkifat = kdv * tevkifatOran;
      toplamTevkifat += kalemTevkifat;
    });

    const genelIskonto = formData.genelIskontoTutar || 0;
    const toplamIskonto = toplamKalemIskontosu + genelIskonto;
    const netToplam = araToplam - toplamKalemIskontosu - genelIskonto;
    const genelToplam = netToplam + toplamKdv + toplamOtv - toplamTevkifat;

    return {
      araToplam,
      toplamKalemIskontosu,
      genelIskonto,
      toplamIskonto,
      toplamKdv,
      toplamOtv,
      toplamTevkifat,
      netToplam,
      genelToplam
    };
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
      const response = await axios.get('/invoices/exchange-rate', {
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
      const validKalemler = formData.kalemler.filter(k => k.stokId && k.stokId.trim() !== '');
      if (validKalemler.length === 0) {
        showSnackbar('En az bir kalem eklemelisiniz', 'error');
        return;
      }

      const removedCount = formData.kalemler.length - validKalemler.length;
      if (removedCount > 0 && !isEdit) {
        showSnackbar(`${removedCount} adet boş satır otomatik olarak kaldırıldı`, 'info');
      }

      if (isEdit) {
        setSaving(true);
        const response = await axios.put(`/invoices/${editFaturaId}`, {
          invoiceNo: formData.faturaNo?.trim() || undefined,
          date: new Date(formData.tarih).toISOString(),
          dueDate: formData.vade ? new Date(formData.vade).toISOString() : null,
          discount: Number(formData.genelIskontoTutar) || 0,
          notes: formData.aciklama || null,
          warehouseId: formData.warehouseId || null,
          currency: formData.dovizCinsi,
          exchangeRate: formData.dovizKuru,
          items: validKalemler.map(k => ({
            productId: k.stokId,
            quantity: Number(k.miktar),
            unitPrice: Number(k.birimFiyat),
            vatRate: (Number(k.kdvOrani) === 0) ? 0 : Number(k.kdvOrani),
            discountRate: Number(k.iskontoOran) || 0,
            discountAmount: Number(k.iskontoTutar) || 0,
            withholdingCode: k.tevkifatKodu || null,
            withholdingRate: Number(k.tevkifatOran) || 0,
            sctRate: Number(k.otvOran) || 0,
            unit: k.birim || null,
          })),
        });

        const faturaId = response.data.id || response.data.fatura?.id;

        if (faturaId && formData.odemePlani.length > 0) {
          await axios.post(`/invoices/${faturaId}/payment-plan`, formData.odemePlani);
        }

        showSnackbar('Fatura başarıyla güncellendi', 'success');

        setTimeout(() => {
          removeTab(`invoice-purchase-edit-${editFaturaId}`);
          if (onBack) {
            onBack();
          } else {
            router.push('/invoice/purchase');
          }
        }, 1500);
        return;
      }

      setLoading(true);
      const response = await axios.post('/invoices', {
        invoiceNo: formData.faturaNo,
        type: formData.faturaTipi,
        accountId: formData.cariId,
        date: new Date(formData.tarih).toISOString(),
        dueDate: formData.vade ? new Date(formData.vade).toISOString() : null,
        discount: Number(formData.genelIskontoTutar) || 0,
        notes: formData.aciklama || null,
        status: formData.durum,
        currency: formData.dovizCinsi,
        exchangeRate: formData.dovizKuru,
        ...(irsaliyeId && { deliveryNoteId: irsaliyeId }),
        warehouseId: formData.warehouseId || null,
        eScenario: formData.eScenario || null,
        eInvoiceType: formData.eInvoiceType || null,
        gibAlias: formData.gibAlias || null,
        shippingType: formData.gonderimSekli || null,
        items: validKalemler.map(k => ({
          productId: k.stokId,
          quantity: Number(k.miktar),
          unitPrice: Number(k.birimFiyat),
          vatRate: Number(k.kdvOrani),
          discountRate: Number(k.iskontoOran) || 0,
          discountAmount: Number(k.iskontoTutar) || 0,
          withholdingCode: k.tevkifatKodu || null,
          withholdingRate: Number(k.tevkifatOran) || 0,
          sctRate: Number(k.otvOran) || 0,
          unit: k.birim || null,
        })),
      });

      const faturaId = response.data.id || response.data.fatura?.id;

      if (faturaId && formData.odemePlani.length > 0) {
        await axios.post(`/invoices/${faturaId}/payment-plan`, formData.odemePlani);
      }

      showSnackbar('Fatura başarıyla oluşturuldu', 'success');
      removeTab('invoice-purchase-yeni');
      addTab({ id: 'invoice-purchase', label: 'Satın Alma Faturaları', path: '/invoice/purchase' });
      setActiveTab('invoice-purchase');
      setTimeout(() => router.push('/invoice/purchase'), 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'İşlem sırasında hata oluştu';
      if (errorMessage.includes('Yetersiz stok!') && errorMessage.includes('•')) {
        const lines = errorMessage.split('\n').filter((l: string) => l.trim().startsWith('•'));
        const products = lines.map((line: string) => {
          const match = line.match(/•\s*(.+?)\s*-\s*(.+?):\s*Mevcut stok\s*(\d+),\s*talep edilen\s*(\d+)/);
          return match ? { stokKodu: match[1].trim(), stokAdi: match[2].trim(), mevcutStok: parseInt(match[3]), talep: parseInt(match[4]) } : null;
        }).filter((p: any) => p !== null);
        if (products.length > 0) setStockErrorDialog({ open: true, products });
        else showSnackbar(errorMessage, 'error');
      } else {
        showSnackbar(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: formData.dovizCinsi === 'TRY' ? 'TRY' : formData.dovizCinsi,
    }).format(amount);
  };

  const totals = calculateTotals();

  if (isEdit && loadingFatura) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} />
        <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>Fatura yükleniyor...</Typography>
      </Box>
    );
  }

  if (!isMounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} />
        <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 2,
          mb: 2
        }}>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" sx={{
              color: 'var(--foreground)',
              letterSpacing: '-0.02em'
            }}>
              {isEdit ? 'Satın Alma Faturası Düzenle' : 'Yeni Satın Alma Faturası'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
              {isEdit ? formData.faturaNo : 'Satın alma faturası oluşturun'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {!isEdit && loadingIrsaliye ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              İrsaliye bilgileri yükleniyor...
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
            {irsaliyeId && (
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
                  ℹ️ Bu fatura irsaliye bilgilerinden otomatik olarak doldurulmuştur.
                </Typography>
              </Box>
            )}
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
                <Tab label="e-Dönüşüm Ayarları" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
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
                        {warehouse.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl className="form-control-select" fullWidth>
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

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', mt: 2 }}>
                <Box sx={{ flex: isMobile ? '1 1 100%' : '2 1 400px' }}>
                  <Autocomplete
                    fullWidth
                    value={cariler.find(c => c.id === formData.cariId) || null}
                    onChange={(_, newValue) => {
                      setFormData(prev => {
                        const updated = { ...prev, cariId: newValue?.id || '' };

                        if (newValue?.vadeSuresi && newValue.vadeSuresi > 0) {
                          const faturaDate = new Date(prev.tarih);
                          const vadeDate = new Date(faturaDate);
                          vadeDate.setDate(vadeDate.getDate() + newValue.vadeSuresi);
                          updated.vade = vadeDate.toISOString().split('T')[0];
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
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2,
              }}>
                <FormControl className="form-control-select" fullWidth>
                  <InputLabel>Senaryo</InputLabel>
                  <Select
                    value={formData.eScenario}
                    onChange={(e) => setFormData(prev => ({ ...prev, eScenario: e.target.value }))}
                    label="Senaryo"
                  >
                    <MenuItem value="TICARI_FATURA">Ticari Fatura</MenuItem>
                    <MenuItem value="TEMEL_FATURA">Temel Fatura</MenuItem>
                    <MenuItem value="KAMU_FATURASI">Kamu Faturası</MenuItem>
                  </Select>
                </FormControl>

                <FormControl className="form-control-select" fullWidth>
                  <InputLabel>Fatura Türü</InputLabel>
                  <Select
                    value={formData.eInvoiceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, eInvoiceType: e.target.value }))}
                    label="Fatura Türü"
                  >
                    <MenuItem value="PURCHASE">Satın Alma</MenuItem>
                    <MenuItem value="IADE">İade</MenuItem>
                    <MenuItem value="TEVKIFAT">Tevkifat</MenuItem>
                    <MenuItem value="ISTISNA">İstisna</MenuItem>
                    <MenuItem value="OZEL_MATRAH">Özel Matrah</MenuItem>
                    <MenuItem value="IHRAC_KAYITLI">İhraç Kayıtlı</MenuItem>
                  </Select>
                </FormControl>

                <FormControl className="form-control-select" fullWidth>
                  <InputLabel>Gönderim Şekli</InputLabel>
                  <Select
                    value={formData.gonderimSekli}
                    onChange={(e) => setFormData(prev => ({ ...prev, gonderimSekli: e.target.value }))}
                    label="Gönderim Şekli"
                  >
                    <MenuItem value="ELEKTRONIK">Elektronik (e-Fatura)</MenuItem>
                    <MenuItem value="KAGIT">Kağıt (e-Arşiv)</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  className="form-control-textfield"
                  label="GIB Alias (e-Fatura Adresi)"
                  value={formData.gibAlias}
                  onChange={(e) => setFormData(prev => ({ ...prev, gibAlias: e.target.value }))}
                  placeholder="urn:mail:firmaalias@urn.ettn.tr"
                  helperText="Alıcının GIB sistemindeki e-fatura adresi"
                  fullWidth
                />
              </Box>
            </TabPanel>

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
                    startIcon={<Add />}
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
                  <Table stickyHeader size="small" sx={{ minWidth: 1600 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                        <TableCell padding="checkbox" sx={{ minWidth: 50 }}>
                          <Checkbox
                            indeterminate={selectedRows.length > 0 && selectedRows.length < formData.kalemler.length}
                            checked={formData.kalemler.length > 0 && selectedRows.length === formData.kalemler.length}
                            onChange={handleToggleAll}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'var(--muted-foreground)', minWidth: 280 }}>Stok Adı / Ürün</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 100 }}>Miktar</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 100 }}>Birim</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 130 }}>Birim Fiyat</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 90 }}>KDV %</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 60 }} title="Çoklu İskonto">Ç.İ.</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 130 }}>İsk. Oran %</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 140 }}>İsk. Tutar</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 140 }}>Toplam</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 100 }}>ÖTV %</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 200 }}>Tevkifat</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.kalemler.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
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
                            <TableCell sx={{ minWidth: 100 }}>
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
                            <TableCell sx={{ minWidth: 100 }}>
                              <TextField
                                fullWidth
                                size="small"
                                className="form-control-textfield"
                                value={kalem.birim || ''}
                                onChange={(e) => handleKalemChange(index, 'birim', e.target.value)}
                                placeholder="Birim"
                              />
                            </TableCell>
                            <TableCell sx={{ minWidth: 130 }}>
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
                                inputProps={{ min: 0, max: 100 }}
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
                                    bgcolor: kalem.cokluIskonto
                                      ? 'color-mix(in srgb, var(--chart-2) 10%, transparent)'
                                      : 'var(--muted)',
                                  }
                                }}
                              >
                                {kalem.cokluIskonto ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
                              </IconButton>
                            </TableCell>
                            <TableCell sx={{ minWidth: 130 }}>
                              {kalem.cokluIskonto ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  className="form-control-textfield"
                                  value={kalem.iskontoFormula || ''}
                                  onChange={(e) => handleKalemChange(index, 'iskontoFormula', e.target.value)}
                                  placeholder="10+5"
                                />
                              ) : (
                                <TextField
                                  fullWidth
                                  type="number"
                                  size="small"
                                  className="form-control-textfield"
                                  value={kalem.iskontoOran}
                                  onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)}
                                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                                />
                              )}
                            </TableCell>
                            <TableCell sx={{ minWidth: 140 }}>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                className="form-control-textfield"
                                value={kalem.iskontoTutar}
                                onChange={(e) => handleKalemChange(index, 'iskontoTutar', e.target.value)}
                                inputProps={{ min: 0, step: 0.01 }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 140, fontWeight: 700 }}>
                              {formatCurrency(calculateKalemTutar(kalem))}
                            </TableCell>
                            <TableCell sx={{ minWidth: 100 }}>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                className="form-control-textfield"
                                value={kalem.otvOran || 0}
                                onChange={(e) => handleKalemChange(index, 'otvOran', e.target.value)}
                                inputProps={{ min: 0, max: 100, step: 0.01 }}
                              />
                            </TableCell>
                            <TableCell sx={{ minWidth: 200 }}>
                              <FormControl fullWidth size="small">
                                <Select
                                  value={kalem.tevkifatKodu || ''}
                                  onChange={(e) => handleKalemChange(index, 'tevkifatKodu', e.target.value)}
                                  displayEmpty
                                  className="form-control-select"
                                >
                                  <MenuItem value="">Tevkifat Yok</MenuItem>
                                  {TEVKIFAT_KODLARI.map((t) => (
                                    <MenuItem key={t.kod} value={t.kod}>
                                      {t.kod} - {t.ad}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
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
              <Box sx={{ p: 2, width: 280 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  🧮 Hesap Makinesi
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={calculatorExpression}
                  onChange={(e) => setCalculatorExpression(e.target.value)}
                  placeholder="Örn: 100+10 veya 100*0.9"
                  sx={{ mb: 1 }}
                  helperText="Toplama (+), Çıkarma (-), Çarpma (*), Bölme (/)"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Sonuç: {
                    calculatorExpression ? (() => {
                      try {
                        const result = new Function('return ' + calculatorExpression)();
                        return typeof result === 'number' && !isNaN(result) ? result.toFixed(2) : 'Geçersiz';
                      } catch {
                        return 'Geçersiz';
                      }
                    })() : '...'
                  }
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setCalculatorExpression('');
                      setCalculatorAnchor(null);
                    }}
                    fullWidth
                  >
                    İptal
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      if (calculatorRowIndex !== null) {
                        try {
                          const result = new Function('return ' + calculatorExpression)();
                          if (typeof result === 'number' && !isNaN(result)) {
                            handleKalemChange(calculatorRowIndex, 'birimFiyat', result);
                            setCalculatorAnchor(null);
                            setCalculatorRowIndex(null);
                            setCalculatorExpression('');
                          }
                        } catch {
                          // Invalid expression
                        }
                      }
                    }}
                    fullWidth
                    disabled={!calculatorExpression || calculatorExpression === '0'}
                  >
                    Uygula
                  </Button>
                </Box>
              </Box>
            </Popover>

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


            {/* Açıklama ve Fatura Özeti - Yan Yana */}
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
              {/* Açıklama */}
              <Box sx={{ flex: 1 }}>
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
                  flex: 1,
                  p: isMobile ? 2 : 3,
                  bgcolor: 'var(--card)',
                  borderRadius: 'var(--radius)',
                  borderColor: 'var(--border)',
                  borderWidth: '1px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isMobile ? 1 : 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'var(--foreground)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Fatura Özeti
                </Typography>
              </Box>
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
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: 'var(--muted-foreground)' }}>ÖTV Toplamı:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="600" sx={{ color: 'var(--foreground)' }}>{formatCurrency(totals.toplamOtv)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1.5 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: 'var(--muted-foreground)' }}>KDV Toplamı:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="600" sx={{ color: 'var(--foreground)' }}>{formatCurrency(totals.toplamKdv)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1.5 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: 'var(--muted-foreground)' }}>Tevkifat Toplamı:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="600" sx={{ color: totals.toplamTevkifat > 0 ? 'var(--destructive)' : 'var(--foreground)' }}>
                      {totals.toplamTevkifat > 0 ? '- ' : ''}{formatCurrency(totals.toplamTevkifat)}
                    </Typography>
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
            </Box>

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
                  onClick={() => { if (isEdit && onBack) onBack(); else router.push('/invoice/purchase'); }}
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
                  disabled={loading || saving}
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
                  {(loading || saving) ? 'Kaydediliyor...' : (isEdit ? 'Değişiklikleri Kaydet' : 'Faturayı Kaydet')}
                </Button>
              </Box>
            </Box>
          </Stack>
        </Paper>
      )}

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
        <DialogTitle component="div">Faturalandırılmamış İrsaliyeleri Seçin</DialogTitle>
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

      <Dialog
        open={stockErrorDialog.open}
        onClose={() => setStockErrorDialog({ open: false, products: [] })}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle component="div" sx={{ bgcolor: 'error.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
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

      <Dialog
        open={openOdemePlaniDialog}
        onClose={() => setOpenOdemePlaniDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ödeme Planı / Taksitlendirme</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              type="number"
              label="Taksit Sayısı"
              value={taksitSayisi}
              onChange={(e) => setTaksitSayisi(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: 24 }}
              sx={{ width: 120 }}
            />
            <Button
              variant="contained"
              onClick={handleTaksitHesapla}
              sx={{ height: 40 }}
            >
              Hesapla
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Vade</TableCell>
                  <TableCell>Tutar</TableCell>
                  <TableCell>Ödeme Tipi</TableCell>
                  <TableCell>Açıklama</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.odemePlani.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Henüz ödeme planı oluşturulmadı.</TableCell>
                  </TableRow>
                ) : (
                  formData.odemePlani.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          type="date"
                          size="small"
                          value={item.vade}
                          onChange={(e) => {
                            const newPlan = [...formData.odemePlani];
                            newPlan[index].vade = e.target.value;
                            setFormData(prev => ({ ...prev, odemePlani: newPlan }));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.tutar}
                          onChange={(e) => {
                            const newPlan = [...formData.odemePlani];
                            newPlan[index].tutar = parseFloat(e.target.value) || 0;
                            setFormData(prev => ({ ...prev, odemePlani: newPlan }));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={item.odemeTipi}
                          onChange={(e) => {
                            const newPlan = [...formData.odemePlani];
                            newPlan[index].odemeTipi = e.target.value;
                            setFormData(prev => ({ ...prev, odemePlani: newPlan }));
                          }}
                          SelectProps={{ native: true }}
                        >
                          <option value="HAVALE">Havale/EFT</option>
                          <option value="NAKIT">Nakit</option>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={item.aciklama}
                          onChange={(e) => {
                            const newPlan = [...formData.odemePlani];
                            newPlan[index].aciklama = e.target.value;
                            setFormData(prev => ({ ...prev, odemePlani: newPlan }));
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOdemePlaniDialog(false)}>Kapat</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenOdemePlaniDialog(false)}
          >
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function YeniAlisFaturasiPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    }>
      <AlisFaturaForm />
    </Suspense>
  );
}