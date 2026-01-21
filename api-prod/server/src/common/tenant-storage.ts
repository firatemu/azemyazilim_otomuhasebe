import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
    tenantId?: string;
    userId?: string;
    userRole?: string;
    bypassTenant?: boolean;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();

export function getTenantContext(): TenantStore | undefined {
    return tenantStorage.getStore();
}

export function runInTenantContext(store: TenantStore, callback: () => any) {
    return tenantStorage.run(store, callback);
}
