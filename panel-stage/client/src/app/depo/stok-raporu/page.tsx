'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Search, Download, CalendarToday, Warehouse as WarehouseIcon } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import * as XLSX from 'xlsx';

interface WarehouseInfo {
  id: string;
  name: string;
  code: string;
}

interface UniversalStockRow {
  productId: string;
  stokKodu: string;
  stokAdi: string;
  birim: string;
  warehouseStocks: Record<string, number>;
  total: number;
}

export default function AmbarStokRaporuPage() {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<UniversalStockRow[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/warehouse/all/universal-stock-report', {
        params: { date }
      });
      setReportData(response.data.report);
      setWarehouses(response.data.warehouses);
    } catch (error) {
      console.error('Evrensel stok raporu alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [date]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return reportData;
    const lowerSearch = searchTerm.toLowerCase();
    return reportData.filter(
      (item) =>
        item.stokKodu.toLowerCase().includes(lowerSearch) ||
        item.stokAdi.toLowerCase().includes(lowerSearch)
    );
  }, [reportData, searchTerm]);

  const columns = useMemo(() => {
    const baseColumns: GridColDef[] = [
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
        headerName: 'Ürün Adı',
        minWidth: 250,
        flex: 1,
      },
    ];

    // Dinamik ambar sütunları
    const warehouseColumns: GridColDef[] = warehouses.map((w) => ({
      field: `warehouse_${w.id}`,
      headerName: `${w.name} (${w.code})`,
      width: 140,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params, row) => row.warehouseStocks[w.id] || 0,
      renderCell: (params) => (
        <Typography sx={{
          fontWeight: 500,
          color: params.value > 0 ? 'var(--chart-2)' : params.value < 0 ? 'var(--destructive)' : 'var(--muted-foreground)'
        }}>
          {params.value.toLocaleString('tr-TR')}
        </Typography>
      ),
    }));

    const totalColumn: GridColDef = {
      field: 'total',
      headerName: 'Genel Toplam',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{
          bgcolor: 'var(--primary-foreground)',
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          border: '1px solid var(--border)',
          width: '100%',
          textAlign: 'right'
        }}>
          <Typography sx={{ fontWeight: 700, color: 'var(--primary)' }}>
            {params.value.toLocaleString('tr-TR')} {params.row.birim}
          </Typography>
        </Box>
      ),
    };

    return [...baseColumns, ...warehouseColumns, totalColumn];
  }, [warehouses]);

  const handleExport = () => {
    const exportData = filteredData.map(item => {
      const row: any = {
        'Stok Kodu': item.stokKodu,
        'Stok Adı': item.stokAdi,
        'Birim': item.birim
      };
      warehouses.forEach(w => {
        row[`${w.name} (${w.code})`] = item.warehouseStocks[w.id] || 0;
      });
      row['Genel Toplam'] = item.total;
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stok Raporu');
    XLSX.writeFile(workbook, `Evrensel_Stok_Raporu_${date}.xlsx`);
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/" sx={{ textDecoration: 'none' }}>
            Panel
          </Link>
          <Typography color="text.primary">Ambar Yönetimi</Typography>
          <Typography color="text.primary">Stok Raporu</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'var(--foreground)' }}>
            Ambar Stok Raporu
          </Typography>
          <Button
            variant="outline"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{
              borderRadius: '999px',
              border: '1px solid var(--border)',
              '&:hover': { bgcolor: 'var(--accent)' }
            }}
          >
            Excel'e Aktar
          </Button>
        </Box>

        <Card sx={{ bgcolor: 'var(--card)', mb: 3, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Ürün adı veya kodu ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'var(--muted-foreground)' }} />,
                  }}
                  sx={{ '& .MuiInputBase-root': { borderRadius: 'var(--radius)' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Rapor Tarihi"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarToday fontSize="small" sx={{ mr: 1, color: 'var(--muted-foreground)' }} />
                  }}
                  sx={{ '& .MuiInputBase-root': { borderRadius: 'var(--radius)' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="var(--muted-foreground)" display="block">
                      Toplam Ürün Çeşidi
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {filteredData.length}
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="var(--muted-foreground)" display="block">
                      Etkin Ambar Sayısı
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {warehouses.length}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Paper sx={{ width: '100%', height: 600, bgcolor: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.productId}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid var(--border)',
                color: 'var(--foreground)',
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'var(--muted)',
                color: 'var(--muted-foreground)',
                borderBottom: '2px solid var(--border)',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '2px solid var(--border)',
                bgcolor: 'var(--card)',
              },
            }}
          />
        </Paper>
        <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'var(--muted-foreground)' }}>
          * Rapor seçilen tarihin sonu (23:59:59) itibariyle hesaplanmıştır. Sütunlar ambar bazlı stok miktarlarını, "Genel Toplam" ise tüm ambarların toplamını ifade eder.
        </Typography>
      </Box>
    </MainLayout>
  );
}
