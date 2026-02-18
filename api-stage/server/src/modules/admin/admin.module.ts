import { Module } from '@nestjs/common';
import { TenantPurgeService } from './tenant-purge.service';
import { AdminTenantController } from './admin-tenant.controller';
import { PrismaModule } from '../../common/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [AdminTenantController],
    providers: [TenantPurgeService],
    exports: [TenantPurgeService],
})
export class AdminModule { }
