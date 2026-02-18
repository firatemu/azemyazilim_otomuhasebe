import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    TextField,
    MenuItem,
    Grid,
    Alert
} from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AccountBalance, CreditCard, Payment, BusinessCenter } from '@mui/icons-material';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

// Interfaces
interface CreateAccountDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    bankaId: string;
    bankaAdi: string;
    mode?: 'CREATE' | 'EDIT';
    initialData?: any;
}

// Validation Schema
const accountSchema = z.object({
    hesapAdi: z.string().min(1, 'Hesap adı zorunludur'),
    hesapTipi: z.enum(['VADESIZ', 'POS', 'KREDI', 'FIRMA_KREDI_KARTI']),
    hesapNo: z.string().optional(),
    iban: z.string().optional(),
    aktif: z.boolean().default(true),
    // Type-specific fields
    komisyonOrani: z.preprocess((val) => (val === '' || val === undefined || val === null) ? undefined : Number(val), z.number().min(0).max(100).optional()),
    terminalNo: z.string().optional(),
    krediLimiti: z.preprocess((val) => (val === '' || val === undefined || val === null) ? undefined : Number(val), z.number().min(0).optional()),
    kartLimiti: z.preprocess((val) => (val === '' || val === undefined || val === null) ? undefined : Number(val), z.number().min(0).optional()),
    hesapKesimGunu: z.preprocess((val) => (val === '' || val === undefined || val === null) ? undefined : Number(val), z.number().min(1).max(31).optional()),
    sonOdemeGunu: z.preprocess((val) => (val === '' || val === undefined || val === null) ? undefined : Number(val), z.number().min(1).max(31).optional()),
}).superRefine((data, ctx) => {

    if (data.hesapTipi === 'FIRMA_KREDI_KARTI') {
        if (data.kartLimiti === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Kart limiti zorunludur',
                path: ['kartLimiti'],
            });
        }
        if (data.hesapKesimGunu === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Hesap kesim günü zorunludur',
                path: ['hesapKesimGunu'],
            });
        }
        if (data.sonOdemeGunu === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Son ödeme günü zorunludur',
                path: ['sonOdemeGunu'],
            });
        }
    }
    // Removed Commission Rate check for POS accounts as per user request
});

type AccountFormValues = z.infer<typeof accountSchema>;

export const accountTypes = [
    { value: 'VADESIZ', label: 'Vadesiz Hesap', icon: AccountBalance, color: 'primary' },
    { value: 'POS', label: 'POS Hesabı', icon: CreditCard, color: 'success' },
    { value: 'KREDI', label: 'Ticari Kredi', icon: BusinessCenter, color: 'warning' },
    { value: 'FIRMA_KREDI_KARTI', label: 'Firma Kredi Kartı', icon: Payment, color: 'error' },
];

const updateAccount = async (hesapId: string, data: any) => {
    const res = await axios.put(`/banka/hesap/${hesapId}`, data);
    return res.data;
};

const createAccount = async (bankaId: string, data: any) => {
    const res = await axios.post(`/banka/${bankaId}/hesap`, data);
    return res.data;
};

export default function CreateAccountDialog({ open, onClose, onSuccess, bankaId, bankaAdi, mode = 'CREATE', initialData }: CreateAccountDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, reset } = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema) as any,
        values: (initialData ? {
            hesapAdi: initialData.hesapAdi || '',
            hesapTipi: initialData.hesapTipi || 'VADESIZ',
            hesapNo: initialData.hesapNo || '',
            iban: initialData.iban || '',
            aktif: initialData.aktif ?? true,
            komisyonOrani: initialData.komisyonOrani ?? undefined,
            terminalNo: initialData.terminalNo || '',
            krediLimiti: initialData.krediLimiti ?? undefined,
            kartLimiti: initialData.kartLimiti ?? undefined,
            hesapKesimGunu: initialData.hesapKesimGunu ?? undefined,
            sonOdemeGunu: initialData.sonOdemeGunu ?? undefined,
        } : {
            hesapAdi: '',
            hesapTipi: 'VADESIZ',
            hesapNo: '',
            iban: '',
            aktif: true,
            komisyonOrani: undefined,
            terminalNo: '',
            krediLimiti: undefined,
            kartLimiti: undefined,
            hesapKesimGunu: undefined,
            sonOdemeGunu: undefined,
        }) as AccountFormValues,
    });

    const hesapTipi = useWatch({ control, name: 'hesapTipi' });

    const onSubmit = async (values: AccountFormValues) => {
        try {
            setLoading(true);
            if (mode === 'EDIT' && initialData?.id) {
                await updateAccount(initialData.id, values);
                enqueueSnackbar('Hesap başarıyla güncellendi', { variant: 'success' });
            } else {
                await createAccount(bankaId, values);
                enqueueSnackbar('Hesap başarıyla oluşturuldu', { variant: 'success' });
            }
            if (mode === 'CREATE') reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'İşlem sırasında bir hata oluştu', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {mode === 'EDIT' ? 'Hesabı Güncelle' : 'Yeni Hesap Ekle'}
                {bankaAdi && <div style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', marginTop: 4 }}>{bankaAdi}</div>}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={2.5}>
                        <Controller
                            name="hesapTipi"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    select
                                    fullWidth
                                    label="Hesap Tipi"
                                    {...field}
                                    value={field.value ?? ''}
                                >
                                    {accountTypes.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        <Controller
                            name="hesapAdi"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    fullWidth
                                    label="Hesap Adı"
                                    {...field}
                                    value={field.value ?? ''}
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                />
                            )}
                        />

                        {/* IBAN and Account No for VADESIZ, POS, KREDI */}
                        {(hesapTipi === 'VADESIZ' || hesapTipi === 'POS' || hesapTipi === 'KREDI') && (
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="iban"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField {...field} value={field.value ?? ''} fullWidth label="IBAN" />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="hesapNo"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField {...field} value={field.value ?? ''} fullWidth label="Hesap No" />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {/* POS: Commission Rate and Terminal No */}
                        {hesapTipi === 'POS' && (
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Controller
                                        name="komisyonOrani"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                value={field.value ?? ''}
                                                fullWidth
                                                type="number"
                                                label="Komisyon Oranı (%)"
                                                inputProps={{ min: 0, max: 100, step: 0.01 }}
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message || 'POS tahsilatlarda kesilecek komisyon oranı'}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Controller
                                        name="terminalNo"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                value={field.value ?? ''}
                                                fullWidth
                                                label="Terminal No"
                                                placeholder="Terminal Numarası"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {/* KREDI: Credit Limit */}
                        {hesapTipi === 'KREDI' && (
                            // Kredi Limiti input field removed
                            null
                        )}

                        {/* FIRMA_KREDI_KARTI: Card details */}
                        {hesapTipi === 'FIRMA_KREDI_KARTI' && (
                            <>
                                <Controller
                                    name="kartLimiti"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            value={field.value ?? ''}
                                            fullWidth
                                            type="number"
                                            label="Kart Limiti (₺)"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Controller
                                            name="hesapKesimGunu"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <TextField
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    fullWidth
                                                    type="number"
                                                    label="Hesap Kesim Günü"
                                                    inputProps={{ min: 1, max: 31 }}
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Controller
                                            name="sonOdemeGunu"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <TextField
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    fullWidth
                                                    type="number"
                                                    label="Son Ödeme Günü"
                                                    inputProps={{ min: 1, max: 31 }}
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} disabled={loading}>İptal</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
