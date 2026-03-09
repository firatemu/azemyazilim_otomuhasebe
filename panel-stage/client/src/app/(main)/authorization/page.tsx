'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Alert,
    Paper,
} from '@mui/material';
import {
    AdminPanelSettings,
    Edit,
    Delete,
    Person,
    PersonOff,
    Refresh,
    Search,
    FilterList,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';

// ============= TYPE DEFINITIONS =============

interface User {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    tenant?: {
        id: string;
        name: string;
    };
}

interface UserStats {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
}

// ============= HELPER FUNCTIONS =============

const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
        SUPER_ADMIN: 'Süper Admin',
        TENANT_ADMIN: 'Tenant Admin',
        ADMIN: 'Yönetici',
        MANAGER: 'Müdür',
        SUPPORT: 'Destek',
        USER: 'Kullanıcı',
        VIEWER: 'İzleyici',
    };
    return labels[role] || role;
};

const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
        SUPER_ADMIN: '#8b5cf6',
        TENANT_ADMIN: '#3b82f6',
        ADMIN: '#6366f1',
        MANAGER: '#10b981',
        SUPPORT: '#f59e0b',
        USER: '#6b7280',
        VIEWER: '#9ca3af',
    };
    return colors[role] || '#6b7280';
};

const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Hiç giriş yapmadı';
    const date = new Date(dateStr);
    return date.toLocaleString('tr-TR');
};

// ============= MAIN PAGE =============

export default function YetkilendirmePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore((state: any) => state) as any;

    // Check authorization
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'TENANT_ADMIN' || user?.role === 'ADMIN';

    // State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Fetch users
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['users', searchQuery],
        queryFn: async () => {
            const response = await axios.get('/users', {
                params: { search: searchQuery, limit: 1000 },
            });
            return response.data;
        },
    });

    // Fetch stats
    const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
        queryKey: ['users-stats'],
        queryFn: async () => {
            const response = await axios.get('/users/stats/summary');
            return response.data;
        },
    });

    // Update role mutation
    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
            const response = await axios.put(`/users/${userId}/role`, { role });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users-stats'] });
            setRoleDialogOpen(false);
            setSelectedUser(null);
        },
    });

    // Suspend user mutation
    const suspendMutation = useMutation({
        mutationFn: async (userId: string) => {
            const response = await axios.post(`/users/${userId}/suspend`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users-stats'] });
        },
    });

    // Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await axios.delete(`/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users-stats'] });
            setDeleteDialogOpen(false);
            setSelectedUser(null);
        },
    });

    // Filter users
    const filteredUsers = (usersData?.data || []).filter((user: User) => {
        if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;
        if (statusFilter === 'ACTIVE' && !user.isActive) return false;
        if (statusFilter === 'INACTIVE' && user.isActive) return false;
        return true;
    });

    // Handle role change
    const handleRoleChange = () => {
        if (selectedUser && newRole) {
            updateRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
        }
    };

    // Handle delete
    const handleDelete = () => {
        if (selectedUser) {
            deleteMutation.mutate(selectedUser.id);
        }
    };

    // DataGrid columns
    const columns: GridColDef[] = [
        {
            field: 'avatar',
            headerName: '',
            width: 60,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Avatar sx={{ width: 36, height: 36, bgcolor: getRoleColor(params.row.role), fontSize: '0.875rem' }}>
                    {params.row.fullName.charAt(0).toUpperCase()}
                </Avatar>
            ),
        },
        {
            field: 'fullName',
            headerName: 'Ad Soyad',
            flex: 1,
            minWidth: 180,
        },
        {
            field: 'email',
            headerName: 'E-posta',
            flex: 1,
            minWidth: 200,
        },
        {
            field: 'username',
            headerName: 'Kullanıcı Adı',
            width: 150,
        },
        {
            field: 'role',
            headerName: 'Rol',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={getRoleLabel(params.value)}
                    size="small"
                    sx={{
                        bgcolor: `${getRoleColor(params.value)}15`,
                        color: getRoleColor(params.value),
                        fontWeight: 600,
                    }}
                />
            ),
        },
        {
            field: 'tenant',
            headerName: 'Tenant',
            width: 150,
            renderCell: (params: GridRenderCellParams) => params.value?.name || 'N/A',
        },
        {
            field: 'isActive',
            headerName: 'Durum',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value ? 'Aktif' : 'Pasif'}
                    size="small"
                    color={params.value ? 'success' : 'default'}
                />
            ),
        },
        {
            field: 'lastLoginAt',
            headerName: 'Son Giriş',
            width: 180,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                    {formatDate(params.value)}
                </Typography>
            ),
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Rol Değiştir">
                        <IconButton
                            size="small"
                            onClick={() => {
                                setSelectedUser(params.row);
                                setNewRole(params.row.role);
                                setRoleDialogOpen(true);
                            }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={params.row.isActive ? 'Pasifleştir' : 'Aktifleştir'}>
                        <IconButton
                            size="small"
                            onClick={() => suspendMutation.mutate(params.row.id)}
                        >
                            {params.row.isActive ? <PersonOff fontSize="small" /> : <Person fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                                setSelectedUser(params.row);
                                setDeleteDialogOpen(true);
                            }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    if (!isAdmin) {
        return (
            <MainLayout>
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">Bu sayfaya erişim yetkiniz yok.</Alert>
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AdminPanelSettings />
                            Kullanıcı Yetkilendirme
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Kullanıcı rolleri ve yetkilendirme yönetimi
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => {
                            queryClient.invalidateQueries({ queryKey: ['users'] });
                            queryClient.invalidateQueries({ queryKey: ['users-stats'] });
                        }}
                    >
                        Yenile
                    </Button>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom variant="body2">
                                    Toplam Kullanıcı
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    {stats?.total || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom variant="body2">
                                    Aktif Kullanıcı
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {stats?.active || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom variant="body2">
                                    Pasif Kullanıcı
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="error.main">
                                    {stats?.inactive || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom variant="body2">
                                    Yönetici
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {(stats?.byRole?.ADMIN || 0) + (stats?.byRole?.TENANT_ADMIN || 0) + (stats?.byRole?.SUPER_ADMIN || 0)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            placeholder="Kullanıcı ara (ad, email, kullanıcı adı)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flex: 1, minWidth: 200 }}
                            InputProps={{
                                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                            }}
                        />
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Rol</InputLabel>
                            <Select value={roleFilter} label="Rol" onChange={(e) => setRoleFilter(e.target.value)}>
                                <MenuItem value="ALL">Tümü</MenuItem>
                                <MenuItem value="SUPER_ADMIN">Süper Admin</MenuItem>
                                <MenuItem value="TENANT_ADMIN">Tenant Admin</MenuItem>
                                <MenuItem value="ADMIN">Yönetici</MenuItem>
                                <MenuItem value="MANAGER">Müdür</MenuItem>
                                <MenuItem value="SUPPORT">Destek</MenuItem>
                                <MenuItem value="USER">Kullanıcı</MenuItem>
                                <MenuItem value="VIEWER">İzleyici</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Durum</InputLabel>
                            <Select value={statusFilter} label="Durum" onChange={(e) => setStatusFilter(e.target.value)}>
                                <MenuItem value="ALL">Tümü</MenuItem>
                                <MenuItem value="ACTIVE">Aktif</MenuItem>
                                <MenuItem value="INACTIVE">Pasif</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Paper>

                {/* DataGrid */}
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={filteredUsers}
                        columns={columns}
                        loading={usersLoading}
                        pageSizeOptions={[25, 50, 100]}
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

                {/* Role Change Dialog */}
                <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle component="div">Rol Değiştir</DialogTitle>
                    <DialogContent>
                        {selectedUser && (
                            <Box sx={{ pt: 1 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Kullanıcı: <strong>{selectedUser.fullName}</strong> ({selectedUser.email})
                                </Typography>
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>Yeni Rol</InputLabel>
                                    <Select value={newRole} label="Yeni Rol" onChange={(e) => setNewRole(e.target.value)}>
                                        <MenuItem value="SUPER_ADMIN">Süper Admin</MenuItem>
                                        <MenuItem value="TENANT_ADMIN">Tenant Admin</MenuItem>
                                        <MenuItem value="ADMIN">Yönetici</MenuItem>
                                        <MenuItem value="MANAGER">Müdür</MenuItem>
                                        <MenuItem value="SUPPORT">Destek</MenuItem>
                                        <MenuItem value="USER">Kullanıcı</MenuItem>
                                        <MenuItem value="VIEWER">İzleyici</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRoleDialogOpen(false)}>İptal</Button>
                        <Button variant="contained" onClick={handleRoleChange} disabled={updateRoleMutation.isPending}>
                            {updateRoleMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle component="div">Kullanıcıyı Sil</DialogTitle>
                    <DialogContent>
                        {selectedUser && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                                <strong>{selectedUser.fullName}</strong> adlı kullanıcıyı silmek istediğinizden emin misiniz?
                                Bu işlem geri alınamaz.
                            </Alert>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
                        <Button color="error" variant="contained" onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MainLayout>
    );
}
