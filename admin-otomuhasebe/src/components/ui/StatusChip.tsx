import React from 'react';
import { Chip, SxProps, Theme } from '@mui/material';

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

const statusColors: Record<string, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; label: string }> = {
  ACTIVE: { color: 'success', label: 'Aktif' },
  TRIALING: { color: 'info', label: 'Deneme' },
  TRIAL: { color: 'info', label: 'Deneme' },
  PAST_DUE: { color: 'warning', label: 'Vadesi Geçti' },
  CANCELLED: { color: 'error', label: 'İptal' },
  CANCELED: { color: 'error', label: 'İptal' },
  EXPIRED: { color: 'error', label: 'Süresi Dolmuş' },
  PAUSED: { color: 'default', label: 'Duraklatıldı' },
  SUCCESS: { color: 'success', label: 'Başarılı' },
  PENDING: { color: 'warning', label: 'Beklemede' },
  FAILED: { color: 'error', label: 'Başarısız' },
  REFUNDED: { color: 'info', label: 'İade Edildi' },
  SUSPENDED: { color: 'error', label: 'Süspanse' },
};

export default function StatusChip({ status, size = 'small', sx }: StatusChipProps) {
  const statusConfig = statusColors[status] || { color: 'default' as const, label: status };
  
  return (
    <Chip
      label={statusConfig.label}
      color={statusConfig.color}
      size={size}
      sx={{ fontWeight: 500, ...sx }}
    />
  );
}
