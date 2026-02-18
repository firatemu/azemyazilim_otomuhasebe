import React from 'react';
import { Box, TextField, Button, Typography, IconButton, Paper, Checkbox, FormControlLabel, Grid } from '@mui/material';
import { Add, Delete, Person } from '@mui/icons-material';
import { CariFormData, CariYetkili } from './types';

interface CariIletisimFormProps {
    data: CariFormData;
    onChange: (field: string, value: any) => void;
}

export const CariIletisimForm: React.FC<CariIletisimFormProps> = ({ data, onChange }) => {
    const yetkililer = data.yetkililer || [];

    const handleAddKeykili = () => {
        const newYetkili: CariYetkili = {
            adSoyad: '',
            unvan: '',
            telefon: '',
            email: '',
            dahili: '',
            varsayilan: false,
            notlar: ''
        };
        onChange('yetkililer', [...yetkililer, newYetkili]);
    };

    const handleRemoveYetkili = (index: number) => {
        const newYetkililer = yetkililer.filter((_, i) => i !== index);
        onChange('yetkililer', newYetkililer);
    };

    const handleUpdateYetkili = (index: number, field: keyof CariYetkili, value: any) => {
        const newYetkililer = [...yetkililer];
        newYetkililer[index] = { ...newYetkililer[index], [field]: value };
        onChange('yetkililer', newYetkililer);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">Ek Yetkililer / Kontak Kişileri</Typography>
                <Button startIcon={<Add />} variant="outlined" size="small" onClick={handleAddKeykili}>
                    Yeni Kişi Ekle
                </Button>
            </Box>

            {yetkililer.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                    Henüz ek yetkili eklenmemiş.
                </Typography>
            )}

            {yetkililer.map((yetkili, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <IconButton size="small" color="error" onClick={() => handleRemoveYetkili(index)}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </Box>

                    <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" /> Kişi #{index + 1}
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(6, 1fr)' }, gap: 2 }}>
                        <TextField
                            fullWidth size="small"
                            label="Ad Soyad"
                            value={yetkili.adSoyad}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateYetkili(index, 'adSoyad', e.target.value)}
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 3' } }}
                        />
                        <TextField
                            fullWidth size="small"
                            label="Ünvan / Görev"
                            value={yetkili.unvan}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateYetkili(index, 'unvan', e.target.value)}
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 3' } }}
                        />
                        <TextField
                            fullWidth size="small"
                            label="Telefon"
                            value={yetkili.telefon}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateYetkili(index, 'telefon', e.target.value)}
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                        />
                        <TextField
                            fullWidth size="small"
                            label="Email"
                            value={yetkili.email}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateYetkili(index, 'email', e.target.value)}
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                        />
                        <TextField
                            fullWidth size="small"
                            label="Notlar"
                            className="form-control-textfield"
                            value={yetkili.notlar}
                            onChange={(e) => handleUpdateYetkili(index, 'notlar', e.target.value)}
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                        />
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={yetkili.varsayilan}
                                        onChange={(e) => handleUpdateYetkili(index, 'varsayilan', e.target.checked)}
                                    />
                                }
                                label="Varsayılan Kontak"
                            />
                        </Box>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};
