'use client';

import React, { Suspense, useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  ArrowBack,
  Save,
  SwapHoriz,
  Inventory2,
  ArrowForward,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';

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

interface ProductStock {
  product: Product;
  qtyOnHand: number;
}

function TransferPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFromLocationId = searchParams.get('fromLocationId');

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [fromLocations, setFromLocations] = useState<Location[]>([]);
  const [toLocations, setToLocations] = useState<Location[]>([]);
  const [productsInFromLocation, setProductsInFromLocation] = useState<ProductStock[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const [formData, setFormData] = useState({
    productId: '',
    fromWarehouseId: '',
    fromLocationId: preselectedFromLocationId || '',
    toWarehouseId: '',
    toLocationId: '',
    qty: 1,
    note: '',
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [fromWarehouse, setFromWarehouse] = useState<Warehouse | null>(null);
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toWarehouse, setToWarehouse] = useState<Warehouse | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);
  const [availableQty, setAvailableQty] = useState<number>(0);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product', {
        params: { limit: 1000 } // Tüm ürünleri getir
      });
      // Backend { data, meta } yapısında döndürüyor
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

  const fetchLocations = async (warehouseId: string, setLocationsFunc: (locations: Location[]) => void) => {
    try {
      const response = await axios.get('/location', {
        params: { warehouseId, active: true },
      });
      setLocationsFunc(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Raf listesi alınamadı:', error);
      setLocationsFunc([]);
    }
  };

  const fetchLocationDetails = async (locationId: string) => {
    try {
      const response = await axios.get(`/location/${locationId}`);
      const location = response.data;
      
      setFromLocation(location);
      setFromWarehouse({
        id: location.warehouseId,
        code: location.warehouse.code,
        name: location.warehouse.name,
        active: true,
      });
      setFormData({
        ...formData,
        fromWarehouseId: location.warehouseId,
        fromLocationId: location.id,
      });
      
      fetchLocations(location.warehouseId, setFromLocations);
      
      // Bu raftaki ürünleri listele
      const productsData: ProductStock[] = location.productLocationStocks.map((stock: any) => ({
        product: stock.product,
        qtyOnHand: stock.qtyOnHand,
      }));
      setProductsInFromLocation(productsData);
    } catch (error) {
      console.error('Raf bilgisi alınamadı:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
    
    if (preselectedFromLocationId) {
      fetchLocationDetails(preselectedFromLocationId);
    }
  }, [preselectedFromLocationId]);

  const handleFromWarehouseChange = (warehouse: Warehouse | null) => {
    setFromWarehouse(warehouse);
    setFromLocation(null);
    setFormData({
      ...formData,
      fromWarehouseId: warehouse?.id || '',
      fromLocationId: '',
    });
    
    if (warehouse) {
      fetchLocations(warehouse.id, setFromLocations);
    } else {
      setFromLocations([]);
    }
  };

  const handleFromLocationChange = async (location: Location | null) => {
    setFromLocation(location);
    setFormData({
      ...formData,
      fromLocationId: location?.id || '',
      productId: '',
      qty: 1,
    });
    setSelectedProduct(null);
    setAvailableQty(0);
    
    if (location) {
      // Bu raftaki ürünleri getir
      try {
        const response = await axios.get(`/location/${location.id}`);
        const productsData: ProductStock[] = response.data.productLocationStocks.map((stock: any) => ({
          product: stock.product,
          qtyOnHand: stock.qtyOnHand,
        }));
        setProductsInFromLocation(productsData);
      } catch (error) {
        console.error('Raf ürünleri alınamadı:', error);
      }
    } else {
      setProductsInFromLocation([]);
    }
  };

  const handleToWarehouseChange = (warehouse: Warehouse | null) => {
    setToWarehouse(warehouse);
    setToLocation(null);
    setFormData({
      ...formData,
      toWarehouseId: warehouse?.id || '',
      toLocationId: '',
    });
    
    if (warehouse) {
      fetchLocations(warehouse.id, setToLocations);
    } else {
      setToLocations([]);
    }
  };

  const handleToLocationChange = (location: Location | null) => {
    setToLocation(location);
    setFormData({
      ...formData,
      toLocationId: location?.id || '',
    });
  };

  const handleProductChange = (product: Product | null) => {
    setSelectedProduct(product);
    setFormData({ ...formData, productId: product?.id || '', qty: 1 });
    
    if (product) {
      const stockInfo = productsInFromLocation.find(p => p.product.id === product.id);
      setAvailableQty(stockInfo?.qtyOnHand || 0);
    } else {
      setAvailableQty(0);
    }
  };

  const handleSubmit = async () => {
    if (!formData.productId || !formData.fromWarehouseId || !formData.fromLocationId || 
        !formData.toWarehouseId || !formData.toLocationId || formData.qty <= 0) {
      setSnackbar({ open: true, message: 'Lütfen tüm alanları doldurun', severity: 'error' });
      return;
    }

    if (formData.qty > availableQty) {
      setSnackbar({ open: true, message: `Maksimum ${availableQty} adet transfer edilebilir`, severity: 'error' });
      return;
    }

    if (formData.fromLocationId === formData.toLocationId) {
      setSnackbar({ open: true, message: 'Kaynak ve hedef raf aynı olamaz', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      await axios.post('/stock-move/transfer', {
        productId: formData.productId,
        fromWarehouseId: formData.fromWarehouseId,
        fromLocationId: formData.fromLocationId,
        toWarehouseId: formData.toWarehouseId,
        toLocationId: formData.toLocationId,
        qty: formData.qty,
        note: formData.note || undefined,
      });
      
      setSnackbar({ open: true, message: 'Transfer işlemi başarılı', severity: 'success' });
      
      // Form temizle
      setTimeout(() => {
        if (preselectedFromLocationId) {
          // Kaynak raf önceden seçiliyse, sadece hedef ve ürünü temizle
          setSelectedProduct(null);
          setToWarehouse(null);
          setToLocation(null);
          setFormData({
            ...formData,
            productId: '',
            toWarehouseId: '',
            toLocationId: '',
            qty: 1,
            note: '',
          });
          setToLocations([]);
          setAvailableQty(0);
          // Kaynak raftaki ürünleri yenile
          if (fromLocation) {
            fetchLocationDetails(fromLocation.id);
          }
        } else {
          // Tümünü temizle
          setSelectedProduct(null);
          setFromWarehouse(null);
          setFromLocation(null);
          setToWarehouse(null);
          setToLocation(null);
          setFormData({
            productId: '',
            fromWarehouseId: '',
            fromLocationId: '',
            toWarehouseId: '',
            toLocationId: '',
            qty: 1,
            note: '',
          });
          setFromLocations([]);
          setToLocations([]);
          setProductsInFromLocation([]);
          setAvailableQty(0);
        }
      }, 1500);
    } catch (error: any) {
      console.error('Transfer işlemi başarısız:', error);
      const message = error.response?.data?.message || 'Transfer işlemi başarısız';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setLoading(false);
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
            🔄 Transfer İşlemi
          </Typography>
        </Stack>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Ürünü bir raftan başka bir rafa transfer etmek için bilgileri girin.
      </Typography>

      <Grid container spacing={3}>
        {/* Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            {/* Kaynak Raf Bilgileri */}
            <Typography variant="h6" gutterBottom color="primary">
              📤 Kaynak Raf
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Autocomplete
              fullWidth
              options={warehouses}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              value={fromWarehouse}
              onChange={(_, newValue) => handleFromWarehouseChange(newValue)}
              disabled={!!preselectedFromLocationId}
              renderInput={(params) => (
                <TextField {...params} label="Kaynak Depo *" placeholder="Depo seç..." />
              )}
              sx={{ mb: 3 }}
            />

            <Autocomplete
              fullWidth
              options={fromLocations}
              getOptionLabel={(option) => `${option.code} ${option.name ? `- ${option.name}` : ''}`}
              value={fromLocation}
              onChange={(_, newValue) => handleFromLocationChange(newValue)}
              disabled={!formData.fromWarehouseId || !!preselectedFromLocationId}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Kaynak Raf *"
                  placeholder="Raf seç..."
                  helperText={!formData.fromWarehouseId ? 'Önce depo seçin' : ''}
                />
              )}
              sx={{ mb: 3 }}
            />

            {/* Ürün Seçimi */}
            <Autocomplete
              fullWidth
              options={productsInFromLocation}
              getOptionLabel={(option) => `${option.product.stokKodu} - ${option.product.stokAdi} (Stok: ${option.qtyOnHand})`}
              value={productsInFromLocation.find(p => p.product.id === formData.productId) || null}
              onChange={(_, newValue) => handleProductChange(newValue?.product || null)}
              disabled={!formData.fromLocationId}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ürün *"
                  placeholder="Ürün seç..."
                  helperText={
                    !formData.fromLocationId 
                      ? 'Önce kaynak raf seçin' 
                      : productsInFromLocation.length === 0 
                        ? 'Bu rafta ürün yok' 
                        : `Bu rafta ${productsInFromLocation.length} farklı ürün var`
                  }
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {option.product.stokKodu}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.product.stokAdi} {option.product.marka && `• ${option.product.marka}`}
                      </Typography>
                      <Chip label={`Stok: ${option.qtyOnHand}`} size="small" sx={{ ml: 1 }} />
                    </Box>
                  </Box>
                );
              }}
              sx={{ mb: 3 }}
            />

            {/* Hedef Raf Bilgileri */}
            <Typography variant="h6" gutterBottom color="secondary" sx={{ mt: 4 }}>
              📥 Hedef Raf
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Autocomplete
              fullWidth
              options={warehouses}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              value={toWarehouse}
              onChange={(_, newValue) => handleToWarehouseChange(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Hedef Depo *" placeholder="Depo seç..." />
              )}
              sx={{ mb: 3 }}
            />

            <Autocomplete
              fullWidth
              options={toLocations}
              getOptionLabel={(option) => `${option.code} ${option.name ? `- ${option.name}` : ''}`}
              value={toLocation}
              onChange={(_, newValue) => handleToLocationChange(newValue)}
              disabled={!formData.toWarehouseId}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Hedef Raf *"
                  placeholder="Raf seç..."
                  helperText={!formData.toWarehouseId ? 'Önce depo seçin' : ''}
                />
              )}
              sx={{ mb: 3 }}
            />

            {/* Miktar ve Not */}
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
              inputProps={{ min: 1, max: availableQty }}
              helperText={availableQty > 0 ? `Maksimum ${availableQty} adet transfer edilebilir` : ''}
              error={formData.qty > availableQty}
              sx={{ mb: 3 }}
            />

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
                !formData.fromWarehouseId || 
                !formData.fromLocationId || 
                !formData.toWarehouseId || 
                !formData.toLocationId || 
                formData.qty <= 0 ||
                formData.qty > availableQty
              }
            >
              {loading ? 'Transfer Ediliyor...' : 'Transfer İşlemini Tamamla'}
            </Button>
          </Paper>
        </Grid>

        {/* Özet Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: 'var(--muted)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Transfer Özeti
              </Typography>
              <Divider sx={{ mb: 2 }} />

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
                  {availableQty > 0 && (
                    <Chip 
                      label={`Mevcut: ${availableQty}`} 
                      size="small" 
                      color="info" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              )}

              {fromLocation && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    📤 Kaynak
                  </Typography>
                  <Chip
                    label={fromLocation.code}
                    color="primary"
                    sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                  />
                </Box>
              )}

              {fromLocation && toLocation && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <ArrowForward sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              )}

              {toLocation && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    📥 Hedef
                  </Typography>
                  <Chip
                    label={toLocation.code}
                    color="secondary"
                    sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                  />
                </Box>
              )}

              {formData.qty > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Transfer Miktarı
                  </Typography>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {formData.qty}
                  </Typography>
                </Box>
              )}

              {!selectedProduct && !fromLocation && !toLocation && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <SwapHoriz sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Form dolduruldukça özet burada görünecek
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Bilgilendirme */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Transfer Nedir?
            </Typography>
            <Typography variant="caption">
              Ürünü bir raftan başka bir rafa taşıma işlemidir. Kaynak raftan düşülüp hedef rafa eklenir.
            </Typography>
          </Alert>
        </Grid>
      </Grid>

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

export default function TransferPage() {
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
      <TransferPageContent />
    </Suspense>
  );
}

