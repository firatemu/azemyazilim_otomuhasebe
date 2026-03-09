'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import { Save, ArrowBack, Delete, QrCodeScanner, Add } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  birim: string;
}

interface Location {
  id: string;
  code: string;
  name?: string;
  warehouse: {
    code: string;
    name: string;
  };
}

interface SayimKalemi {
  stokId: string;
  locationId: string;
  stok?: Stok;
  location?: Location;
  sistemMiktari: number;
  sayilanMiktar: number;
  farkMiktari: number;
}

export default function RafBazliSayimPage() {
  const router = useRouter();
  const rafBarcodeRef = useRef<HTMLInputElement>(null);
  const urunBarcodeRef = useRef<HTMLInputElement>(null);
  
  const [sayimNo, setSayimNo] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [kalemler, setKalemler] = useState<SayimKalemi[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);
  
  // Barkod okuma için state'ler
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [rafBarcodeInput, setRafBarcodeInput] = useState('');
  const [urunBarcodeInput, setUrunBarcodeInput] = useState('');
  const [barcodeMode, setBarcodeMode] = useState(false);
  
  // Manuel ekleme için
  const [urunler, setUrunler] = useState<Stok[]>([]);
  const [lokasyonlar, setLokasyonlar] = useState<Location[]>([]);
  const [manuelDialog, setManuelDialog] = useState(false);
  const [secilenUrun, setSecilenUrun] = useState<Stok | null>(null);
  const [secilenLokasyon, setSecilenLokasyon] = useState<Location | null>(null);
  const [manuelMiktar, setManuelMiktar] = useState(1);

  useEffect(() => {
    generateSayimNo();
    fetchUrunler();
    fetchLokasyonlar();
  }, []);

  useEffect(() => {
    if (barcodeMode && !currentLocation && rafBarcodeRef.current) {
      rafBarcodeRef.current.focus();
    } else if (barcodeMode && currentLocation && urunBarcodeRef.current) {
      urunBarcodeRef.current.focus();
    }
  }, [barcodeMode, currentLocation, kalemler]);

  const fetchUrunler = async () => {
    try {
      const response = await axios.get('/product', { params: { limit: 1000 } });
      setUrunler(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Ürün listesi yüklenemedi:', error);
    }
  };

  const fetchLokasyonlar = async () => {
    try {
      const response = await axios.get('/location', { params: { active: true } });
      setLokasyonlar(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Lokasyon listesi yüklenemedi:', error);
    }
  };

  const generateSayimNo = async () => {
    try {
      const response = await axios.get('/sayim', {
        params: { sayimTipi: 'RAF_BAZLI', limit: 1 },
      });
      const sayimlar = response.data || [];
      const lastSayim = sayimlar[0];
      const lastNo = lastSayim ? parseInt(lastSayim.sayimNo.split('-')[2]) : 0;
      const newNo = (lastNo + 1).toString().padStart(3, '0');
      setSayimNo(`SAYRAF-${new Date().getFullYear()}-${newNo}`);
    } catch (error) {
      console.error('Sayım numarası oluşturulurken hata:', error);
    }
  };

  const handleRafBarcodeSubmit = async () => {
    if (!rafBarcodeInput.trim()) return;
    
    try {
      const response = await axios.get(`/sayim/barcode/location/${rafBarcodeInput}`);
      setCurrentLocation(response.data);
      setRafBarcodeInput('');
      showSnackbar(`Raf: ${response.data.code} - Ürün okutmaya başlayın`, 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Raf barkodu bulunamadı', 'error');
      setRafBarcodeInput('');
    }
  };

  const handleUrunBarcodeSubmit = async () => {
    if (!urunBarcodeInput.trim() || !currentLocation) return;
    
    try {
      const response = await axios.get(`/sayim/barcode/product/${urunBarcodeInput}`);
      const stok = response.data;
      
      // Bu rafta bu ürün için kalem var mı?
      const existingIndex = kalemler.findIndex(
        k => k.stokId === stok.id && k.locationId === currentLocation.id
      );
      
      if (existingIndex >= 0) {
        // Varsa miktarı artır
        const newKalemler = [...kalemler];
        newKalemler[existingIndex].sayilanMiktar += 1;
        newKalemler[existingIndex].farkMiktari = newKalemler[existingIndex].sayilanMiktar - newKalemler[existingIndex].sistemMiktari;
        setKalemler(newKalemler);
        showSnackbar(`${stok.stokAdi} - ${currentLocation.code}: ${newKalemler[existingIndex].sayilanMiktar}`, 'success');
      } else {
        // Yeni kalem ekle - sistem miktarını getir
        try {
          const locationStockResponse = await axios.get(`/location/${currentLocation.id}`);
          const locationData = locationStockResponse.data;
          const productStock = locationData.productLocationStocks?.find((pls: any) => pls.productId === stok.id);
          const sistemMiktari = productStock?.qtyOnHand || 0;
          
          setKalemler([
            ...kalemler,
            {
              stokId: stok.id,
              locationId: currentLocation.id,
              stok,
              location: currentLocation,
              sistemMiktari,
              sayilanMiktar: 1,
              farkMiktari: 1 - sistemMiktari,
            },
          ]);
          showSnackbar(`${stok.stokAdi} - ${currentLocation.code} eklendi`, 'success');
        } catch (error) {
          // Sistem miktarı alınamazsa 0 olarak ekle
          setKalemler([
            ...kalemler,
            {
              stokId: stok.id,
              locationId: currentLocation.id,
              stok,
              location: currentLocation,
              sistemMiktari: 0,
              sayilanMiktar: 1,
              farkMiktari: 1,
            },
          ]);
          showSnackbar(`${stok.stokAdi} - ${currentLocation.code} eklendi`, 'success');
        }
      }
      
      setUrunBarcodeInput('');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ürün barkodu bulunamadı', 'error');
      setUrunBarcodeInput('');
    }
  };

  const handleManuelEkle = async () => {
    if (!secilenUrun) {
      showSnackbar('Lütfen ürün seçin', 'error');
      return;
    }
    
    if (!secilenLokasyon) {
      showSnackbar('Lütfen lokasyon seçin', 'error');
      return;
    }
    
    if (manuelMiktar <= 0) {
      showSnackbar('Miktar 0\'dan büyük olmalı', 'error');
      return;
    }
    
    try {
      // Sistem miktarını getir
      const locationStockResponse = await axios.get(`/location/${secilenLokasyon.id}`);
      const locationData = locationStockResponse.data;
      const productStock = locationData.productLocationStocks?.find((pls: any) => pls.productId === secilenUrun.id);
      const sistemMiktari = productStock?.qtyOnHand || 0;
      
      // Mevcut kalemde var mı kontrol et
      const existingIndex = kalemler.findIndex(
        k => k.stokId === secilenUrun.id && k.locationId === secilenLokasyon.id
      );
      
      if (existingIndex >= 0) {
        // Varsa miktarı güncelle
        const newKalemler = [...kalemler];
        newKalemler[existingIndex].sayilanMiktar = manuelMiktar;
        newKalemler[existingIndex].farkMiktari = manuelMiktar - newKalemler[existingIndex].sistemMiktari;
        setKalemler(newKalemler);
        showSnackbar(`${secilenUrun.stokAdi} - ${secilenLokasyon.code} güncellendi`, 'success');
      } else {
        // Yoksa yeni kalem ekle
        setKalemler([
          ...kalemler,
          {
            stokId: secilenUrun.id,
            locationId: secilenLokasyon.id,
            stok: secilenUrun,
            location: secilenLokasyon,
            sistemMiktari,
            sayilanMiktar: manuelMiktar,
            farkMiktari: manuelMiktar - sistemMiktari,
          },
        ]);
        showSnackbar(`${secilenUrun.stokAdi} - ${secilenLokasyon.code} eklendi`, 'success');
      }
      
      // Dialog'u kapat ve resetle
      setManuelDialog(false);
      setSecilenUrun(null);
      setSecilenLokasyon(null);
      setManuelMiktar(1);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ürün eklenirken hata', 'error');
    }
  };

  const handleMiktarChange = (index: number, miktar: number) => {
    const newKalemler = [...kalemler];
    newKalemler[index].sayilanMiktar = miktar;
    newKalemler[index].farkMiktari = miktar - newKalemler[index].sistemMiktari;
    setKalemler(newKalemler);
  };

  const handleRemoveKalem = (index: number) => {
    setKalemler(kalemler.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!sayimNo) {
      showSnackbar('Sayım numarası gerekli', 'error');
      return;
    }
    
    if (kalemler.length === 0) {
      showSnackbar('En az bir ürün saymalısınız', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post('/sayim', {
        sayimNo,
        sayimTipi: 'RAF_BAZLI',
        aciklama,
        kalemler: kalemler.map(k => ({
          stokId: k.stokId,
          locationId: k.locationId,
          sayilanMiktar: k.sayilanMiktar,
        })),
      });
      
      showSnackbar('Raf bazlı sayım başarıyla kaydedildi', 'success');
      setTimeout(() => router.push('/sayim/liste'), 1500);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kaydetme hatası', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const toplamFark = kalemler.reduce((sum, k) => sum + Math.abs(k.farkMiktari), 0);
  const fazlalar = kalemler.filter(k => k.farkMiktari > 0).length;
  const eksikler = kalemler.filter(k => k.farkMiktari < 0).length;

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="h5" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Raf Bazlı Sayım
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Her rafta ne kadar ürün var detaylı sayım yapın
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={barcodeMode ? 'contained' : 'outlined'}
              startIcon={<QrCodeScanner />}
              onClick={() => {
                setBarcodeMode(!barcodeMode);
                setCurrentLocation(null);
              }}
              color={barcodeMode ? 'success' : 'primary'}
            >
              {barcodeMode ? 'Barkod Modu Aktif' : 'Barkod Modu'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setManuelDialog(true)}
              color="primary"
            >
              Manuel Ekle
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ flex: '1 1 250px' }}
              label="Sayım No"
              value={sayimNo}
              onChange={(e) => setSayimNo(e.target.value)}
              required
            />
            <TextField
              sx={{ flex: '1 1 400px' }}
              label="Açıklama"
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Örn: Ocak 2025 Raf Bazlı Sayım"
            />
          </Box>
        </Paper>

        {/* Barkod Okuma Alanı */}
        {barcodeMode && (
          <Paper sx={{ p: 3, mb: 2, bgcolor: '#f0fdf4', border: '2px dashed', borderColor: 'success.main' }}>
            {!currentLocation ? (
              <Box>
                <Typography variant="h6" gutterBottom>1. Adım: Raf Barkodunu Okutun</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <QrCodeScanner sx={{ color: 'success.main', fontSize: 40 }} />
                  <TextField
                    fullWidth
                    inputRef={rafBarcodeRef}
                    placeholder="Raf barkodunu okutun..."
                    value={rafBarcodeInput}
                    onChange={(e) => setRafBarcodeInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleRafBarcodeSubmit();
                      }
                    }}
                    autoFocus
                  />
                  <Button variant="contained" onClick={handleRafBarcodeSubmit} color="success">
                    Devam
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">2. Adım: Ürün Barkodlarını Okutun</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Seçili Raf: <Chip label={currentLocation.code} size="small" color="primary" /> 
                      {currentLocation.warehouse.name}
                    </Typography>
                  </Box>
                  <Button size="small" onClick={() => setCurrentLocation(null)}>
                    Başka Raf Seç
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <QrCodeScanner sx={{ color: 'success.main', fontSize: 40 }} />
                  <TextField
                    fullWidth
                    inputRef={urunBarcodeRef}
                    placeholder="Ürün barkodunu okutun..."
                    value={urunBarcodeInput}
                    onChange={(e) => setUrunBarcodeInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUrunBarcodeSubmit();
                      }
                    }}
                    autoFocus
                  />
                  <Button variant="contained" onClick={handleUrunBarcodeSubmit} color="success">
                    Ekle
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* Sayım Tablosu */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Raf</TableCell>
                <TableCell>Stok Kodu</TableCell>
                <TableCell>Ürün Adı</TableCell>
                <TableCell align="right">Sistem</TableCell>
                <TableCell align="right">Sayılan</TableCell>
                <TableCell align="right">Fark</TableCell>
                <TableCell align="center">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kalemler.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {barcodeMode ? 'Raf barkodunu okutarak başlayın' : 'Henüz ürün eklenmedi'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                kalemler.map((kalem, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip label={kalem.location?.code} size="small" color="info" />
                    </TableCell>
                    <TableCell>{kalem.stok?.stokKodu}</TableCell>
                    <TableCell>{kalem.stok?.stokAdi}</TableCell>
                    <TableCell align="right">{kalem.sistemMiktari}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={kalem.sayilanMiktar}
                        onChange={(e) => handleMiktarChange(index, Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={kalem.farkMiktari > 0 ? `+${kalem.farkMiktari}` : kalem.farkMiktari}
                        color={kalem.farkMiktari > 0 ? 'success' : kalem.farkMiktari < 0 ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleRemoveKalem(index)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Özet */}
        {kalemler.length > 0 && (
          <Paper sx={{ p: 3, mt: 2, bgcolor: '#f9fafb' }}>
            <Typography variant="h6" gutterBottom>Sayım Özeti</Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Toplam Kayıt</Typography>
                <Typography variant="h5">{kalemler.length}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Farklı Raf</Typography>
                <Typography variant="h5">{new Set(kalemler.map(k => k.locationId)).size}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Fazla Olan</Typography>
                <Typography variant="h5" color="success.main">{fazlalar}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Eksik Olan</Typography>
                <Typography variant="h5" color="error.main">{eksikler}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Toplam Fark</Typography>
                <Typography variant="h5">{toplamFark}</Typography>
              </Box>
            </Box>
          </Paper>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => router.back()}>İptal</Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={loading || kalemler.length === 0}
            sx={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)' }}
          >
            Sayımı Kaydet
          </Button>
        </Box>

        {/* Manuel Ürün Ekleme Dialog */}
        <Dialog open={manuelDialog} onClose={() => setManuelDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle component="div">Manuel Ürün Ekle</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Autocomplete
                options={lokasyonlar}
                getOptionLabel={(option) => `${option.code} - ${option.warehouse.name}`}
                value={secilenLokasyon}
                onChange={(_, newValue) => setSecilenLokasyon(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Lokasyon Seçin *"
                    placeholder="Raf ara..."
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {option.code}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.warehouse.name} {option.name && `- ${option.name}`}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              />
              
              <Autocomplete
                options={urunler}
                getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                value={secilenUrun}
                onChange={(_, newValue) => setSecilenUrun(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ürün Seçin *"
                    placeholder="Ürün ara..."
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {option.stokKodu}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.stokAdi}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              />
              
              <TextField
                type="number"
                label="Sayılan Miktar *"
                value={manuelMiktar}
                onChange={(e) => setManuelMiktar(Number(e.target.value))}
                inputProps={{ min: 1 }}
                helperText="Saydığınız ürün miktarını girin"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setManuelDialog(false);
              setSecilenUrun(null);
              setSecilenLokasyon(null);
              setManuelMiktar(1);
            }}>
              İptal
            </Button>
            <Button
              variant="contained"
              onClick={handleManuelEkle}
              disabled={!secilenUrun || !secilenLokasyon || manuelMiktar <= 0}
            >
              Ekle
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
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

