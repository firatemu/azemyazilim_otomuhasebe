import { Module, forwardRef } from '@nestjs/common';
import { FaturaService } from './fatura.service';
import { FaturaController } from './fatura.controller';
import { FaturaExportService } from './fatura-export.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { TcmbService } from '../../common/services/tcmb.service';
import { HizliModule } from '../hizli/hizli.module';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { SatisIrsaliyesiModule } from '../satis-irsaliyesi/satis-irsaliyesi.module';
import { InvoiceProfitModule } from '../invoice-profit/invoice-profit.module';
import { CostingModule } from '../costing/costing.module';
import { SystemParameterModule } from '../system-parameter/system-parameter.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { DeletionProtectionModule } from '../../common/services/deletion-protection.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    HizliModule,
    CodeTemplateModule,
    forwardRef(() => SatisIrsaliyesiModule),
    InvoiceProfitModule,
    CostingModule,
    SystemParameterModule,
    WarehouseModule,
    DeletionProtectionModule,
  ],
  controllers: [FaturaController],
  providers: [FaturaService, FaturaExportService, TcmbService],
  exports: [FaturaService],
})
export class FaturaModule { }
