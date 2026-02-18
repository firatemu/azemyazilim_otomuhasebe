'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Grid,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warehouse as WarehouseIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  active: boolean;
  address?: string;
  phone?: string;
  manager?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  code: string;
  name: string;
  active: boolean;
  address: string;
  phone: string;
  manager: string;
}

const initialFormData: FormData = {
  code: '',
  name: '',
  active: true,
  address: '',
  phone: '',
  manager: '',
};

export default function DepoYonetimiPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/warehouse');
      setWarehouses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Depo listesi alınamadı:', error);
      setSnackbar({ open: true, message: 'Depo listesi alınamadı', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingId(warehouse.id);
      setFormData({
        code: warehouse.code,
        name: warehouse.name,
        active: warehouse.active,
        address: warehouse.address || '',
        phone: warehouse.phone || '',
        manager: warehouse.manager || '',
      });
    } else {
      setEditingId(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      setSnackbar({ open: true, message: 'Depo kodu ve adı zorunludur', severity: 'error' });
      return;
    }

    try {
      if (editingId) {
        await axios.patch(`/warehouse/${editingId}`, formData);
        setSnackbar({ open: true, message: 'Depo güncellendi', severity: 'success' });
      } else {
        await axios.post('/warehouse', formData);
        setSnackbar({ open: true, message: 'Depo oluşturuldu', severity: 'success' });
      }
      handleCloseDialog();
      fetchWarehouses();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'İşlem başarısız';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu depoyu silmek istediğinizden emin misiniz?')) return;

    try {
      await axios.delete(`/warehouse/${id}`);
      setSnackbar({ open: true, message: 'Depo silindi', severity: 'success' });
      fetchWarehouses();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Silme işlemi başarısız';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    }
  };

  const handleViewHierarchy = (warehouseId: string) => {
    router.push(`/depo/depolar/${warehouseId}`);
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
      {/* Başlık */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarehouseIcon sx={{ fontSize: 32 }} />
          Depo Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Depo
        </Button>
      </Box>

      {/* Depo Listesi */}
      {loading ? (
        <Typography>Yükleniyor...</Typography>
      ) : warehouses.length === 0 ? (
        <Alert severity="info">
          Henüz depo kaydı yok. Yeni depo oluşturmak için "Yeni Depo" butonuna tıklayın.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {warehouses.map((warehouse) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={warehouse.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarehouseIcon color="primary" />
                        {warehouse.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Kod: {warehouse.code}
                      </Typography>
                    </Box>
                    <Chip
                      label={warehouse.active ? 'Aktif' : 'Pasif'}
                      color={warehouse.active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  {warehouse.address && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      📍 {warehouse.address}
                    </Typography>
                  )}

                  {warehouse.phone && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      📞 {warehouse.phone}
                    </Typography>
                  )}

                  {warehouse.manager && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      👤 {warehouse.manager}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AccountTreeIcon />}
                      onClick={() => handleViewHierarchy(warehouse.id)}
                      fullWidth
                    >
                      Kat/Koridor Yönetimi
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(warehouse)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(warehouse.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Depo Oluştur/Düzenle Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Depo Düzenle' : 'Yeni Depo Oluştur'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Depo Kodu"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              fullWidth
              placeholder="Boş bırakılırsa otomatik oluşturulur"
              helperText="Boş bırakırsanız otomatik kod üretilir (örn: D001)"
            />

            <TextField
              label="Depo Adı"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              placeholder="örn: Ana Depo"
            />

            <TextField
              label="Adres"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Depo adresi"
            />

            <TextField
              label="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
              placeholder="örn: 0212 123 45 67"
            />

            <TextField
              label="Yetkili"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              fullWidth
              placeholder="Depo yetkilisi adı"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Aktif"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
    </MainLayout>
  );
}

