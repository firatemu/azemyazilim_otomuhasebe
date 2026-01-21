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
} from '@mui/material';
import { Download, MoreVertical, Eye, RotateCcw, FileText, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import MainLayout from '@/components/Layout/MainLayout';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import { usePayments, Payment, useRefundPayment } from '@/hooks/usePayments';
import { toast } from 'sonner';

export default function Payments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPayment, setMenuPayment] = useState<Payment | null>(null);

  const { data, isLoading } = usePayments({ search });
  const refundPayment = useRefundPayment();

  let payments = data || [];
  
  if (statusFilter !== 'ALL') {
    payments = payments.filter((p: Payment) => p.status === statusFilter);
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, payment: Payment) => {
    setAnchorEl(event.currentTarget);
    setMenuPayment(payment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPayment(null);
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailModalOpen(true);
    handleMenuClose();
  };

  const handleRefund = async () => {
    if (menuPayment) {
      try {
        await refundPayment.mutateAsync(menuPayment.id);
        toast.success('İade işlemi başlatıldı');
        handleMenuClose();
      } catch (error) {
        toast.error('İade işlemi başlatılırken hata oluştu');
      }
    }
  };

  const handleCopyIyzicoRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    toast.success('Kopyalandı');
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const summaryCards = [
    {
      title: 'Bugünkü Gelir',
      value: `₺${payments
        .filter((p: Payment) => {
          const paymentDate = new Date(p.createdAt);
          return p.status === 'SUCCESS' && paymentDate >= today && paymentDate <= todayEnd;
        })
        .reduce((sum: number, p: Payment) => sum + p.amount, 0)
        .toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      color: 'success',
    },
    {
      title: 'Başarılı İşlem',
      value: payments.filter((p: Payment) => p.status === 'SUCCESS').length,
      color: 'success',
    },
    {
      title: 'Başarısız İşlem',
      value: payments.filter((p: Payment) => p.status === 'FAILED').length,
      color: 'error',
    },
    {
      title: 'İade Edilen',
      value: payments.filter((p: Payment) => p.status === 'REFUNDED').length,
      color: 'warning',
    },
  ];

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'id',
      header: 'İşlem No',
      cell: ({ row }) => (
        <Typography variant="body2" fontFamily="monospace">
          {row.original.id.substring(0, 8)}...
        </Typography>
      ),
    },
    {
      accessorKey: 'subscription',
      header: 'Kullanıcı',
      cell: ({ row }) => {
        const user = row.original.subscription?.tenant?.users?.[0];
        return (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {user?.fullName || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || ''}
            </Typography>
          </Box>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Tutar',
      cell: ({ row }) => (
        <Typography variant="body2" fontWeight="medium">
          ₺{row.original.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => <StatusChip status={row.original.status} />,
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Ödeme Yöntemi',
      cell: ({ row }) => (
        <Chip
          label={row.original.paymentMethod || 'N/A'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      accessorKey: 'iyzicoPaymentId',
      header: 'iyzico Ref',
      cell: ({ row }) => (
        row.original.iyzicoPaymentId ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" fontFamily="monospace">
              {row.original.iyzicoPaymentId.substring(0, 12)}...
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleCopyIyzicoRef(row.original.iyzicoPaymentId!)}
            >
              <Copy size={14} />
            </IconButton>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">N/A</Typography>
        )
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Tarih',
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'dd MMM yyyy HH:mm', { locale: tr }),
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
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
          Ödemeler
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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        {summaryCards.map((card, idx) => (
          <Paper 
            key={idx} 
            sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              },
              border: `1px solid ${card.color === 'success' ? 'rgba(0, 200, 83, 0.2)' : card.color === 'error' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255, 152, 0, 0.2)'}`,
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 1.5,
              }}
            >
              {card.title}
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              sx={{
                color: card.color === 'success' ? 'rgb(16, 185, 129)' : card.color === 'error' ? 'rgb(239, 68, 68)' : 'rgb(245, 158, 11)',
                fontSize: { xs: '1.75rem', sm: '2rem' },
              }}
            >
              {card.value}
            </Typography>
          </Paper>
        ))}
      </Box>

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
            placeholder="İşlem No, iyzico ref veya email ile ara..."
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
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 180,
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
          >
            <InputLabel>Durum</InputLabel>
            <Select
              value={statusFilter}
              label="Durum"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">Tümü</MenuItem>
              <MenuItem value="SUCCESS">Başarılı</MenuItem>
              <MenuItem value="PENDING">Beklemede</MenuItem>
              <MenuItem value="FAILED">Başarısız</MenuItem>
              <MenuItem value="REFUNDED">İade Edildi</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <DataTable
        data={payments}
        columns={columns}
        isLoading={isLoading}
        onRowClick={handleViewDetails}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => menuPayment && handleViewDetails(menuPayment)}>
          <Eye size={16} style={{ marginRight: 8 }} />
          Detayları Gör
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <FileText size={16} style={{ marginRight: 8 }} />
          Fatura İndir
        </MenuItem>
        {menuPayment?.status === 'SUCCESS' && (
          <MenuItem onClick={handleRefund} sx={{ color: 'warning.main' }}>
            <RotateCcw size={16} style={{ marginRight: 8 }} />
            İade Et
          </MenuItem>
        )}
        {menuPayment?.status === 'FAILED' && (
          <MenuItem onClick={handleMenuClose}>
            <RotateCcw size={16} style={{ marginRight: 8 }} />
            Yeniden Dene
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPayment && (
          <>
            <DialogTitle>Ödeme Detayları</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  İşlem No
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {selectedPayment.id}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tutar
                </Typography>
                <Typography variant="h6">
                  ₺{selectedPayment.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Durum
                </Typography>
                <StatusChip status={selectedPayment.status} />
              </Box>
              {selectedPayment.iyzicoPaymentId && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    iyzico Payment ID
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontFamily="monospace">
                      {selectedPayment.iyzicoPaymentId}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyIyzicoRef(selectedPayment.iyzicoPaymentId!)}
                    >
                      <Copy size={16} />
                    </IconButton>
                  </Box>
                </Box>
              )}
              {selectedPayment.failureReason && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Hata Nedeni
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    {selectedPayment.failureReason}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailModalOpen(false)}>Kapat</Button>
              {selectedPayment.status === 'SUCCESS' && (
                <Button variant="contained" color="warning" onClick={handleRefund}>
                  İade Et
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </MainLayout>
  );
}
