import { Module } from '@nestjs/common';
import { SatisIrsaliyesiService } from './satis-irsaliyesi.service';
import { SatisIrsaliyesiController } from './satis-irsaliyesi.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CodeTemplateModule } from '../code-template/code-template.module';

@Module({
  imports: [PrismaModule, TenantContextModule, CodeTemplateModule],
  controllers: [SatisIrsaliyesiController],
  providers: [SatisIrsaliyesiService],
  exports: [SatisIrsaliyesiService],
})
export class SatisIrsaliyesiModule {}
