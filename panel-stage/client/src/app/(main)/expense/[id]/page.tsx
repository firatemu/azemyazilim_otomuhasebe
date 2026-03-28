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
    Category,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

export default function MasrafDetayPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params as { id: string };

    const [masraf, setMasraf] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchMasrafDetay = async () => {
        try {
            const response = await axios.get(`/expenses/${id}`);
            setMasraf(response.data);
        } catch (error) {
            console.error('Masraf detay yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchMasrafDetay();
    }, [id]);

    if (loading || !masraf) return <Box p={3}>Yükleniyor...</Box>;

    return (
        <MainLayout>
            <Box p={3}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <IconButton onClick={() => router.back()}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold">
                        Masraf Detayı
                    </Typography>
                    <Chip
                        icon={<Category fontSize="small" />}
                        label={masraf.kategori?.kategoriAdi || 'Kategorisiz'}
                        color="secondary"
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
                                    <Typography fontWeight="bold">{new Date(masraf.tarih).toLocaleDateString('tr-TR')}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <Typography color="text.secondary">Tutar</Typography>
                                    <Typography fontWeight="bold" variant="h6" color="error.main">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(masraf.tutar)}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <Typography color="text.secondary">Ödeme Tipi</Typography>
                                    <Typography fontWeight="bold">{masraf.odemeTipi?.replace('_', ' ')}</Typography>
                                </Grid>

                                {masraf.kasa && (
                                    <Grid size={{ xs: 6, md: 3 }}>
                                        <Typography color="text.secondary">Kasa</Typography>
                                        <Typography>{masraf.kasa.kasaAdi}</Typography>
                                    </Grid>
                                )}
                                {masraf.bankaHesap && (
                                    <Grid size={{ xs: 6, md: 3 }}>
                                        <Typography color="text.secondary">Banka Hesabı</Typography>
                                        <Typography>{masraf.bankaHesap.hesapAdi} ({masraf.bankaHesap.bankaAdi})</Typography>
                                    </Grid>
                                )}
                                {masraf.firmaKrediKarti && (
                                    <Grid size={{ xs: 6, md: 3 }}>
                                        <Typography color="text.secondary">Firma Kredi Kartı</Typography>
                                        <Typography>{masraf.firmaKrediKarti.kartAdi}</Typography>
                                    </Grid>
                                )}
                                <Grid size={{ xs: 12 }}>
                                    <Typography color="text.secondary">Açıklama</Typography>
                                    <Typography>{masraf.aciklama || '-'}</Typography>
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
                                        {masraf.createdByUser?.fullName ?? masraf.createdByUser?.username ?? 'Sistem'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Oluşturma Tarihi</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {masraf.createdAt ? new Date(masraf.createdAt).toLocaleString('tr-TR') : '-'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Son Güncelleyen</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {masraf.updatedByUser?.fullName ?? masraf.updatedByUser?.username ?? '-'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Son Güncelleme</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {(masraf.updatedAt && masraf.updatedAt !== masraf.createdAt) ? new Date(masraf.updatedAt).toLocaleString('tr-TR') : '-'}
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
