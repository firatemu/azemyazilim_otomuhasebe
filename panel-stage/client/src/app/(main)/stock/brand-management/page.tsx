'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Marka {
  markaAdi: string;
  urunSayisi: number;
}

export default function MarkaYonetimiPage() {
  const [markalar, setMarkalar] = useState<Marka[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingMarka, setEditingMarka] = useState<Marka | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [yeniMarkaAdi, setYeniMarkaAdi] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Yeni marka ekleme state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [yeniMarkaInput, setYeniMarkaInput] = useState('');
  const [creating, setCreating] = useState(false);

  // Markaları backend'den yükle
  const fetchMarkalar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[MarkaYonetimiPage] Markalar yükleniyor...');
      const response = await axios.get('/brand');
      console.log('[MarkaYonetimiPage] API yanıtı:', response.data);
      const markalar = response.data || [];
      console.log('[MarkaYonetimiPage] Yüklenen marka sayısı:', markalar.length);
      setMarkalar(markalar);
    } catch (error: any) {
      console.error('[MarkaYonetimiPage] Markalar yüklenemedi:', error);
      console.error('[MarkaYonetimiPage] Hata detayı:', error.response?.data);
      setError(error.response?.data?.message || 'Markalar yüklenirken bir hata oluştu');
      setMarkalar([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkalar();
  }, [fetchMarkalar]);

  const handleDelete = async (markaAdi: string) => {
    const marka = markalar.find(m => m.markaAdi === markaAdi);
    if (!marka) {
      return;
    }

    // Eğer markaya ait ürün varsa, silme yapılamaz
    if (marka.urunSayisi > 0) {
      alert(`❌ Bu markaya ait ${marka.urunSayisi} ürün bulunmaktadır.\n\nÜrünü olan markalar silinemez. Önce ürünlerden markayı kaldırmanız veya ürünleri silmeniz gerekmektedir.`);
      return;
    }

    // Ürünü olmayan markalar için onay iste
    if (!confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setDeleting(markaAdi);
      // URL encoding kullan
      const encodedMarkaAdi = encodeURIComponent(markaAdi);
      await axios.delete(`/marka/${encodedMarkaAdi}`);
      
      // Başarı mesajı
      alert(`✅ Marka "${markaAdi}" başarıyla silindi.`);
      
      // Listeyi yenile
      await fetchMarkalar();
    } catch (error: any) {
      console.error('Marka silinemedi:', error);
      const errorMessage = error.response?.data?.message || 'Marka silinirken bir hata oluştu';
      alert(`❌ Hata: ${errorMessage}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenEditDialog = (marka: Marka) => {
    setEditingMarka(marka);
    setYeniMarkaAdi(marka.markaAdi);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingMarka(null);
    setYeniMarkaAdi('');
  };

  const handleCreateMarka = async () => {
    if (!yeniMarkaInput.trim()) {
      return;
    }

    // Bu marka zaten var mı kontrol et
    const existingMarka = markalar.find(
      (m) => m.markaAdi.toLowerCase() === yeniMarkaInput.trim().toLowerCase()
    );

    if (existingMarka) {
      alert(`❌ Marka "${yeniMarkaInput.trim()}" zaten mevcut`);
      return;
    }

    try {
      setCreating(true);
      await axios.post('/brand', {
        markaAdi: yeniMarkaInput.trim(),
      });

      // Listeyi yenile
      await fetchMarkalar();
      setAddDialogOpen(false);
      setYeniMarkaInput('');
    } catch (error: any) {
      console.error('Marka eklenemedi:', error);
      const errorMessage = error.response?.data?.message || 'Marka eklenirken bir hata oluştu';
      alert(`❌ Hata: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateMarka = async () => {
    if (!editingMarka || !yeniMarkaAdi.trim()) {
      return;
    }

    // Eğer yeni marka adı aynıysa, hata göster
    if (yeniMarkaAdi.trim() === editingMarka.markaAdi) {
      alert('Yeni marka adı mevcut marka adı ile aynı olamaz');
      return;
    }

    try {
      setUpdating(true);
      const encodedMarkaAdi = encodeURIComponent(editingMarka.markaAdi);
      await axios.put(`/marka/${encodedMarkaAdi}`, {
        yeniMarkaAdi: yeniMarkaAdi.trim(),
      });

      alert(`✅ Marka "${editingMarka.markaAdi}" başarıyla "${yeniMarkaAdi.trim()}" olarak güncellendi.`);
      
      // Listeyi yenile
      await fetchMarkalar();
      handleCloseEditDialog();
    } catch (error: any) {
      console.error('Marka güncellenemedi:', error);
      const errorMessage = error.response?.data?.message || 'Marka güncellenirken bir hata oluştu';
      alert(`❌ Hata: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  const getMarkaInitials = (markaAdi: string) => {
    return markaAdi
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Marka Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sistemdeki markaları görüntüleyin ve yönetin.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setYeniMarkaInput('');
            setAddDialogOpen(true);
          }}
          sx={{
            bgcolor: '#191970',
            '&:hover': { bgcolor: '#0f0f40' }
          }}
        >
          Yeni Marka Ekle
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2, bgcolor: 'color-mix(in srgb, var(--secondary) 15%, transparent)' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold" color="#191970">
                {markalar.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Marka
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold" color="#06b6d4">
                {markalar.reduce((sum, m) => sum + (m.urunSayisi || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Ürün
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'var(--muted)' }}>
            <TableRow>
              <TableCell width="60"></TableCell>
              <TableCell><strong>Marka Adı</strong></TableCell>
              <TableCell align="center"><strong>Ürün Sayısı</strong></TableCell>
              <TableCell align="center"><strong>İşlemler</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Markalar yükleniyor...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : markalar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    Henüz marka eklenmemiş
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              markalar.map((marka) => (
                <TableRow key={marka.markaAdi} hover sx={{ '&:hover': { bgcolor: 'var(--muted)' } }}>
                  <TableCell>
                    <Avatar
                      sx={{
                        bgcolor: '#191970',
                        width: 40,
                        height: 40,
                        fontSize: '0.875rem',
                      }}
                    >
                      {getMarkaInitials(marka.markaAdi)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" color="#191970">
                      {marka.markaAdi}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={marka.urunSayisi || 0}
                      size="small"
                      color={marka.urunSayisi && marka.urunSayisi > 0 ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Markayı Düzenle">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(marka)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip 
                        title={
                          marka.urunSayisi > 0 
                            ? `Bu markaya ait ${marka.urunSayisi} ürün bulunmaktadır. Ürünü olan markalar silinemez.`
                            : 'Markayı Sil'
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(marka.markaAdi)}
                            disabled={deleting === marka.markaAdi || marka.urunSayisi > 0}
                          >
                            {deleting === marka.markaAdi ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Delete fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Marka Düzenleme Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle component="div">
          Marka Düzenle
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Mevcut Marka Adı"
              value={editingMarka?.markaAdi || ''}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Yeni Marka Adı"
              value={yeniMarkaAdi}
              onChange={(e) => setYeniMarkaAdi(e.target.value)}
              placeholder="Yeni marka adını girin"
              required
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && yeniMarkaAdi.trim() && !updating) {
                  handleUpdateMarka();
                }
              }}
            />
            {editingMarka && editingMarka.urunSayisi > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Bu markaya ait {editingMarka.urunSayisi} ürün bulunmaktadır. Marka adı değiştirildiğinde, bu {editingMarka.urunSayisi} üründeki marka adı da güncellenecektir.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={updating}>
            İptal
          </Button>
          <Button
            onClick={handleUpdateMarka}
            variant="contained"
            disabled={!yeniMarkaAdi.trim() || yeniMarkaAdi.trim() === editingMarka?.markaAdi || updating}
            sx={{
              bgcolor: '#191970',
              '&:hover': { bgcolor: '#0f0f40' }
            }}
          >
            {updating ? <CircularProgress size={20} /> : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Yeni Marka Ekleme Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle component="div">
          Yeni Marka Ekle
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Marka Adı"
              value={yeniMarkaInput}
              onChange={(e) => setYeniMarkaInput(e.target.value)}
              placeholder="Örn: Bosch, Valeo, Brembo"
              required
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && yeniMarkaInput.trim() && !creating) {
                  handleCreateMarka();
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Bu marka, stok eklerken kullanabileceğiniz markalar listesine eklenecektir.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setAddDialogOpen(false);
              setYeniMarkaInput('');
            }} 
            disabled={creating}
          >
            İptal
          </Button>
          <Button
            onClick={handleCreateMarka}
            variant="contained"
            disabled={!yeniMarkaInput.trim() || creating}
            sx={{
              bgcolor: '#191970',
              '&:hover': { bgcolor: '#0f0f40' }
            }}
          >
            {creating ? <CircularProgress size={20} /> : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

    </MainLayout>
  );
}

