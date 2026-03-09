'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Print } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import axios from '@/lib/axios';
import ServiceInvoicePrintView from '@/components/servis/ServiceInvoicePrintView';
import type { ServiceInvoice, WorkOrderItem } from '@/types/servis';

export default function ServisFaturaDetayPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/service-invoice/${id}`);
        setInvoice(res.data);
      } catch {
        router.push('/servis/faturalar');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(n));

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Fatura_${invoice?.invoiceNo ?? 'detay'}`,
  });

  if (loading || !invoice) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  const workOrder = invoice.workOrder;
  const items = workOrder?.items ?? [];
  const journalEntry = invoice.journalEntry;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/servis/faturalar')}
          sx={{ textTransform: 'none' }}
        >
          Geri
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Fatura: {invoice.invoiceNo}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button startIcon={<Print />} onClick={() => handlePrint()} variant="outlined" size="small" sx={{ textTransform: 'none' }}>
          Yazdır
        </Button>
      </Box>

      <Box sx={{ display: 'none' }}>
        <ServiceInvoicePrintView ref={printRef} invoice={invoice} />
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <Typography variant="subtitle2" color="text.secondary">
          İş Emri
        </Typography>
        <Typography variant="body1" fontWeight={600}>
          {workOrder?.workOrderNo ?? '-'}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
          Araç
        </Typography>
        <Typography variant="body1">
          {workOrder?.customerVehicle
            ? `${workOrder.customerVehicle.plaka} - ${workOrder.customerVehicle.aracMarka} ${workOrder.customerVehicle.aracModel}`
            : '-'}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
          Müşteri
        </Typography>
        <Typography variant="body1">{invoice.cari?.unvan ?? invoice.cari?.cariKodu ?? '-'}</Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
          Fatura Tarihi
        </Typography>
        <Typography variant="body1">{formatDate(invoice.issueDate)}</Typography>
      </Paper>

      <Card sx={{ mb: 3, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Fatura Kalemleri
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Stok</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Miktar
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Birim Fiyat
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Toplam
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item: WorkOrderItem) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.type === 'LABOR' ? 'İşçilik' : 'Parça'}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      {item.stok ? `${item.stok.stokKodu} - ${item.stok.stokAdi}` : '-'}
                    </TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.totalPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Ara Toplam</Typography>
              <Typography fontWeight={600}>{formatCurrency(invoice.subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">KDV</Typography>
              <Typography fontWeight={600}>{formatCurrency(invoice.taxAmount)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Genel Toplam
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {formatCurrency(invoice.grandTotal)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {journalEntry && (
        <Card sx={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Muhasebe Kaydı
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {journalEntry.description}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Hesap Kodu</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hesap Adı</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Borç
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Alacak
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(journalEntry.lines ?? []).map((line: any) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.accountCode}</TableCell>
                      <TableCell>{line.accountName}</TableCell>
                      <TableCell align="right">{formatCurrency(line.debit)}</TableCell>
                      <TableCell align="right">{formatCurrency(line.credit)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </>
  );
}
