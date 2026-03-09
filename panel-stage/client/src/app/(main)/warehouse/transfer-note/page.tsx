'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Visibility, Edit, Delete, LocalShipping, CheckCircle, Cancel, Print } from '@mui/icons-material';
import WarehouseTransferPrintForm from '@/components/PrintForm/WarehouseTransferPrintForm';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

const statusColors: Record<string, string> = {
  HAZIRLANIYOR: '#f59e0b',
  YOLDA: '#3b82f6',
  TAMAMLANDI: '#10b981',
  IPTAL: '#ef4444',
};

const statusLabels: Record<string, string> = {
  HAZIRLANIYOR: 'Hazırlanıyor',
  YOLDA: 'Yolda',
  TAMAMLANDI: 'Tamamlandı',
  IPTAL: 'İptal',
};

export default function AmbarTransferFisiPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDurum, setFilterDurum] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, [filterDurum]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterDurum) params.durum = filterDurum;

      const response = await axios.get('/warehouse-transfer', { params });
      setTransfers(response.data);
    } catch (error) {
      console.error('Transfer fişleri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Transfer fişini silmek istediğinizden emin misiniz?')) return;

    try {
      await axios.delete(`/warehouse-transfer/${id}`);
      fetchTransfers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Silme işlemi başarısız');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'transferNo',
      headerName: 'Fiş No',
      width: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: 'var(--primary)' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 120,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString('tr-TR') : '-',
    },
    {
      field: 'fromWarehouse',
      headerName: 'Çıkış Ambarı',
      width: 180,
      valueGetter: (value, row) => row.fromWarehouse?.name || '-',
    },
    {
      field: 'toWarehouse',
      headerName: 'Giriş Ambarı',
      width: 180,
      valueGetter: (value, row) => row.toWarehouse?.name || '-',
    },
    {
      field: 'kalemler',
      headerName: 'Ürün Sayısı',
      width: 120,
      valueGetter: (value, row) => row.kalemler?.length || 0,
    },
    {
      field: 'driverName',
      headerName: 'Sürücü',
      width: 150,
      valueGetter: (params) => params.value || '-',
    },
    {
      field: 'vehiclePlate',
      headerName: 'Plaka',
      width: 120,
      valueGetter: (params) => params.value || '-',
    },
    {
      field: 'durum',
      headerName: 'Durum',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={statusLabels[params.value]}
          sx={{
            bgcolor: statusColors[params.value],
            color: 'white',
            fontWeight: 600,
          }}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => router.push(`/depo/transfer-fisi/${params.row.id}`)}
            sx={{ color: 'var(--primary)' }}
          >
            <Visibility fontSize="small" />
          </IconButton>
          {params.row.durum === 'HAZIRLANIYOR' && (
            <>
              <IconButton
                size="small"
                onClick={() => router.push(`/depo/transfer-fisi/duzenle/${params.row.id}`)}
                sx={{ color: '#f59e0b' }}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDelete(params.row.id)}
                sx={{ color: '#ef4444' }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            onClick={() => {
              setSelectedTransfer(params.row);
              setPrintOpen(true);
            }}
            sx={{ color: '#6366f1' }}
          >
            <Print fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredTransfers = transfers.filter((transfer: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      transfer.transferNo?.toLowerCase().includes(search) ||
      transfer.fromWarehouse?.name?.toLowerCase().includes(search) ||
      transfer.toWarehouse?.name?.toLowerCase().includes(search) ||
      transfer.driverName?.toLowerCase().includes(search) ||
      transfer.vehiclePlate?.toLowerCase().includes(search)
    );
  });

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)', mb: 0.5 }}>
              Ambar Transfer Fişleri
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
              Ambarlar arası malzeme transferlerini yönetin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/depo/transfer-fisi/yeni')}
            sx={{
              bgcolor: 'var(--primary)',
              '&:hover': { bgcolor: 'var(--primary)' },
            }}
          >
            Yeni Transfer Fişi
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Ara..."
              placeholder="Fiş no, ambar, sürücü, plaka..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
              size="small"
            />
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Durum</InputLabel>
              <Select
                value={filterDurum}
                onChange={(e) => setFilterDurum(e.target.value)}
                label="Durum"
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="HAZIRLANIYOR">Hazırlanıyor</MenuItem>
                <MenuItem value="YOLDA">Yolda</MenuItem>
                <MenuItem value="TAMAMLANDI">Tamamlandı</MenuItem>
                <MenuItem value="IPTAL">İptal</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Data Grid */}
        <Paper sx={{ height: 600 }}>
          <DataGrid
            rows={filteredTransfers}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </Paper>

        <WarehouseTransferPrintForm
          open={printOpen}
          transfer={selectedTransfer}
          onClose={() => setPrintOpen(false)}
        />
      </Box>
    </MainLayout>
  );
}
