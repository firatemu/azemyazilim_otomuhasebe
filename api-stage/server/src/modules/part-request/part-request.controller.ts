import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PartRequestService } from './part-request.service';
import { CreatePartRequestDto, SupplyPartRequestDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import { PartRequestStatus } from './dto/create-part-request.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@UseGuards(JwtAuthGuard)
@Controller('part-request')
export class PartRequestController {
  constructor(private readonly partRequestService: PartRequestService) { }

  @Post()
  create(
    @Body() dto: CreatePartRequestDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.partRequestService.create(dto, userId);
  }

  @Get()
  findAll(
    @Query('workOrderId') workOrderId?: string,
    @Query('status') status?: PartRequestStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('workOrderNo') workOrderNo?: string,
  ) {
    return this.partRequestService.findAll(
      workOrderId,
      status,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      workOrderNo,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partRequestService.findOne(id);
  }

  @Post(':id/supply')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PARTS_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WAREHOUSE, UserRole.PROCUREMENT, UserRole.WORKSHOP_MANAGER, UserRole.SERVICE_MANAGER)
  supply(
    @Param('id') id: string,
    @Body() dto: SupplyPartRequestDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.partRequestService.supply(id, dto, userId);
  }

  @Post(':id/mark-as-used')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECHNICIAN, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WORKSHOP_MANAGER)
  markAsUsed(@Param('id') id: string) {
    return this.partRequestService.markAsUsed(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.partRequestService.cancel(id);
  }
}
