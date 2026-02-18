import { Global, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PrismaModule } from '../../common/prisma.module';
import { RedisModule } from '../../common/services/redis.module';

@Global()
@Module({
    imports: [PrismaModule, RedisModule],
    providers: [PermissionsService],
    exports: [PermissionsService],
})
export class PermissionsModule { }
