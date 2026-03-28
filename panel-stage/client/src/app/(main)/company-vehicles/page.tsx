'use client';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import {
    Add,
    DirectionsCar,
    Delete,
    Edit,
    Visibility,
    Cancel,
    TrendingUp,
    TrendingDown,
    Search,
    FilterList,
    LocalParking,
    LocalGasStation,
    History,
    FileDownload,
    Analytics,
    CheckCircle,
    GridView,
    ViewList,
} from '@mui/icons-material';
import { registerFonts, drawHeader, drawTable } from '@/lib/pdf-utils';
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
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Switch,
    TextField,
    Tooltip,
    Typography,
    InputAdornment,
    Avatar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { memo, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    expenses?: { id: string; tutar: number | string; masrafTipi: string }[];
}

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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2
    }).format(amount);
};

const isDateNear = (dateString: string | undefined | null) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);
    return date < thirtyDaysLater;
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
        <DirectionsCar sx={{ fontSize: 48, opacity: 0.2 }} />
        <Typography variant="body2">Kayıt bulunamadı</Typography>
    </Box>
);

const VehicleFormDialog = memo(({
    open,
    editMode,
    formData,
    loading,
    personeller,
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
                        background: editMode ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <DirectionsCar sx={{ color: '#fff' }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'var(--foreground)' }}>
                            {editMode ? 'Araç Düzenle' : 'Yeni Şirket Aracı'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                            Araç detaylarını ve zimmet bilgilerini girin
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
                        <TextField
                            fullWidth
                            required
                            label="Plaka"
                            placeholder="34 ABC 123"
                            value={formData.plate || ''}
                            onChange={(e) => onFormChange('plate', e.target.value.toUpperCase())}
                            helperText="Araç plakasını boşluklu yazınız"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            required
                            label="Marka"
                            placeholder="Örn: Toyota"
                            value={formData.brand || ''}
                            onChange={(e) => onFormChange('brand', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            required
                            label="Model"
                            placeholder="Örn: Corolla"
                            value={formData.model || ''}
                            onChange={(e) => onFormChange('model', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Yıl"
                            placeholder="2024"
                            value={formData.year || ''}
                            onChange={(e) => onFormChange('year', e.target.value ? parseInt(e.target.value, 10) : '')}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Şase No"
                            value={formData.chassisno || ''}
                            onChange={(e) => onFormChange('chassisno', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Motor No"
                            value={formData.engineNo || ''}
                            onChange={(e) => onFormChange('engineNo', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Tescil Tarihi"
                            value={formData.registrationDate || ''}
                            onChange={(e) => onFormChange('registrationDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Ruhsat Seri No"
                            placeholder="ABC123456"
                            value={formData.registrationSerialNo || ''}
                            onChange={(e) => onFormChange('registrationSerialNo', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Son Muayene Tarihi"
                            value={formData.lastInspectionDate || ''}
                            onChange={(e) => onFormChange('lastInspectionDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Trafik Sigortası Tarihi"
                            value={formData.insuranceDate || ''}
                            onChange={(e) => onFormChange('insuranceDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Araç Tipi</InputLabel>
                            <Select
                                value={formData.vehicleType || ''}
                                onChange={(e) => onFormChange('vehicleType', e.target.value)}
                                label="Araç Tipi"
                            >
                                <MenuItem value="Binek">Binek</MenuItem>
                                <MenuItem value="Ticari">Ticari</MenuItem>
                                <MenuItem value="Hafif Ticari">Hafif Ticari</MenuItem>
                                <MenuItem value="Kamyon">Kamyon</MenuItem>
                                <MenuItem value="Diğer">Diğer</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Yakıt Tipi</InputLabel>
                            <Select
                                value={formData.fuelType || ''}
                                onChange={(e) => onFormChange('fuelType', e.target.value)}
                                label="Yakıt Tipi"
                            >
                                <MenuItem value="Benzin">Benzin</MenuItem>
                                <MenuItem value="Dizel">Dizel</MenuItem>
                                <MenuItem value="Hibrit">Hibrit</MenuItem>
                                <MenuItem value="Elektrik">Elektrik</MenuItem>
                                <MenuItem value="LPG">LPG</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Zimmetli Personel</InputLabel>
                            <Select
                                value={formData.assignedEmployeeId || ''}
                                onChange={(e) => onFormChange('assignedEmployeeId', e.target.value)}
                                label="Zimmetli Personel"
                            >
                                <MenuItem value="">
                                    <em>Boşta (Zimmetsiz)</em>
                                </MenuItem>
                                {personeller?.map((p: Personel) => (
                                    <MenuItem key={p.id} value={p.id}>
                                        {p.ad} {p.soyad}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={12}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            bgcolor: 'color-mix(in srgb, var(--muted) 20%, transparent)',
                            borderRadius: '12px',
                            border: '1px dashed var(--border)'
                        }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive !== false}
                                        onChange={(e) => onFormChange('isActive', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--foreground)' }}>
                                            Araç Durumu: {formData.isActive !== false ? 'Aktif' : 'Pasif'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                                            {formData.isActive !== false ? 'Araç şu an operasyonda ve kullanılabilir durumda' : 'Araç şu an kullanım dışı'}
                                        </Typography>
                                    </Box>
                                }
                                sx={{ m: 0, width: '100%' }}
                            />
                        </Box>
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="Notlar"
                            value={formData.notes || ''}
                            onChange={(e) => onFormChange('notes', e.target.value)}
                            multiline
                            rows={3}
                            placeholder="Araç hakkında ek bilgiler..."
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
                        bgcolor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    {editMode ? 'Değişiklikleri Kaydet' : 'Aracı Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

VehicleFormDialog.displayName = 'VehicleFormDialog';

const StatCard = ({ title, value, subValue, icon: Icon, color, trend }: any) => (
    <Card sx={{
        bgcolor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 'var(--shadow-md)',
            borderColor: color
        }
    }}>
        <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, letterSpacing: '0.05em' }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--foreground)', mt: 0.5, letterSpacing: '-0.02em' }}>
                        {value}
                    </Typography>
                    {subValue && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
                            {trend && (
                                trend === 'up'
                                    ? <TrendingUp sx={{ fontSize: 16, color: '#10b981' }} />
                                    : <TrendingDown sx={{ fontSize: 16, color: '#ef4444' }} />
                            )}
                            <Typography variant="caption" sx={{ color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : 'var(--muted-foreground)', fontWeight: 600 }}>
                                {subValue}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Box sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: `${color}15`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${color}10`
                }}>
                    <Icon />
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const VehicleGridCard = memo(({ vehicle, onEdit, onDelete, onView }: any) => {
    const isInspectionNear = isDateNear(vehicle.lastInspectionDate);
    const isInsuranceNear = isDateNear(vehicle.insuranceDate);
    const totalExpense = vehicle.expenses?.reduce((sum: number, e: any) => sum + (Number(e.tutar) || 0), 0) || 0;

    return (
        <Card sx={{
            bgcolor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 'var(--shadow-md)',
                borderColor: 'var(--primary)'
            }
        }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--border)' }}>
                <Box>
                    <Box sx={{
                        bgcolor: '#fff',
                        border: '1.5px solid #111827',
                        borderRadius: '6px',
                        px: 1.5,
                        py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        position: 'relative',
                        mb: 1,
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '6px',
                            bgcolor: '#2563eb',
                            borderRadius: '5px 0 0 5px'
                        }
                    }}>
                        <Typography variant="body1" sx={{ fontWeight: 900, color: '#111827', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
                            {vehicle.plate}
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '1rem' }}>
                        {vehicle.brand} {vehicle.model}
                    </Typography>
                </Box>
                <Chip
                    label={vehicle.isActive !== false ? "Aktif" : "Pasif"}
                    size="small"
                    sx={{
                        bgcolor: vehicle.isActive !== false ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: vehicle.isActive !== false ? '#10b981' : '#ef4444',
                        fontWeight: 700,
                        borderRadius: '8px',
                        height: 24
                    }}
                />
            </Box>

            <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <LocalGasStation sx={{ fontSize: 18, color: 'var(--muted-foreground)' }} />
                            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>{vehicle.fuelType || '-'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <History sx={{ fontSize: 18, color: 'var(--muted-foreground)' }} />
                            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>{vehicle.year || '-'}</Typography>
                        </Box>
                    </Grid>
                    <Grid size={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isInspectionNear ? '#ef4444' : '#10b981' }} />
                            <Typography variant="caption" sx={{ color: isInspectionNear ? '#ef4444' : 'var(--muted-foreground)', fontWeight: isInspectionNear ? 700 : 400 }}>
                                M: {formatDate(vehicle.lastInspectionDate)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isInsuranceNear ? '#ef4444' : '#10b981' }} />
                            <Typography variant="caption" sx={{ color: isInsuranceNear ? '#ef4444' : 'var(--muted-foreground)', fontWeight: isInsuranceNear ? 700 : 400 }}>
                                S: {formatDate(vehicle.insuranceDate)}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.85rem', bgcolor: 'var(--primary)', color: '#fff' }}>
                            {vehicle.personel ? `${vehicle.personel.ad?.[0] || ''}${vehicle.personel.soyad?.[0] || ''}` : <DirectionsCar sx={{ fontSize: 16 }} />}
                        </Avatar>
                        <Box>
                            <Typography variant="caption" display="block" sx={{ color: 'var(--muted-foreground)', lineHeight: 1 }}>Zimmet</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{vehicle.personel ? `${vehicle.personel.ad} ${vehicle.personel.soyad}` : 'Boşta'}</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" display="block" sx={{ color: 'var(--muted-foreground)', lineHeight: 1 }}>Toplam Masraf</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{formatCurrency(totalExpense)}</Typography>
                    </Box>
                </Box>
            </CardContent>

            <Box sx={{ p: 1.5, bgcolor: 'color-mix(in srgb, var(--muted) 10%, transparent)', borderTop: '1px solid var(--border)', display: 'flex', gap: 1 }}>
                <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility fontSize="small" />}
                    onClick={onView}
                    sx={{ borderRadius: '10px', textTransform: 'none', borderColor: 'var(--border)', color: 'var(--foreground)', height: 36 }}
                >
                    Detay
                </Button>
                <IconButton size="small" onClick={onEdit} sx={{ bgcolor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', color: '#f59e0b', width: 36, height: 36 }}>
                    <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={onDelete} sx={{ bgcolor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', color: '#ef4444', width: 36, height: 36 }}>
                    <Delete fontSize="small" />
                </IconButton>
            </Box>
        </Card>
    );
});

VehicleGridCard.displayName = 'VehicleGridCard';


export default function SirketAraclariPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [actionLoading, setActionLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<CompanyVehicle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info'
    });
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

    const showSnackbar = useCallback(
        (message: string, severity: 'success' | 'error' | 'info') => {
            setSnackbar({ open: true, message, severity });
        },
        [],
    );

    const [formData, setFormData] = useState<Partial<CompanyVehicle>>({
        plate: '',
        brand: '',
        model: '',
        isActive: true,
    });

    const {
        data: personeller = [],
    } = useQuery<Personel[]>({
        queryKey: ['personeller-list'],
        queryFn: async () => {
            const response = await axios.get('/employees?limit=1000');
            return response.data?.data || [];
        },
    });

    const {
        data: vehicles = [],
        isLoading: isVehiclesLoading,
    } = useQuery<CompanyVehicle[]>({
        queryKey: ['company-vehicles'],
        queryFn: async () => {
            const response = await axios.get('/company-vehicles');
            return response.data;
        },
    });

    const { data: tenantSettings } = useQuery({
        queryKey: ['tenant-settings'],
        queryFn: async () => {
            const response = await axios.get('/tenants/settings');
            return response.data;
        },
    });

    const handleOpenDialog = useCallback((vehicle?: CompanyVehicle) => {
        if (vehicle) {
            setEditMode(true);
            setSelectedVehicle(vehicle);
            setFormData({
                ...vehicle,
                registrationDate: vehicle.registrationDate ? new Date(vehicle.registrationDate).toISOString().split('T')[0] : '',
                lastInspectionDate: vehicle.lastInspectionDate ? new Date(vehicle.lastInspectionDate).toISOString().split('T')[0] : '',
                insuranceDate: vehicle.insuranceDate ? new Date(vehicle.insuranceDate).toISOString().split('T')[0] : '',
            });
        } else {
            setEditMode(false);
            setSelectedVehicle(null);
            setFormData({
                plate: '',
                brand: '',
                model: '',
                isActive: true,
            });
        }
        setOpenDialog(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setOpenDialog(false);
        setEditMode(false);
        setSelectedVehicle(null);
    }, []);

    const handleFormChange = useCallback((field: string, value: string | number | boolean | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = async () => {
        try {
            if (!formData.plate || !formData.brand || !formData.model) {
                showSnackbar('Lütfen tüm zorunlu alanları (Plaka, Marka, Model) doldurun', 'error');
                return;
            }

            setActionLoading(true);

            const submitData = {
                ...formData,
                registrationDate: formData.registrationDate ? new Date(formData.registrationDate).toISOString() : undefined,
                lastInspectionDate: formData.lastInspectionDate ? new Date(formData.lastInspectionDate).toISOString() : undefined,
                insuranceDate: formData.insuranceDate ? new Date(formData.insuranceDate).toISOString() : undefined,
            };

            if (editMode && selectedVehicle) {
                await axios.patch(`/company-vehicles/${selectedVehicle.id}`, submitData);
                showSnackbar('Araç kaydı güncellendi', 'success');
            } else {
                await axios.post('/company-vehicles', submitData);
                showSnackbar('Araç kaydı oluşturuldu', 'success');
            }

            handleCloseDialog();
            queryClient.invalidateQueries({ queryKey: ['company-vehicles'] });
        } catch (error: any) {
            showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedVehicle) return;

        try {
            setActionLoading(true);
            await axios.delete(`/company-vehicles/${selectedVehicle.id}`);
            showSnackbar('Araç kaydı silindi', 'success');
            setOpenDelete(false);
            setSelectedVehicle(null);
            queryClient.invalidateQueries({ queryKey: ['company-vehicles'] });
        } catch (error: any) {
            showSnackbar(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const stats = useMemo(() => {
        const active = vehicles.filter(v => v.isActive !== false).length;
        const passive = vehicles.length - active;
        const totalExpense = vehicles.reduce((sum, v) =>
            sum + (v.expenses?.reduce((s: number, e: any) => s + Number(e.tutar), 0) || 0), 0
        );
        const topExpensive = [...vehicles].sort((a, b) => {
            const expA = a.expenses?.reduce((s: number, e: any) => s + Number(e.tutar), 0) || 0;
            const expB = b.expenses?.reduce((s: number, e: any) => s + Number(e.tutar), 0) || 0;
            return expB - expA;
        })[0];

        return { active, passive, totalExpense, topExpensive };
    }, [vehicles]);

    const dashboardData = useMemo(() => {
        const categories: Record<string, number> = {};
        const vehicleTotals: Record<string, number> = {};

        const expenseTypeLabels: Record<string, string> = {
            YAKIT: 'Yakıt',
            BAKIM: 'Bakım',
            MUAYENE: 'Muayene',
            TRAFIK_SIGORTASI: 'Trafik Sigortası',
            KASKO: 'Kasko',
            CEZA: 'Ceza',
            OGS_HGS: 'OGS/HGS',
            OTOPARK: 'Otopark',
            YIKAMA: 'Yıkama',
            DIGER: 'Diğer'
        };

        vehicles.forEach((v: CompanyVehicle) => {
            let vehicleTotal = 0;
            v.expenses?.forEach((e: any) => {
                const amount = Number(e.tutar) || 0;
                vehicleTotal += amount;
                const cat = e.masrafTipi || 'DIGER';
                categories[cat] = (categories[cat] || 0) + amount;
            });
            vehicleTotals[v.plate] = vehicleTotal;
        });

        const categoryChartData = Object.entries(categories).map(([name, value]) => ({
            name: expenseTypeLabels[name] || name,
            value
        })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

        const vehicleChartData = Object.entries(vehicleTotals).map(([name, value]) => ({
            name,
            value
        })).filter(v => v.value > 0).sort((a, b) => b.value - a.value).slice(0, 5);

        return { categoryChartData, vehicleChartData };
    }, [vehicles]);

    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#14b8a6', '#f43f5e', '#f97316', '#0ea5e9'];

    const filteredVehicles = useMemo(() => {
        if (!searchTerm) return vehicles;
        const lowerSearch = searchTerm.toLowerCase();
        return vehicles.filter(v =>
            v.plate.toLowerCase().includes(lowerSearch) ||
            v.brand.toLowerCase().includes(lowerSearch) ||
            v.model.toLowerCase().includes(lowerSearch) ||
            (v.personel && `${v.personel.ad} ${v.personel.soyad}`.toLowerCase().includes(lowerSearch))
        );
    }, [vehicles, searchTerm]);

    const columns = useMemo<GridColDef[]>(() => [
        {
            field: 'plate',
            headerName: 'Plaka',
            width: 140,
            renderCell: (params: any) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Box sx={{
                        bgcolor: '#fff',
                        border: '1px solid #1e293b',
                        borderRadius: '4px',
                        px: 1,
                        py: 0.25,
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            bgcolor: '#3b82f6',
                            borderRadius: '4px 0 0 4px'
                        }
                    }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.75rem', ml: 0.5 }}>
                            {params.value}
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        {
            field: 'brand',
            headerName: 'Marka / Model',
            flex: 1.5,
            minWidth: 180,
            renderCell: (params: any) => (
                <Box sx={{ py: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--foreground)' }}>
                        {params.row.brand} {params.row.model}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block' }}>
                        {params.row.vehicleType} • {params.row.fuelType}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'assignedEmployeeId',
            headerName: 'Zimmetli Personel',
            width: 200,
            renderCell: (params: any) => {
                const p = params.row.personel;
                if (!p) return (
                    <Chip
                        label="Boşta"
                        size="small"
                        sx={{ bgcolor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }}
                    />
                );
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'var(--primary)' }}>
                            {p.ad?.[0]}{p.soyad?.[0]}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.ad} {p.soyad}</Typography>
                    </Box>
                );
            },
        },
        {
            field: 'lastInspectionDate',
            headerName: 'Muayene / Sigorta',
            width: 180,
            renderCell: (params: any) => (
                <Box>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: isDateNear(params.value) ? '#ef4444' : 'inherit' }}>
                        M: {formatDate(params.value)}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: isDateNear(params.row.insuranceDate) ? '#ef4444' : 'inherit' }}>
                        S: {formatDate(params.row.insuranceDate)}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'isActive',
            headerName: 'Durum',
            width: 100,
            renderCell: (params: any) => {
                const isActive = params.value !== false;
                return (
                    <Box sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: '6px',
                        bgcolor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5
                    }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isActive ? '#10b981' : '#ef4444' }} />
                        <Typography variant="body2" sx={{ color: isActive ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.75rem' }}>
                            {isActive ? 'Aktif' : 'Pasif'}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            sortable: false,
            filterable: false,
            width: 140,
            renderCell: (params: any) => {
                const row = params.row as CompanyVehicle;
                return (
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
                        <Tooltip title="Detay / Masraflar" arrow>
                            <IconButton
                                size="small"
                                onClick={() => router.push(`/company-vehicles/${row.id}`)}
                                sx={{
                                    color: 'var(--primary)',
                                    bgcolor: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                                    '&:hover': { bgcolor: 'color-mix(in srgb, var(--primary) 15%, transparent)' }
                                }}
                            >
                                <Visibility sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle" arrow>
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
                        </Tooltip>
                        <Tooltip title="Sil" arrow>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setSelectedVehicle(row);
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
                        </Tooltip>
                    </Box>
                );
            },
        },
    ], [handleOpenDialog, router]);

    const handleExport = useCallback((type: 'excel' | 'pdf') => {
        if (type === 'excel') {
            const exportData = vehicles.map((v: CompanyVehicle) => ({
                'Plaka': v.plate,
                'Marka': v.brand,
                'Model': v.model,
                'Yıl': v.year || '-',
                'Ruhsat Seri No': v.registrationSerialNo || '-',
                'Muayene Tarihi': formatDate(v.lastInspectionDate),
                'Sigorta Tarihi': formatDate(v.insuranceDate),
                'Araç Tipi': v.vehicleType || '-',
                'Yakıt Tipi': v.fuelType || '-',
                'Zimmetli Personel': v.personel ? `${v.personel.ad} ${v.personel.soyad}` : 'Boşta',
                'Durum': v.isActive !== false ? 'Aktif' : 'Pasif',
                'Toplam Masraf': v.expenses?.reduce((sum: number, exp: any) => sum + Number(exp.tutar), 0) || 0
            }));
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Şirket Araçları');
            XLSX.writeFile(wb, `sirket_araclari_raporu_${new Date().toISOString().split('T')[0]}.xlsx`);
        } else {
            const doc = new jsPDF();
            registerFonts(doc);
            const companyName = tenantSettings?.companyName || 'OTOMUHASEBE';
            drawHeader(doc, 'ŞİRKET ARAÇLARI RAPORU', 'Araç Listesi ve Masraf Özetleri', companyName);

            const headers = ['Plaka', 'Marka / Model', 'Zimmetli Personel', 'Durum', 'Toplam Masraf'];
            const rows = vehicles.map((v: CompanyVehicle) => [
                v.plate,
                `${v.brand} ${v.model}`,
                v.personel ? `${v.personel.ad} ${v.personel.soyad}` : 'Boşta',
                v.isActive !== false ? 'Aktif' : 'Pasif',
                formatCurrency(v.expenses?.reduce((sum: number, exp: any) => sum + Number(exp.tutar), 0) || 0)
            ]);
            const colWidths = [30, 60, 45, 20, 35];
            drawTable(doc, 60, headers, rows, colWidths);
            doc.save(`sirket_araclari_raporu_${new Date().toISOString().split('T')[0]}.pdf`);
        }
    }, [vehicles, tenantSettings]);

    return (
        <MainLayout>
            <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--background)', minHeight: '100vh' }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                    mb: 4
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)',
                            color: '#fff'
                        }}>
                            <DirectionsCar sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                Şirket Araçları
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                                Araç envanteri, zimmet takibi ve operasyonel masraf yönetimi
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownload />}
                            onClick={() => handleExport('excel')}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: 'var(--border)',
                                color: 'var(--foreground)',
                                px: 2,
                                display: { xs: 'none', lg: 'inline-flex' }
                            }}
                        >
                            Excel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: '#fff',
                                px: 3,
                                py: 1.2,
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                                '&:hover': {
                                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
                                    transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Yeni Araç Kaydı
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="TOPLAM ARAÇ"
                            value={vehicles.length}
                            subValue={`${stats.active} Aktif • ${stats.passive} Pasif`}
                            icon={DirectionsCar}
                            color="#3b82f6"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="TOPLAM MASRAF"
                            value={formatCurrency(stats.totalExpense)}
                            subValue="Tüm araçlar için toplam"
                            icon={LocalGasStation}
                            color="#ef4444"
                            trend="up"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="AKTİF KULLANIM"
                            value={`%${vehicles.length > 0 ? ((stats.active / vehicles.length) * 100).toFixed(0) : 0}`}
                            subValue="Operasyonel araç oranı"
                            icon={CheckCircle}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="EN ÇOK MASRAF"
                            value={stats.topExpensive?.plate || '-'}
                            subValue={stats.topExpensive ? `${formatCurrency(stats.topExpensive.expenses?.reduce((s: number, e: any) => s + Number(e.tutar), 0) || 0)}` : 'Kayıt yok'}
                            icon={Analytics}
                            color="#f59e0b"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Card sx={{
                            bgcolor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '20px',
                            boxShadow: 'var(--shadow-sm)',
                            height: '100%'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: 'var(--foreground)' }}>
                                    Masraf Dağılımı
                                </Typography>
                                <Box sx={{ height: 300, width: '100%', minWidth: 0, minHeight: 0 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={dashboardData.categoryChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {dashboardData.categoryChartData.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                                }}
                                                formatter={(value: number) => formatCurrency(value)}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Card sx={{
                            bgcolor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '20px',
                            boxShadow: 'var(--shadow-sm)',
                            height: '100%'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: 'var(--foreground)' }}>
                                    En Çok Masraf Yapan Araçlar
                                </Typography>
                                <Box sx={{ height: 300, width: '100%', minWidth: 0, minHeight: 0 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={dashboardData.vehicleChartData} layout="vertical" margin={{ left: 30 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="var(--border)" opacity={0.5} />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                width={80}
                                                style={{ fontSize: '0.75rem', fontWeight: 600, fill: 'var(--foreground)' }}
                                            />
                                            <RechartsTooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                                }}
                                                formatter={(value: number) => formatCurrency(value)}
                                            />
                                            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                                {dashboardData.vehicleChartData.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.8} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Card sx={{
                    bgcolor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        p: 2.5,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: 2,
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: 'var(--foreground)' }}>
                            Araç Envanteri
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                placeholder="Plaka, marka, model veya personel ara..."
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{
                                    minWidth: { md: 350 },
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        bgcolor: 'color-mix(in srgb, var(--muted) 10%, transparent)',
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ color: 'var(--muted-foreground)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Tooltip title="Filtrele">
                                <IconButton sx={{ border: '1px solid var(--border)', borderRadius: '10px' }}>
                                    <FilterList />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'color-mix(in srgb, var(--muted) 10%, transparent)', p: 0.5, borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <IconButton
                                onClick={() => setViewMode('grid')}
                                sx={{
                                    borderRadius: '10px',
                                    bgcolor: viewMode === 'grid' ? 'var(--card)' : 'transparent',
                                    color: viewMode === 'grid' ? 'var(--primary)' : 'var(--muted-foreground)',
                                    boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                                    '&:hover': { bgcolor: viewMode === 'grid' ? 'var(--card)' : 'rgba(255,255,255,0.05)' }
                                }}
                            >
                                <GridView fontSize="small" />
                            </IconButton>
                            <IconButton
                                onClick={() => setViewMode('table')}
                                sx={{
                                    borderRadius: '10px',
                                    bgcolor: viewMode === 'table' ? 'var(--card)' : 'transparent',
                                    color: viewMode === 'table' ? 'var(--primary)' : 'var(--muted-foreground)',
                                    boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
                                    '&:hover': { bgcolor: viewMode === 'table' ? 'var(--card)' : 'rgba(255,255,255,0.05)' }
                                }}
                            >
                                <ViewList fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    {viewMode === 'table' ? (
                        <Card sx={{ bgcolor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                            <DataGrid
                                rows={filteredVehicles}
                                columns={columns}
                                loading={isVehiclesLoading}
                                autoHeight
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10 } },
                                }}
                                pageSizeOptions={[10, 25, 50]}
                                disableRowSelectionOnClick
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-cell': {
                                        borderBottom: '1px solid var(--border)',
                                        color: 'var(--foreground)',
                                        py: 1.5,
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        bgcolor: 'color-mix(in srgb, var(--muted) 30%, transparent)',
                                        borderBottom: '1px solid var(--border)',
                                        color: 'var(--foreground)',
                                        fontWeight: 700,
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        borderTop: '1px solid var(--border)',
                                        bgcolor: 'var(--card)',
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        bgcolor: 'color-mix(in srgb, var(--primary) 4%, transparent)',
                                    }
                                }}
                                slots={{
                                    noRowsOverlay: DataGridNoRowsOverlay,
                                }}
                            />
                        </Card>
                    ) : (
                        <Grid container spacing={3} sx={{ p: 2.5 }}>
                            {isVehiclesLoading ? (
                                Array.from(new Array(6)).map((_, index) => (
                                    <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
                                        <Box sx={{ height: 280, borderRadius: '20px', bgcolor: 'var(--card)', border: '1px solid var(--border)', opacity: 0.5, animation: 'pulse 2s infinite ease-in-out' }} />
                                    </Grid>
                                ))
                            ) : filteredVehicles.length === 0 ? (
                                <Grid size={12}>
                                    <DataGridNoRowsOverlay />
                                </Grid>
                            ) : (
                                filteredVehicles.map((vehicle: CompanyVehicle) => (
                                    <Grid key={vehicle.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                                        <VehicleGridCard
                                            vehicle={vehicle}
                                            onEdit={() => handleOpenDialog(vehicle)}
                                            onDelete={() => {
                                                setSelectedVehicle(vehicle);
                                                setOpenDelete(true);
                                            }}
                                            onView={() => router.push(`/company-vehicles/${vehicle.id}`)}
                                        />
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    )}
                </Card>

                <VehicleFormDialog
                    open={openDialog}
                    editMode={editMode}
                    formData={formData}
                    loading={actionLoading}
                    personeller={personeller}
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
                        <Box sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                        }}>
                            <Delete sx={{ fontSize: 32 }} />
                        </Box>
                        Araç Kaydını Sil
                    </DialogTitle>
                    <DialogContent>
                        <Typography sx={{ textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            <b style={{ color: 'var(--foreground)' }}>{selectedVehicle?.plate}</b> plakalı araca ait kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setOpenDelete(false)}
                            sx={{ borderRadius: '10px', textTransform: 'none', px: 4, borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        >
                            İptal
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDelete}
                            disabled={actionLoading}
                            sx={{ borderRadius: '10px', textTransform: 'none', px: 4, bgcolor: '#ef4444', color: '#fff' }}
                        >
                            Sil
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </MainLayout>
    );
}
