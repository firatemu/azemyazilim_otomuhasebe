import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CodeTemplateService } from '../code-template/code-template.service';
import { DeliveryNoteSourceType as DeliveryNoteSourceType, DeliveryNoteStatus as DeliveryNoteStatus } from './sales-waybill.enums';
import { InvoiceType, InvoiceStatus } from '../invoice/invoice.enums';
import { CreateSalesWaybillDto } from './dto/create-sales-waybill.dto';
import { UpdateSalesWaybillDto } from './dto/update-sales-waybill.dto';
import { FilterSalesWaybillDto } from './dto/filter-sales-waybill.dto';
import { Prisma, LogAction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SalesWaybillService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    private codeTemplateService: CodeTemplateService,
  ) { }

  private async createLog(
    deliveryNoteId: string,
    actionType: LogAction,
    userId?: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    await prisma.salesDeliveryNoteLog.create({
      data: {
        deliveryNoteId: deliveryNoteId,
        userId,
        actionType,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(filterDto: FilterSalesWaybillDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const page = filterDto.page ? parseInt(filterDto.page, 10) : 1;
    const limit = filterDto.limit ? parseInt(filterDto.limit, 10) : 50;
    const skip = (page - 1) * limit;

    const where: Prisma.SalesDeliveryNoteWhereInput = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (filterDto.status) {
      where.status = filterDto.status as any;
    }

    if (filterDto.accountId) {
      where.accountId = filterDto.accountId;
    }

    if (filterDto.search) {
      where.OR = [
        { deliveryNoteNo: { contains: filterDto.search, mode: 'insensitive' } },
        { account: { title: { contains: filterDto.search, mode: 'insensitive' } } },
        { account: { code: { contains: filterDto.search, mode: 'insensitive' } } },
      ];
    }

    if (filterDto.startDate && filterDto.endDate) {
      where.date = {
        gte: new Date(filterDto.startDate),
        lte: new Date(filterDto.endDate),
      };
    } else if (filterDto.startDate) {
      where.date = {
        gte: new Date(filterDto.startDate),
      };
    } else if (filterDto.endDate) {
      where.date = {
        lte: new Date(filterDto.endDate),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.extended.salesDeliveryNote.findMany({
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
          warehouse: {
            select: {
              id: true,
              name: true,
            },
          },
          sourceOrder: {
            select: {
              id: true,
              orderNo: true,
            },
          },
          items: true,
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
      this.prisma.extended.salesDeliveryNote.count({ where }),
    ]);

    return {
      data: data.map((d: any) => ({
        ...d,
        // Backward-compatible aliases
        account: d.account
          ? { id: d.account.id, code: d.account.code, title: d.account.title, type: d.account.type }
          : null,
        warehouse: d.warehouse ? { id: d.warehouse.id, name: d.warehouse.name } : null,
        items: d.items,
        deliveryNoteNo: d.deliveryNoteNo,
        deliveryNoteDate: d.date,
        accountId: d.accountId,
        warehouseId: d.warehouseId,
        sourceType: d.sourceType,
        sourceId: d.sourceId,
        status: d.status,
        totalAmount: d.subtotal,
        grandTotal: d.grandTotal,
        discount: d.discount,
        notes: d.notes,
        _count: d._count ? { ...d._count, items: d._count.items } : d._count,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const deliveryNote = await this.prisma.extended.salesDeliveryNote.findUnique({
      where: { id },
      include: {
        account: true,
        warehouse: true,
        sourceOrder: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNo: true,
            date: true,
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
      },
    });

    if (!deliveryNote) {
      throw new NotFoundException(`Waybill not found: ${id}`);
    }

    return {
      ...deliveryNote,
      // Backward-compatible aliases
      account: (deliveryNote as any).account,
      warehouse: (deliveryNote as any).warehouse,
      items: (deliveryNote as any).items,
      invoices: (deliveryNote as any).invoices?.map((inv: any) => ({
        ...inv,
        invoiceNo: inv.invoiceNo,
        date: inv.date,
      })),
      deliveryNoteNo: (deliveryNote as any).deliveryNoteNo,
      deliveryNoteDate: (deliveryNote as any).date,
      accountId: (deliveryNote as any).accountId,
      warehouseId: (deliveryNote as any).warehouseId,
      sourceType: (deliveryNote as any).sourceType,
      sourceId: (deliveryNote as any).sourceId,
      status: (deliveryNote as any).status,
      totalAmount: (deliveryNote as any).subtotal,
      grandTotal: (deliveryNote as any).grandTotal,
      discount: (deliveryNote as any).discount,
      notes: (deliveryNote as any).notes,
    };
  }

  async create(
    createDto: CreateSalesWaybillDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { items, ...deliveryNoteData } = createDto;

    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    const validItems = items.filter(i => i.productId && i.productId.trim() !== '');
    if (validItems.length === 0) {
      throw new BadRequestException('At least one item must be added');
    }

    const existingWaybill = await this.prisma.extended.salesDeliveryNote.findFirst({
      where: {
        deliveryNoteNo: deliveryNoteData.deliveryNoteNo,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (existingWaybill) {
      throw new BadRequestException(
        `Waybill number already exists: ${deliveryNoteData.deliveryNoteNo}`,
      );
    }

    // Account check
    const account = await this.prisma.extended.account.findUnique({
      where: { id: deliveryNoteData.accountId },
    });

    if (!account) {
      throw new NotFoundException(`Account not found: ${deliveryNoteData.accountId}`);
    }

    // Order check (if sourceType: ORDER)
    if (deliveryNoteData.sourceType === DeliveryNoteSourceType.ORDER && deliveryNoteData.sourceId) {
      const salesOrder = await this.prisma.extended.salesOrder.findUnique({
        where: { id: deliveryNoteData.sourceId },
      });

      if (!salesOrder) {
        throw new NotFoundException(`Order not found: deliveryNoteData.sourceId`);
      }
    }

    // Calculate item amounts
    let subtotal = 0;
    let vatAmount = 0;

    const itemsWithCalculations = validItems.map((item) => {
      const amount = item.quantity * item.unitPrice;
      const itemVat = (amount * item.vatRate) / 100;

      subtotal += amount;
      vatAmount += itemVat;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        amount,
        vatAmount: itemVat,
      };
    });

    const discount = deliveryNoteData.discount || 0;
    subtotal -= discount;
    const grandTotal = subtotal + vatAmount;

    // Create deliveryNote and items with transaction
    return this.prisma.extended.$transaction(async (prisma) => {
      const deliveryNote = await prisma.salesDeliveryNote.create({
        data: {
          deliveryNoteNo: deliveryNoteData.deliveryNoteNo,
          date: new Date(deliveryNoteData.date),
          accountId: deliveryNoteData.accountId,
          warehouseId: deliveryNoteData.warehouseId || null,
          sourceType: deliveryNoteData.sourceType as any,
          sourceId: deliveryNoteData.sourceId || null,
          ...(tenantId != null && { tenantId }),
          subtotal: new Decimal(subtotal),
          vatAmount: new Decimal(vatAmount),
          grandTotal: new Decimal(grandTotal),
          discount: new Decimal(discount),
          notes: deliveryNoteData.notes,
          status: deliveryNoteData.status || DeliveryNoteStatus.NOT_INVOICED,
          createdBy: userId,
          items: {
            create: itemsWithCalculations.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: new Decimal(item.unitPrice),
              vatRate: item.vatRate,
              totalAmount: new Decimal(item.amount),
              vatAmount: new Decimal(item.vatAmount),
              ...(tenantId != null && { tenantId }),
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

      // Create stock movement (inventory decreases when deliveryNote is created)
      for (const item of itemsWithCalculations) {
        await prisma.productMovement.create({
          data: {
            ...(tenantId != null && { tenantId }),
            productId: item.productId,
            movementType: 'SALE',
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
            warehouseId: deliveryNoteData.warehouseId || null,
            notes: `Sales delivery note: ${deliveryNoteData.deliveryNoteNo}`,
          },
        });
      }

      // Bind deliveryNoteId to order (if sourceType: ORDER)
      if (deliveryNoteData.sourceType === DeliveryNoteSourceType.ORDER && deliveryNoteData.sourceId) {
        await prisma.salesOrder.update({
          where: { id: deliveryNoteData.sourceId },
          data: {
            deliveryNoteId: deliveryNote.id,
          },
        });
      }

      // Create audit log
      await this.createLog(
        deliveryNote.id,
        'CREATE',
        userId,
        { deliveryNote: deliveryNoteData, items },
        ipAddress,
        userAgent,
        prisma,
      );

      return {
        ...deliveryNote,
        account: (deliveryNote as any).account,
        warehouse: (deliveryNote as any).warehouse,
        items: (deliveryNote as any).items,
      };
    });
  }

  async update(
    id: string,
    updateDto: UpdateSalesWaybillDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const existingWaybill = await this.prisma.extended.salesDeliveryNote.findUnique({
      where: { id },
      include: {
        items: true,
        invoices: true,
      },
    });

    if (!existingWaybill) {
      throw new NotFoundException(`Waybill not found: ${id}`);
    }

    if (existingWaybill.status === DeliveryNoteStatus.INVOICED) {
      throw new BadRequestException('Invoiced waybills cannot be updated');
    }

    if (existingWaybill.invoices && existingWaybill.invoices.length > 0) {
      throw new BadRequestException('Waybills linked to invoices cannot be updated');
    }

    const { items, ...deliveryNoteData } = updateDto;

    // Update with transaction
    return this.prisma.extended.$transaction(async (prisma) => {
      // If items are being updated
      if (items && items.length > 0) {
        // Delete existing items
        await prisma.salesDeliveryNoteItem.deleteMany({
          where: { deliveryNoteId: id },
        });

        // Add new items and calculate amounts
        let subtotal = 0;
        let vatAmount = 0;

        const validItems = items.filter(i => i.productId && i.productId.trim() !== '');

        if (validItems.length === 0) {
          throw new BadRequestException('At least one item must be added');
        }

        const itemsWithCalculations = validItems.map((item) => {
          const amount = item.quantity * item.unitPrice;
          const itemVat = (amount * item.vatRate) / 100;

          subtotal += amount;
          vatAmount += itemVat;

          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            amount,
            vatAmount: itemVat,
          };
        });

        const discount = deliveryNoteData.discount ?? existingWaybill.discount.toNumber();
        subtotal -= discount;
        const grandTotal = subtotal + vatAmount;

        await prisma.salesDeliveryNoteItem.createMany({
          data: itemsWithCalculations.map(item => ({
            deliveryNoteId: id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
            vatRate: item.vatRate,
            totalAmount: new Decimal(item.amount),
            vatAmount: new Decimal(item.vatAmount),
          })),
        });

        // Update waybill amounts
        await prisma.salesDeliveryNote.update({
          where: { id },
          data: {
            ...(deliveryNoteData.deliveryNoteNo && { deliveryNoteNo: deliveryNoteData.deliveryNoteNo }),
            ...(deliveryNoteData.date && { date: new Date(deliveryNoteData.date) }),
            ...(deliveryNoteData.accountId && { accountId: deliveryNoteData.accountId }),
            ...(deliveryNoteData.warehouseId !== undefined && { warehouseId: deliveryNoteData.warehouseId || null }),
            ...(deliveryNoteData.sourceType && { sourceType: deliveryNoteData.sourceType as any }),
            ...(deliveryNoteData.sourceId !== undefined && { sourceId: deliveryNoteData.sourceId || null }),
            ...(deliveryNoteData.status && { status: deliveryNoteData.status as any }),
            ...(deliveryNoteData.notes !== undefined && { notes: deliveryNoteData.notes }),
            subtotal: new Decimal(subtotal),
            vatAmount: new Decimal(vatAmount),
            grandTotal: new Decimal(grandTotal),
            discount: new Decimal(discount),
            updatedBy: userId,
          },
        });
      } else {
        // Only deliveryNote info is updating
        const discount = deliveryNoteData.discount ?? existingWaybill.discount.toNumber();
        const subtotal = existingWaybill.subtotal.toNumber() - discount + existingWaybill.discount.toNumber();
        const grandTotal = subtotal + existingWaybill.vatAmount.toNumber();

        await prisma.salesDeliveryNote.update({
          where: { id },
          data: {
            ...(deliveryNoteData.deliveryNoteNo && { deliveryNoteNo: deliveryNoteData.deliveryNoteNo }),
            ...(deliveryNoteData.date && { date: new Date(deliveryNoteData.date) }),
            ...(deliveryNoteData.accountId && { accountId: deliveryNoteData.accountId }),
            ...(deliveryNoteData.warehouseId !== undefined && { warehouseId: deliveryNoteData.warehouseId || null }),
            ...(deliveryNoteData.sourceType && { sourceType: deliveryNoteData.sourceType as any }),
            ...(deliveryNoteData.sourceId !== undefined && { sourceId: deliveryNoteData.sourceId || null }),
            ...(deliveryNoteData.status && { status: deliveryNoteData.status as any }),
            ...(deliveryNoteData.notes !== undefined && { notes: deliveryNoteData.notes }),
            subtotal: new Decimal(subtotal),
            vatAmount: existingWaybill.vatAmount,
            grandTotal: new Decimal(grandTotal),
            discount: new Decimal(discount),
            updatedBy: userId,
          },
        });
      }

      const updatedWaybill = await prisma.salesDeliveryNote.findUnique({
        where: { id },
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
        id,
        'UPDATE',
        userId,
        { updateDto, oldData: existingWaybill },
        ipAddress,
        userAgent,
        prisma,
      );

      return updatedWaybill
        ? {
          ...updatedWaybill,
          account: (updatedWaybill as any).account,
          warehouse: (updatedWaybill as any).warehouse,
          items: (updatedWaybill as any).items,
        }
        : updatedWaybill;
    });
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const deliveryNote = await this.prisma.extended.salesDeliveryNote.findUnique({
      where: { id },
      include: {
        invoices: true,
      },
    });

    if (!deliveryNote) {
      throw new NotFoundException(`Waybill not found: ${id}`);
    }

    // Invoiced deliveryNote cannot be deleted
    if (deliveryNote.status === DeliveryNoteStatus.INVOICED) {
      throw new BadRequestException('Invoiced waybill cannot be deleted');
    }

    // DeliveryNote linked to an invoice cannot be deleted
    if (deliveryNote.invoices && deliveryNote.invoices.length > 0) {
      throw new BadRequestException('Waybill linked to an invoice cannot be deleted');
    }

    return this.prisma.extended.$transaction(async (prisma) => {
      // Soft delete
      await prisma.salesDeliveryNote.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      // Remove deliveryNoteId from Order
      if (deliveryNote.sourceType === DeliveryNoteSourceType.ORDER && deliveryNote.sourceId) {
        await prisma.salesOrder.update({
          where: { id: deliveryNote.sourceId },
          data: {
            deliveryNoteId: null,
          },
        });
      }

      // Create audit log
      await this.createLog(
        id,
        LogAction.DELETE,
        userId,
        { deliveryNote },
        ipAddress,
        userAgent,
        prisma,
      );
    });
  }

  async getPendingByAccount(accountId: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.extended.salesDeliveryNote.findMany({
      where: {
        accountId: accountId,
        status: { not: DeliveryNoteStatus.INVOICED as any },
        deletedAt: null,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' },
    });
  }
}
