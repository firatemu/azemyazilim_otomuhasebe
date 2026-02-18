'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    FormControlLabel,
    Checkbox,
    Button,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridToolbar,
} from '@mui/x-data-grid';
import {
    Visibility,
    History,
    Payment,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import MainLayout from '@/components/Layout/MainLayout';

export default function CekSenetPage() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Tahsilat Dialog State
    const [openTahsilat, setOpenTahsilat] = useState(false);
    const [selectedCek, setSelectedCek] = useState<any>(null);
    const [tahsilatForm, setTahsilatForm] = useState({
        tarih: new Date().toISOString().split('T')[0],
        tutar: 0,
        hedef: 'KASA' as 'KASA' | 'BANKA',
        kasaId: '',
        bankaHesapId: '',
        aciklama: '',
    });

    // Seçenekler
    const [kasalar, setKasalar] = useState<any[]>([]);
    const [bankalar, setBankalar] = useState<any[]>([]);

    const fetchCekSenet = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/cek-senet');
            setRows(response.data);
        } catch (error) {
            console.error('Çek/Senet yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFinansData = async () => {
        try {
            const [kasaRes, bankaRes] = await Promise.all([
                axios.get('/kasa'),
                axios.get('/banka-hesap')
            ]);
            setKasalar(kasaRes.data);
            setBankalar(bankaRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCekSenet();
        fetchFinansData();
    }, []);

    const handleOpenTahsilat = (cek: any) => {
        setSelectedCek(cek);
        setTahsilatForm({
            tarih: new Date().toISOString().split('T')[0],
            tutar: Number(cek.kalanTutar),
            hedef: 'KASA',
            kasaId: '',
            bankaHesapId: '',
            aciklama: `${cek.evrakNo} Tahsilatı`,
        });
        setOpenTahsilat(true);
    };

    const handleTahsilatYap = async () => {
        if (tahsilatForm.tutar <= 0) return;
        if (tahsilatForm.hedef === 'KASA' && !tahsilatForm.kasaId) {
            enqueueSnackbar('Lütfen kasa seçiniz', { variant: 'warning' });
            return;
        }
        if (tahsilatForm.hedef === 'BANKA' && !tahsilatForm.bankaHesapId) {
            enqueueSnackbar('Lütfen banka hesabı seçiniz', { variant: 'warning' });
            return;
        }

        try {
            await axios.post('/cek-senet/islem', {
                cekSenetId: selectedCek.id,
                yeniDurum: 'TAHSIL', // Backend kalan tutara göre otomatik PORTFOY/TAHSIL ayarlar ama yine de gönderiyoruz
                tarih: tahsilatForm.tarih,
                aciklama: tahsilatForm.aciklama,
                islemTutari: tahsilatForm.tutar,
                kasaId: tahsilatForm.hedef === 'KASA' ? tahsilatForm.kasaId : undefined,
                bankaHesapId: tahsilatForm.hedef === 'BANKA' ? tahsilatForm.bankaHesapId : undefined,
            });
            enqueueSnackbar('Tahsilat başarılı', { variant: 'success' });
            setOpenTahsilat(false);
            fetchCekSenet(); // Listeyi yenile
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Hata oluştu', { variant: 'error' });
        }
    };

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

    const columns: GridColDef[] = [
        { field: 'evrakNo', headerName: 'Evrak No', width: 130 },
        {
            field: 'tip',
            headerName: 'Tip',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value?.replace('_', ' ')}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'vadeTarihi',
            headerName: 'Vade Tarihi',
            width: 120,
            type: 'date',
            valueGetter: (params: any) => params.row.vadeTarihi ? new Date(params.row.vadeTarihi) : (params.row.vade ? new Date(params.row.vade) : null)
        },
        {
            field: 'tutar',
            headerName: 'Tutar',
            width: 130,
            type: 'number',
            valueFormatter: (params: any) => {
                return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(params.value);
            }
        },
        {
            field: 'kalanTutar',
            headerName: 'Kalan',
            width: 130,
            type: 'number',
            valueFormatter: (params: any) => {
                return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(params.value);
            }
        },
        {
            field: 'durum',
            headerName: 'Durum',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getDurumColor(params.value) as any}
                    size="small"
                />
            )
        },
        { field: 'borclu', headerName: 'Borçlu / Keşideci', width: 200 },
        { field: 'banka', headerName: 'Banka', width: 150 },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <Tooltip title="Detay">
                        <IconButton size="small" onClick={() => router.push(`/cek-senet/${params.row.id}`)}>
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {/* Portföyde veya Kısmi Tahsil ise Tahsil Et butonu göster */}
                    {(params.row.durum === 'PORTFOYDE' || (params.row.kalanTutar > 0 && !['CIRO_EDILDI', 'BANKA_TEMINATTA', 'AVUKAT_TAKIBINDE'].includes(params.row.durum))) && (
                        <Tooltip title="Tahsil Et">
                            <IconButton size="small" color="success" onClick={() => handleOpenTahsilat(params.row)}>
                                <Payment fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            ),
        },
    ];

    return (
        <MainLayout>
            <Box p={3}>
                <Typography variant="h5" mb={3} fontWeight="bold">
                    Çek/Senet Listesi (Portföy)
                </Typography>

                <Card sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                            },
                        }}
                        disableRowSelectionOnClick
                    />
                </Card>

                {/* Tahsilat Dialog */}
                <Dialog open={openTahsilat} onClose={() => setOpenTahsilat(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Tahsilat İşlemi - {selectedCek?.evrakNo}</DialogTitle>
                    <DialogContent dividers>
                        <Box display="flex" flexDirection="column" gap={2} pt={1}>
                            <Typography variant="body2" color="text.secondary">
                                Toplam Tutar: {selectedCek?.tutar} TL <br />
                                Kalan Tutar: <b>{selectedCek?.kalanTutar} TL</b>
                            </Typography>

                            <TextField
                                label="İşlem Tarihi"
                                type="date"
                                value={tahsilatForm.tarih}
                                onChange={(e) => setTahsilatForm({ ...tahsilatForm, tarih: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />

                            <TextField
                                label="Tahsil Edilecek Tutar"
                                type="number"
                                value={tahsilatForm.tutar}
                                onChange={(e) => setTahsilatForm({ ...tahsilatForm, tutar: Number(e.target.value) })}
                                fullWidth
                            />

                            <FormControl fullWidth>
                                <InputLabel>Hedef Hesap</InputLabel>
                                <Select
                                    value={tahsilatForm.hedef}
                                    label="Hedef Hesap"
                                    onChange={(e) => setTahsilatForm({ ...tahsilatForm, hedef: e.target.value as any })}
                                >
                                    <MenuItem value="KASA">Kasa (Nakit)</MenuItem>
                                    <MenuItem value="BANKA">Banka Hesabı</MenuItem>
                                </Select>
                            </FormControl>

                            {tahsilatForm.hedef === 'KASA' && (
                                <FormControl fullWidth>
                                    <InputLabel>Kasa Seçiniz</InputLabel>
                                    <Select
                                        value={tahsilatForm.kasaId}
                                        label="Kasa Seçiniz"
                                        onChange={(e) => setTahsilatForm({ ...tahsilatForm, kasaId: e.target.value })}
                                    >
                                        {kasalar.map(k => (
                                            <MenuItem key={k.id} value={k.id}>{k.ad} ({k.bakiye} TL)</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {tahsilatForm.hedef === 'BANKA' && (
                                <FormControl fullWidth>
                                    <InputLabel>Banka Hesabı Seçiniz</InputLabel>
                                    <Select
                                        value={tahsilatForm.bankaHesapId}
                                        label="Banka Hesabı Seçiniz"
                                        onChange={(e) => setTahsilatForm({ ...tahsilatForm, bankaHesapId: e.target.value })}
                                    >
                                        {bankalar.map(b => (
                                            <MenuItem key={b.id} value={b.id}>{b.bankaAdi} - {b.subeAdi} ({b.bakiye} TL)</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <TextField
                                label="Açıklama"
                                value={tahsilatForm.aciklama}
                                onChange={(e) => setTahsilatForm({ ...tahsilatForm, aciklama: e.target.value })}
                                multiline
                                rows={2}
                                fullWidth
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenTahsilat(false)}>İptal</Button>
                        <Button onClick={handleTahsilatYap} variant="contained" color="success">
                            Tahsil Et
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MainLayout>
    );
}
