import React, { useState } from 'react';
import { Box, Card, Typography, Tabs, Tab, Button } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ArrowForward, DescriptionOutlined, PaymentOutlined } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface RecentTransactionsProps {
    invoices: Array<any>;
    payments: Array<any>;
    loading: boolean;
}

export default function RecentTransactions({ invoices, payments, loading }: RecentTransactionsProps) {
    const [tabValue, setTabValue] = useState(0);
    const router = useRouter();

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const invoiceColumns: GridColDef[] = [
        {
            field: 'unvan',
            headerName: 'Cari',
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={500}>{params.value}</Typography>
                </Box>
            ),
        },
        {
            field: 'tarih',
            headerName: 'Tarih',
            width: 100,
            valueFormatter: (params) => {
                if (!params.value) return '-';
                return new Date(params.value).toLocaleDateString('tr-TR');
            },
        },
        {
            field: 'tutar',
            headerName: 'Tutar',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700}>
                    ₺{Number(params.value).toLocaleString('tr-TR')}
                </Typography>
            ),
        },
    ];

    const paymentColumns: GridColDef[] = [
        {
            field: 'cariAdi',
            headerName: 'Cari / Banka',
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={500}>{params.value || 'Kasa Hareketi'}</Typography>
                </Box>
            ),
        },
        {
            field: 'tarih',
            headerName: 'Tarih',
            width: 100,
            valueFormatter: (params) => {
                if (!params.value) return '-';
                return new Date(params.value).toLocaleDateString('tr-TR');
            },
        },
        {
            field: 'tutar',
            headerName: 'Tutar',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700} sx={{ color: params.row.tur === 'GIRIS' ? 'var(--chart-3)' : 'var(--destructive)' }}>
                    {params.row.tur === 'GIRIS' ? '+' : '-'}₺{Number(params.value).toLocaleString('tr-TR')}
                </Typography>
            ),
        },
    ];

    return (
        <Card sx={{ height: '100%', p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 4,
                            height: 24,
                            borderRadius: '4px',
                            bgcolor: 'var(--primary)',
                        }}
                    />
                    <Box>
                        <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                            Son Hareketler
                        </Typography>
                    </Box>
                </Box>
                <Button
                    endIcon={<ArrowForward />}
                    size="small"
                    onClick={() => router.push(tabValue === 0 ? '/invoice' : '/cashbox')}
                    sx={{ color: 'text.secondary' }}
                >
                    Tümünü Gör
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, mt: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Son Faturalar" />
                    <Tab label="Son Ödemeler" />
                </Tabs>
            </Box>

            <Box sx={{ flex: 1, width: '100%', minHeight: 300 }}>
                {tabValue === 0 && (
                    <DataGrid
                        rows={invoices}
                        columns={invoiceColumns}
                        loading={loading}
                        getRowId={(row) => row.id}
                        hideFooter
                        disableColumnMenu
                        sx={{ border: 'none' }}
                    />
                )}
                {tabValue === 1 && (
                    <DataGrid
                        rows={payments}
                        columns={paymentColumns}
                        loading={loading}
                        getRowId={(row) => row.id}
                        hideFooter
                        disableColumnMenu
                        sx={{ border: 'none' }}
                    />
                )}
            </Box>
        </Card>
    );
}
