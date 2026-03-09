'use client';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import {
    Add,
    DirectionsCar,
    Delete,
    Edit,
    Visibility,
    Refresh,
    Download,
    Description as FileText,
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
    Label,
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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
        Kayıt bulunamadı
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
                bgcolor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderBottom: '1px solid var(--border)',
            }}>
                {editMode ? 'Araç Düzenle' : 'Yeni Şirket Aracı'}
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'var(--background)' }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            required
                            className="form-control-textfield"
                            label="Plaka"
                            value={formData.plaka || ''}
                            onChange={(e) => onFormChange('plaka', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            required
                            className="form-control-textfield"
                            label="Marka"
                            value={formData.marka || ''}
                            onChange={(e) => onFormChange('marka', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            required
                            className="form-control-textfield"
                            label="Model"
                            value={formData.model || ''}
                            onChange={(e) => onFormChange('model', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            type="number"
                            className="form-control-textfield"
                            label="Yıl"
                            value={formData.yil || ''}
                            onChange={(e) => onFormChange('yil', e.target.value ? parseInt(e.target.value, 10) : '')}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            className="form-control-textfield"
                            label="Şase No"
                            value={formData.saseno || ''}
                            onChange={(e) => onFormChange('saseno', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            className="form-control-textfield"
                            label="Motor No"
                            value={formData.motorNo || ''}
                            onChange={(e) => onFormChange('motorNo', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            type="date"
                            className="form-control-textfield"
                            label="Tescil Tarihi"
                            value={formData.tescilTarihi || ''}
                            onChange={(e) => onFormChange('tescilTarihi', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            className="form-control-textfield"
                            label="Araç Tipi"
                            value={formData.aracTipi || ''}
                            onChange={(e) => onFormChange('aracTipi', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            className="form-control-textfield"
                            label="Yakıt Tipi"
                            value={formData.yakitTipi || ''}
                            onChange={(e) => onFormChange('yakitTipi', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth className="form-control-select">
                            <InputLabel>Zimmetli Personel</InputLabel>
                            <Select
                                value={formData.zimmetliPersonelId || ''}
                                onChange={(e) => onFormChange('zimmetliPersonelId', e.target.value)}
                                label="Zimmetli Personel"
                            >
                                <MenuItem value="">
                                    <em>Seçiniz</em>
                                </MenuItem>
                                {personeller?.map((p: Personel) => (
                                    <MenuItem key={p.id} value={p.id}>
                                        {p.ad} {p.soyad}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.durum !== false}
                                    onChange={(e) => onFormChange('durum', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={formData.durum !== false ? 'Aktif' : 'Pasif'}
                            sx={{ color: 'var(--foreground)', ml: 1, mt: 1 }}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="Notlar"
                            className="form-control-textfield"
                            value={formData.notlar || ''}
                            onChange={(e) => onFormChange('notlar', e.target.value)}
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
                        bgcolor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        '&:hover': {
                            bgcolor: 'color-mix(in srgb, var(--primary) 90%, #000 10%)',
                        },
                    }}
                >
                    {editMode ? 'Güncelle' : 'Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

VehicleFormDialog.displayName = 'VehicleFormDialog';

export default function SirketAraclariPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [actionLoading, setActionLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<CompanyVehicle | null>(null);
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

    const [formData, setFormData] = useState<Partial<CompanyVehicle>>({
        plaka: '',
        marka: '',
        model: '',
        durum: true,
    });

    const {
        data: personeller = [],
    } = useQuery<Personel[]>({
        queryKey: ['personeller-list'],
        queryFn: async () => {
            const response = await axios.get('/employee?limit=1000');
            return response.data?.data || [];
        },
    });

    const {
        data: vehicles = [],
        isLoading: isVehiclesLoading,
        error: vehiclesError,
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

    useEffect(() => {
        if (vehiclesError) {
            const message =
                (vehiclesError as any)?.response?.data?.message || 'Kayıtlar yüklenirken hata oluştu';
            showSnackbar(message, 'error');
        }
    }, [vehiclesError, showSnackbar]);

    const handleOpenDialog = useCallback((vehicle?: CompanyVehicle) => {
        if (vehicle) {
            setEditMode(true);
            setSelectedVehicle(vehicle);
            setFormData({
                ...vehicle,
                tescilTarihi: vehicle.tescilTarihi ? new Date(vehicle.tescilTarihi).toISOString().split('T')[0] : '',
            });
        } else {
            setEditMode(false);
            setSelectedVehicle(null);
            setFormData({
                plaka: '',
                marka: '',
                model: '',
                durum: true,
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
            if (!formData.plaka || !formData.marka || !formData.model) {
                showSnackbar('Lütfen tüm zorunlu alanları (Plaka, Marka, Model) doldurun', 'error');
                return;
            }

            setActionLoading(true);

            const submitData = {
                ...formData,
                tescilTarihi: formData.tescilTarihi ? new Date(formData.tescilTarihi).toISOString() : undefined,
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



    const columns = useMemo<GridColDef[]>(() => [
        {
            field: 'plaka',
            headerName: 'Plaka',
            flex: 1,
            minWidth: 120,
            renderCell: (params: any) => {
                const row = params.row as CompanyVehicle;
                return (
                    <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--foreground)' }}>
                        {row?.plaka}
                    </Typography>
                );
            },
        },
        {
            field: 'markaModel',
            headerName: 'Marka / Model',
            flex: 1.5,
            minWidth: 180,
            renderCell: (params: any) => {
                const row = params.row as CompanyVehicle;
                return (
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        {row?.marka} {row?.model} {row?.yil ? `(${row.yil})` : ''}
                    </Typography>
                );
            },
        },
        {
            field: 'toplamMasraf',
            headerName: 'Toplam Masraf',
            flex: 1,
            minWidth: 140,
            renderCell: (params: any) => {
                const row = params.row as CompanyVehicle;
                const total = row.expenses?.reduce((sum: number, exp: { tutar: string | number }) => sum + Number(exp.tutar), 0) || 0;
                return (
                    <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                            color: total > 0 ? 'var(--primary)' : 'var(--muted-foreground)',
                        }}
                    >
                        {new Intl.NumberFormat('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                        }).format(total)}
                    </Typography>
                );
            },
        },
        {
            field: 'zimmetliPersonel',
            headerName: 'Zimmetli Personel',
            flex: 1,
            minWidth: 160,
            renderCell: (params: any) => {
                const row = params.row as CompanyVehicle;
                if (!row?.personel) return <Typography variant="body2" color="textSecondary">Atanmamış</Typography>;
                return (
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        {row.personel.ad} {row.personel.soyad}
                    </Typography>
                );
            },
        },
        {
            field: 'durum',
            headerName: 'Durum',
            minWidth: 120,
            renderCell: (params: any) => {
                const row = params.row as CompanyVehicle;
                const isActive = row?.durum !== false;
                return (
                    <Chip
                        label={isActive ? 'Aktif' : 'Pasif'}
                        size="small"
                        sx={{
                            bgcolor: isActive ? 'color-mix(in srgb, #10b981 15%, transparent)' : 'color-mix(in srgb, var(--muted-foreground) 15%, transparent)',
                            color: isActive ? '#10b981' : 'var(--muted-foreground)',
                            borderColor: isActive ? '#10b981' : 'var(--border)',
                        }}
                        variant="outlined"
                    />
                );
            },
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            sortable: false,
            filterable: false,
            width: 160,
            renderCell: (params: any) => {
                const row = params.row as CompanyVehicle;
                if (!row) return null;
                return (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Detay / Masraflar">
                            <IconButton
                                size="small"
                                onClick={() => router.push(`/sirket-araclari/${row.id}`)}
                                sx={{
                                    color: 'var(--primary)',
                                    '&:hover': {
                                        bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                                    },
                                }}
                            >
                                <Visibility fontSize="small" />
                            </IconButton>
                        </Tooltip>
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
                                    setSelectedVehicle(row);
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
    ], [handleOpenDialog, router]);

    const dashboardData = useMemo(() => {
        const categories: Record<string, number> = {};
        const vehicleTotals: Record<string, number> = {};
        let total = 0;

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
                total += amount;
                vehicleTotal += amount;
                const cat = e.masrafTipi || 'DIGER';
                categories[cat] = (categories[cat] || 0) + amount;
            });
            vehicleTotals[v.plaka] = vehicleTotal;
        });

        const categoryChartData = Object.entries(categories).map(([name, value]) => ({
            name: expenseTypeLabels[name] || name,
            value
        })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

        const vehicleChartData = Object.entries(vehicleTotals).map(([name, value]) => ({
            name,
            value
        })).filter(v => v.value > 0).sort((a, b) => b.value - a.value).slice(0, 5);

        return { total, categoryChartData, vehicleChartData };
    }, [vehicles]);

    const CHART_COLORS = ['#0F172A', '#334155', '#64748B', '#94A3B8', '#475569', '#cbd5e1', '#e2e8f0'];

    const handleExport = useCallback((type: 'excel' | 'pdf') => {
        if (type === 'excel') {
            const exportData = vehicles.map((v: CompanyVehicle) => ({
                'Plaka': v.plaka,
                'Marka': v.marka,
                'Model': v.model,
                'Zimmetli Personel': v.personel ? `${v.personel.ad} ${v.personel.soyad}` : '-',
                'Toplam Masraf': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
                    v.expenses?.reduce((sum: number, exp: any) => sum + Number(exp.tutar), 0) || 0
                )
            }));
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Şirket Araçları');
            XLSX.writeFile(wb, `sirket_araclari_masraf_raporu_${new Date().toISOString().split('T')[0]}.xlsx`);
        } else {
            const doc = new jsPDF();
            registerFonts(doc);

            const companyName = tenantSettings?.companyType === 'COMPANY'
                ? tenantSettings?.companyName
                : (tenantSettings?.firstName ? `${tenantSettings.firstName} ${tenantSettings.lastName}` : 'OTOMUHASEBE');

            drawHeader(doc, 'ŞİRKET ARAÇLARI RAPORU', 'Araç Listesi ve Masraf Özetleri', companyName);

            // Summary Section
            doc.setFontSize(14);
            doc.setFont('Roboto', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Rapor Özeti', 20, 60);

            doc.setFontSize(10);
            doc.setFont('Roboto', 'normal');
            doc.text(`Toplam Araç Sayısı: ${vehicles.length}`, 20, 68);
            doc.text(`Genel Toplam Masraf: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(dashboardData.total)}`, 20, 75);

            // Table
            const headers = ['Plaka', 'Marka / Model', 'Zimmetli Personel', 'Toplam Masraf'];
            const rows = vehicles.map((v: CompanyVehicle) => [
                v.plaka,
                `${v.marka} ${v.model}`,
                v.personel ? `${v.personel.ad} ${v.personel.soyad}` : '-',
                new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
                    v.expenses?.reduce((sum: number, exp: any) => sum + Number(exp.tutar), 0) || 0
                )
            ]);
            const colWidths = [35, 60, 50, 45]; // Total 190 (page width ~210)

            drawTable(doc, 85, headers, rows, colWidths);

            doc.save(`sirket_araclari_raporu_${new Date().toISOString().split('T')[0]}.pdf`);
        }
    }, [vehicles, dashboardData.total, tenantSettings]);

    return (
        <MainLayout>
            <Box sx={{ p: 3, bgcolor: 'var(--background)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: 'var(--foreground)',
                                letterSpacing: '-0.02em',
                                mb: 0.5,
                            }}
                        >
                            <DirectionsCar sx={{ fontSize: 40, color: 'var(--primary)' }} />
                            Şirket Araçları
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'var(--muted-foreground)' }}>
                            Şirket araçlarınızı ve masraflarını buradan yönetebilirsiniz.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
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
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['company-vehicles'] })}
                            sx={{
                                borderColor: 'var(--border)',
                                color: 'var(--foreground)',
                                '&:hover': {
                                    borderColor: 'var(--primary)',
                                    bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                                },
                            }}
                        >
                            Yenile
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                bgcolor: 'var(--primary)',
                                color: 'var(--primary-foreground)',
                                '&:hover': {
                                    bgcolor: 'color-mix(in srgb, var(--primary) 90%, #000 10%)',
                                },
                            }}
                        >
                            Yeni Araç Ekle
                        </Button>
                    </Box>
                </Box>

                {/* Dashboard Section */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            elevation: 0,
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            bgcolor: 'var(--card)'
                        }}>
                            <Typography variant="subtitle2" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, mb: 1 }}>
                                Toplam Araç Masrafı
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.04em' }}>
                                {new Intl.NumberFormat('tr-TR', {
                                    style: 'currency',
                                    currency: 'TRY',
                                }).format(dashboardData.total)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--primary)' }} />
                                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                                    {vehicles.length} Aktif Araç
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{
                            p: 2,
                            height: '100%',
                            elevation: 0,
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            bgcolor: 'var(--card)'
                        }}>
                            <Typography variant="subtitle2" sx={{ p: 1, color: 'var(--foreground)', fontWeight: 700 }}>
                                Masraf Dağılımı
                            </Typography>
                            <Box sx={{ height: 200, width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dashboardData.categoryChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {dashboardData.categoryChartData.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                                        />
                                        <Legend
                                            layout="vertical"
                                            align="right"
                                            verticalAlign="middle"
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{
                            p: 2,
                            height: '100%',
                            elevation: 0,
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            bgcolor: 'var(--card)'
                        }}>
                            <Typography variant="subtitle2" sx={{ p: 1, color: 'var(--foreground)', fontWeight: 700 }}>
                                En Masraflı Araçlar
                            </Typography>
                            <Box sx={{ height: 200, width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData.vehicleChartData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={80}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--foreground)' }}
                                        />
                                        <RechartsTooltip
                                            formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                                        />
                                        <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                <Card sx={{ bgcolor: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', borderRadius: '16px', elevation: 0 }}>
                    <DataGrid
                        rows={vehicles}
                        columns={columns}
                        loading={isVehiclesLoading || actionLoading}
                        disableRowSelectionOnClick
                        autoHeight
                        slots={{
                            noRowsOverlay: DataGridNoRowsOverlay,
                        }}
                        rowHeight={60}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 25 } },
                        }}
                        pageSizeOptions={[10, 25, 50, 100]}
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
                </Card>

                {/* Delete Dialog */}
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
                    <DialogTitle sx={{ color: 'var(--foreground)' }}>Kayıt Silinecek</DialogTitle>
                    <DialogContent>
                        <Alert severity="warning" sx={{ mb: 2, bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)', color: 'var(--destructive)' }}>
                            Bu aracı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </Alert>
                        <Typography variant="body1" sx={{ color: 'var(--foreground)' }}>
                            Silinecek araç: <strong>{selectedVehicle?.plaka} - {selectedVehicle?.marka} {selectedVehicle?.model}</strong>
                        </Typography>
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
                            {actionLoading ? 'Siliniyor...' : 'Evet, Sil'}
                        </Button>
                    </DialogActions>
                </Dialog>

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
        </MainLayout >
    );
}
