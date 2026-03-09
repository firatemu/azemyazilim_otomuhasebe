'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Typography,
    Chip,
    Grid,
    IconButton,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ArrowBack,
    Print,
    ExpandMore,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

export default function TahsilatDetayPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params as { id: string };

    const [tahsilat, setTahsilat] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchTahsilatDetay = async () => {
        try {
            const response = await axios.get(`/tahsilat/${id}`);
            setTahsilat(response.data);
        } catch (error) {
            console.error('Tahsilat/Ödeme detay yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchTahsilatDetay();
    }, [id]);

    if (loading || !tahsilat) return <Box p={3}>Yükleniyor...</Box>;

    const isTahsilat = tahsilat.tip === 'COLLECTION';

    return (
        <MainLayout>
            <Box p={3}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <IconButton onClick={() => router.back()}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold">
                        {isTahsilat ? 'Tahsilat Detayı' : 'Ödeme Detayı'}
                    </Typography>
                    <Chip
                        label={isTahsilat ? 'TAHSİLAT' : 'ÖDEME'}
                        color={isTahsilat ? 'success' : 'error'}
                    />
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" mb={2}>Temel Bilgiler</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Tarih</Typography>
                                    <Typography fontWeight="bold">{new Date(tahsilat.tarih).toLocaleDateString('tr-TR')}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Tutar</Typography>
                                    <Typography fontWeight="bold" variant="h6" color={isTahsilat ? 'success.main' : 'error.main'}>
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tahsilat.tutar)}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Ödeme Tipi</Typography>
                                    <Typography fontWeight="bold">{tahsilat.odemeTipi?.replace('_', ' ')}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Cari (Borçlu/Alacaklı)</Typography>
                                    <Typography fontWeight="bold">{tahsilat.cari?.unvan || '-'}</Typography>
                                </Grid>

                                {tahsilat.kasa && (
                                    <Grid size={{ xs: 6, md: 4 }}>
                                        <Typography color="text.secondary">Kasa</Typography>
                                        <Typography>{tahsilat.kasa.kasaAdi}</Typography>
                                    </Grid>
                                )}
                                {tahsilat.bankaHesap && (
                                    <Grid size={{ xs: 6, md: 4 }}>
                                        <Typography color="text.secondary">Banka Hesabı</Typography>
                                        <Typography>{tahsilat.bankaHesap.hesapAdi} ({tahsilat.bankaHesap.bankaAdi})</Typography>
                                    </Grid>
                                )}
                                {tahsilat.firmaKrediKarti && (
                                    <Grid size={{ xs: 6, md: 4 }}>
                                        <Typography color="text.secondary">Firma Kredi Kartı</Typography>
                                        <Typography>{tahsilat.firmaKrediKarti.kartAdi}</Typography>
                                    </Grid>
                                )}
                                {tahsilat.fatura && (
                                    <Grid size={{ xs: 6, md: 4 }}>
                                        <Typography color="text.secondary">İlgili Fatura No</Typography>
                                        <Typography>{tahsilat.fatura.faturaNo || '-'}</Typography>
                                    </Grid>
                                )}
                                <Grid size={{ xs: 12 }}>
                                    <Typography color="text.secondary">Açıklama</Typography>
                                    <Typography>{tahsilat.aciklama || '-'}</Typography>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>Hızlı İşlemler</Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                startIcon={<Print />}
                                onClick={() => window.open(`/tahsilat/print/${tahsilat.id}`)}
                            >
                                Makbuz Yazdır
                            </Button>
                        </Card>
                    </Grid>
                </Grid>

                <Card sx={{ mt: 3 }}>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Denetim Bilgileri
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Oluşturan</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {tahsilat.createdByUser?.fullName ?? tahsilat.createdByUser?.username ?? 'Sistem'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Oluşturma Tarihi</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {tahsilat.createdAt ? new Date(tahsilat.createdAt).toLocaleString('tr-TR') : '-'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Son Güncelleyen</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {tahsilat.updatedByUser?.fullName ?? tahsilat.updatedByUser?.username ?? '-'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Son Güncelleme</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {(tahsilat.updatedAt && tahsilat.updatedAt !== tahsilat.createdAt) ? new Date(tahsilat.updatedAt).toLocaleString('tr-TR') : '-'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Card>
            </Box>
        </MainLayout>
    );
}
