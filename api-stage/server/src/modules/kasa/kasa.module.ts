import { Module, forwardRef } from '@nestjs/common';
import { KasaService } from './kasa.service';
import { KasaController } from './kasa.controller';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { SystemParameterModule } from '../system-parameter/system-parameter.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [
    forwardRef(() => CodeTemplateModule),
    SystemParameterModule,
    TenantContextModule,
  ],
  controllers: [KasaController],
  providers: [KasaService],
  exports: [KasaService],
})
export class KasaModule { }
