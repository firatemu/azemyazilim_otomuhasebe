import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CodeTemplateService } from '../code-template/code-template.service';
import { CreatePurchaseWaybillDto } from './dto/create-purchase-waybill.dto';
import { UpdatePurchaseWaybillDto } from './dto/update-purchase-waybill.dto';
import { FilterPurchaseWaybillDto } from './dto/filter-purchase-waybill.dto';
import { DeliveryNoteSourceType, DeliveryNoteStatus, Prisma, LogAction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PurchaseWaybillService {
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
    await prisma.purchaseDeliveryNoteLog.create({
      data: {
        deliveryNoteId,
        userId,
        actionType,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(filterDto: FilterPurchaseWaybillDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const page = filterDto.page ? parseInt(filterDto.page, 10) : 1;
    const limit = filterDto.limit ? parseInt(filterDto.limit, 10) : 50;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseDeliveryNoteWhereInput = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (filterDto.status) {
      where.status = filterDto.status;
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
      this.prisma.extended.purchaseDeliveryNote.findMany({
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
      this.prisma.extended.purchaseDeliveryNote.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const deliveryNote = await this.prisma.extended.purchaseDeliveryNote.findUnique({
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
        invoice: {
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

    return deliveryNote;
  }

  async create(
    createDto: CreatePurchaseWaybillDto,
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

    const existingWaybill = await this.prisma.extended.purchaseDeliveryNote.findFirst({
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
      const order = await this.prisma.extended.procurementOrder.findUnique({
        where: { id: deliveryNoteData.sourceId },
      });

      if (!order) {
        throw new NotFoundException(`Order not found: ${deliveryNoteData.sourceId}`);
      }
    }

    // Calculate item amounts
    let subtotal = 0;
    let vatAmount = 0;

    const itemsWithCalculations = validItems.map((item) => {
      const totalAmount = item.quantity * item.unitPrice;
      const itemVat = (totalAmount * item.vatRate) / 100;

      subtotal += totalAmount;
      vatAmount += itemVat;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        totalAmount,
        vatAmount: itemVat,
      };
    });

    const discount = deliveryNoteData.discount || 0;
    subtotal -= discount;
    const grandTotal = subtotal + vatAmount;

    // Create deliveryNote and items with transaction
    return this.prisma.extended.$transaction(async (prisma) => {
      const deliveryNote = await prisma.purchaseDeliveryNote.create({
        data: {
          ...deliveryNoteData,
          ...(tenantId != null && { tenantId }),
          subtotal: new Decimal(subtotal),
          vatAmount: new Decimal(vatAmount),
          grandTotal: new Decimal(grandTotal),
          discount: new Decimal(discount),
          status: deliveryNoteData.status || DeliveryNoteStatus.NOT_INVOICED,
          createdBy: userId,
          items: {
            create: itemsWithCalculations.map(k => ({
              productId: k.productId,
              quantity: k.quantity,
              unitPrice: new Decimal(k.unitPrice),
              totalAmount: new Decimal(k.totalAmount),
              vatAmount: new Decimal(k.vatAmount),
              vatRate: k.vatRate,
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

      // Create stock movement (when product added)
      for (const item of itemsWithCalculations) {
        await prisma.productMovement.create({
          data: {
            ...(tenantId != null && { tenantId }),
            productId: item.productId,
            movementType: 'ENTRY',
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
            warehouseId: (deliveryNoteData as any).warehouseId || null,
            notes: `Purchase delivery note: ${deliveryNoteData.deliveryNoteNo}`,
          },
        });
      }

      // Link deliveryNoteId to Order (if sourceType: ORDER)
      if (deliveryNoteData.sourceType === DeliveryNoteSourceType.ORDER && deliveryNoteData.sourceId) {
        await prisma.procurementOrder.update({
          where: { id: deliveryNoteData.sourceId },
          data: {
            deliveryNoteId: deliveryNote.id,
          },
        });
      }

      // Create audit log
      await this.createLog(
        deliveryNote.id,
        LogAction.CREATE,
        userId,
        { deliveryNote: deliveryNoteData, items },
        ipAddress,
        userAgent,
        prisma,
      );

      return deliveryNote;
    });
  }

  async update(
    id: string,
    updateDto: UpdatePurchaseWaybillDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const existingWaybill = await this.prisma.extended.purchaseDeliveryNote.findUnique({
      where: { id },
      include: {
        items: true,
        invoice: true,
      },
    });

    if (!existingWaybill) {
      throw new NotFoundException(`Waybill not found: ${id}`);
    }

    // Invoiced waybill cannot be updated
    if (existingWaybill.status === DeliveryNoteStatus.INVOICED) {
      throw new BadRequestException('Invoiced waybill cannot be updated');
    }

    // Waybill linked to invoice cannot be updated
    if (existingWaybill.invoice) {
      throw new BadRequestException('Waybill linked to invoice cannot be updated');
    }

    const { items, ...deliveryNoteData } = updateDto;

    // Update with transaction
    return this.prisma.extended.$transaction(async (prisma) => {
      // If items are being updated
      if (items && items.length > 0) {
        // Mevcut itemsi sil
        await prisma.purchaseDeliveryNoteItem.deleteMany({
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
          const totalAmount = item.quantity * item.unitPrice;
          const itemVat = (totalAmount * item.vatRate) / 100;

          subtotal += totalAmount;
          vatAmount += itemVat;

          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            totalAmount,
            vatAmount: itemVat,
          };
        });

        const discount = deliveryNoteData.discount ?? existingWaybill.discount.toNumber();
        subtotal -= discount;
        const grandTotal = subtotal + vatAmount;

        await prisma.purchaseDeliveryNoteItem.createMany({
          data: itemsWithCalculations.map(k => ({
            productId: k.productId,
            quantity: k.quantity,
            deliveryNoteId: id,
            unitPrice: new Decimal(k.unitPrice),
            totalAmount: new Decimal(k.totalAmount),
            vatAmount: new Decimal(k.vatAmount),
            vatRate: k.vatRate,
          })),
        });

        // Update waybill amounts
        await prisma.purchaseDeliveryNote.update({
          where: { id },
          data: {
            ...deliveryNoteData,
            subtotal: new Decimal(subtotal),
            vatAmount: new Decimal(vatAmount),
            grandTotal: new Decimal(grandTotal),
            discount: new Decimal(discount),
            updatedBy: userId,
          },
        });
      } else {
        // Only deliveryNote info is being updated
        const discount = deliveryNoteData.discount ?? existingWaybill.discount.toNumber();
        const subtotal = existingWaybill.subtotal.toNumber() - discount + existingWaybill.discount.toNumber();
        const grandTotal = subtotal + existingWaybill.vatAmount.toNumber();

        await prisma.purchaseDeliveryNote.update({
          where: { id },
          data: {
            ...deliveryNoteData,
            subtotal: new Decimal(subtotal),
            vatAmount: existingWaybill.vatAmount,
            grandTotal: new Decimal(grandTotal),
            discount: new Decimal(discount),
            updatedBy: userId,
          },
        });
      }

      const updatedWaybill = await prisma.purchaseDeliveryNote.findUnique({
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
        LogAction.UPDATE,
        userId,
        { updateDto, oldData: existingWaybill },
        ipAddress,
        userAgent,
        prisma,
      );

      return updatedWaybill;
    });
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const deliveryNote = await this.prisma.extended.purchaseDeliveryNote.findUnique({
      where: { id },
      include: {
        invoice: true,
      },
    });

    if (!deliveryNote) {
      throw new NotFoundException(`Waybill not found: ${id}`);
    }

    // Invoiced waybill cannot be deleted
    if (deliveryNote.status === DeliveryNoteStatus.INVOICED) {
      throw new BadRequestException('Invoiced waybill cannot be deleted');
    }

    // Waybill linked to invoice cannot be deleted
    if (deliveryNote.invoice) {
      throw new BadRequestException('Waybill linked to invoice cannot be deleted');
    }

    return this.prisma.extended.$transaction(async (prisma) => {
      // Soft delete
      await prisma.purchaseDeliveryNote.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      // Sipariş'ten deliveryNoteId'yi kaldır
      if (deliveryNote.sourceType === DeliveryNoteSourceType.ORDER && deliveryNote.sourceId) {
        await prisma.procurementOrder.update({
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
}
