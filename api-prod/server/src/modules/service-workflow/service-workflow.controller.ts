import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { TechnicalDiagnosisService } from './services/technical-diagnosis.service';
import { SolutionPackageService } from './services/solution-package.service';
import { ManagerApprovalService } from './services/manager-approval.service';
import {
  CreateTechnicalFindingDto,
  UpdateTechnicalFindingDto,
  CreateDiagnosticNoteDto,
  CreateSolutionPackageDto,
  UpdateSolutionPackageDto,
  AddPackagePartDto,
  UpdatePackagePartDto,
  ApproveWorkOrderDto,
  RejectWorkOrderDto,
} from './dto';

@UseGuards(JwtAuthGuard)
@Controller('service-workflow')
export class ServiceWorkflowController {
  constructor(
    private technicalDiagnosisService: TechnicalDiagnosisService,
    private solutionPackageService: SolutionPackageService,
    private managerApprovalService: ManagerApprovalService,
    private tenantContext: TenantContextService,
  ) {}

  private getUserInfo(req: any) {
    const user = req.user;
    return {
      userId: user?.id || user?.sub || user?.userId,
      userRole: user?.role || 'USER',
      tenantId: this.tenantContext.getTenantId() || req.tenantId,
    };
  }

  // ============= TECHNICAL FINDINGS =============

  @Post('technical-findings')
  async createFinding(@Body() dto: CreateTechnicalFindingDto, @Req() req: any) {
    const { userId, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.technicalDiagnosisService.createFinding(dto, userId, tenantId || '');
  }

  @Put('technical-findings/:id')
  async updateFinding(
    @Param('id') id: string,
    @Body() dto: UpdateTechnicalFindingDto,
    @Req() req: any,
  ) {
    const { userId, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.technicalDiagnosisService.updateFinding(id, dto, userId, tenantId || '');
  }

  @Get('work-orders/:workOrderId/technical-findings')
  async getFindingsByWorkOrder(@Param('workOrderId') workOrderId: string, @Req() req: any) {
    const { tenantId } = this.getUserInfo(req);
    return this.technicalDiagnosisService.getFindingsByWorkOrder(workOrderId, tenantId || '');
  }

  // ============= DIAGNOSTIC NOTES =============

  @Post('diagnostic-notes')
  async createNote(@Body() dto: CreateDiagnosticNoteDto, @Req() req: any) {
    const { userId, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.technicalDiagnosisService.createNote(dto, userId, tenantId || '');
  }

  @Get('work-orders/:workOrderId/diagnostic-notes')
  async getNotesByWorkOrder(@Param('workOrderId') workOrderId: string, @Req() req: any) {
    const { tenantId } = this.getUserInfo(req);
    return this.technicalDiagnosisService.getNotesByWorkOrder(workOrderId, tenantId || '');
  }

  // ============= SOLUTION PACKAGES =============

  @Post('solution-packages')
  async createPackage(@Body() dto: CreateSolutionPackageDto, @Req() req: any) {
    const { userId, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.solutionPackageService.createPackage(dto, userId, tenantId || '');
  }

  @Put('solution-packages/:id')
  async updatePackage(
    @Param('id') id: string,
    @Body() dto: UpdateSolutionPackageDto,
    @Req() req: any,
  ) {
    const { userId, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.solutionPackageService.updatePackage(id, dto, userId, tenantId || '');
  }

  @Delete('solution-packages/:id')
  async deletePackage(@Param('id') id: string, @Req() req: any) {
    const { userId, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.solutionPackageService.deletePackage(id, userId, tenantId || '');
  }

  @Get('work-orders/:workOrderId/solution-packages')
  async getPackagesByWorkOrder(@Param('workOrderId') workOrderId: string, @Req() req: any) {
    const { tenantId } = this.getUserInfo(req);
    return this.solutionPackageService.getPackagesByWorkOrder(workOrderId, tenantId || '');
  }

  @Get('solution-packages/:id')
  async getPackageWithParts(@Param('id') id: string, @Req() req: any) {
    const { tenantId } = this.getUserInfo(req);
    return this.solutionPackageService.getPackageWithParts(id, tenantId || '');
  }

  @Post('solution-packages/:packageId/parts')
  async addPart(
    @Param('packageId') packageId: string,
    @Body() dto: AddPackagePartDto,
    @Req() req: any,
  ) {
    const { userId, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.solutionPackageService.addPart(packageId, dto, userId, tenantId || '');
  }

  @Put('solution-packages/parts/:partId')
  async updatePart(
    @Param('partId') partId: string,
    @Body() dto: UpdatePackagePartDto,
    @Req() req: any,
  ) {
    const { userId, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.solutionPackageService.updatePart(partId, dto, userId, tenantId || '');
  }

  @Delete('solution-packages/parts/:partId')
  async removePart(@Param('partId') partId: string, @Req() req: any) {
    const { userId, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.solutionPackageService.removePart(partId, userId, tenantId || '');
  }

  // ============= MANAGER APPROVAL =============

  @Post('work-orders/:workOrderId/request-approval')
  async requestApproval(
    @Param('workOrderId') workOrderId: string,
    @Body() body: { solutionPackageId: string },
    @Req() req: any,
  ) {
    const { userId, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.managerApprovalService.requestApproval(
      workOrderId,
      body.solutionPackageId,
      userId,
      tenantId || '',
    );
  }

  @Post('work-orders/approve')
  async approveWorkOrder(@Body() dto: ApproveWorkOrderDto, @Req() req: any) {
    const { userId, userRole, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.managerApprovalService.approveWorkOrder(dto, userId, userRole, tenantId || '');
  }

  @Post('work-orders/reject')
  async rejectWorkOrder(@Body() dto: RejectWorkOrderDto, @Req() req: any) {
    const { userId, userRole, tenantId } = this.getUserInfo(req);
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.managerApprovalService.rejectWorkOrder(dto, userId, userRole, tenantId || '');
  }

  @Get('work-orders/:workOrderId/approval-status')
  async getApprovalStatus(@Param('workOrderId') workOrderId: string, @Req() req: any) {
    const { tenantId } = this.getUserInfo(req);
    return this.managerApprovalService.getApprovalStatus(workOrderId, tenantId || '');
  }
}

