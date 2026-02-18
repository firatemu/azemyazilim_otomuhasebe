import { Module, forwardRef } from '@nestjs/common';
import { StokService } from './stok.service';
import { StokController } from './stok.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { WarehouseCriticalStockModule } from '../warehouse-critical-stock/warehouse-critical-stock.module';
import { DeletionProtectionModule } from '../../common/services/deletion-protection.module';

import { StokExportService } from './stok-export.service';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    DeletionProtectionModule,
    forwardRef(() => CodeTemplateModule),
    forwardRef(() => WarehouseCriticalStockModule),
  ],
  controllers: [StokController],
  providers: [StokService, StokExportService],
  exports: [StokService, StokExportService],
})
export class StokModule { }
