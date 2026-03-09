'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  marka?: string | null;
  anaKategori?: string | null;
  altKategori?: string | null;
  satisFiyati?: number | null;
}

type AdjustmentType = 'percentage' | 'fixed';

interface ResultRow {
  stokId: string;
  stokKodu: string;
  stokAdi: string;
  previousPrice?: number | null;
  newPrice?: number | null;
  status: 'success' | 'skipped' | 'failed';
  message?: string;
}

const formatDateOnly = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function TopluSatisFiyatGuncellePage() {
  const [allStocks, setAllStocks] = useState<Stok[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState<string | null>(null);

  const [selectedMarka, setSelectedMarka] = useState('');
  const [selectedAnaKategori, setSelectedAnaKategori] = useState('');
  const [selectedAltKategori, setSelectedAltKategori] = useState('');

  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('percentage');
  const [adjustmentValue, setAdjustmentValue] = useState<string>('');

  const [processing, setProcessing] = useState(false);
  const [resultRows, setResultRows] = useState<ResultRow[] | null>(null);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      setInitialLoading(true);
      setInitialError(null);
      try {
        const response = await axios.get('/product', {
          params: {
            limit: 1000,
          },
        });
        setAllStocks(response.data?.data ?? []);
      } catch (error: any) {
        console.error('Stok listesi alınamadı', error);
        setInitialError(error?.response?.data?.message ?? 'Stok listesi alınamadı.');
      } finally {
        setInitialLoading(false);
      }
    };

    void fetchStocks();
  }, []);

  const markaOptions = useMemo(() => {
    const values = allStocks.map((item) => item.marka).filter((value): value is string => Boolean(value));
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [allStocks]);

  const anaKategoriOptions = useMemo(() => {
    const values = allStocks.map((item) => item.anaKategori).filter((value): value is string => Boolean(value));
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [allStocks]);

  const altKategoriOptions = useMemo(() => {
    const filtered = selectedAnaKategori
      ? allStocks.filter((item) => item.anaKategori === selectedAnaKategori)
      : allStocks;
    const values = filtered.map((item) => item.altKategori).filter((value): value is string => Boolean(value));
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [allStocks, selectedAnaKategori]);

  const handleResetFilters = () => {
    setSelectedMarka('');
    setSelectedAnaKategori('');
    setSelectedAltKategori('');
    setAdjustmentType('percentage');
    setAdjustmentValue('');
    setResultRows(null);
    setSummaryMessage(null);
  };

  const handleProcess = async () => {
    const numericValue = Number(adjustmentValue);
    if (Number.isNaN(numericValue) || numericValue === 0) {
      setSummaryMessage('Lütfen sıfırdan farklı geçerli bir artış değeri girin.');
      setResultRows(null);
      return;
    }

    setProcessing(true);
    setResultRows(null);
    setSummaryMessage(null);

    try {
      const response = await axios.get('/product', {
        params: {
          limit: 1000,
          marka: selectedMarka || undefined,
          anaKategori: selectedAnaKategori || undefined,
          altKategori: selectedAltKategori || undefined,
        },
      });

      const filteredStocks: Stok[] = response.data?.data ?? [];

      if (filteredStocks.length === 0) {
        setSummaryMessage('Seçilen kriterlere göre stok bulunamadı.');
        setResultRows([]);
        return;
      }

      const rows: ResultRow[] = [];
      let successCount = 0;
      let skippedCount = 0;
      let failedCount = 0;
      const effectiveFrom = formatDateOnly(new Date());
      const note = `Toplu satış fiyatı güncellemesi (${adjustmentType === 'percentage' ? `%${numericValue}` : `+${numericValue}₺`})`;

      for (const stok of filteredStocks) {
        const row: ResultRow = {
          stokId: stok.id,
          stokKodu: stok.stokKodu,
          stokAdi: stok.stokAdi,
          status: 'skipped',
        };

        try {
          const latestResponse = await axios.get(`/price-cards/stok/${stok.id}/latest`, {
            params: { type: 'SALE' },
          });

          const latestCard = latestResponse.data;
          const basePrice = latestCard?.price != null ? Number(latestCard.price) : stok.satisFiyati ?? 0;

          if (!basePrice || Number.isNaN(basePrice) || basePrice <= 0) {
            row.status = 'skipped';
            row.message = 'Geçerli satış fiyatı bulunamadı.';
            skippedCount += 1;
            rows.push(row);
            continue;
          }

          const newPrice = (() => {
            if (adjustmentType === 'percentage') {
              return Number((basePrice * (1 + numericValue / 100)).toFixed(2));
            }
            return Number((basePrice + numericValue).toFixed(2));
          })();

          if (!Number.isFinite(newPrice) || newPrice <= 0) {
            row.status = 'skipped';
            row.previousPrice = basePrice;
            row.message = 'Hesaplanan yeni fiyat geçersiz.';
            skippedCount += 1;
            rows.push(row);
            continue;
          }

          await axios.post('/price-cards', {
            stokId: stok.id,
            type: 'SALE',
            price: newPrice,
            effectiveFrom,
            note,
          });

          row.status = 'success';
          row.previousPrice = basePrice;
          row.newPrice = newPrice;
          successCount += 1;
        } catch (error: any) {
          console.error(`Stok ${stok.stokKodu} için fiyat güncellenemedi`, error);
          row.status = 'failed';
          row.message = error?.response?.data?.message ?? 'Fiyat güncellemesi sırasında hata oluştu.';
          failedCount += 1;
        }

        rows.push(row);
      }

      setResultRows(rows);
      setSummaryMessage(
        `Toplam ${filteredStocks.length} malzeme işlendi. Başarılı: ${successCount}, Atlanan: ${skippedCount}, Hatalı: ${failedCount}.`
      );
    } catch (error: any) {
      console.error('Toplu fiyat güncellemesi başarısız', error);
      setSummaryMessage(error?.response?.data?.message ?? 'Toplu fiyat güncellemesi sırasında hata oluştu.');
      setResultRows(null);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
            Toplu Satış Fiyatı Güncelleme
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Marka ve kategori kriterlerine göre ürünlerin satış fiyatlarına yüzdelik veya sabit artış uygulayın. Her ürün için yeni bir satış fiyatı kartı oluşturulur.
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          {initialLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography color="text.secondary">Ürün verileri yükleniyor...</Typography>
            </Box>
          ) : initialError ? (
            <Alert severity="error">{initialError}</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                }}
              >
                <Box>
                  <FormControl fullWidth size="small">
                    <InputLabel>Marka</InputLabel>
                    <Select
                      label="Marka"
                      value={selectedMarka}
                      onChange={(event) => setSelectedMarka(event.target.value)}
                    >
                      <MenuItem value="">
                        <em>Tümü</em>
                      </MenuItem>
                      {markaOptions.map((marka) => (
                        <MenuItem key={marka} value={marka}>
                          {marka}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ana Kategori</InputLabel>
                    <Select
                      label="Ana Kategori"
                      value={selectedAnaKategori}
                      onChange={(event) => {
                        setSelectedAnaKategori(event.target.value);
                        setSelectedAltKategori('');
                      }}
                    >
                      <MenuItem value="">
                        <em>Tümü</em>
                      </MenuItem>
                      {anaKategoriOptions.map((kategori) => (
                        <MenuItem key={kategori} value={kategori}>
                          {kategori}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormControl fullWidth size="small" disabled={!selectedAnaKategori && altKategoriOptions.length === 0}>
                    <InputLabel>Alt Kategori</InputLabel>
                    <Select
                      label="Alt Kategori"
                      value={selectedAltKategori}
                      onChange={(event) => setSelectedAltKategori(event.target.value)}
                    >
                      <MenuItem value="">
                        <em>Tümü</em>
                      </MenuItem>
                      {altKategoriOptions.map((kategori) => (
                        <MenuItem key={kategori} value={kategori}>
                          {kategori}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                }}
              >
                <Box>
                  <FormControl component="fieldset">
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                      Artış Türü
                    </Typography>
                    <RadioGroup
                      row
                      value={adjustmentType}
                      onChange={(event) => setAdjustmentType(event.target.value as AdjustmentType)}
                    >
                      <FormControlLabel value="percentage" control={<Radio />} label="Yüzdelik (%)" />
                      <FormControlLabel value="fixed" control={<Radio />} label="Sabit Tutar (₺)" />
                    </RadioGroup>
                  </FormControl>
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    size="small"
                    label={adjustmentType === 'percentage' ? 'Yüzde Artışı (%)' : 'Sabit Tutar (₺)'}
                    type="number"
                    value={adjustmentValue}
                    onChange={(event) => setAdjustmentValue(event.target.value)}
                    inputProps={{ step: adjustmentType === 'percentage' ? 0.5 : 0.1 }}
                    helperText="Pozitif bir değer giriniz"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleProcess}
                  disabled={processing}
                  sx={{ bgcolor: '#191970', '&:hover': { bgcolor: '#0f0f40' } }}
                  startIcon={processing ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                  {processing ? 'Güncelleniyor...' : 'Fiyatları Güncelle'}
                </Button>
                <Button variant="outlined" onClick={handleResetFilters} disabled={processing}>
                  Sıfırla
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        {summaryMessage && <Alert severity="info">{summaryMessage}</Alert>}

        {resultRows && resultRows.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Stok Kodu</TableCell>
                  <TableCell>Stok Adı</TableCell>
                  <TableCell align="right">Önceki Fiyat</TableCell>
                  <TableCell align="right">Yeni Fiyat</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Açıklama</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultRows.map((row) => (
                  <TableRow key={row.stokId + row.stokKodu}>
                    <TableCell>{row.stokKodu}</TableCell>
                    <TableCell>{row.stokAdi}</TableCell>
                    <TableCell align="right">
                      {row.previousPrice != null ? `₺${row.previousPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {row.newPrice != null ? `₺${row.newPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          row.status === 'success'
                            ? 'Başarılı'
                            : row.status === 'failed'
                            ? 'Hatalı'
                            : 'Atlandı'
                        }
                        color={row.status === 'success' ? 'success' : row.status === 'failed' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{row.message || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </MainLayout>
  );
}


