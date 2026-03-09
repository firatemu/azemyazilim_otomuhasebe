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
    IconButton,
    Tooltip,
    Stack,
    CircularProgress,
} from '@mui/material';
import {
    Add,
    Visibility,
    Receipt,
} from '@mui/icons-material';
import axios from '@/lib/axios';

interface MaasPlan {
    id: string;
    yil: number;
    ay: number;
    maas: number;
    prim: number;
    toplam: number;
    odenenTutar: number;
    kalanTutar: number;
    durum: 'ODENMEDI' | 'KISMI_ODENDI' | 'TAMAMEN_ODENDI';
}

export default function MaasTab({ personelId }: { personelId: string }) {
    const [plans, setPlans] = useState<MaasPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [yil] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchPlans();
    }, [personelId]);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/maas-plan/personel/${personelId}/${yil}`);
            setPlans(response.data.planlar || []);
        } catch (error) {
            console.error('Planlar yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async () => {
        try {
            await axios.post('/maas-plan/create', {
                personelId,
                yil,
            });
            fetchPlans();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Plan oluşturulurken hata oluştu');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Maaş Planları ({yil})</Typography>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={handleCreatePlan}
                >
                    Yeni Plan Oluştur
                </Button>
            </Stack>

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Dönem</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Maaş</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Prim</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Ödenen</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Kalan</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id} hover>
                                <TableCell>{plan.yil} / {plan.ay}</TableCell>
                                <TableCell align="right">₺{Number(plan.maas).toLocaleString()}</TableCell>
                                <TableCell align="right">₺{Number(plan.prim).toLocaleString()}</TableCell>
                                <TableCell align="right">₺{Number(plan.toplam).toLocaleString()}</TableCell>
                                <TableCell align="right" sx={{ color: 'success.main' }}>₺{Number(plan.odenenTutar).toLocaleString()}</TableCell>
                                <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>₺{Number(plan.kalanTutar).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={plan.durum.replace('_', ' ')}
                                        color={
                                            plan.durum === 'TAMAMEN_ODENDI' ? 'success' :
                                                plan.durum === 'KISMI_ODENDI' ? 'warning' : 'error'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {plans.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    Bu yıl için henüz maaş planı oluşturulmamış.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
