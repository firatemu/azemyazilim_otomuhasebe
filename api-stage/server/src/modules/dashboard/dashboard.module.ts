import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { KpiService } from './kpi.service';
import { PrismaModule } from '@/common/prisma.module';
import { SseModule } from '@/common/sse/sse.module';
import { RedisModule } from '@/common/services/redis.module';

@Module({
    imports: [PrismaModule, SseModule, RedisModule],
    controllers: [DashboardController],
    providers: [KpiService],
    exports: [KpiService], // KpiService event listener'lar (invoice.service.ts vb.) tarafından kullanılacaktır
})
export class DashboardModule { }
