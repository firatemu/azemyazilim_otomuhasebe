import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { MenuCardProps } from './types';
import { getIconComponent } from './utils';

export default function MenuCard({ item, onClick }: MenuCardProps) {
  const IconComponent = getIconComponent(item.icon);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          '& .icon-box': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          }
        },
      }}
    >
      {/* Icon Box */}
      <Box
        className="icon-box"
        sx={{
          width: { xs: 64, md: 72 },
          height: { xs: 64, md: 72 },
          borderRadius: '12px',
          background: item.color || '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <IconComponent sx={{ fontSize: { xs: 32, md: 36 }, color: '#FFFFFF' }} />
      </Box>

      {/* Label */}
      <Typography
        sx={{
          color: '#475569',
          fontSize: { xs: '0.85rem', md: '0.95rem' },
          fontWeight: 600,
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: '120px',
        }}
      >
        {item.label}
      </Typography>

      {/* Submenu Indicator */}
      {item.subItems && item.subItems.length > 0 && (
        <KeyboardArrowDown
          sx={{
            color: '#94A3B8',
            fontSize: 20,
            mt: 0.5
          }}
        />
      )}
    </Box>
  );
}
