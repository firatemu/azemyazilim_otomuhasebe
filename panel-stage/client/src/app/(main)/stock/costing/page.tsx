'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
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
import RefreshIcon from '@mui/icons-material/Refresh';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import * as XLSX from 'xlsx';

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  marka?: string | null;
  anaKategori?: string | null;
  altKategori?: string | null;
}

interface ResultRow {
  stokId: string;
  stokKodu: string;
  stokAdi: string;
  marka?: string | null;
  cost: number;
  status: 'success' | 'failed';
  message?: string;
  computedAt?: string | null;
}

export default function MaliyetlendirmePage() {
  const [allStocks, setAllStocks] = useState<Stok[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedMarka, setSelectedMarka] = useState('');
  const [selectedAnaKategori, setSelectedAnaKategori] = useState('');
  const [selectedAltKategori, setSelectedAltKategori] = useState('');

  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [resultRows, setResultRows] = useState<ResultRow[]>([]);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestLoading, setLatestLoading] = useState(false);

  const markaOptions = useMemo(() => {
    const set = new Set<string>();
    allStocks.forEach((item) => {
      if (item.marka) set.add(item.marka);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [allStocks]);

  const anaKategoriOptions = useMemo(() => {
    const set = new Set<string>();
    allStocks.forEach((item) => {
      if (item.anaKategori) set.add(item.anaKategori);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [allStocks]);

  const altKategoriOptions = useMemo(() => {
    const filtered = selectedAnaKategori
      ? allStocks.filter((item) => item.anaKategori === selectedAnaKategori)
      : allStocks;

    const set = new Set<string>();
    filtered.forEach((item) => {
      if (item.altKategori) set.add(item.altKategori);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [allStocks, selectedAnaKategori]);

  useEffect(() => {
    const fetchStocks = async () => {
      setInitialLoading(true);
      setInitialError(null);
      try {
        const response = await axios.get('/product', {
          params: { limit: 1000 },
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

  const filteredStocks = useMemo(() => {
    return allStocks.filter((stok) => {
      if (search) {
        const term = search.trim().toLowerCase();
        if (
          !stok.stokKodu.toLowerCase().includes(term) &&
          !stok.stokAdi.toLowerCase().includes(term)
        ) {
          return false;
        }
      }

      if (selectedMarka && stok.marka !== selectedMarka) return false;
      if (selectedAnaKategori && stok.anaKategori !== selectedAnaKategori) return false;
      if (selectedAltKategori && stok.altKategori !== selectedAltKategori) return false;
      return true;
    });
  }, [allStocks, search, selectedMarka, selectedAnaKategori, selectedAltKategori]);

  const fetchLatestCosts = useCallback(async () => {
    setLatestLoading(true);
    setErrorMessage(null);
    try {
      const params: Record<string, string | number> = { limit: 500 };
      if (search.trim()) params.search = search.trim();
      if (selectedMarka) params.marka = selectedMarka;
      if (selectedAnaKategori) params.anaKategori = selectedAnaKategori;
      if (selectedAltKategori) params.altKategori = selectedAltKategori;

      const response = await axios.get('/costing/latest', { params });
      const payload = response.data ?? {};
      const rows: ResultRow[] = (payload.data ?? []).map((item: any) => {
        const costValue = typeof item.cost === 'number' ? item.cost : null;
        const hasCost = typeof costValue === 'number' && Number.isFinite(costValue);
        return {
          stokId: item.stokId,
          stokKodu: item.stokKodu,
          stokAdi: item.stokAdi,
          marka: item.marka ?? null,
          cost: hasCost ? costValue : 0,
          status: hasCost ? 'success' : 'failed',
          message: hasCost ? undefined : item.note ?? 'Maliyet bulunamadı.',
          computedAt: item.computedAt ?? null,
        };
      });

      setResultRows(rows);
      if (rows.length > 0) {
        setSummaryMessage(`Toplam ${rows.length} stok için mevcut maliyet bilgileri görüntüleniyor.`);
      } else {
        setSummaryMessage('Mevcut kriterlere göre görüntülenecek maliyet kaydı bulunamadı.');
      }
    } catch (error: any) {
      console.error('Maliyet verileri alınamadı', error);
      setErrorMessage(error?.response?.data?.message ?? 'Maliyet verileri alınamadı.');
    } finally {
      setLatestLoading(false);
    }
  }, [search, selectedMarka, selectedAnaKategori, selectedAltKategori]);

  useEffect(() => {
    void fetchLatestCosts();
  }, [fetchLatestCosts]);

  const handleReset = () => {
    setSearch('');
    setSelectedMarka('');
    setSelectedAnaKategori('');
    setSelectedAltKategori('');
    setResultRows([]);
    setSummaryMessage(null);
    setErrorMessage(null);
    setProcessedCount(0);
    setTargetCount(0);
  };

  const handleExportExcel = () => {
    if (resultRows.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(
      resultRows.map((row) => ({
        stokKodu: row.stokKodu,
        stokAdi: row.stokAdi,
        marka: row.marka ?? '',
        maliyet: row.cost,
        hesaplanmaTarihi: row.computedAt
          ? new Date(row.computedAt).toLocaleString('tr-TR')
          : '',
        durum: row.status,
        aciklama: row.message ?? '',
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Maliyetlendirme');
    XLSX.writeFile(workbook, 'maliyetlendirme-sonuclari.xlsx');
  };

  const handleProcess = async () => {
    setProcessing(true);
    setProcessedCount(0);
    setTargetCount(filteredStocks.length);
    setResultRows([]);
    setSummaryMessage(null);
    setErrorMessage(null);

    if (filteredStocks.length === 0) {
      setSummaryMessage('Seçilen kriterlere göre stok bulunamadı.');
      setProcessing(false);
      return;
    }

    // API en fazla 500 stok kabul ediyor; 500'den fazlaysa partilere böl
    const BATCH_SIZE = 500;
    const stokIds = filteredStocks.map((s) => s.id);
    const stokMap = new Map(filteredStocks.map((s) => [s.id, s]));

    const chunks: string[][] = [];
    for (let i = 0; i < stokIds.length; i += BATCH_SIZE) {
      chunks.push(stokIds.slice(i, i + BATCH_SIZE));
    }

    const allRows: ResultRow[] = [];

    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const response = await axios.post('/costing/calculate-bulk', { stokIds: chunk });
        const bulkResults = response.data?.results ?? [];

        const chunkRows: ResultRow[] = bulkResults.map((r: { stokId: string; stokKodu: string; stokAdi: string; cost: number; status: string; message?: string }) => {
          const stok = stokMap.get(r.stokId);
          return {
            stokId: r.stokId,
            stokKodu: r.stokKodu,
            stokAdi: r.stokAdi,
            marka: stok?.marka ?? null,
            cost: r.cost ?? 0,
            status: r.status as 'success' | 'failed',
            message: r.message ?? undefined,
            computedAt: r.status === 'success' ? new Date().toISOString() : null,
          };
        });

        allRows.push(...chunkRows);
        setProcessedCount((prev) => prev + chunk.length);
        setResultRows([...allRows]);
      }

      const success = allRows.filter((r) => r.status === 'success').length;
      const failed = allRows.filter((r) => r.status === 'failed').length;

      setSummaryMessage(
        `Toplam ${filteredStocks.length} malzeme işlendi (${chunks.length} parti). Başarılı: ${success}, Hatalı: ${failed}.`,
      );
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message ?? 'Toplu maliyet hesaplama başarısız.');
      setResultRows(allRows.length > 0 ? allRows : []);
    } finally {
      setProcessing(false);
    }
  };

  const progress =
    targetCount > 0 ? Math.min(100, Math.round((processedCount / targetCount) * 100)) : 0;

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
            Maliyetlendirme Servisi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Satın alma faturalarındaki onaylı KDV dahil birim fiyatlara göre ağırlıklı ortalama maliyet
            hesaplanır. Stok sıfırlandığında ortalama sıfırlanır ve yeni girişlerle yeniden
            başlatılır.
          </Typography>
        </Box>

        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {initialLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography color="text.secondary">Ürün verileri yükleniyor...</Typography>
            </Box>
          ) : (
            <>
              {initialError && (
                <Alert severity="warning">
                  {initialError} Filtre listeleri sınırlı olabilir ancak mevcut maliyet verileri
                  görüntülenmeye devam edecektir.
                </Alert>
              )}
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                }}
              >
                <TextField
                  label="Stok Kodu veya Adı"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  size="small"
                  placeholder="Ara..."
                  disabled={processing}
                />
                <FormControl size="small" disabled={processing}>
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
                <FormControl size="small" disabled={processing}>
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
                <FormControl
                  size="small"
                  disabled={processing || (!!selectedAnaKategori && altKategoriOptions.length === 0)}
                >
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

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleProcess}
                  disabled={processing || filteredStocks.length === 0}
                  sx={{ bgcolor: '#191970', '&:hover': { bgcolor: '#0f0f40' } }}
                  startIcon={processing ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                  {processing ? 'Hesaplanıyor...' : 'Maliyetleri Hesapla'}
                </Button>
                <Button variant="outlined" onClick={handleReset} disabled={processing}>
                  Sıfırla
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => void fetchLatestCosts()}
                  disabled={processing || latestLoading}
                  startIcon={
                    latestLoading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />
                  }
                >
                  Maliyetleri Yenile
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleExportExcel}
                  disabled={processing || resultRows.length === 0 || latestLoading}
                >
                  Excel&apos;e Aktar
                </Button>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Seçili kriterlere uyan {filteredStocks.length} malzeme bulundu.
              </Typography>
              {latestLoading && !processing && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Mevcut maliyetler yenileniyor...
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>

        {processing && (
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Maliyetlendirme Devam Ediyor...
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary">
              {processedCount}/{targetCount} malzeme işlendi (%{progress}).
            </Typography>
          </Paper>
        )}

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {summaryMessage && <Alert severity="info">{summaryMessage}</Alert>}

        {resultRows.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 480 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Stok Kodu</TableCell>
                  <TableCell>Stok Adı</TableCell>
                  <TableCell>Marka</TableCell>
                  <TableCell align="right">Maliyet (₺)</TableCell>
                  <TableCell align="right">Hesaplanma Tarihi</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Açıklama</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultRows.map((row) => (
                  <TableRow key={row.stokId}>
                    <TableCell>{row.stokKodu}</TableCell>
                    <TableCell>{row.stokAdi}</TableCell>
                    <TableCell>{row.marka ?? '-'}</TableCell>
                    <TableCell align="right">
                      ₺{row.cost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </TableCell>
                    <TableCell align="right">
                      {row.computedAt
                        ? new Date(row.computedAt).toLocaleString('tr-TR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          row.status === 'success'
                            ? row.computedAt
                              ? 'Mevcut'
                              : 'Başarılı'
                            : 'Hatalı'
                        }
                        size="small"
                        color={row.status === 'success' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{row.message ?? '-'}</TableCell>
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


