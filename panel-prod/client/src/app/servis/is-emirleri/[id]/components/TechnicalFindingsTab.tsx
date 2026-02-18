'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface TechnicalFinding {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: string;
  version: number;
}

interface TechnicalFindingsTabProps {
  workOrderId: string;
}

export default function TechnicalFindingsTab({ workOrderId }: TechnicalFindingsTabProps) {
  if (!workOrderId) {
    return <Box sx={{ p: 3 }}>İş emri ID bulunamadı</Box>;
  }

  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFinding, setEditingFinding] = useState<TechnicalFinding | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { data: findings, isLoading } = useQuery({
    queryKey: ['technical-findings', workOrderId],
    queryFn: async () => {
      const response = await axios.get(`/service-workflow/work-orders/${workOrderId}/technical-findings`);
      return response.data as TechnicalFinding[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const response = await axios.post('/service-workflow/technical-findings', {
        workOrderId,
        ...data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-findings', workOrderId] });
      setDialogOpen(false);
      setTitle('');
      setDescription('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; description: string; version: number }) => {
      const response = await axios.put(`/service-workflow/technical-findings/${data.id}`, {
        title: data.title,
        description: data.description,
        version: data.version,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-findings', workOrderId] });
      setDialogOpen(false);
      setEditingFinding(null);
      setTitle('');
      setDescription('');
    },
  });

  const handleOpenDialog = (finding?: TechnicalFinding) => {
    if (finding) {
      setEditingFinding(finding);
      setTitle(finding.title);
      setDescription(finding.description);
    } else {
      setEditingFinding(null);
      setTitle('');
      setDescription('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFinding(null);
    setTitle('');
    setDescription('');
  };

  const handleSubmit = () => {
    if (editingFinding) {
      updateMutation.mutate({
        id: editingFinding.id,
        title,
        description,
        version: editingFinding.version,
      });
    } else {
      createMutation.mutate({ title, description });
    }
  };

  if (isLoading) {
    return <Box sx={{ p: 3 }}>Yükleniyor...</Box>;
  }

  return (
    <Box sx={{ px: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Teknik Bulgular
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Bulgu Ekle
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Başlık</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Oluşturulma</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!findings || findings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">Henüz bulgu eklenmemiş</Typography>
                </TableCell>
              </TableRow>
            ) : (
              findings.map((finding) => (
                <TableRow key={finding.id}>
                  <TableCell>{finding.title}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {finding.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(finding.createdAt).toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenDialog(finding)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFinding ? 'Bulguyu Düzenle' : 'Yeni Bulgu Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Başlık"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Açıklama"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={6}
            sx={{ mt: 2 }}
            required
          />
          {(createMutation.isError || updateMutation.isError) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(createMutation.error as any)?.response?.data?.message || (updateMutation.error as any)?.response?.data?.message || 'Bir hata oluştu'}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!title || !description || createMutation.isPending || updateMutation.isPending}
          >
            {editingFinding ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

