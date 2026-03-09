import { Module } from '@nestjs/common';
import { RlsController } from './rls.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [RlsController],
})
export class RlsModule {}
