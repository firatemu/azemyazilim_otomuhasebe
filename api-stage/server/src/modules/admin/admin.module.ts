import { Module } from '@nestjs/common';
import { TenantPurgeService } from './tenant-purge.service';
import { AdminTenantController } from './admin-tenant.controller';
import { AdminLogsController } from './admin-logs.controller';
import { PrismaModule } from '../../common/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [AdminTenantController, AdminLogsController],
    providers: [TenantPurgeService],
    exports: [TenantPurgeService],
})
export class AdminModule { }
