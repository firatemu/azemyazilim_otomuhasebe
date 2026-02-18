import { Module } from '@nestjs/common';
import { MaasOdemeService } from './maas-odeme.service';
import { MaasOdemeController } from './maas-odeme.controller';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { SystemParameterModule } from '../system-parameter/system-parameter.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [SystemParameterModule, TenantContextModule],
    controllers: [MaasOdemeController],
    providers: [MaasOdemeService],
    exports: [MaasOdemeService],
})
export class MaasOdemeModule { }
