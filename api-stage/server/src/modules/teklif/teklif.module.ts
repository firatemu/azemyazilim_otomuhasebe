import { Module } from '@nestjs/common';
import { TeklifController } from './teklif.controller';
import { TeklifService } from './teklif.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [TeklifController],
  providers: [TeklifService],
  exports: [TeklifService],
})
export class TeklifModule {}
