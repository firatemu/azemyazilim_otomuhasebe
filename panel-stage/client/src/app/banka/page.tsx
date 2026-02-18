'use client';

import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Stack,
    Autocomplete
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    AccountBalance,
    Search,
    Visibility
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from '@/lib/axios';
import MainLayout from '@/components/Layout/MainLayout';
import CreateAccountDialog from '@/components/Banka/CreateAccountDialog';
import { TURKISH_BANKS, getBankLogo } from '@/constants/bankalar';

// Constants moved to @/constants/bankalar

// Interfaces
interface Banka {
    id: string;
    ad: string;
    sube?: string;
    sehir?: string;
    yetkili?: string;
    telefon?: string;
    logo?: string;
    durum: boolean;
    _count?: {
        hesaplar: number;
    };
}

// Service
const fetchBankalar = async () => {
    const res = await axios.get('/banka');
    return res.data;
};

const createBanka = async (data: any) => {
    const res = await axios.post('/banka', data);
    return res.data;
};

const updateBanka = async (id: string, data: any) => {
    const res = await axios.put(`/banka/${id}`, data);
    return res.data;
};

const deleteBanka = async (id: string) => {
    const res = await axios.delete(`/banka/${id}`);
    return res.data;
};

// Validation Schema
const bankaSchema = z.object({
    ad: z.string().min(1, 'Banka adı zorunludur'),
    sube: z.string().optional(),
    sehir: z.string().optional(),
    yetkili: z.string().optional(),
    telefon: z.string().optional(),
    durum: z.boolean(),
});

type BankaFormValues = z.infer<typeof bankaSchema>;

export default function BankaPage() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [bankalar, setBankalar] = useState<Banka[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedBanka, setSelectedBanka] = useState<Banka | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);
    const [selectedBankaForAccount, setSelectedBankaForAccount] = useState<Banka | null>(null);

    const { control, handleSubmit, reset, setValue } = useForm<BankaFormValues>({
        resolver: zodResolver(bankaSchema),
        defaultValues: {
            ad: '',
            sube: '',
            sehir: '',
            yetkili: '',
            telefon: '',
            durum: true,
        },
    });

    const loadBankalar = async () => {
        try {
            setLoading(true);
            const data = await fetchBankalar();
            setBankalar(data);
        } catch (error) {
            enqueueSnackbar('Bankalar yüklenirken bir hata oluştu', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBankalar();
    }, []);

    const onSubmit = async (values: BankaFormValues) => {
        try {
            const logo = getBankLogo(values.ad);
            const dataToSubmit = { ...values, logo };

            if (selectedBanka) {
                await updateBanka(selectedBanka.id, dataToSubmit);
                enqueueSnackbar('Banka güncellendi', { variant: 'success' });
            } else {
                await createBanka(dataToSubmit);
                enqueueSnackbar('Banka oluşturuldu', { variant: 'success' });
            }
            setDialogOpen(false);
            loadBankalar();
            reset();
            setSelectedBanka(null);
        } catch (error) {
            enqueueSnackbar('İşlem başarısız oldu', { variant: 'error' });
        }
    };

    const handleEdit = (banka: Banka) => {
        setSelectedBanka(banka);
        setValue('ad', banka.ad);
        setValue('sube', banka.sube || '');
        setValue('sehir', banka.sehir || '');
        setValue('yetkili', banka.yetkili || '');
        setValue('telefon', banka.telefon || '');
        setValue('durum', banka.durum);
        setDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedBanka) return;
        try {
            await deleteBanka(selectedBanka.id);
            enqueueSnackbar('Banka silindi', { variant: 'success' });
            setDeleteConfirmOpen(false);
            setSelectedBanka(null);
            loadBankalar();
        } catch (error) {
            enqueueSnackbar('Silme işlemi başarısız', { variant: 'error' });
        }
    };

    const filteredBankalar = bankalar.filter(banka =>
        banka.ad.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banka.sube?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedBanka(null);
        reset({
            ad: '',
            sube: '',
            sehir: '',
            yetkili: '',
            telefon: '',
            durum: true,
        });
        setDialogOpen(true);
    };

    return (
        <MainLayout>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, background: 'linear-gradient(45deg, #2563eb, #3b82f6)', backgroundClip: 'text', textFillColor: 'transparent', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Bankalar
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Banka ve hesaplarınızı buradan yönetebilirsiniz.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCreate}
                        sx={{
                            background: 'linear-gradient(45deg, #2563eb, #3b82f6)',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                        }}
                    >
                        Yeni Banka Ekle
                    </Button>
                </Box>

                {/* Main Content */}
                <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 3 }}>
                        {/* Toolbar */}
                        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                            <TextField
                                size="small"
                                placeholder="Banka veya şube ara..."
                                InputProps={{
                                    startAdornment: <Search color="action" fontSize="small" sx={{ mr: 1 }} />,
                                }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{ width: 300 }}
                            />
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Banka Adı</TableCell>
                                        <TableCell>Şube - Şehir</TableCell>
                                        <TableCell>Yetkili / Telefon</TableCell>
                                        <TableCell>Hesap Sayısı</TableCell>
                                        <TableCell>Durum</TableCell>
                                        <TableCell align="right">İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredBankalar.map((banka) => (
                                        <TableRow key={banka.id} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/banka/${banka.id}`)}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 2,
                                                        bgcolor: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'primary.main',
                                                        overflow: 'hidden',
                                                        border: '1px solid var(--border)'
                                                    }}>
                                                        {getBankLogo(banka.ad, banka.logo) ? (
                                                            <Box component="img" src={getBankLogo(banka.ad, banka.logo)!} sx={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                                        ) : (
                                                            <AccountBalance />
                                                        )}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight="600">
                                                            {banka.ad}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{banka.sube}</Typography>
                                                <Typography variant="caption" color="text.secondary">{banka.sehir}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{banka.yetkili}</Typography>
                                                <Typography variant="caption" color="text.secondary">{banka.telefon}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`${banka._count?.hesaplar || 0} Hesap`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={banka.durum ? 'Aktif' : 'Pasif'}
                                                    color={banka.durum ? 'success' : 'default'}
                                                    size="small"
                                                    sx={{ borderRadius: 1 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    title="Hesapları İncele"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/banka/${banka.id}`);
                                                    }}
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(banka);
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    title="Hesap Ekle"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedBankaForAccount(banka);
                                                        setAccountDialogOpen(true);
                                                    }}
                                                >
                                                    <Add fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedBanka(banka);
                                                        setDeleteConfirmOpen(true);
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredBankalar.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Typography color="text.secondary">
                                                    Kayıt bulunamadı.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                {/* Add/Edit Dialog */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {selectedBanka ? 'Banka Düzenle' : 'Yeni Banka Ekle'}
                    </DialogTitle>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogContent>
                            <Stack spacing={2}>
                                <Controller
                                    name="ad"
                                    control={control}
                                    render={({ field: { onChange, value, ...field }, fieldState }) => (
                                        <Autocomplete
                                            freeSolo
                                            options={TURKISH_BANKS}
                                            value={value || ''}
                                            onChange={(_, newValue) => onChange(newValue)}
                                            onInputChange={(_, newInputValue) => onChange(newInputValue)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    {...field}
                                                    label="Banka Adı"
                                                    fullWidth
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                />
                                            )}
                                        />
                                    )}
                                />
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Controller
                                            name="sube"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} fullWidth label="Şube" />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Controller
                                            name="sehir"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} fullWidth label="Şehir" />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Controller
                                            name="yetkili"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} fullWidth label="Yetkili" />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Controller
                                            name="telefon"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} fullWidth label="Telefon" />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                                <Controller
                                    name="durum"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                            }
                                            label="Aktif"
                                        />
                                    )}
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDialogOpen(false)}>İptal</Button>
                            <Button type="submit" variant="contained">Kaydet</Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* Delete Confirmation */}
                <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                    <DialogTitle>Banka Silinecek</DialogTitle>
                    <DialogContent>
                        <Typography>
                            "{selectedBanka?.ad}" bankasını silmek istediğinize emin misiniz? Bu işlem bankaya bağlı hesapları da silecektir.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirmOpen(false)}>İptal</Button>
                        <Button onClick={handleDelete} color="error" variant="contained">Sil</Button>
                    </DialogActions>
                </Dialog>

                {/* Create Account Dialog */}
                <CreateAccountDialog
                    open={accountDialogOpen}
                    onClose={() => setAccountDialogOpen(false)}
                    onSuccess={loadBankalar}
                    bankaId={selectedBankaForAccount?.id || ''}
                    bankaAdi={selectedBankaForAccount?.ad || ''}
                />
            </Container>
        </MainLayout >
    );
}
