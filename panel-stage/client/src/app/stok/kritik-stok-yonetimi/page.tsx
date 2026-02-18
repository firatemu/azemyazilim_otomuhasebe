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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
    Search,
    Download,
    Warning,
    CheckCircle,
    Error as ErrorIcon,
    Edit,
    Save,
    Cancel,
    FileUpload,
    FileDownload,
    CloudUpload,
    CloudDownload,
    AutoGraph,
    Info,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import * as XLSX from 'xlsx';

interface WarehouseInfo {
    id: string;
    name: string;
    code: string;
}

interface WarehouseStockStatus {
    currentStock: number;
    criticalStock: number;
    status: 'BELOW' | 'EQUAL' | 'ABOVE';
}

interface CriticalStockRow {
    productId: string;
    stokKodu: string;
    stokAdi: string;
    birim: string;
    marka: string | null;
    warehouses: Record<string, WarehouseStockStatus>;
    overallStatus: 'CRITICAL' | 'WARNING' | 'NORMAL';
}

interface BulkUpdateResult {
    updated: number;
    skipped: number;
    errors: string[];
}

type FilterType = 'ALL' | 'CRITICAL' | 'WARNING' | 'NORMAL';

export default function KritikStokYonetimiPage() {
    const [reportData, setReportData] = useState<CriticalStockRow[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [editingCell, setEditingCell] = useState<{ productId: string; warehouseId: string } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [updateResult, setUpdateResult] = useState<BulkUpdateResult | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/warehouse-critical-stock/report');
            setReportData(response.data.report);
            setWarehouses(response.data.warehouses);
        } catch (error) {
            console.error('Kritik stok raporu alınamadı:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const filteredData = useMemo(() => {
        let data = reportData;

        // Apply status filter
        if (filter !== 'ALL') {
            data = data.filter((item) => item.overallStatus === filter);
        }

        // Apply search filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(
                (item) =>
                    item.stokKodu.toLowerCase().includes(lowerSearch) ||
                    item.stokAdi.toLowerCase().includes(lowerSearch)
            );
        }

        return data;
    }, [reportData, filter, searchTerm]);

    const handleCellEdit = (productId: string, warehouseId: string, currentValue: number) => {
        setEditingCell({ productId, warehouseId });
        setEditValue(currentValue.toString());
    };

    const handleSaveEdit = async () => {
        if (!editingCell) return;

        try {
            const newValue = parseInt(editValue, 10);
            if (isNaN(newValue) || newValue < 0) {
                alert('Geçerli bir sayı giriniz');
                return;
            }

            await axios.put(
                `/warehouse-critical-stock/${editingCell.warehouseId}/${editingCell.productId}`,
                { criticalQty: newValue }
            );

            // Refresh data
            await fetchReport();
            setEditingCell(null);
        } catch (error) {
            console.error('Kritik stok güncellenemedi:', error);
            alert('Güncelleme başarısız oldu');
        }
    };

    const handleCancelEdit = () => {
        setEditingCell(null);
        setEditValue('');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'BELOW':
                return <ErrorIcon sx={{ color: 'var(--destructive)', fontSize: 18 }} />;
            case 'EQUAL':
                return <Warning sx={{ color: 'var(--warning)', fontSize: 18 }} />;
            case 'ABOVE':
                return <CheckCircle sx={{ color: 'var(--chart-2)', fontSize: 18 }} />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BELOW':
                return 'var(--destructive)';
            case 'EQUAL':
                return 'var(--warning)';
            case 'ABOVE':
                return 'var(--chart-2)';
            default:
                return 'var(--muted-foreground)';
        }
    };

    const columns = useMemo(() => {
        const baseColumns: GridColDef[] = [
            {
                field: 'stokKodu',
                headerName: 'Stok Kodu',
                width: 130,
                renderCell: (params) => (
                    <Typography sx={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {params.value}
                    </Typography>
                ),
            },
            {
                field: 'stokAdi',
                headerName: 'Ürün Adı',
                minWidth: 200,
                flex: 1,
            },
            {
                field: 'marka',
                headerName: 'Marka',
                width: 120,
            },
        ];

        // Dynamic warehouse columns
        const warehouseColumns: GridColDef[] = warehouses.map((w) => ({
            field: `warehouse_${w.id}`,
            headerName: `${w.name} (${w.code})`,
            width: 180,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => {
                const row = params.row as CriticalStockRow;
                const whStatus = row.warehouses[w.id];
                if (!whStatus) return '-';

                const isEditing = editingCell?.productId === row.productId && editingCell?.warehouseId === w.id;

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'center' }}>
                        {getStatusIcon(whStatus.status)}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: getStatusColor(whStatus.status) }}>
                                {whStatus.currentStock}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>/</Typography>
                            {isEditing ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TextField
                                        size="small"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        sx={{ width: 60, '& input': { textAlign: 'center', fontSize: 13, p: '2px 0' } }}
                                        autoFocus
                                    />
                                    <IconButton size="small" onClick={handleSaveEdit} sx={{ p: 0.2 }}>
                                        <Save fontSize="small" sx={{ fontSize: 18 }} />
                                    </IconButton>
                                    <IconButton size="small" onClick={handleCancelEdit} sx={{ p: 0.2 }}>
                                        <Cancel fontSize="small" sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                                    <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                                        {whStatus.criticalStock}
                                    </Typography>
                                    <Tooltip title="Düzenle">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCellEdit(row.productId, w.id, whStatus.criticalStock)}
                                            sx={{ p: 0.5, ml: 0.5, opacity: 0.6, '&:hover': { opacity: 1 } }}
                                        >
                                            <Edit sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                    </Box>
                );
            },
        }));

        const statusColumn: GridColDef = {
            field: 'overallStatus',
            headerName: 'Durum',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const status = params.value as string;
                let label = 'Normal';
                let color: 'success' | 'warning' | 'error' = 'success';

                if (status === 'CRITICAL') {
                    label = 'Kritik';
                    color = 'error';
                } else if (status === 'WARNING') {
                    label = 'Uyarı';
                    color = 'warning';
                }

                return <Chip label={label} color={color} size="small" />;
            },
        };

        return [...baseColumns, ...warehouseColumns, statusColumn];
    }, [warehouses, editingCell, editValue]);

    const handleExport = () => {
        const exportData = filteredData.map((item: CriticalStockRow) => {
            const row: any = {
                'Stok Kodu': item.stokKodu,
                'Stok Adı': item.stokAdi,
                'Marka': item.marka || '',
                'Birim': item.birim,
            };
            warehouses.forEach((w: WarehouseInfo) => {
                const wh = item.warehouses[w.id];
                row[`${w.name} - Mevcut`] = wh?.currentStock || 0;
                row[`${w.name} - Kritik`] = wh?.criticalStock || 0;
            });
            row['Durum'] = item.overallStatus === 'CRITICAL' ? 'Kritik' : item.overallStatus === 'WARNING' ? 'Uyarı' : 'Normal';
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Kritik Stok');
        XLSX.writeFile(workbook, `Kritik_Stok_Raporu_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleDownloadTemplate = () => {
        // Create a simple one-row example template
        const templateData = [
            {
                'Stok Kodu': 'STOK001',
                'Ambar Kodu': 'AMB01',
                'Kritik Stok Miktarı': 10
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Kritik Stok Taslak');
        XLSX.writeFile(workbook, `Kritik_Stok_Guncelleme_Sablonu.xlsx`);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                // Map Excel columns to API fields
                const bulkData = jsonData.map((row: any) => ({
                    stokKodu: row['Stok Kodu'],
                    ambarKodu: row['Ambar Kodu'],
                    criticalQty: parseInt(row['Kritik Stok Miktarı'], 10)
                })).filter(item => item.stokKodu && item.ambarKodu && !isNaN(item.criticalQty));

                if (bulkData.length === 0) {
                    alert('Geçerli veri bulunamadı.');
                    return;
                }

                setLoading(true);
                const response = await axios.put('/warehouse-critical-stock/bulk-update', bulkData);

                setUpdateResult(response.data);
                await fetchReport();
            } catch (error) {
                console.error('Dosya işleme hatası:', error);
                alert('Dosya işlenirken bir hata oluştu.');
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleDownloadUpdateReport = () => {
        if (!updateResult) return;

        const reportData = updateResult.errors.map(error => ({ 'Sonuç': 'Hata', 'Detay': error }));
        if (updateResult.updated > 0) {
            reportData.push({ 'Sonuç': 'Başarıyla Güncellenen', 'Detay': `${updateResult.updated} kayıt güncellendi.` });
        }
        if (updateResult.skipped > 0) {
            reportData.push({ 'Sonuç': 'Atlanan', 'Detay': `${updateResult.skipped} kayıt atlandı.` });
        }

        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Aktarım Raporu');
        XLSX.writeFile(workbook, `Kritik_Stok_Aktarim_Raporu_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const stats = useMemo(() => {
        const critical = reportData.filter((r) => r.overallStatus === 'CRITICAL').length;
        const warning = reportData.filter((r) => r.overallStatus === 'WARNING').length;
        const normal = reportData.filter((r) => r.overallStatus === 'NORMAL').length;
        return { critical, warning, normal, total: reportData.length };
    }, [reportData]);

    return (
        <MainLayout>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'var(--foreground)', mb: 3 }}>
                    Kritik Stok Yönetimi
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{ bgcolor: 'var(--destructive-foreground)', borderLeft: '4px solid var(--destructive)' }}>
                            <CardContent>
                                <Typography variant="caption" color="var(--muted-foreground)">Kritik Ürünler</Typography>
                                <Typography variant="h5" fontWeight="bold" color="var(--destructive)">{stats.critical}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{ bgcolor: 'var(--warning-foreground)', borderLeft: '4px solid var(--warning)' }}>
                            <CardContent>
                                <Typography variant="caption" color="var(--muted-foreground)">Uyarı</Typography>
                                <Typography variant="h5" fontWeight="bold" color="var(--warning)">{stats.warning}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{ bgcolor: 'var(--card)', borderLeft: '4px solid var(--chart-2)' }}>
                            <CardContent>
                                <Typography variant="caption" color="var(--muted-foreground)">Normal</Typography>
                                <Typography variant="h5" fontWeight="bold" color="var(--chart-2)">{stats.normal}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{ bgcolor: 'var(--card)', borderLeft: '4px solid var(--primary)' }}>
                            <CardContent>
                                <Typography variant="caption" color="var(--muted-foreground)">Toplam Ürün</Typography>
                                <Typography variant="h5" fontWeight="bold" color="var(--primary)">{stats.total}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Card sx={{ bgcolor: 'var(--card)', mb: 3, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
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
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Durum Filtresi</InputLabel>
                                    <Select
                                        value={filter}
                                        label="Durum Filtresi"
                                        onChange={(e) => setFilter(e.target.value as FilterType)}
                                    >
                                        <MenuItem value="ALL">Tümü</MenuItem>
                                        <MenuItem value="CRITICAL">Kritik</MenuItem>
                                        <MenuItem value="WARNING">Uyarı</MenuItem>
                                        <MenuItem value="NORMAL">Normal</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 1,
                                    justifyContent: 'flex-end',
                                    p: 0.5,
                                    borderRadius: 'var(--radius)',
                                    bgcolor: 'var(--muted)',
                                }}>
                                    <Tooltip title="Mevcut Durumu Dışa Aktar">
                                        <Button
                                            variant="ghost"
                                            startIcon={<Download />}
                                            onClick={handleExport}
                                            sx={{
                                                height: 48,
                                                color: 'var(--muted-foreground)',
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', color: 'var(--foreground)' }
                                            }}
                                        >
                                            Dışa Aktar
                                        </Button>
                                    </Tooltip>

                                    <Box sx={{ width: '1px', height: 32, bgcolor: 'var(--border)', alignSelf: 'center', mx: 0.5 }} />

                                    <Tooltip title="Güncelleme Şablonunu İndir">
                                        <Button
                                            variant="text"
                                            startIcon={<CloudDownload />}
                                            onClick={handleDownloadTemplate}
                                            sx={{
                                                height: 48,
                                                color: 'var(--chart-2)',
                                                fontWeight: 600,
                                                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' }
                                            }}
                                        >
                                            Şablon
                                        </Button>
                                    </Tooltip>

                                    <Button
                                        variant="contained"
                                        onClick={handleUploadClick}
                                        startIcon={<CloudUpload />}
                                        sx={{
                                            height: 48,
                                            px: 3,
                                            borderRadius: 'var(--radius)',
                                            bgcolor: 'var(--primary)',
                                            color: 'var(--primary-foreground)',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            '&:hover': {
                                                bgcolor: 'var(--primary-hover)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                            },
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Toplu Güncelle
                                    </Button>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept=".xlsx, .xls"
                                        onChange={handleFileChange}
                                    />
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
                    * Mevcut Stok / Kritik Stok formatında gösterilmektedir. Kritik stok değerlerini düzenlemek için kalem ikonuna tıklayın.
                </Typography>
            </Box>

            {/* Bulk Update Result Dialog */}
            <Dialog
                open={!!updateResult}
                onClose={() => setUpdateResult(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 'var(--radius)' }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                    <Info color="primary" />
                    <Typography variant="h6" component="span" fontWeight="bold">Güncelleme Sonucu</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'var(--muted)', borderRadius: 'var(--radius)' }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" color="var(--muted-foreground)">Güncellenen</Typography>
                                <Typography variant="h5" fontWeight="bold" color="var(--primary)">{updateResult?.updated}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" color="var(--muted-foreground)">Atlanan / Hatalı</Typography>
                                <Typography variant="h5" fontWeight="bold" color="var(--destructive)">{updateResult?.skipped}</Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {updateResult && updateResult.errors.length > 0 && (
                        <>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Hata Detayları:</Typography>
                            <Box sx={{
                                maxHeight: 200,
                                overflow: 'auto',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                bgcolor: 'rgba(0,0,0,0.02)'
                            }}>
                                <List dense>
                                    {updateResult.errors.map((error, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <ErrorIcon sx={{ fontSize: 16, color: 'var(--destructive)' }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={error}
                                                    primaryTypographyProps={{ variant: 'body2', sx: { fontSize: 13 } }}
                                                />
                                            </ListItem>
                                            {index < updateResult.errors.length - 1 && <Divider component="li" />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        variant="ghost"
                        onClick={() => setUpdateResult(null)}
                        sx={{ borderRadius: 'var(--radius)' }}
                    >
                        Kapat
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<FileDownload />}
                        onClick={handleDownloadUpdateReport}
                        sx={{
                            borderRadius: 'var(--radius)',
                            bgcolor: 'var(--primary)',
                            '&:hover': { bgcolor: 'var(--primary-hover)' }
                        }}
                    >
                        Raporu İndir (Excel)
                    </Button>
                </DialogActions>
            </Dialog>
        </MainLayout>
    );
}
