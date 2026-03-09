import { Module } from '@nestjs/common';
import { SimpleOrderService } from './simple-order.service';
import { SimpleOrderController } from './simple-order.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [SimpleOrderController],
  providers: [SimpleOrderService],
  exports: [SimpleOrderService],
})
export class SimpleOrderModule {}
