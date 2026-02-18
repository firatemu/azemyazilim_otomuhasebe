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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Visibility,
  FileDownload,
  Print,
  PictureAsPdf,
  TableChart,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
  vergiNo?: string;
  vergiDairesi?: string;
  tcKimlikNo?: string;
  isimSoyisim?: string;
  telefon?: string;
  email?: string;
  adres?: string;
  bakiye: string;
}

interface CariHareket {
  id: string;
  tip: 'BORC' | 'ALACAK' | 'DEVIR';
  tutar: string;
  bakiye: string;
  belgeTipi?: string;
  belgeNo?: string;
  tarih: string;
  aciklama: string;
}

export default function CariDetayPage() {
  const params = useParams();
  const router = useRouter();
  const cariId = params.id as string;

  const [cari, setCari] = useState<Cari | null>(null);
  const [hareketler, setHareketler] = useState<CariHareket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openIncele, setOpenIncele] = useState(false);
  const [selectedHareket, setSelectedHareket] = useState<CariHareket | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  
  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');

  const [formData, setFormData] = useState({
    tip: 'BORC' as 'BORC' | 'ALACAK' | 'DEVIR',
    tutar: '',
    belgeTipi: '',
    belgeNo: '',
    tarih: new Date().toISOString().split('T')[0],
    aciklama: '',
  });

  useEffect(() => {
    fetchCari();
    fetchHareketler();
  }, [cariId]);

  const fetchCari = async () => {
    try {
      const response = await axios.get(`/cari/${cariId}`);
      setCari(response.data);
    } catch (error) {
      console.error('Cari bilgisi alınamadı:', error);
      showSnackbar('Cari bilgisi yüklenemedi', 'error');
    }
  };

  const fetchHareketler = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/cari-hareket', {
        params: { cariId, take: 1000 },
      });
      setHareketler(response.data.data || []);
    } catch (error) {
      console.error('Hareketler alınamadı:', error);
      showSnackbar('Hareketler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post('/cari-hareket', {
        cariId,
        ...formData,
        tutar: parseFloat(formData.tutar),
      });
      showSnackbar('Hareket başarıyla eklendi', 'success');
      setOpenAdd(false);
      resetForm();
      fetchCari();
      fetchHareketler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Hareket eklenemedi', 'error');
    }
  };

  const handleIncele = (hareket: CariHareket) => {
    setSelectedHareket(hareket);
    setOpenIncele(true);
  };

  const handleExportExcel = () => {
    const url = `/api/cari-hareket/ekstre/excel?cariId=${cariId}${
      baslangicTarihi ? `&baslangicTarihi=${baslangicTarihi}` : ''
    }${bitisTarihi ? `&bitisTarihi=${bitisTarihi}` : ''}`;
    
    window.open(url, '_blank');
    showSnackbar('Excel indiriliyor...', 'info');
  };

  const handleExportPdf = () => {
    const url = `/api/cari-hareket/ekstre/pdf?cariId=${cariId}${
      baslangicTarihi ? `&baslangicTarihi=${baslangicTarihi}` : ''
    }${bitisTarihi ? `&bitisTarihi=${bitisTarihi}` : ''}`;
    
    window.open(url, '_blank');
    showSnackbar('PDF açılıyor...', 'info');
  };

  const handlePrint = () => {
    handleExportPdf();
  };

  const resetForm = () => {
    setFormData({
      tip: 'BORC',
      tutar: '',
      belgeTipi: '',
      belgeNo: '',
      tarih: new Date().toISOString().split('T')[0],
      aciklama: '',
    });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getTipColor = (tip: string) => {
    switch (tip) {
      case 'BORC':
        return 'error';
      case 'ALACAK':
        return 'success';
      case 'DEVIR':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTipLabel = (tip: string) => {
    switch (tip) {
      case 'BORC':
        return 'Borç';
      case 'ALACAK':
        return 'Alacak';
      case 'DEVIR':
        return 'Devir';
      default:
        return tip;
    }
  };

  if (!cari) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/cari')}
          sx={{ mb: 2 }}
        >
          Cari Listesine Dön
        </Button>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {cari.unvan}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Cari Kodu: {cari.cariKodu}
              </Typography>
              {cari.vergiNo && (
                <Typography variant="body2" color="text.secondary">
                  Vergi No: {cari.vergiNo} - {cari.vergiDairesi}
                </Typography>
              )}
              {cari.tcKimlikNo && (
                <Typography variant="body2" color="text.secondary">
                  TC: {cari.tcKimlikNo} - {cari.isimSoyisim}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Güncel Bakiye
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={parseFloat(cari.bakiye) < 0 ? '#10b981' : '#ef4444'}
              >
                ₺{parseFloat(cari.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {parseFloat(cari.bakiye) < 0 ? 'Alacaklı' : 'Borçlu'}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Actions */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAdd(true)}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            }}
          >
            Yeni Hareket
          </Button>
          
          <Box sx={{ flexGrow: 1 }} />

          <TextField
            type="date"
            label="Başlangıç Tarihi"
            value={baslangicTarihi}
            onChange={(e) => setBaslangicTarihi(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            type="date"
            label="Bitiş Tarihi"
            value={bitisTarihi}
            onChange={(e) => setBitisTarihi(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />

          <Button
            variant="outlined"
            startIcon={<TableChart />}
            onClick={handleExportExcel}
            color="success"
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPdf}
            color="error"
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Yazdır
          </Button>
        </Stack>
      </Box>

      {/* Hareketler Tablosu */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Belge No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Borç</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Alacak</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Bakiye</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : hareketler.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    Henüz hareket kaydı bulunmuyor
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              hareketler.map((hareket) => (
                <TableRow key={hareket.id} hover>
                  <TableCell>
                    {new Date(hareket.tarih).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTipLabel(hareket.tip)}
                      color={getTipColor(hareket.tip)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{hareket.belgeNo || '-'}</TableCell>
                  <TableCell>{hareket.aciklama}</TableCell>
                  <TableCell align="right" sx={{ color: '#ef4444', fontWeight: 600 }}>
                    {hareket.tip === 'BORC' ? `₺${parseFloat(hareket.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#10b981', fontWeight: 600 }}>
                    {hareket.tip === 'ALACAK' ? `₺${parseFloat(hareket.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ₺{parseFloat(hareket.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => handleIncele(hareket)}
                      sx={{
                        textTransform: 'none',
                      }}
                    >
                      İncele
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          fontWeight: 'bold',
        }}>
          Yeni Hareket Ekle
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>İşlem Tipi *</InputLabel>
              <Select
                value={formData.tip}
                label="İşlem Tipi *"
                onChange={(e) => setFormData({ ...formData, tip: e.target.value as any })}
              >
                <MenuItem value="BORC">Borç</MenuItem>
                <MenuItem value="ALACAK">Alacak</MenuItem>
                <MenuItem value="DEVIR">Devir</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="Tutar *"
              value={formData.tutar}
              onChange={(e) => setFormData({ ...formData, tutar: e.target.value })}
              required
              inputProps={{ step: '0.01', min: '0' }}
            />

            <TextField
              fullWidth
              label="Belge No"
              value={formData.belgeNo}
              onChange={(e) => setFormData({ ...formData, belgeNo: e.target.value })}
            />

            <TextField
              fullWidth
              type="date"
              label="Tarih *"
              value={formData.tarih}
              onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Açıklama *"
              value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAdd(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!formData.tutar || !formData.aciklama}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            }}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* İncele Dialog */}
      <Dialog open={openIncele} onClose={() => setOpenIncele(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          fontWeight: 'bold',
        }}>
          Hareket Detayı
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedHareket && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Tarih</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date(selectedHareket.tarih).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Tip</Typography>
                <Chip
                  label={getTipLabel(selectedHareket.tip)}
                  color={getTipColor(selectedHareket.tip)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              {selectedHareket.belgeNo && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Belge No</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedHareket.belgeNo}
                  </Typography>
                </Box>
              )}
              {selectedHareket.belgeTipi && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Belge Tipi</Typography>
                  <Typography variant="body1">
                    {selectedHareket.belgeTipi}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Tutar</Typography>
                <Typography variant="body1" fontWeight={600} color={selectedHareket.tip === 'BORC' ? '#ef4444' : '#10b981'}>
                  {selectedHareket.tip === 'BORC' ? 'Borç: ' : 'Alacak: '}
                  ₺{parseFloat(selectedHareket.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Bakiye</Typography>
                <Typography variant="body1" fontWeight={600}>
                  ₺{parseFloat(selectedHareket.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Açıklama</Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {selectedHareket.aciklama}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenIncele(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}



