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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import { Add, Search, Visibility, Download } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import axios from '@/lib/axios';
import * as XLSX from 'xlsx';
import WorkOrderStatusChip from '@/components/servis/WorkOrderStatusChip';
import PartWorkflowStatusChip from '@/components/servis/PartWorkflowStatusChip';
import { useAuthStore } from '@/stores/authStore';
import type { WorkOrder, WorkOrderStatus, PartWorkflowStatus } from '@/types/servis';

const STATUS_OPTIONS: { value: '' | WorkOrderStatus; label: string }[] = [
  { value: '', label: 'Tümü' },
  { value: 'WAITING_DIAGNOSIS', label: 'Beklemede' },
  { value: 'PENDING_APPROVAL', label: 'Müşteri Onayı Bekliyor' },
  { value: 'APPROVED_IN_PROGRESS', label: 'Yapım Aşamasında' },
  { value: 'PART_WAITING', label: 'Parça Bekliyor' },
  { value: 'PARTS_SUPPLIED', label: 'Parçalar Tedarik Edildi' },
  { value: 'VEHICLE_READY', label: 'Araç Hazır' },
  { value: 'INVOICED_CLOSED', label: 'Fatura Oluşturuldu' },
  { value: 'CLOSED_WITHOUT_INVOICE', label: 'Faturasız Kapandı' },
  { value: 'CANCELLED', label: 'İptal' },
];

export default function IsEmirleriPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isTechnician = user?.role === 'TECHNICIAN';
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | WorkOrderStatus>('');
  const [cariId, setCariId] = useState('');
  const [createdAtFrom, setCreatedAtFrom] = useState('');
  const [createdAtTo, setCreatedAtTo] = useState('');
  const [cariler, setCariler] = useState<{ id: string; cariKodu?: string; unvan?: string }[]>([]);
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkOrders();
  }, [debouncedSearch, statusFilter, cariId, createdAtFrom, createdAtTo]);

  useEffect(() => {
    const fetchCariler = async () => {
      try {
        const res = await axios.get('/account', { params: { limit: 500 } });
        const d = res.data?.data ?? res.data;
        setCariler(Array.isArray(d) ? d : []);
      } catch {
        setCariler([]);
      }
    };
    fetchCariler();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/work-order', {
        params: {
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          cariId: cariId || undefined,
          createdAtFrom: createdAtFrom || undefined,
          createdAtTo: createdAtTo || undefined,
          limit: 500,
        },
      });
      const data = res.data?.data ?? res.data;
      setWorkOrders(Array.isArray(data) ? data : []);
    } catch {
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await axios.get('/work-order', {
        params: {
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          cariId: cariId || undefined,
          createdAtFrom: createdAtFrom || undefined,
          createdAtTo: createdAtTo || undefined,
          limit: 5000,
        },
      });
      const list = res.data?.data ?? res.data;
      const rows = Array.isArray(list) ? list : [];
      const PART_LABELS: Record<string, string> = {
        NOT_STARTED: 'Henüz başlamadı',
        PARTS_SUPPLIED_DIRECT: 'Parçalar temin edildi',
        PARTS_PENDING: 'Parça bekleniyor',
        PARTIALLY_SUPPLIED: 'Kısmi tedarik edildi',
        ALL_PARTS_SUPPLIED: 'Tüm parçalar tedarik edildi',
      };
      const partStatusLabel = (wo: WorkOrder) => {
        const s = wo.partWorkflowStatus ?? (wo.status === 'PART_WAITING' ? 'PARTS_PENDING' : wo.status === 'PARTS_SUPPLIED' ? 'ALL_PARTS_SUPPLIED' : 'NOT_STARTED');
        return PART_LABELS[s] ?? s;
      };
      const cols = ['İş Emri No', 'Araç', 'Müşteri', 'Teknisyen', 'Servis durumu', 'Parça Durumu', 'Tarih'];
      const data = [
        cols,
        ...rows.map((wo: WorkOrder) => [
          wo.workOrderNo,
          wo.customerVehicle ? `${wo.customerVehicle.plaka} - ${wo.customerVehicle.aracMarka} ${wo.customerVehicle.aracModel}` : '-',
          wo.cari?.unvan ?? wo.cari?.cariKodu ?? '-',
          wo.technician?.fullName ?? '-',
          wo.status,
          partStatusLabel(wo),
          new Date(wo.createdAt).toLocaleDateString('tr-TR'),
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'İş Emirleri');
      XLSX.writeFile(wb, `is-emirleri_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch {
      // ignore
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(n));

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

  return (
    <>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          fontSize: '1.875rem',
          color: 'var(--foreground)',
          letterSpacing: '-0.02em',
          mb: 1,
        }}
      >
        İş Emirleri
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
        Servis iş emirlerini oluşturun ve takip edin
      </Typography>

      <Paper
        sx={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            id="work-order-search"
            size="small"
            placeholder="İş emri no, plaka veya açıklama ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-filter-label">Durum</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter-select"
              value={statusFilter}
              label="Durum"
              onChange={(e) => setStatusFilter(e.target.value as '' | WorkOrderStatus)}
            >
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value || 'all'} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Autocomplete
            id="customer-filter-autocomplete"
            size="small"
            options={cariler}
            getOptionLabel={(c) => `${c.cariKodu || ''} - ${c.unvan || c.id}`.trim() || c.id}
            value={cariler.find((c) => c.id === cariId) ?? null}
            onChange={(_, v) => setCariId(v?.id ?? '')}
            renderInput={(params) => <TextField {...params} id="customer-filter-input" label="Müşteri" />}
            sx={{ minWidth: 200 }}
          />
          <TextField
            id="date-from-filter"
            size="small"
            label="Başlangıç"
            type="date"
            value={createdAtFrom}
            onChange={(e) => setCreatedAtFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <TextField
            id="date-to-filter"
            size="small"
            label="Bitiş"
            type="date"
            value={createdAtTo}
            onChange={(e) => setCreatedAtTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportExcel}
            sx={{ textTransform: 'none' }}
          >
            Excel
          </Button>
          {!isTechnician && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push('/servis/is-emirleri/yeni')}
              sx={{
                bgcolor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Yeni İş Emri
            </Button>
          )}
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>İş Emri No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Araç</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teknisyen</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Servis durumu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Parça Durumu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  İşlem
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : workOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'var(--muted-foreground)' }}>
                    Kayıt bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                workOrders.map((wo) => {
                  const partStatus: PartWorkflowStatus = wo.partWorkflowStatus ?? (wo.status === 'PART_WAITING' ? 'PARTS_PENDING' : wo.status === 'PARTS_SUPPLIED' ? 'ALL_PARTS_SUPPLIED' : 'NOT_STARTED');
                  return (
                  <TableRow key={wo.id} hover>
                    <TableCell>{wo.workOrderNo}</TableCell>
                    <TableCell>
                      {wo.customerVehicle
                        ? `${wo.customerVehicle.plaka} - ${wo.customerVehicle.aracMarka} ${wo.customerVehicle.aracModel}`
                        : '-'}
                    </TableCell>
                    <TableCell>{wo.cari?.unvan ?? wo.cari?.cariKodu ?? '-'}</TableCell>
                    <TableCell>{wo.technician?.fullName ?? '-'}</TableCell>
                    <TableCell>
                      <WorkOrderStatusChip status={wo.status} />
                    </TableCell>
                    <TableCell>
                      <PartWorkflowStatusChip status={partStatus} />
                    </TableCell>
                    <TableCell>{formatDate(wo.createdAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/servis/is-emirleri/${wo.id}`)}
                        title="Detay"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
