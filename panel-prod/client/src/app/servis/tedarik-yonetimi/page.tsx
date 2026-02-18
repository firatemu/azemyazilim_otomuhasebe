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
    Card,
    CardContent,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel, FilterList } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import MainLayout from '@/components/Layout/MainLayout';
import { useRouter } from 'next/navigation';

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

export default function TedarikYonetimiPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');

    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<SupplyRequest | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Fetch supply requests
    const { data, isLoading, error } = useQuery({
        queryKey: ['all-supply-requests', page, statusFilter],
        queryFn: async () => {
            const params: any = { page, limit: 20 };
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const response = await axios.get('/work-orders/supply-requests/all', { params });
            return response.data;
        },
    });

    const requests: SupplyRequest[] = data?.data || [];
    const totalPages = data?.pagination?.totalPages || 1;

    // Fetch products for matching
    const { data: productsData } = useQuery({
        queryKey: ['products-list-for-supply'],
        queryFn: async () => {
            const response = await axios.get('/stok', { params: { limit: 1000 } });
            return response.data.data || [];
        },
        enabled: approveDialogOpen, // Only fetch when dialog opens
    });
    const products: any[] = productsData || [];

    const approveMutation = useMutation({
        mutationFn: async (data: { lineId: string; workOrderId: string; productId: string; note?: string }) => {
            const response = await axios.put(
                `/work-orders/${data.workOrderId}/supply-requests/${data.lineId}/approve`,
                { productId: data.productId, note: data.note }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-supply-requests'] });
            setApproveDialogOpen(false);
            setSelectedRequest(null);
            setSelectedProduct(null);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (data: { lineId: string; workOrderId: string; reason?: string }) => {
            const response = await axios.put(
                `/work-orders/${data.workOrderId}/supply-requests/${data.lineId}/reject`,
                { reason: data.reason }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-supply-requests'] });
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
                workOrderId: selectedRequest.workOrder.id,
                productId: selectedProduct.id,
            });
        }
    };

    const handleReject = () => {
        if (selectedRequest) {
            rejectMutation.mutate({
                lineId: selectedRequest.id,
                workOrderId: selectedRequest.workOrder.id,
                reason: rejectReason,
            });
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Beklemede';
            case 'APPROVED': return 'Onaylandı';
            case 'REJECTED': return 'Reddedildi';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    return (
        <MainLayout>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'var(--foreground)' }}>
                            Tedarik Yönetimi
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            İş emirlerinden gelen tüm tedarik isteklerini yönetin
                        </Typography>
                    </Box>
                </Box>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FilterList sx={{ color: 'text.secondary' }} />
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Durum</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Durum"
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <MenuItem value="all">Tümü</MenuItem>
                                <MenuItem value="PENDING">Beklemede</MenuItem>
                                <MenuItem value="APPROVED">Onaylananlar</MenuItem>
                                <MenuItem value="REJECTED">Reddedilenler</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Paper>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">Tedarik istekleri yüklenirken bir hata oluştu.</Alert>
                ) : requests.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">Kayıt bulunamadı</Typography>
                    </Paper>
                ) : (
                    <>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead sx={{ bgcolor: 'var(--muted)' }}>
                                    <TableRow>
                                        <TableCell>Durum</TableCell>
                                        <TableCell>İstek Detayı</TableCell>
                                        <TableCell>İş Emri / Araç</TableCell>
                                        <TableCell>Müşteri</TableCell>
                                        <TableCell>Tarih</TableCell>
                                        <TableCell align="center">İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow key={request.id} hover>
                                            <TableCell>
                                                <Chip
                                                    label={getStatusLabel(request.supplyRequestStatus)}
                                                    color={getStatusColor(request.supplyRequestStatus) as any}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">{request.description}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Adet: {request.quantity}
                                                </Typography>
                                                {request.product && (
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <Chip
                                                            label={`${request.product.stokKodu} - ${request.product.stokAdi}`}
                                                            size="small"
                                                            variant="outlined"
                                                            icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                                                        />
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    component="a"
                                                    onClick={() => router.push(`/servis/is-emirleri/${request.workOrder.id}`)}
                                                    sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}
                                                >
                                                    {request.workOrder.workOrderNo}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    {request.workOrder.vehicle.plateNumber}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {request.workOrder.vehicle.brand} {request.workOrder.vehicle.model}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {request.workOrder.customer.unvan || request.workOrder.customer.isimSoyisim || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(request.requestedAt).toLocaleString('tr-TR')}
                                                </Typography>
                                                {request.approver && (
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        Onaylayan: {request.approver.fullName}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {request.supplyRequestStatus === 'PENDING' && (
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="success"
                                                            onClick={() => handleApproveClick(request)}
                                                            sx={{ minWidth: 'auto', p: 1 }}
                                                            title="Onayla"
                                                        >
                                                            <CheckCircle fontSize="small" />
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => handleRejectClick(request)}
                                                            sx={{ minWidth: 'auto', p: 1 }}
                                                            title="Reddet"
                                                        >
                                                            <Cancel fontSize="small" />
                                                        </Button>
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(_, val) => setPage(val)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
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
        </MainLayout>
    );
}
