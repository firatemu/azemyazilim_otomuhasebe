'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    MenuItem,
} from '@mui/material';
import {
    Assessment,
    People,
    TrendingDown,
    TrendingUp,
    ShoppingCart,
    Event,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface SalespersonPerformance {
    satisElemaniId: string;
    adSoyad: string;
    toplamSatis: number;
    satisAdedi: number;
    toplamTahsilat: number;
    tahsilatAdedi: number;
}

interface PerformanceResponse {
    range: {
        startDate: string;
        endDate: string;
        preset: string;
    };
    performance: SalespersonPerformance[];
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('tr-TR', {
    style: 'decimal',
    maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value || 0);
const formatNumber = (value: number) => numberFormatter.format(value || 0);

const formatDateLabel = (input: string) =>
    new Date(input).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

type PresetKey = 'today' | 'last7' | 'last30' | 'thisMonth' | 'custom';

const presetOptions: Array<{ value: PresetKey; label: string }> = [
    { value: 'today', label: 'Bugün' },
    { value: 'last7', label: 'Son 7 Gün' },
    { value: 'last30', label: 'Son 30 Gün' },
    { value: 'thisMonth', label: 'Bu Ay' },
    { value: 'custom', label: 'Özel Tarih Aralığı' },
];

export default function SatisElemaniRaporPage() {
    const [data, setData] = useState<PerformanceResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preset, setPreset] = useState<PresetKey>('last30');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const fetchPerformance = useCallback(
        async (options?: { preset?: PresetKey; startDate?: string; endDate?: string }) => {
            try {
                setLoading(true);
                setError(null);

                const selectedPreset = options?.preset ?? preset;
                const start = options?.startDate ?? customStart;
                const end = options?.endDate ?? customEnd;

                const params: Record<string, string> = { preset: selectedPreset };

                if (selectedPreset === 'custom') {
                    if (!start || !end) {
                        setError('Özel tarih aralığı için başlangıç ve bitiş tarihlerini seçiniz.');
                        setLoading(false);
                        return;
                    }
                    params.startDate = start;
                    params.endDate = end;
                }

                const response = await axios.get<PerformanceResponse>('/raporlama/salesperson-performance', {
                    params,
                });
                setData(response.data);
            } catch (err: any) {
                console.error('Satış elemanı verisi alınamadı:', err);
                setError(err?.response?.data?.message || 'Veriler alınırken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        },
        [preset, customStart, customEnd],
    );

    useEffect(() => {
        if (preset !== 'custom') {
            fetchPerformance({ preset });
        }
    }, [fetchPerformance, preset]);

    return (
        <MainLayout>
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <People color="primary" /> Satış Elemanı Performansı
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Satış elemanlarının satış ve tahsilat performanslarını izleyin.
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            select
                            size="small"
                            label="Tarih Aralığı"
                            value={preset}
                            onChange={(e) => setPreset(e.target.value as PresetKey)}
                            sx={{ minWidth: 180 }}
                        >
                            {presetOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        {preset === 'custom' && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TextField
                                    type="date"
                                    size="small"
                                    label="Başlangıç"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    type="date"
                                    size="small"
                                    label="Bitiş"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button variant="contained" onClick={() => fetchPerformance({ preset: 'custom' })} disabled={loading}>
                                    Uygula
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {data && (
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                            Performans Tablosu ({formatDateLabel(data.range.startDate)} - {formatDateLabel(data.range.endDate)})
                                        </Typography>

                                        {data.performance.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                                Bu tarih aralığında performans verisi bulunamadı.
                                            </Typography>
                                        ) : (
                                            <TableContainer>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                                                            <TableCell sx={{ fontWeight: 700 }}>Satış Elemanı</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Satış Adedi</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Toplam Satış</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Tahsilat Adedi</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Toplam Tahsilat</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {data.performance.map((item, index) => (
                                                            <TableRow key={item.satisElemaniId || `se-${index}`} hover>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight={600}>
                                                                        {item.adSoyad}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="right">{formatNumber(item.satisAdedi)}</TableCell>
                                                                <TableCell align="right">
                                                                    <Typography variant="body2" color="success.main" fontWeight={600}>
                                                                        {formatCurrency(item.toplamSatis)}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="right">{formatNumber(item.tahsilatAdedi)}</TableCell>
                                                                <TableCell align="right">
                                                                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                                                                        {formatCurrency(item.toplamTahsilat)}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}
                    </>
                )}
            </Box>
        </MainLayout>
    );
}
