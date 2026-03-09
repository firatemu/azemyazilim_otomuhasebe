import React from 'react';
import { Box, Card, Typography, Grid, Button } from '@mui/material'; // Use Card
import {
    AddOutlined,
    ReceiptOutlined,
    PersonAddOutlined,
    Inventory2Outlined,
    PaymentOutlined,
    DescriptionOutlined,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function QuickActions() {
    const router = useRouter();

    const actions = [
        {
            title: 'Yeni Satış Faturası',
            icon: ReceiptOutlined,
            path: '/invoice/sales',
            color: 'var(--primary)',
        },
        {
            title: 'Yeni Cari Kartı',
            icon: PersonAddOutlined,
            path: '/account',
            color: 'var(--chart-2)',
        },
        {
            title: 'Stok Girişi',
            icon: Inventory2Outlined,
            path: '/product',
            color: 'var(--chart-3)',
        },
        {
            title: 'Tahsilat Ekle',
            icon: PaymentOutlined,
            path: '/cashbox',
            color: 'var(--chart-4)',
        },
        {
            title: 'Teklif Hazırla',
            icon: DescriptionOutlined,
            path: '/quote',
            color: 'var(--chart-5)',
        },
    ];

    return (
        <Card sx={{ height: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                    sx={{
                        width: 4,
                        height: 24,
                        borderRadius: '4px',
                        bgcolor: 'var(--secondary)',
                    }}
                />
                <Typography variant="h6">
                    Hızlı İşlemler
                </Typography>
            </Box>

            <Grid container spacing={2}>
                {actions.map((action, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => router.push(action.path)}
                            startIcon={<action.icon />}
                            sx={{
                                justifyContent: 'flex-start',
                                py: 1.5,
                                px: 2,
                                textAlign: 'left',
                                borderColor: 'var(--border)',
                                color: 'var(--foreground)',
                                bgcolor: 'transparent',
                                borderRadius: '12px',
                                '&:hover': {
                                    bgcolor: 'var(--muted)',
                                    borderColor: action.color,
                                    color: action.color,
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'var(--shadow-sm)',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {action.title}
                        </Button>
                    </Grid>
                ))}
                <Grid size={{ xs: 12 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => router.push('/invoice/sales')}
                        startIcon={<AddOutlined />}
                        sx={{
                            mt: 1,
                            py: 1.5,
                            borderRadius: '12px',
                        }}
                    >
                        Hızlı Fatura Oluştur
                    </Button>
                </Grid>
            </Grid>
        </Card>
    );
}
