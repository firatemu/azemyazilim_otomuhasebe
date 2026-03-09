import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteType, QuoteStatus } from './quote.enums';
import { Prisma, LogAction } from '@prisma/client';

@Injectable()
export class QuoteService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) { }

  private async createLog(
    quoteId: string,
    actionType: LogAction,
    userId?: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    await prisma.quoteLog.create({
      data: {
        quoteId,
        userId,
        actionType,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  private async generateUniqueOrderNo(
    prisma: Prisma.TransactionClient,
    prefix: string,
    year: number,
  ): Promise<string> {
    let currentNumber = 0;

    const lastSalesOrder = await prisma.salesOrder.findFirst({
      where: {
        orderNo: {
          startsWith: `${prefix}-${year}-`,
        },
      },
      orderBy: {
        orderNo: 'desc',
      },
      select: {
        orderNo: true,
      },
    });

    if (lastSalesOrder) {
      const parsed = parseInt(lastSalesOrder.orderNo.split('-')[2], 10);
      currentNumber = Number.isNaN(parsed) ? 0 : parsed;
    }

    for (let attempt = 0; attempt < 1000; attempt += 1) {
      currentNumber += 1;
      const candidate = `${prefix}-${year}-${currentNumber.toString().padStart(3, '0')}`;

      // TODO: TenantContextService inject et ve tenantId kontrolü yap
      const exists = await prisma.salesOrder.findFirst({
        where: { orderNo: candidate },
        select: { id: true },
      });

      if (!exists) {
        return candidate;
      }
    }

    throw new BadRequestException(
      'Failed to generate a new order number. Please try again later.',
    );
  }

  async findAll(
    page = 1,
    limit = 50,
    quoteType?: QuoteType,
    search?: string,
    accountId?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;

    const where: Prisma.QuoteWhereInput = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (quoteType) {
      where.quoteType = quoteType as any;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (search) {
      where.OR = [
        { quoteNo: { contains: search, mode: 'insensitive' } },
        { account: { title: { contains: search, mode: 'insensitive' } } },
        { account: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.extended.quote.findMany({
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
      }),
      this.prisma.extended.quote.count({ where }),
    ]);

    return {
      data: data.map((q: any) => ({
        ...q,
        // Backward-compatible aliases
        account: q.account
          ? {
            id: q.account.id,
            code: q.account.code,
            title: q.account.title,
            type: q.account.type,
          }
          : null,
        _count: q._count ? { ...q._count, items: q._count.items } : q._count,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const quote = await this.prisma.extended.quote.findUnique({
      where: { id },
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
        updatedByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        deletedByUser: {
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
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote not found: ${id}`);
    }

    return {
      ...quote,
      // Backward-compatible aliases
      account: (quote as any).account,
      items: (quote as any).items,
    };
  }

  async create(
    createQuoteDto: CreateQuoteDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { items, ...quoteData } = createQuoteDto;

    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    const existingQuote = await this.prisma.extended.quote.findFirst({
      where: {
        quoteNo: quoteData.quoteNo,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (existingQuote) {
      throw new BadRequestException(
        `This quote number already exists: ${quoteData.quoteNo}`,
      );
    }

    // Account check
    const account = await this.prisma.extended.account.findUnique({
      where: { id: quoteData.accountId },
    });

    if (!account) {
      throw new NotFoundException(`Account not found: ${quoteData.accountId}`);
    }

    // Calculate item amounts
    let subtotal = 0;
    let totalItemDiscount = 0;
    let vatAmount = 0;

    const itemsWithCalculations = items.map((item) => {
      const unitPrice = item.unitPrice;
      const itemSubtotal = item.quantity * unitPrice;
      const itemDiscountAmount = item.discountAmount || 0;
      const netAmount = itemSubtotal - itemDiscountAmount;
      const itemVat = (netAmount * item.vatRate) / 100;

      subtotal += itemSubtotal;
      totalItemDiscount += itemDiscountAmount;
      vatAmount += itemVat;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice,
        vatRate: item.vatRate,
        amount: netAmount,
        vatAmount: itemVat,
        discountRate: item.discountRate || null,
        discountAmount: item.discountAmount || null,
      };
    });

    const generalDiscount = quoteData.discount || 0;
    const totalDiscount = totalItemDiscount + generalDiscount;
    const totalAmount = subtotal - totalDiscount;
    const grandTotal = totalAmount + vatAmount;

    // Create quote and items with transaction
    return this.prisma.extended.$transaction(async (prisma) => {
      const quote = await prisma.quote.create({
        data: {
          quoteNo: quoteData.quoteNo,
          quoteType: quoteData.quoteType as any,
          accountId: quoteData.accountId,
          date: new Date(quoteData.date),
          ...(tenantId != null && { tenantId }),
          validUntil: quoteData.validUntil
            ? new Date(quoteData.validUntil)
            : null,
          discount: totalDiscount,
          totalAmount: totalAmount as any,
          vatAmount: vatAmount as any,
          grandTotal: grandTotal as any,
          notes: quoteData.notes,
          ...(quoteData.status && { status: quoteData.status as any }),
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

      // Create audit log
      await this.createLog(
        quote.id,
        'CREATE',
        userId,
        { quote: quoteData, items },
        ipAddress,
        userAgent,
        prisma,
      );

      return {
        ...quote,
        account: (quote as any).account,
        items: (quote as any).items,
      };
    });
  }

  async update(
    id: string,
    updateQuoteDto: UpdateQuoteDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const quote = await this.prisma.extended.quote.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!quote) {
      throw new NotFoundException(`Quote not found: ${id}`);
    }

    if (quote.status === 'CONVERTED_TO_ORDER') {
      throw new BadRequestException(
        'Quote converted to order cannot be updated',
      );
    }

    if (quote.deletedAt) {
      throw new BadRequestException('Deleted quote cannot be updated');
    }

    const { items, ...quoteData } = updateQuoteDto;

    // If items are not updated, only update quote information
    if (!items) {
      const updated = await this.prisma.extended.quote.update({
        where: { id },
        data: {
          ...(quoteData.quoteNo && { quoteNo: quoteData.quoteNo }),
          ...(quoteData.quoteType && { quoteType: quoteData.quoteType as any }),
          ...(quoteData.accountId && { accountId: quoteData.accountId }),
          ...(quoteData.date && { date: new Date(quoteData.date) }),
          validUntil: quoteData.validUntil
            ? new Date(quoteData.validUntil)
            : null,
          ...(quoteData.discount != null && { discount: quoteData.discount as any }),
          ...(quoteData.notes != null && { notes: quoteData.notes }),
          ...(quoteData.status && { status: quoteData.status as any }),
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
        { changes: updateQuoteDto },
        ipAddress,
        userAgent,
      );

      return {
        ...updated,
        account: (updated as any).account,
        items: (updated as any).items,
      };
    }

    // If items are being updated, process within transaction
    return this.prisma.extended.$transaction(async (prisma) => {
      // Delete existing items
      await prisma.quoteItem.deleteMany({
        where: { quoteId: id },
      });

      // Calculate item amounts
      let subtotal = 0;
      let totalItemDiscount = 0;
      let vatAmount = 0;

      const itemsWithCalculations = items.map((item) => {
        const unitPrice = item.unitPrice;
        const itemSubtotal = item.quantity * unitPrice;
        const itemDiscountAmount = item.discountAmount || 0;
        const netAmount = itemSubtotal - itemDiscountAmount;
        const itemVat = (netAmount * item.vatRate) / 100;

        subtotal += itemSubtotal;
        totalItemDiscount += itemDiscountAmount;
        vatAmount += itemVat;

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: unitPrice,
          vatRate: item.vatRate,
          amount: netAmount,
          vatAmount: itemVat,
          discountRate: item.discountRate || null,
          discountAmount: item.discountAmount || null,
        };
      });

      const generalDiscount = quoteData.discount || 0;
      const totalDiscount = totalItemDiscount + generalDiscount;
      const totalAmount = subtotal - totalDiscount;
      const grandTotal = totalAmount + vatAmount;

      const updated = await prisma.quote.update({
        where: { id },
        data: {
          ...(quoteData.quoteNo && { quoteNo: quoteData.quoteNo }),
          ...(quoteData.quoteType && { quoteType: quoteData.quoteType as any }),
          ...(quoteData.accountId && { accountId: quoteData.accountId }),
          ...(quoteData.date && { date: new Date(quoteData.date) }),
          validUntil: quoteData.validUntil
            ? new Date(quoteData.validUntil)
            : null,
          discount: totalDiscount,
          totalAmount: totalAmount as any,
          vatAmount: vatAmount as any,
          grandTotal: grandTotal as any,
          ...(quoteData.notes != null && { notes: quoteData.notes }),
          ...(quoteData.status && { status: quoteData.status as any }),
          updatedBy: userId,
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
        id,
        'UPDATE',
        userId,
        { changes: updateQuoteDto },
        ipAddress,
        userAgent,
        prisma,
      );

      return {
        ...updated,
        account: (updated as any).account,
        items: (updated as any).items,
      };
    });
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const quote = await this.findOne(id);

    if ((quote as any).status === 'CONVERTED_TO_ORDER') {
      throw new BadRequestException('Quote converted to order cannot be deleted');
    }

    await this.prisma.extended.quote.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    await this.createLog(id, 'DELETE', userId, null, ipAddress, userAgent);

    return { message: 'Quote deleted' };
  }

  async changeStatus(
    id: string,
    status: QuoteStatus,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const quote = await this.findOne(id);

    if ((quote as any).status === 'CONVERTED_TO_ORDER') {
      throw new BadRequestException(
        'The status of converted quote cannot be changed',
      );
    }

    const updated = await this.prisma.extended.quote.update({
      where: { id },
      data: {
        status: status as any,
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
      LogAction.STATUS_CHANGE,
      userId,
      { oldStatus: (quote as any).status, newStatus: status },
      ipAddress,
      userAgent,
    );

    return {
      ...updated,
      account: (updated as any).account,
      items: (updated as any).items,
    };
  }

  async convertToOrder(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const quote = await this.prisma.extended.quote.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!quote) {
      throw new NotFoundException(`Quote not found: ${id}`);
    }

    if (quote.status === 'CONVERTED_TO_ORDER') {
      throw new BadRequestException('This quote has already been converted to an order');
    }

    if (quote.deletedAt) {
      throw new BadRequestException('Deleted quote cannot be converted to order');
    }

    // Create order number
    const orderType = quote.quoteType === 'SALE' ? 'SALE' : 'PURCHASE';
    const prefix = orderType === 'SALE' ? 'SS' : 'SA';
    const year = new Date().getFullYear();

    return this.prisma.extended.$transaction(async (prisma) => {
      const orderNo = await this.generateUniqueOrderNo(
        prisma,
        prefix,
        year,
      );

      // Create order
      const order = await prisma.salesOrder.create({
        data: {
          orderNo,
          type: orderType as any,
          accountId: quote.accountId,
          date: new Date(),
          dueDate: quote.validUntil,
          discount: quote.discount,
          totalAmount: quote.totalAmount,
          vatAmount: quote.vatAmount,
          grandTotal: quote.grandTotal,
          notes:
            quote.notes ||
            `Created from quote ${quote.quoteNo}`,
          status: 'PENDING' as any,
          createdBy: userId,
          items: {
            create: quote.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              totalAmount: item.amount,
              vatAmount: item.vatAmount,
            })),
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

      // Update quote status
      await prisma.quote.update({
        where: { id },
        data: {
          status: 'CONVERTED_TO_ORDER',
          orderId: order.id,
          updatedBy: userId,
        },
      });

      // Log action
      await this.createLog(
        id,
        LogAction.CONVERTED_TO_ORDER,
        userId,
        { orderId: order.id, orderNo },
        ipAddress,
        userAgent,
        prisma,
      );

      return {
        message: 'Quote successfully converted to order',
        orderId: order.id,
        orderNo: order.orderNo,
        order: {
          ...order,
          account: (order as any).account,
          items: (order as any).items,
        },
      };
    });
  }
}
