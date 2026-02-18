import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClsService {
    private static readonly storage = new AsyncLocalStorage<Map<string, any>>();

    static run<T>(fn: () => T): T {
        return this.storage.run(new Map(), fn);
    }

    static get<T>(key: string): T | undefined {
        const store = this.storage.getStore();
        return store?.get(key);
    }

    static set(key: string, value: any) {
        const store = this.storage.getStore();
        store?.set(key, value);
    }

    static getTenantId(): string | undefined {
        return this.get('tenantId');
    }

    static setTenantId(tenantId: string) {
        this.set('tenantId', tenantId);
    }
}
