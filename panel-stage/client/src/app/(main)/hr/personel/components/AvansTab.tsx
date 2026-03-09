'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Stack,
    CircularProgress,
} from '@mui/material';
import {
    Add,
    History,
} from '@mui/icons-material';
import axios from '@/lib/axios';

interface Avans {
    id: string;
    tutar: number;
    tarih: string;
    aciklama: string;
    kasa?: {
        kasaAdi: string;
    };
    mahsupEdilen: number;
    kalan: number;
    durum: 'ACIK' | 'KISMI' | 'KAPALI';
}

export default function AvansTab({ personelId }: { personelId: string }) {
    const [avanslar, setAvanslar] = useState<Avans[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAvanslar();
    }, [personelId]);

    const fetchAvanslar = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/avans/personel/${personelId}`);
            setAvanslar(res.data);
        } catch (error) {
            console.error('Avanslar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Avans Hareketleri</Typography>
            </Stack>

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Tutar</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Mahsup</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Kalan</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {avanslar.map((avans) => (
                            <TableRow key={avans.id} hover>
                                <TableCell>{new Date(avans.tarih).toLocaleDateString()}</TableCell>
                                <TableCell align="right">₺{Number(avans.tutar).toLocaleString()}</TableCell>
                                <TableCell align="right" sx={{ color: 'success.main' }}>₺{Number(avans.mahsupEdilen).toLocaleString()}</TableCell>
                                <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>₺{Number(avans.kalan).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={avans.durum}
                                        color={avans.durum === 'ACIK' ? 'error' : avans.durum === 'KISMI' ? 'warning' : 'success'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{avans.aciklama}</TableCell>
                            </TableRow>
                        ))}
                        {avanslar.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    Kayıtlı avans bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
