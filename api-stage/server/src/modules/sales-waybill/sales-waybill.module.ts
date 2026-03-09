import { Module } from '@nestjs/common';
import { SalesWaybillService } from './sales-waybill.service';
import { SalesWaybillController } from './sales-waybill.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CodeTemplateModule } from '../code-template/code-template.module';

@Module({
  imports: [PrismaModule, TenantContextModule, CodeTemplateModule],
  controllers: [SalesWaybillController],
  providers: [SalesWaybillService],
  exports: [SalesWaybillService],
})
export class SalesWaybillModule {}
