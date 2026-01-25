'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Warehouse as WarehouseIcon, Download } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
}

interface StockItem {
  id: string;
  stokKodu: string;
  stokAdi: string;
  birim: string;
  qtyOnHand: number;
  qtyReserved: number;
  qtyAvailable: number;
  locations?: Array<{
    locationCode: string;
    locationName: string;
    quantity: number;
  }>;
}

export default function AmbarStokRaporuPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchStockReport();
    }
  }, [selectedWarehouse]);

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/warehouse?active=true');
      const warehouseList = response.data;
      setWarehouses(warehouseList);
      
      // Varsayılan ambarı otomatik seç
      const defaultWarehouse = warehouseList.find((w: Warehouse) => w.isDefault);
      if (defaultWarehouse) {
        setSelectedWarehouse(defaultWarehouse.id);
      }
    } catch (error) {
      console.error('Ambar listesi alınamadı:', error);
    }
  };

  const fetchStockReport = async () => {
    if (!selectedWarehouse) return;

    try {
      setLoading(true);
      const response = await axios.get(`/warehouse/${selectedWarehouse}/stock-report`);
      setStockData(response.data);
    } catch (error) {
      console.error('Stok raporu alınamadı:', error);
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'stokKodu',
      headerName: 'Stok Kodu',
      width: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: 'var(--primary)' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'stokAdi',
      headerName: 'Stok Adı',
      width: 300,
    },
    {
      field: 'birim',
      headerName: 'Birim',
      width: 100,
    },
    {
      field: 'qtyOnHand',
      headerName: 'Eldeki Miktar',
      width: 150,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600 }}>
          {params.value || 0}
        </Typography>
      ),
    },
    {
      field: 'qtyReserved',
      headerName: 'Rezerve',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ color: '#f59e0b' }}>
          {params.value || 0}
        </Typography>
      ),
    },
    {
      field: 'qtyAvailable',
      headerName: 'Kullanılabilir',
      width: 150,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: '#10b981' }}>
          {params.value || 0}
        </Typography>
      ),
    },
    {
      field: 'locations',
      headerName: 'Lokasyonlar',
      width: 250,
      renderCell: (params) => {
        const locations = params.value as StockItem['locations'];
        if (!locations || locations.length === 0) return '-';
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {locations.slice(0, 2).map((loc, idx) => (
              <Chip
                key={idx}
                label={`${loc.locationCode}: ${loc.quantity}`}
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
            {locations.length > 2 && (
              <Chip
                label={`+${locations.length - 2}`}
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
        );
      },
    },
  ];

  const filteredData = stockData.filter((item) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.stokKodu.toLowerCase().includes(search) ||
      item.stokAdi.toLowerCase().includes(search)
    );
  });

  const handleExport = () => {
    // CSV export fonksiyonu
    const headers = ['Stok Kodu', 'Stok Adı', 'Birim', 'Eldeki Miktar', 'Rezerve', 'Kullanılabilir'];
    const csvData = filteredData.map(item => [
      item.stokKodu,
      item.stokAdi,
      item.birim,
      item.qtyOnHand,
      item.qtyReserved,
      item.qtyAvailable,
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ambar-stok-raporu-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const selectedWarehouseName = warehouses.find(w => w.id === selectedWarehouse)?.name || '';

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)', mb: 0.5 }}>
            Ambar Stok Raporu
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
            Ambar bazlı detaylı stok durumunu görüntüleyin
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Ambar Seçin</InputLabel>
              <Select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                label="Ambar Seçin"
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarehouseIcon fontSize="small" />
                      {warehouse.name} {warehouse.isDefault && '(Varsayılan)'}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Ara..."
              placeholder="Stok kodu veya adı..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
            />

            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
              disabled={!selectedWarehouse || filteredData.length === 0}
            >
              Dışa Aktar
            </Button>
          </Box>
        </Paper>

        {/* Summary Cards */}
        {selectedWarehouse && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Toplam Ürün</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                {filteredData.length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Toplam Stok</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                {filteredData.reduce((sum, item) => sum + (item.qtyOnHand || 0), 0)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Rezerve</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#f59e0b' }}>
                {filteredData.reduce((sum, item) => sum + (item.qtyReserved || 0), 0)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Kullanılabilir</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#10b981' }}>
                {filteredData.reduce((sum, item) => sum + (item.qtyAvailable || 0), 0)}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Data Grid */}
        <Paper sx={{ height: 600 }}>
          <DataGrid
            rows={filteredData}
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
      </Box>
    </MainLayout>
  );
}
