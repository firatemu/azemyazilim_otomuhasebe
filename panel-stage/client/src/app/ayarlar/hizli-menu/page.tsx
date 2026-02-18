'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Alert,
  Snackbar,
  Stack,
  Breadcrumbs,
  Link,
  Chip,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Save,
  Restore,
  FlashOn,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import { useQuickMenuStore, QuickMenuItem } from '@/stores/quickMenuStore';
import QuickMenuEditor from '@/components/QuickMenu/QuickMenuEditor';
import QuickMenuItemCard from '@/components/QuickMenu/QuickMenuItemCard';

// Menu yapısından tüm sayfaları al
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'stok-malzeme-listesi', label: 'Malzeme Listesi', path: '/stok/malzeme-listesi' },
  { id: 'stok-malzeme-hareketleri', label: 'Malzeme Hareketleri', path: '/stok/malzeme-hareketleri' },
  { id: 'cari-liste', label: 'Cari Listesi', path: '/cari' },
  { id: 'fatura-satis', label: 'Satış Faturaları', path: '/fatura/satis' },
  { id: 'fatura-alis', label: 'Satın Alma Faturaları', path: '/fatura/alis' },
  { id: 'teklif-satis', label: 'Satış Teklifleri', path: '/teklif/satis' },
  { id: 'siparis-satis', label: 'Satış Siparişleri', path: '/siparis/satis' },
  { id: 'satis-irsaliyesi', label: 'Satış İrsaliyeleri', path: '/satis-irsaliyesi' },
  { id: 'satin-alma-irsaliyesi', label: 'Satın Alma İrsaliyeleri', path: '/satin-alma-irsaliyesi' },
  { id: 'tahsilat', label: 'Tahsilat & Ödeme', path: '/tahsilat' },
  { id: 'kasa', label: 'Kasa', path: '/kasa' },
  { id: 'bankalar', label: 'Bankalar', path: '/banka' },
  { id: 'ik-personel', label: 'Personel Listesi', path: '/ik/personel' },
  { id: 'depo-depolar', label: 'Depo Yönetimi', path: '/depo/depolar' },
  { id: 'masraf', label: 'Masraf', path: '/masraf' },
  { id: 'raporlama-genel', label: 'Genel Raporlama', path: '/raporlama' },
];

export default function HizliMenuPage() {
  const router = useRouter();
  const {
    items,
    addQuickMenuItem,
    updateQuickMenuItem,
    deleteQuickMenuItem,
    reorderQuickMenuItems,
    resetToDefaults,
    fetchQuickMenuItems,
  } = useQuickMenuStore();

  useEffect(() => {
    fetchQuickMenuItems();
  }, [fetchQuickMenuItems]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editItem, setEditItem] = useState<QuickMenuItem | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [draggedItem, setDraggedItem] = useState<QuickMenuItem | null>(null);

  const enabledItems = items.filter((item) => item.enabled).sort((a, b) => a.order - b.order);
  const disabledItems = items.filter((item) => !item.enabled).sort((a, b) => a.order - b.order);

  const handleAddNew = () => {
    setEditItem(null);
    setEditorOpen(true);
  };

  const handleEdit = (item: QuickMenuItem) => {
    setEditItem(item);
    setEditorOpen(true);
  };

  const handleSave = (itemData: Omit<QuickMenuItem, 'id' | 'order'>) => {
    if (editItem) {
      updateQuickMenuItem(editItem.id, itemData);
      showSnackbar('Hızlı menü öğesi güncellendi', 'success');
    } else {
      addQuickMenuItem(itemData);
      showSnackbar('Yeni hızlı menü öğesi eklendi', 'success');
    }
  };

  const handleDelete = (id: string) => {
    deleteQuickMenuItem(id);
    showSnackbar('Hızlı menü öğesi silindi', 'success');
  };

  const handleToggleEnabled = (id: string, enabled: boolean) => {
    updateQuickMenuItem(id, { enabled });
    showSnackbar(
      enabled ? 'Hızlı menü öğesi aktifleştirildi' : 'Hızlı menü öğesi pasifleştirildi',
      'success'
    );
  };

  const handleReset = () => {
    if (window.confirm('Tüm hızlı menü öğelerini varsayılanlara sıfırlamak istediğinizden emin misiniz?')) {
      resetToDefaults();
      showSnackbar('Hızlı menü varsayılanlara sıfırlandı', 'success');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDragStart = (item: QuickMenuItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, targetItem: QuickMenuItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const newItems = [...items];
    const draggedIndex = newItems.findIndex((i) => i.id === draggedItem.id);
    const targetIndex = newItems.findIndex((i) => i.id === targetItem.id);

    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    reorderQuickMenuItems(newItems);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              component="button"
              variant="body1"
              onClick={() => router.push('/dashboard')}
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              Dashboard
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => router.push('/ayarlar')}
              underline="hover"
            >
              Ayarlar
            </Link>
            <Typography variant="body1" color="text.primary">
              Hızlı Menü
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FlashOn sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>
                  Hızlı Menü Ayarları
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sidebar ve Dashboard'da görünen hızlı işlem menülerini özelleştirin
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Restore />}
                onClick={handleReset}
                sx={{ textTransform: 'none' }}
              >
                Varsayılanlara Dön
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddNew}
                sx={{ textTransform: 'none' }}
              >
                Yeni Hızlı Menü
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Hızlı menü öğelerini sürükleyerek sıralayabilirsiniz. Sadece aktif olan öğeler sidebar'da görünür.
          </Typography>
        </Alert>

        {/* Enabled Items */}
        {enabledItems.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Aktif Hızlı Menüler
              </Typography>
              <Chip label={`${enabledItems.length} öğe`} size="small" color="success" />
            </Box>

            <Paper sx={{ p: 2 }}>
              {enabledItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  onDragOver={(e) => handleDragOver(e, item)}
                  onDragEnd={handleDragEnd}
                >
                  <QuickMenuItemCard
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleEnabled={handleToggleEnabled}
                  />
                </div>
              ))}
            </Paper>
          </Box>
        )}

        {/* Disabled Items */}
        {disabledItems.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Pasif Hızlı Menüler
              </Typography>
              <Chip label={`${disabledItems.length} öğe`} size="small" color="default" />
            </Box>

            <Paper sx={{ p: 2 }}>
              {disabledItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  onDragOver={(e) => handleDragOver(e, item)}
                  onDragEnd={handleDragEnd}
                >
                  <QuickMenuItemCard
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleEnabled={handleToggleEnabled}
                  />
                </div>
              ))}
            </Paper>
          </Box>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <FlashOn sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Henüz hızlı menü öğesi yok
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Hızlı erişim istediğiniz sayfaları eklemek için butona tıklayın
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddNew}
              sx={{ textTransform: 'none' }}
            >
              İlk Hızlı Menüyü Ekle
            </Button>
          </Paper>
        )}

        {/* Editor Dialog */}
        <QuickMenuEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          onSave={handleSave}
          editItem={editItem}
          availablePaths={menuItems}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
