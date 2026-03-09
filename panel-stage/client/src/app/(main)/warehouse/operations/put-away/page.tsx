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
  Inventory2,
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

function PutAwayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLocationId = searchParams.get('locationId');

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  

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

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product', {
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

    try {
      setLoading(true);
      
      const payload: any = {
        productId: formData.productId,
        toWarehouseId: formData.toWarehouseId,
        toLocationId: formData.toLocationId,
        note: formData.note || undefined,
      };

      await axios.post('/stock-move/assign-location', payload);
      
      const message = 'Raf adresi başarıyla tanımlandı';
      
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
        Ürünün hangi rafta bulunduğunu kaydedin (raf adresi tanımlama).
      </Typography>

      {/* Tek İşlem Formu */}
      {(
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Form */}
          <Box sx={{ flex: '1 1 600px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                İşlem Bilgileri
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                📍 Ürünün hangi rafta olduğunu kaydeder (stok hareketi oluşturmaz)
              </Typography>

              {/* Ürün Seçimi */}
              <Autocomplete
                fullWidth
                options={products}
                getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                value={selectedProduct}
                onChange={(_, newValue) => {
                  setSelectedProduct(newValue);
                  setFormData((prev) => ({ ...prev, productId: newValue?.id || '' }));
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
                  !formData.toLocationId
                }
              >
                {loading ? 'Kaydediliyor...' : 'Raf Adresini Kaydet'}
              </Button>
            </Paper>
          </Box>

          {/* Özet Card */}
          <Box sx={{ flex: '0 1 350px' }}>
            <Card sx={{ bgcolor: 'var(--muted)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 İşlem Özeti
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
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                Raf Adresi Tanımlama
              </Typography>
              <Typography variant="caption">
                Ürünün hangi rafta bulunduğunu kaydeder. Stok hareketi oluşturmaz, sadece konum bilgisi tanımlar.
              </Typography>
            </Alert>
          </Box>
        </Box>
      )}

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
