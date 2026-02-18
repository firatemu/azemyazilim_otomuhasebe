import { Module, forwardRef } from '@nestjs/common';
import { SiparisController } from './siparis.controller';
import { SiparisService } from './siparis.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { SatisIrsaliyesiModule } from '../satis-irsaliyesi/satis-irsaliyesi.module';
import { CodeTemplateModule } from '../code-template/code-template.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    forwardRef(() => SatisIrsaliyesiModule),
    CodeTemplateModule,
  ],
  controllers: [SiparisController],
  providers: [SiparisService],
  exports: [SiparisService],
})
export class SiparisModule {}
