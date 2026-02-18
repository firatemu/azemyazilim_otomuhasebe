import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface ServiceReportQuery {
    startDate?: string;
    endDate?: string;
    preset?: string;
}

export const useServiceReports = (query: ServiceReportQuery) => {
    const params = new URLSearchParams();
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.preset) params.append('preset', query.preset);

    const queryString = params.toString();

    const serviceOverview = useQuery({
        queryKey: ['reports', 'service-overview', queryString],
        queryFn: async () => {
            const { data } = await axios.get(`/api/raporlama/service-overview?${queryString}`);
            return data;
        },
    });

    const technicianPerformance = useQuery({
        queryKey: ['reports', 'service-performance', queryString],
        queryFn: async () => {
            const { data } = await axios.get(`/api/raporlama/service-performance?${queryString}`);
            return data;
        },
    });

    const diagnosisStats = useQuery({
        queryKey: ['reports', 'diagnosis-stats', queryString],
        queryFn: async () => {
            const { data } = await axios.get(`/api/raporlama/diagnosis-stats?${queryString}`);
            return data;
        },
    });

    return {
        serviceOverview,
        technicianPerformance,
        diagnosisStats,
    };
};
