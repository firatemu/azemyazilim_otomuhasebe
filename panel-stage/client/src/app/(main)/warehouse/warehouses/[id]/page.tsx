'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Layers as LayersIcon,
  ViewWeek as ViewWeekIcon,
  GridOn as GridOnIcon,
  West as WestIcon,
  East as EastIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

interface Location {
  id: string;
  warehouseId: string;
  layer: number;
  corridor: string;
  side: number;
  section: number;
  level: number;
  code: string;
  barcode: string;
  name?: string;
  active: boolean;
}

interface DialogState {
  open: boolean;
  type: 'layer' | 'corridor' | 'side-grid' | 'free-rack' | null;
  parentData?: {
    layer?: number;
    corridor?: string;
    side?: number;
  };
}

export default function DepoDetayPage() {
  const params = useParams();
  const router = useRouter();
  const warehouseId = params.id as string;

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  // Kullanıcının seçtiği kat ve koridorları tut (gerçek Location yokken de göster)
  const [selectedLayers, setSelectedLayers] = useState<Set<number>>(new Set());
  const [selectedCorridors, setSelectedCorridors] = useState<Map<number, Set<string>>>(new Map());

  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    type: null,
  });
  const [formData, setFormData] = useState({
    layer: 1,
    corridor: 'A',
    side: 1,
    sectionCount: 4,
    levelCount: 3,
    freeRackCode: '',
    freeRackName: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchWarehouse();
    fetchLocations();
  }, [warehouseId]);

  const fetchWarehouse = async () => {
    try {
      const response = await axios.get(`/warehouse/${warehouseId}`);
      setWarehouse(response.data);
    } catch (error) {
      console.error('Depo bilgisi alınamadı:', error);
    }
  };

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/location', {
        params: { warehouseId, active: true },
      });
      setLocations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Raf listesi alınamadı:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Hiyerarşik yapıyı oluştur
  const getHierarchy = () => {
    const hierarchy: any = {};
    const freeRacks: Location[] = [];

    locations.forEach((loc) => {
      if (loc.layer === 0 || !loc.corridor || loc.corridor === 'FREE') {
        // Serbest raf
        freeRacks.push(loc);
      } else {
        // Mezanin raf
        if (!hierarchy[loc.layer]) hierarchy[loc.layer] = {};
        if (!hierarchy[loc.layer][loc.corridor]) hierarchy[loc.layer][loc.corridor] = {};
        if (!hierarchy[loc.layer][loc.corridor][loc.side]) hierarchy[loc.layer][loc.corridor][loc.side] = {};
        if (!hierarchy[loc.layer][loc.corridor][loc.side][loc.section]) {
          hierarchy[loc.layer][loc.corridor][loc.side][loc.section] = [];
        }
        hierarchy[loc.layer][loc.corridor][loc.side][loc.section].push(loc);
      }
    });

    return { hierarchy, freeRacks };
  };

  const handleOpenDialog = (
    type: 'layer' | 'corridor' | 'side-grid' | 'free-rack',
    parentData?: { layer?: number; corridor?: string; side?: number }
  ) => {
    setDialogState({ open: true, type, parentData });
    if (parentData) {
      setFormData({
        ...formData,
        layer: parentData.layer || 1,
        corridor: parentData.corridor || 'A',
        side: parentData.side || 1,
      });
    } else {
      setFormData({
        layer: 1,
        corridor: 'A',
        side: 1,
        sectionCount: 4,
        levelCount: 3,
        freeRackCode: '',
        freeRackName: '',
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogState({ open: false, type: null });
  };

  const handleSave = async () => {
    try {
      if (dialogState.type === 'layer') {
        // Kat seçimini state'e ekle
        setSelectedLayers(prev => new Set(prev).add(formData.layer));
        setSnackbar({
          open: true,
          message: `Kat ${formData.layer} eklendi. Şimdi koridor ekleyin.`,
          severity: 'success',
        });
        handleCloseDialog();
      } else if (dialogState.type === 'corridor') {
        // Koridor seçimini state'e ekle
        const layer = dialogState.parentData?.layer || formData.layer;
        setSelectedCorridors(prev => {
          const newMap = new Map(prev);
          if (!newMap.has(layer)) {
            newMap.set(layer, new Set());
          }
          newMap.get(layer)!.add(formData.corridor);
          return newMap;
        });
        setSnackbar({
          open: true,
          message: `Koridor ${formData.corridor} eklendi. Sol ve Sağ taraflar için Grid oluşturun.`,
          severity: 'success',
        });
        handleCloseDialog();
      } else if (dialogState.type === 'side-grid') {
        // Excel-like grid: sectionCount × levelCount oluştur
        const totalLocations = formData.sectionCount * formData.levelCount;

        if (totalLocations > 500) {
          setSnackbar({
            open: true,
            message: 'Maksimum 500 raf oluşturabilirsiniz. Lütfen sayıları azaltın.',
            severity: 'error',
          });
          return;
        }

        const locations = [];
        for (let section = 1; section <= formData.sectionCount; section++) {
          for (let level = 1; level <= formData.levelCount; level++) {
            locations.push({
              warehouseId,
              layer: formData.layer,
              corridor: formData.corridor,
              side: formData.side,
              section,
              level,
              active: true,
            });
          }
        }

        await axios.post('/location/bulk/grid', { locations });
        setSnackbar({
          open: true,
          message: `${totalLocations} adet raf oluşturuldu!`,
          severity: 'success',
        });
        handleCloseDialog();
        fetchLocations();
      } else if (dialogState.type === 'free-rack') {
        // Serbest raf oluşturma (koridorsuz)
        if (!formData.freeRackCode) {
          setSnackbar({ open: true, message: 'Raf kodu girilmelidir', severity: 'error' });
          return;
        }

        await axios.post('/location', {
          warehouseId,
          code: formData.freeRackCode,
          name: formData.freeRackName,
          active: true,
        });

        setSnackbar({
          open: true,
          message: `Serbest raf "${formData.freeRackCode}" oluşturuldu!`,
          severity: 'success',
        });
        handleCloseDialog();
        fetchLocations();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'İşlem başarısız';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    }
  };

  const { hierarchy, freeRacks } = getHierarchy();

  // Gerçek Location'lardan gelen katları ve kullanıcının seçtiği katları birleştir
  const realLayers = Object.keys(hierarchy).map(Number);
  const allLayers = Array.from(new Set([...realLayers, ...Array.from(selectedLayers)])).sort();

  if (!warehouse) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Typography>Yükleniyor...</Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Başlık */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => router.push('/depo/depolar')}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold">
              {warehouse.name} - Kat/Koridor Yapısı
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kod: {warehouse.code}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ flex: 1 }}>
            <strong>🏗️ Mezanin Raf Sistemi:</strong>
            <br />
            Kat → Koridor → Sol/Sağ Taraf → Grid (Bölüm × Raf)
            <br />
            Örnek: K1-A1-3-5
          </Alert>
          <Alert severity="success" sx={{ flex: 1 }}>
            <strong>📦 Serbest Raf Sistemi:</strong>
            <br />
            Koridorsuz raflar için manuel kod girişi
            <br />
            Örnek: K1-RAF001, K2-A15
          </Alert>
        </Stack>

        {/* Hiyerarşi */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">📦 Depo Yapısı</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="success"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => handleOpenDialog('free-rack')}
              >
                Serbest Raf Ekle
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => handleOpenDialog('layer')}
              >
                Yeni Kat (Mezanin)
              </Button>
            </Stack>
          </Box>

          {allLayers.length === 0 ? (
            <Alert severity="warning">
              Henüz yapı oluşturulmamış. "Yeni Kat" ile başlayın.
            </Alert>
          ) : (
            allLayers.map((layer) => {
              // Gerçek Location'lardan gelen koridorlar + seçilen koridorlar
              const realCorridors = hierarchy[layer] ? Object.keys(hierarchy[layer]).sort() : [];
              const selectedLayerCorridors = selectedCorridors.get(layer) || new Set();
              const allCorridors = Array.from(new Set([...realCorridors, ...Array.from(selectedLayerCorridors)])).sort();

              return (
                <Accordion key={layer} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LayersIcon color="primary" />
                      <Typography fontWeight="bold">Kat {layer}</Typography>
                      <Chip label={`${allCorridors.length} koridor`} size="small" />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        size="small"
                        onClick={() => handleOpenDialog('corridor', { layer })}
                        fullWidth
                      >
                        Yeni Koridor Ekle
                      </Button>

                      {allCorridors.map((corridor) => {
                        const sides = hierarchy[layer]?.[corridor]
                          ? Object.keys(hierarchy[layer][corridor]).map(Number).sort()
                          : [];

                        return (
                          <Accordion key={corridor} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ViewWeekIcon color="secondary" />
                                <Typography fontWeight="bold">Koridor {corridor}</Typography>
                                <Chip
                                  label={sides.includes(1) || sides.includes(2) ?
                                    `${sides.includes(1) ? '⬅️Sol' : ''} ${sides.includes(2) ? '➡️Sağ' : ''}` :
                                    '⬅️ Sol ve ➡️ Sağ taraflar için Grid oluşturun'
                                  }
                                  size="small"
                                  color={sides.length > 0 ? 'success' : 'default'}
                                  variant="outlined"
                                />
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Stack spacing={2} direction="row">
                                {/* Sol Taraf - HER ZAMAN GÖSTER */}
                                <Paper sx={{ flex: 1, p: 2, bgcolor: '#f0f9ff', border: '2px solid #3b82f6' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <WestIcon color="info" />
                                    <Typography fontWeight="bold" color="primary">
                                      {corridor}1 - Sol Taraf
                                    </Typography>
                                  </Box>
                                  {hierarchy[layer]?.[corridor]?.[1] ? (
                                    <Box>
                                      <Chip
                                        label={`✓ ${Object.keys(hierarchy[layer][corridor][1]).length} bölüm × ${Math.max(
                                          ...Object.values(hierarchy[layer][corridor][1] as any).map(
                                            (arr: any) => arr.length
                                          )
                                        )} raf`}
                                        color="success"
                                        size="small"
                                        sx={{ mb: 1 }}
                                      />
                                      <Typography variant="caption" display="block" color="text.secondary">
                                        Grid oluşturuldu
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      startIcon={<GridOnIcon />}
                                      size="medium"
                                      fullWidth
                                      onClick={() =>
                                        handleOpenDialog('side-grid', { layer: Number(layer), corridor, side: 1 })
                                      }
                                    >
                                      Grid Oluştur
                                    </Button>
                                  )}
                                </Paper>

                                {/* Sağ Taraf - HER ZAMAN GÖSTER */}
                                <Paper sx={{ flex: 1, p: 2, bgcolor: '#fff7ed', border: '2px solid #f59e0b' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <EastIcon color="warning" />
                                    <Typography fontWeight="bold" color="warning.main">
                                      {corridor}2 - Sağ Taraf
                                    </Typography>
                                  </Box>
                                  {hierarchy[layer]?.[corridor]?.[2] ? (
                                    <Box>
                                      <Chip
                                        label={`✓ ${Object.keys(hierarchy[layer][corridor][2]).length} bölüm × ${Math.max(
                                          ...Object.values(hierarchy[layer][corridor][2] as any).map(
                                            (arr: any) => arr.length
                                          )
                                        )} raf`}
                                        color="success"
                                        size="small"
                                        sx={{ mb: 1 }}
                                      />
                                      <Typography variant="caption" display="block" color="text.secondary">
                                        Grid oluşturuldu
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Button
                                      variant="contained"
                                      color="warning"
                                      startIcon={<GridOnIcon />}
                                      size="medium"
                                      fullWidth
                                      onClick={() =>
                                        handleOpenDialog('side-grid', { layer: Number(layer), corridor, side: 2 })
                                      }
                                    >
                                      Grid Oluştur
                                    </Button>
                                  )}
                                </Paper>
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </Paper>

        {/* Serbest Raflar */}
        {freeRacks.length > 0 && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: '#f0fdf4' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              📦 Serbest Raflar (Koridorsuz)
              <Chip label={`${freeRacks.length} adet`} size="small" color="success" />
            </Typography>
            <Stack spacing={1}>
              {freeRacks.map((rack) => (
                <Paper key={rack.id} sx={{ p: 2, border: '1px solid #22c55e' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight="bold" color="success.main">
                        {rack.code}
                      </Typography>
                      {rack.name && (
                        <Typography variant="caption" color="text.secondary">
                          {rack.name}
                        </Typography>
                      )}
                    </Box>
                    <Chip label={rack.barcode} size="small" variant="outlined" />
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Dialog - Kat Seçimi */}
        <Dialog open={dialogState.open && dialogState.type === 'layer'} onClose={handleCloseDialog} maxWidth="xs">
          <DialogTitle component="div">Yeni Kat Ekle</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Kat</InputLabel>
                <Select
                  value={formData.layer}
                  label="Kat"
                  onChange={(e) => setFormData({ ...formData, layer: Number(e.target.value) })}
                >
                  <MenuItem value={1}>Kat 1</MenuItem>
                  <MenuItem value={2}>Kat 2</MenuItem>
                  <MenuItem value={3}>Kat 3</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSave} variant="contained">
              Seç
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog - Koridor Seçimi */}
        <Dialog open={dialogState.open && dialogState.type === 'corridor'} onClose={handleCloseDialog} maxWidth="xs">
          <DialogTitle component="div">Kat {dialogState.parentData?.layer} - Yeni Koridor Ekle</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Koridor</InputLabel>
                <Select
                  value={formData.corridor}
                  label="Koridor"
                  onChange={(e) => setFormData({ ...formData, corridor: e.target.value })}
                >
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'].map((letter) => (
                    <MenuItem key={letter} value={letter}>
                      Koridor {letter}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Alert severity="info" sx={{ mt: 2 }}>
                Koridor oluşturulduğunda otomatik olarak Sol (1) ve Sağ (2) taraf oluşur.
                <br />
                <strong>20 koridor:</strong> A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSave} variant="contained">
              Seç
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog - Grid Oluşturma (Bölüm × Raf) */}
        <Dialog
          open={dialogState.open && dialogState.type === 'side-grid'}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle component="div">
            Kat {dialogState.parentData?.layer} / Koridor {dialogState.parentData?.corridor}
            {dialogState.parentData?.side === 1 ? '1 (Sol)' : '2 (Sağ)'} - Grid Oluştur
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Alert severity="info">
                Excel benzeri yapı oluşturacaksınız. Bölüm sayısı (yatay) × Raf sayısı (dikey) girilir.
              </Alert>

              <TextField
                fullWidth
                label="Kaç Bölüm? (Yatay - Sütun)"
                type="number"
                value={formData.sectionCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  if (val >= 1 && val <= 99) setFormData({ ...formData, sectionCount: val });
                }}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                }}
                inputProps={{ min: 1, max: 99 }}
                helperText="Örnek: 4 bölüm girerseniz → Bölüm 1, 2, 3, 4"
              />

              <TextField
                fullWidth
                label="Kaç Raf? (Dikey - Satır)"
                type="number"
                value={formData.levelCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  if (val >= 1 && val <= 50) setFormData({ ...formData, levelCount: val });
                }}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                }}
                inputProps={{ min: 1, max: 50 }}
                helperText="Örnek: 3 raf girerseniz → Raf 1, 2, 3"
              />

              {/* Önizleme */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📊 Önizleme:
                </Typography>
                <Typography variant="h6" color="primary">
                  {formData.sectionCount} Bölüm × {formData.levelCount} Raf ={' '}
                  <strong>{formData.sectionCount * formData.levelCount} adet konum</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Örnek kodlar: K{formData.layer}-{formData.corridor}
                  {formData.side}-1-1, K{formData.layer}-{formData.corridor}
                  {formData.side}-{formData.sectionCount}-{formData.levelCount}
                </Typography>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSave} variant="contained" color="success">
              {formData.sectionCount * formData.levelCount} Raf Oluştur
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog - Serbest Raf Ekleme */}
        <Dialog
          open={dialogState.open && dialogState.type === 'free-rack'}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle component="div">📦 Serbest Raf Ekle (Koridorsuz)</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info">
                Mezanin sistemi olmayan, koridorsuz raflar için kullanılır.
                <br />
                Manuel kod girişi yapabilirsiniz (örn: K1-RAF001, K2-A15, R-200)
              </Alert>

              <TextField
                fullWidth
                label="Raf Kodu *"
                value={formData.freeRackCode}
                onChange={(e) => setFormData({ ...formData, freeRackCode: e.target.value.toUpperCase() })}
                placeholder="örn: K1-RAF001, K2-A15, R-200"
                helperText="Benzersiz bir kod girin"
                required
              />

              <TextField
                fullWidth
                label="Raf Açıklaması"
                value={formData.freeRackName}
                onChange={(e) => setFormData({ ...formData, freeRackName: e.target.value })}
                placeholder="örn: Giriş Katı - A Bölümü - 15 No'lu Raf"
                multiline
                rows={2}
              />

              <Alert severity="warning">
                <strong>Dikkat:</strong> Bu raf mezanin sistemi dışında kalacak.
                Koridor/Taraf/Bölüm hiyerarşisi olmayacak.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSave} variant="contained" color="success">
              Oluştur
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
