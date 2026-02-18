import React from 'react';
import { Box, TextField, Button, Typography, IconButton, Paper, FormControl, InputLabel, Select, MenuItem, Grid, Checkbox, FormControlLabel } from '@mui/material';
import { Add, Delete, LocationOn } from '@mui/icons-material';
import { CariFormData, CariAdres } from './types';
import { cities } from '@/lib/cities';

interface CariAdresFormProps {
    data: CariFormData;
    onChange: (field: string, value: any) => void;
}

export const CariAdresForm: React.FC<CariAdresFormProps> = ({ data, onChange }) => {
    const ekAdresler = data.ekAdresler || [];

    const handleAddAdres = () => {
        const newAdres: CariAdres = {
            baslik: '',
            tip: 'SEVK',
            adres: '',
            il: 'İstanbul',
            ilce: '',
            postaKodu: '',
            varsayilan: false
        };
        onChange('ekAdresler', [...ekAdresler, newAdres]);
    };

    const handleRemoveAdres = (index: number) => {
        const newAdresler = ekAdresler.filter((_, i) => i !== index);
        onChange('ekAdresler', newAdresler);
    };

    const handleUpdateAdres = (index: number, field: keyof CariAdres, value: any) => {
        const newAdresler = [...ekAdresler];
        newAdresler[index] = { ...newAdresler[index], [field]: value };
        onChange('ekAdresler', newAdresler);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">Şube / Depo / Sevk Adresleri</Typography>
                <Button startIcon={<Add />} variant="outlined" size="small" onClick={handleAddAdres}>
                    Yeni Adres Ekle
                </Button>
            </Box>

            {ekAdresler.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                    Merkez adres haricinde kayıtlı ek adres yok.
                </Typography>
            )}

            {ekAdresler.map((adres, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <IconButton size="small" color="error" onClick={() => handleRemoveAdres(index)}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </Box>

                    <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" /> Adres #{index + 1}
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                            fullWidth size="small"
                            label="Adres Başlığı"
                            placeholder="Örn: Merkez Depo"
                            value={adres.baslik}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateAdres(index, 'baslik', e.target.value)}
                        />
                        <FormControl fullWidth size="small" className="form-control-select">
                            <InputLabel>Adres Tipi</InputLabel>
                            <Select
                                value={adres.tip}
                                label="Adres Tipi"
                                onChange={(e) => handleUpdateAdres(index, 'tip', e.target.value)}
                            >
                                <MenuItem value="SEVK">🚛 Sevk Adresi</MenuItem>
                                <MenuItem value="FATURA">📄 Fatura Adresi</MenuItem>
                                <MenuItem value="DIGER">📍 Diğer</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small" className="form-control-select">
                            <InputLabel>İl</InputLabel>
                            <Select
                                value={adres.il || 'İstanbul'}
                                label="İl"
                                onChange={(e) => handleUpdateAdres(index, 'il', e.target.value)}
                            >
                                {cities.map((city) => (
                                    <MenuItem key={city} value={city}>{city}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth size="small"
                            label="İlçe"
                            value={adres.ilce}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateAdres(index, 'ilce', e.target.value)}
                        />

                        <TextField
                            fullWidth size="small"
                            label="Adres Detayı"
                            multiline rows={2}
                            value={adres.adres}
                            className="form-control-textfield"
                            onChange={(e) => handleUpdateAdres(index, 'adres', e.target.value)}
                            sx={{ gridColumn: '1 / -1' }}
                        />
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={adres.varsayilan}
                                        onChange={(e) => handleUpdateAdres(index, 'varsayilan', e.target.checked)}
                                    />
                                }
                                label="Varsayılan Sevk Adresi"
                            />
                        </Box>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};
