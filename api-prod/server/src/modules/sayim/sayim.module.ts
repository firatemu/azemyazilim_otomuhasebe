import { Module } from '@nestjs/common';
import { SayimController } from './sayim.controller';
import { SayimService } from './sayim.service';
import { SayimExportService } from './sayim-export.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [SayimController],
  providers: [SayimService, SayimExportService],
  exports: [SayimService],
})
export class SayimModule {}
