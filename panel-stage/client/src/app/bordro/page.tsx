'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Card,
    Typography,
    Button,
    Chip,
    Grid,
    Paper,
    LinearProgress,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridToolbar,
    GridRenderCellParams,
} from '@mui/x-data-grid';
import {
    Add,
    ArrowForward,
    ArrowBack,
    ReceiptLong,
    TrendingUp,
    Visibility,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

const BORDRO_TYPE_CONFIG: Record<string, { label: string, color: string, bg: string, icon: React.ReactNode }> = {
    MUSTERI_EVRAK_GIRISI: {
        label: 'Müşteri Evrak Girişi',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.1)',
        icon: <ArrowBack fontSize="small" />
    },
    IADE_BORDROSU: {
        label: 'İade Bordrosu',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.1)',
        icon: <ArrowBack fontSize="small" />
    },
    BORC_EVRAK_CIKISI: {
        label: 'Borç Evrak Çıkışı',
        color: '#eab308',
        bg: 'rgba(234, 179, 8, 0.1)',
        icon: <ArrowForward fontSize="small" />
    },
    CARIYE_EVRAK_CIROSU: {
        label: 'Cariye Evrak Cirosu',
        color: '#eab308',
        bg: 'rgba(234, 179, 8, 0.1)',
        icon: <ArrowForward fontSize="small" />
    },
    BANKA_TAHSIL_CIROSU: {
        label: 'Bankaya Tahsil Cirosu',
        color: '#eab308',
        bg: 'rgba(234, 179, 8, 0.1)',
        icon: <ArrowForward fontSize="small" />
    },
    BANKA_TEMINAT_CIROSU: {
        label: 'Bankaya Teminat Cirosu',
        color: '#eab308',
        bg: 'rgba(234, 179, 8, 0.1)',
        icon: <ArrowForward fontSize="small" />
    },
};

const GIRIS_TYPES = ['MUSTERI_EVRAK_GIRISI', 'IADE_BORDROSU'];
const CIKIS_TYPES = ['BORC_EVRAK_CIKISI', 'CARIYE_EVRAK_CIROSU', 'BANKA_TAHSIL_CIROSU', 'BANKA_TEMINAT_CIROSU'];

export default function BordroPage() {
    const router = useRouter();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBordrolar = async () => {
        try {
            const response = await axios.get('/bordro');
            setRows(response.data);
        } catch (error) {
            console.error('Bordrolar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBordrolar();
    }, []);

    // Summary Calculations
    const stats = useMemo(() => {
        const total = rows.length;
        const girisCount = rows.filter((r: any) => GIRIS_TYPES.includes(r.tip)).length;
        const cikisCount = rows.filter((r: any) => CIKIS_TYPES.includes(r.tip)).length;

        return {
            total,
            girisCount,
            cikisCount,
            girisPercent: total > 0 ? (girisCount / total) * 100 : 0,
            cikisPercent: total > 0 ? (cikisCount / total) * 100 : 0
        };
    }, [rows]);

    const columns: GridColDef[] = [
        {
            field: 'bordroNo',
            headerName: 'Bordro No',
            flex: 1,
            minWidth: 140,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" fontWeight={600} color="primary.main">
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'tip',
            headerName: 'İşlem Tipi',
            flex: 1,
            minWidth: 220,
            renderCell: (params: GridRenderCellParams) => {
                const config = BORDRO_TYPE_CONFIG[params.value as string] || {
                    label: params.value,
                    color: '#64748b',
                    bg: 'rgba(100, 116, 139, 0.1)',
                    icon: <ReceiptLong fontSize="small" />
                };
                return (
                    <Chip
                        label={config.label}
                        sx={{
                            bgcolor: config.bg,
                            color: config.color,
                            fontWeight: 700,
                            border: '1px solid currentColor',
                            '& .MuiChip-icon': { color: 'inherit' }
                        }}
                        icon={config.icon}
                        size="small"
                    />
                );
            }
        },
        {
            field: 'tarih',
            headerName: 'İşlem Tarihi',
            flex: 1,
            minWidth: 130,
            valueGetter: (value: any) => value ? new Date(value) : null,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" color="text.secondary">
                    {params.value ? new Date(params.value).toLocaleDateString('tr-TR') : '-'}
                </Typography>
            )
        },
        {
            field: 'cari',
            headerName: 'Cari Hesabı',
            flex: 1.5,
            minWidth: 200,
            valueGetter: (_: any, row: any) => row?.cari?.unvan || '-',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'cekSayisi',
            headerName: 'Evrak',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            valueGetter: (_: any, row: any) => row?._count?.cekSenetler || 0,
            renderCell: (params: GridRenderCellParams) => (
                <Chip label={params.value as React.ReactNode} size="small" sx={{ fontWeight: 600, minWidth: 40 }} />
            )
        },
        {
            field: 'toplamTutar',
            headerName: 'Toplam Tutar',
            flex: 1,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" fontWeight={700} color="primary.main">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(params.value || 0)}
                </Typography>
            )
        },
        {
            field: 'actions',
            headerName: 'İşlem',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Tooltip title="Görüntüle">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => router.push(`/bordro/${params.row.id}`)}
                    >
                        <Visibility fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        },
    ];

    return (
        <MainLayout>
            <Box sx={{ maxWidth: '1600px', mx: 'auto', p: { xs: 1, sm: 2, md: 4 } }}>
                {/* Header Section */}
                <Box mb={4} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', mb: 1, letterSpacing: '-0.5px' }}>
                            Bordro Yönetimi
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                            İşletmenizin tüm çek, senet ve nakit akışını yönetin. Giriş ve çıkış bordrolarını güvenle oluşturun ve takip edin.
                        </Typography>
                    </Box>
                    <Box display="flex" gap={2} sx={{ width: { xs: '100%', sm: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Button
                            variant="outlined"
                            color="success"
                            startIcon={<ArrowBack />}
                            onClick={() => router.push('/bordro/yeni?tip=GIRIS')}
                            fullWidth
                            sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2 }, width: { xs: '100%', sm: 'auto' } }}
                        >
                            Yeni Giriş Bordrosu
                        </Button>
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<ArrowForward />}
                            onClick={() => router.push('/bordro/yeni?tip=CIKIS')}
                            fullWidth
                            sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(234, 179, 8, 0.25)' }, width: { xs: '100%', sm: 'auto' } }}
                        >
                            Yeni Çıkış Bordrosu
                        </Button>
                    </Box>
                </Box>

                {/* Metrics Cards */}
                <Grid container spacing={2} mb={4}>
                    {[
                        { title: 'Toplam İşlem Hacmi', value: stats.total, icon: <ReceiptLong color="primary" />, color: '#3b82f6', progress: 100 },
                        { title: 'Bekleyen Girişler', value: stats.girisCount, icon: <ArrowBack sx={{ color: '#059669' }} />, color: '#059669', progress: stats.girisPercent },
                        { title: 'Gerçekleşen Çıkışlar', value: stats.cikisCount, icon: <ArrowForward sx={{ color: '#d97706' }} />, color: '#d97706', progress: stats.cikisPercent },
                        { title: 'Aylık Büyüme', value: '+12.4%', icon: <TrendingUp sx={{ color: '#4f46e5' }} />, color: '#4f46e5', caption: 'Geçen aya kıyasla', progress: undefined },
                    ].map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card elevation={0} sx={{
                                p: 2,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 2px 10px 0 rgba(0,0,0,0.02)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 24px 0 rgba(0,0,0,0.08)'
                                },
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                height: '100%'
                            }}>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {stat.icon}
                                </Box>
                                <Box flexGrow={1} overflow="hidden">
                                    <Box display="flex" alignItems="baseline" gap={1} mb={0.5}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                                            {stat.value}
                                        </Typography>
                                    </Box>

                                    {stat.progress !== undefined ? (
                                        <Box sx={{ width: '100%', mt: 1 }}>
                                            <LinearProgress variant="determinate" value={stat.progress} sx={{ height: 4, borderRadius: 2, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: stat.color } }} />
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mt: 0.5 }}>
                                            {stat.caption}
                                        </Typography>
                                    )}
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Main Content Area */}
                <Card elevation={0} sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    width: '100%',
                    overflowX: 'auto'
                }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2, display: 'flex', alignItems: 'center', bgcolor: 'background.paper', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                            Son Bordro Hareketleri
                        </Typography>
                    </Box>
                    <Box sx={{ height: 650, width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            loading={loading}
                            slots={{
                                toolbar: GridToolbar,
                                loadingOverlay: () => <LinearProgress />,
                            }}
                            slotProps={{
                                toolbar: {
                                    showQuickFilter: true,
                                    sx: { p: 2, borderBottom: '1px solid', borderColor: 'divider' }
                                },
                            }}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: 'background.default',
                                    color: 'text.secondary',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                },
                                '& .MuiDataGrid-cell': {
                                    borderColor: 'divider',
                                    py: 1.5,
                                    fontSize: '0.875rem'
                                },
                                '& .MuiDataGrid-row:hover': {
                                    bgcolor: 'action.hover'
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.default'
                                }
                            }}
                            disableRowSelectionOnClick
                            getRowHeight={() => 'auto'}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 15 } }
                            }}
                            pageSizeOptions={[15, 25, 50]}
                        />
                    </Box>
                </Card>
            </Box>
        </MainLayout>
    );
}
