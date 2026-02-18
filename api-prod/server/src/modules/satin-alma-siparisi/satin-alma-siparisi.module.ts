import { Module, forwardRef } from '@nestjs/common';
import { SatinAlmaSiparisiService } from './satin-alma-siparisi.service';
import { SatinAlmaSiparisiController } from './satin-alma-siparisi.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { SatınAlmaIrsaliyesiModule } from '../satin-alma-irsaliyesi/satin-alma-irsaliyesi.module';
import { CodeTemplateModule } from '../code-template/code-template.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    forwardRef(() => SatınAlmaIrsaliyesiModule),
    CodeTemplateModule,
  ],
  controllers: [SatinAlmaSiparisiController],
  providers: [SatinAlmaSiparisiService],
  exports: [SatinAlmaSiparisiService],
})
export class SatinAlmaSiparisiModule {}
