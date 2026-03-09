import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) { }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.WORKSHOP_MANAGER,
    UserRole.SERVICE_MANAGER,
    UserRole.RECEPTION,
  )
  findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.techniciansService.findAll(
      search,
      limit ? parseInt(limit) : 100,
      page ? parseInt(page) : 1,
    );
  }

  @Post()
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.WORKSHOP_MANAGER,
    UserRole.SERVICE_MANAGER,
    UserRole.RECEPTION,
  )
  create(@Body() dto: CreateTechnicianDto) {
    return this.techniciansService.create(dto);
  }
}
