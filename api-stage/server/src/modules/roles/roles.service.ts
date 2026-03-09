import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
    private readonly logger = new Logger(RolesService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly permissionsService: PermissionsService,
    ) { }

    async create(tenantId: string, dto: CreateRoleDto) {
        // Check if role name exists in tenant
        const existing = await this.prisma.extended.role.findUnique({
            where: {
                tenantId_name: {
                    tenantId,
                    name: dto.name,
                },
            },
        });

        if (existing) {
            throw new BadRequestException('Role with this name already exists in tenant');
        }

        // Prepare role permissions
        const permissionsData = dto.permissions?.map((permId) => ({
            permissionId: permId,
        })) || [];

        return this.prisma.extended.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                tenantId,
                permissions: {
                    create: permissionsData,
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: { users: true },
                },
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.extended.role.findMany({
            where: { tenantId },
            include: {
                _count: {
                    select: { users: true },
                },
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const role = await this.prisma.extended.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        if (!role || role.tenantId !== tenantId) {
            throw new NotFoundException('Role not found');
        }

        return role;
    }

    // Use standard UpdateRoleDto
    async update(tenantId: string, id: string, dto: any) { // Using any for now to match DTO import flexibility
        const role = await this.findOne(tenantId, id);

        if (role.isSystemRole) {
            // Allow updating description maybe? But strict enterprise rule says no.
            // Architecture says System Roles are immutable.
            throw new BadRequestException('Cannot modify system roles');
        }

        // Transaction to update role and permissions
        const updatedRole = await this.prisma.extended.$transaction(async (tx) => {
            // 1. Update basic fields
            const updated = await tx.role.update({
                where: { id },
                data: {
                    name: dto.name,
                    description: dto.description,
                },
            });

            // 2. Update permissions if provided
            if (dto.permissions) {
                // Delete existing
                await tx.rolePermission.deleteMany({
                    where: { roleId: id },
                });

                // Create new
                if (dto.permissions.length > 0) {
                    await tx.rolePermission.createMany({
                        data: dto.permissions.map((permId: string) => ({
                            roleId: id,
                            permissionId: permId,
                        })),
                    });
                }
            }

            return updated;
        });

        // 3. Invalidate Cache
        await this.permissionsService.invalidateRoleCache(id);

        return this.findOne(tenantId, id);
    }

    async remove(tenantId: string, id: string) {
        const role = await this.findOne(tenantId, id); // Checks existence and tenant

        if (role.isSystemRole) {
            throw new BadRequestException('Cannot delete system roles');
        }

        const userCount = await this.prisma.extended.user.count({
            where: { roleId: id },
        });

        if (userCount > 0) {
            throw new BadRequestException(`Cannot delete role assigned to ${userCount} users`);
        }

        await this.prisma.extended.role.delete({
            where: { id },
        });

        return { success: true };
    }

    async getAllPermissions() {
        return this.prisma.extended.permission.findMany({
            orderBy: [
                { module: 'asc' },
                { action: 'asc' },
            ],
        });
    }
}
