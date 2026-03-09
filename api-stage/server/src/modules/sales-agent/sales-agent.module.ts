import { Module } from '@nestjs/common';
import { SalesAgentService } from './sales-agent.service';
import { SalesAgentController } from './sales-agent.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [PrismaModule, TenantContextModule],
    controllers: [SalesAgentController],
    providers: [SalesAgentService],
    exports: [SalesAgentService],
})
export class SalesAgentModule { }
