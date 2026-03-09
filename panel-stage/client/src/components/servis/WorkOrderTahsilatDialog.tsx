'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from '@mui/material';
import axios from '@/lib/axios';

interface WorkOrderTahsilatDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cariId: string;
  cariUnvan: string;
  serviceInvoiceId: string;
  workOrderNo: string;
  grandTotal: number;
}

export default function WorkOrderTahsilatDialog({
  open,
  onClose,
  onSuccess,
  cariId,
  cariUnvan,
  serviceInvoiceId,
  workOrderNo,
  grandTotal,
}: WorkOrderTahsilatDialogProps) {
  const [tutar, setTutar] = useState<string>(String(grandTotal));
  const [odemeTipi, setOdemeTipi] = useState<'NAKIT' | 'KREDI_KARTI'>('NAKIT');
  const [kasaId, setKasaId] = useState('');
  const [bankaHesapId, setBankaHesapId] = useState('');
  const [aciklama, setAciklama] = useState(`İş Emri ${workOrderNo} tahsilatı`);
  const [loading, setLoading] = useState(false);
  const [kasalar, setKasalar] = useState<{ id: string; kasaAdi: string; kasaTipi: string }[]>([]);
  const [bankaHesaplari, setBankaHesaplari] = useState<{ id: string; hesapAdi: string; bankaAdi: string; hesapTipi: string }[]>([]);

  useEffect(() => {
    if (open) {
      setTutar(String(grandTotal));
      setAciklama(`İş Emri ${workOrderNo} tahsilatı`);
    }
  }, [open, grandTotal, workOrderNo]);

  useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      try {
        const [kRes, bRes] = await Promise.all([
          axios.get('/cashbox', { params: { aktif: true } }),
          axios.get('/bank/ozet'),
        ]);
        const kData = kRes.data?.data ?? kRes.data ?? [];
        setKasalar(Array.isArray(kData) ? kData : []);
        const hesaplar: any[] = [];
        (bRes.data?.bankalar ?? []).forEach((banka: any) => {
          (banka.hesaplar ?? []).forEach((hesap: any) => {
            hesaplar.push({
              ...hesap,
              bankaAdi: banka.ad || banka.bankaAdi || 'Banka',
              hesapTipi: hesap.hesapTipi || 'VADELI',
            });
          });
        });
        setBankaHesaplari(hesaplar);
      } catch {
        setKasalar([]);
        setBankaHesaplari([]);
      }
    };
    fetch();
  }, [open]);

  const nakitKasalar = kasalar.filter((k: any) => k.kasaTipi === 'NAKIT');
  const posHesaplar = bankaHesaplari.filter((h: any) => h.hesapTipi === 'POS');

  const handleSubmit = async () => {
    const tutarNum = parseFloat(tutar);
    if (!tutarNum || tutarNum <= 0) return;
    if (odemeTipi === 'NAKIT' && !kasaId) return;
    if (odemeTipi === 'KREDI_KARTI' && !bankaHesapId) return;

    setLoading(true);
    try {
      await axios.post('/collection', {
        cariId,
        serviceInvoiceId,
        tip: 'TAHSILAT',
        tutar: tutarNum,
        tarih: new Date().toISOString().split('T')[0],
        odemeTipi: odemeTipi === 'NAKIT' ? 'NAKIT' : 'KREDI_KARTI',
        kasaId: odemeTipi === 'NAKIT' ? kasaId : undefined,
        bankaHesapId: odemeTipi === 'KREDI_KARTI' ? bankaHesapId : undefined,
        aciklama,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tahsilat kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tahsilat Al - {workOrderNo}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Cari" value={cariUnvan} disabled fullWidth />
          <TextField
            label="Tutar (₺)"
            type="number"
            value={tutar}
            onChange={(e) => setTutar(e.target.value)}
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
          />
          <FormControl fullWidth>
            <InputLabel>Ödeme Tipi</InputLabel>
            <Select
              value={odemeTipi}
              label="Ödeme Tipi"
              onChange={(e) => {
                setOdemeTipi(e.target.value as 'NAKIT' | 'KREDI_KARTI');
                setKasaId('');
                setBankaHesapId('');
              }}
            >
              <MenuItem value="NAKIT">Nakit</MenuItem>
              <MenuItem value="KREDI_KARTI">Kredi Kartı (POS)</MenuItem>
            </Select>
          </FormControl>
          {odemeTipi === 'NAKIT' && (
            <FormControl fullWidth>
              <InputLabel>Kasa</InputLabel>
              <Select value={kasaId} label="Kasa" onChange={(e) => setKasaId(e.target.value)}>
                {nakitKasalar.map((k) => (
                  <MenuItem key={k.id} value={k.id}>{k.kasaAdi}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {odemeTipi === 'KREDI_KARTI' && (
            <FormControl fullWidth>
              <InputLabel>POS Banka Hesabı</InputLabel>
              <Select value={bankaHesapId} label="POS Banka Hesabı" onChange={(e) => setBankaHesapId(e.target.value)}>
                {posHesaplar.map((h) => (
                  <MenuItem key={h.id} value={h.id}>{h.bankaAdi} - {h.hesapAdi}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            label="Açıklama"
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading} startIcon={loading ? <CircularProgress size={18} /> : null}>
          Tahsilat Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
