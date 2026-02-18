import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @RequirePermissions({ module: 'roles', action: 'create' })
    create(@TenantId() tenantId: string, @Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(tenantId, createRoleDto);
    }

    @Get()
    @RequirePermissions({ module: 'roles', action: 'list' })
    findAll(@TenantId() tenantId: string) {
        return this.rolesService.findAll(tenantId);
    }

    @Get('permissions') // Note: Placed before :id to avoid conflict
    // Specific permission for viewing available permissions might be needed, 
    // but usually part of role management. Let's use roles.view or roles.create/update context.
    // Actually, any authenticated user might need this if they are editing roles.
    @RequirePermissions({ module: 'roles', action: 'view' })
    getAllPermissions() {
        return this.rolesService.getAllPermissions();
    }

    @Get(':id')
    @RequirePermissions({ module: 'roles', action: 'view' })
    findOne(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.rolesService.findOne(tenantId, id);
    }

    @Put(':id')
    @RequirePermissions({ module: 'roles', action: 'update' })
    update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ) {
        return this.rolesService.update(tenantId, id, updateRoleDto);
    }

    @Delete(':id')
    @RequirePermissions({ module: 'roles', action: 'delete' })
    remove(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.rolesService.remove(tenantId, id);
    }
}
