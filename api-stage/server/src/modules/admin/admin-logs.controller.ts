import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('admin/logs')
@UseGuards(JwtAuthGuard)
export class AdminLogsController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async getLogs(
        @Query('page') page = '1',
        @Query('limit') limit = '50',
        @Query('action') action?: string,
        @Query('userId') userId?: string,
        @Query('resource') resource?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (action) where.action = { contains: action, mode: 'insensitive' };
        if (userId) where.userId = { contains: userId, mode: 'insensitive' };
        if (resource) where.resource = { contains: resource, mode: 'insensitive' };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [logs, total] = await Promise.all([
            this.prisma.extended.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
                include: {
                    tenant: {
                        select: { id: true, name: true },
                    },
                },
            }),
            this.prisma.extended.auditLog.count({ where }),
        ]);

        return {
            data: logs,
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
        };
    }

    @Get('stats')
    async getStats() {
        const [total, last24h, byAction] = await Promise.all([
            this.prisma.extended.auditLog.count(),
            this.prisma.extended.auditLog.count({
                where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
            }),
            this.prisma.extended.auditLog.groupBy({
                by: ['action'],
                _count: { action: true },
                orderBy: { _count: { action: 'desc' } },
                take: 10,
            }),
        ]);

        return { total, last24h, byAction };
    }
}
