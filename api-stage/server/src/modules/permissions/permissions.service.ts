import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/services/redis.service';

@Injectable()
export class PermissionsService {
    private readonly logger = new Logger(PermissionsService.name);
    private readonly CACHE_TTL_SECONDS = 900; // 15 minutes

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    /**
     * Checks if a user has a specific permission.
     * Caches the result in Redis.
     */
    async hasPermission(userId: string, permissionModule: string, permissionAction: string): Promise<boolean> {
        const cacheKey = `user_perms:${userId}`;

        // 1. Check Cache
        const cachedPermsStr = await this.redis.get(cacheKey);
        if (cachedPermsStr) {
            const cachedPerms = JSON.parse(cachedPermsStr) as string[];
            if (cachedPerms.includes('ALL')) return true; // SuperAdmin bypass
            return cachedPerms.includes(`${permissionModule}.${permissionAction}`);
        }

        // 2. Fetch from DB if not in cache
        const user = await this.prisma.extended.user.findUnique({
            where: { id: userId },
            include: {
                roleRelation: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) return false;

        // 3. Process Permissions
        let permissions: string[] = [];

        // SuperAdmin Bypass (Legacy check + New Role check)
        if (user.role === 'SUPER_ADMIN' || user.roleRelation?.isSystemRole && user.roleRelation?.name === 'Yönetici') {
            permissions = ['ALL'];
        } else if (user.roleRelation) {
            permissions = user.roleRelation.permissions.map(
                (rp) => `${rp.permission.module}.${rp.permission.action}`,
            );
        }

        // 4. Cache Results
        await this.redis.set(cacheKey, JSON.stringify(permissions), this.CACHE_TTL_SECONDS);

        // 5. Return Check Result
        if (permissions.includes('ALL')) return true;
        return permissions.includes(`${permissionModule}.${permissionAction}`);
    }

    /**
     * Invalidates the permission cache for a specific user.
     */
    async invalidateUserCache(userId: string): Promise<void> {
        await this.redis.del(`user_perms:${userId}`);
        this.logger.log(`Permission cache invalidated for user ${userId}`);
    }

    /**
     * Invalidates cache for all users with a specific role.
     * Use this when updating a role's permissions.
     */
    async invalidateRoleCache(roleId: string): Promise<void> {
        const users = await this.prisma.extended.user.findMany({
            where: { roleId },
            select: { id: true },
        });

        for (const user of users) {
            await this.invalidateUserCache(user.id);
        }
        this.logger.log(`Permission cache invalidated for role ${roleId} (${users.length} users)`);
    }
}
