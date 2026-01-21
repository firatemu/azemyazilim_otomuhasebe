import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserX,
  UserCheck,
} from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useUsers,
  useUser,
  useUpdateUser,
  useDeleteUser,
  useSuspendUser,
  useApproveUserSubscription,
  useAssignTenantId,
  User,
} from '@/hooks/useUsers';
import { formatDateTime, formatDateOnly } from '@/lib/dateUtils';
import { toast } from 'sonner';

export default function Users() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  const { data: usersData, isLoading } = useUsers({
    search,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  // Güvenli array kontrolü - her zaman array garantisi
  const users: User[] = useMemo(() => {
    if (Array.isArray(usersData)) {
      return usersData;
    }
    if (usersData && typeof usersData === 'object' && Array.isArray(usersData.data)) {
      return usersData.data;
    }
    return [];
  }, [usersData]);

  const { data: userDetail } = useUser(selectedUser?.id || '');

  const deleteUser = useDeleteUser();
  const suspendUser = useSuspendUser();
  const updateUser = useUpdateUser();
  const approveSubscription = useApproveUserSubscription();
  const assignTenantId = useAssignTenantId();
  
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [assignTenantDialogOpen, setAssignTenantDialogOpen] = useState(false);

  // Filtrelenmiş kullanıcılar
  const filteredUsers = useMemo(() => {
    let result = users;

    // Durum filtresi
    if (statusFilter !== 'ALL') {
      result = result.filter((u) => {
        if (statusFilter === 'ACTIVE') return u.isActive === true;
        if (statusFilter === 'SUSPENDED') return u.isActive === false;
        return true;
      });
    }

    // Rol filtresi
    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter);
    }

    return result;
  }, [users, statusFilter, roleFilter]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
    handleMenuClose();
  };

  const handleEditClick = () => {
    if (menuUser) {
      setSelectedUser(menuUser);
      setEditModalOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleSuspendClick = () => {
    setSuspendDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    const userToDelete = menuUser || selectedUser;
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync(userToDelete.id);
      toast.success('Kullanıcı silindi');
      setDeleteDialogOpen(false);
      setMenuUser(null);
      if (selectedUser) {
        setDetailModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Kullanıcı silinirken hata oluştu');
    }
  };

  const handleSuspend = async () => {
    const userToSuspend = menuUser || selectedUser;
    if (!userToSuspend) return;

    try {
      await suspendUser.mutateAsync(userToSuspend.id);
      toast.success(`Kullanıcı ${userToSuspend.isActive ? 'askıya alındı' : 'aktif hale getirildi'}`);
      setSuspendDialogOpen(false);
      setMenuUser(null);
      if (selectedUser) {
        setDetailModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'İşlem sırasında hata oluştu');
    }
  };

  const handleApproveSubscription = async () => {
    const userToApprove = menuUser || selectedUser;
    if (!userToApprove) return;

    try {
      await approveSubscription.mutateAsync(userToApprove.id);
      toast.success('Abonelik onaylandı ve Tenant ID atandı!');
      setMenuUser(null);
      if (selectedUser) {
        setDetailModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Abonelik onaylanırken hata oluştu');
    }
  };

  // Özet kartları - Güvenli array işlemleri
  const summaryCards = useMemo(() => {
    const safeUsers = Array.isArray(filteredUsers) ? filteredUsers : [];
    
    return [
      {
        title: 'Toplam Kullanıcı',
        value: safeUsers.length,
        color: 'primary',
      },
      {
        title: 'Aktif Kullanıcı',
        value: safeUsers.filter((u: User) => u?.isActive === true).length,
        color: 'success',
      },
      {
        title: 'Pasif Kullanıcı',
        value: safeUsers.filter((u: User) => u?.isActive === false).length,
        color: 'error',
      },
      {
        title: 'Admin',
        value: safeUsers.filter((u: User) => u?.role === 'SUPER_ADMIN' || u?.role === 'TENANT_ADMIN').length,
        color: 'warning',
      },
      {
        title: 'Toplam Harcama',
        value: `₺${safeUsers
          .reduce((sum: number, u: User) => sum + (u?.totalSpent || 0), 0)
          .toLocaleString('tr-TR')}`,
        color: 'info',
      },
    ];
  }, [filteredUsers]);

  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      accessorKey: 'fullName',
      header: 'Kullanıcı',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {user?.fullName || user?.username || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || 'N/A'}
            </Typography>
          </Box>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => {
        const role = row.original?.role;
        const roleLabels: Record<string, string> = {
          SUPER_ADMIN: 'Süper Admin',
          TENANT_ADMIN: 'Admin',
          USER: 'Kullanıcı',
          SUPPORT: 'Destek',
        };
        return (
          <Chip
            label={roleLabels[role] || role || 'N/A'}
            size="small"
            color={role === 'SUPER_ADMIN' ? 'error' : role === 'TENANT_ADMIN' ? 'warning' : 'default'}
            variant="outlined"
          />
        );
      },
    },
    {
      accessorKey: 'tenant',
      header: 'Şirket / Tenant ID',
      cell: ({ row }) => {
        const tenant = row.original?.tenant;
        const tenantId = row.original?.tenantId || tenant?.id;
        return (
          <Box>
            <Typography variant="body2">
              {tenant?.name || 'N/A'}
            </Typography>
            <Typography 
              variant="caption" 
              color={tenantId ? "primary.main" : "text.secondary"} 
              fontFamily="monospace"
              fontWeight={tenantId ? "bold" : "normal"}
              sx={{ display: 'block', mt: 0.5 }}
            >
              {tenantId ? `Tenant ID: ${tenantId}` : 'Tenant ID: Yok'}
            </Typography>
          </Box>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Durum',
      cell: ({ row }) => (
        <StatusChip status={row.original?.isActive ? 'ACTIVE' : 'SUSPENDED'} />
      ),
    },
    {
      accessorKey: 'registeredAt',
      header: 'Kayıt Tarihi',
      cell: ({ row }) => {
        const date = row.original?.registeredAt || row.original?.createdAt;
        return date ? formatDateOnly(date) : '-';
      },
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Son Giriş',
      cell: ({ row }) => {
        const lastLogin = row.original?.lastLoginAt;
        return lastLogin ? formatDateOnly(lastLogin) : '-';
      },
    },
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, row.original)}
        >
          <MoreVertical size={16} />
        </IconButton>
      ),
    },
  ], []);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem' },
              background: 'linear-gradient(135deg, rgb(216, 121, 67) 0%, rgb(231, 138, 83) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Kullanıcılar
          </Typography>
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            sx={{
              background: 'linear-gradient(135deg, rgb(216, 121, 67) 0%, rgb(231, 138, 83) 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, rgb(200, 105, 50) 0%, rgb(220, 125, 70) 100%)',
                boxShadow: '0 4px 12px rgba(216, 121, 67, 0.4)',
              },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
            }}
          >
            Export Excel
          </Button>
        </Box>

        {/* Özet Kartları */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }, gap: 3, mb: 3 }}>
          {summaryCards.map((card, index) => (
            <Card
              key={index}
              sx={{
                p: 2,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
                border: `1px solid ${
                  card.color === 'success'
                    ? 'rgba(0, 200, 83, 0.2)'
                    : card.color === 'error'
                    ? 'rgba(244, 67, 54, 0.2)'
                    : card.color === 'warning'
                    ? 'rgba(255, 152, 0, 0.2)'
                    : card.color === 'info'
                    ? 'rgba(33, 150, 243, 0.2)'
                    : 'rgba(216, 121, 67, 0.2)'
                }`,
              }}
            >
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1.5 }}>
                  {card.title}
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    color:
                      card.color === 'success'
                        ? 'rgb(16, 185, 129)'
                        : card.color === 'error'
                        ? 'rgb(239, 68, 68)'
                        : card.color === 'warning'
                        ? 'rgb(245, 158, 11)'
                        : card.color === 'info'
                        ? 'rgb(59, 130, 246)'
                        : 'rgb(216, 121, 67)',
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                  }}
                >
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Filtreler */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="İsim, email veya kullanıcı adı ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{
                flex: 1,
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'rgb(216, 121, 67)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgb(216, 121, 67)',
                  },
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Durum</InputLabel>
              <Select
                value={statusFilter}
                label="Durum"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'rgb(216, 121, 67)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgb(216, 121, 67)',
                  },
                }}
              >
                <MenuItem value="ALL">Tümü</MenuItem>
                <MenuItem value="ACTIVE">Aktif</MenuItem>
                <MenuItem value="SUSPENDED">Pasif</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={roleFilter}
                label="Rol"
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'rgb(216, 121, 67)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgb(216, 121, 67)',
                  },
                }}
              >
                <MenuItem value="ALL">Tümü</MenuItem>
                <MenuItem value="SUPER_ADMIN">Süper Admin</MenuItem>
                <MenuItem value="TENANT_ADMIN">Admin</MenuItem>
                <MenuItem value="USER">Kullanıcı</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Tablo */}
        <DataTable
          data={filteredUsers}
          columns={columns}
          isLoading={isLoading}
          onRowClick={handleViewDetails}
        />

        {/* Detay Modal */}
        <Dialog
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedUser && userDetail && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Kullanıcı Detayları
                </Typography>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 1 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Ad Soyad
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {userDetail?.fullName || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {userDetail?.email || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Kullanıcı Adı
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {userDetail?.username || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rol
                    </Typography>
                    <Box>
                      <Chip
                        label={
                          userDetail?.role === 'SUPER_ADMIN'
                            ? 'Süper Admin'
                            : userDetail?.role === 'TENANT_ADMIN'
                            ? 'Admin'
                            : userDetail?.role || 'N/A'
                        }
                        size="small"
                        color={userDetail?.role === 'SUPER_ADMIN' ? 'error' : userDetail?.role === 'TENANT_ADMIN' ? 'warning' : 'default'}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Durum
                    </Typography>
                    <StatusChip status={userDetail?.isActive ? 'ACTIVE' : 'SUSPENDED'} />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                    <Divider sx={{ my: 1 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tenant ID
                    </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="bold" 
                      fontFamily="monospace" 
                      color={userDetail?.tenantId || userDetail?.tenant?.id ? "primary.main" : "error.main"}
                      sx={{ 
                        p: 1, 
                        bgcolor: userDetail?.tenantId || userDetail?.tenant?.id ? 'primary.50' : 'error.50',
                        borderRadius: 1,
                        border: `1px solid ${userDetail?.tenantId || userDetail?.tenant?.id ? 'primary.main' : 'error.main'}`,
                      }}
                    >
                      {userDetail?.tenantId || userDetail?.tenant?.id || '⚠️ Tenant ID Bulunamadı'}
                    </Typography>
                    {!(userDetail?.tenantId || userDetail?.tenant?.id) && (
                      <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                        SaaS multi-tenant için tenant ID gereklidir!
                      </Typography>
                    )}
                  </Box>
                  {userDetail?.tenant && (
                    <>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Şirket Adı
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {userDetail?.tenant?.name || 'N/A'}
                        </Typography>
                      </Box>
                      {userDetail?.tenant?.domain && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Domain
                          </Typography>
                          <Typography variant="body2" fontFamily="monospace">
                            {userDetail?.tenant?.domain}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                  <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                    <Divider sx={{ my: 1 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Kayıt Tarihi
                    </Typography>
                    <Typography variant="body2">
                      {userDetail?.createdAt || userDetail?.registeredAt 
                        ? formatDateTime(userDetail?.createdAt || userDetail?.registeredAt) 
                        : '-'}
                    </Typography>
                  </Box>
                  {userDetail?.lastLoginAt && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Son Giriş
                      </Typography>
                      <Typography variant="body2">
                        {formatDateTime(userDetail?.lastLoginAt)}
                      </Typography>
                    </Box>
                  )}
                  {userDetail?.totalSpent !== undefined && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Toplam Harcama
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color="primary">
                        ₺{userDetail?.totalSpent.toLocaleString('tr-TR')}
                      </Typography>
                    </Box>
                  )}
                  {userDetail?.invoiceCount !== undefined && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Fatura Sayısı
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {userDetail?.invoiceCount}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                {!(userDetail?.tenantId || userDetail?.tenant?.id) && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setDetailModalOpen(false);
                      setApproveDialogOpen(true);
                    }}
                    disabled={approveSubscription.isPending}
                  >
                    {approveSubscription.isPending ? 'Onaylanıyor...' : 'Aboneliği Onayla (Tenant ID Ata)'}
                  </Button>
                )}
                <Button onClick={() => setDetailModalOpen(false)}>Kapat</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Menü */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => menuUser && handleViewDetails(menuUser)}>
            <Eye size={16} style={{ marginRight: 8 }} />
            Detayları Gör
          </MenuItem>
          <MenuItem onClick={handleEditClick}>
            <Edit size={16} style={{ marginRight: 8 }} />
            Düzenle
          </MenuItem>
          <MenuItem onClick={handleSuspendClick}>
            {menuUser?.isActive ? (
              <>
                <UserX size={16} style={{ marginRight: 8 }} />
                Askıya Al
              </>
            ) : (
              <>
                <UserCheck size={16} style={{ marginRight: 8 }} />
                Aktif Et
              </>
            )}
          </MenuItem>
          {!(menuUser?.tenantId || menuUser?.tenant?.id) && (
            <MenuItem 
              onClick={() => {
                handleMenuClose();
                setSelectedUser(menuUser);
                setApproveDialogOpen(true);
              }}
              sx={{ color: 'primary.main' }}
            >
              <UserCheck size={16} style={{ marginRight: 8 }} />
              Aboneliği Onayla (Tenant ID Ata)
            </MenuItem>
          )}
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <Trash2 size={16} style={{ marginRight: 8 }} />
            Sil
          </MenuItem>
        </Menu>

        {/* Onay Dialog'ları */}
        <ConfirmDialog
          open={deleteDialogOpen}
          title="Kullanıcı Silme"
          description={`${(menuUser || selectedUser)?.fullName || (menuUser || selectedUser)?.email || 'Bu'} kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          confirmText="Sil"
          cancelText="Vazgeç"
          severity="error"
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setMenuUser(null);
          }}
        />

        <ConfirmDialog
          open={suspendDialogOpen}
          title={(menuUser || selectedUser)?.isActive ? 'Kullanıcı Askıya Alma' : 'Kullanıcı Aktif Etme'}
          description={`${(menuUser || selectedUser)?.fullName || (menuUser || selectedUser)?.email || 'Bu'} kullanıcısını ${
            (menuUser || selectedUser)?.isActive ? 'askıya almak' : 'aktif hale getirmek'
          } istediğinize emin misiniz?`}
          confirmText={(menuUser || selectedUser)?.isActive ? 'Askıya Al' : 'Aktif Et'}
          cancelText="Vazgeç"
          severity="warning"
          onConfirm={handleSuspend}
          onCancel={() => {
            setSuspendDialogOpen(false);
            setMenuUser(null);
          }}
        />

        <ConfirmDialog
          open={approveDialogOpen}
          title="Abonelik Onaylama"
          description={`${(menuUser || selectedUser)?.fullName || (menuUser || selectedUser)?.email || 'Bu'} kullanıcısının aboneliğini onaylamak ve Tenant ID atamak istediğinize emin misiniz? Bu işlemden sonra kullanıcı panel'e giriş yapabilecektir.`}
          confirmText="Onayla"
          cancelText="Vazgeç"
          severity="info"
          onConfirm={handleApproveSubscription}
          onCancel={() => {
            setApproveDialogOpen(false);
            setMenuUser(null);
            setSelectedUser(null);
          }}
        />
      </Box>
    </MainLayout>
  );
}

