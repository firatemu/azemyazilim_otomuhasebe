import { Module } from '@nestjs/common';
import { SatınAlmaIrsaliyesiService } from './satin-alma-irsaliyesi.service';
import { SatınAlmaIrsaliyesiController } from './satin-alma-irsaliyesi.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CodeTemplateModule } from '../code-template/code-template.module';

@Module({
  imports: [PrismaModule, TenantContextModule, CodeTemplateModule],
  controllers: [SatınAlmaIrsaliyesiController],
  providers: [SatınAlmaIrsaliyesiService],
  exports: [SatınAlmaIrsaliyesiService],
})
export class SatınAlmaIrsaliyesiModule {}

