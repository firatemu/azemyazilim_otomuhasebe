'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  QrCodeScanner,
  Inventory2,
  UploadFile,
  Download,
  Delete,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';

interface Product {
  id: string;
  stokKodu: string;
  stokAdi: string;
  marka?: string;
  birim: string;
}

interface Warehouse {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

interface Location {
  id: string;
  warehouseId: string;
  code: string;
  barcode: string;
  name?: string;
  active: boolean;
  warehouse: {
    code: string;
    name: string;
  };
}

interface ExcelRow {
  stokKodu: string;
  depoKodu: string;
  rafKodu: string;
  miktar: number;
  not?: string;
}

interface ParsedExcelRow extends ExcelRow {
  productId?: string;
  warehouseId?: string;
  locationId?: string;
  error?: string;
  status?: 'pending' | 'success' | 'error';
}

interface ProductStockDetail {
  warehouseCode: string;
  locationCode: string;
  qty: number;
}

function PutAwayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLocationId = searchParams.get('locationId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [productStockDetails, setProductStockDetails] = useState<ProductStockDetail[]>([]);
  
  // İşlem modu: 'address' = Raf adresi tanımlama, 'stock' = Stok yerleştirme
  const [islemModu, setIslemModu] = useState<'address' | 'stock'>('stock');
  const [mevcutStok, setMevcutStok] = useState<number>(0);

  // Tek işlem için state'ler
  const [formData, setFormData] = useState({
    productId: '',
    toWarehouseId: '',
    toLocationId: preselectedLocationId || '',
    qty: 1,
    note: '',
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Toplu işlem için state'ler
  const [excelData, setExcelData] = useState<ParsedExcelRow[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [resultDialog, setResultDialog] = useState({ open: false, success: 0, failed: 0, details: [] as any[] });

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/stok', {
        params: { limit: 1000 }
      });
      setProducts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Ürün listesi alınamadı:', error);
      setProducts([]);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/warehouse', { params: { active: true } });
      setWarehouses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Depo listesi alınamadı:', error);
      setWarehouses([]);
    }
  };

  const fetchLocations = async (warehouseId: string) => {
    try {
      const response = await axios.get('/location', {
        params: { warehouseId, active: true },
      });
      setLocations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Raf listesi alınamadı:', error);
      setLocations([]);
    }
  };

  const fetchAllLocations = async () => {
    try {
      const response = await axios.get('/location', { params: { active: true } });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Tüm raf listesi alınamadı:', error);
      return [];
    }
  };

  const fetchPreselectedLocation = async () => {
    if (preselectedLocationId) {
      try {
        const response = await axios.get(`/location/${preselectedLocationId}`);
        const location = response.data;
        setSelectedLocation(location);
        setSelectedWarehouse({
          id: location.warehouseId,
          code: location.warehouse.code,
          name: location.warehouse.name,
          active: true,
        });
        setFormData({
          ...formData,
          toWarehouseId: location.warehouseId,
          toLocationId: location.id,
        });
        fetchLocations(location.warehouseId);
      } catch (error) {
        console.error('Raf bilgisi alınamadı:', error);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
    if (preselectedLocationId) {
      fetchPreselectedLocation();
    }
  }, [preselectedLocationId]);

  const handleWarehouseChange = (warehouse: Warehouse | null) => {
    setSelectedWarehouse(warehouse);
    setSelectedLocation(null);
    setFormData({
      ...formData,
      toWarehouseId: warehouse?.id || '',
      toLocationId: '',
    });
    
    if (warehouse) {
      fetchLocations(warehouse.id);
    } else {
      setLocations([]);
    }
  };

  const handleLocationChange = (location: Location | null) => {
    setSelectedLocation(location);
    setFormData({
      ...formData,
      toLocationId: location?.id || '',
    });
  };

  const handleSubmit = async () => {
    // Validasyon
    if (!formData.productId || !formData.toWarehouseId || !formData.toLocationId) {
      setSnackbar({ open: true, message: 'Lütfen ürün, depo ve raf seçin', severity: 'error' });
      return;
    }

    // Stok Yerleştir modunda miktar zorunlu
    if (islemModu === 'stock' && formData.qty <= 0) {
      setSnackbar({ open: true, message: 'Stok yerleştir modunda miktar girmelisiniz', severity: 'error' });
      return;
    }

    // Stok Yerleştir modunda toplam stok kontrolü
    if (islemModu === 'stock' && formData.qty > mevcutStok) {
      setSnackbar({ 
        open: true, 
        message: `Hata: Toplam stoğunuz (${mevcutStok}) yetersiz! Maksimum ${mevcutStok} adet yerleştirebilirsiniz.`, 
        severity: 'error' 
      });
      return;
    }

    try {
      setLoading(true);
      
      const endpoint = islemModu === 'address' ? '/stock-move/assign-location' : '/stock-move/put-away';
      const payload: any = {
        productId: formData.productId,
        toWarehouseId: formData.toWarehouseId,
        toLocationId: formData.toLocationId,
        note: formData.note || undefined,
      };

      // Sadece Stok Yerleştir modunda miktar gönder
      if (islemModu === 'stock') {
        payload.qty = formData.qty;
      }

      await axios.post(endpoint, payload);
      
      const message = islemModu === 'address' 
        ? 'Raf adresi başarıyla tanımlandı'
        : `${formData.qty} adet ürün başarıyla rafa yerleştirildi`;
      
      setSnackbar({ open: true, message, severity: 'success' });
      
      // Form temizle
      setTimeout(() => {
        if (preselectedLocationId) {
          setSelectedProduct(null);
          setFormData({
            ...formData,
            productId: '',
            qty: 1,
            note: '',
          });
        } else {
          setSelectedProduct(null);
          setSelectedWarehouse(null);
          setSelectedLocation(null);
          setFormData({
            productId: '',
            toWarehouseId: '',
            toLocationId: '',
            qty: 1,
            note: '',
          });
          setLocations([]);
        }
      }, 1500);
    } catch (error: any) {
      console.error('Put-Away işlemi başarısız:', error);
      const message = error.response?.data?.message || 'Put-Away işlemi başarısız';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Excel işlemleri
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

      // Validate and parse data
      const allLocations = await fetchAllLocations();
      const parsedData: ParsedExcelRow[] = jsonData.map((row) => {
        const errors: string[] = [];
        
        // Validate required fields
        if (!row.stokKodu) errors.push('Stok Kodu eksik');
        if (!row.depoKodu) errors.push('Depo Kodu eksik');
        if (!row.rafKodu) errors.push('Raf Kodu eksik');
        if (!row.miktar || row.miktar <= 0) errors.push('Miktar geçersiz');

        // Find IDs
        const product = products.find(p => p.stokKodu === row.stokKodu);
        const warehouse = warehouses.find(w => w.code === row.depoKodu);
        const location = allLocations.find((l: Location) => l.code === row.rafKodu && l.warehouse.code === row.depoKodu);

        if (!product) errors.push('Ürün bulunamadı');
        if (!warehouse) errors.push('Depo bulunamadı');
        if (!location) errors.push('Raf bulunamadı');

        return {
          ...row,
          productId: product?.id,
          warehouseId: warehouse?.id,
          locationId: location?.id,
          error: errors.length > 0 ? errors.join(', ') : undefined,
          status: errors.length > 0 ? 'error' : 'pending',
        };
      });

      setExcelData(parsedData);
      setSnackbar({ 
        open: true, 
        message: `${parsedData.length} satır yüklendi. ${parsedData.filter(r => r.status === 'error').length} hatalı satır var.`, 
        severity: parsedData.filter(r => r.status === 'error').length > 0 ? 'warning' : 'success' 
      });
    } catch (error) {
      console.error('Excel okuma hatası:', error);
      setSnackbar({ open: true, message: 'Excel dosyası okunamadı', severity: 'error' });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBulkSubmit = async () => {
    const validRows = excelData.filter(row => row.status !== 'error' && row.productId && row.warehouseId && row.locationId);
    
    if (validRows.length === 0) {
      setSnackbar({ open: true, message: 'Geçerli satır bulunamadı', severity: 'error' });
      return;
    }

    try {
      setBulkLoading(true);
      
      const operations = validRows.map(row => ({
        productId: row.productId!,
        toWarehouseId: row.warehouseId!,
        toLocationId: row.locationId!,
        qty: row.miktar,
        note: row.not,
      }));

      const response = await axios.post('/stock-move/put-away/bulk', { operations });
      
      setResultDialog({
        open: true,
        success: response.data.successCount,
        failed: response.data.failedCount,
        details: [...response.data.success, ...response.data.failed],
      });

      // Update excel data statuses
      const updatedData: ParsedExcelRow[] = excelData.map((row, index) => {
        const successMatch = response.data.success.find((s: any) => s.index === index + 1);
        const failedMatch = response.data.failed.find((f: any) => f.index === index + 1);
        const result = successMatch || failedMatch;

        if (result) {
          const status: 'success' | 'error' =
            successMatch ? 'success' : 'error';

          return {
            ...row,
            status,
            error: (result.error as string | undefined) || row.error,
          };
        }
        return row;
      });
      setExcelData(updatedData);
      
    } catch (error: any) {
      console.error('Toplu işlem hatası:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Toplu işlem başarısız', severity: 'error' });
    } finally {
      setBulkLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { stokKodu: 'ST001', depoKodu: 'D1', rafKodu: 'K1-A1-1-1', miktar: 10, not: 'Örnek not' },
      { stokKodu: 'ST002', depoKodu: 'D1', rafKodu: 'K1-A1-2-1', miktar: 5, not: '' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Put-Away Şablonu');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // stokKodu
      { wch: 12 }, // depoKodu
      { wch: 15 }, // rafKodu
      { wch: 10 }, // miktar
      { wch: 30 }, // not
    ];

    XLSX.writeFile(workbook, 'put-away-sablonu.xlsx');
  };

  const clearExcelData = () => {
    setExcelData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            📥 Put-Away İşlemi
          </Typography>
        </Stack>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Ürünü rafa yerleştirmek için tek tek veya Excel ile toplu işlem yapabilirsiniz.
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Tek İşlem" />
          <Tab label="Toplu İşlem (Excel)" />
        </Tabs>
      </Paper>

      {/* Tab 0: Tek İşlem */}
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Form */}
          <Box sx={{ flex: '1 1 600px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                İşlem Bilgileri
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* İşlem Modu Seçimi */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  İşlem Modu *
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Chip
                    label="Raf Adresi Tanımla"
                    color={islemModu === 'address' ? 'primary' : 'default'}
                    onClick={() => setIslemModu('address')}
                    icon={islemModu === 'address' ? <CheckCircle /> : undefined}
                  />
                  <Chip
                    label="Stok Yerleştir"
                    color={islemModu === 'stock' ? 'success' : 'default'}
                    onClick={() => setIslemModu('stock')}
                    icon={islemModu === 'stock' ? <CheckCircle /> : undefined}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {islemModu === 'address' 
                    ? '📍 Sadece ürünün hangi rafta olduğunu kaydeder (stok hareketi olmaz)'
                    : '📦 Gerçek stok miktarını raflara yerleştirir (toplam stok kontrolü yapılır)'}
                </Typography>
              </Box>

              {/* Ürün Seçimi */}
              <Autocomplete
                fullWidth
                options={products}
                getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                value={selectedProduct}
                onChange={async (_, newValue) => {
                  setSelectedProduct(newValue);
                  setFormData((prev) => ({ ...prev, productId: newValue?.id || '' }));
                  
                  if (newValue?.id) {
                    try {
                      const stokResponse = await axios.get(`/stok/${newValue.id}`);
                      const stokDetay = stokResponse.data;

                      const totalStock = typeof stokDetay?.totalStock === 'number'
                        ? stokDetay.totalStock
                        : Array.isArray(stokDetay?.stokHareketleri)
                          ? stokDetay.stokHareketleri.reduce((acc: number, hareket: any) => {
                              if (['GIRIS', 'IADE', 'SAYIM_FAZLA'].includes(hareket.hareketTipi)) {
                                return acc + (hareket.miktar ?? 0);
                              }
                              if (['CIKIS', 'SATIS', 'SAYIM_EKSIK'].includes(hareket.hareketTipi)) {
                                return acc - (hareket.miktar ?? 0);
                              }
                              return acc;
                            }, 0)
                          : 0;

                      const rafDetaylari = Array.isArray(stokDetay?.productLocationStocks)
                        ? stokDetay.productLocationStocks
                            .filter((pls: any) => (pls.qtyOnHand ?? 0) > 0)
                            .map((pls: any) => ({
                              warehouseCode: pls.warehouse?.code ?? pls.location?.warehouse?.code ?? '-',
                              locationCode: pls.location?.code ?? '-',
                              qty: pls.qtyOnHand ?? 0,
                            }))
                        : [];

                      setMevcutStok(Math.max(0, totalStock));
                      setProductStockDetails(rafDetaylari);
                      setFormData((prev) => ({
                        ...prev,
                        qty: totalStock > 0 ? Math.min(prev.qty, totalStock) : 0,
                      }));
                    } catch (error) {
                      console.error('Stok bilgisi alınamadı:', error);
                      setMevcutStok(0);
                      setProductStockDetails([]);
                      setFormData((prev) => ({ ...prev, qty: 0 }));
                    }
                  } else {
                    setMevcutStok(0);
                    setProductStockDetails([]);
                    setFormData((prev) => ({ ...prev, qty: 0 }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ürün *"
                    placeholder="Ürün ara..."
                    helperText="Ürün koduna veya adına göre arama yapın"
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {option.stokKodu}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.stokAdi} {option.marka && `• ${option.marka}`}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
                sx={{ mb: 3 }}
              />

              {/* Hedef Depo Seçimi */}
              <Autocomplete
                fullWidth
                options={warehouses}
                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                value={selectedWarehouse}
                onChange={(_, newValue) => handleWarehouseChange(newValue)}
                disabled={!!preselectedLocationId}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Hedef Depo *"
                    placeholder="Depo seç..."
                  />
                )}
                sx={{ mb: 3 }}
              />

              {/* Hedef Raf Seçimi */}
              <Autocomplete
                fullWidth
                options={locations}
                getOptionLabel={(option) => `${option.code} ${option.name ? `- ${option.name}` : ''}`}
                value={selectedLocation}
                onChange={(_, newValue) => handleLocationChange(newValue)}
                disabled={!formData.toWarehouseId || !!preselectedLocationId}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Hedef Raf *"
                    placeholder="Raf seç..."
                    helperText={!formData.toWarehouseId ? 'Önce depo seçin' : ''}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {option.code}
                        </Typography>
                        {option.name && (
                          <Typography variant="caption" color="text.secondary">
                            {option.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                }}
                sx={{ mb: 3 }}
              />

              {/* Miktar - Sadece Stok Yerleştir modunda */}
              {islemModu === 'stock' && (
                <>
                  {/* Toplam Stok Göstergesi */}
                  {selectedProduct && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f0f9ff', borderColor: '#3b82f6' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                          Mevcut Toplam Stok:
                        </Typography>
                        <Chip 
                          label={`${mevcutStok} ${selectedProduct.birim || 'Adet'}`} 
                          color={mevcutStok > 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    </Paper>
                  )}

                  <TextField
                    fullWidth
                    type="number"
                    label="Miktar *"
                    value={formData.qty}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        setFormData({ ...formData, qty: value === '' ? 0 : parseInt(value, 10) });
                      }
                    }}
                    inputProps={{ min: 1, max: mevcutStok }}
                    helperText={`Rafa yerleştirilecek ürün adedi (Maksimum: ${mevcutStok})`}
                    error={formData.qty > mevcutStok}
                    sx={{ mb: 3 }}
                  />
                </>
              )}

              {/* Not */}
              <TextField
                fullWidth
                label="Not (opsiyonel)"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                multiline
                rows={3}
                placeholder="Ek açıklama veya not ekleyin..."
                sx={{ mb: 3 }}
              />

              {/* Kaydet Butonu */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSubmit}
                disabled={
                  loading || 
                  !formData.productId || 
                  !formData.toWarehouseId || 
                  !formData.toLocationId || 
                  (islemModu === 'stock' && formData.qty <= 0) ||
                  (islemModu === 'stock' && formData.qty > mevcutStok)
                }
              >
                {loading ? 'Kaydediliyor...' : (islemModu === 'address' ? 'Raf Adresini Kaydet' : 'Stok Yerleştir')}
              </Button>
            </Paper>
          </Box>

          {/* Özet Card */}
          <Box sx={{ flex: '0 1 350px' }}>
            <Card sx={{ bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 İşlem Özeti
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    İşlem Modu
                  </Typography>
                  <Chip
                    label={islemModu === 'address' ? 'Raf Adresi Tanımla' : 'Stok Yerleştir'}
                    color={islemModu === 'address' ? 'primary' : 'success'}
                    size="small"
                    sx={{ display: 'block', width: 'fit-content' }}
                  />
                </Box>

                {selectedProduct && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Ürün
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedProduct.stokKodu}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedProduct.stokAdi}
                    </Typography>
                  </Box>
                )}

                {selectedWarehouse && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Hedef Depo
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedWarehouse.code} - {selectedWarehouse.name}
                    </Typography>
                  </Box>
                )}

                {selectedLocation && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Hedef Raf
                    </Typography>
                    <Chip
                      label={selectedLocation.code}
                      color="primary"
                      sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                    />
                    {selectedLocation.name && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        {selectedLocation.name}
                      </Typography>
                    )}
                  </Box>
                )}

                {islemModu === 'stock' && selectedProduct && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: '#e0f2fe', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Mevcut Toplam Stok
                    </Typography>
                    <Typography variant="h5" color={mevcutStok > 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                      {mevcutStok} {selectedProduct.birim || 'Adet'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Kalan Yerleştirilebilir: {Math.max(0, mevcutStok - formData.qty)} {selectedProduct.birim || 'Adet'}
                    </Typography>
                    {productStockDetails.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Raflara Dağılım
                        </Typography>
                        <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {productStockDetails.map((raf: ProductStockDetail, index: number) => (
                            <Stack key={`${raf.warehouseCode}-${raf.locationCode}-${index}`} direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={`${raf.warehouseCode}/${raf.locationCode}`}
                                size="small"
                                color="primary"
                                sx={{ fontFamily: 'monospace' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {raf.qty} {selectedProduct.birim || 'Adet'}
                              </Typography>
                            </Stack>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}

                {islemModu === 'stock' && formData.qty > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Yerleştirilecek Miktar
                    </Typography>
                    <Typography variant="h4" color={formData.qty > mevcutStok ? 'error.main' : 'primary'} fontWeight="bold">
                      {formData.qty}
                    </Typography>
                  </Box>
                )}
                {productStockDetails.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Raflara Dağılım
                    </Typography>
                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                      {productStockDetails.map((raf: ProductStockDetail, index: number) => (
                        <Stack
                          key={`${raf.warehouseCode}-${raf.locationCode}-${index}`}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ fontSize: 12 }}
                        >
                          <Chip
                            label={`${raf.warehouseCode}/${raf.locationCode}`}
                            size="small"
                            color="primary"
                            sx={{ fontFamily: 'monospace' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {raf.qty} {selectedProduct?.birim || 'Adet'}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                )}

                {!selectedProduct && !selectedWarehouse && !selectedLocation && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Inventory2 sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Form dolduruldukça özet burada görünecek
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Bilgilendirme */}
            <Alert severity={islemModu === 'address' ? 'info' : 'warning'} sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                {islemModu === 'address' ? 'Raf Adresi Tanımlama' : 'Stok Yerleştirme'}
              </Typography>
              <Typography variant="caption">
                {islemModu === 'address' 
                  ? 'Ürünün hangi rafta bulunduğunu kaydeder. Stok hareketi oluşturmaz, sadece konum bilgisi tanımlar.'
                  : 'Gerçek stok miktarını rafa yerleştirir. Toplam stoğunuz kontrol edilir ve StokMove kaydı oluşturulur.'}
              </Typography>
            </Alert>
          </Box>
        </Box>
      )}

      {/* Tab 1: Toplu İşlem (Excel) */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Excel ile Toplu Put-Away İşlemi
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Excel Formatı:
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>stokKodu</strong>: Ürün stok kodu (örn: ST001)
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>depoKodu</strong>: Hedef depo kodu (örn: D1)
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>rafKodu</strong>: Hedef raf kodu (örn: K1-A1-1-1)
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>miktar</strong>: Yerleştirilecek miktar (sayı)
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>not</strong>: Açıklama (opsiyonel)
                </Typography>
              </Alert>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={downloadTemplate}
                >
                  Şablon İndir
                </Button>
                
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadFile />}
                >
                  Excel Yükle
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                  />
                </Button>

                {excelData.length > 0 && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={bulkLoading ? <CircularProgress size={20} /> : <Save />}
                      onClick={handleBulkSubmit}
                      disabled={bulkLoading || excelData.filter(r => r.status !== 'error').length === 0}
                    >
                      {bulkLoading ? 'Kaydediliyor...' : `${excelData.filter(r => r.status !== 'error').length} İşlemi Kaydet`}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={clearExcelData}
                    >
                      Temizle
                    </Button>
                  </>
                )}
              </Stack>

              {excelData.length > 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width={50}>Durum</TableCell>
                        <TableCell>Stok Kodu</TableCell>
                        <TableCell>Depo</TableCell>
                        <TableCell>Raf</TableCell>
                        <TableCell align="right">Miktar</TableCell>
                        <TableCell>Not</TableCell>
                        <TableCell>Hata/Sonuç</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {excelData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {row.status === 'success' && <CheckCircle color="success" />}
                            {row.status === 'error' && <ErrorIcon color="error" />}
                            {row.status === 'pending' && <Chip label="Bekliyor" size="small" />}
                          </TableCell>
                          <TableCell>{row.stokKodu}</TableCell>
                          <TableCell>{row.depoKodu}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {row.rafKodu}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{row.miktar}</TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {row.not || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {row.error && (
                              <Typography variant="caption" color="error">
                                {row.error}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {excelData.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <UploadFile sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Excel dosyası yükleyerek başlayın
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Önce şablonu indirip doldurun, sonra yükleyin
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Sonuç Dialog */}
      <Dialog open={resultDialog.open} onClose={() => setResultDialog({ ...resultDialog, open: false })} maxWidth="md" fullWidth>
        <DialogTitle>
          Toplu İşlem Sonucu
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h4" color="success.main">
                ✓ {resultDialog.success} Başarılı
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="error.main">
                ✗ {resultDialog.failed} Başarısız
              </Typography>
            </Box>
          </Stack>
          
          {resultDialog.details.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Detaylar:
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {resultDialog.details.map((detail, index) => (
                  <Alert 
                    key={index} 
                    severity={detail.error ? 'error' : 'success'} 
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="caption">
                      Satır {detail.index}: {detail.error || 'Başarılı'}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialog({ ...resultDialog, open: false })}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

export default function PutAwayPage() {
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
      <PutAwayPageContent />
    </Suspense>
  );
}
