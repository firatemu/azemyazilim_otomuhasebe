import { Module } from '@nestjs/common';
import { InventoryCountController } from './inventory-count.controller';
import { InventoryCountService } from './inventory-count.service';
import { InventoryCountExportService } from './inventory-count-export.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [PrismaModule, TenantContextModule],
    controllers: [InventoryCountController],
    providers: [InventoryCountService, InventoryCountExportService],
    exports: [InventoryCountService],
})
export class InventoryCountModule { }
