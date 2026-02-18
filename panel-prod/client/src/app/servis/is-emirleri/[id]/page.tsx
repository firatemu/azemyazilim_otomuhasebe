'use client';

import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import {
  Technician,
  WorkOrder,
  WorkOrderStatus,
  getStatusColor,
  getStatusLabel,
  getValidNextStatuses
} from '@/types/servis';
import {
  AccessTime,
  Add,
  ArrowBack,
  Assignment,
  Build,
  Cancel,
  Category,
  CheckCircle,
  Description,
  DirectionsCar,
  Done,
  History,
  Info,
  Inventory,
  LocalShipping,
  Note,
  Person,
  ReceiptLong,
  VerifiedUser,
  Warning
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import DiagnosticNotesTab from './components/DiagnosticNotesTab';
import SupplyRequestsTab from './components/SupplyRequestsTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function WorkOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const workOrderId = params.id as string;

  const [tabValue, setTabValue] = useState(0);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<WorkOrderStatus | ''>('');

  // Parça ekleme state'leri
  const [addFromStockDialogOpen, setAddFromStockDialogOpen] = useState(false);
  const [requestSupplyDialogOpen, setRequestSupplyDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [supplyDescription, setSupplyDescription] = useState('');
  const [supplyQuantity, setSupplyQuantity] = useState<number>(1);

  // Fetch work order
  const { data: workOrder, isLoading, error, refetch } = useQuery({
    queryKey: ['work-order', workOrderId],
    queryFn: async () => {
      const response = await axios.get(`/work-orders/${workOrderId}`);
      return response.data as WorkOrder;
    },
    enabled: !!workOrderId,
  });

  // Fetch technicians
  const { data: techniciansData } = useQuery({
    queryKey: ['technicians-list'],
    queryFn: async () => {
      const response = await axios.get('/technicians', { params: { limit: 100, isActive: 'true' } });
      return response.data;
    },
  });

  const technicians: Technician[] = techniciansData?.data || [];

  // Fetch products for stock selection
  const { data: productsData } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const response = await axios.get('/stok', { params: { limit: 1000 } });
      return response.data.data || [];
    },
  });
  const products: any[] = productsData || [];

  // Mutations
  const assignTechnicianMutation = useMutation({
    mutationFn: async (technicianId: string) => {
      const response = await axios.put(`/work-orders/${workOrderId}/assign-technician`, { technicianId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
      setAssignDialogOpen(false);
      setSelectedTechnician('');
    },
  });

  const [statusErrorMessage, setStatusErrorMessage] = useState<string | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async (status: WorkOrderStatus) => {
      const response = await axios.put(`/work-orders/${workOrderId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
      setStatusDialogOpen(false);
      setSelectedStatus('');
      setStatusErrorMessage(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Durum güncelleme sırasında bir hata oluştu';
      setStatusErrorMessage(message);
      setTimeout(() => setStatusErrorMessage(null), 5000);
    },
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestApprovalMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/work-orders/${workOrderId}/request-approval`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
      setErrorMessage(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Onay talebi sırasında bir hata oluştu';
      setErrorMessage(message);
      // 3 saniye sonra mesajı temizle
      setTimeout(() => setErrorMessage(null), 3000);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/work-orders/${workOrderId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/work-orders/${workOrderId}/close`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/work-orders/${workOrderId}/generate-invoice`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
    },
  });

  // Add part from stock mutation
  const addPartFromStockMutation = useMutation({
    mutationFn: async (data: { productId: string; quantity: number; description?: string }) => {
      const response = await axios.post(`/work-orders/${workOrderId}/parts/from-stock`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
      setAddFromStockDialogOpen(false);
      setSelectedProduct(null);
      setQuantity(1);
    },
  });

  // Request part supply mutation
  const requestPartSupplyMutation = useMutation({
    mutationFn: async (data: { description: string; quantity: number }) => {
      const response = await axios.post(`/work-orders/${workOrderId}/parts/request-supply`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
      setRequestSupplyDialogOpen(false);
      setSupplyDescription('');
      setSupplyQuantity(1);
    },
  });

  // Toggle part used mutation
  const togglePartUsedMutation = useMutation({
    mutationFn: async (lineId: string) => {
      const response = await axios.put(`/work-orders/${workOrderId}/parts/${lineId}/toggle-used`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error || !workOrder) {
    return (
      <MainLayout>
        <Alert severity="error" sx={{ mt: 2 }}>
          İş emri bulunamadı veya yüklenirken bir hata oluştu.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mt: 2 }}>
          Geri Dön
        </Button>
      </MainLayout>
    );
  }

  const isReadOnly = workOrder.status === 'CLOSED' || workOrder.status === 'CANCELLED';
  const laborLines = workOrder.lines?.filter((l) => l.lineType === 'LABOR') || [];
  const partLines = workOrder.lines?.filter((l) => l.lineType === 'PART') || [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleString('tr-TR') : '-';

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'STATUS_CHANGE':
        return <History color="primary" />;
      case 'TECHNICIAN_ASSIGNED':
        return <Build color="secondary" />;
      case 'APPROVAL_REQUESTED':
        return <Warning color="warning" />;
      case 'APPROVED':
        return <CheckCircle color="success" />;
      case 'WORK_ORDER_CLOSED':
        return <Done color="success" />;
      case 'LINE_ADDED':
        return <Assignment color="info" />;
      case 'PART_MARKED_USED':
        return <LocalShipping color="primary" />;
      case 'INVOICE_GENERATED':
        return <ReceiptLong color="success" />;
      default:
        return <Info color="action" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      WORK_ORDER_CREATED: 'İş Emri Oluşturuldu',
      STATUS_CHANGE: 'Durum Değişikliği',
      TECHNICIAN_ASSIGNED: 'Teknisyen Atandı',
      APPROVAL_REQUESTED: 'Onay Talep Edildi',
      APPROVED: 'Onaylandı',
      WORK_ORDER_CLOSED: 'İş Emri Kapatıldı',
      LINE_ADDED: 'Kalem Eklendi',
      PART_MARKED_USED: 'Parça Kullanıldı',
      INVOICE_GENERATED: 'Fatura Oluşturuldu',
    };
    return labels[action] || action;
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  İş Emri #{workOrder.workOrderNo}
                </Typography>
                <Chip
                  label={getStatusLabel(workOrder.status)}
                  color={getStatusColor(workOrder.status)}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Kabul: {formatDate(workOrder.acceptedAt)}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {!isReadOnly && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setAssignDialogOpen(true)}
                >
                  Teknisyen Ata
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setStatusDialogOpen(true)}
                >
                  Durum Değiştir
                </Button>
                {workOrder.status === 'DIAGNOSIS' && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      color="warning"
                      onClick={() => {
                        setErrorMessage(null);
                        requestApprovalMutation.mutate();
                      }}
                      disabled={requestApprovalMutation.isPending || (workOrder.lines?.length || 0) === 0}
                      title={(workOrder.lines?.length || 0) === 0 ? 'Onay talep etmek için en az bir işçilik veya parça satırı eklenmeli' : ''}
                    >
                      Onay Talep Et
                    </Button>
                    {errorMessage && (
                      <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                        {errorMessage}
                      </Alert>
                    )}
                  </>
                )}
                {workOrder.status === 'WAITING_FOR_APPROVAL' && (
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                  >
                    Onayla
                  </Button>
                )}
                {workOrder.status === 'READY_FOR_DELIVERY' && !workOrder.invoiceId && (
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    startIcon={<ReceiptLong />}
                    onClick={() => generateInvoiceMutation.mutate()}
                    disabled={generateInvoiceMutation.isPending}
                  >
                    Fatura Oluştur
                  </Button>
                )}
                {(workOrder.status === 'INVOICED' || workOrder.status === 'READY_FOR_DELIVERY') && (
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    startIcon={<Done />}
                    onClick={() => closeMutation.mutate()}
                    disabled={closeMutation.isPending}
                  >
                    Kapat
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Info Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DirectionsCar color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Araç Bilgileri
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {workOrder.vehicle?.plateNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {workOrder.vehicle?.brand} {workOrder.vehicle?.model}{' '}
                  {workOrder.vehicle?.year ? `(${workOrder.vehicle.year})` : ''}
                </Typography>
                {workOrder.vehicle?.mileage && (
                  <Typography variant="caption" color="text.secondary">
                    {workOrder.vehicle.mileage.toLocaleString('tr-TR')} km
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Person color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Müşteri Bilgileri
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {workOrder.customer?.unvan ||
                    `${workOrder.customer?.ad || ''} ${workOrder.customer?.soyad || ''}`.trim() ||
                    '-'}
                </Typography>
                {workOrder.customer?.telefon && (
                  <Typography variant="body2" color="text.secondary">
                    Tel: {workOrder.customer.telefon}
                  </Typography>
                )}
                {workOrder.customer?.email && (
                  <Typography variant="caption" color="text.secondary">
                    {workOrder.customer.email}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Build color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Teknisyen
                  </Typography>
                </Box>
                {workOrder.technician ? (
                  <>
                    <Typography variant="h6" fontWeight="bold">
                      {workOrder.technician.firstName} {workOrder.technician.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {workOrder.technician.specialization || 'Genel'}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Henüz atanmadı
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': { minHeight: 56 },
            }}
          >
            <Tab icon={<Description />} label="Şikayet" iconPosition="start" />
            <Tab icon={<Build />} label="İşçilik" iconPosition="start" />
            <Tab icon={<Category />} label="Parçalar" iconPosition="start" />
            <Tab icon={<CheckCircle />} label="Onay" iconPosition="start" />
            <Tab icon={<VerifiedUser />} label="Kalite Kontrol" iconPosition="start" />
            <Tab icon={<Note />} label="Teşhis Notları" iconPosition="start" />
            <Tab icon={<Inventory />} label="Tedarik İstekleri" iconPosition="start" />
          </Tabs>

          {/* Tab: Şikayet */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Müşteri Şikayeti
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  minHeight: 150,
                  bgcolor: '#fafafa',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {workOrder.complaint || (
                  <Typography color="text.secondary">Şikayet kaydedilmemiş</Typography>
                )}
              </Paper>
            </Box>
          </TabPanel>

          {/* Tab: İşçilik */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                İşçilik Kalemleri
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Açıklama</TableCell>
                      <TableCell align="right">Saat</TableCell>
                      <TableCell align="right">Saat Ücreti</TableCell>
                      <TableCell align="right">İskonto</TableCell>
                      <TableCell align="right">KDV</TableCell>
                      <TableCell align="right">Toplam</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {laborLines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary">İşçilik kalemi yok</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      laborLines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell>{line.description || '-'}</TableCell>
                          <TableCell align="right">{line.laborHours || 0}</TableCell>
                          <TableCell align="right">{formatCurrency(Number(line.hourlyRate) || 0)}</TableCell>
                          <TableCell align="right">{line.discountRate}%</TableCell>
                          <TableCell align="right">%{line.taxRate}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(Number(line.lineTotal))}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* İşçilik Totals */}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ minWidth: 280 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>İşçilik Toplamı:</Typography>
                    <Typography fontWeight="bold">
                      {formatCurrency(Number(workOrder.laborTotal) || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Tab: Parçalar */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ px: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Parça Kalemleri
                </Typography>
                {!isReadOnly && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Inventory />}
                      onClick={() => setAddFromStockDialogOpen(true)}
                    >
                      Stoktan Ekle
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => setRequestSupplyDialogOpen(true)}
                    >
                      Tedarik İste
                    </Button>
                  </Box>
                )}
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Tedarik İsteği</TableCell>
                      <TableCell>Parça</TableCell>
                      <TableCell align="center">Kaynak</TableCell>
                      <TableCell align="center">Durum</TableCell>
                      <TableCell align="right">Adet</TableCell>
                      <TableCell align="center">Kullanıldı</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partLines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary">Parça kalemi yok</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      partLines.map((line) => {
                        const partSourceLabel = line.partSource === 'SUPPLY_REQUEST' ? 'Tedarik' : 'Stoktan';
                        const statusLabel = line.supplyRequestStatus === 'PENDING' ? 'Beklemede'
                          : line.supplyRequestStatus === 'APPROVED' ? 'Onaylandı'
                            : line.supplyRequestStatus === 'REJECTED' ? 'Reddedildi'
                              : '-';
                        const statusColor = line.supplyRequestStatus === 'PENDING' ? 'warning'
                          : line.supplyRequestStatus === 'APPROVED' ? 'success'
                            : line.supplyRequestStatus === 'REJECTED' ? 'error'
                              : 'default';

                        // #region agent log
                        if (line.partSource === 'SUPPLY_REQUEST') {
                          console.log('[DEBUG] Tedarik İsteği Kolonu - line data:', {
                            lineId: line.id,
                            partSource: line.partSource,
                            description: line.description,
                            productStokAdi: line.product?.stokAdi,
                            supplyRequestStatus: line.supplyRequestStatus,
                            quantity: line.quantity,
                          });
                        }
                        // #endregion

                        return (
                          <TableRow key={line.id}>
                            {/* Tedarik İsteği Kolonu - Sadece tedarik istekleri için göster */}
                            <TableCell>
                              {line.partSource === 'SUPPLY_REQUEST' ? (
                                <Typography variant="body2">
                                  {line.description || '-'} ({line.quantity})
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            {/* Parça Kolonu - Stoktan seçilen/seçilecek ürün bilgisi */}
                            <TableCell>
                              {line.product ? (
                                <>
                                  <Typography variant="body2">
                                    {line.product.stokAdi}
                                  </Typography>
                                  {line.product.stokKodu && (
                                    <Typography variant="caption" display="block" color="text.secondary">
                                      {line.product.stokKodu}
                                    </Typography>
                                  )}
                                </>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {line.partSource === 'SUPPLY_REQUEST' && line.supplyRequestStatus === 'PENDING'
                                    ? 'Beklemede...'
                                    : '-'}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={partSourceLabel} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="center">
                              {line.partSource === 'SUPPLY_REQUEST' && (
                                <Chip label={statusLabel} size="small" color={statusColor as any} />
                              )}
                              {line.partSource !== 'SUPPLY_REQUEST' && <Typography variant="caption">-</Typography>}
                            </TableCell>
                            <TableCell align="right">{line.quantity}</TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                variant={line.isUsed ? 'contained' : 'outlined'}
                                color={line.isUsed ? 'success' : 'inherit'}
                                onClick={() => togglePartUsedMutation.mutate(line.id)}
                                disabled={togglePartUsedMutation.isPending || isReadOnly}
                              >
                                {line.isUsed ? 'Kullanıldı' : 'Kullan'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

            </Box>

            {/* Dialog: Stoktan Ekle */}
            <Dialog open={addFromStockDialogOpen} onClose={() => setAddFromStockDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Stoktan Parça Ekle</DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2 }}>
                  <Autocomplete
                    fullWidth
                    options={products}
                    getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                    value={selectedProduct}
                    onChange={(_, newValue) => setSelectedProduct(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Ürün Seçin" placeholder="Ürün kodu veya adı ile ara..." />
                    )}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;
                      return (
                        <Box component="li" key={key} {...otherProps}>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {option.stokAdi}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.stokKodu}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Adet"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                    sx={{ mb: 2 }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setAddFromStockDialogOpen(false)}>İptal</Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (selectedProduct && quantity > 0) {
                      addPartFromStockMutation.mutate({
                        productId: selectedProduct.id,
                        quantity,
                        description: selectedProduct.stokAdi,
                      });
                    }
                  }}
                  disabled={!selectedProduct || quantity < 1 || addPartFromStockMutation.isPending}
                >
                  {addPartFromStockMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dialog: Tedarik İste */}
            <Dialog open={requestSupplyDialogOpen} onClose={() => setRequestSupplyDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Tedarik İste</DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2 }}>
                  <TextField
                    fullWidth
                    label="Parça Açıklaması"
                    placeholder="Örn: Hava filtresi, Polen filtresi"
                    value={supplyDescription}
                    onChange={(e) => setSupplyDescription(e.target.value)}
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Adet"
                    value={supplyQuantity}
                    onChange={(e) => setSupplyQuantity(parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setRequestSupplyDialogOpen(false)}>İptal</Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (supplyDescription.trim() && supplyQuantity > 0) {
                      requestPartSupplyMutation.mutate({
                        description: supplyDescription.trim(),
                        quantity: supplyQuantity,
                      });
                    }
                  }}
                  disabled={!supplyDescription.trim() || supplyQuantity < 1 || requestPartSupplyMutation.isPending}
                >
                  {requestPartSupplyMutation.isPending ? 'Gönderiliyor...' : 'Tedarik İste'}
                </Button>
              </DialogActions>
            </Dialog>
          </TabPanel>

          {/* Tab: Onay */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ px: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Onay Durumu
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {workOrder.approvedAt ? (
                        <CheckCircle color="success" sx={{ fontSize: 40 }} />
                      ) : workOrder.status === 'WAITING_FOR_APPROVAL' ? (
                        <AccessTime color="warning" sx={{ fontSize: 40 }} />
                      ) : (
                        <Info color="action" sx={{ fontSize: 40 }} />
                      )}
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {workOrder.approvedAt
                            ? 'Onaylandı'
                            : workOrder.status === 'WAITING_FOR_APPROVAL'
                              ? 'Onay Bekleniyor'
                              : 'Henüz Onay Talep Edilmedi'}
                        </Typography>
                        {workOrder.approvedAt && (
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(workOrder.approvedAt)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Tahmini Teslim
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6">
                      {workOrder.estimatedDelivery
                        ? formatDate(workOrder.estimatedDelivery)
                        : 'Belirlenmedi'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Tab: Kalite Kontrol */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ px: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Kalite Kontrol Notları
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  minHeight: 150,
                  bgcolor: '#fafafa',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {workOrder.qualityNotes || (
                  <Typography color="text.secondary">Kalite kontrol notu girilmemiş</Typography>
                )}
              </Paper>

              {workOrder.status === 'QUALITY_CONTROL' && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => updateStatusMutation.mutate('READY_FOR_DELIVERY')}
                    disabled={updateStatusMutation.isPending}
                  >
                    Kalite Kontrol Onayı
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => updateStatusMutation.mutate('IN_PROGRESS')}
                    disabled={updateStatusMutation.isPending}
                  >
                    Geri Gönder
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Tab: Diagnostic Notes */}
          <TabPanel value={tabValue} index={5}>
            <DiagnosticNotesTab workOrderId={workOrderId} />
          </TabPanel>

          {/* Tab: Tedarik İstekleri */}
          <TabPanel value={tabValue} index={6}>
            <SupplyRequestsTab workOrderId={workOrderId} />
          </TabPanel>
        </Paper>

        {/* Assign Technician Dialog */}
        <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Teknisyen Ata</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Teknisyen</InputLabel>
              <Select
                value={selectedTechnician}
                label="Teknisyen"
                onChange={(e) => setSelectedTechnician(e.target.value)}
              >
                {technicians.map((tech) => (
                  <MenuItem key={tech.id} value={tech.id}>
                    {tech.firstName} {tech.lastName} - {tech.specialization || 'Genel'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignDialogOpen(false)}>İptal</Button>
            <Button
              variant="contained"
              onClick={() => assignTechnicianMutation.mutate(selectedTechnician)}
              disabled={!selectedTechnician || assignTechnicianMutation.isPending}
            >
              Ata
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => {
          setStatusDialogOpen(false);
          setStatusErrorMessage(null);
          setSelectedStatus('');
        }} maxWidth="sm" fullWidth>
          <DialogTitle>Durum Değiştir</DialogTitle>
          <DialogContent>
            {workOrder && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Mevcut Durum: <strong>{getStatusLabel(workOrder.status)}</strong>
                </Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Yeni Durum</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Yeni Durum"
                    onChange={(e) => {
                      setSelectedStatus(e.target.value as WorkOrderStatus);
                      setStatusErrorMessage(null);
                    }}
                  >
                    {getValidNextStatuses(workOrder.status)
                      .filter((s) => s !== 'CLOSED' && s !== 'CANCELLED')
                      .map((status) => (
                        <MenuItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                {getValidNextStatuses(workOrder.status).length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Bu durumdan geçiş yapılamaz.
                  </Alert>
                )}
                {statusErrorMessage && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {statusErrorMessage}
                  </Alert>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setStatusDialogOpen(false);
              setStatusErrorMessage(null);
              setSelectedStatus('');
            }}>İptal</Button>
            <Button
              variant="contained"
              onClick={() => {
                if (selectedStatus && workOrder) {
                  setStatusErrorMessage(null);
                  updateStatusMutation.mutate(selectedStatus);
                }
              }}
              disabled={!selectedStatus || updateStatusMutation.isPending || !workOrder || getValidNextStatuses(workOrder.status).length === 0}
            >
              Güncelle
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}

