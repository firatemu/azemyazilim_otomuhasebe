'use client';

import React, { useState, useEffect } from 'react';
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
  Divider,
  Stack,
  Autocomplete,
} from '@mui/material';
import { Delete, Save, ArrowBack } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Supplier {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
}

interface Product {
  id: string;
  stokKodu: string;
  stokAdi: string;
  alisFiyati: number;
  kdvOrani: number;
}

interface OrderItem {
  productId: string;
  product?: Product;
  orderedQuantity: number;
  unitPrice: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDeliveryDate: '',
    notes: '',
    items: [] as OrderItem[],
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/account', {
        params: { limit: 1000, tip: 'TEDARIKCI' },
      });
      setSuppliers(response.data.data || []);
    } catch (error) {
      console.error('Tedarikçiler yüklenirken hata:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product', {
        params: { limit: 1000 },
      });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: '',
        orderedQuantity: 1,
        unitPrice: 0,
      }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };

      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
          item.productId = value;
          item.product = product;
          item.unitPrice = product.alisFiyati;
        }
      } else {
        item[field] = value;
      }

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.orderedQuantity * item.unitPrice);
    }, 0);
  };

  const handleSave = async () => {
    try {
      if (!formData.supplierId) {
        showSnackbar('Tedarikçi seçimi zorunludur', 'error');
        return;
      }

      if (formData.items.length === 0) {
        showSnackbar('En az bir ürün eklemelisiniz', 'error');
        return;
      }

      const hasInvalidItem = formData.items.some(item => !item.productId || item.orderedQuantity <= 0 || item.unitPrice <= 0);
      if (hasInvalidItem) {
        showSnackbar('Lütfen tüm ürün bilgilerini eksiksiz doldurun', 'error');
        return;
      }

      setLoading(true);
      await axios.post('/purchase-orders', {
        supplierId: formData.supplierId,
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        notes: formData.notes || null,
        items: formData.items.map(item => ({
          productId: item.productId,
          orderedQuantity: Number(item.orderedQuantity),
          unitPrice: Number(item.unitPrice),
        })),
      });

      showSnackbar('Sipariş başarıyla oluşturuldu', 'success');
      setTimeout(() => {
        router.push('/purchase-orders');
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
      currency: 'TRY',
    }).format(amount);
  };

  const total = calculateTotal();

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton
            onClick={() => router.push('/purchase-orders')}
            sx={{
              bgcolor: 'var(--muted)',
              '&:hover': { bgcolor: 'var(--border)' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Yeni Satın Alma Siparişi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tedarikçiden sipariş oluşturun
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={3}>
          {/* Sipariş Bilgileri */}
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Sipariş Bilgileri
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Autocomplete
              fullWidth
              value={suppliers.find(s => s.id === formData.supplierId) || null}
              onChange={(_, newValue) => {
                setFormData(prev => ({ ...prev, supplierId: newValue?.id || '' }));
              }}
              options={suppliers}
              getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Box>
                      <Typography variant="body1" fontWeight="600">
                        {option.unvan}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.cariKodu}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tedarikçi Seçiniz"
                  placeholder="Tedarikçi kodu veya ünvanı ile ara..."
                  required
                />
              )}
              noOptionsText="Tedarikçi bulunamadı"
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            <TextField
              sx={{ flex: '1 1 200px' }}
              type="date"
              label="Beklenen Teslim Tarihi"
              value={formData.expectedDeliveryDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Ürünler */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Sipariş Kalemleri</Typography>
              <Button
                variant="contained"
                onClick={handleAddItem}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                }}
              >
                + Ürün Ekle
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="40%" sx={{ fontWeight: 600 }}>Ürün</TableCell>
                    <TableCell width="15%" sx={{ fontWeight: 600 }}>Miktar</TableCell>
                    <TableCell width="20%" sx={{ fontWeight: 600 }}>Birim Fiyat</TableCell>
                    <TableCell width="20%" align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                    <TableCell width="5%" align="center" sx={{ fontWeight: 600 }}>Sil</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Henüz ürün eklenmedi. Yukarıdaki butonu kullanarak ürün ekleyin.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            value={products.find(p => p.id === item.productId) || null}
                            onChange={(_, newValue) => {
                              handleItemChange(index, 'productId', newValue?.id || '');
                            }}
                            options={products}
                            getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                            renderOption={(props, option) => {
                              const { key, ...otherProps } = props;
                              return (
                                <Box component="li" key={key} {...otherProps}>
                                  <Box>
                                    <Typography variant="body2" fontWeight="600">
                                      {option.stokAdi}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {option.stokKodu}
                                    </Typography>
                                  </Box>
                                </Box>
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Ürün kodu veya adı ile ara..."
                              />
                            )}
                            noOptionsText="Ürün bulunamadı"
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={item.orderedQuantity}
                            onChange={(e) => handleItemChange(index, 'orderedQuantity', e.target.value)}
                            inputProps={{ min: 1, step: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(item.orderedQuantity * item.unitPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(index)}
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
          </Box>

          {/* Notlar */}
          <Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notlar"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Box>

          {/* Toplam */}
          <Paper variant="outlined" sx={{ p: 3, bgcolor: 'var(--muted)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                Genel Toplam:
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  color: '#3b82f6',
                }}
              >
                {formatCurrency(total)}
              </Typography>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/purchase-orders')}
              >
                İptal
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  minWidth: 150,
                }}
              >
                {loading ? 'Kaydediliyor...' : 'Siparişi Kaydet'}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>

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

