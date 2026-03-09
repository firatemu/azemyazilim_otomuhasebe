import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, WorkOrderStatus, WorkOrderItemType, InvoiceType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import {
  ChangeStatusWorkOrderDto,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
} from './dto';

const IMMUTABLE_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.INVOICED_CLOSED,
  WorkOrderStatus.CANCELLED,
  WorkOrderStatus.CLOSED_WITHOUT_INVOICE,
];

const POST_APPROVAL_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.APPROVED_IN_PROGRESS,
  WorkOrderStatus.PART_WAITING,
  WorkOrderStatus.VEHICLE_READY,
];

const VALID_STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.WAITING_DIAGNOSIS]: [
    WorkOrderStatus.PENDING_APPROVAL,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.PENDING_APPROVAL]: [
    WorkOrderStatus.APPROVED_IN_PROGRESS,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.APPROVED_IN_PROGRESS]: [
    WorkOrderStatus.PART_WAITING,
    WorkOrderStatus.VEHICLE_READY,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.PART_WAITING]: [
    WorkOrderStatus.APPROVED_IN_PROGRESS,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.PARTS_SUPPLIED]: [
    WorkOrderStatus.APPROVED_IN_PROGRESS,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.VEHICLE_READY]: [
    WorkOrderStatus.INVOICED_CLOSED,
    WorkOrderStatus.CLOSED_WITHOUT_INVOICE,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.INVOICED_CLOSED]: [],
  [WorkOrderStatus.CANCELLED]: [],
  [WorkOrderStatus.CLOSED_WITHOUT_INVOICE]: [],
};

@Injectable()
export class WorkOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantResolver: TenantResolverService,
  ) { }

  /**
   * 0. findWorkOrderOrThrow - İş emri varlığı kontrolü
   */
  async findWorkOrderOrThrow(id: string, tx?: Prisma.TransactionClient) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const prisma = tx || this.prisma;

    const workOrder = await prisma.workOrder.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        customerVehicle: true,
        account: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        technician: true,
        items: {
          include: {
            product: true,
          },
        },
        serviceInvoice: true,
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  private assertMutable(status: WorkOrderStatus): void {
    if (IMMUTABLE_STATUSES.includes(status)) {
      throw new ForbiddenException(
        `This work order is ${status === WorkOrderStatus.INVOICED_CLOSED ? 'closed' : 'cancelled'}. Cannot be modified.`,
      );
    }
  }

  private assertValidTransition(currentStatus: WorkOrderStatus, newStatus: WorkOrderStatus): void {
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!validTransitions.includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition: ${currentStatus} -> ${newStatus}`);
    }
  }

  private assertApprovedForInProgress(currentStatus: WorkOrderStatus, newStatus: WorkOrderStatus): void {
    if (newStatus === WorkOrderStatus.APPROVED_IN_PROGRESS) {
      const allowedForInProgress: WorkOrderStatus[] = [
        WorkOrderStatus.PENDING_APPROVAL,
        WorkOrderStatus.PART_WAITING,
        WorkOrderStatus.PARTS_SUPPLIED,
      ];
      if (!allowedForInProgress.includes(currentStatus)) {
        throw new BadRequestException('Must be approved before processing');
      }
    }
  }

  private async createAuditLog(
    data: {
      workOrderId: string;
      action: string;
      details?: any;
      userId?: string;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    await prisma.workOrderActivity.create({
      data: {
        workOrderId: data.workOrderId,
        action: data.action,
        userId: data.userId,
        metadata: data.details || {},
      },
    });
  }

  private async generateWorkOrderNo(tx: Prisma.TransactionClient): Promise<string> {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const prefix = `IE${new Date().getFullYear()}`;
    const last = await tx.workOrder.findFirst({
      where: {
        ...buildTenantWhereClause(tenantId ?? undefined),
        workOrderNo: { startsWith: prefix },
      },
      orderBy: { workOrderNo: 'desc' },
      select: { workOrderNo: true },
    });

    let next = 1;
    if (last) {
      const num = parseInt(last.workOrderNo.replace(prefix, ''), 10);
      if (!isNaN(num)) next = num + 1;
    }
    return `${prefix}${next.toString().padStart(6, '0')}`;
  }

  private calculateLineTotal(quantity: number, unitPrice: number, taxRate: number) {
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxRate / 100);
    const totalPrice = subtotal + taxAmount;
    return {
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
    };
  }

  private async recalculateTotals(workOrderId: string, tx: Prisma.TransactionClient): Promise<void> {
    const lines = await tx.workOrderItem.findMany({ where: { workOrderId } });
    let labor = 0, parts = 0, tax = 0;
    for (const line of lines) {
      const total = Number(line.totalPrice);
      const lTax = Number(line.taxAmount);
      if (line.type === WorkOrderItemType.LABOR) labor += total - lTax;
      else parts += total - lTax;
      tax += lTax;
    }
    await tx.workOrder.update({
      where: { id: workOrderId },
      data: {
        totalLaborCost: new Decimal(labor),
        totalPartsCost: new Decimal(parts),
        taxAmount: new Decimal(tax),
        grandTotal: new Decimal(labor + parts + tax),
      },
    });
  }

  async create(dto: CreateWorkOrderDto, userId?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    return this.prisma.extended.$transaction(async (tx) => {
      const workOrderNo = await this.generateWorkOrderNo(tx);
      const workOrder = await tx.workOrder.create({
        data: {
          workOrderNo,
          customerVehicleId: dto.customerVehicleId,
          accountId: dto.accountId,
          technicianId: dto.technicianId,
          status: WorkOrderStatus.WAITING_DIAGNOSIS,
          description: dto.description || '',
          diagnosisNotes: dto.diagnosisNotes,
          ...buildTenantWhereClause(tenantId ?? undefined),
        } as any,
        include: {
          customerVehicle: true,
          account: { select: { id: true, code: true, title: true } },
          technician: { select: { id: true, fullName: true } },
        },
      });
      await this.createAuditLog({ workOrderId: workOrder.id, action: 'CREATE', userId }, tx);
      return workOrder;
    });
  }

  async addLaborLine(workOrderId: string, dto: any, userId?: string) {
    return this.prisma.extended.$transaction(async (tx) => {
      const wo = await this.findWorkOrderOrThrow(workOrderId, tx);
      this.assertMutable(wo.status);
      const { taxAmount, totalPrice } = this.calculateLineTotal(1, dto.laborHours * dto.hourlyRate, dto.taxRate || 20);
      const line = await tx.workOrderItem.create({
        data: {
          workOrderId,
          type: WorkOrderItemType.LABOR,
          description: dto.description || 'Labor',
          quantity: 1,
          unitPrice: new Decimal(dto.laborHours * dto.hourlyRate),
          taxRate: dto.taxRate || 20,
          taxAmount: new Decimal(taxAmount),
          totalPrice: new Decimal(totalPrice),
        },
      });
      await this.recalculateTotals(workOrderId, tx);
      await this.createAuditLog({ workOrderId, action: 'ADD_LABOR', userId, details: { lineId: line.id } }, tx);
      return line;
    });
  }

  async addPartLine(workOrderId: string, dto: any, userId?: string) {
    return this.prisma.extended.$transaction(async (tx) => {
      const wo = await this.findWorkOrderOrThrow(workOrderId, tx);
      this.assertMutable(wo.status);
      const prod = await tx.product.findUnique({ where: { id: dto.productId } });
      if (!prod) throw new NotFoundException('Product not found');
      const { taxAmount, totalPrice } = this.calculateLineTotal(dto.quantity, dto.unitPrice, dto.taxRate || 20);
      const line = await tx.workOrderItem.create({
        data: {
          workOrderId,
          type: WorkOrderItemType.PART,
          productId: dto.productId,
          description: dto.description || prod.name,
          quantity: dto.quantity,
          unitPrice: new Decimal(dto.unitPrice),
          taxRate: dto.taxRate || 20,
          taxAmount: new Decimal(taxAmount),
          totalPrice: new Decimal(totalPrice),
        },
      });
      await this.recalculateTotals(workOrderId, tx);
      await this.createAuditLog({ workOrderId, action: 'ADD_PART', userId, details: { lineId: line.id } }, tx);
      return line;
    });
  }

  async updateStatus(workOrderId: string, dto: ChangeStatusWorkOrderDto, userId?: string) {
    return this.prisma.extended.$transaction(async (tx) => {
      const wo = await this.findWorkOrderOrThrow(workOrderId, tx);
      this.assertMutable(wo.status);
      this.assertValidTransition(wo.status, dto.status);
      const updated = await tx.workOrder.update({
        where: { id: workOrderId },
        data: { status: dto.status },
      });
      await this.createAuditLog({ workOrderId, action: 'STATUS_CHANGE', userId, details: { from: wo.status, to: dto.status } }, tx);
      return updated;
    });
  }

  async generateInvoice(workOrderId: string, userId?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    return this.prisma.extended.$transaction(async (tx) => {
      const wo = await this.findWorkOrderOrThrow(workOrderId, tx);
      if (wo.status !== WorkOrderStatus.VEHICLE_READY) throw new BadRequestException('Only ready vehicles can be invoiced');

      const invoiceNo = `SRV${new Date().getFullYear()}${Math.floor(Math.random() * 1000000)}`;
      const invoice = await tx.serviceInvoice.create({
        data: {
          tenantId: (wo as any).tenantId,
          invoiceNo,
          accountId: wo.accountId,
          workOrderId: wo.id,
          invoiceDate: new Date(),
          grandTotal: wo.grandTotal,
          taxAmount: wo.taxAmount,
          totalAmount: wo.grandTotal.minus(wo.taxAmount),
          serviceInvoiceTipi: InvoiceType.SALE,
          currency: 'TRY',
          exchangeRate: 1,
        } as any,
      });

      await tx.workOrder.update({
        where: { id: workOrderId },
        data: { status: WorkOrderStatus.INVOICED_CLOSED },
      });

      await (tx as any).accountMovement.create({
        data: {
          tenantId: (wo as any).tenantId,
          accountId: wo.accountId,
          type: 'DEBIT',
          documentType: 'INVOICE',
          documentNo: invoiceNo,
          amount: wo.grandTotal,
          description: `Work Order Invoice: ${wo.workOrderNo}`,
          date: new Date(),
        },
      });

      await this.createAuditLog({ workOrderId, action: 'INVOICED', userId, details: { invoiceId: invoice.id } }, tx);
      return invoice;
    });
  }

  async findAll(options: any) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: Prisma.WorkOrderWhereInput = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };
    return this.prisma.extended.workOrder.findMany({
      where,
      include: {
        customerVehicle: true,
        account: { select: { id: true, code: true, title: true } },
        technician: { select: { id: true, fullName: true } },
      },
      skip: options.skip || 0,
      take: options.take || 20,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.findWorkOrderOrThrow(id);
  }
}
