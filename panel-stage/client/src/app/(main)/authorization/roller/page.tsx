'use client';

import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    CircularProgress,
    Grid,
    Paper,
    InputAdornment,
    Stack,
    Divider,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
    Add,
    Edit,
    Delete,
    AdminPanelSettings,
    Security,
    People,
    Search,
    Refresh,
    FilterList,
    VerifiedUser,
    ManageAccounts,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RoleService } from '@/services/role.service';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/Layout/MainLayout';

export default function RolesPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Roles
    const { data: roles = [], isLoading, isRefetching } = useQuery({
        queryKey: ['roles'],
        queryFn: RoleService.getRoles,
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: RoleService.createRole,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Rol başarıyla oluşturuldu');
            setCreateDialogOpen(false);
            setNewRoleName('');
            setNewRoleDescription('');
            router.push(`/yetkilendirme/roller/${data.id}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Rol oluşturulurken hata oluştu');
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: RoleService.deleteRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Rol başarıyla silindi');
            setDeleteDialogOpen(false);
            setSelectedRole(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Rol silinirken hata oluştu');
        },
    });

    const handleCreate = () => {
        if (!newRoleName.trim()) return;
        createMutation.mutate({
            name: newRoleName,
            description: newRoleDescription,
            permissions: [],
        });
    };

    const handleDelete = () => {
        if (selectedRole) {
            deleteMutation.mutate(selectedRole.id);
        }
    };

    // Filtered roles based on search
    const filteredRoles = useMemo(() => {
        if (!searchQuery) return roles;
        const lowerQuery = searchQuery.toLowerCase();
        return roles.filter((role: any) =>
            role.name.toLowerCase().includes(lowerQuery) ||
            role.description?.toLowerCase().includes(lowerQuery)
        );
    }, [roles, searchQuery]);

    // Stats calculations
    const stats = useMemo(() => {
        return {
            total: roles.length,
            system: roles.filter((r: any) => r.isSystemRole).length,
            custom: roles.filter((r: any) => !r.isSystemRole).length,
        };
    }, [roles]);

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Rol Adı',
            flex: 1,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: params.row.isSystemRole ? 'primary.light' : 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: params.row.isSystemRole ? 'primary.main' : 'grey.600'
                        }}
                    >
                        {params.row.isSystemRole ? <VerifiedUser fontSize="small" /> : <People fontSize="small" />}
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        { field: 'description', headerName: 'Açıklama', flex: 1.5, minWidth: 200 },
        {
            field: 'isSystemRole',
            headerName: 'Tip',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value ? 'Sistem Rolü' : 'Özel Rol'}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        bgcolor: params.value ? 'rgba(99, 102, 241, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: params.value ? 'primary.main' : 'text.secondary',
                        border: '1px solid',
                        borderColor: params.value ? 'rgba(99, 102, 241, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                    }}
                />
            ),
        },
        {
            field: 'userCount',
            headerName: 'Kullanıcılar',
            width: 130,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        label={params.row._count?.users || 0}
                        size="small"
                        icon={<People sx={{ fontSize: '14px !important' }} />}
                        variant="outlined"
                        sx={{ fontWeight: 600, px: 0.5 }}
                    />
                </Box>
            ),
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 120,
            sortable: false,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params: GridRenderCellParams) => {
                const isSystem = params.row.isSystemRole;
                return (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Düzenle / İzinler">
                            <IconButton
                                size="small"
                                onClick={() => router.push(`/yetkilendirme/roller/${params.row.id}`)}
                                sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {!isSystem && (
                            <Tooltip title="Sil">
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setSelectedRole(params.row);
                                        setDeleteDialogOpen(true);
                                    }}
                                    sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.lighter' } }}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                );
            },
        },
    ];

    return (
        <MainLayout>
            <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100%' }}>
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: '#1e293b', letterSpacing: '-0.025em' }}>
                            Rol ve İzin Yönetimi
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <AdminPanelSettings sx={{ color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                Sistemdeki rolleri yapılandırın ve erişim seviyelerini kontrol edin.
                            </Typography>
                        </Stack>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['roles'] })}
                            disabled={isRefetching}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Yenile
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setCreateDialogOpen(true)}
                            sx={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                color: 'white',
                                px: 3,
                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                                    boxShadow: '0 6px 16px rgba(79, 70, 229, 0.4)',
                                }
                            }}
                        >
                            Yeni Rol Oluştur
                        </Button>
                    </Box>
                </Box>

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                                            TOPLAM ROL
                                        </Typography>
                                        <Typography variant="h4" fontWeight="800" color="#1e293b">
                                            {stats.total}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.lighter', color: 'primary.main' }}>
                                        <ManageAccounts fontSize="large" />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                                            SİSTEM ROLLERİ
                                        </Typography>
                                        <Typography variant="h4" fontWeight="800" color="#1e293b">
                                            {stats.system}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.lighter', color: 'secondary.main' }}>
                                        <Security fontSize="large" />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                                            ÖZEL ROLLER
                                        </Typography>
                                        <Typography variant="h4" fontWeight="800" color="#1e293b">
                                            {stats.custom}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.lighter', color: 'warning.main' }}>
                                        <People fontSize="large" />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filter Bar */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mr: 1 }}>
                        <FilterList fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>Filtrele:</Typography>
                    </Box>
                    <TextField
                        size="small"
                        placeholder="Rol veya açıklama ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            width: 300,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'white',
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" color="disabled" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        Toplam <strong>{filteredRoles.length}</strong> sonuç gösteriliyor.
                    </Typography>
                </Paper>

                {/* Main Content Card */}
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={filteredRoles}
                            columns={columns}
                            loading={isLoading}
                            disableRowSelectionOnClick
                            getRowHeight={() => 64}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 10, page: 0 },
                                },
                            }}
                            pageSizeOptions={[10, 25, 50]}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: '#f1f5f9',
                                    color: '#475569',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderColor: '#f1f5f9',
                                },
                                '& .MuiDataGrid-row:hover': {
                                    bgcolor: '#f8fafc',
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '1px solid #f1f5f9',
                                },
                            }}
                        />
                    </Box>
                </Card>

                {/* Create Dialog */}
                <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                    <DialogTitle sx={{ fontWeight: 800, pt: 3, pb: 1 }}>Yeni Rol Tanımla</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 3, color: 'text.secondary' }}>
                            Sistemde yeni bir yetki grubu oluşturun. İzin ayarlarını bir sonraki adımda detaylıca yapabilirsiniz.
                        </DialogContentText>
                        <Stack spacing={3}>
                            <TextField
                                autoFocus
                                label="Rol Adı"
                                fullWidth
                                placeholder="Örn: Muhasebe Yöneticisi"
                                variant="outlined"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                            <TextField
                                label="Açıklama"
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Bu rolün sorumluluklarını kısaca açıklayın..."
                                variant="outlined"
                                value={newRoleDescription}
                                onChange={(e) => setNewRoleDescription(e.target.value)}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            İptal
                        </Button>
                        <Button
                            onClick={handleCreate}
                            variant="contained"
                            disabled={!newRoleName.trim() || createMutation.isPending}
                            sx={{ borderRadius: 2, py: 1, px: 4, fontWeight: 700 }}
                        >
                            {createMutation.isPending ? 'İşleniyor...' : 'Oluştur ve Yapılandır'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
                    <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Rolü Silmek İstediğinize Emin Misiniz?</DialogTitle>
                    <DialogContent>
                        <DialogContentText color="error.main" sx={{ fontWeight: 500 }}>
                            "{selectedRole?.name}" rolünü kalıcı olarak silmek üzeresiniz.
                        </DialogContentText>
                        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                            Eğer bu role atanmış kullanıcılar varsa, sistem güvenliği gereği silme işlemi engellenecektir.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Geri Dön
                        </Button>
                        <Button
                            onClick={handleDelete}
                            color="error"
                            variant="contained"
                            disabled={deleteMutation.isPending}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            {deleteMutation.isPending ? 'Siliniyor...' : 'Onayla ve Sil'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MainLayout>
    );
}
