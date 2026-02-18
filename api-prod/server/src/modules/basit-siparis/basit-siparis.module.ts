import { Module } from '@nestjs/common';
import { BasitSiparisService } from './basit-siparis.service';
import { BasitSiparisController } from './basit-siparis.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [BasitSiparisController],
  providers: [BasitSiparisService],
  exports: [BasitSiparisService],
})
export class BasitSiparisModule {}
