import { Module, forwardRef } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceExportService } from './invoice-export.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { TcmbService } from '../../common/services/tcmb.service';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { SalesWaybillModule } from '../sales-waybill/sales-waybill.module';
import { InvoiceProfitModule } from '../invoice-profit/invoice-profit.module';
import { CostingModule } from '../costing/costing.module';
import { SystemParameterModule } from '../system-parameter/system-parameter.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { DeletionProtectionModule } from '../../common/services/deletion-protection.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    CodeTemplateModule,
    forwardRef(() => SalesWaybillModule),
    InvoiceProfitModule,
    CostingModule,
    SystemParameterModule,
    WarehouseModule,
    DeletionProtectionModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceExportService, TcmbService],
  exports: [InvoiceService],
})
export class InvoiceModule { }