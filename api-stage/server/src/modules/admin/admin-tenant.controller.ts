import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    UseGuards,
    Query,
    ForbiddenException,
} from '@nestjs/common';
import { TenantPurgeService } from './tenant-purge.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('admin/tenants')
@UseGuards(JwtAuthGuard)
export class AdminTenantController {
    constructor(private purgeService: TenantPurgeService) { }

    /**
     * List all tenants eligible for purging
     * Only SUPER_ADMIN can access
     */
    @Get('purgeable')
    async listPurgeable(@Req() request: any) {
        if (request.user.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Only super admins can access this endpoint');
        }
        return this.purgeService.listPurgeableTenants();
    }

    /**
     * Manually purge a tenant's data (IRREVERSIBLE)
     * Only SUPER_ADMIN can access
     * Requires tenant to be in CANCELLED/SUSPENDED/EXPIRED status
     */
    @Post('purge')
    async purgeTenant(
        @Body('tenantId') tenantId: string,
        @Req() request: any,
    ) {
        if (request.user.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Only super admins can purge tenants');
        }

        const admin = request.user;
        const ipAddress = request.ip || request.connection.remoteAddress;

        await this.purgeService.purgeTenantData({
            tenantId,
            adminId: admin.id,
            adminEmail: admin.email,
            ipAddress,
        });

        return {
            success: true,
            message: 'Tenant data purged successfully',
        };
    }

    /**
     * Get purge audit log
     * Only SUPER_ADMIN can access
     */
    @Get('purge-audit')
    async getPurgeAudit(
        @Query('tenantId') tenantId: string | undefined,
        @Req() request: any,
    ) {
        if (request.user.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Only super admins can view audit logs');
        }
        return this.purgeService.getPurgeAuditLog(tenantId);
    }
}
