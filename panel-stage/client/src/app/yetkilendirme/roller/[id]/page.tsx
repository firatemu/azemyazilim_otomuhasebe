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
} from '@mui/material';
import {
    Save,
    ArrowBack,
    AdminPanelSettings,
    Security,
    Warning,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { RoleService } from '@/services/role.service';
import PermissionMatrix from '@/components/Roles/PermissionMatrix';
import { toast } from 'react-hot-toast';

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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!role) {
        return <Typography>Rol bulunamadı.</Typography>;
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <MuiLink component={Link} href="/dashboard" color="inherit" underline="hover">
                        Dashboard
                    </MuiLink>
                    <MuiLink component={Link} href="/yetkilendirme/roller" color="inherit" underline="hover">
                        Roller
                    </MuiLink>
                    <Typography color="text.primary">{role.name}</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => router.back()}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        >
                            Geri
                        </Button>
                        <Box>
                            <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {role.name}
                                {isSystemRole && (
                                    <Chip
                                        label="Sistem Rolü"
                                        color="secondary"
                                        size="small"
                                        icon={<Security sx={{ fontSize: 16 }} />}
                                    />
                                )}
                            </Typography>
                        </Box>
                    </Box>
                    {!isSystemRole && (
                        <Button
                            variant="contained"
                            startIcon={updateMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            sx={{
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                color: 'white',
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                                borderRadius: 2,
                            }}
                        >
                            Kaydet
                        </Button>
                    )}
                </Box>
            </Box>

            {isSystemRole && (
                <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
                    Bu bir sistem rolüdür. İzinleri ve detayları değiştirilemez.
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Left Col: Details */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AdminPanelSettings fontSize="small" color="primary" />
                            Rol Detayları
                        </Typography>

                        <TextField
                            label="Rol Adı"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSystemRole}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            label="Açıklama"
                            fullWidth
                            multiline
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSystemRole}
                        />
                    </Card>
                </Grid>

                {/* Right Col: Permissions */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Security fontSize="small" color="primary" />
                            İzin Yapılandırması
                        </Typography>

                        <PermissionMatrix
                            permissions={allPermissions}
                            selectedPermissions={selectedPermissions}
                            onChange={setSelectedPermissions}
                            readOnly={isSystemRole}
                        />
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
