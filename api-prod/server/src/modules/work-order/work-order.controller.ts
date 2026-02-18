import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { WorkOrderService } from './work-order.service';
import {
  CreateWorkOrderDto,
  AssignTechnicianDto,
  UpdateStatusDto,
  AddLaborLineDto,
  AddPartLineDto,
  AddPartFromStockDto,
  RequestPartSupplyDto,
  ApproveSupplyRequestDto,
  RejectSupplyRequestDto,
  MarkPartUsedDto,
  MarkAllPartsUsedDto,
  TogglePartUsedDto,
} from './dto';
import { WorkOrderStatus } from '@prisma/client';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) { }

  private getUserInfo(req: any) {
    const user = req.user;
    return {
      userId: user?.id || user?.sub,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers?.['user-agent'],
    };
  }

  // ============= CRUD ENDPOINTS =============

  @Post()
  async create(@Body() dto: CreateWorkOrderDto, @Req() req: any) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.createWorkOrder(dto, userId, ipAddress, userAgent);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('status') status?: WorkOrderStatus,
    @Query('technicianId') technicianId?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.workOrderService.findAll(
      page,
      limit,
      status,
      technicianId,
      vehicleId,
      customerId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workOrderService.findOne(id);
  }

  // ============= WORKFLOW ENDPOINTS =============

  @Put(':id/assign-technician')
  async assignTechnician(
    @Param('id') id: string,
    @Body() dto: AssignTechnicianDto,
    @Req() req: any,
  ) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.assignTechnician(id, dto, userId, ipAddress, userAgent);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Req() req: any,
  ) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.updateStatus(id, dto, userId, ipAddress, userAgent);
  }

  @Post(':id/labor-line')
  async addLaborLine(
    @Param('id') id: string,
    @Body() dto: AddLaborLineDto,
    @Req() req: any,
  ) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.addLaborLine(id, dto, userId, ipAddress, userAgent);
  }

  @Post(':id/part-line')
  async addPartLine(
    @Param('id') id: string,
    @Body() dto: AddPartLineDto,
    @Req() req: any,
  ) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.addPartLine(id, dto, userId, ipAddress, userAgent);
  }

  @Post(':id/parts/from-stock')
  async addPartFromStock(
    @Param('id') id: string,
    @Body() dto: AddPartFromStockDto,
    @Req() req: any,
  ) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.addPartFromStock(id, dto, userId, ipAddress, userAgent);
  }

  @Post(':id/parts/request-supply')
  async requestPartSupply(
    @Param('id') id: string,
    @Body() dto: RequestPartSupplyDto,
    @Req() req: any,
  ) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.requestPartSupply(id, dto, userId, ipAddress, userAgent);
  }


  @Get('supply-requests/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN')
  async getAllSupplyRequests(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('status') status?: any,
  ) {
    return this.workOrderService.getAllSupplyRequests(page, limit, status);
  }

  @Get(':id/supply-requests')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN')
  async getSupplyRequests(@Param('id') id: string) {
    return this.workOrderService.getSupplyRequests(id);
  }

  @Put(':id/supply-requests/:lineId/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN')
  async approveSupplyRequest(
    @Param('id') id: string,
    @Param('lineId') lineId: string,
    @Body() dto: ApproveSupplyRequestDto,
    @Req() req: any,
  ) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.approveSupplyRequest(id, lineId, dto, userId, ipAddress, userAgent);
  }

  @Put(':id/supply-requests/:lineId/reject')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN')
  async rejectSupplyRequest(
    @Param('id') id: string,
    @Param('lineId') lineId: string,
    @Body() dto: RejectSupplyRequestDto,
    @Req() req: any,
  ) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.rejectSupplyRequest(id, lineId, dto, userId, ipAddress, userAgent);
  }

  @Post(':id/request-approval')
  async requestApproval(@Param('id') id: string, @Req() req: any) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.requestApproval(id, userId, ipAddress, userAgent);
  }

  @Post(':id/approve')
  async approveWork(@Param('id') id: string, @Req() req: any) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.approveWork(id, userId, ipAddress, userAgent);
  }

  @Post(':id/close')
  async closeWorkOrder(@Param('id') id: string, @Req() req: any) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.closeWorkOrder(id, userId, ipAddress, userAgent);
  }

  // ============= PHASE 3: STOCK & INVOICE ENDPOINTS =============

  @Post(':id/mark-part-used')
  async markPartAsUsed(
    @Param('id') id: string,
    @Body() dto: MarkPartUsedDto,
    @Req() req: any,
  ) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.markPartAsUsed(
      id,
      dto.lineId,
      dto.warehouseId,
      dto.locationId,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Post(':id/mark-all-parts-used')
  async markAllPartsAsUsed(
    @Param('id') id: string,
    @Body() dto: MarkAllPartsUsedDto,
    @Req() req: any,
  ) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.markAllPartsAsUsed(
      id,
      dto.warehouseId,
      dto.locationId,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Put(':id/parts/:lineId/toggle-used')
  async togglePartUsed(
    @Param('id') id: string,
    @Param('lineId') lineId: string,
    @Req() req: any,
  ) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.togglePartUsed(id, lineId, userId, ipAddress, userAgent);
  }

  @Post(':id/generate-invoice')
  async generateInvoice(@Param('id') id: string, @Req() req: any) {
    const { userId, ipAddress, userAgent } = this.getUserInfo(req);
    return this.workOrderService.generateInvoice(id, userId, ipAddress, userAgent);
  }
}

