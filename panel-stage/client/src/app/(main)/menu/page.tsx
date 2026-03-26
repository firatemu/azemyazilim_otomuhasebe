'use client';

import React from 'react';
import { Box } from '@mui/material';
import { MenuGrid } from '@/components/MenuSlider';
import { menuItems } from '@/config/menuItems';

export default function MenuPage() {
  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden' }}>
      <MenuGrid
        menuItems={menuItems}
        showBackground={true}
      />
    </Box>
  );
}
