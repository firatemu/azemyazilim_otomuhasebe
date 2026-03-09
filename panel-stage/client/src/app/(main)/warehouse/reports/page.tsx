'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Stack,
  TextField,
  Autocomplete,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Refresh,
  Inventory2,
  Storage,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Location {
  id: string;
  code: string;
  name?: string;
  warehouseId?: string;
  warehouse: {
    code: string;
    name: string;
  };
}

interface Product {
  id: string;
  stokKodu: string;
  stokAdi: string;
  marka?: string;
}

interface StockByLocation {
  location: Location;
  stocks: Array<{
    product: Product;
    qtyOnHand: number;
  }>;
  totalQty: number;
}

interface LocationsByProduct {
  product: Product;
  locations: Array<{
    location: Location;
    qtyOnHand: number;
  }>;
  totalQty: number;
}

export default function DepoRaporlarPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // Rafa Göre Stok
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [stockByLocation, setStockByLocation] = useState<StockByLocation | null>(null);

  // Ürüne Göre Raflar
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [locationsByProduct, setLocationsByProduct] = useState<LocationsByProduct | null>(null);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/location', { params: { active: true } });
      setLocations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Raf listesi alınamadı:', error);
      setLocations([]);
    }
  };

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

  const fetchStockByLocation = async () => {
    if (!selectedLocation) return;

    setLoading(true);
    try {
      const response = await axios.get(`/location/${selectedLocation.id}`);
      const location = response.data;

      const stocks = location.productLocationStocks.map((stock: any) => ({
        product: stock.product,
        qtyOnHand: stock.qtyOnHand,
      }));

      const totalQty = stocks.reduce((sum: number, stock: any) => sum + stock.qtyOnHand, 0);

      setStockByLocation({
        location: selectedLocation,
        stocks,
        totalQty,
      });
    } catch (error) {
      console.error('Raf stok bilgisi alınamadı:', error);
      setSnackbar({ open: true, message: 'Rapor alınamadı', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationsByProduct = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      // ProductLocationStock'ları filtrele
      const response = await axios.get('/stock-move', {
        params: { productId: selectedProduct.id, limit: 1000 },
      });

      // Benzersiz locationları bul ve miktarları topla
      const locationMap = new Map<string, { location: Location; qtyOnHand: number }>();

      // Her location için ProductLocationStock bilgisini almamız gerekiyor
      // Bunun için locations'ı query'leyip product filtrelemesi yapıyoruz
      const locationsResponse = await axios.get('/location', { params: { active: true } });
      const allLocations = locationsResponse.data;

      for (const location of allLocations) {
        const locationDetail = await axios.get(`/location/${location.id}`);
        const stock = locationDetail.data.productLocationStocks.find(
          (s: any) => s.product.id === selectedProduct.id
        );

        if (stock && stock.qtyOnHand > 0) {
          locationMap.set(location.id, {
            location: {
              id: location.id,
              code: location.code,
              name: location.name,
              warehouse: location.warehouse,
            },
            qtyOnHand: stock.qtyOnHand,
          });
        }
      }

      const locations = Array.from(locationMap.values());
      const totalQty = locations.reduce((sum, loc) => sum + loc.qtyOnHand, 0);

      setLocationsByProduct({
        product: selectedProduct,
        locations,
        totalQty,
      });
    } catch (error) {
      console.error('Ürün raf bilgisi alınamadı:', error);
      setSnackbar({ open: true, message: 'Rapor alınamadı', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchStockByLocation();
    } else {
      setStockByLocation(null);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedProduct) {
      fetchLocationsByProduct();
    } else {
      setLocationsByProduct(null);
    }
  }, [selectedProduct]);

  const handleExportCSV = () => {
    setSnackbar({ open: true, message: 'CSV export özelliği yakında eklenecek', severity: 'info' });
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          📊 Depo Raporları
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExportCSV}
        >
          Export CSV
        </Button>
      </Box>

      <Paper>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="📦 Rafa Göre Stok" />
          <Tab label="🔍 Ürüne Göre Raflar" />
        </Tabs>

        {/* Tab 1: Rafa Göre Stok */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rafa Göre Stok Raporu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Bir raf seçerek               o raftaki tüm ürünleri ve adetlerini görün.
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  fullWidth
                  options={locations}
                  getOptionLabel={(option) => `${option.code} ${option.name ? `- ${option.name}` : ''} (${option.warehouse.code})`}
                  value={selectedLocation}
                  onChange={(_, newValue) => setSelectedLocation(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Raf Seçin"
                      placeholder="Raf kodu veya adı ile ara..."
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
                          <Typography variant="caption" color="text.secondary">
                            {option.warehouse.code} - {option.warehouse.name}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {stockByLocation && (
                  <Card sx={{ bgcolor: '#e3f2fd' }}>
                    <CardContent>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Storage sx={{ fontSize: 48, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color="primary">
                            {stockByLocation.totalQty}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Toplam Ürün Adedi
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stockByLocation.stocks.length} Farklı Çeşit
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {!loading && stockByLocation && (
              <TableContainer sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Stok Kodu</strong></TableCell>
                      <TableCell><strong>Ürün Adı</strong></TableCell>
                      <TableCell><strong>Marka</strong></TableCell>
                      <TableCell align="right"><strong>Miktar</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockByLocation.stocks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Box sx={{ py: 3 }}>
                            <Inventory2 sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography color="text.secondary">
                              Bu rafta henüz ürün yok
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      stockByLocation.stocks.map((stock, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {stock.product.stokKodu}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {stock.product.stokAdi}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {stock.product.marka || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={stock.qtyOnHand}
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab 2: Ürüne Göre Raflar */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ürüne Göre Raf Raporu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Bir ürün seçerek o ürünün hangi raflarda olduğunu ve adetlerini görün.
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  fullWidth
                  options={products}
                  getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                  value={selectedProduct}
                  onChange={(_, newValue) => setSelectedProduct(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Ürün Seçin"
                      placeholder="Ürün kodu veya adı ile ara..."
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
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {locationsByProduct && (
                  <Card sx={{ bgcolor: '#e8f5e9' }}>
                    <CardContent>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Inventory2 sx={{ fontSize: 48, color: 'success.main' }} />
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color="success.main">
                            {locationsByProduct.totalQty}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Toplam Stok
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {locationsByProduct.locations.length} Farklı Rafta
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {!loading && locationsByProduct && (
              <TableContainer sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Raf Kodu</strong></TableCell>
                      <TableCell><strong>Depo</strong></TableCell>
                      <TableCell><strong>Açıklama</strong></TableCell>
                      <TableCell align="right"><strong>Miktar</strong></TableCell>
                      <TableCell align="center"><strong>İşlemler</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {locationsByProduct.locations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Box sx={{ py: 3 }}>
                            <Storage sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography color="text.secondary">
                              Bu ürün hiçbir rafta bulunamadı
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      locationsByProduct.locations.map((loc, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                              {loc.location.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {loc.location.warehouse.code} - {loc.location.warehouse.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {loc.location.name || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={loc.qtyOnHand}
                              size="small"
                              color="success"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                const target = loc.location.warehouseId ?? loc.location.warehouse.code;
                                router.push(`/depo/depolar/${target}`);
                              }}
                            >
                              Depoya Git
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

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

