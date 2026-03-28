'use client';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import {
    Add,
    ArrowBack,
    Delete,
    Edit,
    DirectionsCar,
    LocalGasStation,
    History,
    FileDownload,
    Analytics,
    Cancel,
    CheckCircle,
    Info,
    Description as FileText,
    CalendarToday,
    Person,
    DriveEta,
    Speed,
    ConfirmationNumber,
    Notes,
    Download,
    TrendingUp,
    Description,
    LocalParking,
    Refresh,
} from '@mui/icons-material';
import {
    Alert,
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
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    TextField,
    Tooltip,
    Typography,
    Avatar,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, memo, useCallback, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { registerFonts, drawHeader, drawTable } from '@/lib/pdf-utils';

interface Personel {
    id: string;
    ad: string;
    soyad: string;
}

interface CompanyVehicle {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year?: number;
    chassisno?: string;
    engineNo?: string;
    registrationDate?: string;
    registrationSerialNo?: string;
    lastInspectionDate?: string;
    insuranceDate?: string;
    vehicleType?: string;
    fuelType?: string;
    isActive: boolean;
    assignedEmployeeId?: string;
    registrationImageUrl?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    personel?: Personel;
}

interface VehicleExpense {
    id: string;
    vehicleId: string;
    masrafTipi: string;
    tarih: string;
    tutar: number;
    aciklama?: string;
    belgeNo?: string;
    kilometre?: number;
    createdAt: string;
}

const EXPENSE_TYPES = [
    { value: 'YAKIT', label: 'Yakıt', icon: LocalGasStation, color: '#3b82f6' },
    { value: 'BAKIM', label: 'Bakım', icon: History, color: '#f59e0b' },
    { value: 'MUAYENE', label: 'Muayene', icon: Info, color: '#8b5cf6' },
    { value: 'TRAFIK_SIGORTASI', label: 'Trafik Sigortası', icon: Description, color: '#10b981' },
    { value: 'KASKO', label: 'Kasko', icon: CheckCircle, color: '#0ea5e9' },
    { value: 'CEZA', label: 'Ceza', icon: Cancel, color: '#ef4444' },
    { value: 'OGS_HGS', label: 'OGS / HGS', icon: DriveEta, color: '#6366f1' },
    { value: 'OTOPARK', label: 'Otopark', icon: LocalParking, color: '#475569' },
    { value: 'YIKAMA', label: 'Yıkama', icon: LocalGasStation, color: '#14b8a6' },
    { value: 'DIGER', label: 'Diğer', icon: Notes, color: '#64748b' }
];

const getExpenseTypeInfo = (type: string) => {
    return EXPENSE_TYPES.find(t => t.value === type) || EXPENSE_TYPES[EXPENSE_TYPES.length - 1];
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(value);

const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch (error) {
        return '-';
    }
};

const DataGridNoRowsOverlay = () => (
    <Box
        sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted-foreground)',
            gap: 1
        }}
    >
        <History sx={{ fontSize: 48, opacity: 0.2 }} />
        <Typography variant="body2">Masraf kaydı bulunamadı</Typography>
    </Box>
);

const ExpenseFormDialog = memo(({
    open,
    editMode,
    formData,
    loading,
    onClose,
    onSubmit,
    onFormChange
}: any) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    bgcolor: 'var(--card)',
                    backgroundImage: 'none',
                    borderRadius: isMobile ? 0 : '16px',
                    border: '1px solid var(--border)',
                },
            }}
        >
            <DialogTitle component="div" sx={{
                p: 2.5,
                bgcolor: 'var(--card)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        background: editMode ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <TrendingUp sx={{ color: '#fff' }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'var(--foreground)' }}>
                            {editMode ? 'Masraf Düzenle' : 'Yeni Araç Masrafı'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                            Operasyonel harcama detaylarını girin
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'var(--muted-foreground)' }}>
                    <Cancel />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Masraf Tipi</InputLabel>
                            <Select
                                value={formData.masrafTipi || ''}
                                onChange={(e) => onFormChange('masrafTipi', e.target.value)}
                                label="Masraf Tipi"
                            >
                                {EXPENSE_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <type.icon sx={{ fontSize: 18, color: type.color }} />
                                            {type.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            required
                            type="number"
                            label="Tutar"
                            placeholder="0,00"
                            value={formData.tutar || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('tutar', e.target.value)}
                            InputProps={{
                                startAdornment: <Typography variant="body2" sx={{ mr: 1, color: 'var(--muted-foreground)' }}>₺</Typography>,
                                inputProps: { min: 0.01, step: 0.01 }
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            type="date"
                            label="İşlem Tarihi"
                            value={formData.tarih || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('tarih', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Kilometre"
                            placeholder="Örn: 45200"
                            value={formData.kilometre || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('kilometre', e.target.value ? parseInt(e.target.value, 10) : '')}
                            InputProps={{
                                endAdornment: <Typography variant="caption" sx={{ ml: 1, color: 'var(--muted-foreground)' }}>KM</Typography>
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Belge No"
                            placeholder="Fatura/Fiş No"
                            value={formData.belgeNo || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('belgeNo', e.target.value)}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="Açıklama"
                            value={formData.aciklama || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('aciklama', e.target.value)}
                            multiline
                            rows={3}
                            placeholder="Masraf hakkında detaylı bilgi..."
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid var(--border)', gap: 1.5 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        px: 3,
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                    }}
                >
                    İptal
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={loading}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        px: 4,
                        bgcolor: 'var(--destructive)',
                        color: 'var(--destructive-foreground)',
                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
                    }}
                >
                    {editMode ? 'Güncelle' : 'Masrafı Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

ExpenseFormDialog.displayName = 'ExpenseFormDialog';

export default function VehicleDetailPage() {
    const params = useParams();
    const vehicleId = params.id as string;
    const router = useRouter();
    const queryClient = useQueryClient();
    const [actionLoading, setActionLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<VehicleExpense | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info'
    });

    const showSnackbar = useCallback(
        (message: string, severity: 'success' | 'error' | 'info') => {
            setSnackbar({ open: true, message, severity });
        },
        [],
    );

    const [formData, setFormData] = useState<Partial<VehicleExpense>>({
        masrafTipi: 'YAKIT',
        tarih: new Date().toISOString().split('T')[0],
        tutar: 0,
        aciklama: '',
        belgeNo: '',
    });

    const {
        data: vehicle,
        isLoading: isVehicleLoading,
    } = useQuery<CompanyVehicle>({
        queryKey: ['company-vehicle', vehicleId],
        queryFn: async () => {
            const response = await axios.get(`/company-vehicles/${vehicleId}`);
            return response.data;
        },
        enabled: !!vehicleId,
    });

    const {
        data: expenses = [],
        isLoading: isExpensesLoading,
    } = useQuery<VehicleExpense[]>({
        queryKey: ['vehicle-expenses', vehicleId],
        queryFn: async () => {
            const response = await axios.get(`/vehicle-expenses/vehicle/${vehicleId}`);
            return response.data;
        },
        enabled: !!vehicleId,
    });

    const { data: tenantSettings } = useQuery({
        queryKey: ['tenant-settings'],
        queryFn: async () => {
            const response = await axios.get('/tenants/settings');
            return response.data;
        },
    });

    const handleOpenDialog = useCallback((expense?: VehicleExpense) => {
        if (expense) {
            setEditMode(true);
            setSelectedExpense(expense);
            setFormData({
                ...expense,
                tarih: expense.tarih ? new Date(expense.tarih).toISOString().split('T')[0] : '',
            });
        } else {
            setEditMode(false);
            setSelectedExpense(null);
            setFormData({
                masrafTipi: 'YAKIT',
                tarih: new Date().toISOString().split('T')[0],
                tutar: '' as any,
                aciklama: '',
                belgeNo: '',
                kilometre: '' as any,
            });
        }
        setOpenDialog(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setOpenDialog(false);
        setEditMode(false);
        setSelectedExpense(null);
    }, []);

    const handleFormChange = useCallback((field: string, value: string | number | boolean | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = async () => {
        try {
            const tutarNumber = typeof formData.tutar === 'string' ? parseFloat(formData.tutar) : formData.tutar;

            if (!formData.masrafTipi || !tutarNumber || tutarNumber <= 0) {
                showSnackbar('Lütfen geçerli bir masraf tipi ve tutar girin', 'error');
                return;
            }

            setActionLoading(true);

            const submitData = {
                ...formData,
                tutar: tutarNumber,
                vehicleId,
                tarih: formData.tarih ? new Date(formData.tarih).toISOString() : new Date().toISOString(),
            };

            if (editMode && selectedExpense) {
                await axios.patch(`/vehicle-expenses/${selectedExpense.id}`, submitData);
                showSnackbar('Masraf güncellendi', 'success');
            } else {
                await axios.post('/vehicle-expenses', submitData);
                showSnackbar('Masraf eklendi', 'success');
            }

            handleCloseDialog();
            queryClient.invalidateQueries({ queryKey: ['vehicle-expenses', vehicleId] });
        } catch (error: any) {
            showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedExpense) return;

        try {
            setActionLoading(true);
            await axios.delete(`/vehicle-expenses/${selectedExpense.id}`);
            showSnackbar('Masraf silindi', 'success');
            setOpenDelete(false);
            setSelectedExpense(null);
            queryClient.invalidateQueries({ queryKey: ['vehicle-expenses', vehicleId] });
        } catch (error: any) {
            showSnackbar(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const totalExpense = useMemo(() => {
        return expenses.reduce((sum: number, exp: VehicleExpense) => sum + Number(exp.tutar), 0);
    }, [expenses]);

    const handleExport = useCallback((type: 'excel' | 'pdf') => {
        if (!vehicle) return;

        if (type === 'excel') {
            const exportData = expenses.map((exp: VehicleExpense) => ({
                'Tarih': formatDate(exp.tarih),
                'Masraf Tipi': getExpenseTypeInfo(exp.masrafTipi).label,
                'Tutar': formatCurrency(exp.tutar),
                'Kilometre': exp.kilometre ? `${exp.kilometre.toLocaleString('tr-TR')} km` : '-',
                'Belge No': exp.belgeNo || '-',
                'Açıklama': exp.aciklama || '-'
            }));
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Araç Masrafları');
            XLSX.writeFile(wb, `${vehicle.plate}_masraf_raporu_${new Date().toISOString().split('T')[0]}.xlsx`);
        } else {
            const doc = new jsPDF();
            registerFonts(doc);

            const companyName = tenantSettings?.companyType === 'COMPANY'
                ? tenantSettings?.companyName
                : (tenantSettings?.firstName ? `${tenantSettings.firstName} ${tenantSettings.lastName}` : 'OTOMUHASEBE');

            drawHeader(doc, 'ARAÇ MASRAF RAPORU', `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`, companyName);

            // Vehicle Info Section
            doc.setFontSize(14);
            doc.setFont('Roboto', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Araç Bilgileri', 20, 60);

            doc.setFontSize(10);
            doc.setFont('Roboto', 'normal');
            doc.text(`Plaka: ${vehicle.plate}`, 20, 68);
            doc.text(`Marka / Model: ${vehicle.brand} ${vehicle.model} ${vehicle.year ? `(${vehicle.year})` : ''}`, 20, 75);
            doc.text(`Zimmetli Personel: ${vehicle.personel ? `${vehicle.personel.ad} ${vehicle.personel.soyad}` : '-'}`, 20, 82);

            doc.text(`Toplam Masraf: ${formatCurrency(totalExpense)}`, 120, 68);
            doc.text(`Toplam Masraf Sayısı: ${expenses.length}`, 120, 75);

            // Table
            const headers = ['Tarih', 'Masraf Tipi', 'KM', 'Belge No', 'Tutar'];
            const rows = expenses.map((exp: VehicleExpense) => [
                formatDate(exp.tarih),
                getExpenseTypeInfo(exp.masrafTipi).label,
                exp.kilometre ? exp.kilometre.toLocaleString('tr-TR') : '-',
                exp.belgeNo || '-',
                formatCurrency(exp.tutar)
            ]);
            const colWidths = [30, 45, 30, 40, 45]; // Total 190

            drawTable(doc, 95, headers, rows, colWidths);

            doc.save(`${vehicle.plate}_masraf_raporu_${new Date().toISOString().split('T')[0]}.pdf`);
        }
    }, [vehicle, expenses, totalExpense, tenantSettings]);

    const columns = useMemo<GridColDef[]>(() => [
        {
            field: 'tarih',
            headerName: 'İşlem Tarihi',
            width: 130,
            renderCell: (params: any) => (
                <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>
                    {formatDate(params.row.tarih)}
                </Typography>
            ),
        },
        {
            field: 'masrafTipi',
            headerName: 'Masraf Türü',
            width: 180,
            renderCell: (params: any) => {
                const info = getExpenseTypeInfo(params.row.masrafTipi);
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '8px',
                            bgcolor: `${info.color}15`,
                            color: info.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <info.icon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 600 }}>
                            {info.label}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            field: 'tutar',
            headerName: 'Tutar',
            width: 140,
            renderCell: (params: any) => (
                <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--destructive)' }}>
                    {formatCurrency(params.row.tutar)}
                </Typography>
            ),
        },
        {
            field: 'kilometre',
            headerName: 'Kilometre',
            width: 120,
            renderCell: (params: any) => (
                <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                    {params.row.kilometre ? `${params.row.kilometre.toLocaleString('tr-TR')} km` : '-'}
                </Typography>
            ),
        },
        {
            field: 'belgeNo',
            headerName: 'Belge No',
            width: 130,
            renderCell: (params: any) => (
                <Typography variant="caption" sx={{
                    color: 'var(--muted-foreground)',
                    fontFamily: 'monospace',
                    bgcolor: 'color-mix(in srgb, var(--muted) 40%, transparent)',
                    px: 0.8,
                    py: 0.2,
                    borderRadius: '4px'
                }}>
                    {params.row.belgeNo || '-'}
                </Typography>
            ),
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            sortable: false,
            filterable: false,
            width: 120,
            renderCell: (params: any) => {
                const row = params.row as VehicleExpense;
                return (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                        <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(row)}
                            sx={{
                                color: '#f59e0b',
                                bgcolor: 'rgba(245, 158, 11, 0.08)',
                                '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.15)' }
                            }}
                        >
                            <Edit sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => {
                                setSelectedExpense(row);
                                setOpenDelete(true);
                            }}
                            sx={{
                                color: 'var(--destructive)',
                                bgcolor: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
                                '&:hover': { bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)' }
                            }}
                        >
                            <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                );
            },
        },
    ], [handleOpenDialog]);

    if (isVehicleLoading) return <MainLayout><Box p={4} sx={{ display: 'flex', justifyContent: 'center' }}>Yükleniyor...</Box></MainLayout>;
    if (!vehicle) return <MainLayout><Box p={4} sx={{ textAlign: 'center' }}>Araç bulunamadı.</Box></MainLayout>;

    return (
        <MainLayout>
            <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--background)', minHeight: '100vh' }}>
                {/* Modern Header */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            onClick={() => router.push('/company-vehicles')}
                            sx={{
                                bgcolor: 'var(--card)',
                                border: '1px solid var(--border)',
                                color: 'var(--foreground)',
                                '&:hover': { bgcolor: 'color-mix(in srgb, var(--muted) 20%, transparent)' }
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                <Box sx={{
                                    bgcolor: '#fff',
                                    border: '1.5px solid #1e293b',
                                    borderRadius: '6px',
                                    px: 1.5,
                                    py: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    position: 'relative',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '6px',
                                        bgcolor: '#3b82f6',
                                        borderRadius: '6px 0 0 6px'
                                    }
                                }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '0.05em' }}>
                                        {vehicle.plate}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={vehicle.isActive ? 'AKTİF' : 'PASİF'}
                                    size="small"
                                    icon={vehicle.isActive ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Cancel sx={{ fontSize: '14px !important' }} />}
                                    sx={{
                                        bgcolor: vehicle.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: vehicle.isActive ? '#10b981' : '#ef4444',
                                        fontWeight: 700,
                                        border: 'none'
                                    }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                                {vehicle.brand} {vehicle.model} • {vehicle.year || 'Bilinmiyor'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' } }}>
                        <Button
                            variant="outlined"
                            startIcon={<Description />}
                            onClick={() => handleExport('pdf')}
                            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        >
                            Rapor Al (PDF)
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                bgcolor: 'var(--destructive)',
                                color: 'var(--destructive-foreground)',
                                px: 3,
                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
                            }}
                        >
                            Yeni Masraf Ekle
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Vehicle Details Card */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card sx={{ bgcolor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', height: '100%' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <Info sx={{ color: 'var(--primary)' }} />
                                    <Typography variant="h6" fontWeight={700} sx={{ color: 'var(--foreground)' }}>Araç Teknik Bilgileri</Typography>
                                </Box>
                                <Grid container spacing={4}>
                                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                        <InfoItem icon={DirectionsCar} label="Araç Tipi" value={vehicle.vehicleType || '-'} />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                        <InfoItem icon={LocalGasStation} label="Yakıt Tipi" value={vehicle.fuelType || '-'} />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                        <InfoItem icon={CalendarToday} label="Kayıt Yılı" value={vehicle.year?.toString() || '-'} />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                        <InfoItem icon={ConfirmationNumber} label="Şase No" value={vehicle.chassisno || '-'} />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                        <InfoItem icon={Speed} label="Motor No" value={vehicle.engineNo || '-'} />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                        <InfoItem icon={ConfirmationNumber} label="Ruhsat Seri No" value={vehicle.registrationSerialNo || '-'} />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                        <InfoItem icon={CalendarToday} label="Tescil Tarihi" value={formatDate(vehicle.registrationDate)} />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                        <InfoItem icon={Info} label="Muayene / Sigorta" value={
                                            <Box>
                                                <Typography variant="caption" display="block">M: {formatDate(vehicle.lastInspectionDate)}</Typography>
                                                <Typography variant="caption" display="block">S: {formatDate(vehicle.insuranceDate)}</Typography>
                                            </Box>
                                        } />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Box sx={{ p: 2, bgcolor: 'color-mix(in srgb, var(--primary) 5%, transparent)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: 'var(--primary)', width: 40, height: 40 }}>
                                                <Person />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block' }}>Zimmetli Personel</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                                                    {vehicle.personel ? `${vehicle.personel.ad} ${vehicle.personel.soyad}` : 'Henüz Atanmamış'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                                {vehicle.notes && (
                                    <Box sx={{ mt: 4, p: 2, bgcolor: 'color-mix(in srgb, var(--muted) 20%, transparent)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Notes sx={{ fontSize: 18, color: 'var(--muted-foreground)' }} />
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Araç Notları</Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>{vehicle.notes}</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Summary Stats Card */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                            <Card sx={{
                                bgcolor: 'color-mix(in srgb, var(--destructive) 5%, var(--card))',
                                border: '1px solid var(--destructive)',
                                borderRadius: '20px',
                                boxShadow: 'var(--shadow-sm)',
                                p: 3
                            }}>
                                <Typography variant="subtitle2" sx={{ color: 'var(--destructive)', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Toplam Operasyonel Masraf
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: 'var(--destructive)', letterSpacing: '-0.04em' }}>
                                    {formatCurrency(totalExpense)}
                                </Typography>
                                <Divider sx={{ my: 2, borderColor: 'color-mix(in srgb, var(--destructive) 20%, transparent)' }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>Toplam İşlem Sayısı</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>{expenses.length} Adet</Typography>
                                </Box>
                            </Card>

                            <Card sx={{ bgcolor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="subtitle2" sx={{ color: 'var(--muted-foreground)', fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>İşlem Özeti</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <StatRow label="Son İşlem" value={expenses.length > 0 ? formatDate(expenses[0].tarih) : '-'} />
                                    <StatRow label="En Yüksek Masraf" value={expenses.length > 0 ? formatCurrency(Math.max(...expenses.map(e => Number(e.tutar)))) : '-'} />
                                    <StatRow label="Ortalama Masraf" value={expenses.length > 0 ? formatCurrency(totalExpense / expenses.length) : '-'} />
                                </Box>
                            </Card>
                        </Box>
                    </Grid>

                    {/* Expenses DataGrid */}
                    <Grid size={12}>
                        <Card sx={{ bgcolor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                            <Box sx={{ p: 2.5, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight={700}>Masraf Geçmişi</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton size="small" sx={{ bgcolor: 'color-mix(in srgb, var(--muted) 20%, transparent)', borderRadius: '8px' }}>
                                        <Refresh sx={{ fontSize: 20 }} />
                                    </IconButton>
                                    <Button
                                        size="small"
                                        startIcon={<Download />}
                                        onClick={() => handleExport('excel')}
                                        sx={{ borderRadius: '8px', textTransform: 'none', color: 'var(--muted-foreground)', '&:hover': { color: 'var(--primary)' } }}
                                    >
                                        Dışa Aktar
                                    </Button>
                                </Box>
                            </Box>
                            <DataGrid
                                rows={expenses}
                                columns={columns}
                                loading={isExpensesLoading || actionLoading}
                                disableRowSelectionOnClick
                                autoHeight
                                slots={{ noRowsOverlay: DataGridNoRowsOverlay }}
                                rowHeight={70}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10 } },
                                    sorting: { sortModel: [{ field: 'tarih', sort: 'desc' }] },
                                }}
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-columnHeader': {
                                        bgcolor: 'transparent',
                                        color: 'var(--muted-foreground)',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    },
                                    '& .MuiDataGrid-cell': {
                                        borderColor: 'var(--border)',
                                        display: 'flex',
                                        alignItems: 'center'
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        bgcolor: 'color-mix(in srgb, var(--muted) 10%, transparent)'
                                    }
                                }}
                            />
                        </Card>
                    </Grid>
                </Grid>

                {/* Dialogs */}
                <ExpenseFormDialog
                    open={openDialog}
                    editMode={editMode}
                    formData={formData}
                    loading={actionLoading}
                    onClose={handleCloseDialog}
                    onSubmit={handleSubmit}
                    onFormChange={handleFormChange}
                />

                <Dialog
                    open={openDelete}
                    onClose={() => setOpenDelete(false)}
                    PaperProps={{ sx: { borderRadius: '16px', p: 1, bgcolor: 'var(--card)', backgroundImage: 'none' } }}
                >
                    <DialogTitle sx={{ textAlign: 'center', pb: 0, color: 'var(--foreground)' }}>
                        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                            <Delete sx={{ fontSize: 32 }} />
                        </Box>
                        Masraf Kaydını Sil
                    </DialogTitle>
                    <DialogContent>
                        <Typography sx={{ textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            Bu masraf kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                        <Button variant="outlined" onClick={() => setOpenDelete(false)} sx={{ borderRadius: '10px', textTransform: 'none', px: 4, borderColor: 'var(--border)', color: 'var(--foreground)' }}>İptal</Button>
                        <Button variant="contained" color="error" onClick={handleDelete} disabled={actionLoading} sx={{ borderRadius: '10px', textTransform: 'none', px: 4, bgcolor: '#ef4444', color: '#fff' }}>Sil</Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>{snackbar.message}</Alert>
                </Snackbar>
            </Box>
        </MainLayout>
    );
}

function InfoItem({ icon: Icon, label, value }: any) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ fontSize: 16, color: 'var(--muted-foreground)' }} />
                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>{label}</Typography>
            </Box>
            <Box sx={{ fontWeight: 700, color: 'var(--foreground)', pl: 3, fontSize: '0.875rem' }}>
                {value}
            </Box>
        </Box>
    );
}

function StatRow({ label, value }: any) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>{label}</Typography>
            <Box sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.875rem' }}>{value}</Box>
        </Box>
    );
}
