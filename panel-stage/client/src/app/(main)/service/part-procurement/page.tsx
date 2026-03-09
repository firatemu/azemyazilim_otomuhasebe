'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Pagination,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Inventory2,
  LocalShipping,
  Visibility,
  Add,
  ExpandMore,
  ExpandLess,
  Search,
  Assignment,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import axios from '@/lib/axios';
import PartRequestStatusChip from '@/components/servis/PartRequestStatusChip';
import SupplyPartRequestDialog from '@/components/servis/SupplyPartRequestDialog';
import AddPartDirectDialog from '@/components/servis/AddPartDirectDialog';
import type {
  WorkOrder,
  PartRequest,
  PartWorkflowStatus,
  VehicleWorkflowStatus,
  CreateWorkOrderItemDto,
} from '@/types/servis';

const PART_WORKFLOW_LABELS: Record<PartWorkflowStatus, string> = {
  NOT_STARTED: 'Henüz başlamadı',
  PARTS_SUPPLIED_DIRECT: 'Parçalar temin edildi',
  PARTS_PENDING: 'Parça bekleniyor',
  PARTIALLY_SUPPLIED: 'Kısmi tedarik edildi',
  ALL_PARTS_SUPPLIED: 'Tüm parçalar tedarik edildi',
};

const VEHICLE_WORKFLOW_LABELS: Record<VehicleWorkflowStatus, string> = {
  WAITING: 'Bekleme',
  IN_PROGRESS: 'Yapım aşamasında',
  READY: 'Hazır',
  DELIVERED: 'Teslim edildi',
};

export default function ParcaTedarikYonetimiPage() {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [partWorkflowFilter, setPartWorkflowFilter] = useState<'' | PartWorkflowStatus>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [openSupplyDialog, setOpenSupplyDialog] = useState(false);
  const [supplyPartRequest, setSupplyPartRequest] = useState<PartRequest | null>(null);
  const [openAddPartDialog, setOpenAddPartDialog] = useState(false);
  const [addPartWorkOrder, setAddPartWorkOrder] = useState<WorkOrder | null>(null);
  const [stoklar, setStoklar] = useState<{ id: string; stokKodu?: string; stokAdi?: string }[]>([]);
  const [detailLoadedIds, setDetailLoadedIds] = useState<Set<string>>(new Set());
  const [responseNotesByWo, setResponseNotesByWo] = useState<Record<string, string>>({});
  const [responseSubmittingId, setResponseSubmittingId] = useState<string | null>(null);

  const fetchWorkOrderDetail = async (id: string) => {
    if (detailLoadedIds.has(id)) return;
    try {
      const res = await axios.get(`/work-order/${id}`);
      setWorkOrders((prev) =>
        prev.map((wo) =>
          wo.id === id
            ? {
                ...wo,
                ...res.data,
                items: res.data.items ?? wo.items,
                partRequests: res.data.partRequests ?? wo.partRequests,
                vehicleWorkflowStatus: res.data.vehicleWorkflowStatus ?? wo.vehicleWorkflowStatus,
                partWorkflowStatus: res.data.partWorkflowStatus ?? wo.partWorkflowStatus,
              }
            : wo
        )
      );
      setDetailLoadedIds((prev) => new Set(prev).add(id));
    } catch {
      // ignore
    }
  };

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      setDetailLoadedIds(new Set());
      try {
        const res = await axios.get('/work-order/for-parts-management', {
          params: {
            page,
            limit,
            search: debouncedSearch || undefined,
            partWorkflowStatus: partWorkflowFilter || undefined,
          },
        });
        const list = res.data?.data ?? res.data;
        // Ensure vehicleWorkflowStatus is included in each work order
        const workOrdersWithStatus = Array.isArray(list)
          ? list.map((wo: any) => ({
              ...wo,
              vehicleWorkflowStatus: wo.vehicleWorkflowStatus ?? 'WAITING',
              partWorkflowStatus: wo.partWorkflowStatus ?? 'NOT_STARTED',
            }))
          : [];
        setWorkOrders(workOrdersWithStatus);
        setTotal(res.data?.total ?? workOrdersWithStatus.length ?? 0);
      } catch (err: any) {
        // Fallback: if endpoint doesn't exist (404), use regular endpoint and filter client-side
        // This is expected if backend hasn't been restarted with the new endpoint
        if (err.response?.status === 404) {
          // Silently handle 404 - fallback will be used
          try {
            const res = await axios.get('/work-order', {
              params: {
                page: 1,
                limit: 500,
                search: debouncedSearch || undefined,
              },
            });
            const list = res.data?.data ?? res.data;
            const fullList = Array.isArray(list) ? list : [];
            const incomplete = fullList.filter(
              (wo: WorkOrder) =>
                wo.status !== 'CANCELLED' &&
                wo.status !== 'INVOICED_CLOSED' &&
                wo.status !== 'CLOSED_WITHOUT_INVOICE' &&
                (wo as any).vehicleWorkflowStatus !== 'DELIVERED'
            );
            const filtered =
              partWorkflowFilter && partWorkflowFilter.length > 0
                ? incomplete.filter((wo: WorkOrder) => (wo as any).partWorkflowStatus === partWorkflowFilter)
                : incomplete;
            // Ensure vehicleWorkflowStatus is included
            const paged = filtered
              .slice((page - 1) * limit, page * limit)
              .map((wo: any) => ({
                ...wo,
                vehicleWorkflowStatus: wo.vehicleWorkflowStatus ?? 'WAITING',
                partWorkflowStatus: wo.partWorkflowStatus ?? 'NOT_STARTED',
              }));
            setWorkOrders(paged);
            setTotal(filtered.length);
          } catch (fallbackErr: any) {
            // If fallback also fails, show empty list
            console.warn('Failed to fetch work orders:', fallbackErr.message);
            setWorkOrders([]);
            setTotal(0);
          }
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error('Error fetching work orders:', err.message);
      setWorkOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [page, partWorkflowFilter, debouncedSearch]);

  useEffect(() => {
    expandedIds.forEach((id) => fetchWorkOrderDetail(id));
  }, [expandedIds]);

  useEffect(() => {
    const fetchStok = async () => {
      try {
        const res = await axios.get('/product', { params: { limit: 1000 } });
        const d = res.data?.data ?? res.data;
        setStoklar(Array.isArray(d) ? d : []);
      } catch {
        setStoklar([]);
      }
    };
    fetchStok();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSupplySubmit = async (suppliedQty: number, stokId: string) => {
    if (!supplyPartRequest) return;
    try {
      await axios.post(`/part-request/${supplyPartRequest.id}/supply`, { suppliedQty, stokId });
      showSnackbar('Parça tedarik edildi', 'success');
      setOpenSupplyDialog(false);
      setSupplyPartRequest(null);
      fetchWorkOrders();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Tedarik başarısız', 'error');
    }
  };

  const handleAddPartSubmit = async (data: CreateWorkOrderItemDto) => {
    try {
      await axios.post('/work-order-item', data);
      showSnackbar('Parça eklendi', 'success');
      setOpenAddPartDialog(false);
      setAddPartWorkOrder(null);
      fetchWorkOrders();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Parça eklenemedi', 'error');
      throw err;
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const partItems = (wo: WorkOrder) => wo.items?.filter((i) => i.type === 'PART') ?? [];
  const pendingRequests = (wo: WorkOrder) =>
    wo.partRequests?.filter((pr) => pr.status === 'REQUESTED') ?? [];

  const handleSendResponse = async (woId: string) => {
    const text = (responseNotesByWo[woId] ?? '').trim();
    if (!text) {
      setSnackbar({ open: true, message: 'Yanıt metni girin', severity: 'error' });
      return;
    }
    setResponseSubmittingId(woId);
    try {
      await axios.patch(`/work-order/${woId}`, { supplyResponseNotes: text });
      setSnackbar({ open: true, message: 'Yanıt gönderildi', severity: 'success' });
      setResponseNotesByWo((prev) => {
        const next = { ...prev };
        delete next[woId];
        return next;
      });
      setDetailLoadedIds((prev) => {
        const next = new Set(prev);
        next.delete(woId);
        return next;
      });
      const res = await axios.get(`/work-order/${woId}`);
      setWorkOrders((prev) =>
        prev.map((wo) =>
          wo.id === woId ? { ...wo, ...res.data, supplyResponseNotes: res.data.supplyResponseNotes } : wo
        )
      );
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Yanıt gönderilemedi', severity: 'error' });
    } finally {
      setResponseSubmittingId(null);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Inventory2 sx={{ fontSize: 32, color: 'var(--primary)' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Parça Tedarik ve Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tamamlanmamış iş emirlerine parça ekleyin ve teknisyen taleplerini karşılayın
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            id="parts-supply-search"
            size="small"
            placeholder="İş emri no, plaka veya açıklama ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="part-workflow-filter-label">Parça Durumu</InputLabel>
            <Select
              labelId="part-workflow-filter-label"
              id="part-workflow-filter-select"
              value={partWorkflowFilter}
              label="Parça Durumu"
              onChange={(e) => {
                setPartWorkflowFilter(e.target.value as '' | PartWorkflowStatus);
                setPage(1);
              }}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="NOT_STARTED">Henüz başlamadı</MenuItem>
              <MenuItem value="PARTS_SUPPLIED_DIRECT">Parçalar temin edildi</MenuItem>
              <MenuItem value="PARTS_PENDING">Parça bekleniyor</MenuItem>
              <MenuItem value="PARTIALLY_SUPPLIED">Kısmi tedarik edildi</MenuItem>
              <MenuItem value="ALL_PARTS_SUPPLIED">Tüm parçalar tedarik edildi</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : workOrders.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <Inventory2 sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Tamamlanmamış iş emri bulunamadı
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Parça yönetimi yapılacak açık iş emri bulunmuyor
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {workOrders.map((wo) => {
            const expanded = expandedIds.has(wo.id);
            const partItemsList = partItems(wo);
            const partRequestsList = wo.partRequests ?? [];
            const pendingList = pendingRequests(wo);

            return (
              <Card
                key={wo.id}
                variant="outlined"
                sx={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}
              >
                <CardHeader
                  sx={{ py: 1.5, '& .MuiCardHeader-content': { minWidth: 0 } }}
                  action={
                    <IconButton onClick={() => toggleExpand(wo.id)} size="small">
                      {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  }
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => router.push(`/servis/is-emirleri/${wo.id}`)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        {wo.workOrderNo}
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {wo.customerVehicle
                          ? `${wo.customerVehicle.plaka} - ${wo.customerVehicle.aracMarka} ${wo.customerVehicle.aracModel}`
                          : '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {wo.cari?.unvan ?? wo.cari?.cariKodu ?? '-'}
                      </Typography>
                      <Chip
                        size="small"
                        label={`Araç: ${VEHICLE_WORKFLOW_LABELS[(wo as any).vehicleWorkflowStatus ?? 'WAITING']}`}
                        color={
                          (wo as any).vehicleWorkflowStatus === 'IN_PROGRESS'
                            ? 'info'
                            : (wo as any).vehicleWorkflowStatus === 'READY'
                            ? 'success'
                            : 'default'
                        }
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={`Parça: ${PART_WORKFLOW_LABELS[wo.partWorkflowStatus ?? 'NOT_STARTED']}`}
                        color={
                          pendingList.length > 0 ||
                          wo.partWorkflowStatus === 'PARTS_PENDING' ||
                          wo.partWorkflowStatus === 'PARTIALLY_SUPPLIED'
                            ? 'warning'
                            : wo.partWorkflowStatus === 'ALL_PARTS_SUPPLIED' || wo.partWorkflowStatus === 'PARTS_SUPPLIED_DIRECT'
                            ? 'success'
                            : 'default'
                        }
                      />
                      {pendingList.length > 0 && (
                        <Chip
                          size="small"
                          label={`${pendingList.length} talep bekliyor`}
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                />
                <Collapse in={expanded}>
                  <CardContent sx={{ pt: 0, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {(wo.diagnosisNotes || wo.supplyResponseNotes) && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            Teknisyen – Parça yazışması
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'stretch' }}>
                            {wo.diagnosisNotes && (
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  bgcolor: 'var(--muted)',
                                  borderLeft: '4px solid',
                                  borderLeftColor: 'primary.main',
                                  borderRadius: 1,
                                  alignSelf: 'flex-start',
                                  maxWidth: '85%',
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">Teknisyen isteği (yapılacaklar)</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>{wo.diagnosisNotes}</Typography>
                              </Paper>
                            )}
                            {wo.supplyResponseNotes && (
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  bgcolor: 'var(--muted)',
                                  borderRight: '4px solid',
                                  borderRightColor: 'grey.400',
                                  borderRadius: 1,
                                  alignSelf: 'flex-end',
                                  maxWidth: '85%',
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">Sizin yanıtınız</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>{wo.supplyResponseNotes}</Typography>
                              </Paper>
                            )}
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Teknisyene yanıt yazın (isteğe göre işleme devam edecek)</Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              size="small"
                              placeholder="Parça durumu, süre veya açıklama yazın..."
                              value={responseNotesByWo[wo.id] ?? ''}
                              onChange={(e) => setResponseNotesByWo((prev) => ({ ...prev, [wo.id]: e.target.value }))}
                              sx={{ mb: 1 }}
                            />
                            <Button
                              size="small"
                              variant="contained"
                              disabled={responseSubmittingId === wo.id}
                              onClick={() => handleSendResponse(wo.id)}
                              startIcon={responseSubmittingId === wo.id ? <CircularProgress size={16} /> : null}
                            >
                              {responseSubmittingId === wo.id ? 'Gönderiliyor...' : 'Yanıtı Gönder'}
                            </Button>
                          </Box>
                        </Box>
                      )}
                      {!wo.diagnosisNotes && !wo.supplyResponseNotes && (wo.status === 'PENDING_APPROVAL' || wo.status === 'WAITING_DIAGNOSIS') && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Teknisyen – Parça yazışması</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Teknisyen henüz teşhis/isteğini göndermedi. İş emri detayından &quot;Teşhis ve Ek İşlemler&quot; sekmesinde not alıp onaya gönderebilir.</Typography>
                          <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => router.push(`/servis/is-emirleri/${wo.id}`)}>
                            İş emrine git
                          </Button>
                        </Box>
                      )}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Assignment fontSize="small" /> İş Emrine Eklenen Parçalar
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<Add />}
                            variant="outlined"
                            onClick={() => {
                              setAddPartWorkOrder(wo);
                              setOpenAddPartDialog(true);
                            }}
                          >
                            Stoktan Parça Ekle
                          </Button>
                        </Box>
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Stok</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Miktar</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {partItemsList.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={3} align="center" sx={{ py: 2, color: 'text.secondary' }}>
                                    Henüz parça eklenmedi
                                  </TableCell>
                                </TableRow>
                              ) : (
                                partItemsList.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>
                                      {item.stok ? `${item.stok.stokKodu} - ${item.stok.stokAdi}` : '-'}
                                    </TableCell>
                                    <TableCell align="right">{item.quantity}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <LocalShipping fontSize="small" /> Teknisyen Parça Talepleri
                        </Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Stok</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Miktar</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Talep Eden</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>İşlem</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {partRequestsList.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} align="center" sx={{ py: 2, color: 'text.secondary' }}>
                                    Parça talebi bulunmuyor
                                  </TableCell>
                                </TableRow>
                              ) : (
                                partRequestsList.map((pr) => (
                                  <TableRow key={pr.id}>
                                    <TableCell>{pr.description}</TableCell>
                                    <TableCell>
                                      {pr.stok ? `${pr.stok.stokKodu} - ${pr.stok.stokAdi}` : '-'}
                                    </TableCell>
                                    <TableCell align="right">{pr.requestedQty}</TableCell>
                                    <TableCell>{pr.requestedByUser?.fullName ?? '-'}</TableCell>
                                    <TableCell>
                                      <PartRequestStatusChip status={pr.status} />
                                    </TableCell>
                                    <TableCell align="right">
                                      {pr.status === 'REQUESTED' && (
                                        <Button
                                          size="small"
                                          variant="contained"
                                          startIcon={<LocalShipping />}
                                          onClick={() => {
                                            setSupplyPartRequest(pr);
                                            setOpenSupplyDialog(true);
                                          }}
                                        >
                                          Tedarik Et
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
                  </CardContent>
                </Collapse>
              </Card>
            );
          })}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}

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

      <AddPartDirectDialog
        open={openAddPartDialog}
        onClose={() => {
          setOpenAddPartDialog(false);
          setAddPartWorkOrder(null);
        }}
        onSubmit={handleAddPartSubmit}
        workOrderId={addPartWorkOrder?.id ?? ''}
        workOrderNo={addPartWorkOrder?.workOrderNo}
        stoklar={stoklar}
      />

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
    </>
  );
}
