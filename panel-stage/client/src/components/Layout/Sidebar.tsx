'use client';

import { useAuthStore } from '@/stores/authStore';
import { useTabStore } from '@/stores/tabStore';
import { useQuickMenuStore } from '@/stores/quickMenuStore';
import axios from '@/lib/axios';
import {
  AccountBalance,
  AccountBalanceWallet,
  Add,
  Assessment,
  Assignment,
  AttachMoney,
  Badge,
  Build,
  CalendarMonth,
  Campaign,
  Category,
  CheckCircle,
  Close,
  CloudUpload,
  CloudDownload,
  CreditCard,
  Dashboard,
  Delete,
  Description,
  DirectionsCar,
  Engineering,
  FlashOn,
  ExpandLess,
  ExpandMore,
  Inventory,
  LocalOffer,
  LocalShipping,
  Logout,
  Menu as MenuIcon,
  MoreVert,
  Notifications,
  Payment,
  People,
  PointOfSale,
  PushPin,
  Receipt,
  ReceiptLong,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Sync,
  SwapHoriz,
  TrendingDown,
  TrendingUp,
  Tv,
  Warehouse,
  Warning,
  AdminPanelSettings,
  Event,
  Help,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  Avatar,
  Skeleton,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { clearServerAuthCookies } from '@/lib/clearServerAuthCookies';
import React, { useEffect, useMemo, useState } from 'react';

export const SIDEBAR_WIDTH = 280;

// Color utility functions
const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);

  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const generateGradient = (color: string): string => {
  const darkerColor = adjustColor(color, -20);
  return `linear-gradient(135deg, ${color} 0%, ${darkerColor} 100%)`;
};

const palette = {
  secondaryHex: 'var(--secondary)',
  gradient: 'var(--card)',
  headerGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 65%, var(--secondary) 35%) 0%, color-mix(in srgb, var(--primary) 45%, var(--background) 55%) 100%)',
  textPrimary: 'var(--foreground)',
  textSecondary: 'var(--muted-foreground)',
  iconBg: 'var(--muted)',
  iconBgActive: 'color-mix(in srgb, var(--secondary) 18%, var(--card) 82%)',
  itemHover: 'var(--accent)',
  itemBorder: 'var(--border)',
  itemSelectedBorder: 'var(--primary)',
  itemSelectedBg: 'color-mix(in srgb, var(--primary) 35%, var(--secondary) 25%, var(--card) 40%)',
  submenuBg: 'var(--muted)',
  submenuBorder: 'var(--border)',
  searchBg: 'var(--muted)',
  searchBorder: 'var(--border)',
};

// İkon Haritası - Wildcard import yerine güvenli ve performanslı eşleme
const IconMap: Record<string, any> = {
  AccountBalance,
  AccountBalanceWallet,
  Add,
  Assessment,
  Assignment,
  AttachMoney,
  Badge,
  Build,
  CalendarMonth,
  Campaign,
  Category,
  CheckCircle,
  Close,
  CloudUpload,
  CloudDownload,
  CreditCard,
  Dashboard,
  Delete,
  Description,
  DirectionsCar,
  Engineering,
  FlashOn,
  ExpandLess,
  ExpandMore,
  Inventory,
  LocalOffer,
  LocalShipping,
  Logout,
  Menu: MenuIcon,
  MoreVert,
  Notifications,
  Payment,
  People,
  PointOfSale,
  PushPin,
  Receipt,
  ReceiptLong,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Sync,
  SwapHoriz,
  TrendingDown,
  TrendingUp,
  Tv,
  Warehouse,
  Warning,
  AdminPanelSettings,
  Event,
  Help,
};

interface SidebarProps {
  open: boolean;
  pinned: boolean;
  onClose: () => void;
  onTogglePin: () => void;
  menuItems: any[];
}

export default function Sidebar({ open, pinned, onClose, onTogglePin, menuItems }: SidebarProps) {
  const { addTab, setActiveTab, activeTab } = useTabStore();
  const { user: authUser, clearAuth } = useAuthStore();
  const { items: quickMenuItems, fetchQuickMenuItems } = useQuickMenuStore();

  useEffect(() => {
    fetchQuickMenuItems();
  }, [fetchQuickMenuItems]);
  const router = useRouter();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [quickMenuAnchor, setQuickMenuAnchor] = useState<null | HTMLElement>(null);
  const [tenantSettings, setTenantSettings] = useState<any>(null);
  const [tenantLoading, setTenantLoading] = useState(true);

  // 3D Tilt state for header
  const [headerRotate, setHeaderRotate] = useState({ x: 0, y: 0 });
  const [headerMouse, setHeaderMouse] = useState({ x: 0, y: 0 });

  // 3D Tilt state for menu items
  const [itemTilts, setItemTilts] = useState<Record<string, { x: number; y: number }>>({});
  const [itemMousePositions, setItemMousePositions] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    const fetchTenantSettings = async () => {
      try {
        setTenantLoading(true);
        const res = await axios.get('/tenants/settings');
        setTenantSettings(res.data);
      } catch (error) {
        console.error('Sidebar tenant settings error:', error);
      } finally {
        setTenantLoading(false);
      }
    };
    fetchTenantSettings();
  }, []);

  const handleMenuClick = (item: any) => {
    if (item.subItems) {
      setOpenSubMenu((current) => (current === item.id ? null : item.id));
      return;
    }

    // Don't create tab for /menu page
    if (item.path === '/menu') {
      router.push(item.path);
      if (!pinned) {
        onClose();
      }
      return;
    }

    addTab({
      id: item.id,
      label: item.label,
      path: item.path,
    });
    setActiveTab(item.id);
    router.push(item.path);
    if (!pinned) {
      onClose();
    }
  };

  const handleSubMenuClick = (_parentItem: any, subItem: any) => {
    addTab({
      id: subItem.id,
      label: subItem.label,
      path: subItem.path,
    });
    setActiveTab(subItem.id);
    router.push(subItem.path);
    if (!pinned) {
      onClose();
    }
  };

  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) {
      return menuItems;
    }

    const searchLower = searchTerm.toLowerCase();
    return menuItems.filter((item) => {
      if (item.label.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (item.subItems) {
        return item.subItems.some((subItem: any) => subItem.label.toLowerCase().includes(searchLower));
      }

      return false;
    });
  }, [searchTerm, menuItems]);

  useEffect(() => {
    if (!searchTerm) {
      return;
    }

    filteredMenuItems.forEach((item) => {
      if (item.subItems) {
        const hasMatchingSubItem = item.subItems.some((subItem: any) =>
          subItem.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (hasMatchingSubItem) {
          setOpenSubMenu(item.id);
        }
      }
    });
  }, [searchTerm, filteredMenuItems]);

  useEffect(() => {
    if (!open) {
      setOpenSubMenu(null);
      setSearchTerm('');
    }
  }, [open]);

  const handleQuickCreate = (path: string) => {
    setQuickMenuAnchor(null);
    router.push(path);
    if (!pinned) {
      onClose();
    }
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    await clearServerAuthCookies();
    clearAuth();
    router.push('/login');
    handleUserMenuClose();
  };

  // Header 3D tilt handlers
  const handleHeaderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 30;
    const rotateY = (centerX - x) / 30;
    setHeaderRotate({ x: rotateX, y: rotateY });
    setHeaderMouse({ x, y });
  };

  const handleHeaderMouseLeave = () => {
    setHeaderRotate({ x: 0, y: 0 });
  };

  // Menu item 3D tilt handlers
  const handleMenuItemMouseMove = (e: React.MouseEvent<HTMLDivElement>, itemId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;

    setItemTilts((prev) => ({
      ...prev,
      [itemId]: { x: rotateX, y: rotateY },
    }));

    setItemMousePositions((prev) => ({
      ...prev,
      [itemId]: { x, y },
    }));
  };

  const handleMenuItemMouseLeave = (itemId: string) => {
    setItemTilts((prev) => ({
      ...prev,
      [itemId]: { x: 0, y: 0 },
    }));
  };

  const drawerVariant = pinned ? 'permanent' : 'temporary';

  return (
    <Drawer
      anchor="left"
      variant={drawerVariant}
      open={pinned ? true : open}
      onClose={pinned ? undefined : onClose}
      ModalProps={pinned ? undefined : { keepMounted: true }}
      transitionDuration={pinned ? undefined : { enter: 250, exit: 200 }}
      sx={{
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #F5F7FA 0%, #E8EEF5 100%)',
          color: 'var(--foreground)',
          borderRight: '1px solid rgba(0, 0, 0, 0.06)',
          position: pinned ? 'relative' : 'fixed',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* Animated Gradient Mesh Background */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(at 40% 20%, rgba(227, 242, 253, 0.6) 0px, transparent 50%),
            radial-gradient(at 80% 0%, rgba(224, 242, 241, 0.5) 0px, transparent 50%),
            radial-gradient(at 0% 50%, rgba(252, 228, 236, 0.4) 0px, transparent 50%),
            radial-gradient(at 80% 50%, rgba(243, 229, 245, 0.5) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(255, 253, 231, 0.4) 0px, transparent 50%),
            radial-gradient(at 80% 100%, rgba(232, 245, 233, 0.5) 0px, transparent 50%)
          `,
          animation: 'meshMove 25s linear infinite',
          '@keyframes meshMove': {
            '0%': { backgroundPosition: '0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%' },
            '50%': { backgroundPosition: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%' },
            '100%': { backgroundPosition: '0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%' },
          },
        }}
      />

      {/* Floating Orbs */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          aria-hidden
          sx={{
            position: 'absolute',
            width: [300, 250, 200, 180, 150, 120][i],
            height: [300, 250, 200, 180, 150, 120][i],
            borderRadius: '50%',
            top: `${[10, 20, 60, 70, 30, 80][i]}%`,
            left: `${[80, 15, 70, 20, 60, 85][i]}%`,
            opacity: [0.15, 0.12, 0.14, 0.1, 0.13, 0.15][i],
            background: [
              'radial-gradient(circle, rgba(187, 222, 251, 0.5), transparent)',
              'radial-gradient(circle, rgba(178, 223, 219, 0.45), transparent)',
              'radial-gradient(circle, rgba(248, 187, 208, 0.4), transparent)',
              'radial-gradient(circle, rgba(225, 190, 231, 0.45), transparent)',
              'radial-gradient(circle, rgba(255, 249, 196, 0.4), transparent)',
              'radial-gradient(circle, rgba(200, 230, 201, 0.45), transparent)',
            ][i],
            filter: 'blur(50px)',
            zIndex: 0,
            pointerEvents: 'none',
            animation: `float ${[25, 30, 20, 28, 22, 26][i]}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translate(0, 0) scale(1)',
              },
              '33%': {
                transform: 'translate(30px, -30px) scale(1.05)',
              },
              '66%': {
                transform: 'translate(-20px, 20px) scale(0.95)',
              },
            },
          }}
        />
      ))}
      {/* Glassmorphism Header with 3D Tilt */}
      <Toolbar
        onMouseMove={handleHeaderMouseMove}
        onMouseLeave={handleHeaderMouseLeave}
        sx={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '10px',
          m: 1,
          mb: 0.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          py: 0.75,
          px: 1,
          minHeight: 'auto',
          transform: `perspective(1000px) rotateX(${headerRotate.x}deg) rotateY(${headerRotate.y}deg)`,
          transition: 'transform 0.15s ease-out',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '10px',
            background: `radial-gradient(300px circle at ${headerMouse.x}px ${headerMouse.y}px, rgba(255, 255, 255, 0.4), transparent 40%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: tenantSettings?.logoUrl
                ? 'transparent'
                : 'linear-gradient(135deg, #BBDEFB 0%, #90CAF9 100%)',
              border: tenantSettings?.logoUrl ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
              padding: tenantSettings?.logoUrl ? 0.5 : 0,
              boxShadow: tenantSettings?.logoUrl
                ? 'none'
                : '0 2px 8px rgba(187, 222, 251, 0.4)',
              flexShrink: 0,
              overflow: 'hidden',
              animation: tenantSettings?.logoUrl ? 'none' : 'iconFloat 4s ease-in-out infinite',
              '@keyframes iconFloat': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-3px)' },
              },
            }}
          >
            {tenantLoading ? (
              <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '8px' }} />
            ) : tenantSettings?.logoUrl ? (
              <Box
                component="img"
                src={tenantSettings.logoUrl}
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <DirectionsCar sx={{ fontSize: 16, color: '#1565C0' }} />
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {tenantLoading ? (
              <Box sx={{ py: 0.25 }}>
                <Skeleton variant="text" width="80%" height={16} />
                <Skeleton variant="text" width="50%" height={12} />
              </Box>
            ) : (
              <>
                <Typography
                  variant="subtitle1"
                  noWrap
                  fontWeight="700"
                  sx={{
                    lineHeight: 1.2,
                    fontSize: '0.75rem',
                    color: '#1E293B',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {tenantSettings?.companyName || 'OTOMUHASEBE'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B',
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    display: 'block',
                    letterSpacing: '0.05em',
                  }}
                >
                  KURUMSAL ERP
                </Typography>
              </>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={pinned ? onTogglePin : onClose}
          size="small"
          sx={{
            width: 28,
            height: 28,
            color: '#64748B',
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#1E293B',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {pinned ? (
            <PushPin sx={{ fontSize: 14 }} />
          ) : (
            <Close sx={{ fontSize: 14 }} />
          )}
        </IconButton>
      </Toolbar>

      {/* Glassmorphism Quick Actions Button */}
      <Box sx={{ px: 1, pt: 0.5, pb: 0.5, position: 'relative', zIndex: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<FlashOn sx={{ fontSize: 14 }} />}
          onClick={(e) => setQuickMenuAnchor(e.currentTarget)}
          sx={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            color: '#1E293B',
            fontWeight: 600,
            py: 0.5,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '0.7rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.85)',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.06)',
              transform: 'translateY(-1px)',
              border: '1px solid rgba(255, 255, 255, 1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Hızlı İşlem
        </Button>
        <Menu
          anchorEl={quickMenuAnchor}
          open={Boolean(quickMenuAnchor)}
          onClose={() => setQuickMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            sx: {
              mt: 0.5,
              minWidth: 180,
              maxWidth: 240,
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
            },
          }}
        >
          {quickMenuItems
            .filter((item: any) => item.enabled)
            .sort((a: any, b: any) => a.order - b.order)
            .map((item: any) => {
              const IconComponent = IconMap[item.icon];
              return (
                <MenuItem
                  key={item.id}
                  onClick={() => handleQuickCreate(item.path)}
                  sx={{
                    py: 0.5,
                    px: 1,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      mr: 1,
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      bgcolor: `${item.color}15`,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    {IconComponent ? <IconComponent sx={{ fontSize: 14 }} /> : <Add sx={{ fontSize: 14 }} />}
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#1E293B', fontSize: '0.8rem' }}>{item.label}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>
                      {item.path}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}

          {quickMenuItems.filter((item) => item.enabled).length === 0 && (
            <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem' }}>
                Hızlı menü öğesi yok
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  setQuickMenuAnchor(null);
                  router.push('/ayarlar/hizli-menu');
                }}
                sx={{ mt: 0.5, textTransform: 'none', color: '#1E293B', fontSize: '0.75rem' }}
              >
                Ayarlar
              </Button>
            </Box>
          )}
        </Menu>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.06)', mx: 1, mb: 0.5 }} />

      {/* Glassmorphism Search */}
      <Box sx={{ px: 1, pt: 0, pb: 0.5, position: 'relative', zIndex: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#94A3B8', fontSize: 16 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 1)',
              },
              '&.Mui-focused': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #BBDEFB',
                '& fieldset': {
                  borderColor: 'transparent',
                },
              },
            },
            '& .MuiOutlinedInput-input': {
              fontSize: '0.75rem',
              py: 0.75,
              color: '#1E293B',
              '&::placeholder': {
                color: '#94A3B8',
                opacity: 1,
              },
            },
          }}
        />
      </Box>

      {/* Menu Items Container */}
      <Box sx={{ px: 0.5, pt: 0.5, flexGrow: 1, overflowY: 'auto', position: 'relative', zIndex: 1, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255, 255, 255, 0.15)', borderRadius: '2px', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' } } }}>
        {filteredMenuItems.length === 0 && searchTerm ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Search sx={{ fontSize: 32, color: '#CBD5E1', mb: 0.5 }} />
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem' }}>
              "{searchTerm}" için sonuç bulunamadı
            </Typography>
          </Box>
        ) : (
          filteredMenuItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const hasSubMenu = !!item.subItems;
            const isOpen = openSubMenu === item.id;
            const ParentIcon: any = IconMap[item.icon] || IconMap.Help;
            const itemColor = item.color || '#0ea5e9';

            const showSectionHeader = item.section && !searchTerm;
            const prevSection = index > 0 ? filteredMenuItems[index - 1].section : null;
            const shouldShowHeader = showSectionHeader && item.section !== prevSection;

            return (
              <React.Fragment key={item.id}>
                {shouldShowHeader && (
                  <Box
                    sx={{
                      mt: index === 0 ? 0 : 1,
                      mb: 0.5,
                      px: 1.5,
                      py: 0.25,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        color: '#94A3B8',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.section}
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.25,
                        height: '1px',
                        bgcolor: 'rgba(0, 0, 0, 0.06)',
                        maxWidth: '30px',
                        borderRadius: '0.5px',
                      }}
                    />
                  </Box>
                )}

                {/* Main Menu Item Card */}
                <Box
                  onMouseMove={(e) => handleMenuItemMouseMove(e, item.id)}
                  onMouseLeave={() => handleMenuItemMouseLeave(item.id)}
                  onClick={() => handleMenuClick(item)}
                  sx={{
                    position: 'relative',
                    borderRadius: '10px',
                    background: isActive
                      ? itemColor
                      : 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(16px)',
                    border: isActive
                      ? '1px solid rgba(255, 255, 255, 0.8)'
                      : '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: isActive
                      ? `0 4px 12px ${itemColor}30`
                      : '0 1px 4px rgba(0, 0, 0, 0.04)',
                    mb: 0.5,
                    mx: 1,
                    p: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transform: `perspective(1000px) rotateX(${itemTilts[item.id]?.x || 0}deg) rotateY(${itemTilts[item.id]?.y || 0}deg)`,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '10px',
                      background: `radial-gradient(200px circle at ${itemMousePositions[item.id]?.x || 0}px ${itemMousePositions[item.id]?.y || 0}px, rgba(255, 255, 255, 0.3), transparent 40%)`,
                      pointerEvents: 'none',
                      opacity: 0.6,
                    },
                    '&:hover': {
                      background: isActive
                        ? itemColor
                        : 'rgba(255, 255, 255, 0.8)',
                      transform: 'translateX(2px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 1, gap: 1 }}>
                    {/* Gradient Icon Box */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        background: generateGradient(itemColor),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 2px 8px ${itemColor}30`,
                        animation: isActive ? 'iconFloat 3s ease-in-out infinite' : 'none',
                        '@keyframes iconFloat': {
                          '0%, 100%': { transform: 'translateY(0) scale(1)' },
                          '50%': { transform: 'translateY(-2px) scale(1.02)' },
                        },
                      }}
                    >
                      <ParentIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />
                    </Box>

                    {/* Label */}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        color: isActive ? '#FFFFFF' : '#475569',
                        letterSpacing: '-0.01em',
                      }}>
                        {item.label}
                      </Typography>
                    </Box>

                    {/* Expand Icon */}
                    {hasSubMenu && (
                      <Box sx={{
                        color: isActive ? '#FFFFFF' : '#94A3B8',
                        transition: 'transform 0.3s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}>
                        <ExpandMore sx={{ fontSize: 16 }} />
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Sub Menu Items */}
                {hasSubMenu && (
                  <Collapse in={isOpen} timeout={200} unmountOnExit>
                    <Box
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '8px',
                        mx: 1,
                        mb: 0.5,
                        mt: 0.25,
                        px: 0.5,
                        py: 0.5,
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {item.subItems
                        ?.filter((subItem: any) =>
                          !searchTerm || subItem.label.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((subItem: any) => {
                          const isSubActive = activeTab === subItem.id;
                          const SubIcon: any = IconMap[subItem.icon] || IconMap.Help;
                          const subColor = subItem.color || itemColor;

                          return (
                            <Box
                              key={subItem.id}
                              onMouseMove={(e) => handleMenuItemMouseMove(e, subItem.id)}
                              onMouseLeave={() => handleMenuItemMouseLeave(subItem.id)}
                              onClick={() => handleSubMenuClick(item, subItem)}
                              sx={{
                                position: 'relative',
                                borderRadius: '8px',
                                background: isSubActive
                                  ? subColor
                                  : 'rgba(255, 255, 255, 0.4)',
                                backdropFilter: 'blur(12px)',
                                border: isSubActive
                                  ? '1px solid rgba(255, 255, 255, 0.8)'
                                  : '1px solid rgba(255, 255, 255, 0.5)',
                                boxShadow: isSubActive
                                  ? `0 2px 6px ${subColor}25`
                                  : '0 1px 3px rgba(0, 0, 0, 0.03)',
                                mb: 0.25,
                                ml: 0.5, // Indentation
                                mr: 0.25,
                                p: 0,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transform: `perspective(1000px) rotateX(${itemTilts[subItem.id]?.x || 0}deg) rotateY(${itemTilts[subItem.id]?.y || 0}deg)`,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  inset: 0,
                                  borderRadius: '8px',
                                  background: `radial-gradient(150px circle at ${itemMousePositions[subItem.id]?.x || 0}px ${itemMousePositions[subItem.id]?.y || 0}px, rgba(255, 255, 255, 0.25), transparent 40%)`,
                                  pointerEvents: 'none',
                                },
                                '&:hover': {
                                  background: isSubActive
                                    ? subColor
                                    : 'rgba(255, 255, 255, 0.7)',
                                  transform: 'translateX(2px)',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', p: 0.75, gap: 0.75 }}>
                                {/* Small Gradient Icon Box */}
                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '6px',
                                    background: generateGradient(subColor),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 2px 6px ${subColor}25`,
                                  }}
                                >
                                  <SubIcon sx={{ fontSize: 12, color: '#FFFFFF' }} />
                                </Box>

                                <Typography sx={{
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  color: isSubActive ? '#FFFFFF' : '#475569',
                                }}>
                                  {subItem.label}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                    </Box>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })
        )}
      </Box>

      {/* Glassmorphism User Profile Section */}
      <Box sx={{ px: 1, pb: 1, pt: 0.5, borderTop: '1px solid rgba(0, 0, 0, 0.06)', position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(12px)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            p: 0.75,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              transform: 'translateY(-1px)',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.06)',
            },
            transition: 'all 0.2s ease',
          }}
          onClick={handleUserMenuClick}
        >
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: 'linear-gradient(135deg, #BBDEFB 0%, #90CAF9 100%)',
              color: '#1565C0',
              fontWeight: 700,
              fontSize: '0.75rem',
              boxShadow: '0 2px 6px rgba(187, 222, 251, 0.4)',
            }}
          >
            {authUser?.fullName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1E293B',
                fontSize: '0.75rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {authUser?.fullName || 'Kullanıcı'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#64748B',
                fontSize: '0.65rem',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {authUser?.role || 'Rol bilgisi'}
            </Typography>
          </Box>
          <IconButton
            size="small"
            sx={{
              width: 24,
              height: 24,
              color: '#64748B',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                color: '#1E293B',
              },
            }}
          >
            <MoreVert sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          PaperProps={{
            sx: {
              mt: 0.5,
              minWidth: 160,
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
            },
          }}
        >
          <MenuItem onClick={handleUserMenuClose} sx={{ py: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: '100%' }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'linear-gradient(135deg, #BBDEFB 0%, #90CAF9 100%)', fontSize: '0.65rem', color: '#1565C0' }}>
                {authUser?.fullName?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#1E293B', fontSize: '0.8rem' }}>
                  {authUser?.fullName || 'Kullanıcı'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>
                  {authUser?.email || authUser?.role || 'Bilgi yok'}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <Divider sx={{ my: 0.25, borderColor: 'rgba(0, 0, 0, 0.06)' }} />
          <MenuItem onClick={handleUserMenuClose} sx={{ py: 0.5, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
            <Settings sx={{ mr: 1, fontSize: 16, color: '#64748B' }} />
            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600, fontSize: '0.8rem' }}>Ayarlar</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ py: 0.5, color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' } }}>
            <Logout sx={{ mr: 1, fontSize: 16 }} />
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Çıkış Yap</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Drawer>
  );
}
