import { PrismaModule } from '../../common/prisma.module';
import { Module } from '@nestjs/common';
import { UnitSetService } from './unit-set.service';
import { UnitSetController } from './unit-set.controller';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [
    PrismaModule,TenantContextModule],
    controllers: [UnitSetController],
    providers: [UnitSetService],
    exports: [UnitSetService],
})
export class UnitSetModule { }
