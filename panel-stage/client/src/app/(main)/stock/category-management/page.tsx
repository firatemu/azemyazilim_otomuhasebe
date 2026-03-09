'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Category, ExpandMore, Search } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface KategoriData {
  anaKategori: string;
  altKategoriler: string[];
}

interface AltKategoriDialogProps {
  open: boolean;
  anaKategori: string;
  onClose: () => void;
  onSave: (anaKategori: string, altKategori: string) => void;
}

// Alt Kategori Ekleme Dialog Component - Local State ile Ping Sorunu Çözümü
const AltKategoriDialog = React.memo(({
  open,
  anaKategori,
  onClose,
  onSave,
}: AltKategoriDialogProps) => {
  const [localAltKategori, setLocalAltKategori] = useState('');

  // Dialog açıldığında local state'i sıfırla
  React.useEffect(() => {
    if (open) {
      setLocalAltKategori('');
    }
  }, [open]);

  const handleLocalChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAltKategori(e.target.value);
  }, []);

  const handleLocalSave = React.useCallback(() => {
    if (localAltKategori.trim()) {
      onSave(anaKategori, localAltKategori.trim());
      setLocalAltKategori('');
    }
  }, [localAltKategori, anaKategori, onSave]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle component="div">
        {anaKategori} - Alt Kategori Ekle
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Ana Kategori"
            value={anaKategori}
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Alt Kategori Adı"
            value={localAltKategori}
            onChange={handleLocalChange}
            placeholder="Örn: Fren Balatası"
            required
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter' && localAltKategori.trim()) {
                handleLocalSave();
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button
          onClick={handleLocalSave}
          variant="contained"
          disabled={!localAltKategori.trim()}
          sx={{
            bgcolor: '#191970',
            '&:hover': { bgcolor: '#0f0f40' }
          }}
        >
          Ekle
        </Button>
      </DialogActions>
    </Dialog>
  );
});

AltKategoriDialog.displayName = 'AltKategoriDialog';

interface AnaKategoriDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (anaKategori: string) => void;
}

// Ana Kategori Ekleme Dialog Component - Local State ile Ping Sorunu Çözümü
const AnaKategoriDialog = React.memo(({
  open,
  onClose,
  onSave,
}: AnaKategoriDialogProps) => {
  const [localAnaKategori, setLocalAnaKategori] = useState('');

  // Dialog açıldığında local state'i sıfırla
  React.useEffect(() => {
    if (open) {
      setLocalAnaKategori('');
    }
  }, [open]);

  const handleLocalChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAnaKategori(e.target.value);
  }, []);

  const handleLocalSave = React.useCallback(() => {
    if (localAnaKategori.trim()) {
      onSave(localAnaKategori.trim());
      setLocalAnaKategori('');
    }
  }, [localAnaKategori, onSave]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle component="div">
        Yeni Ana Kategori Ekle
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Ana Kategori Adı"
            value={localAnaKategori}
            onChange={handleLocalChange}
            placeholder="Örn: Fren Sistemleri, Motor Parçaları"
            required
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter' && localAnaKategori.trim()) {
                handleLocalSave();
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button
          onClick={handleLocalSave}
          variant="contained"
          disabled={!localAnaKategori.trim()}
          sx={{
            bgcolor: '#191970',
            '&:hover': { bgcolor: '#0f0f40' }
          }}
        >
          Ekle
        </Button>
      </DialogActions>
    </Dialog>
  );
});

AnaKategoriDialog.displayName = 'AnaKategoriDialog';

export default function KategoriYonetimiPage() {
  const [kategoriler, setKategoriler] = useState<KategoriData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAltKategoriDialog, setOpenAltKategoriDialog] = useState(false);
  const [openAnaKategoriDialog, setOpenAnaKategoriDialog] = useState(false);
  const [selectedAnaKategori, setSelectedAnaKategori] = useState<string>('');
  const [deleting, setDeleting] = useState<{ anaKategori: string; altKategori: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedKategori, setExpandedKategori] = useState<string | false>(false);

  // Kategorileri backend'den yükle
  const fetchKategoriler = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[KategoriYonetimiPage] Kategoriler yükleniyor...');
      const response = await axios.get('/category');
      console.log('[KategoriYonetimiPage] API yanıtı:', response.data);
      const kategoriler = response.data || [];
      console.log('[KategoriYonetimiPage] Yüklenen kategori sayısı:', kategoriler.length);
      setKategoriler(kategoriler);
    } catch (error: any) {
      console.error('[KategoriYonetimiPage] Kategoriler yüklenemedi:', error);
      console.error('[KategoriYonetimiPage] Hata detayı:', error.response?.data);
      setError(error.response?.data?.message || 'Kategoriler yüklenirken bir hata oluştu');
      setKategoriler([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKategoriler();
  }, [fetchKategoriler]);

  // Ana kategori ekleme dialog'unu aç
  const handleOpenAnaKategoriDialog = useCallback(() => {
    setOpenAnaKategoriDialog(true);
  }, []);

  // Ana kategori ekleme dialog'unu kapat
  const handleCloseAnaKategoriDialog = useCallback(() => {
    setOpenAnaKategoriDialog(false);
  }, []);

  // Ana kategori kaydet
  const handleSaveAnaKategori = useCallback(async (anaKategori: string) => {
    try {
      await axios.post('/category/main-category', {
        anaKategori,
      });
      
      // Başarı mesajı
      alert(`✅ Ana kategori "${anaKategori}" başarıyla eklendi.`);
      
      // Listeyi yenile
      await fetchKategoriler();
      handleCloseAnaKategoriDialog();
    } catch (error: any) {
      console.error('Ana kategori eklenemedi:', error);
      alert(`❌ Hata: ${error.response?.data?.message || 'Ana kategori eklenirken bir hata oluştu'}`);
    }
  }, [fetchKategoriler, handleCloseAnaKategoriDialog]);

  // Alt kategori ekleme dialog'unu aç
  const handleOpenAltKategoriDialog = useCallback((anaKategori: string) => {
    setSelectedAnaKategori(anaKategori);
    setOpenAltKategoriDialog(true);
  }, []);

  // Alt kategori ekleme dialog'unu kapat
  const handleCloseAltKategoriDialog = useCallback(() => {
    setOpenAltKategoriDialog(false);
    setSelectedAnaKategori('');
  }, []);

  // Alt kategori kaydet
  const handleSaveAltKategori = useCallback(async (anaKategori: string, altKategori: string) => {
    try {
      const encodedAnaKategori = encodeURIComponent(anaKategori);
      await axios.post(`/kategori/${encodedAnaKategori}/alt-kategori`, {
        altKategori,
      });
      
      // Başarı mesajı
      alert(`✅ Alt kategori "${altKategori}" başarıyla eklendi.`);
      
      // Listeyi yenile
      await fetchKategoriler();
      handleCloseAltKategoriDialog();
    } catch (error: any) {
      console.error('Alt kategori eklenemedi:', error);
      alert(`❌ Hata: ${error.response?.data?.message || 'Alt kategori eklenirken bir hata oluştu'}`);
    }
  }, [fetchKategoriler, handleCloseAltKategoriDialog]);

  // Alt kategoriyi sil
  const handleDeleteAltKategori = useCallback(async (anaKategori: string, altKategori: string) => {
    const confirmMessage = `Bu alt kategoriyi silmek istediğinizden emin misiniz?\n\n` +
      `Alt kategori "${altKategori}" silindiğinde, bu kategoriyi kullanan tüm ürünlerden alt kategori bilgisi kaldırılacaktır.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting({ anaKategori, altKategori });
      const encodedAnaKategori = encodeURIComponent(anaKategori);
      const encodedAltKategori = encodeURIComponent(altKategori);
      await axios.delete(`/kategori/${encodedAnaKategori}/alt-kategori/${encodedAltKategori}`);
      
      // Başarı mesajı
      alert(`✅ Alt kategori "${altKategori}" başarıyla silindi.`);
      
      // Listeyi yenile
      await fetchKategoriler();
    } catch (error: any) {
      console.error('Alt kategori silinemedi:', error);
      alert(`❌ Hata: ${error.response?.data?.message || 'Alt kategori silinirken bir hata oluştu'}`);
    } finally {
      setDeleting(null);
    }
  }, [fetchKategoriler]);

  // Accordion açma/kapatma
  const handleAccordionChange = useCallback((kategori: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedKategori(isExpanded ? kategori : false);
  }, []);

  // Kategori filtreleme
  const filteredKategoriler = useMemo(() => {
    if (!searchQuery.trim()) {
      return kategoriler;
    }

    const query = searchQuery.toLowerCase().trim();
    return kategoriler.filter((kategori) => {
      // Ana kategori adında arama
      if (kategori.anaKategori.toLowerCase().includes(query)) {
        return true;
      }
      // Alt kategorilerde arama
      return kategori.altKategoriler.some((altKategori) =>
        altKategori.toLowerCase().includes(query)
      );
    }).map((kategori) => {
      // Eğer arama alt kategoride yapıldıysa, sadece eşleşen alt kategorileri göster
      if (kategori.anaKategori.toLowerCase().includes(query)) {
        return kategori;
      }
      // Sadece eşleşen alt kategorileri filtrele
      return {
        ...kategori,
        altKategoriler: kategori.altKategoriler.filter((altKategori) =>
          altKategori.toLowerCase().includes(query)
        ),
      };
    });
  }, [kategoriler, searchQuery]);

  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Kategori Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Ana kategoriler ve alt kategoriler oluşturun, düzenleyin. Kategoriler stoklardan otomatik olarak toplanır.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAnaKategoriDialog}
          sx={{
            bgcolor: '#191970',
            '&:hover': { bgcolor: '#0f0f40' }
          }}
        >
          Yeni Ana Kategori Ekle
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Kategori Arama */}
      {!loading && kategoriler.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Kategori ara... (Ana kategori veya alt kategori adı)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
              },
            }}
          />
          {searchQuery && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {filteredKategoriler.length} kategori bulundu
            </Typography>
          )}
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Kategoriler yükleniyor...
          </Typography>
        </Box>
      ) : kategoriler.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Henüz kategori eklenmemiş. Kategoriler, stok ekleme sayfasından eklenen ürünlerden otomatik olarak oluşur.
          </Typography>
        </Paper>
      ) : filteredKategoriler.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Arama kriterinize uygun kategori bulunamadı.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredKategoriler.map((kategori) => (
            <Grid size={{ xs: 12, md: 6 }} key={kategori.anaKategori}>
              <Accordion
                expanded={expandedKategori === kategori.anaKategori}
                onChange={handleAccordionChange(kategori.anaKategori)}
                sx={{
                  '&:before': {
                    display: 'none',
                  },
                  boxShadow: 2,
                  borderRadius: 2,
                  '&.Mui-expanded': {
                    margin: 0,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    bgcolor: 'var(--muted)',
                    borderRadius: expandedKategori === kategori.anaKategori ? '8px 8px 0 0' : '8px',
                    '&:hover': {
                      bgcolor: 'var(--muted)',
                    },
                    '&.Mui-expanded': {
                      bgcolor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)',
                      borderRadius: '8px 8px 0 0',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Category sx={{ color: '#06b6d4', mr: 1.5 }} />
                      <Typography variant="h6" fontWeight="600">
                        {kategori.anaKategori}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={`${kategori.altKategoriler.length} alt kategori`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Tooltip title="Alt Kategori Ekle">
                        <IconButton
                          component="span"
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAltKategoriDialog(kategori.anaKategori);
                          }}
                          sx={{
                            bgcolor: 'var(--card)',
                            '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)' }
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                          <TableCell><strong>Alt Kategori</strong></TableCell>
                          <TableCell align="right"><strong>İşlemler</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {kategori.altKategoriler.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Henüz alt kategori eklenmemiş
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => handleOpenAltKategoriDialog(kategori.anaKategori)}
                                sx={{ mt: 2 }}
                              >
                                Alt Kategori Ekle
                              </Button>
                            </TableCell>
                          </TableRow>
                        ) : (
                          kategori.altKategoriler.map((altKategori) => (
                            <TableRow 
                              key={altKategori} 
                              hover
                              sx={{
                                '&:hover': {
                                  bgcolor: 'var(--muted)',
                                },
                                '&:last-child td': {
                                  borderBottom: 'none',
                                },
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2">
                                  {altKategori}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteAltKategori(kategori.anaKategori, altKategori)}
                                  title="Sil"
                                  disabled={deleting?.anaKategori === kategori.anaKategori && deleting?.altKategori === altKategori}
                                >
                                  {deleting?.anaKategori === kategori.anaKategori && deleting?.altKategori === altKategori ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <Delete fontSize="small" />
                                  )}
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Ana Kategori Ekleme Dialog */}
      <AnaKategoriDialog
        open={openAnaKategoriDialog}
        onClose={handleCloseAnaKategoriDialog}
        onSave={handleSaveAnaKategori}
      />

      {/* Alt Kategori Ekleme Dialog */}
      <AltKategoriDialog
        open={openAltKategoriDialog}
        anaKategori={selectedAnaKategori}
        onClose={handleCloseAltKategoriDialog}
        onSave={handleSaveAltKategori}
      />
    </MainLayout>
  );
}

