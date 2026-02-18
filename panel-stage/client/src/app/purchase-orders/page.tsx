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
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Pagination,
} from '@mui/material';
import { Add, Search, Visibility, Edit, Delete, Close, Receipt } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Supplier {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
}

interface PurchaseOrderItem {
  id: string;
  orderedQuantity: number;
  receivedQuantity: number;
  status: 'PENDING' | 'PARTIAL' | 'COMPLETED';
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
  items: PurchaseOrderItem[];
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, [page, statusFilter, supplierFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page,
        limit: 50,
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      if (supplierFilter !== 'all') {
        filters.supplierId = supplierFilter;
      }

      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await axios.get('/purchase-orders', { params: filters });
      setOrders(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Siparişler yüklenirken hata oluştu', 'error');
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

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;

    try {
      await axios.delete(`/purchase-orders/${selectedOrder.id}`);
      showSnackbar('Sipariş başarıyla silindi', 'success');
      setDeleteDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş silinirken hata oluştu', 'error');
    }
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

  const getRemainingQuantity = (order: PurchaseOrder) => {
    return order.items.reduce((total, item) => {
      return total + (item.orderedQuantity - item.receivedQuantity);
    }, 0);
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Satın Alma Siparişleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tedarikçilerden yapılan siparişleri yönetin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/purchase-orders/new')}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            }}
          >
            Yeni Sipariş
          </Button>
        </Box>
      </Box>

      {/* Filtreler */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Sipariş no, tedarikçi ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 1 300px' }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={statusFilter}
              label="Durum"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="PENDING">Beklemede</MenuItem>
              <MenuItem value="PARTIAL">Kısmi</MenuItem>
              <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
              <MenuItem value="CANCELLED">İptal</MenuItem>
            </Select>
          </FormControl>
          <Autocomplete
            size="small"
            options={suppliers}
            getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
            value={suppliers.find(s => s.id === supplierFilter) || null}
            onChange={(_, newValue) => setSupplierFilter(newValue?.id || 'all')}
            renderInput={(params) => (
              <TextField {...params} label="Tedarikçi" placeholder="Tedarikçi seçin" />
            )}
            sx={{ minWidth: 250 }}
          />
        </Box>
      </Paper>

      {/* Liste */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Sipariş No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tedarikçi</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Sipariş Tarihi</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Beklenen Teslim</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Toplam Tutar</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Henüz sipariş bulunmamaktadır.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const remainingQty = getRemainingQuantity(order);
                      return (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {order.orderNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{order.supplier.unvan}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.supplier.cariKodu}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatDate(order.orderDate)}</TableCell>
                          <TableCell>
                            {order.expectedDeliveryDate
                              ? formatDate(order.expectedDeliveryDate)
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {formatCurrency(Number(order.totalAmount))}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                order.status === 'PARTIAL'
                                  ? `${getStatusLabel(order.status)} (Kalan: ${remainingQty} adet)`
                                  : getStatusLabel(order.status)
                              }
                              color={getStatusColor(order.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => router.push(`/purchase-orders/${order.id}`)}
                                title="Görüntüle"
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                              {order.status === 'PENDING' && (
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => router.push(`/purchase-orders/${order.id}/edit`)}
                                  title="Düzenle"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              )}
                              {(order.status === 'PENDING' || order.status === 'PARTIAL') && (
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => router.push(`/purchase-orders/${order.id}/create-invoice`)}
                                  title="Fatura Oluştur"
                                >
                                  <Receipt fontSize="small" />
                                </IconButton>
                              )}
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setDeleteDialogOpen(true);
                                }}
                                title="Sil"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Siparişi Sil</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedOrder && (
              <>
                <strong>{selectedOrder.orderNumber}</strong> numaralı siparişi silmek istediğinizden emin misiniz?
                <br />
                <br />
                Bu işlem geri alınamaz.
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Sil
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
    </MainLayout>
  );
}

