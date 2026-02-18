'use client';

import React, { useState } from 'react';
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
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Autocomplete,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Search, TrendingUp, TrendingDown, Inventory, ShoppingCart } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useStoklar, useStokHareketler } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import TableSkeleton from '@/components/Loading/TableSkeleton';

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  marka?: string;
}

interface StokHareket {
  id: string;
  stokId: string;
  hareketTipi: 'GIRIS' | 'CIKIS' | 'SATIS' | 'IADE' | 'SAYIM';
  miktar: number;
  birimFiyat: number;
  aciklama?: string;
  createdAt: string;
  stok: Stok;
}

interface Stats {
  toplamGiris: number;
  toplamCikis: number;
  toplamSatis: number;
  toplamIade: number;
}

export default function MalzemeHareketleriPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStok, setSelectedStok] = useState<Stok | null>(null);
  const [hareketTipi, setHareketTipi] = useState<string>('');

  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // React Query hooks
  const { data: stoklar = [], isLoading: stoklarLoading } = useStoklar(debouncedSearch, 1000);
  const { data: hareketData, isLoading: hareketlerLoading } = useStokHareketler(
    selectedStok?.id,
    hareketTipi || undefined,
    100,
    true
  );

  const hareketler = hareketData || [];

  // İstatistikleri hesapla
  const stats: Stats = {
    toplamGiris: hareketler.filter((h: StokHareket) => h.hareketTipi === 'GIRIS').reduce((sum: number, h: StokHareket) => sum + h.miktar, 0),
    toplamCikis: hareketler.filter((h: StokHareket) => h.hareketTipi === 'CIKIS').reduce((sum: number, h: StokHareket) => sum + h.miktar, 0),
    toplamSatis: hareketler.filter((h: StokHareket) => h.hareketTipi === 'SATIS').reduce((sum: number, h: StokHareket) => sum + h.miktar, 0),
    toplamIade: hareketler.filter((h: StokHareket) => h.hareketTipi === 'IADE').reduce((sum: number, h: StokHareket) => sum + h.miktar, 0),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getHareketIcon = (tip: string) => {
    switch (tip) {
      case 'GIRIS': return <TrendingUp sx={{ color: '#10b981' }} />;
      case 'CIKIS': return <TrendingDown sx={{ color: '#ef4444' }} />;
      case 'SATIS': return <ShoppingCart sx={{ color: '#3b82f6' }} />;
      case 'IADE': return <Inventory sx={{ color: '#f59e0b' }} />;
      default: return null;
    }
  };

  const getHareketColor = (tip: string) => {
    switch (tip) {
      case 'GIRIS': return 'success';
      case 'CIKIS': return 'error';
      case 'SATIS': return 'primary';
      case 'IADE': return 'warning';
      default: return 'default';
    }
  };

  const getHareketLabel = (tip: string) => {
    switch (tip) {
      case 'GIRIS': return 'Giriş';
      case 'CIKIS': return 'Çıkış';
      case 'SATIS': return 'Satış';
      case 'IADE': return 'İade';
      case 'SAYIM': return 'Sayım';
      default: return tip;
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          📦 Malzeme Hareketleri
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Stok giriş, çıkış, satış ve iade işlemlerini takip edin
        </Typography>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#ecfdf5', borderLeft: '4px solid #10b981' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Toplam Giriş
                  </Typography>
                  {hareketlerLoading ? (
                    <CircularProgress size={24} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="h5" fontWeight="bold" color="#10b981">
                      {stats.toplamGiris.toLocaleString()}
                    </Typography>
                  )}
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: '#10b981', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Toplam Çıkış
                  </Typography>
                  {hareketlerLoading ? (
                    <CircularProgress size={24} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="h5" fontWeight="bold" color="#ef4444">
                      {stats.toplamCikis.toLocaleString()}
                    </Typography>
                  )}
                </Box>
                <TrendingDown sx={{ fontSize: 40, color: '#ef4444', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#eff6ff', borderLeft: '4px solid #3b82f6' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Toplam Satış
                  </Typography>
                  {hareketlerLoading ? (
                    <CircularProgress size={24} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="h5" fontWeight="bold" color="#3b82f6">
                      {stats.toplamSatis.toLocaleString()}
                    </Typography>
                  )}
                </Box>
                <ShoppingCart sx={{ fontSize: 40, color: '#3b82f6', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#fffbeb', borderLeft: '4px solid #f59e0b' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Toplam İade
                  </Typography>
                  {hareketlerLoading ? (
                    <CircularProgress size={24} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="h5" fontWeight="bold" color="#f59e0b">
                      {stats.toplamIade.toLocaleString()}
                    </Typography>
                  )}
                </Box>
                <Inventory sx={{ fontSize: 40, color: '#f59e0b', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtreler */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              fullWidth
              options={stoklar}
              loading={stoklarLoading}
              getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
              value={selectedStok}
              onChange={(_, newValue) => setSelectedStok(newValue)}
              onInputChange={(_, newValue) => setSearchTerm(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ürün Filtrele"
                  placeholder="Tüm ürünler..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {stoklarLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {option.stokKodu}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.stokAdi} {option.marka && `• ${option.marka}`}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Hareket Tipi</InputLabel>
              <Select
                value={hareketTipi}
                label="Hareket Tipi"
                onChange={(e) => setHareketTipi(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="GIRIS">Giriş</MenuItem>
                <MenuItem value="CIKIS">Çıkış</MenuItem>
                <MenuItem value="SATIS">Satış</MenuItem>
                <MenuItem value="IADE">İade</MenuItem>
                <MenuItem value="SAYIM">Sayım</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Hareketler Tablosu */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Tarih</strong></TableCell>
              <TableCell><strong>Ürün Kodu</strong></TableCell>
              <TableCell><strong>Ürün Adı</strong></TableCell>
              <TableCell><strong>Hareket Tipi</strong></TableCell>
              <TableCell align="right"><strong>Miktar</strong></TableCell>
              <TableCell align="right"><strong>Birim Fiyat</strong></TableCell>
              <TableCell align="right"><strong>Toplam</strong></TableCell>
              <TableCell><strong>Açıklama</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hareketlerLoading ? (
              <TableSkeleton rows={5} columns={8} />
            ) : hareketler.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    Hareket bulunamadı
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedStok ? 'Bu ürün için hareket kaydı yok' : 'Henüz hiç hareket kaydı yok'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              hareketler.map((hareket: StokHareket) => (
                <TableRow
                  key={hareket.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}
                >
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(hareket.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" color="#191970">
                      {hareket.stok.stokKodu}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {hareket.stok.stokAdi}
                    </Typography>
                    {hareket.stok.marka && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {hareket.stok.marka}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getHareketIcon(hareket.hareketTipi) ?? undefined}
                      label={getHareketLabel(hareket.hareketTipi)}
                      color={getHareketColor(hareket.hareketTipi) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {hareket.miktar.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatMoney(hareket.birimFiyat)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {formatMoney(hareket.miktar * Number(hareket.birimFiyat))}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {hareket.aciklama || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam {hareketler.length} hareket gösteriliyor
        </Typography>
      </Box>
    </MainLayout>
  );
}

