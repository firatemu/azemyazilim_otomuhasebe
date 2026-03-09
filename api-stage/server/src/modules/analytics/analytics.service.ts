import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics() {
    const [totalUsers, totalTenants, activeSubscriptions, totalRevenue] = await Promise.all([
      this.prisma.extended.user.count(),
      this.prisma.extended.tenant.count(),
      this.prisma.extended.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.extended.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      totalTenants,
      activeSubscriptions,
      totalRevenue: totalRevenue._sum?.amount || 0,
    };
  }

  async getRevenueOverTime(startDate: Date, endDate: Date) {
    const payments = await this.prisma.extended.payment.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const revenueByMonth = payments.reduce((acc, payment) => {
      const month = payment.createdAt.toISOString().substring(0, 7);
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += Number(payment.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }

  async getUserGrowth(startDate: Date, endDate: Date) {
    const users = await this.prisma.extended.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const growthByMonth = users.reduce((acc, user) => {
      const month = user.createdAt.toISOString().substring(0, 7);
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(growthByMonth).map(([month, count]) => ({
      month,
      count,
    }));
  }

  async getChurnAnalysis() {
    const cancelled = await this.prisma.extended.subscription.count({
      where: { status: 'CANCELED' },
    });

    const total = await this.prisma.extended.subscription.count();

    return {
      cancelled,
      total,
      churnRate: total > 0 ? (cancelled / total) * 100 : 0,
    };
  }

  async getSubscriptionDistribution() {
    const subscriptions = await this.prisma.extended.subscription.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return subscriptions.map((sub) => ({
      status: sub.status,
      count: sub._count.id,
    }));
  }

  async getPlanDistribution() {
    const subscriptions = await this.prisma.extended.subscription.groupBy({
      by: ['planId'],
      _count: {
        id: true,
      },
    });

    const planIds = subscriptions.map((s) => s.planId);
    const plans = await this.prisma.extended.plan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, name: true, slug: true },
    });

    return subscriptions.map((sub) => {
      const plan = plans.find((p) => p.id === sub.planId);
      return {
        planId: sub.planId,
        planName: plan?.name || 'Unknown',
        planSlug: plan?.slug || 'unknown',
        count: sub._count.id,
      };
    });
  }

  async getRecentPayments(limit: number = 10) {
    return this.prisma.extended.payment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          include: {
            tenant: {
              select: {
                name: true,
                subdomain: true,
              },
            },
            plan: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }
}

