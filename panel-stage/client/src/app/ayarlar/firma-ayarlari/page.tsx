'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
} from '@mui/material';
import { Add, Edit, Delete, Warehouse as WarehouseIcon, CheckCircle, Business, Person, CloudUpload } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import locationService, { Province, District, Neighborhood } from '@/services/locationService';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isDefault: boolean;
  active: boolean;
  createdAt: string;
}

interface CompanyInfo {
  companyType: 'COMPANY' | 'INDIVIDUAL';
  // Şirket Bilgileri
  companyName: string;
  taxNumber: string;
  taxOffice: string;
  mersisNo: string;
  // Şahıs Bilgileri
  firstName: string;
  lastName: string;
  tcNo: string;
  // İletişim
  phone: string;
  email: string;
  website: string;
  // Adres Bilgileri
  country: string;
  city: string;
  district: string;
  neighborhood: string;
  postalCode: string;
  address: string;
  logoUrl?: string;
}

export default function FirmaAyarlariPage() {
  const [tabValue, setTabValue] = useState(0);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [companyLoading, setCompanyLoading] = useState(false);

  // Location data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
    isDefault: false,
    active: true,
  });

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyType: 'COMPANY',
    companyName: '',
    taxNumber: '',
    taxOffice: '',
    mersisNo: '',
    firstName: '',
    lastName: '',
    tcNo: '',
    phone: '',
    email: '',
    website: '',
    country: 'Türkiye',
    city: '',
    district: '',
    neighborhood: '',
    postalCode: '',
    address: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (tabValue === 0) {
      fetchCompanyInfo();
      loadProvinces();
    } else if (tabValue === 1) {
      fetchWarehouses();
    }
  }, [tabValue]);

  // Load provinces on mount
  const loadProvinces = async () => {
    const data = await locationService.getProvinces();
    setProvinces(data);
  };

  // Load districts when province is selected
  const loadDistricts = async (provinceId: number) => {
    setSelectedProvinceId(provinceId);
    const data = await locationService.getDistricts(provinceId);
    setDistricts(data);
    setNeighborhoods([]); // Clear neighborhoods
  };

  // Load neighborhoods when district is selected
  const loadNeighborhoods = async (city: string, district: string) => {
    if (!city || !district) return;
    const data = await locationService.getLocalNeighborhoods(city, district);
    setNeighborhoods(data);
  };

  // Fetch postal code for selected neighborhood
  const fetchPostalCode = async (city: string, district: string, neighborhood: string) => {
    if (!city || !district || !neighborhood) {
      return null;
    }

    try {
      const response = await axios.get('/postal-codes', {
        params: {
          city: city.trim(),
          district: district.trim(),
          neighborhood: neighborhood.trim(),
        },
      });
      return response.data?.postalCode || null;
    } catch (error) {
      console.error('Posta kodu bulunamadı:', error);
      return null;
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      setCompanyLoading(true);
      const response = await axios.get('/tenants/settings');
      if (response.data) {
        setCompanyInfo({
          companyType: response.data.companyType || 'COMPANY',
          companyName: response.data.companyName || '',
          taxNumber: response.data.taxNumber || '',
          taxOffice: response.data.taxOffice || '',
          mersisNo: response.data.mersisNo || '',
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          tcNo: response.data.tcNo || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          website: response.data.website || '',
          country: response.data.country || 'Türkiye',
          city: response.data.city || '',
          district: response.data.district || '',
          neighborhood: response.data.neighborhood || '',
          postalCode: response.data.postalCode || '',
          address: response.data.address || '',
          logoUrl: response.data.logoUrl || '',
        });

        // Load districts and neighborhoods if city is already set
        if (response.data.city) {
          const province = await locationService.findProvinceByName(response.data.city);
          if (province) {
            await loadDistricts(province.id);
            if (response.data.district) {
              await loadNeighborhoods(response.data.city, response.data.district);
            }
          }
        }
      }
    } catch (error) {
      console.error('Firma bilgileri yüklenemedi:', error);
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleSaveCompanyInfo = async () => {
    // Validasyon
    if (companyInfo.companyType === 'COMPANY') {
      if (!companyInfo.companyName || !companyInfo.taxNumber) {
        setSnackbar({ open: true, message: 'Firma ünvanı ve vergi numarası zorunludur', severity: 'error' });
        return;
      }
    } else {
      if (!companyInfo.firstName || !companyInfo.lastName || !companyInfo.tcNo) {
        setSnackbar({ open: true, message: 'Ad, soyad ve TC kimlik numarası zorunludur', severity: 'error' });
        return;
      }
    }

    try {
      setCompanyLoading(true);
      await axios.put('/tenants/settings', companyInfo);
      setSnackbar({ open: true, message: 'Firma bilgileri kaydedildi', severity: 'success' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Kaydetme işlemi başarısız',
        severity: 'error'
      });
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (75KB)
    if (file.size > 75 * 1024) {
      setSnackbar({
        open: true,
        message: 'Logo dosyası en fazla 75KB olabilir',
        severity: 'error'
      });
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      setSnackbar({
        open: true,
        message: 'Sadece resim dosyaları (jpg, jpeg, png, gif) yüklenebilir',
        severity: 'error'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setCompanyLoading(true);
      const response = await axios.post('/tenants/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCompanyInfo({ ...companyInfo, logoUrl: response.data.logoUrl });
      setSnackbar({ open: true, message: 'Logo başarıyla yüklendi', severity: 'success' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Logo yüklenirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setCompanyLoading(false);
      // Input değerini temizle ki aynı dosyayı tekrar seçebilelim
      event.target.value = '';
    }
  };

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/warehouse');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Ambarlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address || '',
        phone: warehouse.phone || '',
        isDefault: warehouse.isDefault,
        active: warehouse.active,
      });
    } else {
      setEditingWarehouse(null);
      setFormData({
        code: '',
        name: '',
        address: '',
        phone: '',
        isDefault: false,
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingWarehouse(null);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      setSnackbar({ open: true, message: 'Lütfen zorunlu alanları doldurun', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      if (editingWarehouse) {
        await axios.put(`/warehouse/${editingWarehouse.id}`, formData);
        setSnackbar({ open: true, message: 'Ambar güncellendi', severity: 'success' });
      } else {
        await axios.post('/warehouse', formData);
        setSnackbar({ open: true, message: 'Ambar oluşturuldu', severity: 'success' });
      }
      handleCloseDialog();
      fetchWarehouses();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'İşlem başarısız',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ambarı silmek istediğinizden emin misiniz?')) return;

    try {
      await axios.delete(`/warehouse/${id}`);
      setSnackbar({ open: true, message: 'Ambar silindi', severity: 'success' });
      fetchWarehouses();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Silme işlemi başarısız',
        severity: 'error'
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const warehouse = warehouses.find(w => w.id === id);
      if (!warehouse) return;

      await axios.put(`/warehouse/${id}`, { isDefault: true });
      setSnackbar({ open: true, message: 'Varsayılan ambar güncellendi', severity: 'success' });
      fetchWarehouses();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'İşlem başarısız',
        severity: 'error'
      });
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)', mb: 0.5 }}>
            Firma Ayarları
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
            Firma bilgilerinizi ve ambar ayarlarınızı yönetin
          </Typography>
        </Box>

        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Genel Bilgiler" />
            <Tab label="Ambar Yönetimi" />
          </Tabs>

          {/* Genel Bilgiler Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <strong>Önemli:</strong> Bu bilgiler e-Fatura/e-Arşiv entegrasyonunda kullanılacaktır.
                Lütfen bilgilerinizi eksiksiz ve doğru giriniz.
              </Alert>

              {/* Logo Yükleme Alanı */}
              <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    border: '2px dashed var(--border)',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    bgcolor: 'var(--background)',
                  }}
                >
                  {companyInfo.logoUrl ? (
                    <img
                      src={companyInfo.logoUrl}
                      alt="Firma Logosu"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Business sx={{ fontSize: 48, color: 'var(--muted-foreground)' }} />
                  )}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Firma Logosu
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', mb: 2 }}>
                    Maksimum dosya boyutu: 75KB. Desteklenen formatlar: JPG, PNG, GIF.
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    disabled={companyLoading}
                  >
                    Logo Yükle
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleLogoUpload}
                    />
                  </Button>
                </Box>
              </Paper>

              {/* Firma Tipi Seçimi */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Firma Tipi
                </Typography>
                <ToggleButtonGroup
                  value={companyInfo.companyType}
                  exclusive
                  onChange={(_, value) => {
                    if (value) setCompanyInfo({ ...companyInfo, companyType: value });
                  }}
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="COMPANY" sx={{ px: 3 }}>
                    <Business sx={{ mr: 1 }} />
                    Şirket
                  </ToggleButton>
                  <ToggleButton value="INDIVIDUAL" sx={{ px: 3 }}>
                    <Person sx={{ mr: 1 }} />
                    Şahıs Firması
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Şirket Bilgileri */}
              {companyInfo.companyType === 'COMPANY' && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Şirket Bilgileri
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                    <TextField
                      label="Firma Ünvanı"
                      value={companyInfo.companyName}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                      required
                      fullWidth
                      helperText="e-Fatura'da görünecek firma ünvanı"
                    />
                    <TextField
                      label="Vergi Numarası"
                      value={companyInfo.taxNumber}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, taxNumber: e.target.value })}
                      required
                      fullWidth
                      inputProps={{ maxLength: 10 }}
                      helperText="10 haneli vergi numarası"
                    />
                    <TextField
                      label="Vergi Dairesi"
                      value={companyInfo.taxOffice}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, taxOffice: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="MERSİS Numarası"
                      value={companyInfo.mersisNo}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, mersisNo: e.target.value })}
                      fullWidth
                      inputProps={{ maxLength: 16 }}
                      helperText="16 haneli MERSİS numarası"
                    />
                  </Box>
                </>
              )}

              {/* Şahıs Firma Bilgileri */}
              {companyInfo.companyType === 'INDIVIDUAL' && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Şahıs Bilgileri
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                    <TextField
                      label="Ad"
                      value={companyInfo.firstName}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, firstName: e.target.value })}
                      required
                      fullWidth
                      helperText="e-Fatura'da görünecek ad"
                    />
                    <TextField
                      label="Soyad"
                      value={companyInfo.lastName}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, lastName: e.target.value })}
                      required
                      fullWidth
                      helperText="e-Fatura'da görünecek soyad"
                    />
                    <TextField
                      label="TC Kimlik Numarası"
                      value={companyInfo.tcNo}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, tcNo: e.target.value })}
                      required
                      fullWidth
                      inputProps={{ maxLength: 11 }}
                      helperText="11 haneli TC kimlik numarası"
                    />
                    <TextField
                      label="Vergi Dairesi"
                      value={companyInfo.taxOffice}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, taxOffice: e.target.value })}
                      fullWidth
                      helperText="Opsiyonel - Varsa giriniz"
                    />
                  </Box>
                </>
              )}

              <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600 }}>
                İletişim Bilgileri
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                <TextField
                  label="Telefon"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                  fullWidth
                  placeholder="+90 (___) ___ __ __"
                />
                <TextField
                  label="E-posta"
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Web Sitesi"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                  fullWidth
                  placeholder="https://www.ornek.com"
                  sx={{ gridColumn: 'span 2' }}
                />
              </Box>

              <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600 }}>
                Adres Bilgileri
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                {/* Ülke - Sadece gösterim */}
                <TextField
                  label="Ülke"
                  value={companyInfo.country}
                  disabled
                  fullWidth
                  helperText="Şu anda sadece Türkiye desteklenmektedir"
                />

                {/* İl - Autocomplete + Manuel Giriş */}
                <Autocomplete
                  freeSolo
                  options={provinces}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                  value={companyInfo.city}
                  onChange={async (e, newValue) => {
                    const cityName = typeof newValue === 'string' ? newValue : newValue?.name || '';
                    setCompanyInfo({ ...companyInfo, city: cityName, district: '', neighborhood: '' });
                    setDistricts([]);
                    setNeighborhoods([]);
                    if (newValue && typeof newValue !== 'string') {
                      await loadDistricts(newValue.id);
                    }
                  }}
                  onInputChange={(e, newValue) => {
                    if (e?.type === 'change') {
                      setCompanyInfo({ ...companyInfo, city: newValue, district: '', neighborhood: '' });
                      setDistricts([]);
                      setNeighborhoods([]);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="İl *" helperText="Listeden seçin veya manuel yazın" />
                  )}
                />

                {/* İlçe - Autocomplete + Manuel Giriş */}
                <Autocomplete
                  freeSolo
                  options={districts}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                  value={companyInfo.district}
                  disabled={!companyInfo.city}
                  onChange={async (e, newValue) => {
                    const districtName = typeof newValue === 'string' ? newValue : newValue?.name || '';
                    setCompanyInfo({ ...companyInfo, district: districtName, neighborhood: '' });
                    setNeighborhoods([]);
                    if (newValue && typeof newValue !== 'string') {
                      await loadNeighborhoods(companyInfo.city, newValue.name);
                    }
                  }}
                  onInputChange={(e, newValue) => {
                    if (e?.type === 'change') {
                      setCompanyInfo({ ...companyInfo, district: newValue, neighborhood: '' });
                      setNeighborhoods([]);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="İlçe *" helperText="Listeden seçin veya manuel yazın" />
                  )}
                />

                {/* Mahalle - Autocomplete + Manuel Giriş */}
                <Autocomplete
                  freeSolo
                  options={neighborhoods}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                  value={companyInfo.neighborhood}
                  disabled={!companyInfo.district}
                  onChange={(e, newValue) => {
                    const neighborhoodName = typeof newValue === 'string' ? newValue : newValue?.name || '';
                    setCompanyInfo({ ...companyInfo, neighborhood: neighborhoodName });
                  }}
                  onInputChange={(e, newValue) => {
                    if (e?.type === 'change') {
                      setCompanyInfo({ ...companyInfo, neighborhood: newValue });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Mahalle" helperText="Listeden seçin veya manuel yazın" />
                  )}
                />

                {/* Posta Kodu */}
                <TextField
                  label="Posta Kodu"
                  value={companyInfo.postalCode}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, postalCode: e.target.value })}
                  fullWidth
                  inputProps={{ maxLength: 5 }}
                  helperText="Mahalle seçildiğinde otomatik doldurulur"
                />
              </Box>

              {/* Açık Adres - Tam genişlik */}
              <TextField
                label="Açık Adres"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                multiline
                rows={3}
                fullWidth
                helperText="Mahalle, sokak, bina no vb. detaylı adres bilgisi"
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveCompanyInfo}
                  disabled={companyLoading}
                  sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary)' } }}
                >
                  {companyLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Ambar Yönetimi Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ambarlar
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary)' } }}
                >
                  Yeni Ambar
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ambar Kodu</TableCell>
                      <TableCell>Ambar Adı</TableCell>
                      <TableCell>Adres</TableCell>
                      <TableCell>Telefon</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Varsayılan</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {warehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>{warehouse.code}</Typography>
                        </TableCell>
                        <TableCell>{warehouse.name}</TableCell>
                        <TableCell>{warehouse.address || '-'}</TableCell>
                        <TableCell>{warehouse.phone || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={warehouse.active ? 'Aktif' : 'Pasif'}
                            color={warehouse.active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {warehouse.isDefault ? (
                            <Chip
                              icon={<CheckCircle />}
                              label="Varsayılan"
                              color="primary"
                              size="small"
                            />
                          ) : (
                            <Button
                              size="small"
                              onClick={() => handleSetDefault(warehouse.id)}
                            >
                              Varsayılan Yap
                            </Button>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(warehouse)}
                            sx={{ color: 'var(--primary)' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          {!warehouse.isDefault && (
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(warehouse.id)}
                              sx={{ color: '#ef4444' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {warehouses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            Henüz ambar tanımlanmamış
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>

        {/* Ambar Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingWarehouse ? 'Ambar Düzenle' : 'Yeni Ambar'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Ambar Kodu"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Ambar Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Adres"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Telefon"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                }
                label="Aktif"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                }
                label="Varsayılan Ambar"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {editingWarehouse ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
