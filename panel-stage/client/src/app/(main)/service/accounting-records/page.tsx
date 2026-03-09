'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Button,
} from '@mui/material';
import { Visibility, Receipt, Close } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

type ReadyWorkOrder = {
  id: string;
  workOrderNo: string;
  customerVehicle?: { plaka?: string; aracMarka?: string; aracModel?: string };
  cari?: { unvan?: string; cariKodu?: string };
};

export default function MuhasebeKayitlariPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [readyWorkOrders, setReadyWorkOrders] = useState<ReadyWorkOrder[]>([]);
  const [readyLoading, setReadyLoading] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    fetchReadyWorkOrders();
  }, []);

  const fetchReadyWorkOrders = async () => {
    try {
      setReadyLoading(true);
      const res = await axios.get('/work-order', {
        params: { readyForInvoice: true, limit: 50 },
      });
      const data = res.data?.data ?? res.data;
      setReadyWorkOrders(Array.isArray(data) ? data : []);
    } catch {
      setReadyWorkOrders([]);
    } finally {
      setReadyLoading(false);
    }
  };

  const handleFaturaKes = (workOrderId: string) => {
    router.push(`/servis/faturalar?newInvoice=1&workOrderId=${workOrderId}`);
  };

  const handleIsEmriniKapat = async (workOrderId: string) => {
    try {
      setClosingId(workOrderId);
      await axios.patch(`/work-order/${workOrderId}/status`, { status: 'CLOSED_WITHOUT_INVOICE' });
      fetchReadyWorkOrders();
    } catch {
      // ignore
    } finally {
      setClosingId(null);
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/journal-entry', {
        params: { referenceType: 'SERVICE_INVOICE', limit: 100 },
      });
      const data = res.data?.data ?? res.data;
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(n));

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

  const getLinesSummary = (lines: any[]) => {
    if (!lines || lines.length === 0) return '-';
    const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
    return `Borç: ${formatCurrency(totalDebit)} / Alacak: ${formatCurrency(totalCredit)}`;
  };

  return (
    <>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          fontSize: '1.875rem',
          color: 'var(--foreground)',
          letterSpacing: '-0.02em',
          mb: 1,
        }}
      >
        Muhasebe Kayıtları
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
        Servis faturalarına ait muhasebe kayıtlarını inceleyin
      </Typography>

      {readyWorkOrders.length > 0 && (
        <Paper sx={{ mb: 3, borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, p: 2, pb: 0 }}>
            Faturalanacak İş Emirleri
          </Typography>
          <Typography variant="body2" sx={{ px: 2, color: 'var(--muted-foreground)', mb: 1 }}>
            Araç hazır durumundaki iş emirlerini faturalandırın veya faturasız kapatın
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>İş Emri No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Araç</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {readyLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : (
                  readyWorkOrders.map((wo) => (
                    <TableRow key={wo.id} hover>
                      <TableCell>{wo.workOrderNo}</TableCell>
                      <TableCell>
                        {wo.customerVehicle
                          ? `${wo.customerVehicle.plaka ?? ''} - ${wo.customerVehicle.aracMarka ?? ''} ${wo.customerVehicle.aracModel ?? ''}`.trim()
                          : '-'}
                      </TableCell>
                      <TableCell>{wo.cari?.unvan ?? wo.cari?.cariKodu ?? '-'}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Receipt />}
                          onClick={() => handleFaturaKes(wo.id)}
                          sx={{ mr: 1, textTransform: 'none' }}
                        >
                          Fatura Kes
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Close />}
                          onClick={() => handleIsEmriniKapat(wo.id)}
                          disabled={closingId === wo.id}
                          sx={{ textTransform: 'none' }}
                        >
                          İş emrini kapat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Paper
        sx={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Kayıt No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Referans</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Borç / Alacak Özeti</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  İşlem
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'var(--muted-foreground)' }}>
                    Kayıt bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>{entry.id.slice(0, 8)}...</TableCell>
                    <TableCell>{formatDate(entry.entryDate)}</TableCell>
                    <TableCell>
                      {entry.serviceInvoice?.invoiceNo ?? `${entry.referenceType} / ${entry.referenceId?.slice(0, 8)}`}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>{entry.description || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {getLinesSummary(entry.lines ?? [])}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/servis/muhasebe-kayitlari/${entry.id}`)}
                        title="Detay"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
