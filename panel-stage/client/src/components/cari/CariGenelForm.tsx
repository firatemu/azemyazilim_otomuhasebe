import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Alert } from '@mui/material';
import { CariFormData } from './types';
import { cities } from '@/lib/cities';

interface CariGenelFormProps {
    data: CariFormData;
    onChange: (field: string, value: any) => void;
    onCityChange: (city: string) => void;
    availableDistricts: string[];
    satisElemanlari: any[];
    loadingSalespersons: boolean;
}

export const CariGenelForm: React.FC<CariGenelFormProps> = ({
    data,
    onChange,
    onCityChange,
    availableDistricts,
    satisElemanlari,
    loadingSalespersons
}) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    autoFocus
                    label="Cari Kodu *"
                    className="form-control-textfield"
                    value={data.cariKodu}
                    onChange={(e) => onChange('cariKodu', e.target.value)}
                    placeholder="Otomatik üretilecek"
                    helperText={data.cariKodu ? "Önerilen kod" : "Boş bırakılırsa otomatik üretilecek"}
                    sx={{
                        '& .MuiInputBase-input': {
                            color: data.cariKodu ? 'var(--primary)' : 'var(--foreground)',
                            fontWeight: data.cariKodu ? 500 : 'normal'
                        }
                    }}
                />
                <FormControl fullWidth className="form-control-select">
                    <InputLabel>Tip</InputLabel>
                    <Select
                        value={data.tip}
                        label="Tip"
                        onChange={(e) => onChange('tip', e.target.value)}
                    >
                        <MenuItem value="MUSTERI">Müşteri</MenuItem>
                        <MenuItem value="TEDARIKCI">Tedarikçi</MenuItem>
                        <MenuItem value="HER_IKISI">Her İkisi</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth className="form-control-select">
                    <InputLabel>Durum</InputLabel>
                    <Select
                        value={data.aktif ? 'true' : 'false'}
                        label="Durum"
                        onChange={(e) => onChange('aktif', e.target.value === 'true')}
                    >
                        <MenuItem value="true">✅ Kullanım İçi</MenuItem>
                        <MenuItem value="false">❌ Kullanım Dışı</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TextField
                fullWidth
                label="Ünvan *"
                className="form-control-textfield"
                value={data.unvan}
                onChange={(e) => onChange('unvan', e.target.value)}
                required
                helperText={data.sirketTipi === 'SAHIS' ? 'Şahıs şirketi için işletme adı' : 'Şirket ünvanı'}
            />

            <FormControl fullWidth className="form-control-select">
                <InputLabel>Varsayılan Satış Elemanı</InputLabel>
                <Select
                    value={data.satisElemaniId || ''}
                    label="Varsayılan Satış Elemanı"
                    onChange={(e) => onChange('satisElemaniId', e.target.value)}
                    disabled={loadingSalespersons}
                >
                    <MenuItem value=""><em>Seçiniz</em></MenuItem>
                    {satisElemanlari.map((se: any) => (
                        <MenuItem key={se.id} value={se.id}>{se.adSoyad}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Şirket Tipi ve Vergi Bilgileri */}
            <Box sx={{
                p: 2,
                border: '1px dashed var(--primary)',
                borderRadius: 'var(--radius)',
                bgcolor: 'var(--muted)/10'
            }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'var(--primary)' }}>
                    🏢 Yasal / Ticari Bilgiler
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }} className="form-control-select">
                    <InputLabel>Şirket Tipi</InputLabel>
                    <Select
                        value={data.sirketTipi}
                        label="Şirket Tipi"
                        onChange={(e) => onChange('sirketTipi', e.target.value)}
                    >
                        <MenuItem value="KURUMSAL">🏢 Kurumsal (Ltd, A.Ş)</MenuItem>
                        <MenuItem value="SAHIS">👤 Şahıs Şirketi</MenuItem>
                    </Select>
                </FormControl>

                {data.sirketTipi === 'KURUMSAL' ? (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Vergi No"
                            className="form-control-textfield"
                            value={data.vergiNo}
                            onChange={(e) => onChange('vergiNo', e.target.value)}
                            inputProps={{ maxLength: 10 }}
                        />
                        <TextField
                            fullWidth
                            label="Vergi Dairesi"
                            className="form-control-textfield"
                            value={data.vergiDairesi}
                            onChange={(e) => onChange('vergiDairesi', e.target.value)}
                        />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Alert severity="info" sx={{ py: 0 }}>Şahıs şirketleri için TC Kimlik No ve Ad Soyad giriniz.</Alert>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="TC Kimlik No"
                                className="form-control-textfield"
                                value={data.tcKimlikNo}
                                onChange={(e) => onChange('tcKimlikNo', e.target.value.replace(/\D/g, '').slice(0, 11))}
                            />
                            <TextField
                                fullWidth
                                label="Ad Soyad"
                                className="form-control-textfield"
                                value={data.isimSoyisim}
                                onChange={(e) => onChange('isimSoyisim', e.target.value)}
                            />
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Ana İletişim */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    label="Telefon (Ana)"
                    className="form-control-textfield"
                    value={data.telefon}
                    onChange={(e) => onChange('telefon', e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Email (Ana)"
                    className="form-control-textfield"
                    type="email"
                    value={data.email}
                    onChange={(e) => onChange('email', e.target.value)}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    label="Web Sitesi"
                    className="form-control-textfield"
                    value={data.webSite || ''}
                    onChange={(e) => onChange('webSite', e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Yetkili Kişi (Ana)"
                    className="form-control-textfield"
                    value={data.yetkili}
                    onChange={(e) => onChange('yetkili', e.target.value)}
                />
            </Box>

            {/* Ana Adres */}
            <Box sx={{
                p: 2,
                border: '1px dashed var(--secondary)',
                borderRadius: 'var(--radius)',
                bgcolor: 'var(--muted)/10'
            }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'var(--secondary)' }}>
                    📍 Merkez Adres
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <FormControl fullWidth className="form-control-select">
                        <InputLabel>İl</InputLabel>
                        <Select
                            value={data.il}
                            label="İl"
                            onChange={(e) => onCityChange(e.target.value)}
                        >
                            {cities.map((city) => (
                                <MenuItem key={city} value={city}>{city}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth className="form-control-select">
                        <InputLabel>İlçe</InputLabel>
                        <Select
                            value={data.ilce}
                            label="İlçe"
                            onChange={(e) => onChange('ilce', e.target.value)}
                        >
                            {availableDistricts.map((district) => (
                                <MenuItem key={district} value={district}>{district}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <TextField
                    fullWidth
                    label="Adres Detayı"
                    className="form-control-textfield"
                    multiline
                    rows={2}
                    value={data.adres}
                    onChange={(e) => onChange('adres', e.target.value)}
                />
            </Box>
        </Box>
    );
};
