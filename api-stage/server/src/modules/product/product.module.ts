import { Module, forwardRef } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { WarehouseCriticalStockModule } from '../warehouse-critical-stock/warehouse-critical-stock.module';
import { DeletionProtectionModule } from '../../common/services/deletion-protection.module';

import { ProductExportService } from './product-export.service';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    DeletionProtectionModule,
    forwardRef(() => CodeTemplateModule),
    forwardRef(() => WarehouseCriticalStockModule),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductExportService],
  exports: [ProductService, ProductExportService],
})
export class ProductModule { }
