import { Module, forwardRef } from '@nestjs/common';
import { KasaService } from './kasa.service';
import { KasaController } from './kasa.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CodeTemplateModule } from '../code-template/code-template.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    forwardRef(() => CodeTemplateModule),
  ],
  controllers: [KasaController],
  providers: [KasaService],
  exports: [KasaService],
})
export class KasaModule {}
