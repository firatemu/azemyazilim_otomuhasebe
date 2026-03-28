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
  satisElemaniId?: string;
}

interface SatisElemani {
  id: string;
  fullName: string;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  birim: string;
  satisFiyati: number;
  kdvOrani: number;
  barkod?: string;
  miktar: number;
  unitRef?: any;
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

// Sayı inputları için spinner gizleme stili
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

export function SatisFaturaForm({ faturaId: editFaturaId, onBack }: { faturaId?: string; onBack?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(editFaturaId);
  const siparisId = isEdit ? null : searchParams.get('siparisId');
  const irsaliyeId = isEdit ? null : searchParams.get('irsaliyeId');
  const kopyalaId = isEdit ? null : searchParams.get('kopyala');

  const [isMounted, setIsMounted] = useState(false);
  const { addTab, removeTab, setActiveTab } = useTabStore();

  useEffect(() => {
    setIsMounted(true);
    // Sayfa doğrudan açılırsa sekmeyi ekle
    if (!isEdit) {
      addTab({
        id: 'invoice-sales-yeni',
        label: 'Yeni Satış Faturası',
        path: '/invoice/sales/yeni'
      });
      setActiveTab('invoice-sales-yeni');
    }
  }, []);

  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [satisElemanlari, setSatisElemanlari] = useState<SatisElemani[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSiparis, setLoadingSiparis] = useState(false);
  const [loadingFatura, setLoadingFatura] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    faturaNo: '',
    faturaTipi: 'SALE' as 'SALE' | 'PURCHASE',
    cariId: '',
    warehouseId: '',
    tarih: '', // Hydration stability
    vade: '',  // Hydration stability
    durum: 'DRAFT' as DurumType,
    genelIskontoOran: 0,
    genelIskontoTutar: 0,
    aciklama: '',
    satisElemaniId: '',
    kalemler: [] as FaturaKalemi[],
    // e-Dönüşüm alanları
    eScenario: 'TICARI_FATURA' as string,
    eInvoiceType: 'SALE' as string,
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
  const [openSiparisDialog, setOpenSiparisDialog] = useState(false);
  const [siparisler, setSiparisler] = useState<any[]>([]);
  const [selectedSiparisler, setSelectedSiparisler] = useState<string[]>([]);
  const [loadingSiparisler, setLoadingSiparisler] = useState(false);
  const [siparisSearch, setSiparisSearch] = useState('');
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
  const isMobileMediaQuery = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Initialize dates after mount if not editing or loading from external source
  useEffect(() => {
    if (isMounted && !isEdit && !siparisId && !irsaliyeId && !kopyalaId && !formData.tarih) {
      setFormData(prev => ({
        ...prev,
        tarih: new Date().toISOString().split('T')[0],
        vade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));
    }
  }, [isMounted, isEdit, siparisId, irsaliyeId, kopyalaId]);

  const toNumEdit = (v: any): number => {
    if (v == null || v === '') return 0;
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'object' && v != null && typeof (v as any).toNumber === 'function') return (v as any).toNumber();
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  };

  const toInputDate = (value: any, fallback = ''): string => {
    if (!value) return fallback;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toISOString().split('T')[0];
  };

  const fetchFatura = async () => {
    if (!editFaturaId) return;
    try {
      setLoadingFatura(true);
      const response = await axios.get(`/invoices/${editFaturaId}`);
      const fatura = response.data;
      const durumValue = (fatura.status || 'APPROVED') as DurumType;
      const warehouseId = fatura.warehouseId ?? fatura.deliveryNote?.warehouseId ?? '';
      setFormData(prev => ({
        ...prev,
        faturaNo: fatura.invoiceNo || '',
        faturaTipi: fatura.invoiceType || 'SATIS',
        cariId: fatura.accountId || '',
        warehouseId: String(warehouseId || ''),
        tarih: toInputDate(fatura.date, prev.tarih || ''),
        vade: toInputDate(fatura.dueDate, ''),
        durum: durumValue,
        genelIskontoOran: 0, // DTO structure calculates global discount from value
        genelIskontoTutar: toNumEdit(fatura.globalDiscountValue) || toNumEdit(fatura.discount),
        aciklama: fatura.notes || '',
        satisElemaniId: fatura.salesAgentId || '',
        kalemler: (fatura.items || []).map((k: any) => {
          const miktar = toNumEdit(k.quantity) || 1;
          const birimFiyat = toNumEdit(k.unitPrice);
          const baseAmount = miktar * birimFiyat;
          const iskOran = toNumEdit(k.discountRate);
          const v = k.vatRate;
          const kdvOrani = (v === 0 || v === '0' || (typeof v === 'number' && Number.isFinite(v) && v === 0))
            ? 0
            : (v !== undefined && v !== null && v !== '' ? (Number.isFinite(Number(v)) ? Number(v) : 0) : 0);
          return {
            stokId: k.productId,
            stok: k.product ? {
              id: k.product.id,
              stokKodu: k.product.code,
              stokAdi: k.product.name,
              satisFiyati: toNumEdit(k.product.salePrice),
              kdvOrani: toNumEdit(k.product.vatRate),
              miktar: 0,
            } : undefined,
            miktar,
            birimFiyat,
            kdvOrani,
            iskontoOran: iskOran,
            iskontoTutar: toNumEdit(k.discountAmount) || (baseAmount * iskOran) / 100,
            cokluIskonto: Boolean(k.multipleDiscount),
            iskontoFormula: k.discountFormula ?? '',
            tevkifatKodu: k.withholdingCode || '',
            tevkifatOran: toNumEdit(k.withholdingRate),
            otvOran: toNumEdit(k.sctRate),
            kdvIstisnaNedeni: k.vatExemptionReason || '',
            birim: k.unit || (k.product?.unit) || 'ADET',
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
    fetchSatisElemanlari();
    fetchWarehouses();

    if (isEdit && editFaturaId) {
      fetchFatura();
      return;
    }

    const copyId = kopyalaId;

    if (irsaliyeId) {
      fetchIrsaliyeBilgileri(irsaliyeId);
    } else if (siparisId) {
      fetchSiparisBilgileri(siparisId);
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
      // Backend'den gelen alanları frontend'in beklediği isimlere map'le
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

      // Kopyala veya düzenle modunda ambarı başka yer set edecek; varsayılan atama yapma
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

  const fetchSatisElemanlari = async () => {
    try {
      const response = await axios.get('/sales-agent');
      setSatisElemanlari(response.data || []);
    } catch (error) {
      console.error('Satış elemanları yüklenirken hata:', error);
    }
  };

  const fetchStoklar = async () => {
    try {
      const response = await axios.get('/products', {
        params: { limit: 2000 },
      });
      // Backend'den gelen alanları frontend'in beklediği isimlere map'le
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

  const fetchSiparisBilgileri = async (id: string) => {
    try {
      setLoadingSiparis(true);
      const response = await axios.get(`/orders/${id}`);
      const siparis = response.data;

      console.log('Sipariş bilgileri yüklendi:', siparis);

      // Cari bilgisini set et
      if (siparis.cari) {
        setFormData(prev => ({
          ...prev,
          cariId: siparis.cari.id,
          tarih: toInputDate(siparis.tarih, prev.tarih || ''),
          vade: toInputDate(siparis.vade, prev.vade),
          aciklama: siparis.aciklama || prev.aciklama,
          satisElemaniId: siparis.satisElemaniId || prev.satisElemaniId,
        }));

        // Carinin vade süresine göre otomatik vade hesapla (eğer vade yoksa)
        if (!siparis.vade && siparis.cari.vadeSuresi && siparis.cari.vadeSuresi > 0) {
          const faturaDate = new Date(siparis.tarih);
          if (!Number.isNaN(faturaDate.getTime())) {
            const vadeDate = new Date(faturaDate);
            vadeDate.setDate(vadeDate.getDate() + siparis.cari.vadeSuresi);
            setFormData(prev => ({
              ...prev,
              vade: toInputDate(vadeDate, prev.vade),
            }));
          }
        }
      }

      // Kalemleri set et
      if (siparis.kalemler && siparis.kalemler.length > 0) {
        const kalemler: FaturaKalemi[] = siparis.kalemler.map((kalem: any) => ({
          stokId: kalem.stokId || kalem.productId,
          stok: kalem.stok || kalem.product ? {
            id: kalem.stok?.id || kalem.product?.id,
            stokKodu: kalem.stok?.stokKodu || kalem.product?.code,
            stokAdi: kalem.stok?.stokAdi || kalem.product?.name,
            satisFiyati: toNumEdit(kalem.birimFiyat || kalem.unitPrice),
            kdvOrani: toNumEdit(kalem.kdvOrani || kalem.vatRate),
            miktar: 0,
            birim: kalem.birim || kalem.unit || kalem.product?.unit || 'ADET',
          } : undefined,
          miktar: toNumEdit(kalem.miktar || kalem.quantity || 1),
          birimFiyat: toNumEdit(kalem.birimFiyat || kalem.unitPrice),
          kdvOrani: toNumEdit(kalem.kdvOrani || kalem.vatRate),
          iskontoOran: toNumEdit(kalem.iskontoOran || kalem.discountRate || 0),
          iskontoTutar: toNumEdit(kalem.iskontoTutar || kalem.discountAmount || 0),
          birim: kalem.birim || kalem.unit || kalem.product?.unit || 'ADET',
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

  const toNum = (v: any): number | undefined => {
    if (v == null || v === '') return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };

  const fetchFaturaKopyala = async (faturaId: string) => {
    try {
      setLoadingSiparis(true);
      const response = await axios.get(`/invoices/${faturaId}`);
      const fatura = response.data;

      const warehouseId = fatura.warehouseId ?? fatura.irsaliye?.depoId ?? '';

      const kalemler: FaturaKalemi[] = (fatura.items || fatura.kalemler || []).map((k: any) => {
        const miktar = toNumEdit(k.quantity || k.miktar || 1);
        const birimFiyat = toNumEdit(k.unitPrice || k.birimFiyat || 0);
        const baseAmount = miktar * birimFiyat;
        const iskOran = toNumEdit(k.discountRate || k.iskontoOrani || 0);
        const v = k.vatRate !== undefined ? k.vatRate : k.kdvOrani;
        const n = v === undefined || v === null ? NaN : Number(v);
        const kdvOrani = Number.isFinite(n) && n >= 0 ? n : 20;

        return {
          stokId: k.productId || k.stokId,
          stok: (k.product || k.stok) ? {
            id: k.product?.id || k.stok?.id,
            stokKodu: k.product?.code || k.stok?.stokKodu,
            stokAdi: k.product?.name || k.stok?.stokAdi,
            satisFiyati: toNumEdit(k.product?.salePrice || k.stok?.satisFiyati) ?? 0,
            kdvOrani: toNumEdit(k.product?.vatRate || k.stok?.kdvOrani) ?? 20,
            miktar: 0,
            birim: k.product?.unit || k.stok?.birim || 'ADET',
          } : undefined,
          miktar,
          birimFiyat,
          kdvOrani,
          iskontoOran: iskOran,
          iskontoTutar: toNumEdit(k.discountAmount || k.iskontoTutari) || (baseAmount * iskOran) / 100,
          birim: k.unit || k.birim || k.product?.unit || 'ADET',
          cokluIskonto: Boolean(k.multipleDiscount || k.cokluIskonto),
          iskontoFormula: k.discountFormula || k.iskontoFormula || '',
        };
      });

      setFormData(prev => ({
        ...prev,
        cariId: fatura.cariId || '',
        warehouseId: String(warehouseId || prev.warehouseId),
        tarih: toInputDate(fatura.tarih, prev.tarih),
        vade: toInputDate(fatura.vade, prev.vade),
        aciklama: fatura.aciklama || '',
        satisElemaniId: fatura.satisElemaniId || '',
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
      const response = await axios.get('/sales-waybills', {
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
      const response = await axios.get('/orders/invoice-orders', {
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
        const response = await axios.get(`/sales-waybills/${irsaliyeId}`);
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
        const response = await axios.get(`/orders/${siparisId}`);
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
      const response = await axios.get(`/sales-waybills/${id}`);
      const irsaliye = response.data;

      console.log('İrsaliye bilgileri yüklendi:', irsaliye);

      // Cari bilgisini set et
      if (irsaliye.cari) {
        setFormData(prev => ({
          ...prev,
          cariId: irsaliye.cari.id,
          tarih: toInputDate(irsaliye.irsaliyeTarihi, prev.tarih || ''),
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
          stokId: kalem.stokId || kalem.productId,
          stok: kalem.stok || kalem.product ? {
            id: kalem.stok?.id || kalem.product?.id,
            stokKodu: kalem.stok?.stokKodu || kalem.product?.code,
            stokAdi: kalem.stok?.stokAdi || kalem.product?.name,
            satisFiyati: toNumEdit(kalem.birimFiyat || kalem.unitPrice),
            kdvOrani: toNumEdit(kalem.kdvOrani || kalem.vatRate),
            miktar: 0,
            birim: kalem.birim || kalem.unit || kalem.product?.unit || 'ADET',
          } : undefined,
          miktar: toNumEdit(kalem.miktar || kalem.quantity || 1),
          birimFiyat: toNumEdit(kalem.birimFiyat || kalem.unitPrice),
          kdvOrani: toNumEdit(kalem.kdvOrani || kalem.vatRate),
          birim: kalem.birim || kalem.unit || kalem.product?.unit || 'ADET',
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
      // Önce şablondan numara çekmeyi dene (Önizleme endpoint'ini kullan)
      const templateResponse = await axios.get('/code-templates/preview-code/INVOICE_SALES');
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
      const response = await axios.get('/invoices', {
        params: { faturaTipi: 'SALE', page: 1, limit: 1 },
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

  // Fatura numarası manuel değiştirildiğinde şablona kaydet
  const handleFaturaNoChange = async (newFaturaNo: string) => {
    setFormData(prev => ({ ...prev, faturaNo: newFaturaNo }));

    // Sadece dolu ve geçerli bir numara girildiyse ve düzenleme modu değilse
    if (newFaturaNo && newFaturaNo.trim() && !isEdit) {
      try {
        // Backend'e manuel numarayı bildir
        await axios.post('/code-templates/save-manual-code/INVOICE_SALES', {
          code: newFaturaNo.trim()
        });
        console.log('✅ Manuel numara şablona kaydedildi:', newFaturaNo);
      } catch (error: any) {
        console.error('❌ Manuel numara kaydedilemedi:', error);
        // Hata olsa bile kullanıcıyı rahatsız etme, numara değişikliğine devam et
      }
    }
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

  const checkSpecialPrice = async (index: number, stokId: string) => {
    if (!formData.cariId || !stokId) return;

    try {
      const response = await axios.get(`/price-lists/product/${stokId}`, {
        params: { accountId: formData.cariId }
      });

      if (response.data) {
        setFormData(prev => {
          const newKalemler = [...prev.kalemler];
          const kalem = { ...newKalemler[index] };
          kalem.birimFiyat = Number(response.data.price || response.data.fiyat || 0);
          kalem.isSpecialPrice = true;
          // Eğer indirim oranı da varsa (isteğe bağlı)
          const discountRate = response.data.discountRate !== undefined ? response.data.discountRate : response.data.indirimOrani;
          if (discountRate > 0) {
            kalem.iskontoOran = Number(discountRate);
            const araToplam = kalem.miktar * kalem.birimFiyat;
            kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
          }
          newKalemler[index] = kalem;
          return { ...prev, kalemler: newKalemler };
        });
      }
    } catch (error) {
      console.error('Özel fiyat kontrolü hatası:', error);
    }
  };

  const handleAddKalem = () => {
    setFormData(prev => ({
      ...prev,
      kalemler: [...prev.kalemler, {
        stokId: '',
        miktar: 1,
        birimFiyat: 0,
        kdvOrani: 20, // Varsayılan KDV oranı
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
        odemeTipi: 'KREDI_KARTI',
        aciklama: `${i + 1}. Taksit`,
        odendi: false,
      });
    }

    setFormData(prev => ({ ...prev, odemePlani: yeniPlan }));
  };

  const handleBarcodeSubmit = (barkod: string) => {
    if (!barkod) return;
    // Barkod alanı null/undefined olabilir, kontrol ekle
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
          kalem.birimFiyat = stok.satisFiyati;
          kalem.kdvOrani = stok.kdvOrani;
          kalem.birim = stok.birim; // Stoktan gelen varsayılan birim
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
      } else if (field === 'miktar' || field === 'birimFiyat' || field === 'otvOran' || field === 'tevkifatOran') {
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
        (kalem as any)[field] = value;
      }

      newKalemler[index] = kalem;
      return { ...prev, kalemler: newKalemler };
    });

  };

  const calculateKalemTutar = (kalem: FaturaKalemi) => {
    const araToplam = kalem.miktar * kalem.birimFiyat;
    const netTutar = araToplam - kalem.iskontoTutar;

    // ÖTV Hesapla
    const otvOran = kalem.otvOran || 0;
    const kalemOtv = (netTutar * otvOran) / 100;

    // KDV Matrahı (Net Tutar + ÖTV)
    const kdvMatrahi = netTutar + kalemOtv;
    const kdv = (kdvMatrahi * kalem.kdvOrani) / 100;

    // Tevkifat Hesapla
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

      // ÖTV Hesapla
      const otvOran = kalem.otvOran || 0;
      const kalemOtv = (netTutar * otvOran) / 100;
      toplamOtv += kalemOtv;

      // KDV Matrahı (Net Tutar + ÖTV)
      const kdvMatrahi = netTutar + kalemOtv;
      const kdv = (kdvMatrahi * kalem.kdvOrani) / 100;
      toplamKdv += kdv;

      // Tevkifat Hesapla
      const tevkifatOran = kalem.tevkifatOran || 0;
      const kalemTevkifat = kdv * tevkifatOran;
      toplamTevkifat += kalemTevkifat;
    });

    const genelIskonto = formData.genelIskontoTutar || 0;
    const toplamIskonto = toplamKalemIskontosu + genelIskonto;
    const netToplam = araToplam - toplamKalemIskontosu - genelIskonto;
    // Genel Toplam: Matrah + KDV + ÖTV - Tevkifat
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
          salesAgentId: formData.satisElemaniId || null,
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

        // Fatura ID'sini al
        const faturaId = response.data.id || response.data.fatura?.id;

        // Eğer ödeme planı varsa kaydet
        if (faturaId && formData.odemePlani.length > 0) {
          await axios.post(`/invoices/${faturaId}/payment-plan`, formData.odemePlani);
        }

        showSnackbar('Fatura başarıyla güncellendi', 'success');

        // Tab kapatma ve yönlendirme
        setTimeout(() => {
          removeTab(`invoice-sales-edit-${editFaturaId}`);
          if (onBack) {
            onBack();
          } else {
            router.push('/invoice/sales');
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
        salesAgentId: formData.satisElemaniId || null,
        status: formData.durum,
        ...(siparisId && { orderId: siparisId }),
        ...(irsaliyeId && { deliveryNoteId: irsaliyeId }),
        warehouseId: formData.warehouseId || null,
        // e-Dönüşüm alanları
        eScenario: formData.eScenario || null,
        eInvoiceType: formData.eInvoiceType || null,
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

      // Fatura ID'sini al
      const faturaId = response.data.id || response.data.fatura?.id;

      // Eğer ödeme planı varsa kaydet
      if (faturaId && formData.odemePlani.length > 0) {
        await axios.post(`/invoices/${faturaId}/payment-plan`, formData.odemePlani);
      }

      showSnackbar('Fatura başarıyla oluşturuldu', 'success');
      removeTab('invoice-sales-yeni');
      addTab({ id: 'invoice-sales', label: 'Satış Faturaları', path: '/invoice/sales' });
      setActiveTab('invoice-sales');
      setTimeout(() => router.push('/invoice/sales'), 1500);
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
      currency: 'TRY',
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

  // Mobilecard component - Kompakt ve mobil dostu
  function MobileItemCard({ kalem, index }: { kalem: FaturaKalemi, index: number }) {
    const currentStok = stoklar.find(s => s.id === kalem.stokId);
    const availableUnits = currentStok?.unitRef?.unitSet?.units || [];

    return (
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
          <Checkbox
            checked={selectedRows.includes(index)}
            onChange={() => handleToggleRow(index)}
            size="small"
            sx={{ ml: 0.5, mt: 0.5, flexShrink: 0 }}
          />
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
              {availableUnits.length > 0 ? (
                availableUnits.map((u: any) => (
                  <MenuItem key={u.id} value={u.name}>
                    {u.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value={kalem.birim || 'ADET'}>{kalem.birim || 'ADET'}</MenuItem>
              )}
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
      </Paper>
    );
  }

  return (
    <>
      {/* Geri dön butonu kaldırıldı - en altta İptal ve Faturayı Kaydet butonları var */}
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
              {isEdit ? 'Satış Faturası Düzenle' : 'Yeni Satış Faturası'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
              {isEdit ? formData.faturaNo : (siparisId ? 'Siparişten fatura oluşturuluyor...' : 'Satış faturası oluşturun')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {!isEdit && loadingSiparis ? (
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
            {/* Fatura Bilgileri ve e-Dönüşüm Sekmeleri - Mobilde gizli, Desktop'ta görünür */}
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
                  <Tab label="e-Dönüşüm Ayarları" />
                </Tabs>
              </Box>
            )}

            {/* Mobilde: Tüm alanlar tek kolonda, TabPanel olmadan */}
            {isMobile ? (
              <Box>
                {/* GENEL BİLGİLER */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'var(--foreground)' }}>Genel Bilgiler</Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2
              }}>
                <TextField
                  className="form-control-textfield"
                  label="Fatura No"
                  value={formData.faturaNo}
                  onChange={(e) => handleFaturaNoChange(e.target.value)}
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
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', mt: 2 }}>
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
                    getOptionLabel={(option) => option.fullName || ''}
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
                          <Typography variant="body2">{option.fullName}</Typography>
                        </li>
                      );
                    }}
                    noOptionsText="Satış elemanı bulunamadı"
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                </Box>
              </Box>

              {/* E-DÖNÜŞÜM AYARLARI - Mobilde gizli */}
              {/* <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'var(--foreground)' }}>e-Dönüşüm Ayarları</Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
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
                  </Select>
                </FormControl>

                <FormControl className="form-control-select" fullWidth>
                  <InputLabel>Fatura Türü</InputLabel>
                  <Select
                    value="SATIS"
                    label="Fatura Türü"
                    disabled
                  >
                    <MenuItem value="SATIS">Satış</MenuItem>
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
              </Box> */}
              </Box>
            ) : (
              <>
              {/* Desktop: TabPanel 0 - Genel Bilgiler */}
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
                  onChange={(e) => handleFaturaNoChange(e.target.value)}
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
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', mt: 2 }}>
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
                    getOptionLabel={(option) => option.fullName || ''}
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
                          <Typography variant="body2">{option.fullName}</Typography>
                        </li>
                      );
                    }}
                    noOptionsText="Satış elemanı bulunamadı"
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                </Box>
              </Box>
            </TabPanel>

            {/* Desktop: TabPanel 1 - e-Dönüşüm Ayarları */}
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
                  </Select>
                </FormControl>

                <FormControl className="form-control-select" fullWidth>
                  <InputLabel>Fatura Türü</InputLabel>
                  <Select
                    value="SATIS"
                    label="Fatura Türü"
                    disabled
                  >
                    <MenuItem value="SATIS">Satış</MenuItem>
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
              </Box>
            </TabPanel>
            </>
            )}

            <Box>
              <Box sx={{
                display: 'flex',
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
                    onClick={() => {
                      setSiparisSearch('');
                      fetchSiparisler();
                      setOpenSiparisDialog(true);
                    }}
                    disabled={loadingSiparisler}
                    fullWidth={isMobile}
                    sx={{
                      height: 40,
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
                        {/* ÖTV % and Tevkifat columns hidden for now - backend fields preserved */}
                        {/* <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 100 }}>ÖTV %</TableCell> */}
                        {/* <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important', minWidth: 200 }}>Tevkifat</TableCell> */}
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
                                  if (newValue?.id) {
                                    checkSpecialPrice(index, newValue.id);
                                  }
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
                                select
                                size="small"
                                className="form-control-textfield"
                                value={kalem.birim || ''}
                                onChange={(e) => handleKalemChange(index, 'birim', e.target.value)}
                                placeholder="Birim"
                                SelectProps={{
                                  native: false,
                                  size: 'small',
                                }}
                              >
                                {(stoklar.find(s => s.id === kalem.stokId)?.unitRef?.unitSet?.units || [])
                                  .map((u: any) => (
                                    <MenuItem key={u.id} value={u.name}>
                                      {u.name}
                                    </MenuItem>
                                  ))
                                }
                                {!stoklar.find(s => s.id === kalem.stokId)?.unitRef?.unitSet?.units && kalem.birim && (
                                  <MenuItem value={kalem.birim}>{kalem.birim}</MenuItem>
                                )}
                              </TextField>
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
                                {kalem.isSpecialPrice && (
                                  <Chip
                                    label="Özel Fiyat"
                                    size="small"
                                    color="warning"
                                    sx={{
                                      position: 'absolute',
                                      top: -12,
                                      right: -10,
                                      height: 16,
                                      fontSize: '0.6rem',
                                      fontWeight: 700,
                                      zIndex: 1
                                    }}
                                  />
                                )}
                              </Box>
                            </TableCell>

                            {/* Calculator Popover */}
                            <Popover
                              open={calculatorAnchor !== null && calculatorRowIndex === index}
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
                                          // Safe evaluation of math expression
                                          const result = Function('"use strict"; return (' + calculatorExpression + ')')();
                                          if (typeof result === 'number' && !isNaN(result)) {
                                            handleKalemChange(index, 'birimFiyat', result.toString());
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
                                    bgcolor: kalem.cokluIskonto
                                      ? 'color-mix(in srgb, var(--chart-2) 10%, transparent)'
                                      : 'var(--muted)',
                                  }
                                }}
                              >
                                {kalem.cokluIskonto ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
                              </IconButton>
                            </TableCell>
                            <TableCell sx={{ minWidth: 200 }}>
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
                                  sx={numberInputSx}
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
                                sx={numberInputSx}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 140, fontWeight: 700 }}>
                              {formatCurrency(calculateKalemTutar(kalem))}
                            </TableCell>
                            {/* ÖTV % and Tevkifat columns hidden for now - backend fields preserved */}
                            {/* <TableCell sx={{ minWidth: 100 }}>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                className="form-control-textfield"
                                value={kalem.otvOran || 0}
                                onChange={(e) => handleKalemChange(index, 'otvOran', e.target.value)}
                                inputProps={{ min: 0, max: 100, step: 0.01 }}
                                sx={numberInputSx}
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
                            </TableCell> */}
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
                sx={{ width: { xs: '100%', sm: '200px' }, ...numberInputSx }}
              />
              <TextField
                type="number"
                label="Genel İskonto (₺)"
                className="form-control-textfield"
                value={formData.genelIskontoTutar || ''}
                onChange={(e) => handleGenelIskontoTutarChange(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="İskonto tutarı"
                sx={{ width: { xs: '100%', sm: '200px' }, ...numberInputSx }}
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
                  {/* ÖTV Toplamı hidden for now - backend fields preserved */}
                  {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1.5 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: 'var(--muted-foreground)' }}>ÖTV Toplamı:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="600" sx={{ color: 'var(--foreground)' }}>{formatCurrency(totals.toplamOtv)}</Typography>
                  </Box> */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1.5 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: 'var(--muted-foreground)' }}>KDV Toplamı:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="600" sx={{ color: 'var(--foreground)' }}>{formatCurrency(totals.toplamKdv)}</Typography>
                  </Box>
                  {/* Tevkifat Toplamı hidden for now - backend fields preserved */}
                  {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1.5 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: 'var(--muted-foreground)' }}>Tevkifat Toplamı:</Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="600" sx={{ color: totals.toplamTevkifat > 0 ? 'var(--destructive)' : 'var(--foreground)' }}>
                      {totals.toplamTevkifat > 0 ? '- ' : ''}{formatCurrency(totals.toplamTevkifat)}
                    </Typography>
                  </Box> */}
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
                  onClick={() => { if (isEdit && onBack) onBack(); else router.push('/invoice/sales'); }}
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
            /* Mobil: Card Layout */
            isMobile ? (
              <Box>
                {irsaliyeler.map((irsaliye) => {
                  const totalQty = irsaliye.kalemler?.reduce((sum: number, k: any) => sum + k.miktar, 0) || 0;
                  const invoicedQty = irsaliye.kalemler?.reduce((sum: number, k: any) => sum + (k.faturalananMiktar || 0), 0) || 0;
                  const remainingQty = totalQty - invoicedQty;
                  const remainingTotal = Number(irsaliye.genelToplam) * (totalQty > 0 ? remainingQty / totalQty : 0);
                  const isSelected = selectedIrsaliyeler.includes(irsaliye.id);

                  return (
                    <Paper
                      key={irsaliye.id}
                      variant="outlined"
                      onClick={() => {
                        setSelectedIrsaliyeler(prev =>
                          prev.includes(irsaliye.id)
                            ? prev.filter(id => id !== irsaliye.id)
                            : [...prev, irsaliye.id]
                        );
                      }}
                      sx={{
                        p: 2,
                        mb: 2,
                        cursor: 'pointer',
                        bgcolor: 'var(--card)',
                        borderRadius: 'var(--radius)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="600" color="var(--foreground)">
                            {irsaliye.irsaliyeNo}
                          </Typography>
                          <Typography variant="caption" color="var(--muted-foreground)">
                            {new Date(irsaliye.irsaliyeTarihi).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedIrsaliyeler(prev =>
                              prev.includes(irsaliye.id)
                                ? prev.filter(id => id !== irsaliye.id)
                                : [...prev, irsaliye.id]
                            );
                          }}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          size="small"
                          label={`${remainingQty} / ${totalQty} Br.`}
                          color={remainingQty === totalQty ? "primary" : "warning"}
                          variant="outlined"
                        />
                        <Typography variant="subtitle1" fontWeight="700" color="var(--primary)">
                          {formatCurrency(remainingTotal)}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            ) : (
              /* Desktop: Table Layout */
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
            )
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
        <DialogTitle component="div">Siparişten Ekle</DialogTitle>
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

      {/* Ödeme Planı Dialog */}
      <Dialog
        open={openOdemePlaniDialog}
        onClose={() => setOpenOdemePlaniDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Ödeme Planı / Taksitlendirme</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1, display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <TextField
              type="number"
              label="Taksit Sayısı"
              value={taksitSayisi}
              onChange={(e) => setTaksitSayisi(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: 24 }}
              sx={{ width: { xs: '100%', sm: 120 } }}
            />
            <Button
              variant="contained"
              onClick={handleTaksitHesapla}
              sx={{ height: 40, flex: isMobile ? 1 : 'auto' }}
            >
              Hesapla
            </Button>
          </Box>

          {/* Mobil: Card Layout */}
          {isMobile ? (
            <Box>
              {formData.odemePlani.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'var(--muted)' }}>
                  <Typography variant="body2" color="text.secondary">
                    Henüz ödeme planı oluşturulmadı.
                  </Typography>
                </Paper>
              ) : (
                formData.odemePlani.map((item, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{ p: 2, mb: 2, bgcolor: 'var(--card)', borderRadius: 'var(--radius)' }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="600" color="var(--primary)">
                        {index + 1}. Taksit
                      </Typography>
                      <Typography variant="h6" fontWeight="700" color="var(--foreground)">
                        {formatCurrency(item.tutar)}
                      </Typography>
                    </Box>
                    <TextField
                      type="date"
                      fullWidth
                      size="small"
                      label="Vade"
                      value={item.vade}
                      onChange={(e) => {
                        const newPlan = [...formData.odemePlani];
                        newPlan[index].vade = e.target.value;
                        setFormData(prev => ({ ...prev, odemePlani: newPlan }));
                      }}
                      sx={{ mb: 1.5 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                      <InputLabel>Ödeme Tipi</InputLabel>
                      <Select
                        value={item.odemeTipi}
                        onChange={(e) => {
                          const newPlan = [...formData.odemePlani];
                          newPlan[index].odemeTipi = e.target.value;
                          setFormData(prev => ({ ...prev, odemePlani: newPlan }));
                        }}
                        label="Ödeme Tipi"
                      >
                        <MenuItem value="KREDI_KARTI">Kredi Kartı</MenuItem>
                        <MenuItem value="NAKIT">Nakit</MenuItem>
                        <MenuItem value="HAVALE">Havale/EFT</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      size="small"
                      label="Açıklama"
                      value={item.aciklama}
                      onChange={(e) => {
                        const newPlan = [...formData.odemePlani];
                        newPlan[index].aciklama = e.target.value;
                        setFormData(prev => ({ ...prev, odemePlani: newPlan }));
                      }}
                    />
                  </Paper>
                ))
              )}
            </Box>
          ) : (
            /* Desktop: Table Layout */
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
                            <option value="KREDI_KARTI">Kredi Kartı</option>
                            <option value="NAKIT">Nakit</option>
                            <option value="HAVALE">Havale/EFT</option>
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
          )}
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

export default function YeniSatisFaturasiPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    }>
      <SatisFaturaForm />
    </Suspense>
  );
}

