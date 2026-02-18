import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    Typography,
    Box,
    Card,
    CardContent,
    Divider,
    InputAdornment,
    IconButton
} from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Close as CloseIcon } from '@mui/icons-material';

// Enum for Credit Types (Aligning with Backend)
enum KrediTuru {
    ESIT_TAKSITLI = 'ESIT_TAKSITLI',
    ROTATIF = 'ROTATIF'
}

const schema = z.object({
    krediTuru: z.nativeEnum(KrediTuru),
    tutar: z.number().min(1, 'Tutar 0 dan büyük olmalıdır'),
    yillikFaizOrani: z.number().min(0, 'Faiz oranı 0 dan küçük olamaz'),
    taksitSayisi: z.number().min(1, 'Taksit sayısı en az 1 olmalıdır'),
    odemeSikligi: z.number().min(1).optional(), // Rotatif için
    taksitTutari: z.number().min(1, 'Taksit tutarı zorunludur'),
    kullanimTarihi: z.string(),
    ilkTaksitTarihi: z.string(),
    aciklama: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateCreditDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => void;
    loading?: boolean;
}

export default function CreateCreditDialog({ open, onClose, onSubmit, loading }: CreateCreditDialogProps) {
    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            krediTuru: KrediTuru.ESIT_TAKSITLI,
            tutar: 0,
            yillikFaizOrani: 0,
            taksitSayisi: 12,
            odemeSikligi: 3,
            taksitTutari: 0,
            kullanimTarihi: new Date().toISOString().split('T')[0],
            ilkTaksitTarihi: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            aciklama: '',
        }
    });

    const watchedValues = useWatch({ control });

    // Live Calculation Logic (Installment * Count)
    const calculateSummary = () => {
        const P = watchedValues.tutar || 0;
        const installment = watchedValues.taksitTutari || 0;
        const n = watchedValues.taksitSayisi || 1;
        const type = watchedValues.krediTuru;
        const freq = watchedValues.odemeSikligi || 1;

        let monthlyPayment = installment;
        let totalRepayment = 0;
        let totalInterest = 0;

        if (installment > 0) {
            if (type === KrediTuru.ESIT_TAKSITLI) {
                totalRepayment = installment * n;
            } else if (type === KrediTuru.ROTATIF) {
                // Rotatif: Tek bir ödeme (Taksit Tutarı kadar)
                totalRepayment = installment;
            }
            totalInterest = totalRepayment - P;
        }

        return {
            monthlyPayment,
            totalRepayment,
            totalInterest
        };
    };

    const summary = calculateSummary();

    const handleFormSubmit = (data: FormData) => {
        // Rotatif kredide vade her zaman 1 (tek ödeme) olarak gönderilmeli
        if (data.krediTuru === KrediTuru.ROTATIF) {
            data.taksitSayisi = 1;
        }
        onSubmit(data);
    };

    // Format currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
    };

    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    // Auto-calculate First Installment Date based on Payment Frequency for Rotatif
    useEffect(() => {
        if (watchedValues.krediTuru === KrediTuru.ROTATIF && watchedValues.kullanimTarihi) {
            const date = new Date(watchedValues.kullanimTarihi);
            const monthsToAdd = watchedValues.odemeSikligi || 1;
            date.setMonth(date.getMonth() + monthsToAdd);
            // Handle edge cases like month overflow (e.g. Jan 31 + 1 month -> Feb 28/29) automatically handled by setMonth but good to verify format
            setValue('ilkTaksitTarihi', date.toISOString().split('T')[0]);
        }
    }, [watchedValues.krediTuru, watchedValues.odemeSikligi, watchedValues.kullanimTarihi, setValue]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Yeni Kredi Kullanımı (Manuel Plan)</Typography>
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Box>
            </DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        {/* LEFT COLUMN: Inputs */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="krediTuru"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                select
                                                label="Kredi Türü"
                                                fullWidth
                                                error={!!errors.krediTuru}
                                                helperText={errors.krediTuru?.message}
                                            >
                                                <MenuItem value={KrediTuru.ESIT_TAKSITLI}>Eşit Taksitli Kredi</MenuItem>
                                                <MenuItem value={KrediTuru.ROTATIF}>Rotatif (Dönemsel Ödemeli) Kredi</MenuItem>
                                            </TextField>
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="tutar"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Ele Geçen Tutar (Ana Para)"
                                                fullWidth
                                                type="number"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                                                }}
                                                error={!!errors.tutar}
                                                helperText={errors.tutar?.message}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                value={field.value || ''}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="taksitTutari"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Taksit Tutarı (Ödenecek Tutar)"
                                                fullWidth
                                                type="number"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                                                }}
                                                error={!!errors.taksitTutari}
                                                helperText="Her bir taksitte ödenecek tutar"
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                value={field.value || ''}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 6 }}>
                                    <Controller
                                        name="yillikFaizOrani"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Yıllık Faiz Oranı (%)"
                                                fullWidth
                                                type="number"
                                                helperText="Sadece bilgi amaçlıdır"
                                                error={!!errors.yillikFaizOrani}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        )}
                                    />
                                </Grid>

                                {watchedValues.krediTuru !== KrediTuru.ROTATIF && (
                                    <Grid size={{ xs: 6 }}>
                                        <Controller
                                            name="taksitSayisi"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Vade (Ay)"
                                                    fullWidth
                                                    type="number"
                                                    error={!!errors.taksitSayisi}
                                                    helperText={errors.taksitSayisi?.message}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            )}
                                        />
                                    </Grid>
                                )}

                                {watchedValues.krediTuru === KrediTuru.ROTATIF && (
                                    <Grid size={{ xs: 12 }}>
                                        <Controller
                                            name="odemeSikligi"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    select
                                                    label="Ödeme Sıklığı"
                                                    fullWidth
                                                    helperText="Ödemeler kaç ayda bir yapılacak?"
                                                >
                                                    <MenuItem value={1}>Her Ay</MenuItem>
                                                    <MenuItem value={3}>3 Ayda Bir</MenuItem>
                                                    <MenuItem value={6}>6 Ayda Bir</MenuItem>
                                                    <MenuItem value={12}>12 Ayda Bir</MenuItem>
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                )}

                                <Grid size={{ xs: 6 }}>
                                    <Controller
                                        name="kullanimTarihi"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Kullanım Tarihi"
                                                fullWidth
                                                type="date"
                                                InputLabelProps={{ shrink: true }}
                                                error={!!errors.kullanimTarihi}
                                                helperText="Paranın hesaba girdiği tarih"
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 6 }}>
                                    <Controller
                                        name="ilkTaksitTarihi"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="İlk Taksit Tarihi"
                                                fullWidth
                                                type="date"
                                                InputLabelProps={{ shrink: true }}
                                                error={!!errors.ilkTaksitTarihi}
                                                helperText="Ödemenin başlayacağı tarih"
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="aciklama"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Açıklama"
                                                fullWidth
                                                multiline
                                                rows={2}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* RIGHT COLUMN: Summary Card */}
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'grey.50', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                                        Ödeme Planı Özeti
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Hesaplanan Toplam Geri Ödeme
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                                            {formatCurrency(summary.totalRepayment)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Maliyet (Faiz + Masraf)
                                        </Typography>
                                        <Typography variant="h6" fontWeight="medium" color="error.main">
                                            {formatCurrency(summary.totalInterest)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'primary.contrastText' }}>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            {watchedValues.krediTuru === KrediTuru.ROTATIF
                                                ? `${watchedValues.odemeSikligi} Ayda Bir Ödenecek Tutar`
                                                : "Aylık Taksit Tutarı"}
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            {formatCurrency(summary.monthlyPayment)}
                                        </Typography>
                                    </Box>

                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                                        * Hesaplamalar yaklaşık değerlerdir. Banka planıyla kuruş farkları olabilir.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} color="inherit">
                        İptal
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading} size="large">
                        {loading ? 'İşleniyor...' : 'Krediyi Kullan'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
