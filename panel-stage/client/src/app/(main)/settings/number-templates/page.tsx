'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  Info,
  Settings,
  AutoAwesome,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface CodeTemplate {
  id: string;
  module: string;
  name: string;
  prefix: string;
  digitCount: number;
  currentValue: number;
  includeYear?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

  const moduleOptions = [
  { value: 'WAREHOUSE', label: 'Depo' },
  { value: 'CASHBOX', label: 'Kasa' },
  { value: 'PERSONNEL', label: 'Personel' },
  { value: 'PRODUCT', label: 'Ürün/Stok' },
  { value: 'CUSTOMER', label: 'Cari/Müşteri' },
  { value: 'INVOICE_SALES', label: 'Satış Faturası' },
  { value: 'INVOICE_PURCHASE', label: 'Alış Faturası' },
  { value: 'ORDER_SALES', label: 'Satış Siparişi' },
  { value: 'ORDER_PURCHASE', label: 'Satın Alma Siparişi' },
  { value: 'INVENTORY_COUNT', label: 'Sayım' },
  { value: 'QUOTE', label: 'Teklif' },
  { value: 'DELIVERY_NOTE_SALES', label: 'Satış İrsaliyesi' },
  { value: 'DELIVERY_NOTE_PURCHASE', label: 'Alış İrsaliyesi' },
  { value: 'WAREHOUSE_TRANSFER', label: 'Depo Transferi' },
  { value: 'TECHNICIAN', label: 'Teknisyen' },
  { value: 'WORK_ORDER', label: 'İş Emri' },
  { value: 'SERVICE_INVOICE', label: 'Servis Faturası' },
  ];

// Örnek şablon tanımları
const exampleTemplates = [
  { module: 'WAREHOUSE', name: 'Depo Kodu', prefix: 'D', digitCount: 3, currentValue: 0, includeYear: false, isActive: true },
  { module: 'CASHBOX', name: 'Kasa Kodu', prefix: 'K', digitCount: 3, currentValue: 0, includeYear: false, isActive: true },
  { module: 'PERSONNEL', name: 'Personel Kodu', prefix: 'P', digitCount: 4, currentValue: 0, includeYear: false, isActive: true },
  { module: 'PRODUCT', name: 'Ürün Kodu', prefix: 'ST', digitCount: 4, currentValue: 0, includeYear: false, isActive: true },
  { module: 'CUSTOMER', name: 'Cari Kodu', prefix: 'C', digitCount: 4, currentValue: 0, includeYear: false, isActive: true },
  { module: 'INVOICE_SALES', name: 'Satış Fatura No', prefix: 'AZM', digitCount: 9, currentValue: 0, includeYear: true, isActive: true },
  { module: 'INVOICE_PURCHASE', name: 'Alış Fatura No', prefix: 'AF', digitCount: 6, currentValue: 0, includeYear: false, isActive: true },
  { module: 'ORDER_SALES', name: 'Satış Sipariş No', prefix: 'SS', digitCount: 6, currentValue: 0, includeYear: false, isActive: true },
  { module: 'ORDER_PURCHASE', name: 'Satın Alma Sipariş No', prefix: 'SAS', digitCount: 6, currentValue: 0, includeYear: false, isActive: true },
  { module: 'INVENTORY_COUNT', name: 'Sayım Kodu', prefix: 'SY', digitCount: 4, currentValue: 0, includeYear: false, isActive: true },
  { module: 'QUOTE', name: 'Teklif No', prefix: 'TK', digitCount: 6, currentValue: 0, includeYear: false, isActive: true },
  { module: 'DELIVERY_NOTE_SALES', name: 'Satış İrsaliye No', prefix: 'SI', digitCount: 6, currentValue: 0, includeYear: false, isActive: true },
  { module: 'DELIVERY_NOTE_PURCHASE', name: 'Alış İrsaliye No', prefix: 'AI', digitCount: 6, currentValue: 0, includeYear: false, isActive: true },
  { module: 'WAREHOUSE_TRANSFER', name: 'Depo Transfer No', prefix: 'DT', digitCount: 6, currentValue: 0, includeYear: false, isActive: true },
  { module: 'TECHNICIAN', name: 'Teknisyen Kodu', prefix: 'T', digitCount: 3, currentValue: 0, includeYear: false, isActive: true },
  { module: 'WORK_ORDER', name: 'İş Emri No', prefix: 'IE', digitCount: 5, currentValue: 0, includeYear: false, isActive: true },
  { module: 'SERVICE_INVOICE', name: 'Servis Fatura No', prefix: 'SF', digitCount: 6, currentValue: 0, includeYear: false, isActive: true },
];

// Template Form Dialog Component - Local State ile Ping Sorunu Çözümü
interface TemplateFormDialogProps {
  open: boolean;
  initialFormData: {
    module: string;
    name: string;
    prefix: string;
    digitCount: number;
    currentValue: number;
    includeYear: boolean;
    isActive: boolean;
  };
  editingTemplate: CodeTemplate | null;
  onClose: () => void;
  onSubmit: (data: {
    module: string;
    name: string;
    prefix: string;
    digitCount: number;
    currentValue: number;
    includeYear: boolean;
    isActive: boolean;
  }) => void;
}

const TemplateFormDialog = memo(({
  open,
  initialFormData,
  editingTemplate,
  onClose,
  onSubmit,
}: TemplateFormDialogProps) => {
  // Local State - Parent'ı etkilemez, ping sorunu çözülür
  const [localFormData, setLocalFormData] = useState(initialFormData);

  // initialFormData değiştiğinde local state'i güncelle
  useEffect(() => {
    setLocalFormData(initialFormData);
  }, [initialFormData]);

  // Local değişiklik fonksiyonu - Sadece dialog re-render olur
  const handleLocalChange = useCallback((field: string, value: any) => {
    setLocalFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Local submit - Parent'a sadece burada veri gönderilir
  const handleLocalSubmit = useCallback(() => {
    onSubmit(localFormData);
  }, [localFormData, onSubmit]);

  // Hook'lar bittikten SONRA conditional return
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle component="div">
        {editingTemplate ? 'Şablon Düzenle' : 'Yeni Şablon Ekle'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth disabled={!!editingTemplate}>
                <InputLabel>Modül</InputLabel>
                <Select
                  value={localFormData.module}
                  label="Modül"
                  onChange={(e) => {
                    const module = e.target.value;
                    handleLocalChange('module', module);
                    // Satış faturaları için otomatik ayarlar
                    if (module === 'INVOICE_SALES') {
                      handleLocalChange('includeYear', true);
                      handleLocalChange('digitCount', 9);
                      // Prefix'i 3 karakterle sınırla
                      if (localFormData.prefix.length > 3) {
                        handleLocalChange('prefix', localFormData.prefix.slice(0, 3));
                      }
                    }
                  }}
                >
                  {moduleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Şablon Adı"
                value={localFormData.name}
                onChange={(e) => handleLocalChange('name', e.target.value)}
                placeholder="Örn: Depo Kodu"
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Ön Ek"
                value={localFormData.prefix}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  // Satış faturaları için 3 karakter sınırı
                  const maxLength = localFormData.module === 'INVOICE_SALES' && localFormData.includeYear ? 3 : 5;
                  handleLocalChange('prefix', value.slice(0, maxLength));
                }}
                placeholder={localFormData.module === 'INVOICE_SALES' && localFormData.includeYear ? "Örn: AZM (3 karakter)" : "Örn: D, K, ST"}
                inputProps={{ maxLength: localFormData.module === 'INVOICE_SALES' && localFormData.includeYear ? 3 : 5 }}
                helperText={localFormData.module === 'INVOICE_SALES' && localFormData.includeYear ? "Satış faturaları için 3 karakter girin" : undefined}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Hane Sayısı"
                value={localFormData.digitCount}
                onChange={(e) => handleLocalChange('digitCount', parseInt(e.target.value) || 3)}
                inputProps={{ min: 1, max: 10 }}
                disabled={localFormData.module === 'INVOICE_SALES' && localFormData.includeYear}
                helperText={localFormData.module === 'INVOICE_SALES' && localFormData.includeYear ? "Satış faturaları için otomatik 9 hane" : undefined}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="number"
                label="Başlangıç Değeri"
                value={localFormData.currentValue}
                onChange={(e) => handleLocalChange('currentValue', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
                helperText="Mevcut sayaç değeri"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localFormData.includeYear || false}
                    onChange={(e) => {
                      const includeYear = e.target.checked;
                      handleLocalChange('includeYear', includeYear);
                      // Satış faturaları için otomatik ayarlar
                      if (localFormData.module === 'INVOICE_SALES' && includeYear) {
                        handleLocalChange('digitCount', 9);
                        // Prefix'i 3 karakterle sınırla
                        if (localFormData.prefix.length > 3) {
                          handleLocalChange('prefix', localFormData.prefix.slice(0, 3));
                        }
                      }
                    }}
                  />
                }
                label="Yıl Bilgisi Ekle"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block', mt: 0.5 }}>
                Format: {localFormData.includeYear ? 'ÖnEk + Yıl + Sayı (örn: AZM2025000000001)' : 'ÖnEk + Sayı (örn: D001)'}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localFormData.isActive}
                    onChange={(e) => handleLocalChange('isActive', e.target.checked)}
                  />
                }
                label="Aktif"
              />
            </Grid>

            {localFormData.prefix && localFormData.digitCount > 0 && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Önizleme:</strong>{' '}
                    {localFormData.includeYear
                      ? `${localFormData.prefix}${new Date().getFullYear()}${String(localFormData.currentValue + 1).padStart(localFormData.digitCount, '0')}`
                      : `${localFormData.prefix}${String(localFormData.currentValue + 1).padStart(localFormData.digitCount, '0')}`}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button
          onClick={handleLocalSubmit}
          variant="contained"
          disabled={!localFormData.module || !localFormData.name || !localFormData.prefix}
        >
          {editingTemplate ? 'Güncelle' : 'Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

TemplateFormDialog.displayName = 'TemplateFormDialog';

// Reset Counter Dialog Component - Local State ile Ping Sorunu Çözümü
interface ResetCounterDialogProps {
  open: boolean;
  template: CodeTemplate | null;
  initialResetValue: number;
  onClose: () => void;
  onSubmit: (value: number) => void;
}

const ResetCounterDialog = memo(({
  open,
  template,
  initialResetValue,
  onClose,
  onSubmit,
}: ResetCounterDialogProps) => {
  // Local State - Parent'ı etkilemez
  const [localResetValue, setLocalResetValue] = useState(initialResetValue);

  // initialResetValue değiştiğinde local state'i güncelle
  useEffect(() => {
    setLocalResetValue(initialResetValue);
  }, [initialResetValue]);

  // Local submit
  const handleLocalSubmit = useCallback(() => {
    onSubmit(localResetValue);
  }, [localResetValue, onSubmit]);

  // Hook'lar bittikten SONRA conditional return
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle component="div">Sayaç Sıfırla</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {template?.name} için sayacı sıfırlamak üzeresiniz.
              Bu işlem geri alınamaz!
            </Typography>
          </Alert>
          <TextField
            fullWidth
            type="number"
            label="Yeni Değer"
            value={localResetValue}
            onChange={(e) => setLocalResetValue(parseInt(e.target.value) || 0)}
            inputProps={{ min: 0 }}
            helperText="Sayacı sıfırlamak için 0 girin"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button
          onClick={handleLocalSubmit}
          variant="contained"
          color="warning"
        >
          Sıfırla
        </Button>
      </DialogActions>
    </Dialog>
  );
});

ResetCounterDialog.displayName = 'ResetCounterDialog';

export default function NumaraSablonlariPage() {
  const [templates, setTemplates] = useState<CodeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CodeTemplate | null>(null);
  const [resetTemplate, setResetTemplate] = useState<CodeTemplate | null>(null);

  // Initial form data - sadece dialog açıldığında kullanılır
  const [initialFormData, setInitialFormData] = useState({
    module: '',
    name: '',
    prefix: '',
    digitCount: 3,
    currentValue: 0,
    includeYear: false,
    isActive: true,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Snackbar handler - önce tanımla
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // useCallback ile optimize edilmiş fetch
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/code-template');
      setTemplates(response.data);
    } catch (error: any) {
      showSnackbar('Şablonlar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  // useEffect - fetchTemplates tanımlandıktan sonra
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Dialog açma - initialFormData hazırla
  const handleOpenDialog = useCallback((template?: CodeTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setInitialFormData({
        module: template.module,
        name: template.name,
        prefix: template.prefix,
        digitCount: template.digitCount,
        currentValue: template.currentValue,
        includeYear: template.includeYear || false,
        isActive: template.isActive,
      });
    } else {
      setEditingTemplate(null);
      setInitialFormData({
        module: '',
        name: '',
        prefix: '',
        digitCount: 3,
        currentValue: 0,
        includeYear: false,
        isActive: true,
      });
    }
    setDialogOpen(true);
  }, []);

  // Dialog kapatma
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingTemplate(null);
  }, []);

  // Submit handler - useCallback ile optimize edilmiş
  const handleSubmit = useCallback(async (submitFormData: {
    module: string;
    name: string;
    prefix: string;
    digitCount: number;
    currentValue: number;
    includeYear: boolean;
    isActive: boolean;
  }) => {
    try {
      if (editingTemplate) {
        // Update - module alanını gönderme
        const { module, ...updateData } = submitFormData;
        await axios.patch(`/code-template/${editingTemplate.id}`, updateData);
        showSnackbar('Şablon güncellendi', 'success');
      } else {
        // Create
        await axios.post('/code-template', submitFormData);
        showSnackbar('Şablon eklendi', 'success');
      }
      handleCloseDialog();
      fetchTemplates();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
    }
  }, [editingTemplate, handleCloseDialog, fetchTemplates, showSnackbar]);

  // Delete handler
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;

    try {
      await axios.delete(`/code-template/${id}`);
      showSnackbar('Şablon silindi', 'success');
      fetchTemplates();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme işlemi başarısız', 'error');
    }
  }, [fetchTemplates, showSnackbar]);

  // Reset dialog açma
  const handleOpenResetDialog = useCallback((template: CodeTemplate) => {
    setResetTemplate(template);
    setResetDialogOpen(true);
  }, []);

  // Reset counter handler - useCallback ile optimize edilmiş
  const handleResetCounter = useCallback(async (newValue: number) => {
    if (!resetTemplate) return;

    try {
      await axios.post(`/code-template/reset-counter/${resetTemplate.module}`, {
        newValue: newValue,
      });
      showSnackbar('Sayaç sıfırlandı', 'success');
      setResetDialogOpen(false);
      setResetTemplate(null);
      fetchTemplates();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
    }
  }, [resetTemplate, fetchTemplates, showSnackbar]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Preview code generator - memoized
  const getPreviewCode = useCallback((template: CodeTemplate) => {
    const nextValue = template.currentValue + 1;
    const paddedNumber = String(nextValue).padStart(template.digitCount, '0');
    if (template.includeYear) {
      const currentYear = new Date().getFullYear();
      return `${template.prefix}${currentYear}${paddedNumber}`;
    }
    return `${template.prefix}${paddedNumber}`;
  }, []);

  // Örnek şablonları ekleme fonksiyonu
  const handleAddExampleTemplates = useCallback(async () => {
    if (!confirm('Tüm modüller için örnek şablonları eklemek istediğinize emin misiniz?\n\nBu işlem tüm örnek şablonları oluşturacaktır.')) return;

    try {
      setLoading(true);
      let successCount = 0;
      let skipCount = 0;

      for (const exampleTemplate of exampleTemplates) {
        // Bu modül için zaten bir şablon var mı kontrol et
        const existingTemplate = templates.find(t => t.module === exampleTemplate.module);
        
        if (existingTemplate) {
          skipCount++;
          continue;
        }

        try {
          await axios.post('/code-template', exampleTemplate);
          successCount++;
        } catch (error) {
          console.error(`Şablon eklenemedi (${exampleTemplate.module}):`, error);
        }
      }

      await fetchTemplates();

      if (successCount > 0) {
        showSnackbar(`${successCount} şablon başarıyla eklendi${skipCount > 0 ? ` (${skipCount} şablon zaten mevcuttu)` : ''}`, 'success');
      } else if (skipCount > 0) {
        showSnackbar(`Tüm şablonlar zaten mevcut`, 'info');
      } else {
        showSnackbar('Hiçbir şablon eklenemedi', 'error');
      }
    } catch (error: any) {
      showSnackbar('Şablonlar eklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [templates, fetchTemplates, showSnackbar]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Şablon Adı',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'module',
      headerName: 'Modül',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const option = moduleOptions.find((opt) => opt.value === params.value);
        return <Chip label={option?.label || params.value} size="small" color="primary" variant="outlined" />;
      },
    },
    {
      field: 'prefix',
      headerName: 'Ön Ek',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" color="secondary" />
      ),
    },
    {
      field: 'digitCount',
      headerName: 'Hane',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'currentValue',
      headerName: 'Mevcut Değer',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'includeYear',
      headerName: 'Yıl Dahil',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Evet' : 'Hayır'}
          size="small"
          color={params.value ? 'info' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'preview',
      headerName: 'Sonraki Kod',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={getPreviewCode(params.row)}
          size="small"
          color="success"
          variant="outlined"
        />
      ),
    },
    {
      field: 'isActive',
      headerName: 'Durum',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Aktif' : 'Pasif'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Düzenle">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenDialog(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sayaç Sıfırla">
            <IconButton
              size="small"
              color="warning"
              onClick={() => handleOpenResetDialog(params.row)}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sil">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings color="primary" />
              Numara Şablonları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Otomatik kod oluşturma şablonlarını yönetin
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AutoAwesome />}
              onClick={handleAddExampleTemplates}
              disabled={loading}
            >
              Örnek Şablonları Ekle
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Yeni Şablon Ekle
            </Button>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }} icon={<Info />}>
          <Typography variant="body2">
            <strong>Kullanım:</strong> Her modül için bir kod şablonu tanımlayabilirsiniz.
            Yeni kayıt oluştururken kod alanı boş bırakılırsa, otomatik olarak bu şablonlara göre kod üretilir.
            <br />
            <strong>Örnek:</strong> Depo için "D" ön eki ve 3 hane → D001, D002, D003...
            <br />
            <strong>Yıl Dahil Format:</strong> Satış faturaları için "AZM" ön eki, yıl ve 9 hane → AZM2025000000001, AZM2025000000002...
          </Typography>
        </Alert>

        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={templates}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        </Paper>

        {/* Create/Edit Dialog - Local State ile Ping Sorunu Çözüldü */}
        <TemplateFormDialog
          open={dialogOpen}
          initialFormData={initialFormData}
          editingTemplate={editingTemplate}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
        />

        {/* Reset Counter Dialog - Local State ile Ping Sorunu Çözüldü */}
        <ResetCounterDialog
          open={resetDialogOpen}
          template={resetTemplate}
          initialResetValue={0}
          onClose={() => setResetDialogOpen(false)}
          onSubmit={handleResetCounter}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}

