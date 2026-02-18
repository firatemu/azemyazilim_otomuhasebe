import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  plan?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
  };
  status: 'PENDING' | 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  trialEndsAt?: string | null;
  canceledAt?: string | null;
  nextBillingDate?: string | null;
  lastBillingDate?: string | null;
  autoRenew: boolean;
  iyzicoSubscriptionRef?: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: string;
    name: string;
    status: string;
    users?: Array<{ id: string; email: string; fullName: string; firstName?: string; lastName?: string }>;
  };
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    paidAt?: string | null;
  }>;
}

export function useSubscriptions(filters: any = {}) {
  return useQuery({
    queryKey: ['subscriptions', filters],
    queryFn: async () => {
      try {
        const response = await api.get('/subscriptions', { params: filters });
        // Response.data array olmalı, ama güvenli kontrol yapalım
        const data = response?.data;
        if (Array.isArray(data)) {
          return data;
        }
        // Eğer obje içinde array varsa
        if (data && Array.isArray(data.data)) {
          return data.data;
        }
        // Eğer hiçbiri değilse boş array döndür
        console.warn('Subscriptions API did not return an array:', data);
        return [];
      } catch (error: any) {
        console.error('Subscriptions fetch error:', error);
        // Hata durumunda boş array döndür
        return [];
      }
    },
    // Varsayılan değer olarak boş array
    initialData: [],
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: ['subscription', id],
    queryFn: async () => {
      const { data } = await api.get(`/subscriptions/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/subscriptions/${id}/cancel`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
    },
  });
}

export function useApproveTrial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const { data } = await api.post(`/tenants/${tenantId}/approve-trial`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      // Subscription ID varsa onu da invalidate et
      if (data?.subscription?.id) {
        queryClient.invalidateQueries({ queryKey: ['subscription', data.subscription.id] });
      }
    },
  });
}

