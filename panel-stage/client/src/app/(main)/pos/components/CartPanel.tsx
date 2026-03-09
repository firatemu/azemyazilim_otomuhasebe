'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  IconButton,
} from '@mui/material';
import { Delete, ShoppingCart, Payment } from '@mui/icons-material';
import { usePosStore } from '@/stores/posStore';
import PaymentDialog from './PaymentDialog';
import ReceiptComponent from './ReceiptComponent';

export default function CartPanel() {
  const {
    carts,
    activeCartId,
    cartTotal,
    selectedCustomer,
    payments,
    remainingAmount,
    setPaymentDialogOpen,
    removeFromCart,
    completeCheckout,
    receiptDialogOpen,
    setReceiptDialogOpen,
  } = usePosStore();
  const [receiptData, setReceiptData] = useState<{
    invoiceNumber: string;
    date: Date;
    items: Array<{ productName: string; quantity: number; unitPrice: number; amount: number }>;
    subtotal: number;
    vatAmount: number;
    discount: number;
    grandTotal: number;
    paymentMethods: string[];
    cashierName?: string;
  } | null>(null);

  const activeCart = activeCartId ? carts[activeCartId] || [] : [];
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const isCheckoutDisabled = totalPaid !== cartTotal;

  const handleOpenPaymentDialog = () => {
    setPaymentDialogOpen(true);
  };

  const handleCompleteCheckout = async () => {
    const data = {
      invoiceNumber: 'POS-' + Date.now(),
      date: new Date(),
      items: activeCart.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        amount: i.quantity * i.unitPrice,
      })),
      subtotal: cartTotal,
      vatAmount: 0,
      discount: 0,
      grandTotal: cartTotal,
      paymentMethods: payments.map((p) => p.paymentMethod + ': ₺' + p.amount.toFixed(2)),
    };
    setReceiptData(data);
    await completeCheckout();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  return (
    <>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Customer Info */}
        {selectedCustomer ? (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {selectedCustomer.title}
            </Typography>
            <Typography variant="body2">
              {selectedCustomer.code}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1, textAlign: 'center' }}>
            <Typography variant="body2">
              Müşteri seçin
            </Typography>
          </Box>
        )}

        {/* Cart Items */}
        <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
          {activeCart.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCart sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Sepet boş
              </Typography>
            </Box>
          ) : (
            <List>
              {activeCart.map((item) => (
                <ListItem key={item.productId + (item.variantId || '')}>
                  <ListItemText
                    primary={item.productName}
                    secondary={`${item.quantity} x ₺${item.unitPrice.toFixed(2)}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="large"
                      onClick={() => activeCartId && removeFromCart(activeCartId, item.productId)}
                      aria-label="Sepetten çıkar"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                  <Divider />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Totals */}
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">
              Ara Toplam:
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatCurrency(cartTotal)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">
              Ödenen:
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {formatCurrency(totalPaid)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1">
              Kalan:
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={remainingAmount > 0 ? 'error.main' : 'success.main'}>
              {formatCurrency(remainingAmount)}
            </Typography>
          </Box>

          {/* Payment Methods */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Ödeme Yöntemleri:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {payments.length === 0 ? (
                <Typography variant="body2" color="text.disabled">
                  Ödeme eklenmedi
                </Typography>
              ) : (
                payments.map((payment, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      bgcolor: 'info.light',
                      borderRadius: 1,
                      flex: '0 0 auto',
                      minWidth: '80px',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '11px' }}>
                      {payment.paymentMethod}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(payment.amount)}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="info"
              startIcon={<Payment />}
              onClick={handleOpenPaymentDialog}
            >
              Ödeme Ekle
            </Button>
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              disabled={isCheckoutDisabled}
              onClick={handleCompleteCheckout}
            >
              İşlemi Tamamla
            </Button>
          </Box>
          </Box>
        </CardContent>
      </Card>

      <PaymentDialog />
      {receiptData && (
        <ReceiptComponent
          open={receiptDialogOpen}
          onClose={() => {
            setReceiptDialogOpen(false);
            setReceiptData(null);
          }}
          receiptData={receiptData}
        />
      )}
    </>
  );
}
