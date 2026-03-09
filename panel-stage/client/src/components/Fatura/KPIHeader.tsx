'use client';

import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import { TrendingUp, TrendingDown, HourglassEmpty, Dangerous } from '@mui/icons-material';

interface StatsProps {
    loading: boolean;
    data: {
        aylikSatis: { tutar: number; adet: number };
        tahsilatBekleyen: { tutar: number; adet: number };
        vadesiGecmis: { tutar: number; adet: number };
    } | null;
    type: 'SATIS' | 'ALIS';
}

export default function KPIHeader({ loading, data, type }: StatsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const isSatis = type === 'SATIS';

    const cards = [
        {
            title: isSatis ? 'Bu Ay Satış' : 'Bu Ay Alış',
            value: data?.aylikSatis?.tutar || 0,
            count: data?.aylikSatis?.adet || 0,
            icon: isSatis ? <TrendingUp /> : <TrendingDown />,
            color: isSatis ? '#10b981' : '#f59e0b', // emerald-500 : amber-500
            bgColor: isSatis ? 'color-mix(in srgb, var(--chart-3) 15%, transparent)' : 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
        },
        {
            title: isSatis ? 'Tahsilat Bekleyen' : 'Ödeme Bekleyen',
            value: data?.tahsilatBekleyen?.tutar || 0,
            count: data?.tahsilatBekleyen?.adet || 0,
            icon: <HourglassEmpty />,
            color: '#3b82f6', // blue-500
            bgColor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)',
        },
        {
            title: 'Vadesi Geçmiş',
            value: data?.vadesiGecmis?.tutar || 0,
            count: data?.vadesiGecmis?.adet || 0,
            icon: <Dangerous />,
            color: '#ef4444', // red-500
            bgColor: 'color-mix(in srgb, var(--destructive) 15%, transparent)',
        },
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            {cards.map((card, index) => (
                <Grid key={index} size={{ xs: 12, md: 4 }}>
                    <Card
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            height: '100%',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            },
                        }}
                    >
                        <CardContent sx={{ p: '20px !important' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
                                        {card.title}
                                    </Typography>
                                    {loading ? (
                                        <Skeleton width={120} height={40} />
                                    ) : (
                                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', letterSpacing: '-0.5px' }}>
                                            {formatCurrency(card.value)}
                                        </Typography>
                                    )}
                                    {loading ? (
                                        <Skeleton width={80} height={20} />
                                    ) : (
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                            {card.count} {isSatis ? 'fatura' : 'işlem'}
                                        </Typography>
                                    )}
                                </Box>
                                <Box
                                    sx={{
                                        background: card.bgColor,
                                        color: card.color,
                                        borderRadius: 2,
                                        p: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {card.icon}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}