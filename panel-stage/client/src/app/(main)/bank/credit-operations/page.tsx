'use client';

import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack,
    Skeleton,
    Paper
} from '@mui/material';
import {
    Add,
    Visibility,
    AccountBalance,
    CreditCard,
    TrendingUp,
    TrendingDown
} from '@mui/icons-material';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import axios from '@/lib/axios';
import MainLayout from '@/components/Layout/MainLayout';
import CreateCreditDialog from '@/components/Banka/CreateCreditDialog';
import CreditPlanDialog from '@/components/Banka/CreditPlanDialog';

// Interfaces
interface BankaKrediPlan {
    id: string;
    taksitNo: number;
    vadeTarihi: string;
    odenen: number;
    durum: string;
    tutar: number;
}

interface BankaKredi {
    id: string;
    tutar: number;
    toplamGeriOdeme: number;
    toplamFaiz: number;
    krediTuru: string;
    yillikFaizOrani: number;
    taksitSayisi: number;
    baslangicTarihi: string;
    aciklama?: string;
    durum: string;
    createdAt: string;
    planlar?: BankaKrediPlan[];
    hesap: {
        id: string;
        hesapAdi: string;
        hesapKodu: string;
        hesapTipi: string;
        banka: {
            id: string;
            ad: string;
            sube?: string;
        };
    };
}

interface BankaHesabi {
    id: string;
    hesapAdi: string;
    hesapKodu: string;
    hesapTipi: string;
    bankaId: string;
}

// API Functions
const fetchAllKrediler = async () => {
    const res = await axios.get('/bank/krediler/tum');
    return res.data;
};

const fetchBankalar = async () => {
    const res = await axios.get('/bank');
    return res.data;
};

function KrediIslemleriContent() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const searchParams = useSearchParams();
    const initialBankaId = searchParams.get('bankaId') || '';

    const [krediler, setKrediler] = useState<BankaKredi[]>([]);
    const [bankalar, setBankalar] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [krediDialogOpen, setKrediDialogOpen] = useState(false);
    const [krediHesapSelectOpen, setKrediHesapSelectOpen] = useState(false);
    const [selectedKrediHesapId, setSelectedKrediHesapId] = useState<string | null>(null);
    const [selectedKrediForPlan, setSelectedKrediForPlan] = useState<BankaKredi | null>(null);
    const [filterBanka, setFilterBanka] = useState<string>(initialBankaId);
    const [filterDurum, setFilterDurum] = useState<string>('');

    const loadData = async () => {
        try {
            setLoading(true);
            const [kredilerData, bankalarData] = await Promise.all([
                fetchAllKrediler(),
                fetchBankalar()
            ]);
            setKrediler(kredilerData);
            setBankalar(bankalarData);
        } catch (error) {
            enqueueSnackbar('Veriler yüklenemedi', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreditSubmit = async (data: any) => {
        if (!selectedKrediHesapId) return;
        try {
            await axios.post(`/banka/hesap/${selectedKrediHesapId}/kredi-kullan`, data);
            enqueueSnackbar('Kredi kullanımı başarıyla oluşturuldu', { variant: 'success' });
            setKrediDialogOpen(false);
            setSelectedKrediHesapId(null);
            loadData();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Kredi kullanımı oluşturulurken bir hata oluştu', { variant: 'error' });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    // Calculate summary statistics
    const calculateSummary = () => {
        const aktifKrediler = krediler.filter(k => k.durum === 'AKTIF');
        const toplamKredi = aktifKrediler.reduce((sum, k) => sum + Number(k.tutar), 0);
        const toplamBorc = aktifKrediler.reduce((sum, k) => sum + Number(k.toplamGeriOdeme), 0);
        const toplamOdenen = aktifKrediler.reduce((sum, k) => {
            const odenen = k.planlar?.reduce((acc, p) => acc + Number(p.odenen), 0) || 0;
            return sum + odenen;
        }, 0);
        const kalanBorc = toplamBorc - toplamOdenen;

        // Yaklaşan taksitler (30 gün içinde)
        const bugun = new Date();
        const otuzGunSonra = new Date();
        otuzGunSonra.setDate(bugun.getDate() + 30);

        const yaklasanTaksitler = aktifKrediler.reduce((count, k) => {
            const yaklasan = k.planlar?.filter(p => {
                if (p.durum === 'ODENDI') return false;
                const vadeTarihi = new Date(p.vadeTarihi);
                return vadeTarihi >= bugun && vadeTarihi <= otuzGunSonra;
            }).length || 0;
            return count + yaklasan;
        }, 0);

        return {
            toplamKredi,
            toplamBorc,
            kalanBorc,
            yaklasanTaksitler
        };
    };

    // Filter krediler
    const filteredKrediler = krediler.filter(kredi => {
        if (filterBanka && kredi.hesap.banka.id !== filterBanka) return false;
        if (filterDurum && kredi.durum !== filterDurum) return false;
        return true;
    });

    // Get all credit accounts
    const krediHesaplari: BankaHesabi[] = bankalar.flatMap(banka =>
        (banka.hesaplar || [])
            .filter((h: any) => h.hesapTipi === 'KREDI')
            .map((h: any) => ({
                ...h,
                bankaId: banka.id,
                bankaAdi: banka.ad
            }))
    );

    if (loading) {
        return (
            <MainLayout>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4].map(i => (
                            <Grid key={i} size={{ xs: 12, md: 3 }}>
                                <Skeleton variant="rectangular" height={120} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </MainLayout>
        );
    }

    const summary = calculateSummary();

    return (
        <MainLayout>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h4" sx={{
                                fontWeight: 700,
                                color: 'var(--foreground)',
                                letterSpacing: '-0.025em',
                            }}>
                                Kredi İşlemleri
                            </Typography>
                            <Typography sx={{ color: 'var(--muted-foreground)', mt: 0.5 }}>
                                Tüm kredi işlemlerinizi buradan yönetin
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setKrediHesapSelectOpen(true)}
                            sx={{
                                bgcolor: 'var(--primary)',
                                color: 'var(--primary-foreground)',
                                '&:hover': {
                                    bgcolor: 'var(--primary)',
                                    opacity: 0.9,
                                },
                                borderRadius: 'var(--radius)',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                            }}
                        >
                            Yeni Kredi Ekle
                        </Button>
                    </Box>
                </Box>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{
                            bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
                            borderLeft: '4px solid var(--chart-2)',
                            borderRadius: 'var(--radius)',
                            boxShadow: 'var(--shadow-sm)',
                            height: '100%',
                        }}>
                            <CardContent sx={{ p: '12px !important' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <AccountBalance sx={{ color: 'var(--chart-2)', fontSize: '1rem' }} />
                                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                                        Toplam Kredi
                                    </Typography>
                                </Box>
                                <Typography variant="h5" sx={{ color: 'var(--chart-2)', fontWeight: 800 }}>
                                    {formatCurrency(summary.toplamKredi)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', opacity: 0.8, display: 'block', mt: 0.5 }}>
                                    {krediler.filter(k => k.durum === 'AKTIF').length} Aktif Kredi
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{
                            bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
                            borderLeft: '4px solid var(--chart-2)',
                            borderRadius: 'var(--radius)',
                            boxShadow: 'var(--shadow-sm)',
                            height: '100%',
                        }}>
                            <CardContent sx={{ p: '12px !important' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <TrendingUp sx={{ color: 'var(--chart-2)', fontSize: '1rem' }} />
                                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                                        Toplam Geri Ödeme
                                    </Typography>
                                </Box>
                                <Typography variant="h5" sx={{ color: 'var(--chart-2)', fontWeight: 800 }}>
                                    {formatCurrency(summary.toplamBorc)}
                                </Typography>
                                <Box sx={{ height: '18px' }} /> {/* Placeholder for alignment */}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{
                            bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
                            borderLeft: '4px solid var(--chart-2)',
                            borderRadius: 'var(--radius)',
                            boxShadow: 'var(--shadow-sm)',
                            height: '100%',
                        }}>
                            <CardContent sx={{ p: '12px !important' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <TrendingDown sx={{ color: 'var(--chart-2)', fontSize: '1rem' }} />
                                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                                        Kalan Borç
                                    </Typography>
                                </Box>
                                <Typography variant="h5" sx={{ color: 'var(--chart-2)', fontWeight: 800 }}>
                                    {formatCurrency(summary.kalanBorc)}
                                </Typography>
                                <Box sx={{ height: '18px' }} /> {/* Placeholder for alignment */}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{
                            bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
                            borderLeft: '4px solid var(--chart-2)',
                            borderRadius: 'var(--radius)',
                            boxShadow: 'var(--shadow-sm)',
                            height: '100%',
                        }}>
                            <CardContent sx={{ p: '12px !important' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <CreditCard sx={{ color: 'var(--chart-2)', fontSize: '1rem' }} />
                                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                                        Yaklaşan Taksitler
                                    </Typography>
                                </Box>
                                <Typography variant="h5" sx={{ color: 'var(--chart-2)', fontWeight: 800 }}>
                                    {summary.yaklasanTaksitler}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', opacity: 0.8, display: 'block', mt: 0.5 }}>
                                    30 Gün İçinde
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-sm)',
                    bgcolor: 'var(--card)',
                }}>
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontWeight: 700,
                            color: 'var(--foreground)',
                        }}
                    >
                        <AccountBalance sx={{ color: 'var(--primary)' }} />
                        Filtreler
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                fullWidth
                                label="Banka Filtrele"
                                value={filterBanka}
                                onChange={(e) => setFilterBanka(e.target.value)}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 'var(--radius)',
                                    }
                                }}
                            >
                                <MenuItem value="">Tümü</MenuItem>
                                {bankalar.map(banka => (
                                    <MenuItem key={banka.id} value={banka.id}>{banka.ad}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                fullWidth
                                label="Durum Filtrele"
                                value={filterDurum}
                                onChange={(e) => setFilterDurum(e.target.value)}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 'var(--radius)',
                                    }
                                }}
                            >
                                <MenuItem value="">Tümü</MenuItem>
                                <MenuItem value="AKTIF">Aktif</MenuItem>
                                <MenuItem value="KAPANDI">Kapandı</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Krediler List */}
                <Card sx={{
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-sm)',
                    bgcolor: 'var(--card)',
                    overflow: 'hidden',
                }}>
                    <CardContent sx={{ p: 0 }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid var(--border)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Krediler</Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Banka / Hesap</TableCell>
                                        <TableCell>Başlangıç Tarihi</TableCell>
                                        <TableCell align="right">Kredi Tutarı</TableCell>
                                        <TableCell align="right">Toplam Geri Ödeme</TableCell>
                                        <TableCell align="right">Kalan Tutar</TableCell>
                                        <TableCell align="center">Kalan Taksit</TableCell>
                                        <TableCell align="right">Durum</TableCell>
                                        <TableCell align="center">İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredKrediler.map((kredi) => {
                                        const kalanTutar = Number(kredi.toplamGeriOdeme) - (kredi.planlar?.reduce((acc, p) => acc + Number(p.odenen), 0) || 0);
                                        const kalanTaksitSayisi = (kredi.planlar || []).filter(p => p.durum !== 'ODENDI').length;

                                        return (
                                            <TableRow key={kredi.id} hover>
                                                <TableCell>
                                                    <Typography fontWeight="500">{kredi.hesap.banka.ad}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {kredi.hesap.hesapAdi} ({kredi.hesap.hesapKodu})
                                                    </Typography>
                                                    {kredi.aciklama && (
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            {kredi.aciklama}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(kredi.baslangicTarihi)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatCurrency(Number(kredi.tutar))}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatCurrency(Number(kredi.toplamGeriOdeme))}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography fontWeight="bold" color="primary">
                                                        {formatCurrency(kalanTutar)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={kalanTaksitSayisi}
                                                        size="small"
                                                        color={kalanTaksitSayisi > 0 ? "warning" : "success"}
                                                        variant={kalanTaksitSayisi > 0 ? "filled" : "outlined"}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={kredi.durum === 'AKTIF' ? 'Aktif' : 'Kapandı'}
                                                        color={kredi.durum === 'AKTIF' ? 'success' : 'default'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setSelectedKrediForPlan(kredi)}
                                                        title="Ödeme Planı"
                                                        color="primary"
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filteredKrediler.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                                <Typography color="text.secondary">Henüz kredi kaydı bulunmuyor.</Typography>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Add />}
                                                    onClick={() => setKrediHesapSelectOpen(true)}
                                                    sx={{ mt: 2 }}
                                                >
                                                    İlk Krediyi Ekle
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                {/* Credit Plan Dialog */}
                {selectedKrediForPlan && (
                    <CreditPlanDialog
                        open={!!selectedKrediForPlan}
                        onClose={() => setSelectedKrediForPlan(null)}
                        onUpdate={loadData}
                        kredi={selectedKrediForPlan}
                    />
                )}

                {/* Kredi Hesap Selection Dialog */}
                <Dialog open={krediHesapSelectOpen} onClose={() => setKrediHesapSelectOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle component="div">Kredi Hesabı Seçin</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Hangi kredi hesabına kredi eklemek istiyorsunuz?
                        </Typography>
                        {krediHesaplari.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary" sx={{ mb: 2 }}>
                                    Henüz kredi hesabınız bulunmuyor.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setKrediHesapSelectOpen(false);
                                        router.push('/bank');
                                    }}
                                >
                                    Kredi Hesabı Oluştur
                                </Button>
                            </Box>
                        ) : (
                            <Stack spacing={1}>
                                {krediHesaplari.map((hesap: any) => (
                                    <Button
                                        key={hesap.id}
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => {
                                            setSelectedKrediHesapId(hesap.id);
                                            setKrediHesapSelectOpen(false);
                                            setKrediDialogOpen(true);
                                        }}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            textAlign: 'left',
                                            py: 1.5,
                                        }}
                                    >
                                        <Box sx={{ width: '100%' }}>
                                            <Typography fontWeight="600">{hesap.bankaAdi} - {hesap.hesapAdi}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {hesap.hesapKodu}
                                            </Typography>
                                        </Box>
                                    </Button>
                                ))}
                            </Stack>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setKrediHesapSelectOpen(false)}>İptal</Button>
                    </DialogActions>
                </Dialog>

                {/* Credit Dialog */}
                {selectedKrediHesapId && (
                    <CreateCreditDialog
                        open={krediDialogOpen}
                        onClose={() => {
                            setKrediDialogOpen(false);
                            setSelectedKrediHesapId(null);
                        }}
                        onSubmit={handleCreditSubmit}
                    />
                )}
            </Container>
        </MainLayout>
    );
}

export default function KrediIslemleriPage() {
    return (
        <Suspense fallback={
            <MainLayout>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4].map(i => (
                            <Grid key={i} size={{ xs: 12, md: 3 }}>
                                <Skeleton variant="rectangular" height={120} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </MainLayout>
        }>
            <KrediIslemleriContent />
        </Suspense>
    );
}
