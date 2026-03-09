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
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
} from '@mui/material';
import {
    Add,
    History,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

// Tipler
interface Avans {
    id: string;
    personelId: string;
    personel: {
        id: string;
        ad: string;
        soyad: string;
        personelKodu: string;
    };
    tutar: number;
    tarih: string;
    aciklama: string;
    kasaId: string;
    kasa: {
        id: string;
        kasaAdi: string;
    };
    mahsupEdilen: number;
    kalan: number;
    durum: 'ACIK' | 'KISMI' | 'KAPALI';
}

const AvansVerDialog = React.memo(({ open, onClose, personelList, kasalar, onSave }: any) => {
    const [formData, setFormData] = useState({
        personelId: '',
        tutar: '',
        tarih: new Date().toISOString().split('T')[0],
        kasaId: '',
        aciklama: ''
    });

    const handleSubmit = () => {
        if (!formData.personelId) return alert('Personel seçiniz');
        if (!formData.tutar || Number(formData.tutar) <= 0) return alert('Geçerli tutar giriniz');
        if (!formData.kasaId) return alert('Kasa seçiniz');

        onSave({
            ...formData,
            tutar: Number(formData.tutar)
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle component="div">Avans Ver</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Personel</InputLabel>
                        <Select
                            value={formData.personelId}
                            label="Personel"
                            onChange={(e) => setFormData({ ...formData, personelId: e.target.value })}
                            autoFocus
                        >
                            {personelList.map((p: any) => (
                                <MenuItem key={p.id} value={p.id}>{p.ad} {p.soyad}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Tutar"
                        type="number"
                        value={formData.tutar}
                        onChange={(e) => setFormData({ ...formData, tutar: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        type="date"
                        label="Tarih"
                        value={formData.tarih}
                        onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Ödeme Kasası</InputLabel>
                        <Select
                            value={formData.kasaId}
                            label="Ödeme Kasası"
                            onChange={(e) => setFormData({ ...formData, kasaId: e.target.value })}
                        >
                            {kasalar.map((k: any) => (
                                <MenuItem key={k.id} value={k.id}>{k.kasaAdi} (₺{k.bakiye})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Açıklama"
                        value={formData.aciklama}
                        onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                        multiline
                        rows={2}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>İptal</Button>
                <Button variant="contained" onClick={handleSubmit}>Kaydet</Button>
            </DialogActions>
        </Dialog>
    );
});

const MahsuplastirDialog = React.memo(({ open, onClose, avans, plans, onSave }: any) => {
    // Basitçe o personelin o yılki planlarından birini seçtirip düşelim
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [tutar, setTutar] = useState(0);

    useEffect(() => {
        if (open && avans) {
            setTutar(Number(avans.kalan));
        }
    }, [open, avans]);

    const handleSubmit = () => {
        if (!selectedPlanId) return alert('Dönem seçiniz');
        if (tutar <= 0 || tutar > Number(avans.kalan)) return alert('Geçersiz tutar');

        // Backend tek seferde çoklu plan destekliyor ama arayüzde basitlik için tek tek seçtirelim
        onSave({
            avansId: avans.id,
            planlar: [
                {
                    planId: selectedPlanId,
                    tutar: tutar,
                    aciklama: 'Avans Mahsup'
                }
            ]
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle component="div">Avans Mahsuplaştır</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <Typography variant="body2">
                        {avans?.personel?.ad} {avans?.personel?.soyad} - Kalan Avans: ₺{Number(avans?.kalan || 0).toLocaleString()}
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel>Hangi Maaştan Düşülecek?</InputLabel>
                        <Select
                            value={selectedPlanId}
                            label="Hangi Maaştan Düşülecek?"
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            autoFocus
                        >
                            {plans.map((p: any) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.yil}/{p.ay} - Kalan Maaş: ₺{Number(p.kalanTutar).toLocaleString()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Düşülecek Tutar"
                        type="number"
                        value={tutar}
                        onChange={(e: any) => setTutar(Number(e.target.value))}
                        helperText={`Maksimum: ₺${Number(avans?.kalan || 0).toLocaleString()}`}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>İptal</Button>
                <Button variant="contained" onClick={handleSubmit}>Mahsuplaştır</Button>
            </DialogActions>
        </Dialog>
    );
});

export default function AvansPage() {
    const [avanslar, setAvanslar] = useState<Avans[]>([]);
    const [personelId, setPersonelId] = useState(''); // Filtre için
    const [personelList, setPersonelList] = useState<any[]>([]);
    const [kasalar, setKasalar] = useState<any[]>([]);

    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openMahsupDialog, setOpenMahsupDialog] = useState(false);
    const [selectedAvans, setSelectedAvans] = useState<Avans | null>(null);
    const [personelPlans, setPersonelPlans] = useState<any[]>([]); // Mahsup için personelin planları

    useEffect(() => {
        fetchLists();
        if (personelId) {
            fetchAvanslar(personelId);
        }
    }, [personelId]);

    const fetchLists = async () => {
        const [pRes, kRes] = await Promise.all([
            axios.get('/employee?aktif=true'),
            axios.get('/cashbox?aktif=true')
        ]);
        setPersonelList(pRes.data);
        setKasalar(kRes.data);
    };

    const fetchAvanslar = async (pId: string) => {
        try {
            const res = await axios.get(`/avans/personel/${pId}`);
            setAvanslar(res.data);
        } catch (error) {
            console.error('Avanslar yüklenemedi');
        }
    };

    const fetchPersonelPlans = async (pId: string) => {
        // Şimdiki yılın planlarını çekelim
        try {
            const yil = new Date().getFullYear();
            const res = await axios.get(`/maas-plan/personel/${pId}/${yil}`);
            setPersonelPlans(res.data.planlar || []);
        } catch (error) {
            console.error("Planlar çekilemedi");
        }
    };

    const handleOpenMahsup = async (avans: Avans) => {
        setSelectedAvans(avans);
        await fetchPersonelPlans(avans.personelId);
        setTimeout(() => setOpenMahsupDialog(true), 0);
    };

    const handleCreateAvans = async (data: any) => {
        try {
            await axios.post('/avans/create', data);
            setOpenCreateDialog(false);
            // Avans verilen personeli yenile
            if (personelId === data.personelId) {
                fetchAvanslar(personelId);
            }
            alert('Avans verildi');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Hata oluştu');
        }
    };

    const handleMahsuplastir = async (data: any) => {
        try {
            await axios.post('/avans/mahsuplastir', data);
            setOpenMahsupDialog(false);
            if (selectedAvans) fetchAvanslar(selectedAvans.personelId);
            alert('Mahsuplaştırma başarılı');
        } catch (error: any) {
            alert('Hata oluştu');
        }
    }

    // State lifting sorunu olmaması için create form data'sını yukarıda değil dialog içinde tuttuk
    // Ancak refresh için personelId kontrolü lazım, neyse şimdilik manuel refresh yaparız.

    return (
        <MainLayout>
            <Box sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">Avans Yönetimi</Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setTimeout(() => setOpenCreateDialog(true), 0)}
                    >
                        Avans Ver
                    </Button>
                </Stack>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Personel Seçiniz (Avansları Görmek İçin)</InputLabel>
                        <Select
                            value={personelId}
                            label="Personel Seçiniz (Avansları Görmek İçin)"
                            onChange={(e) => setPersonelId(e.target.value)}
                        >
                            {personelList.map((p: any) => (
                                <MenuItem key={p.id} value={p.id}>{p.ad} {p.soyad}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Paper>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tarih</TableCell>
                                <TableCell>Tutar</TableCell>
                                <TableCell>Kasa</TableCell>
                                <TableCell>Mahsup Edilen</TableCell>
                                <TableCell>Kalan</TableCell>
                                <TableCell>Durum</TableCell>
                                <TableCell>Açıklama</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {avanslar.map((avans) => (
                                <TableRow key={avans.id}>
                                    <TableCell>{new Date(avans.tarih).toLocaleDateString()}</TableCell>
                                    <TableCell>₺{Number(avans.tutar).toLocaleString()}</TableCell>
                                    <TableCell>{avans.kasa?.kasaAdi}</TableCell>
                                    <TableCell sx={{ color: 'success.main' }}>₺{Number(avans.mahsupEdilen).toLocaleString()}</TableCell>
                                    <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>₺{Number(avans.kalan).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={avans.durum}
                                            color={avans.durum === 'ACIK' ? 'error' : avans.durum === 'KISMI' ? 'warning' : 'success'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{avans.aciklama}</TableCell>
                                    <TableCell align="right">
                                        {avans.durum !== 'KAPALI' && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<History />}
                                                onClick={() => handleOpenMahsup(avans)}
                                            >
                                                Mahsuplaştır
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {avanslar.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        {personelId ? 'Bu personelin avansı yok' : 'Listelemek için personel seçiniz'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <AvansVerDialog
                    open={openCreateDialog}
                    onClose={() => setOpenCreateDialog(false)}
                    personelList={personelList}
                    kasalar={kasalar}
                    onSave={handleCreateAvans}
                />

                <MahsuplastirDialog
                    open={openMahsupDialog}
                    onClose={() => setOpenMahsupDialog(false)}
                    avans={selectedAvans}
                    plans={personelPlans}
                    onSave={handleMahsuplastir}
                />

            </Box>
        </MainLayout>
    );
}
