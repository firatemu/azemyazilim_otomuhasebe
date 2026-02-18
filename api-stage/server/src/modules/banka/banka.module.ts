import { Module } from '@nestjs/common';
import { BankaService } from './banka.service';
import { BankaController } from './banka.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [PrismaModule, TenantContextModule],
    controllers: [BankaController],
    providers: [BankaService],
    exports: [BankaService],
})
export class BankaModule { }
