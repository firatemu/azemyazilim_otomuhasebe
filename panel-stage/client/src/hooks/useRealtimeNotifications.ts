'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface RealtimeEvent {
    type: string;
    timestamp: string;
    [key: string]: unknown;
}

export type EventHandler = (event: RealtimeEvent) => void;

/**
 * useRealtimeNotifications — SSE tabanlı anlık bildirim hook'u
 *
 * Backend'deki SseController'a bağlanır:
 *   GET /api/events/:tenantId/notifications (text/event-stream)
 *
 * Gelen eventler:
 *  - FATURA_OTOMATIK_OLUSTURULDU: İş emri faturası arka planda oluşturuldu
 *
 * MASTER_PROMPT: TanStack Query cache invalidation ile entegre.
 *
 * @param tenantId - Multi-tenant izolasyonu için zorunlu
 * @param onEvent - Özel event handler (opsiyonel)
 */
export function useRealtimeNotifications(
    tenantId: string | null | undefined,
    onEvent?: EventHandler,
) {
    const queryClient = useQueryClient();

    const handleEvent = useCallback(
        (event: RealtimeEvent) => {
            // Gelen event türüne göre ilgili React Query cache'ini invalidate et
            switch (event.type) {
                case 'FATURA_OTOMATIK_OLUSTURULDU': {
                    const { workOrderId, faturaId } = event as any;

                    // İş emri detayını güncelle (fatura bağlandı)
                    queryClient.invalidateQueries({
                        queryKey: ['work-order', workOrderId],
                    });
                    // Fatura listesini güncelle
                    queryClient.invalidateQueries({ queryKey: ['faturalar'] });

                    console.log(
                        `[SSE] Fatura otomatik oluşturuldu: ${faturaId} (WorkOrder: ${workOrderId})`,
                    );
                    break;
                }

                default:
                    break;
            }

            // Özel event handler varsa çağır (Snackbar, Toast vb. için)
            onEvent?.(event);
        },
        [queryClient, onEvent],
    );

    useEffect(() => {
        if (!tenantId) return;

        // API base URL
        const baseUrl =
            typeof window !== 'undefined'
                ? window.location.origin
                : process.env.NEXT_PUBLIC_API_URL ?? '';

        const token = typeof window !== 'undefined'
            ? localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken')
            : null;

        const url = token
            ? `${baseUrl}/api/events/${tenantId}/notifications?token=${encodeURIComponent(token)}`
            : `${baseUrl}/api/events/${tenantId}/notifications`;
        const eventSource = new EventSource(url);

        eventSource.onmessage = (e) => {
            try {
                const parsed = JSON.parse(e.data) as RealtimeEvent;
                handleEvent(parsed);
            } catch {
                console.warn('[SSE] Event parse hatası:', e.data);
            }
        };

        eventSource.onerror = (err) => {
            // SSE bağlantı hatası — tarayıcı otomatik yeniden bağlanmayı dener
            console.warn('[SSE] Bağlantı hatası, yeniden deneniyor...', err);
        };

        // Cleanup: Bileşen unmount edildiğinde bağlantıyı kapat
        return () => {
            eventSource.close();
        };
    }, [tenantId, handleEvent]);
}
