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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import { Save, ArrowBack, Delete, QrCodeScanner, Add, CheckCircle } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  birim: string;
}

interface SayimKalemi {
  stokId: string;
  stok?: Stok;
  sistemMiktari: number;
  sayilanMiktar: number;
  farkMiktari: number;
}

export default function UrunBazliSayimPage() {
  const router = useRouter();
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [sayimNo, setSayimNo] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [kalemler, setKalemler] = useState<SayimKalemi[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);
  const [barcodeDialog, setBarcodeDialog] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeMode, setBarcodeMode] = useState(false); // Sürekli barkod okuma modu
  const [detayliOzetOpen, setDetayliOzetOpen] = useState(false);
  
  // Manuel ürün ekleme için
  const [urunler, setUrunler] = useState<Stok[]>([]);
  const [manuelDialog, setManuelDialog] = useState(false);
  const [secilenUrun, setSecilenUrun] = useState<Stok | null>(null);
  const [manuelMiktar, setManuelMiktar] = useState(1);

  useEffect(() => {
    // Token kontrolü yap
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // Token yoksa login sayfasına yönlendir (axios interceptor zaten bunu yapar)
        // Ancak sayfa yüklenmeden önce kontrol edelim
        console.warn('Token bulunamadı, API çağrıları yapılamayacak');
        return;
      }
    }
    
    // Token varsa API çağrılarını yap
    generateSayimNo();
    fetchUrunler();
  }, []);

  // Barkod okuma modu aktifken input'a otomatik focus
  useEffect(() => {
    if (barcodeMode && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [barcodeMode, kalemler]);

  const fetchUrunler = async () => {
    try {
      const response = await axios.get('/stok', { params: { limit: 1000 } });
      setUrunler(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Ürün listesi yüklenemedi:', error);
    }
  };

  const generateSayimNo = async () => {
    try {
      const response = await axios.get('/sayim', {
        params: { sayimTipi: 'URUN_BAZLI', limit: 1 },
      });
      const sayimlar = response.data || [];
      const lastSayim = sayimlar[0];
      const lastNo = lastSayim ? parseInt(lastSayim.sayimNo.split('-')[2]) : 0;
      const newNo = (lastNo + 1).toString().padStart(3, '0');
      setSayimNo(`SAY-${new Date().getFullYear()}-${newNo}`);
    } catch (error) {
      console.error('Sayım numarası oluşturulurken hata:', error);
    }
  };

  const handleBarcodeSubmit = async () => {
    if (!barcodeInput.trim()) return;
    
    try {
      // Barkod ile ürün ara
      const response = await axios.get(`/sayim/barcode/product/${barcodeInput}`);
      const stok = response.data;
      
      // Son kaydı kontrol et - aynı ürün mü?
      const lastKalem = kalemler.length > 0 ? kalemler[kalemler.length - 1] : null;
      
      if (lastKalem && lastKalem.stokId === stok.id) {
        // Aynı ürün - son satırın miktarını artır
        const newKalemler = [...kalemler];
        newKalemler[newKalemler.length - 1].sayilanMiktar += 1;
        setKalemler(newKalemler);
        showSnackbar(`${stok.stokAdi} - Miktar: ${newKalemler[newKalemler.length - 1].sayilanMiktar}`, 'success');
      } else {
        // Farklı ürün - yeni satır ekle
        // Sistem miktarını getir (sadece ilk eklemede)
        let sistemMiktari = 0;
        const existingKalem = kalemler.find(k => k.stokId === stok.id);
        
        if (!existingKalem) {
          const hareketResponse = await axios.get(`/stok/${stok.id}/hareketler`);
          const hareketler = hareketResponse.data.data || hareketResponse.data;
          hareketler.forEach((h: any) => {
            if (h.hareketTipi === 'GIRIS') sistemMiktari += h.miktar;
            else if (h.hareketTipi === 'CIKIS' || h.hareketTipi === 'SATIS') sistemMiktari -= h.miktar;
          });
        } else {
          sistemMiktari = existingKalem.sistemMiktari;
        }
        
        // Yeni satır ekle (1 adet olarak)
        setKalemler([
          ...kalemler,
          {
            stokId: stok.id,
            stok,
            sistemMiktari,
            sayilanMiktar: 1,
            farkMiktari: 0, // Fark sonra hesaplanacak
          },
        ]);
        
        showSnackbar(`${stok.stokAdi} eklendi`, 'success');
      }
      
      setBarcodeInput('');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Barkod bulunamadı', 'error');
      setBarcodeInput('');
    }
  };

  const handleManuelEkle = async () => {
    if (!secilenUrun) {
      showSnackbar('Lütfen ürün seçin', 'error');
      return;
    }
    
    if (manuelMiktar <= 0) {
      showSnackbar('Miktar 0\'dan büyük olmalı', 'error');
      return;
    }
    
    try {
      // Sistem miktarını getir
      const hareketResponse = await axios.get(`/stok/${secilenUrun.id}/hareketler`);
      let sistemMiktari = 0;
      const hareketler = hareketResponse.data.data || hareketResponse.data;
      hareketler.forEach((h: any) => {
        if (h.hareketTipi === 'GIRIS') sistemMiktari += h.miktar;
        else if (h.hareketTipi === 'CIKIS' || h.hareketTipi === 'SATIS') sistemMiktari -= h.miktar;
      });
      
      // Mevcut kalemde var mı kontrol et
      const existingIndex = kalemler.findIndex(k => k.stokId === secilenUrun.id);
      
      if (existingIndex >= 0) {
        // Varsa miktarı güncelle
        const newKalemler = [...kalemler];
        newKalemler[existingIndex].sayilanMiktar = manuelMiktar;
        newKalemler[existingIndex].farkMiktari = manuelMiktar - newKalemler[existingIndex].sistemMiktari;
        setKalemler(newKalemler);
        showSnackbar(`${secilenUrun.stokAdi} güncellendi`, 'success');
      } else {
        // Yoksa yeni kalem ekle
        setKalemler([
          ...kalemler,
          {
            stokId: secilenUrun.id,
            stok: secilenUrun,
            sistemMiktari,
            sayilanMiktar: manuelMiktar,
            farkMiktari: manuelMiktar - sistemMiktari,
          },
        ]);
        showSnackbar(`${secilenUrun.stokAdi} eklendi`, 'success');
      }
      
      // Dialog'u kapat ve resetle
      setManuelDialog(false);
      setSecilenUrun(null);
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

  const handleSave = async (durum: 'TASLAK' | 'TAMAMLANDI' = 'TASLAK') => {
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
      
      // Aynı ürünleri grupla ve topla
      const groupedKalemler = kalemler.reduce((acc: any[], kalem) => {
        const existing = acc.find(k => k.stokId === kalem.stokId);
        if (existing) {
          existing.sayilanMiktar += kalem.sayilanMiktar;
        } else {
          acc.push({
            stokId: kalem.stokId,
            sayilanMiktar: kalem.sayilanMiktar,
            // locationId: undefined (ürün bazlı sayımda yok)
          });
        }
        return acc;
      }, []);
      
      const response = await axios.post('/sayim', {
        sayimNo,
        sayimTipi: 'URUN_BAZLI',
        aciklama: aciklama || undefined,
        kalemler: groupedKalemler,
      });
      
      // Eğer durumu TAMAMLANDI ise, oluşturulan sayımın durumunu güncelle
      if (durum === 'TAMAMLANDI' && response.data?.id) {
        await axios.put(`/sayim/${response.data.id}/tamamla`);
      }
      
      showSnackbar(
        durum === 'TAMAMLANDI' 
          ? 'Sayım tamamlandı! Onay için listeye yönlendiriliyorsunuz...' 
          : 'Sayım taslak olarak kaydedildi', 
        'success'
      );
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
              background: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Ürün Bazlı Sayım
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Barkod okuyarak veya manuel ürün sayımı yapın
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={barcodeMode ? 'contained' : 'outlined'}
              startIcon={<QrCodeScanner />}
              onClick={() => setBarcodeMode(!barcodeMode)}
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
              placeholder="Örn: Ocak 2025 Periyodik Sayım"
            />
          </Box>
        </Paper>

        {/* Barkod Okuma Alanı */}
        {barcodeMode && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#f0fdf4', border: '2px dashed', borderColor: 'success.main' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <QrCodeScanner sx={{ color: 'success.main' }} />
              <TextField
                fullWidth
                inputRef={barcodeInputRef}
                placeholder="Barkodu okutun veya yazın..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBarcodeSubmit();
                  }
                }}
                autoFocus
              />
              <Button variant="contained" onClick={handleBarcodeSubmit} color="success">
                Ekle
              </Button>
            </Box>
          </Paper>
        )}

        {/* Sayım Tablosu */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 1 }}>Stok Kodu</TableCell>
                <TableCell sx={{ py: 1 }}>Ürün Adı</TableCell>
                <TableCell align="right" sx={{ py: 1 }}>Sistem</TableCell>
                <TableCell align="right" sx={{ py: 1 }}>Sayılan</TableCell>
                <TableCell align="right" sx={{ py: 1 }}>Fark</TableCell>
                <TableCell align="center" sx={{ py: 1 }}>İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kalemler.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {barcodeMode ? 'Barkod okutmaya başlayın' : 'Henüz ürün eklenmedi'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                kalemler.map((kalem, index) => (
                  <TableRow key={index} sx={{ '&:last-child': { bgcolor: '#f0fdf4' } }}>
                    <TableCell sx={{ py: 0.5 }}>{kalem.stok?.stokKodu}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{kalem.stok?.stokAdi}</TableCell>
                    <TableCell align="right" sx={{ py: 0.5 }}>{kalem.sistemMiktari}</TableCell>
                    <TableCell align="right" sx={{ py: 0.5 }}>
                      <TextField
                        type="number"
                        size="small"
                        value={kalem.sayilanMiktar}
                        onChange={(e) => handleMiktarChange(index, Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.5 }}>
                      <Chip
                        label={kalem.farkMiktari > 0 ? `+${kalem.farkMiktari}` : kalem.farkMiktari}
                        color={kalem.farkMiktari > 0 ? 'success' : kalem.farkMiktari < 0 ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 0.5 }}>
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

        {/* Son Okutulan Ürün ve Özet */}
        {kalemler.length > 0 && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: '#f0fdf4', border: '2px solid #10b981' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#059669' }}>
                📦 Son Okutulan Ürün
              </Typography>
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => setDetayliOzetOpen(!detayliOzetOpen)}
              >
                {detayliOzetOpen ? 'Özeti Gizle' : 'Detaylı Özet'}
              </Button>
            </Box>
            
            {/* Son ürün bilgisi */}
            {kalemler.length > 0 && (() => {
              const sonKalem = kalemler[kalemler.length - 1];
              const ayniUrunSayisi = kalemler.filter(k => k.stokId === sonKalem.stokId).length;
              const toplamSayilan = kalemler.filter(k => k.stokId === sonKalem.stokId)
                .reduce((sum, k) => sum + k.sayilanMiktar, 0);
              
              return (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">Stok Kodu</Typography>
                    <Typography variant="h6">{sonKalem.stok?.stokKodu}</Typography>
                  </Box>
                  <Box sx={{ flex: 2 }}>
                    <Typography variant="body2" color="text.secondary">Ürün Adı</Typography>
                    <Typography variant="h6">{sonKalem.stok?.stokAdi}</Typography>
                  </Box>
                  {ayniUrunSayisi > 1 && (
                    <Chip 
                      label={`${ayniUrunSayisi} sayım`} 
                      color="info"
                      size="small"
                    />
                  )}
                  <Box>
                    <Typography variant="body2" color="text.secondary">Sistem</Typography>
                    <Typography variant="h6">{sonKalem.sistemMiktari}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Sayılan</Typography>
                    <Typography variant="h6" color="success.main">{toplamSayilan}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Fark</Typography>
                    <Typography variant="h6" color={toplamSayilan - sonKalem.sistemMiktari > 0 ? 'success.main' : 'error.main'}>
                      {toplamSayilan - sonKalem.sistemMiktari > 0 ? '+' : ''}{toplamSayilan - sonKalem.sistemMiktari}
                    </Typography>
                  </Box>
                </Box>
              );
            })()}
            
            {/* Detaylı özet (collapse) */}
            {detayliOzetOpen && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #d1fae5' }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 2 }}>
                  📊 Ürün Bazlı Özet (Kaydedilecek Veriler)
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 300, overflow: 'auto' }}>
                  {Array.from(new Set(kalemler.map(k => k.stokId))).map(stokId => {
                    const urunKalemleri = kalemler.filter(k => k.stokId === stokId);
                    const toplamSayilan = urunKalemleri.reduce((sum, k) => sum + k.sayilanMiktar, 0);
                    const sistemMiktar = urunKalemleri[0].sistemMiktari;
                    const fark = toplamSayilan - sistemMiktar;
                    
                    return (
                      <Box key={stokId} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 120, fontFamily: 'monospace' }}>
                          {urunKalemleri[0].stok?.stokKodu}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {urunKalemleri[0].stok?.stokAdi}
                        </Typography>
                        {urunKalemleri.length > 1 && (
                          <Chip 
                            label={`${urunKalemleri.length}x`} 
                            size="small" 
                            variant="outlined"
                            color="info"
                          />
                        )}
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                          Sistem: <strong>{sistemMiktar}</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                          Sayılan: <strong>{toplamSayilan}</strong>
                        </Typography>
                        <Chip
                          label={fark > 0 ? `+${fark}` : fark}
                          color={fark > 0 ? 'success' : fark < 0 ? 'error' : 'default'}
                          size="small"
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Paper>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button variant="outlined" onClick={() => router.back()}>İptal</Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Save />}
              onClick={() => handleSave('TASLAK')}
              disabled={loading || kalemler.length === 0}
            >
              Taslak Kaydet
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleSave('TAMAMLANDI')}
              disabled={loading || kalemler.length === 0}
            >
              Tamamla ve Kaydet
            </Button>
          </Box>
        </Box>

        {/* Manuel Ürün Ekleme Dialog */}
        <Dialog open={manuelDialog} onClose={() => setManuelDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Manuel Ürün Ekle</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              setManuelMiktar(1);
            }}>
              İptal
            </Button>
            <Button
              variant="contained"
              onClick={handleManuelEkle}
              disabled={!secilenUrun || manuelMiktar <= 0}
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

