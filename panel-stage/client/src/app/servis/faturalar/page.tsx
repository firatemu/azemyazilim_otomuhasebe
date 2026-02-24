'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  IconButton,
  CircularProgress,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Search, Visibility, Add, ArrowBack } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import axios from '@/lib/axios';
import type { ServiceInvoice, WorkOrder, WorkOrderItem } from '@/types/servis';

type WorkOrderOption = {
  id: string;
  workOrderNo: string;
  description?: string;
  grandTotal: number;
  customerVehicle?: { plaka?: string; aracMarka?: string; aracModel?: string };
  cari?: { unvan?: string; cariKodu?: string };
};

type ItemPriceEdit = { id: string; unitPrice: number; taxRate: number };

function ServisFaturalariContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<ServiceInvoice[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [invoiceStep, setInvoiceStep] = useState<1 | 2>(1);
  const [workOrders, setWorkOrders] = useState<WorkOrderOption[]>([]);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [itemPrices, setItemPrices] = useState<ItemPriceEdit[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [debouncedSearch]);

  useEffect(() => {
    const woId = searchParams.get('workOrderId');
    const open = searchParams.get('newInvoice');
    if (open === '1' && woId) {
      setNewInvoiceOpen(true);
      setInvoiceStep(1);
      setSelectedWorkOrderId(woId);
      setCreateError(null);
      axios.get('/work-order', { params: { readyForInvoice: true, limit: 50 } })
        .then((res) => {
          const data = res.data?.data ?? res.data;
          setWorkOrders(Array.isArray(data) ? data : []);
        })
        .catch(() => setWorkOrders([]));
      axios.get(`/work-order/${woId}`)
        .then((res) => {
          const wo = res.data;
          setSelectedWorkOrder(wo);
          setItemPrices((wo.items ?? []).map((i: WorkOrderItem) => ({
            id: i.id,
            unitPrice: Number(i.unitPrice) || 0,
            taxRate: i.taxRate ?? 20,
          })));
          setInvoiceStep(2);
        })
        .catch(() => setCreateError('İş emri yüklenemedi'));
    }
  }, [searchParams]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/service-invoice', {
        params: { search: debouncedSearch || undefined, limit: 100 },
      });
      const data = res.data?.data ?? res.data;
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const openNewInvoiceDialog = async (preselectId?: string) => {
    setNewInvoiceOpen(true);
    setInvoiceStep(1);
    setSelectedWorkOrderId(preselectId ?? null);
    setSelectedWorkOrder(null);
    setItemPrices([]);
    setCreateError(null);
    try {
      const res = await axios.get('/work-order', {
        params: { readyForInvoice: true, limit: 50 },
      });
      const data = res.data?.data ?? res.data;
      setWorkOrders(Array.isArray(data) ? data : []);
    } catch {
      setWorkOrders([]);
    }
  };

  const handleSelectWorkOrder = async (woId: string) => {
    setSelectedWorkOrderId(woId);
    setCreateError(null);
    try {
      const res = await axios.get(`/work-order/${woId}`);
      const wo = res.data;
      setSelectedWorkOrder(wo);
      setItemPrices((wo.items ?? []).map((i: WorkOrderItem) => ({
        id: i.id,
        unitPrice: Number(i.unitPrice) || 0,
        taxRate: i.taxRate ?? 20,
      })));
      setInvoiceStep(2);
    } catch {
      setCreateError('İş emri yüklenemedi');
    }
  };

  const updateItemPrice = (itemId: string, field: 'unitPrice' | 'taxRate', value: number) => {
    setItemPrices((prev) =>
      prev.map((p) => (p.id === itemId ? { ...p, [field]: value } : p))
    );
  };

  const handleCreateInvoice = async () => {
    if (!selectedWorkOrderId || !selectedWorkOrder) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      for (const p of itemPrices) {
        await axios.patch(`/work-order-item/${p.id}`, {
          unitPrice: p.unitPrice,
          taxRate: p.taxRate,
        });
      }
      const res = await axios.post(`/service-invoice/from-work-order/${selectedWorkOrderId}`);
      const invoice = res.data?.data ?? res.data;
      const id = typeof invoice === 'object' ? invoice?.id : invoice;
      setNewInvoiceOpen(false);
      setInvoiceStep(1);
      setSelectedWorkOrder(null);
      setItemPrices([]);
      fetchInvoices();
      if (id) router.push(`/servis/faturalar/${id}`);
    } catch (err: any) {
      setCreateError(err?.response?.data?.message ?? 'Fatura oluşturulamadı');
    } finally {
      setCreateLoading(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(n));

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

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
        Servis Faturaları
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
        Servis faturalarını görüntüleyin ve yönetin
      </Typography>

      <Paper
        sx={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Fatura no veya iş emri no ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => openNewInvoiceDialog()}
            sx={{ ml: 'auto' }}
          >
            Yeni Fatura
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Fatura No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>İş Emri No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Araç</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Toplam
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  İşlem
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'var(--muted-foreground)' }}>
                    Kayıt bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell>{inv.invoiceNo}</TableCell>
                    <TableCell>
                      {(inv as any).workOrder?.workOrderNo ?? '-'}
                    </TableCell>
                    <TableCell>
                      {(inv as any).workOrder?.customerVehicle
                        ? `${(inv as any).workOrder.customerVehicle.plaka} - ${(inv as any).workOrder.customerVehicle.aracMarka} ${(inv as any).workOrder.customerVehicle.aracModel}`
                        : '-'}
                    </TableCell>
                    <TableCell>{inv.cari?.unvan ?? inv.cari?.cariKodu ?? '-'}</TableCell>
                    <TableCell>{formatDate(inv.issueDate)}</TableCell>
                    <TableCell align="right">{formatCurrency(inv.grandTotal)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/servis/faturalar/${inv.id}`)}
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

      <Dialog open={newInvoiceOpen} onClose={() => { setNewInvoiceOpen(false); setInvoiceStep(1); }} maxWidth={invoiceStep === 2 ? 'md' : 'sm'} fullWidth>
        <DialogTitle>
          {invoiceStep === 1 ? 'Yeni Fatura Oluştur' : 'Kalem Fiyatlarını Girin'}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={invoiceStep - 1} sx={{ mb: 2 }}>
            <Step><StepLabel>İş emri seç</StepLabel></Step>
            <Step><StepLabel>Fiyat girişi</StepLabel></Step>
          </Stepper>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCreateError(null)}>
              {createError}
            </Alert>
          )}
          {invoiceStep === 1 && (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: 'var(--muted-foreground)' }}>
                Faturalanacak iş emrini seçin. Sadece araç hazır durumundaki iş emirleri listelenir.
              </Typography>
              <List sx={{ maxHeight: 320, overflow: 'auto' }}>
                {workOrders.length === 0 ? (
                  <ListItemText primary="Faturalanabilir iş emri bulunamadı" sx={{ py: 2 }} />
                ) : (
                  workOrders.map((wo) => (
                    <ListItemButton
                      key={wo.id}
                      selected={selectedWorkOrderId === wo.id}
                      onClick={() => handleSelectWorkOrder(wo.id)}
                    >
                      <ListItemText
                        primary={`${wo.workOrderNo} - ${wo.customerVehicle?.plaka ?? '-'} ${wo.customerVehicle?.aracMarka ?? ''} ${wo.customerVehicle?.aracModel ?? ''}`}
                        secondary={wo.cari?.unvan ?? wo.cari?.cariKodu ?? '-'}
                      />
                    </ListItemButton>
                  ))
                )}
              </List>
            </>
          )}
          {invoiceStep === 2 && selectedWorkOrder && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedWorkOrder.workOrderNo} · {selectedWorkOrder.customerVehicle?.plaka ?? '-'} · {selectedWorkOrder.cari?.unvan ?? selectedWorkOrder.cari?.cariKodu ?? '-'}
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Stok</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Miktar</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Birim Fiyat</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">KDV %</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Toplam</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedWorkOrder.items ?? []).map((item) => {
                      const priceEdit = itemPrices.find((p) => p.id === item.id);
                      const unitPrice = priceEdit?.unitPrice ?? Number(item.unitPrice) ?? 0;
                      const taxRate = priceEdit?.taxRate ?? item.taxRate ?? 20;
                      const total = item.quantity * unitPrice * (1 + taxRate / 100);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.type === 'LABOR' ? 'İşçilik' : 'Parça'}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.stok ? `${item.stok.stokKodu} - ${item.stok.stokAdi}` : '-'}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={unitPrice}
                              onChange={(e) => updateItemPrice(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              inputProps={{ min: 0, step: 0.01 }}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={taxRate}
                              onChange={(e) => updateItemPrice(item.id, 'taxRate', parseInt(e.target.value, 10) || 20)}
                              inputProps={{ min: 0, max: 100 }}
                              sx={{ width: 70 }}
                            />
                          </TableCell>
                          <TableCell align="right">{formatCurrency(total)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {invoiceStep === 2 ? (
            <>
              <Button startIcon={<ArrowBack />} onClick={() => { setInvoiceStep(1); setSelectedWorkOrder(null); setItemPrices([]); }}>
                Geri
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button onClick={() => { setNewInvoiceOpen(false); setInvoiceStep(1); }}>İptal</Button>
              <Button
                variant="contained"
                onClick={handleCreateInvoice}
                disabled={createLoading || (selectedWorkOrder?.items ?? []).length === 0}
                startIcon={createLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
              >
                {createLoading ? 'Oluşturuluyor...' : 'Fatura Oluştur'}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => { setNewInvoiceOpen(false); setInvoiceStep(1); }}>İptal</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function ServisFaturalariPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      }
    >
      <ServisFaturalariContent />
    </Suspense>
  );
}
