import { Module } from '@nestjs/common';
import { SystemParameterController } from './system-parameter.controller';
import { SystemParameterService } from './system-parameter.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [SystemParameterController],
  providers: [SystemParameterService],
  exports: [SystemParameterService],
})
export class SystemParameterModule {}
