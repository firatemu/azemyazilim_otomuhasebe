import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @RequirePermissions({ module: 'users', action: 'list' })
  findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.usersService.findAll(
      search,
      limit ? parseInt(limit) : 100,
      page ? parseInt(page) : 1,
    );
  }

  @Get('stats/summary')
  @RequirePermissions({ module: 'users', action: 'view' })
  async getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @RequirePermissions({ module: 'users', action: 'view' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post(':id/suspend')
  @RequirePermissions({ module: 'users', action: 'update' })
  async suspend(@Param('id') id: string) {
    return this.usersService.suspend(id);
  }

  @Put(':id/role')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  @RequirePermissions({ module: 'roles', action: 'update' }) // Specific permission for role management
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, dto.role);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'users', action: 'delete' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }
}

