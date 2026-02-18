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
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridToolbar,
} from '@mui/x-data-grid';
import {
    Add,
    ArrowForward,
    ArrowBack,
    ReceiptLong,
    TrendingUp,
    AccountBalanceWallet,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

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
        const girisCount = rows.filter((r: any) => r.tip === 'GIRIS_BORDROSU').length;
        const cikisCount = rows.filter((r: any) => r.tip === 'CIKIS_BORDROSU').length;

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
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="primary.main">
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'tip',
            headerName: 'İşlem Tipi',
            flex: 1,
            renderCell: (params) => (
                <Chip
                    label={params.value === 'GIRIS_BORDROSU' ? 'Giriş Bordrosu' : 'Çıkış Bordrosu'}
                    sx={{
                        bgcolor: params.value === 'GIRIS_BORDROSU' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                        color: params.value === 'GIRIS_BORDROSU' ? '#22c55e' : '#eab308',
                        fontWeight: 700,
                        border: '1px solid currentColor',
                        '& .MuiChip-icon': { color: 'inherit' }
                    }}
                    icon={params.value === 'GIRIS_BORDROSU' ? <ArrowBack fontSize="small" /> : <ArrowForward fontSize="small" />}
                    size="small"
                />
            )
        },
        {
            field: 'tarih',
            headerName: 'İşlem Tarihi',
            flex: 1,
            valueGetter: (value) => value ? new Date(value) : null,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {params.value ? new Date(params.value).toLocaleDateString('tr-TR') : '-'}
                </Typography>
            )
        },
        {
            field: 'cari',
            headerName: 'Cari Hesabı',
            flex: 1.5,
            valueGetter: (_, row) => row?.cari?.unvan || '-',
            renderCell: (params) => (
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
            valueGetter: (_, row) => row?._count?.cekSenetler || 0,
            renderCell: (params) => (
                <Chip label={params.value} size="small" sx={{ fontWeight: 600, minWidth: 40 }} />
            )
        },
    ];

    return (
        <MainLayout>
            <Box sx={{ maxWidth: '1600px', mx: 'auto', p: { xs: 1, md: 3 } }}>
                {/* Header Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{
                            background: 'linear-gradient(45deg, var(--foreground) 30%, var(--primary) 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5
                        }}>
                            Bordro Yönetimi
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            Çek ve senet bordro işlemlerini buradan yönetebilirsiniz.
                        </Typography>
                    </Box>
                    <Box gap={2} display="flex">
                        <Button
                            variant="outlined"
                            sx={{
                                borderRadius: '12px',
                                px: 3,
                                fontWeight: 700,
                                borderColor: '#22c55e',
                                color: '#22c55e',
                                '&:hover': { borderColor: '#16a34a', bgcolor: 'rgba(34, 197, 94, 0.05)' }
                            }}
                            startIcon={<Add />}
                            onClick={() => router.push('/bordro/yeni?tip=GIRIS')}
                        >
                            Giriş Bordrosu
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: '12px',
                                px: 3,
                                fontWeight: 700,
                                bgcolor: '#eab308',
                                '&:hover': { bgcolor: '#ca8a04' }
                            }}
                            startIcon={<ArrowForward />}
                            onClick={() => router.push('/bordro/yeni?tip=CIKIS')}
                        >
                            Çıkış Bordrosu
                        </Button>
                    </Box>
                </Box>

                {/* Dashboard Cards */}
                <Grid container spacing={3} mb={4}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper elevation={0} sx={{
                            p: 3, borderRadius: '20px', border: '1px solid var(--border)',
                            bgcolor: 'var(--card)', position: 'relative', overflow: 'hidden'
                        }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                        Toplam Bordro
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>{stats.total}</Typography>
                                </Box>
                                <ReceiptLong sx={{ color: 'var(--primary)', fontSize: 40, opacity: 0.2 }} />
                            </Box>
                            <Box mt={2}>
                                <LinearProgress variant="determinate" value={100} sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--muted)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--primary)' } }} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper elevation={0} sx={{
                            p: 3, borderRadius: '20px', border: '1px solid var(--border)',
                            bgcolor: 'var(--card)'
                        }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                        Giriş Bordroları
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} sx={{ my: 1, color: '#22c55e' }}>{stats.girisCount}</Typography>
                                </Box>
                                <ArrowBack sx={{ color: '#22c55e', fontSize: 40, opacity: 0.2 }} />
                            </Box>
                            <Box mt={2}>
                                <LinearProgress variant="determinate" value={stats.girisPercent} sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--muted)', '& .MuiLinearProgress-bar': { bgcolor: '#22c55e' } }} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper elevation={0} sx={{
                            p: 3, borderRadius: '20px', border: '1px solid var(--border)',
                            bgcolor: 'var(--card)'
                        }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                        Çıkış Bordroları
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} sx={{ my: 1, color: '#eab308' }}>{stats.cikisCount}</Typography>
                                </Box>
                                <ArrowForward sx={{ color: '#eab308', fontSize: 40, opacity: 0.2 }} />
                            </Box>
                            <Box mt={2}>
                                <LinearProgress variant="determinate" value={stats.cikisPercent} sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--muted)', '& .MuiLinearProgress-bar': { bgcolor: '#eab308' } }} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper elevation={0} sx={{
                            p: 3, borderRadius: '20px', border: '1px solid var(--border)',
                            bgcolor: 'var(--card)', backgroundImage: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.05) 0%, transparent 100%)'
                        }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                        Trend
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>+12%</Typography>
                                </Box>
                                <TrendingUp sx={{ color: 'var(--primary)', fontSize: 40, opacity: 0.2 }} />
                            </Box>
                            <Typography variant="caption" color="#22c55e" fontWeight={700}>
                                Son 30 güne göre artış
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Main Content Area */}
                <Card elevation={0} sx={{
                    borderRadius: '24px',
                    border: '1px solid var(--border)',
                    bgcolor: 'var(--card)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <Box sx={{ height: 600, width: '100%', p: 1 }}>
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
                                    sx: { p: 2, '& .MuiButton-root': { fontWeight: 600, color: 'text.secondary' } }
                                },
                            }}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: 'var(--muted)',
                                    color: 'var(--foreground)',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                },
                                '& .MuiDataGrid-cell': {
                                    borderColor: 'var(--border)',
                                    py: 2
                                },
                                '& .MuiDataGrid-row:hover': {
                                    bgcolor: 'rgba(var(--primary-rgb), 0.02)'
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '1px solid var(--border)'
                                }
                            }}
                            disableRowSelectionOnClick
                            getRowHeight={() => 'auto'}
                        />
                    </Box>
                </Card>
            </Box>
        </MainLayout>
    );
}
