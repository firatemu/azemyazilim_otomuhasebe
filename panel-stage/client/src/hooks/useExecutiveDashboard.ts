/**
 * useExecutiveDashboard — CEO Gerçek Zamanlı Dashboard Hook'u
 *
 * SSE bağlantısını yönetir:
 * - Exponential backoff ile otomatik yeniden bağlanma (max 30sn)
 * - Token tabanlı auth (query param)
 * - TanStack Query cache'e direkt yazar (re-fetch yok)
 * - Multi-tenant izole stream
 */
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

export type DashboardEventType =
    | 'KPI_UPDATE'
    | 'CASH_POSITION_UPDATE'
    | 'CAPACITY_UPDATE'
    | 'FATURA_OTOMATIK_OLUSTURULDU'
    | 'ALERT';

export interface DashboardEvent {
    type: DashboardEventType;
    data: Record<string, unknown>;
    tenantId: string;
    timestamp: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseExecutiveDashboardOptions {
    /** SSE dinlenecek tenant (zorunlu) */
    tenantId: string;
    /** Maksimum retry sayısı (default: 10) */
    maxRetries?: number;
    /** Özel event handler (opsiyonel — gerekli değilse TanStack Query cache'e otomatik yazar) */
    onEvent?: (event: DashboardEvent) => void;
}

export function useExecutiveDashboard({
    tenantId,
    maxRetries = 10,
    onEvent,
}: UseExecutiveDashboardOptions) {
    const queryClient = useQueryClient();
    const esRef = useRef<EventSource | null>(null);
    const retryCountRef = useRef(0);
    const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>('connecting');

    const handleEvent = useCallback(
        (event: DashboardEvent) => {
            // Özel handler varsa çağır
            onEvent?.(event);

            // TanStack Query cache'e direkt yaz (re-render sadece değişen KPI bileşenlerinde)
            switch (event.type) {
                case 'KPI_UPDATE':
                    queryClient.setQueryData(['dashboard-kpis', tenantId], (old: any) => ({
                        ...(old ?? {}),
                        ...event.data,
                        _updatedAt: event.timestamp,
                    }));
                    break;
                case 'CASH_POSITION_UPDATE':
                    queryClient.setQueryData(['cash-position', tenantId], event.data);
                    break;
                case 'CAPACITY_UPDATE':
                    queryClient.setQueryData(['service-capacity', tenantId], event.data);
                    break;
                case 'FATURA_OTOMATIK_OLUSTURULDU':
                    // Fatura listesini invalidate et
                    queryClient.invalidateQueries({ queryKey: ['faturalar', tenantId] });
                    break;
                case 'ALERT':
                    // Alert event'leri loglanır, ilerleyen sprintlerde bildirime dönüştürülecek
                    console.warn('[Dashboard] ALERT alındı:', event.data);
                    break;
            }
        },
        [queryClient, tenantId, onEvent]
    );

    const connect = useCallback(() => {
        // Önceki bağlantıyı kapat
        esRef.current?.close();
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);

        setStatus('connecting');

        // Auth token'ı query param olarak ekle (EventSource header desteklemez)
        const token = typeof window !== 'undefined'
            ? localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken')
            : null;

        const url = token
            ? `/api/events/${tenantId}/notifications?token=${encodeURIComponent(token)}`
            : `/api/events/${tenantId}/notifications`;

        const es = new EventSource(url);
        esRef.current = es;

        es.onopen = () => {
            retryCountRef.current = 0;
            setStatus('connected');
            console.info(`[ExecutiveDashboard] SSE bağlandı: tenant=${tenantId}`);
        };

        es.onmessage = (e: MessageEvent) => {
            try {
                const event: DashboardEvent = JSON.parse(e.data);
                handleEvent(event);
            } catch (err) {
                console.error('[ExecutiveDashboard] Event parse hatası:', err);
            }
        };

        es.onerror = () => {
            es.close();
            setStatus('disconnected');

            if (retryCountRef.current >= maxRetries) {
                console.error('[ExecutiveDashboard] Max retry aşıldı, bağlantı kesildi.');
                setStatus('error');
                return;
            }

            // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
            const delay = Math.min(1000 * 2 ** retryCountRef.current, 30000);
            retryCountRef.current++;
            console.warn(
                `[ExecutiveDashboard] Bağlantı kesildi, ${delay / 1000}s sonra yeniden deneniyor (${retryCountRef.current}/${maxRetries})`
            );
            retryTimerRef.current = setTimeout(connect, delay);
        };
    }, [tenantId, maxRetries, handleEvent]);

    useEffect(() => {
        if (!tenantId) return;
        connect();

        return () => {
            esRef.current?.close();
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        };
    }, [connect, tenantId]);

    return {
        /** SSE bağlantı durumu */
        status,
        /** El ile yeniden bağlan */
        reconnect: connect,
    };
}
