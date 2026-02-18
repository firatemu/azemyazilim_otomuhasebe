'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import MainLayout from '@/components/Layout/MainLayout';

export default function Page() {
  const moduleName = '${module}';
  const displayName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  
  return (
    <MainLayout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {displayName} Modülü
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          {displayName} modülü içeriği buraya gelecek...
        </Typography>
      </Paper>
    </MainLayout>
  );
}
