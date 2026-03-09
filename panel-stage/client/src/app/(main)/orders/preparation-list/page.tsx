'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Badge,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Search, Assignment, Inventory } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
}

interface Siparis {
  id: string;
  siparisNo: string;
  siparisTipi: 'SATIS' | 'SATIN_ALMA';
  tarih: string;
  cari: Cari;
  genelToplam: number;
  durum: string;
  _count?: {
    kalemler: number;
  };
}

export default function SiparisHazirlamaListesiPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });

  useEffect(() => {
    fetchSiparisler();
  }, [searchTerm]);

  const fetchSiparisler = async () => {
    try {
      setLoading(true);
      
      // Hem satış hem satın alma siparişlerini getir, sadece HAZIRLANIYOR durumundakileri
      const [satisSiparisler, satinAlmaSiparisler] = await Promise.all([
        axios.get('/order', {
          params: {
            siparisTipi: 'SATIS',
            search: searchTerm,
            limit: 100,
          },
        }),
        axios.get('/order', {
          params: {
            siparisTipi: 'SATIN_ALMA',
            search: searchTerm,
            limit: 100,
          },
        }),
      ]);

      // Sadece HAZIRLANIYOR durumundakileri filtrele
      const satisFiltered = (satisSiparisler.data.data || []).filter(
        (s: Siparis) => s.durum === 'HAZIRLANIYOR'
      );
      const satinAlmaFiltered = (satinAlmaSiparisler.data.data || []).filter(
        (s: Siparis) => s.durum === 'HAZIRLANIYOR'
      );

      // Birleştir ve tarihe göre sırala
      const tumSiparisler = [...satisFiltered, ...satinAlmaFiltered].sort(
        (a, b) => new Date(a.tarih).getTime() - new Date(b.tarih).getTime()
      );

      setSiparisler(tumSiparisler);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Siparişler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  
  const handleHazirlama = (siparis: Siparis) => {
    // Sipariş tipine göre doğru route'a yönlendir
    if (siparis.siparisTipi === 'SATIS') {
      router.push(`/siparis/satis/hazirlama/${siparis.id}`);
    } else {
      router.push(`/siparis/satin-alma/hazirlama/${siparis.id}`);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Sipariş Hazırlama Listesi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hazırlanması gereken siparişler
            </Typography>
          </Box>
          <Badge badgeContent={siparisler.length} color="warning" max={99}>
            <Assignment sx={{ fontSize: 40, color: '#f59e0b' }} />
          </Badge>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Sipariş No, Cari Unvan veya Cari Kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sipariş No</TableCell>
                  <TableCell>Tip</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Cari</TableCell>
                  <TableCell align="center">Kalem Sayısı</TableCell>
                  <TableCell align="right">Tutar</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="center">İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {siparisler.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Şu anda hazırlanması gereken sipariş bulunmuyor
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Siparişler "Hazırlanıyor" durumuna alındığında burada görünecektir
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  siparisler.map((siparis) => (
                    <TableRow key={siparis.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {siparis.siparisNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={siparis.siparisTipi === 'SATIS' ? 'Satış' : 'Satın Alma'}
                          color={siparis.siparisTipi === 'SATIS' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(siparis.tarih)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{siparis.cari.unvan}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {siparis.cari.cariKodu}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={siparis._count?.kalemler || 0} 
                          size="small" 
                          color="info"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(siparis.genelToplam)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Hazırlanıyor"
                          color="warning"
                          size="small"
                          icon={<Assignment />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => router.push(`/siparis/hazirla/${siparis.id}`)}
                            sx={{ 
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            }}
                          >
                            Hazırla
                          </Button>
                          <Tooltip title="Hazırlama Formu">
                            <IconButton
                              size="small"
                              onClick={() => handleHazirlama(siparis)}
                              color="secondary"
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Inventory />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

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

