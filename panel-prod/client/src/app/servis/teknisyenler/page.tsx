'use client';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { Technician } from '@/types/servis';
import {
    Add,
    Assignment,
    Build,
    Cancel,
    CheckCircle,
    Edit,
    Email,
    Phone,
    Refresh,
    Search,
    Visibility,
    Close
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Switch,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkOrder, getStatusLabel, getStatusColor } from '@/types/servis';

interface TechnicianFormData {
    code: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    specialization: string;
    isActive: boolean;
}

const initialFormData: TechnicianFormData = {
    code: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialization: '',
    isActive: true,
};

export default function TechnicianListPage() {
    const queryClient = useQueryClient();
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
    const [formData, setFormData] = useState<TechnicianFormData>(initialFormData);
    const [workOrdersDialogOpen, setWorkOrdersDialogOpen] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);

    // Fetch technicians
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['technicians', page, searchQuery, activeFilter],
        queryFn: async () => {
            const params: any = { page, limit: pageSize };
            if (searchQuery) params.search = searchQuery;
            if (activeFilter) params.isActive = activeFilter;

            const response = await axios.get('/technicians', { params });
            return response.data;
        },
    });

    const technicians: Technician[] = data?.data || [];
    const total = data?.meta?.total || data?.total || 0;
    const totalPages = data?.meta?.totalPages || data?.totalPages || 1;

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: async (data: TechnicianFormData) => {
            // Backend DTO'ya uygun format
            const payload = {
                code: data.code || undefined,
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
                phone: data.phone || undefined,
                email: data.email || undefined,
                specialization: data.specialization || undefined,
                isActive: data.isActive ?? true,
            };

            if (editingTechnician) {
                const response = await axios.put(`/technicians/${editingTechnician.id}`, payload);
                return response.data;
            } else {
                const response = await axios.post('/technicians', payload);
                return response.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['technicians'] });
            handleCloseDialog();
        },
    });

    // Fetch workload for each technician
    const { data: workloadData } = useQuery({
        queryKey: ['technicians-workload', technicians.map((t) => t.id)],
        queryFn: async () => {
            const workloads: Record<string, { activeWorkOrders: number; completedThisMonth: number }> = {};
            for (const tech of technicians.slice(0, 10)) {
                try {
                    const response = await axios.get(`/technicians/${tech.id}/workload`);
                    workloads[tech.id] = response.data;
                } catch {
                    workloads[tech.id] = { activeWorkOrders: 0, completedThisMonth: 0 };
                }
            }
            return workloads;
        },
        enabled: technicians.length > 0,
    });

    const handleOpenDialog = (technician?: Technician) => {
        if (technician) {
            setEditingTechnician(technician);
            setFormData({
                code: technician.code,
                firstName: technician.firstName,
                lastName: technician.lastName,
                phone: technician.phone || '',
                email: technician.email || '',
                specialization: technician.specialization || '',
                isActive: technician.isActive,
            });
        } else {
            setEditingTechnician(null);
            setFormData(initialFormData);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingTechnician(null);
        setFormData(initialFormData);
    };

    const handleFormChange = (field: keyof TechnicianFormData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        saveMutation.mutate(formData);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setActiveFilter('');
        setPage(1);
    };

    const specializations = [
        'Genel Mekanik',
        'Motor',
        'Şanzıman',
        'Elektrik',
        'Klima',
        'Fren Sistemi',
        'Süspansiyon',
        'Egzoz',
        'Kaporta',
        'Boya',
        'Lastik',
        'Diğer',
    ];

    const columns: GridColDef[] = [
        {
            field: 'code',
            headerName: 'Kod',
            width: 100,
            renderCell: (params: GridRenderCellParams<Technician>) => (
                <Typography variant="body2" fontWeight={600} color="primary">
                    {params.row.code}
                </Typography>
            ),
        },
        {
            field: 'name',
            headerName: 'Ad Soyad',
            width: 180,
            renderCell: (params: GridRenderCellParams<Technician>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {params.row.firstName[0]}
                        {params.row.lastName[0]}
                    </Avatar>
                    <Typography variant="body2">
                        {params.row.firstName} {params.row.lastName}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'specialization',
            headerName: 'Uzmanlık',
            width: 150,
            renderCell: (params: GridRenderCellParams<Technician>) => (
                <Chip
                    icon={<Build sx={{ fontSize: 14 }} />}
                    label={params.row.specialization || 'Genel'}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            field: 'phone',
            headerName: 'Telefon',
            width: 140,
            renderCell: (params: GridRenderCellParams<Technician>) =>
                params.row.phone ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone sx={{ fontSize: 14, color: '#666' }} />
                        <Typography variant="body2">{params.row.phone}</Typography>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        -
                    </Typography>
                ),
        },
        {
            field: 'email',
            headerName: 'E-posta',
            width: 200,
            renderCell: (params: GridRenderCellParams<Technician>) =>
                params.row.email ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email sx={{ fontSize: 14, color: '#666' }} />
                        <Typography variant="body2" noWrap>
                            {params.row.email}
                        </Typography>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        -
                    </Typography>
                ),
        },
        {
            field: 'workload',
            headerName: 'Aktif İş',
            width: 100,
            renderCell: (params: GridRenderCellParams<Technician>) => {
                const workload = workloadData?.[params.row.id];
                const activeWorkOrdersCount = Array.isArray(workload?.activeWorkOrders)
                    ? workload.activeWorkOrders.length
                    : (typeof workload?.activeWorkOrders === 'number'
                        ? workload.activeWorkOrders
                        : 0);

                const handleClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (activeWorkOrdersCount > 0) {
                        setSelectedTechnician(params.row);
                        setWorkOrdersDialogOpen(true);
                    }
                };

                return (
                    <Chip
                        icon={<Assignment sx={{ fontSize: 14 }} />}
                        label={activeWorkOrdersCount}
                        size="small"
                        color={
                            activeWorkOrdersCount > 5
                                ? 'error'
                                : activeWorkOrdersCount > 2
                                    ? 'warning'
                                    : 'default'
                        }
                        onClick={activeWorkOrdersCount > 0 ? handleClick : undefined}
                        sx={{
                            cursor: activeWorkOrdersCount > 0 ? 'pointer' : 'default',
                            '&:hover': activeWorkOrdersCount > 0 ? {
                                backgroundColor: 'action.hover',
                            } : {},
                        }}
                    />
                );
            },
        },
        {
            field: 'isActive',
            headerName: 'Durum',
            width: 100,
            renderCell: (params: GridRenderCellParams<Technician>) => (
                <Chip
                    icon={params.row.isActive ? <CheckCircle /> : <Cancel />}
                    label={params.row.isActive ? 'Aktif' : 'Pasif'}
                    size="small"
                    color={params.row.isActive ? 'success' : 'default'}
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 100,
            sortable: false,
            renderCell: (params: GridRenderCellParams<Technician>) => (
                <Tooltip title="Düzenle">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(params.row)}
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    // Stats
    const activeTechnicians = technicians.filter((t) => t.isActive).length;
    const totalWorkload = Object.values(workloadData || {}).reduce(
        (sum, w) => sum + (w?.activeWorkOrders || 0),
        0
    );

    return (
        <MainLayout>
            <Box sx={{ mb: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Teknisyenler
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Teknisyen kadrolarını ve iş yüklerini yönetin
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() => refetch()}
                        >
                            Yenile
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            sx={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            }}
                            onClick={() => handleOpenDialog()}
                        >
                            Yeni Teknisyen
                        </Button>
                    </Box>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" fontWeight="bold" color="primary">
                                    {total}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Teknisyen
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {activeTechnicians}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Aktif
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" fontWeight="bold" color="warning.main">
                                    {totalWorkload}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Aktif İş
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" fontWeight="bold" color="info.main">
                                    {activeTechnicians > 0 ? (totalWorkload / activeTechnicians).toFixed(1) : 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Ortalama İş / Teknisyen
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 5 }}>
                            <TextField
                                fullWidth
                                placeholder="Kod, isim veya uzmanlık ara..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Durum</InputLabel>
                                <Select
                                    value={activeFilter}
                                    label="Durum"
                                    onChange={(e) => {
                                        setActiveFilter(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    <MenuItem value="">Tümü</MenuItem>
                                    <MenuItem value="true">Aktif</MenuItem>
                                    <MenuItem value="false">Pasif</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleClearFilters}
                                fullWidth
                            >
                                Temizle
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Teknisyenler yüklenirken bir hata oluştu.
                    </Alert>
                )}

                {/* DataGrid */}
                <Paper sx={{ height: 'calc(100vh - 480px)', minHeight: 400 }}>
                    <DataGrid
                        rows={technicians}
                        columns={columns}
                        loading={isLoading}
                        pageSizeOptions={[20]}
                        disableRowSelectionOnClick
                        hideFooter
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell': {
                                borderColor: '#f0f0f0',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f5f5f5',
                                borderBottom: '2px solid #e0e0e0',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#f8f9fa',
                            },
                        }}
                    />
                </Paper>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, value) => setPage(value)}
                            color="primary"
                        />
                    </Box>
                )}

                {/* Add/Edit Dialog */}
                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {editingTechnician ? 'Teknisyen Düzenle' : 'Yeni Teknisyen Ekle'}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Kod *"
                                    value={formData.code}
                                    onChange={(e) => handleFormChange('code', e.target.value)}
                                    disabled={!!editingTechnician}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Ad *"
                                    value={formData.firstName}
                                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Soyad *"
                                    value={formData.lastName}
                                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Telefon"
                                    value={formData.phone}
                                    onChange={(e) => handleFormChange('phone', e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="E-posta"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleFormChange('email', e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Uzmanlık Alanı</InputLabel>
                                    <Select
                                        value={formData.specialization}
                                        label="Uzmanlık Alanı"
                                        onChange={(e) => handleFormChange('specialization', e.target.value)}
                                    >
                                        <MenuItem value="">Seçiniz</MenuItem>
                                        {specializations.map((spec) => (
                                            <MenuItem key={spec} value={spec}>
                                                {spec}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isActive}
                                            onChange={(e) => handleFormChange('isActive', e.target.checked)}
                                        />
                                    }
                                    label="Aktif"
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>İptal</Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!formData.code || !formData.firstName || !formData.lastName || saveMutation.isPending}
                        >
                            {editingTechnician ? 'Güncelle' : 'Ekle'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Work Orders Dialog */}
                <Dialog
                    open={workOrdersDialogOpen}
                    onClose={() => setWorkOrdersDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">
                                    {selectedTechnician?.firstName} {selectedTechnician?.lastName} - Aktif İş Emirleri
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedTechnician?.code}
                                </Typography>
                            </Box>
                            <IconButton onClick={() => setWorkOrdersDialogOpen(false)} size="small">
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        {selectedTechnician && (() => {
                            const workload = workloadData?.[selectedTechnician.id];
                            const activeWorkOrders: WorkOrder[] = Array.isArray(workload?.activeWorkOrders)
                                ? workload.activeWorkOrders
                                : [];

                            if (activeWorkOrders.length === 0) {
                                return (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Assignment sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                                        <Typography color="text.secondary">
                                            Bu teknisyene ait aktif iş emri bulunmamaktadır.
                                        </Typography>
                                    </Box>
                                );
                            }

                            return (
                                <Box>
                                    {activeWorkOrders.map((wo) => (
                                        <Paper
                                            key={wo.id}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                mb: 2,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    boxShadow: 2,
                                                    backgroundColor: 'action.hover',
                                                },
                                            }}
                                            onClick={() => {
                                                router.push(`/servis/is-emirleri/${wo.id}`);
                                                setWorkOrdersDialogOpen(false);
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {wo.workOrderNo}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {wo.vehicle?.plateNumber} - {wo.vehicle?.brand} {wo.vehicle?.model}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {wo.customer?.unvan || wo.customer?.ad || 'Müşteri bilgisi yok'}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={getStatusLabel(wo.status)}
                                                    size="small"
                                                    color={getStatusColor(wo.status) as any}
                                                />
                                            </Box>
                                            {wo.complaint && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    <strong>Şikayet:</strong> {wo.complaint}
                                                </Typography>
                                            )}
                                            {wo.estimatedDelivery && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    <strong>Tahmini Teslim:</strong> {new Date(wo.estimatedDelivery).toLocaleDateString('tr-TR')}
                                                </Typography>
                                            )}
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<Visibility />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/servis/is-emirleri/${wo.id}`);
                                                        setWorkOrdersDialogOpen(false);
                                                    }}
                                                >
                                                    Detayları Görüntüle
                                                </Button>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            );
                        })()}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setWorkOrdersDialogOpen(false)}>Kapat</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MainLayout>
    );
}

