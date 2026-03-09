'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Select,
  MenuItem,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Close, Check } from '@mui/icons-material';
import { usePosStore } from '@/stores/posStore';

export default function PaymentDialog() {
  const {
    paymentDialogOpen,
    setPaymentDialogOpen,
    cartTotal,
    payments,
    remainingAmount,
    addPayment,
    removePayment,
    clearPayments,
  } = usePosStore();

  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [cashboxId, setCashboxId] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [giftCardId, setGiftCardId] = useState('');

  const handleAddPayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    const paymentAmount = parseFloat(amount);
    const payment = {
      paymentMethod,
      amount: paymentAmount,
      ...(cashboxId && { cashboxId }),
      ...(bankAccountId && { bankAccountId }),
      ...(giftCardId && { giftCardId }),
    };

    addPayment(payment);

    // Reset form
    setPaymentMethod('');
    setAmount('');
    setCashboxId('');
    setBankAccountId('');
    setGiftCardId('');

    // Close dialog if remaining amount is 0
    if (cartTotal - (payments.reduce((sum, p) => sum + paymentAmount, 0)) === 0) {
      setPaymentDialogOpen(false);
    }
  };

  const handleClose = () => {
    setPaymentDialogOpen(false);
    setPaymentMethod('');
    setAmount('');
    setCashboxId('');
    setBankAccountId('');
    setGiftCardId('');
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const suggestedAmount = remainingAmount;

  return (
    <Dialog open={paymentDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Ödeme Ekle
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Kalan Tutar: ₺{(cartTotal - totalPaid).toFixed(2)}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Payment Method */}
          <Grid item xs={12}>
            <Select
              fullWidth
              size="large"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as string)}
              displayEmpty
            >
              <MenuItem value="NAKIT">Nakit</MenuItem>
              <MenuItem value="KREDI_KARTI">Kredi Kartı</MenuItem>
              <MenuItem value="BANKA_HAVALESI">Banka Havaleyi</MenuItem>
              <MenuItem value="CEK">Çek</MenuItem>
              <MenuItem value="SENET">Senet</MenuItem>
              <MenuItem value="HEDIYE_KARTI">Hediye Kartı</MenuItem>
              <MenuItem value="KREDI_HESABI">Kredi Hesabı</MenuItem>
            </Select>
          </Grid>

          {/* Amount */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="large"
              type="number"
              label="Tutar"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
            />
          </Grid>

          {/* Conditional fields based on payment method */}
          {paymentMethod === 'NAKIT' && (
            <Grid item xs={12}>
              <Select
                fullWidth
                size="large"
                value={cashboxId}
                onChange={(e) => setCashboxId(e.target.value as string)}
                displayEmpty
              >
                <MenuItem value="">Kasa Seçin</MenuItem>
                {/* Will load kasas dynamically */}
              </Select>
            </Grid>
          )}

          {paymentMethod === 'BANKA_HAVALESI' && (
            <Grid item xs={12}>
              <Select
                fullWidth
                size="large"
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value as string)}
                displayEmpty
              >
                <MenuItem value="">Banka Hesabı Seçin</MenuItem>
                {/* Will load bank accounts dynamically */}
              </Select>
            </Grid>
          )}

          {paymentMethod === 'HEDIYE_KARTI' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="large"
                label="Hediye Kart ID"
                value={giftCardId}
                onChange={(e) => setGiftCardId(e.target.value)}
              />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Payment History */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Ödeme Geçmişi:
          </Typography>
          {payments.map((payment, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Box>
                <Typography variant="caption">{payment.paymentMethod}</Typography>
                <Typography variant="body1">₺{payment.amount.toFixed(2)}</Typography>
              </Box>
              <IconButton size="small" onClick={() => removePayment(index)}>
                <Close />
              </IconButton>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} size="large">
          İptal
        </Button>
        <Button
          onClick={handleAddPayment}
          variant="contained"
          size="large"
          disabled={!amount || parseFloat(amount) <= 0}
          color="primary"
        >
          Ekle
        </Button>
        <Button
          onClick={() => {
            setPaymentDialogOpen(false);
            clearPayments();
          }}
          variant="outlined"
          size="large"
          color="error"
        >
          Temizle
        </Button>
      </DialogActions>
    </Dialog>
  );
}
