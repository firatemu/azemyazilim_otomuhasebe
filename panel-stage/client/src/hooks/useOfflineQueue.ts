/**
 * useOfflineQueue — Offline-First İşlem Kuyruğu Hook'u
 *
 * Kullanım:
 *   const { enqueue, pendingCount, isSyncing } = useOfflineQueue();
 *   await enqueue('UPDATE_STATUS', { status: 'IN_PROGRESS' }, workOrderId);
 *
 * Davranış:
 *   - Online ise direkt API'ye gönderir
 *   - Offline ise IndexedDB kuyruğuna alır
 *   - Her render'da bekleyen action sayısını döner
 */
'use client';

import axiosInstance from '@/lib/axios';
import { getLocalDb, type OfflineAction, type OfflineActionType } from '@/lib/localDb';
import { flushOfflineQueue, registerNetworkListener } from '@/services/SyncService';
import { useCallback, useEffect, useState } from 'react';

// ─────────────────────────────────────────────────
// API gönderici — SyncService'ten kopyalanmamış,
// burada basit bir axios wrapper kullanılır.
// ─────────────────────────────────────────────────

async function sendDirectly(
    type: OfflineActionType,
    payload: Record<string, unknown>,
    workOrderId: string
): Promise<void> {
    switch (type) {
        case 'UPDATE_STATUS':
            await axiosInstance.put(`/work-orders/${workOrderId}/status`, payload);
            break;
        case 'USE_PART':
            await axiosInstance.put(
                `/work-orders/${workOrderId}/parts/${payload.lineId}/toggle-used`,
                payload
            );
            break;
        case 'ADD_LABOR':
            await axiosInstance.post(`/work-orders/${workOrderId}/labor`, payload);
            break;
        case 'ADD_PART_FROM_STOCK':
            await axiosInstance.post(`/work-orders/${workOrderId}/parts/from-stock`, payload);
            break;
        case 'ASSIGN_TECHNICIAN':
            await axiosInstance.put(`/work-orders/${workOrderId}/assign-technician`, payload);
            break;
        case 'ADD_NOTE':
            await axiosInstance.post(`/work-orders/${workOrderId}/notes`, payload);
            break;
    }
}

// ─────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────

export function useOfflineQueue(tenantId: string) {
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    const db = getLocalDb(tenantId);

    // Bekleyen action sayısını yenile
    const refreshCount = useCallback(async () => {
        const count = await db.offlineQueue
            .where({ synced: false, tenantId })
            .count();
        setPendingCount(count);
    }, [db, tenantId]);

    // Network listener kayıt
    useEffect(() => {
        registerNetworkListener(tenantId);
        refreshCount();

        const interval = setInterval(refreshCount, 10_000); // 10sn'de bir say
        return () => clearInterval(interval);
    }, [tenantId, refreshCount]);

    /**
     * Bir iş emri action'ını kuyruğa ekler veya direkt gönderir.
     */
    const enqueue = useCallback(
        async (
            type: OfflineActionType,
            payload: Record<string, unknown>,
            workOrderId: string
        ): Promise<{ queued: boolean }> => {
            // Online ise direkt göndermeyi dene
            if (navigator.onLine) {
                try {
                    await sendDirectly(type, payload, workOrderId);
                    return { queued: false };
                } catch (err: any) {
                    // Network hatası değilse (örn. 400 validation) kuyruğa alma
                    if (err?.code !== 'ERR_NETWORK' && err?.response?.status) {
                        throw err; // Gerçek API hatası, kullanıcıya göster
                    }
                    // Network hatası: kuyruğa al ve devam et
                }
            }

            // Offline ya da network hatası: IndexedDB kuyruğuna ekle
            const action: Omit<OfflineAction, 'id'> = {
                tenantId,
                workOrderId,
                type,
                payload,
                createdAt: Date.now(),
                synced: false,
                retryCount: 0,
            };

            await db.offlineQueue.add(action as OfflineAction);
            await refreshCount();
            return { queued: true };
        },
        [tenantId, db, refreshCount]
    );

    /**
     * El ile senkronizasyonu tetikle.
     */
    const syncNow = useCallback(async () => {
        if (!navigator.onLine) return;
        setIsSyncing(true);
        try {
            await flushOfflineQueue(tenantId);
            await refreshCount();
        } finally {
            setIsSyncing(false);
        }
    }, [tenantId, refreshCount]);

    return { enqueue, pendingCount, isSyncing, syncNow };
}
