'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Alert,
  Snackbar,
} from '@mui/material';
import { ArrowBack, Add, Delete, Save, CheckCircle } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  birim: string;
}

interface TransferItem {
  stokId: string;
  stok?: Stok;
  miktar: number;
  fromLocationId?: string;
  toLocationId?: string;
  availableStock?: number;
}

export default function YeniTransferFisiPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    tarih: new Date().toISOString().split('T')[0],
    fromWarehouseId: '',
    toWarehouseId: '',
    driverName: '',
    vehiclePlate: '',
    aciklama: '',
    kalemler: [] as TransferItem[],
  });

  useEffect(() => {
    fetchWarehouses();
    fetchStoklar();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/warehouse?active=true');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Ambar listesi alınamadı:', error);
    }
  };

  const fetchStoklar = async () => {
    try {
      const response = await axios.get('/stok', { params: { limit: 1000 } });
      setStoklar(response.data.data || []);
    } catch (error) {
      console.error('Stok listesi alınamadı:', error);
    }
  };

  const checkStock = async (warehouseId: string, stokId: string) => {
    try {
      const response = await axios.get(`/warehouse/${warehouseId}/inventory`);
      const stockItem = response.data.find((item: any) => item.id === stokId);
      return stockItem?.qtyOnHand || 0;
    } catch (error) {
      console.error('Stok kontrolü yapılamadı:', error);
      return 0;
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      kalemler: [...formData.kalemler, { stokId: '', miktar: 1 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newKalemler = formData.kalemler.filter((_, i) => i !== index);
    setFormData({ ...formData, kalemler: newKalemler });
  };

  const handleItemChange = async (index: number, field: string, value: any) => {
    const newKalemler = [...formData.kalemler];
    newKalemler[index] = { ...newKalemler[index], [field]: value };

    // Stok seçildiğinde mevcut stoğu kontrol et
    if (field === 'stokId' && value && formData.fromWarehouseId) {
      const availableStock = await checkStock(formData.fromWarehouseId, value);
      newKalemler[index].availableStock = availableStock;
      const stok = stoklar.find(s => s.id === value);
      newKalemler[index].stok = stok;
    }

    setFormData({ ...formData, kalemler: newKalemler });
  };

  const handleSubmit = async (approve: boolean = false) => {
    // Validasyon
    if (!formData.fromWarehouseId || !formData.toWarehouseId) {
      setSnackbar({ open: true, message: 'Lütfen kaynak ve hedef ambarı seçin', severity: 'error' });
      return;
    }

    if (formData.fromWarehouseId === formData.toWarehouseId) {
      setSnackbar({ open: true, message: 'Kaynak ve hedef ambar aynı olamaz', severity: 'error' });
      return;
    }

    if (formData.kalemler.length === 0) {
      setSnackbar({ open: true, message: 'En az bir ürün eklemelisiniz', severity: 'error' });
      return;
    }

    // Stok kontrolü
    for (const kalem of formData.kalemler) {
      if (!kalem.stokId || kalem.miktar <= 0) {
        setSnackbar({ open: true, message: 'Lütfen tüm ürün bilgilerini doldurun', severity: 'error' });
        return;
      }
      if (kalem.availableStock !== undefined && kalem.miktar > kalem.availableStock) {
        setSnackbar({ 
          open: true, 
          message: `${kalem.stok?.stokKodu} için yeterli stok yok. Mevcut: ${kalem.availableStock}`, 
          severity: 'error' 
        });
        return;
      }
    }

    try {
      setLoading(true);
      const response = await axios.post('/warehouse-transfer', formData);
      
      if (approve) {
        await axios.put(`/warehouse-transfer/${response.data.id}/approve`);
        setSnackbar({ open: true, message: 'Transfer fişi oluşturuldu ve onaylandı!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Transfer fişi oluşturuldu!', severity: 'success' });
      }
      
      setTimeout(() => router.push('/depo/transfer-fisi'), 1500);
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Transfer fişi oluşturulamadı', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
              Yeni Ambar Transfer Fişi
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
              Ambarlar arası malzeme transferi oluşturun
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ p: 3 }}>
          {/* Üst Bilgiler */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Transfer Bilgileri
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
            <TextField
              label="Tarih"
              type="date"
              value={formData.tarih}
              onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            
            <Box />

            <FormControl required>
              <InputLabel>Çıkış Ambarı</InputLabel>
              <Select
                value={formData.fromWarehouseId}
                onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value })}
                label="Çıkış Ambarı"
              >
                {warehouses.map((wh) => (
                  <MenuItem key={wh.id} value={wh.id}>
                    {wh.name} {wh.isDefault && '(Varsayılan)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl required>
              <InputLabel>Giriş Ambarı</InputLabel>
              <Select
                value={formData.toWarehouseId}
                onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
                label="Giriş Ambarı"
              >
                {warehouses.map((wh) => (
                  <MenuItem key={wh.id} value={wh.id}>
                    {wh.name} {wh.isDefault && '(Varsayılan)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Lojistik Bilgileri */}
          <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600 }}>
            Lojistik Bilgileri
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
            <TextField
              label="Sürücü Adı"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
            />
            
            <TextField
              label="Araç Plakası"
              value={formData.vehiclePlate}
              onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
            />

            <TextField
              label="Açıklama"
              value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              multiline
              rows={2}
              sx={{ gridColumn: 'span 2' }}
            />
          </Box>

          {/* Malzeme Listesi */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Transfer Edilecek Malzemeler
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddItem}
              disabled={!formData.fromWarehouseId}
            >
              Malzeme Ekle
            </Button>
          </Box>

          {!formData.fromWarehouseId && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Malzeme eklemek için önce çıkış ambarını seçin
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Malzeme</TableCell>
                  <TableCell width="150">Miktar</TableCell>
                  <TableCell width="150">Mevcut Stok</TableCell>
                  <TableCell width="80">İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.kalemler.map((kalem, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Autocomplete
                        options={stoklar}
                        getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                        value={stoklar.find(s => s.id === kalem.stokId) || null}
                        onChange={(_, value) => handleItemChange(index, 'stokId', value?.id || '')}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Malzeme seçin..." size="small" />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={kalem.miktar}
                        onChange={(e) => handleItemChange(index, 'miktar', parseInt(e.target.value) || 0)}
                        size="small"
                        inputProps={{ min: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: kalem.availableStock !== undefined && kalem.miktar > kalem.availableStock
                            ? '#ef4444'
                            : 'var(--foreground)',
                          fontWeight: 600,
                        }}
                      >
                        {kalem.availableStock !== undefined ? kalem.availableStock : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                        sx={{ color: '#ef4444' }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {formData.kalemler.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Henüz malzeme eklenmedi
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => router.back()}
            >
              İptal
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => handleSubmit(false)}
              disabled={loading}
            >
              Kaydet
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => handleSubmit(true)}
              disabled={loading}
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            >
              Kaydet ve Onayla
            </Button>
          </Box>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
