/**
 * Atölye Modu — IndexedDB Şeması (Dexie.js)
 *
 * Offline-First PWA için yerel veritabanı tanımı.
 * Her tenant için izole bir DB instance kullanın.
 *
 * Güvenlik Notu: DB adına tenantId ekleyerek
 * çok kullanıcılı cihazlarda veri izolasyonu sağlanır.
 */
import Dexie, { Table } from 'dexie';

// ─────────────────────────────────────────────────
// Tipler
// ─────────────────────────────────────────────────

export interface LocalWorkOrder {
    id: string;
    tenantId: string;
    workOrderNo: string;
    status: string;
    data: Record<string, unknown>;
    /** Son sunucudan alındığı zaman (ms epoch) */
    fetchedAt: number;
    /** Offline'da değiştirildiyse true */
    isDirty: boolean;
}

export type OfflineActionType =
    | 'UPDATE_STATUS'
    | 'USE_PART'
    | 'ADD_LABOR'
    | 'ADD_PART_FROM_STOCK'
    | 'ASSIGN_TECHNICIAN'
    | 'ADD_NOTE';

export interface OfflineAction {
    /** Dexie auto-increment ID */
    id?: number;
    tenantId: string;
    workOrderId: string;
    type: OfflineActionType;
    payload: Record<string, unknown>;
    /** Action oluşturulma zamanı (ms epoch) */
    createdAt: number;
    synced: boolean;
    /** Sunucu cevabı: 409 Conflict olduysa true */
    hasConflict?: boolean;
    conflictData?: Record<string, unknown>;
    /** Kaç retry yapıldı */
    retryCount: number;
}

// ─────────────────────────────────────────────────
// Dexie DB Sınıfı
// ─────────────────────────────────────────────────

class AtölyeDB extends Dexie {
    workOrders!: Table<LocalWorkOrder, string>;
    offlineQueue!: Table<OfflineAction, number>;

    constructor(tenantId: string) {
        // Tenant izolasyonu: her tenant ayrı DB
        super(`atolye-db-${tenantId}`);

        this.version(1).stores({
            // workOrders: primary key = id, index: isDirty
            workOrders: 'id, tenantId, isDirty, status',
            // offlineQueue: auto-increment, index: synced, type
            offlineQueue: '++id, synced, tenantId, workOrderId, type',
        });
    }
}

// ─────────────────────────────────────────────────
// Singleton Map (tenant başına bir instance)
// ─────────────────────────────────────────────────

const dbInstances = new Map<string, AtölyeDB>();

export function getLocalDb(tenantId: string): AtölyeDB {
    if (!dbInstances.has(tenantId)) {
        dbInstances.set(tenantId, new AtölyeDB(tenantId));
    }
    return dbInstances.get(tenantId)!;
}
