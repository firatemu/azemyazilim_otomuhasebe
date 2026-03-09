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
  ListSubheader,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { trTR } from '@mui/x-data-grid/locales';
import { Add, Edit, Delete, Search, FileDownload, History, CompareArrows, Warehouse, Refresh } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTabStore } from '@/stores/tabStore';
import axios from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import { useStokHareketler } from '@/hooks/useApi';
import TableSkeleton from '@/components/Loading/TableSkeleton';
import MainLayout from '@/components/Layout/MainLayout';
import * as XLSX from 'xlsx';

// Custom Search Bar Component (External to DataGrid to avoid slot issues)
const MaterialSearchBar = ({ search, setSearch, onSearch, onRefresh }: any) => {
  return (
    <Box
      sx={{
        p: 1.5,
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: '100%',
        bgcolor: 'var(--card)',
      }}
    >
      <TextField
        size="small"
        placeholder="Stok kodu, adı, barkod veya OEM kodu ile ara..."
        value={search || ''}
        onChange={(e) => setSearch?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch?.();
          }
        }}
        sx={{
          width: { xs: '100%', md: 450 },
          '& .MuiInputBase-root': {
            bgcolor: 'var(--background)',
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" sx={{ color: 'var(--primary)' }} />
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        size="medium"
        onClick={() => onSearch?.()}
        startIcon={<Search />}
        sx={{
          bgcolor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          '&:hover': {
            bgcolor: 'var(--primary)',
            opacity: 0.9,
          },
        }}
      >
        Ara
      </Button>
      <Tooltip title="Listeyi yenile">
        <Button
          variant="outlined"
          size="medium"
          onClick={() => onRefresh?.()}
          startIcon={<Refresh />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Yenile
        </Button>
      </Tooltip>
    </Box>
  );
};


interface Malzeme {
  id: string;
  stokKodu: string;
  stokAdi: string;
  barkod?: string;
  marka: string;
  anaKategori: string;
  altKategori: string;
  birim: string;
  birimId?: string;
  miktar?: number; // Hareketlerden hesaplanacak
  olcu: string;
  oem: string;
  raf?: string;
  alisFiyati: number;
  sonAlisFiyati?: number;
  satisFiyati: number;
  // Araç bilgileri
  aracMarka?: string;
  aracModel?: string;
  aracMotorHacmi?: string;
  aracYakitTipi?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: string;
  countryOfOrigin?: string;
  warrantyMonths?: number;
  internalNote?: string;
  minOrderQty?: number;
  leadTimeDays?: number;
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
  birimId: string;
  olcu: string;
  oem: string;
  raf: string;
  tedarikciKodu: string;
  alisFiyati: number;
  satisFiyati: number;
  aracMarka?: string;
  aracModel?: string;
  aracMotorHacmi?: string;
  aracYakitTipi?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: string;
  countryOfOrigin?: string;
  warrantyMonths?: number;
  internalNote?: string;
  minOrderQty?: number;
  leadTimeDays?: number;
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
  birimSetleri: any[]; // BirimSeti[]
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
  birimSetleri,
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
        sx: {
          minHeight: '70vh',
          bgcolor: 'var(--card)',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle component="div"
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
      <DialogContent sx={{ mt: 3, bgcolor: 'var(--background)', borderTop: '1px solid var(--border)', px: 3 }}>
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
                className="form-control-textfield"
                helperText={localFormData.stokKodu ? "Önerilen kod (değiştirilebilir)" : "Otomatik üretilecek"}
                placeholder="Otomatik"
                sx={{
                  '& .MuiInputBase-input': {
                    color: localFormData.stokKodu && !editingMalzeme ? 'var(--primary)' : 'var(--foreground)',
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
                className="form-control-textfield"
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
                className="form-control-textfield"
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
          <Typography variant="h6" sx={{ mb: 2, color: 'var(--foreground)', fontWeight: 700, letterSpacing: '-0.01em' }}>
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
                className="form-control-textfield"
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
                className="form-control-textfield"
                helperText="Orjinal ekipman üreticisi kodu"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium" className="form-control-select">
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
              <FormControl fullWidth size="medium" className="form-control-select">
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
                className="form-control-select"
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
                className="form-control-textfield"
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
                    className="form-control-textfield"
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
              <FormControl fullWidth size="medium" className="form-control-select">
                <InputLabel shrink>Birim *</InputLabel>
                <Select
                  value={localFormData.birimId || ''}
                  label="Birim *"
                  displayEmpty
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    let selectedName = '';
                    birimSetleri.forEach(set => {
                      const found = set.birimler.find((b: any) => b.id === selectedId);
                      if (found) selectedName = found.ad;
                    });
                    setLocalFormData(prev => ({ ...prev, birimId: selectedId, birim: selectedName }));
                  }}
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  {birimSetleri.map((set) => [
                    <ListSubheader key={`set-${set.id}`}>{set.ad}</ListSubheader>,
                    ...set.birimler.map((b: any) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.ad} {b.kod ? `(${b.kod})` : ''}
                      </MenuItem>
                    ))
                  ])}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Fiyat Bilgileri */}
          <Typography variant="h6" sx={{ mb: 2, color: 'var(--foreground)', fontWeight: 700, letterSpacing: '-0.01em' }}>
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
                className="form-control-textfield"
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
                className="form-control-textfield"
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
            <Box sx={{ mt: 2, p: 2, bgcolor: 'color-mix(in srgb, var(--primary) 5%, transparent)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                <strong>Kâr Marjı:</strong> ₺{(localFormData.satisFiyati - localFormData.alisFiyati).toFixed(2)}
                ({localFormData.alisFiyati > 0 ? ((localFormData.satisFiyati - localFormData.alisFiyati) / localFormData.alisFiyati * 100).toFixed(1) : 0}%)
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 4, borderColor: 'var(--border)' }} />

          {/* Kurumsal / Ek Özellikler */}
          <Typography variant="h6" sx={{ mb: 2, color: 'var(--foreground)', fontWeight: 700, letterSpacing: '-0.01em' }}>
            📦 Kurumsal / Ek Özellikler
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Ağırlık" type="number" value={localFormData.weight ?? ''} onChange={(e) => handleLocalChange('weight', e.target.value === '' ? undefined : parseFloat(e.target.value))} size="medium" className="form-control-textfield" InputProps={{ endAdornment: <InputAdornment position="end">{localFormData.weightUnit || 'kg'}</InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="medium" className="form-control-select">
                <InputLabel shrink>Ağırlık Birimi</InputLabel>
                <Select value={localFormData.weightUnit || 'kg'} label="Ağırlık Birimi" onChange={(e) => handleLocalChange('weightUnit', e.target.value)}>
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="lb">lb</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Boyutlar" value={localFormData.dimensions ?? ''} onChange={(e) => handleLocalChange('dimensions', e.target.value)} placeholder="Örn: 10x20x5 cm" size="medium" className="form-control-textfield" />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Menşei Ülke" value={localFormData.countryOfOrigin ?? ''} onChange={(e) => handleLocalChange('countryOfOrigin', e.target.value)} size="medium" className="form-control-textfield" />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Garanti (Ay)" type="number" value={localFormData.warrantyMonths ?? ''} onChange={(e) => handleLocalChange('warrantyMonths', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} size="medium" className="form-control-textfield" inputProps={{ min: 0 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Min. Sipariş Miktarı" type="number" value={localFormData.minOrderQty ?? ''} onChange={(e) => handleLocalChange('minOrderQty', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} size="medium" className="form-control-textfield" inputProps={{ min: 0 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Tedarik Süresi (Gün)" type="number" value={localFormData.leadTimeDays ?? ''} onChange={(e) => handleLocalChange('leadTimeDays', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} size="medium" className="form-control-textfield" inputProps={{ min: 0 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="İç Not" multiline rows={2} value={localFormData.internalNote ?? ''} onChange={(e) => handleLocalChange('internalNote', e.target.value)} placeholder="Sadece iç kullanım" size="medium" className="form-control-textfield" />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: 'var(--border)' }} />

          {/* Araç Bilgileri Bölümü */}
          <Typography variant="h6" sx={{ mb: 2, color: 'var(--foreground)', fontWeight: 700, letterSpacing: '-0.01em' }}>
            🚗 Araç Bilgileri
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="medium" className="form-control-select">
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
  const router = useRouter();
  const { addTab, setActiveTab } = useTabStore();
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
  const [birimSetleri, setBirimSetleri] = useState<any[]>([]);

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
    birimId: '',
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
      const response = await axios.get('/category');
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
      const response = await axios.get('/brand');
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
      const response = await axios.get('/vehicle-brand/brands').catch(() => ({ data: [] }));
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
      const response = await axios.get('/vehicle-brand/models', {
        params: { brand: marka },
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
      const response = await axios.get('/vehicle-brand/fuel-types');
      setAracYakitTipleri(response.data || []);
    } catch (error) {
      console.error('Yakıt tipleri yüklenemedi:', error);
      setAracYakitTipleri([]);
    }
  }, []);

  const fetchBirimSetleri = useCallback(async () => {
    try {
      const response = await axios.get('/unit-set');
      setBirimSetleri(response.data || []);
    } catch (error) {
      console.error('Birim setleri yüklenemedi:', error);
      setBirimSetleri([]);
    }
  }, []);

  // Araç markası değiştiğinde modelleri yükle
  const handleAracMarkaChange = useCallback((marka: string) => {
    setSelectedAracMarka(marka);
    fetchAracModeller(marka);
  }, [fetchAracModeller]);

  // Fetch stoklar - useCallback ile optimize edilmiş (tüm sayfalar için veri çek)
  const fetchStoklar = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/product', {
        params: { search: debouncedSearch, limit: 5000, page: 1 },
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
    fetchBirimSetleri();
  }, [fetchStoklar, fetchLocations, fetchKategoriler, fetchMarkalar, fetchAracMarkalar, fetchAracYakitTipleri, fetchBirimSetleri]);

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
        birimId: malzeme.birimId || '',
        aracMarka: malzeme.aracMarka || '',
        aracModel: malzeme.aracModel || '',
        aracMotorHacmi: malzeme.aracMotorHacmi || '',
        aracYakitTipi: malzeme.aracYakitTipi || '',
        weight: malzeme.weight,
        weightUnit: malzeme.weightUnit || 'kg',
        dimensions: malzeme.dimensions || '',
        countryOfOrigin: malzeme.countryOfOrigin || '',
        warrantyMonths: malzeme.warrantyMonths,
        internalNote: malzeme.internalNote || '',
        minOrderQty: malzeme.minOrderQty,
        leadTimeDays: malzeme.leadTimeDays,
      });
    } else {
      setEditingMalzeme(null);
      setSelectedAracMarka('');
      setAracModeller([]);

      // Stok kodunu otomatik olarak al
      let nextCode = '';
      try {
        const response = await axios.get('/code-template/next-code/PRODUCT');
        nextCode = response.data.nextCode || '';
        console.log('Bir sonraki stok kodu:', nextCode);
      } catch (error) {
        console.log('Numara şablonu bulunamadı veya hata oluştu, stok kodu manuel girilecek', error);
      }

      setInitialFormData({
        stokKodu: nextCode,
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
        birimId: '',
        // Araç bilgileri
        aracMarka: '',
        aracModel: '',
        aracMotorHacmi: '',
        aracYakitTipi: '',
        weight: undefined,
        weightUnit: 'kg',
        dimensions: '',
        countryOfOrigin: '',
        warrantyMonths: undefined,
        internalNote: '',
        minOrderQty: undefined,
        leadTimeDays: undefined,
      });
    }
    setOpenDialog(true);
  }, [fetchAracModeller, fetchBirimSetleri]);

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
        birimId: submitFormData.birimId || undefined,
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
        weight: submitFormData.weight != null ? submitFormData.weight : undefined,
        weightUnit: submitFormData.weightUnit || undefined,
        dimensions: submitFormData.dimensions || undefined,
        countryOfOrigin: submitFormData.countryOfOrigin || undefined,
        warrantyMonths: submitFormData.warrantyMonths != null ? submitFormData.warrantyMonths : undefined,
        internalNote: submitFormData.internalNote || undefined,
        minOrderQty: submitFormData.minOrderQty != null ? submitFormData.minOrderQty : undefined,
        leadTimeDays: submitFormData.leadTimeDays != null ? submitFormData.leadTimeDays : undefined,
      };

      console.log('Backend\'e gönderilen veri:', payload);

      let stokId: string | undefined = editingMalzeme?.id;

      if (editingMalzeme) {
        // Güncelleme
        const response = await axios.patch(`/product/${editingMalzeme.id}`, payload);
        if (!stokId) {
          stokId = response?.data?.id ?? response?.data?.data?.id;
        }
      } else {
        // Yeni ekleme
        const response = await axios.post('/product', payload);
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
        const response = await axios.get('/product', {
          params: { search: debouncedSearch, limit: 5000, page: 1 },
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
      const canDeleteResponse = await axios.get(`/product/${id}/can-delete`);
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
        await axios.delete(`/product/${id}`);
        // Listeyi yenile
        try {
          setLoading(true);
          const response = await axios.get('/product', {
            params: { search: debouncedSearch, limit: 5000, page: 1 },
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
      const response = await axios.get(`/product/${malzeme.id}/esdegerler`);
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
        await axios.delete(`/product/${selectedMalzeme.id}/match`);
        alert(`✅ ${selectedMalzeme.stokKodu} ürününün eşleştirmesi kaldırıldı.`);
        handleCloseEslestirme();
        // Listeyi yenile
        try {
          setLoading(true);
          const response = await axios.get('/product', {
            params: { search: debouncedSearch, limit: 5000, page: 1 },
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
      const response = await axios.post('/product/match', {
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
        const response = await axios.get('/product', {
          params: { search: debouncedSearch, limit: 5000, page: 1 },
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
      await axios.delete(`/product/${stok.id}/match`);
      alert(`✅ ${stok.stokKodu} ürününün eşleştirmesi başarıyla kaldırıldı.`);
      // Listeyi yenile
      try {
        setLoading(true);
        const response = await axios.get('/product', {
          params: { search: debouncedSearch, limit: 5000, page: 1 },
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
    if (!Array.isArray(stoklar)) return [];
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
    100,
    !!hareketMalzeme?.id
  );
  // useStokHareketler hook already returns the array in data.
  // The property access here was redundant and causing issues.
  const hareketler = Array.isArray(hareketData) ? hareketData : [];

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

  const getHareketLabel = (hareket: any) => {
    const tip = hareket?.hareketTipi || '';
    const faturaTipi = hareket?.faturaKalemi?.fatura?.faturaTipi;
    const durum = hareket?.faturaKalemi?.fatura?.durum;
    if (tip === 'SALE' && durum === 'CANCELLED') return 'Satış faturası iptal';
    if (tip === 'ENTRY' && faturaTipi === 'PURCHASE' && durum === 'CANCELLED') return 'Satınalma faturası iptal';
    if (tip === 'RETURN' && faturaTipi === 'SALES_RETURN' && durum === 'CANCELLED') return 'Satış iadesi iptal';
    if (tip === 'RETURN' && faturaTipi === 'PURCHASE_RETURN' && durum === 'CANCELLED') return 'Alış iadesi iptal';
    const labels: Record<string, string> = {
      ENTRY: faturaTipi === 'PURCHASE' ? 'Satınalma faturası' : 'Giriş',
      EXIT: 'Çıkış',
      SALE: 'Satış faturası',
      RETURN: faturaTipi === 'PURCHASE_RETURN' ? 'Alış iadesi' : faturaTipi === 'SALES_RETURN' ? 'Satış iadesi' : 'İade',
      CANCELLATION_ENTRY: 'İptal',
      CANCELLATION_EXIT: 'İptal',
      COUNT: 'Sayım',
      COUNT_SURPLUS: 'Sayım fazlası',
      COUNT_SHORTAGE: 'Sayım eksiği',
    };
    return labels[tip] || tip;
  };

  const getFaturaDurumLabel = (hareket: any) => {
    const durum = hareket?.faturaKalemi?.fatura?.durum;
    if (!durum) {
      if (hareket?.hareketTipi === 'CANCELLATION_ENTRY' || hareket?.hareketTipi === 'CANCELLATION_EXIT') return 'İptal';
      return '-';
    }
    const labels: Record<string, string> = {
      APPROVED: 'Onaylandı',
      OPEN: 'Beklemede',
      CANCELLED: 'İptal',
      PARTIALLY_PAID: 'Kısmen Ödendi',
      CLOSED: 'Kapalı',
      DRAFT: 'Taslak',
    };
    return labels[durum] || durum;
  };

  const getFaturaDurumColor = (hareket: any): 'success' | 'error' | 'warning' | 'default' => {
    const durum = hareket?.faturaKalemi?.fatura?.durum;
    if (!durum) {
      if (hareket?.hareketTipi === 'CANCELLATION_ENTRY' || hareket?.hareketTipi === 'CANCELLATION_EXIT') return 'error';
      return 'default';
    }
    if (durum === 'CANCELLED') return 'error';
    if (durum === 'APPROVED') return 'success';
    if (durum === 'OPEN') return 'warning';
    return 'default';
  };

  // Eşdeğer ürünler dialog handler
  const handleOpenEsdegerDialog = useCallback(async (malzeme: Malzeme) => {
    setEsdegerMalzeme(malzeme);
    setEsdegerDialogOpen(true);
    setEsdegerLoading(true);
    setEsdegerUrunler([]);

    try {
      const response = await axios.get(`/product/${malzeme.id}/esdegerler`);
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
      ENTRY: 'success',
      EXIT: 'error',
      SALE: 'primary',
      RETURN: 'warning',
      CANCELLATION_ENTRY: 'error',
      CANCELLATION_EXIT: 'error',
      COUNT: 'default',
      COUNT_SURPLUS: 'success',
      COUNT_SHORTAGE: 'error',
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
      'Son Alış Fiyatı': Number(stok.sonAlisFiyati ?? stok.alisFiyati ?? 0),
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
  }, [selectedKategori, kategoriler]);

  const markaOptions = useMemo(() => {
    const collected = stoklar.map((s) => s.marka).filter(Boolean) as string[];
    return Array.from(new Set([...markalar, ...collected])).sort();
  }, [stoklar, markalar]);



  return (
    <MainLayout>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2.5,
          border: '1px solid var(--border)',
          borderRadius: 2,
          bgcolor: 'var(--card)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Malzeme Listesi
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', mt: 0.5 }}>
              Stok kartlarını görüntüleyin, arayın ve yönetin.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              sx={{
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
                borderRadius: 1.5,
                px: 2,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { borderColor: 'var(--primary)', color: 'var(--primary)', bgcolor: 'var(--muted)' },
              }}
            >
              Excel'e Aktar
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                handleOpenDialog();
              }}
              sx={{
                bgcolor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 1.5,
                px: 2.5,
                py: 1.25,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                '&:hover': {
                  bgcolor: 'var(--primary)',
                  opacity: 0.92,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              Yeni Malzeme Ekle
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Arama ve Filtreleme Alanı */}
      <Paper sx={{ mb: 3, p: 2, bgcolor: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small" className="form-control-select">
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
            <FormControl fullWidth size="small" disabled={!selectedKategori} className="form-control-select">
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
            <FormControl fullWidth size="small" className="form-control-select">
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
            <FormControl fullWidth size="small" className="form-control-select">
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
      </Paper >

      <Paper sx={{ width: '100%', bgcolor: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <MaterialSearchBar
          search={search}
          setSearch={setSearch}
          onSearch={fetchStoklar}
          onRefresh={fetchStoklar}
        />
        <Box sx={{ height: 1420, width: '100%' }}>
          <DataGrid
            rows={filteredStoklar}
            columns={[
              {
                field: 'stokKodu',
                headerName: 'Stok Kodu',
                flex: 1.5,
                minWidth: 150,
                renderCell: (params: GridRenderCellParams) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', height: '100%' }}>
                    <Typography variant="body2" fontWeight="600" sx={{ color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {params.value}
                    </Typography>
                    <Tooltip title="Eşdeğer ürünleri göster">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEsdegerDialog(params.row);
                        }}
                        sx={{
                          padding: '4px',
                          color: 'var(--primary)',
                          '&:hover': {
                            bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                          },
                        }}
                      >
                        <CompareArrows fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ),
              },
              {
                field: 'stokAdi',
                headerName: 'Stok Adı',
                flex: 2,
                minWidth: 200,
              },
              {
                field: 'marka',
                headerName: 'Marka',
                flex: 1,
                minWidth: 100,
                valueFormatter: (value) => value || '-',
              },
              {
                field: 'raf',
                headerName: 'Raf Adresi',
                flex: 1,
                minWidth: 120,
                renderCell: (params: GridRenderCellParams) => (
                  params.value ? (
                    <Chip
                      label={params.value}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.75rem',
                        borderColor: 'var(--primary)',
                        color: 'var(--primary)',
                        bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                      }}
                    />
                  ) : (
                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                      Raf atanmamış
                    </Typography>
                  )
                ),
              },
              {
                field: 'aracBilgisi',
                headerName: 'Araç Bilgileri',
                flex: 1.5,
                minWidth: 180,
                renderCell: (params: GridRenderCellParams) => {
                  const row = params.row;
                  if (!row.aracMarka && !row.aracModel && !row.aracMotorHacmi && !row.aracYakitTipi) {
                    return <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>-</Typography>;
                  }
                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                      {row.aracMarka && (
                        <Typography variant="caption" fontWeight="600" sx={{ color: 'var(--chart-1)', lineHeight: 1.2 }}>
                          {row.aracMarka}
                        </Typography>
                      )}
                      {row.aracModel && (
                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', lineHeight: 1.2 }}>
                          {row.aracModel}
                        </Typography>
                      )}
                    </Box>
                  );
                },
              },
              {
                field: 'miktar',
                headerName: 'Miktar',
                type: 'number',
                width: 100,
                align: 'center',
                headerAlign: 'center',
                renderCell: (params: GridRenderCellParams) => (
                  <Chip
                    label={params.value || 0}
                    size="small"
                    sx={{
                      bgcolor: (params.value || 0) > 0
                        ? 'color-mix(in srgb, var(--chart-2) 15%, transparent)'
                        : 'color-mix(in srgb, var(--destructive) 15%, transparent)',
                      color: (params.value || 0) > 0 ? 'var(--chart-2)' : 'var(--destructive)',
                      fontWeight: 600,
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  />
                ),
              },
              {
                field: 'birim',
                headerName: 'Birim',
                width: 80,
              },
              {
                field: 'sonAlisFiyati',
                headerName: 'Son Alış Fiyatı',
                type: 'number',
                width: 140,
                align: 'right',
                headerAlign: 'right',
                valueGetter: (value, row) => value ?? row.alisFiyati,
                valueFormatter: (value) => {
                  if (value == null) return '';
                  return `₺${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                },
              },
              {
                field: 'satisFiyati',
                headerName: 'Satış Fiyatı',
                type: 'number',
                width: 120,
                align: 'right',
                headerAlign: 'right',
                renderCell: (params: GridRenderCellParams) => (
                  <Typography variant="body2" fontWeight="600" sx={{ color: 'var(--primary)', width: '100%', textAlign: 'right' }}>
                    ₺{Number(params.value || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                ),
              },
              {
                field: 'actions',
                headerName: 'İşlemler',
                width: 160,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams) => (
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', width: '100%' }}>
                    <Tooltip title="Düzenle">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(params.row);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ambar Toplamları">
                      <IconButton
                        size="small"
                        color="info"
                        href={`/stok/${params.row.id}/ambar-toplamlari`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Warehouse fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hareketler">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenHareketDialog(params.row);
                        }}
                      >
                        <History fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(params.row.id);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )
              },
            ]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25, page: 0 },
              },
            }}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            loading={loading}
            localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
            slots={{
              toolbar: GridToolbar
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: false,
              }
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: 'var(--border)',
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 700,
                color: 'var(--foreground)',
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: 'var(--muted)',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid var(--border)',
              },
            }}
          />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
          Toplam {filteredStoklar.length} malzeme gösteriliyor
        </Typography>
      </Box>

      <Dialog
        open={hareketDialogOpen}
        onClose={handleCloseHareketDialog}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle component="div">
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
                  <MenuItem value="ENTRY">Giriş / Satınalma</MenuItem>
                  <MenuItem value="EXIT">Çıkış</MenuItem>
                  <MenuItem value="SALE">Satış faturası</MenuItem>
                  <MenuItem value="RETURN">İade</MenuItem>
                  <MenuItem value="CANCELLATION_ENTRY">İptal (giriş)</MenuItem>
                  <MenuItem value="CANCELLATION_EXIT">İptal (çıkış)</MenuItem>
                  <MenuItem value="COUNT">Sayım</MenuItem>
                  <MenuItem value="COUNT_SURPLUS">Sayım fazlası</MenuItem>
                  <MenuItem value="COUNT_SHORTAGE">Sayım eksiği</MenuItem>
                </Select>
              </FormControl>

              <TableContainer component={Paper} sx={{ maxHeight: 420, '& .MuiTableCell-root': { color: 'var(--foreground)' } }}>
                <Table stickyHeader size="small">
                  <TableHead sx={{ bgcolor: 'var(--muted)' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'var(--foreground)' }}><strong>Tarih</strong></TableCell>
                      <TableCell sx={{ color: 'var(--foreground)' }}><strong>İşlem Türü</strong></TableCell>
                      <TableCell sx={{ color: 'var(--foreground)' }}><strong>Fatura Durumu</strong></TableCell>
                      <TableCell sx={{ color: 'var(--foreground)' }}><strong>Ambar</strong></TableCell>
                      <TableCell sx={{ color: 'var(--foreground)' }}><strong>Cari</strong></TableCell>
                      <TableCell align="right" sx={{ color: 'var(--foreground)' }}><strong>Miktar</strong></TableCell>
                      <TableCell align="right" sx={{ color: 'var(--foreground)' }}><strong>Birim Fiyat</strong></TableCell>
                      <TableCell align="right" sx={{ color: 'var(--foreground)' }}><strong>Toplam</strong></TableCell>
                      <TableCell sx={{ color: 'var(--foreground)' }}><strong>Açıklama</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hareketlerLoading ? (
                      <TableSkeleton rows={5} columns={6} />
                    ) : hareketler.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                            Bu ürün için hareket kaydı bulunamadı.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      hareketler.map((hareket: any) => {
                        const birimFiyat = Number(hareket.birimFiyat ?? hareket.faturaKalemi?.birimFiyat ?? 0);
                        const toplamTutar = (hareket.miktar || 0) * birimFiyat;
                        const cariBilgi = hareket.faturaKalemi?.fatura?.cari;
                        const cariLabel = cariBilgi ? `${cariBilgi.cariKodu || ''} - ${cariBilgi.unvan || ''}`.trim() : '-';
                        return (
                          <TableRow key={hareket.id} hover>
                            <TableCell>
                              <Typography variant="caption" sx={{ color: 'var(--foreground)' }}>
                                {formatHareketDate(hareket.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getHareketLabel(hareket)}
                                color={getHareketColor(hareket.hareketTipi)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getFaturaDurumLabel(hareket)}
                                color={getFaturaDurumColor(hareket)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                                {hareket.warehouse?.name || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                                {cariLabel}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="600" sx={{ color: 'var(--foreground)' }}>
                                {(hareket.miktar || 0).toLocaleString('tr-TR')}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                                {formatMoney(birimFiyat)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="600" sx={{ color: 'var(--foreground)' }}>
                                {formatMoney(toplamTutar)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
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
          <Button onClick={handleCloseHareketDialog} autoFocus>Kapat</Button>
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
        birimSetleri={birimSetleri}
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
        PaperProps={{
          sx: {
            bgcolor: 'var(--card)',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle component="div" sx={{
          bgcolor: 'var(--secondary)',
          color: 'var(--secondary-foreground)',
          py: 2,
          borderBottom: '1px solid var(--border)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareArrows sx={{ color: 'var(--secondary-foreground)' }} />
            <Typography variant="h6" fontWeight={700}>
              Eşdeğer Ürünler
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, bgcolor: 'var(--background)' }}>
          {esdegerMalzeme && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'color-mix(in srgb, var(--primary) 5%, transparent)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', mb: 0.5 }}>
                Ürün:
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'var(--primary)' }}>
                {esdegerMalzeme.stokKodu} - {esdegerMalzeme.stokAdi}
              </Typography>
            </Box>
          )}

          {esdegerLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                Yükleniyor...
              </Typography>
            </Box>
          ) : esdegerUrunler.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CompareArrows sx={{ fontSize: 48, color: 'var(--muted-foreground)', mb: 2 }} />
              <Typography variant="body1" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>
                Bu ürünün eşdeğeri bulunmamaktadır
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', mt: 1 }}>
                Eşdeğer ürünleri eklemek için eşleştirme yapabilirsiniz
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                    <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}><strong>Stok Kodu</strong></TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}><strong>Stok Adı</strong></TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}><strong>Marka</strong></TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}><strong>Miktar</strong></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}><strong>Alış Fiyatı</strong></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground) !important' }}><strong>Satış Fiyatı</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {esdegerUrunler.map((urun: any) => (
                    <TableRow
                      key={urun.id}
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
                        <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--primary)' }}>
                          {urun.stokKodu}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: 'var(--foreground)' }}>{urun.stokAdi}</TableCell>
                      <TableCell sx={{ color: 'var(--muted-foreground)' }}>{urun.marka || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={urun.miktar ?? 0}
                          size="small"
                          sx={{
                            bgcolor: urun.miktar > 0
                              ? 'color-mix(in srgb, var(--chart-2) 15%, transparent)'
                              : 'color-mix(in srgb, var(--destructive) 15%, transparent)',
                            color: urun.miktar > 0 ? 'var(--chart-2)' : 'var(--destructive)',
                            borderColor: urun.miktar > 0 ? 'var(--chart-2)' : 'var(--destructive)',
                          }}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                          ₺{Number(urun.alisFiyati ?? 0).toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--primary)' }}>
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
        <DialogActions sx={{ px: 3, pb: 2, bgcolor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
          <Button
            onClick={handleCloseEsdegerDialog}
            variant="outlined"
            autoFocus
            sx={{
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
              '&:hover': {
                borderColor: 'var(--primary)',
                bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
              },
            }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout >
  );
}

