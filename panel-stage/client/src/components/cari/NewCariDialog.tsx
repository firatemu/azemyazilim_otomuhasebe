import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import axios from '@/lib/axios';
import { getDistricts } from '@/lib/cities';
import CariForm from '../CariForm';
import { CariFormData, initialCariFormData } from './types';

interface NewCariDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function NewCariDialog({ open, onClose, onSuccess, showSnackbar }: NewCariDialogProps) {
    const [formData, setFormData] = useState<CariFormData>(initialCariFormData);
    const [selectedCity, setSelectedCity] = useState('İstanbul');
    const [satisElemanlari, setSatisElemanlari] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Memoize districts to prevent unnecessary re-renders
    const availableDistricts = useMemo(() => getDistricts(selectedCity), [selectedCity]);

    // Fetch sales representatives once on mount
    useEffect(() => {
        const fetchSatisElemanlari = async () => {
            try {
                const response = await axios.get('/satis-elemani');
                setSatisElemanlari(response.data || []);
            } catch (error) {
                console.error('Satış elemanları yüklenirken hata:', error);
            }
        };
        fetchSatisElemanlari();
    }, []);

    // Reset form and fetch next code when dialog opens
    useEffect(() => {
        if (open) {
            const initForm = async () => {
                let nextCode = '';
                try {
                    const response = await axios.get('/code-template/next-code/CUSTOMER');
                    nextCode = response.data.nextCode || '';
                } catch (error) {
                    console.log('Otomatik kod alınamadı, boş bırakılacak');
                }

                setFormData({
                    ...initialCariFormData,
                    cariKodu: nextCode || '',
                });
                setSelectedCity('İstanbul');
            };
            initForm();
        }
    }, [open]);

    const handleCityChange = useCallback((city: string) => {
        setSelectedCity(city);
        const districts = getDistricts(city);
        setFormData(prev => ({ ...prev, il: city, ilce: districts[0] || 'Merkez' }));
    }, []);

    const handleFormChange = useCallback((field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const prepareDataToSend = (data: CariFormData) => {
        const dataToSend: any = { ...data };

        // Tip dönüşümleri
        if (dataToSend.vadeSuresi) {
            dataToSend.vadeSuresi = parseInt(dataToSend.vadeSuresi) || 0;
        } else {
            dataToSend.vadeSuresi = undefined;
        }

        if (!dataToSend.vadeGun && dataToSend.vadeSuresi) {
            dataToSend.vadeGun = dataToSend.vadeSuresi;
        }

        // Şahıs şirketi değilse TC ve isim-soyisim temizle
        if (data.sirketTipi !== 'SAHIS') {
            dataToSend.tcKimlikNo = undefined;
            dataToSend.isimSoyisim = undefined;
        } else {
            dataToSend.vergiNo = undefined;
            dataToSend.vergiDairesi = undefined;
        }

        // Boş risk değerleri
        if (!dataToSend.riskLimiti) dataToSend.riskLimiti = 0;
        if (!dataToSend.teminatTutar) dataToSend.teminatTutar = 0;

        // cariKodu temizliği
        if (!dataToSend.cariKodu || !dataToSend.cariKodu.trim()) {
            dataToSend.cariKodu = undefined;
        } else {
            dataToSend.cariKodu = dataToSend.cariKodu.trim();
        }

        // Boş alanları temizle
        const nullableFields = ['telefon', 'email', 'yetkili', 'vergiNo', 'vergiDairesi', 'tcKimlikNo', 'isimSoyisim', 'adres', 'webSite', 'faks', 'sektor', 'ozelKod1', 'ozelKod2', 'bankaBilgileri', 'satisElemaniId'];
        nullableFields.forEach(field => {
            if (dataToSend[field] !== undefined && (dataToSend[field] === '' || dataToSend[field] === null)) {
                dataToSend[field] = undefined;
            }
        });

        // İlişkili tabloları temizle (Prisma ID'lerini ve relation ID'lerini sil)
        if (dataToSend.yetkililer) {
            dataToSend.yetkililer = dataToSend.yetkililer.map((y: any) => {
                const { id, cariId, createdAt, updatedAt, ...rest } = y;
                return rest;
            });
        }

        if (dataToSend.ekAdresler) {
            dataToSend.ekAdresler = dataToSend.ekAdresler.map((a: any) => {
                const { id, cariId, createdAt, updatedAt, ...rest } = a;
                return rest;
            });
        }

        if (dataToSend.tedarikciBankalar) {
            dataToSend.tedarikciBankalar = dataToSend.tedarikciBankalar.map((b: any) => {
                const { id, cariId, createdAt, updatedAt, ...rest } = b;
                return rest;
            });
        }

        return dataToSend;
    };

    const handleAdd = async () => {
        try {
            if (!formData.unvan || !formData.unvan.trim()) {
                showSnackbar('Ünvan boş olamaz', 'error');
                return;
            }

            setLoading(true);
            const dataToSend = prepareDataToSend(formData);

            await axios.post('/cari', dataToSend);
            showSnackbar('Cari başarıyla eklendi', 'success');
            onSuccess();
            onClose();
        } catch (error: any) {
            showSnackbar(error.response?.data?.message || 'Cari eklenemedi', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    bgcolor: 'var(--card)',
                    backgroundImage: 'none',
                },
            }}
        >
            <DialogTitle sx={{
                bgcolor: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 700,
                fontSize: '1.125rem',
            }}>
                Yeni Cari Ekle
                <IconButton size="small" onClick={onClose} sx={{ color: 'var(--secondary-foreground)' }}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'var(--background)' }}>
                <CariForm
                    data={formData}
                    onChange={handleFormChange}
                    onCityChange={handleCityChange}
                    availableDistricts={availableDistricts}
                    satisElemanlari={satisElemanlari}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'var(--muted-foreground)',
                        '&:hover': {
                            bgcolor: 'var(--muted)',
                        },
                    }}
                >
                    İptal
                </Button>
                <Button
                    variant="contained"
                    onClick={handleAdd}
                    disabled={loading}
                    sx={{
                        bgcolor: 'var(--secondary)',
                        color: 'var(--secondary-foreground)',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            bgcolor: 'var(--secondary-hover)',
                        },
                    }}
                >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
