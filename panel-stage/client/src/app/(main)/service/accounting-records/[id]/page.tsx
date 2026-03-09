'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import axios from '@/lib/axios';

export default function MuhasebeKaydiDetayPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/journal-entry/${id}`);
        setEntry(res.data);
      } catch {
        router.push('/servis/muhasebe-kayitlari');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(n));

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

  if (loading || !entry) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  const lines = entry.lines ?? [];

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/servis/muhasebe-kayitlari')}
          sx={{ textTransform: 'none' }}
        >
          Geri
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Muhasebe Kaydı
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <Typography variant="subtitle2" color="text.secondary">
          Tarih
        </Typography>
        <Typography variant="body1">{formatDate(entry.entryDate)}</Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
          Referans
        </Typography>
        <Typography variant="body1">
          {entry.serviceInvoice?.invoiceNo ?? `${entry.referenceType} / ${entry.referenceId}`}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
          Açıklama
        </Typography>
        <Typography variant="body1">{entry.description || '-'}</Typography>
      </Paper>

      <Paper sx={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
          Yevmiye Satırları
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Hesap Kodu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Hesap Adı</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Borç
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Alacak
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line: any) => (
                <TableRow key={line.id}>
                  <TableCell>{line.accountCode}</TableCell>
                  <TableCell>{line.accountName}</TableCell>
                  <TableCell>{line.description || '-'}</TableCell>
                  <TableCell align="right">{formatCurrency(line.debit)}</TableCell>
                  <TableCell align="right">{formatCurrency(line.credit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
