import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { SystemParameterService } from '../system-parameter/system-parameter.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreatePartRequestDto, SupplyPartRequestDto } from './dto';
import { PartRequestStatus } from './dto/create-part-request.dto';
import { PartWorkflowStatus, Prisma } from '@prisma/client';
import {
  canTransitionPartRequestStatus,
} from './domain/part-request-status.machine';

@Injectable()
export class PartRequestService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    private systemParameterService: SystemParameterService,
  ) { }

  async create(dto: CreatePartRequestDto, requestedBy: string) {
    const tenantId = await this.tenantResolver.resolveForCreate({
      allowNull: true,
    });

    const finalTenantId = (dto as any).tenantId ?? tenantId ?? undefined;

    const workOrder = await this.prisma.extended.workOrder.findFirst({
      where: {
        id: dto.workOrderId,
        ...buildTenantWhereClause(finalTenantId),
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (workOrder.status === 'INVOICED_CLOSED' || workOrder.status === 'CANCELLED') {
      throw new BadRequestException('Part request cannot be added to this work order');
    }

    const partRequest = await this.prisma.extended.partRequest.create({
      data: {
        tenantId: finalTenantId,
        workOrderId: dto.workOrderId,
        requestedBy,
        description: dto.description,
        productId: dto.productId || null,
        requestedQty: dto.requestedQty,
        status: PartRequestStatus.REQUESTED,
      },
      include: {
        product: { select: { id: true, code: true, name: true } },
        requestedByUser: { select: { id: true, fullName: true } },
        workOrder: { select: { id: true, workOrderNo: true } },
      },
    });

    await this.prisma.extended.workOrder.update({
      where: { id: dto.workOrderId },
      data: { partWorkflowStatus: PartWorkflowStatus.PARTS_PENDING },
    });

    await this.prisma.extended.workOrderActivity.create({
      data: {
        workOrderId: dto.workOrderId,
        action: 'PART_WORKFLOW_CHANGED',
        userId: requestedBy,
        metadata: {
          partWorkflowStatus: PartWorkflowStatus.PARTS_PENDING,
          trigger: 'PART_REQUEST_CREATED',
        },
      },
    });

    return partRequest;
  }

  async findAll(
    workOrderId?: string,
    status?: PartRequestStatus,
    page = 1,
    limit = 50,
    workOrderNo?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: any = buildTenantWhereClause(tenantId ?? undefined);

    if (workOrderId) where.workOrderId = workOrderId;
    if (workOrderNo) {
      where.workOrder = {
        workOrderNo: { contains: workOrderNo, mode: 'insensitive' },
      };
    }
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.extended.partRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, code: true, name: true } },
          requestedByUser: { select: { id: true, fullName: true } },
          workOrder: { select: { id: true, workOrderNo: true, status: true } },
        },
      }),
      this.prisma.extended.partRequest.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const partRequest = await this.prisma.extended.partRequest.findFirst({
      where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
      include: {
        product: { select: { id: true, code: true, name: true } },
        requestedByUser: { select: { id: true, fullName: true } },
        workOrder: { select: { id: true, workOrderNo: true, status: true } },
      },
    });

    if (!partRequest) {
      throw new NotFoundException(`Part request not found: ${id}`);
    }

    return partRequest;
  }

  async supply(id: string, dto: SupplyPartRequestDto, suppliedBy: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.extended.$transaction(async (tx) => {
      const partRequest = await tx.partRequest.findFirst({
        where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
      });

      if (!partRequest) {
        throw new NotFoundException('Part request not found');
      }

      if (
        !canTransitionPartRequestStatus(
          partRequest.status,
          PartRequestStatus.SUPPLIED,
        )
      ) {
        throw new BadRequestException(
          'Only requested parts can be supplied',
        );
      }

      const product = await tx.product.findFirst({
        where: {
          id: dto.productId,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (!product) {
        throw new NotFoundException('Stock not found');
      }

      // Stock quantity check - apply only if "Negative product control" is enabled
      const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean(
        'NEGATIVE_STOCK_CONTROL',
        false,
      );
      if (negativeStockControlEnabled) {
        const warehouseIds = await tx.warehouse.findMany({
          where: buildTenantWhereClause(tenantId ?? undefined),
          select: { id: true },
        });
        if (warehouseIds.length > 0) {
          const stockResult = await tx.productLocationStock.aggregate({
            where: {
              productId: dto.productId,
              warehouseId: { in: warehouseIds.map((w) => w.id) },
            },
            _sum: { qtyOnHand: true },
          });
          const availableQty = Number(stockResult._sum?.qtyOnHand ?? 0);
          if (availableQty < dto.suppliedQty) {
            throw new BadRequestException(
              `Not enough product. Available: ${availableQty}, To supply: ${dto.suppliedQty}`,
            );
          }
        }
      }

      const updated = await tx.partRequest.update({
        where: { id },
        data: {
          productId: dto.productId,
          suppliedQty: dto.suppliedQty,
          status: PartRequestStatus.SUPPLIED,
          suppliedBy,
          suppliedAt: new Date(),
          version: { increment: 1 },
        },
        include: {
          product: { select: { id: true, code: true, name: true } },
          requestedByUser: { select: { id: true, fullName: true } },
          workOrder: { select: { id: true, workOrderNo: true, status: true, customerVehicleId: true } },
        },
      });

      const pendingCount = await tx.partRequest.count({
        where: {
          workOrderId: updated.workOrderId,
          status: PartRequestStatus.REQUESTED,
        },
      });
      const newPartStatus =
        pendingCount === 0 ? PartWorkflowStatus.ALL_PARTS_SUPPLIED : PartWorkflowStatus.PARTIALLY_SUPPLIED;
      await tx.workOrder.update({
        where: { id: updated.workOrderId },
        data: { partWorkflowStatus: newPartStatus },
      });
      await tx.workOrderActivity.create({
        data: {
          workOrderId: updated.workOrderId,
          action: 'PART_WORKFLOW_CHANGED',
          metadata: {
            partWorkflowStatus: newPartStatus,
            trigger: 'PART_SUPPLY',
          },
        },
      });

      return updated;
    });
  }

  /**
   * Step 5: Atomic product deduction - When technician marks as "Used"
   * Within transaction: PartRequest SUPPLIED -> USED, InventoryTransaction (-qty)
   */
  async markAsUsed(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.extended.$transaction(async (tx) => {
      const pr = await tx.partRequest.findFirst({
        where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
      });

      if (!pr) {
        throw new NotFoundException('Part request not found');
      }

      if (
        !canTransitionPartRequestStatus(pr.status, PartRequestStatus.USED)
      ) {
        throw new ConflictException(
          'Only supplied parts can be marked as used',
        );
      }

      if (!pr.productId || pr.suppliedQty == null) {
        throw new BadRequestException('Part request product and quantity information is missing');
      }

      const updated = await tx.partRequest.updateMany({
        where: { id, version: pr.version },
        data: {
          status: PartRequestStatus.USED,
          usedAt: new Date(),
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          'Part request could not be updated (optimistic lock error - please try again)',
        );
      }

      await tx.inventoryTransaction.create({
        data: {
          tenantId: pr.tenantId,
          partRequestId: pr.id,
          productId: pr.productId,
          quantity: -pr.suppliedQty,
          transactionType: 'DEDUCTION',
        },
      });

      return tx.partRequest.findUniqueOrThrow({
        where: { id },
        include: {
          product: { select: { id: true, code: true, name: true } },
          workOrder: { select: { id: true, workOrderNo: true } },
        },
      });
    });
  }

  async cancel(id: string) {
    const partRequest = await this.findOne(id);

    if (
      !canTransitionPartRequestStatus(
        partRequest.status,
        PartRequestStatus.CANCELLED,
      )
    ) {
      throw new BadRequestException(
        'Only requested parts can be cancelled',
      );
    }

    const updated = await this.prisma.extended.partRequest.update({
      where: { id },
      data: { status: PartRequestStatus.CANCELLED },
      include: {
        product: { select: { id: true, code: true, name: true } },
        workOrder: true,
      },
    });

    if (updated.workOrder.partWorkflowStatus === PartWorkflowStatus.PARTS_PENDING ||
      updated.workOrder.partWorkflowStatus === PartWorkflowStatus.PARTIALLY_SUPPLIED) {
      const pendingCount = await this.prisma.extended.partRequest.count({
        where: {
          workOrderId: updated.workOrderId,
          status: PartRequestStatus.REQUESTED,
        },
      });
      const newPartStatus =
        pendingCount === 0 ? PartWorkflowStatus.ALL_PARTS_SUPPLIED : PartWorkflowStatus.PARTIALLY_SUPPLIED;
      await this.prisma.extended.workOrder.update({
        where: { id: updated.workOrderId },
        data: { partWorkflowStatus: newPartStatus },
      });
    }

    return updated;
  }
}
