import { Injectable, Inject, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import type { IStorageService } from '../storage/interfaces/storage-service.interface';

@Injectable()
export class TenantPurgeService {
    private readonly logger = new Logger(TenantPurgeService.name);

    constructor(
        private prisma: PrismaService,
        @Inject('STORAGE_SERVICE') private storage: IStorageService,
    ) { }

    async purgeTenantData(params: {
        tenantId: string;
        adminId: string;
        adminEmail: string;
        ipAddress: string;
    }): Promise<void> {
        const tenant = await this.prisma.extended.tenant.findUnique({
            where: { id: params.tenantId },
        });

        if (!tenant) {
            throw new Error('Tenant not found');
        }

        if (tenant.status === 'ACTIVE' || tenant.status === 'TRIAL') {
            throw new ForbiddenException(
                'Cannot purge active tenant. Cancel subscription first.',
            );
        }

        if (tenant.status === 'PURGED') {
            throw new ForbiddenException('Tenant already purged');
        }

        this.logger.warn(
            `⚠️ Starting tenant purge: ${params.tenantId} by ${params.adminEmail}`,
        );

        // 1. Delete all files from storage
        const result = await this.storage.purgeTenantData(params.tenantId);

        // 2. Update tenant status
        await this.prisma.extended.tenant.update({
            where: { id: params.tenantId },
            data: {
                status: 'PURGED',
                purgedAt: new Date(),
            },
        });

        // 3. Create audit log
        await this.prisma.extended.tenantPurgeAudit.create({
            data: {
                tenantId: params.tenantId,
                adminId: params.adminId,
                adminEmail: params.adminEmail,
                ipAddress: params.ipAddress,
                deletedFiles: result.deletedCount,
                errors: result.errors.length > 0 ? result.errors : undefined,
            },
        });

        this.logger.warn(
            `💥 Tenant ${params.tenantId} purged: ${result.deletedCount} files deleted`,
        );

        if (result.errors.length > 0) {
            this.logger.error(
                `Errors during purge: ${JSON.stringify(result.errors)}`,
            );
        }
    }

    async listPurgeableTenants() {
        return this.prisma.extended.tenant.findMany({
            where: {
                status: {
                    in: ['CANCELLED', 'SUSPENDED', 'EXPIRED'],
                },
            },
            select: {
                id: true,
                uuid: true,
                name: true,
                subdomain: true,
                status: true,
                cancelledAt: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                cancelledAt: 'asc',
            },
        });
    }

    async getPurgeAuditLog(tenantId?: string) {
        return this.prisma.extended.tenantPurgeAudit.findMany({
            where: tenantId ? { tenantId } : undefined,
            include: {
                tenant: {
                    select: {
                        name: true,
                        subdomain: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 100,
        });
    }
}
