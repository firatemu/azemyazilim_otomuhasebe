'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Close, Refresh, Save } from '@mui/icons-material';
import axios from '@/lib/axios';

interface PriceCard {
  id: string;
  price: string;
  currency: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  note?: string | null;
  createdAt: string;
  createdByUser?: {
    id: string;
    fullName: string | null;
    username: string | null;
  } | null;
}

interface SalePriceDialogProps {
  open: boolean;
  stok: {
    id: string;
    stokKodu: string;
    stokAdi: string;
    satisFiyati: number;
  } | null;
  onClose: () => void;
  onPriceCreated?: (newPrice: number) => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('tr-TR');
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('tr-TR');
};

const toDateInputValue = (date: Date) => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

export function SalePriceDialog({ open, stok, onClose, onPriceCreated }: SalePriceDialogProps) {
  const [priceCards, setPriceCards] = useState<PriceCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59);
    return {
      price: '',
      effectiveFrom: toDateInputValue(now),
      effectiveTo: toDateInputValue(endOfYear),
      note: '',
    };
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const stokId = stok?.id;

  const resetForm = useCallback((initialPrice?: number) => {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59);
    setForm({
      price: initialPrice != null && !Number.isNaN(initialPrice) ? initialPrice.toString() : '',
      effectiveFrom: toDateInputValue(now),
      effectiveTo: toDateInputValue(endOfYear),
      note: '',
    });
  }, []);

  const fetchPriceCards = useCallback(async () => {
    if (!stokId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/price-cards/stok/${stokId}`, {
        params: { type: 'SALE' },
      });
      setPriceCards(response.data ?? []);
    } catch (error) {
      console.error('Fiyat kartları alınamadı', error);
      setSnackbar({ open: true, severity: 'error', message: 'Fiyat geçmişi alınamadı.' });
    } finally {
      setLoading(false);
    }
  }, [stokId]);

  useEffect(() => {
    if (open) {
      void fetchPriceCards();
      resetForm(stok?.satisFiyati ?? undefined);
    }
  }, [open, fetchPriceCards, resetForm, stok?.satisFiyati]);

  const handleSubmit = async () => {
    if (!stokId) return;

    const price = Number(form.price);
    if (Number.isNaN(price) || price <= 0) {
      setSnackbar({ open: true, severity: 'error', message: 'Geçerli bir fiyat giriniz.' });
      return;
    }

    setSaving(true);
    try {
      await axios.post('/price-cards', {
        stokId,
        type: 'SALE',
        price,
        effectiveFrom: form.effectiveFrom || undefined,
        effectiveTo: form.effectiveTo || undefined,
        note: form.note || undefined,
      });

      setSnackbar({ open: true, severity: 'success', message: 'Yeni satış fiyatı kaydedildi.' });
      resetForm();
      await fetchPriceCards();
      onPriceCreated?.(price);
    } catch (error: any) {
      console.error('Fiyat kartı kaydedilemedi', error);
      const message = error?.response?.data?.message ?? 'Fiyat kaydı oluşturulamadı.';
      setSnackbar({ open: true, severity: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const latestPriceCard = useMemo(() => priceCards.at(0) ?? null, [priceCards]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {stok ? `${stok.stokKodu} • ${stok.stokAdi}` : 'Satış Fiyatları'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ürünün satış fiyat geçmişini görüntüleyin ve yeni fiyat ekleyin.
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Yeni Satış Fiyatı
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="Satış Fiyatı"
                type="number"
                required
                size="small"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ flex: '1 1 220px' }}
              />
              <TextField
                label="Geçerlilik Başlangıcı"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={form.effectiveFrom}
                onChange={(e) => setForm((prev) => ({ ...prev, effectiveFrom: e.target.value }))}
                sx={{ flex: '1 1 220px' }}
              />
              <TextField
                label="Geçerlilik Bitişi"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={form.effectiveTo}
                onChange={(e) => setForm((prev) => ({ ...prev, effectiveTo: e.target.value }))}
                sx={{ flex: '1 1 220px' }}
              />
              <TextField
                label="Not"
                multiline
                minRows={2}
                size="small"
                value={form.note}
                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                sx={{ flex: '1 1 100%' }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={saving}
                sx={{ bgcolor: '#191970', '&:hover': { bgcolor: '#0f0f40' } }}
              >
                Kaydet
              </Button>
              <Tooltip title="Yenile">
                <span>
                  <IconButton onClick={fetchPriceCards} disabled={loading}>
                    <Refresh />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Fiyat Geçmişi
            </Typography>
            {loading ? (
              <Typography color="text.secondary">Fiyat geçmişi yükleniyor...</Typography>
            ) : priceCards.length === 0 ? (
              <Typography color="text.secondary">Henüz fiyat kartı bulunmuyor.</Typography>
            ) : (
              <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {priceCards.map((card) => {
                  const isLatest = latestPriceCard?.id === card.id;
                  return (
                    <ListItem
                      key={card.id}
                      sx={{
                        border: '1px solid',
                        borderColor: isLatest ? '#191970' : 'divider',
                        borderRadius: 2,
                        mb: 1.5,
                        backgroundColor: isLatest ? 'rgba(25, 25, 112, 0.05)' : 'transparent',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" fontWeight={700}>
                              ₺{Number(card.price).toLocaleString('tr-TR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                            {isLatest && (
                              <Typography variant="caption" color="primary">
                                (Aktif)
                              </Typography>
                            )}
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                        secondary={
                          <Stack spacing={0.4}>
                            <Typography variant="caption">Geçerlilik: {formatDate(card.effectiveFrom)} → {formatDate(card.effectiveTo)}</Typography>
                            <Typography variant="caption">Oluşturan: {card.createdByUser?.fullName || card.createdByUser?.username || 'Sistem'} • {formatDateTime(card.createdAt)}</Typography>
                            {card.note && (
                              <Typography variant="caption" color="text.secondary">
                                Not: {card.note}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

