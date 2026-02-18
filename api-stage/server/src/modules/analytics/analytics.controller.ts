import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardMetrics() {
    return this.analyticsService.getDashboardMetrics();
  }

  @Get('revenue')
  getRevenue(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.analyticsService.getRevenueOverTime(start, end);
  }

  @Get('users-growth')
  getUserGrowth(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.analyticsService.getUserGrowth(start, end);
  }

  @Get('churn')
  getChurnAnalysis() {
    return this.analyticsService.getChurnAnalysis();
  }

  @Get('subscriptions/distribution')
  getSubscriptionDistribution() {
    return this.analyticsService.getSubscriptionDistribution();
  }

  @Get('plans/distribution')
  getPlanDistribution() {
    return this.analyticsService.getPlanDistribution();
  }

  @Get('payments/recent')
  getRecentPayments(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getRecentPayments(limitNum);
  }
}

