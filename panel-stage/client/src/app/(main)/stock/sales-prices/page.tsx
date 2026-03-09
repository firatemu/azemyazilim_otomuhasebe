'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ManageHistory, Refresh, Save } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import TableSkeleton from '@/components/Loading/TableSkeleton';
import { SalePriceDialog } from '@/components/SalePriceDialog';

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  marka?: string | null;
  satisFiyati: number;
  alisFiyati: number;
}

const formatDateOnly = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function SatisFiyatlariPage() {
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>(
    { open: false, message: '', severity: 'success' }
  );
  const [draftPrices, setDraftPrices] = useState<Record<string, string>>({});
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [selectedStok, setSelectedStok] = useState<Stok | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    void fetchStoklar();
  }, [debouncedSearch]);

  const fetchStoklar = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/product', {
        params: {
          limit: 200,
          search: debouncedSearch || undefined,
        },
      });
      const items: Stok[] = response.data?.data ?? [];
      setStoklar(items);
      setDraftPrices((prev) => {
        const next: Record<string, string> = { ...prev };
        items.forEach((stok) => {
          if (next[stok.id] === undefined) {
            next[stok.id] = Number(stok.satisFiyati ?? 0).toString();
          }
        });
        return next;
      });
    } catch (error) {
      console.error('Satış fiyatları alınamadı', error);
      setSnackbar({ open: true, severity: 'error', message: 'Satış fiyatları yüklenirken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (stokId: string, value: string) => {
    setDraftPrices((prev) => ({ ...prev, [stokId]: value }));
  };

  const handleOpenPriceDialog = (stok: Stok) => {
    setSelectedStok(stok);
    setPriceDialogOpen(true);
  };

  const handlePriceDialogClose = () => {
    setPriceDialogOpen(false);
    setSelectedStok(null);
  };

  const handleSavePrice = async (stok: Stok) => {
    const rawValue = draftPrices[stok.id];
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed) || parsed < 0) {
      setSnackbar({ open: true, severity: 'error', message: 'Geçerli bir fiyat giriniz.' });
      return;
    }

    setSavingId(stok.id);
    try {
      const now = new Date();
      await axios.post('/price-cards', {
        stokId: stok.id,
        type: 'SALE',
        price: parsed,
        effectiveFrom: formatDateOnly(now),
        note: `Tablodan güncelleme • ${now.toLocaleString('tr-TR')}`,
      });
      setSnackbar({ open: true, severity: 'success', message: `${stok.stokKodu} için satış fiyatı güncellendi.` });
      setStoklar((prev) =>
        prev.map((item) => (item.id === stok.id ? { ...item, satisFiyati: parsed } : item))
      );
      setDraftPrices((prev) => ({ ...prev, [stok.id]: parsed.toString() }));
      await fetchStoklar();
    } catch (error: any) {
      console.error('Satış fiyatı güncellenemedi', error);
      const message = error?.response?.data?.message ?? 'Fiyat güncellenirken hata oluştu.';
      setSnackbar({ open: true, severity: 'error', message });
    } finally {
      setSavingId(null);
    }
  };

  const filteredStoklar = useMemo(() => stoklar, [stoklar]);

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
            Satış Fiyatları
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ürünlerin satış fiyatlarını görüntüleyin ve güncelleyin.
          </Typography>
        </Box>

        <Paper sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Stok kodu veya adına göre ara"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 220 }}
          />
          <Tooltip title="Yenile">
            <span>
              <IconButton onClick={fetchStoklar} disabled={loading}>
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--muted)' }}>
              <TableRow>
                <TableCell><strong>Stok Kodu</strong></TableCell>
                <TableCell><strong>Stok Adı</strong></TableCell>
                <TableCell><strong>Marka</strong></TableCell>
                <TableCell align="right"><strong>Güncel Satış Fiyatı</strong></TableCell>
                <TableCell align="right"><strong>Yeni Fiyat</strong></TableCell>
                <TableCell align="center"><strong>İşlem</strong></TableCell>
                <TableCell align="center"><strong>Fiyat Kartları</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : filteredStoklar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Kayıt bulunamadı.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStoklar.map((stok) => {
                  const draft = draftPrices[stok.id] ?? stok.satisFiyati?.toString() ?? '';
                  const hasChanged = Number(draft) !== Number(stok.satisFiyati);
                  return (
                    <TableRow key={stok.id} hover>
                      <TableCell width="18%">
                        <Typography fontWeight={600}>{stok.stokKodu}</Typography>
                      </TableCell>
                      <TableCell width="32%">{stok.stokAdi}</TableCell>
                      <TableCell width="15%">{stok.marka || '-'}</TableCell>
                      <TableCell width="15%" align="right">
                        ₺{Number(stok.satisFiyati ?? 0).toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell width="15%" align="right">
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 0, step: 0.01 }}
                          value={draft}
                          onChange={(e) => handlePriceChange(stok.id, e.target.value)}
                          sx={{ maxWidth: 160 }}
                        />
                      </TableCell>
                      <TableCell width="10%" align="center">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Save fontSize="small" />}
                          disabled={savingId === stok.id || !hasChanged}
                          onClick={() => handleSavePrice(stok)}
                          sx={{
                            minWidth: 100,
                            bgcolor: '#191970',
                            '&:hover': { bgcolor: '#0f0f40' },
                          }}
                        >
                          Güncelle
                        </Button>
                      </TableCell>
                      <TableCell width="10%" align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ManageHistory fontSize="small" />}
                          onClick={() => handleOpenPriceDialog(stok)}
                        >
                          Fiyat Kartları
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <SalePriceDialog
        open={priceDialogOpen}
        stok={selectedStok}
        onClose={handlePriceDialogClose}
        onPriceCreated={(newPrice) => {
          if (!selectedStok) return;
          setDraftPrices((prev) => ({ ...prev, [selectedStok.id]: newPrice.toString() }));
          setStoklar((prev) =>
            prev.map((item) => (item.id === selectedStok.id ? { ...item, satisFiyati: newPrice } : item))
          );
        }}
      />
    </MainLayout>
  );
}

