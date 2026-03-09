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
import React, { useEffect, useMemo, useState } from 'react';

export const SIDEBAR_WIDTH = 280;

const palette = {
  secondaryHex: '#527575',
  // Light + clean, marka tokenlarıyla (örnek dashboard’a yakın)
  gradient: 'var(--card)',
  headerGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 65%, #527575 35%) 0%, color-mix(in srgb, var(--primary) 45%, var(--background) 55%) 100%)',
  textPrimary: 'var(--foreground)',
  textSecondary: 'color-mix(in srgb, var(--foreground) 60%, transparent)',
  iconBg: 'color-mix(in srgb, var(--primary) 10%, var(--card) 90%)',
  iconBgActive: 'color-mix(in srgb, #527575 18%, var(--card) 82%)',
  itemHover: 'color-mix(in srgb, #527575 24%, var(--card) 76%)',
  itemBorder: 'color-mix(in srgb, var(--border) 85%, transparent)',
  itemSelectedBorder: 'color-mix(in srgb, var(--primary) 55%, var(--border) 45%)',
  itemSelectedBg: 'color-mix(in srgb, var(--primary) 35%, #527575 25%, var(--card) 40%)',
  submenuBg: 'color-mix(in srgb, var(--card) 80%, #527575 20%)',
  submenuBorder: 'color-mix(in srgb, #527575 45%, var(--border) 55%)',
  searchBg: 'color-mix(in srgb, var(--input) 92%, var(--card) 8%)',
  searchBorder: 'color-mix(in srgb, var(--border) 80%, var(--primary) 20%)',
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

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
    handleUserMenuClose();
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
          background: palette.gradient,
          color: palette.textPrimary,
          borderRight: 'none',
          position: pinned ? 'relative' : 'fixed',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Modern Header */}
      <Toolbar
        sx={{
          background: 'var(--card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          py: 2,
          px: 2.5,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: tenantSettings?.logoUrl
                ? 'transparent'
                : 'linear-gradient(135deg, var(--primary), #527575)',
              border: tenantSettings?.logoUrl ? '1px solid var(--border)' : 'none',
              padding: tenantSettings?.logoUrl ? 0.5 : 0,
              boxShadow: tenantSettings?.logoUrl
                ? 'none'
                : '0 4px 12px color-mix(in srgb, var(--primary) 20%, transparent)',
              flexShrink: 0,
              overflow: 'hidden'
            }}
          >
            {tenantLoading ? (
              <Skeleton variant="rectangular" width={42} height={42} sx={{ borderRadius: 'var(--radius-sm)' }} />
            ) : tenantSettings?.logoUrl ? (
              <Box
                component="img"
                src={tenantSettings.logoUrl}
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <DirectionsCar sx={{ fontSize: 22, color: 'var(--primary-foreground)' }} />
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {tenantLoading ? (
              <Box sx={{ py: 0.5 }}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="50%" height={14} />
              </Box>
            ) : (
              <>
                <Typography
                  variant="subtitle1"
                  noWrap
                  fontWeight="800"
                  sx={{
                    lineHeight: 1.2,
                    fontSize: '0.9375rem',
                    color: 'var(--foreground)',
                    letterSpacing: '-0.025em',
                    textTransform: 'uppercase',
                  }}
                >
                  {tenantSettings?.companyName || 'OTOMUHASEBE'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--muted-foreground)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
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
            color: 'var(--muted-foreground)',
            '&:hover': {
              bgcolor: 'var(--muted)',
              color: 'var(--foreground)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {pinned ? (
            <PushPin sx={{ fontSize: 18 }} />
          ) : (
            <Close sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Toolbar>

      {/* Quick Actions Button */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          onClick={(e) => setQuickMenuAnchor(e.currentTarget)}
          sx={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: 'var(--primary-foreground)',
            fontWeight: 600,
            py: 1.25,
            borderRadius: 'var(--radius)',
            textTransform: 'none',
            fontSize: '0.875rem',
            boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 25%, transparent)',
            '&:hover': {
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              boxShadow: '0 6px 16px color-mix(in srgb, var(--primary) 35%, transparent)',
              transform: 'translateY(-1px)',
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
              mt: 1,
              minWidth: 240,
              maxWidth: 320,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 24px color-mix(in srgb, var(--foreground) 8%, transparent)',
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
                  sx={{ py: 1.25 }}
                >
                  <Box
                    sx={{
                      mr: 1.5,
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: `${item.color}20`,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {IconComponent ? <IconComponent sx={{ fontSize: 18 }} /> : <Add sx={{ fontSize: 18 }} />}
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {item.path}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}

          {quickMenuItems.filter((item) => item.enabled).length === 0 && (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Hızlı menü öğesi yok
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  setQuickMenuAnchor(null);
                  router.push('/ayarlar/hizli-menu');
                }}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                Hızlı Menü Ayarları
              </Button>
            </Box>
          )}
        </Menu>
      </Box>

      <Divider sx={{ borderColor: 'var(--border)', mx: 2 }} />

      {/* Modern Search */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Menüde ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'var(--muted-foreground)', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'var(--input)',
              borderRadius: 'var(--radius)',
              '& fieldset': {
                borderColor: 'var(--border)',
              },
              '&:hover fieldset': {
                borderColor: 'var(--ring)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--primary)',
                borderWidth: '2px',
              },
            },
            '& .MuiOutlinedInput-input': {
              fontSize: '0.875rem',
              py: 1.25,
              '&::placeholder': {
                color: 'var(--muted-foreground)',
                opacity: 1,
              },
            },
          }}
        />
      </Box>

      <List sx={{ px: 1.5, pt: 1, flexGrow: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'var(--border)', borderRadius: '3px', '&:hover': { bgcolor: 'var(--muted-foreground)' } } }}>
        {filteredMenuItems.length === 0 && searchTerm ? (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <Search sx={{ fontSize: 48, color: 'var(--muted-foreground)', mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
              "{searchTerm}" için sonuç bulunamadı
            </Typography>
          </Box>
        ) : (
          filteredMenuItems.map((item) => {
            const isActive = activeTab === item.id;
            const hasSubMenu = !!item.subItems;
            const isOpen = openSubMenu === item.id;
            const ParentIcon: any = IconMap[item.icon] || IconMap.Help;

            return (
              <React.Fragment key={item.id}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleMenuClick(item)}
                    sx={{
                      borderRadius: 'var(--radius)',
                      px: 1.5,
                      py: 0.875,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: isActive
                        ? 'color-mix(in srgb, var(--primary) 10%, var(--card) 90%)'
                        : 'transparent',
                      position: 'relative',
                      '&::before': isActive ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: '60%',
                        bgcolor: 'var(--primary)',
                        borderRadius: '0 2px 2px 0',
                      } : {},
                      '&:hover': {
                        background: isActive
                          ? 'color-mix(in srgb, var(--primary) 10%, var(--card) 90%)'
                          : 'color-mix(in srgb, #527575 20%, var(--card) 80%)',
                        transform: 'translateX(2px)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: 'calc(var(--radius) - 2px)',
                          bgcolor: isActive
                            ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                            : 'transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ParentIcon sx={{
                          color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                          fontSize: 18,
                          transition: 'color 0.2s ease',
                        }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.875rem',
                          color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                          letterSpacing: '-0.01em',
                          transition: 'all 0.2s ease',
                        },
                      }}
                    />
                    {hasSubMenu && (
                      <Box sx={{
                        color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                        transition: 'all 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}>
                        <ExpandMore sx={{ fontSize: 18 }} />
                      </Box>
                    )}
                  </ListItemButton>
                </ListItem>

                {hasSubMenu && (
                  <Collapse in={isOpen} timeout={200} unmountOnExit>
                    <Box
                      sx={{
                        bgcolor: 'color-mix(in srgb, var(--muted) 85%, #527575 15%)',
                        borderRadius: 'var(--radius)',
                        mx: 1,
                        mb: 1,
                        mt: 0.5,
                        px: 0.5,
                        py: 0.75,
                        border: '1px solid color-mix(in srgb, var(--border) 75%, #527575 25%)',
                      }}
                    >
                      <List component="div" disablePadding>
                        {item.subItems
                          ?.filter((subItem: any) =>
                            !searchTerm || subItem.label.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((subItem: any) => {
                            const isSubActive = activeTab === subItem.id;
                            const SubIcon: any = IconMap[subItem.icon] || IconMap.Help;

                            return (
                              <ListItem key={subItem.id} disablePadding>
                                <ListItemButton
                                  onClick={() => handleSubMenuClick(item, subItem)}
                                  sx={{
                                    borderRadius: 'calc(var(--radius) - 2px)',
                                    mb: 0.25,
                                    py: 0.75,
                                    px: 1.25,
                                    transition: 'all 0.2s ease',
                                    bgcolor: isSubActive ? 'color-mix(in srgb, #527575 18%, transparent)' : 'transparent',
                                    '&:hover': {
                                      bgcolor: isSubActive
                                        ? 'color-mix(in srgb, #527575 18%, transparent)'
                                        : 'color-mix(in srgb, #527575 14%, transparent)',
                                      transform: 'translateX(2px)',
                                    },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 24,
                                        height: 24,
                                        borderRadius: 'calc(var(--radius) - 4px)',
                                        bgcolor: isSubActive
                                          ? 'color-mix(in srgb, #527575 10%, transparent)'
                                          : 'transparent',
                                      }}
                                    >
                                      <SubIcon sx={{
                                        color: isSubActive ? '#527575' : 'var(--muted-foreground)',
                                        fontSize: 16,
                                      }} />
                                    </Box>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={subItem.label}
                                    sx={{
                                      '& .MuiListItemText-primary': {
                                        fontWeight: isSubActive ? 600 : 500,
                                        fontSize: '0.8125rem',
                                        color: isSubActive ? '#527575' : 'var(--muted-foreground)',
                                      },
                                    }}
                                  />
                                </ListItemButton>
                              </ListItem>
                            );
                          })}
                      </List>
                    </Box>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })
        )}
      </List>

      {/* Modern User Profile Section */}
      <Box sx={{ px: 2, pb: 2, pt: 1, borderTop: '1px solid var(--border)' }}>
        <Box
          sx={{
            bgcolor: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'var(--muted)',
              borderColor: 'var(--ring)',
            },
          }}
          onClick={handleUserMenuClick}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {authUser?.fullName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'var(--foreground)',
                fontSize: '0.875rem',
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
                color: 'var(--muted-foreground)',
                fontSize: '0.75rem',
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
              color: 'var(--muted-foreground)',
              '&:hover': {
                bgcolor: 'var(--accent)',
                color: 'var(--foreground)',
              },
            }}
          >
            <MoreVert sx={{ fontSize: 18 }} />
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
              mt: 1,
              minWidth: 200,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 24px color-mix(in srgb, var(--foreground) 8%, transparent)',
            },
          }}
        >
          <MenuItem onClick={handleUserMenuClose} sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--primary)', fontSize: '0.75rem' }}>
                {authUser?.fullName?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {authUser?.fullName || 'Kullanıcı'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {authUser?.email || authUser?.role || 'Bilgi yok'}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleUserMenuClose} sx={{ py: 1 }}>
            <Settings sx={{ mr: 1.5, fontSize: 18, color: 'var(--muted-foreground)' }} />
            <Typography variant="body2">Ayarlar</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ py: 1, color: 'var(--destructive)' }}>
            <Logout sx={{ mr: 1.5, fontSize: 18 }} />
            <Typography variant="body2" fontWeight={500}>Çıkış Yap</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Drawer>
  );
}
