---
description: Frontend page/component development workflow
---

# Frontend Development Workflow

Bu workflow, yeni bir frontend sayfası veya component eklerken takip edilmesi gereken adımları içerir.

## 0. Teknoloji & Stil Standartları

Bu proje **MUI v7** kullanmaktadır. Tasarım yaparken aşağıdaki kurallara DİKKAT EDİN:

- **Grid v2 (Grid 2)**: `Grid` bileşeni artık v2 versiyonundadır.
  - ❌ YANLIŞ: `<Grid item xs={12}>` (Bu kullanım v7'de kaldırıldı!)
  - ✅ DOĞRU: `<Grid size={{ xs: 12 }}>` veya `<Grid size={12}>`
  - Container için `container` prop'u aynen devam etmektedir.

## 1. Backend API Analizi

**MCP Kullan**: `api-docs-mcp` ile ilgili endpoint'leri keşfet

- Hangi endpoint'ler kullanılacak?
- DTO yapıları neler?
- Response formatları neler?

## 2. Zod Schema Oluştur

Backend DTO'larına uygun Zod schema oluştur:

```typescript
import { z } from 'zod';

export const entitySchema = z.object({
  name: z.string().min(1, 'İsim zorunlu'),
  description: z.string().optional(),
  email: z.string().email('Geçerli email girin'),
});

export type EntityFormData = z.infer<typeof entitySchema>;
```

## 3. API Hook Oluştur

TanStack Query kullanarak API hook'ları oluştur:

```typescript
// hooks/useEntity.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

export function useEntities() {
  return useQuery({
    queryKey: ['entities'], // Tenant-aware olmalı
    queryFn: async () => {
      const { data } = await axios.get('/api/entities');
      return data;
    },
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: EntityFormData) => {
      const response = await axios.post('/api/entities', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
  });
}
```

## 4. Form Component Oluştur

react-hook-form + Zod kullanarak form oluştur:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box } from '@mui/material';
import { useSnackbar } from 'notistack';

export function EntityForm() {
  const { enqueueSnackbar } = useSnackbar();
  const createEntity = useCreateEntity();
  
  const { register, handleSubmit, formState: { errors } } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
  });

  const onSubmit = async (data: EntityFormData) => {
    try {
      await createEntity.mutateAsync(data);
      enqueueSnackbar('Başarıyla oluşturuldu', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Hata oluştu', { variant: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('name')}
        label="İsim"
        error={!!errors.name}
        helperText={errors.name?.message}
        fullWidth
      />
      <Button type="submit" variant="contained">
        Kaydet
      </Button>
    </Box>
  );
}
```

## 5. List/Table Component Oluştur

MUI DataGrid veya Table kullanarak liste oluştur:

```typescript
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export function EntityList() {
  const { data, isLoading } = useEntities();

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'İsim', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'actions',
      headerName: 'İşlemler',
      renderCell: (params) => (
        <Button onClick={() => handleEdit(params.row.id)}>
          Düzenle
        </Button>
      ),
    },
  ];

  return (
    <DataGrid
      rows={data || []}
      columns={columns}
      loading={isLoading}
      autoHeight
    />
  );
}
```

## 6. Page Component Oluştur

Next.js App Router page oluştur:

```typescript
// app/entities/page.tsx
'use client';

import { Box, Typography, Button } from '@mui/material';
import { EntityList } from '@/components/EntityList';
import { useState } from 'react';

export default function EntitiesPage() {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Entities</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Yeni Ekle
        </Button>
      </Box>
      <EntityList />
    </Box>
  );
}
```

## 7. Styling (Material UI)

MUI sx prop veya styled kullan:

```typescript
<Box
  sx={{
    p: 2,
    bgcolor: 'background.paper',
    borderRadius: 1,
    boxShadow: 1,
  }}
>
  Content
</Box>
```

## 8. Role-Based UI

Kullanıcı rolüne göre UI elemanlarını göster/gizle:

```typescript
import { useAuth } from '@/hooks/useAuth';

export function EntityActions() {
  const { user } = useAuth();

  if (!user?.roles.includes('admin')) {
    return null;
  }

  return <Button>Admin İşlemi</Button>;
}
```

## 9. Error Handling

Notistack ile hata yönetimi:

```typescript
import { useSnackbar } from 'notistack';

const { enqueueSnackbar } = useSnackbar();

try {
  await mutation.mutateAsync(data);
  enqueueSnackbar('Başarılı', { variant: 'success' });
} catch (error) {
  enqueueSnackbar(
    error.response?.data?.message || 'Hata oluştu',
    { variant: 'error' }
  );
}
```

## 10. Test

// turbo
```bash
cd /var/www/panel-stage/client
npm run dev
```

Browser'da test et ve kontrol et:
- Form validation çalışıyor mu?
- API çağrıları başarılı mı?
- Error handling doğru mu?
- Loading states gösteriliyor mu?

## ✅ Checklist

- [ ] Backend API analiz edildi
- [ ] Zod schema oluşturuldu
- [ ] TanStack Query hooks oluşturuldu
- [ ] Form component oluşturuldu (react-hook-form + Zod)
- [ ] List/Table component oluşturuldu
- [ ] Page component oluşturuldu
- [ ] MUI styling uygulandı
- [ ] Role-based UI eklendi
- [ ] Error handling eklendi (Notistack)
- [ ] Staging'de test edildi
