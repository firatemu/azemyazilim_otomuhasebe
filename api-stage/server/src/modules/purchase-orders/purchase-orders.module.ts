import { Module, forwardRef } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { PurchaseWaybillModule } from '../purchase-waybill/purchase-waybill.module';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { PrismaModule } from '../../common/prisma.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    forwardRef(() => PurchaseWaybillModule),
    CodeTemplateModule,
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule { }
