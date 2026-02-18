import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Typography, InputAdornment } from '@mui/material';
import { CariFormData } from './types';

interface CariFinansFormProps {
    data: CariFormData;
    onChange: (field: string, value: any) => void;
}

export const CariFinansForm: React.FC<CariFinansFormProps> = ({ data, onChange }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>

            {/* Risk Yönetimi */}
            <Box sx={{
                p: 2,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                bgcolor: 'var(--muted)/10'
            }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    ⚠️ Risk Yönetimi
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200 }} className="form-control-select">
                        <InputLabel>Risk Durumu</InputLabel>
                        <Select
                            value={data.riskDurumu || 'NORMAL'}
                            label="Risk Durumu"
                            onChange={(e) => onChange('riskDurumu', e.target.value)}
                        >
                            <MenuItem value="NORMAL">✅ Normal</MenuItem>
                            <MenuItem value="RISKLI">⚠️ Riskli</MenuItem>
                            <MenuItem value="BLOKELI">⛔ Blokeli</MenuItem>
                            <MenuItem value="TAKIPTE">⚖️ Hukuki Takipte</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Risk Limiti (TL)"
                        className="form-control-textfield"
                        type="number"
                        value={data.riskLimiti}
                        onChange={(e) => onChange('riskLimiti', parseFloat(e.target.value))}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                        }}
                    />

                    <TextField
                        label="Teminat Tutarı (TL)"
                        className="form-control-textfield"
                        type="number"
                        value={data.teminatTutar}
                        onChange={(e) => onChange('teminatTutar', parseFloat(e.target.value))}
                        helperText="Çek, Senet, Mektup vb."
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                        }}
                    />
                </Box>
            </Box>

            {/* Ödeme Koşulları */}
            <Box sx={{
                p: 2,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)'
            }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    💳 Ödeme Koşulları
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Varsayılan Vade (Gün)"
                        className="form-control-textfield"
                        type="number"
                        value={data.vadeGun}
                        onChange={(e) => onChange('vadeGun', parseInt(e.target.value))}
                        helperText="Faturalar için otomatik vade hesaplaması"
                    />

                    <FormControl sx={{ minWidth: 150 }} className="form-control-select">
                        <InputLabel>Para Birimi</InputLabel>
                        <Select
                            value={data.paraBirimi || 'TRY'}
                            label="Para Birimi"
                            onChange={(e) => onChange('paraBirimi', e.target.value)}
                        >
                            <MenuItem value="TRY">TRY - Türk Lirası</MenuItem>
                            <MenuItem value="USD">USD - Amerikan Doları</MenuItem>
                            <MenuItem value="EUR">EUR - Euro</MenuItem>
                            <MenuItem value="GBP">GBP - İngiliz Sterlini</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Banka Bilgileri (Basit Metin) */}
            <TextField
                fullWidth
                label="Banka Notları / Ödeme Bilgileri"
                className="form-control-textfield"
                multiline
                rows={3}
                value={data.bankaBilgileri || ''}
                onChange={(e) => onChange('bankaBilgileri', e.target.value)}
                placeholder="Örn: X Bankası TRIBAN..."
                helperText="Tedarikçi ödemeleri için genel notlar"
            />
        </Box>
    );
};
