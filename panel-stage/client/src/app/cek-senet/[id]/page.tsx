'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Typography,
    Chip,
    Grid,
    Divider,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
} from '@mui/material';
import {
    ArrowBack,
    Payment,
    Edit,
    History,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

export default function CekDetayPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params as { id: string };

    const [cek, setCek] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchCekDetay = async () => {
        try {
            const response = await axios.get(`/cek-senet/${id}`);
            setCek(response.data);
        } catch (error) {
            console.error('Çek detay yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCekDetay();
    }, [id]);

    if (loading || !cek) return <Box p={3}>Yükleniyor...</Box>;

    return (
        <MainLayout>
            <Box p={3}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <IconButton onClick={() => router.back()}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold">
                        Çek Detayı - {cek.evrakNo}
                    </Typography>
                    <Chip label={cek.durum} color="primary" />
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" mb={2}>Temel Bilgiler</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Evrak No</Typography>
                                    <Typography fontWeight="bold">{cek.evrakNo}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Vade Tarihi</Typography>
                                    <Typography fontWeight="bold">{new Date(cek.vadeTarihi).toLocaleDateString()}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Tutar</Typography>
                                    <Typography fontWeight="bold" variant="h6">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cek.tutar)}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Kalan Tutar</Typography>
                                    <Typography fontWeight="bold" color="error">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cek.kalanTutar)}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Tip</Typography>
                                    <Typography>{cek.tip?.replace('_', ' ')}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Çek Sahibi / Borçlu</Typography>
                                    <Typography>{cek.borclu || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Banka</Typography>
                                    <Typography>{cek.banka || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Şube / Hesap</Typography>
                                    <Typography>{cek.sube} / {cek.hesapNo}</Typography>
                                </Grid>
                            </Grid>
                        </Card>

                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
                                <History /> İşlem Geçmişi
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Tarih</TableCell>
                                            <TableCell>İşlem</TableCell>
                                            <TableCell>Bordro</TableCell>
                                            <TableCell align="right">Tutar</TableCell>
                                            <TableCell>Açıklama</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cek.islemler?.map((islem: any) => (
                                            <TableRow key={islem.id}>
                                                <TableCell>{new Date(islem.tarih).toLocaleDateString()}</TableCell>
                                                <TableCell>{islem.islemTipi}</TableCell>
                                                <TableCell>
                                                    {islem.bordro ? (
                                                        <Button size="small" onClick={() => router.push(`/bordro/${islem.bordroId}`)}>
                                                            {islem.bordro.bordroNo}
                                                        </Button>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(islem.tutar)}
                                                </TableCell>
                                                <TableCell>{islem.aciklama}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>Hızlı İşlemler</Typography>
                            <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                startIcon={<Payment />}
                                disabled={Number(cek.kalanTutar) === 0}
                                onClick={() => router.push('/cek-senet')} // Listeye dönüp ordan açsın şimdilik veya buraya dialog ekle
                            >
                                Tahsilat Yap
                            </Button>
                            <Box mt={2}>
                                <Typography variant="body2" color="text.secondary">
                                    * Detaylı tahsilat için listedeki "Tahsil Et" butonunu kullanabilirsiniz.
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </MainLayout>
    );
}
