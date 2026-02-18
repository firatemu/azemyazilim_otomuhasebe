'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type {
  InventoryListResponse,
  InventoryItem,
  InventoryFilters,
  InventoryFormData,
} from '../types/inventory.types';

const BASE_URL = '/stok';

/**
 * Stok listesi hook'u
 * @param params - Filtre ve sayfalama parametreleri
 */
export function useInventoryList(params: {
  page?: number;
  limit?: number;
  search?: string;
} & Partial<InventoryFilters>) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['inventory', 'list', params],
    queryFn: async (): Promise<InventoryListResponse> => {
      const response = await axios.get(BASE_URL, { params });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    gcTime: 5 * 60 * 1000, // 5 dakika
  });

  // Invalidate helper
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
  };

  return {
    ...query,
    inventories: query.data?.data || [],
    meta: query.data?.meta,
    invalidate,
  };
}

/**
 * Tekil stok item hook'u
 */
export function useInventoryItem(id: string, enabled?: boolean) {
  return useQuery({
    queryKey: ['inventory', 'item', id],
    queryFn: async (): Promise<InventoryItem> => {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    },
    enabled: !!id && enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Stok oluşturma mutation'ı
 */
export function useCreateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InventoryFormData) => {
      const response = await axios.post(BASE_URL, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

/**
 * Stok güncelleme mutation'ı
 */
export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InventoryFormData> }) => {
      const response = await axios.patch(`${BASE_URL}/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'item', variables.id] });
    },
  });
}

/**
 * Stok silme mutation'ı
 */
export function useDeleteInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${BASE_URL}/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

/**
 * Stok hareketleri hook'u
 */
export function useStockMovements(stokId?: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['inventory', 'movements', stokId, params],
    queryFn: async () => {
      if (!stokId) return null;
      const response = await axios.get(`${BASE_URL}/${stokId}/hareketler`, { params });
      return response.data;
    },
    enabled: !!stokId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Stok silme kontrolü hook'u
 */
export function useInventoryCanDelete(id: string) {
  return useQuery({
    queryKey: ['inventory', 'can-delete', id],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/${id}/can-delete`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
