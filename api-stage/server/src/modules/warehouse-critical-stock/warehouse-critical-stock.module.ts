import { Module } from '@nestjs/common';
import { WarehouseCriticalStockController } from './warehouse-critical-stock.controller';
import { WarehouseCriticalStockService } from './warehouse-critical-stock.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [PrismaModule, TenantContextModule],
    controllers: [WarehouseCriticalStockController],
    providers: [WarehouseCriticalStockService],
    exports: [WarehouseCriticalStockService],
})
export class WarehouseCriticalStockModule { }
