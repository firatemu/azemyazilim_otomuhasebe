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
  Chip,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, Edit, Receipt, Delete, Add, ExpandMore } from '@mui/icons-material';
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
}

interface OrderItem {
  id: string;
  product: Product;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  status: 'PENDING' | 'PARTIAL' | 'COMPLETED';
}

interface Invoice {
  id: string;
  faturaNo: string;
  tarih: string;
  genelToplam: number;
  durum: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: Supplier;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  status: 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  items: OrderItem[];
  invoices?: Invoice[];
}

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/purchase-orders/${orderId}`);
      setOrder(response.data);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş yüklenirken hata oluştu', 'error');
      router.push('/purchase-orders');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'info';
      case 'PARTIAL':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Beklemede';
      case 'PARTIAL':
        return 'Kısmi';
      case 'COMPLETED':
        return 'Tamamlandı';
      case 'CANCELLED':
        return 'İptal';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getRemainingQuantity = (item: OrderItem) => {
    return item.orderedQuantity - item.receivedQuantity;
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!order) {
    return null;
  }

  const hasRemainingItems = order.items.some(item => getRemainingQuantity(item) > 0);
  const totalRemaining = order.items.reduce((sum, item) => sum + getRemainingQuantity(item), 0);

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton
            onClick={() => router.push('/purchase-orders')}
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
              Sipariş Detayı
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.orderNumber}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Sol Taraf - Ana Bilgiler */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Sipariş Bilgileri */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Sipariş Bilgileri
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Sipariş No</Typography>
                <Typography variant="body1" fontWeight="600">{order.orderNumber}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Tedarikçi</Typography>
                <Typography variant="body1" fontWeight="600">{order.supplier.unvan}</Typography>
                <Typography variant="caption" color="text.secondary">{order.supplier.cariKodu}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Sipariş Tarihi</Typography>
                <Typography variant="body1">{formatDate(order.orderDate)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Beklenen Teslim</Typography>
                <Typography variant="body1">
                  {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Durum</Typography>
                <Chip
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status) as any}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Toplam Tutar</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatCurrency(Number(order.totalAmount))}
                </Typography>
              </Grid>
              {order.notes && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">Notlar</Typography>
                  <Typography variant="body1">{order.notes}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Sipariş Kalemleri */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Sipariş Kalemleri
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Ürün</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Sipariş Miktarı</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Teslim Alınan</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Kalan</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Birim Fiyat</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => {
                    const remaining = getRemainingQuantity(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {item.product.stokAdi}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.product.stokKodu}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.orderedQuantity}</TableCell>
                        <TableCell align="right">{item.receivedQuantity}</TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            sx={{
                              color: remaining > 0 ? '#f59e0b' : 'inherit',
                            }}
                          >
                            {remaining}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(Number(item.unitPrice))}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.orderedQuantity * Number(item.unitPrice))}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(item.status)}
                            color={getStatusColor(item.status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* İşlem Butonları */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {order.status === 'PENDING' && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => router.push(`/purchase-orders/${order.id}/edit`)}
                >
                  Düzenle
                </Button>
              )}
              {(order.status === 'PENDING' || order.status === 'PARTIAL') && (
                <Button
                  variant="contained"
                  startIcon={<Receipt />}
                  onClick={() => router.push(`/purchase-orders/${order.id}/create-invoice`)}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  }}
                >
                  Fatura Oluştur
                </Button>
              )}
              {order.status === 'PARTIAL' && hasRemainingItems && (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => {
                    // Kalan miktarlardan yeni sipariş oluşturma dialog'u açılacak
                    showSnackbar('Bu özellik yakında eklenecek', 'info');
                  }}
                >
                  Kalan Miktarlar İçin Yeni Sipariş
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Sağ Taraf - Faturalar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Siparişe Ait Faturalar
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {order.invoices && order.invoices.length > 0 ? (
              <Stack spacing={2}>
                {order.invoices.map((invoice) => (
                  <Accordion key={invoice.id}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" fontWeight="600">
                          {invoice.faturaNo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(invoice.tarih)} - {formatCurrency(Number(invoice.genelToplam))}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Durum</Typography>
                        <Chip label={invoice.durum} size="small" sx={{ mt: 1 }} />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Henüz fatura oluşturulmamış
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

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

