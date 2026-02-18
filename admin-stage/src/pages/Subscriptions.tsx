import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Download,
  MoreVertical,
  Eye,
  X,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useSubscriptions,
  useSubscription,
  useCancelSubscription,
  useApproveTrial,
  Subscription,
} from '@/hooks/useSubscriptions';
import { formatDateOnly, formatDateTime } from '@/lib/dateUtils';
import { toast } from 'sonner';

export default function Subscriptions() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSubscription, setMenuSubscription] = useState<Subscription | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [detailTab, setDetailTab] = useState(0);

  const { data: subscriptionsData, isLoading } = useSubscriptions({
    search,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    plan: planFilter !== 'ALL' ? planFilter : undefined,
  });

  const { data: subscriptionDetail } = useSubscription(
    selectedSubscription?.id || ''
  );

  const cancelSubscription = useCancelSubscription();
  const approveTrial = useApproveTrial();

  // Güvenli array kontrolü
  const subscriptions = Array.isArray(subscriptionsData) ? subscriptionsData : [];
  let filteredSubscriptions = subscriptions;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, subscription: Subscription) => {
    setAnchorEl(event.currentTarget);
    setMenuSubscription(subscription);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuSubscription(null);
  };

  const handleViewDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDetailModalOpen(true);
    setDetailTab(0);
    handleMenuClose();
  };

  const handleCancelClick = () => {
    // Dialog içinden çağrıldıysa selectedSubscription'ı menuSubscription olarak set et
    if (selectedSubscription && !menuSubscription) {
      setMenuSubscription(selectedSubscription);
    }
    setCancelDialogOpen(true);
    handleMenuClose();
  };

  const handleCancel = async () => {
    // Dialog içinden veya menüden çağrılabilir
    const subscriptionToCancel = menuSubscription || selectedSubscription;
    if (!subscriptionToCancel) return;

    try {
      await cancelSubscription.mutateAsync(subscriptionToCancel.id);
      toast.success('Abonelik iptal edildi');
      setCancelDialogOpen(false);
      setMenuSubscription(null);
      // Dialog açıksa kapat ve veriyi yenile
      if (selectedSubscription) {
        setDetailModalOpen(false);
        setSelectedSubscription(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Abonelik iptal edilirken hata oluştu');
    }
  };

  const handleApproveClick = () => {
    // Dialog içinden çağrıldıysa selectedSubscription'ı menuSubscription olarak set et
    if (selectedSubscription && !menuSubscription) {
      setMenuSubscription(selectedSubscription);
    }
    setApproveDialogOpen(true);
    handleMenuClose();
  };

  const handleApprove = async () => {
    // Dialog içinden veya menüden çağrılabilir
    const subscriptionToApprove = menuSubscription || selectedSubscription;
    if (!subscriptionToApprove?.tenantId) return;

    try {
      await approveTrial.mutateAsync(subscriptionToApprove.tenantId);
      toast.success('Deneme sürümü onaylandı');
      setApproveDialogOpen(false);
      setMenuSubscription(null);
      // Dialog açıksa kapat ve veriyi yenile
      if (selectedSubscription) {
        setDetailModalOpen(false);
        setSelectedSubscription(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Onaylama sırasında hata oluştu');
    }
  };

  // Özet kartları - Güvenli array işlemleri
  const summaryCards = [
    {
      title: 'Aktif Abonelik',
      value: Array.isArray(filteredSubscriptions) ? filteredSubscriptions.filter((s) => s?.status === 'ACTIVE').length : 0,
      color: 'success',
    },
    {
      title: 'Deneme Sürümü',
      value: Array.isArray(filteredSubscriptions) ? filteredSubscriptions.filter((s) => s?.status === 'TRIAL').length : 0,
      color: 'info',
    },
    {
      title: 'İptal Bekleyen',
      value: Array.isArray(filteredSubscriptions) ? filteredSubscriptions.filter((s) => s?.status === 'CANCELED').length : 0,
      color: 'error',
    },
    {
      title: 'Bekleyen Onay',
      value: Array.isArray(filteredSubscriptions) ? filteredSubscriptions.filter((s) => s?.status === 'PENDING').length : 0,
      color: 'warning',
    },
    {
      title: 'Toplam MRR',
      value: `₺${(Array.isArray(filteredSubscriptions) 
        ? filteredSubscriptions
            .filter((s) => s?.status === 'ACTIVE' && s?.plan?.price)
            .reduce((sum: number, s: Subscription) => sum + (s?.plan?.price || 0), 0)
        : 0
      ).toLocaleString('tr-TR')}`,
      color: 'primary',
    },
  ];

  const columns: ColumnDef<Subscription>[] = [
    {
      accessorKey: 'tenant',
      header: 'Kullanıcı',
      cell: ({ row }) => {
        const tenant = row.original.tenant;
        const user = tenant?.users?.[0];
        return (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {user?.fullName || user?.email || tenant?.name || 'N/A'}
            </Typography>
            {user?.email && (
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      accessorKey: 'plan',
      header: 'Plan',
      cell: ({ row }) => {
        const plan = row.original.plan;
        return (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {plan?.name || 'N/A'}
            </Typography>
            {plan?.price !== undefined && (
              <Typography variant="caption" color="text.secondary">
                ₺{plan.price.toLocaleString('tr-TR')}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => <StatusChip status={row.original.status} />,
    },
    {
      accessorKey: 'startDate',
      header: 'Başlangıç',
      cell: ({ row }) => formatDateOnly(row.original.startDate),
    },
    {
      accessorKey: 'endDate',
      header: 'Bitiş / Sonraki Ödeme',
      cell: ({ row }) => {
        const sub = row.original;
        if (sub.nextBillingDate) {
          return formatDateOnly(sub.nextBillingDate);
        }
        return formatDateOnly(sub.endDate);
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
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Abonelikler
          </Typography>
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 3, mb: 3 }}>
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
                      : 'rgba(102, 126, 234, 0.2)'
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
                          ? '#00C853'
                          : card.color === 'error'
                          ? '#F44336'
                          : card.color === 'warning'
                          ? '#FF9800'
                          : card.color === 'info'
                          ? '#2196F3'
                          : '#667eea',
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
              placeholder="Kullanıcı adı, email veya plan ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{
                flex: 1,
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
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
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                }}
              >
                <MenuItem value="ALL">Tümü</MenuItem>
                <MenuItem value="ACTIVE">Aktif</MenuItem>
                <MenuItem value="TRIAL">Deneme</MenuItem>
                <MenuItem value="PENDING">Beklemede</MenuItem>
                <MenuItem value="CANCELED">İptal</MenuItem>
                <MenuItem value="EXPIRED">Süresi Dolmuş</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Plan</InputLabel>
              <Select
                value={planFilter}
                label="Plan"
                onChange={(e) => setPlanFilter(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                }}
              >
                <MenuItem value="ALL">Tümü</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Tablo */}
        <DataTable
          data={filteredSubscriptions}
          columns={columns}
          isLoading={isLoading}
          onRowClick={handleViewDetails}
        />

        {/* Detay Modal */}
        <Dialog
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedSubscription && subscriptionDetail && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Abonelik Detayları
                </Typography>
                <IconButton onClick={() => setDetailModalOpen(false)} size="small">
                  <X size={20} />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mb: 3 }}>
                  <Tab label="Genel" />
                  <Tab label="Ödeme Planı" />
                  <Tab label="İşlem Geçmişi" />
                </Tabs>

                {detailTab === 0 && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Kullanıcı
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {subscriptionDetail.tenant?.users?.[0]?.fullName ||
                            subscriptionDetail.tenant?.users?.[0]?.email ||
                            subscriptionDetail.tenant?.name ||
                            'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {subscriptionDetail.tenant?.users?.[0]?.email || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Plan
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {subscriptionDetail.plan?.name || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Durum
                        </Typography>
                        <StatusChip status={subscriptionDetail.status} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Başlangıç Tarihi
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDateOnly(subscriptionDetail.startDate)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Bitiş Tarihi
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDateOnly(subscriptionDetail.endDate)}
                        </Typography>
                      </Box>
                      {subscriptionDetail.nextBillingDate && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Sonraki Ödeme
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatDateOnly(subscriptionDetail.nextBillingDate)}
                          </Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Otomatik Yenileme
                        </Typography>
                        <Chip
                          label={subscriptionDetail.autoRenew ? 'Aktif' : 'Pasif'}
                          color={subscriptionDetail.autoRenew ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Oluşturulma Tarihi
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDateTime(subscriptionDetail.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                )}

                {detailTab === 1 && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Plan Fiyatı
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          ₺{subscriptionDetail.plan?.price?.toLocaleString('tr-TR') || '0'}
                        </Typography>
                      </Box>
                      {subscriptionDetail.lastBillingDate && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Son Ödeme Tarihi
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatDateOnly(subscriptionDetail.lastBillingDate)}
                          </Typography>
                        </Box>
                      )}
                      {subscriptionDetail.trialEndsAt && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Deneme Bitiş Tarihi
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatDateOnly(subscriptionDetail.trialEndsAt)}
                          </Typography>
                        </Box>
                      )}
                      {subscriptionDetail.iyzicoSubscriptionRef && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            iyzico Abonelik Referansı
                          </Typography>
                          <Typography variant="body2" fontFamily="monospace">
                            {subscriptionDetail.iyzicoSubscriptionRef}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                )}

                {detailTab === 2 && (
                  <Box>
                    {subscriptionDetail.payments && subscriptionDetail.payments.length > 0 ? (
                      <Box>
                        {subscriptionDetail.payments.map((payment: any, index: number) => (
                          <Box key={payment.id} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body1" fontWeight="medium">
                                ₺{payment.amount.toLocaleString('tr-TR')}
                              </Typography>
                              <StatusChip status={payment.status} />
                            </Box>
                            {payment.paidAt && (
                              <Typography variant="caption" color="text.secondary">
                                {formatDateTime(payment.paidAt)}
                              </Typography>
                            )}
                            {index < subscriptionDetail.payments!.length - 1 && <Divider sx={{ mt: 2 }} />}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        İşlem geçmişi bulunmuyor
                      </Typography>
                    )}
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={() => setDetailModalOpen(false)}>Kapat</Button>
                {subscriptionDetail.status === 'PENDING' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle2 size={18} />}
                    onClick={handleApproveClick}
                  >
                    Deneme Onayla
                  </Button>
                )}
                {subscriptionDetail.status !== 'CANCELED' && subscriptionDetail.status !== 'EXPIRED' && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<X size={18} />}
                    onClick={handleCancelClick}
                  >
                    İptal Et
                  </Button>
                )}
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
          <MenuItem onClick={() => menuSubscription && handleViewDetails(menuSubscription)}>
            <Eye size={16} style={{ marginRight: 8 }} />
            Detayları Gör
          </MenuItem>
          {menuSubscription?.status === 'PENDING' && (
            <MenuItem onClick={handleApproveClick}>
              <CheckCircle2 size={16} style={{ marginRight: 8 }} />
              Deneme Onayla
            </MenuItem>
          )}
          {menuSubscription?.status !== 'CANCELED' && menuSubscription?.status !== 'EXPIRED' && (
            <MenuItem onClick={handleCancelClick} sx={{ color: 'error.main' }}>
              <X size={16} style={{ marginRight: 8 }} />
              İptal Et
            </MenuItem>
          )}
        </Menu>

        {/* Onay Dialog'ları */}
        <ConfirmDialog
          open={cancelDialogOpen}
          title="Abonelik İptali"
          description={`${(menuSubscription || selectedSubscription)?.tenant?.users?.[0]?.fullName || (menuSubscription || selectedSubscription)?.tenant?.name || 'Bu'} aboneliğini iptal etmek istediğinize emin misiniz?`}
          confirmText="İptal Et"
          cancelText="Vazgeç"
          severity="warning"
          onConfirm={handleCancel}
          onCancel={() => {
            setCancelDialogOpen(false);
            setMenuSubscription(null);
          }}
        />

        <ConfirmDialog
          open={approveDialogOpen}
          title="Deneme Onayı"
          description={`${(menuSubscription || selectedSubscription)?.tenant?.users?.[0]?.fullName || (menuSubscription || selectedSubscription)?.tenant?.name || 'Bu'} deneme sürümünü onaylamak istediğinize emin misiniz?`}
          confirmText="Onayla"
          cancelText="Vazgeç"
          severity="info"
          onConfirm={handleApprove}
          onCancel={() => {
            setApproveDialogOpen(false);
            setMenuSubscription(null);
          }}
        />
      </Box>
    </MainLayout>
  );
}

