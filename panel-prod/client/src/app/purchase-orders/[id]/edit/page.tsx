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
  CircularProgress,
} from '@mui/material';
import { Delete, Save, ArrowBack } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter, useParams } from 'next/navigation';

interface Supplier {
  id: string;
  cariKodu: string;
  unvan: string;
}

interface Product {
  id: string;
  stokKodu: string;
  stokAdi: string;
  alisFiyati: number;
}

interface OrderItem {
  productId: string;
  product?: Product;
  orderedQuantity: number;
  unitPrice: number;
}

export default function EditPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDeliveryDate: '',
    notes: '',
    status: 'PENDING' as 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED',
    items: [] as OrderItem[],
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/purchase-orders/${orderId}`);
      const order = response.data;

      if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
        showSnackbar('Tamamlanmış veya iptal edilmiş siparişler düzenlenemez', 'error');
        router.push(`/purchase-orders/${orderId}`);
        return;
      }

      setFormData({
        supplierId: order.supplier.id,
        expectedDeliveryDate: order.expectedDeliveryDate
          ? new Date(order.expectedDeliveryDate).toISOString().split('T')[0]
          : '',
        notes: order.notes || '',
        status: order.status,
        items: order.items.map((item: any) => ({
          productId: item.product.id,
          product: item.product,
          orderedQuantity: item.orderedQuantity,
          unitPrice: Number(item.unitPrice),
        })),
      });
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş yüklenirken hata oluştu', 'error');
      router.push('/purchase-orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/cari', {
        params: { limit: 1000, tip: 'TEDARIKCI' },
      });
      setSuppliers(response.data.data || []);
    } catch (error) {
      console.error('Tedarikçiler yüklenirken hata:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/stok', {
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

      setSaving(true);
      await axios.patch(`/purchase-orders/${orderId}`, {
        supplierId: formData.supplierId,
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        notes: formData.notes || null,
        status: formData.status,
      });

      showSnackbar('Sipariş başarıyla güncellendi', 'success');
      setTimeout(() => {
        router.push(`/purchase-orders/${orderId}`);
      }, 1500);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const total = calculateTotal();

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton
            onClick={() => router.push(`/purchase-orders/${orderId}`)}
            sx={{
              bgcolor: '#f3f4f6',
              '&:hover': { bgcolor: '#e5e7eb' }
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
              Sipariş Düzenle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sipariş bilgilerini güncelleyin
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={3}>
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
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tedarikçi Seçiniz"
                  required
                />
              )}
              disabled
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

          <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f9fafb' }}>
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

          <Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push(`/purchase-orders/${orderId}`)}
              >
                İptal
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  minWidth: 150,
                }}
              >
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>

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

