'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface DiagnosticNote {
  id: string;
  note: string;
  createdAt: string;
  createdBy: string;
  version: number;
}

interface DiagnosticNotesTabProps {
  workOrderId: string;
}

export default function DiagnosticNotesTab({ workOrderId }: DiagnosticNotesTabProps) {
  if (!workOrderId) {
    return <Box sx={{ p: 3 }}>İş emri ID bulunamadı</Box>;
  }

  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [note, setNote] = useState('');

  const { data: notes, isLoading } = useQuery({
    queryKey: ['diagnostic-notes', workOrderId],
    queryFn: async () => {
      const response = await axios.get(`/service-workflow/work-orders/${workOrderId}/diagnostic-notes`);
      return response.data as DiagnosticNote[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { note: string }) => {
      const response = await axios.post('/service-workflow/diagnostic-notes', {
        workOrderId,
        ...data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-notes', workOrderId] });
      setDialogOpen(false);
      setNote('');
    },
  });

  const handleOpenDialog = () => {
    setNote('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNote('');
  };

  const handleSubmit = () => {
    createMutation.mutate({ note });
  };

  if (isLoading) {
    return <Box sx={{ p: 3 }}>Yükleniyor...</Box>;
  }

  return (
    <Box sx={{ px: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Teşhis Notları
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Yeni Not Ekle
        </Button>
      </Box>

      <Paper variant="outlined">
        {!notes || notes.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Henüz not eklenmemiş</Typography>
          </Box>
        ) : (
          <List>
            {notes.map((noteItem, index) => (
              <React.Fragment key={noteItem.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {noteItem.note}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {new Date(noteItem.createdAt).toLocaleString('tr-TR')}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < notes.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Teşhis Notu Ekle</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Not"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={8}
            sx={{ mt: 2 }}
            required
            placeholder="Teşhis notunuzu buraya yazın..."
          />
          {createMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(createMutation.error as any)?.response?.data?.message || 'Bir hata oluştu'}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!note || createMutation.isPending}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

