'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { ArrowBack, Save, Add, Delete } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Location {
  id: string;
  code: string;
  name: string;
  warehouse: {
    name: string;
  };
}

interface ProductLocationStock {
  id: string;
  qtyOnHand: number;
  location: Location;
}

interface SiparisKalemi {
  id: string;
  miktar: number;
  birimFiyat: number;
  stok: {
    id: string;
    stokKodu: string;
    stokAdi: string;
  };
  locations: ProductLocationStock[];
  hazirlananlar: HazirlikKayit[];
}

interface HazirlikKayit {
  locationId: string;
  miktar: number;
}

interface Siparis {
  id: string;
  siparisNo: string;
  durum: string;
  cari: {
    unvan: string;
  };
  kalemler: SiparisKalemi[];
}

export default function SiparisHazirlamaPage() {
  const params = useParams();
  const router = useRouter();
  const [siparis, setSiparis] = useState<Siparis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Her kalem için hazırlanan ürünler
  const [hazirliklar, setHazirliklar] = useState<Record<string, HazirlikKayit[]>>({});

  useEffect(() => {
    fetchSiparis();
  }, [params.id]);

  const fetchSiparis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/siparis/${params.id}/hazirlama-detaylari`);
      setSiparis(response.data);
      
      // Mevcut hazırlananları yükle
      const initialHazirliklar: Record<string, HazirlikKayit[]> = {};
      response.data.kalemler.forEach((kalem: SiparisKalemi) => {
        initialHazirliklar[kalem.id] = kalem.hazirlananlar || [];
      });
      setHazirliklar(initialHazirliklar);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Sipariş yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddHazirlik = (kalemId: string, locationId: string, maxMiktar: number) => {
    setHazirliklar(prev => {
      const kalemHazirliklar = prev[kalemId] || [];
      const existing = kalemHazirliklar.find(h => h.locationId === locationId);
      
      if (existing) {
        // Miktarı artır (max'a kadar)
        return {
          ...prev,
          [kalemId]: kalemHazirliklar.map(h =>
            h.locationId === locationId
              ? { ...h, miktar: Math.min(h.miktar + 1, maxMiktar) }
              : h
          ),
        };
      } else {
        // Yeni ekleme
        return {
          ...prev,
          [kalemId]: [...kalemHazirliklar, { locationId, miktar: 1 }],
        };
      }
    });
  };

  const handleRemoveHazirlik = (kalemId: string, locationId: string) => {
    setHazirliklar(prev => ({
      ...prev,
      [kalemId]: (prev[kalemId] || []).filter(h => h.locationId !== locationId),
    }));
  };

  const handleMiktarChange = (kalemId: string, locationId: string, miktar: number) => {
    setHazirliklar(prev => ({
      ...prev,
      [kalemId]: (prev[kalemId] || []).map(h =>
        h.locationId === locationId ? { ...h, miktar } : h
      ),
    }));
  };

  const getToplamHazirlanan = (kalemId: string) => {
    return (hazirliklar[kalemId] || []).reduce((sum, h) => sum + h.miktar, 0);
  };

  const handleSave = async () => {
    try {
      // Validasyon: Tüm kalemlerin miktarları kontrol et
      if (!siparis) return;

      for (const kalem of siparis.kalemler) {
        const toplamHazirlanan = getToplamHazirlanan(kalem.id);
        if (toplamHazirlanan > kalem.miktar) {
          showSnackbar(`${kalem.stok.stokAdi} için hazırlanan miktar siparişten fazla!`, 'error');
          return;
        }
      }

      // Backend'e gönderilecek format
      const hazirlananlar = Object.entries(hazirliklar).flatMap(([kalemId, list]) =>
        list.map(h => ({
          siparisKalemiId: kalemId,
          locationId: h.locationId,
          miktar: h.miktar,
        }))
      );

      setSaving(true);
      const response = await axios.post(`/siparis/${params.id}/hazirla`, { hazirlananlar });
      
      // Eğer sipariş tamamen hazırlandıysa
      if (response.data.durum === 'HAZIRLANDI') {
        showSnackbar('Sipariş başarıyla hazırlandı ve "HAZIRLANDI" durumuna geçirildi!', 'success');
      } else {
        showSnackbar('Sipariş hazırlama bilgileri kaydedildi', 'success');
      }
      
      setTimeout(() => router.push('/order/hazirlama-listesi'), 1500);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kaydetme sırasında hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!siparis) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Typography>Sipariş bulunamadı</Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => router.push('/order/hazirlama-listesi')}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="h5" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Sipariş Hazırlama
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {siparis.siparisNo} - {siparis.cari.unvan}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
            sx={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              minWidth: 150,
            }}
          >
            {saving ? 'Kaydediliyor...' : 'Hazırlamayı Tamamla'}
          </Button>
        </Box>

        {siparis.kalemler.map((kalem, index) => {
          const toplamHazirlanan = getToplamHazirlanan(kalem.id);
          const kalemHazirliklar = hazirliklar[kalem.id] || [];
          
          return (
            <Card key={kalem.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Typography variant="h6">{kalem.stok.stokAdi}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {kalem.stok.stokKodu}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '0 1 150px', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Sipariş Miktarı</Typography>
                    <Typography variant="h6">{kalem.miktar} Adet</Typography>
                  </Box>
                  <Box sx={{ flex: '0 1 150px', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Hazırlanan</Typography>
                    <Typography variant="h6" color={toplamHazirlanan >= kalem.miktar ? 'success.main' : 'warning.main'}>
                      {toplamHazirlanan} / {kalem.miktar}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Mevcut Lokasyonlar:
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Lokasyon</TableCell>
                        <TableCell>Depo</TableCell>
                        <TableCell align="right">Mevcut Stok</TableCell>
                        <TableCell align="right">Alınacak Miktar</TableCell>
                        <TableCell align="center">İşlem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {kalem.locations.map((loc) => {
                        const hazirlik = kalemHazirliklar.find(h => h.locationId === loc.location.id);
                        const miktar = hazirlik?.miktar || 0;
                        
                        return (
                          <TableRow key={loc.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {loc.location.code}
                              </Typography>
                            </TableCell>
                            <TableCell>{loc.location.warehouse.name}</TableCell>
                            <TableCell align="right">
                              <Chip label={`${loc.qtyOnHand} adet`} size="small" color="info" />
                            </TableCell>
                            <TableCell align="right">
                              {hazirlik ? (
                                <TextField
                                  type="number"
                                  size="small"
                                  value={miktar}
                                  onChange={(e) => handleMiktarChange(kalem.id, loc.location.id, Number(e.target.value))}
                                  inputProps={{ min: 0, max: Math.min(loc.qtyOnHand, kalem.miktar - toplamHazirlanan + miktar) }}
                                  sx={{ width: 80 }}
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {hazirlik ? (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveHazirlik(kalem.id, loc.location.id)}
                                >
                                  <Delete />
                                </IconButton>
                              ) : (
                                <Button
                                  size="small"
                                  startIcon={<Add />}
                                  onClick={() => handleAddHazirlik(kalem.id, loc.location.id, Math.min(loc.qtyOnHand, kalem.miktar - toplamHazirlanan))}
                                  disabled={toplamHazirlanan >= kalem.miktar}
                                >
                                  Ekle
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {kalem.locations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography color="error">Bu ürün için stok bulunamadı!</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          );
        })}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
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

