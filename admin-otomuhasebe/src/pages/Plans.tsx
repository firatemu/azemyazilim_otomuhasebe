import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '@/components/Layout/MainLayout';
import FormTextField from '@/components/ui/FormTextField';
import { usePlans, Plan, useCreatePlan, useUpdatePlan } from '@/hooks/usePlans';
import { toast } from 'sonner';

const planSchema = z.object({
  name: z.string().min(3, 'Plan adı en az 3 karakter olmalıdır'),
  price: z.number().min(0, 'Fiyat 0 veya pozitif olmalıdır'),
  maxCompanies: z.number().min(1, 'En az 1 şirket olmalıdır'),
  maxInvoices: z.number().min(-1, 'Geçerli bir değer giriniz'),
  eArchive: z.boolean(),
  apiAccess: z.boolean(),
  prioritySupport: z.boolean(),
  isActive: z.boolean(),
});

export default function Plans() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const { data: plans, isLoading } = usePlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      price: 0,
      maxCompanies: 1,
      maxInvoices: 100,
      eArchive: false,
      apiAccess: false,
      prioritySupport: false,
      isActive: true,
    },
  });

  const handleCreate = () => {
    setEditingPlan(null);
    reset({
      name: '',
      price: 0,
      maxCompanies: 1,
      maxInvoices: 100,
      eArchive: false,
      apiAccess: false,
      prioritySupport: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    reset({
      name: plan.name,
      price: plan.price,
      maxCompanies: plan.features?.maxCompanies || 1,
      maxInvoices: plan.features?.maxInvoices === 'unlimited' ? -1 : (plan.features?.maxInvoices || 100),
      eArchive: plan.features?.eArchive || false,
      apiAccess: plan.features?.apiAccess || false,
      prioritySupport: plan.features?.prioritySupport || false,
      isActive: plan.isActive,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      const planData = {
        name: data.name,
        price: data.price,
        features: {
          maxCompanies: data.maxCompanies,
          maxInvoices: data.maxInvoices === -1 ? 'unlimited' : data.maxInvoices,
          eArchive: data.eArchive,
          apiAccess: data.apiAccess,
          prioritySupport: data.prioritySupport,
          customIntegrations: false,
          dedicatedManager: false,
        },
        isActive: data.isActive,
      };

      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.id, ...planData });
        toast.success('Plan güncellendi');
      } else {
        await createPlan.mutateAsync(planData);
        toast.success('Plan oluşturuldu');
      }
      setModalOpen(false);
    } catch (error) {
      toast.error('Plan kaydedilirken hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Typography>Yükleniyor...</Typography>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Paket Yönetimi
        </Typography>
        <Button variant="contained" startIcon={<Plus />} onClick={handleCreate}>
          Yeni Plan Ekle
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {plans?.map((plan: any) => (
          <Card key={plan.id} sx={{ position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                cursor: 'grab',
                color: 'text.secondary',
              }}
            >
              <GripVertical size={20} />
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {plan.price === -1 ? 'Özel Fiyat' : `₺${plan.price}`}
                  </Typography>
                  {plan.subscriberCount !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      {plan.subscriberCount} abone
                    </Typography>
                  )}
                </Box>
                <FormControlLabel
                  control={<Switch checked={plan.isActive} size="small" disabled />}
                  label="Aktif"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Özellikler:
                </Typography>
                <Typography variant="body2">• Maksimum Şirket: {plan.features?.maxCompanies || 'N/A'}</Typography>
                <Typography variant="body2">
                  • Maksimum Fatura: {plan.features?.maxInvoices === -1 || plan.features?.maxInvoices === 'unlimited' ? 'Sınırsız' : plan.features?.maxInvoices || 'N/A'}
                </Typography>
                {plan.features?.eArchive && <Typography variant="body2">• E-Arşiv Entegrasyonu</Typography>}
                {plan.features?.apiAccess && <Typography variant="body2">• API Erişimi</Typography>}
                {plan.features?.prioritySupport && <Typography variant="body2">• Öncelikli Destek</Typography>}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => handleEdit(plan)}
                >
                  Düzenle
                </Button>
                <Button size="small" variant="outlined" color="error" startIcon={<Trash2 />}>
                  Sil
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPlan ? 'Plan Düzenle' : 'Yeni Plan Ekle'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <FormTextField
              name="name"
              control={control}
              label="Plan Adı"
              margin="normal"
            />
            <FormTextField
              name="price"
              control={control}
              label="Fiyat"
              type="number"
              margin="normal"
            />
            <FormTextField
              name="maxCompanies"
              control={control}
              label="Maksimum Şirket Sayısı"
              type="number"
              margin="normal"
            />
            <FormTextField
              name="maxInvoices"
              control={control}
              label="Maksimum Fatura Sayısı (-1 = Sınırsız)"
              type="number"
              margin="normal"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={watch('eArchive')}
                  {...control.register('eArchive')}
                />
              }
              label="E-Arşiv Entegrasyonu"
              sx={{ mt: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={watch('apiAccess')}
                  {...control.register('apiAccess')}
                />
              }
              label="API Erişimi"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={watch('prioritySupport')}
                  {...control.register('prioritySupport')}
                />
              }
              label="Öncelikli Destek"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={watch('isActive')}
                  {...control.register('isActive')}
                />
              }
              label="Aktif"
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
