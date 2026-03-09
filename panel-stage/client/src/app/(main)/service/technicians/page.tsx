'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Search, Edit, Delete, Person, PersonOff, Refresh } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';

const DEPARTMAN_OPTIONS = [
  'Kaporta',
  'Motor',
  'Elektrik',
  'Oto Boya',
  'Klima',
  'Lastik',
  'Şanzıman',
  'Fren',
  'Süspansiyon',
  'Egzoz',
  'Cam',
  'Diğer',
];

interface Technician {
  id: string;
  fullName: string;
  department?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  tenant?: { id: string; name: string };
}

export default function TeknisyenlerPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore((state: any) => state) as any;
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Technician | null>(null);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    department: '',
  });

  const canManage =
    user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'WORKSHOP_MANAGER' ||
    user?.role === 'SERVICE_MANAGER' ||
    user?.role === 'RECEPTION';

  const { data, isLoading } = useQuery({
    queryKey: ['technicians', search],
    queryFn: async () => {
      const res = await axios.get('/technicians', {
        params: { search: search || undefined, limit: 500 },
      });
      return res.data;
    },
    enabled: canManage,
  });

  const createMutation = useMutation({
    mutationFn: async (body: typeof createForm) => {
      const res = await axios.post('/technicians', body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      setCreateOpen(false);
      setCreateForm({ fullName: '', department: '' });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(`/users/${id}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const technicians: Technician[] = data?.data ?? [];

  const handleCreate = () => {
    if (!createForm.fullName || !createForm.department) return;
    createMutation.mutate(createForm);
  };

  if (!canManage) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Bu sayfaya erişim yetkiniz yok.</Alert>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Teknisyenler
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'var(--muted-foreground)' }}>
        Servis teknisyenlerini yönetin
      </Typography>

      <Paper
        sx={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Ad soyad veya departman ile ara..."
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
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['technicians'] })}
            sx={{ textTransform: 'none' }}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateOpen(true)}
            sx={{
              bgcolor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Yeni Teknisyen
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ad Soyad</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Departman</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  İşlem
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : technicians.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'var(--muted-foreground)' }}>
                    Teknisyen bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                technicians.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: t.isActive ? '#0ea5e9' : '#94a3b8',
                          fontSize: '0.875rem',
                        }}
                      >
                        {(t.fullName || '?')[0].toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell>{t.fullName || '-'}</TableCell>
                    <TableCell>{t.department || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={t.isActive ? 'Aktif' : 'Pasif'}
                        size="small"
                        color={t.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t.isActive ? 'Pasifleştir' : 'Aktifleştir'}>
                        <IconButton
                          size="small"
                          onClick={() => suspendMutation.mutate(t.id)}
                          disabled={suspendMutation.isPending}
                        >
                          {t.isActive ? (
                            <PersonOff fontSize="small" />
                          ) : (
                            <Person fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelected(t);
                            setDeleteOpen(true);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Yeni Teknisyen Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Teknisyen Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Ad Soyad"
              value={createForm.fullName}
              onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))}
              required
            />
            <FormControl required>
              <InputLabel>Departman</InputLabel>
              <Select
                value={createForm.department}
                label="Departman"
                onChange={(e) => setCreateForm((p) => ({ ...p, department: e.target.value }))}
              >
                {DEPARTMAN_OPTIONS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={
              !createForm.fullName ||
              !createForm.department ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Teknisyeni Sil</DialogTitle>
        <DialogContent>
          {selected && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <strong>{selected.fullName}</strong> ({selected.department || '-'}) adlı teknisyeni silmek
              istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>İptal</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => selected && deleteMutation.mutate(selected.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
