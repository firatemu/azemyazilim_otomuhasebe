'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import {
  Delete,
  DragIndicator,
  Edit,
} from '@mui/icons-material';
import { QuickMenuItem } from '@/stores/quickMenuStore';
import * as Icons from '@mui/icons-material';

interface QuickMenuItemCardProps {
  item: QuickMenuItem;
  onEdit: (item: QuickMenuItem) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
}

export default function QuickMenuItemCard({
  item,
  onEdit,
  onDelete,
  onToggleEnabled,
}: QuickMenuItemCardProps) {
  const IconComponent = Icons[item.icon as keyof typeof Icons];

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: item.enabled ? 'background.paper' : 'action.disabledBackground',
        opacity: item.enabled ? 1 : 0.6,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 4,
          borderColor: 'primary.main',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: 2,
          color: 'text.secondary',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <DragIndicator />
      </Box>

      <Box
        sx={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          mr: 2,
          ml: 1,
          bgcolor: `${item.color}20`,
          color: item.color,
        }}
      >
        {IconComponent && <IconComponent sx={{ fontSize: 28 }} />}
      </Box>

      <CardContent sx={{ flex: 1, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
            {item.label}
          </Typography>
          <Chip
            label={item.path}
            size="small"
            sx={{
              fontSize: '0.7rem',
              height: 20,
              bgcolor: 'action.hover',
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          İkon: {item.icon} • Renk: {item.color}
        </Typography>
      </CardContent>

      <Box sx={{ pr: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={item.enabled}
              onChange={(e) => onToggleEnabled(item.id, e.target.checked)}
              color="primary"
            />
          }
          label="Aktif"
          sx={{ mr: 1 }}
        />

        <IconButton
          onClick={() => onEdit(item)}
          color="primary"
          size="small"
          title="Düzenle"
        >
          <Edit />
        </IconButton>

        <IconButton
          onClick={() => onDelete(item.id)}
          color="error"
          size="small"
          title="Sil"
        >
          <Delete />
        </IconButton>
      </Box>
    </Card>
  );
}
