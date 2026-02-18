import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface TimeTracking {
    id: string;
    startTime: string;
    endTime: string | null;
    duration: number | null;
    notes: string | null;
    technician?: {
        firstName: string;
        lastName: string;
    };
}

export const useTimeTracking = (workOrderId: string) => {
    const queryClient = useQueryClient();

    const { data: activeTracking, isLoading: isActiveLoading } = useQuery({
        queryKey: ['time-tracking', 'active', workOrderId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/work-orders/time-tracking/active/${workOrderId}`);
            return data as TimeTracking | null;
        },
        enabled: !!workOrderId,
    });

    const { data: logsData, isLoading: isLogsLoading } = useQuery({
        queryKey: ['time-tracking', 'logs', workOrderId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/work-orders/time-tracking/logs/${workOrderId}`);
            return data as { trackings: TimeTracking[]; totalMinutes: number };
        },
        enabled: !!workOrderId,
    });

    const startMutation = useMutation({
        mutationFn: async (notes?: string) => {
            const { data } = await axios.post('/api/work-orders/time-tracking/start', {
                workOrderId,
                notes,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-tracking'] });
        },
    });

    const stopMutation = useMutation({
        mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
            const { data } = await axios.post(`/api/work-orders/time-tracking/${id}/stop`, {
                notes,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-tracking'] });
        },
    });

    return {
        activeTracking,
        logsData,
        isActiveLoading,
        isLogsLoading,
        startTracking: (notes?: string) => startMutation.mutateAsync(notes),
        isStarting: startMutation.isPending,
        stopTracking: (args: { id: string; notes?: string }) => stopMutation.mutateAsync(args),
        isStopping: stopMutation.isPending,
    };
};
