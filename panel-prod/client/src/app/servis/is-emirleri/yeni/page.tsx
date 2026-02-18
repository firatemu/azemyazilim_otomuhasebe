'use client';

import React, { useState, Suspense } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Alert,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  DirectionsCar,
  Person,
  Save,
  Add,
  PersonAdd,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { Vehicle, Customer } from '@/types/servis';

interface CreateWorkOrderForm {
  vehicleId: string;
  customerId: string;
  complaint: string;
  estimatedDelivery: string;
  internalNotes: string;
}

interface QuickVehicleForm {
  plateNumber: string;
  brand: string;
  model: string;
  year: string;
  firstRegistrationDate: string;
  fuelType: string;
  engineSize: string;
  color: string;
  mileage: string;
  vin: string;
  customerId: string;
}

interface QuickCustomerForm {
  unvan: string;
  telefon: string;
  email: string;
  tip: string;
}

const popularBrands = [
  'Audi', 'BMW', 'Chevrolet', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda',
  'Hyundai', 'Kia', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot',
  'Renault', 'Seat', 'Skoda', 'Toyota', 'Volkswagen', 'Volvo'
];

const fuelTypes = ['Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit'];

function NewWorkOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const preselectedVehicleId = searchParams.get('vehicleId') || '';

  const [form, setForm] = useState<CreateWorkOrderForm>({
    vehicleId: preselectedVehicleId,
    customerId: '',
    complaint: '',
    estimatedDelivery: '',
    internalNotes: '',
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Quick add dialogs
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [quickVehicle, setQuickVehicle] = useState<QuickVehicleForm>({
    plateNumber: '',
    brand: '',
    model: '',
    year: '',
    firstRegistrationDate: '',
    fuelType: '',
    engineSize: '',
    color: '',
    mileage: '',
    vin: '',
    customerId: '',
  });
  const [quickCustomer, setQuickCustomer] = useState<QuickCustomerForm>({
    unvan: '',
    telefon: '',
    email: '',
    tip: 'MUSTERI',
  });

  // Fetch vehicles for autocomplete
  const { data: vehiclesData, isLoading: vehiclesLoading, refetch: refetchVehicles } = useQuery({
    queryKey: ['vehicles-search', vehicleSearch],
    queryFn: async () => {
      const params: Record<string, unknown> = { limit: 50 };
      if (vehicleSearch && vehicleSearch.length >= 2) {
        params.search = vehicleSearch;
      }
      const response = await axios.get('/vehicles', { params });
      return response.data;
    },
    enabled: true,
  });

  // Fetch customers for autocomplete
  const { data: customersData, isLoading: customersLoading, refetch: refetchCustomers } = useQuery({
    queryKey: ['customers-search', customerSearch],
    queryFn: async () => {
      const params: Record<string, unknown> = { limit: 50 };
      if (customerSearch && customerSearch.length >= 2) {
        params.search = customerSearch;
      }
      const response = await axios.get('/cari', { params });
      return response.data;
    },
    enabled: true,
  });

  // Fetch preselected vehicle
  const { data: preselectedVehicle } = useQuery({
    queryKey: ['vehicle', preselectedVehicleId],
    queryFn: async () => {
      const response = await axios.get(`/vehicles/${preselectedVehicleId}`);
      return response.data as Vehicle;
    },
    enabled: !!preselectedVehicleId,
  });

  // Set preselected vehicle
  React.useEffect(() => {
    if (preselectedVehicle) {
      setSelectedVehicle(preselectedVehicle);
      setForm((prev) => ({
        ...prev,
        vehicleId: preselectedVehicle.id,
        customerId: preselectedVehicle.customerId || '',
      }));
      if (preselectedVehicle.customer) {
        setSelectedCustomer(preselectedVehicle.customer as Customer);
      }
    }
  }, [preselectedVehicle]);

  const vehicles: Vehicle[] = vehiclesData?.data || [];
  const customers: Customer[] = customersData?.data || [];

  // Create work order mutation
  const createWorkOrderMutation = useMutation({
    mutationFn: async (data: CreateWorkOrderForm) => {
      const response = await axios.post('/work-orders', {
        vehicleId: data.vehicleId,
        customerId: data.customerId,
        complaint: data.complaint || undefined,
        estimatedDelivery: data.estimatedDelivery || undefined,
        // internalNotes CreateWorkOrderDto'da yok, sadece UpdateWorkOrderDto'da var
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      router.push(`/servis/is-emirleri/${data.id}`);
    },
  });

  // Quick add vehicle mutation
  const createVehicleMutation = useMutation({
    mutationFn: async (data: QuickVehicleForm) => {
      const response = await axios.post('/vehicles', {
        plateNumber: data.plateNumber.toUpperCase().replace(/\s/g, ''),
        brand: data.brand,
        model: data.model,
        year: data.year ? parseInt(data.year) : undefined,
        firstRegistrationDate: data.firstRegistrationDate || undefined,
        fuelType: data.fuelType || undefined,
        engineSize: data.engineSize || undefined,
        color: data.color || undefined,
        mileage: data.mileage ? parseInt(data.mileage) : undefined,
        vin: data.vin ? data.vin.toUpperCase() : undefined,
        customerId: data.customerId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      refetchVehicles();
      setSelectedVehicle(data);
      setForm((prev) => ({ ...prev, vehicleId: data.id }));
      setVehicleDialogOpen(false);
      setQuickVehicle({
        plateNumber: '',
        brand: '',
        model: '',
        year: '',
        firstRegistrationDate: '',
        fuelType: '',
        engineSize: '',
        color: '',
        mileage: '',
        vin: '',
        customerId: ''
      });
    },
  });

  // Quick add customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (data: QuickCustomerForm) => {
      const payload: any = {
        unvan: data.unvan,
        tip: data.tip,
      };

      // Only include telefon if it's not empty
      if (data.telefon && data.telefon.trim()) {
        payload.telefon = data.telefon;
      }

      // Only include email if it's not empty
      if (data.email && data.email.trim()) {
        payload.email = data.email;
      }

      const response = await axios.post('/cari', payload);
      return response.data;
    },
    onSuccess: (data) => {
      refetchCustomers();
      setSelectedCustomer(data);
      setForm((prev) => ({ ...prev, customerId: data.id }));
      // Also set as vehicle's customer if adding vehicle
      setQuickVehicle((prev) => ({ ...prev, customerId: data.id }));
      setCustomerDialogOpen(false);
      setQuickCustomer({ unvan: '', telefon: '', email: '', tip: 'MUSTERI' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.customerId) {
      return;
    }
    createWorkOrderMutation.mutate(form);
  };

  const handleVehicleChange = (vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
    if (vehicle) {
      setForm((prev) => ({
        ...prev,
        vehicleId: vehicle.id,
        customerId: vehicle.customerId || prev.customerId,
      }));
      if (vehicle.customer) {
        setSelectedCustomer(vehicle.customer as Customer);
      }
    } else {
      setForm((prev) => ({ ...prev, vehicleId: '' }));
    }
  };

  const handleCustomerChange = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setForm((prev) => ({
      ...prev,
      customerId: customer?.id || '',
    }));
  };

  const handleOpenVehicleDialog = () => {
    // Pre-fill customer if already selected
    if (selectedCustomer) {
      setQuickVehicle((prev) => ({ ...prev, customerId: selectedCustomer.id }));
    }
    setVehicleDialogOpen(true);
  };

  const handleQuickVehicleSubmit = () => {
    if (!quickVehicle.plateNumber || !quickVehicle.brand || !quickVehicle.model || !quickVehicle.customerId) {
      return;
    }
    createVehicleMutation.mutate(quickVehicle);
  };

  const handleQuickCustomerSubmit = () => {
    if (!quickCustomer.unvan) {
      return;
    }
    createCustomerMutation.mutate(quickCustomer);
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Yeni İş Emri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yeni bir servis iş emri oluşturun
            </Typography>
          </Box>
        </Box>

        {createWorkOrderMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            İş emri oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column - Vehicle & Customer */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCar color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        Araç ve Müşteri Bilgileri
                      </Typography>
                    </Box>
                  </Box>

                  {/* Vehicle Selection with Quick Add */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Autocomplete
                      sx={{ flex: 1 }}
                      options={vehicles}
                      value={selectedVehicle}
                      onChange={(_, value) => handleVehicleChange(value)}
                      onInputChange={(_, value) => setVehicleSearch(value)}
                      getOptionLabel={(option) =>
                        `${option.plateNumber} - ${option.brand} ${option.model}`
                      }
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      loading={vehiclesLoading}
                      noOptionsText="Araç bulunamadı"
                      loadingText="Yükleniyor..."
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Araç Seçin *"
                          placeholder="Plaka veya model ile arayın..."
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {vehiclesLoading ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          <Box>
                            <Typography fontWeight={600}>{option.plateNumber}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.brand} {option.model} {option.year && `(${option.year})`}
                            </Typography>
                          </Box>
                        </li>
                      )}
                    />
                    <Tooltip title="Hızlı Araç Ekle">
                      <IconButton
                        color="primary"
                        onClick={handleOpenVehicleDialog}
                        sx={{ bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}
                      >
                        <Add />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Selected Vehicle Info */}
                  {selectedVehicle && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#e8f5e9' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                        ✓ Seçili Araç
                      </Typography>
                      <Typography>
                        {selectedVehicle.plateNumber} - {selectedVehicle.brand}{' '}
                        {selectedVehicle.model}
                      </Typography>
                      {selectedVehicle.mileage && (
                        <Typography variant="caption" color="text.secondary">
                          {selectedVehicle.mileage.toLocaleString('tr-TR')} km
                        </Typography>
                      )}
                    </Paper>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Customer Selection with Quick Add */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Autocomplete
                      sx={{ flex: 1 }}
                      options={customers}
                      value={selectedCustomer}
                      onChange={(_, value) => handleCustomerChange(value)}
                      onInputChange={(_, value) => setCustomerSearch(value)}
                      getOptionLabel={(option) =>
                        option.unvan || `${option.ad || ''} ${option.soyad || ''}`.trim() || '-'
                      }
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      loading={customersLoading}
                      disabled={!!selectedVehicle?.customer}
                      noOptionsText="Müşteri bulunamadı"
                      loadingText="Yükleniyor..."
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Müşteri Seçin *"
                          placeholder="Müşteri adı ile arayın..."
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {customersLoading ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          <Box>
                            <Typography fontWeight={600}>
                              {option.unvan || `${option.ad || ''} ${option.soyad || ''}`.trim()}
                            </Typography>
                            {option.telefon && (
                              <Typography variant="caption" color="text.secondary">
                                {option.telefon}
                              </Typography>
                            )}
                          </Box>
                        </li>
                      )}
                    />
                    <Tooltip title="Hızlı Müşteri Ekle">
                      <IconButton
                        color="secondary"
                        onClick={() => setCustomerDialogOpen(true)}
                        disabled={!!selectedVehicle?.customer}
                        sx={{ bgcolor: '#f3e5f5', '&:hover': { bgcolor: '#e1bee7' } }}
                      >
                        <PersonAdd />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Selected Customer Info */}
                  {selectedCustomer && (
                    <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                        ✓ Seçili Müşteri
                      </Typography>
                      <Typography>
                        {selectedCustomer.unvan ||
                          `${selectedCustomer.ad || ''} ${selectedCustomer.soyad || ''}`.trim()}
                      </Typography>
                      {selectedCustomer.telefon && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Tel: {selectedCustomer.telefon}
                        </Typography>
                      )}
                    </Paper>
                  )}

                  {/* Helper text */}
                  {!selectedVehicle && !selectedCustomer && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Önce müşteri ekleyip ardından araç ekleyebilir veya mevcut kayıtlardan seçebilirsiniz.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Person color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Servis Detayları
                    </Typography>
                  </Box>

                  <TextField
                    label="Müşteri Şikayeti *"
                    multiline
                    rows={4}
                    fullWidth
                    value={form.complaint}
                    onChange={(e) => setForm({ ...form, complaint: e.target.value })}
                    placeholder="Müşterinin bildirdiği sorunu detaylı açıklayın..."
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Tahmini Teslim Tarihi"
                    type="datetime-local"
                    fullWidth
                    value={form.estimatedDelivery}
                    onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Dahili Notlar"
                    multiline
                    rows={3}
                    fullWidth
                    value={form.internalNotes}
                    onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
                    placeholder="Sadece personelin göreceği notlar..."
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => router.back()}>
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={
                    !form.vehicleId ||
                    !form.customerId ||
                    !form.complaint ||
                    createWorkOrderMutation.isPending
                  }
                  sx={{
                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  }}
                >
                  {createWorkOrderMutation.isPending ? 'Kaydediliyor...' : 'İş Emri Oluştur'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {/* Quick Add Vehicle Dialog */}
        <Dialog open={vehicleDialogOpen} onClose={() => setVehicleDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCar color="primary" />
              Hızlı Araç Ekle
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {/* Plaka */}
              <TextField
                label="Plaka *"
                fullWidth
                value={quickVehicle.plateNumber}
                onChange={(e) => setQuickVehicle({ ...quickVehicle, plateNumber: e.target.value.toUpperCase() })}
                placeholder="34 ABC 123"
                sx={{ mb: 2 }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />

              {/* Marka ve Model */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <Autocomplete
                    freeSolo
                    options={popularBrands}
                    value={quickVehicle.brand}
                    onChange={(_, value) => setQuickVehicle({ ...quickVehicle, brand: value || '' })}
                    onInputChange={(_, value) => setQuickVehicle({ ...quickVehicle, brand: value })}
                    renderInput={(params) => <TextField {...params} label="Marka *" fullWidth />}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Model *"
                    fullWidth
                    value={quickVehicle.model}
                    onChange={(e) => setQuickVehicle({ ...quickVehicle, model: e.target.value })}
                  />
                </Grid>
              </Grid>

              {/* Yıl ve İlk Tescil Tarihi */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Yıl"
                    type="number"
                    fullWidth
                    value={quickVehicle.year}
                    onChange={(e) => setQuickVehicle({ ...quickVehicle, year: e.target.value })}
                    inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="İlk Tescil Tarihi"
                    type="date"
                    fullWidth
                    value={quickVehicle.firstRegistrationDate}
                    onChange={(e) => setQuickVehicle({ ...quickVehicle, firstRegistrationDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              {/* Yakıt Tipi ve Motor Hacmi */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Yakıt Tipi</InputLabel>
                    <Select
                      value={quickVehicle.fuelType}
                      label="Yakıt Tipi"
                      onChange={(e) => setQuickVehicle({ ...quickVehicle, fuelType: e.target.value })}
                    >
                      <MenuItem value="">Seçiniz</MenuItem>
                      {fuelTypes.map((fuel) => (
                        <MenuItem key={fuel} value={fuel}>
                          {fuel}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Motor Hacmi"
                    fullWidth
                    value={quickVehicle.engineSize}
                    onChange={(e) => setQuickVehicle({ ...quickVehicle, engineSize: e.target.value })}
                    placeholder="1.6, 2.0, vb."
                  />
                </Grid>
              </Grid>

              {/* Renk ve Kilometre */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Renk"
                    fullWidth
                    value={quickVehicle.color}
                    onChange={(e) => setQuickVehicle({ ...quickVehicle, color: e.target.value })}
                    placeholder="Beyaz, Siyah, vb."
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Kilometre"
                    type="number"
                    fullWidth
                    value={quickVehicle.mileage}
                    onChange={(e) => setQuickVehicle({ ...quickVehicle, mileage: e.target.value })}
                    placeholder="0"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>

              {/* Şasi No (VIN) */}
              <TextField
                label="Şasi No (VIN)"
                fullWidth
                value={quickVehicle.vin}
                onChange={(e) => setQuickVehicle({ ...quickVehicle, vin: e.target.value.toUpperCase() })}
                placeholder="17 karakter"
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 17, style: { textTransform: 'uppercase' } }}
              />

              {/* Customer selection for vehicle */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Araç Sahibi (Müşteri) *</Typography>
                {selectedCustomer ? (
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                    <Typography>
                      ✓ {selectedCustomer.unvan || `${selectedCustomer.ad || ''} ${selectedCustomer.soyad || ''}`.trim()}
                    </Typography>
                  </Paper>
                ) : (
                  <Alert severity="warning">
                    Önce bir müşteri seçin veya ekleyin
                  </Alert>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVehicleDialogOpen(false)}>İptal</Button>
            <Button
              variant="contained"
              onClick={handleQuickVehicleSubmit}
              disabled={
                !quickVehicle.plateNumber ||
                !quickVehicle.brand ||
                !quickVehicle.model ||
                !quickVehicle.customerId ||
                createVehicleMutation.isPending
              }
              startIcon={createVehicleMutation.isPending ? <CircularProgress size={16} /> : <Add />}
            >
              Araç Ekle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Quick Add Customer Dialog */}
        <Dialog open={customerDialogOpen} onClose={() => setCustomerDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAdd color="secondary" />
              Hızlı Müşteri Ekle
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                label="Müşteri / Firma Adı *"
                fullWidth
                value={quickCustomer.unvan}
                onChange={(e) => setQuickCustomer({ ...quickCustomer, unvan: e.target.value })}
                placeholder="Firma veya kişi adı"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Telefon"
                fullWidth
                value={quickCustomer.telefon}
                onChange={(e) => setQuickCustomer({ ...quickCustomer, telefon: e.target.value })}
                placeholder="05XX XXX XX XX"
                sx={{ mb: 2 }}
              />
              <TextField
                label="E-posta"
                fullWidth
                type="email"
                value={quickCustomer.email}
                onChange={(e) => setQuickCustomer({ ...quickCustomer, email: e.target.value })}
                placeholder="ornek@email.com"
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth>
                <InputLabel>Müşteri Tipi</InputLabel>
                <Select
                  value={quickCustomer.tip}
                  label="Müşteri Tipi"
                  onChange={(e) => setQuickCustomer({ ...quickCustomer, tip: e.target.value })}
                >
                  <MenuItem value="MUSTERI">Müşteri</MenuItem>
                  <MenuItem value="TEDARIKCI">Tedarikçi</MenuItem>
                  <MenuItem value="HER_IKISI">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomerDialogOpen(false)}>İptal</Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleQuickCustomerSubmit}
              disabled={!quickCustomer.unvan || createCustomerMutation.isPending}
              startIcon={createCustomerMutation.isPending ? <CircularProgress size={16} /> : <PersonAdd />}
            >
              Müşteri Ekle
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}

export default function NewWorkOrderPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress />
          </Box>
        </MainLayout>
      }
    >
      <NewWorkOrderContent />
    </Suspense>
  );
}
