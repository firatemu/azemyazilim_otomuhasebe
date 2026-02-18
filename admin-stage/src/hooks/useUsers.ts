import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
    domain?: string;
    status?: string;
  };
  createdAt?: string;
  registeredAt?: string;
  lastLoginAt?: string;
  totalSpent?: number;
  invoiceCount?: number;
}

interface UserFilters {
  search?: string;
  plan?: string;
  status?: string;
  dateRange?: { start: string; end: string };
  subscriptionStatus?: string;
  page?: number;
  limit?: number;
}

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      try {
        const response = await api.get('/users', { params: filters });
        // Backend { data: users[], total, page, limit, totalPages } şeklinde döndürüyor
        const result = response?.data;
        
        // Eğer direkt array ise
        if (Array.isArray(result)) {
          return result;
        }
        
        // Eğer obje içinde data property'si varsa
        if (result && Array.isArray(result.data)) {
          return result.data;
        }
        
        // Hiçbiri değilse boş array döndür
        console.warn('Users API did not return an array:', result);
        return [];
      } catch (error: any) {
        console.error('Users fetch error:', error);
        // Hata durumunda boş array döndür
        return [];
      }
    },
    // Varsayılan değer olarak boş array
    initialData: [],
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<User>) => {
      const { data } = await api.patch(`/users/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/users/${id}/suspend`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

/**
 * Kullanıcıya tenant ID atar (subscription onaylama)
 * Bu fonksiyon demo hesabı aktif hale getirir
 */
export function useApproveUserSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      // Backend'de subscription onaylama endpoint'i
      // Eğer backend farklı bir endpoint kullanıyorsa burayı güncelleyin
      const { data } = await api.post(`/users/${userId}/approve-subscription`);
      return data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}

/**
 * Kullanıcıya manuel olarak tenant ID atar
 * Bu fonksiyon admin tarafından kullanılır
 */
export function useAssignTenantId() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, tenantId }: { userId: string; tenantId?: string }) => {
      // Eğer tenantId verilmezse backend otomatik oluşturur
      const { data } = await api.post(`/users/${userId}/assign-tenant`, { tenantId });
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}

