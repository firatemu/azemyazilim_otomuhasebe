'use client';

import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Stack,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Payment,
  TrendingUp,
  TrendingDown,
  Badge,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Personel {
  id: string;
  personelKodu: string;
  tcKimlikNo: string;
  ad: string;
  soyad: string;
  dogumTarihi: string | null;
  cinsiyet: 'ERKEK' | 'KADIN' | 'BELIRTILMEMIS' | null;
  medeniDurum: 'BEKAR' | 'EVLI' | null;
  telefon: string;
  email: string | null;
  adres: string | null;
  il: string | null;
  ilce: string | null;
  pozisyon: string;
  departman: string | null;
  iseBaslamaTarihi: string;
  istenCikisTarihi: string | null;
  aktif: boolean;
  maas: number;
  maasGunu: number | null;
  sgkNo: string | null;
  ibanNo: string | null;
  bakiye: number;
  aciklama: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUser?: { id: string; fullName: string; username: string };
  updatedByUser?: { id: string; fullName: string; username: string };
  _count?: { odemeler: number };
}

interface Stats {
  toplamPersonel: number;
  toplamMaasBordro: number;
  toplamBakiye: number;
  departmanlar: Array<{
    departman: string;
    personelSayisi: number;
    toplamMaas: number;
  }>;
}

// Personel Ödeme Dialog
const PersonelOdemeDialog = memo(({
  personel,
  kasalar,
  onSave,
  onClose,
}: {
  personel: Personel;
  kasalar: any[];
  onSave: (data: any) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    tip: 'HAK_EDIS',
    tutar: '',
    tarih: new Date().toISOString().split('T')[0],
    donem: '',
    aciklama: '',
    kasaId: '',
  });

  const odemeTipleri = [
    { value: 'HAK_EDIS', label: 'Hak Ediş (Maaş/Prim)', icon: '📈', isHakEdis: true },
    { value: 'MAAS', label: 'Maaş Ödemesi', icon: '💰', isOdeme: true },
    { value: 'AVANS', label: 'Avans Ödemesi', icon: '💵', isOdeme: true },
    { value: 'PRIM', label: 'Prim Ödemesi', icon: '🎁', isOdeme: true },
    { value: 'KESINTI', label: 'Kesinti', icon: '📉', isKesinti: true },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.tutar || parseFloat(formData.tutar) <= 0) {
      alert('Lütfen geçerli bir tutar girin');
      return;
    }

    onSave({
      ...formData,
      tutar: parseFloat(formData.tutar),
      kasaId: formData.kasaId || undefined,
      donem: formData.donem || undefined,
      aciklama: formData.aciklama || undefined,
    });
  };

  const getTipColor = (tip: string) => {
    switch (tip) {
      case 'HAK_EDIS': return 'var(--secondary)';
      case 'MAAS': return 'var(--chart-2)';
      case 'AVANS': return 'var(--chart-1)';
      case 'PRIM': return 'var(--primary)';
      case 'KESINTI': return 'var(--destructive)';
      default: return '#6b7280';
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">Personel Ödemesi</Typography>
          <Typography variant="body2" color="text.secondary">
            {personel.ad} {personel.soyad} - {personel.personelKodu}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            {personel.maas && (
              <Chip
                label={`Maaş: ₺${Number(personel.maas).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            <Chip
              label={`Bakiye: ${Number(personel.bakiye) >= 0 ? '-' : '+'}₺${Math.abs(Number(personel.bakiye)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
              size="small"
              color={Number(personel.bakiye) >= 0 ? 'error' : 'success'}
            />
            <Chip
              label={Number(personel.bakiye) >= 0 ? 'Ödenecek' : 'Fazla Ödeme'}
              size="small"
              variant="outlined"
              color={Number(personel.bakiye) >= 0 ? 'error' : 'success'}
            />
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Ödeme Tipi */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Ödeme Tipi</InputLabel>
                <Select
                  value={formData.tip}
                  onChange={(e) => handleChange('tip', e.target.value)}
                  label="Ödeme Tipi"
                >
                  {odemeTipleri.map((tip) => (
                    <MenuItem key={tip.value} value={tip.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{tip.icon}</span>
                        <span>{tip.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tutar */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Tutar"
                value={formData.tutar}
                onChange={(e) => handleChange('tutar', e.target.value)}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
              />
            </Grid>

            {/* Tarih */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Tarih"
                value={formData.tarih}
                onChange={(e) => handleChange('tarih', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Kasa (sadece ödeme ve kesinti tiplerinde) */}
            {formData.tip !== 'HAK_EDIS' && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Kasa</InputLabel>
                  <Select
                    value={formData.kasaId}
                    onChange={(e) => handleChange('kasaId', e.target.value)}
                    label="Kasa"
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {kasalar.map((kasa) => (
                      <MenuItem key={kasa.id} value={kasa.id}>
                        {kasa.kasaAdi} - ₺{Number(kasa.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Dönem (maaş ve hak ediş için) */}
            {(formData.tip === 'HAK_EDIS' || formData.tip === 'MAAS') && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Dönem"
                  value={formData.donem}
                  onChange={(e) => handleChange('donem', e.target.value)}
                  placeholder="Örn: Kasım 2025"
                  helperText="Hak ediş ve maaş ödemelerinde dönem belirtiniz"
                />
              </Grid>
            )}

            {/* Açıklama */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Açıklama"
                value={formData.aciklama}
                onChange={(e) => handleChange('aciklama', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>

            {/* Ödeme Özeti */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ 
                p: 2, 
                bgcolor: 'var(--muted)', 
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom 
                  sx={{
                    color: 'var(--muted-foreground)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Ödeme Özeti
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">İşlem Tipi:</Typography>
                  <Chip
                    label={odemeTipleri.find(t => t.value === formData.tip)?.label}
                    size="small"
                    sx={{ bgcolor: getTipColor(formData.tip), color: 'white' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {formData.tip === 'HAK_EDIS' ? 'Hak Ediş Tutarı:' : formData.tip === 'KESINTI' ? 'Kesinti Tutarı:' : 'Ödeme Tutarı:'}
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color={formData.tip === 'HAK_EDIS' ? 'success.main' : formData.tip === 'KESINTI' ? 'error.main' : 'info.main'}>
                    {formData.tip === 'HAK_EDIS' ? '+' : formData.tip === 'KESINTI' ? '-' : ''}
                    ₺{formData.tutar ? Number(formData.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0.00'}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Mevcut Bakiye:</Typography>
                  <Typography variant="body2" color={Number(personel.bakiye) >= 0 ? 'error.main' : 'success.main'}>
                    {Number(personel.bakiye) >= 0 ? '-' : '+'}
                    ₺{Math.abs(Number(personel.bakiye)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({Number(personel.bakiye) >= 0 ? 'Ödenecek' : 'Fazla Ödeme'})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="600">Yeni Bakiye:</Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="600"
                    color={
                      (() => {
                        let yeniBakiye = Number(personel.bakiye);
                        if (formData.tip === 'HAK_EDIS') {
                          yeniBakiye += Number(formData.tutar || 0);
                        } else if (formData.tip === 'KESINTI') {
                          yeniBakiye += Number(formData.tutar || 0);
                        } else {
                          // MAAS, AVANS, PRIM -> ödeme yapılıyor, bakiye azalır
                          yeniBakiye -= Number(formData.tutar || 0);
                        }
                        return yeniBakiye >= 0 ? 'error.main' : 'success.main';
                      })()
                    }
                  >
                    {(() => {
                      let yeniBakiye = Number(personel.bakiye);
                      if (formData.tip === 'HAK_EDIS') {
                        yeniBakiye += Number(formData.tutar || 0);
                      } else if (formData.tip === 'KESINTI') {
                        yeniBakiye += Number(formData.tutar || 0);
                      } else {
                        yeniBakiye -= Number(formData.tutar || 0);
                      }
                      return (yeniBakiye >= 0 ? '-' : '+') + '₺' + Math.abs(yeniBakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
                    })()}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {(() => {
                        let yeniBakiye = Number(personel.bakiye);
                        if (formData.tip === 'HAK_EDIS') {
                          yeniBakiye += Number(formData.tutar || 0);
                        } else if (formData.tip === 'KESINTI') {
                          yeniBakiye += Number(formData.tutar || 0);
                        } else {
                          yeniBakiye -= Number(formData.tutar || 0);
                        }
                        return yeniBakiye >= 0 ? '(Ödenecek)' : '(Fazla Ödeme)';
                      })()}
                    </Typography>
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button variant="contained" color="success" onClick={handleSubmit} startIcon={<Payment />}>
          Ödemeyi Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
});

PersonelOdemeDialog.displayName = 'PersonelOdemeDialog';

// Memoized dialog component
const PersonelDialog = memo(({ 
  personel, 
  onSave, 
  onClose 
}: { 
  personel: Partial<Personel> | null; 
  onSave: (data: any) => void; 
  onClose: () => void;
}) => {
  const isEdit = !!personel?.id;
  const [formData, setFormData] = useState({
    personelKodu: personel?.personelKodu || '',
    tcKimlikNo: personel?.tcKimlikNo || '',
    ad: personel?.ad || '',
    soyad: personel?.soyad || '',
    dogumTarihi: personel?.dogumTarihi ? personel.dogumTarihi.split('T')[0] : '',
    cinsiyet: personel?.cinsiyet || 'BELIRTILMEMIS',
    medeniDurum: personel?.medeniDurum || '',
    telefon: personel?.telefon || '',
    email: personel?.email || '',
    adres: personel?.adres || '',
    il: personel?.il || '',
    ilce: personel?.ilce || '',
    pozisyon: personel?.pozisyon || '',
    departman: personel?.departman || '',
    iseBaslamaTarihi: personel?.iseBaslamaTarihi ? personel.iseBaslamaTarihi.split('T')[0] : new Date().toISOString().split('T')[0],
    istenCikisTarihi: personel?.istenCikisTarihi ? personel.istenCikisTarihi.split('T')[0] : '',
    maas: personel?.maas?.toString() || '',
    maasGunu: personel?.maasGunu?.toString() || '',
    sgkNo: personel?.sgkNo || '',
    ibanNo: personel?.ibanNo || '',
    aciklama: personel?.aciklama || '',
  });

  // personel değiştiğinde formData'yı güncelle
  useEffect(() => {
    setFormData({
      personelKodu: personel?.personelKodu || '',
      tcKimlikNo: personel?.tcKimlikNo || '',
      ad: personel?.ad || '',
      soyad: personel?.soyad || '',
      dogumTarihi: personel?.dogumTarihi ? personel.dogumTarihi.split('T')[0] : '',
      cinsiyet: personel?.cinsiyet || 'BELIRTILMEMIS',
      medeniDurum: personel?.medeniDurum || '',
      telefon: personel?.telefon || '',
      email: personel?.email || '',
      adres: personel?.adres || '',
      il: personel?.il || '',
      ilce: personel?.ilce || '',
      pozisyon: personel?.pozisyon || '',
      departman: personel?.departman || '',
      iseBaslamaTarihi: personel?.iseBaslamaTarihi ? personel.iseBaslamaTarihi.split('T')[0] : new Date().toISOString().split('T')[0],
      istenCikisTarihi: personel?.istenCikisTarihi ? personel.istenCikisTarihi.split('T')[0] : '',
      maas: personel?.maas?.toString() || '',
      maasGunu: personel?.maasGunu?.toString() || '',
      sgkNo: personel?.sgkNo || '',
      ibanNo: personel?.ibanNo || '',
      aciklama: personel?.aciklama || '',
    });
  }, [personel]);

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      personelKodu: formData.personelKodu && formData.personelKodu.trim().length > 0 ? formData.personelKodu : undefined,
      tcKimlikNo: formData.tcKimlikNo && formData.tcKimlikNo.trim().length > 0 ? formData.tcKimlikNo : undefined,
      telefon: formData.telefon && formData.telefon.trim().length > 0 ? formData.telefon : undefined,
      email: formData.email && formData.email.trim().length > 0 ? formData.email : undefined,
      adres: formData.adres && formData.adres.trim().length > 0 ? formData.adres : undefined,
      il: formData.il && formData.il.trim().length > 0 ? formData.il : undefined,
      ilce: formData.ilce && formData.ilce.trim().length > 0 ? formData.ilce : undefined,
      pozisyon: formData.pozisyon && formData.pozisyon.trim().length > 0 ? formData.pozisyon : undefined,
      departman: formData.departman && formData.departman.trim().length > 0 ? formData.departman : undefined,
      sgkNo: formData.sgkNo && formData.sgkNo.trim().length > 0 ? formData.sgkNo : undefined,
      ibanNo: formData.ibanNo && formData.ibanNo.trim().length > 0 ? formData.ibanNo : undefined,
      aciklama: formData.aciklama && formData.aciklama.trim().length > 0 ? formData.aciklama : undefined,
      maas: formData.maas && formData.maas.trim().length > 0 ? parseFloat(formData.maas) : undefined,
      maasGunu: formData.maasGunu && formData.maasGunu.trim().length > 0 ? parseInt(formData.maasGunu) : undefined,
      dogumTarihi: formData.dogumTarihi || undefined,
      iseBaslamaTarihi: formData.iseBaslamaTarihi || undefined,
      istenCikisTarihi: formData.istenCikisTarihi || undefined,
      cinsiyet: formData.cinsiyet && formData.cinsiyet !== 'BELIRTILMEMIS' ? formData.cinsiyet : undefined,
      medeniDurum: formData.medeniDurum || undefined,
    };
    onSave(submitData);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Personel Düzenle' : 'Yeni Personel Ekle'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Kimlik Bilgileri */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                Kimlik Bilgileri
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Personel Kodu"
                value={formData.personelKodu}
                onChange={(e) => handleChange('personelKodu', e.target.value)}
                placeholder="Otomatik"
                helperText={formData.personelKodu ? "Önerilen kod (değiştirilebilir veya silinebilir)" : "Otomatik üretilecek"}
                sx={{
                  '& .MuiInputBase-input': {
                    color: formData.personelKodu && !isEdit ? 'var(--chart-1)' : 'inherit',
                    fontWeight: formData.personelKodu && !isEdit ? 600 : 'normal'
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="TC Kimlik No"
                value={formData.tcKimlikNo}
                onChange={(e) => handleChange('tcKimlikNo', e.target.value)}
                inputProps={{ maxLength: 11 }}
                helperText="11 karakter (opsiyonel)"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Ad"
                value={formData.ad}
                onChange={(e) => handleChange('ad', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Soyad"
                value={formData.soyad}
                onChange={(e) => handleChange('soyad', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="Doğum Tarihi"
                value={formData.dogumTarihi}
                onChange={(e) => handleChange('dogumTarihi', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Cinsiyet</InputLabel>
                <Select
                  value={formData.cinsiyet}
                  onChange={(e) => handleChange('cinsiyet', e.target.value)}
                  label="Cinsiyet"
                >
                  <MenuItem value="BELIRTILMEMIS">Belirtilmemiş</MenuItem>
                  <MenuItem value="ERKEK">Erkek</MenuItem>
                  <MenuItem value="KADIN">Kadın</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Medeni Durum</InputLabel>
                <Select
                  value={formData.medeniDurum}
                  onChange={(e) => handleChange('medeniDurum', e.target.value)}
                  label="Medeni Durum"
                >
                  <MenuItem value="">Belirtilmemiş</MenuItem>
                  <MenuItem value="BEKAR">Bekar</MenuItem>
                  <MenuItem value="EVLI">Evli</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* İletişim Bilgileri */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                İletişim Bilgileri
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Telefon"
                value={formData.telefon}
                onChange={(e) => handleChange('telefon', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="email"
                label="E-posta"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Adres"
                value={formData.adres}
                onChange={(e) => handleChange('adres', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="İl"
                value={formData.il}
                onChange={(e) => handleChange('il', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="İlçe"
                value={formData.ilce}
                onChange={(e) => handleChange('ilce', e.target.value)}
              />
            </Grid>

            {/* İş Bilgileri */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                İş Bilgileri
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Pozisyon"
                value={formData.pozisyon}
                onChange={(e) => handleChange('pozisyon', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Departman"
                value={formData.departman}
                onChange={(e) => handleChange('departman', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="İşe Başlama Tarihi"
                value={formData.iseBaslamaTarihi}
                onChange={(e) => handleChange('iseBaslamaTarihi', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="İşten Çıkış Tarihi"
                value={formData.istenCikisTarihi}
                onChange={(e) => handleChange('istenCikisTarihi', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Maaş Bilgileri */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                Maaş ve Banka Bilgileri
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Maaş"
                value={formData.maas}
                onChange={(e) => handleChange('maas', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Maaş Ödeme Günü</InputLabel>
                <Select
                  value={formData.maasGunu}
                  onChange={(e) => handleChange('maasGunu', e.target.value)}
                  label="Maaş Ödeme Günü"
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  <MenuItem value="0">Ay Sonu</MenuItem>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <MenuItem key={day} value={day.toString()}>
                      Her Ayın {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="SGK No"
                value={formData.sgkNo}
                onChange={(e) => handleChange('sgkNo', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="IBAN"
                value={formData.ibanNo}
                onChange={(e) => handleChange('ibanNo', e.target.value)}
              />
            </Grid>

            {/* Açıklama */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Açıklama"
                value={formData.aciklama}
                onChange={(e) => handleChange('aciklama', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEdit ? 'Güncelle' : 'Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

PersonelDialog.displayName = 'PersonelDialog';

export default function PersonelPage() {
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPersonel, setSelectedPersonel] = useState<Personel | null>(null);
  const [viewPersonel, setViewPersonel] = useState<Personel | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Personel | null>(null);
  
  // Ödeme Dialog
  const [openOdemeDialog, setOpenOdemeDialog] = useState(false);
  const [odemePersonel, setOdemePersonel] = useState<Personel | null>(null);
  const [kasalar, setKasalar] = useState<any[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAktif, setFilterAktif] = useState<string>('');
  const [filterDepartman, setFilterDepartman] = useState<string>('');
  
  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchPersoneller = async () => {
    try {
      const params: any = {};
      if (filterAktif !== '') params.aktif = filterAktif;
      if (filterDepartman) params.departman = filterDepartman;

      const response = await axios.get('/personel', { params });
      setPersoneller(response.data);
    } catch (error) {
      console.error('Personeller yüklenirken hata:', error);
      showSnackbar('Personeller yüklenemedi', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const params: any = {};
      if (filterAktif !== '') params.aktif = filterAktif;
      if (filterDepartman) params.departman = filterDepartman;

      const response = await axios.get('/personel/stats', { params });
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchPersoneller(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    fetchKasalar();
  }, [filterAktif, filterDepartman]);

  const fetchKasalar = async () => {
    try {
      const response = await axios.get('/kasa');
      setKasalar(response.data || []);
    } catch (error) {
      console.error('Kasalar yüklenirken hata:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = async (personel?: Personel) => {
    if (!personel) {
      // Yeni kayıt için bir sonraki kodu backend'den al
      let nextCode = '';
      try {
        const response = await axios.get('/code-template/next-code/PERSONNEL');
        nextCode = response.data.nextCode || '';
      } catch (error) {
        console.log('Otomatik kod alınamadı, boş bırakılacak');
      }
      
      // Kod ile yeni bir partial personel objesi oluştur
      setSelectedPersonel({ personelKodu: nextCode || '' } as any);
    } else {
      setSelectedPersonel(personel);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPersonel(null);
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedPersonel?.id) {
        await axios.put(`/personel/${selectedPersonel.id}`, formData);
        showSnackbar('Personel başarıyla güncellendi', 'success');
      } else {
        await axios.post('/personel', formData);
        showSnackbar('Personel başarıyla eklendi', 'success');
      }
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      showSnackbar(
        error.response?.data?.message || 'Kayıt sırasında bir hata oluştu',
        'error'
      );
    }
  };

  const handleView = async (personel: Personel) => {
    try {
      const response = await axios.get(`/personel/${personel.id}`);
      setViewPersonel(response.data);
      setOpenViewDialog(true);
    } catch (error) {
      console.error('Personel detayları yüklenirken hata:', error);
      showSnackbar('Detaylar yüklenemedi', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await axios.delete(`/personel/${deleteTarget.id}`);
      showSnackbar('Personel kaydı silindi', 'success');
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      fetchData();
    } catch (error: any) {
      console.error('Silme hatası:', error);
      showSnackbar(
        error.response?.data?.message || 'Silme sırasında bir hata oluştu',
        'error'
      );
    }
  };

  const handleOpenOdeme = (personel: Personel) => {
    setOdemePersonel(personel);
    setOpenOdemeDialog(true);
  };

  const handleSaveOdeme = async (odemeData: any) => {
    try {
      await axios.post('/personel/odeme', {
        ...odemeData,
        personelId: odemePersonel?.id,
      });
      showSnackbar('Ödeme başarıyla kaydedildi', 'success');
      setOpenOdemeDialog(false);
      setOdemePersonel(null);
      fetchData();
    } catch (error: any) {
      console.error('Ödeme kayıt hatası:', error);
      showSnackbar(
        error.response?.data?.message || 'Ödeme kaydedilirken hata oluştu',
        'error'
      );
    }
  };

  const filteredPersoneller = useMemo(() => {
    return personeller.filter(p => {
      const searchLower = searchTerm.toLowerCase();
      return (
        p.ad.toLowerCase().includes(searchLower) ||
        p.soyad.toLowerCase().includes(searchLower) ||
        p.personelKodu.toLowerCase().includes(searchLower) ||
        p.tcKimlikNo.includes(searchTerm) ||
        (p.pozisyon && p.pozisyon.toLowerCase().includes(searchLower)) ||
        (p.departman && p.departman.toLowerCase().includes(searchLower))
      );
    });
  }, [personeller, searchTerm]);

  const departmanlar = useMemo<string[]>(() => {
    const depts = new Set(
      personeller
        .map((p) => p.departman)
        .filter((dept): dept is string => Boolean(dept))
    );
    return Array.from(depts);
  }, [personeller]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              fontSize: '1.875rem',
              color: 'var(--foreground)',
              letterSpacing: '-0.02em',
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              mb: 0.5,
            }}
          >
            <Badge sx={{ color: 'var(--secondary)' }} />
            Personel Yönetimi
          </Typography>
          <Typography 
            variant="body2" 
            sx={{
              color: 'var(--muted-foreground)',
              fontSize: '0.875rem',
            }}
          >
            Personel bilgileri, maaş ve ödeme takibi
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
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
          Yeni Personel
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              bgcolor: 'var(--card)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <CardContent>
                <Typography 
                  sx={{
                    color: 'var(--muted-foreground)',
                    fontSize: '0.875rem',
                    mb: 1,
                  }}
                >
                  Toplam Personel
                </Typography>
                <Typography 
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    color: 'var(--chart-1)',
                  }}
                >
                  {stats.toplamPersonel}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              bgcolor: 'var(--card)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <CardContent>
                <Typography 
                  sx={{
                    color: 'var(--muted-foreground)',
                    fontSize: '0.875rem',
                    mb: 1,
                  }}
                >
                  Aylık Maaş Bordrosu
                </Typography>
                <Typography 
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    color: 'var(--secondary)',
                  }}
                >
                  ₺{Number(stats.toplamMaasBordro).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              bgcolor: 'var(--card)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <CardContent>
                <Typography 
                  sx={{
                    color: 'var(--muted-foreground)',
                    fontSize: '0.875rem',
                    mb: 1,
                  }}
                >
                  Toplam Bakiye
                </Typography>
                <Typography 
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    color: Number(stats.toplamBakiye) >= 0 ? 'var(--chart-2)' : 'var(--destructive)',
                  }}
                >
                  ₺{Number(stats.toplamBakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              bgcolor: 'var(--card)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <CardContent>
                <Typography 
                  sx={{
                    color: 'var(--muted-foreground)',
                    fontSize: '0.875rem',
                    mb: 1,
                  }}
                >
                  Departman Sayısı
                </Typography>
                <Typography 
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    color: 'var(--primary)',
                  }}
                >
                  {stats.departmanlar.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            placeholder="Personel ara... (Ad, Soyad, Kod, TC, Pozisyon)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={filterAktif}
              onChange={(e) => setFilterAktif(e.target.value)}
              label="Durum"
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="true">Aktif</MenuItem>
              <MenuItem value="false">Pasif</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Departman</InputLabel>
            <Select
              value={filterDepartman}
              onChange={(e) => setFilterDepartman(e.target.value)}
              label="Departman"
            >
              <MenuItem value="">Tümü</MenuItem>
              {departmanlar.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer 
        component={Paper}
        sx={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'var(--muted)' }}>
              <TableCell sx={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>Personel Kodu</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>Ad Soyad</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>TC Kimlik No</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>Pozisyon</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>Departman</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>Telefon</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>Maaş</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>Bakiye</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>Durum</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPersoneller.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    Kayıt bulunamadı
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPersoneller.map((personel) => (
                <TableRow key={personel.id} hover>
                  <TableCell>{personel.personelKodu}</TableCell>
                  <TableCell>{personel.ad} {personel.soyad}</TableCell>
                  <TableCell>{personel.tcKimlikNo}</TableCell>
                  <TableCell>{personel.pozisyon}</TableCell>
                  <TableCell>
                    {personel.departman ? (
                      <Chip label={personel.departman} size="small" variant="outlined" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{personel.telefon}</TableCell>
                  <TableCell align="right">
                    ₺{Number(personel.maas).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={Number(personel.bakiye) >= 0 ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 600 }}
                    >
                      ₺{Number(personel.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={personel.aktif ? 'Aktif' : 'Pasif'}
                      color={personel.aktif ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Görüntüle">
                      <IconButton size="small" onClick={() => handleView(personel)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ödeme Yap">
                      <IconButton size="small" color="success" onClick={() => handleOpenOdeme(personel)}>
                        <Payment fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton size="small" onClick={() => handleOpenDialog(personel)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeleteTarget(personel);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      {openDialog && (
        <PersonelDialog
          personel={selectedPersonel}
          onSave={handleSave}
          onClose={handleCloseDialog}
        />
      )}

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Personel Detayları
        </DialogTitle>
        <DialogContent>
          {viewPersonel && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Kişisel Bilgiler */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Kişisel Bilgiler
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Personel Kodu</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewPersonel.personelKodu}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">TC Kimlik No</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewPersonel.tcKimlikNo}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Ad Soyad</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewPersonel.ad} {viewPersonel.soyad}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Doğum Tarihi</Typography>
                  <Typography variant="body1">
                    {viewPersonel.dogumTarihi ? new Date(viewPersonel.dogumTarihi).toLocaleDateString('tr-TR') : '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Cinsiyet</Typography>
                  <Typography variant="body1">{viewPersonel.cinsiyet || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Medeni Durum</Typography>
                  <Typography variant="body1">{viewPersonel.medeniDurum || '-'}</Typography>
                </Grid>

                {/* İletişim Bilgileri */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                    İletişim Bilgileri
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Telefon</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewPersonel.telefon}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">E-posta</Typography>
                  <Typography variant="body1">{viewPersonel.email || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">İl</Typography>
                  <Typography variant="body1">{viewPersonel.il || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">İlçe</Typography>
                  <Typography variant="body1">{viewPersonel.ilce || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">Adres</Typography>
                  <Typography variant="body1">{viewPersonel.adres || '-'}</Typography>
                </Grid>

                {/* İş Bilgileri */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                    İş Bilgileri
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Pozisyon</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewPersonel.pozisyon}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Departman</Typography>
                  <Typography variant="body1">{viewPersonel.departman || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">İşe Başlama Tarihi</Typography>
                  <Typography variant="body1">
                    {new Date(viewPersonel.iseBaslamaTarihi).toLocaleDateString('tr-TR')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">İşten Çıkış Tarihi</Typography>
                  <Typography variant="body1">
                    {viewPersonel.istenCikisTarihi ? new Date(viewPersonel.istenCikisTarihi).toLocaleDateString('tr-TR') : '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Durum</Typography>
                  <Chip
                    label={viewPersonel.aktif ? 'Aktif' : 'Pasif'}
                    color={viewPersonel.aktif ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>

                {/* Maaş ve Finans */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                    Maaş ve Finans Bilgileri
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Maaş</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ₺{Number(viewPersonel.maas).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Bakiye</Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600 }}
                    color={Number(viewPersonel.bakiye) >= 0 ? 'success.main' : 'error.main'}
                  >
                    ₺{Number(viewPersonel.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">SGK No</Typography>
                  <Typography variant="body1">{viewPersonel.sgkNo || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">IBAN</Typography>
                  <Typography variant="body1">{viewPersonel.ibanNo || '-'}</Typography>
                </Grid>

                {/* Açıklama */}
                {viewPersonel.aciklama && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                        Açıklama
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body1">{viewPersonel.aciklama}</Typography>
                    </Grid>
                  </>
                )}

                {/* Kayıt Bilgileri */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                    Kayıt Bilgileri
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Oluşturma Tarihi</Typography>
                  <Typography variant="body1">
                    {new Date(viewPersonel.createdAt).toLocaleString('tr-TR')}
                  </Typography>
                  {viewPersonel.createdByUser && (
                    <Typography variant="caption" color="text.secondary">
                      Oluşturan: {viewPersonel.createdByUser.fullName}
                    </Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Son Güncelleme</Typography>
                  <Typography variant="body1">
                    {new Date(viewPersonel.updatedAt).toLocaleString('tr-TR')}
                  </Typography>
                  {viewPersonel.updatedByUser && (
                    <Typography variant="caption" color="text.secondary">
                      Güncelleyen: {viewPersonel.updatedByUser.fullName}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Personel Silinecek</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget && `${deleteTarget.ad} ${deleteTarget.soyad} adlı personeli silmek istediğinizden emin misiniz?`}
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            Bu işlem geri alınamaz!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>İptal</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ödeme Dialog */}
      {openOdemeDialog && odemePersonel && (
        <PersonelOdemeDialog
          personel={odemePersonel}
          kasalar={kasalar}
          onSave={handleSaveOdeme}
          onClose={() => {
            setOpenOdemeDialog(false);
            setOdemePersonel(null);
          }}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </MainLayout>
  );
}

