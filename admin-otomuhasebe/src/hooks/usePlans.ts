import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'MONTHLY' | 'ANNUAL';
  features: {
    maxCompanies: number;
    maxInvoices: number | 'unlimited';
    eArchive: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
    dedicatedManager: boolean;
  };
  isActive: boolean;
  displayOrder: number;
  subscriberCount?: number;
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data } = await api.get('/plans');
      return data;
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: Partial<Plan>) => {
      const { data } = await api.post('/plans', plan);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Plan>) => {
      const { data } = await api.patch(`/plans/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

