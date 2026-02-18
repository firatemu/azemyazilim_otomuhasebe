import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { TenantContextService } from '../../../common/services/tenant-context.service';
import { TenantResolverService } from '../../../common/services/tenant-resolver.service';
import { isStagingEnvironment, buildTenantWhereClause } from '../../../common/utils/staging.util';
import {
  WorkOrderStatus,
  ServiceWorkStatus,
  Prisma,
} from '@prisma/client';
import {
  CreateSolutionPackageDto,
  UpdateSolutionPackageDto,
  AddPackagePartDto,
  UpdatePackagePartDto,
} from '../dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SolutionPackageService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
    private tenantResolver: TenantResolverService,
  ) {}

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
    });
    if (!workOrder) {
      throw new NotFoundException('WorkOrder not found or tenant mismatch');
    }
    if (
      workOrder.status === WorkOrderStatus.CLOSED ||
      workOrder.status === WorkOrderStatus.CANCELLED
    ) {
      throw new ForbiddenException(
        `WorkOrder is ${workOrder.status === WorkOrderStatus.CLOSED ? 'CLOSED' : 'CANCELLED'}. Cannot modify.`,
      );
    }
    return workOrder;
  }

  private async validateProduct(
    productId: string,
    tenantId: string | undefined,
    tx: Prisma.TransactionClient,
  ) {
    const where: any = { id: productId };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const product = await tx.stok.findFirst({
      where,
    });

    if (!product) {
      throw new NotFoundException('Product not found or tenant mismatch');
    }

    return product;
  }

  /**
   * WorkOrder durumunu SOLUTION_PROPOSED'e güncelle ve history oluştur
   */
  private async updateWorkOrderStatusToSolutionProposed(
    workOrderId: string,
    userId: string,
    tx: Prisma.TransactionClient,
    reason: string = 'Solution package created/updated',
  ) {
    const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);
    let tenantId: string =
      (await this.tenantResolver.resolveForQuery()) || workOrder.tenantId || '';
    if (!tenantId && !isStagingEnvironment()) {
      throw new BadRequestException('Tenant ID is required in production environment');
    }
    if (!tenantId) tenantId = workOrder.tenantId || '';

    // Eğer zaten SOLUTION_PROPOSED durumundaysa veya daha ileri bir durumdaysa
    // ve APPROVED veya sonrasındaysa, durumu SOLUTION_PROPOSED'e geri al
    const needsRollback =
      workOrder.status === WorkOrderStatus.APPROVED ||
      workOrder.status === WorkOrderStatus.PART_WAITING ||
      workOrder.status === WorkOrderStatus.IN_PROGRESS ||
      workOrder.status === WorkOrderStatus.QUALITY_CONTROL ||
      workOrder.status === WorkOrderStatus.READY_FOR_DELIVERY;

    if (needsRollback) {
      // Durum geri al
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: WorkOrderStatus.DIAGNOSIS, // WorkOrderStatus'te SOLUTION_PROPOSED yok, DIAGNOSIS kullan
        },
      });

      // History kaydı oluştur
      const fromStatus = this.mapWorkOrderStatusToServiceWorkStatus(
        workOrder.status,
      );

      // TenantId'yi belirle - staging'de workOrder'dan al
      let finalTenantId: string;
      if (isStagingEnvironment()) {
        finalTenantId = workOrder.tenantId || '';
      } else {
        finalTenantId = tenantId || workOrder.tenantId;
        if (!finalTenantId) {
          throw new BadRequestException('Tenant ID is required in production environment');
        }
      }

      await tx.workOrderStatusHistory.create({
        data: {
          tenantId: finalTenantId,
          workOrderId,
          fromStatus,
          toStatus: ServiceWorkStatus.SOLUTION_PROPOSED,
          changedBy: userId,
          reason: 'Solution package modified after approval - status rolled back',
        },
      });
    } else if (workOrder.status !== WorkOrderStatus.DIAGNOSIS) {
      // Durum güncelle (DIAGNOSIS'e - SOLUTION_PROPOSED'in WorkOrderStatus karşılığı)
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: WorkOrderStatus.DIAGNOSIS,
        },
      });

      // History kaydı oluştur
      const fromStatus = this.mapWorkOrderStatusToServiceWorkStatus(
        workOrder.status,
      );

      // TenantId zaten yukarıda belirlendi, direkt kullan
      await tx.workOrderStatusHistory.create({
        data: {
          tenantId: tenantId,
          workOrderId,
          fromStatus,
          toStatus: ServiceWorkStatus.SOLUTION_PROPOSED,
          changedBy: userId,
          reason,
        },
      });
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
   * Create Package
   */
  async createPackage(
    dto: CreateSolutionPackageDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // WorkOrder doğrula
      const workOrder = await this.findWorkOrderOrThrow(dto.workOrderId, tx);

      // APPROVED veya sonrasında paket oluşturulamaz
      if (
        workOrder.status === WorkOrderStatus.APPROVED ||
        workOrder.status === WorkOrderStatus.PART_WAITING ||
        workOrder.status === WorkOrderStatus.IN_PROGRESS ||
        workOrder.status === WorkOrderStatus.QUALITY_CONTROL ||
        workOrder.status === WorkOrderStatus.READY_FOR_DELIVERY
      ) {
        throw new ForbiddenException(
          'Cannot create package for WorkOrder in APPROVED or later status',
        );
      }

      // Final tenantId - staging'de workOrder'dan al
      let finalTenantId: string;
      if (isStagingEnvironment()) {
        finalTenantId = workOrder.tenantId || '';
      } else {
        finalTenantId = tenantId || workOrder.tenantId;
        if (!finalTenantId) {
          throw new BadRequestException('Tenant ID is required in production environment');
        }
      }

      // Tüm product'ları doğrula
      for (const part of dto.parts) {
        await this.validateProduct(part.productId, finalTenantId, tx);
      }

      // SolutionPackage oluştur
      const solutionPackage = await tx.solutionPackage.create({
        data: {
          tenantId: finalTenantId,
          workOrderId: dto.workOrderId,
          name: dto.name,
          description: dto.description,
          estimatedDurationMinutes: dto.estimatedDurationMinutes,
        },
      });

      // Parts oluştur
      await tx.solutionPackagePart.createMany({
        data: dto.parts.map((part) => ({
          solutionPackageId: solutionPackage.id,
          productId: part.productId,
          quantity: new Decimal(part.quantity),
        })),
      });

      // WorkOrder durumunu güncelle ve history oluştur
      await this.updateWorkOrderStatusToSolutionProposed(
        dto.workOrderId,
        userId,
        tx,
        'Solution package created',
      );

      // Package'ı parts ile birlikte döndür
      return tx.solutionPackage.findUnique({
        where: { id: solutionPackage.id },
        include: {
          parts: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  /**
   * Update Package
   */
  async updatePackage(
    id: string,
    dto: UpdateSolutionPackageDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const tenantIdFilter = tenantId ? { tenantId } : {};

      // Mevcut package'ı bul
      const existingPackage = await tx.solutionPackage.findFirst({
        where: {
          id,
          ...tenantIdFilter,
        },
        include: {
          workOrder: true,
        },
      });

      if (!existingPackage) {
        throw new NotFoundException('Solution package not found');
      }

      // Optimistic locking kontrolü
      if (existingPackage.version !== dto.version) {
        throw new ConflictException(
          'Version mismatch. The package has been modified by another user.',
        );
      }

      // WorkOrder doğrula
      const workOrder = await this.findWorkOrderOrThrow(
        existingPackage.workOrderId,
        tx,
      );

      // Eğer WorkOrder APPROVED durumundaysa, approval'ı invalidate et (soft delete)
      if (workOrder.status === WorkOrderStatus.APPROVED) {
        const activeApproval = await tx.managerApproval.findFirst({
          where: {
            workOrderId: existingPackage.workOrderId,
            deletedAt: null,
            ...(tenantId ? { tenantId } : {}),
          },
        });

        if (activeApproval) {
          // Soft delete approval
          await tx.managerApproval.update({
            where: { id: activeApproval.id },
            data: {
              deletedAt: new Date(),
            },
          });
        }
      }

      // Package güncelle
      const updatedPackage = await tx.solutionPackage.update({
        where: { id },
        data: {
          name: dto.name ?? existingPackage.name,
          description: dto.description ?? existingPackage.description,
          estimatedDurationMinutes:
            dto.estimatedDurationMinutes ??
            existingPackage.estimatedDurationMinutes,
          version: { increment: 1 },
        },
        include: {
          parts: {
            include: {
              product: true,
            },
          },
        },
      });

      // WorkOrder durumunu güncelle ve history oluştur (rollback gerekirse)
      await this.updateWorkOrderStatusToSolutionProposed(
        existingPackage.workOrderId,
        userId,
        tx,
        'Solution package updated',
      );

      return updatedPackage;
    });
  }

  /**
   * Delete Package
   */
  async deletePackage(id: string, userId: string, tenantId: string) {
    return this.prisma.$transaction(async (tx) => {
      const tenantIdFilter = tenantId ? { tenantId } : {};

      // Package'ı bul
      const existingPackage = await tx.solutionPackage.findFirst({
        where: {
          id,
          ...tenantIdFilter,
        },
        include: {
          workOrder: true,
        },
      });

      if (!existingPackage) {
        throw new NotFoundException('Solution package not found');
      }

      // WorkOrder doğrula
      await this.findWorkOrderOrThrow(existingPackage.workOrderId, tx);

      // Package'ı sil (CASCADE ile parts da silinir)
      await tx.solutionPackage.delete({
        where: { id },
      });
    });
  }

  /**
   * Get Packages by WorkOrder
   */
  async getPackagesByWorkOrder(workOrderId: string, tenantId: string) {
    // Staging'de tenantId opsiyonel
    const tenantIdFilter = buildTenantWhereClause(tenantId || undefined);

    // WorkOrder'ın var olduğunu doğrula - staging'de tenantId opsiyonel
    const workOrderWhere: any = { id: workOrderId };
    if (!isStagingEnvironment() && tenantId) {
      workOrderWhere.tenantId = tenantId;
    }

    const workOrder = await this.prisma.workOrder.findFirst({
      where: workOrderWhere,
    });

    if (!workOrder) {
      throw new NotFoundException('WorkOrder not found');
    }

    // Packages'ları getir - staging'de tenantId filtresi opsiyonel
    return this.prisma.solutionPackage.findMany({
      where: {
        workOrderId,
        ...tenantIdFilter,
      },
      include: {
        parts: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get Package with Parts
   */
  async getPackageWithParts(id: string, tenantId: string) {
    const tenantIdFilter = tenantId ? { tenantId } : {};

    const package_ = await this.prisma.solutionPackage.findFirst({
      where: {
        id,
        ...tenantIdFilter,
      },
      include: {
        parts: {
          include: {
            product: true,
          },
        },
        workOrder: true,
      },
    });

    if (!package_) {
      throw new NotFoundException('Solution package not found');
    }

    return package_;
  }

  /**
   * Add Part to Package
   */
  async addPart(
    packageId: string,
    dto: AddPackagePartDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const tenantIdFilter = tenantId ? { tenantId } : {};

      // Package'ı bul
      const package_ = await tx.solutionPackage.findFirst({
        where: {
          id: packageId,
          ...tenantIdFilter,
        },
        include: {
          workOrder: true,
        },
      });

      if (!package_) {
        throw new NotFoundException('Solution package not found');
      }

      // WorkOrder doğrula
      await this.findWorkOrderOrThrow(package_.workOrderId, tx);

      // Product doğrula
      await this.validateProduct(dto.productId, tenantId, tx);

      // Aynı product zaten var mı kontrol et
      const existingPart = await tx.solutionPackagePart.findUnique({
        where: {
          solutionPackageId_productId: {
            solutionPackageId: packageId,
            productId: dto.productId,
          },
        },
      });

      if (existingPart) {
        throw new ConflictException(
          'This product already exists in the package',
        );
      }

      // Part ekle
      const part = await tx.solutionPackagePart.create({
        data: {
          solutionPackageId: packageId,
          productId: dto.productId,
          quantity: new Decimal(dto.quantity),
        },
        include: {
          product: true,
        },
      });

      // WorkOrder durumunu güncelle
      await this.updateWorkOrderStatusToSolutionProposed(
        package_.workOrderId,
        userId,
        tx,
        'Part added to solution package',
      );

      return part;
    });
  }

  /**
   * Update Part
   */
  async updatePart(
    partId: string,
    dto: UpdatePackagePartDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Part'ı bul
      const part = await tx.solutionPackagePart.findUnique({
        where: { id: partId },
        include: {
          solutionPackage: {
            include: {
              workOrder: true,
            },
          },
        },
      });

      if (!part) {
        throw new NotFoundException('Package part not found');
      }

      // Tenant kontrolü
      if (tenantId && part.solutionPackage.tenantId !== tenantId) {
        throw new NotFoundException('Package part not found');
      }

      // WorkOrder doğrula
      await this.findWorkOrderOrThrow(
        part.solutionPackage.workOrderId,
        tx,
      );

      // Part güncelle
      const updatedPart = await tx.solutionPackagePart.update({
        where: { id: partId },
        data: {
          quantity: new Decimal(dto.quantity),
        },
        include: {
          product: true,
        },
      });

      // WorkOrder durumunu güncelle
      await this.updateWorkOrderStatusToSolutionProposed(
        part.solutionPackage.workOrderId,
        userId,
        tx,
        'Package part updated',
      );

      return updatedPart;
    });
  }

  /**
   * Remove Part
   */
  async removePart(partId: string, userId: string, tenantId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Part'ı bul
      const part = await tx.solutionPackagePart.findUnique({
        where: { id: partId },
        include: {
          solutionPackage: {
            include: {
              workOrder: true,
            },
          },
        },
      });

      if (!part) {
        throw new NotFoundException('Package part not found');
      }

      // Tenant kontrolü
      if (tenantId && part.solutionPackage.tenantId !== tenantId) {
        throw new NotFoundException('Package part not found');
      }

      // WorkOrder doğrula
      await this.findWorkOrderOrThrow(
        part.solutionPackage.workOrderId,
        tx,
      );

      // Part'ı sil
      await tx.solutionPackagePart.delete({
        where: { id: partId },
      });

      // WorkOrder durumunu güncelle
      await this.updateWorkOrderStatusToSolutionProposed(
        part.solutionPackage.workOrderId,
        userId,
        tx,
        'Part removed from solution package',
      );
    });
  }
}

