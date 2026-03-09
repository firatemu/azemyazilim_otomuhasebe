import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  ChangeStatusWorkOrderDto,
  ChangeVehicleWorkflowDto,
  SendForApprovalDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { WorkOrderStatus, PartWorkflowStatus } from './work-order.enums';

@UseGuards(JwtAuthGuard)
@Controller('work-order')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WORKSHOP_MANAGER, UserRole.SERVICE_MANAGER, UserRole.RECEPTION)
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(dto);
  }

  @Get('assignment-users')
  getAssignmentUsers() {
    return this.workOrderService.getAssignmentUsers();
  }

  @Get('stats')
  getStats() {
    return this.workOrderService.getStats();
  }

  @Get('for-parts-management')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PARTS_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WAREHOUSE, UserRole.PROCUREMENT, UserRole.WORKSHOP_MANAGER, UserRole.SERVICE_MANAGER, UserRole.RECEPTION)
  findForPartsManagement(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('partWorkflowStatus') partWorkflowStatus?: PartWorkflowStatus,
  ) {
    return this.workOrderService.findForPartsManagement(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      search,
      partWorkflowStatus,
    );
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: WorkOrderStatus,
    @Query('accountId') accountId?: string,
    @Query('createdAtFrom') createdAtFrom?: string,
    @Query('createdAtTo') createdAtTo?: string,
    @Query('customerVehicleId') customerVehicleId?: string,
    @Query('readyForInvoice') readyForInvoice?: string,
  ) {
    return this.workOrderService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      search,
      status,
      customerId: accountId,
      startDate: createdAtFrom ? new Date(createdAtFrom) : undefined,
      endDate: createdAtTo ? new Date(createdAtTo) : undefined,
      vehicleId: customerVehicleId,
      readyForInvoice: readyForInvoice === 'true',
    });
  }

  @Get(':id/activities')
  getActivities(@Param('id') id: string) {
    return this.workOrderService.getActivities(id);
  }

  @Post(':id/send-for-approval')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WORKSHOP_MANAGER, UserRole.SERVICE_MANAGER, UserRole.RECEPTION, UserRole.TECHNICIAN)
  sendForApproval(
    @Param('id') id: string,
    @Body() dto: SendForApprovalDto,
    @GetCurrentUser('userId') userId?: string,
  ) {
    return this.workOrderService.sendForApproval(id, dto, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrderService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WORKSHOP_MANAGER, UserRole.SERVICE_MANAGER, UserRole.RECEPTION)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @GetCurrentUser('userId') userId?: string,
  ) {
    return this.workOrderService.update(id, dto, userId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WORKSHOP_MANAGER, UserRole.SERVICE_MANAGER, UserRole.RECEPTION)
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusWorkOrderDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.workOrderService.changeStatus(id, dto.status, userId);
  }

  @Patch(':id/vehicle-workflow')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WORKSHOP_MANAGER, UserRole.SERVICE_MANAGER, UserRole.RECEPTION, UserRole.TECHNICIAN)
  changeVehicleWorkflow(
    @Param('id') id: string,
    @Body() dto: ChangeVehicleWorkflowDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.workOrderService.changeVehicleWorkflowStatus(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workOrderService.remove(id);
  }
}
