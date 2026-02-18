'use client';

import React, { useState, useCallback } from 'react';
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
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Refresh,
  DirectionsCar,
  Person,
  Speed,
  Assignment,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { Vehicle } from '@/types/servis';

export default function VehicleListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Fetch vehicles
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles', page, searchQuery, brandFilter],
    queryFn: async () => {
      const params: any = { page, limit: pageSize };
      if (searchQuery) params.search = searchQuery;
      if (brandFilter) params.brand = brandFilter;

      const response = await axios.get('/vehicles', { params });
      return response.data;
    },
  });

  const vehicles: Vehicle[] = data?.data || [];
  const total = data?.meta?.total || data?.total || 0;
  const totalPages = data?.meta?.totalPages || data?.totalPages || 1;

  // Get unique brands for filter
  const brands = [...new Set(vehicles.map((v) => v.brand))].sort();

  const handleViewVehicle = (id: string) => {
    router.push(`/servis/araclar/${id}`);
  };

  const handleCreateWorkOrder = (vehicleId: string) => {
    router.push(`/servis/is-emirleri/yeni?vehicleId=${vehicleId}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setBrandFilter('');
    setPage(1);
  };

  const columns: GridColDef[] = [
    {
      field: 'plateNumber',
      headerName: 'Plaka',
      width: 130,
      renderCell: (params: GridRenderCellParams<Vehicle>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DirectionsCar sx={{ fontSize: 18, color: '#1565c0' }} />
          <Typography variant="body2" fontWeight={600} color="primary">
            {params.row.plateNumber}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'brand',
      headerName: 'Marka',
      width: 120,
    },
    {
      field: 'model',
      headerName: 'Model',
      width: 150,
    },
    {
      field: 'year',
      headerName: 'Yıl',
      width: 80,
      renderCell: (params: GridRenderCellParams<Vehicle>) => (
        <Typography variant="body2">{params.row.year || '-'}</Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Müşteri',
      width: 200,
      renderCell: (params: GridRenderCellParams<Vehicle>) => {
        const customer = params.row.customer;
        const name =
          customer?.unvan ||
          `${customer?.ad || ''} ${customer?.soyad || ''}`.trim() ||
          '-';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person sx={{ fontSize: 16, color: '#666' }} />
            <Typography variant="body2">{name}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'mileage',
      headerName: 'Kilometre',
      width: 120,
      renderCell: (params: GridRenderCellParams<Vehicle>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Speed sx={{ fontSize: 16, color: '#666' }} />
          <Typography variant="body2">
            {params.row.mileage ? params.row.mileage.toLocaleString('tr-TR') + ' km' : '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'fuelType',
      headerName: 'Yakıt',
      width: 100,
      renderCell: (params: GridRenderCellParams<Vehicle>) => (
        <Chip
          label={params.row.fuelType || '-'}
          size="small"
          variant="outlined"
          color={
            params.row.fuelType === 'Benzin'
              ? 'error'
              : params.row.fuelType === 'Dizel'
              ? 'warning'
              : params.row.fuelType === 'Elektrik'
              ? 'success'
              : 'default'
          }
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Vehicle>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Geçmişi Görüntüle">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleViewVehicle(params.row.id)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Yeni İş Emri">
            <IconButton
              size="small"
              color="success"
              onClick={() => handleCreateWorkOrder(params.row.id)}
            >
              <Assignment fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
              Araçlar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Araç kayıtlarını görüntüleyin ve servis geçmişlerini takip edin
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              }}
              onClick={() => router.push('/servis/araclar/yeni')}
            >
              Yeni Araç
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                placeholder="Plaka, marka, model veya müşteri ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Marka</InputLabel>
                <Select
                  value={brandFilter}
                  label="Marka"
                  onChange={(e) => {
                    setBrandFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">Tüm Markalar</MenuItem>
                  {brands.map((brand) => (
                    <MenuItem key={brand} value={brand}>
                      {brand}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                fullWidth
              >
                Temizle
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="body2" color="text.secondary" textAlign="right">
                {total} araç
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Araçlar yüklenirken bir hata oluştu.
          </Alert>
        )}

        {/* DataGrid */}
        <Paper sx={{ height: 'calc(100vh - 380px)', minHeight: 400 }}>
          <DataGrid
            rows={vehicles}
            columns={columns}
            loading={isLoading}
            pageSizeOptions={[20]}
            disableRowSelectionOnClick
            hideFooter
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: '#f0f0f0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #e0e0e0',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f8f9fa',
              },
            }}
          />
        </Paper>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}

