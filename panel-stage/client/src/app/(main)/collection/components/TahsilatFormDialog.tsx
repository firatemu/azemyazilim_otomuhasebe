import React, { useState, useMemo, useEffect, memo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    TextField,
    Autocomplete,
    InputAdornment,
    Alert,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Chip,
    Paper
} from '@mui/material';
import {
    TrendingDown,
    TrendingUp,
    Close,
    AttachMoney,
    CreditCard,
    AccountBalance,
    Person,
    Badge,
    Notes
} from '@mui/icons-material';
import { Cari, Kasa, BankaHesap, FirmaKrediKarti, SatisElemani, TahsilatFormData } from '../types';
import axios from '@/lib/axios';

interface TahsilatFormDialogProps {
    open: boolean;
    initialFormData: TahsilatFormData;
    cariler: Cari[];
    bankaHesaplari: BankaHesap[];
    kasalar: Kasa[];
    satisElemanlari: SatisElemani[];
    carilerLoading: boolean;
    bankaHesaplariLoading: boolean;
    kasalarLoading: boolean;
    satisElemanlariLoading: boolean;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (data: TahsilatFormData) => void;
    formatMoney: (value: number) => string;
}

const TahsilatFormDialog = memo(({
    open,
    initialFormData,
    cariler,
    bankaHesaplari,
    kasalar,
    satisElemanlari,
    carilerLoading,
    bankaHesaplariLoading,
    kasalarLoading,
    satisElemanlariLoading,
    submitting,
    onClose,
    onSubmit,
    formatMoney,
}: TahsilatFormDialogProps) => {
    // 1. LOCAL STATE
    const [localFormData, setLocalFormData] = useState<TahsilatFormData>(initialFormData);
    const [firmaKrediKartlari, setFirmaKrediKartlari] = useState<FirmaKrediKarti[]>([]);
    const [firmaKrediKartlariLoading, setFirmaKrediKartlariLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 2. Sync with initialFormData
    useEffect(() => {
        setLocalFormData(initialFormData);
        setErrors({});
    }, [initialFormData, open]);

    // 3. POS Banka Hesaplarını Filtrele (Sadece Tahsilat + Kredi Kartı)
    const posBankaHesaplariFiltered = useMemo(() => {
        if (localFormData.tip === 'TAHSILAT' && localFormData.odemeTipi === 'KREDI_KARTI') {
            return bankaHesaplari.filter(h => h.hesapTipi === 'POS');
        }
        return [];
    }, [bankaHesaplari, localFormData.tip, localFormData.odemeTipi]);

    // 4. Kullanılabilir Kasaları Filtrele
    const availableKasalar = useMemo(() => {
        if (localFormData.odemeTipi === 'NAKIT') {
            return kasalar.filter(k => k.kasaTipi === 'NAKIT');
        } else if (localFormData.odemeTipi === 'KREDI_KARTI') {
            if (localFormData.tip === 'TAHSILAT') {
                return []; // POS hesapları ayrı
            } else {
                return kasalar.filter(k => k.kasaTipi === 'FIRMA_KREDI_KARTI');
            }
        }
        return [];
    }, [kasalar, localFormData.odemeTipi, localFormData.tip]);

    // 5. Firma Kredi Kartlarını Çek (Ödeme + Kredi Kartı + Kasa Seçili)
    useEffect(() => {
        const fetchFirmaKrediKartlari = async () => {
            if (localFormData.tip === 'ODEME' && localFormData.odemeTipi === 'KREDI_KARTI' && localFormData.kasaId) {
                try {
                    setFirmaKrediKartlariLoading(true);
                    const response = await axios.get('/firma-kredi-karti', {
                        params: { kasaId: localFormData.kasaId },
                    });
                    setFirmaKrediKartlari(response.data || []);
                } catch (error) {
                    console.error('Firma kredi kartları yüklenirken hata:', error);
                    setFirmaKrediKartlari([]);
                } finally {
                    setFirmaKrediKartlariLoading(false);
                }
            } else {
                setFirmaKrediKartlari([]);
                setLocalFormData((prev) => ({
                    ...prev,
                    firmaKrediKartiId: undefined,
                    kartSahibi: '',
                    kartSonDort: '',
                    bankaAdi: '',
                }));
            }
        };

        fetchFirmaKrediKartlari();
    }, [localFormData.tip, localFormData.odemeTipi, localFormData.kasaId]);

    // 6. Validasyon
    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!localFormData.cariId) newErrors.cariId = 'Cari seçimi zorunludur';
        const tutarNum = typeof localFormData.tutar === 'string' ? parseFloat(localFormData.tutar) : localFormData.tutar;
        if (tutarNum === undefined || isNaN(tutarNum) || tutarNum <= 0) newErrors.tutar = 'Geçerli bir tutar giriniz';
        if (!localFormData.tarih) newErrors.tarih = 'Tarih seçimi zorunludur';

        if (localFormData.odemeTipi === 'NAKIT' && !localFormData.kasaId) newErrors.kasaId = 'Kasa seçimi zorunludur';

        if (localFormData.odemeTipi === 'KREDI_KARTI') {
            if (localFormData.tip === 'TAHSILAT' && !localFormData.bankaHesapId) newErrors.bankaHesapId = 'POS hesabı seçimi zorunludur';
            if (localFormData.tip === 'ODEME') {
                if (!localFormData.kasaId) newErrors.kasaId = 'Kart kasası seçimi zorunludur';
                if (!localFormData.firmaKrediKartiId) newErrors.firmaKrediKartiId = 'Kredi kartı seçimi zorunludur';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 7. Handlers
    const handleLocalChange = (field: keyof TahsilatFormData, value: any) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        if (field === 'firmaKrediKartiId' && value) {
            const selectedKart = firmaKrediKartlari.find((kart) => kart.id === value);
            if (selectedKart) {
                setLocalFormData((prev) => ({
                    ...prev,
                    [field]: value,
                    kartSahibi: selectedKart.kartAdi || '',
                    kartSonDort: selectedKart.sonDortHane || '',
                    bankaAdi: selectedKart.bankaAdi || '',
                }));
                return;
            }
        }

        if (field === 'odemeTipi') {
            setLocalFormData((prev) => ({
                ...prev,
                [field]: value,
                kasaId: '',
                bankaHesapId: '',
            }));
            return;
        }

        setLocalFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleLocalSubmit = () => {
        if (validateForm()) {
            const tutarNum = typeof localFormData.tutar === 'string' ? parseFloat(localFormData.tutar) : localFormData.tutar;
            onSubmit({ ...localFormData, tutar: tutarNum || 0 });
        }
    };

    if (!open) return null;

    const isTahsilat = localFormData.tip === 'TAHSILAT';
    const themeColor = isTahsilat ? '#10b981' : '#ef4444';
    const themeGradient = isTahsilat
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    overflow: 'visible' // For potential floating elements
                }
            }}
        >
            <DialogTitle component="div" sx={{
                background: themeGradient,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 2,
                borderRadius: '12px 12px 0 0'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {isTahsilat ? <TrendingDown fontSize="large" sx={{ opacity: 0.9 }} /> : <TrendingUp fontSize="large" sx={{ opacity: 0.9 }} />}
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            {isTahsilat ? 'Tahsilat Ekle' : 'Ödeme Ekle'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500 }}>
                            {isTahsilat ? 'Müşteriden para girişi' : 'Tedarikçiye para çıkışı'}
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 3, px: 3, pb: 1 }}>
                <Grid container spacing={3}>
                    {/* Section: Temel Bilgiler */}
                    <Grid size={12}>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoney fontSize="small" color="action" />
                            FİNANSAL DETAYLAR
                        </Typography>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'var(--muted)', borderRadius: 2, border: '1px solid var(--border)' }}>
                            <Grid container spacing={2}>
                                {/* Ödeme Tipi */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Ödeme Tipi</InputLabel>
                                        <Select
                                            value={localFormData.odemeTipi}
                                            label="Ödeme Tipi"
                                            onChange={(e) => handleLocalChange('odemeTipi', e.target.value)}
                                            startAdornment={<InputAdornment position="start"><CreditCard fontSize="small" /></InputAdornment>}
                                        >
                                            <MenuItem value="NAKIT">Nakit</MenuItem>
                                            <MenuItem value="KREDI_KARTI">Kredi Kartı</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Tutar */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Tutar"
                                        type="number"
                                        value={localFormData.tutar}
                                        onChange={(e) => handleLocalChange('tutar', e.target.value)}
                                        error={!!errors.tutar}
                                        helperText={errors.tutar}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                                            sx: { fontWeight: 700, fontSize: '1.1rem', color: themeColor }
                                        }}
                                    />
                                </Grid>

                                {/* Kasa / Banka Seçimi */}
                                {localFormData.odemeTipi === 'KREDI_KARTI' && isTahsilat ? (
                                    <Grid size={12}>
                                        <FormControl fullWidth error={!!errors.bankaHesapId}>
                                            <InputLabel>POS Banka Hesabı</InputLabel>
                                            <Select
                                                value={localFormData.bankaHesapId || ''}
                                                label="POS Banka Hesabı"
                                                onChange={(e) => handleLocalChange('bankaHesapId', e.target.value)}
                                                disabled={bankaHesaplariLoading}
                                                startAdornment={<InputAdornment position="start"><AccountBalance fontSize="small" /></InputAdornment>}
                                            >
                                                {posBankaHesaplariFiltered.map((hesap: any) => (
                                                    <MenuItem key={hesap.id} value={hesap.id}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                            <span>{hesap.bankaAdi} - {hesap.hesapAdi}</span>
                                                            <Chip label={hesap.paraBirimi} size="small" variant="outlined" sx={{ ml: 1, height: 20 }} />
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.bankaHesapId && <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>{errors.bankaHesapId}</Typography>}
                                        </FormControl>
                                    </Grid>
                                ) : (
                                    <Grid size={12}>
                                        <FormControl fullWidth error={!!errors.kasaId}>
                                            <InputLabel>{localFormData.odemeTipi === 'NAKIT' ? 'Nakit Kasa' : 'Kredi Kartı Kasası'}</InputLabel>
                                            <Select
                                                value={localFormData.kasaId}
                                                label={localFormData.odemeTipi === 'NAKIT' ? 'Nakit Kasa' : 'Kredi Kartı Kasası'}
                                                onChange={(e) => handleLocalChange('kasaId', e.target.value)}
                                                disabled={kasalarLoading}
                                                startAdornment={<InputAdornment position="start"><AccountBalance fontSize="small" /></InputAdornment>}
                                            >
                                                {availableKasalar.map((kasa) => (
                                                    <MenuItem key={kasa.id} value={kasa.id}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                            <span>{kasa.kasaAdi}</span>
                                                            <Chip
                                                                label={formatMoney(kasa.bakiye)}
                                                                size="small"
                                                                color={kasa.bakiye >= 0 ? "success" : "error"}
                                                                variant="filled"
                                                                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                                            />
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.kasaId && <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>{errors.kasaId}</Typography>}
                                        </FormControl>
                                    </Grid>
                                )}

                                {/* Firma Kredi Kartı Seçimi (Ödeme & Kredi Kartı) */}
                                {!isTahsilat && localFormData.odemeTipi === 'KREDI_KARTI' && localFormData.kasaId && (
                                    <Grid size={12}>
                                        <FormControl fullWidth error={!!errors.firmaKrediKartiId}>
                                            <InputLabel>Firma Kredi Kartı</InputLabel>
                                            <Select
                                                value={localFormData.firmaKrediKartiId || ''}
                                                label="Firma Kredi Kartı"
                                                onChange={(e) => handleLocalChange('firmaKrediKartiId', e.target.value)}
                                                disabled={firmaKrediKartlariLoading}
                                            >
                                                {firmaKrediKartlari.filter(k => k.aktif).map((kart) => (
                                                    <MenuItem key={kart.id} value={kart.id}>
                                                        {kart.kartAdi} - {kart.bankaAdi} (Son 4: {kart.sonDortHane})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.firmaKrediKartiId && <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>{errors.firmaKrediKartiId}</Typography>}
                                        </FormControl>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Tarih */}
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="İşlem Tarihi"
                            type="date"
                            value={localFormData.tarih}
                            onChange={(e) => handleLocalChange('tarih', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            error={!!errors.tarih}
                            helperText={errors.tarih}
                        />
                    </Grid>

                    {/* Section: Cari & Diğer */}
                    <Grid size={12}>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Person fontSize="small" color="action" />
                            CARİ & DİĞER BİLGİLER
                        </Typography>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'var(--card)', borderRadius: 2, border: '1px solid var(--border)' }}>
                            <Grid container spacing={2}>
                                {/* Cari Seçimi */}
                                <Grid size={12}>
                                    <Autocomplete
                                        options={cariler}
                                        getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
                                        loading={carilerLoading}
                                        value={cariler.find(c => c.id === localFormData.cariId) || null}
                                        onChange={(_, value) => {
                                            handleLocalChange('cariId', value?.id || '');
                                            if (value?.satisElemaniId) {
                                                handleLocalChange('satisElemaniId', value.satisElemaniId);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Cari Seçin"
                                                fullWidth
                                                error={!!errors.cariId}
                                                helperText={errors.cariId}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment>
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} key={option.id}>
                                                <Box sx={{ width: '100%' }}>
                                                    <Typography variant="body2" fontWeight={600}>{option.unvan}</Typography>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" color="text.secondary">{option.cariKodu}</Typography>
                                                        <Chip
                                                            label={formatMoney(option.bakiye)}
                                                            size="small"
                                                            color={option.bakiye >= 0 ? "success" : "error"}
                                                            variant="outlined"
                                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}
                                    />
                                </Grid>

                                {/* Satış Elemanı */}
                                <Grid size={12}>
                                    <Autocomplete
                                        options={satisElemanlari}
                                        getOptionLabel={(option) => option.adSoyad}
                                        loading={satisElemanlariLoading}
                                        value={satisElemanlari.find(s => s.id === localFormData.satisElemaniId) || null}
                                        onChange={(_, value) => handleLocalChange('satisElemaniId', value?.id || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Satış Elemanı (Opsiyonel)"
                                                fullWidth
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: <InputAdornment position="start"><Badge fontSize="small" /></InputAdornment>
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Açıklama */}
                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        label="Açıklama"
                                        multiline
                                        rows={2}
                                        value={localFormData.aciklama}
                                        onChange={(e) => handleLocalChange('aciklama', e.target.value)}
                                        placeholder="İşlem hakkında notlar..."
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start" sx={{ mt: 1.5 }}><Notes fontSize="small" /></InputAdornment>
                                        }}
                                    />
                                </Grid>

                                {/* Kredi Kartı Detayları (Sadece Tahsilat + Kredi Kartı) */}
                                {isTahsilat && localFormData.odemeTipi === 'KREDI_KARTI' && (
                                    <Grid size={12}>
                                        <Alert severity="info" icon={<CreditCard />} sx={{ mt: 1 }}>
                                            <Typography variant="body2" fontWeight={600} gutterBottom>Müşteri Kart Bilgileri (Opsiyonel)</Typography>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 4 }}>
                                                    <TextField
                                                        fullWidth size="small" label="Kart Sahibi"
                                                        value={localFormData.kartSahibi} onChange={(e) => handleLocalChange('kartSahibi', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 4 }}>
                                                    <TextField
                                                        fullWidth size="small" label="Son 4 Hane" inputProps={{ maxLength: 4 }}
                                                        value={localFormData.kartSonDort} onChange={(e) => handleLocalChange('kartSonDort', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 4 }}>
                                                    <TextField
                                                        fullWidth size="small" label="Banka Adı"
                                                        value={localFormData.bankaAdi} onChange={(e) => handleLocalChange('bankaAdi', e.target.value)}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Alert>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid var(--border)', bgcolor: 'var(--muted)' }}>
                <Button onClick={onClose} disabled={submitting} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    İptal
                </Button>
                <Button
                    onClick={handleLocalSubmit}
                    variant="contained"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : (isTahsilat ? <TrendingDown /> : <TrendingUp />)}
                    sx={{
                        bgcolor: themeColor,
                        '&:hover': { bgcolor: isTahsilat ? '#059669' : '#dc2626' },
                        px: 4,
                        py: 1,
                        fontWeight: 700,
                        boxShadow: `0 4px 12px ${isTahsilat ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                        borderRadius: 2
                    }}
                >
                    {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

TahsilatFormDialog.displayName = 'TahsilatFormDialog';

export default TahsilatFormDialog;
