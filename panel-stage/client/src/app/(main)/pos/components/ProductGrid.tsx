'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  TextField,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { usePosStore } from '@/stores/posStore';

export default function ProductGrid() {
  const { addToCart, setVariantDialogOpen, setSelectedProductForVariant } = usePosStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleProductClick = (product: any) => {
    if (product.hasVariants) {
      setSelectedProductForVariant(product);
      setVariantDialogOpen(true);
    } else {
      addToCart({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: parseFloat(product.salePrice),
        vatRate: product.vatRate || 20,
        discountRate: 0,
      });
    }
  };

  return (
    <Box>
      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onChange={(e, newValue) => setSelectedCategory(newValue as string)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Tümü" value="all" />
        <Tab label="Elektronik" value="elektronik" />
        <Tab label="Otomotiv" value="otomotiv" />
        <Tab label="Yedek Parça" value="yedek_parca" />
        <Tab label="Aksesuar" value="aksesuar" />
      </Tabs>

      {/* Search Bar */}
      <Box sx={{ my: 2 }}>
        <TextField
          fullWidth
          placeholder="Ürün ara veya barkod gir..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="large"
          sx={{
            '& .MuiInputBase-input': {
              fontSize: '16px',
            },
          }}
        />
      </Box>

      {/* Product Grid */}
      <Grid container spacing={2}>
        {/* Sample product cards - replace with API data */}
        {[
          { id: '1', name: 'Otomotiv Yağı', salePrice: '150.00', vatRate: 20, hasVariants: false, category: 'otomotiv' },
          { id: '2', name: 'Motor Yağı', salePrice: '250.00', vatRate: 20, hasVariants: false, category: 'otomotiv' },
          { id: '3', name: 'Fren Balatası', salePrice: '450.00', vatRate: 20, hasVariants: false, category: 'otomotiv' },
          { id: '4', name: 'Akü Seti', salePrice: '180.00', vatRate: 20, hasVariants: true, category: 'elektronik' },
          { id: '5', name: 'Bluetooth Hoparlör', salePrice: '320.00', vatRate: 20, hasVariants: false, category: 'elektronik' },
          { id: '6', name: 'Radyo Teyp', salePrice: '220.00', vatRate: 20, hasVariants: true, category: 'elektronik' },
        ].map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card
              sx={{
                minHeight: '120px',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3,
                },
              }}
              onClick={() => handleProductClick(product)}
            >
              <CardActionArea sx={{ minHeight: '120px' }}>
                <CardContent sx={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h6" align="center" sx={{ mb: 1 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body1" align="center" color="primary" sx={{ fontWeight: 'bold' }}>
                    ₺{parseFloat(product.salePrice).toFixed(2)}
                  </Typography>
                  {product.hasVariants && (
                    <Chip
                      label="Varyantlı"
                      size="small"
                      color="secondary"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
