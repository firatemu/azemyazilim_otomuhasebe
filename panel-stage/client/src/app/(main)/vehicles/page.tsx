'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Grid,
  InputAdornment,
  Pagination,
  Autocomplete,
} from '@mui/material';
import { Add, Edit, Delete, Search, DirectionsCar } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';

interface Arac {
  id: string;
  marka: string;
  model: string;
  motorHacmi: string;
  yakitTipi: string;
  createdAt: string;
  updatedAt: string;
}

interface AracFormData {
  marka: string;
  model: string;
  motorHacmi: string;
  yakitTipi: string;
}

interface AracFormDialogProps {
  open: boolean;
  initialFormData: AracFormData;
  editingArac: Arac | null;
  markalar: string[];
  yakitTipleri: string[];
  onClose: () => void;
  onSubmit: (data: AracFormData) => void;
}

const AracFormDialog = React.memo(({
  open,
  initialFormData,
  editingArac,
  markalar,
  yakitTipleri,
  onClose,
  onSubmit,
}: AracFormDialogProps) => {
  const [localFormData, setLocalFormData] = useState<AracFormData>(initialFormData);

  useEffect(() => {
    setLocalFormData(initialFormData);
  }, [initialFormData, open]);

  const handleLocalChange = useCallback((field: keyof AracFormData, value: string) => {
    setLocalFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleLocalSubmit = useCallback(() => {
    onSubmit(localFormData);
  }, [localFormData, onSubmit]);

  // Motor hacmi seçenekleri
  const motorHacmiOptions = ['1.0L', '1.2L', '1.4L', '1.5L', '1.6L', '1.8L', '2.0L', '2.2L', '2.5L', '3.0L', '3.5L', '4.0L', '5.0L'];

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle component="div" sx={{ bgcolor: '#191970', color: 'white', fontSize: '1.25rem', py: 2 }} component="div">
        {editingArac ? '✏️ Araç Düzenle' : '➕ Yeni Araç Ekle'}
      </DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <Box sx={{ py: 1 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                freeSolo
                options={markalar}
                value={localFormData.marka || null}
                onInputChange={(event, newValue) => {
                  if (event.type === 'change') {
                    handleLocalChange('marka', newValue || '');
                  }
                }}
                onChange={(event, newValue) => {
                  handleLocalChange('marka', typeof newValue === 'string' ? newValue : newValue || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Marka *"
                    required
                    placeholder="Marka seçin veya yeni marka girin"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Model *"
                value={localFormData.model}
                onChange={(e) => handleLocalChange('model', e.target.value)}
                required
                placeholder="Örn: Corolla, Civic, 320i"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Motor Hacmi *</InputLabel>
                <Select
                  value={localFormData.motorHacmi}
                  label="Motor Hacmi *"
                  onChange={(e) => handleLocalChange('motorHacmi', e.target.value)}
                >
                  {motorHacmiOptions.map((hacim) => (
                    <MenuItem key={hacim} value={hacim}>
                      {hacim}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Yakıt Tipi *</InputLabel>
                <Select
                  value={localFormData.yakitTipi}
                  label="Yakıt Tipi *"
                  onChange={(e) => handleLocalChange('yakitTipi', e.target.value)}
                >
                  {yakitTipleri.map((yakit) => (
                    <MenuItem key={yakit} value={yakit}>
                      {yakit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>İptal</Button>
        <Button
          onClick={handleLocalSubmit}
          variant="contained"
          disabled={
            !localFormData.marka ||
            !localFormData.model ||
            !localFormData.motorHacmi ||
            !localFormData.yakitTipi
          }
          sx={{
            bgcolor: '#191970',
            '&:hover': { bgcolor: '#0f0f40' }
          }}
        >
          {editingArac ? 'Güncelle' : 'Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

AracFormDialog.displayName = 'AracFormDialog';

export default function AracPage() {
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingArac, setEditingArac] = useState<Arac | null>(null);
  const [initialFormData, setInitialFormData] = useState<AracFormData>({
    marka: '',
    model: '',
    motorHacmi: '',
    yakitTipi: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarka, setSelectedMarka] = useState<string>('');
  const [selectedYakitTipi, setSelectedYakitTipi] = useState<string>('');
  const [markalar, setMarkalar] = useState<string[]>([]);
  const [yakitTipleri, setYakitTipleri] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Markaları yükle
  const fetchMarkalar = useCallback(async () => {
    try {
      const response = await axios.get('/vehicles/brands');
      setMarkalar(response.data || []);
    } catch (error) {
      console.error('Markalar yüklenemedi:', error);
      setMarkalar([]);
    }
  }, []);

  // Yakıt tiplerini yükle
  const fetchYakitTipleri = useCallback(async () => {
    try {
      const response = await axios.get('/vehicles/fuel-types');
      setYakitTipleri(response.data || []);
    } catch (error) {
      console.error('Yakıt tipleri yüklenemedi:', error);
      setYakitTipleri([]);
    }
  }, []);

  // Araçları yükle
  const fetchAraclar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/vehicles', {
        params: {
          page,
          limit: 20,
          search: debouncedSearch || undefined,
          brand: selectedMarka || undefined,
          fuelType: selectedYakitTipi || undefined,
        },
      });
      const data = response.data.data || [];
      setAraclar(data);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      console.error('Araçlar yüklenemedi:', error);
      setError(error.response?.data?.message || 'Araçlar yüklenirken bir hata oluştu');
      setAraclar([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedMarka, selectedYakitTipi]);

  // Markalar ve yakıt tiplerini sadece bir kez yükle
  useEffect(() => {
    fetchMarkalar();
    fetchYakitTipleri();
  }, []);

  // Araçları filtre değiştiğinde yükle
  useEffect(() => {
    fetchAraclar();
  }, [fetchAraclar]);

  // Dialog açma
  const handleOpenDialog = useCallback((arac?: Arac) => {
    if (arac) {
      setEditingArac(arac);
      setInitialFormData({
        marka: arac.marka,
        model: arac.model,
        motorHacmi: arac.motorHacmi,
        yakitTipi: arac.yakitTipi,
      });
    } else {
      setEditingArac(null);
      setInitialFormData({
        marka: '',
        model: '',
        motorHacmi: '',
        yakitTipi: '',
      });
    }
    setOpenDialog(true);
  }, []);

  // Dialog kapatma
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingArac(null);
  }, []);

  // Form gönderme
  const handleSubmit = useCallback(async (formData: AracFormData) => {
    try {
      if (editingArac) {
        await axios.patch(`/vehicles/${editingArac.id}`, formData);
        alert('✅ Araç başarıyla güncellendi');
      } else {
        await axios.post('/vehicles', formData);
        alert('✅ Araç başarıyla eklendi');
      }
      await fetchAraclar();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Araç kaydedilemedi:', error);
      alert(`❌ Hata: ${error.response?.data?.message || 'Araç kaydedilirken bir hata oluştu'}`);
    }
  }, [editingArac, fetchAraclar, handleCloseDialog]);

  // Silme
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setDeleting(id);
      await axios.delete(`/vehicles/${id}`);
      alert('✅ Araç başarıyla silindi');
      await fetchAraclar();
    } catch (error: any) {
      console.error('Araç silinemedi:', error);
      alert(`❌ Hata: ${error.response?.data?.message || 'Araç silinirken bir hata oluştu'}`);
    } finally {
      setDeleting(null);
    }
  }, [fetchAraclar]);

  // Sayfa değiştirme
  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }, []);

  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Araç Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Araç markaları, modelleri ve özelliklerini görüntüleyin ve yönetin.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#191970',
            '&:hover': { bgcolor: '#0f0f40' }
          }}
        >
          Yeni Araç Ekle
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* İstatistikler */}
      <Paper sx={{ mb: 2, p: 2, bgcolor: '#f0f4ff' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold" color="#191970">
                {total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Araç
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold" color="#06b6d4">
                {markalar.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Marka Sayısı
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold" color="#10b981">
                {yakitTipleri.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yakıt Tipi
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filtreler */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Araç ara... (Marka, Model, Motor Hacmi, Yakıt Tipi)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Marka Filtresi</InputLabel>
              <Select
                value={selectedMarka}
                label="Marka Filtresi"
                onChange={(e) => {
                  setSelectedMarka(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Tüm Markalar</MenuItem>
                {markalar.map((marka) => (
                  <MenuItem key={marka} value={marka}>
                    {marka}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Yakıt Tipi Filtresi</InputLabel>
              <Select
                value={selectedYakitTipi}
                label="Yakıt Tipi Filtresi"
                onChange={(e) => {
                  setSelectedYakitTipi(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Tüm Yakıt Tipleri</MenuItem>
                {yakitTipleri.map((yakit) => (
                  <MenuItem key={yakit} value={yakit}>
                    {yakit}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Araç Listesi */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'var(--muted)' }}>
            <TableRow>
              <TableCell><strong>Marka</strong></TableCell>
              <TableCell><strong>Model</strong></TableCell>
              <TableCell><strong>Motor Hacmi</strong></TableCell>
              <TableCell><strong>Yakıt Tipi</strong></TableCell>
              <TableCell align="center"><strong>İşlemler</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Araçlar yükleniyor...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : araclar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {searchQuery || selectedMarka || selectedYakitTipi
                      ? 'Arama kriterinize uygun araç bulunamadı'
                      : 'Henüz araç eklenmemiş'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              araclar.map((arac) => (
                <TableRow key={arac.id} hover sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCar sx={{ color: '#191970', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight="600" color="#191970">
                        {arac.marka}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {arac.model}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={arac.motorHacmi}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={arac.yakitTipi}
                      size="small"
                      color={
                        arac.yakitTipi === 'Benzin'
                          ? 'error'
                          : arac.yakitTipi === 'Dizel'
                          ? 'warning'
                          : 'success'
                      }
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Düzenle">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(arac)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(arac.id)}
                          disabled={deleting === arac.id}
                        >
                          {deleting === arac.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Delete fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Araç Ekleme/Düzenleme Dialog */}
      <AracFormDialog
        open={openDialog}
        initialFormData={initialFormData}
        editingArac={editingArac}
        markalar={markalar}
        yakitTipleri={yakitTipleri}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />
    </MainLayout>
  );
}

