'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import {
    Box,
    Card,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Divider,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    Avatar,
    Stack,
    Chip,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRowSelectionModel
} from '@mui/x-data-grid';
import {
    Delete,
    Save,
    ArrowBack,
    ArrowForward,
    CheckCircle,
    AccountBalance,
    Description,
    ConfirmationNumber,
    Layers,
    PostAdd
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import MainLayout from '@/components/Layout/MainLayout';

interface CekFormData {
    evrakNo: string;
    vadeTarihi: string;
    tutar: number;
    tip: 'MUSTERI_CEK' | 'MUSTERI_SENET' | 'KENDI_CEKIMIZ' | 'KENDI_SENEDIMIZ';
    banka: string;
    sube: string;
    hesapNo: string;
    borclu: string;
}

const initialCekForm: CekFormData = {
    evrakNo: '',
    vadeTarihi: '',
    tutar: 0,
    tip: 'CEK',
    banka: '',
    sube: '',
    hesapNo: '',
    borclu: '',
};

const BORDRO_TIP_LABELS: Record<string, string> = {
    MUSTERI_EVRAK_GIRISI: 'Müşteri Evrak Girişi',
    BANKA_TAHSIL_CIROSU: 'Bankaya Tahsil Cirosu',
    BANKA_TEMINAT_CIROSU: 'Bankaya Teminat Cirosu',
    BORC_EVRAK_CIKISI: 'Borç Evrak Çıkışı (Kendi)',
    CARIYE_EVRAK_CIROSU: 'Cariye Evrak Cirosu',
    IADE_BORDROSU: 'İade Bordrosu',
};

function YeniBordroContent() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const searchParams = useSearchParams();
    const { enqueueSnackbar } = useSnackbar();

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form States
    const [bordroNo, setBordroNo] = useState('');
    const [tarih, setTarih] = useState(new Date().toISOString().split('T')[0]);
    const [bordroTipi, setBordroTipi] = useState<string | null>(null);
    const [cariId, setCariId] = useState<string | null>(null);
    const [bankaHesabiId, setBankaHesabiId] = useState<string | null>(null);
    const [aciklama, setAciklama] = useState('');
    const [selectedEntryType, setSelectedEntryType] = useState<'CEK' | 'SENET' | null>(null);

    const [cariler, setCariler] = useState<any[]>([]);
    const [bankaHesaplari, setBankaHesaplari] = useState<any[]>([]);
    const [yeniCekler, setYeniCekler] = useState<CekFormData[]>([]);
    const [cekForm, setCekForm] = useState<CekFormData>(initialCekForm);

    const [portfoyCekler, setPortfoyCekler] = useState<any[]>([]);
    const [secilenCekler, setSecilenCekler] = useState<GridRowSelectionModel>([] as any);

    useEffect(() => {
        axios.get('/cari').then(res => setCariler(res.data.data || []));
        axios.get('/banka/hesap').then(res => setBankaHesaplari(res.data || []));
        setBordroNo(`BR-${Date.now().toString().slice(-6)}`);
    }, []);

    // Portföydeki çekleri yükle (Ciro/İade/Banka işlemleri için)
    useEffect(() => {
        if (activeStep === 2 && bordroTipi && bordroTipi !== 'MUSTERI_EVRAK_GIRISI' && bordroTipi !== 'BORC_EVRAK_CIKISI') {
            setLoading(true);
            const status = bordroTipi === 'IADE_BORDROSU' ? '' : 'PORTFOYDE';
            axios.get(`/cek-senet?durum=${status}`).then(res => {
                setPortfoyCekler(res.data);
            }).finally(() => setLoading(false));
        }
    }, [activeStep, bordroTipi]);

    const totalAmount = useMemo(() => {
        if (bordroTipi === 'MUSTERI_EVRAK_GIRISI' || bordroTipi === 'BORC_EVRAK_CIKISI') {
            return yeniCekler.reduce((acc, curr) => acc + (curr.tutar || 0), 0);
        } else {
            return (secilenCekler as string[]).reduce((acc, id) => {
                const item = portfoyCekler.find(p => p.id === id);
                return acc + (item?.tutar || 0);
            }, 0);
        }
    }, [yeniCekler, secilenCekler, portfoyCekler, bordroTipi]);

    const handleNext = () => {
        if (activeStep === 0 && !bordroTipi) {
            enqueueSnackbar('Lütfen bordro tipini seçin', { variant: 'warning' });
            return;
        }
        if (activeStep === 1) {
            if (!bordroNo || !tarih) {
                enqueueSnackbar('Bordro no ve tarih zorunludur', { variant: 'warning' });
                return;
            }
            if (['MUSTERI_EVRAK_GIRISI', 'BORC_EVRAK_CIKISI', 'CARIYE_EVRAK_CIROSU', 'IADE_BORDROSU'].includes(bordroTipi!) && !cariId) {
                enqueueSnackbar('Cari hesap seçimi zorunludur', { variant: 'warning' });
                return;
            }
            if (['BANKA_TAHSIL_CIROSU', 'BANKA_TEMINAT_CIROSU'].includes(bordroTipi!) && !bankaHesabiId) {
                enqueueSnackbar('Banka hesabı seçimi zorunludur', { variant: 'warning' });
                return;
            }
        }
        if (activeStep === 2) {
            // Entry type selection validation if needed
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleAddCek = () => {
        if (!cekForm.evrakNo || (cekForm.tutar || 0) <= 0 || !cekForm.vadeTarihi) {
            enqueueSnackbar('Lütfen zorunlu alanları doldurunuz', { variant: 'warning' });
            return;
        }

        const finalTip = selectedEntryType === 'CEK' ? 'CEK' : 'SENET';
        setYeniCekler([...yeniCekler, { ...cekForm, tip: finalTip }]);
        setCekForm(initialCekForm);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                tip: bordroTipi,
                bordroNo,
                tarih,
                cariId,
                bankaHesabiId,
                aciklama,
                yeniCekler: (bordroTipi === 'MUSTERI_EVRAK_GIRISI' || bordroTipi === 'BORC_EVRAK_CIKISI') ? yeniCekler : undefined,
                secilenCekIdleri: (bordroTipi !== 'MUSTERI_EVRAK_GIRISI' && bordroTipi !== 'BORC_EVRAK_CIKISI') ? secilenCekler : undefined,
            };

            await axios.post('/bordro', payload);
            enqueueSnackbar('Bordro başarıyla kaydedildi', { variant: 'success' });
            router.push('/bordro');
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Hata oluştu', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const portfoyColumns: GridColDef[] = [
        { field: 'cekNo', headerName: 'Evrak No', flex: 1 },
        {
            field: 'vade',
            headerName: 'Vade',
            flex: 1,
            type: 'date',
            valueGetter: (value: any) => value ? new Date(value) : null
        },
        {
            field: 'tutar',
            headerName: 'Tutar',
            flex: 1,
            valueFormatter: (params: any) => {
                if (typeof params.value !== 'number' && typeof params.value !== 'string') return '-';
                return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(params.value));
            }
        },
        { field: 'borclu', headerName: 'Borçlu', flex: 1.5, valueGetter: (_: any, row: any) => row?.banka || row?.cari?.unvan || '-' },
        { field: 'durum', headerName: 'Durum', flex: 1 },
    ];

    const WIZARD_STEPS = ['İşlem Tipi', 'Genel Bilgiler', 'Evrak Seçimi / Girişi'];

    return (
        <MainLayout>
            <Box sx={{ maxWidth: '1100px', mx: 'auto', p: isMobile ? 1 : 3 }}>
                {/* Header */}
                <Box display="flex" alignItems="center" gap={2} mb={4}>
                    <IconButton onClick={() => router.back()} sx={{ bgcolor: 'var(--muted)' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
                            Bordro Yönetimi
                        </Typography>
                        <Typography variant="body2" color="var(--muted-foreground)">
                            Kurumsal evrak hareketleri sihirbazı
                        </Typography>
                    </Box>
                </Box>

                {/* Stepper */}
                <Box mb={5}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {WIZARD_STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 600, mt: 1, color: 'var(--muted-foreground)' } }}>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* Step Content */}
                <Card sx={{
                    p: isMobile ? 2 : 4,
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    bgcolor: 'var(--card)',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    {activeStep === 0 && (
                        <Box sx={{ py: 2 }}>
                            <Typography variant="h6" fontWeight={700} mb={4} textAlign="center">Lütfen Yapılacak İşlemi Seçiniz</Typography>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                                gap: 3
                            }}>
                                {Object.entries(BORDRO_TIP_LABELS).map(([key, label]) => (
                                    <Box
                                        key={key}
                                        onClick={() => {
                                            setBordroTipi(key);
                                            handleNext();
                                        }}
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            borderRadius: '16px',
                                            border: bordroTipi === key ? '2px solid var(--primary)' : '1px solid var(--border)',
                                            bgcolor: bordroTipi === key ? 'color-mix(in srgb, var(--primary) 5%, transparent)' : 'transparent',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 'var(--shadow-md)',
                                                borderColor: 'var(--primary)'
                                            }
                                        }}
                                    >
                                        <Avatar sx={{
                                            width: 50,
                                            height: 50,
                                            mx: 'auto',
                                            mb: 2,
                                            bgcolor: bordroTipi === key ? 'var(--primary)' : 'var(--muted)',
                                            color: bordroTipi === key ? 'var(--primary-foreground)' : 'var(--foreground)'
                                        }}>
                                            {key.includes('GIRIS') ? <PostAdd /> : <ArrowForward />}
                                        </Avatar>
                                        <Typography variant="subtitle2" fontWeight={700}>{label}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {activeStep === 1 && (
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={3}>
                                <Description sx={{ color: 'var(--primary)' }} />
                                <Typography variant="h6" fontWeight={700}>Bordro Detayları: {BORDRO_TIP_LABELS[bordroTipi!]}</Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                <Box>
                                    <TextField
                                        label="Bordro Numarası"
                                        value={bordroNo}
                                        onChange={(e) => setBordroNo(e.target.value)}
                                        fullWidth
                                        className="form-control-textfield"
                                    />
                                </Box>
                                <Box>
                                    <TextField
                                        label="İşlem Tarihi"
                                        type="date"
                                        value={tarih}
                                        onChange={(e) => setTarih(e.target.value)}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        className="form-control-textfield"
                                    />
                                </Box>

                                {(['MUSTERI_EVRAK_GIRISI', 'BORC_EVRAK_CIKISI', 'CARIYE_EVRAK_CIROSU', 'IADE_BORDROSU'].includes(bordroTipi!)) && (
                                    <Box sx={{ gridColumn: { md: 'span 2' } }}>
                                        <Autocomplete
                                            options={cariler}
                                            getOptionLabel={(option) => `${option.unvan} (${option.cariKodu})`}
                                            value={cariler.find(c => c.id === cariId) || null}
                                            onChange={(_, val) => setCariId(val?.id || null)}
                                            renderInput={(params) => <TextField {...params} label="Cari Hesap Seçimi" required className="form-control-textfield" />}
                                        />
                                    </Box>
                                )}

                                {(['BANKA_TAHSIL_CIROSU', 'BANKA_TEMINAT_CIROSU'].includes(bordroTipi!)) && (
                                    <Box sx={{ gridColumn: { md: 'span 2' } }}>
                                        <Autocomplete
                                            options={bankaHesaplari}
                                            getOptionLabel={(option) => `${option.hesapAdi} - ${option.iban}`}
                                            value={bankaHesaplari.find(h => h.id === bankaHesabiId) || null}
                                            onChange={(_, val) => setBankaHesabiId(val?.id || null)}
                                            renderInput={(params) => <TextField {...params} label="Banka Hesabı Seçimi" required className="form-control-textfield" />}
                                        />
                                    </Box>
                                )}

                                <Box sx={{ gridColumn: { md: 'span 2' } }}>
                                    <TextField
                                        label="Açıklama / Notlar"
                                        value={aciklama}
                                        onChange={(e) => setAciklama(e.target.value)}
                                        multiline
                                        rows={2}
                                        fullWidth
                                        className="form-control-textfield"
                                    />
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {activeStep === 2 && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6" fontWeight={700}>
                                    Evrak İşlemleri
                                </Typography>
                                <Chip
                                    label={`Toplam Tutar: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalAmount)}`}
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: '0.9rem',
                                        bgcolor: 'var(--primary)',
                                        color: 'var(--primary-foreground)',
                                        height: 36,
                                        px: 1
                                    }}
                                />
                            </Box>

                            {(bordroTipi === 'MUSTERI_EVRAK_GIRISI' || bordroTipi === 'BORC_EVRAK_CIKISI') ? (
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '350px 1fr' }, gap: 3 }}>
                                    {/* Giriş Formu */}
                                    <Box sx={{ p: 3, bgcolor: 'var(--muted)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <Stack spacing={2}>
                                            <TextField
                                                select
                                                label="Evrak Türü"
                                                size="small"
                                                value={selectedEntryType || ''}
                                                onChange={(e) => setSelectedEntryType(e.target.value as any)}
                                                fullWidth
                                            >
                                                <MenuItem value="CEK">Çek</MenuItem>
                                                <MenuItem value="SENET">Senet</MenuItem>
                                            </TextField>
                                            <TextField
                                                label="Evrak Numarası"
                                                size="small"
                                                value={cekForm.evrakNo}
                                                onChange={(e) => setCekForm({ ...cekForm, evrakNo: e.target.value })}
                                                fullWidth
                                            />
                                            <TextField
                                                label="Vade Tarihi"
                                                type="date"
                                                size="small"
                                                value={cekForm.vadeTarihi}
                                                onChange={(e) => setCekForm({ ...cekForm, vadeTarihi: e.target.value })}
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                label="Tutar"
                                                type="number"
                                                size="small"
                                                value={cekForm.tutar}
                                                onChange={(e) => setCekForm({ ...cekForm, tutar: Number(e.target.value) })}
                                                fullWidth
                                            />
                                            {selectedEntryType === 'CEK' && (
                                                <TextField
                                                    label="Banka"
                                                    size="small"
                                                    value={cekForm.banka}
                                                    onChange={(e) => setCekForm({ ...cekForm, banka: e.target.value })}
                                                    fullWidth
                                                />
                                            )}
                                            <TextField
                                                label="Borçlu / Keşideci"
                                                size="small"
                                                value={cekForm.borclu}
                                                onChange={(e) => setCekForm({ ...cekForm, borclu: e.target.value })}
                                                fullWidth
                                            />
                                            <Button
                                                variant="contained"
                                                startIcon={<PostAdd />}
                                                onClick={handleAddCek}
                                                fullWidth
                                                disabled={!selectedEntryType}
                                                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 700 }}
                                            >
                                                Listeye Ekle
                                            </Button>
                                        </Stack>
                                    </Box>

                                    {/* Evrak Listesi */}
                                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: 'var(--muted)' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700 }}>Tip</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Evrak No</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Vade</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Tutar</TableCell>
                                                    <TableCell align="center"></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {yeniCekler.map((cek, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell><Chip label={cek.tip === 'MUSTERI_CEK' ? 'Çek' : 'Senet'} size="small" variant="outlined" /></TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>{cek.evrakNo}</TableCell>
                                                        <TableCell>{new Date(cek.vadeTarihi).toLocaleDateString('tr-TR')}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--primary)' }}>
                                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cek.tutar)}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton size="small" color="error" onClick={() => {
                                                                const arr = [...yeniCekler];
                                                                arr.splice(index, 1);
                                                                setYeniCekler(arr);
                                                            }}>
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {yeniCekler.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                                            <Typography variant="body2" color="var(--muted-foreground)">Henüz evrak eklenmedi.</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            ) : (
                                <Box sx={{ height: 450, width: '100%', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                                    <DataGrid
                                        rows={portfoyCekler}
                                        columns={portfoyColumns}
                                        checkboxSelection
                                        loading={loading}
                                        onRowSelectionModelChange={(newSelection) => setSecilenCekler(newSelection)}
                                        rowSelectionModel={secilenCekler}
                                        sx={{
                                            border: 'none',
                                            '& .MuiDataGrid-columnHeaders': { bgcolor: 'var(--muted)', fontWeight: 700 },
                                            '& .MuiDataGrid-cell:focus': { outline: 'none' }
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Navigation Buttons */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 4,
                        pt: 3,
                        borderTop: '1px solid var(--border)'
                    }}>
                        <Button
                            disabled={activeStep === 0 || loading}
                            onClick={handleBack}
                            startIcon={<ArrowBack />}
                            sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none' }}
                        >
                            Geri
                        </Button>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {activeStep < 2 ? (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    endIcon={<ArrowForward />}
                                    sx={{ borderRadius: '10px', px: 4, fontWeight: 700, textTransform: 'none' }}
                                >
                                    Sonraki Adım
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircle />}
                                    onClick={handleSave}
                                    disabled={loading || ((bordroTipi === 'MUSTERI_EVRAK_GIRISI' || bordroTipi === 'BORC_EVRAK_CIKISI') ? yeniCekler.length === 0 : (secilenCekler as string[]).length === 0)}
                                    sx={{
                                        borderRadius: '10px',
                                        px: 4,
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        bgcolor: '#16a34a',
                                        color: '#ffffff',
                                        '&:hover': { bgcolor: '#15803d' }
                                    }}
                                >
                                    {loading ? 'Kaydediliyor...' : 'Bordroyu Onayla ve Kaydet'}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Card>
            </Box>
        </MainLayout>
    );
}

export default function YeniBordroPage() {
    return (
        <Suspense fallback={<Box p={3} textAlign="center"><Typography>Yükleniyor...</Typography></Box>}>
            <YeniBordroContent />
        </Suspense>
    );
}
