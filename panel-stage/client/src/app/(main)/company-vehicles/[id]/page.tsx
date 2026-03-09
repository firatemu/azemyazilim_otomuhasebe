'use client';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import {
    Add,
    ArrowBack,
    AttachMoney,
    Delete,
    Edit,
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
    TableContainer,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Description as FileText } from '@mui/icons-material';
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
    plaka: string;
    marka: string;
    model: string;
    yil?: number;
    saseno?: string;
    motorNo?: string;
    tescilTarihi?: string;
    aracTipi?: string;
    yakitTipi?: string;
    durum: boolean;
    zimmetliPersonelId?: string;
    ruhsatGorselUrl?: string;
    notlar?: string;
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
    'YAKIT',
    'BAKIM',
    'MUAYENE',
    'TRAFIK_SIGORTASI',
    'KASKO',
    'CEZA',
    'OGS_HGS',
    'OTOPARK',
    'YIKAMA',
    'DIGER'
];

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
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted-foreground)',
        }}
    >
        Masraf bulunamadı
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
    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'var(--card)',
                    backgroundImage: 'none',
                },
            }}
        >
            <DialogTitle component="div" sx={{
                bgcolor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                borderBottom: '1px solid var(--border)',
            }}>
                {editMode ? 'Masraf Düzenle' : 'Yeni Araç Masrafı'}
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'var(--background)' }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth required className="form-control-select">
                            <InputLabel>Masraf Tipi</InputLabel>
                            <Select
                                value={formData.masrafTipi || ''}
                                onChange={(e) => onFormChange('masrafTipi', e.target.value)}
                                label="Masraf Tipi"
                            >
                                {EXPENSE_TYPES.map((type: string) => (
                                    <MenuItem key={type} value={type}>
                                        {type.replace('_', ' ')}
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
                            className="form-control-textfield"
                            label="Tutar"
                            value={formData.tutar || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('tutar', e.target.value)}
                            inputProps={{ min: 0.01, step: 0.01 }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            type="date"
                            className="form-control-textfield"
                            label="Tarih"
                            value={formData.tarih || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('tarih', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            type="number"
                            className="form-control-textfield"
                            label="Kilometre"
                            value={formData.kilometre || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('kilometre', e.target.value ? parseInt(e.target.value, 10) : '')}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            className="form-control-textfield"
                            label="Belge No"
                            value={formData.belgeNo || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('belgeNo', e.target.value)}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="Açıklama"
                            className="form-control-textfield"
                            value={formData.aciklama || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('aciklama', e.target.value)}
                            multiline
                            rows={3}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ bgcolor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
                <Button
                    onClick={onClose}
                    sx={{
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                        '&:hover': {
                            borderColor: 'var(--primary)',
                            bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                        },
                    }}
                >
                    İptal
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={loading}
                    sx={{
                        bgcolor: 'var(--destructive)',
                        color: 'var(--destructive-foreground)',
                        '&:hover': {
                            bgcolor: 'color-mix(in srgb, var(--destructive) 90%, #000 10%)',
                        },
                    }}
                >
                    {editMode ? 'Güncelle' : 'Kaydet'}
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
                'Masraf Tipi': exp.masrafTipi.replace('_', ' '),
                'Tutar': formatCurrency(exp.tutar),
                'Kilometre': exp.kilometre ? `${exp.kilometre.toLocaleString('tr-TR')} km` : '-',
                'Belge No': exp.belgeNo || '-',
                'Açıklama': exp.aciklama || '-'
            }));
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Araç Masrafları');
            XLSX.writeFile(wb, `${vehicle.plaka}_masraf_raporu_${new Date().toISOString().split('T')[0]}.xlsx`);
        } else {
            const doc = new jsPDF();
            registerFonts(doc);

            const companyName = tenantSettings?.companyType === 'COMPANY'
                ? tenantSettings?.companyName
                : (tenantSettings?.firstName ? `${tenantSettings.firstName} ${tenantSettings.lastName}` : 'OTOMUHASEBE');

            drawHeader(doc, 'ARAÇ MASRAF RAPORU', `${vehicle.plaka} - ${vehicle.marka} ${vehicle.model}`, companyName);

            // Vehicle Info Section
            doc.setFontSize(14);
            doc.setFont('Roboto', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Araç Bilgileri', 20, 60);

            doc.setFontSize(10);
            doc.setFont('Roboto', 'normal');
            doc.text(`Plaka: ${vehicle.plaka}`, 20, 68);
            doc.text(`Marka / Model: ${vehicle.marka} ${vehicle.model} ${vehicle.yil ? `(${vehicle.yil})` : ''}`, 20, 75);
            doc.text(`Zimmetli Personel: ${vehicle.personel ? `${vehicle.personel.ad} ${vehicle.personel.soyad}` : '-'}`, 20, 82);

            doc.text(`Toplam Masraf: ${formatCurrency(totalExpense)}`, 120, 68);
            doc.text(`Toplam Masraf Sayısı: ${expenses.length}`, 120, 75);

            // Table
            const headers = ['Tarih', 'Masraf Tipi', 'KM', 'Belge No', 'Tutar'];
            const rows = expenses.map((exp: VehicleExpense) => [
                formatDate(exp.tarih),
                exp.masrafTipi.replace('_', ' '),
                exp.kilometre ? exp.kilometre.toLocaleString('tr-TR') : '-',
                exp.belgeNo || '-',
                formatCurrency(exp.tutar)
            ]);
            const colWidths = [30, 45, 30, 40, 45]; // Total 190

            drawTable(doc, 95, headers, rows, colWidths);

            doc.save(`${vehicle.plaka}_masraf_raporu_${new Date().toISOString().split('T')[0]}.pdf`);
        }
    }, [vehicle, expenses, totalExpense, tenantSettings]);


    const columns = useMemo<GridColDef[]>(() => [
        {
            field: 'tarih',
            headerName: 'Tarih',
            width: 130,
            renderCell: (params: any) => (
                <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                    {formatDate(params.row.tarih)}
                </Typography>
            ),
        },
        {
            field: 'masrafTipi',
            headerName: 'Masraf Tipi',
            width: 150,
            renderCell: (params: any) => (
                <Chip
                    label={params.row.masrafTipi.replace('_', ' ')}
                    size="small"
                    sx={{
                        bgcolor: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)',
                        color: 'var(--foreground)',
                        borderColor: 'var(--border)',
                    }}
                    variant="outlined"
                />
            ),
        },
        {
            field: 'tutar',
            headerName: 'Tutar',
            width: 140,
            renderCell: (params: any) => (
                <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--destructive)' }}>
                    {formatCurrency(params.row.tutar)}
                </Typography>
            ),
        },
        {
            field: 'kilometre',
            headerName: 'KM',
            width: 120,
            renderCell: (params: any) => (
                <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                    {params.row.kilometre ? `${params.row.kilometre.toLocaleString('tr-TR')} km` : '-'}
                </Typography>
            ),
        },
        {
            field: 'aciklama',
            headerName: 'Açıklama',
            flex: 1,
            minWidth: 200,
            renderCell: (params: any) => (
                <Typography variant="body2" sx={{ color: 'var(--foreground)' }} noWrap>
                    {params.row.aciklama || '-'}
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Düzenle">
                            <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(row)}
                                sx={{
                                    color: 'var(--chart-3)',
                                    '&:hover': {
                                        bgcolor: 'color-mix(in srgb, var(--chart-3) 10%, transparent)',
                                    },
                                }}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setSelectedExpense(row);
                                    setOpenDelete(true);
                                }}
                                sx={{
                                    color: 'var(--destructive)',
                                    '&:hover': {
                                        bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                                    },
                                }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        },
    ], [handleOpenDialog]);

    if (isVehicleLoading) {
        return <MainLayout><Box p={3}>Yükleniyor...</Box></MainLayout>;
    }

    if (!vehicle) {
        return <MainLayout><Box p={3}>Araç bulunamadı.</Box></MainLayout>;
    }

    return (
        <MainLayout>
            <Box sx={{ p: 3, bgcolor: 'var(--background)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <IconButton
                        onClick={() => router.push('/sirket-araclari')}
                        sx={{ color: 'var(--foreground)' }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                            {vehicle.plaka}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'var(--muted-foreground)' }}>
                            {vehicle.marka} {vehicle.model} {vehicle.yil ? `(${vehicle.yil})` : ''}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {/* Araç Bilgileri */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ bgcolor: 'var(--card)', border: '1px solid var(--border)', height: '100%', boxShadow: 'var(--shadow-sm)' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Typography variant="subtitle1" sx={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '0.9rem' }}>
                                        Araç Bilgileri
                                    </Typography>
                                    <Chip
                                        label={vehicle.durum ? 'AKTİF' : 'PASİF'}
                                        size="small"
                                        sx={{
                                            bgcolor: vehicle.durum ? 'color-mix(in srgb, var(--success) 10%, transparent)' : 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)',
                                            color: vehicle.durum ? 'var(--success)' : 'var(--muted-foreground)',
                                            borderColor: vehicle.durum ? 'var(--success)' : 'var(--border)',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            height: '20px'
                                        }}
                                        variant="outlined"
                                    />
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block', mb: 0.2 }}>Marka / Model</Typography>
                                            <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>{vehicle.marka} {vehicle.model} {vehicle.yil ? `(${vehicle.yil})` : ''}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block', mb: 0.2 }}>Araç Tipi</Typography>
                                            <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>{vehicle.aracTipi || '-'}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block', mb: 0.2 }}>Şase No</Typography>
                                            <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>{vehicle.saseno || '-'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block', mb: 0.2 }}>Motor No</Typography>
                                            <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>{vehicle.motorNo || '-'}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block', mb: 0.2 }}>Yakıt / Personel</Typography>
                                            <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                                {vehicle.yakitTipi || '-'} / {vehicle.personel ? `${vehicle.personel.ad} ${vehicle.personel.soyad}` : '-'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block', mb: 0.2 }}>Tescil Tarihi</Typography>
                                            <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>{formatDate(vehicle.tescilTarihi)}</Typography>
                                        </Box>
                                    </Grid>
                                    {vehicle.notlar && (
                                        <Grid size={12}>
                                            <Box sx={{ mt: 0.5, p: 1, bgcolor: 'color-mix(in srgb, var(--muted) 30%, transparent)', borderRadius: 1 }}>
                                                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block', mb: 0.2 }}>Araç Notları</Typography>
                                                <Typography variant="body2" sx={{ color: 'var(--foreground)', fontStyle: 'italic', fontSize: '0.8rem' }}>{vehicle.notlar}</Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Toplam Masraf Özeti */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ bgcolor: 'color-mix(in srgb, var(--destructive) 5%, var(--card))', border: '1px solid var(--destructive)', height: '100%', boxShadow: 'var(--shadow-sm)' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                <Typography variant="subtitle2" sx={{ color: 'var(--destructive)', fontWeight: 700, mb: 0.5 }}>
                                    Toplam Masraf
                                </Typography>
                                <Typography variant="h4" sx={{ color: 'var(--destructive)', fontWeight: 800 }}>
                                    {formatCurrency(totalExpense)}
                                </Typography>
                                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid color-mix(in srgb, var(--destructive) 20%, transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                                        Harcanan Tutar
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 600 }}>
                                        {expenses.length} Adet Masraf
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Araç Masrafları
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => handleExport('excel')}
                            sx={{
                                borderColor: 'var(--border)',
                                color: 'var(--foreground)',
                                '&:hover': {
                                    borderColor: 'var(--primary)',
                                    bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                                },
                            }}
                        >
                            Excel
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FileText />}
                            onClick={() => handleExport('pdf')}
                            sx={{
                                borderColor: 'var(--border)',
                                color: 'var(--foreground)',
                                '&:hover': {
                                    borderColor: 'var(--primary)',
                                    bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                                },
                            }}
                        >
                            PDF
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                bgcolor: 'var(--destructive)',
                                color: 'var(--destructive-foreground)',
                                '&:hover': {
                                    bgcolor: 'color-mix(in srgb, var(--destructive) 90%, #000 10%)',
                                },
                            }}
                        >
                            Masraf Ekle
                        </Button>
                    </Box>
                </Box>

                <Card sx={{ bgcolor: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <TableContainer>
                        <DataGrid
                            rows={expenses}
                            columns={columns}
                            loading={isExpensesLoading || actionLoading}
                            disableRowSelectionOnClick
                            autoHeight
                            slots={{
                                noRowsOverlay: DataGridNoRowsOverlay,
                            }}
                            rowHeight={60}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                                sorting: { sortModel: [{ field: 'tarih', sort: 'desc' }] },
                            }}
                            pageSizeOptions={[10, 25, 50]}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderColor: 'var(--border)',
                                    color: 'var(--foreground)',
                                    display: 'flex',
                                    alignItems: 'center',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: 'color-mix(in srgb, var(--muted) 50%, transparent)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--muted-foreground)',
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderColor: 'var(--border)',
                                    color: 'var(--foreground)',
                                },
                                '& .MuiTablePagination-root': {
                                    color: 'var(--foreground)',
                                },
                            }}
                        />
                    </TableContainer>
                </Card>

                {/* Delete Expense Dialog */}
                <Dialog
                    open={openDelete}
                    onClose={() => setOpenDelete(false)}
                    PaperProps={{
                        sx: {
                            bgcolor: 'var(--card)',
                            backgroundImage: 'none',
                            minWidth: '350px',
                        },
                    }}
                >
                    <DialogTitle sx={{ color: 'var(--foreground)' }}>Silme İşlemi</DialogTitle>
                    <DialogContent>
                        <Alert severity="warning" sx={{ mb: 2, bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)', color: 'var(--destructive)' }}>
                            Bu masrafı silmek istediğinize emin misiniz? Tutarı genel toplamdan düşülecektir.
                        </Alert>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 0 }}>
                        <Button
                            onClick={() => setOpenDelete(false)}
                            disabled={actionLoading}
                            sx={{ color: 'var(--foreground)' }}
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="contained"
                            disabled={actionLoading}
                            sx={{
                                bgcolor: 'var(--destructive)',
                                '&:hover': { bgcolor: 'color-mix(in srgb, var(--destructive) 80%, black)' },
                            }}
                        >
                            Sil
                        </Button>
                    </DialogActions>
                </Dialog>

                <ExpenseFormDialog
                    open={openDialog}
                    editMode={editMode}
                    formData={formData}
                    loading={actionLoading}
                    onClose={handleCloseDialog}
                    onSubmit={handleSubmit}
                    onFormChange={handleFormChange}
                />

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </MainLayout>
    );
}
