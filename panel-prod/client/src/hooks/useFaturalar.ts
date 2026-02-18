'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';

export type FaturaTipi = 'SATIS' | 'ALIS' | 'SATIS_IADE' | 'ALIS_IADE';
export type FaturaDurum = 'ACIK' | 'KAPALI' | 'KISMEN_ODENDI' | 'ONAYLANDI' | 'IPTAL';

export interface Fatura {
  id: string;
  faturaNo: string;
  faturaTipi: FaturaTipi;
  tarih: string;
  vade?: string;
  toplamTutar: number;
  kdvTutar: number;
  genelToplam: number;
  durum: FaturaDurum;
  odenecekTutar?: number;
  odenenTutar: number;
  aciklama?: string;
  siparisNo?: string;
  efaturaStatus?: string;
  createdAt: string;
  updatedAt: string;
  cari: {
    id: string;
    cariKodu: string;
    unvan: string;
    tip: string;
  };
  irsaliye?: {
    id: string;
    irsaliyeNo: string;
  };
  createdByUser?: {
    id: string;
    fullName: string;
    username: string;
  };
  _count: {
    kalemler: number;
    faturaTahsilatlar: number;
    logs: number;
  };
}

export interface FaturaListResponse {
  data: Fatura[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseFaturalarParams {
  faturaTipi?: FaturaTipi;
  page?: number;
  limit?: number;
  search?: string;
  cariId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
}

export function useFaturalar({
  faturaTipi,
  page = 1,
  limit = 50,
  search,
  cariId,
  sortBy,
  sortOrder,
  enabled = true,
}: UseFaturalarParams = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['faturalar', faturaTipi, page, limit, search, cariId, sortBy, sortOrder],
    queryFn: async (): Promise<FaturaListResponse> => {
      const response = await axios.get('/fatura', {
        params: {
          faturaTipi,
          page,
          limit,
          search,
          cariId,
          sortBy,
          sortOrder,
        },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    gcTime: 5 * 60 * 1000, // 5 dakika
    enabled,
  });

  // Invalidate ve refetch helper'ları
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['faturalar'] });
  };

  const refetch = () => {
    query.refetch();
  };

  return {
    ...query,
    faturalar: query.data?.data || [],
    meta: query.data?.meta,
    invalidate,
    refetch,
  };
}

// Detay sorgusu için hook
export function useFatura(id: string, enabled?: boolean) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['fatura', id],
    queryFn: async (): Promise<Fatura> => {
      const response = await axios.get(`/fatura/${id}`);
      return response.data;
    },
    enabled: !!id && enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 dakika cache
  });

  return {
    ...query,
    fatura: query.data,
  };
}

// Silinmiş faturalar için hook
export function useDeletedFaturalar(args: Omit<UseFaturalarParams, 'enabled'> = {}) {
  const query = useQuery({
    queryKey: ['faturalar', 'deleted', args],
    queryFn: async (): Promise<FaturaListResponse> => {
      const response = await axios.get('/fatura/deleted', {
        params: {
          ...args,
        },
      });
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 dakika
  });

  return {
    ...query,
    faturalar: query.data?.data || [],
  };
}
