'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
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
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
    Add,
    Edit,
    Delete,
    AdminPanelSettings,
    Security,
    People,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RoleService } from '@/services/role.service';
import { toast } from 'react-hot-toast';

export default function RolesPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDescription, setNewRoleDescription] = useState('');

    // Fetch Roles
    const { data: roles = [], isLoading } = useQuery({
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
            permissions: [], // Start with empty permissions
        });
    };

    const handleDelete = () => {
        if (selectedRole) {
            deleteMutation.mutate(selectedRole.id);
        }
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Rol Adı', flex: 1, minWidth: 150 },
        { field: 'description', headerName: 'Açıklama', flex: 1.5, minWidth: 200 },
        {
            field: 'isSystemRole',
            headerName: 'Tip',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value ? 'Sistem Rolü' : 'Özel Rol'}
                    color={params.value ? 'secondary' : 'default'}
                    size="small"
                    variant={params.value ? 'filled' : 'outlined'}
                    icon={params.value ? <Security sx={{ fontSize: 16 }} /> : undefined}
                />
            ),
        },
        {
            field: 'userCount',
            headerName: 'Kullanıcılar',
            width: 130,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">{params.row._count?.users || 0}</Typography>
                </Box>
            ),
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => {
                const isSystem = params.row.isSystemRole;
                return (
                    <Box>
                        <Tooltip title="Düzenle / İzinler">
                            <IconButton
                                size="small"
                                onClick={() => router.push(`/yetkilendirme/roller/${params.row.id}`)}
                                sx={{ color: 'primary.main' }}
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
                                    sx={{ color: 'error.main' }}
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
        <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight="700" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettings sx={{ color: 'primary.main' }} />
                        Rol ve İzin Yönetimi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sistemdeki rolleri ve bu rollere ait izinleri yapılandırın.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white',
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                    }}
                >
                    Yeni Rol Oluştur
                </Button>
            </Box>

            {/* Content */}
            <Card
                sx={{
                    height: 600,
                    width: '100%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <DataGrid
                    rows={roles}
                    columns={columns}
                    loading={isLoading}
                    disableRowSelectionOnClick
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                        },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'rgba(249, 250, 251, 0.5)',
                            color: 'text.secondary',
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                />
            </Card>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>Yeni Rol Oluştur</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Yeni bir rol oluşturun. Daha sonra detay sayfasından izinlerini ayarlayabilirsiniz.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Rol Adı"
                        fullWidth
                        variant="outlined"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Açıklama"
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        value={newRoleDescription}
                        onChange={(e) => setNewRoleDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setCreateDialogOpen(false)} color="inherit">
                        İptal
                    </Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        disabled={!newRoleName.trim() || createMutation.isPending}
                        startIcon={createMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {createMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur ve Düzenle'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Rolü Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        "{selectedRole?.name}" rolünü silmek istediğinize emin misiniz? Bu role atanmış kullanıcı varsa işlem gerçekleştirilemez.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
                        İptal
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={deleteMutation.isPending}
                        startIcon={deleteMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
