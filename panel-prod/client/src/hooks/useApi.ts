import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

// Stok hooks
export function useStoklar(search?: string, limit = 20) {
  return useQuery({
    queryKey: ['stoklar', search, limit],
    queryFn: async () => {
      const response = await axios.get('/stok', {
        params: { search, limit },
      });
      return response.data.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
  });
}

// Cari hooks
export function useCariler(tip?: string, limit = 1000) {
  return useQuery({
    queryKey: ['cariler', tip, limit],
    queryFn: async () => {
      const response = await axios.get('/cari', {
        params: { tip, limit },
      });
      return response.data.data || [];
    },
    staleTime: 3 * 60 * 1000, // 3 dakika
  });
}

// Kasa hooks
export function useKasalar(aktif = true) {
  return useQuery({
    queryKey: ['kasalar', aktif],
    queryFn: async () => {
      const response = await axios.get('/kasa', {
        params: { aktif },
      });
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
  });
}

// Fatura hooks
export function useFaturalar(faturaTipi?: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['faturalar', faturaTipi, page, limit],
    queryFn: async () => {
      const response = await axios.get('/fatura', {
        params: { faturaTipi, page, limit },
      });
      return response.data;
    },
    staleTime: 60 * 1000, // 1 dakika
  });
}

export function useFatura(id: string) {
  return useQuery({
    queryKey: ['fatura', id],
    queryFn: async () => {
      const response = await axios.get(`/fatura/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Tahsilat hooks
export function useTahsilatlar(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['tahsilatlar', page, limit],
    queryFn: async () => {
      const response = await axios.get('/tahsilat', {
        params: { page, limit },
      });
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

// Stok Hareket hooks
export function useStokHareketler(stokId?: string, hareketTipi?: string, limit = 100) {
  return useQuery({
    queryKey: ['stok-hareketler', stokId, hareketTipi, limit],
    queryFn: async () => {
      const response = await axios.get('/stok-hareket', {
        params: { stokId, hareketTipi, limit },
      });
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

// Personel hooks
export function usePersoneller() {
  return useQuery({
    queryKey: ['personeller'],
    queryFn: async () => {
      const response = await axios.get('/personel');
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}

// Mutation hooks
export function useCreateStok() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/stok', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stoklar'] });
    },
  });
}

export function useCreateCari() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/cari', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cariler'] });
    },
  });
}

export function useCreateFatura() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/fatura', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturalar'] });
    },
  });
}

