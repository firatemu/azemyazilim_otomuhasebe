import { Module, forwardRef } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { SalesWaybillModule } from '../sales-waybill/sales-waybill.module';
import { CodeTemplateModule } from '../code-template/code-template.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    forwardRef(() => SalesWaybillModule),
    CodeTemplateModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule { }
