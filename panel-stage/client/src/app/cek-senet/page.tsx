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
    Payment,
    Edit,
    Delete,
    Download as DownloadIcon,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import MainLayout from '@/components/Layout/MainLayout';

export default function CekSenetPage() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [rows, setRows] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
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

    // Düzenleme Dialog State
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedEdit, setSelectedEdit] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        evrakNo: '',
        vadeTarihi: '',
        banka: '',
        sube: '',
        hesapNo: '',
        aciklama: '',
    });
    const [editSaving, setEditSaving] = useState(false);

    // Silme onay
    const [openDelete, setOpenDelete] = useState(false);
    const [cekToDelete, setCekToDelete] = useState<any>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Seçenekler
    const [kasalar, setKasalar] = useState<any[]>([]);
    const [bankalar, setBankalar] = useState<any[]>([]);

    const fetchCekSenet = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/cek-senet');
            const data = response.data?.data ?? response.data;
            setRows(Array.isArray(data) ? data : []);
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
            aciklama: `${cek.cekNo || cek.seriNo || 'Çek/Senet'} Tahsilatı`,
        });
        setOpenTahsilat(true);
    };

    const handleOpenEdit = (row: any) => {
        const vade = row.vade ?? row.vadeTarihi;
        setSelectedEdit(row);
        setEditForm({
            evrakNo: row.cekNo ?? row.seriNo ?? row.evrakNo ?? '',
            vadeTarihi: vade ? new Date(vade).toISOString().split('T')[0] : '',
            banka: row.banka ?? '',
            sube: row.sube ?? '',
            hesapNo: row.hesapNo ?? '',
            aciklama: row.aciklama ?? '',
        });
        setOpenEdit(true);
    };

    const handleEditSave = async () => {
        if (!selectedEdit?.id) return;
        setEditSaving(true);
        try {
            await axios.put(`/cek-senet/${selectedEdit.id}`, {
                evrakNo: editForm.evrakNo || undefined,
                vadeTarihi: editForm.vadeTarihi || undefined,
                banka: editForm.banka || undefined,
                sube: editForm.sube || undefined,
                hesapNo: editForm.hesapNo || undefined,
                aciklama: editForm.aciklama || undefined,
            });
            enqueueSnackbar('Evrak güncellendi', { variant: 'success' });
            setOpenEdit(false);
            fetchCekSenet();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Güncelleme hatası', { variant: 'error' });
        } finally {
            setEditSaving(false);
        }
    };

    const handleOpenDelete = (row: any) => {
        setCekToDelete(row);
        setOpenDelete(true);
    };

    const handleDeleteConfirm = async () => {
        if (!cekToDelete?.id) return;
        setDeleteLoading(true);
        try {
            await axios.delete(`/cek-senet/${cekToDelete.id}`);
            enqueueSnackbar('Evrak silindi', { variant: 'success' });
            setOpenDelete(false);
            setCekToDelete(null);
            fetchCekSenet();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Silme hatası', { variant: 'error' });
        } finally {
            setDeleteLoading(false);
        }
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
                yeniDurum: 'TAHSIL_EDILDI', // Backend kalan tutara göre otomatik PORTFOY/TAHSIL_EDILDI ayarlar
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

    const handleExportExcel = () => {
        const exportData = rows.map((row) => ({
            'Evrak No': row.cekNo ?? row.seriNo ?? '—',
            'Tip': (row.tip?.replace('_', ' ') ?? '—').replace('CEK', 'ÇEK'),
            'Vade Tarihi': (row.vade ?? row.vadeTarihi) ? new Date(row.vade ?? row.vadeTarihi).toLocaleDateString('tr-TR') : '—',
            'Tutar': row.tutar != null ? Number(row.tutar) : 0,
            'Kalan Tutar': row.kalanTutar != null ? Number(row.kalanTutar) : 0,
            'Durum': row.durum ?? '—',
            'Borçlu / Keşideci': row.cari?.unvan ?? '—',
            'Banka': row.banka ?? '—'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        // Otomatik sütun genişliği ayarlama (opsiyonel)
        const colWidths = [
            { wpx: 120 }, { wpx: 150 }, { wpx: 120 },
            { wpx: 100 }, { wpx: 100 }, { wpx: 130 },
            { wpx: 250 }, { wpx: 150 }
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Cek_Senetler');
        XLSX.writeFile(workbook, `cek_senet_listesi_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        {
            field: 'evrakNo',
            headerName: 'Evrak No',
            width: 130,
            valueGetter: (value, row) => row?.cekNo ?? row?.seriNo ?? '—',
        },
        {
            field: 'tip',
            headerName: 'Tip',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value?.replace('_', ' ')?.replace('CEK', 'ÇEK')}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'vade',
            headerName: 'Vade Tarihi',
            width: 120,
            type: 'date',
            valueGetter: (value, row) => {
                const v = row?.vade ?? row?.vadeTarihi;
                return v ? new Date(v) : null;
            }
        },
        {
            field: 'tutar',
            headerName: 'Tutar',
            width: 130,
            type: 'number',
            valueGetter: (value, row) => {
                const t = row?.tutar;
                return t != null ? Number(t) : null;
            },
            valueFormatter: (value) => {
                const num = value != null ? Number(value) : NaN;
                return Number.isFinite(num) ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num) : '—';
            }
        },
        {
            field: 'kalanTutar',
            headerName: 'Kalan',
            width: 130,
            type: 'number',
            valueGetter: (value, row) => {
                const k = row?.kalanTutar;
                return k != null ? Number(k) : null;
            },
            valueFormatter: (value) => {
                const num = value != null ? Number(value) : NaN;
                return Number.isFinite(num) ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num) : '—';
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
        {
            field: 'borclu',
            headerName: 'Borçlu / Keşideci',
            width: 200,
            valueGetter: (value, row) => row?.cari?.unvan ?? '—',
        },
        { field: 'banka', headerName: 'Banka', width: 150, valueGetter: (value, row) => row?.banka ?? '—' },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <Tooltip title="Detay">
                        <IconButton size="small" onClick={() => router.push(`/cek-senet/${params.row.id}`)}>
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                        <IconButton size="small" onClick={() => handleOpenEdit(params.row)}>
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {(params.row.durum === 'PORTFOYDE' || (params.row.kalanTutar > 0 && !['CIRO_EDILDI', 'BANKA_TEMINATTA', 'AVUKAT_TAKIBINDE'].includes(params.row.durum))) && (
                        <Tooltip title="Tahsil Et">
                            <IconButton size="small" color="success" onClick={() => handleOpenTahsilat(params.row)}>
                                <Payment fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Sil">
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(params.row)}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    const filteredRows = React.useMemo(() => {
        if (!searchQuery) return rows;
        const lowerQuery = searchQuery.toLowerCase();
        return rows.filter((row) => {
            return (
                row.cekNo?.toLowerCase().includes(lowerQuery) ||
                row.seriNo?.toLowerCase().includes(lowerQuery) ||
                row.cari?.unvan?.toLowerCase().includes(lowerQuery) ||
                row.banka?.toLowerCase().includes(lowerQuery)
            );
        });
    }, [rows, searchQuery]);

    return (
        <MainLayout>
            <Box p={{ xs: 1, sm: 2, md: 3 }}>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={3}>
                    <Typography variant="h5" fontWeight="bold">
                        Çek/Senet Listesi (Portföy)
                    </Typography>
                    <Box display="flex" gap={2} width={{ xs: '100%', sm: 'auto' }} flexDirection={{ xs: 'column', sm: 'row' }}>
                        <TextField
                            size="small"
                            placeholder="Cari, Evrak No veya Banka Ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ width: { xs: '100%', sm: '300px' } }}
                        />
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportExcel}
                            sx={{ fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}
                        >
                            Excel İndir
                        </Button>
                    </Box>
                </Box>

                <Card sx={{ height: 650, width: '100%', overflowX: 'auto' }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns.map(col => ({ ...col, minWidth: col.width || 130 }))} // Min width for responsive scrolling
                        loading={loading}
                        slots={{ toolbar: GridToolbar }}
                        disableRowSelectionOnClick
                    />
                </Card>

                {/* Tahsilat Dialog */}
                {/* Düzenleme Dialog */}
                <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Evrak Düzenle - {selectedEdit?.cekNo ?? selectedEdit?.seriNo}</DialogTitle>
                    <DialogContent dividers>
                        <Box display="flex" flexDirection="column" gap={2} pt={1}>
                            <TextField
                                label="Evrak No"
                                value={editForm.evrakNo}
                                onChange={(e) => setEditForm({ ...editForm, evrakNo: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Vade Tarihi"
                                type="date"
                                value={editForm.vadeTarihi}
                                onChange={(e) => setEditForm({ ...editForm, vadeTarihi: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="Banka"
                                value={editForm.banka}
                                onChange={(e) => setEditForm({ ...editForm, banka: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Şube"
                                value={editForm.sube}
                                onChange={(e) => setEditForm({ ...editForm, sube: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Hesap No"
                                value={editForm.hesapNo}
                                onChange={(e) => setEditForm({ ...editForm, hesapNo: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Açıklama"
                                value={editForm.aciklama}
                                onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
                                multiline
                                rows={2}
                                fullWidth
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEdit(false)}>İptal</Button>
                        <Button onClick={handleEditSave} variant="contained" disabled={editSaving}>
                            {editSaving ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Silme Onay Dialog */}
                <Dialog open={openDelete} onClose={() => !deleteLoading && setOpenDelete(false)}>
                    <DialogTitle>Evrakı silmek istediğinize emin misiniz?</DialogTitle>
                    <DialogContent>
                        <Typography>
                            <strong>{cekToDelete?.cekNo ?? cekToDelete?.seriNo}</strong> numaralı evrak silinecek. Bu işlem geri alınamaz.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDelete(false)} disabled={deleteLoading}>İptal</Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleteLoading}>
                            {deleteLoading ? 'Siliniyor...' : 'Sil'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openTahsilat} onClose={() => setOpenTahsilat(false)} maxWidth="sm" fullWidth>
                    <DialogTitle component="div">Tahsilat İşlemi - {selectedCek?.cekNo ?? selectedCek?.seriNo}</DialogTitle>
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
