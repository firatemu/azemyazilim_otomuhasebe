'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    TextField,
    CircularProgress,
    Grid,
    Breadcrumbs,
    Link as MuiLink,
    Chip,
    Alert,
    Stack,
    Paper,
    Divider,
    IconButton,
    CardContent,
} from '@mui/material';
import {
    Save,
    ArrowBack,
    AdminPanelSettings,
    Security,
    Warning,
    History,
    ChevronRight,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { RoleService } from '@/services/role.service';
import PermissionMatrix from '@/components/Roles/PermissionMatrix';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/Layout/MainLayout';

export default function RoleDetailPage() {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const roleId = params.id as string;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isSystemRole, setIsSystemRole] = useState(false);

    // Fetch Role
    const { data: role, isLoading: roleLoading } = useQuery({
        queryKey: ['role', roleId],
        queryFn: () => RoleService.getRole(roleId),
    });

    // Fetch All Permissions
    const { data: allPermissions = [], isLoading: permsLoading } = useQuery({
        queryKey: ['permissions'],
        queryFn: RoleService.getAllPermissions,
    });

    // Initialize state
    useEffect(() => {
        if (role) {
            setName(role.name);
            setDescription(role.description || '');
            setIsSystemRole(role.isSystemRole);

            // Map role permissions to ID array
            if (role.permissions) {
                setSelectedPermissions(role.permissions.map((p) => p.permissionId));
            }
        }
    }, [role]);

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => RoleService.updateRole(roleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['role', roleId] });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Rol başarıyla güncellendi');
            router.push('/yetkilendirme/roller');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Rol güncellenirken hata oluştu');
        },
    });

    const handleSave = () => {
        updateMutation.mutate({
            name,
            description,
            permissions: selectedPermissions,
        });
    };

    if (roleLoading || permsLoading) {
        return (
            <MainLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
                    <CircularProgress size={50} thickness={4} />
                </Box>
            </MainLayout>
        );
    }

    if (!role) {
        return (
            <MainLayout>
                <Box sx={{ p: 4 }}>
                    <Alert severity="error">Rol bulunamadı.</Alert>
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100%' }}>
                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                    <Breadcrumbs
                        separator={<ChevronRight fontSize="small" />}
                        sx={{ mb: 2, '& .MuiBreadcrumbs-li': { fontSize: '0.875rem', fontWeight: 500 } }}
                    >
                        <MuiLink component={Link} href="/dashboard" color="text.secondary" underline="hover">
                            Panel
                        </MuiLink>
                        <MuiLink component={Link} href="/yetkilendirme/roller" color="text.secondary" underline="hover">
                            Rol Yönetimi
                        </MuiLink>
                        <Typography color="text.primary" fontWeight={600}>{role.name}</Typography>
                    </Breadcrumbs>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton
                                onClick={() => router.back()}
                                sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f1f5f9' } }}
                            >
                                <ArrowBack fontSize="small" />
                            </IconButton>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="h4" fontWeight="800" sx={{ color: '#1e293b', letterSpacing: '-0.025em' }}>
                                        {role.name}
                                    </Typography>
                                    {isSystemRole && (
                                        <Chip
                                            label="Sistem Rolü"
                                            size="small"
                                            icon={<Security sx={{ fontSize: 14 }} />}
                                            sx={{
                                                fontWeight: 700,
                                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                                color: 'primary.main',
                                                border: '1px solid rgba(99, 102, 241, 0.2)'
                                            }}
                                        />
                                    )}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Rol detaylarını ve yetki matrisini yapılandırın.
                                </Typography>
                            </Box>
                        </Box>

                        {!isSystemRole && (
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    startIcon={updateMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    sx={{
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                        color: 'white',
                                        px: 4,
                                        py: 1,
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                                            boxShadow: '0 6px 16px rgba(79, 70, 229, 0.4)',
                                        }
                                    }}
                                >
                                    {updateMutation.isPending ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                                </Button>
                            </Stack>
                        )}
                    </Box>
                </Box>

                {isSystemRole && (
                    <Alert
                        severity="info"
                        variant="standard"
                        icon={<Security />}
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            bgcolor: 'rgba(99, 102, 241, 0.05)',
                            '& .MuiAlert-message': { fontWeight: 500, color: '#4338ca' }
                        }}
                    >
                        Bu bir <strong>Sistem Rolü</strong> olduğu için ismi ve izinleri üzerinde değişiklik yapılamaz.
                    </Alert>
                )}

                <Grid container spacing={4}>
                    {/* Left Col: Role Info */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Stack spacing={4}>
                            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
                                    <Typography variant="h6" fontWeight="700" color="#1e293b" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AdminPanelSettings fontSize="small" color="primary" />
                                        Rol Bilgileri
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={3}>
                                        <TextField
                                            label="Rol Adı"
                                            fullWidth
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={isSystemRole}
                                            placeholder="Örn: Muhasebe Yöneticisi"
                                            InputProps={{ sx: { borderRadius: 2 } }}
                                        />
                                        <TextField
                                            label="Rol Açıklaması"
                                            fullWidth
                                            multiline
                                            rows={5}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            disabled={isSystemRole}
                                            placeholder="Bu rolün sistemdeki görevlerini tanımlayın..."
                                            InputProps={{ sx: { borderRadius: 2 } }}
                                        />
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#f1f5f9' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <History sx={{ color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                SON GÜNCELLEME
                                            </Typography>
                                            <Typography variant="body2" fontWeight={700}>
                                                {(role as any).updatedAt ? new Date((role as any).updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Bilgi yok'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>

                    {/* Right Col: Permissions */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight="700" color="#1e293b" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Security fontSize="small" color="primary" />
                                    Yetki Matrisi
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    AKTİF İZİN SAYISI: <strong>{selectedPermissions.length}</strong>
                                </Typography>
                            </Box>
                            <Box sx={{ p: 0 }}>
                                <PermissionMatrix
                                    permissions={allPermissions}
                                    selectedPermissions={selectedPermissions}
                                    onChange={setSelectedPermissions}
                                    readOnly={isSystemRole}
                                />
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </MainLayout>
    );
}
