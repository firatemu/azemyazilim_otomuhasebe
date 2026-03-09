'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import MainLayout from '@/components/Layout/MainLayout';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import { usePosStore } from '@/stores/posStore';

export default function PosPage() {
  const { setActiveCart, addToCart } = usePosStore();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info',
  });
  const bufferRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActiveCart('default');
  }, [setActiveCart]);

  const processBarcode = useCallback(async (barcode: string) => {
    if (!barcode.trim()) return;
    try {
      const res = await fetch('/api/pos/products/barcode/' + encodeURIComponent(barcode), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        setSnackbar({ open: true, message: 'Ürün araması başarısız', severity: 'error' });
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setSnackbar({ open: true, message: 'Ürün bulunamadı', severity: 'error' });
        return;
      }
      const product = data[0];
      if (product.productVariants?.length) {
        setSnackbar({ open: true, message: 'Varyantlı ürün - lütfen seçiniz', severity: 'info' });
        return;
      }
      addToCart({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: Number(product.salePrice) || 0,
        vatRate: product.vatRate ?? 20,
        discountRate: 0,
      });
      setSnackbar({ open: true, message: product.name + ' sepete eklendi', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Barkod işleme hatası', severity: 'error' });
    }
  }, [addToCart]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)) {
        return;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (e.key === 'Enter') {
        if (bufferRef.current.length > 0) {
          e.preventDefault();
          const b = bufferRef.current;
          bufferRef.current = '';
          processBarcode(b);
        }
        return;
      }
      if (e.key === 'Escape') {
        bufferRef.current = '';
        return;
      }
      if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        bufferRef.current += e.key;
        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current.length > 0) {
            const b = bufferRef.current;
            bufferRef.current = '';
            processBarcode(b);
          }
          timeoutRef.current = null;
        }, 500);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [processBarcode]);

  return (
    <MainLayout>
      <Box sx={{ height: '100vh', display: 'flex' }}>
        <Box sx={{ flex: '0 0 65%', display: 'flex', flexDirection: 'column', p: 2 }}>
          <Typography variant="h5" gutterBottom>Ürün Katalog</Typography>
          <ProductGrid />
        </Box>
        <Box sx={{ flex: '0 0 35%', borderLeft: 1, borderColor: 'divider' }}>
          <CartPanel />
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </MainLayout>
  );
}
