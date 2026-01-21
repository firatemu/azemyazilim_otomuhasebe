'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  Grid,
  Autocomplete,
  Divider,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import { Add, Edit, Delete, Search, FileDownload, History, CompareArrows } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import { useStokHareketler } from '@/hooks/useApi';
import TableSkeleton from '@/components/Loading/TableSkeleton';

interface Malzeme {
  id: string;
  stokKodu: string;
  stokAdi: string;
  barkod?: string;
  marka: string;
  anaKategori: string;
  altKategori: string;
  birim: string;
  miktar?: number; // Hareketlerden hesaplanacak
  olcu: string;
  oem: string;
  raf?: string;
  tedarikciKodu?: string;
  alisFiyati: number;
  satisFiyati: number;
  // Araç bilgileri
  aracMarka?: string;
  aracModel?: string;
  aracMotorHacmi?: string;
  aracYakitTipi?: string;
}

interface Location {
  id: string;
  code: string;
  name: string;
  barcode?: string;
}

const formatDateOnly = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Malzeme Form Data Interface
interface MalzemeFormData {
  stokKodu: string;
  stokAdi: string;
  barkod: string;
  marka: string;
  anaKategori: string;
  altKategori: string;
  birim: string;
  olcu: string;
  oem: string;
  raf: string;
  tedarikciKodu: string;
  alisFiyati: number;
  satisFiyati: number;
  // Araç bilgileri
  aracMarka?: string;
  aracModel?: string;
  aracMotorHacmi?: string;
  aracYakitTipi?: string;
}

// Malzeme Form Dialog Component - Local State ile Ping Sorunu Çözümü
interface MalzemeFormDialogProps {
  open: boolean;
  initialFormData: MalzemeFormData;
  editingMalzeme: Malzeme | null;
  locations: Location[];
  kategoriler: Record<string, string[]>;
  markalar: string[];
  // Araç bilgileri
  aracMarkalar: string[];
  aracModeller: string[];
  aracMotorHacimleri: string[];
  aracYakitTipleri: string[];
  onAracMarkaChange: (marka: string) => void;
  onClose: () => void;
  onSubmit: (data: MalzemeFormData) => void;
}

const MalzemeFormDialog = memo(({
  open,
  initialFormData,
  editingMalzeme,
  locations,
  kategoriler,
  markalar,
  aracMarkalar,
  aracModeller,
  aracMotorHacimleri,
  aracYakitTipleri,
  onAracMarkaChange,
  onClose,
  onSubmit,
}: MalzemeFormDialogProps) => {
  // Local State - Parent'ı etkilemez, ping sorunu çözülür
  const [localFormData, setLocalFormData] = useState<MalzemeFormData>(initialFormData);

  // initialFormData değiştiğinde local state'i güncelle
  useEffect(() => {
    // Eğer düzenleme modundaysak ve initialFormData.altKategori varsa,
    // önce kategorilerin yüklenmesini bekleyelim
    if (open && initialFormData.anaKategori && initialFormData.altKategori) {
      const currentOptions = kategoriler[initialFormData.anaKategori] || [];
      // Eğer alt kategori mevcut seçenekler arasında değilse ve düzenleme modundaysak,
      // alt kategoriyi koruyalım (çünkü malzeme zaten bu değere sahip)
      setLocalFormData(initialFormData);
    } else {
      setLocalFormData(initialFormData);
    }
  }, [initialFormData, open, kategoriler]);

  // Local değişiklik fonksiyonu - Sadece dialog re-render olur
  const handleLocalChange = useCallback((field: keyof MalzemeFormData, value: any) => {
    setLocalFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Ana kategori değiştiğinde alt kategoriyi sıfırla
  const handleAnaKategoriChange = useCallback((value: string) => {
    setLocalFormData((prev) => ({ ...prev, anaKategori: value, altKategori: '' }));
  }, []);

  // Araç markası değiştiğinde modeli sıfırla ve modelleri yükle
  const handleAracMarkaChange = useCallback((value: string) => {
    setLocalFormData((prev) => ({ ...prev, aracMarka: value, aracModel: '' }));
    onAracMarkaChange(value);
  }, [onAracMarkaChange]);

  // Local submit - Parent'a sadece burada veri gönderilir
  const handleLocalSubmit = useCallback(() => {
    onSubmit(localFormData);
  }, [localFormData, onSubmit]);

  // Alt kategori seçenekleri - useMemo ile optimize edilmiş
  const altKategoriOptions = useMemo(() => {
    if (!localFormData.anaKategori) {
      return [];
    }
    const options = kategoriler[localFormData.anaKategori] || [];
    
    // Eğer düzenleme modundaysak ve mevcut altKategori seçenekler arasında yoksa,
    // onu da ekle (malzeme zaten bu değere sahip olabilir)
    if (editingMalzeme && localFormData.altKategori && !options.includes(localFormData.altKategori)) {
      return [...options, localFormData.altKategori];
    }
    
    return options;
  }, [localFormData.anaKategori, localFormData.altKategori, kategoriler, editingMalzeme]);

  // Hook'lar bittikten SONRA conditional return
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'var(--primary-foreground)',
          fontSize: '1.25rem',
          py: 2,
          borderBottom: '1px solid var(--border)',
        }}
      >
        {editingMalzeme ? '✏️ Malzeme Düzenle' : '➕ Yeni Malzeme Ekle'}
      </DialogTitle>
      <DialogContent sx={{ mt: 3, background: 'var(--muted)', borderTop: '1px solid var(--border)', px: 3 }}>
        <Box sx={{ py: 1 }}>
          {/* Genel Bilgiler Bölümü */}
          <Typography variant="h6" sx={{ mb: 2, color: 'var(--foreground)', fontWeight: 700, letterSpacing: '-0.01em' }}>
            📋 Genel Bilgiler
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Stok Kodu"
                value={localFormData.stokKodu}
                onChange={(e) => handleLocalChange('stokKodu', e.target.value)}
                size="medium"
                helperText={localFormData.stokKodu ? "Önerilen kod (değiştirilebilir)" : "Otomatik üretilecek"}
                placeholder="Otomatik"
                sx={{
                  '& .MuiInputBase-input': {
                    color: localFormData.stokKodu && !editingMalzeme ? '#0066cc' : 'inherit',
                    fontWeight: localFormData.stokKodu && !editingMalzeme ? 500 : 'normal'
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Stok Adı"
                value={localFormData.stokAdi}
                onChange={(e) => handleLocalChange('stokAdi', e.target.value)}
                required
                size="medium"
                helperText="Detaylı ürün açıklaması giriniz"
                inputProps={{ style: { fontSize: '1rem' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Barkod"
                value={localFormData.barkod}
                onChange={(e) => handleLocalChange('barkod', e.target.value)}
                size="medium"
                helperText="Ürün barkod numarası"
                placeholder="Örn: 8690123456789"
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.95rem'
                  }
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Kategori ve Ölçü Bilgileri */}
          <Typography variant="h6" sx={{ mb: 2, color: '#191970', fontWeight: 600 }}>
            🏷️ Kategori ve Ölçü Bilgileri
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Tedarikçi Kodu"
                value={localFormData.tedarikciKodu}
                onChange={(e) => handleLocalChange('tedarikciKodu', e.target.value)}
                placeholder="Tedarikçinin ürün kodu"
                size="medium"
                helperText="Tedarikçinin kullandığı ürün kodu"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="OEM Kodu"
                value={localFormData.oem}
                onChange={(e) => handleLocalChange('oem', e.target.value)}
                placeholder="Orijinal parça numarası"
                size="medium"
                helperText="Orjinal ekipman üreticisi kodu"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium">
                <InputLabel shrink>Marka</InputLabel>
                <Select
                  value={localFormData.marka}
                  label="Marka"
                  displayEmpty
                  onChange={(e) => handleLocalChange('marka', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {markalar.map((marka) => (
                    <MenuItem key={marka} value={marka}>
                      {marka}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium">
                <InputLabel shrink>Ana Kategori *</InputLabel>
                <Select
                  value={localFormData.anaKategori}
                  label="Ana Kategori *"
                  displayEmpty
                  onChange={(e) => handleAnaKategoriChange(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {Object.keys(kategoriler).map((kategori) => (
                    <MenuItem key={kategori} value={kategori}>
                      {kategori}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl 
                fullWidth 
                size="medium" 
                disabled={!localFormData.anaKategori}
                error={Boolean(localFormData.altKategori && altKategoriOptions.length > 0 && !altKategoriOptions.includes(localFormData.altKategori))}
              >
                <InputLabel shrink>Alt Kategori</InputLabel>
                <Select
                  value={
                    // Eğer altKategoriOptions boşsa, boş string kullan (MUI hatası önlemek için)
                    // Eğer mevcut altKategori seçenekler arasındaysa, onu kullan
                    // Aksi halde boş string kullan
                    !localFormData.altKategori || altKategoriOptions.length === 0
                      ? ''
                      : altKategoriOptions.includes(localFormData.altKategori)
                        ? localFormData.altKategori
                        : ''
                  }
                  label="Alt Kategori"
                  displayEmpty
                  onChange={(e) => handleLocalChange('altKategori', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {altKategoriOptions.map((altKat) => (
                    <MenuItem key={altKat} value={altKat}>
                      {altKat}
                    </MenuItem>
                  ))}
                </Select>
                {localFormData.altKategori && altKategoriOptions.length > 0 && !altKategoriOptions.includes(localFormData.altKategori) && (
                  <FormHelperText error>
                    Bu alt kategori mevcut ana kategori altında bulunmuyor. Lütfen ana kategoriyi kontrol edin.
                  </FormHelperText>
                )}
                {altKategoriOptions.length === 0 && localFormData.anaKategori && (
                  <FormHelperText>
                    Bu ana kategori için henüz alt kategori tanımlanmamış.
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Ölçü / Teknik Özellikler"
                value={localFormData.olcu}
                onChange={(e) => handleLocalChange('olcu', e.target.value)}
                placeholder="Örn: 12x1.5, 195/65R15, M14x1.5, 180x20mm"
                size="medium"
                helperText="Ürünün ölçü veya teknik özelliklerini giriniz"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Autocomplete<Location, false, false, true>
                fullWidth
                options={locations}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.code)}
                value={locations.find((l) => l.code === localFormData.raf) ?? null}
                onChange={(_, newValue) => {
                  if (typeof newValue === 'string') {
                    handleLocalChange('raf', newValue);
                  } else {
                    handleLocalChange('raf', newValue?.code || '');
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Raf Adresi"
                    placeholder="Seçiniz veya yazınız"
                    size="medium"
                    helperText="Depo raf konumu"
                  />
                )}
                freeSolo
                onInputChange={(_, newValue, reason) => {
                  if (reason === 'input') {
                    handleLocalChange('raf', newValue);
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="medium">
                <InputLabel shrink>Birim *</InputLabel>
                <Select
                  value={localFormData.birim}
                  label="Birim *"
                  displayEmpty
                  onChange={(e) => handleLocalChange('birim', e.target.value)}
                >
                  <MenuItem value="Adet">Adet</MenuItem>
                  <MenuItem value="Takım">Takım</MenuItem>
                  <MenuItem value="Kg">Kg</MenuItem>
                  <MenuItem value="Litre">Litre</MenuItem>
                  <MenuItem value="Metre">Metre</MenuItem>
                  <MenuItem value="Paket">Paket</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Fiyat Bilgileri */}
          <Typography variant="h6" sx={{ mb: 2, color: '#191970', fontWeight: 600 }}>
            💰 Fiyat Bilgileri
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Alış Fiyatı"
                type="number"
                value={localFormData.alisFiyati}
                onChange={(e) => handleLocalChange('alisFiyati', parseFloat(e.target.value) || 0)}
                size="medium"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                  readOnly: Boolean(editingMalzeme),
                }}
                disabled={Boolean(editingMalzeme)}
                helperText={editingMalzeme ? 'Güncelleme sırasında alış fiyatı değiştirilemez.' : 'Tedarikçiden aldığınız fiyat'}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Satış Fiyatı"
                type="number"
                value={localFormData.satisFiyati}
                onChange={(e) => handleLocalChange('satisFiyati', parseFloat(e.target.value) || 0)}
                size="medium"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                  readOnly: Boolean(editingMalzeme),
                }}
                disabled={Boolean(editingMalzeme)}
                helperText={editingMalzeme ? 'Güncelleme sırasında satış fiyatı değiştirilemez.' : 'Müşteriye satış fiyatı'}
              />
            </Grid>
          </Grid>

          {localFormData.alisFiyati > 0 && localFormData.satisFiyati > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Kâr Marjı:</strong> ₺{(localFormData.satisFiyati - localFormData.alisFiyati).toFixed(2)}
                ({localFormData.alisFiyati > 0 ? ((localFormData.satisFiyati - localFormData.alisFiyati) / localFormData.alisFiyati * 100).toFixed(1) : 0}%)
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Araç Bilgileri Bölümü */}
          <Typography variant="h6" sx={{ mb: 2, color: '#191970', fontWeight: 600 }}>
            🚗 Araç Bilgileri
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium">
                <InputLabel shrink>Araç Markası</InputLabel>
                <Select
                  value={localFormData.aracMarka || ''}
                  label="Araç Markası"
                  displayEmpty
                  onChange={(e) => handleAracMarkaChange(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {aracMarkalar.map((marka) => (
                    <MenuItem key={marka} value={marka}>
                      {marka}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium" disabled={!localFormData.aracMarka}>
                <InputLabel shrink>Araç Modeli</InputLabel>
                <Select
                  value={localFormData.aracModel || ''}
                  label="Araç Modeli"
                  displayEmpty
                  onChange={(e) => handleLocalChange('aracModel', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {aracModeller.map((model) => (
                    <MenuItem key={model} value={model}>
                      {model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium">
                <InputLabel shrink>Motor Hacmi</InputLabel>
                <Select
                  value={localFormData.aracMotorHacmi || ''}
                  label="Motor Hacmi"
                  displayEmpty
                  onChange={(e) => handleLocalChange('aracMotorHacmi', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {aracMotorHacimleri.map((hacim) => (
                    <MenuItem key={hacim} value={hacim}>
                      {hacim}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium">
                <InputLabel shrink>Yakıt Tipi</InputLabel>
                <Select
                  value={localFormData.aracYakitTipi || ''}
                  label="Yakıt Tipi"
                  displayEmpty
                  onChange={(e) => handleLocalChange('aracYakitTipi', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {aracYakitTipleri.map((yakit) => (
                    <MenuItem key={yakit} value={yakit}>
                      {yakit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        <Button
          onClick={onClose}
          size="large"
          sx={{
            minWidth: 100,
            borderRadius: '999px',
            px: 2.4,
            border: '1px solid var(--border)',
            color: 'var(--muted-foreground)',
            textTransform: 'none',
            '&:hover': { bgcolor: 'var(--card)' },
          }}
        >
          İptal
        </Button>
        <Button
          onClick={handleLocalSubmit}
          variant="contained"
          size="large"
          disabled={!localFormData.stokAdi}
          sx={{
            background: '#527575',
            color: '#0b0b0b',
            minWidth: 140,
            borderRadius: '999px',
            px: 2.8,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            boxShadow: '0 10px 24px color-mix(in srgb, #527575 30%, transparent)',
            textTransform: 'none',
            '&:hover': {
              background: 'color-mix(in srgb, #527575 90%, #000 10%)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          {editingMalzeme ? '💾 Güncelle' : '➕ Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

MalzemeFormDialog.displayName = 'MalzemeFormDialog';

export default function MalzemeListesiPage() {
  const [stoklar, setStoklar] = useState<Malzeme[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMalzeme, setEditingMalzeme] = useState<Malzeme | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedKategori, setSelectedKategori] = useState('');
  const [selectedAltKategori, setSelectedAltKategori] = useState('');
  const [selectedMarka, setSelectedMarka] = useState('');
  const [stokDurumu, setStokDurumu] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [openEslestirmeDialog, setOpenEslestirmeDialog] = useState(false);
  const [selectedMalzeme, setSelectedMalzeme] = useState<Malzeme | null>(null);
  const [selectedEquivalents, setSelectedEquivalents] = useState<Malzeme[]>([]);
  const [hareketDialogOpen, setHareketDialogOpen] = useState(false);
  const [hareketMalzeme, setHareketMalzeme] = useState<Malzeme | null>(null);
  const [hareketTipiFilter, setHareketTipiFilter] = useState('');
  
  // Eşdeğer ürünler modal state
  const [esdegerDialogOpen, setEsdegerDialogOpen] = useState(false);
  const [esdegerMalzeme, setEsdegerMalzeme] = useState<Malzeme | null>(null);
  const [esdegerUrunler, setEsdegerUrunler] = useState<any[]>([]);
  const [esdegerLoading, setEsdegerLoading] = useState(false);

  // Debounced search - 500ms sonra arama yapılır
  const debouncedSearch = useDebounce(search, 500);

  // Kategoriler ve markalar state
  const [kategoriler, setKategoriler] = useState<Record<string, string[]>>({});
  const [markalar, setMarkalar] = useState<string[]>([]);
  
  // Araç bilgileri state
  const [aracMarkalar, setAracMarkalar] = useState<string[]>([]);
  const [aracModeller, setAracModeller] = useState<string[]>([]);
  const [aracMotorHacimleri] = useState<string[]>(['1.0L', '1.2L', '1.4L', '1.5L', '1.6L', '1.8L', '2.0L', '2.2L', '2.5L', '3.0L', '3.5L', '4.0L', '5.0L']);
  const [aracYakitTipleri, setAracYakitTipleri] = useState<string[]>([]);
  const [selectedAracMarka, setSelectedAracMarka] = useState<string>('');

  // Initial form data - sadece dialog açıldığında kullanılır
  const [initialFormData, setInitialFormData] = useState<MalzemeFormData>({
    stokKodu: '',
    stokAdi: '',
    barkod: '',
    marka: '',
    anaKategori: '',
    altKategori: '',
    birim: 'Adet',
    olcu: '',
    oem: '',
    raf: '',
    tedarikciKodu: '',
    alisFiyati: 0,
    satisFiyati: 0,
  });

  useEffect(() => {
    setSelectedAltKategori('');
  }, [selectedKategori]);

  // Fetch locations - useCallback ile optimize edilmiş
  const fetchLocations = useCallback(async () => {
    try {
      const response = await axios.get('/location');
      setLocations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Raf listesi alınamadı:', error);
      setLocations([]);
    }
  }, []);

  // Fetch kategoriler - useCallback ile optimize edilmiş
  const fetchKategoriler = useCallback(async () => {
    try {
      const response = await axios.get('/kategori');
      const kategoriData = response.data || [];
      // Kategorileri Record<string, string[]> formatına çevir
      const kategoriMap: Record<string, string[]> = {};
      kategoriData.forEach((kategori: { anaKategori: string; altKategoriler: string[] }) => {
        kategoriMap[kategori.anaKategori] = kategori.altKategoriler || [];
      });
      setKategoriler(kategoriMap);
    } catch (error) {
      console.error('Kategori listesi alınamadı:', error);
      setKategoriler({});
    }
  }, []);

  // Fetch markalar - useCallback ile optimize edilmiş
  const fetchMarkalar = useCallback(async () => {
    try {
      const response = await axios.get('/marka');
      const markaData = response.data || [];
      // Markaları string array'e çevir
      const markaList = markaData.map((marka: { markaAdi: string }) => marka.markaAdi);
      setMarkalar(markaList);
    } catch (error) {
      console.error('Marka listesi alınamadı:', error);
      setMarkalar([]);
    }
  }, []);

  // Fetch araç markaları
  const fetchAracMarkalar = useCallback(async () => {
    try {
      const response = await axios.get('/arac/markalar');
      setAracMarkalar(response.data || []);
    } catch (error) {
      console.error('Araç markaları yüklenemedi:', error);
      setAracMarkalar([]);
    }
  }, []);

  // Fetch araç modelleri (marka seçildiğinde)
  const fetchAracModeller = useCallback(async (marka: string) => {
    if (!marka) {
      setAracModeller([]);
      return;
    }
    try {
      const response = await axios.get('/arac/modeller', {
        params: { marka },
      });
      setAracModeller(response.data || []);
    } catch (error) {
      console.error('Araç modelleri yüklenemedi:', error);
      setAracModeller([]);
    }
  }, []);

  // Fetch yakıt tipleri
  const fetchAracYakitTipleri = useCallback(async () => {
    try {
      const response = await axios.get('/arac/yakit-tipleri');
      setAracYakitTipleri(response.data || []);
    } catch (error) {
      console.error('Yakıt tipleri yüklenemedi:', error);
      setAracYakitTipleri([]);
    }
  }, []);

  // Araç markası değiştiğinde modelleri yükle
  const handleAracMarkaChange = useCallback((marka: string) => {
    setSelectedAracMarka(marka);
    fetchAracModeller(marka);
  }, [fetchAracModeller]);

  // Fetch stoklar - useCallback ile optimize edilmiş
  const fetchStoklar = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/stok', {
        params: { search: debouncedSearch, limit: 20 },
      });
      const stokData = response.data.data || [];
      setStoklar(stokData);
    } catch (error) {
      console.error('Stok verisi alınamadı:', error);
      setStoklar([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  // Initial fetch
  useEffect(() => {
    fetchStoklar();
    fetchLocations();
    fetchKategoriler();
    fetchMarkalar();
    fetchAracMarkalar();
    fetchAracYakitTipleri();
  }, [fetchStoklar, fetchLocations, fetchKategoriler, fetchMarkalar, fetchAracMarkalar, fetchAracYakitTipleri]);

  // Dialog açma - initialFormData hazırla - useCallback ile optimize edilmiş
  const handleOpenDialog = useCallback(async (malzeme?: Malzeme) => {
    if (malzeme) {
      setEditingMalzeme(malzeme);
      // Araç markası varsa modelleri yükle
      if (malzeme.aracMarka) {
        await fetchAracModeller(malzeme.aracMarka);
        setSelectedAracMarka(malzeme.aracMarka);
      }
      setInitialFormData({
        stokKodu: malzeme.stokKodu,
        stokAdi: malzeme.stokAdi,
        barkod: malzeme.barkod || '',
        marka: malzeme.marka || '',
        anaKategori: malzeme.anaKategori || '',
        altKategori: malzeme.altKategori || '',
        birim: malzeme.birim || 'Adet',
        olcu: malzeme.olcu || '',
        oem: malzeme.oem || '',
        raf: malzeme.raf || '',
        tedarikciKodu: malzeme.tedarikciKodu || '',
        alisFiyati: malzeme.alisFiyati || 0,
        satisFiyati: malzeme.satisFiyati || 0,
        // Araç bilgileri
        aracMarka: malzeme.aracMarka || '',
        aracModel: malzeme.aracModel || '',
        aracMotorHacmi: malzeme.aracMotorHacmi || '',
        aracYakitTipi: malzeme.aracYakitTipi || '',
      });
    } else {
      setEditingMalzeme(null);
      setSelectedAracMarka('');
      setAracModeller([]);

      // Yeni kayıt için bir sonraki kodu backend'den al
      let nextCode = '';
      try {
        const response = await axios.get('/code-template/next-code/PRODUCT');
        nextCode = response.data.nextCode || '';
      } catch (error) {
        console.log('Otomatik kod alınamadı, boş bırakılacak');
      }

      setInitialFormData({
        stokKodu: nextCode || '',
        stokAdi: '',
        barkod: '',
        marka: '',
        anaKategori: '',
        altKategori: '',
        birim: 'Adet',
        olcu: '',
        oem: '',
        raf: '',
        tedarikciKodu: '',
        alisFiyati: 0,
        satisFiyati: 0,
        // Araç bilgileri
        aracMarka: '',
        aracModel: '',
        aracMotorHacmi: '',
        aracYakitTipi: '',
      });
    }
    setOpenDialog(true);
  }, [fetchAracModeller]);

  // Dialog kapatma - useCallback ile optimize edilmiş
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingMalzeme(null);
  }, []);

  // Submit handler - useCallback ile optimize edilmiş
  const handleSubmit = useCallback(async (submitFormData: MalzemeFormData) => {
    // Stok kodu kontrolü - sadece girilmişse ve aynı koda sahip başka kayıt varsa engelle
    if (submitFormData.stokKodu && submitFormData.stokKodu.trim().length > 0) {
      const mevcutStok = stoklar.find(s =>
        s.stokKodu.toLowerCase() === submitFormData.stokKodu.toLowerCase() &&
        s.id !== editingMalzeme?.id
      );

      if (mevcutStok) {
        alert(`Bu stok kodu zaten kullanılıyor! (${mevcutStok.stokAdi})\nLütfen farklı bir stok kodu giriniz.`);
        return;
      }
    }

    try {
      // Backend'e gönderilecek veri - stokKodu boşsa undefined gönder (backend otomatik üretsin)
      const payload = {
        stokKodu: submitFormData.stokKodu && submitFormData.stokKodu.trim().length > 0 ? submitFormData.stokKodu : undefined,
        stokAdi: submitFormData.stokAdi,
        barkod: submitFormData.barkod && submitFormData.barkod.trim().length > 0 ? submitFormData.barkod : undefined,
        birim: submitFormData.birim,
        alisFiyati: Number(submitFormData.alisFiyati),
        satisFiyati: Number(submitFormData.satisFiyati),
        kategori: submitFormData.anaKategori || undefined,
        anaKategori: submitFormData.anaKategori || undefined,
        altKategori: submitFormData.altKategori || undefined,
        marka: submitFormData.marka || undefined,
        oem: submitFormData.oem || undefined,
        olcu: submitFormData.olcu || undefined,
        raf: submitFormData.raf || undefined,
        tedarikciKodu: submitFormData.tedarikciKodu && submitFormData.tedarikciKodu.trim().length > 0 ? submitFormData.tedarikciKodu : undefined,
        // Araç bilgileri
        aracMarka: submitFormData.aracMarka || undefined,
        aracModel: submitFormData.aracModel || undefined,
        aracMotorHacmi: submitFormData.aracMotorHacmi || undefined,
        aracYakitTipi: submitFormData.aracYakitTipi || undefined,
      };

      console.log('Backend\'e gönderilen veri:', payload);

      let stokId: string | undefined = editingMalzeme?.id;

      if (editingMalzeme) {
        // Güncelleme
        const response = await axios.patch(`/stok/${editingMalzeme.id}`, payload);
        if (!stokId) {
          stokId = response?.data?.id ?? response?.data?.data?.id;
        }
      } else {
        // Yeni ekleme
        const response = await axios.post('/stok', payload);
        stokId = response?.data?.id ?? response?.data?.data?.id;
      }

      const priceCardPayloads: Array<{ type: 'SALE' | 'PURCHASE'; price: number }> = [];

      if (submitFormData.alisFiyati > 0 && (!editingMalzeme || editingMalzeme.alisFiyati !== submitFormData.alisFiyati)) {
        priceCardPayloads.push({ type: 'PURCHASE', price: Number(submitFormData.alisFiyati) });
      }

      if (submitFormData.satisFiyati > 0 && (!editingMalzeme || editingMalzeme.satisFiyati !== submitFormData.satisFiyati)) {
        priceCardPayloads.push({ type: 'SALE', price: Number(submitFormData.satisFiyati) });
      }

      if (stokId && priceCardPayloads.length > 0) {
        const effectiveFrom = formatDateOnly(new Date());
        try {
          await Promise.all(
            priceCardPayloads.map((item) =>
              axios.post('/price-cards', {
                stokId,
                type: item.type,
                price: item.price,
                effectiveFrom,
                note: 'Malzeme kartı kaydı sırasında otomatik oluşturuldu.',
              })
            )
          );
        } catch (priceCardError) {
          console.error('Fiyat kartı oluşturulamadı:', priceCardError);
        }
      }

      handleCloseDialog();
      // Listeyi yenile - fetchStoklar'ı dependency'den çıkar, doğrudan çağır
      try {
        setLoading(true);
        const response = await axios.get('/stok', {
          params: { search: debouncedSearch, limit: 20 },
        });
        const stokData = response.data.data || [];
        setStoklar(stokData);
      } catch (error) {
        console.error('Stok verisi alınamadı:', error);
        setStoklar([]);
      } finally {
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Malzeme kaydedilemedi:', error);
      console.error('Backend hatası:', error.response?.data);
      alert(`Malzeme kaydedilirken bir hata oluştu:\n${error.response?.data?.message || error.message}`);
    }
  }, [editingMalzeme, stoklar, handleCloseDialog, debouncedSearch]);

  // Delete handler - useCallback ile optimize edilmiş
  const handleDelete = useCallback(async (id: string) => {
    try {
      // Önce silinebilir mi kontrol et
      const canDeleteResponse = await axios.get(`/stok/${id}/can-delete`);
      const canDelete = canDeleteResponse.data;

      if (!canDelete.canDelete) {
        alert(
          `❌ Bu malzeme silinemez!\n\n` +
          `Malzeme ${canDelete.toplamHareketSayisi} işlemde kullanılmıştır:\n` +
          `• Hareket: ${canDelete.hareketSayisi}\n` +
          `• Fatura: ${canDelete.faturaKalemSayisi}\n` +
          `• Sipariş: ${canDelete.siparisKalemSayisi}\n` +
          `• Teklif: ${canDelete.teklifKalemSayisi}\n` +
          `• Sayım: ${canDelete.sayimKalemSayisi}\n` +
          `• Depo Hareketi: ${canDelete.stockMoveSayisi}\n\n` +
          `Hareket gören malzemeler silinemez.`
        );
        return;
      }

      if (confirm('Bu malzemeyi silmek istediğinizden emin misiniz?')) {
        await axios.delete(`/stok/${id}`);
        // Listeyi yenile
        try {
          setLoading(true);
          const response = await axios.get('/stok', {
            params: { search: debouncedSearch, limit: 20 },
          });
          const stokData = response.data.data || [];
          setStoklar(stokData);
        } catch (error) {
          console.error('Stok verisi alınamadı:', error);
          setStoklar([]);
        } finally {
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Malzeme silinemedi:', error);
      if (error.response?.status === 400) {
        alert(`❌ ${error.response.data.message || 'Malzeme silinemez'}`);
      } else {
        alert('Malzeme silinirken bir hata oluştu');
      }
    }
  }, [debouncedSearch]);

  const handleOpenEslestirme = async (malzeme: Malzeme) => {
    setSelectedMalzeme(malzeme);
    setOpenEslestirmeDialog(true);

    // Mevcut eşdeğer ürünleri yükle
    try {
      const response = await axios.get(`/stok/${malzeme.id}/esdegerler`);
      if (response.data.esdegerler && response.data.esdegerler.length > 0) {
        setSelectedEquivalents(response.data.esdegerler);
      }
    } catch (error) {
      console.error('Eşdeğer ürünler yüklenemedi:', error);
    }
  };

  const handleCloseEslestirme = () => {
    setOpenEslestirmeDialog(false);
    setSelectedMalzeme(null);
    setSelectedEquivalents([]);
  };

  const handleSaveEslestirme = async () => {
    if (!selectedMalzeme) {
      return;
    }

    // Eğer tüm eşdeğerler silinmişse, eşleştirmeyi kaldır
    if (selectedEquivalents.length === 0) {
      const confirm = window.confirm(
        `${selectedMalzeme.stokKodu} ürününün tüm eşleştirmelerini kaldırmak istediğinizden emin misiniz?`
      );

      if (!confirm) return;

      try {
        await axios.delete(`/stok/${selectedMalzeme.id}/eslestir`);
        alert(`✅ ${selectedMalzeme.stokKodu} ürününün eşleştirmesi kaldırıldı.`);
        handleCloseEslestirme();
        // Listeyi yenile
        try {
          setLoading(true);
          const response = await axios.get('/stok', {
            params: { search: debouncedSearch, limit: 20 },
          });
          const stokData = response.data.data || [];
          setStoklar(stokData);
        } catch (error) {
          console.error('Stok verisi alınamadı:', error);
          setStoklar([]);
        } finally {
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Eşleştirme kaldırılamadı:', error);
        alert(`❌ Hata: ${error.response?.data?.message || 'Eşleştirme kaldırılamadı.'}`);
      }
      return;
    }

    try {
      const response = await axios.post('/stok/eslestir', {
        anaUrunId: selectedMalzeme.id,
        esUrunIds: selectedEquivalents.map(eq => eq.id)
      });

      const { toplamUrun, urunler } = response.data;

      alert(
        `✅ Eşleştirme başarılı!\n\n` +
        `${selectedMalzeme.stokKodu} için ${selectedEquivalents.length} ürün eşleştirildi.\n` +
        `Grup toplam ${toplamUrun} ürün içeriyor:\n\n` +
        urunler.map((u: any) => `• ${u.marka} - ${u.stokKodu}`).join('\n')
      );

      handleCloseEslestirme();
      // Listeyi yenile
      try {
        setLoading(true);
        const response = await axios.get('/stok', {
          params: { search: debouncedSearch, limit: 20 },
        });
        const stokData = response.data.data || [];
        setStoklar(stokData);
      } catch (error) {
        console.error('Stok verisi alınamadı:', error);
        setStoklar([]);
      } finally {
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Eşleştirme kaydedilemedi:', error);
      const errorMsg = error.response?.data?.message || 'Eşleştirme kaydedilemedi. Lütfen tekrar deneyin.';
      alert(`❌ Hata: ${errorMsg}`);
    }
  };

  const handleRemoveEslestirme = async (stok: Malzeme) => {
    const confirm = window.confirm(
      `${stok.stokKodu} ürününün tüm eşleştirmelerini kaldırmak istediğinizden emin misiniz?\n\n` +
      `Bu işlem geri alınamaz!`
    );

    if (!confirm) return;

    try {
      await axios.delete(`/stok/${stok.id}/eslestir`);
      alert(`✅ ${stok.stokKodu} ürününün eşleştirmesi başarıyla kaldırıldı.`);
      // Listeyi yenile
      try {
        setLoading(true);
        const response = await axios.get('/stok', {
          params: { search: debouncedSearch, limit: 20 },
        });
        const stokData = response.data.data || [];
        setStoklar(stokData);
      } catch (error) {
        console.error('Stok verisi alınamadı:', error);
        setStoklar([]);
      } finally {
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Eşleştirme kaldırılamadı:', error);
      alert(`❌ Hata: ${error.response?.data?.message || 'Eşleştirme kaldırılamadı.'}`);
    }
  };

  const filteredStoklar = useMemo(() => {
    return stoklar.filter((stok) => {
      const kategoriMatch = selectedKategori ? stok.anaKategori === selectedKategori : true;
      const altKategoriMatch = selectedAltKategori ? stok.altKategori === selectedAltKategori : true;
      const markaMatch = selectedMarka ? stok.marka === selectedMarka : true;
      const miktar = stok.miktar ?? 0;
      const stokMatch =
        stokDurumu === 'inStock'
          ? miktar > 0
          : stokDurumu === 'outOfStock'
            ? miktar <= 0
            : true;
      return kategoriMatch && altKategoriMatch && markaMatch && stokMatch;
    });
  }, [stoklar, selectedKategori, selectedAltKategori, selectedMarka, stokDurumu]);

  const { data: hareketData, isLoading: hareketlerLoading } = useStokHareketler(
    hareketMalzeme?.id,
    hareketTipiFilter || undefined,
    100
  );
  const hareketler = hareketData?.data || [];

  const formatHareketDate = (value: string) =>
    new Date(value).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);

  const getHareketLabel = (tip: string) => {
    const labels: Record<string, string> = {
      GIRIS: 'Giriş',
      CIKIS: 'Çıkış',
      SATIS: 'Satış',
      IADE: 'İade',
      SAYIM: 'Sayım',
    };
    return labels[tip] || tip;
  };

  // Eşdeğer ürünler dialog handler
  const handleOpenEsdegerDialog = useCallback(async (malzeme: Malzeme) => {
    setEsdegerMalzeme(malzeme);
    setEsdegerDialogOpen(true);
    setEsdegerLoading(true);
    setEsdegerUrunler([]);

    try {
      const response = await axios.get(`/stok/${malzeme.id}/esdegerler`);
      if (response.data?.esdegerler && Array.isArray(response.data.esdegerler)) {
        setEsdegerUrunler(response.data.esdegerler);
      } else {
        setEsdegerUrunler([]);
      }
    } catch (error: any) {
      console.error('Eşdeğer ürünler alınamadı:', error);
      if (error.response?.status !== 404) {
        alert(`❌ Hata: ${error.response?.data?.message || 'Eşdeğer ürünler alınamadı.'}`);
      }
      setEsdegerUrunler([]);
    } finally {
      setEsdegerLoading(false);
    }
  }, []);

  const handleCloseEsdegerDialog = useCallback(() => {
    setEsdegerDialogOpen(false);
    setEsdegerMalzeme(null);
    setEsdegerUrunler([]);
  }, []);

  const getHareketColor = (tip: string) => {
    const colors: Record<string, 'success' | 'error' | 'primary' | 'warning' | 'default'> = {
      GIRIS: 'success',
      CIKIS: 'error',
      SATIS: 'primary',
      IADE: 'warning',
      SAYIM: 'default',
    };
    return colors[tip] || 'default';
  };

  const handleOpenHareketDialog = (malzeme: Malzeme) => {
    setHareketMalzeme(malzeme);
    setHareketTipiFilter('');
    setHareketDialogOpen(true);
  };

  const handleCloseHareketDialog = () => {
    setHareketDialogOpen(false);
    setHareketMalzeme(null);
  };

  const handleExportExcel = () => {
    if (filteredStoklar.length === 0) {
      alert('Excel çıktısı için listede stok bulunamadı.');
      return;
    }

    const rows = filteredStoklar.map((stok) => ({
      'Stok Kodu': stok.stokKodu,
      'Stok Adı': stok.stokAdi,
      Marka: stok.marka || '-',
      'Raf Adresi': stok.raf || '-',
      'Ölçü': stok.olcu || '-',
      OEM: stok.oem || '-',
      'Araç Markası': stok.aracMarka || '-',
      'Araç Modeli': stok.aracModel || '-',
      'Motor Hacmi': stok.aracMotorHacmi || '-',
      'Yakıt Tipi': stok.aracYakitTipi || '-',
      Miktar: stok.miktar ?? 0,
      Birim: stok.birim,
      'Alış Fiyatı': Number(stok.alisFiyati ?? 0),
      'Satış Fiyatı': Number(stok.satisFiyati ?? 0),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Malzeme Listesi');
    const timestamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
    XLSX.writeFile(workbook, `malzeme-listesi-${timestamp}.xlsx`);
  };

  const altKategoriOptions = useMemo(() => {
    if (!selectedKategori) {
      return [] as string[];
    }
    return kategoriler[selectedKategori] || [];
  }, [selectedKategori]);

  const markaOptions = useMemo(() => {
    const collected = stoklar.map((s) => s.marka).filter(Boolean) as string[];
    return Array.from(new Set([...markalar, ...collected])).sort();
  }, [stoklar]);

  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Malzeme Listesi
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            sx={{
              color: 'var(--primary)',
              borderColor: 'var(--primary)',
              borderRadius: '999px',
              px: 2.4,
              fontWeight: 600,
              '&:hover': { borderColor: 'color-mix(in srgb, var(--primary) 80%, var(--secondary) 20%)', color: 'color-mix(in srgb, var(--primary) 80%, var(--secondary) 20%)' }
            }}
          >
            Excel'e Aktar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: '#527575',
              color: '#0b0b0b',
              borderRadius: '999px',
              px: 2.8,
              py: 1.2,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              boxShadow: '0 10px 20px color-mix(in srgb, #527575 35%, transparent)',
              '&:hover': {
                background: 'color-mix(in srgb, #527575 90%, #000 10%)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Yeni Malzeme Ekle
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2.5, mb: 3, bgcolor: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Stok kodu, adı, barkod veya OEM kodu ile ara..."
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'var(--input)',
                '& fieldset': {
                  borderColor: 'var(--border)',
                },
                '&:hover fieldset': {
                  borderColor: 'var(--ring)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--ring)',
                },
              },
              '& .MuiInputBase-input': {
                color: 'var(--foreground)',
              },
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                fetchStoklar();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={() => fetchStoklar()}
            sx={{
            background: '#527575',
            color: '#0b0b0b',
            fontWeight: 700,
            borderRadius: '999px',
            px: 2.6,
            boxShadow: '0 8px 18px color-mix(in srgb, #527575 30%, transparent)',
            '&:hover': { background: 'color-mix(in srgb, #527575 90%, #000 10%)' }
            }}
          >
            Ara
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Kategori</InputLabel>
              <Select
                label="Kategori"
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
              >
                <MenuItem value="">
                  <em>Hepsi</em>
                </MenuItem>
                {Object.keys(kategoriler).map((kategori) => (
                  <MenuItem key={kategori} value={kategori}>
                    {kategori}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small" disabled={!selectedKategori} sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'var(--input)',
                '& fieldset': {
                  borderColor: 'var(--border)',
                },
                '&:hover fieldset': {
                  borderColor: 'var(--ring)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--ring)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--muted-foreground)',
              },
              '& .MuiSelect-select': {
                color: 'var(--foreground)',
              },
            }}>
              <InputLabel>Alt Kategori</InputLabel>
              <Select
                label="Alt Kategori"
                value={selectedAltKategori}
                onChange={(e) => setSelectedAltKategori(e.target.value)}
              >
                <MenuItem value="">
                  <em>Hepsi</em>
                </MenuItem>
                {altKategoriOptions.map((altKategori) => (
                  <MenuItem key={altKategori} value={altKategori}>
                    {altKategori}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small" sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'var(--input)',
                '& fieldset': {
                  borderColor: 'var(--border)',
                },
                '&:hover fieldset': {
                  borderColor: 'var(--ring)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--ring)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--muted-foreground)',
              },
              '& .MuiSelect-select': {
                color: 'var(--foreground)',
              },
            }}>
              <InputLabel>Marka</InputLabel>
              <Select
                label="Marka"
                value={selectedMarka}
                onChange={(e) => setSelectedMarka(e.target.value)}
              >
                <MenuItem value="">
                  <em>Hepsi</em>
                </MenuItem>
                {markaOptions.map((marka) => (
                  <MenuItem key={marka} value={marka}>
                    {marka}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small" sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'var(--input)',
                '& fieldset': {
                  borderColor: 'var(--border)',
                },
                '&:hover fieldset': {
                  borderColor: 'var(--ring)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--ring)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--muted-foreground)',
              },
              '& .MuiSelect-select': {
                color: 'var(--foreground)',
              },
            }}>
              <InputLabel>Stok Durumu</InputLabel>
              <Select
                label="Stok Durumu"
                value={stokDurumu}
                onChange={(e) => setStokDurumu(e.target.value as 'all' | 'inStock' | 'outOfStock')}
              >
                <MenuItem value="all">Hepsi</MenuItem>
                <MenuItem value="inStock">Stokta Olanlar</MenuItem>
                <MenuItem value="outOfStock">Stoğu Bitenler</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ bgcolor: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'var(--muted)' }}>
            <TableRow>
              <TableCell sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>Stok Kodu</strong></TableCell>
              <TableCell sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>Stok Adı</strong></TableCell>
              <TableCell sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>Marka</strong></TableCell>
              <TableCell sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>Raf Adresi</strong></TableCell>
              <TableCell sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>Ölçü</strong></TableCell>
              <TableCell sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>OEM</strong></TableCell>
              <TableCell sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>Araç Bilgileri</strong></TableCell>
              <TableCell align="center" sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>Miktar</strong></TableCell>
              <TableCell sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>Birim</strong></TableCell>
              <TableCell align="right" sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>Alış Fiyatı</strong></TableCell>
              <TableCell align="right" sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>Satış Fiyatı</strong></TableCell>
              <TableCell align="center" sx={{ color: 'var(--foreground)', fontWeight: 700 }}><strong>İşlemler</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={12} />
            ) : filteredStoklar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    Stok bulunamadı
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredStoklar.map((stok: any) => (
                  <TableRow 
                  key={stok.id} 
                  hover 
                  sx={{ 
                    '&:hover': { bgcolor: '#f9f9f9' },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="600" color="#191970">
                        {stok.stokKodu}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEsdegerDialog(stok)}
                        sx={{ 
                          padding: '4px',
                          '&:hover': { 
                            bgcolor: '#e3f2fd',
                          },
                        }}
                        title="Eşdeğer ürünleri göster"
                      >
                        <CompareArrows fontSize="small" color="primary" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>{stok.stokAdi}</TableCell>
                  <TableCell>{stok.marka || '-'}</TableCell>
                  <TableCell>
                    {stok.raf && stok.raf.trim() !== '' ? (
                      <Chip
                        label={stok.raf}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Raf atanmamış
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{stok.olcu || '-'}</TableCell>
                  <TableCell>{stok.oem || '-'}</TableCell>
                  <TableCell>
                    {stok.aracMarka || stok.aracModel || stok.aracMotorHacmi || stok.aracYakitTipi ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {stok.aracMarka && (
                          <Typography variant="caption" fontWeight="600" color="#1976d2">
                            {stok.aracMarka}
                          </Typography>
                        )}
                        {stok.aracModel && (
                          <Typography variant="caption" color="text.secondary">
                            {stok.aracModel}
                          </Typography>
                        )}
                        {(stok.aracMotorHacmi || stok.aracYakitTipi) && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {[stok.aracMotorHacmi, stok.aracYakitTipi].filter(Boolean).join(' / ')}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={stok.miktar || 0}
                      size="small"
                      color={stok.miktar > 0 ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell>{stok.birim}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      ₺{Number(stok.alisFiyati ?? 0).toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      ₺{Number(stok.satisFiyati ?? 0).toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(stok)}
                        title="Düzenle"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleOpenHareketDialog(stok)}
                        title="Hareketler"
                      >
                        <History fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(stok.id)}
                        title="Sil"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam {filteredStoklar.length} malzeme gösteriliyor
        </Typography>
      </Box>

      <Dialog
        open={hareketDialogOpen}
        onClose={handleCloseHareketDialog}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          {hareketMalzeme
            ? `${hareketMalzeme.stokKodu} - ${hareketMalzeme.stokAdi}`
            : 'Malzeme Hareketleri'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {hareketMalzeme ? (
            <>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {hareketMalzeme.marka && (
                  <Chip label={`Marka: ${hareketMalzeme.marka}`} size="small" color="primary" variant="outlined" />
                )}
                <Chip
                  label={`Stok Miktarı: ${hareketMalzeme.miktar ?? 0} ${hareketMalzeme.birim}`}
                  size="small"
                  color={(hareketMalzeme.miktar ?? 0) > 0 ? 'success' : 'error'}
                  variant="outlined"
                />
                <Chip
                  label={`Raf: ${hareketMalzeme.raf && hareketMalzeme.raf.trim() !== '' ? hareketMalzeme.raf : 'Belirtilmemiş'}`}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <FormControl size="small" sx={{ width: { xs: '100%', sm: 240 }, mb: 2 }}>
                <InputLabel>Hareket Tipi</InputLabel>
                <Select
                  label="Hareket Tipi"
                  value={hareketTipiFilter}
                  onChange={(e) => setHareketTipiFilter(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="GIRIS">Giriş</MenuItem>
                  <MenuItem value="CIKIS">Çıkış</MenuItem>
                  <MenuItem value="SATIS">Satış</MenuItem>
                  <MenuItem value="IADE">İade</MenuItem>
                  <MenuItem value="SAYIM">Sayım</MenuItem>
                </Select>
              </FormControl>

              <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
                <Table stickyHeader size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell><strong>Tarih</strong></TableCell>
                      <TableCell><strong>Hareket Tipi</strong></TableCell>
                      <TableCell align="right"><strong>Miktar</strong></TableCell>
                      <TableCell align="right"><strong>Birim Fiyat</strong></TableCell>
                      <TableCell align="right"><strong>Toplam</strong></TableCell>
                      <TableCell><strong>Açıklama</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hareketlerLoading ? (
                      <TableSkeleton rows={5} columns={6} />
                    ) : hareketler.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            Bu ürün için hareket kaydı bulunamadı.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      hareketler.map((hareket: any) => {
                        const toplamTutar = (hareket.miktar || 0) * Number(hareket.birimFiyat ?? 0);
                        return (
                          <TableRow key={hareket.id} hover>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {formatHareketDate(hareket.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getHareketLabel(hareket.hareketTipi)}
                                color={getHareketColor(hareket.hareketTipi)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="600">
                                {(hareket.miktar || 0).toLocaleString('tr-TR')}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {formatMoney(Number(hareket.birimFiyat ?? 0))}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="600">
                                {formatMoney(toplamTutar)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {hareket.aciklama || '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Toplam {hareketler.length} hareket listeleniyor.
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Görüntülemek için bir malzeme seçiniz.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseHareketDialog}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Malzeme Ekleme/Düzenleme Dialog - Local State ile Ping Sorunu Çözüldü */}
      <MalzemeFormDialog
        open={openDialog}
        initialFormData={initialFormData}
        editingMalzeme={editingMalzeme}
        locations={locations}
        kategoriler={kategoriler}
        markalar={markalar}
        aracMarkalar={aracMarkalar}
        aracModeller={aracModeller}
        aracMotorHacimleri={aracMotorHacimleri}
        aracYakitTipleri={aracYakitTipleri}
        onAracMarkaChange={handleAracMarkaChange}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      {/* Eşdeğer Ürünler Dialog */}
      <Dialog
        open={esdegerDialogOpen}
        onClose={handleCloseEsdegerDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#191970', color: 'white', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareArrows />
            <Typography variant="h6" fontWeight={600}>
              Eşdeğer Ürünler
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {esdegerMalzeme && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Ürün:
              </Typography>
              <Typography variant="h6" fontWeight={600} color="#191970">
                {esdegerMalzeme.stokKodu} - {esdegerMalzeme.stokAdi}
              </Typography>
            </Box>
          )}

          {esdegerLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Yükleniyor...
              </Typography>
            </Box>
          ) : esdegerUrunler.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CompareArrows sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                Bu ürünün eşdeğeri bulunmamaktadır
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Eşdeğer ürünleri eklemek için eşleştirme yapabilirsiniz
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Stok Kodu</strong></TableCell>
                    <TableCell><strong>Stok Adı</strong></TableCell>
                    <TableCell><strong>Marka</strong></TableCell>
                    <TableCell align="center"><strong>Miktar</strong></TableCell>
                    <TableCell align="right"><strong>Alış Fiyatı</strong></TableCell>
                    <TableCell align="right"><strong>Satış Fiyatı</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {esdegerUrunler.map((urun: any) => (
                    <TableRow key={urun.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#191970">
                          {urun.stokKodu}
                        </Typography>
                      </TableCell>
                      <TableCell>{urun.stokAdi}</TableCell>
                      <TableCell>{urun.marka || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={urun.miktar ?? 0}
                          size="small"
                          color={urun.miktar > 0 ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ₺{Number(urun.alisFiyati ?? 0).toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          ₺{Number(urun.satisFiyati ?? 0).toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseEsdegerDialog} variant="outlined">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

