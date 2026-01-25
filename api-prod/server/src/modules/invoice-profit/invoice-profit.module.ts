import { Module } from '@nestjs/common';
import { InvoiceProfitController } from './invoice-profit.controller';
import { InvoiceProfitService } from './invoice-profit.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [InvoiceProfitController],
  providers: [InvoiceProfitService],
  exports: [InvoiceProfitService],
})
export class InvoiceProfitModule {}
