import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateWorkOrderItemDto, UpdateWorkOrderItemDto } from './dto';
import { WorkOrderStatus, PartWorkflowStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { Prisma } from '@prisma/client';

@Injectable()
export class WorkOrderItemService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) { }

  private calculateTotals(
    quantity: number,
    unitPrice: number,
    taxRate: number = 20,
  ) {
    const totalPrice = quantity * unitPrice;
    const taxAmount = totalPrice * (taxRate / 100);
    return { totalPrice, taxAmount };
  }

  private async recalculateWorkOrderTotals(workOrderId: string) {
    return this.recalculateWorkOrderTotalsInTx(
      this.prisma as unknown as Prisma.TransactionClient,
      workOrderId,
    );
  }

  private async recalculateWorkOrderTotalsInTx(
    tx: Prisma.TransactionClient,
    workOrderId: string,
  ) {
    const items = await tx.workOrderItem.findMany({
      where: { workOrderId },
    });

    let totalLaborCost = 0;
    let totalPartsCost = 0;

    for (const item of items) {
      const total = Number(item.totalPrice);
      if (item.type === 'LABOR') {
        totalLaborCost += total;
      } else {
        totalPartsCost += total;
      }
    }

    const subtotal = totalLaborCost + totalPartsCost;
    const taxAmount = items.reduce((sum, i) => sum + Number(i.taxAmount), 0);
    const grandTotal = subtotal + taxAmount;

    await tx.workOrder.update({
      where: { id: workOrderId },
      data: {
        totalLaborCost: new Decimal(totalLaborCost),
        totalPartsCost: new Decimal(totalPartsCost),
        taxAmount: new Decimal(taxAmount),
        grandTotal: new Decimal(grandTotal),
      },
    });
  }

  async create(dto: CreateWorkOrderItemDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.extended.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findFirst({
        where: {
          id: dto.workOrderId,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });

      if (!workOrder) {
        throw new NotFoundException('Work order not found');
      }

      if (workOrder.status === WorkOrderStatus.INVOICED_CLOSED || workOrder.status === WorkOrderStatus.CLOSED_WITHOUT_INVOICE) {
        throw new BadRequestException('Cannot add item to closed work order');
      }

      if (workOrder.status === WorkOrderStatus.CANCELLED) {
        throw new BadRequestException('Cannot add item to cancelled work order');
      }

      if (dto.type === 'PART' && !dto.productId) {
        throw new BadRequestException('Product must be selected for part item');
      }

      const taxRate = dto.taxRate ?? 20;
      const unitPrice = dto.unitPrice ?? 0;
      const { totalPrice, taxAmount } = this.calculateTotals(
        dto.quantity,
        unitPrice,
        taxRate,
      );

      const item = await tx.workOrderItem.create({
        data: {
          workOrderId: dto.workOrderId,
          type: dto.type,
          description: dto.description,
          productId: dto.productId || null,
          quantity: dto.quantity,
          unitPrice,
          taxRate,
          taxAmount,
          totalPrice,
        },
        include: {
          product: { select: { id: true, code: true, name: true } },
        },
      });

      if (dto.type === 'PART' && workOrder.partWorkflowStatus === PartWorkflowStatus.NOT_STARTED) {
        const partRequestCount = await tx.partRequest.count({
          where: { workOrderId: dto.workOrderId },
        });
        if (partRequestCount === 0) {
          await tx.workOrder.update({
            where: { id: dto.workOrderId },
            data: { partWorkflowStatus: PartWorkflowStatus.PARTS_SUPPLIED_DIRECT },
          });
        }
      }

      await this.recalculateWorkOrderTotalsInTx(tx, dto.workOrderId);
      return item;
    });
  }

  async findAll(workOrderId: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const workOrder = await this.prisma.extended.workOrder.findFirst({
      where: {
        id: workOrderId,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return this.prisma.extended.workOrderItem.findMany({
      where: { workOrderId },
      include: {
        product: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const tenantWhere = buildTenantWhereClause(tenantId ?? undefined);
    const item = await this.prisma.extended.workOrderItem.findFirst({
      where: {
        id,
        workOrder: tenantWhere,
      },
      include: {
        workOrder: true,
        product: { select: { id: true, code: true, name: true } },
      },
    });

    if (!item) {
      throw new NotFoundException(`Item not found: ${id}`);
    }

    return item;
  }

  async update(id: string, dto: UpdateWorkOrderItemDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.extended.$transaction(async (tx) => {
      const item = await tx.workOrderItem.findFirst({
        where: {
          id,
          workOrder: buildTenantWhereClause(tenantId ?? undefined),
        },
        include: {
          workOrder: true,
          product: { select: { id: true, code: true, name: true } },
        },
      });

      if (!item) {
        throw new NotFoundException(`Item not found: ${id}`);
      }

      if (item.workOrder.status === WorkOrderStatus.INVOICED_CLOSED || item.workOrder.status === WorkOrderStatus.CLOSED_WITHOUT_INVOICE) {
        throw new BadRequestException(
          'Closed work order item cannot be updated',
        );
      }

      const quantity = dto.quantity ?? item.quantity;
      const unitPrice = dto.unitPrice ?? Number(item.unitPrice);
      const taxRate = dto.taxRate ?? item.taxRate;
      const { totalPrice, taxAmount } = this.calculateTotals(
        quantity,
        unitPrice,
        taxRate,
      );

      const updated = await tx.workOrderItem.update({
        where: { id },
        data: {
          ...dto,
          quantity,
          unitPrice,
          taxRate,
          taxAmount,
          totalPrice,
        },
        include: {
          product: { select: { id: true, code: true, name: true } },
        },
      });

      await this.recalculateWorkOrderTotalsInTx(tx, item.workOrderId);
      return updated;
    });
  }

  async remove(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.extended.$transaction(async (tx) => {
      const item = await tx.workOrderItem.findFirst({
        where: {
          id,
          workOrder: buildTenantWhereClause(tenantId ?? undefined),
        },
        include: { workOrder: true },
      });

      if (!item) {
        throw new NotFoundException(`Item not found: ${id}`);
      }

      if (item.workOrder.status === WorkOrderStatus.INVOICED_CLOSED || item.workOrder.status === WorkOrderStatus.CLOSED_WITHOUT_INVOICE) {
        throw new BadRequestException(
          'Closed work order item cannot be deleted',
        );
      }

      const deleted = await tx.workOrderItem.delete({
        where: { id },
      });

      await this.recalculateWorkOrderTotalsInTx(tx, item.workOrderId);
      return deleted;
    });
  }
}
