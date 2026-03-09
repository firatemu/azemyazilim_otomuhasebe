'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Scale,
  Save,
  Cancel,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { GIB_BIRIM_KODLARI } from '@/constants/birim-codes';

interface Birim {
  id?: string;
  ad: string;
  kod?: string;
  cevrimKatsayisi: number;
  anaBirim: boolean;
}

interface BirimSeti {
  id: string;
  ad: string;
  aciklama?: string;
  birimler: Birim[];
}

export default function BirimSetleriPage() {
  const [birimSetleri, setBirimSetleri] = useState<BirimSeti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [editingBirimSeti, setEditingBirimSeti] = useState<BirimSeti | null>(null);

  const [formData, setFormData] = useState({
    ad: '',
    aciklama: '',
    birimler: [] as Birim[],
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const fetchBirimSetleri = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/unit-set');
      setBirimSetleri(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Birim setleri yüklenirken hata:', err);
      setError('Birim setleri yüklenemedi. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBirimSetleri();
  }, [fetchBirimSetleri]);

  const handleOpenDialog = (birimSeti?: BirimSeti) => {
    setValidationError(null);
    if (birimSeti) {
      setEditingBirimSeti(birimSeti);
      setFormData({
        ad: birimSeti.ad,
        aciklama: birimSeti.aciklama || '',
        birimler: [...birimSeti.birimler],
      });
    } else {
      setEditingBirimSeti(null);
      setFormData({
        ad: '',
        aciklama: '',
        birimler: [{ ad: '', kod: 'ADET', cevrimKatsayisi: 1, anaBirim: true }],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBirimSeti(null);
    setValidationError(null);
  };

  const handleAddBirimRow = () => {
    const newBirim: Birim = {
      ad: '',
      kod: '',
      cevrimKatsayisi: 1,
      anaBirim: false,
    };

    setFormData({
      ...formData,
      birimler: [...formData.birimler, newBirim],
    });
  };

  const handleRemoveBirimRow = (index: number) => {
    const removingIsAna = formData.birimler[index].anaBirim;

    const newBirimler = formData.birimler.filter((_, i) => i !== index);

    if (removingIsAna && newBirimler.length > 0) {
      newBirimler[0].anaBirim = true;
      newBirimler[0].cevrimKatsayisi = 1;
    }

    setFormData({ ...formData, birimler: newBirimler });
  };

  const handleBirimChange = (index: number, field: keyof Birim, value: any) => {
    const newBirimler = [...formData.birimler];
    newBirimler[index] = { ...newBirimler[index], [field]: value };

    if (field === 'anaBirim' && value === true) {
      newBirimler.forEach((b, i) => {
        if (i !== index) b.anaBirim = false;
      });
      newBirimler[index].cevrimKatsayisi = 1;
    }

    if (field === 'anaBirim' && value === false && newBirimler.some(b => b.anaBirim)) {
      const anaBirim = newBirimler.find(b => b.anaBirim);
      if (anaBirim && anaBirim !== newBirimler[index]) {
        anaBirim.cevrimKatsayisi = 1;
      }
    }

    setFormData({ ...formData, birimler: newBirimler });
  };

  const validateForm = (): boolean => {
    if (!formData.ad.trim()) {
      setValidationError('Birim seti adı zorunludur.');
      return false;
    }

    if (formData.birimler.length === 0) {
      setValidationError('En az bir birim tanımlanmalıdır.');
      return false;
    }

    const anaBirimSayisi = formData.birimler.filter(b => b.anaBirim).length;
    if (anaBirimSayisi !== 1) {
      setValidationError('Tam olarak bir ana birim seçilmelidir.');
      return false;
    }

    for (let i = 0; i < formData.birimler.length; i++) {
      const birim = formData.birimler[i];
      if (!birim.ad.trim()) {
        setValidationError(`Birim satır ${i + 1}: Birim adı zorunludur.`);
        return false;
      }
      if (!birim.kod) {
        setValidationError(`Birim satır ${i + 1}: GİB kodu zorunludur.`);
        return false;
      }
      if (birim.cevrimKatsayisi <= 0) {
        setValidationError(`Birim satır ${i + 1}: Çevrim katsayısı 0'dan büyük olmalıdır.`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingBirimSeti) {
        await axios.put(`/unit-set/${editingBirimSeti.id}`, formData);
        setSnackbar({
          open: true,
          message: 'Birim seti başarıyla güncellendi',
          severity: 'success',
        });
      } else {
        await axios.post('/unit-set', formData);
        setSnackbar({
          open: true,
          message: 'Yeni birim seti başarıyla oluşturuldu',
          severity: 'success',
        });
      }
      handleCloseDialog();
      fetchBirimSetleri();
    } catch (err: any) {
      console.error('Kaydetme hatası:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'İşlem başarısız oldu',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: string, ad: string) => {
    if (confirm(`"${ad}" birim setini silmek istediğinizden emin misiniz?`)) {
      try {
        await axios.delete(`/unit-set/${id}`);
        setSnackbar({
          open: true,
          message: 'Birim seti başarıyla silindi',
          severity: 'success',
        });
        fetchBirimSetleri();
      } catch (err: any) {
        console.error('Silme hatası:', err);
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Silme işlemi başarısız',
          severity: 'error',
        });
      }
    }
  };

  const anaBirim = formData.birimler.find(b => b.anaBirim);

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: 'var(--foreground)',
            letterSpacing: '-0.02em',
            mb: 1,
          }}
        >
          Birim Setleri
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ana birimleri ve alt birimlerini çevrim katsayıları ile tanımlayın
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            px: 3,
            py: 1.2,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            '&:hover': {
              bgcolor: 'var(--primary)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
            },
          }}
        >
          Yeni Birim Seti Ekle
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      ) : birimSetleri.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            border: '2px dashed var(--border)',
            borderRadius: 3,
            bgcolor: 'var(--card)',
          }}
        >
          <Scale sx={{ fontSize: 64, color: 'var(--muted-foreground)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'var(--foreground)', mb: 1 }}>
            Henüz birim seti tanımlanmamış
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            İlk birim setinizi oluşturmak için yukarıdaki butonu kullanın
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontWeight: 600,
            }}
          >
            İlk Birim Setini Oluştur
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {birimSetleri.map((birimSeti) => {
            const anaBirim = birimSeti.birimler.find((b) => b.anaBirim);
            const altBirimler = birimSeti.birimler.filter((b) => !b.anaBirim);

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={birimSeti.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    '&:hover': {
                      boxShadow: 'var(--shadow-md)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{
                            color: 'var(--foreground)',
                            mb: 0.5,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {birimSeti.ad}
                        </Typography>
                        {birimSeti.aciklama && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.875rem',
                              lineHeight: 1.4,
                            }}
                          >
                            {birimSeti.aciklama}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(birimSeti)}
                            sx={{
                              color: 'var(--muted-foreground)',
                              '&:hover': {
                                color: 'var(--primary)',
                                bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                              },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(birimSeti.id, birimSeti.ad)}
                            sx={{
                              color: 'var(--muted-foreground)',
                              '&:hover': {
                                color: 'var(--destructive)',
                                bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'var(--muted-foreground)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Ana Birim
                      </Typography>
                      <Chip
                        label={`${anaBirim?.ad || '-'} (${anaBirim?.kod || '-'})`}
                        size="small"
                        sx={{
                          mt: 0.5,
                          bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                          color: 'var(--primary)',
                          border: '1px solid var(--primary)',
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    {altBirimler.length > 0 && (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'var(--muted-foreground)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            mb: 1,
                            display: 'block',
                          }}
                        >
                          Alt Birimler ({altBirimler.length})
                        </Typography>
                        <Stack spacing={1}>
                          {altBirimler.map((alt, idx) => (
                            <Paper
                              key={idx}
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                bgcolor: 'var(--background)',
                                borderRadius: 1.5,
                                border: '1px solid var(--border)',
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'var(--foreground)',
                                  fontWeight: 600,
                                }}
                              >
                                1 {anaBirim?.ad} = <strong>{alt.cevrimKatsayisi}</strong>{' '}
                                {alt.ad}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'var(--muted-foreground)',
                                  display: 'block',
                                  mt: 0.25,
                                }}
                              >
                                Kod: {alt.kod}
                              </Typography>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Ekleme/Düzenleme Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'var(--card)',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            py: 2.5,
            px: 3,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {editingBirimSeti ? 'Birim Setini Düzenle' : 'Yeni Birim Seti Oluştur'}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Birim Seti Adı *"
                value={formData.ad}
                onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                placeholder="Örn: Uzunluk Birimleri, Ağırlık Birimleri"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Açıklama"
                value={formData.aciklama}
                onChange={(e) =>
                  setFormData({ ...formData, aciklama: e.target.value })
                }
                placeholder="Bu birim seti hakkında bilgi verin..."
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: 'var(--foreground)' }}
                >
                  Birimler
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={handleAddBirimRow}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                  }}
                >
                  Birim Ekle
                </Button>
              </Box>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  borderRadius: 1.5,
                  border: '1px solid var(--border)',
                  boxShadow: 'none',
                }}
              >
                <Table size="small">
                  <TableHead
                    sx={{
                      bgcolor: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)',
                    }}
                  >
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Birim Adı *</TableCell>
                      <TableCell>GİB Kodu *</TableCell>
                      <TableCell align="right">Katsayı *</TableCell>
                      <TableCell align="center">Ana Birim</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.birimler.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={row.ad}
                            onChange={(e) =>
                              handleBirimChange(index, 'ad', e.target.value)
                            }
                            placeholder="Örn: Metre, Kilogram"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={row.kod}
                            onChange={(e) =>
                              handleBirimChange(index, 'kod', e.target.value)
                            }
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                              },
                            }}
                          >
                            {GIB_BIRIM_KODLARI.map((c) => (
                              <MenuItem key={c.kod} value={c.kod}>
                                {c.kod} - {c.ad}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            fullWidth
                            value={row.cevrimKatsayisi}
                            onChange={(e) =>
                              handleBirimChange(
                                index,
                                'cevrimKatsayisi',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            inputProps={{ min: 0, step: 0.01 }}
                            disabled={row.anaBirim}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() =>
                              handleBirimChange(index, 'anaBirim', !row.anaBirim)
                            }
                            color={row.anaBirim ? 'primary' : 'default'}
                          >
                            {row.anaBirim ? (
                              <CheckCircle />
                            ) : (
                              <ErrorIcon sx={{ opacity: 0.3 }} />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Sil">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveBirimRow(index)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {anaBirim && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    bgcolor:
                      'color-mix(in srgb, var(--chart-2) 10%, transparent)',
                    borderRadius: 1.5,
                    border: '1px solid var(--chart-2)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--foreground)',
                      fontWeight: 600,
                    }}
                  >
                    💡 Tüm çevrimler ana birim{' '}
                    <strong>"{anaBirim.ad}"</strong> üzerinden
                    yapılacaktır.
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          {validationError && (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
              onClose={() => setValidationError(null)}
            >
              {validationError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: 'var(--background)' }}>
          <Button
            onClick={handleCloseDialog}
            startIcon={<Cancel />}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              px: 3,
            }}
          >
            Vazgeç
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<Save />}
            disabled={
              !formData.ad ||
              formData.birimler.length === 0 ||
              !formData.birimler.some((b) => b.anaBirim)
            }
            sx={{
              bgcolor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 1.5,
              textTransform: 'none',
              px: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              '&:hover': {
                bgcolor: 'var(--primary)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              },
            }}
          >
            {editingBirimSeti ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ minWidth: 300 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}