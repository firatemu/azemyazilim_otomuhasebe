'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    IconButton,
    Chip,
    Grid,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Tooltip,
    Pagination,
    Stack,
    InputAdornment,
} from '@mui/material';
import {
    Search,
    FilterList,
    GetApp,
    Description,
    TableChart,
    ArrowUpward,
    ArrowDownward,
    AccountBalanceWallet,
    Refresh,
    TrendingUp,
    TrendingDown,
    Warning,
    CheckCircle
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import TableSkeleton from '@/components/Loading/TableSkeleton';
import { useTabStore } from '@/stores/tabStore';

interface RiskLimitReportItem {
    id: string;
    cariKodu: string;
    unvan: string;
    tip: 'MUSTERI' | 'TEDARIKCI';
    balance: number;
    debt: number;
    riskLimit: number;
    remainingLimit: number;
    satisElemani?: string;
}

interface ReportSummary {
    totalDebt: number;
    totalRiskLimit: number;
    totalRemainingLimit: number;
    count: number;
}

interface ReportResponse {
    items: RiskLimitReportItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pageCount: number;
    };
    summary: ReportSummary;
}

export default function CariRiskLimitleriPage() {
    const { addTab, setActiveTab } = useTabStore();

    // States
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ReportResponse | null>(null);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | null>(null);
    const [filters, setFilters] = useState({
        satisElemaniId: '',
        durum: '',
    });
    const [satisElemanlari, setSatisElemanlari] = useState<any[]>([]);

    // Tab management
    useEffect(() => {
        addTab({
            id: 'raporlama-cari-risk',
            label: 'Cari Risk Limitleri',
            path: '/raporlama/cari-risk-limitleri',
        });
        setActiveTab('raporlama-cari-risk');
    }, []);

    // Fetch Data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit,
                search: debouncedSearch,
                ...filters,
            };

            // Clean empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await axios.get('/account/rapor/risk-limitleri', { params });
            setData(response.data);
        } catch (error) {
            console.error('Risk limitleri raporu alınamadı:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, filters]);

    // Fetch Salespersons
    useEffect(() => {
        const fetchSatisElemanlari = async () => {
            try {
                const response = await axios.get('/sales-agent');
                setSatisElemanlari(response.data || []);
            } catch (error) {
                console.error('Satış elemanları yüklenirken hata:', error);
            }
        };
        fetchSatisElemanlari();
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (field: string, value: any) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(1); // Reset page on filter change
    };

    const handleExport = async (type: 'pdf' | 'excel') => {
        try {
            setExportLoading(type);
            const params: any = {
                search: debouncedSearch,
                ...filters,
            };

            // Clean empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await axios.get(`/cari/rapor/risk-limitleri/export/${type}`, {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `cari-risk-limitleri.${type === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`${type.toUpperCase()} dışa aktarma hatası:`, error);
        } finally {
            setExportLoading(null);
        }
    };

    // Helper for formatting currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <MainLayout>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.75rem',
                                color: 'var(--foreground)',
                                letterSpacing: '-0.02em',
                                mb: 0.5,
                            }}
                        >
                            Cari Risk Limitleri Raporu
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                            Müşterilerinizin tanımlı risk limitlerini ve kalan limit durumlarını güncel borçları üzerinden inceleyin.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={exportLoading === 'excel' ? <CircularProgress size={16} color="inherit" /> : <TableChart />}
                            onClick={() => handleExport('excel')}
                            disabled={!!exportLoading}
                            sx={{
                                borderColor: 'var(--border)',
                                color: 'var(--foreground)',
                                '&:hover': { bgcolor: 'var(--muted)' }
                            }}
                        >
                            Excel
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={exportLoading === 'pdf' ? <CircularProgress size={16} color="inherit" /> : <Description />}
                            onClick={() => handleExport('pdf')}
                            disabled={!!exportLoading}
                            sx={{
                                borderColor: 'var(--border)',
                                color: 'var(--foreground)',
                                '&:hover': { bgcolor: 'var(--muted)' }
                            }}
                        >
                            PDF
                        </Button>
                        <IconButton onClick={fetchData} sx={{ border: '1px solid var(--border)', borderRadius: 1 }}>
                            <Refresh fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{
                            boxShadow: 'var(--shadow-sm)',
                            border: '1px solid var(--border)',
                            height: '100%',
                            bgcolor: 'var(--card)'
                        }}>
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        TOPLAM RİSK LİMİTİ
                                    </Typography>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'color-mix(in srgb, #0284c7 15%, transparent)', color: '#0284c7' }}>
                                        <AccountBalanceWallet fontSize="small" />
                                    </Box>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0284c7' }}>
                                    {formatCurrency(data?.summary.totalRiskLimit || 0)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{
                            boxShadow: 'var(--shadow-sm)',
                            border: '1px solid var(--border)',
                            height: '100%',
                            bgcolor: 'var(--card)'
                        }}>
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        SİSTEMDEKİ TOPLAM BORÇ
                                    </Typography>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)', color: 'var(--destructive)' }}>
                                        <TrendingUp fontSize="small" />
                                    </Box>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--destructive)' }}>
                                    {formatCurrency(data?.summary.totalDebt || 0)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{
                            boxShadow: 'var(--shadow-sm)',
                            border: '1px solid var(--border)',
                            height: '100%',
                            bgcolor: 'var(--card)'
                        }}>
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        TOPLAM KALAN LİMİT
                                    </Typography>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'var(--muted)', color: 'var(--foreground)' }}>
                                        <AccountBalanceWallet fontSize="small" />
                                    </Box>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                                    {formatCurrency(data?.summary.totalRemainingLimit || 0)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{
                            boxShadow: 'var(--shadow-sm)',
                            border: '1px solid var(--border)',
                            height: '100%',
                            bgcolor: 'var(--card)'
                        }}>
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        LİSTELENEN CARİ SAYISI
                                    </Typography>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                                        <FilterList fontSize="small" />
                                    </Box>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                                    {data?.summary.count || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters & Search */}
                <Paper sx={{ p: 1.5, mb: 3, borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <Grid container spacing={1.5} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Cari kodu, ünvan veya vergi no ile ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1, color: 'var(--muted-foreground)' }} />
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Satış Elemanı</InputLabel>
                                <Select
                                    value={filters.satisElemaniId}
                                    label="Satış Elemanı"
                                    onChange={(e) => handleFilterChange('satisElemaniId', e.target.value)}
                                >
                                    <MenuItem value="">Tümü</MenuItem>
                                    {satisElemanlari.map((se) => (
                                        <MenuItem key={se.id} value={se.id}>{se.adSoyad}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Risk Durumu</InputLabel>
                                <Select
                                    value={filters.durum}
                                    label="Risk Durumu"
                                    onChange={(e) => handleFilterChange('durum', e.target.value)}
                                >
                                    <MenuItem value="">Tümü</MenuItem>
                                    <MenuItem value="LIMIT_ASILDI">Limiti Aşanlar</MenuItem>
                                    <MenuItem value="NORMAL">Normal</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', justifyContent: 'flex-end', ml: 'auto' }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setSearch('');
                                    setFilters({ satisElemaniId: '', durum: '' });
                                }}
                                sx={{ textTransform: 'none', height: '40px' }}
                            >
                                Filtreleri Temizle
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Data Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Cari Kodu</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Ünvan</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Satış Elemanı</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#0284c7' }}>Tanımlı Risk (TL)</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#dc2626' }}>Güncel Borç (TL)</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Kalan Limit (TL)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableSkeleton rows={5} columns={6} />
                            ) : data?.items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">Kayıt bulunamadı</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.items.map((item) => {
                                    const isOverLimit = item.remainingLimit < 0;

                                    return (
                                        <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: 'var(--muted) !important' } }}>
                                            <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{item.cariKodu}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{item.unvan}</TableCell>
                                            <TableCell sx={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{item.satisElemani || '-'}</TableCell>

                                            <TableCell align="right" sx={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                                                {item.riskLimit > 0 ? formatCurrency(item.riskLimit) : '-'}
                                            </TableCell>

                                            <TableCell align="right" sx={{ color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                                                {item.debt > 0 ? formatCurrency(item.debt) : '-'}
                                            </TableCell>

                                            <TableCell align="right" sx={{
                                                fontWeight: 800,
                                                fontFamily: 'var(--font-mono)',
                                                bgcolor: isOverLimit ? 'color-mix(in srgb, var(--destructive) 10%, transparent)' : 'transparent',
                                                color: isOverLimit ? 'var(--destructive)' : '#059669'
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                                    {isOverLimit ? <Warning fontSize="small" color="error" /> : <CheckCircle fontSize="small" color="success" />}
                                                    {formatCurrency(item.remainingLimit)}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)' }}>
                        <Pagination
                            count={data?.meta.pageCount || 1}
                            page={page}
                            onChange={(_, p) => setPage(p)}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                </TableContainer>
            </Box>
        </MainLayout >
    );
}
