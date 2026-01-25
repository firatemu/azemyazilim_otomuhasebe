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
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  FilterList,
  Refresh,
  DirectionsCar,
  Build,
  Person,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import {
  WorkOrder,
  WorkOrderStatus,
  Technician,
  getStatusLabel,
  getStatusColor,
  allStatuses,
} from '@/types/servis';

export default function WorkOrderListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | ''>('');
  const [technicianFilter, setTechnicianFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch technicians for filter
  const { data: techniciansData } = useQuery({
    queryKey: ['technicians-list'],
    queryFn: async () => {
      const response = await axios.get('/technicians', { params: { limit: 100, isActive: 'true' } });
      return response.data;
    },
  });

  // Fetch work orders
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['work-orders', page, statusFilter, technicianFilter, startDate, endDate],
    queryFn: async () => {
      const params: any = { page, limit: pageSize };
      if (statusFilter) params.status = statusFilter;
      if (technicianFilter) params.technicianId = technicianFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get('/work-orders', { params });
      return response.data;
    },
  });

  const technicians: Technician[] = techniciansData?.data || [];
  const workOrders: WorkOrder[] = data?.data || [];
  const total = data?.meta?.total || data?.total || 0;
  const totalPages = data?.meta?.totalPages || data?.totalPages || 1;

  // Filter by search query (client-side)
  const filteredWorkOrders = searchQuery
    ? workOrders.filter((wo) =>
        wo.workOrderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.vehicle?.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.customer?.unvan?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workOrders;

  const handleViewWorkOrder = (id: string) => {
    router.push(`/servis/is-emirleri/${id}`);
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setTechnicianFilter('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setPage(1);
  };

  const columns: GridColDef[] = [
    {
      field: 'workOrderNo',
      headerName: 'İş Emri No',
      width: 130,
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--primary)' }}>
          {params.row.workOrderNo}
        </Typography>
      ),
    },
    {
      field: 'vehicle',
      headerName: 'Araç',
      width: 180,
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DirectionsCar sx={{ fontSize: 18, color: 'var(--muted-foreground)' }} />
          <Box>
            <Typography variant="body2" fontWeight={500} sx={{ color: 'var(--foreground)' }}>
              {params.row.vehicle?.plateNumber || '-'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
              {params.row.vehicle?.brand} {params.row.vehicle?.model}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'customer',
      headerName: 'Müşteri',
      width: 180,
      renderCell: (params: GridRenderCellParams<WorkOrder>) => {
        const customer = params.row.customer;
        const name = customer?.unvan || `${customer?.ad || ''} ${customer?.soyad || ''}`.trim() || '-';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person sx={{ fontSize: 18, color: 'var(--muted-foreground)' }} />
            <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>{name}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'technician',
      headerName: 'Teknisyen',
      width: 150,
      renderCell: (params: GridRenderCellParams<WorkOrder>) => {
        const tech = params.row.technician;
        return tech ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Build sx={{ fontSize: 16, color: 'var(--muted-foreground)' }} />
            <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
              {tech.firstName} {tech.lastName}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
            Atanmadı
          </Typography>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 160,
      renderCell: (params: GridRenderCellParams<WorkOrder>) => {
        const statusColor = getStatusColor(params.row.status);
        const colorMap: Record<string, string> = {
          primary: 'var(--primary)',
          success: 'var(--chart-2)',
          warning: 'var(--chart-3)',
          error: 'var(--destructive)',
          info: 'var(--chart-1)',
        };
        return (
          <Chip
            label={getStatusLabel(params.row.status)}
            size="small"
            sx={{
              fontWeight: 500,
              bgcolor: colorMap[statusColor] 
                ? `color-mix(in srgb, ${colorMap[statusColor]} 15%, transparent)`
                : 'var(--muted)',
              color: colorMap[statusColor] || 'var(--foreground)',
              borderColor: colorMap[statusColor] || 'var(--border)',
            }}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'acceptedAt',
      headerName: 'Kabul Tarihi',
      width: 120,
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
          {params.row.acceptedAt
            ? new Date(params.row.acceptedAt).toLocaleDateString('tr-TR')
            : '-'}
        </Typography>
      ),
    },
    {
      field: 'grandTotal',
      headerName: 'Toplam',
      width: 120,
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Typography variant="body2" fontWeight={500} sx={{ color: 'var(--foreground)' }}>
          {params.row.grandTotal
            ? new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              }).format(params.row.grandTotal)
            : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Görüntüle">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleViewWorkOrder(params.row.id)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Statistics
  const stats = {
    total: total,
    inProgress: workOrders.filter((w) => w.status === 'IN_PROGRESS').length,
    waitingApproval: workOrders.filter((w) => w.status === 'WAITING_FOR_APPROVAL').length,
    readyForDelivery: workOrders.filter((w) => w.status === 'READY_FOR_DELIVERY').length,
  };

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
                color: 'var(--foreground)',
                letterSpacing: '-0.02em',
                mb: 0.5,
              }}
            >
              İş Emirleri
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
              Servis iş emirlerini görüntüleyin ve yönetin
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              sx={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                '&:hover': {
                  borderColor: 'var(--primary)',
                  bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                },
              }}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                '&:hover': {
                  bgcolor: 'var(--primary-hover)',
                },
              }}
              onClick={() => router.push('/servis/is-emirleri/yeni')}
            >
              Yeni İş Emri
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'var(--primary)' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                  Toplam İş Emri
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'var(--chart-1)' }}>
                  {stats.inProgress}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                  İşlemde
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'var(--chart-3)' }}>
                  {stats.waitingApproval}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                  Onay Bekliyor
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'var(--chart-2)' }}>
                  {stats.readyForDelivery}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                  Teslime Hazır
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList sx={{ color: 'var(--muted-foreground)' }} />
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'var(--foreground)' }}>
              Filtreler
            </Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                className="form-control-textfield"
                placeholder="İş emri no, plaka veya müşteri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'var(--muted-foreground)' }} />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small" className="form-control-select">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  label="Durum"
                  onChange={(e) => {
                    setStatusFilter(e.target.value as WorkOrderStatus | '');
                    setPage(1);
                  }}
                >
                  <MenuItem value="">Tüm Durumlar</MenuItem>
                  {allStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small" className="form-control-select">
                <InputLabel>Teknisyen</InputLabel>
                <Select
                  value={technicianFilter}
                  label="Teknisyen"
                  onChange={(e) => {
                    setTechnicianFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">Tüm Teknisyenler</MenuItem>
                  {technicians.map((tech) => (
                    <MenuItem key={tech.id} value={tech.id}>
                      {tech.firstName} {tech.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth
                className="form-control-textfield"
                type="date"
                label="Başlangıç Tarihi"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth
                className="form-control-textfield"
                type="date"
                label="Bitiş Tarihi"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                fullWidth
                sx={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  '&:hover': {
                    borderColor: 'var(--primary)',
                    bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  },
                }}
              >
                Temizle
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            İş emirleri yüklenirken bir hata oluştu.
          </Alert>
        )}

        {/* DataGrid */}
        <Paper sx={{ 
          height: 'calc(100vh - 520px)', 
          minHeight: 400,
          bgcolor: 'var(--card)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <DataGrid
            rows={filteredWorkOrders}
            columns={columns}
            loading={isLoading}
            pageSizeOptions={[20]}
            disableRowSelectionOnClick
            hideFooter
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'var(--muted)',
                borderBottom: `2px solid var(--border)`,
                color: 'var(--foreground)',
                fontWeight: 700,
              },
              '& .MuiDataGrid-row': {
                backgroundColor: 'var(--background)',
                '&:hover': {
                  backgroundColor: 'var(--muted) !important',
                },
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: `1px solid var(--border)`,
                backgroundColor: 'var(--card)',
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

