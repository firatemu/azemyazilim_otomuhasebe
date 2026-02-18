import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Stack,
    Paper,
    Divider,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Autocomplete,
    Chip,
    alpha
} from '@mui/material';
import {
    AccountBalance,
    AttachMoney,
    Close,
    PanTool,
    CheckCircle
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '@/lib/axios';

interface Plan {
    id: string;
    taksitNo: number;
    vadeTarihi: string;
    tutar: number;
    odenen: number;
    durum: string;
}

interface BankaHesap {
    id: string;
    hesapAdi: string;
    hesapKodu: string;
    bakiye: number;
    hesapTipi: string;
}

interface Kasa {
    id: string;
    kasaAdi: string;
    kasaKodu: string;
    bakiye: number;
}

interface PayInstallmentDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plan: Plan;
}

type OdemeTipi = 'BANKA_HAVALESI' | 'NAKIT' | 'ELDEN';

export default function PayInstallmentDialog({ open, onClose, onSuccess, plan }: PayInstallmentDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [odemeTipi, setOdemeTipi] = useState<OdemeTipi>('BANKA_HAVALESI');
    const [tutar, setTutar] = useState<string>('');
    const [aciklama, setAciklama] = useState('');
    const [odemeTarihi, setOdemeTarihi] = useState(new Date().toISOString().split('T')[0]);
    const [bankaHesapId, setBankaHesapId] = useState<string | null>(null);
    const [kasaId, setKasaId] = useState<string | null>(null);
    const [bankaHesaplar, setBankaHesaplar] = useState<BankaHesap[]>([]);
    const [kasalar, setKasalar] = useState<Kasa[]>([]);
    const [loading, setLoading] = useState(false);

    const kalanTutar = plan.tutar - plan.odenen;

    useEffect(() => {
        if (open) {
            setTutar(kalanTutar.toString());
            fetchBankaHesaplar();
            fetchKasalar();
        }
    }, [open, kalanTutar]);

    const fetchBankaHesaplar = async () => {
        try {
            const response = await axios.get('/banka/ozet');
            const vadesizHesaplar: BankaHesap[] = [];
            response.data.bankalar?.forEach((banka: any) => {
                banka.hesaplar?.forEach((hesap: any) => {
                    if (hesap.hesapTipi === 'VADESIZ') {
                        vadesizHesaplar.push(hesap);
                    }
                });
            });
            setBankaHesaplar(vadesizHesaplar);
        } catch (error) {
            console.error('Banka hesapları yüklenemedi:', error);
        }
    };

    const fetchKasalar = async () => {
        try {
            const response = await axios.get('/kasa');
            setKasalar(response.data.filter((k: Kasa) => k.kasaAdi !== 'Silinen Kayıtlar'));
        } catch (error) {
            console.error('Kasalar yüklenemedi:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleSubmit = async () => {
        if (!tutar || parseFloat(tutar) <= 0) {
            enqueueSnackbar('Geçerli bir tutar giriniz', { variant: 'error' });
            return;
        }

        if (parseFloat(tutar) > kalanTutar) {
            enqueueSnackbar('Ödeme tutarı kalan tutardan fazla olamaz', { variant: 'error' });
            return;
        }

        if (odemeTipi === 'BANKA_HAVALESI' && !bankaHesapId) {
            enqueueSnackbar('Banka hesabı seçiniz', { variant: 'error' });
            return;
        }

        if (odemeTipi === 'NAKIT' && !kasaId) {
            enqueueSnackbar('Kasa seçiniz', { variant: 'error' });
            return;
        }

        // Bakiye kontrolü
        if (odemeTipi === 'BANKA_HAVALESI') {
            const hesap = bankaHesaplar.find(h => h.id === bankaHesapId);
            if (hesap && hesap.bakiye < parseFloat(tutar)) {
                enqueueSnackbar('Banka hesabında yeterli bakiye yok', { variant: 'error' });
                return;
            }
        }

        if (odemeTipi === 'NAKIT') {
            const kasa = kasalar.find(k => k.id === kasaId);
            if (kasa && kasa.bakiye < parseFloat(tutar)) {
                enqueueSnackbar('Kasada yeterli bakiye yok', { variant: 'error' });
                return;
            }
        }

        setLoading(true);
        try {
            await axios.post(`/banka/kredi-plan/${plan.id}/odeme`, {
                odemeTipi,
                tutar: parseFloat(tutar),
                bankaHesapId: odemeTipi === 'BANKA_HAVALESI' ? bankaHesapId : undefined,
                kasaId: odemeTipi === 'NAKIT' ? kasaId : undefined,
                aciklama: aciklama || undefined,
                odemeTarihi
            });
            enqueueSnackbar('Ödeme başarıyla kaydedildi', { variant: 'success' });
            onSuccess();
            onClose();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Ödeme kaydedilemedi', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const selectedHesap = bankaHesaplar.find(h => h.id === bankaHesapId);
    const selectedKasa = kasalar.find(k => k.id === kasaId);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, bgcolor: '#f8fafc' }
            }}
        >
            <DialogTitle sx={{
                p: 3,
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney />
                    <Typography variant="h6" fontWeight="700">Taksit Ödemesi</Typography>
                </Box>
                <Button
                    onClick={onClose}
                    sx={{ color: 'white', minWidth: 'auto', p: 0.5 }}
                >
                    <Close />
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
                <Stack spacing={3}>
                    {/* Taksit Bilgileri */}
                    <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Taksit Bilgileri</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Taksit No</Typography>
                                <Typography variant="body1" fontWeight="600">#{plan.taksitNo}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Vade Tarihi</Typography>
                                <Typography variant="body1" fontWeight="600">{formatDate(plan.vadeTarihi)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Taksit Tutarı</Typography>
                                <Typography variant="body1" fontWeight="700" color="primary">{formatCurrency(plan.tutar)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Kalan Tutar</Typography>
                                <Typography variant="body1" fontWeight="700" color="error">{formatCurrency(kalanTutar)}</Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Ödeme Tipi Seçimi */}
                    <FormControl>
                        <FormLabel sx={{ fontWeight: 600, mb: 1 }}>Ödeme Yöntemi</FormLabel>
                        <RadioGroup value={odemeTipi} onChange={(e) => setOdemeTipi(e.target.value as OdemeTipi)}>
                            <Paper sx={{ p: 1.5, mb: 1, border: '2px solid', borderColor: odemeTipi === 'BANKA_HAVALESI' ? 'primary.main' : 'divider', borderRadius: 2 }}>
                                <FormControlLabel
                                    value="BANKA_HAVALESI"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccountBalance sx={{ color: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">Banka Havalesi (Virman)</Typography>
                                                <Typography variant="caption" color="text.secondary">Vadesiz hesaptan ödeme</Typography>
                                            </Box>
                                        </Box>
                                    }
                                />
                            </Paper>
                            <Paper sx={{ p: 1.5, mb: 1, border: '2px solid', borderColor: odemeTipi === 'NAKIT' ? 'primary.main' : 'divider', borderRadius: 2 }}>
                                <FormControlLabel
                                    value="NAKIT"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AttachMoney sx={{ color: 'success.main' }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">Nakit (Kasa)</Typography>
                                                <Typography variant="caption" color="text.secondary">Kasadan ödeme</Typography>
                                            </Box>
                                        </Box>
                                    }
                                />
                            </Paper>
                            <Paper sx={{ p: 1.5, border: '2px solid', borderColor: odemeTipi === 'ELDEN' ? 'primary.main' : 'divider', borderRadius: 2 }}>
                                <FormControlLabel
                                    value="ELDEN"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PanTool sx={{ color: 'warning.main' }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">Elden Ödeme</Typography>
                                                <Typography variant="caption" color="text.secondary">Bakiye hareketi olmaz</Typography>
                                            </Box>
                                        </Box>
                                    }
                                />
                            </Paper>
                        </RadioGroup>
                    </FormControl>

                    {/* Banka Hesabı Seçimi */}
                    {odemeTipi === 'BANKA_HAVALESI' && (
                        <Autocomplete
                            options={bankaHesaplar}
                            getOptionLabel={(option) => `${option.hesapAdi} (${option.hesapKodu}) - ${formatCurrency(option.bakiye)}`}
                            value={bankaHesaplar.find(h => h.id === bankaHesapId) || null}
                            onChange={(_, newValue) => setBankaHesapId(newValue?.id || null)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Banka Hesabı"
                                    required
                                    helperText={selectedHesap && `Bakiye: ${formatCurrency(selectedHesap.bakiye)}`}
                                />
                            )}
                        />
                    )}

                    {/* Kasa Seçimi */}
                    {odemeTipi === 'NAKIT' && (
                        <Autocomplete
                            options={kasalar}
                            getOptionLabel={(option) => `${option.kasaAdi} (${option.kasaKodu}) - ${formatCurrency(option.bakiye)}`}
                            value={kasalar.find(k => k.id === kasaId) || null}
                            onChange={(_, newValue) => setKasaId(newValue?.id || null)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Kasa"
                                    required
                                    helperText={selectedKasa && `Bakiye: ${formatCurrency(selectedKasa.bakiye)}`}
                                />
                            )}
                        />
                    )}

                    {/* Tutar */}
                    <TextField
                        label="Ödeme Tutarı"
                        type="number"
                        fullWidth
                        required
                        value={tutar}
                        onChange={(e) => setTutar(e.target.value)}
                        InputProps={{
                            endAdornment: <Typography variant="body2" color="text.secondary">TL</Typography>
                        }}
                        helperText={`Maksimum: ${formatCurrency(kalanTutar)}`}
                    />

                    {/* Ödeme Tarihi */}
                    <TextField
                        label="Ödeme Tarihi"
                        type="date"
                        fullWidth
                        value={odemeTarihi}
                        onChange={(e) => setOdemeTarihi(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* Açıklama */}
                    <TextField
                        label="Açıklama (Opsiyonel)"
                        multiline
                        rows={2}
                        fullWidth
                        value={aciklama}
                        onChange={(e) => setAciklama(e.target.value)}
                    />

                    {/* Bakiye Uyarısı */}
                    {odemeTipi === 'BANKA_HAVALESI' && selectedHesap && selectedHesap.bakiye < parseFloat(tutar || '0') && (
                        <Alert severity="error">Banka hesabında yeterli bakiye yok!</Alert>
                    )}
                    {odemeTipi === 'NAKIT' && selectedKasa && selectedKasa.bakiye < parseFloat(tutar || '0') && (
                        <Alert severity="error">Kasada yeterli bakiye yok!</Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>İptal</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={<CheckCircle />}
                    sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        px: 4
                    }}
                >
                    {loading ? 'Ödeniyor...' : 'Ödemeyi Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
