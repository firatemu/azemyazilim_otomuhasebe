'use client';

import { useAuthStore } from '@/stores/authStore';
import { useTabStore } from '@/stores/tabStore';
import { useQuickMenuStore } from '@/stores/quickMenuStore';
import axios from '@/lib/axios';
import * as Icons from '@mui/icons-material';
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

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Dashboard, path: '/dashboard', color: '#667eea', bgColor: '#f0f4ff' },
  {
    id: 'stok',
    label: 'Stok Yönetimi',
    icon: Inventory,
    color: '#06b6d4',
    bgColor: '#ecfeff',
    subItems: [
      { id: 'stok-malzeme-listesi', label: 'Malzeme Listesi', icon: Inventory, path: '/stok/malzeme-listesi', color: '#06b6d4' },
      { id: 'stok-malzeme-hareketleri', label: 'Malzeme Hareketleri', icon: Assessment, path: '/stok/malzeme-hareketleri', color: '#06b6d4' },
      { id: 'stok-urun-eslestirme', label: 'Ürün Eşleştirme', icon: Settings, path: '/stok/urun-eslestirme', color: '#8b5cf6' },
      { id: 'stok-kategori-yonetimi', label: 'Kategori Yönetimi', icon: Assessment, path: '/stok/kategori-yonetimi', color: '#06b6d4' },
      { id: 'stok-marka-yonetimi', label: 'Marka Yönetimi', icon: DirectionsCar, path: '/stok/marka-yonetimi', color: '#06b6d4' },
      { id: 'arac-yonetimi', label: 'Araç Yönetimi', icon: DirectionsCar, path: '/arac', color: '#10b981' },
      { id: 'stok-birim-setleri', label: 'Birim Setleri Yönetimi', icon: Settings, path: '/stok/birim-setleri', color: '#06b6d4' },
      { id: 'stok-satis-fiyatlari', label: 'Satış Fiyatları', icon: AttachMoney, path: '/stok/satis-fiyatlari', color: '#ef4444' },
      { id: 'stok-alis-fiyatlari', label: 'Satın Alma Fiyatları', icon: AttachMoney, path: '/stok/satin-alma-fiyatlari', color: '#0ea5e9' },
      { id: 'stok-toplu-satis-guncelle', label: 'Toplu Satış Fiyat Güncelleme', icon: AttachMoney, path: '/stok/toplu-satis-fiyat-guncelle', color: '#22c55e' },
      { id: 'stok-maliyet', label: 'Maliyetlendirme', icon: AttachMoney, path: '/stok/maliyet', color: '#9333ea' },
      { id: 'stok-kritik-stok', label: 'Kritik Stok Yönetimi', icon: Warning, path: '/stok/kritik-stok-yonetimi', color: '#ef4444' },
    ],
  },
  {
    id: 'cek-senet',
    label: 'Bordro (Çek/Senet)',
    icon: Description,
    color: '#334155',
    bgColor: '#f8fafc',
    subItems: [
      { id: 'bordro-listesi', label: 'Bordrolar', icon: Assignment, path: '/bordro', color: '#8b5cf6' },
      { id: 'cek-senet-listesi', label: 'Çek/Senet Listesi', icon: Payment, path: '/cek-senet', color: '#8b5cf6' },
    ],
  },
  {
    id: 'cari',
    label: 'Cari Yönetimi',
    icon: People,
    color: '#334155',
    bgColor: '#f8fafc',
    subItems: [
      { id: 'cari-liste', label: 'Cari Listesi', icon: People, path: '/cari', color: '#8b5cf6' },
      { id: 'cari-fatura-kapatma', label: 'Fatura Kapatma & Ekstre', icon: AccountBalance, path: '/cari/fatura-kapatma', color: '#0891b2' },
      { id: 'cari-borc-alacak', label: 'Borç Alacak Durumu', icon: Assessment, path: '/cari/rapor/borc-alacak', color: '#10b981' },
      { id: 'cari-vade-analiz', label: 'Vade Analizi', icon: CalendarMonth, path: '/vade-analiz', color: '#667eea' },
    ],
  },
  {
    id: 'fatura',
    label: 'Fatura',
    icon: Receipt,
    color: '#1e293b',
    bgColor: '#f1f5f9',
    subItems: [
      { id: 'fatura-satis', label: 'Satış Faturaları', icon: PointOfSale, path: '/fatura/satis', color: '#8b5cf6' },
      { id: 'fatura-alis', label: 'Satın Alma Faturaları', icon: ShoppingCart, path: '/fatura/alis', color: '#f59e0b' },
      { id: 'fatura-iade-satis', label: 'Satış İade Faturaları', icon: TrendingDown, path: '/fatura/iade/satis', color: '#ef4444' },
      { id: 'fatura-iade-alis', label: 'Satınalma İade Faturaları', icon: TrendingUp, path: '/fatura/iade/alis', color: '#06b6d4' },
      { id: 'fatura-karlilik', label: 'Fatura Karlılığı', icon: TrendingUp, path: '/fatura/karlilik', color: '#10b981' },
      { id: 'fatura-arsiv', label: 'Fatura Arşivi', icon: Assessment, path: '/fatura/arsiv', color: '#ef4444' },
      { id: 'fatura-gelen-efatura', label: 'Gelen E-Faturalar', icon: CloudDownload, path: '/efatura/gelen', color: '#0ea5e9' },
    ],
  },
  {
    id: 'teklif',
    label: 'Teklif',
    icon: Description,
    color: '#f59e0b',
    bgColor: '#fffbeb',
    subItems: [
      { id: 'teklif-satis', label: 'Satış Teklifleri', icon: PointOfSale, path: '/teklif/satis', color: '#f59e0b' },
      { id: 'teklif-satin-alma', label: 'Satın Alma Teklifleri', icon: ShoppingCart, path: '/teklif/satin-alma', color: '#10b981' },
    ],
  },
  {
    id: 'siparis',
    label: 'Sipariş',
    icon: ShoppingCart,
    color: '#0891b2',
    bgColor: '#ecfeff',
    subItems: [
      { id: 'siparis-satis', label: 'Satış Siparişleri', icon: PointOfSale, path: '/siparis/satis', color: '#0891b2' },
      { id: 'siparis-satin-alma', label: 'Satın Alma Siparişleri', icon: ShoppingCart, path: '/siparis/satin-alma', color: '#06b6d4' },
    ],
  },
  {
    id: 'satis-irsaliyesi',
    label: 'Satış İrsaliyesi',
    icon: LocalShipping,
    color: '#334155',
    bgColor: '#f8fafc',
    subItems: [
      { id: 'satis-irsaliyesi-liste', label: 'Satış İrsaliyeleri', icon: ReceiptLong, path: '/satis-irsaliyesi', color: '#8b5cf6' },
    ],
  },
  {
    id: 'satin-alma-irsaliyesi',
    label: 'Satın Alma İrsaliyesi',
    icon: LocalShipping,
    color: '#06b6d4',
    bgColor: '#ecfeff',
    subItems: [
      { id: 'satin-alma-irsaliyesi-liste', label: 'Satın Alma İrsaliyeleri', icon: ReceiptLong, path: '/satin-alma-irsaliyesi', color: '#06b6d4' },
    ],
  },
  { id: 'tahsilat', label: 'Tahsilat & Ödeme', icon: Payment, path: '/tahsilat', color: '#10b981', bgColor: '#ecfdf5' },
  { id: 'kasa', label: 'Kasa', icon: AccountBalance, path: '/kasa', color: '#f59e0b', bgColor: '#fffbeb' },
  {
    id: 'banka',
    label: 'Banka İşlemleri',
    icon: AccountBalanceWallet,
    color: '#0891b2',
    bgColor: '#ecfeff',
    subItems: [
      { id: 'bankalar', label: 'Banka ve Hesapları', icon: AccountBalance, path: '/banka', color: '#2563eb' },
      { id: 'banka-kredi', label: 'Kredi İşlemleri', icon: CreditCard, path: '/banka/kredi-islemleri', color: '#9333ea' },
      { id: 'banka-gelen-havale', label: 'Gelen Havale', icon: TrendingUp, path: '/banka-havale/gelen', color: '#10b981' },
      { id: 'banka-giden-havale', label: 'Giden Havale', icon: TrendingDown, path: '/banka-havale/giden', color: '#ef4444' },
      { id: 'banka-silinen', label: 'Silinen Kayıtlar', icon: Delete, path: '/banka-havale/silinen', color: '#6b7280' },
    ],
  },

  {
    id: 'ik',
    label: 'İnsan Kaynakları',
    icon: Badge,
    color: '#d946ef',
    bgColor: '#fdf4ff',
    subItems: [
      { id: 'ik-personel', label: 'Personel Listesi', icon: People, path: '/ik/personel', color: '#d946ef' },
      { id: 'ik-maas', label: 'Maaş Yönetimi', icon: AttachMoney, path: '/ik/maas-yonetimi', color: '#d946ef' },
      { id: 'ik-avans', label: 'Avans Yönetimi', icon: Payment, path: '/ik/avans', color: '#d946ef' },
    ],
  },
  {
    id: 'depo',
    label: 'Depo/Raf Yönetimi',
    icon: Warehouse,
    color: '#3b82f6',
    bgColor: '#eff6ff',
    subItems: [
      { id: 'depo-depolar', label: 'Depo Yönetimi', icon: Warehouse, path: '/depo/depolar', color: '#6366f1' },
      { id: 'depo-transfer-fisi', label: 'Ambar Transfer Fişi', icon: LocalShipping, path: '/depo/transfer-fisi', color: '#f59e0b' },
      { id: 'depo-put-away', label: 'Put-Away İşlemi', icon: TrendingUp, path: '/depo/islemler/put-away', color: '#10b981' },
      { id: 'depo-transfer', label: 'Transfer İşlemi', icon: TrendingDown, path: '/depo/islemler/transfer', color: '#f59e0b' },
      { id: 'depo-siparis-hazirlama', label: 'Sipariş Hazırlama', icon: Assignment, path: '/siparis/hazirlama-listesi', color: '#f59e0b' },
      { id: 'depo-sayim', label: 'Stok Sayım', icon: Inventory, path: '/sayim', color: '#14b8a6' },
      { id: 'depo-stok-raporu', label: 'Ambar Stok Raporu', icon: Assessment, path: '/depo/stok-raporu', color: '#14b8a6' },
      { id: 'depo-raporlar', label: 'Depo Raporları', icon: Assessment, path: '/depo/raporlar', color: '#14b8a6' },
    ],
  },
  { id: 'masraf', label: 'Masraf', icon: AttachMoney, path: '/masraf', color: '#ef4444', bgColor: '#fef2f2' },
  {
    id: 'raporlama',
    label: 'Raporlama',
    icon: Assessment,
    color: '#14b8a6',
    bgColor: '#f0fdfa',
    subItems: [
      { id: 'raporlama-genel', label: 'Genel Özet', icon: Assessment, path: '/raporlama', color: '#14b8a6' },
      { id: 'raporlama-satis-elemanlari', label: 'Satış Elemanı Performansı', icon: People, path: '/raporlama/satis-elemani', color: '#8b5cf6' },
    ],
  },
  {
    id: 'veri-aktarim',
    label: 'Veri Aktarımı',
    icon: CloudUpload,
    color: '#334155',
    bgColor: '#f8fafc',
    subItems: [
      { id: 'veri-aktarim-cari-hesap', label: 'Cari Hesap Aktarımı', icon: People, path: '/veri-aktarim/cari-hesap-aktarim', color: '#8b5cf6' },
      { id: 'veri-aktarim-malzeme', label: 'Malzeme Aktarımı', icon: Inventory, path: '/veri-aktarim/malzeme-aktarim', color: '#06b6d4' },
      { id: 'veri-aktarim-satis-fiyat', label: 'Satış Fiyat Aktarımı', icon: AttachMoney, path: '/veri-aktarim/satis-fiyat-aktarim', color: '#ef4444' },
      { id: 'veri-aktarim-satin-alma-fiyat', label: 'Satın Alma Fiyat Aktarımı', icon: AttachMoney, path: '/veri-aktarim/satin-alma-fiyat-aktarim', color: '#0ea5e9' },
    ],
  },
  {
    id: 'ayarlar',
    label: 'Ayarlar',
    icon: Settings,
    color: '#6b7280',
    bgColor: '#f9fafb',
    subItems: [
      { id: 'ayarlar-hizli-menu', label: 'Hızlı Menü', icon: FlashOn, path: '/ayarlar/hizli-menu', color: '#f59e0b' },
      { id: 'ayarlar-satis-elemanlari', label: 'Satış Elemanları', icon: People, path: '/ayarlar/satis-elemanlari', color: '#8b5cf6' },
      { id: 'ayarlar-numara-sablonlari', label: 'Numara Şablonları', icon: Settings, path: '/ayarlar/numara-sablonlari', color: '#6b7280' },
      { id: 'ayarlar-parametreler', label: 'Parametreler', icon: Settings, path: '/ayarlar/parametreler', color: '#6b7280' },
      { id: 'ayarlar-firma', label: 'Firma Ayarları', icon: Settings, path: '/ayarlar/firma-ayarlari', color: '#6b7280' },
    ],
  },
  {
    id: 'yetkilendirme',
    label: 'Yetkilendirme',
    icon: AdminPanelSettings,
    color: '#ec4899',
    bgColor: '#fdf2f8',
    subItems: [
      { id: 'yetkilendirme-kullanicilar', label: 'Kullanıcılar', icon: People, path: '/yetkilendirme', color: '#ec4899' },
      { id: 'yetkilendirme-roller', label: 'Roller & İzinler', icon: AdminPanelSettings, path: '/yetkilendirme/roller', color: '#ec4899' },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  pinned: boolean;
  onClose: () => void;
  onTogglePin: () => void;
}

export default function Sidebar({ open, pinned, onClose, onTogglePin }: SidebarProps) {
  const { addTab, setActiveTab, activeTab } = useTabStore();
  const { user: authUser, clearAuth } = useAuthStore((state: any) => state) as any;
  const { items: quickMenuItems, fetchQuickMenuItems } = (useQuickMenuStore as any)();

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
      // If no search term, filter by adminOnly property
      return menuItems.filter(item => !(item as any).adminOnly || authUser?.isAdmin);
    }

    const searchLower = searchTerm.toLowerCase();
    // First, filter by adminOnly, then apply search filter
    const visibleMenuItems = menuItems.filter(item => !(item as any).adminOnly || authUser?.isAdmin);
    return visibleMenuItems.filter((item) => {
      if (item.label.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (item.subItems) {
        return item.subItems.some((subItem: any) => subItem.label.toLowerCase().includes(searchLower));
      }

      return false;
    });
  }, [searchTerm]);

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
              const IconComponent = (Icons as any)[item.icon];
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
                        <item.icon sx={{
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
                                      <subItem.icon sx={{
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
