import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  LayoutDashboard as DashboardIcon,
  Wallet as PaymentIcon,
  List as ViewListIcon,
  Settings as SettingsIcon,
  BarChart3 as ReportsIcon,
  CreditCard as CreditCardIcon,
  Users as UsersIcon,
} from 'lucide-react';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { text: 'Ödemeler', icon: PaymentIcon, path: '/payments' },
  { text: 'Abonelikler', icon: CreditCardIcon, path: '/subscriptions' },
  { text: 'Kullanıcılar', icon: UsersIcon, path: '/users' },
  { text: 'Paketler', icon: ViewListIcon, path: '/plans' },
  { text: 'Raporlar', icon: ReportsIcon, path: '/reports' },
  { text: 'Ayarlar', icon: SettingsIcon, path: '/settings' },
];

interface SidebarProps {
  mobileOpen: boolean;
  desktopOpen: boolean;
  onMobileClose: () => void;
  onDesktopToggle: () => void;
}

export default function Sidebar({ mobileOpen, desktopOpen, onMobileClose, onDesktopToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <Toolbar
        sx={{
          px: 3,
          py: 2.5,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          minHeight: '64px !important',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            width: '100%',
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
              O
            </Typography>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: '0.5px',
            }}
          >
            OtoMuhasebe
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    onMobileClose();
                  }
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  mb: 0.5,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: alpha('#6366f1', 0.08),
                    transform: 'translateX(4px)',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      transform: 'translateX(4px)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? 'white' : '#64748b',
                    minWidth: 40,
                    transition: 'color 0.2s ease',
                  }}
                >
                  <item.icon size={22} />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box
        sx={{
          p: 2,
          textAlign: 'center',
          background: alpha('#6366f1', 0.04),
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#64748b',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        open={desktopOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
