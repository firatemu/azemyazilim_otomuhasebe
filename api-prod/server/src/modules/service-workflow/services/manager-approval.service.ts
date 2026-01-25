import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ServiceWorkStatus,
  UserRole,
  WorkOrderStatus,
} from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import { TenantContextService } from '../../../common/services/tenant-context.service';
import { TenantResolverService } from '../../../common/services/tenant-resolver.service';
import { buildTenantWhereClause, isStagingEnvironment } from '../../../common/utils/staging.util';
import {
  ApprovalStatusResponse,
  ApproveWorkOrderDto,
  RejectWorkOrderDto,
} from '../dto';

@Injectable()
export class ManagerApprovalService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
    private tenantResolver: TenantResolverService,
  ) {}

  private getUserIdOrThrow(): string {
    const userId = this.tenantContext.getUserId();
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return userId;
  }

  /**
   * WorkOrder bul ve doğrula
   */
  private async findWorkOrderOrThrow(
    workOrderId: string,
    tx: Prisma.TransactionClient,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const workOrder = await tx.workOrder.findFirst({
      where: {
        id: workOrderId,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        technicalFindings: {
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException('WorkOrder not found or tenant mismatch');
    }

    return workOrder;
  }

  /**
   * Role validation - MANAGER veya ADMIN gerekli
   */
  private validateManagerRole(userRole: string): void {
    const validRoles = [UserRole.MANAGER, UserRole.ADMIN, UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN];
    const roleUpper = userRole.toUpperCase();

    if (!validRoles.some(r => r.toString() === roleUpper || r === roleUpper)) {
      throw new ForbiddenException(
        'Only MANAGER or ADMIN roles can approve/reject work orders',
      );
    }
  }

  /**
   * Self-approval kontrolü - Technician kendi iş emrini onaylayamaz
   */
  private async validateNotSelfApproval(
    workOrderId: string,
    userId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    // İlk technical finding'i oluşturan kullanıcıyı bul
    const firstFinding = await tx.technicalFinding.findFirst({
      where: {
        workOrderId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (firstFinding && firstFinding.createdBy === userId) {
      throw new ForbiddenException(
        'Technicians cannot approve their own work orders',
      );
    }
  }

  /**
   * WorkOrderStatus'ü ServiceWorkStatus'e map et
   */
  private mapWorkOrderStatusToServiceWorkStatus(
    status: WorkOrderStatus,
  ): ServiceWorkStatus | null {
    const mapping: Record<WorkOrderStatus, ServiceWorkStatus | null> = {
      [WorkOrderStatus.ACCEPTED]: ServiceWorkStatus.SERVICE_ACCEPTED,
      [WorkOrderStatus.DIAGNOSIS]: ServiceWorkStatus.TECHNICAL_DIAGNOSIS,
      [WorkOrderStatus.WAITING_FOR_APPROVAL]:
        ServiceWorkStatus.WAITING_MANAGER_APPROVAL,
      [WorkOrderStatus.APPROVED]: ServiceWorkStatus.APPROVED,
      [WorkOrderStatus.PART_WAITING]: ServiceWorkStatus.PART_SUPPLY,
      [WorkOrderStatus.IN_PROGRESS]: ServiceWorkStatus.IN_PROGRESS,
      [WorkOrderStatus.QUALITY_CONTROL]: ServiceWorkStatus.QUALITY_CONTROL,
      [WorkOrderStatus.READY_FOR_DELIVERY]:
        ServiceWorkStatus.READY_FOR_BILLING,
      [WorkOrderStatus.INVOICED]: ServiceWorkStatus.INVOICED,
      [WorkOrderStatus.CLOSED]: ServiceWorkStatus.CLOSED,
      [WorkOrderStatus.CANCELLED]: ServiceWorkStatus.CANCELLED,
    };

    return mapping[status] || null;
  }

  /**
   * Request Approval - Move to WAITING_MANAGER_APPROVAL
   */
  async requestApproval(
    workOrderId: string,
    solutionPackageId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      // WorkOrder doğrula
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // SolutionPackage doğrula
      const packageWhere: any = { id: solutionPackageId, workOrderId };
      if (tenantId) {
        packageWhere.tenantId = tenantId;
      }

      const solutionPackage = await tx.solutionPackage.findFirst({
        where: packageWhere,
      });

      if (!solutionPackage) {
        throw new NotFoundException('Solution package not found');
      }

      // Status kontrolü - SOLUTION_PROPOSED durumunda olmalı
      if (workOrder.status !== WorkOrderStatus.DIAGNOSIS) {
        throw new BadRequestException(
          `WorkOrder must be in DIAGNOSIS status (SOLUTION_PROPOSED) to request approval. Current status: ${workOrder.status}`,
        );
      }

      // Durum güncelle
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: WorkOrderStatus.WAITING_FOR_APPROVAL,
        },
      });

      // History kaydı oluştur
      const tenantIdFinal = tenantId || workOrder.tenantId;
      await tx.workOrderStatusHistory.create({
        data: {
          tenantId: tenantIdFinal,
          workOrderId,
          fromStatus: ServiceWorkStatus.SOLUTION_PROPOSED,
          toStatus: ServiceWorkStatus.WAITING_MANAGER_APPROVAL,
          changedBy: userId,
          reason: 'Approval requested for solution package',
        },
      });
    });
  }

  /**
   * Approve WorkOrder
   */
  async approveWorkOrder(
    dto: ApproveWorkOrderDto,
    userId: string,
    userRole: string,
    tenantId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Role validation
      this.validateManagerRole(userRole);

      // WorkOrder doğrula
      const workOrder = await this.findWorkOrderOrThrow(dto.workOrderId, tx);

      // Status kontrolü - WAITING_MANAGER_APPROVAL olmalı
      if (workOrder.status !== WorkOrderStatus.WAITING_FOR_APPROVAL) {
        throw new BadRequestException(
          `WorkOrder must be in WAITING_FOR_APPROVAL status. Current status: ${workOrder.status}`,
        );
      }

      // Self-approval kontrolü
      await this.validateNotSelfApproval(dto.workOrderId, userId, tx);

      // SolutionPackage doğrula
      const packageWhere: any = {
        id: dto.solutionPackageId,
        workOrderId: dto.workOrderId,
      };
      if (tenantId) {
        packageWhere.tenantId = tenantId;
      }

      const solutionPackage = await tx.solutionPackage.findFirst({
        where: packageWhere,
      });

      if (!solutionPackage) {
        throw new NotFoundException('Solution package not found');
      }

      // Mevcut approval var mı kontrol et (soft-deleted olmayan)
      const existingApproval = await tx.managerApproval.findFirst({
        where: {
          workOrderId: dto.workOrderId,
          deletedAt: null,
        },
      });

      if (existingApproval) {
        throw new ConflictException(
          'An active approval already exists for this work order',
        );
      }

      // ManagerApproval oluştur
      const approval = await tx.managerApproval.create({
        data: {
          tenantId: tenantId || workOrder.tenantId,
          workOrderId: dto.workOrderId,
          solutionPackageId: dto.solutionPackageId,
          approvedBy: userId,
          approvalNote: dto.approvalNote,
        },
      });

      // WorkOrder durumunu APPROVED'e güncelle
      await tx.workOrder.update({
        where: { id: dto.workOrderId },
        data: {
          status: WorkOrderStatus.APPROVED,
          approvedAt: new Date(),
        },
      });

      // History kaydı oluştur
      const tenantIdFinal = tenantId || workOrder.tenantId;
      await tx.workOrderStatusHistory.create({
        data: {
          tenantId: tenantIdFinal,
          workOrderId: dto.workOrderId,
          fromStatus: ServiceWorkStatus.WAITING_MANAGER_APPROVAL,
          toStatus: ServiceWorkStatus.APPROVED,
          changedBy: userId,
          reason: dto.approvalNote || 'Work order approved by manager',
        },
      });

      return approval;
    });
  }

  /**
   * Reject WorkOrder
   */
  async rejectWorkOrder(
    dto: RejectWorkOrderDto,
    userId: string,
    userRole: string,
    tenantId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Role validation
      this.validateManagerRole(userRole);

      // WorkOrder doğrula
      const workOrder = await this.findWorkOrderOrThrow(dto.workOrderId, tx);

      // Status kontrolü - WAITING_MANAGER_APPROVAL olmalı
      if (workOrder.status !== WorkOrderStatus.WAITING_FOR_APPROVAL) {
        throw new BadRequestException(
          `WorkOrder must be in WAITING_FOR_APPROVAL status. Current status: ${workOrder.status}`,
        );
      }

      // SolutionPackage doğrula
      const packageWhere: any = {
        id: dto.solutionPackageId,
        workOrderId: dto.workOrderId,
      };
      if (tenantId) {
        packageWhere.tenantId = tenantId;
      }

      const solutionPackage = await tx.solutionPackage.findFirst({
        where: packageWhere,
      });

      if (!solutionPackage) {
        throw new NotFoundException('Solution package not found');
      }

      // ManagerRejection oluştur
      const rejection = await tx.managerRejection.create({
        data: {
          tenantId: tenantId || workOrder.tenantId,
          workOrderId: dto.workOrderId,
          solutionPackageId: dto.solutionPackageId,
          rejectedBy: userId,
          rejectionReason: dto.rejectionReason,
        },
      });

      // WorkOrder durumunu SOLUTION_PROPOSED'e geri al
      await tx.workOrder.update({
        where: { id: dto.workOrderId },
        data: {
          status: WorkOrderStatus.DIAGNOSIS, // SOLUTION_PROPOSED'in WorkOrderStatus karşılığı
        },
      });

      // History kaydı oluştur
      const tenantIdFinal = tenantId || workOrder.tenantId;
      await tx.workOrderStatusHistory.create({
        data: {
          tenantId: tenantIdFinal,
          workOrderId: dto.workOrderId,
          fromStatus: ServiceWorkStatus.WAITING_MANAGER_APPROVAL,
          toStatus: ServiceWorkStatus.SOLUTION_PROPOSED,
          changedBy: userId,
          reason: dto.rejectionReason,
        },
      });

      return rejection;
    });
  }

  /**
   * Get Approval Status
   */
  async getApprovalStatus(
    workOrderId: string,
    tenantId: string,
  ): Promise<ApprovalStatusResponse> {
    const tenantIdFilter = tenantId ? { tenantId } : {};

    // WorkOrder'ı bul
    const workOrderWhere: any = { id: workOrderId };
    if (tenantId) {
      workOrderWhere.tenantId = tenantId;
    }

    const workOrder = await this.prisma.workOrder.findFirst({
      where: workOrderWhere,
    });

    if (!workOrder) {
      throw new NotFoundException('WorkOrder not found or tenant mismatch');
    }

    // Active approval'ı bul (soft-deleted olmayan)
    const approval = await this.prisma.managerApproval.findFirst({
      where: {
        workOrderId,
        deletedAt: null,
        ...tenantIdFilter,
      },
      include: {
        solutionPackage: true,
      },
    });

    const status = this.mapWorkOrderStatusToServiceWorkStatus(
      workOrder.status,
    ) || ServiceWorkStatus.SERVICE_ACCEPTED;

    return {
      workOrderId,
      status,
      hasActiveApproval: !!approval,
      approvedPackageId: approval?.solutionPackageId,
      approvedBy: approval?.approvedBy,
      approvedAt: approval?.approvedAt,
      approvalNote: approval?.approvalNote || undefined,
    };
  }

  /**
   * Invalidate Approval (when package is modified)
   */
  async invalidateApproval(
    workOrderId: string,
    reason: string,
    tenantId: string,
  ): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      const tenantIdFilter = tenantId ? { tenantId } : {};

      // Active approval'ı bul
      const approval = await tx.managerApproval.findFirst({
        where: {
          workOrderId,
          deletedAt: null,
          ...tenantIdFilter,
        },
      });

      if (!approval) {
        return; // Approval yoksa işlem yapma
      }

      // Soft delete (deletedAt set et)
      await tx.managerApproval.update({
        where: { id: approval.id },
        data: {
          deletedAt: new Date(),
        },
      });

      // WorkOrder'ı al (tenantId için)
      const workOrder = await tx.workOrder.findFirst({
        where: { id: workOrderId },
      });

      if (!workOrder) {
        throw new NotFoundException('WorkOrder not found');
      }

      // WorkOrder durumunu WAITING_MANAGER_APPROVAL'a geri al
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: WorkOrderStatus.WAITING_FOR_APPROVAL,
        },
      });

      // History kaydı oluştur
      const tenantIdFinal = tenantId || workOrder.tenantId;
      await tx.workOrderStatusHistory.create({
        data: {
          tenantId: tenantIdFinal,
          workOrderId,
          fromStatus: ServiceWorkStatus.APPROVED,
          toStatus: ServiceWorkStatus.WAITING_MANAGER_APPROVAL,
          changedBy: approval.approvedBy, // Original approver
          reason: reason || 'Solution package modified after approval',
        },
      });
    });
  }
}

