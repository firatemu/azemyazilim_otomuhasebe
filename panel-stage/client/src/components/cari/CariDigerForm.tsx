import React from 'react';
import { Box, TextField, Paper, Typography, Alert } from '@mui/material';
import { CariFormData } from './types';

interface CariDigerFormProps {
    data: CariFormData;
    onChange: (field: string, value: any) => void;
}

export const CariDigerForm: React.FC<CariDigerFormProps> = ({ data, onChange }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 0.5 }}>
            <Paper variant="outlined" sx={{
                p: 2.5,
                borderRadius: 'var(--radius)',
                bgcolor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: 'var(--shadow-md)',
                    borderColor: 'var(--ring)'
                }
            }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{
                    mb: 2.5,
                    color: 'var(--foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    pb: 1.5,
                    borderBottom: '2px solid var(--border)',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        width: '4px',
                        height: '24px',
                        bgcolor: 'var(--primary)',
                        borderRadius: '2px',
                        mr: 1
                    }
                }}>
                    <span style={{ fontSize: '1.2rem' }}>🏷️</span> Gruplama ve Özel Kodlar
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                    <TextField
                        fullWidth size="small"
                        label="Sektör"
                        className="form-control-textfield"
                        value={data.sektor || ''}
                        onChange={(e) => onChange('sektor', e.target.value)}
                        placeholder="Örn: Teknoloji, İnşaat..."
                        sx={{ bgcolor: 'var(--background)', borderRadius: 'var(--radius)' }}
                    />
                    <TextField
                        fullWidth size="small"
                        label="Özel Kod 1"
                        className="form-control-textfield"
                        value={data.ozelKod1 || ''}
                        onChange={(e) => onChange('ozelKod1', e.target.value)}
                        helperText="Raporlama için özel gruplama"
                        sx={{ bgcolor: 'var(--background)', borderRadius: 'var(--radius)' }}
                    />
                    <TextField
                        fullWidth size="small"
                        label="Özel Kod 2"
                        className="form-control-textfield"
                        value={data.ozelKod2 || ''}
                        onChange={(e) => onChange('ozelKod2', e.target.value)}
                        sx={{ bgcolor: 'var(--background)', borderRadius: 'var(--radius)' }}
                    />
                </Box>
            </Paper>

            {/* E-DÖNÜŞÜM BİLGİLERİ */}
            <Paper variant="outlined" sx={{
                p: 2.5,
                borderRadius: 'var(--radius)',
                bgcolor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: 'var(--shadow-md)',
                    borderColor: 'var(--ring)'
                }
            }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{
                    mb: 2.5,
                    color: 'var(--foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    pb: 1.5,
                    borderBottom: '2px solid var(--border)',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        width: '4px',
                        height: '24px',
                        bgcolor: 'var(--primary)',
                        borderRadius: '2px',
                        mr: 1
                    }
                }}>
                    <span style={{ fontSize: '1.2rem' }}>📧</span> E-Dönüşüm Bilgileri
                </Typography>

                <Alert severity="info" sx={{
                    mb: 2.5,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid color-mix(in srgb, var(--info) 20%, transparent)',
                    bgcolor: 'color-mix(in srgb, var(--info) 10%, transparent)'
                }}>
                    e-Fatura kullanıcıları için posta kutusu ve gönderici birim bilgileri
                </Alert>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                    <TextField
                        fullWidth size="small"
                        label="Posta Kutusu Etiketi"
                        className="form-control-textfield"
                        value={data.efaturaPostaKutusu || ''}
                        onChange={(e) => onChange('efaturaPostaKutusu', e.target.value)}
                        placeholder="urn:mail:firmaalias@urn.ettn.tr"
                        helperText="e-Fatura adresi"
                        sx={{ bgcolor: 'var(--background)', borderRadius: 'var(--radius)' }}
                    />
                    <TextField
                        fullWidth size="small"
                        label="Gönderici Birim Etiketi"
                        className="form-control-textfield"
                        value={data.efaturaGondericiBirim || ''}
                        onChange={(e) => onChange('efaturaGondericiBirim', e.target.value)}
                        placeholder="Örn: 1234567890"
                        helperText="GİB gönderici birim kodu"
                        sx={{ bgcolor: 'var(--background)', borderRadius: 'var(--radius)' }}
                    />
                </Box>
            </Paper>

            <Alert severity="info" sx={{
                borderRadius: 'calc(var(--radius) * 1.5)',
                border: '1px solid color-mix(in srgb, var(--info) 20%, transparent)',
                bgcolor: 'color-mix(in srgb, var(--info) 10%, transparent)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                Özel kodlar, raporlarda filtreleme ve gruplama yapmak için kullanılabilir.
            </Alert>
        </Box>
    );
};
