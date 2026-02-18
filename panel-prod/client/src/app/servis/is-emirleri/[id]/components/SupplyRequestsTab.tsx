'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
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
  Autocomplete,
  TextField,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { CheckCircle, Cancel, Inventory } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface SupplyRequest {
  id: string;
  description: string;
  quantity: number;
  requestedAt: string;
  supplyRequestStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  productId?: string | null;
  product?: {
    id: string;
    stokAdi: string;
    stokKodu: string;
    marka?: string;
  };
  workOrder: {
    id: string;
    workOrderNo: string;
    vehicle: {
      plateNumber: string;
      brand: string;
      model: string;
    };
    customer: {
      unvan?: string;
      isimSoyisim?: string;
    };
  };
  approver?: {
    id: string;
    email: string;
    fullName: string;
  };
  approvedAt?: string;
}

interface SupplyRequestsTabProps {
  workOrderId: string;
}

export default function SupplyRequestsTab({ workOrderId }: SupplyRequestsTabProps) {
  if (!workOrderId) {
    return <Box sx={{ p: 3 }}>İş emri ID bulunamadı</Box>;
  }

  const queryClient = useQueryClient();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SupplyRequest | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch supply requests
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['supply-requests', workOrderId],
    queryFn: async () => {
      const response = await axios.get(`/work-orders/${workOrderId}/supply-requests`);
      return response.data as SupplyRequest[];
    },
  });

  // Fetch products for matching
  const { data: productsData } = useQuery({
    queryKey: ['products-list-for-supply'],
    queryFn: async () => {
      const response = await axios.get('/stok', { params: { limit: 1000 } });
      return response.data.data || [];
    },
  });
  const products: any[] = productsData || [];

  const approveMutation = useMutation({
    mutationFn: async (data: { lineId: string; productId: string; note?: string }) => {
      const response = await axios.put(
        `/work-orders/${workOrderId}/supply-requests/${data.lineId}/approve`,
        { productId: data.productId, note: data.note }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supply-requests', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
      setApproveDialogOpen(false);
      setSelectedRequest(null);
      setSelectedProduct(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: { lineId: string; reason?: string }) => {
      const response = await axios.put(
        `/work-orders/${workOrderId}/supply-requests/${data.lineId}/reject`,
        { reason: data.reason }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supply-requests', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectReason('');
    },
  });

  const handleApproveClick = (request: SupplyRequest) => {
    setSelectedRequest(request);
    setSelectedProduct(null);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (request: SupplyRequest) => {
    setSelectedRequest(request);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedRequest && selectedProduct) {
      approveMutation.mutate({
        lineId: selectedRequest.id,
        productId: selectedProduct.id,
      });
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate({
        lineId: selectedRequest.id,
        reason: rejectReason,
      });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Tedarik istekleri yüklenirken bir hata oluştu.</Alert>
      </Box>
    );
  }

  const pendingRequests = requests?.filter((r) => r.supplyRequestStatus === 'PENDING') || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Tedarik İstekleri
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Bekleyen tedarik isteklerini stok ürünleriyle eşleştirerek onaylayın veya reddedin.
      </Typography>

      {pendingRequests.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Bekleyen tedarik isteği yok</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>İstek Açıklaması</TableCell>
                <TableCell align="right">Adet</TableCell>
                <TableCell>İş Emri</TableCell>
                <TableCell>Müşteri</TableCell>
                <TableCell>Araç</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Typography fontWeight="medium">{request.description}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(request.requestedAt).toLocaleString('tr-TR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={request.quantity} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{request.workOrder.workOrderNo}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {request.workOrder.customer.unvan || request.workOrder.customer.isimSoyisim || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {request.workOrder.vehicle.plateNumber} - {request.workOrder.vehicle.brand} {request.workOrder.vehicle.model}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApproveClick(request)}
                      >
                        Onayla
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleRejectClick(request)}
                      >
                        Reddet
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Tedarik İsteğini Onayla</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>İstek:</strong> {selectedRequest.description} ({selectedRequest.quantity} adet)
                </Typography>
              </Alert>
              <Autocomplete
                fullWidth
                options={products}
                getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                value={selectedProduct}
                onChange={(_, newValue) => setSelectedProduct(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Stoktan Ürün Seçin"
                    placeholder="Ürün kodu veya adı ile ara..."
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {option.stokAdi}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.stokKodu} {option.marka && `• ${option.marka}`}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              />
              {selectedProduct && (
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Seçilen Ürün Bilgileri:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Kod:</strong> {selectedProduct.stokKodu}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Ad:</strong> {selectedProduct.stokAdi}
                    </Typography>
                    {selectedProduct.marka && (
                      <Typography variant="body2">
                        <strong>Marka:</strong> {selectedProduct.marka}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            disabled={!selectedProduct || approveMutation.isPending}
          >
            {approveMutation.isPending ? 'Onaylanıyor...' : 'Onayla'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tedarik İsteğini Reddet</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>İstek:</strong> {selectedRequest.description} ({selectedRequest.quantity} adet)
                </Typography>
              </Alert>
              <TextField
                fullWidth
                label="Red Nedeni (Opsiyonel)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                multiline
                rows={3}
                placeholder="Red nedenini açıklayın..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? 'Reddediliyor...' : 'Reddet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

