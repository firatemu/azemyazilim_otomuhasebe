'use client';

import React, { useState, useEffect } from 'react';
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
  TextField,
  IconButton,
  Chip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Search,
  Link as LinkIcon,
  LinkOff,
  Delete,
  Add,
  ArrowBack,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import TableSkeleton from '@/components/Loading/TableSkeleton';
import { useRouter } from 'next/navigation';

interface Malzeme {
  id: string;
  stokKodu: string;
  stokAdi: string;
  barkod?: string;
  marka: string;
  birim: string;
  oem?: string;
  miktar?: number;
  esdegerGrupId?: string;
  eslesikUrunler?: string[];
  eslesikUrunDetaylari?: Array<{
    id: string;
    stokKodu: string;
    stokAdi: string;
    marka?: string;
    oem?: string;
  }>;
}

export default function UrunEslestirmePage() {
  const router = useRouter();
  const [stoklar, setStoklar] = useState<Malzeme[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [oemEslestirmeLoading, setOemEslestirmeLoading] = useState(false);

  // Eşleştirme dialog state
  const [eslesmeDialog, setEslesmeDialog] = useState(false);
  const [secilenUrun, setSecilenUrun] = useState<Malzeme | null>(null);
  const [eslestirilebilirUrunler, setEslestirilebilirUrunler] = useState<Malzeme[]>([]);
  const [secilenEslestirmeler, setSecilenEslestirmeler] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchStoklar();
  }, [debouncedSearch, page]);

  const fetchStoklar = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/stok', {
        params: {
          page,
          limit: 50,
          search: debouncedSearch || undefined,
        },
      });
      setStoklar(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Malzemeler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEslestirme = async (urun: Malzeme) => {
    setSecilenUrun(urun);
    setSecilenEslestirmeler(urun.eslesikUrunler || []);
    
    // Tüm ürünleri getir (eşleştirme için)
    try {
      const response = await axios.get('/stok', {
        params: { limit: 1000 },
      });
      // Seçilen ürünü ve zaten eşleştirilmiş ürünleri listeden çıkar
      const tumUrunler = response.data.data.filter((u: Malzeme) => u.id !== urun.id);
      setEslestirilebilirUrunler(tumUrunler);
      setEslesmeDialog(true);
    } catch (error: any) {
      showSnackbar('Ürünler yüklenirken hata oluştu', 'error');
    }
  };

  const handleSaveEslestirme = async () => {
    if (!secilenUrun) return;

    try {
      await axios.post('/stok/eslestir', {
        anaUrunId: secilenUrun.id,
        esUrunIds: secilenEslestirmeler,
      });
      
      showSnackbar('Eşleştirme başarıyla kaydedildi', 'success');
      setEslesmeDialog(false);
      fetchStoklar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Eşleştirme kaydedilirken hata oluştu', 'error');
    }
  };

  const handleRemoveEslestirme = async (urunId: string, eslesikUrunId: string) => {
    if (!confirm('Bu eşleştirmeyi kaldırmak istediğinizden emin misiniz?')) return;

    try {
      await axios.delete(`/stok/${urunId}/eslesme/${eslesikUrunId}`);
      showSnackbar('Eşleştirme kaldırıldı', 'success');
      fetchStoklar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Eşleştirme kaldırılırken hata oluştu', 'error');
    }
  };

  const handleOemIleEslestir = async () => {
    if (!confirm('Aynı OEM numarasına sahip tüm ürünler otomatik olarak eşleştirilecek. Devam etmek istiyor musunuz?')) {
      return;
    }

    try {
      setOemEslestirmeLoading(true);
      const response = await axios.post('/stok/eslestir-oem');
      showSnackbar(
        `OEM ile eşleştirme tamamlandı! ${response.data.toplamGrup} grup oluşturuldu, ${response.data.toplamEslestirilenUrun} ürün eşleştirildi.`,
        'success'
      );
      fetchStoklar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'OEM ile eşleştirme sırasında hata oluştu', 'error');
    } finally {
      setOemEslestirmeLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getEslesikUrunIsimler = (urun: Malzeme): string => {
    if (!urun.eslesikUrunler || urun.eslesikUrunler.length === 0) return '-';
    
    return urun.eslesikUrunler
      .map((id) => {
        const eslesikUrun = stoklar.find((s) => s.id === id);
        return eslesikUrun ? eslesikUrun.stokKodu : id;
      })
      .join(', ');
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="h5" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Ürün Eşleştirme
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Eşdeğer ürünleri birbirine bağlayın
            </Typography>
          </Box>
        </Box>

        {/* Bilgi Kartı */}
        <Card sx={{ mb: 3, bgcolor: '#f0f9ff', border: '1px solid #3b82f6' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <LinkIcon sx={{ color: '#3b82f6', mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="#1e40af" gutterBottom>
                  Ürün Eşleştirme Nedir?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Birbirine alternatif olabilecek ürünleri eşleştirerek stok yönetimini kolaylaştırın
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Eşleştirilen ürünler, satış ve sipariş işlemlerinde birbirinin yerine önerilebilir
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Bir ürün tükendiğinde sistem otomatik olarak eşdeğer ürünleri gösterir
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Arama ve OEM Eşleştirme */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Ürün ara (Stok Kodu, Stok Adı, Barkod, OEM)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleOemIleEslestir}
              disabled={oemEslestirmeLoading}
              startIcon={<LinkIcon />}
              sx={{ whiteSpace: 'nowrap', minWidth: '180px' }}
            >
              {oemEslestirmeLoading ? 'Eşleştiriliyor...' : 'OEM ile Eşleştir'}
            </Button>
          </Box>
        </Paper>

        {/* Tablo */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell>Stok Kodu</TableCell>
                <TableCell>Stok Adı</TableCell>
                <TableCell>Marka</TableCell>
                <TableCell>OEM</TableCell>
                <TableCell>Eşdeğer Ürünler</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : stoklar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Stok bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                stoklar.map((stok) => (
                  <TableRow key={stok.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {stok.stokKodu}
                      </Typography>
                    </TableCell>
                    <TableCell>{stok.stokAdi}</TableCell>
                    <TableCell>{stok.marka || '-'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {stok.oem || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {stok.eslesikUrunler && stok.eslesikUrunler.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(stok.eslesikUrunDetaylari && stok.eslesikUrunDetaylari.length > 0
                            ? stok.eslesikUrunDetaylari.map((eslesik) => (
                                <Chip
                                  key={eslesik.id}
                                  label={eslesik.stokKodu}
                                  size="small"
                                  onDelete={() => handleRemoveEslestirme(stok.id, eslesik.id)}
                                  deleteIcon={<LinkOff />}
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              ))
                            : stok.eslesikUrunler.map((eslesikId) => (
                                <Chip
                                  key={eslesikId}
                                  label={eslesikId}
                                  size="small"
                                  onDelete={() => handleRemoveEslestirme(stok.id, eslesikId)}
                                  deleteIcon={<LinkOff />}
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              )))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEslestirme(stok)}
                        title="Eşleştir"
                      >
                        <LinkIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
            <Button
              variant="outlined"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Önceki
            </Button>
            <Typography sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
              Sayfa {page} / {totalPages}
            </Typography>
            <Button
              variant="outlined"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Sonraki
            </Button>
          </Box>
        )}

        {/* Eşleştirme Dialog */}
        <Dialog open={eslesmeDialog} onClose={() => setEslesmeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography component="span" variant="h6">Ürün Eşleştirme</Typography>
          {secilenUrun && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {secilenUrun.stokKodu} - {secilenUrun.stokAdi}
            </Typography>
          )}
        </DialogTitle>
          <DialogContent>
            <Autocomplete
              multiple
              options={eslestirilebilirUrunler}
              getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
              value={eslestirilebilirUrunler.filter((u) => secilenEslestirmeler.includes(u.id))}
              onChange={(_, newValue) => {
                setSecilenEslestirmeler(newValue.map((u) => u.id));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Eşdeğer Ürünler"
                  placeholder="Ürün seçin..."
                  helperText="Bu ürünle eşdeğer olan ürünleri seçin"
                />
              )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={`${option.stokKodu} - ${option.stokAdi}`}
                    size="small"
                    {...tagProps}
                  />
                );
              })
            }
            />

            {secilenEslestirmeler.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Seçili Eşleştirmeler ({secilenEslestirmeler.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {secilenEslestirmeler.map((id) => {
                    const urun = eslestirilebilirUrunler.find((u) => u.id === id);
                    return urun ? (
                      <Paper key={id} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinkIcon color="primary" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="600">
                            {urun.stokKodu}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {urun.stokAdi}
                          </Typography>
                        </Box>
                        {urun.oem && (
                          <Chip
                            label={`OEM: ${urun.oem}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Paper>
                    ) : null;
                  })}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEslesmeDialog(false)}>İptal</Button>
            <Button
              variant="contained"
              onClick={handleSaveEslestirme}
              startIcon={<LinkIcon />}
            >
              Eşleştirmeyi Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
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

