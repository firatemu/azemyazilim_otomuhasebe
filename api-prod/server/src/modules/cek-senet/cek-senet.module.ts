import { Module } from '@nestjs/common';
import { CekSenetController } from './cek-senet.controller';
import { CekSenetService } from './cek-senet.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [CekSenetController],
  providers: [CekSenetService],
  exports: [CekSenetService],
})
export class CekSenetModule {}
