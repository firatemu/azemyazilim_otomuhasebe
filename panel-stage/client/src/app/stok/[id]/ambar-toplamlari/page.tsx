'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Grid,
    TextField,
    Card,
    CardContent,
    IconButton,
    CircularProgress,
    Breadcrumbs,
    Link,
    Divider,
} from '@mui/material';
import { ArrowBack, CalendarToday, Warehouse as WarehouseIcon, Search } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface WarehouseStock {
    id: string;
    name: string;
    code: string;
    quantity: number;
}

interface ProductInfo {
    id: string;
    stokKodu: string;
    stokAdi: string;
    birim: string;
}

export default function AmbarToplamlariPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [product, setProduct] = useState<ProductInfo | null>(null);
    const [stockHistory, setStockHistory] = useState<WarehouseStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);

    const fetchProductInfo = useCallback(async () => {
        try {
            const response = await axios.get(`/stok/${productId}`);
            setProduct(response.data);
        } catch (error) {
            console.error('Ürün bilgisi alınamadı:', error);
        }
    }, [productId]);

    const fetchStockHistory = useCallback(async () => {
        setDataLoading(true);
        try {
            const response = await axios.get(`/warehouse/product/${productId}/stock-history`, {
                params: { date }
            });
            setStockHistory(response.data);
        } catch (error) {
            console.error('Ambar stok geçmişi alınamadı:', error);
        } finally {
            setDataLoading(false);
            setLoading(false);
        }
    }, [productId, date]);

    useEffect(() => {
        fetchProductInfo();
        fetchStockHistory();
    }, [fetchProductInfo, fetchStockHistory]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
    };

    if (loading && !product) {
        return (
            <MainLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link color="inherit" href="/stok/malzeme-listesi" sx={{ textDecoration: 'none', '&:hover': { color: 'var(--primary)' } }}>
                        Malzeme Listesi
                    </Link>
                    <Typography color="text.primary">Ambar Toplamları</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <IconButton onClick={() => router.back()} sx={{ bgcolor: 'var(--muted)', '&:hover': { bgcolor: 'color-mix(in srgb, var(--muted) 80%, black 20%)' } }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: 'var(--foreground)' }}>
                        Ambar Toplamları
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="var(--muted-foreground)" gutterBottom>
                                Ürün Bilgileri
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: 'var(--primary)', mb: 1 }}>
                                {product?.stokKodu}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'var(--foreground)', mb: 2 }}>
                                {product?.stokAdi}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" color="var(--muted-foreground)" gutterBottom>
                                Birim
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'var(--foreground)' }}>
                                {product?.birim}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ mt: 3, bgcolor: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="var(--muted-foreground)" gutterBottom>
                                Sorgu Tarihi
                            </Typography>
                            <TextField
                                fullWidth
                                type="date"
                                value={date}
                                onChange={handleDateChange}
                                InputProps={{
                                    startAdornment: <CalendarToday fontSize="small" sx={{ mr: 1, color: 'var(--muted-foreground)' }} />
                                }}
                                sx={{
                                    mt: 1,
                                    '& .MuiInputBase-root': {
                                        borderRadius: 'var(--radius)',
                                    }
                                }}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<Search />}
                                onClick={fetchStockHistory}
                                disabled={dataLoading}
                                sx={{
                                    mt: 2,
                                    background: '#527575',
                                    color: '#0b0b0b',
                                    borderRadius: '999px',
                                    fontWeight: 700,
                                    '&:hover': { background: 'color-mix(in srgb, #527575 90%, #000 10%)' }
                                }}
                            >
                                Sorgula
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <TableContainer component={Paper} sx={{ bgcolor: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'var(--muted)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <WarehouseIcon fontSize="small" />
                                            Ambar Kodu
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Ambar Adı</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Stok Miktarı</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                            <CircularProgress size={24} />
                                        </TableCell>
                                    </TableRow>
                                ) : stockHistory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body2" color="var(--muted-foreground)">
                                                Bu tarihte herhangi bir ambar hareketi bulunamadı.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stockHistory.map((row) => (
                                        <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: 'var(--muted)' } }}>
                                            <TableCell sx={{ color: 'var(--primary)', fontWeight: 600 }}>{row.code}</TableCell>
                                            <TableCell sx={{ color: 'var(--foreground)' }}>{row.name}</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body1" fontWeight="bold" sx={{
                                                    color: row.quantity > 0 ? 'var(--chart-2)' : row.quantity < 0 ? 'var(--destructive)' : 'var(--muted-foreground)'
                                                }}>
                                                    {row.quantity.toLocaleString('tr-TR')} {product?.birim}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                            <TableHead sx={{ bgcolor: 'var(--muted)', display: stockHistory.length > 0 ? 'table-header-group' : 'none' }}>
                                <TableRow>
                                    <TableCell colSpan={2} sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Genel Toplam</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                                        {stockHistory.reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString('tr-TR')} {product?.birim}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                        </Table>
                    </TableContainer>
                    <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'var(--muted-foreground)' }}>
                        * Stok miktarları seçilen tarihin sonu (23:59:59) itibariyle hesaplanmıştır.
                    </Typography>
                </Grid>
            </Grid>
        </MainLayout>
    );
}
