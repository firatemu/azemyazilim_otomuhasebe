import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  alpha,
} from '@mui/material';
import { Menu as MenuIcon, Bell, LogOut, User, X, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  mobileOpen?: boolean;
  desktopOpen?: boolean;
}

export default function Header({ onMenuClick, mobileOpen, desktopOpen }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, rgb(216, 121, 67) 0%, rgb(231, 138, 83) 100%)',
        color: 'white',
        boxShadow: 'var(--shadow-sm)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: '64px !important' }}>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{
            mr: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha('#fff', 0.15),
              transform: 'scale(1.05)',
            },
          }}
        >
          {(mobileOpen || desktopOpen) ? <X size={22} /> : <MenuIcon size={22} />}
        </IconButton>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexGrow: 1,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
              A
            </Typography>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              letterSpacing: '0.5px',
            }}
          >
            Admin Panel
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha('#fff', 0.15),
                transform: 'scale(1.1) rotate(15deg)',
              },
            }}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
          <IconButton
            color="inherit"
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha('#fff', 0.15),
                transform: 'scale(1.1)',
              },
            }}
          >
            <Badge
              badgeContent={4}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      opacity: 1,
                    },
                    '50%': {
                      opacity: 0.7,
                    },
                  },
                },
              }}
            >
              <Bell size={20} />
            </Badge>
          </IconButton>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'rgba(255,255,255,0.25)',
                border: '2px solid rgba(255,255,255,0.4)',
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
            >
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid rgba(0,0,0,0.05)',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  gap: 1.5,
                  '&:hover': {
                    bgcolor: alpha('rgb(216, 121, 67)', 0.1),
                  },
                },
              },
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <User size={18} />
              Profil
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: 'error.main',
                '&:hover': {
                  bgcolor: alpha('rgb(239, 68, 68)', 0.1),
                },
              }}
            >
              <LogOut size={18} />
              Çıkış Yap
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
