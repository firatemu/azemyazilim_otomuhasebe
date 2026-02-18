'use client';

import React, { useState } from 'react';
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
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Add, Edit, Delete, Calculate, Info } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';

interface AltBirim {
  id: number;
  altBirimAdi: string;
  cevrimKatsayisi: number;
}

interface BirimSeti {
  id: number;
  anaBirimAdi: string;
  altBirimler: AltBirim[];
  aciklama?: string;
}

export default function BirimSetleriPage() {
  const [birimSetleri, setBirimSetleri] = useState<BirimSeti[]>([
    {
      id: 1,
      anaBirimAdi: 'Metre',
      altBirimler: [
        { id: 1, altBirimAdi: 'Santimetre', cevrimKatsayisi: 100 },
        { id: 2, altBirimAdi: 'Milimetre', cevrimKatsayisi: 1000 },
      ],
      aciklama: 'Uzunluk ölçü birimi',
    },
    {
      id: 2,
      anaBirimAdi: 'Litre',
      altBirimler: [
        { id: 1, altBirimAdi: 'Mililitre', cevrimKatsayisi: 1000 },
      ],
      aciklama: 'Hacim ölçü birimi',
    },
    {
      id: 3,
      anaBirimAdi: 'Kilogram',
      altBirimler: [
        { id: 1, altBirimAdi: 'Gram', cevrimKatsayisi: 1000 },
      ],
      aciklama: 'Ağırlık ölçü birimi',
    },
    {
      id: 4,
      anaBirimAdi: 'Takım',
      altBirimler: [
        { id: 1, altBirimAdi: 'Adet', cevrimKatsayisi: 2 },
      ],
      aciklama: 'Fren balatası takımı',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [openAltBirimDialog, setOpenAltBirimDialog] = useState(false);
  const [editingBirimSeti, setEditingBirimSeti] = useState<BirimSeti | null>(null);
  const [selectedBirimSeti, setSelectedBirimSeti] = useState<BirimSeti | null>(null);
  const [editingAltBirim, setEditingAltBirim] = useState<AltBirim | null>(null);

  const [formData, setFormData] = useState({
    anaBirimAdi: '',
    aciklama: '',
  });

  const [altBirimFormData, setAltBirimFormData] = useState({
    altBirimAdi: '',
    cevrimKatsayisi: 1,
  });

  const handleOpenDialog = (birimSeti?: BirimSeti) => {
    if (birimSeti) {
      setEditingBirimSeti(birimSeti);
      setFormData({
        anaBirimAdi: birimSeti.anaBirimAdi,
        aciklama: birimSeti.aciklama || '',
      });
    } else {
      setEditingBirimSeti(null);
      setFormData({
        anaBirimAdi: '',
        aciklama: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBirimSeti(null);
  };

  const handleSave = () => {
    if (editingBirimSeti) {
      // Güncelleme
      setBirimSetleri(birimSetleri.map(b =>
        b.id === editingBirimSeti.id
          ? { ...b, anaBirimAdi: formData.anaBirimAdi, aciklama: formData.aciklama }
          : b
      ));
    } else {
      // Yeni ekleme
      const newBirimSeti: BirimSeti = {
        id: Math.max(...birimSetleri.map(b => b.id), 0) + 1,
        anaBirimAdi: formData.anaBirimAdi,
        altBirimler: [],
        aciklama: formData.aciklama,
      };
      setBirimSetleri([...birimSetleri, newBirimSeti]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    if (confirm('Bu birim setini silmek istediğinizden emin misiniz?')) {
      setBirimSetleri(birimSetleri.filter(b => b.id !== id));
    }
  };

  // Alt Birim İşlemleri
  const handleOpenAltBirimDialog = (birimSeti: BirimSeti, altBirim?: AltBirim) => {
    setSelectedBirimSeti(birimSeti);
    if (altBirim) {
      setEditingAltBirim(altBirim);
      setAltBirimFormData({
        altBirimAdi: altBirim.altBirimAdi,
        cevrimKatsayisi: altBirim.cevrimKatsayisi,
      });
    } else {
      setEditingAltBirim(null);
      setAltBirimFormData({
        altBirimAdi: '',
        cevrimKatsayisi: 1,
      });
    }
    setOpenAltBirimDialog(true);
  };

  const handleCloseAltBirimDialog = () => {
    setOpenAltBirimDialog(false);
    setSelectedBirimSeti(null);
    setEditingAltBirim(null);
  };

  const handleSaveAltBirim = () => {
    if (!selectedBirimSeti) return;

    setBirimSetleri(birimSetleri.map(b => {
      if (b.id === selectedBirimSeti.id) {
        if (editingAltBirim) {
          // Güncelleme
          return {
            ...b,
            altBirimler: b.altBirimler.map(ab =>
              ab.id === editingAltBirim.id
                ? { ...ab, ...altBirimFormData }
                : ab
            ),
          };
        } else {
          // Yeni ekleme
          const newAltBirim: AltBirim = {
            id: Math.max(...b.altBirimler.map(ab => ab.id), 0) + 1,
            ...altBirimFormData,
          };
          return {
            ...b,
            altBirimler: [...b.altBirimler, newAltBirim],
          };
        }
      }
      return b;
    }));
    handleCloseAltBirimDialog();
  };

  const handleDeleteAltBirim = (birimSetiId: number, altBirimId: number) => {
    if (confirm('Bu alt birimi silmek istediğinizden emin misiniz?')) {
      setBirimSetleri(birimSetleri.map(b =>
        b.id === birimSetiId
          ? { ...b, altBirimler: b.altBirimler.filter(ab => ab.id !== altBirimId) }
          : b
      ));
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Birim Setleri Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Ana birimleri ve alt birimlerini çevrim katsayıları ile tanımlayın
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
          Yeni Birim Seti Ekle
        </Button>
      </Box>

      {/* Bilgilendirme Kutusu */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd', borderLeft: '4px solid #191970' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'start' }}>
          <Info sx={{ color: '#191970', mt: 0.5 }} />
          <Box>
            <Typography variant="body2" fontWeight="600" color="#191970">
              Birim Setleri Nasıl Çalışır?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Ana birim altında birden fazla alt birim tanımlayabilirsiniz. Örnek: 1 Metre = 100 Santimetre = 1000 Milimetre.
              Kullanıcı tanımlı birimler de ekleyebilirsiniz. Örnek: 1 Takım = 2 Adet.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {birimSetleri.map((birimSeti) => (
          <Grid size={{ xs: 12, md: 6 }} key={birimSeti.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="600" color="#191970">
                      {birimSeti.anaBirimAdi}
                    </Typography>
                    {birimSeti.aciklama && (
                      <Typography variant="caption" color="text.secondary">
                        {birimSeti.aciklama}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(birimSeti)}
                      title="Ana Birimi Düzenle"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(birimSeti.id)}
                      title="Birimi Sil"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Alt Birimler
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => handleOpenAltBirimDialog(birimSeti)}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Alt Birim Ekle
                  </Button>
                </Box>

                {birimSeti.altBirimler.length === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 2 }}>
                    Henüz alt birim eklenmemiş
                  </Typography>
                ) : (
                  <Box>
                    {birimSeti.altBirimler.map((altBirim) => (
                      <Box
                        key={altBirim.id}
                        sx={{
                          bgcolor: '#f9f9f9',
                          borderRadius: 1,
                          mb: 1,
                          border: '1px solid #e0e0e0',
                          p: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                            {altBirim.altBirimAdi}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calculate sx={{ fontSize: 16, color: '#06b6d4' }} />
                            <Typography variant="caption" color="text.secondary">
                              1 {birimSeti.anaBirimAdi} = <strong>{altBirim.cevrimKatsayisi}</strong> {altBirim.altBirimAdi}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenAltBirimDialog(birimSeti, altBirim)}
                            title="Düzenle"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteAltBirim(birimSeti.id, altBirim.id)}
                            title="Sil"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ana Birim Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#191970', color: 'white' }}>
          {editingBirimSeti ? 'Ana Birim Düzenle' : 'Yeni Birim Seti Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Ana Birim Adı"
              value={formData.anaBirimAdi}
              onChange={(e) => setFormData({ ...formData, anaBirimAdi: e.target.value })}
              required
              placeholder="Örn: Metre, Litre, Takım"
              helperText="Ana birim adını giriniz"
            />

            <TextField
              fullWidth
              label="Açıklama"
              value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              multiline
              rows={3}
              placeholder="Birim hakkında açıklama..."
              helperText="Bu birimin ne için kullanıldığını açıklayın"
            />

            <Paper sx={{ p: 2, bgcolor: '#fff3cd', border: '1px solid #ffc107' }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Not:</strong> Ana birimi oluşturduktan sonra "Alt Birim Ekle" butonu ile 
                alt birimleri ve çevrim katsayılarını tanımlayabilirsiniz.
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} size="large">
            İptal
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            size="large"
            disabled={!formData.anaBirimAdi}
            sx={{
              bgcolor: '#191970',
              '&:hover': { bgcolor: '#0f0f40' }
            }}
          >
            {editingBirimSeti ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alt Birim Ekleme/Düzenleme Dialog */}
      <Dialog open={openAltBirimDialog} onClose={handleCloseAltBirimDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#191970', color: 'white' }}>
          {selectedBirimSeti && (
            <Box>
              {editingAltBirim ? 'Alt Birim Düzenle' : 'Yeni Alt Birim Ekle'}
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.9 }}>
                Ana Birim: {selectedBirimSeti.anaBirimAdi}
              </Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Alt Birim Adı"
              value={altBirimFormData.altBirimAdi}
              onChange={(e) => setAltBirimFormData({ ...altBirimFormData, altBirimAdi: e.target.value })}
              required
              placeholder="Örn: Santimetre, Mililitre, Adet"
              helperText="Alt birim adını giriniz"
            />

            <TextField
              fullWidth
              label="Çevrim Katsayısı"
              type="number"
              value={altBirimFormData.cevrimKatsayisi}
              onChange={(e) => setAltBirimFormData({ 
                ...altBirimFormData, 
                cevrimKatsayisi: parseFloat(e.target.value) || 1 
              })}
              required
              helperText={`1 ${selectedBirimSeti?.anaBirimAdi} = ${altBirimFormData.cevrimKatsayisi} ${altBirimFormData.altBirimAdi || 'Alt Birim'}`}
            />

            <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
              <Typography variant="caption" fontWeight="600" color="#2e7d32">
                Örnek Çevrim Katsayıları:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                <Typography component="li" variant="caption" color="text.secondary">
                  1 Metre = 100 Santimetre (Katsayı: 100)
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  1 Litre = 1000 Mililitre (Katsayı: 1000)
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  1 Takım = 2 Adet (Katsayı: 2)
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  1 Paket = 12 Adet (Katsayı: 12)
                </Typography>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseAltBirimDialog} size="large">
            İptal
          </Button>
          <Button
            onClick={handleSaveAltBirim}
            variant="contained"
            size="large"
            disabled={!altBirimFormData.altBirimAdi || altBirimFormData.cevrimKatsayisi <= 0}
            sx={{
              bgcolor: '#191970',
              '&:hover': { bgcolor: '#0f0f40' }
            }}
          >
            {editingAltBirim ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

