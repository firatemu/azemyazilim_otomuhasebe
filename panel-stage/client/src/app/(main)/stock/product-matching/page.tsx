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
  Tabs,
  Tab,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search,
  Link as LinkIcon,
  LinkOff,
  Delete,
  Add,
  ArrowBack,
  CheckCircleOutline,
  HighlightOff,
  InfoOutlined,
  FilterList,
  FileDownload,
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
  const [activeTab, setActiveTab] = useState(0); // 0: Tümü, 1: Eşleşenler, 2: Eşleşmeyenler

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
      const response = await axios.get('/product', {
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
      const response = await axios.get('/product', {
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
      await axios.post('/product/eslestir', {
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
      const response = await axios.post('/product/eslestir-oem');
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

  // Filtreleme mantığı
  const filteredStoklar = stoklar.filter((stok) => {
    const isMatched = stok.eslesikUrunler && stok.eslesikUrunler.length > 0;
    if (activeTab === 1) return isMatched;
    if (activeTab === 2) return !isMatched;
    return true;
  });

  return (
    <MainLayout>
      <Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => router.back()} sx={{ mr: 2, bgcolor: 'background.paper', border: '1px solid var(--border)' }}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight="800" sx={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--chart-1) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}>
                Ürün Eşleştirme Yönetimi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Alternatif ürünleri bağlayın ve stok yönetimini optimize edin
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={async () => {
                try {
                  const response = await axios.get('/product/export/eslesme', {
                    responseType: 'blob',
                  });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'urun-eslesmeleri.xlsx');
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } catch (error) {
                  showSnackbar('Excel indirilirken hata oluştu', 'error');
                }
              }}
              startIcon={<FileDownload />}
              sx={{
                whiteSpace: 'nowrap',
                bgcolor: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'text.primary',
                '&:hover': { bgcolor: 'var(--muted)' },
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Excel İndir
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleOemIleEslestir}
              disabled={oemEslestirmeLoading}
              startIcon={<LinkIcon />}
              sx={{
                whiteSpace: 'nowrap',
                minWidth: '180px',
                bgcolor: 'var(--primary)',
                '&:hover': { bgcolor: 'var(--primary-dark)' },
                boxShadow: 'var(--shadow-md)',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {oemEslestirmeLoading ? 'İşleniyor...' : 'Otomatik OEM Eşleştir'}
            </Button>
          </Box>
        </Box>

        {/* Info Card - Minimal */}
        <Card sx={{ mb: 3, bgcolor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', boxShadow: 'none' }}>
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <InfoOutlined color="primary" />
              <Typography variant="body2" color="text.primary">
                Eşleştirilen ürünler, satış ve sipariş işlemlerinde birbirinin yerine önerilir. Stok tükendiğinde sistem otomatik olarak bu eşdeğerleri sunar.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Filters & Search */}
        <Paper sx={{ mb: 3, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: 'var(--muted)' }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              textColor="primary"
              indicatorColor="primary"
              sx={{ minHeight: '48px' }}
            >
              <Tab label="Tüm Ürünler" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Eşleşenler" icon={<Badge color="success" variant="dot" invisible={activeTab !== 1}><span /></Badge>} iconPosition="end" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Eşleşmeyenler" sx={{ textTransform: 'none', fontWeight: 600 }} />
            </Tabs>
          </Box>

          <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ürün Ara (Kod, Ad, Barkod, OEM)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 'var(--radius-md)' }
              }}
            />
          </Box>
        </Paper>

        {/* Main Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'var(--muted)' }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', width: '15%' }}>Stok Kodu</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', width: '20%' }}>Stok Adı</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', width: '10%' }}>Marka</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', width: '10%' }}>OEM</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', width: '15%' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', width: '20%' }}>Eşdeğer Ürünler</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary', width: '10%' }}>İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={8} columns={7} />
              ) : filteredStoklar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" color="text.secondary">Kriterlere uygun ürün bulunamadı</Typography>
                      <Typography variant="body2" color="text.disabled">Arama terimini değiştirmeyi veya filtreleri temizlemeyi deneyin.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStoklar.map((stok) => {
                  const isMatched = stok.eslesikUrunler && stok.eslesikUrunler.length > 0;

                  return (
                    <TableRow key={stok.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="700" color="primary">
                          {stok.stokKodu}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap title={stok.stokAdi}>
                          {stok.stokAdi}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={stok.marka || '-'} size="small" variant="outlined" sx={{ borderRadius: '4px', bgcolor: 'var(--background)' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                          {stok.oem || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {isMatched ? (
                          <Chip
                            icon={<CheckCircleOutline style={{ color: '#10b981' }} />}
                            label="Eşleşti"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(16, 185, 129, 0.1)',
                              color: '#059669',
                              fontWeight: 700,
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              borderRadius: '6px'
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<HighlightOff style={{ color: '#9ca3af' }} />}
                            label="Eşleşme Yok"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(243, 244, 246, 0.5)',
                              color: '#6b7280',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px'
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {isMatched ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {stok.eslesikUrunler?.map((eslesikId) => {
                              // Backend'den gelen detayları kullan, yoksa listeden bul
                              const detay = stok.eslesikUrunDetaylari?.find(d => d.id === eslesikId) ||
                                stoklar.find(s => s.id === eslesikId);

                              const label = detay ? detay.stokKodu : eslesikId.substring(0, 8);
                              const title = detay ? `${detay.stokKodu} - ${detay.stokAdi}` : 'Detay yükleniyor...';

                              return (
                                <Tooltip key={eslesikId} title={title} arrow placement="top">
                                  <Chip
                                    label={label}
                                    size="small"
                                    onDelete={() => handleRemoveEslestirme(stok.id, eslesikId)}
                                    deleteIcon={<LinkOff sx={{ fontSize: '14px !important' }} />}
                                    sx={{
                                      fontSize: '0.75rem',
                                      height: '24px',
                                      bgcolor: 'var(--background)',
                                      border: '1px solid var(--border)',
                                      '&:hover': { bgcolor: 'var(--muted)' }
                                    }}
                                  />
                                </Tooltip>
                              );
                            })}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant={isMatched ? "text" : "outlined"}
                          color="primary"
                          onClick={() => handleOpenEslestirme(stok)}
                          startIcon={<LinkIcon />}
                          sx={{ textTransform: 'none', borderRadius: '6px' }}
                        >
                          {isMatched ? 'Düzenle' : 'Eşleştir'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
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
              sx={{ textTransform: 'none' }}
            >
              Önceki
            </Button>
            <Typography sx={{ mx: 2, display: 'flex', alignItems: 'center', fontWeight: 600, color: 'text.secondary' }}>
              Sayfa {page} / {totalPages}
            </Typography>
            <Button
              variant="outlined"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              sx={{ textTransform: 'none' }}
            >
              Sonraki
            </Button>
          </Box>
        )}

        {/* Eşleştirme Dialog */}
        <Dialog
          open={eslesmeDialog}
          onClose={() => setEslesmeDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 'var(--radius-lg)' } }}
        >
          <DialogTitle component="div" sx={{ borderBottom: '1px solid var(--border)', pb: 2 }} component="div">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LinkIcon color="primary" />
              <Box>
                <Typography variant="h6" fontWeight="700">Ürün Eşleştirme</Typography>
                {secilenUrun && (
                  <Typography variant="body2" color="text.secondary">
                    Ana Ürün: <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{secilenUrun.stokKodu}</span> - {secilenUrun.stokAdi}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
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
                  helperText="Bu ürünle eşdeğer olan alternatif ürünleri seçin"
                  InputProps={{
                    ...params.InputProps,
                    sx: { borderRadius: 'var(--radius-md)' }
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={`${option.stokKodu}`}
                      size="small"
                      {...tagProps}
                      sx={{ borderRadius: '4px' }}
                    />
                  );
                })
              }
            />

            {secilenEslestirmeler.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="700" sx={{ mb: 2 }}>
                  SEÇİLİ EŞLEŞTİRMELER ({secilenEslestirmeler.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {secilenEslestirmeler.map((id) => {
                    const urun = eslestirilebilirUrunler.find((u) => u.id === id);
                    return urun ? (
                      <Paper
                        key={id}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          borderColor: 'var(--border)',
                          bgcolor: 'var(--background)'
                        }}
                      >
                        <CheckCircleOutline color="success" fontSize="small" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="700">
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
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSecilenEslestirmeler(prev => prev.filter(p => p !== id));
                          }}
                        >
                          <HighlightOff fontSize="small" />
                        </IconButton>
                      </Paper>
                    ) : null;
                  })}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--border)', pt: 2 }}>
            <Button onClick={() => setEslesmeDialog(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>İptal</Button>
            <Button
              variant="contained"
              onClick={handleSaveEslestirme}
              startIcon={<LinkIcon />}
              sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
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
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
