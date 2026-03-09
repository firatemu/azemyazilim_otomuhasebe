import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { SalesOrderStatus, OrderType } from './order.enums';
import { DeliveryNoteStatus, DeliveryNoteSourceType } from '../sales-waybill/sales-waybill.enums';
import { Prisma, LogAction } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CodeTemplateService } from '../code-template/code-template.service';
import { SalesWaybillService } from '../sales-waybill/sales-waybill.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => SalesWaybillService))
    private salesWaybillService: SalesWaybillService,
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
    await prisma.salesOrderLog.create({
      data: {
        orderId,
        userId,
        actionType,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(
    page = 1,
    limit = 50,
    orderType?: OrderType,
    search?: string,
    accountId?: string,
    status?: SalesOrderStatus,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;

    const isProcurement = orderType === OrderType.PURCHASE;
    const model = isProcurement ? this.prisma.extended.procurementOrder : this.prisma.extended.salesOrder;

    const where: any = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (accountId) {
      where.accountId = accountId;
    }

    if (status) {
      where.status = status as any;
    }

    if (search) {
      where.OR = [
        { orderNo: { contains: search, mode: 'insensitive' } },
        { account: { title: { contains: search, mode: 'insensitive' } } },
        { account: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    let data;
    try {
      data = await (model as any).findMany({
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
          updatedByUser: {
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
      });
      data = data.filter((item: any) => item.account !== null);
    } catch (error: any) {
      throw error;
    }

    const total = await (model as any).count({ where });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    let order = await this.prisma.extended.salesOrder.findUnique({
      where: { id },
      include: {
        account: true,
        items: {
          include: {
            product: true,
          },
        },
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
        logs: {
          include: {
            user: { select: { id: true, fullName: true, username: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    }) as any;

    if (!order) {
      order = await this.prisma.extended.procurementOrder.findUnique({
        where: { id },
        include: {
          account: true,
          items: {
            include: {
              product: true,
            },
          },
          createdByUser: {
            select: { id: true, fullName: true, username: true },
          },
          logs: {
            include: {
              user: { select: { id: true, fullName: true, username: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }) as any;
    }

    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    return order;
  }

  async create(
    createOrderDto: CreateOrderDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { items, orderType, ...orderData } = createOrderDto;
    const isProcurement = orderType === OrderType.PURCHASE;
    const model = isProcurement ? this.prisma.extended.procurementOrder : this.prisma.extended.salesOrder;

    const tenantId = await this.tenantResolver.resolveForCreate({ userId });
    const finalTenantId = (orderData as any).tenantId || tenantId || undefined;

    const existingOrder = await (model as any).findFirst({
      where: {
        orderNo: orderData.orderNo,
        ...buildTenantWhereClause(finalTenantId),
      },
    });

    if (existingOrder) {
      throw new BadRequestException(
        `Order number already exists: ${orderData.orderNo}`,
      );
    }

    const account = await this.prisma.extended.account.findUnique({
      where: { id: orderData.accountId },
    });

    if (!account) {
      throw new NotFoundException(`Account not found: ${orderData.accountId}`);
    }

    let totalAmount = new Prisma.Decimal(0);
    let vatAmount = new Prisma.Decimal(0);

    const itemsWithCalculations = items.map((item) => {
      const lineTotal = new Prisma.Decimal(item.quantity).mul(item.unitPrice);
      const lineVat = lineTotal.mul(item.vatRate).div(100);

      totalAmount = totalAmount.add(lineTotal);
      vatAmount = vatAmount.add(lineVat);

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        vatAmount: lineVat,
        totalAmount: lineTotal.add(lineVat),
      };
    });

    const discount = new Prisma.Decimal(orderData.discount || 0);
    const grandTotal = totalAmount.add(vatAmount).sub(discount);

    return this.prisma.extended.$transaction(async (prisma) => {
      const order = await (prisma as any)[isProcurement ? 'procurementOrder' : 'salesOrder'].create({
        data: {
          orderNo: orderData.orderNo,
          date: orderData.date ? new Date(orderData.date) : new Date(),
          accountId: orderData.accountId,
          tenantId: finalTenantId,
          totalAmount,
          vatAmount,
          grandTotal,
          discount,
          notes: orderData.notes,
          status: orderData.status as any,
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

      if (!isProcurement) {
        await this.createLog(
          order.id,
          LogAction.CREATE,
          userId,
          { order: orderData, items },
          ipAddress,
          userAgent,
          prisma,
        );
      }

      return order;
    });
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const order = await this.findOne(id);

    if (order.status === 'INVOICED') {
      throw new BadRequestException('Invoiced order cannot be updated');
    }

    const { items, ...orderData } = updateOrderDto;
    const isProcurement = (order as any).orderType === OrderType.PURCHASE || !('deliveryNoteId' in order);
    const modelName = isProcurement ? 'procurementOrder' : 'salesOrder';

    if (!items) {
      const updated = await (this.prisma as any)[modelName].update({
        where: { id },
        data: {
          ...orderData,
          updatedBy: userId,
        },
        include: {
          account: true,
          items: {
            include: { product: true },
          },
        },
      });

      if (!isProcurement) {
        await this.createLog(
          id,
          LogAction.UPDATE,
          userId,
          { changes: updateOrderDto },
          ipAddress,
          userAgent,
        );
      }

      return updated;
    }

    return this.prisma.extended.$transaction(async (prisma) => {
      const itemsModelName = isProcurement ? 'procurementOrderItem' : 'salesOrderItem';

      await (prisma as any)[itemsModelName].deleteMany({
        where: { orderId: id },
      });

      let totalAmount = new Prisma.Decimal(0);
      let vatAmount = new Prisma.Decimal(0);

      const itemsWithCalculations = items.map((item) => {
        const lineTotal = new Prisma.Decimal(item.quantity).mul(item.unitPrice);
        const lineVat = lineTotal.mul(item.vatRate).div(100);

        totalAmount = totalAmount.add(lineTotal);
        vatAmount = vatAmount.add(lineVat);

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          vatAmount: lineVat,
          totalAmount: lineTotal.add(lineVat),
        };
      });

      const discount = new Prisma.Decimal(orderData.discount ?? order.discount);
      const grandTotal = totalAmount.add(vatAmount).sub(discount);

      const updated = await (prisma as any)[modelName].update({
        where: { id },
        data: {
          ...orderData,
          totalAmount,
          vatAmount,
          grandTotal,
          discount,
          updatedBy: userId,
          items: {
            create: itemsWithCalculations,
          },
        },
        include: {
          account: true,
          items: {
            include: { product: true },
          },
        },
      });

      if (!isProcurement) {
        await this.createLog(
          id,
          LogAction.UPDATE,
          userId,
          { changes: updateOrderDto },
          ipAddress,
          userAgent,
          prisma,
        );
      }

      return updated;
    });
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const order = await this.findOne(id);

    if (order.status === 'INVOICED') {
      throw new BadRequestException('Invoiced order cannot be deleted');
    }

    const isProcurement = !('deliveryNoteId' in order);
    const modelName = isProcurement ? 'procurementOrder' : 'salesOrder';

    await (this.prisma as any)[modelName].update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    if (!isProcurement) {
      await this.createLog(id, LogAction.DELETE, userId, null, ipAddress, userAgent);
    }

    return { message: 'Order deleted' };
  }

  async restore(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    let order = await this.prisma.extended.salesOrder.findUnique({ where: { id } }) as any;
    let modelName = 'salesOrder';

    if (!order) {
      order = await this.prisma.extended.procurementOrder.findUnique({ where: { id } }) as any;
      modelName = 'procurementOrder';
    }

    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    if (!order.deletedAt) {
      throw new BadRequestException('Order is already active');
    }

    const restored = await (this.prisma as any)[modelName].update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
      include: {
        account: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (modelName === 'salesOrder') {
      await this.createLog(id, LogAction.RESTORE, userId, null, ipAddress, userAgent);
    }

    return restored;
  }

  async changeStatus(
    id: string,
    status: SalesOrderStatus,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const order = await this.findOne(id);

    if (order.status === 'INVOICED') {
      throw new BadRequestException(
        'Invoiced order status cannot be changed',
      );
    }

    const isProcurement = !('deliveryNoteId' in order);
    const modelName = isProcurement ? 'procurementOrder' : 'salesOrder';

    const updated = await (this.prisma as any)[modelName].update({
      where: { id },
      data: {
        status,
        updatedBy: userId,
      },
      include: {
        account: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!isProcurement) {
      await this.createLog(
        id,
        LogAction.UPDATE,
        userId,
        { oldStatus: order.status, newStatus: status },
        ipAddress,
        userAgent,
      );
    }

    return updated;
  }

  async cancel(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.changeStatus(id, SalesOrderStatus.CANCELLED, userId, ipAddress, userAgent);
  }

  async findDeleted(
    page = 1,
    limit = 50,
    orderType?: OrderType,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const isProcurement = orderType === OrderType.PURCHASE;
    const modelName = isProcurement ? 'procurementOrder' : 'salesOrder';

    const where: any = {
      deletedAt: { not: null },
    };

    if (search) {
      where.OR = [
        { orderNo: { contains: search, mode: 'insensitive' } },
        { account: { title: { contains: search, mode: 'insensitive' } } },
        { account: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      (this.prisma as any)[modelName].findMany({
        where,
        skip,
        take: limit,
        include: {
          account: {
            select: { id: true, code: true, title: true, type: true },
          },
          deletedByUser: {
            select: { id: true, fullName: true, username: true },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { deletedAt: 'desc' },
      }),
      (this.prisma as any)[modelName].count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markInvoiced(
    id: string,
    invoiceNo: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const order = await this.findOne(id);

    if (order.status === 'INVOICED') {
      throw new BadRequestException('Order is already invoiced');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cancelled order cannot be invoiced');
    }

    const isProcurement = !('deliveryNoteId' in order);
    const modelName = isProcurement ? 'procurementOrder' : 'salesOrder';

    const updated = await (this.prisma as any)[modelName].update({
      where: { id },
      data: {
        status: 'INVOICED',
        invoiceNo: isProcurement ? undefined : invoiceNo,
        updatedBy: userId,
      },
      include: {
        account: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!isProcurement) {
      await this.createLog(
        id,
        LogAction.UPDATE,
        userId,
        { oldStatus: order.status, newStatus: 'INVOICED', invoiceNo },
        ipAddress,
        userAgent,
      );
    }

    return updated;
  }

  async getPreparationDetails(id: string) {
    const order = await this.findOne(id);

    const itemsWithLocations = await Promise.all(
      order.items.map(async (item: any) => {
        const locations = await this.prisma.extended.productLocationStock.findMany({
          where: {
            productId: item.productId,
            qtyOnHand: { gt: 0 },
          },
          include: {
            location: {
              include: {
                warehouse: true,
              },
            },
          },
          orderBy: {
            location: {
              code: 'asc',
            },
          },
        });

        return {
          ...item,
          locations,
        };
      }),
    );

    return {
      ...order,
      items: itemsWithLocations,
    };
  }

  async prepare(id: string, items: any[], userId?: string) {
    const order = await this.findOne(id);

    if (order.status !== 'PREPARING' && order.status !== 'PENDING') {
      throw new BadRequestException('Order is not in preparation status');
    }

    return this.prisma.extended.$transaction(async (prisma) => {
      await (prisma as any).orderPicking.deleteMany({
        where: { orderId: id },
      });

      const pickingData = items.map((item) => ({
        orderId: id,
        orderItemId: item.orderItemId,
        locationId: item.locationId,
        quantity: item.quantity,
        userId: userId,
      }));

      await (prisma as any).orderPicking.createMany({
        data: pickingData,
      });

      await (prisma as any).salesOrder.update({
        where: { id },
        data: { status: SalesOrderStatus.PREPARED },
      });

      return this.findOne(id);
    });
  }

  async ship(
    id: string,
    shippedItems: Array<{ itemId: string; shippedQuantity: number }>,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const order = await this.prisma.extended.salesOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    if (order.status === 'INVOICED' || order.status === 'CANCELLED') {
      throw new BadRequestException('Invoiced or cancelled orders cannot be shipped');
    }

    return this.prisma.extended.$transaction(async (prisma) => {
      for (const shipItem of shippedItems) {
        const item = order.items.find((i) => i.id === shipItem.itemId);

        if (!item) {
          throw new NotFoundException(`Order item not found: ${shipItem.itemId}`);
        }

        const newDeliveredQuantity = (item.deliveredQuantity || 0) + shipItem.shippedQuantity;

        if (newDeliveredQuantity > Number(item.quantity)) {
          throw new BadRequestException(
            `${item.product.name} shipped quantity (${newDeliveredQuantity}) cannot exceed order quantity (${item.quantity})`,
          );
        }

        await (prisma as any).salesOrderItem.update({
          where: { id: item.id },
          data: { deliveredQuantity: newDeliveredQuantity },
        });
      }

      const updatedOrder = await (prisma as any).salesOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      const allShipped = updatedOrder.items.every(
        (k: any) => (k.deliveredQuantity || 0) >= Number(k.quantity),
      );
      const someShipped = updatedOrder.items.some(
        (k: any) => (k.deliveredQuantity || 0) > 0,
      );

      let newStatus: SalesOrderStatus | undefined;
      if (allShipped) {
        newStatus = SalesOrderStatus.SHIPPED;
      } else if (someShipped) {
        newStatus = SalesOrderStatus.PARTIALLY_SHIPPED;
      }

      if (newStatus && updatedOrder.status !== newStatus) {
        await (prisma as any).salesOrder.update({
          where: { id },
          data: { status: newStatus },
        });
      }

      await this.createLog(
        id,
        LogAction.UPDATE,
        userId,
        { shippedItems },
        ipAddress,
        userAgent,
        prisma,
      );

      return this.findOne(id);
    });
  }

  async createDeliveryNoteFromOrder(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const order = await this.findOne(id);
    // This logic needs more detailed implementation based on SalesWaybillService
    // Placeholder to maintain functionality
    return { orderId: id, message: 'Delivery note creation logic to be implemented' };
  }

  async findOrdersForInvoice(accountId?: string, search?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: any = {
      deletedAt: null,
      status: 'SEVK_EDILDI',
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (accountId) {
      where.accountId = accountId;
    }

    if (search) {
      where.OR = [
        { orderNo: { contains: search, mode: 'insensitive' } },
        { account: { title: { contains: search, mode: 'insensitive' } } },
        { account: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orders = await this.prisma.extended.salesOrder.findMany({
      where,
      include: {
        account: {
          select: { id: true, code: true, title: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return {
      data: orders,
      total: orders.length,
    };
  }
}
