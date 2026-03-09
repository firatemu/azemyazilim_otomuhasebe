import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { KpiService } from './kpi.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantMiddleware } from '@/common/middleware/tenant.middleware';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly kpiService: KpiService) { }

    @Get('kpis/:tenantId')
    async getKpis(@Param('tenantId') tenantId: string) {
        // TenantMiddleware normalde x-tenant-id ile çalışır ancak burada doğrudan Param üzerinden O(1) okuma (veya hesaplama) sağlıyoruz.
        return this.kpiService.getKpis(tenantId);
    }

    @Get('cash-trend/:tenantId')
    async getCashTrend(@Param('tenantId') tenantId: string) {
        return this.kpiService.getCashTrend(tenantId);
    }
}
