import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { Randevu, RandevuStatus } from '@/types/servis';

interface RandevularParams {
    page?: number;
    limit?: number;
    status?: RandevuStatus;
    customerId?: string;
    vehicleId?: string;
    startDate?: string;
    endDate?: string;
}

// 1. Randevular\u0131 Listele
export function useRandevular(params: RandevularParams = {}) {
    return useQuery({
        queryKey: ['randevular', params],
        queryFn: async () => {
            const response = await axios.get('/randevu', { params });
            return response.data;
        },
    });
}

// 2. Randevu Detay\u0131
export function useRandevu(id: string) {
    return useQuery({
        queryKey: ['randevu', id],
        queryFn: async () => {
            const response = await axios.get(`/randevu/${id}`);
            return response.data as Randevu;
        },
        enabled: !!id,
    });
}

// 3. Randevu Mutasyonlar\u0131
export function useRandevuMutation(id?: string) {
    const queryClient = useQueryClient();

    // Olu\u015ftur
    const create = useMutation({
        mutationFn: async (data: Partial<Randevu>) => {
            const response = await axios.post('/randevu', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['randevular'] });
        },
    });

    // G\u00fcncelle
    const update = useMutation({
        mutationFn: async (data: Partial<Randevu>) => {
            const response = await axios.patch(`/randevu/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['randevu', id] });
            queryClient.invalidateQueries({ queryKey: ['randevular'] });
        },
    });

    // Sil
    const remove = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`/randevu/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['randevular'] });
        },
    });

    // \u0130\u015f Emrine D\u00f6n\u00fc\u015ft\u00fcr
    const convertToWorkOrder = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`/randevu/${id}/convert`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['randevu', id] });
            queryClient.invalidateQueries({ queryKey: ['randevular'] });
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
        },
    });

    return {
        create,
        update,
        remove,
        convertToWorkOrder,
    };
}
