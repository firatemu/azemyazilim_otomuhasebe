'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
import { ArrowBack, Add, Edit, Delete, Info, Inventory2, History, Print, Assessment, Payments, QrCodeScanner, PhotoCamera } from '@mui/icons-material';
import { BarcodeScanner } from '@/components/atolye/BarcodeScanner';
import { DamagePhotoCapture } from '@/components/atolye/DamagePhotoCapture';

import { OnlineStatusBanner } from '@/components/atolye/OnlineStatusBanner';

import { useReactToPrint } from 'react-to-print';
import { useRouter, useParams } from 'next/navigation';
import axios from '@/lib/axios';
import WorkOrderStatusChip from '@/components/servis/WorkOrderStatusChip';
import PartRequestStatusChip from '@/components/servis/PartRequestStatusChip';
import WorkOrderStatusActions from '@/components/servis/WorkOrderStatusActions';
import WorkOrderAssignmentForm from '@/components/servis/WorkOrderAssignmentForm';
import WorkOrderItemDialog from '@/components/servis/WorkOrderItemDialog';
import PartRequestDialog from '@/components/servis/PartRequestDialog';
import SupplyPartRequestDialog from '@/components/servis/SupplyPartRequestDialog';
import WorkOrderPrintView from '@/components/servis/WorkOrderPrintView';
import WorkOrderTahsilatDialog from '@/components/servis/WorkOrderTahsilatDialog';
import { useAuthStore } from '@/stores/authStore';
import type { WorkOrder, WorkOrderItem, PartRequest, WorkOrderStatus, VehicleWorkflowStatus } from '@/types/servis';

export default function IsEmriDetayPage() {
  const { user } = useAuthStore();
  const isTechnician = user?.role === 'TECHNICIAN';
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [stoklar, setStoklar] = useState<{ id: string; stokKodu?: string; stokAdi?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openPartDialog, setOpenPartDialog] = useState(false);
  const [openSupplyDialog, setOpenSupplyDialog] = useState(false);
  const [openDeleteItem, setOpenDeleteItem] = useState(false);
  const [openCancelPart, setOpenCancelPart] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkOrderItem | null>(null);
  const [supplyPartRequest, setSupplyPartRequest] = useState<PartRequest | null>(null);
  const [deletingItem, setDeletingItem] = useState<WorkOrderItem | null>(null);
  const [cancellingPart, setCancellingPart] = useState<PartRequest | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [sendApprovalLoading, setSendApprovalLoading] = useState(false);
  const [activities, setActivities] = useState<Array<{ id: string; action: string; label: string; createdAt: string; user?: string }>>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [openTahsilatDialog, setOpenTahsilatDialog] = useState(false);
  const [ruhsatImgError, setRuhsatImgError] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [openScanner, setOpenScanner] = useState(false);
  const [openPhoto, setOpenPhoto] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const printRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `IsEmri_${workOrder?.workOrderNo ?? 'detay'}`,
  });

  const fetchWorkOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/work-order/${id}`);
      setWorkOrder(res.data);
    } catch {
      setSnackbar({ open: true, message: 'İş emri yüklenemedi', severity: 'error' });
      router.push('/servis/is-emirleri');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchWorkOrder();
  }, [id]);

  useEffect(() => {
    if (workOrder?.diagnosisNotes) setDiagnosisNotes(workOrder.diagnosisNotes);
  }, [workOrder?.diagnosisNotes]);

  useEffect(() => {
    setRuhsatImgError(false);
  }, [workOrder?.customerVehicle?.ruhsatPhotoUrl]);

  const hasTahsilatTab = !!workOrder?.serviceInvoice;
  const gecmisTabIndex = hasTahsilatTab ? 4 : 3;

  useEffect(() => {
    if (id && activeTab === gecmisTabIndex) {
      setActivitiesLoading(true);
      axios
        .get(`/work-order/${id}/activities`)
        .then((res) => {
          const data = res.data?.data ?? res.data;
          setActivities(Array.isArray(data) ? data : []);
        })
        .catch(() => setActivities([]))
        .finally(() => setActivitiesLoading(false));
    }
  }, [id, activeTab, gecmisTabIndex]);

  useEffect(() => {
    const fetchStok = async () => {
      try {
        const res = await axios.get('/product', { params: { limit: 1000 } });
        const data = res.data?.data ?? res.data;
        setStoklar(Array.isArray(data) ? data : []);
      } catch {
        setStoklar([]);
      }
    };
    fetchStok();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

  const getErrorMessage = (err: any, defaultMsg = 'Güncellenemedi'): string => {
    const data = err.response?.data;
    if (!data) return defaultMsg;
    if (typeof data.message === 'string') return data.message;
    if (Array.isArray(data.message)) return data.message[0] ?? defaultMsg;
    return (data as { message?: string }).message ?? defaultMsg;
  };

  const handleStatusChange = async (status: WorkOrderStatus) => {
    setStatusLoading(true);
    try {
      await axios.patch(`/work-order/${id}/status`, { status });
      showSnackbar('Durum güncellendi', 'success');
      fetchWorkOrder();
    } catch (err: any) {
      showSnackbar(getErrorMessage(err, 'Durum güncellenemedi'), 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleVehicleWorkflowChange = async (vehicleWorkflowStatus: VehicleWorkflowStatus) => {
    setStatusLoading(true);
    try {
      try {
        await axios.patch(`/work-order/${id}/vehicle-workflow`, { vehicleWorkflowStatus });
      } catch (err: any) {
        if (err.response?.status === 404) {
          const statusMap: Record<VehicleWorkflowStatus, WorkOrderStatus | null> = {
            WAITING: 'WAITING_DIAGNOSIS',
            IN_PROGRESS: 'APPROVED_IN_PROGRESS',
            READY: 'VEHICLE_READY',
            DELIVERED: null,
          };
          const targetStatus = statusMap[vehicleWorkflowStatus];
          if (targetStatus) {
            try {
              await axios.patch(`/work-order/${id}/status`, { status: targetStatus });
            } catch (statusErr: any) {
              // If WAITING_DIAGNOSIS -> APPROVED_IN_PROGRESS fails, try via PENDING_APPROVAL
              if (
                statusErr.response?.status === 400 &&
                workOrder?.status === 'WAITING_DIAGNOSIS' &&
                targetStatus === 'APPROVED_IN_PROGRESS'
              ) {
                try {
                  // First transition to PENDING_APPROVAL
                  await axios.patch(`/work-order/${id}/status`, { status: 'PENDING_APPROVAL' });
                  // Then transition to APPROVED_IN_PROGRESS
                  await axios.patch(`/work-order/${id}/status`, { status: 'APPROVED_IN_PROGRESS' });
                } catch (twoStepErr: any) {
                  throw statusErr; // Throw original error if two-step also fails
                }
              } else {
                throw statusErr;
              }
            }
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
      showSnackbar('Araç iş akışı güncellendi', 'success');
      fetchWorkOrder();
    } catch (err: any) {
      showSnackbar(getErrorMessage(err, 'Araç iş akışı güncellenemedi'), 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleItemSubmit = async (data: any) => {
    if (editingItem) {
      await axios.patch(`/work-order-item/${editingItem.id}`, data);
      showSnackbar('Kalem güncellendi', 'success');
    } else {
      await axios.post('/work-order-item', data);
      showSnackbar('Kalem eklendi', 'success');
    }
    setOpenItemDialog(false);
    setEditingItem(null);
    fetchWorkOrder();
  };

  const handlePartSubmit = async (data: any) => {
    await axios.post('/part-request', data);
    showSnackbar('Parça talebi eklendi', 'success');
    setOpenPartDialog(false);
    fetchWorkOrder();
  };

  const handleSupplySubmit = async (suppliedQty: number, stokId: string) => {
    if (!supplyPartRequest) return;
    await axios.post(`/part-request/${supplyPartRequest.id}/supply`, { suppliedQty, stokId });
    showSnackbar('Parça tedarik edildi', 'success');
    setOpenSupplyDialog(false);
    setSupplyPartRequest(null);
    fetchWorkOrder();
  };

  const handleSendForApproval = async () => {
    const notes = diagnosisNotes.trim();
    if (!notes) {
      showSnackbar('Teşhis ve ek işlem açıklaması zorunludur', 'error');
      return;
    }
    setSendApprovalLoading(true);
    try {
      await axios.post(`/work-order/${id}/send-for-approval`, { diagnosisNotes: notes });
      showSnackbar('Müşteri onayına gönderildi', 'success');
      fetchWorkOrder();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Onaya gönderilemedi', 'error');
    } finally {
      setSendApprovalLoading(false);
    }
  };

  const handleSaveDiagnosisNotes = async () => {
    setSendApprovalLoading(true);
    try {
      await axios.patch(`/work-order/${id}`, { diagnosisNotes: diagnosisNotes.trim() || undefined });
      showSnackbar('Notlar kaydedildi', 'success');
      fetchWorkOrder();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Kaydedilemedi', 'error');
    } finally {
      setSendApprovalLoading(false);
    }
  };

  const handleMarkAsUsed = async (pr: PartRequest) => {
    try {
      await axios.post(`/part-request/${pr.id}/mark-as-used`);
      showSnackbar('Parça kullanıldı olarak işaretlendi', 'success');
      fetchWorkOrder();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'İşlem başarısız', 'error');
    }
  };

  const handleCancelPart = async () => {
    if (!cancellingPart) return;
    try {
      await axios.post(`/part-request/${cancellingPart.id}/cancel`);
      showSnackbar('Parça talebi iptal edildi', 'success');
      setOpenCancelPart(false);
      setCancellingPart(null);
      fetchWorkOrder();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'İptal başarısız', 'error');
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      await axios.delete(`/work-order-item/${deletingItem.id}`);
      showSnackbar('Kalem silindi', 'success');
      setOpenDeleteItem(false);
      setDeletingItem(null);
      fetchWorkOrder();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Silme başarısız', 'error');
    }
  };

  const canEditItems = workOrder && !['INVOICED_CLOSED', 'CLOSED_WITHOUT_INVOICE', 'VEHICLE_READY', 'CANCELLED'].includes(workOrder.status);
  const canEditPartRequests = workOrder && !['INVOICED_CLOSED', 'CLOSED_WITHOUT_INVOICE', 'VEHICLE_READY', 'CANCELLED'].includes(workOrder.status);
  const canEditAssignment = workOrder && !isTechnician;

  if (loading || !workOrder) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  const items = workOrder.items ?? [];
  const partRequests = workOrder.partRequests ?? [];

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/servis/is-emirleri')}
          sx={{ textTransform: 'none' }}
        >
          Geri
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          İş Emri: {workOrder.workOrderNo}
        </Typography>
        <WorkOrderStatusChip status={workOrder.status} size="medium" />
        <Box sx={{ flex: 1 }} />
        {!isTechnician && (
          <Button startIcon={<Print />} onClick={() => handlePrint()} variant="outlined" size="small" sx={{ textTransform: 'none' }}>
            Yazdır
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<QrCodeScanner />}
          color="secondary"
          size="small"
          onClick={() => setOpenScanner(true)}
          sx={{ textTransform: 'none' }}
        >
          Barkod
        </Button>
        <Button
          variant="contained"
          startIcon={<PhotoCamera />}
          color="info"
          size="small"
          onClick={() => setOpenPhoto(true)}
          sx={{ textTransform: 'none' }}
        >
          Fotoğraf
        </Button>
      </Box>

      <OnlineStatusBanner isOnline={isOnline} />


      <Box sx={{ display: 'none' }}>
        <WorkOrderPrintView ref={printRef} workOrder={workOrder} />
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Araç
            </Typography>
            {workOrder.customerVehicle ? (
              (() => {
                const v = workOrder.customerVehicle;
                const rows: { label: string; value: string | number }[] = [
                  { label: 'Plaka', value: v.plaka },
                  { label: 'Marka / Model', value: `${v.aracMarka} ${v.aracModel}`.trim() },
                ];
                if (v.saseno) rows.push({ label: 'Şase no', value: v.saseno });
                if (v.yil != null) rows.push({ label: 'Yıl', value: v.yil });
                if (v.km != null) rows.push({ label: 'Km', value: v.km.toLocaleString('tr-TR') });
                if (v.aracMotorHacmi) rows.push({ label: 'Motor hacmi', value: v.aracMotorHacmi });
                if (v.aracYakitTipi) rows.push({ label: 'Yakıt', value: v.aracYakitTipi });
                if (v.renk) rows.push({ label: 'Renk', value: v.renk });
                if (v.motorGucu != null) rows.push({ label: 'Motor gücü', value: `${v.motorGucu} hp` });
                if (v.sanziman) rows.push({ label: 'Şanzıman', value: v.sanziman });
                if (v.ruhsatNo) rows.push({ label: 'Ruhsat no', value: v.ruhsatNo });
                if (v.tescilTarihi) rows.push({ label: 'Tescil tarihi', value: typeof v.tescilTarihi === 'string' ? formatDate(v.tescilTarihi) : String(v.tescilTarihi) });
                if (v.ruhsatSahibi) rows.push({ label: 'Ruhsat sahibi', value: v.ruhsatSahibi });
                if (v.aciklama) rows.push({ label: 'Açıklama', value: v.aciklama });
                return (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 12px', alignItems: 'baseline', fontSize: '0.875rem' }}>
                    {rows.map((r) => (
                      <React.Fragment key={r.label}>
                        <Typography component="span" variant="body2" color="text.secondary">{r.label}</Typography>
                        <Typography component="span" variant="body2" fontWeight={r.label === 'Plaka' ? 600 : 400}>{r.value}</Typography>
                      </React.Fragment>
                    ))}
                  </Box>
                );
              })()
            ) : (
              <Typography variant="body1">-</Typography>
            )}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1.5 }}>
              Müşteri
            </Typography>
            <Typography variant="body1">
              {workOrder.cari?.unvan ?? workOrder.cari?.cariKodu ?? '-'}
            </Typography>
          </Box>
          {workOrder.customerVehicle?.ruhsatPhotoUrl && !ruhsatImgError && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Ruhsat
              </Typography>
              <Box
                component="img"
                src={workOrder.customerVehicle.ruhsatPhotoUrl}
                alt="Ruhsat"
                onError={() => setRuhsatImgError(true)}
                onClick={() => window.open(workOrder.customerVehicle!.ruhsatPhotoUrl!, '_blank')}
                sx={{
                  width: 80,
                  height: 60,
                  borderRadius: 1,
                  border: '1px solid var(--border)',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.9 },
                }}
                title="Ruhsat fotoğrafını büyüt"
              />
            </Box>
          )}
          {workOrder.customerVehicle?.ruhsatPhotoUrl && ruhsatImgError && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Ruhsat
              </Typography>
              <Box
                sx={{
                  width: 80,
                  height: 60,
                  borderRadius: 1,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }}
              >
                Görsel yok
              </Box>
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Tahmini Bitiş
            </Typography>
            <Typography variant="body1">
              {workOrder.estimatedCompletionDate
                ? formatDate(workOrder.estimatedCompletionDate)
                : '-'}
            </Typography>
          </Box>
          <WorkOrderStatusActions
            partWorkflowStatus={workOrder.partWorkflowStatus ?? (workOrder.status === 'PART_WAITING' ? 'PARTS_PENDING' : workOrder.status === 'PARTS_SUPPLIED' ? 'ALL_PARTS_SUPPLIED' : 'NOT_STARTED')}
            vehicleWorkflowStatus={workOrder.vehicleWorkflowStatus ?? (workOrder.status === 'INVOICED_CLOSED' || workOrder.status === 'CLOSED_WITHOUT_INVOICE' ? 'DELIVERED' : workOrder.status === 'VEHICLE_READY' ? 'READY' : workOrder.status === 'APPROVED_IN_PROGRESS' || workOrder.status === 'PART_WAITING' || workOrder.status === 'PARTS_SUPPLIED' ? 'IN_PROGRESS' : 'WAITING')}
            status={workOrder.status}
            onVehicleWorkflowChange={handleVehicleWorkflowChange}
            onCloseWithoutInvoice={() => handleStatusChange('CLOSED_WITHOUT_INVOICE')}
            onCancel={() => handleStatusChange('CANCELLED')}
            loading={statusLoading}
            actualCompletionDate={workOrder.actualCompletionDate}
            isTechnician={isTechnician}
          />
        </Box>
        {workOrder.description && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Açıklama
            </Typography>
            <Typography variant="body1">{workOrder.description}</Typography>
          </>
        )}
      </Paper>

      <Paper sx={{ mb: 3, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<Info />} iconPosition="start" label="Genel Bilgiler" />
          <Tab icon={<Assessment />} iconPosition="start" label="Teşhis ve Ek İşlemler" />
          <Tab icon={<Inventory2 />} iconPosition="start" label="Parça Talepleri" />
          {workOrder.serviceInvoice && (
            <Tab icon={<Payments />} iconPosition="start" label="Tahsilat" />
          )}
          <Tab icon={<History />} iconPosition="start" label="Geçmiş / Aktivite" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <WorkOrderAssignmentForm
              technicianId={workOrder.technicianId ?? null}
              onChange={async (technicianId) => {
                try {
                  await axios.patch(`/work-order/${id}`, { technicianId });
                  showSnackbar('Atama güncellendi', 'success');
                  fetchWorkOrder();
                } catch (err: any) {
                  showSnackbar(err.response?.data?.message || 'Güncellenemedi', 'error');
                }
              }}
              disabled={!canEditAssignment}
            />
            {workOrder.actualCompletionDate && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Gerçekleşen Bitiş</Typography>
                <Typography variant="body1">{formatDate(workOrder.actualCompletionDate)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                İş Kalemleri
              </Typography>
              {canEditItems && (
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => {
                    setEditingItem(null);
                    setOpenItemDialog(true);
                  }}
                >
                  Yeni Kalem
                </Button>
              )}
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Stok</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Miktar</TableCell>
                    {canEditItems && <TableCell align="right" sx={{ fontWeight: 600 }}>İşlem</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canEditItems ? 5 : 4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        Kalem bulunamadı
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.type === 'LABOR' ? 'İşçilik' : 'Parça'}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.stok ? `${item.stok.stokKodu} - ${item.stok.stokAdi}` : '-'}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        {canEditItems && (
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => { setEditingItem(item); setOpenItemDialog(true); }}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => { setDeletingItem(item); setOpenDeleteItem(true); }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Teşhis ve Ek İşlemler
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Yapılması gerekenleri yazıp &quot;Onaya Gönder&quot; ile parça/tedarik ekibine iletin. Yanıtları burada görür, notlarınıza göre işleme devam edebilirsiniz.
            </Typography>

            {/* Yazışma özeti (WhatsApp tarzı: teknisyen sağda, parça yanıtı solda) */}
            {(workOrder.diagnosisNotes || workOrder.supplyResponseNotes) && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Yazışma
                </Typography>
                <Stack spacing={1.5} sx={{ alignItems: 'stretch' }}>
                  {workOrder.diagnosisNotes && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: 'var(--muted)',
                        borderRight: '4px solid',
                        borderRightColor: 'primary.main',
                        borderRadius: 2,
                        alignSelf: 'flex-end',
                        maxWidth: '85%',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">Teknisyen – yapılacaklar / onaya gönderilen</Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>{workOrder.diagnosisNotes}</Typography>
                    </Paper>
                  )}
                  {workOrder.supplyResponseNotes && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: 'var(--muted)',
                        borderLeft: '4px solid',
                        borderLeftColor: 'grey.400',
                        borderRadius: 2,
                        alignSelf: 'flex-start',
                        maxWidth: '85%',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">Parça / Tedarik yanıtı</Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>{workOrder.supplyResponseNotes}</Typography>
                    </Paper>
                  )}
                </Stack>
              </Box>
            )}

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {workOrder.status === 'WAITING_DIAGNOSIS' ? 'Teşhis ve yapılacaklar (onaya gönderilecek)' : 'Notları güncelle'}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              placeholder="İşlem sırasında tespit edilen ek işlemleri ve gerekçelerini yazın..."
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              disabled={['INVOICED_CLOSED', 'CLOSED_WITHOUT_INVOICE', 'CANCELLED'].includes(workOrder.status)}
              sx={{ mb: 2 }}
            />

            {workOrder.status === 'WAITING_DIAGNOSIS' ? (
              <Button
                variant="contained"
                onClick={handleSendForApproval}
                disabled={sendApprovalLoading || !diagnosisNotes.trim()}
                startIcon={sendApprovalLoading ? <CircularProgress size={18} /> : null}
              >
                {sendApprovalLoading ? 'Gönderiliyor...' : 'Onaya Gönder'}
              </Button>
            ) : !['INVOICED_CLOSED', 'CLOSED_WITHOUT_INVOICE', 'CANCELLED'].includes(workOrder.status) ? (
              <Box>
                <Button
                  variant="outlined"
                  onClick={handleSaveDiagnosisNotes}
                  disabled={sendApprovalLoading}
                  startIcon={sendApprovalLoading ? <CircularProgress size={18} /> : null}
                >
                  {sendApprovalLoading ? 'Kaydediliyor...' : 'Notları Kaydet'}
                </Button>
                {workOrder.status === 'PENDING_APPROVAL' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Müşteri onayı bekleniyor. Parça/tedarik yanıtı geldiyse notlara göre işleme devam edebilirsiniz.
                  </Alert>
                )}
              </Box>
            ) : (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Bu iş emri kapatıldığı için notlar düzenlenemez.
              </Alert>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Parça Talepleri
              </Typography>
              {canEditPartRequests && (
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setOpenPartDialog(true)}
                >
                  Yeni Parça Talebi
                </Button>
              )}
            </Box>

            {/* Talep Edilen Parçalar */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Talep Edilen Parçalar
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Stok</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Miktar
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                      {canEditPartRequests && (
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          İşlem
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={canEditPartRequests ? 5 : 4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          Parça talebi bulunamadı
                        </TableCell>
                      </TableRow>
                    ) : (
                      partRequests.map((pr) => (
                        <TableRow key={pr.id}>
                          <TableCell>{pr.description}</TableCell>
                          <TableCell>{pr.stok ? `${pr.stok.stokKodu} - ${pr.stok.stokAdi}` : '-'}</TableCell>
                          <TableCell align="right">{pr.requestedQty}</TableCell>
                          <TableCell>
                            <PartRequestStatusChip status={pr.status} />
                          </TableCell>
                          {canEditPartRequests && (
                            <TableCell align="right">
                              {pr.status === 'REQUESTED' && (
                                <>
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      setSupplyPartRequest(pr);
                                      setOpenSupplyDialog(true);
                                    }}
                                  >
                                    Tedarik
                                  </Button>
                                  <Button
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      setCancellingPart(pr);
                                      setOpenCancelPart(true);
                                    }}
                                  >
                                    İptal
                                  </Button>
                                </>
                              )}
                              {pr.status === 'SUPPLIED' && (
                                <Button size="small" variant="contained" onClick={() => handleMarkAsUsed(pr)}>
                                  Kullanıldı İşaretle
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Tedarikten Eklenen Malzemeler */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Tedarikten Eklenen Malzemeler
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Stok</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Miktar
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Birim Fiyat
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Toplam
                      </TableCell>
                      {canEditItems && (
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          İşlem
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.filter((i) => i.type === 'PART').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={canEditItems ? 6 : 5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          Tedarikten eklenen malzeme bulunamadı
                        </TableCell>
                      </TableRow>
                    ) : (
                      items
                        .filter((i) => i.type === 'PART')
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>
                              {item.stok ? `${item.stok.stokKodu} - ${item.stok.stokAdi}` : '-'}
                            </TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              {item.unitPrice ? `${parseFloat(item.unitPrice.toString()).toFixed(2)} ₺` : '-'}
                            </TableCell>
                            <TableCell align="right">
                              {item.lineTotal ? `${parseFloat(item.lineTotal.toString()).toFixed(2)} ₺` : '-'}
                            </TableCell>
                            {canEditItems && (
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setOpenItemDialog(true);
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setDeletingItem(item);
                                    setOpenDeleteItem(true);
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}

        {activeTab === 3 && hasTahsilatTab && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Tahsilat
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Biten iş emirlerinin tahsilatını buradan alabilirsiniz.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Payments />}
              onClick={() => setOpenTahsilatDialog(true)}
            >
              Tahsilat Al
            </Button>
          </Box>
        )}

        {activeTab === gecmisTabIndex && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Geçmiş / Aktivite
            </Typography>
            {activitiesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : activities.length === 0 ? (
              <Typography color="text.secondary">Henüz aktivite kaydı bulunmuyor.</Typography>
            ) : (
              <Box
                sx={{
                  position: 'relative',
                  pl: 2,
                  borderLeft: '2px solid',
                  borderColor: 'divider',
                }}
              >
                {activities.map((ev, idx) => (
                  <Box
                    key={ev.id}
                    sx={{
                      position: 'relative',
                      pb: idx < activities.length - 1 ? 2 : 0,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -9,
                        top: 6,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: ev.action === 'CREATED' ? 'primary.main' : ev.action === 'STATUS_CHANGED' ? 'info.main' : 'grey.400',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {ev.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(ev.createdAt).toLocaleString('tr-TR')}
                      {ev.user && ` · ${ev.user}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <WorkOrderItemDialog
        open={openItemDialog}
        onClose={() => {
          setOpenItemDialog(false);
          setEditingItem(null);
        }}
        onSubmit={handleItemSubmit}
        item={editingItem}
        workOrderId={id}
        stoklar={stoklar}
      />

      <PartRequestDialog
        open={openPartDialog}
        onClose={() => setOpenPartDialog(false)}
        onSubmit={handlePartSubmit}
        workOrderId={id}
        stoklar={stoklar}
      />

      <SupplyPartRequestDialog
        open={openSupplyDialog}
        onClose={() => {
          setOpenSupplyDialog(false);
          setSupplyPartRequest(null);
        }}
        onSubmit={handleSupplySubmit}
        partRequest={supplyPartRequest}
        stoklar={stoklar}
      />

      <Dialog open={openDeleteItem} onClose={() => setOpenDeleteItem(false)}>
        <DialogTitle>Kalem Sil</DialogTitle>
        <DialogContent>
          <Typography>
            {deletingItem?.description} kalemi silinecek. Devam etmek istiyor musunuz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteItem(false)}>İptal</Button>
          <Button onClick={handleDeleteItem} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCancelPart} onClose={() => setOpenCancelPart(false)}>
        <DialogTitle>Parça Talebi İptal</DialogTitle>
        <DialogContent>
          <Typography>
            {cancellingPart?.description} parça talebi iptal edilecek. Devam etmek istiyor musunuz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelPart(false)}>İptal</Button>
          <Button onClick={handleCancelPart} color="error" variant="contained">
            İptal Et
          </Button>
        </DialogActions>
      </Dialog>

      {workOrder?.serviceInvoice && (
        <WorkOrderTahsilatDialog
          open={openTahsilatDialog}
          onClose={() => setOpenTahsilatDialog(false)}
          onSuccess={() => { showSnackbar('Tahsilat kaydedildi', 'success'); fetchWorkOrder(); }}
          cariId={workOrder.cariId}
          cariUnvan={workOrder.cari?.unvan ?? workOrder.cari?.cariKodu ?? '-'}
          serviceInvoiceId={workOrder.serviceInvoice.id}
          workOrderNo={workOrder.workOrderNo}
          grandTotal={Number(workOrder.serviceInvoice.grandTotal ?? workOrder.grandTotal)}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <BarcodeScanner
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        onScan={(barcode) => {
          showSnackbar(`Barkod okundu: ${barcode}`, 'success');
          setOpenScanner(false);
        }}
      />

      <DamagePhotoCapture
        open={openPhoto}
        onClose={() => setOpenPhoto(false)}
        onCapture={(photo) => {
          showSnackbar('Fotoğraf kaydedildi', 'success');
          setOpenPhoto(false);
        }}
        title="İş Emri Fotoğrafı"
      />

    </>
  );
}

