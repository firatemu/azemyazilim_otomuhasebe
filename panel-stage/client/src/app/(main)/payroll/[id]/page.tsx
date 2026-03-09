'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Typography,
    Button,
    Chip,
    IconButton,
    Tooltip,
    LinearProgress,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
} from '@mui/x-data-grid';
import { ArrowBack, Visibility } from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

const getDurumColor = (durum: string) => {
    switch (durum) {
        case 'PORTFOYDE': return 'info';
        case 'TAHSIL_EDILDI': return 'success';
        case 'CIRO_EDILDI': return 'warning';
        case 'ODENDI': return 'success';
        case 'KARSILIKSIZ': return 'error';
        case 'BANKA_TAHSILDE': return 'secondary';
        case 'BANKA_TEMINATTA': return 'secondary';
        case 'AVUKAT_TAKIBINDE': return 'error';
        case 'IADE_EDILDI': return 'default';
        default: return 'default';
    }
};

const BORDRO_TYPE_LABELS: Record<string, string> = {
    MUSTERI_EVRAK_GIRISI: 'Müşteri Evrak Girişi',
    IADE_BORDROSU: 'İade Bordrosu',
    BORC_EVRAK_CIKISI: 'Borç Evrak Çıkışı',
    CARIYE_EVRAK_CIROSU: 'Cariye Evrak Cirosu',
    BANKA_TAHSIL_CIROSU: 'Bankaya Tahsil Cirosu',
    BANKA_TEMINAT_CIROSU: 'Bankaya Teminat Cirosu',
};

const tipLabel = (tip: string) => {
    return BORDRO_TYPE_LABELS[tip] || tip?.replace?.(/_/g, ' ') || 'Bilinmeyen Bordro';
};

export default function BordroDetayPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [bordro, setBordro] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchBordro = async () => {
            try {
                const response = await axios.get(`/payroll/${id}`);
                console.log('Fetched Bordro Data:', response.data);
                setBordro(response.data);
            } catch (error) {
                console.error('Bordro yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBordro();
    }, [id]);

    const evraklar = bordro?.cekSenetler ?? [];
    const columns: GridColDef[] = [
        {
            field: 'cekNo',
            headerName: 'Evrak No',
            width: 140,
            valueGetter: (_, row) => row?.cekNo || row?.seriNo || '—',
        },
        {
            field: 'tip',
            headerName: 'Tip',
            width: 120,
            renderCell: (params) => (
                <Chip label={params.value?.replace?.(/_/g, ' ') ?? params.value} size="small" variant="outlined" />
            ),
        },
        {
            field: 'vade',
            headerName: 'Vade Tarihi',
            width: 120,
            type: 'dateTime',
            valueGetter: (value) => value ? new Date(value) : null,
            valueFormatter: (value) => value ? new Date(value).toLocaleDateString('tr-TR') : '—',
        },
        {
            field: 'tutar',
            headerName: 'Tutar',
            width: 130,
            valueGetter: (value) => (value != null ? Number(value) : null),
            valueFormatter: (value) => {
                const num = value != null ? Number(value) : NaN;
                return Number.isFinite(num) ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num) : '—';
            },
        },
        {
            field: 'kalanTutar',
            headerName: 'Kalan',
            width: 130,
            valueGetter: (value) => (value != null ? Number(value) : null),
            valueFormatter: (value) => {
                const num = value != null ? Number(value) : NaN;
                return Number.isFinite(num) ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num) : '—';
            },
        },
        {
            field: 'durum',
            headerName: 'Durum',
            width: 140,
            renderCell: (params) => (
                <Chip label={params.value ?? '—'} color={getDurumColor(params.value) as any} size="small" />
            ),
        },
        { field: 'banka', headerName: 'Banka', width: 150, valueGetter: (_, row) => row?.banka ?? '—' },
        {
            field: 'actions',
            headerName: 'İşlem',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Tooltip title="Çek/Senet detayı">
                    <IconButton size="small" color="primary" onClick={() => router.push(`/cek-senet/${params.row.id}`)}>
                        <Visibility fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    if (loading) {
        return (
            <MainLayout>
                <Box p={3}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography color="text.secondary">Yükleniyor...</Typography>
                </Box>
            </MainLayout>
        );
    }

    if (!bordro) {
        return (
            <MainLayout>
                <Box p={3}>
                    <Typography color="error">Bordro bulunamadı.</Typography>
                    <Button startIcon={<ArrowBack />} onClick={() => router.push('/payroll')} sx={{ mt: 2 }}>
                        Listeye dön
                    </Button>
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Box sx={{ maxWidth: '1600px', mx: 'auto', p: { xs: 1, md: 3 } }}>
                <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
                    <Button startIcon={<ArrowBack />} onClick={() => router.push('/payroll')} sx={{ fontWeight: 600 }}>
                        Listeye dön
                    </Button>
                </Box>

                <Card elevation={0} sx={{ mb: 3, p: 3, borderRadius: '16px', border: '1px solid var(--border)', bgcolor: 'var(--card)' }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>
                        Bordro bilgisi
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={3} mt={1}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Bordro No</Typography>
                            <Typography variant="h6" fontWeight={700}>{bordro.bordroNo}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">İşlem Tipi</Typography>
                            <Typography variant="body1" fontWeight={600}>{tipLabel(bordro.tip)}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">İşlem Tarihi</Typography>
                            <Typography variant="body1">
                                {bordro.tarih ? new Date(bordro.tarih).toLocaleDateString('tr-TR') : '—'}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Cari</Typography>
                            <Typography variant="body1" fontWeight={500}>{bordro.cari?.unvan ?? '—'}</Typography>
                        </Box>
                        {bordro.aciklama && (
                            <Box flex="1" minWidth={200}>
                                <Typography variant="caption" color="text.secondary">Açıklama</Typography>
                                <Typography variant="body2">{bordro.aciklama}</Typography>
                            </Box>
                        )}
                    </Box>
                </Card>

                <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid var(--border)', bgcolor: 'var(--card)', overflow: 'hidden' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid var(--border)' }}>
                        <Typography variant="h6" fontWeight={700}>
                            Bordrodaki evraklar ({evraklar.length})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Bu bordroya bağlı çek ve senetler. Detay için satırdaki göz ikonuna tıklayın.
                        </Typography>
                    </Box>
                    <Box sx={{ height: 420, width: '100%' }}>
                        <DataGrid
                            rows={evraklar}
                            columns={columns}
                            getRowId={(row) => row.id}
                            disableRowSelectionOnClick
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: 'var(--muted)',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                },
                                '& .MuiDataGrid-cell': { borderColor: 'var(--border)' },
                            }}
                        />
                    </Box>
                </Card>
            </Box>
        </MainLayout>
    );
}
