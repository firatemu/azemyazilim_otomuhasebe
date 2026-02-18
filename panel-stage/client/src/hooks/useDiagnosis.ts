import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { Diagnosis } from '@/types/servis';

// 1. Teşhisleri Listele
export function useDiagnoses(workOrderId: string) {
    return useQuery({
        queryKey: ['diagnoses', workOrderId],
        queryFn: async () => {
            if (!workOrderId) return [];
            const response = await axios.get(`/is-emri/${workOrderId}/teshis`);
            return response.data as Diagnosis[];
        },
        enabled: !!workOrderId,
    });
}

// 2. Teşhis Mutasyonları
export function useDiagnosisMutation(workOrderId: string) {
    const queryClient = useQueryClient();

    const createDiagnosis = useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post(`/is-emri/${workOrderId}/teshis`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnoses', workOrderId] });
        },
    });

    const updateDiagnosis = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            // Controller path confusing? Base is is-emri/:workOrderId/teshis
            // If update is @Put(':id'), full path is /is-emri/:workOrderId/teshis/:id
            const response = await axios.put(`/is-emri/${workOrderId}/teshis/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnoses', workOrderId] });
        },
    });

    const deleteDiagnosis = useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.delete(`/is-emri/${workOrderId}/teshis/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnoses', workOrderId] });
        },
    });



    const sendForApproval = useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.post(`/is-emri/${workOrderId}/teshis/${id}/onaya-gonder`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnoses', workOrderId] });
        },
    });

    // Status update
    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const response = await axios.put(`/is-emri/${workOrderId}/teshis/${id}/durum`, { status });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnoses', workOrderId] });
        },
    });

    const startWork = useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.post(`/is-emri/${workOrderId}/teshis/${id}/ise-basla`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnoses', workOrderId] });
        },
    });

    const markAsCompleted = useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.post(`/is-emri/${workOrderId}/teshis/${id}/tamamla`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnoses', workOrderId] });
        },
    });

    const uploadImage = useMutation({
        mutationFn: async ({ id, file }: { id: string; file: File }) => {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axios.post(`/is-emri/${workOrderId}/teshis/${id}/fotograf`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnoses', workOrderId] });
        },
    });

    const deleteImage = useMutation({
        mutationFn: async (imageId: string) => {
            const response = await axios.delete(`/is-emri/${workOrderId}/teshis/foto/${imageId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnoses', workOrderId] });
        },
    });

    return {
        createDiagnosis,
        updateDiagnosis,
        deleteDiagnosis,
        sendForApproval,
        updateStatus,
        startWork,
        markAsCompleted,
        uploadImage,
        deleteImage,
    };
}
