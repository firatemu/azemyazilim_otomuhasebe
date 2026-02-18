'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Refresh,
  NotificationsActive,
  CheckCircle,
  Warning,
  Schedule,
  DirectionsCar,
  Person,
  Email,
  Sms,
  MarkEmailRead,
  History,
  Add,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { VehicleMaintenanceReminder } from '@/types/servis';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MaintenanceReminderListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [markSentDialogOpen, setMarkSentDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<VehicleMaintenanceReminder | null>(null);

  // Tab filters
  const tabFilters: Array<'upcoming' | 'overdue' | 'sent' | 'all'> = ['upcoming', 'overdue', 'sent', 'all'];

  // Fetch reminders based on tab
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['maintenance-reminders', tabFilters[tabValue], page],
    queryFn: async () => {
      const filter = tabFilters[tabValue];

      if (filter === 'upcoming') {
        const response = await axios.get('/vehicles/reminders/upcoming', { params: { days: 30 } });
        return { data: response.data, total: response.data.length, totalPages: 1 };
      } else if (filter === 'overdue') {
        const response = await axios.get('/vehicles/reminders/overdue');
        return { data: response.data, total: response.data.length, totalPages: 1 };
      } else {
        const response = await axios.get('/vehicles/reminders/all', {
          params: { page, limit: pageSize, filter },
        });
        return response.data;
      }
    },
  });

  const reminders: VehicleMaintenanceReminder[] = data?.data || [];
  const total = data?.meta?.total || data?.total || 0;
  const totalPages = data?.meta?.totalPages || data?.totalPages || 1;

  // Mark as sent mutation
  const markSentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/vehicles/reminders/${id}/mark-sent`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-reminders'] });
      setMarkSentDialogOpen(false);
      setSelectedReminder(null);
    },
  });

  const handleMarkAsSent = (reminder: VehicleMaintenanceReminder) => {
    setSelectedReminder(reminder);
    setMarkSentDialogOpen(true);
  };

  const handleViewVehicleHistory = (vehicleId: string) => {
    router.push(`/servis/araclar/${vehicleId}`);
  };

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('tr-TR') : '-';

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(dateStr);
    reminderDate.setHours(0, 0, 0, 0);
    const diffTime = reminderDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyChip = (dateStr: string, isSent: boolean) => {
    if (isSent) {
      return <Chip label="Gönderildi" size="small" color="success" icon={<MarkEmailRead />} />;
    }

    const daysUntil = getDaysUntil(dateStr);

    if (daysUntil < 0) {
      return (
        <Chip
          label={`${Math.abs(daysUntil)} gün gecikmiş`}
          size="small"
          color="error"
          icon={<Warning />}
        />
      );
    } else if (daysUntil === 0) {
      return <Chip label="Bugün" size="small" color="warning" icon={<NotificationsActive />} />;
    } else if (daysUntil <= 7) {
      return (
        <Chip
          label={`${daysUntil} gün kaldı`}
          size="small"
          color="warning"
          icon={<Schedule />}
        />
      );
    } else {
      return (
        <Chip
          label={`${daysUntil} gün kaldı`}
          size="small"
          color="info"
          icon={<Schedule />}
        />
      );
    }
  };

  // Statistics
  const stats = {
    upcoming: 0,
    overdue: 0,
    sentThisMonth: 0,
    total: total,
  };

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
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Bakım Hatırlatmaları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Araç bakım hatırlatmalarını yönetin ve takip edin
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
          >
            Yenile
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card
              elevation={2}
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => setTabValue(0)}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Schedule sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {tabValue === 0 ? total : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yaklaşan
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card
              elevation={2}
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => setTabValue(1)}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Warning sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {tabValue === 1 ? total : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gecikmiş
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card
              elevation={2}
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => setTabValue(2)}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <MarkEmailRead sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {tabValue === 2 ? total : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gönderildi
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card
              elevation={2}
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => setTabValue(3)}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <NotificationsActive sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {tabValue === 3 ? total : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => { setTabValue(v); setPage(1); }}
            variant="fullWidth"
          >
            <Tab
              icon={<Schedule />}
              label="Yaklaşan (30 Gün)"
              iconPosition="start"
            />
            <Tab
              icon={<Warning />}
              label="Gecikmiş"
              iconPosition="start"
            />
            <Tab
              icon={<MarkEmailRead />}
              label="Gönderildi"
              iconPosition="start"
            />
            <Tab
              icon={<NotificationsActive />}
              label="Tümü"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Veriler yüklenirken bir hata oluştu.
          </Alert>
        )}

        {/* Loading */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Araç</strong></TableCell>
                    <TableCell><strong>Müşteri</strong></TableCell>
                    <TableCell><strong>Son Servis</strong></TableCell>
                    <TableCell><strong>Hatırlatma Tarihi</strong></TableCell>
                    <TableCell><strong>Durum</strong></TableCell>
                    <TableCell align="center"><strong>İşlemler</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reminders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" sx={{ py: 3 }}>
                          Kayıt bulunamadı
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reminders.map((reminder) => (
                      <TableRow key={reminder.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DirectionsCar sx={{ color: '#666' }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {reminder.vehicle?.plateNumber || '-'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {reminder.vehicle?.brand} {reminder.vehicle?.model}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person sx={{ fontSize: 18, color: '#666' }} />
                            <Typography variant="body2">
                              {reminder.vehicle?.customer?.unvan ||
                                `${reminder.vehicle?.customer?.ad || ''} ${reminder.vehicle?.customer?.soyad || ''}`.trim() ||
                                '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(reminder.lastServiceDate)}</Typography>
                          {reminder.lastMileage && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {reminder.lastMileage.toLocaleString('tr-TR')} km
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(reminder.nextReminderDate)}</Typography>
                        </TableCell>
                        <TableCell>
                          {getUrgencyChip(reminder.nextReminderDate, reminder.reminderSent)}
                          {reminder.reminderSentAt && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatDate(reminder.reminderSentAt)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Araç Geçmişi">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewVehicleHistory(reminder.vehicleId)}
                              >
                                <History fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {!reminder.reminderSent && (
                              <Tooltip title="Gönderildi Olarak İşaretle">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleMarkAsSent(reminder)}
                                >
                                  <MarkEmailRead fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Mark as Sent Dialog */}
        <Dialog
          open={markSentDialogOpen}
          onClose={() => setMarkSentDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Hatırlatma Gönderildi Olarak İşaretle</DialogTitle>
          <DialogContent>
            {selectedReminder && (
              <Box sx={{ py: 2 }}>
                <Typography gutterBottom>
                  <strong>Araç:</strong> {selectedReminder.vehicle?.plateNumber} -{' '}
                  {selectedReminder.vehicle?.brand} {selectedReminder.vehicle?.model}
                </Typography>
                <Typography gutterBottom>
                  <strong>Hatırlatma Tarihi:</strong> {formatDate(selectedReminder.nextReminderDate)}
                </Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Bu hatırlatmayı gönderildi olarak işaretlemek istediğinizden emin misiniz?
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMarkSentDialogOpen(false)}>İptal</Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => selectedReminder && markSentMutation.mutate(selectedReminder.id)}
              disabled={markSentMutation.isPending}
              startIcon={<MarkEmailRead />}
            >
              Gönderildi Olarak İşaretle
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}

