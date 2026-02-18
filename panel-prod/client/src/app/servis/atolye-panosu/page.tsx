'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  Refresh,
  Visibility,
  DirectionsCar,
  Person,
  Build,
  MoreVert,
  AccessTime,
  ArrowForward,
  PlayArrow,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import {
  WorkOrder,
  WorkOrderStatus,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  kanbanStatuses,
} from '@/types/servis';

// Kanban column component
interface KanbanColumnProps {
  status: WorkOrderStatus;
  workOrders: WorkOrder[];
  onViewWorkOrder: (id: string) => void;
  onMoveToNext: (workOrder: WorkOrder) => void;
  isMoving: boolean;
}

function KanbanColumn({ status, workOrders, onViewWorkOrder, onMoveToNext, isMoving }: KanbanColumnProps) {
  const [menuAnchor, setMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchor({ ...menuAnchor, [id]: event.currentTarget });
  };

  const handleMenuClose = (id: string) => {
    setMenuAnchor({ ...menuAnchor, [id]: null });
  };

  // Get next status for workflow
  const getNextStatus = (currentStatus: WorkOrderStatus): WorkOrderStatus | null => {
    const statusFlow: Partial<Record<WorkOrderStatus, WorkOrderStatus>> = {
      ACCEPTED: 'DIAGNOSIS',
      DIAGNOSIS: 'WAITING_FOR_APPROVAL',
      WAITING_FOR_APPROVAL: 'APPROVED',
      APPROVED: 'IN_PROGRESS',
      PART_WAITING: 'IN_PROGRESS',
      IN_PROGRESS: 'QUALITY_CONTROL',
      QUALITY_CONTROL: 'READY_FOR_DELIVERY',
    };
    return statusFlow[currentStatus] || null;
  };

  const nextStatus = getNextStatus(status);

  return (
    <Paper
      sx={{
        minWidth: 300,
        maxWidth: 320,
        flex: '0 0 300px',
        bgcolor: '#fafafa',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 280px)',
        minHeight: 500,
      }}
      elevation={0}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: getStatusBgColor(status),
          borderRadius: '8px 8px 0 0',
          borderBottom: `3px solid`,
          borderColor: getStatusColor(status) === 'default' ? '#9e9e9e' : `${getStatusColor(status)}.main`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {getStatusLabel(status)}
          </Typography>
          <Badge badgeContent={workOrders.length} color={getStatusColor(status)} max={99}>
            <Box sx={{ width: 8 }} />
          </Badge>
        </Box>
      </Box>

      {/* Column Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#c0c0c0',
            borderRadius: 3,
          },
        }}
      >
        {workOrders.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 100,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">Kayıt yok</Typography>
          </Box>
        ) : (
          workOrders.map((wo) => (
            <Card
              key={wo.id}
              sx={{
                mb: 1,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
              elevation={1}
            >
              <CardContent sx={{ pb: 1 }}>
                {/* Work Order Number */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="primary"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => onViewWorkOrder(wo.id)}
                  >
                    #{wo.workOrderNo}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, wo.id)}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor[wo.id]}
                    open={Boolean(menuAnchor[wo.id])}
                    onClose={() => handleMenuClose(wo.id)}
                  >
                    <MenuItem onClick={() => { handleMenuClose(wo.id); onViewWorkOrder(wo.id); }}>
                      <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
                      <ListItemText>Görüntüle</ListItemText>
                    </MenuItem>
                    {nextStatus && (
                      <MenuItem
                        onClick={() => { handleMenuClose(wo.id); onMoveToNext(wo); }}
                        disabled={isMoving}
                      >
                        <ListItemIcon><ArrowForward fontSize="small" /></ListItemIcon>
                        <ListItemText>
                          {getStatusLabel(nextStatus)} &apos;a Taşı
                        </ListItemText>
                      </MenuItem>
                    )}
                  </Menu>
                </Box>

                {/* Vehicle Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DirectionsCar sx={{ fontSize: 16, color: '#666' }} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {wo.vehicle?.plateNumber || '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {wo.vehicle?.brand} {wo.vehicle?.model}
                    </Typography>
                  </Box>
                </Box>

                {/* Customer */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Person sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="caption" noWrap>
                    {wo.customer?.unvan ||
                      `${wo.customer?.ad || ''} ${wo.customer?.soyad || ''}`.trim() ||
                      '-'}
                  </Typography>
                </Box>

                {/* Technician */}
                {wo.technician && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Build sx={{ fontSize: 14, color: '#666' }} />
                    <Typography variant="caption">
                      {wo.technician.firstName} {wo.technician.lastName}
                    </Typography>
                  </Box>
                )}

                {/* Time Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Schedule sx={{ fontSize: 14, color: '#999' }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(wo.acceptedAt).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
              </CardContent>

              {/* Quick Actions */}
              <CardActions sx={{ pt: 0, px: 2, pb: 1, justifyContent: 'space-between' }}>
                <Typography variant="caption" fontWeight={500} color="primary">
                  {wo.grandTotal
                    ? new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      }).format(wo.grandTotal)
                    : '-'}
                </Typography>
                {nextStatus && (
                  <Tooltip title={`${getStatusLabel(nextStatus)}'a Taşı`}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onMoveToNext(wo)}
                      disabled={isMoving}
                    >
                      <ArrowForward fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </CardActions>
            </Card>
          ))
        )}
      </Box>
    </Paper>
  );
}

export default function WorkshopBoardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch all active work orders
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['work-orders-kanban'],
    queryFn: async () => {
      // Fetch work orders that are not CLOSED or CANCELLED
      const response = await axios.get('/work-orders', {
        params: {
          limit: 200, // Get more for kanban view
        },
      });
      return response.data;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const workOrders: WorkOrder[] = (data?.data || []).filter(
    (wo: WorkOrder) => wo.status !== 'CLOSED' && wo.status !== 'CANCELLED' && wo.status !== 'INVOICED'
  );

  // Mutation for moving work orders
  const moveWorkOrderMutation = useMutation({
    mutationFn: async ({ workOrderId, newStatus }: { workOrderId: string; newStatus: WorkOrderStatus }) => {
      const response = await axios.put(`/work-orders/${workOrderId}/status`, { status: newStatus });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders-kanban'] });
    },
  });

  const handleViewWorkOrder = (id: string) => {
    router.push(`/servis/is-emirleri/${id}`);
  };

  const handleMoveToNext = useCallback((workOrder: WorkOrder) => {
    const statusFlow: Partial<Record<WorkOrderStatus, WorkOrderStatus>> = {
      ACCEPTED: 'DIAGNOSIS',
      DIAGNOSIS: 'WAITING_FOR_APPROVAL',
      WAITING_FOR_APPROVAL: 'APPROVED',
      APPROVED: 'IN_PROGRESS',
      PART_WAITING: 'IN_PROGRESS',
      IN_PROGRESS: 'QUALITY_CONTROL',
      QUALITY_CONTROL: 'READY_FOR_DELIVERY',
    };
    const nextStatus = statusFlow[workOrder.status];
    if (nextStatus) {
      moveWorkOrderMutation.mutate({ workOrderId: workOrder.id, newStatus: nextStatus });
    }
  }, [moveWorkOrderMutation]);

  // Group work orders by status
  const groupedWorkOrders: Record<WorkOrderStatus, WorkOrder[]> = {} as any;
  kanbanStatuses.forEach((status) => {
    groupedWorkOrders[status] = workOrders.filter((wo) => wo.status === status);
  });

  // Count stats
  const totalActive = workOrders.length;
  const urgentCount = workOrders.filter(
    (wo) => wo.status === 'WAITING_FOR_APPROVAL' || wo.status === 'PART_WAITING'
  ).length;

  if (isLoading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Atölye Panosu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              İş emirlerini sürükle-bırak ile yönetin
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<Build />}
                label={`${totalActive} Aktif İş`}
                color="primary"
                variant="outlined"
              />
              {urgentCount > 0 && (
                <Chip
                  icon={<Warning />}
                  label={`${urgentCount} Dikkat Gerekiyor`}
                  color="warning"
                />
              )}
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
            >
              Yenile
            </Button>
          </Box>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Veriler yüklenirken bir hata oluştu.
          </Alert>
        )}

        {/* Kanban Board */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: '#c0c0c0',
              borderRadius: 4,
            },
          }}
        >
          {kanbanStatuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              workOrders={groupedWorkOrders[status] || []}
              onViewWorkOrder={handleViewWorkOrder}
              onMoveToNext={handleMoveToNext}
              isMoving={moveWorkOrderMutation.isPending}
            />
          ))}
        </Box>

        {/* Legend */}
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Durum Akışı
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {kanbanStatuses.map((status, index) => (
              <React.Fragment key={status}>
                <Chip
                  label={getStatusLabel(status)}
                  size="small"
                  color={getStatusColor(status)}
                  variant="outlined"
                />
                {index < kanbanStatuses.length - 1 && (
                  <ArrowForward sx={{ fontSize: 16, color: '#999' }} />
                )}
              </React.Fragment>
            ))}
            <ArrowForward sx={{ fontSize: 16, color: '#999' }} />
            <Chip label="Faturalandı" size="small" color="success" variant="outlined" />
            <ArrowForward sx={{ fontSize: 16, color: '#999' }} />
            <Chip label="Kapatıldı" size="small" variant="outlined" />
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
}

