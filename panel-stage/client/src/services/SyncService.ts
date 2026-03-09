/**
 * SyncService — Offline Kuyruk Senkronizasyon Motoru
 *
 * Uygulama online'a döndüğünde veya sayfa açıldığında
 * IndexedDB'deki bekleyen action'ları backend'e gönderir.
 *
 * Davranış:
 * - Sırayla (seri) gönderir: önceki action başarısız olursa durur
 * - 409 Conflict → kuyruğu işaretler, UI'a event fırlatır
 * - Kalıcı hata → retryCount artar, maxRetry'de abandone eder
 */

import axiosInstance from '@/lib/axios';
import { getLocalDb, type OfflineAction } from '@/lib/localDb';

// ─────────────────────────────────────────────────
// Sabitler
// ─────────────────────────────────────────────────

const MAX_RETRY = 3;

// ─────────────────────────────────────────────────
// Conflict Event Bus (basit CustomEvent tabanlı)
// ─────────────────────────────────────────────────

export function onWorkOrderConflict(
    handler: (data: { local: OfflineAction; server: Record<string, unknown> }) => void
) {
    const listener = (e: Event) => {
        handler((e as CustomEvent).detail);
    };
    window.addEventListener('workorder-conflict', listener);
    return () => window.removeEventListener('workorder-conflict', listener);
}

function emitConflict(data: {
    local: OfflineAction;
    server: Record<string, unknown>;
}) {
    window.dispatchEvent(new CustomEvent('workorder-conflict', { detail: data }));
}

// ─────────────────────────────────────────────────
// Action Endpoint Eşleme
// ─────────────────────────────────────────────────

async function sendAction(action: OfflineAction): Promise<void> {
    const { workOrderId, type, payload } = action;

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
            await axiosInstance.post(
                `/work-orders/${workOrderId}/parts/from-stock`,
                payload
            );
            break;
        case 'ASSIGN_TECHNICIAN':
            await axiosInstance.put(
                `/work-orders/${workOrderId}/assign-technician`,
                payload
            );
            break;
        case 'ADD_NOTE':
            await axiosInstance.post(
                `/work-orders/${workOrderId}/notes`,
                payload
            );
            break;
        default:
            throw new Error(`[SyncService] Bilinmeyen action tipi: ${type}`);
    }
}

// ─────────────────────────────────────────────────
// Ana flush metodu
// ─────────────────────────────────────────────────

let isSyncing = false;

export async function flushOfflineQueue(tenantId: string): Promise<{
    synced: number;
    failed: number;
    conflicts: number;
}> {
    if (isSyncing) return { synced: 0, failed: 0, conflicts: 0 };
    isSyncing = true;

    const db = getLocalDb(tenantId);
    const stats = { synced: 0, failed: 0, conflicts: 0 };

    try {
        const pending = await db.offlineQueue
            .where({ synced: false, tenantId })
            .sortBy('createdAt');

        for (const action of pending) {
            if ((action.retryCount ?? 0) >= MAX_RETRY) {
                stats.failed++;
                continue;
            }

            try {
                await sendAction(action);
                await db.offlineQueue.update(action.id!, { synced: true });
                stats.synced++;
            } catch (err: any) {
                const status = err?.response?.status;

                if (status === 409) {
                    // Conflict detected
                    const serverData = err.response.data?.serverWorkOrder ?? {};
                    await db.offlineQueue.update(action.id!, {
                        hasConflict: true,
                        conflictData: serverData,
                        retryCount: (action.retryCount ?? 0) + 1,
                    });
                    // Sunucudaki veriyi local DB'ye de güncelle
                    await db.workOrders.put({
                        id: action.workOrderId,
                        tenantId,
                        workOrderNo: serverData.workOrderNo ?? '',
                        status: serverData.status ?? '',
                        data: serverData,
                        fetchedAt: Date.now(),
                        isDirty: false,
                    });
                    emitConflict({ local: action, server: serverData });
                    stats.conflicts++;
                } else {
                    await db.offlineQueue.update(action.id!, {
                        retryCount: (action.retryCount ?? 0) + 1,
                    });
                    stats.failed++;
                    // Sıradaki action'ları beklet, sadece bu action'ı atla
                    console.warn('[SyncService] Action başarısız, bir sonrakine geçiliyor:', action.id, err);
                }
            }
        }
    } finally {
        isSyncing = false;
    }

    return stats;
}

// ─────────────────────────────────────────────────
// Network dinleyicisi — modül yüklenince kayıt
// ─────────────────────────────────────────────────

let registeredTenantId: string | null = null;

export function registerNetworkListener(tenantId: string) {
    if (registeredTenantId === tenantId) return;
    registeredTenantId = tenantId;

    const handleOnline = () => {
        console.log('[SyncService] Ağ bağlantısı aktif, kuyruk temizleniyor...');
        flushOfflineQueue(tenantId).then((stats) => {
            console.log('[SyncService] Sync tamamlandı:', stats);
        });
    };

    window.addEventListener('online', handleOnline);
}
