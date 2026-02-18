'use client';

import React, { useState } from 'react';
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
  Save,
  PersonAdd,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { Customer } from '@/types/servis';

interface CreateVehicleForm {
  plateNumber: string;
  vin: string;
  brand: string;
  model: string;
  year: string;
  firstRegistrationDate: string;
  engineSize: string;
  fuelType: string;
  color: string;
  mileage: string;
  customerId: string;
}

interface QuickCustomerForm {
  unvan: string;
  telefon: string;
  email: string;
  tip: string;
}

const fuelTypes = ['Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit'];
const popularBrands = [
  'Audi', 'BMW', 'Chevrolet', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda',
  'Hyundai', 'Kia', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot',
  'Renault', 'Seat', 'Skoda', 'Toyota', 'Volkswagen', 'Volvo'
];

export default function NewVehiclePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateVehicleForm>({
    plateNumber: '',
    vin: '',
    brand: '',
    model: '',
    year: '',
    firstRegistrationDate: '',
    engineSize: '',
    fuelType: '',
    color: '',
    mileage: '',
    customerId: '',
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');

  // Quick add customer dialog
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [quickCustomer, setQuickCustomer] = useState<QuickCustomerForm>({
    unvan: '',
    telefon: '',
    email: '',
    tip: 'MUSTERI',
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

  const customers: Customer[] = customersData?.data || [];

  // Create vehicle mutation
  const createVehicleMutation = useMutation({
    mutationFn: async (data: CreateVehicleForm) => {
      const response = await axios.post('/vehicles', {
        plateNumber: data.plateNumber.toUpperCase().replace(/\s/g, ''),
        vin: data.vin || undefined,
        brand: data.brand,
        model: data.model,
        year: data.year ? parseInt(data.year) : undefined,
        firstRegistrationDate: data.firstRegistrationDate || undefined,
        engineSize: data.engineSize || undefined,
        fuelType: data.fuelType || undefined,
        color: data.color || undefined,
        mileage: data.mileage ? parseInt(data.mileage) : undefined,
        customerId: data.customerId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      router.push(`/servis/araclar/${data.id}`);
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

      console.log('[createCustomer] Sending payload:', payload);
      console.log('[createCustomer] Payload keys:', Object.keys(payload));
      console.log('[createCustomer] Payload type:', typeof payload);

      const response = await axios.post('/cari', payload);

      console.log('[createCustomer] Response:', response.data);

      return response.data;
    },
    onSuccess: (data) => {
      console.log('[createCustomer] Success:', data);
      refetchCustomers();
      setSelectedCustomer(data);
      setForm((prev) => ({ ...prev, customerId: data.id }));
      setCustomerDialogOpen(false);
      setQuickCustomer({ unvan: '', telefon: '', email: '', tip: 'MUSTERI' });
    },
    onError: (error) => {
      console.error('[createCustomer] Error occurred:', error);
      console.error('[createCustomer] Error response:', error.response);
      console.error('[createCustomer] Error status:', error.response?.status);
      console.error('[createCustomer] Error data:', error.response?.data);
      console.error('[createCustomer] Error message:', error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plateNumber || !form.brand || !form.model || !form.customerId) {
      return;
    }
    createVehicleMutation.mutate(form);
  };

  const handleCustomerChange = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setForm((prev) => ({
      ...prev,
      customerId: customer?.id || '',
    }));
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
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Yeni Araç
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yeni bir araç kaydı oluşturun
            </Typography>
          </Box>
        </Box>

        {createVehicleMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Araç oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column - Vehicle Info */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <DirectionsCar color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Araç Bilgileri
                    </Typography>
                  </Box>

                  <TextField
                    label="Plaka *"
                    fullWidth
                    value={form.plateNumber}
                    onChange={(e) =>
                      setForm({ ...form, plateNumber: e.target.value.toUpperCase() })
                    }
                    placeholder="34 ABC 123"
                    sx={{ mb: 2 }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Autocomplete
                        freeSolo
                        options={popularBrands}
                        value={form.brand}
                        onChange={(_, value) => setForm({ ...form, brand: value || '' })}
                        onInputChange={(_, value) => setForm({ ...form, brand: value })}
                        renderInput={(params) => (
                          <TextField {...params} label="Marka *" fullWidth />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Model *"
                        fullWidth
                        value={form.model}
                        onChange={(e) => setForm({ ...form, model: e.target.value })}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <TextField
                        label="Yıl"
                        type="number"
                        fullWidth
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                        inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <TextField
                        label="İlk Tescil Tarihi"
                        type="date"
                        fullWidth
                        value={form.firstRegistrationDate}
                        onChange={(e) => setForm({ ...form, firstRegistrationDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel>Yakıt Tipi</InputLabel>
                        <Select
                          value={form.fuelType}
                          label="Yakıt Tipi"
                          onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
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
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Motor Hacmi"
                        fullWidth
                        value={form.engineSize}
                        onChange={(e) => setForm({ ...form, engineSize: e.target.value })}
                        placeholder="1.6, 2.0, vb."
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label="Renk"
                        fullWidth
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label="Kilometre"
                        type="number"
                        fullWidth
                        value={form.mileage}
                        onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Şasi No (VIN)"
                    fullWidth
                    value={form.vin}
                    onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
                    sx={{ mt: 2 }}
                    inputProps={{ maxLength: 17, style: { textTransform: 'uppercase' } }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Customer */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Müşteri Bilgileri
                    </Typography>
                    <Tooltip title="Hızlı Müşteri Ekle">
                      <IconButton
                        color="secondary"
                        onClick={() => setCustomerDialogOpen(true)}
                        sx={{ bgcolor: '#f3e5f5', '&:hover': { bgcolor: '#e1bee7' } }}
                      >
                        <PersonAdd />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Autocomplete
                    options={customers}
                    value={selectedCustomer}
                    onChange={(_, value) => handleCustomerChange(value)}
                    onInputChange={(_, value) => setCustomerSearch(value)}
                    getOptionLabel={(option) =>
                      option.unvan || `${option.ad || ''} ${option.soyad || ''}`.trim() || '-'
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    loading={customersLoading}
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
                      {selectedCustomer.email && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          E-posta: {selectedCustomer.email}
                        </Typography>
                      )}
                    </Paper>
                  )}

                  {!selectedCustomer && (
                    <Alert severity="info" sx={{ mt: 3 }}>
                      Müşteri listesinden seçin veya <strong>Hızlı Müşteri Ekle</strong> butonuyla yeni müşteri oluşturun.
                    </Alert>
                  )}
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
                    !form.plateNumber ||
                    !form.brand ||
                    !form.model ||
                    !form.customerId ||
                    createVehicleMutation.isPending
                  }
                  sx={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  }}
                >
                  {createVehicleMutation.isPending ? 'Kaydediliyor...' : 'Araç Kaydet'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

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
