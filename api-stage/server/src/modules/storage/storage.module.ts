import { Module } from '@nestjs/common';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { MinIOStorageProvider } from './providers/minio-storage.provider';

import { TenantContextModule } from '../../common/services/tenant-context.module';
import { TenantContextService } from '../../common/services/tenant-context.service';

const storageProvider = {
    provide: 'STORAGE_SERVICE',
    useFactory: (tenantContext: TenantContextService) => {
        const driver = process.env.STORAGE_DRIVER || 'local';

        if (driver === 'minio') {
            return new MinIOStorageProvider(tenantContext);
        }

        return new LocalStorageProvider();
    },
    inject: [TenantContextService],
};

@Module({
    imports: [TenantContextModule],
    providers: [storageProvider, LocalStorageProvider, MinIOStorageProvider],
    exports: ['STORAGE_SERVICE'],
})
export class StorageModule { }
