'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Close,
  Search,
} from '@mui/icons-material';
import * as Icons from '@mui/icons-material';

interface IconPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
}

const commonIcons = [
  'Receipt',
  'People',
  'Inventory',
  'ShoppingCart',
  'PointOfSale',
  'Add',
  'Description',
  'Assignment',
  'Payment',
  'AccountBalance',
  'AccountBalanceWallet',
  'CreditCard',
  'LocalShipping',
  'Warehouse',
  'Assessment',
  'TrendingUp',
  'TrendingDown',
  'CalendarMonth',
  'Settings',
  'Build',
  'Badge',
  'Event',
  'Notifications',
  'Email',
  'AttachMoney',
  'DirectionsCar',
  'SwapHoriz',
];

export default function IconPicker({ open, onClose, onSelect, selectedIcon }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = Object.keys(Icons).filter((iconName) =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    typeof (Icons as any)[iconName] === 'function'
  );

  const handleIconClick = (iconName: string) => {
    onSelect(iconName);
    onClose();
  };

  const IconComponent = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon /> : null;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          İkon Seçin
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="İkon ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Box>

        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {!searchTerm && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                Sık Kullanılanlar
              </Typography>
              <Grid container spacing={1}>
                {commonIcons.map((iconName) => {
                  const isSelected = selectedIcon === iconName;
                  return (
                    <Grid item xs={4} sm={3} md={2} key={iconName}>
                      <Box
                        onClick={() => handleIconClick(iconName)}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          p: 2,
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: '1px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected ? 'primary.main' : 'background.paper',
                          color: isSelected ? 'primary.contrastText' : 'text.primary',
                          '&:hover': {
                            bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        <Box sx={{ fontSize: 28 }}>
                          {IconComponent(iconName)}
                        </Box>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', textAlign: 'center' }}>
                          {iconName}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {searchTerm && (
            <Grid container spacing={1}>
              {filteredIcons.slice(0, 50).map((iconName) => {
                const isSelected = selectedIcon === iconName;
                return (
                  <Grid item xs={4} sm={3} md={2} key={iconName}>
                    <Box
                      onClick={() => handleIconClick(iconName)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.main' : 'background.paper',
                        color: isSelected ? 'primary.contrastText' : 'text.primary',
                        '&:hover': {
                          bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <Box sx={{ fontSize: 28 }}>
                        {IconComponent(iconName)}
                      </Box>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', textAlign: 'center' }}>
                        {iconName}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {searchTerm && filteredIcons.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                "{searchTerm}" için ikon bulunamadı
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
      </DialogActions>
    </Dialog>
  );
}
