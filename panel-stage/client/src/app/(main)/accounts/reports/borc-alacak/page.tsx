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
    DateRange,
    MoneyOff,
    AttachMoney,
    TrendingUp,
    TrendingDown
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import TableSkeleton from '@/components/Loading/TableSkeleton';
import { useTabStore } from '@/stores/tabStore';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import trLocale from 'date-fns/locale/tr';

// Types matching backend DTO
interface DebtCreditReportItem {
    id: string;
    cariKodu: string;
    unvan: string;
    tip: 'MUSTERI' | 'TEDARIKCI';
    aktif: boolean;
    totalDebt: number;
    totalCredit: number;
    balance: number;
    lastTransactionDate?: string;
    satisElemani?: string;
}

interface ReportSummary {
    totalDebt: number;
    totalCredit: number;
    netBalance: number;
    count: number;
}

interface ReportResponse {
    items: DebtCreditReportItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pageCount: number;
    };
    summary: ReportSummary;
}

export default function DebtCreditReportPage() {
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
        tip: '',
        satisElemaniId: '',
        durum: '',
    });
    const [satisElemanlari, setSatisElemanlari] = useState<any[]>([]);

    // Tab management
    useEffect(() => {
        addTab({
            id: 'cari-borc-alacak-raporu',
            label: 'Borç Alacak Raporu',
            path: '/account/rapor/borc-alacak',
        });
        setActiveTab('cari-borc-alacak-raporu');
    }, []);

    // Fetch Data
    const fetchData = async () => {
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

            const response = await axios.get('/account/rapor/borc-alacak', { params });
            setData(response.data);
        } catch (error) {
            console.error('Rapor verisi alınamadı:', error);
        } finally {
            setLoading(false);
        }
    };

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
    }, [page, limit, debouncedSearch, filters]);

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

            const response = await axios.get(`/cari/rapor/borc-alacak/export/${type}`, {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `borc-alacak-raporu.${type === 'excel' ? 'xlsx' : 'pdf'}`);
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
                            Borç Alacak Durum Raporu
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                            Cari hesapların güncel borç, alacak ve bakiye durumlarını detaylı olarak inceleyin via
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
                                        TOPLAM ALACAK
                                    </Typography>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'color-mix(in srgb, var(--chart-3) 15%, transparent)', color: 'var(--chart-3)' }}>
                                        <TrendingDown fontSize="small" />
                                    </Box>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                                    {formatCurrency(data?.summary.totalCredit || 0)}
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
                                        TOPLAM BORÇ
                                    </Typography>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)', color: 'var(--destructive)' }}>
                                        <TrendingUp fontSize="small" />
                                    </Box>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
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
                                        NET BAKİYE
                                    </Typography>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)', color: 'var(--chart-1)' }}>
                                        <AccountBalanceWallet fontSize="small" />
                                    </Box>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: (data?.summary.netBalance || 0) >= 0 ? '#059669' : '#dc2626' }}>
                                    {formatCurrency(Math.abs(data?.summary.netBalance || 0))}
                                    <Typography component="span" variant="body2" sx={{ ml: 1, color: 'var(--muted-foreground)', fontWeight: 500 }}>
                                        {(data?.summary.netBalance || 0) >= 0 ? '(Alacaklı)' : '(Borçlu)'}
                                    </Typography>
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
                                        CARİ SAYISI
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
                        <Grid size={{ xs: 12, md: 3.5 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Cari kodu veya ünvan ile ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1, color: 'var(--muted-foreground)' }} />
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Cari Tipi</InputLabel>
                                <Select
                                    value={filters.tip}
                                    label="Cari Tipi"
                                    onChange={(e) => handleFilterChange('tip', e.target.value)}
                                >
                                    <MenuItem value="">Tümü</MenuItem>
                                    <MenuItem value="MUSTERI">Müşteri</MenuItem>
                                    <MenuItem value="TEDARIKCI">Tedarikçi</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Durum</InputLabel>
                                <Select
                                    value={filters.durum}
                                    label="Durum"
                                    onChange={(e) => handleFilterChange('durum', e.target.value)}
                                >
                                    <MenuItem value="">Tümü</MenuItem>
                                    <MenuItem value="BORC">Borçlu</MenuItem>
                                    <MenuItem value="ALACAK">Alacaklı</MenuItem>
                                    <MenuItem value="SIFIR">Dengede</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
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
                        <Grid size={{ xs: 12, md: 2.5 }} sx={{ display: 'flex', justifyContent: 'flex-end', ml: 'auto' }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setSearch('');
                                    setFilters({ tip: '', satisElemaniId: '', durum: '' });
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
                                <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Tip</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#dc2626' }}>Borç</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#059669' }}>Alacak</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Bakiye</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Durum</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableSkeleton rows={5} columns={8} />
                            ) : data?.items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">Kayıt bulunamadı</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.items.map((item) => (
                                    <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: 'var(--muted) !important' } }}>
                                        <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{item.cariKodu}</TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>{item.unvan}</TableCell>
                                        <TableCell sx={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{item.satisElemani || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.tip === 'MUSTERI' ? 'Müşteri' : 'Tedarikçi'}
                                                size="small"
                                                variant="outlined"
                                                color={item.tip === 'MUSTERI' ? 'primary' : 'secondary'}
                                                sx={{ borderRadius: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                                            {item.totalDebt > 0 ? formatCurrency(item.totalDebt) : '-'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
                                            {item.totalCredit > 0 ? formatCurrency(item.totalCredit) : '-'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                                            {formatCurrency(Math.abs(item.balance))}
                                            <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                                                {item.balance > 0 ? '(A)' : item.balance < 0 ? '(B)' : ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={item.balance > 0 ? 'Alacaklı' : item.balance < 0 ? 'Borçlu' : 'Dengeli'}
                                                size="small"
                                                sx={{
                                                    bgcolor: item.balance > 0 ? 'color-mix(in srgb, var(--chart-3) 15%, transparent)' : item.balance < 0 ? 'color-mix(in srgb, var(--destructive) 15%, transparent)' : 'var(--muted)',
                                                    color: item.balance > 0 ? '#059669' : item.balance < 0 ? '#dc2626' : '#4b5563',
                                                    fontWeight: 600,
                                                    borderRadius: 1
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
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
