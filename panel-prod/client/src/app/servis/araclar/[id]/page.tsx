'use client';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import {
    Technician,
    Vehicle,
    WorkOrderStatus,
    getStatusColor,
    getStatusLabel,
} from '@/types/servis';
import {
    ArrowBack,
    Assignment,
    Build,
    CalendarMonth,
    CheckCircle,
    ColorLens,
    DirectionsCar,
    History,
    LocalGasStation,
    Person,
    ReceiptLong,
    Schedule,
    Settings,
    Speed,
    Visibility,
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Paper,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

interface VehicleHistory {
    vehicle: Vehicle;
    workOrders: Array<{
        id: string;
        workOrderNo: string;
        status: string;
        acceptedAt: string;
        closedAt?: string;
        complaint?: string;
        findings?: string;
        technician?: Technician;
        laborTotal: number;
        partsTotal: number;
        grandTotal: number;
        invoiceNo?: string;
    }>;
    summary: {
        totalWorkOrders: number;
        completedWorkOrders: number;
        totalLaborHours: number;
        totalPartsUsed: number;
        totalSpent: number;
        uniqueTechniciansCount: number;
    };
    laborOperations: any[];
    usedParts: any[];
    technicians: Technician[];
    invoices: any[];
}

export default function VehicleDetailPage() {
    const router = useRouter();
    const params = useParams();
    const vehicleId = params.id as string;

    // Redirect "yeni" to the new vehicle page (prevent [id] route from catching it)
    React.useEffect(() => {
        if (vehicleId === 'yeni') {
            router.replace('/servis/araclar/yeni');
            return;
        }
    }, [vehicleId, router]);

    const [tabValue, setTabValue] = useState(0);

    // Fetch vehicle history
    const { data: historyData, isLoading, error } = useQuery({
        queryKey: ['vehicle-history', vehicleId],
        queryFn: async () => {
            const response = await axios.get(`/vehicles/${vehicleId}/history`);
            return response.data as VehicleHistory;
        },
        enabled: !!vehicleId,
    });

    // Also fetch vehicle details
    const { data: vehicleData } = useQuery({
        queryKey: ['vehicle', vehicleId],
        queryFn: async () => {
            const response = await axios.get(`/vehicles/${vehicleId}`);
            return response.data as Vehicle;
        },
        enabled: !!vehicleId,
    });

    const vehicle = historyData?.vehicle || vehicleData;
    const workOrders = historyData?.workOrders || [];
    const stats = historyData?.summary || {
        totalWorkOrders: 0,
        completedWorkOrders: 0,
        totalLaborHours: 0,
        totalPartsUsed: 0,
        totalSpent: 0,
        uniqueTechniciansCount: 0,
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

    const formatDate = (dateStr?: string) =>
        dateStr ? new Date(dateStr).toLocaleDateString('tr-TR') : '-';

    const formatDateTime = (dateStr?: string) =>
        dateStr ? new Date(dateStr).toLocaleString('tr-TR') : '-';

    const handleViewWorkOrder = (id: string) => {
        router.push(`/servis/is-emirleri/${id}`);
    };

    if (isLoading) {
        return (
            <MainLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress />
                </Box>
            </MainLayout>
        );
    }

    if (error || !vehicle) {
        return (
            <MainLayout>
                <Alert severity="error" sx={{ mt: 2 }}>
                    Araç bulunamadı veya yüklenirken bir hata oluştu.
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mt: 2 }}>
                    Geri Dön
                </Button>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Box sx={{ mb: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <IconButton onClick={() => router.back()}>
                        <ArrowBack />
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <DirectionsCar sx={{ fontSize: 40, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {vehicle.plateNumber}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Assignment />}
                        onClick={() => router.push('/servis/is-emirleri/yeni?vehicleId=' + vehicleId)}
                    >
                        Yeni İş Emri
                    </Button>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Assignment sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold" color="primary">
                                    {stats.totalWorkOrders}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam İş Emri
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <ReceiptLong sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                                <Typography variant="h5" fontWeight="bold" color="success.main">
                                    {formatCurrency(stats.totalSpent)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Harcama
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Settings sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold" color="info.main">
                                    {stats.totalPartsUsed}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Kullanılan Parça
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Schedule sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold" color="warning.main">
                                    {stats.totalLaborHours.toFixed(1)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam İşçilik (Saat)
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, v) => setTabValue(v)}
                        variant="fullWidth"
                        sx={{
                            borderBottom: '1px solid #e0e0e0',
                            '& .MuiTab-root': { minHeight: 56 },
                        }}
                    >
                        <Tab icon={<History />} label="Servis Geçmişi" iconPosition="start" />
                        <Tab icon={<DirectionsCar />} label="Araç Bilgileri" iconPosition="start" />
                    </Tabs>

                    {/* Tab: Service History */}
                    <TabPanel value={tabValue} index={0}>
                        <Box sx={{ px: 3 }}>
                            {workOrders.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <History sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                                    <Typography color="text.secondary">
                                        Bu araç için henüz servis kaydı bulunmamaktadır.
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    {/* Work Orders List */}
                                    {workOrders.map((wo, index) => (
                                        <Paper
                                            key={wo.id}
                                            variant="outlined"
                                            sx={{
                                                mb: 2,
                                                overflow: 'hidden',
                                                '&:hover': { boxShadow: 2 },
                                            }}
                                        >
                                            {/* Work Order Header */}
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    bgcolor: '#f9f9f9',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid #eee',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Typography variant="h6" fontWeight="bold" color="primary">
                                                        #{wo.workOrderNo}
                                                    </Typography>
                                                    <Chip
                                                        label={getStatusLabel(wo.status as WorkOrderStatus)}
                                                        color={getStatusColor(wo.status as WorkOrderStatus)}
                                                        size="small"
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {formatDate(wo.acceptedAt)}
                                                    </Typography>
                                                    <Tooltip title="Detayları Görüntüle">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleViewWorkOrder(wo.id)}
                                                        >
                                                            <Visibility />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            {/* Work Order Content */}
                                            <Box sx={{ p: 2 }}>
                                                <Grid container spacing={2}>
                                                    {/* Left: Complaint & Findings */}
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        {wo.complaint && (
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                                    Şikayet:
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {wo.complaint.length > 150
                                                                        ? wo.complaint.substring(0, 150) + '...'
                                                                        : wo.complaint}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {wo.findings && (
                                                            <Box>
                                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                                    Bulgular:
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {wo.findings.length > 150
                                                                        ? wo.findings.substring(0, 150) + '...'
                                                                        : wo.findings}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Grid>

                                                    {/* Right: Details */}
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Grid container spacing={1}>
                                                            <Grid size={{ xs: 6 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                    <Build sx={{ fontSize: 16, color: '#666' }} />
                                                                    <Typography variant="body2">
                                                                        {wo.technician
                                                                            ? `${wo.technician.firstName} ${wo.technician.lastName}`
                                                                            : 'Atanmadı'}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid size={{ xs: 6 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                    <Settings sx={{ fontSize: 16, color: '#666' }} />
                                                                    <Typography variant="body2">
                                                                        {formatCurrency(wo.partsTotal || 0)} parça
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid size={{ xs: 6 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                    <Schedule sx={{ fontSize: 16, color: '#666' }} />
                                                                    <Typography variant="body2">
                                                                        {formatCurrency(wo.laborTotal || 0)} işçilik
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid size={{ xs: 6 }}>
                                                                {wo.invoiceNo && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                        <ReceiptLong sx={{ fontSize: 16, color: 'success.main' }} />
                                                                        <Typography variant="body2" color="success.main">
                                                                            {wo.invoiceNo}
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Grid>
                                                        </Grid>

                                                        {/* Total */}
                                                        <Divider sx={{ my: 1 }} />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="subtitle2">Toplam:</Typography>
                                                            <Typography variant="h6" fontWeight="bold" color="primary">
                                                                {formatCurrency(Number(wo.grandTotal) || 0)}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Paper>
                                    ))}
                                </>
                            )}
                        </Box>
                    </TabPanel>

                    {/* Tab: Vehicle Info */}
                    <TabPanel value={tabValue} index={1}>
                        <Box sx={{ px: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Araç Bilgileri
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {/* Araç Sahibi */}
                                            <Grid size={{ xs: 12 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                                                    <Person sx={{ color: '#666' }} />
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Araç Sahibi
                                                        </Typography>
                                                        <Typography fontWeight={600}>
                                                            {vehicle.customer
                                                                ? (vehicle.customer.unvan || `${vehicle.customer.ad || ''} ${vehicle.customer.soyad || ''}`.trim() || '-')
                                                                : '-'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                    <DirectionsCar sx={{ color: '#666' }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Plaka
                                                        </Typography>
                                                        <Typography fontWeight={500}>{vehicle.plateNumber}</Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                    <CalendarMonth sx={{ color: '#666' }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Model Yılı
                                                        </Typography>
                                                        <Typography fontWeight={500}>{vehicle.year || '-'}</Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                    <CalendarMonth sx={{ color: '#666' }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            İlk Tescil Tarihi
                                                        </Typography>
                                                        <Typography fontWeight={500}>
                                                            {vehicle.firstRegistrationDate
                                                                ? formatDate(vehicle.firstRegistrationDate)
                                                                : '-'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                    <Settings sx={{ color: '#666' }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Motor Hacmi
                                                        </Typography>
                                                        <Typography fontWeight={500}>{vehicle.engineSize || '-'}</Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                    <LocalGasStation sx={{ color: '#666' }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Yakıt Tipi
                                                        </Typography>
                                                        <Typography fontWeight={500}>{vehicle.fuelType || '-'}</Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                    <ColorLens sx={{ color: '#666' }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Renk
                                                        </Typography>
                                                        <Typography fontWeight={500}>{vehicle.color || '-'}</Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                    <Speed sx={{ color: '#666' }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Kilometre
                                                        </Typography>
                                                        <Typography fontWeight={500}>
                                                            {vehicle.mileage ? vehicle.mileage.toLocaleString('tr-TR') + ' km' : '-'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                        {vehicle.vin && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Şasi Numarası (VIN)
                                                </Typography>
                                                <Typography fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                                                    {vehicle.vin}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Müşteri Bilgileri
                                        </Typography>
                                        {vehicle.customer ? (
                                            <>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        <Person />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography fontWeight={600}>
                                                            {vehicle.customer.unvan ||
                                                                `${vehicle.customer.ad || ''} ${vehicle.customer.soyad || ''}`.trim() ||
                                                                '-'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                {vehicle.customer.telefon && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        Tel: {vehicle.customer.telefon}
                                                    </Typography>
                                                )}
                                                {vehicle.customer.email && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        E-posta: {vehicle.customer.email}
                                                    </Typography>
                                                )}
                                            </>
                                        ) : (
                                            <Typography color="text.secondary">Müşteri bilgisi bulunamadı</Typography>
                                        )}
                                    </Paper>

                                    {/* Last Service Info */}
                                    <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Son Servis
                                        </Typography>
                                        {workOrders.length > 0 ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <CheckCircle sx={{ color: 'success.main', fontSize: 40 }} />
                                                <Box>
                                                    <Typography fontWeight={600}>
                                                        {formatDate(workOrders[0]?.closedAt || workOrders[0]?.acceptedAt)}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Son servis tarihi
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Typography color="text.secondary">Henüz servis kaydı yok</Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    </TabPanel>
                </Paper>
            </Box>
        </MainLayout>
    );
}

