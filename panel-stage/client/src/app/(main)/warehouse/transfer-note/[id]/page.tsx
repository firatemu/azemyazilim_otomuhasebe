'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
    CircularProgress,
    Alert,
    Divider,
    Stack,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
} from '@mui/material';
import {
    ArrowBack,
    CheckCircle,
    LocalShipping,
    Cancel as CancelIcon,
    RotateLeft,
    ContentPaste,
    Print as PrintIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import WarehouseTransferPrintForm from '@/components/PrintForm/WarehouseTransferPrintForm';
import axios from '@/lib/axios';

interface WarehouseTransferItem {
    id: string;
    stokId: string;
    stok: {
        stokKodu: string;
        stokAdi: string;
        birim: string;
    };
    miktar: number;
    fromLocation?: {
        code: string;
        name: string;
    };
    toLocation?: {
        code: string;
        name: string;
    };
}

interface WarehouseTransfer {
    id: string;
    transferNo: string;
    tarih: string;
    durum: 'HAZIRLANIYOR' | 'YOLDA' | 'TAMAMLANDI' | 'IPTAL';
    fromWarehouse: {
        id: string;
        name: string;
    };
    toWarehouse: {
        id: string;
        name: string;
    };
    driverName?: string;
    vehiclePlate?: string;
    aciklama?: string;
    kalemler: WarehouseTransferItem[];
    hazirlayanUser?: { fullName: string };
    onaylayanUser?: { fullName: string };
    teslimAlanUser?: { fullName: string };
    createdAt: string;
    logs: Array<{
        id: string;
        actionType: string;
        changes: string;
        createdAt: string;
        user: { fullName: string } | null;
    }>;
}

const statusColors: Record<string, any> = {
    HAZIRLANIYOR: 'warning',
    YOLDA: 'info',
    TAMAMLANDI: 'success',
    IPTAL: 'error',
};

const statusLabels: Record<string, string> = {
    HAZIRLANIYOR: 'Hazırlanıyor',
    YOLDA: 'Yolda',
    TAMAMLANDI: 'Tamamlandı',
    IPTAL: 'İptal',
};

export default function WarehouseTransferDetayPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [transfer, setTransfer] = useState<WarehouseTransfer | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [printOpen, setPrintOpen] = useState(false);

    useEffect(() => {
        fetchTransfer();
    }, [id]);

    const fetchTransfer = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/warehouse-transfer/${id}`);
            setTransfer(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Transfer yüklenirken hata:', err);
            setError(err.response?.data?.message || 'Transfer yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'approve' | 'complete' | 'cancel') => {
        try {
            setActionLoading(true);
            if (action === 'cancel') {
                await axios.put(`/warehouse-transfer/${id}/cancel`, { reason: cancelReason });
                setCancelDialogOpen(false);
            } else {
                await axios.put(`/warehouse-transfer/${id}/${action}`);
            }
            await fetchTransfer();
        } catch (err: any) {
            alert(err.response?.data?.message || 'İşlem başarısız');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR');
    };

    if (loading) {
        return (
            <MainLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                    <CircularProgress />
                </Box>
            </MainLayout>
        );
    }

    if (error || !transfer) {
        return (
            <MainLayout>
                <Box sx={{ p: 3 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>{error || 'Transfer bulunamadı'}</Alert>
                    <Button startIcon={<ArrowBack />} onClick={() => router.back()}>Geri Dön</Button>
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton onClick={() => router.back()}>
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                Transfer Detayı
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {transfer.transferNo}
                            </Typography>
                        </Box>
                    </Stack>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {transfer.durum === 'HAZIRLANIYOR' && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() => handleAction('approve')}
                                disabled={actionLoading}
                            >
                                Onayla & Sevk Et
                            </Button>
                        )}
                        {transfer.durum === 'YOLDA' && (
                            <Button
                                variant="contained"
                                color="info"
                                startIcon={<LocalShipping />}
                                onClick={() => handleAction('complete')}
                                disabled={actionLoading}
                            >
                                Transferi Tamamla
                            </Button>
                        )}
                        {(transfer.durum === 'HAZIRLANIYOR' || transfer.durum === 'YOLDA') && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => setCancelDialogOpen(true)}
                                disabled={actionLoading}
                            >
                                İptal Et
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() => setPrintOpen(true)}
                        >
                            Yazdır / İndir
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Main Info */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Genel Bilgiler</Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Durum</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip label={statusLabels[transfer.durum]} color={statusColors[transfer.durum]} size="small" />
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tarih</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {formatDate(transfer.tarih)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Transfer Rotası</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {transfer.fromWarehouse.name} ➔ {transfer.toWarehouse.name}
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Sürücü & Plaka</Typography>
                                    <Typography variant="body2">
                                        {transfer.driverName || '-'} {transfer.vehiclePlate ? `(${transfer.vehiclePlate})` : ''}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Açıklama</Typography>
                                    <Typography variant="body2">{transfer.aciklama || '-'}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Staff Info */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Görevli Bilgileri</Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Hazırlayan</Typography>
                                    <Typography variant="body2">{transfer.hazirlayanUser?.fullName || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Onaylayan</Typography>
                                    <Typography variant="body2">{transfer.onaylayanUser?.fullName || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Teslim Alan</Typography>
                                    <Typography variant="body2">{transfer.teslimAlanUser?.fullName || '-'}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* History Logs */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>İşlem Geçmişi</Typography>
                            <Stack spacing={2}>
                                {transfer.logs.map((log: any) => (
                                    <Box key={log.id} sx={{ position: 'relative', pb: 1, borderBottom: '1px solid #f0f0f0' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {formatDateTime(log.createdAt)}
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {log.user?.fullName || 'Sistem'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', color: 'primary.main' }}>
                                            {log.actionType === 'CREATE' ? 'Oluşturuldu' : log.actionType === 'UPDATE' ? 'Güncellendi' : log.actionType}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Bottom Row: Items Table (Full Width) */}
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Transfer Edilen Malzemeler</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Stok Kodu</TableCell>
                                            <TableCell>Marka</TableCell>
                                            <TableCell>Stok Adı</TableCell>
                                            <TableCell>Çıkış Rafı</TableCell>
                                            <TableCell>Giriş Rafı</TableCell>
                                            <TableCell align="right">Miktar</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transfer.kalemler.map((item: WarehouseTransferItem) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.stok?.stokKodu || '-'}</TableCell>
                                                <TableCell>{(item.stok as any).marka || '-'}</TableCell>
                                                <TableCell>{item.stok?.stokAdi || '-'}</TableCell>
                                                <TableCell>{item.fromLocation?.code || '-'}</TableCell>
                                                <TableCell>{item.toLocation?.code || '-'}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                    {item.miktar} {item.stok?.birim || ''}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle component="div">Transfer İptali</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>Bu transferi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</Typography>
                    <TextField
                        fullWidth
                        label="İptal Nedeni"
                        multiline
                        rows={3}
                        value={cancelReason}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCancelReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)}>Vazgeç</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => handleAction('cancel')}
                        disabled={!cancelReason || actionLoading}
                    >
                        İptal Et
                    </Button>
                </DialogActions>
            </Dialog>

            <WarehouseTransferPrintForm
                open={printOpen}
                transfer={transfer}
                onClose={() => setPrintOpen(false)}
            />
        </MainLayout>
    );
}

