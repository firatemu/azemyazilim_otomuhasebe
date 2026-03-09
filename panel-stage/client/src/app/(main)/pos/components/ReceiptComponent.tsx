'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Divider,
  Button,
  IconButton,
  Grid,
} from '@mui/material';
import { Close, Print } from '@mui/icons-material';

interface ReceiptComponentProps {
  open: boolean;
  onClose: () => void;
  receiptData: {
    invoiceNumber: string;
    date: Date;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;
    subtotal: number;
    vatAmount: number;
    discount: number;
    grandTotal: number;
    paymentMethods: string[];
    cashierName?: string;
  };
}

export default function ReceiptComponent({
  open,
  onClose,
  receiptData,
}: ReceiptComponentProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">FİŞ</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 0 }}>
        <Box sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              OtoMuhasebe ERP
            </Typography>
            <Typography variant="body2">POS SATIŞ FİŞİ</Typography>
          </Box>

          <Divider />

          {/* Invoice Info */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                Fatura No:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {receiptData.invoiceNumber}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                Tarih:
              </Typography>
              <Typography variant="body1">
                {formatDate(receiptData.date)}
              </Typography>
            </Box>
            {receiptData.cashierName && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  Kasiyer:
                </Typography>
                <Typography variant="body1">
                  {receiptData.cashierName}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Items */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Ürünler
            </Typography>
            {receiptData.items.map((item, index) => (
              <Grid
                container
                key={index}
                sx={{
                  borderBottom: '1px dashed #ccc',
                  py: 1,
                }}
              >
                <Grid item xs={6}>
                  <Typography variant="body2" align="left">
                    {item.productName}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body1" align="right">
                    {item.quantity} x
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body1" align="right">
                    ₺{item.unitPrice.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body1" align="right">
                    = ₺{item.amount.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </Box>

          <Divider />

          {/* Totals */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                Ara Toplam:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(receiptData.subtotal)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                İndirim:
              </Typography>
              <Typography variant="body1">
                {formatCurrency(receiptData.discount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                KDV:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(receiptData.vatAmount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                GENEL TOPLAM:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                {formatCurrency(receiptData.grandTotal)}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Payment Methods */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Ödeme Yöntemleri:
            </Typography>
            {receiptData.paymentMethods.map((method, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 0.5,
                }}
              >
                <Typography variant="body2">{method}</Typography>
              </Box>
            ))}
          </Box>

          <Divider />

          {/* Footer */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              * Teslim eden ve ürünler için yasal garanti süresi 6 aydır
            </Typography>
            <Typography variant="caption" color="text.secondary">
              * İade koşulları uygundur
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Print />}
          onClick={onClose}
          size="large"
          fullWidth
        >
          Yazdır
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
          size="large"
        >
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
}
