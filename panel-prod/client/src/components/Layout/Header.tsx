'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import {
  Logout,
  Person,
  CalendarMonth,
  Menu as MenuIcon,
  PushPin,
  PushPinOutlined,
  Settings,
  Notifications,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useRouter } from 'next/navigation';
import { SIDEBAR_WIDTH } from './Sidebar';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleSidebarPin: () => void;
  sidebarPinned: boolean;
}

export default function Header({ onToggleSidebar, onToggleSidebarPin, sidebarPinned }: HeaderProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const { user, clearAuth } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const router = useRouter();

  // Sistem tarih/saat güncelleme
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentDateTime(formatted);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
    handleClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${sidebarPinned ? SIDEBAR_WIDTH : 0}px)`,
        ml: sidebarPinned ? `${SIDEBAR_WIDTH}px` : 0,
        bgcolor: 'var(--card)',
        color: 'var(--foreground)',
        boxShadow: 'var(--shadow-sm)',
        borderBottom: '1px solid var(--border)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: (theme) => (sidebarPinned ? theme.zIndex.drawer + 1 : theme.zIndex.appBar),
      }}
    >
      <Toolbar sx={{ px: 3, py: 1.5, minHeight: '64px !important' }}>
        {/* Left Section - Menu Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            edge="start"
            aria-label="open drawer"
            onClick={onToggleSidebar}
            sx={{
              color: 'var(--muted-foreground)',
              '&:hover': {
                bgcolor: 'var(--muted)',
                color: 'var(--foreground)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            aria-label={sidebarPinned ? 'Menüyü sabitlemeyi kaldır' : 'Menüyü sabitle'}
            onClick={onToggleSidebarPin}
            sx={{
              color: sidebarPinned ? 'var(--primary)' : 'var(--muted-foreground)',
              bgcolor: sidebarPinned ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
              '&:hover': {
                bgcolor: 'var(--muted)',
                color: sidebarPinned ? 'var(--primary)' : 'var(--foreground)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {sidebarPinned ? <PushPin sx={{ fontSize: 18 }} /> : <PushPinOutlined sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>

        {/* Center Section - Page Title (will be populated by TabBar) */}
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            ml: 2,
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--foreground)',
            letterSpacing: '-0.01em',
          }}
        >
          {/* Tab başlığı buraya gelecek */}
        </Typography>

        {/* Right Section - Actions & User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Dark Mode Toggle */}
          <IconButton
            onClick={toggleDarkMode}
            size="small"
            sx={{
              color: 'var(--muted-foreground)',
              bgcolor: 'var(--muted)',
              border: '1px solid var(--border)',
              '&:hover': {
                bgcolor: 'var(--accent)',
                color: 'var(--foreground)',
                borderColor: 'var(--primary)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
            title={isDarkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}
          >
            {isDarkMode ? (
              <LightMode sx={{ fontSize: 20, color: 'var(--chart-3)' }} />
            ) : (
              <DarkMode sx={{ fontSize: 20, color: 'var(--primary)' }} />
            )}
          </IconButton>

          {/* Date/Time Chip */}
          <Chip
            icon={<CalendarMonth sx={{ fontSize: 16 }} />}
            label={currentDateTime}
            variant="outlined"
            size="small"
            sx={{
              fontWeight: 500,
              fontSize: '0.8125rem',
              borderColor: 'var(--border)',
              color: 'var(--muted-foreground)',
              bgcolor: 'var(--muted)',
              '& .MuiChip-icon': {
                color: 'var(--muted-foreground)',
              },
              '&:hover': {
                borderColor: 'var(--secondary)',
                color: 'var(--secondary)',
                bgcolor: 'var(--secondary-light)',
              },
              transition: 'all 0.2s ease',
            }}
          />

          {/* Notifications Button */}
          <IconButton
            size="small"
            sx={{
              color: 'var(--muted-foreground)',
              '&:hover': {
                bgcolor: 'var(--muted)',
                color: 'var(--foreground)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Notifications sx={{ fontSize: 20 }} />
          </IconButton>

          {/* User Info */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              px: 1.5,
              py: 0.75,
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'var(--muted)',
              },
            }}
            onClick={handleMenu}
          >
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--foreground)',
                  lineHeight: 1.2,
                }}
              >
                {user?.fullName || 'Kullanıcı'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.75rem',
                  color: 'var(--muted-foreground)',
                  display: 'block',
                }}
              >
                {user?.role || 'Rol'}
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
                fontWeight: 700,
                fontSize: '0.875rem',
                border: '2px solid var(--border)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'var(--secondary)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </Box>

          {/* User Menu */}
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                bgcolor: 'var(--card)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--foreground)' }}>
                {user?.fullName || 'Kullanıcı'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>
                {user?.email || user?.role || 'Bilgi yok'}
              </Typography>
            </Box>
            <Divider sx={{ borderColor: 'var(--border)' }} />
            <MenuItem 
              onClick={handleClose}
              sx={{
                py: 1.25,
                px: 2,
                '&:hover': {
                  bgcolor: 'var(--muted)',
                },
              }}
            >
              <Person sx={{ mr: 1.5, fontSize: 18, color: 'var(--muted-foreground)' }} />
              <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>Profil</Typography>
            </MenuItem>
            <MenuItem 
              onClick={handleClose}
              sx={{
                py: 1.25,
                px: 2,
                '&:hover': {
                  bgcolor: 'var(--muted)',
                },
              }}
            >
              <Settings sx={{ mr: 1.5, fontSize: 18, color: 'var(--muted-foreground)' }} />
              <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>Ayarlar</Typography>
            </MenuItem>
            <Divider sx={{ borderColor: 'var(--border)' }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{
                py: 1.25,
                px: 2,
                color: 'var(--destructive)',
                '&:hover': {
                  bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                },
              }}
            >
              <Logout sx={{ mr: 1.5, fontSize: 18 }} />
              <Typography variant="body2" fontWeight={500}>Çıkış Yap</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
