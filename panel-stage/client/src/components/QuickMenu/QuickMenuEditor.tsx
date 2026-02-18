'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
} from '@mui/material';
import { Colorize } from '@mui/icons-material';
import { QuickMenuItem } from '@/stores/quickMenuStore';
import IconPicker from './IconPicker';

const colorOptions = [
  '#8b5cf6', // Violet
  '#527575', // Secondary
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#d946ef', // Fuchsia
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

interface QuickMenuEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Omit<QuickMenuItem, 'id' | 'order'>) => void;
  editItem?: QuickMenuItem | null;
  availablePaths: Array<{ id: string; label: string; path: string }>;
}

export default function QuickMenuEditor({
  open,
  onClose,
  onSave,
  editItem,
  availablePaths,
}: QuickMenuEditorProps) {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('Add');
  const [path, setPath] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [errors, setErrors] = useState<{ label?: boolean; path?: boolean }>({});

  useEffect(() => {
    if (editItem) {
      setLabel(editItem.label);
      setIcon(editItem.icon);
      setPath(editItem.path);
      setColor(editItem.color);
      setErrors({});
    } else {
      setLabel('');
      setIcon('Add');
      setPath('');
      setColor('#8b5cf6');
      setErrors({});
    }
  }, [editItem, open]);

  const handleSave = () => {
    const newErrors: { label?: boolean; path?: boolean } = {};

    if (!label.trim()) {
      newErrors.label = true;
    }

    if (!path.trim()) {
      newErrors.path = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      label: label.trim(),
      icon,
      path: path.trim(),
      color,
      enabled: editItem?.enabled ?? true,
    });

    handleClose();
  };

  const handleClose = () => {
    setLabel('');
    setIcon('Add');
    setPath('');
    setColor('#8b5cf6');
    setErrors({});
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            {editItem ? 'Hızlı Menü Öğesini Düzenle' : 'Yeni Hızlı Menü Öğesi'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Label */}
            <TextField
              label="Menü Başlığı"
              fullWidth
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              error={errors.label}
              helperText={errors.label ? 'Bu alan gereklidir' : ''}
              placeholder="Örn: Yeni Fatura"
              autoFocus
            />

            {/* Path Selector */}
            <FormControl fullWidth error={errors.path}>
              <InputLabel>Hedef Sayfa</InputLabel>
              <Select
                value={path}
                onChange={(e) => setPath(e.target.value)}
                label="Hedef Sayfa"
              >
                {availablePaths.map((p) => (
                  <MenuItem key={p.id} value={p.path}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.path && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  Bu alan gereklidir
                </Typography>
              )}
            </FormControl>

            {/* Icon Picker */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                İkon
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => setIconPickerOpen(true)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: `${color}20`,
                      color: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {React.createElement(
                      require('@mui/icons-material')[icon] ||
                        require('@mui/icons-material').Add
                    )}
                  </Box>
                  <Typography variant="body2">{icon}</Typography>
                </Box>
                <Button size="small" variant="outlined">
                  Değiştir
                </Button>
              </Paper>
            </Box>

            {/* Color Picker */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Renk
              </Typography>
              <Grid container spacing={1}>
                {colorOptions.map((c) => (
                  <Grid item key={c}>
                    <Box
                      onClick={() => setColor(c)}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: c,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: color === c ? 'text.primary' : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  </Grid>
                ))}
                <Grid item>
                  <Box
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'color';
                      input.value = color;
                      input.onchange = (e: any) => setColor(e.target.value);
                      input.click();
                    }}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: color,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Colorize sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Preview */}
            {label && path && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Önizleme
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: `${color}20`,
                      color: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {React.createElement(
                      require('@mui/icons-material')[icon] ||
                        require('@mui/icons-material').Add
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {path}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleClose}>İptal</Button>
          <Button variant="contained" onClick={handleSave}>
            {editItem ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      <IconPicker
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={setIcon}
        selectedIcon={icon}
      />
    </>
  );
}
