import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CodeTemplateService } from '../code-template/code-template.service';
import { PurchaseWaybillService } from '../purchase-waybill/purchase-waybill.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
import { DeliveryNoteStatus, DeliveryNoteSourceType } from '../sales-waybill/sales-waybill.enums';
import { Prisma, LogAction, PurchaseOrderLocalStatus, InvoiceType, InvoiceStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ModuleType } from '../code-template/code-template.enums';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => PurchaseWaybillService))
    private purchaseWaybillService: PurchaseWaybillService,
    private codeTemplateService: CodeTemplateService,
  ) { }

  private async createLog(
    orderId: string,
    actionType: LogAction,
    userId?: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    await prisma.purchaseOrderLocalLog.create({
      data: {
        orderId: orderId,
        userId,
        actionType: actionType as any,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(query: QueryPurchaseOrderDto) {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 50;
    const skip = (page - 1) * limit;
    const tenantId = await this.tenantResolver.resolveForQuery();

    const where: Prisma.ProcurementOrderWhereInput = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (query.status) {
      where.status = query.status as any;
    }

    if (query.accountId) {
      where.accountId = query.accountId;
    }

    if (query.search) {
      where.OR = [
        { orderNo: { contains: query.search, mode: 'insensitive' } },
        { account: { title: { contains: query.search, mode: 'insensitive' } } },
        { account: { code: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.extended.procurementOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          account: {
            select: {
              id: true,
              code: true,
              title: true,
              type: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.extended.procurementOrder.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const order = await this.prisma.extended.procurementOrder.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
        deletedAt: null,
      },
      include: {
        account: true,
        items: {
          include: {
            product: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        logs: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        deliveryNotes: true,
        invoices: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    return order;
  }

  async create(
    dto: CreatePurchaseOrderDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { items, ...orderData } = dto;
    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    const existingOrder = await this.prisma.extended.procurementOrder.findFirst({
      where: {
        orderNo: orderData.orderNo,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (existingOrder) {
      throw new BadRequestException(`This order number already exists: ${orderData.orderNo}`);
    }

    // Account check
    const account = await this.prisma.extended.account.findUnique({
      where: { id: orderData.accountId },
    });

    if (!account) {
      throw new NotFoundException(`Account not found: ${orderData.accountId}`);
    }

    // Calculations
    let subTotal = new Decimal(0);
    let totalTax = new Decimal(0);
    let totalDiscount = new Decimal(0);

    const itemsWithCalculations = items.map((item) => {
      const unitPrice = new Decimal(item.unitPrice);
      const quantity = new Decimal(item.quantity);
      const lineTotal = quantity.mul(unitPrice);
      const lineDiscount = new Decimal(item.discountAmount || 0);
      const lineNetTotal = lineTotal.sub(lineDiscount);
      const lineTax = lineNetTotal.mul(new Decimal(item.vatRate)).div(100);

      subTotal = subTotal.add(lineTotal);
      totalTax = totalTax.add(lineTax);
      totalDiscount = totalDiscount.add(lineDiscount);

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        vatRate: item.vatRate,
        amount: lineNetTotal,
        vatAmount: lineTax,
      };
    });

    const generalDiscount = new Decimal(orderData.discount || 0);
    const finalTotalDiscount = totalDiscount.add(generalDiscount);
    const totalAmount = subTotal.sub(finalTotalDiscount);
    const grandTotal = totalAmount.add(totalTax);

    return this.prisma.extended.$transaction(async (tx) => {
      const order = await tx.procurementOrder.create({
        data: {
          orderNo: orderData.orderNo,
          accountId: orderData.accountId,
          date: orderData.date ? new Date(orderData.date) : new Date(),
          dueDate: orderData.dueDate ? new Date(orderData.dueDate) : null,
          tenantId: tenantId || undefined,
          status: orderData.status || PurchaseOrderLocalStatus.PENDING,
          totalAmount,
          vatAmount: totalTax,
          grandTotal,
          discount: generalDiscount,
          notes: orderData.notes,
          createdBy: userId,
          items: {
            create: itemsWithCalculations,
          },
        },
        include: {
          account: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      await this.createLog(
        order.id,
        'CREATE',
        userId,
        { order: orderData, items },
        ipAddress,
        userAgent,
        tx,
      );

      return order;
    });
  }

  async update(
    id: string,
    dto: UpdatePurchaseOrderDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const existingOrder = await this.findOne(id);

    if (existingOrder.status === PurchaseOrderLocalStatus.INVOICED) {
      throw new BadRequestException('Faturalandırılmış sipariş düzenlenemez');
    }

    if (existingOrder.status === PurchaseOrderLocalStatus.CANCELLED) {
      throw new BadRequestException('İptal edilmiş sipariş düzenlenemez');
    }

    const { items, ...orderData } = dto;

    return this.prisma.extended.$transaction(async (tx) => {
      let updatedData = { ...orderData } as any;

      if (items && items.length > 0) {
        // Delete old items
        await tx.procurementOrderItem.deleteMany({
          where: { orderId: id },
        });

        // Calculations
        let subTotal = new Decimal(0);
        let totalTax = new Decimal(0);
        let totalDiscount = new Decimal(0);

        const itemsWithCalculations = items.map((item) => {
          const unitPrice = new Decimal(item.unitPrice);
          const quantity = new Decimal(item.quantity);
          const lineTotal = quantity.mul(unitPrice);
          const lineDiscount = new Decimal(item.discountAmount || 0);
          const lineNetTotal = lineTotal.sub(lineDiscount);
          const lineTax = lineNetTotal.mul(new Decimal(item.vatRate)).div(100);

          subTotal = subTotal.add(lineTotal);
          totalTax = totalTax.add(lineTax);
          totalDiscount = totalDiscount.add(lineDiscount);

          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            vatRate: item.vatRate,
            amount: lineNetTotal,
            vatAmount: lineTax,
          };
        });

        const generalDiscount = new Decimal(dto.discount ?? Number(existingOrder.discount));
        const finalTotalDiscount = totalDiscount.add(generalDiscount);
        const totalAmount = subTotal.sub(finalTotalDiscount);
        const grandTotal = totalAmount.add(totalTax);

        updatedData.totalAmount = totalAmount;
        updatedData.vatAmount = totalTax;
        updatedData.grandTotal = grandTotal;
        updatedData.items = {
          create: itemsWithCalculations,
        };
      }

      const updatedOrder = await tx.procurementOrder.update({
        where: { id },
        data: {
          ...updatedData,
          updatedBy: userId,
        },
        include: {
          account: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      await this.createLog(
        id,
        'UPDATE',
        userId,
        { old: existingOrder, new: dto },
        ipAddress,
        userAgent,
        tx,
      );

      return updatedOrder;
    });
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const order = await this.findOne(id);

    if (order.status === PurchaseOrderLocalStatus.INVOICED) {
      throw new BadRequestException('Faturalandırılmış sipariş silinemez');
    }

    return this.prisma.extended.$transaction(async (tx) => {
      const deletedOrder = await tx.procurementOrder.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      await this.createLog(
        id,
        'DELETE',
        userId,
        { order: deletedOrder },
        ipAddress,
        userAgent,
        tx,
      );

      return deletedOrder;
    });
  }

  async cancel(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const order = await this.findOne(id);

    if (order.status === PurchaseOrderLocalStatus.INVOICED) {
      throw new BadRequestException('Faturalandırılmış sipariş iptal edilemez');
    }

    if (order.status === PurchaseOrderLocalStatus.CANCELLED) {
      throw new BadRequestException('Sipariş zaten iptal edilmiş');
    }

    return this.prisma.extended.$transaction(async (tx) => {
      const updatedOrder = await tx.procurementOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderLocalStatus.CANCELLED,
          updatedBy: userId,
        },
      });

      await this.createLog(
        id,
        LogAction.CANCELLATION,
        userId,
        { status: PurchaseOrderLocalStatus.CANCELLED },
        ipAddress,
        userAgent,
        tx,
      );

      return updatedOrder;
    });
  }

  async changeStatus(
    id: string,
    status: PurchaseOrderLocalStatus,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const order = await this.findOne(id);

    if (
      order.status === PurchaseOrderLocalStatus.INVOICED &&
      status !== PurchaseOrderLocalStatus.INVOICED
    ) {
      throw new BadRequestException('Faturalandırılmış siparişin durumu değiştirilemez');
    }

    return this.prisma.extended.$transaction(async (tx) => {
      const updatedOrder = await tx.procurementOrder.update({
        where: { id },
        data: {
          status,
          updatedBy: userId,
        },
      });

      await this.createLog(
        id,
        LogAction.STATUS_CHANGE,
        userId,
        { oldStatus: order.status, newStatus: status },
        ipAddress,
        userAgent,
        tx,
      );

      return updatedOrder;
    });
  }

  async markAsInvoiced(
    id: string,
    invoiceNo: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const order = await this.findOne(id);

    if (order.status === PurchaseOrderLocalStatus.INVOICED) {
      throw new BadRequestException('Order already invoiced');
    }

    return this.prisma.extended.$transaction(async (tx) => {
      const updatedOrder = await tx.procurementOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderLocalStatus.INVOICED,
          invoiceNo,
          updatedBy: userId,
        },
      });

      await this.createLog(
        id,
        LogAction.STATUS_CHANGE,
        userId,
        { oldStatus: order.status, newStatus: PurchaseOrderLocalStatus.INVOICED, invoiceNo },
        ipAddress,
        userAgent,
        tx,
      );

      return updatedOrder;
    });
  }

  async findDeleted(query: QueryPurchaseOrderDto) {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 50;
    const skip = (page - 1) * limit;
    const tenantId = await this.tenantResolver.resolveForQuery();

    const where: Prisma.ProcurementOrderWhereInput = {
      deletedAt: { not: null },
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (query.search) {
      where.OR = [
        { orderNo: { contains: query.search, mode: 'insensitive' } },
        { account: { title: { contains: query.search, mode: 'insensitive' } } },
        { account: { code: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.extended.procurementOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          account: true,
          deletedByUser: {
            select: { id: true, fullName: true, username: true },
          },
        },
        orderBy: { deletedAt: 'desc' },
      }),
      this.prisma.extended.procurementOrder.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async restore(id: string, userId?: string, ipAddress?: string, userAgent?: string) {
    const order = await this.prisma.extended.procurementOrder.findUnique({
      where: { id },
    });

    if (!order) throw new NotFoundException(`Order not found: id`);
    if (!order.deletedAt) throw new BadRequestException('Sipariş zaten aktif');

    return this.prisma.extended.$transaction(async (tx) => {
      const restoredOrder = await tx.procurementOrder.update({
        where: { id },
        data: {
          deletedAt: null,
          deletedBy: null,
          updatedBy: userId,
        },
      });

      await this.createLog(id, 'RESTORE', userId, {}, ipAddress, userAgent, tx);
      return restoredOrder;
    });
  }

  async createWaybill(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForCreate({ userId });
    const order = await this.findOne(id);

    if (order.status === PurchaseOrderLocalStatus.INVOICED || order.status === PurchaseOrderLocalStatus.CANCELLED) {
      throw new BadRequestException('Faturalandırılmış veya iptal edilmiş siparişlerden irsaliye oluşturulamaz');
    }

    // Logic for generating waybill from order items
    // This part depends on PurchaseWaybillService which is legacy named but functionally used
    let waybillNo: string;
    try {
      waybillNo = await this.codeTemplateService.getNextCode(ModuleType.DELIVERY_NOTE_PURCHASE);
    } catch (error) {
      const year = new Date().getFullYear();
      waybillNo = `IRS-${year}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    }

    const waybillItems = order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      vatRate: item.vatRate,
    }));

    const createWaybillDto = {
      deliveryNoteNo: waybillNo,
      deliveryNoteDate: new Date().toISOString(),
      accountId: order.accountId,
      sourceType: DeliveryNoteSourceType.ORDER,
      sourceId: order.id,
      status: DeliveryNoteStatus.NOT_INVOICED,
      discount: Number(order.discount) || 0,
      notes: `Sipariş ${order.orderNo} üzerinden oluşturuldu.`,
      items: waybillItems,
    };

    return this.purchaseWaybillService.create(
      createWaybillDto as any,
      userId,
      ipAddress,
      userAgent,
    );
  }
}
