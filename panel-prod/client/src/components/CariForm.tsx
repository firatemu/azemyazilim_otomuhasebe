import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { cities } from '@/lib/cities';

interface CariFormProps {
  data: {
    cariKodu: string;
    unvan: string;
    tip: string;
    sirketTipi: string;
    vergiNo: string;
    vergiDairesi: string;
    tcKimlikNo: string;
    isimSoyisim: string;
    telefon: string;
    email: string;
    yetkili: string;
    ulke: string;
    il: string;
    ilce: string;
    adres: string;
    vadeSuresi: string;
    aktif: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
  onCityChange: (city: string) => void;
  availableDistricts: string[];
}

const CariForm = React.memo(({ data, onChange, onCityChange, availableDistricts }: CariFormProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Cari Kodu *"
          className="form-control-textfield"
          value={data.cariKodu}
          onChange={(e) => onChange('cariKodu', e.target.value)}
          placeholder="Otomatik üretilecek"
          helperText={data.cariKodu ? "Önerilen kod (değiştirilebilir veya silinebilir)" : "Boş bırakılırsa otomatik üretilecek"}
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
            <MenuItem value="true">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ color: 'var(--chart-2)', fontSize: '1.2em' }}>✓</span>
                <Typography>Kullanım İçi</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="false">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ color: 'var(--destructive)', fontSize: '1.2em' }}>✗</span>
                <Typography>Kullanım Dışı</Typography>
              </Box>
            </MenuItem>
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

      {/* TİCARİ BİLGİLER */}
      <Box sx={{
        p: 2,
        border: '2px dashed var(--primary)',
        borderRadius: 'var(--radius)',
        bgcolor: 'color-mix(in srgb, var(--primary) 5%, transparent)'
      }}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'var(--primary)' }}>
          🏢 Ticari Bilgiler
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }} className="form-control-select">
          <InputLabel>Şirket Tipi</InputLabel>
          <Select
            value={data.sirketTipi}
            label="Şirket Tipi"
            onChange={(e) => onChange('sirketTipi', e.target.value)}
          >
            <MenuItem value="KURUMSAL">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>🏢 Kurumsal Şirket</Typography>
                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                  (Ltd, A.Ş, vb.)
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="SAHIS">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>👤 Şahıs Şirketi</Typography>
                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                  (Şahıs işletmesi)
                </Typography>
              </Box>
            </MenuItem>
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
              helperText="10 haneli vergi numarası"
            />
            <TextField
              fullWidth
              label="Vergi Dairesi"
              className="form-control-textfield"
              value={data.vergiDairesi}
              onChange={(e) => onChange('vergiDairesi', e.target.value)}
              helperText="Bağlı olduğu vergi dairesi"
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>Şahıs şirketi:</strong> TC Kimlik No vergi numarası yerine kullanılır.
                Fatura için işletme sahibinin adı soyadı gereklidir.
              </Typography>
            </Alert>
            <TextField
              fullWidth
              label="TC Kimlik No"
              className="form-control-textfield"
              value={data.tcKimlikNo}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                  onChange('tcKimlikNo', value);
                }
              }}
              inputProps={{ maxLength: 11 }}
              helperText={`TC Kimlik Numarası (${data.tcKimlikNo.length}/11)`}
              error={data.tcKimlikNo.length > 0 && data.tcKimlikNo.length !== 11}
            />
            <TextField
              fullWidth
              label="İşletme Sahibi Adı Soyadı"
              className="form-control-textfield"
              value={data.isimSoyisim}
              onChange={(e) => onChange('isimSoyisim', e.target.value)}
              placeholder="Ahmet Yılmaz"
              helperText="Faturada görünecek ad soyad"
            />
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Telefon"
          className="form-control-textfield"
          value={data.telefon}
          onChange={(e) => onChange('telefon', e.target.value)}
          placeholder="0555 123 4567"
        />
        <TextField
          fullWidth
          label="Email"
          className="form-control-textfield"
          type="email"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="ornek@email.com"
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Yetkili"
          className="form-control-textfield"
          value={data.yetkili}
          onChange={(e) => onChange('yetkili', e.target.value)}
          placeholder="Yetkili kişi adı"
        />
        <TextField
          fullWidth
          label="Vade Süresi (gün)"
          className="form-control-textfield"
          type="number"
          value={data.vadeSuresi}
          onChange={(e) => onChange('vadeSuresi', e.target.value)}
          placeholder="Örn: 15, 30, 60"
          helperText="Faturalarda otomatik vade hesaplaması için"
          inputProps={{ min: 0, max: 365 }}
        />
      </Box>

      {/* ADRES BİLGİLERİ */}
      <Box sx={{
        p: 2,
        border: '2px dashed var(--secondary)',
        borderRadius: 'var(--radius)',
        bgcolor: 'color-mix(in srgb, var(--secondary) 5%, transparent)'
      }}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'var(--secondary)' }}>
          📍 Adres Bilgileri
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Ülke"
            className="form-control-textfield"
            value={data.ulke}
            disabled
            InputProps={{
              readOnly: true,
            }}
          />
        </Box>

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
          rows={3}
          value={data.adres}
          onChange={(e) => onChange('adres', e.target.value)}
          placeholder="Mahalle, Sokak, Bina No, Daire No vb."
          helperText="Mahalle, sokak, bina no gibi detayları buraya yazın"
        />
      </Box>
    </Box>
  );
});

CariForm.displayName = 'CariForm';

export default CariForm;

