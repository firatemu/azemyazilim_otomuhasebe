import { Module } from '@nestjs/common';
import { SatisElemaniService } from './satis-elemani.service';
import { SatisElemaniController } from './satis-elemani.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [PrismaModule, TenantContextModule],
    controllers: [SatisElemaniController],
    providers: [SatisElemaniService],
    exports: [SatisElemaniService],
})
export class SatisElemaniModule { }
