import React, { useState, useMemo } from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Stack,
  Grid,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search,
} from '@mui/icons-material';
import { SubMenuDialogProps } from './types';
import { getIconComponent } from './utils';

export default function SubMenuDialog({
  open,
  onClose,
  parentItem,
  onSubItemClick,
}: SubMenuDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubItems = useMemo(() => {
    if (!parentItem.subItems) return [];
    if (!searchTerm) return parentItem.subItems;
    const searchLower = searchTerm.toLowerCase();
    return parentItem.subItems.filter((subItem) =>
      subItem.label.toLowerCase().includes(searchLower)
    );
  }, [parentItem.subItems, searchTerm]);

  const ParentIcon = getIconComponent(parentItem.icon);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #F5F7FA 0%, #E8EEF5 100%)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '20px',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 4, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              background: parentItem.color || '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <ParentIcon sx={{ fontSize: 32, color: '#FFFFFF' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B' }}>
              {parentItem.label}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {parentItem.section}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#64748B' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Search and Content */}
      <Box sx={{ p: 4, pt: 2 }}>
        <TextField
          id={`submenu-search-${parentItem.id}`}
          fullWidth
          placeholder="Alt menü ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#94A3B8', fontSize: 22 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.7)',
              color: '#1E293B',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
              },
              '&.Mui-focused': {
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #BBDEFB',
                '& fieldset': { borderColor: 'transparent' },
              },
            },
            '& .MuiOutlinedInput-input': {
              '&::placeholder': {
                color: '#94A3B8',
                opacity: 1,
              },
            },
          }}
        />

        <Grid container spacing={2}>
          {filteredSubItems.map((subItem) => {
            const SubIcon = getIconComponent(subItem.icon);
            return (
              <Grid size={{ xs: 12, sm: 6 }} key={subItem.id}>
                <Box
                  onClick={() => onSubItemClick(subItem)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      transform: 'translateY(-2px)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      background: subItem.color || parentItem.color || '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <SubIcon sx={{ fontSize: 22, color: '#FFFFFF' }} />
                  </Box>
                  <Typography sx={{ color: '#1E293B', fontWeight: 600 }}>
                    {subItem.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {searchTerm && filteredSubItems.length === 0 && (
          <Typography sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', py: 4 }}>
            Sonuç bulunamadı
          </Typography>
        )}
      </Box>
    </Dialog>
  );
}
