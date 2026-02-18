import React from 'react';
import { Box, TextField, Button, Typography, IconButton, Paper, Grid, InputAdornment } from '@mui/material';
import { Add, Delete, AccountBalance } from '@mui/icons-material';
import { CariFormData, CariBanka } from './types';

interface CariBankaFormProps {
    data: CariFormData;
    onChange: (field: string, value: any) => void;
}

export const CariBankaForm: React.FC<CariBankaFormProps> = ({ data, onChange }) => {
    const tedarikciBankalar = data.tedarikciBankalar || [];

    const handleAddBanka = () => {
        const newBanka: CariBanka = {
            bankaAdi: '',
            subeAdi: '',
            subeKodu: '',
            hesapNo: '',
            iban: '',
            paraBirimi: 'TRY',
            aciklama: ''
        };
        onChange('tedarikciBankalar', [...tedarikciBankalar, newBanka]);
    };

    const handleRemoveBanka = (index: number) => {
        const newBankalar = tedarikciBankalar.filter((_, i) => i !== index);
        onChange('tedarikciBankalar', newBankalar);
    };

    const handleUpdateBanka = (index: number, field: keyof CariBanka, value: any) => {
        const newBankalar = [...tedarikciBankalar];
        newBankalar[index] = { ...newBankalar[index], [field]: value };
        onChange('tedarikciBankalar', newBankalar);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">Tedarikçi Banka Hesapları</Typography>
                    <Button startIcon={<Add />} variant="outlined" size="small" onClick={handleAddBanka}>
                        Yeni Hesap Ekle
                    </Button>
                </Box>
                <Typography variant="caption" color="text.secondary">
                    Tedarikçiye yapılacak ödemeler için kullanılacak hesap bilgileri.
                </Typography>
            </Box>


            {tedarikciBankalar.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                    Kayıtlı banka hesabı yok.
                </Typography>
            )}

            {tedarikciBankalar.map((banka, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <IconButton size="small" color="error" onClick={() => handleRemoveBanka(index)}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </Box>

                    <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalance fontSize="small" /> Hesap #{index + 1}
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                        <TextField
                            fullWidth size="small"
                            label="Banka Adı"
                            value={banka.bankaAdi}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateBanka(index, 'bankaAdi', e.target.value)}
                        />
                        <TextField
                            fullWidth size="small"
                            label="IBAN"
                            value={banka.iban}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateBanka(index, 'iban', e.target.value)}
                            placeholder="TR..."
                        />
                        <TextField
                            fullWidth size="small"
                            label="Şube"
                            value={banka.subeAdi}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateBanka(index, 'subeAdi', e.target.value)}
                        />
                        <TextField
                            fullWidth size="small"
                            label="Hesap No"
                            value={banka.hesapNo}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateBanka(index, 'hesapNo', e.target.value)}
                        />
                        <TextField
                            fullWidth size="small"
                            label="Para Birimi"
                            value={banka.paraBirimi}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateBanka(index, 'paraBirimi', e.target.value)}
                        />
                        <TextField
                            fullWidth size="small"
                            label="Açıklama"
                            value={banka.aciklama}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateBanka(index, 'aciklama', e.target.value)}
                            sx={{ gridColumn: '1 / -1' }}
                        />
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};

