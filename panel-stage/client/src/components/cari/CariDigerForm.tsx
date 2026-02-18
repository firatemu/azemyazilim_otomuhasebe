import React from 'react';
import { Box, TextField, Typography, Grid } from '@mui/material';
import { CariFormData } from './types';

interface CariDigerFormProps {
    data: CariFormData;
    onChange: (field: string, value: any) => void;
}

export const CariDigerForm: React.FC<CariDigerFormProps> = ({ data, onChange }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
                📁 Kategorizasyon ve Diğer Bilgiler
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                    fullWidth
                    label="Sektör / Grup Kodu"
                    value={data.sektor || ''}
                    className="form-control-textfield"
                    onChange={(e) => onChange('sektor', e.target.value)}
                    helperText="Örn: Gıda, Tekstil, İnşaat"
                />
                <TextField
                    fullWidth
                    label="Faks"
                    value={data.faks || ''}
                    className="form-control-textfield"
                    onChange={(e) => onChange('faks', e.target.value)}
                />

                {/* Özel Kodlar */}
                <TextField
                    fullWidth
                    label="Özel Kod 1"
                    value={data.ozelKod1 || ''}
                    className="form-control-textfield"
                    onChange={(e) => onChange('ozelKod1', e.target.value)}
                    helperText="Raporlama amaçlı gruplandırma için"
                />
                <TextField
                    fullWidth
                    label="Özel Kod 2"
                    value={data.ozelKod2 || ''}
                    className="form-control-textfield"
                    onChange={(e) => onChange('ozelKod2', e.target.value)}
                />
            </Box>
        </Box>
    );
};
