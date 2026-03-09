'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Typography,
    Chip,
    Grid,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ArrowBack,
    ExpandMore,
    TrendingUp,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

export default function GelenHavaleDetayPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params as { id: string };

    const [havale, setHavale] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchHavaleDetay = async () => {
        try {
            const response = await axios.get(`/banka-havale/${id}`);
            setHavale(response.data);
        } catch (error) {
            console.error('Gelen Havale detay yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchHavaleDetay();
    }, [id]);

    if (loading || !havale) return <Box p={3}>Yükleniyor...</Box>;

    return (
        <MainLayout>
            <Box p={3}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <IconButton onClick={() => router.back()}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold">
                        Gelen Havale Detayı
                    </Typography>
                    <Chip
                        icon={<TrendingUp fontSize="small" />}
                        label="Gelen Transfer"
                        color="success"
                        variant="outlined"
                    />
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Card sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" mb={2}>Temel Bilgiler</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <Typography color="text.secondary">Tarih</Typography>
                                    <Typography fontWeight="bold">{new Date(havale.tarih).toLocaleDateString('tr-TR')}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <Typography color="text.secondary">Tutar</Typography>
                                    <Typography fontWeight="bold" variant="h6" color="success.main">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(havale.tutar)}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <Typography color="text.secondary">Banka Hesabı</Typography>
                                    <Typography fontWeight="bold">{havale.bankaHesabi?.bankaAdi} - {havale.bankaHesabi?.kasaAdi}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {havale.bankaHesabi?.hesapNo ? `Hesap No: ${havale.bankaHesabi.hesapNo}` : `IBAN: ${havale.bankaHesabi?.iban}`}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <Typography color="text.secondary">Cari</Typography>
                                    <Typography fontWeight="bold">{havale.cari?.unvan || '-'}</Typography>
                                    <Typography variant="caption" color="text.secondary">{havale.cari?.cariKodu}</Typography>
                                </Grid>

                                <Grid size={{ xs: 6, md: 12 }}>
                                    <Typography color="text.secondary">Referans No / Dekont</Typography>
                                    <Typography>{havale.referansNo || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography color="text.secondary">Açıklama</Typography>
                                    <Typography>{havale.aciklama || '-'}</Typography>
                                </Grid>
                            </Grid>
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
                                        {havale.createdByUser?.fullName ?? havale.createdByUser?.username ?? 'Sistem'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Oluşturma Tarihi</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {havale.createdAt ? new Date(havale.createdAt).toLocaleString('tr-TR') : '-'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Son Güncelleyen</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {havale.updatedByUser?.fullName ?? havale.updatedByUser?.username ?? '-'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Son Güncelleme</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {(havale.updatedAt && havale.updatedAt !== havale.createdAt) ? new Date(havale.updatedAt).toLocaleString('tr-TR') : '-'}
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
