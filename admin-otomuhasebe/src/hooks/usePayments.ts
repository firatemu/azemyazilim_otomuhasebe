import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentMethod?: string;
  iyzicoPaymentId?: string;
  iyzicoTransactionId?: string;
  failureReason?: string;
  paidAt?: string;
  createdAt: string;
  subscription?: {
    tenant?: {
      users?: Array<{ email: string; fullName: string }>;
    };
  };
}

export function usePayments(filters: any = {}) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const { data } = await api.get('/payments', { params: filters });
      return data;
    },
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/payments/${id}/refund`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

