import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { PurchaseOrderFilters } from '@/stores/purchaseOrderStore';

// Purchase Orders hooks
export function useOrders(filters?: PurchaseOrderFilters, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['purchase-orders', filters, page, limit],
    queryFn: async () => {
      const params: any = { page, limit };
      if (filters?.status) params.status = filters.status;
      if (filters?.supplierId) params.supplierId = filters.supplierId;
      if (filters?.search) params.search = filters.search;
      if (filters?.dateRange) {
        params.startDate = filters.dateRange[0].toISOString().split('T')[0];
        params.endDate = filters.dateRange[1].toISOString().split('T')[0];
      }

      const response = await axios.get('/purchase-orders', { params });
      return response.data;
    },
    staleTime: 60 * 1000, // 1 dakika
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async () => {
      const response = await axios.get(`/purchase-orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useRemainingItems(orderId: string) {
  return useQuery({
    queryKey: ['purchase-order-remaining', orderId],
    queryFn: async () => {
      const response = await axios.get(`/purchase-orders/${orderId}/remaining-items`);
      return response.data;
    },
    enabled: !!orderId,
  });
}

export function useOrderInvoices(orderId: string) {
  return useQuery({
    queryKey: ['purchase-order-invoices', orderId],
    queryFn: async () => {
      const response = await axios.get(`/purchase-orders/${orderId}/invoices`);
      return response.data;
    },
    enabled: !!orderId,
  });
}

// Mutation hooks
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/purchase-orders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.patch(`/purchase-orders/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', variables.id] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/purchase-orders/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}

export function useCreateInvoiceFromOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: any }) => {
      const response = await axios.post(`/purchase-orders/${orderId}/create-invoice`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-invoices', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['faturalar'] });
    },
  });
}

export function useCreateOrderFromRemaining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/purchase-orders/from-remaining', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}

