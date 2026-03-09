import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InvoiceType, InvoiceStatus } from './invoice.enums';
import { DeliveryNoteSourceType, DeliveryNoteStatus } from '../sales-waybill/sales-waybill.enums';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { ModuleType } from '../code-template/code-template.enums';
import { CodeTemplateService } from '../code-template/code-template.service';
import { SalesWaybillService } from '../sales-waybill/sales-waybill.service';
import { InvoiceProfitService } from '../invoice-profit/invoice-profit.service';
import { CostingService } from '../costing/costing.service';
import { SystemParameterService } from '../system-parameter/system-parameter.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoicePaymentPlanDto } from './dto/create-invoice-payment-plan.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { DeletionProtectionService } from '../../common/services/deletion-protection.service';
import { TcmbService } from '../../common/services/tcmb.service';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    private codeTemplateService: CodeTemplateService,
    @Inject(forwardRef(() => SalesWaybillService))
    private salesWaybillService: SalesWaybillService,
    private invoiceProfitService: InvoiceProfitService,
    private costingService: CostingService,
    private systemParameterService: SystemParameterService,
    private warehouseService: WarehouseService,
    private deletionProtection: DeletionProtectionService,
    private tcmbService: TcmbService,
  ) { }

  /** Prisma Decimal veya number'ı güvenle number'a çevirir (null/undefined → 0). */
  private toDecimalNumber(val: unknown): number {
    if (val == null) return 0;
    if (typeof val === 'number' && !Number.isNaN(val)) return val;
    if (typeof val === 'object' && val !== null && 'toNumber' in val && typeof (val as any).toNumber === 'function')
      return (val as any).toNumber();
    return Number(val) || 0;
  }

  private async createLog(
    invoiceId: string,
    actionType: string,
    userId?: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    await prisma.invoiceLog.create({
      data: {
        invoiceId: invoiceId,
        userId,
        actionType: actionType as any,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Update warehouse stock (ProductLocationStock) and create StockMove record
   */
  private async updateWarehouseStock(
    warehouseId: string,
    productId: string,
    quantity: number,
    moveType: 'PUT_AWAY' | 'SALE',
    refId: string,
    refType: string,
    note: string,
    userId: string | undefined,
    prisma: any,
  ) {
    // Check WMS Module status
    // TODO: Optimize by fetching ONCE per transaction instead of per item
    const wmsParam = await prisma.systemParameter.findFirst({
      where: {
        key: 'ENABLE_WMS_MODULE',
        OR: [
          // Check generic/global param (assuming tenant filtering is handled or we want global config)
          { tenantId: null },
          // If we had tenant context, we'd check that too.
          // For now, looking up broadly is safe as we just inserted a global/tenant-linked one.
        ]
      },
      orderBy: { tenantId: 'desc' }, // Prefer specific tenant if available (non-null first usually)
    });

    const isWmsEnabled = wmsParam?.value === 'true' || wmsParam?.value === true;

    if (!isWmsEnabled) {
      // WMS disabled: Do NOT track shelf location or create StockMove.
      // Basic Inventory (ProductMovement) is already handled in the calling method.
      return;
    }

    // Get or create default location for the warehouse
    const defaultLocation = await this.warehouseService.getOrCreateDefaultLocation(warehouseId);

    // Find existing ProductLocationStock
    let stock = await prisma.productLocationStock.findUnique({
      where: {
        warehouseId_locationId_productId: {
          warehouseId,
          locationId: defaultLocation.id,
          productId,
        },
      },
    });

    const qtyChange = moveType === 'PUT_AWAY' ? quantity : -quantity;

    if (stock) {
      const newQty = stock.qtyOnHand + qtyChange;

      // Check if negative stock control is enabled
      const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean(
        'NEGATIVE_STOCK_CONTROL',
        false, // Default: false (allow negative stock)
      );

      // Prevent negative stock only if the parameter is enabled
      if (negativeStockControlEnabled) {
        // Calculate total warehouse stock across all locations
        const warehouseStockResult = await prisma.productLocationStock.aggregate({
          where: {
            warehouseId,
            productId,
          },
          _sum: {
            qtyOnHand: true,
          },
        });
        const totalWarehouseQty = warehouseStockResult._sum.qtyOnHand || 0;

        if (totalWarehouseQty + qtyChange < 0) {
          throw new BadRequestException(
            `Insufficient stock in warehouse. Available: ${totalWarehouseQty}, Requested: ${quantity}`,
          );
        }
      }

      await prisma.productLocationStock.update({
        where: {
          warehouseId_locationId_productId: {
            warehouseId,
            locationId: defaultLocation.id,
            productId,
          },
        },
        data: {
          qtyOnHand: newQty,
        },
      });
    } else {
      // Create new stock record
      if (moveType === 'SALE') {
        // Check if negative stock control is enabled
        const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean(
          'NEGATIVE_STOCK_CONTROL',
          false,
        );

        if (negativeStockControlEnabled) {
          // Calculate total warehouse stock across all locations
          const warehouseStockResult = await prisma.productLocationStock.aggregate({
            where: {
              warehouseId,
              productId,
            },
            _sum: {
              qtyOnHand: true,
            },
          });
          const totalWarehouseQty = warehouseStockResult._sum.qtyOnHand || 0;

          if (totalWarehouseQty - quantity < 0) {
            throw new BadRequestException(
              `Insufficient stock in warehouse. Available: ${totalWarehouseQty}, Requested: ${quantity}`,
            );
          }
        }

        // If negative stock is allowed, create a negative stock record
        await prisma.productLocationStock.create({
          data: {
            warehouseId,
            locationId: defaultLocation.id,
            productId,
            qtyOnHand: -quantity, // Negative stock
          },
        });
      } else {
        // For PUT_AWAY, create positive stock
        await prisma.productLocationStock.create({
          data: {
            warehouseId,
            locationId: defaultLocation.id,
            productId,
            qtyOnHand: quantity,
          },
        });
      }
    }

    // Create StockMove record
    await prisma.stockMove.create({
      data: {
        productId,
        fromWarehouseId: moveType === 'SALE' ? warehouseId : null,
        fromLocationId: moveType === 'SALE' ? defaultLocation.id : null,
        toWarehouseId: warehouseId,
        toLocationId: defaultLocation.id,
        qty: quantity,
        moveType: moveType,
        refType,
        refId,
        note,
        createdBy: userId,
      },
    });
  }

  /**
   * Run costing service for PURCHASE invoice
   * Calculates cost for productIds inside invoice items
   */
  private async calculateCostsForInvoiceItems(
    items: Array<{ productId: string | null }>,
    invoiceId: string,
    invoiceNo: string,
  ): Promise<void> {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
      'AUTO_COSTING_ON_PURCHASE_INVOICE',
      true,
    );

    if (!autoCostingEnabled) return;

    const productIds = items
      .map((i) => i.productId)
      .filter((id): id is string => id !== null && id !== undefined);

    if (productIds.length === 0) return;

    const uniqueProductIds = [...new Set(productIds)];

    const costingPromises = uniqueProductIds.map(async (productId) => {
      try {
        await this.costingService.calculateWeightedAverageCost(productId);
      } catch (error: any) {
        console.error(
          `[InvoiceService] Product ${productId} costing error:`,
          { productId, invoiceId, invoiceNo, error: error?.message || error },
        );
      }
    });

    await Promise.allSettled(costingPromises);
  }

  async findAll(
    page = 1,
    limit = 50,
    type?: InvoiceType,
    search?: string,
    accountId?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ) {
    try {
      const skip = (page - 1) * limit;
      const tenantId = await this.tenantResolver.resolveForQuery();

      const where: Prisma.InvoiceWhereInput = {
        deletedAt: null,
        ...buildTenantWhereClause(tenantId ?? undefined),
      };

      if (type) {
        where.invoiceType = type;
      }

      if (accountId) {
        where.accountId = accountId;
      }

      if (search) {
        where.OR = [
          { invoiceNo: { contains: search, mode: 'insensitive' } },
          { account: { title: { contains: search, mode: 'insensitive' } } },
          { account: { code: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const [data, total] = await Promise.all([
        this.prisma.extended.invoice.findMany({
          where,
          skip,
          take: limit,
          include: {
            account: { select: { id: true, code: true, title: true, type: true } },
            deliveryNote: {
              select: {
                id: true,
                deliveryNoteNo: true,
                sourceOrder: { select: { id: true, orderNo: true } },
              },
            },
            invoiceCollections: {
              include: {
                collection: {
                  select: { id: true, date: true, type: true, paymentType: true },
                },
              },
              orderBy: { createdAt: 'desc' },
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
          orderBy: sortBy
            ? { [sortBy]: sortOrder || 'desc' }
            : { createdAt: 'desc' },
        }),
        this.prisma.extended.invoice.count({ where }),
      ]);

      const dataWithKalan = data.map((item: any) => {
        return {
          ...item,
          remainingAmount: Number(item.grandTotal) - Number(item.paidAmount || 0),
        };
      });

      return {
        data: dataWithKalan,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error('Invoice findAll error:', error);
      throw new BadRequestException(
        `Error occurred while loading invoices: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    const invoice = await this.prisma.extended.invoice.findUnique({
      where: { id },
      include: {
        account: true,
        deliveryNote: {
          select: {
            id: true,
            deliveryNoteNo: true,
            warehouseId: true,
            sourceOrder: {
              select: {
                id: true,
                orderNo: true,
              },
            },
          },
        },
        purchaseDeliveryNote: {
          select: { id: true, deliveryNoteNo: true, warehouseId: true },
        },
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
        paymentPlans: true,
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

    if (!invoice) {
      throw new NotFoundException(`Invoice not found: ${id}`);
    }

    // Warehouse: from invoice or fallback to delivery note
    const fallbackWarehouseId =
      invoice.deliveryNote?.warehouseId ?? invoice.purchaseDeliveryNote?.warehouseId ?? null;
    const warehouseId = invoice.warehouseId ?? (fallbackWarehouseId ? String(fallbackWarehouseId) : undefined);

    return {
      ...invoice,
      warehouseId,
      items: (invoice.items || []).map(item => ({
        ...item,
        vatRate: item.vatRate ?? 0,
      }))
    };
  }

  async create(
    createFaturaDto: CreateInvoiceDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const {
      items,
      orderId,
      deliveryNoteId,
      warehouseId,
      salesAgentId,
      eScenario,
      eInvoiceType,
      gibAlias,
      shippingType,
      status: inputStatus,
      ...invoiceData
    } = createFaturaDto;

    const tenantId = await this.tenantResolver.resolveForQuery();

    const autoApprove = await this.systemParameterService.getParameterAsBoolean(
      'AUTO_APPROVE_INVOICE',
      false,
    );
    const status = autoApprove ? InvoiceStatus.APPROVED : (inputStatus || InvoiceStatus.DRAFT);

    if (!invoiceData.invoiceNo || invoiceData.invoiceNo.trim() === '') {
      try {
        if (invoiceData.type === InvoiceType.SALE) {
          invoiceData.invoiceNo = await this.codeTemplateService.getNextCode(ModuleType.INVOICE_SALES);
        } else if (invoiceData.type === InvoiceType.PURCHASE) {
          invoiceData.invoiceNo = await this.codeTemplateService.getNextCode(ModuleType.INVOICE_PURCHASE);
        } else {
          const year = new Date().getFullYear();
          const lastInvoice = await this.prisma.extended.invoice.findFirst({
            where: {
              invoiceType: invoiceData.type as InvoiceType,
              ...(tenantId && { tenantId }),
            },
            orderBy: { createdAt: 'desc' },
          });
          const lastNo = lastInvoice ? parseInt(lastInvoice.invoiceNo.split('-')[2] || '0') : 0;
          const newNo = (lastNo + 1).toString().padStart(3, '0');
          invoiceData.invoiceNo = `SF-${year}-${newNo}`;
        }
      } catch (error: any) {
        const year = new Date().getFullYear();
        const lastInvoice = await this.prisma.extended.invoice.findFirst({
          where: {
            invoiceType: invoiceData.type as InvoiceType,
            ...(tenantId && { tenantId }),
          },
          orderBy: { createdAt: 'desc' },
        });
        const lastNo = lastInvoice ? parseInt(lastInvoice.invoiceNo.split('-')[2] || '0') : 0;
        const newNo = (lastNo + 1).toString().padStart(3, '0');
        invoiceData.invoiceNo = `SF-${year}-${newNo}`;
      }
    }

    const existingInvoice = await this.prisma.extended.invoice.findFirst({
      where: {
        invoiceNo: invoiceData.invoiceNo,
        ...(tenantId && { tenantId }),
      },
    });

    if (existingInvoice) {
      throw new BadRequestException(
        `Bu fatura numarası zaten mevcut: ${invoiceData.invoiceNo}`,
      );
    }

    const account = await this.prisma.extended.account.findUnique({
      where: { id: invoiceData.accountId },
      select: { id: true, salesAgentId: true, title: true, balance: true, creditLimit: true }
    });

    if (!account) {
      throw new NotFoundException(`Account not found: ${invoiceData.accountId}`);
    }

    let totalAmount = 0;
    let vatAmount = 0;
    let sctTotal = 0;
    let withholdingTotal = 0;

    const itemsWithCalculations = items.map((item) => {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const unitPrice = Number(item.unitPrice) || 0;
      const rawAmount = quantity * unitPrice;

      const discountRate = item.discountRate !== undefined ? Number(item.discountRate) : 0;
      let discountAmount = 0;

      if (item.discountAmount !== undefined && item.discountAmount !== null && Number(item.discountAmount) > 0) {
        discountAmount = Number(item.discountAmount);
      } else {
        discountAmount = (rawAmount * discountRate) / 100;
      }

      const amount = rawAmount - discountAmount;

      const sctRate = Number(item.sctRate) || 0;
      const sctAmount = (amount * sctRate) / 100;

      const vatBasis = amount + sctAmount;

      const rawVat = item.vatRate;
      const vatRateInt =
        rawVat === 0 || (typeof rawVat === 'string' && rawVat === '0')
          ? 0
          : Math.round(Number(rawVat) || 0);
      const itemVat = (vatBasis * vatRateInt) / 100;

      const withholdingRate = Number(item.withholdingRate) || 0;
      const itemWithholding = itemVat * withholdingRate;

      totalAmount += amount;
      vatAmount += itemVat;
      sctTotal += sctAmount;
      withholdingTotal += itemWithholding;

      return {
        productId: String(item.productId),
        quantity,
        unitPrice,
        vatRate: vatRateInt,
        discountRate: new Decimal(discountRate),
        discountAmount: new Decimal(discountAmount),
        amount: new Decimal(amount),
        vatAmount: new Decimal(itemVat),
        withholdingCode: item.withholdingCode || null,
        withholdingRate: new Decimal(withholdingRate),
        sctRate: new Decimal(sctRate),
        sctAmount: new Decimal(sctAmount),
        vatExemptionReason: item.vatExemptionReason || null,
        unit: item.unit || null,
      };
    });

    const generalDiscount = invoiceData.discount !== undefined ? Number(invoiceData.discount) : 0;
    totalAmount -= generalDiscount;
    const grandTotal = totalAmount + vatAmount + sctTotal - withholdingTotal;

    let currency = createFaturaDto.currency || 'TRY';
    let exchangeRate = createFaturaDto.exchangeRate;
    let foreignTotal: number | null = null;

    if (currency && currency !== 'TRY') {
      if (!exchangeRate) {
        try {
          exchangeRate = await this.tcmbService.getCurrentRate(currency);
        } catch (error) {
          console.error(`Kur alınamadı: ${error}`);
        }
      }

      if (exchangeRate && exchangeRate > 0) {
        foreignTotal = new Decimal(grandTotal).div(exchangeRate).toNumber();
      }
    }

    let salesOrder: any = null;
    let orderPickings: any[] = [];
    if (orderId) {
      salesOrder = await this.prisma.extended.salesOrder.findUnique({
        where: { id: orderId },
        include: {
          orderPickings: {
            include: {
              orderItem: {
                include: {
                  product: true,
                },
              },
              location: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!salesOrder) {
        throw new NotFoundException(`Order not found: orderId`);
      }

      if (salesOrder.status === 'INVOICED') {
        throw new BadRequestException('Sipariş zaten faturalandırılmış');
      }

      orderPickings = salesOrder.orderPickings;
    }

    if (invoiceData.type === InvoiceType.SALE && status === InvoiceStatus.APPROVED && warehouseId) {
      const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean(
        'NEGATIVE_STOCK_CONTROL',
        false,
      );

      if (negativeStockControlEnabled) {
        const stockIssues: Array<{
          productCode: string;
          productName: string;
          currentStock: number;
          request: number;
        }> = [];

        for (const item of itemsWithCalculations) {
          const product = await this.prisma.extended.product.findUnique({
            where: { id: item.productId },
            select: { code: true, name: true },
          });

          const stock = await this.prisma.extended.productLocationStock.aggregate({
            where: {
              warehouseId,
              productId: item.productId,
            },
            _sum: {
              qtyOnHand: true,
            },
          });

          const currentStock = stock._sum.qtyOnHand || 0;
          const requestedQty = item.quantity;

          if (currentStock < requestedQty) {
            stockIssues.push({
              productCode: product?.code || 'Bilinmiyor',
              productName: product?.name || 'Bilinmiyor',
              currentStock: Number(currentStock),
              request: requestedQty,
            });
          }
        }

        if (stockIssues.length > 0) {
          const errorDetails = stockIssues
            .map(
              (issue) =>
                `• ${issue.productCode} - ${issue.productName}: Available stock ${issue.currentStock}, requested ${issue.request}`,
            )
            .join('\n');

          throw new BadRequestException(
            `Insufficient stock! There is not enough stock for the following products:\n\n${errorDetails}`,
          );
        }
      }
    }

    if (invoiceData.type === InvoiceType.SALE) {
      const riskControlEnabled = await this.systemParameterService.getParameterAsBoolean(
        'CARI_RISK_CONTROL',
        false,
      );

      if (riskControlEnabled) {
        const creditLimit = account?.creditLimit ? Number(account.creditLimit) : 0;

        if (creditLimit > 0) {
          const currentBalance = account?.balance ? Number(account.balance) : 0;
          const nextBalance = currentBalance + grandTotal;

          if (nextBalance > creditLimit) {
            const currentDebt = Math.max(currentBalance, 0);
            const remainingCapacity = creditLimit - currentDebt;
            throw new BadRequestException(
              `Risk limit exceeded! The defined risk limit for "${account?.title}" is ${creditLimit.toLocaleString('tr-TR')} TRY. ` +
              `Current debt ${currentDebt.toLocaleString('tr-TR')} TRY, remaining capacity ${Math.max(0, remainingCapacity).toLocaleString('tr-TR')} TRY. ` +
              `This invoice (${grandTotal.toLocaleString('tr-TR')} TRY) exceeds the limit.`,
            );
          }
        }
      }
    }

    const createdInvoice = await this.prisma.extended.$transaction(async (prisma) => {
      let transactionWarehouseId = warehouseId;
      let finalDeliveryNoteId: string | undefined = undefined;
      let purchaseDeliveryNoteId: string | undefined = undefined;

      if (deliveryNoteId) {
        if (invoiceData.type === InvoiceType.SALE || invoiceData.type === InvoiceType.SALES_RETURN) {
          const deliveryNote = await prisma.salesDeliveryNote.findUnique({
            where: { id: deliveryNoteId },
            include: {
              sourceOrder: { select: { id: true, orderNo: true } },
              items: true,
            },
          });

          if (!deliveryNote) {
            throw new NotFoundException(`Sales waybill not found: ${deliveryNoteId}`);
          }

          if (deliveryNote.status === DeliveryNoteStatus.INVOICED) {
            throw new BadRequestException('Bu deliveryNote zaten tamamen faturalandırılmış');
          }

          for (const faturaKalemi of items) {
            const dnItem = deliveryNote.items.find(ik => ik.productId === faturaKalemi.productId);
            if (dnItem) {
              await prisma.salesDeliveryNoteItem.update({
                where: { id: dnItem.id },
                data: { invoicedQuantity: { increment: faturaKalemi.quantity } }
              });
            }
          }

          const updatedDN = await prisma.salesDeliveryNote.findUnique({
            where: { id: deliveryNoteId },
            include: { items: true }
          });

          const isFullyInvoiced = updatedDN?.items.every(k => k.invoicedQuantity >= k.quantity);
          if (isFullyInvoiced) {
            await prisma.salesDeliveryNote.update({
              where: { id: deliveryNoteId },
              data: { status: DeliveryNoteStatus.INVOICED },
            });
          }

          finalDeliveryNoteId = deliveryNoteId;
          if (deliveryNote.warehouseId) transactionWarehouseId = deliveryNote.warehouseId;
        } else if (invoiceData.type === InvoiceType.PURCHASE || invoiceData.type === InvoiceType.PURCHASE_RETURN) {
          const deliveryNote = await prisma.purchaseDeliveryNote.findUnique({
            where: { id: deliveryNoteId },
            include: {
              sourceOrder: { select: { id: true, orderNo: true } },
            },
          });

          if (!deliveryNote) {
            throw new NotFoundException(`Purchase delivery note not found: deliveryNoteId`);
          }

          if (deliveryNote.status === DeliveryNoteStatus.INVOICED) {
            throw new BadRequestException('Bu deliveryNote zaten faturalandırılmış');
          }

          await prisma.purchaseDeliveryNote.update({
            where: { id: deliveryNoteId },
            data: { status: DeliveryNoteStatus.INVOICED },
          });

          purchaseDeliveryNoteId = deliveryNoteId;
          if (deliveryNote.warehouseId) transactionWarehouseId = deliveryNote.warehouseId;
        }
      } else if (invoiceData.type === InvoiceType.SALE) {
        let dnNo: string;
        try {
          dnNo = await this.codeTemplateService.getNextCode(ModuleType.DELIVERY_NOTE_SALES);
        } catch (error: any) {
          const year = new Date().getFullYear();
          const lastDN = await prisma.salesDeliveryNote.findFirst({
            where: { ...(tenantId && { tenantId }) },
            orderBy: { createdAt: 'desc' },
          });
          const lastNoStr = lastDN?.deliveryNoteNo || '';
          const lastNo = lastNoStr ? parseInt(lastNoStr.split('-').pop() || '0') : 0;
          dnNo = `IRS-${year}-${(lastNo + 1).toString().padStart(6, '0')}`;
        }

        const dnTotalAmount = totalAmount + (invoiceData.discount || 0);
        const dnItems = itemsWithCalculations.map(k => ({
          productId: k.productId,
          quantity: k.quantity,
          unitPrice: new Decimal(k.unitPrice),
          vatRate: k.vatRate,
          vatAmount: new Decimal(k.vatAmount),
          totalAmount: new Decimal(k.amount),
        }));

        const dn = await prisma.salesDeliveryNote.create({
          data: {
            deliveryNoteNo: dnNo,
            date: new Date(invoiceData.date),
            tenantId,
            accountId: invoiceData.accountId,
            warehouseId: warehouseId || null,
            sourceType: DeliveryNoteSourceType.INVOICE_AUTOMATIC,
            sourceId: null,
            status: DeliveryNoteStatus.INVOICED,
            subtotal: new Decimal(dnTotalAmount),
            vatAmount: new Decimal(vatAmount),
            grandTotal: new Decimal(grandTotal),
            discount: new Decimal(invoiceData.discount || 0),
            notes: invoiceData.notes || null,
            createdBy: userId,
            items: {
              create: dnItems,
            },
          },
        });

        finalDeliveryNoteId = dn.id;
      } else if (invoiceData.type === InvoiceType.PURCHASE) {
        let dnNo: string;
        try {
          dnNo = await this.codeTemplateService.getNextCode(ModuleType.DELIVERY_NOTE_PURCHASE);
        } catch (error: any) {
          const year = new Date().getFullYear();
          const lastDN = await prisma.purchaseDeliveryNote.findFirst({
            where: { ...(tenantId && { tenantId }) },
            orderBy: { createdAt: 'desc' },
          });
          const lastNoStr = lastDN?.deliveryNoteNo || '';
          const lastNo = lastNoStr ? parseInt(lastNoStr.split('-').pop() || '0') : 0;
          dnNo = `AIRS-${year}-${(lastNo + 1).toString().padStart(6, '0')}`;
        }

        const dnTotalAmount = totalAmount + (invoiceData.discount || 0);
        const dnItems = itemsWithCalculations.map(k => ({
          productId: k.productId,
          quantity: k.quantity,
          unitPrice: new Decimal(k.unitPrice),
          vatRate: k.vatRate,
          vatAmount: new Decimal(k.vatAmount),
          totalAmount: new Decimal(k.amount),
        }));

        const dn = await prisma.purchaseDeliveryNote.create({
          data: {
            deliveryNoteNo: dnNo,
            date: new Date(invoiceData.date),
            tenantId,
            accountId: invoiceData.accountId,
            warehouseId: warehouseId || null,
            sourceType: DeliveryNoteSourceType.INVOICE_AUTOMATIC,
            sourceId: null,
            status: DeliveryNoteStatus.INVOICED,
            subtotal: new Decimal(dnTotalAmount),
            vatAmount: new Decimal(vatAmount),
            grandTotal: new Decimal(grandTotal),
            discount: new Decimal(invoiceData.discount || 0),
            notes: invoiceData.notes || null,
            createdBy: userId,
            items: {
              create: dnItems,
            },
          },
        });

        purchaseDeliveryNoteId = dn.id;
      }

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNo: invoiceData.invoiceNo,
          invoiceType: invoiceData.type as InvoiceType,
          accountId: invoiceData.accountId,
          date: new Date(invoiceData.date),
          dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null,
          currency: currency || 'TRY',
          exchangeRate: exchangeRate ? new Decimal(exchangeRate) : new Decimal(1),
          foreignTotal: foreignTotal ? new Decimal(foreignTotal) : null,
          ...(tenantId && { tenantId }),
          orderNo: salesOrder?.orderNo || null,
          deliveryNoteId: finalDeliveryNoteId || null,
          purchaseDeliveryNoteId: purchaseDeliveryNoteId || null,
          warehouseId: transactionWarehouseId || null,
          totalAmount: new Decimal(totalAmount),
          vatAmount: new Decimal(vatAmount),
          sctTotal: new Decimal(sctTotal),
          withholdingTotal: new Decimal(withholdingTotal),
          grandTotal: new Decimal(grandTotal),
          discount: new Decimal(invoiceData.discount ?? 0),
          paidAmount: new Decimal(0),
          payableAmount: new Decimal(grandTotal),
          status: status,
          notes: invoiceData.notes || null,
          createdBy: userId,
          salesAgentId: salesAgentId || null,
          eScenario: eScenario || null,
          eInvoiceType: eInvoiceType || null,
          gibAlias: gibAlias || null,
          deliveryMethod: shippingType || null,
          items: {
            create: itemsWithCalculations.map((k) => ({
              productId: k.productId,
              quantity: k.quantity,
              unitPrice: new Decimal(k.unitPrice),
              vatRate: k.vatRate,
              vatAmount: k.vatAmount,
              amount: k.amount,
              discountRate: k.discountRate,
              discountAmount: k.discountAmount,
              withholdingCode: k.withholdingCode || null,
              withholdingRate: k.withholdingRate,
              sctRate: k.sctRate,
              sctAmount: k.sctAmount,
              vatExemptionReason: k.vatExemptionReason || null,
              unit: k.unit || null,
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

      if (salesOrder && salesOrder.id) {
        await prisma.salesOrder.update({
          where: { id: salesOrder.id },
          data: {
            status: 'INVOICED',
            invoiceNo: invoiceData.invoiceNo,
          },
        });
      }

      if (status === InvoiceStatus.APPROVED) {
        await this.processInvoiceMovements(invoice, prisma, userId, transactionWarehouseId, orderPickings, tenantId);
      }

      await this.createLog(
        invoice.id,
        'CREATE',
        userId,
        { invoice: invoiceData, items: itemsWithCalculations },
        ipAddress,
        userAgent,
        prisma,
      );

      if (invoiceData.type === InvoiceType.SALE) {
        try {
          await this.invoiceProfitService.calculateAndSaveProfit(
            invoice.id,
            userId,
            prisma,
          );
        } catch (error: any) {
          console.error(
            `[InvoiceService] Invoice ${invoice.id} (${invoice.invoiceNo}) profit calculation error:`,
            { error: error?.message || error },
          );
        }
      }

      return invoice;
    });

    if (invoiceData.type === InvoiceType.PURCHASE) {
      try {
        const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
          'AUTO_COSTING_ON_PURCHASE_INVOICE',
          true,
        );

        if (autoCostingEnabled) {
          await this.calculateCostsForInvoiceItems(
            createdInvoice.items,
            createdInvoice.id,
            createdInvoice.invoiceNo,
          );
        }
      } catch (error: any) {
        console.error(
          `[InvoiceService] Invoice ${createdInvoice.id} (${createdInvoice.invoiceNo}) costing error:`,
          { error: error?.message || error },
        );
      }
    }

    return createdInvoice;
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const invoice = await this.findOne(id);

    // If items are not updated, only update invoice info
    if (!updateInvoiceDto.items) {
      const { accountId, invoiceNo, type, items, warehouseId, orderId, deliveryNoteId, salesAgentId, ...updateData } =
        updateInvoiceDto;

      // Check invoiceNo uniqueness if changed
      if (invoiceNo !== undefined && invoiceNo.trim() !== '' && invoiceNo !== invoice.invoiceNo) {
        const tenantId = invoice.tenantId ?? undefined;
        const existing = await this.prisma.extended.invoice.findFirst({
          where: {
            invoiceNo: invoiceNo.trim(),
            ...(tenantId && { tenantId }),
            id: { not: id },
          },
        });
        if (existing) {
          throw new BadRequestException(
            `Invoice number already exists: ${invoiceNo}`,
          );
        }
      }

      const updated = await this.prisma.extended.invoice.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: userId,
          salesAgentId,
          ...(updateInvoiceDto.warehouseId !== undefined && { warehouseId: updateInvoiceDto.warehouseId || null }),
          ...(invoiceNo !== undefined && invoiceNo.trim() !== '' && { invoiceNo: invoiceNo.trim() }),
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

      // Audit log
      await this.createLog(id, 'UPDATE', userId, updateData, ipAddress, userAgent);

      // Status change and process movements
      if (updateInvoiceDto.status === InvoiceStatus.APPROVED && invoice.status !== InvoiceStatus.APPROVED) {
        const whId = updateInvoiceDto.warehouseId ?? (updated as any).warehouseId ?? (invoice as any).warehouseId ?? undefined;
        await this.prisma.extended.$transaction(async (tx) => {
          await this.processInvoiceMovements(updated, tx, userId, whId, [], updated.tenantId ?? invoice.tenantId);
        });
      }

      // Costing
      if (updated.invoiceType === InvoiceType.PURCHASE) {
        try {
          const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean('AUTO_COSTING_ON_PURCHASE_INVOICE', true);
          if (autoCostingEnabled) {
            await this.calculateCostsForInvoiceItems(updated.items, updated.id, updated.invoiceNo);
          }
        } catch (error: any) {
          console.error(`Costing error (update): ${error.message}`);
        }
      }

      return updated;
    }

    // items update
    const { items, warehouseId, orderId, deliveryNoteId, ...invoiceData } = updateInvoiceDto;

    const newInvoiceNo = invoiceData.invoiceNo != null && String(invoiceData.invoiceNo).trim() !== '' ? String(invoiceData.invoiceNo).trim() : null;
    if (newInvoiceNo && newInvoiceNo !== invoice.invoiceNo) {
      const tenantId = invoice.tenantId ?? undefined;
      const existing = await this.prisma.extended.invoice.findFirst({
        where: {
          invoiceNo: newInvoiceNo,
          ...(tenantId && { tenantId }),
          id: { not: id },
        },
      });
      if (existing) {
        throw new BadRequestException(
          `Invoice number already exists: ${newInvoiceNo}`,
        );
      }
    }

    let totalAmount = 0;
    let vatAmount = 0;

    const itemsWithCalculations = items.map((item) => {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const unitPrice = Number(item.unitPrice) || 0;
      const rawAmount = quantity * unitPrice;

      const discountRate = item.discountRate !== undefined ? Number(item.discountRate) : 0;
      let discountAmount = 0;

      if (item.discountAmount !== undefined && item.discountAmount !== null && Number(item.discountAmount) > 0) {
        discountAmount = Number(item.discountAmount);
      } else {
        discountAmount = (rawAmount * discountRate) / 100;
      }

      const amount = rawAmount - discountAmount;
      const vatRate = Math.round(Number(item.vatRate) || 0);
      const itemVatAmount = (amount * vatRate) / 100;

      totalAmount += amount;
      vatAmount += itemVatAmount;

      return {
        productId: String(item.productId),
        quantity,
        unitPrice: new Decimal(unitPrice),
        vatRate,
        discountRate: new Decimal(discountRate),
        discountAmount: new Decimal(discountAmount),
        amount: new Decimal(amount),
        vatAmount: new Decimal(itemVatAmount),
      };
    });

    const discount = invoiceData.discount !== undefined ? invoiceData.discount : invoice.discount.toNumber();
    totalAmount -= discount;
    const grandTotal = totalAmount + vatAmount;

    // Currency calculation (Update)
    let { currency, exchangeRate } = updateInvoiceDto;
    if (!currency && invoice.currency) currency = invoice.currency;

    let foreignTotal: number | null = null;

    if (currency && currency !== 'TRY') {
      if (!exchangeRate) {
        if (currency === invoice.currency && invoice.exchangeRate) {
          exchangeRate = invoice.exchangeRate.toNumber();
        } else {
          try {
            exchangeRate = await this.tcmbService.getCurrentRate(currency);
          } catch (error) {
            console.error(`Rate fetch failed: ${error}`);
          }
        }
      }

      if (exchangeRate && exchangeRate > 0) {
        foreignTotal = new Decimal(grandTotal).div(exchangeRate).toNumber();
      }
    }

    const updated = await this.prisma.extended.$transaction(
      async (prisma) => {
        if (invoice.status === InvoiceStatus.APPROVED) {
          await this.reverseInvoiceMovements(invoice, prisma, invoice.tenantId ?? undefined);
        }

        // Delete old items
        await prisma.invoiceItem.deleteMany({
          where: { invoiceId: id },
        });

        // Update invoice and add new items
        const updatedRecord = await prisma.invoice.update({
          where: { id },
          data: {
            ...invoiceData,
            currency: currency || 'TRY',
            exchangeRate: exchangeRate ? new Decimal(exchangeRate) : new Decimal(1),
            foreignTotal: foreignTotal ? new Decimal(foreignTotal) : null,
            totalAmount,
            vatAmount,
            grandTotal,
            updatedBy: userId,
            ...(warehouseId !== undefined && { warehouseId: warehouseId || null }),
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

        // Audit log (inside transaction)
        await this.createLog(
          id,
          'UPDATE',
          userId,
          { ...invoiceData, items: itemsWithCalculations },
          ipAddress,
          userAgent,
          prisma,
        );

        if (updatedRecord.invoiceType === InvoiceType.SALE) {
          try {
            await this.invoiceProfitService.calculateAndSaveProfit(
              updatedRecord.id,
              userId,
              prisma,
            );
          } catch (error: any) {
            console.error(`Profit calculation error (update): ${error.message}`);
          }
        }

        const shouldProcessMovements =
          (updateInvoiceDto.status === InvoiceStatus.APPROVED && invoice.status !== InvoiceStatus.APPROVED) ||
          invoice.status === InvoiceStatus.APPROVED;
        if (shouldProcessMovements) {
          await this.processInvoiceMovements(
            updatedRecord,
            prisma,
            userId,
            warehouseId ?? (updatedRecord as any).warehouseId ?? undefined,
            [],
            updatedRecord.tenantId ?? invoice.tenantId,
          );
        }

        return updatedRecord;
      },
      { timeout: 30000 }
    );

    // Maliyetlendirme (sadece PURCHASE faturaları için ve parametre açıksa) - TRANSACTION DIŞINDA
    if (invoice.invoiceType === InvoiceType.PURCHASE) {
      const shouldCalculateCosts =
        invoice.status !== InvoiceStatus.APPROVED || updateInvoiceDto.items || updateInvoiceDto.status;

      if (shouldCalculateCosts) {
        try {
          const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
            'AUTO_COSTING_ON_PURCHASE_INVOICE',
            true,
          );

          if (autoCostingEnabled) {
            await this.calculateCostsForInvoiceItems(
              updated.items,
              updated.id,
              updated.invoiceNo,
            );
          }
        } catch (error: any) {
          console.error(
            `[InvoiceService] Invoice ${updated.id} (${updated.invoiceNo}) için maliyetlendirme güncelleme hatası:`,
            { error: error?.message || error },
          );
        }
      }
    }

    return updated;
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) throw new BadRequestException('Tenant ID not found.');

    const invoice = await this.findOne(id);

    // Protection check
    await this.deletionProtection.checkFaturaDeletion(id, tenantId);

    // Soft delete
    const deletedInvoice = await this.prisma.extended.$transaction(async (prisma) => {
      // Delete account movements and stock movements if approved
      if (invoice.status === InvoiceStatus.APPROVED) {
        await prisma.accountMovement.deleteMany({
          where: {
            accountId: invoice.accountId,
            documentType: 'INVOICE',
            documentNo: invoice.invoiceNo,
          },
        });

        // Revert account balance
        await prisma.account.update({
          where: { id: invoice.accountId },
          data: {
            balance:
              invoice.invoiceType === InvoiceType.SALE
                ? { decrement: invoice.grandTotal }
                : { increment: invoice.grandTotal },
          },
        });

        // Delete product movements
        const itemIds = invoice.items?.map((item) => item.id) ?? [];
        if (itemIds.length > 0) {
          await prisma.productMovement.deleteMany({
            where: { invoiceItemId: { in: itemIds } },
          });
        }

        // Revert warehouse stocks
        const transactionWarehouseId = invoice.warehouseId && String(invoice.warehouseId).trim() ? String(invoice.warehouseId).trim() : undefined;
        for (const item of invoice.items ?? []) {
          if (!item.productId) continue;
          const quantity = Number(item.quantity) || 0;
          if (quantity <= 0) continue;
          if (transactionWarehouseId) {
            await this.reverseWarehouseStockForInvoice(
              transactionWarehouseId,
              item.productId,
              quantity,
              invoice.invoiceType,
              prisma,
            );
          }
        }
        if (invoice.invoiceType === InvoiceType.SALE && invoice.deliveryNoteId && !transactionWarehouseId) {
          const deliveryNote = await prisma.salesDeliveryNote.findUnique({
            where: { id: invoice.deliveryNoteId },
            select: { warehouseId: true },
          });
          if (deliveryNote?.warehouseId) {
            for (const item of invoice.items ?? []) {
              if (!item.productId) continue;
              const quantity = Number(item.quantity) || 0;
              if (quantity <= 0) continue;
              await this.reverseWarehouseStockForInvoice(
                deliveryNote.warehouseId,
                item.productId,
                quantity,
                invoice.invoiceType,
                prisma,
              );
            }
          }
        }
        if (invoice.invoiceType === InvoiceType.PURCHASE && !transactionWarehouseId && invoice.purchaseDeliveryNoteId) {
          const deliveryNote = await prisma.purchaseDeliveryNote.findUnique({
            where: { id: invoice.purchaseDeliveryNoteId },
            select: { warehouseId: true },
          });
          if (deliveryNote?.warehouseId) {
            for (const item of invoice.items ?? []) {
              if (!item.productId) continue;
              const quantity = Number(item.quantity) || 0;
              if (quantity <= 0) continue;
              await this.reverseWarehouseStockForInvoice(
                deliveryNote.warehouseId,
                item.productId,
                quantity,
                invoice.invoiceType,
                prisma,
              );
            }
          }
        }
      }

      // Soft delete: set deletedAt and deletedBy
      const deleted = await prisma.invoice.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      // Audit log (inside transaction)
      await this.createLog(
        id,
        'DELETE',
        userId,
        { invoice },
        ipAddress,
        userAgent,
        prisma,
      );

      return deleted;
    });

    // Costing (only for PURCHASE and if parameter enabled) - OUTSIDE TRANSACTION
    if (invoice.invoiceType === InvoiceType.PURCHASE) {
      try {
        const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
          'AUTO_COSTING_ON_PURCHASE_INVOICE',
          true,
        );

        if (autoCostingEnabled) {
          await this.calculateCostsForInvoiceItems(
            invoice.items,
            invoice.id,
            invoice.invoiceNo,
          );
        }
      } catch (error: any) {
        console.error(
          `[InvoiceService] Invoice ${invoice.id} (${invoice.invoiceNo}) delete costing error:`,
          { error: error?.message || error },
        );
      }
    }

    return deletedInvoice;
  }

  async findDeleted(
    page = 1,
    limit = 50,
    invoiceType?: InvoiceType,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      deletedAt: { not: null },
    };

    if (invoiceType) {
      where.invoiceType = invoiceType;
    }

    if (search) {
      where.OR = [
        { invoiceNo: { contains: search, mode: 'insensitive' } },
        { account: { title: { contains: search, mode: 'insensitive' } } },
        { account: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.extended.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          account: true,
          deletedByUser: {
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
        orderBy: { deletedAt: 'desc' },
      }),
      this.prisma.extended.invoice.count({ where }),
    ]);

    return {
      data: data.map((item) => ({
        ...item,
        remainingAmount: Number(item.grandTotal) - Number(item.paidAmount || 0),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async restore(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const invoice = await this.prisma.extended.invoice.findUnique({
      where: { id },
      include: {
        account: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice not found: ${id}`);
    }

    if (!invoice.deletedAt) {
      throw new BadRequestException(
        'This invoice is not deleted, cannot be restored.',
      );
    }

    return this.prisma.extended.$transaction(async (prisma) => {
      // Restore the invoice
      const restored = await prisma.invoice.update({
        where: { id },
        data: {
          deletedAt: null,
          deletedBy: null,
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

      // If status is APPROVED, recreate stock and account movements
      if (invoice.status === InvoiceStatus.APPROVED) {
        // Create account movement
        const accountBalance = this.toDecimalNumber(invoice.account?.balance);
        const gt = this.toDecimalNumber(invoice.grandTotal);
        await prisma.accountMovement.create({
          data: {
            accountId: invoice.accountId,
            type: invoice.invoiceType === InvoiceType.SALE ? 'DEBIT' : 'CREDIT',
            amount: gt,
            balance: invoice.invoiceType === InvoiceType.SALE ? accountBalance + gt : accountBalance - gt,
            documentType: 'INVOICE',
            documentNo: invoice.invoiceNo,
            date: invoice.date,
            notes: `${invoice.invoiceType === InvoiceType.SALE ? 'Sales' : 'Purchase'} Invoice: ${invoice.invoiceNo} (Restored)`,
          },
        });

        // Update account balance
        await prisma.account.update({
          where: { id: invoice.accountId },
          data: {
            balance:
              invoice.invoiceType === InvoiceType.SALE
                ? { increment: invoice.grandTotal }
                : { decrement: invoice.grandTotal },
          },
        });

        // Recreate stock movements
        for (const item of invoice.items) {
          await prisma.productMovement.create({
            data: {
              productId: item.productId,
              movementType: invoice.invoiceType === InvoiceType.SALE ? 'SALE' : 'ENTRY',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              notes: `${invoice.invoiceType === InvoiceType.SALE ? 'Sales' : 'Purchase'} Invoice: ${invoice.invoiceNo} (Restored)`,
              invoiceItemId: item.id,
            },
          });
        }
      }

      // Audit log (inside transaction)
      await this.createLog(
        id,
        'RESTORE',
        userId,
        { invoice },
        ipAddress,
        userAgent,
        prisma,
      );

      return restored;
    });
  }

  async cancel(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    cancelDeliveryNote?: boolean,
  ) {
    const invoice = await this.findOne(id);

    // 1. Check if already cancelled
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('This invoice is already cancelled.');
    }

    // 2. Only APPROVED or OPEN invoices can be cancelled
    if (invoice.status !== InvoiceStatus.APPROVED && invoice.status !== InvoiceStatus.OPEN) {
      throw new BadRequestException(
        'Only APPROVED or OPEN invoices can be cancelled.',
      );
    }

    // 3. Paid invoices cannot be cancelled
    const paidAmount = Number(invoice.paidAmount || 0);
    if (paidAmount > 0.01) {
      throw new BadRequestException(
        `This invoice has a payment of ₺${paidAmount.toFixed(2)}. ` +
        'Paid invoices cannot be cancelled. Cancel payments first.',
      );
    }

    return this.prisma.extended.$transaction(async (prisma) => {
      // For SALE/PURCHASE cancel: Only revert account, no stock movement created (status is cancelled)
      // For SALES_RETURN/PURCHASE_RETURN: Revert both account and stock
      if (invoice.status === InvoiceStatus.APPROVED) {
        if (invoice.invoiceType === InvoiceType.SALE || invoice.invoiceType === InvoiceType.PURCHASE) {
          await this.reverseAccountOnlyForInvoice(invoice, prisma);
        } else {
          await this.reverseInvoiceMovements(invoice, prisma, invoice.tenantId ?? undefined, true);
        }
      }

      const cancelledInvoice = await prisma.invoice.update({
        where: { id },
        data: { status: InvoiceStatus.CANCELLED },
        include: {
          account: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Cancellation audit log (if was approved)
      if (invoice.status === InvoiceStatus.APPROVED) {
        const currentAccount = await prisma.account.findUnique({
          where: { id: invoice.accountId },
          select: { balance: true },
        });
        if (currentAccount) {
          await prisma.accountMovement.create({
            data: {
              accountId: invoice.accountId,
              type: invoice.invoiceType === InvoiceType.SALE ? 'CREDIT' : 'DEBIT',
              amount: this.toDecimalNumber(invoice.grandTotal),
              balance: this.toDecimalNumber(currentAccount.balance),
              documentType: 'CORRECTION',
              documentNo: `${invoice.invoiceNo}-CANCEL`,
              date: new Date(),
              notes: `Invoice Cancellation: ${invoice.invoiceNo}`,
            },
          });
        }
      }

      // Revert delivery note status if requested
      if (cancelDeliveryNote && invoice.deliveryNoteId) {
        const deliveryNote = await prisma.salesDeliveryNote.findUnique({
          where: { id: invoice.deliveryNoteId },
        });
        if (deliveryNote && deliveryNote.status === DeliveryNoteStatus.INVOICED) {
          await prisma.salesDeliveryNote.update({
            where: { id: deliveryNote.id },
            data: { status: DeliveryNoteStatus.NOT_INVOICED },
          });
        }
      }
      if (cancelDeliveryNote && invoice.purchaseDeliveryNoteId) {
        const deliveryNote = await prisma.purchaseDeliveryNote.findUnique({
          where: { id: invoice.purchaseDeliveryNoteId },
        });
        if (deliveryNote && deliveryNote.status === DeliveryNoteStatus.INVOICED) {
          await prisma.purchaseDeliveryNote.update({
            where: { id: deliveryNote.id },
            data: { status: DeliveryNoteStatus.NOT_INVOICED },
          });
        }
      }

      // Audit log (inside transaction)
      await this.createLog(
        id,
        'CANCELLATION',
        userId,
        { oldStatus: invoice.status, newStatus: InvoiceStatus.CANCELLED, cancelDeliveryNote },
        ipAddress,
        userAgent,
        prisma,
      );

      return cancelledInvoice;
    });
  }

  async changeStatus(
    id: string,
    newStatus: InvoiceStatus,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const invoice = await this.findOne(id);
    const oldStatus = invoice.status;

    if (oldStatus === newStatus) {
      throw new BadRequestException('Invoice is already in this status.');
    }

    return this.prisma.extended.$transaction(async (prisma) => {
      // If old status was APPROVED, revert movements
      if (oldStatus === InvoiceStatus.APPROVED) {
        if (invoice.invoiceType === InvoiceType.SALE || invoice.invoiceType === InvoiceType.PURCHASE) {
          await this.reverseAccountOnlyForInvoice(invoice, prisma);
        } else {
          await this.reverseInvoiceMovements(invoice, prisma, invoice.tenantId ?? undefined);
        }
      }

      // If new status is APPROVED, create movements
      if (newStatus === InvoiceStatus.APPROVED) {
        if (invoice.invoiceType === InvoiceType.SALE) {
          try {
            await this.invoiceProfitService.recalculateProfit(id, userId);
          } catch (error) {
            console.error('Profit calculation error:', error);
          }
        }
        // DRAFT -> APPROVED transition: process movements
        if (oldStatus === InvoiceStatus.DRAFT && newStatus === InvoiceStatus.APPROVED) {
          await this.processInvoiceMovements(
            invoice,
            prisma,
            userId,
            (invoice as any).warehouseId,
            [],
            invoice.tenantId,
          );
        }
      }

      // If new status is CANCELLED
      if (newStatus === InvoiceStatus.CANCELLED) {
        if (oldStatus === InvoiceStatus.APPROVED) {
          const account = await prisma.account.findUnique({
            where: { id: invoice.accountId },
          });

          if (account) {
            await prisma.accountMovement.create({
              data: {
                accountId: invoice.accountId,
                type: invoice.invoiceType === InvoiceType.SALE ? 'CREDIT' : 'DEBIT',
                amount: this.toDecimalNumber(invoice.grandTotal),
                balance: this.toDecimalNumber(account.balance),
                documentType: 'CORRECTION',
                documentNo: `${invoice.invoiceNo}-CANCEL`,
                date: new Date(),
                notes: `Invoice Cancellation: ${invoice.invoiceNo}`,
              },
            });
          }
        }
      }

      // Update status
      const updated = await prisma.invoice.update({
        where: { id },
        data: {
          status: newStatus,
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

      // Audit log (inside transaction)
      await this.createLog(
        id,
        'STATUS_CHANGE',
        userId,
        { oldStatus, newStatus },
        ipAddress,
        userAgent,
        prisma,
      );

      return updated;
    });
  }

  async getDueDateAnalysis(accountId?: string) {
    // Only APPROVED and not CLOSED (unpaid/partially paid) invoices
    const where: Prisma.InvoiceWhereInput = {
      deletedAt: null,
      status: InvoiceStatus.APPROVED,
      payableAmount: {
        gt: 0.01,
      },
    };

    if (accountId) {
      where.accountId = accountId;
    }

    const invoices = await this.prisma.extended.invoice.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            code: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { date: 'asc' },
      ],
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analysis = invoices.map((invoice) => {
      const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date(invoice.date);
      dueDate.setHours(0, 0, 0, 0);

      const daysRemaining = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      let dueDateStatus: 'PAST' | 'TODAY' | 'UPCOMING' | 'NORMAL';
      if (daysRemaining < 0) {
        dueDateStatus = 'PAST';
      } else if (daysRemaining === 0) {
        dueDateStatus = 'TODAY';
      } else if (daysRemaining <= 7) {
        dueDateStatus = 'UPCOMING';
      } else {
        dueDateStatus = 'NORMAL';
      }

      return {
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        invoiceType: invoice.invoiceType,
        account: invoice.account,
        date: invoice.date,
        dueDate: invoice.dueDate,
        grandTotal: invoice.grandTotal,
        paidAmount: invoice.paidAmount,
        payableAmount: invoice.payableAmount,
        daysRemaining,
        dueDateStatus,
        daysPassed: daysRemaining < 0 ? Math.abs(daysRemaining) : 0,
      };
    });

    const summary = {
      total: analysis.length,
      totalAmount: analysis.reduce((sum, f) => sum + Number(f.grandTotal), 0),
      totalPayableAmount: analysis.reduce(
        (sum, f) => sum + Number(f.payableAmount),
        0,
      ),

      pastDue: {
        count: analysis.filter((f) => f.dueDateStatus === 'PAST').length,
        amount: analysis
          .filter((f) => f.dueDateStatus === 'PAST')
          .reduce((sum, f) => sum + Number(f.payableAmount), 0),
      },

      dueToday: {
        count: analysis.filter((f) => f.dueDateStatus === 'TODAY').length,
        amount: analysis
          .filter((f) => f.dueDateStatus === 'TODAY')
          .reduce((sum, f) => sum + Number(f.payableAmount), 0),
      },

      upcoming: {
        count: analysis.filter((f) => f.dueDateStatus === 'UPCOMING').length,
        amount: analysis
          .filter((f) => f.dueDateStatus === 'UPCOMING')
          .reduce((sum, f) => sum + Number(f.payableAmount), 0),
      },

      normalInvoices: {
        count: analysis.filter((f) => f.dueDateStatus === 'NORMAL').length,
        amount: analysis
          .filter((f) => f.dueDateStatus === 'NORMAL')
          .reduce((sum, f) => sum + Number(f.payableAmount), 0),
      },
    };

    const accountSummary = accountId ? null : await this.getAccountBasedDueDateSummary(analysis);

    return {
      summary,
      accountSummary,
      invoices: analysis,
    };
  }

  private async getAccountBasedDueDateSummary(analysis: any[]) {
    // Group by account
    const accountMap = new Map<string, any>();

    analysis.forEach((invoice) => {
      const accountId = invoice.account.id;
      if (!accountMap.has(accountId)) {
        accountMap.set(accountId, {
          account: invoice.account,
          totalInvoices: 0,
          totalRemaining: 0,
          pastDueCount: 0,
          pastDueAmount: 0,
        });
      }

      const accountData = accountMap.get(accountId);
      accountData.totalInvoices += 1;
      accountData.totalRemaining += Number(invoice.payableAmount);

      if (invoice.dueDateStatus === 'PAST') {
        accountData.pastDueCount += 1;
        accountData.pastDueAmount += Number(invoice.payableAmount);
      }
    });

    return Array.from(accountMap.values()).sort(
      (a, b) => b.pastDueAmount - a.pastDueAmount,
    );
  }

  /**
   * Malzeme Hazırlama Fişi - Depo görevlileri için
   * Invoice itemsindeki ürünlerin hangi rafta olduğunu gösterir
   */
  async getMaterialPreparationSlip(invoiceId: string) {
    // Get invoice and its items
    const invoice = await this.prisma.extended.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        account: {
          select: {
            id: true,
            code: true,
            title: true,
            phone: true,
            address: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true,
                shelf: true, // Legacy shelf system
                barcode: true,
                brand: true,
                model: true,
              },
            },
          },
          orderBy: {
            product: {
              code: 'asc',
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Get shelf locations for each product (new system)
    const itemsWithShelf = await Promise.all(
      invoice.items.map(async (item) => {
        // Get shelf info from ProductLocationStock
        const shelfInfo = await this.prisma.extended.productLocationStock.findMany({
          where: {
            productId: item.productId,
            qtyOnHand: {
              gt: 0, // Only shelves with stock
            },
          },
          include: {
            location: {
              select: {
                id: true,
                code: true,
                barcode: true,
                name: true,
                layer: true,
                corridor: true,
                side: true,
                section: true,
                level: true,
              },
            },
            warehouse: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
          orderBy: [
            { qtyOnHand: 'desc' }, // Show shelves with most stock first
            { location: { code: 'asc' } },
          ],
        });

        return {
          productId: item.productId,
          productCode: item.product.code,
          productName: item.product.name,
          unit: item.product.unit,
          barcode: item.product.barcode,
          brand: item.product.brand,
          model: item.product.model,
          requestedQuantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          // Shelf info
          legacyShelf: item.product.shelf, // Shelf in legacy system
          shelves: shelfInfo.map((shelf) => ({
            warehouseCode: shelf.warehouse.code,
            warehouseName: shelf.warehouse.name,
            shelfCode: shelf.location.code,
            shelfBarcode: shelf.location.barcode,
            shelfDescription: shelf.location.name,
            layer: shelf.location.layer,
            corridor: shelf.location.corridor,
            side: shelf.location.side,
            section: shelf.location.section,
            level: shelf.location.level,
            onHandQuantity: shelf.qtyOnHand,
          })),
          totalOnHandQuantity: shelfInfo.reduce(
            (sum, shelf) => sum + shelf.qtyOnHand,
            0,
          ),
          totalShelfCount: shelfInfo.length,
        };
      }),
    );

    return {
      invoice: {
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        invoiceType: invoice.invoiceType,
        date: invoice.date,
        dueDate: invoice.dueDate,
        status: invoice.status,
        totalAmount: invoice.totalAmount,
        vatAmount: invoice.vatAmount,
        grandTotal: invoice.grandTotal,
        notes: invoice.notes,
      },
      account: invoice.account,
      items: itemsWithShelf,
      preparationInfo: {
        totalItemCount: itemsWithShelf.length,
        totalUnitCount: itemsWithShelf.reduce(
          (sum, k) => sum + k.requestedQuantity,
          0,
        ),
        missingProducts: itemsWithShelf.filter(
          (k) => k.totalOnHandQuantity < k.requestedQuantity,
        ),
        completeProducts: itemsWithShelf.filter(
          (k) => k.totalOnHandQuantity >= k.requestedQuantity,
        ),
      },
      generationDate: new Date(),
    };
  }

  /**
   * E-Invoice gönder - Hızlı Teknoloji API'sine fatura gönderir
   */
  async sendEInvoice(
    invoiceId: string,
    hizliService: any, // HizliService instance
    userId?: string,
  ) {
    // Get invoice data
    const invoice = await this.findOne(invoiceId);

    if (!invoice) {
      throw new NotFoundException(`Invoice not found: ${invoiceId}`);
    }

    if (invoice.invoiceType !== InvoiceType.SALE) {
      throw new BadRequestException('Only sales invoices can be sent as e-invoices');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cancelled invoices cannot be sent as e-invoices');
    }

    // Check account info
    if (!invoice.account.taxNumber && !invoice.account.nationalId) {
      throw new BadRequestException('Tax number or National ID not found in account info');
    }

    const customerIdentifier = invoice.account.taxNumber || invoice.account.nationalId;

    try {
      // 1. Get recipient URN info (GetGibUserList)
      let destinationUrn = '';
      try {
        const gibUserList = await hizliService.getGibUserList(1, 'PK', customerIdentifier);

        // REST API response format check
        if (gibUserList?.IsSucceeded && gibUserList?.gibUserLists && Array.isArray(gibUserList.gibUserLists) && gibUserList.gibUserLists.length > 0) {
          destinationUrn = gibUserList.gibUserLists[0].Alias || '';
          console.log(`✅ Recipient URN found: ${destinationUrn} (Identifier: ${customerIdentifier})`);
        } else if (gibUserList?.IsSucceeded === false) {
          throw new BadRequestException(`Recipient URN info could not be retrieved: ${gibUserList?.Message || 'GIB user list empty or not found'}`);
        } else {
          throw new BadRequestException(`Recipient URN info not found. GIB user list empty (Identifier: ${customerIdentifier})`);
        }
      } catch (error: any) {
        const errorMessage = error.message || error.response?.data?.message || 'Unknown error';
        throw new BadRequestException(`Recipient URN info could not be retrieved: ${errorMessage}`);
      }

      // 2. Map invoice data to Hizli Teknoloji format
      const invoiceModel = this.mapToHizliFormat(invoice, destinationUrn);

      // 3. Create InputInvoiceModel
      const inputInvoice = {
        AppType: 1, // 1: E-Invoice, 2: E-Arşiv, 3: E-İrsaliye
        SourceUrn: process.env.HIZLI_GB_URN || 'urn:mail:defaultgb@hizlibilisimteknolojileri.net',
        DestinationIdentifier: customerIdentifier,
        DestinationUrn: destinationUrn,
        IsDraft: false,
        IsDraftSend: false,
        IsPreview: false,
        LocalId: null,
        UpdateDocument: false,
        InvoiceModel: invoiceModel,
      };

      // 4. Send via sendInvoiceModel
      const result = await hizliService.sendInvoiceModel([inputInvoice]);

      // 5. Check result and save to DB
      if (result && result.length > 0 && result[0].IsSucceeded) {
        // Success - update e-invoice status
        await this.prisma.extended.invoice.update({
          where: { id: invoiceId },
          data: {
            eInvoiceStatus: 'SENT',
            eInvoiceEttn: result[0].UUID || null,
            updatedBy: userId,
          },
        });

        // Audit log
        await this.createLog(
          invoiceId,
          'EINVOICE_SEND',
          userId,
          {
            ettn: result[0].UUID,
            message: result[0].Message,
          },
        );

        return {
          success: true,
          message: result[0].Message || 'E-invoice sent successfully',
          ettn: result[0].UUID,
          data: result[0],
        };
      } else {
        // Failed
        const errorMessage = result && result.length > 0 ? result[0].Message : 'Unknown error';

        await this.prisma.extended.invoice.update({
          where: { id: invoiceId },
          data: {
            eInvoiceStatus: 'ERROR',
            updatedBy: userId,
          },
        });

        await this.createLog(
          invoiceId,
          'EINVOICE_SEND_ERROR',
          userId,
          {
            error: errorMessage,
          },
        );

        throw new BadRequestException(`E-invoice could not be sent: ${errorMessage}`);
      }
    } catch (error: any) {
      // On error, update status
      await this.prisma.extended.invoice.update({
        where: { id: invoiceId },
        data: {
          eInvoiceStatus: 'ERROR',
          updatedBy: userId,
        },
      });

      await this.createLog(
        invoiceId,
        'EINVOICE_SEND_ERROR',
        userId,
        {
          error: error.message,
        },
      );

      throw error;
    }
  }

  /**
   * Maps invoice data to Hizli Teknoloji format.
   */
  private mapToHizliFormat(invoice: any, destinationUrn: string) {
    const issueDate = new Date(invoice.date || new Date());
    const issueDateStr = issueDate.toISOString().split('T')[0];
    const issueTimeStr = issueDate.toTimeString().split(' ')[0]; // HH:mm:ss

    // Generate UUID if not exists
    const uuid = invoice.eInvoiceEttn || this.generateUUID();

    // Invoice Lines
    const invoiceLines = invoice.items.map((item: any, index: number) => {
      const unitPrice = Number(item.unitPrice);
      const quantity = Number(item.quantity);
      const amount = unitPrice * quantity;
      const vatRate = Number(item.vatRate || 0);
      const vatAmount = (amount * vatRate) / 100;

      // Unit code (C62 = Piece)
      const unitCode = this.mapBirimToUnitCode(item.product?.unit || 'ADET');

      return {
        ID: index + 1,
        Item_Name: item.product?.name || 'Item/Service',
        Quantity_Amount: quantity,
        Quantity_Unit_User: unitCode,
        Price_Amount: unitPrice,
        Price_Total: amount,
        Allowance_Percent: Number(item.discountRate || 0),
        Allowance_Amount: Number(item.discountAmount || 0),
        Allowance_Reason: null,
        Item_ID_Buyer: null,
        Item_ID_Seller: item.product?.code || null,
        Item_Description: item.product?.description || null,
        Item_Brand: item.product?.brand || null,
        Item_Model: item.product?.model || null,
        Item_Classification: null,
        LineNote: null,
        LineCurrencyCode: null,
        Manufacturers_ItemIdentification: null,
        exportLine: null,
        lineTaxes: [
          {
            Tax_Code: '0015', // VAT code
            Tax_Name: 'KDV',
            Tax_Base: amount,
            Tax_Perc: vatRate,
            Tax_Amnt: vatAmount,
            Tax_Exem: '',
            Tax_Exem_Code: '',
          },
        ],
      };
    });

    // Customer info
    const customer = {
      IdentificationID: invoice.account.taxNumber || invoice.account.nationalId || '',
      PartyName: invoice.account.title || '',
      TaxSchemeName: invoice.account.taxOffice || '',
      CountryName: invoice.account.country || 'TURKEY',
      CityName: invoice.account.city || '',
      CitySubdivisionName: invoice.account.district || '',
      StreetName: invoice.account.address || '',
      PostalZone: null,
      ElectronicMail: invoice.account.email || null,
      Telephone: invoice.account.phone || null,
      Telefax: null,
      WebsiteURI: null,
      Person_FirstName: invoice.account.companyType === 'INDIVIDUAL' ? (invoice.account.fullName?.split(' ')[0] || '') : '',
      Person_FamilyName: invoice.account.companyType === 'INDIVIDUAL' ? (invoice.account.fullName?.split(' ').slice(1).join(' ') || '') : '',
      customerIdentificationsOther: [],
    };

    // Invoice Header
    const invoiceHeader = {
      UUID: uuid,
      Invoice_ID: invoice.invoiceNo,
      ProfileID: 'TICARIFATURA', // TICARIFATURA, TEMELFATURA, EARSIVFATURA
      InvoiceTypeCode: 'SALE',
      IssueDate: issueDateStr,
      IssueTime: issueTimeStr,
      DocumentCurrencyCode: 'TRY',
      CalculationRate: 1,
      XSLT_Adi: 'general', // general.xslt dosyası
      XSLT_Doc: null,
      LineExtensionAmount: Number(invoice.totalAmount),
      AllowanceTotalAmount: Number(invoice.discount || 0),
      TaxInclusiveAmount: Number(invoice.totalAmount) + Number(invoice.vatAmount),
      PayableAmount: Number(invoice.grandTotal),
      Note: invoice.notes || '',
      Notes: invoice.notes ? [{ Note: invoice.notes }] : [],
      OrderReferenceId: invoice.orderNo || null,
      OrderReferenceDate: invoice.orderNo ? issueDateStr : null,
      IsInternetSale: false,
      IsInternet_PaymentMeansCode: null,
      IsInternet_PaymentDueDate: null,
      IsInternet_InstructionNote: null,
      IsInternet_WebsiteURI: null,
      IsInternet_Delivery_TcknVkn: null,
      IsInternet_Delivery_PartyName: null,
      IsInternet_Delivery_FirstName: null,
      IsInternet_Delivery_FamilyName: null,
      IsInternet_ActualDespatchDate: null,
      Sgk_AccountingCost: null,
      Sgk_Period_StartDate: null,
      Sgk_Period_EndDate: null,
      Sgk_Mukellef_Kodu: null,
      Sgk_Mukellef_Adi: null,
      Sgk_DosyaNo: null,
    };

    // Payment Means (Ödeme bilgileri)
    const paymentMeans = invoice.dueDate
      ? [
        {
          PaymentMeansCode: 'ZZZ', // Diğer
          InstructionNote: '-',
          PaymentChannelCode: '',
          PaymentDueDate: new Date(invoice.dueDate).toISOString(),
          PayeeFinancialAccount: null,
          PayeeFinancialCurrencyCode: 'TRY',
        },
      ]
      : [];

    return {
      invoiceheader: invoiceHeader,
      customer: customer,
      invoiceLines: invoiceLines,
      paymentMeans: paymentMeans,
      supplier: null, // Satıcı bilgileri sistemden alınacak (opsiyonel)
      supplierAgent: null,
      customerAgent: null,
      additionalDocumentReferences: [],
      despatchs: [],
    };
  }

  /**
   * Birim kodunu Hızlı Teknoloji unit code'una çevirir
   */
  private mapBirimToUnitCode(birim: string): string {
    const birimMap: Record<string, string> = {
      ADET: 'C62',
      KG: 'KGM',
      TON: 'TNE',
      LITRE: 'LTR',
      METRE: 'MTR',
      M2: 'MTK',
      M3: 'MTQ',
      PAKET: 'PK',
      KUTU: 'CT',
      PALET: 'PF',
    };

    return birimMap[birim.toUpperCase()] || 'C62'; // Varsayılan: Adet
  }

  /**
   * UUID oluşturur
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Satış invoicesı istatistikleri (Summary Cards)
   */
  /**
   * Sales invoice statistics (Summary Cards)
   */
  async getSalesStats(invoiceType?: InvoiceType) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseWhere: Prisma.InvoiceWhereInput = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
      ...(invoiceType && { invoiceType }),
    };

    // Only approved/partially paid/closed invoices
    const approvedStatuses: InvoiceStatus[] = [InvoiceStatus.APPROVED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.CLOSED];

    // Monthly total sales (approved only)
    const monthlyStats = await this.prisma.extended.invoice.aggregate({
      where: {
        ...baseWhere,
        date: { gte: startOfMonth },
        status: { in: approvedStatuses },
      },
      _sum: { grandTotal: true },
      _count: true,
    });

    // Pending collection (approved or partially paid)
    const pendingStats = await this.prisma.extended.invoice.aggregate({
      where: {
        ...baseWhere,
        status: { in: [InvoiceStatus.APPROVED, InvoiceStatus.PARTIALLY_PAID] },
      },
      _sum: { grandTotal: true },
      _count: true,
    });

    // Overdue (approved, partially paid, dueDate < now)
    const overdueStats = await this.prisma.extended.invoice.aggregate({
      where: {
        ...baseWhere,
        dueDate: { lt: now },
        status: { in: [InvoiceStatus.APPROVED, InvoiceStatus.PARTIALLY_PAID] },
      },
      _sum: { grandTotal: true },
      _count: true,
    });

    return {
      monthlySales: {
        amount: monthlyStats._sum.grandTotal || 0,
        count: monthlyStats._count || 0,
      },
      pendingCollection: {
        amount: pendingStats._sum.grandTotal || 0,
        count: pendingStats._count || 0,
      },
      overdue: {
        amount: overdueStats._sum.grandTotal || 0,
        count: overdueStats._count || 0,
      },
    };
  }

  /**
   * TCMB döviz kurunu getirir
   */
  async getExchangeRate(currency: string): Promise<number> {
    return this.tcmbService.getCurrentRate(currency);
  }

  /**
   * Müşteri bazlı fiyat geçmişi
   */
  /**
   * Price history based on customer
   */
  async getPriceHistory(accountId: string, productId: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    const items = await this.prisma.extended.invoiceItem.findMany({
      where: {
        productId,
        invoice: {
          accountId,
          invoiceType: InvoiceType.SALE,
          deletedAt: null,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      },
      include: {
        invoice: {
          select: {
            invoiceNo: true,
            date: true,
          },
        },
      },
      orderBy: {
        invoice: { date: 'desc' },
      },
      take: 10,
    });

    return items.map((k) => ({
      invoiceNo: k.invoice.invoiceNo,
      date: k.invoice.date,
      unitPrice: k.unitPrice,
      quantity: k.quantity,
      amount: k.amount,
    }));
  }

  /**
   * Toplu status güncelleme
   */
  /**
   * Bulk status update
   */
  async bulkUpdateStatus(ids: string[], status: InvoiceStatus, userId?: string) {
    const results: Array<{ id: string; success: boolean; message?: string }> = [];

    for (const id of ids) {
      try {
        await this.prisma.extended.invoice.update({
          where: { id },
          data: {
            status,
            updatedBy: userId,
          },
        });
        // Log the action
        await this.prisma.extended.invoiceLog.create({
          data: {
            invoiceId: id,
            userId,
            actionType: 'STATUS_CHANGE',
            changes: JSON.stringify({ status }),
          },
        });
        results.push({ id, success: true });
      } catch (error: any) {
        results.push({ id, success: false, message: error.message });
      }
    }

    return {
      total: ids.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * List invoices with advanced filtering
   */
  async findAllAdvanced(
    page = 1,
    limit = 50,
    invoiceType?: InvoiceType,
    search?: string,
    accountId?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    startDate?: string,
    endDate?: string,
    status?: string,
    salesAgentId?: string,
  ) {
    const skip = (page - 1) * limit;
    const tenantId = await this.tenantResolver.resolveForQuery();

    const where: Prisma.InvoiceWhereInput = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (invoiceType) where.invoiceType = invoiceType;
    if (accountId) where.accountId = accountId;
    if (salesAgentId) where.salesAgentId = salesAgentId;

    // Date range filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as any).gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (where.date as any).lte = end;
      }
    }

    // Status filter (comma separated: APPROVED,PARTIALLY_PAID)
    if (status) {
      const statuses = status.split(',').map((d) => d.trim()) as InvoiceStatus[];
      where.status = { in: statuses };
    }

    if (search) {
      where.OR = [
        { invoiceNo: { contains: search, mode: 'insensitive' } },
        { account: { title: { contains: search, mode: 'insensitive' } } },
        { account: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      if (sortBy === 'account') {
        orderBy = { account: { title: sortOrder || 'asc' } };
      } else {
        const sortFieldMap: Record<string, string> = {
          invoiceNo: 'invoiceNo',
          invoiceType: 'invoiceType',
          status: 'status',
          date: 'date',
          grandTotal: 'grandTotal',
          paidAmount: 'paidAmount',
        };
        orderBy = { [sortFieldMap[sortBy] || sortBy]: sortOrder || 'desc' };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.extended.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          account: { select: { id: true, code: true, title: true, type: true } },
          deliveryNote: {
            select: {
              id: true,
              deliveryNoteNo: true,
              sourceOrder: { select: { id: true, orderNo: true } },
            },
          },
          invoiceCollections: {
            include: {
              collection: {
                select: { id: true, date: true, type: true, paymentType: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          createdByUser: {
            select: { id: true, fullName: true, username: true },
          },
          updatedByUser: {
            select: { id: true, fullName: true, username: true },
          },
          salesAgent: {
            select: { id: true, fullName: true },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy,
      }),
      this.prisma.extended.invoice.count({ where }),
    ]);

    return {
      data: data.map((item: any) => {
        const account = item.account
          ? {
            id: item.account.id,
            accountCode: item.account.code,
            title: item.account.title,
            type: item.account.type,
          }
          : null;

        const deliveryNote = item.deliveryNote
          ? {
            id: item.deliveryNote.id,
            deliveryNoteNo: item.deliveryNote.deliveryNoteNo,
            sourceOrder: item.deliveryNote.sourceOrder
              ? { id: item.deliveryNote.sourceOrder.id, orderNo: item.deliveryNote.sourceOrder.orderNo }
              : null,
          }
          : null;

        const invoiceCollections = (item.invoiceCollections || []).map((ic: any) => ({
          ...ic,
          collection: ic.collection
            ? {
              id: ic.collection.id,
              date: ic.collection.date,
              type: ic.collection.type,
              paymentType: ic.collection.paymentType,
            }
            : null,
        }));

        return {
          ...item,
          account,
          deliveryNote,
          invoiceCollections,
          remainingAmount: Number(item.grandTotal) - Number(item.paidAmount || 0),
        };
      }),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get multiple invoices by IDs (for bulk printing)
   */
  async findManyByIds(ids: string[]) {
    return this.prisma.extended.invoice.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      include: {
        account: true,
        items: { include: { product: true } },
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });
  }

  /**
   * Reverse warehouse stock for a single product (used when reversing an approved invoice)
   */
  private async reverseWarehouseStockForInvoice(
    warehouseId: string,
    productId: string,
    quantity: number,
    invoiceType: string,
    prisma: any,
  ) {
    const wmsParam = await prisma.systemParameter.findFirst({
      where: { key: 'ENABLE_WMS_MODULE', OR: [{ tenantId: null }] },
      orderBy: { tenantId: 'desc' },
    });
    if (wmsParam?.value !== 'true' && wmsParam?.value !== true) return;

    const defaultLocation = await this.warehouseService.getOrCreateDefaultLocation(warehouseId);
    const stock = await prisma.productLocationStock.findUnique({
      where: {
        warehouseId_locationId_productId: {
          warehouseId,
          locationId: defaultLocation.id,
          productId,
        },
      },
    });
    if (!stock) return;

    // SALE had SALE (decrement) -> reverse = increment. PURCHASE had ENTRY (increment) -> reverse = decrement.
    const qtyChange =
      invoiceType === InvoiceType.SALE || invoiceType === InvoiceType.PURCHASE_RETURN ? quantity : -quantity;
    await prisma.productLocationStock.update({
      where: { id: stock.id },
      data: { qtyOnHand: { increment: qtyChange } },
    });
  }

  /**
   * SALES/PURCHASE iptal için sadece cari geri alır (product hareketi oluşturmaz).
   * Stok hesaplaması iptal faturaları dikkate almadığı için ek kayıt gerekmez.
   */
  /**
   * Only reverses account movements for SALE/PURCHASE cancellation.
   */
  private async reverseAccountOnlyForInvoice(invoice: any, prisma: any) {
    const grandTotal = Number(invoice.grandTotal);
    await prisma.accountMovement.deleteMany({
      where: {
        accountId: invoice.accountId,
        documentType: 'INVOICE',
        documentNo: invoice.invoiceNo,
      },
    });
    const balanceUpdate =
      invoice.invoiceType === InvoiceType.SALE || invoice.invoiceType === InvoiceType.PURCHASE_RETURN
        ? { decrement: grandTotal }
        : { increment: grandTotal };
    await prisma.account.update({
      where: { id: invoice.accountId },
      data: { balance: balanceUpdate },
    });
  }

  /**
   * Reverse cari and product movements for an already-approved invoice (used before re-applying on edit or on iptal)
   * @param useIptalTipi - true: hareketlerde IPTAL_GIRIS/IPTAL_CIKIS kullan (iptal için); false: IADE/CIKIS kullan (status değişikliği için)
   */
  private async reverseInvoiceMovements(
    invoice: any,
    prisma: any,
    tenantId?: string | null,
    useCancelType = false,
  ) {
    if (!invoice.items?.length) return;

    // Prevent duplicate stock entry: If cancellation movements already exist for this invoice, do nothing
    if (useCancelType) {
      const validItemCount = invoice.items.filter(
        (k: any) => k.productId && (Number(k.quantity) || 0) > 0,
      ).length;
      if (validItemCount > 0) {
        const existingCancelCount = await prisma.productMovement.count({
          where: {
            notes: `Invoice Cancellation: ${invoice.invoiceNo}`,
            movementType: { in: ['CANCELLATION_ENTRY', 'CANCELLATION_EXIT'] },
          },
        });
        if (existingCancelCount >= validItemCount) {
          return; // Cancellation movements already created, skip to avoid duplicates
        }
      }
    }

    const grandTotal = Number(invoice.grandTotal);
    const rawWh = (invoice as any).warehouseId;
    const transactionWarehouseId = rawWh && String(rawWh).trim() ? String(rawWh).trim() : undefined;

    // 1. Delete account movement for this invoice
    await prisma.accountMovement.deleteMany({
      where: {
        accountId: invoice.accountId,
        documentType: 'INVOICE',
        documentNo: invoice.invoiceNo,
      },
    });

    // 2. Reverse account balance
    const balanceUpdate =
      invoice.invoiceType === InvoiceType.SALE || invoice.invoiceType === InvoiceType.PURCHASE_RETURN
        ? { decrement: grandTotal }
        : { increment: grandTotal };
    await prisma.account.update({
      where: { id: invoice.accountId },
      data: { balance: balanceUpdate },
    });

    const effectiveTenantId = tenantId ?? invoice.tenantId ?? undefined;
    const description = useCancelType
      ? `Invoice Cancellation: ${invoice.invoiceNo}`
      : `Invoice update (reversal): ${invoice.invoiceNo}`;

    // 3. Create reversing ProductMovement for each item
    for (const item of invoice.items) {
      if (!item.productId) continue;
      const quantity = Number(item.quantity) || 0;
      if (quantity <= 0) continue;
      const unitPrice =
        typeof item.unitPrice === 'object' && item.unitPrice != null && 'toNumber' in item.unitPrice
          ? (item.unitPrice as any).toNumber()
          : Number(item.unitPrice);

      let reverseType: string;
      if (useCancelType) {
        if (invoice.invoiceType === InvoiceType.SALE) reverseType = 'CANCELLATION_ENTRY';
        else if (invoice.invoiceType === InvoiceType.PURCHASE) reverseType = 'CANCELLATION_EXIT';
        else if (invoice.invoiceType === InvoiceType.SALES_RETURN) reverseType = 'CANCELLATION_EXIT';
        else reverseType = 'CANCELLATION_ENTRY'; // PURCHASE_RETURN
      } else {
        if (invoice.invoiceType === InvoiceType.SALE) reverseType = 'RETURN';
        else if (invoice.invoiceType === InvoiceType.PURCHASE) reverseType = 'EXIT';
        else if (invoice.invoiceType === InvoiceType.SALES_RETURN) reverseType = 'EXIT';
        else reverseType = 'ENTRY'; // PURCHASE_RETURN
      }

      await prisma.productMovement.create({
        data: {
          productId: item.productId,
          movementType: reverseType as any,
          quantity: quantity,
          unitPrice: unitPrice,
          notes: description,
          warehouseId: transactionWarehouseId ?? null,
          ...(effectiveTenantId && { tenantId: effectiveTenantId }),
        },
      });

      // 4. Reverse warehouse stock when WMS enabled
      if (transactionWarehouseId) {
        await this.reverseWarehouseStockForInvoice(
          transactionWarehouseId,
          item.productId,
          quantity,
          invoice.invoiceType,
          prisma,
        );
      }
    }

    // SALE with deliveryNoteId may have used delivery note warehouseId
    if (invoice.invoiceType === InvoiceType.SALE && invoice.deliveryNoteId && !transactionWarehouseId) {
      const salesDeliveryNote = await prisma.salesDeliveryNote.findUnique({
        where: { id: invoice.deliveryNoteId },
        select: { warehouseId: true },
      });
      if (salesDeliveryNote?.warehouseId) {
        for (const item of invoice.items) {
          if (!item.productId) continue;
          const quantity = Number(item.quantity) || 0;
          if (quantity <= 0) continue;
          await this.reverseWarehouseStockForInvoice(
            salesDeliveryNote.warehouseId,
            item.productId,
            quantity,
            invoice.invoiceType,
            prisma,
          );
        }
      }
    }

    // PURCHASE may use warehouseId from purchaseDeliveryNote
    if (invoice.invoiceType === InvoiceType.PURCHASE && !transactionWarehouseId && invoice.purchaseDeliveryNoteId) {
      const deliveryNote = await prisma.purchaseDeliveryNote.findUnique({
        where: { id: invoice.purchaseDeliveryNoteId },
        select: { warehouseId: true },
      });
      if (deliveryNote?.warehouseId) {
        for (const item of invoice.items) {
          if (!item.productId) continue;
          const quantity = Number(item.quantity) || 0;
          if (quantity <= 0) continue;
          await this.reverseWarehouseStockForInvoice(
            deliveryNote.warehouseId,
            item.productId,
            quantity,
            invoice.invoiceType,
            prisma,
          );
        }
      }
    }
  }

  /**
   * Process and create Account and Stock movements for an approved invoice
   */
  private async processInvoiceMovements(
    invoice: any,
    prisma: any,
    userId?: string,
    warehouseId?: string,
    preparationSlips: any[] = [],
    tenantId?: string | null,
  ) {
    console.log('[processInvoiceMovements] Started:', {
      invoiceId: invoice.id,
      invoiceNo: invoice.invoiceNo,
      invoiceType: invoice.invoiceType,
      itemsCount: invoice.items?.length ?? 0,
      warehouseId,
      tenantId,
    });

    const currentAccount = await prisma.account.findUnique({
      where: { id: invoice.accountId },
      select: { balance: true },
    });

    if (!currentAccount) throw new NotFoundException('Account not found');

    const grandTotal = Number(invoice.grandTotal);
    const currentBalance = Number(currentAccount.balance ?? 0);
    let accountMovementType: 'DEBIT' | 'CREDIT';
    let accountBalanceChange: number;
    let description: string;
    let balanceUpdate: { increment?: number; decrement?: number };

    if (invoice.invoiceType === InvoiceType.SALE) {
      accountMovementType = 'DEBIT';
      accountBalanceChange = currentBalance + grandTotal;
      description = `Sales Invoice: ${invoice.invoiceNo}`;
      balanceUpdate = { increment: grandTotal };
    } else if (invoice.invoiceType === InvoiceType.SALES_RETURN) {
      accountMovementType = 'CREDIT';
      accountBalanceChange = currentBalance - grandTotal;
      description = `Sales Return Invoice: ${invoice.invoiceNo}`;
      balanceUpdate = { decrement: grandTotal };
    } else if (invoice.invoiceType === InvoiceType.PURCHASE) {
      accountMovementType = 'CREDIT';
      accountBalanceChange = currentBalance - grandTotal;
      description = `Purchase Invoice: ${invoice.invoiceNo}`;
      balanceUpdate = { decrement: grandTotal };
    } else {
      // PURCHASE_RETURN
      accountMovementType = 'DEBIT';
      accountBalanceChange = currentBalance + grandTotal;
      description = `Purchase Return Invoice: ${invoice.invoiceNo}`;
      balanceUpdate = { increment: grandTotal };
    }

    const effectiveTenantId = tenantId ?? invoice.tenantId ?? undefined;

    // 1. Create Account Movement
    await prisma.accountMovement.create({
      data: {
        accountId: invoice.accountId,
        type: accountMovementType,
        amount: grandTotal,
        balance: accountBalanceChange,
        documentType: 'INVOICE',
        documentNo: invoice.invoiceNo,
        date: new Date(invoice.date),
        notes: description,
        ...(effectiveTenantId && { tenantId: effectiveTenantId }),
      },
    });

    // 2. Update Account Balance
    await prisma.account.update({
      where: { id: invoice.accountId },
      data: { balance: balanceUpdate },
    });

    // 3. Create Stock Movements
    const rawWh = warehouseId ?? (invoice as any).warehouseId;
    const transactionWarehouseId = rawWh && String(rawWh).trim() ? String(rawWh).trim() : undefined;

    if (invoice.invoiceType === InvoiceType.SALE) {
      if (preparationSlips.length > 0) {
        for (const slip of preparationSlips) {
          const locationStock = await prisma.productLocationStock.findFirst({
            where: {
              productId: slip.orderItem.productId,
              locationId: slip.locationId,
            },
          });

          if (locationStock) {
            await prisma.productLocationStock.update({
              where: { id: locationStock.id },
              data: { qtyOnHand: { decrement: slip.quantity } },
            });
          }

          await prisma.stockMove.create({
            data: {
              productId: slip.orderItem.productId,
              fromWarehouseId: locationStock?.warehouseId,
              fromLocationId: slip.locationId,
              toWarehouseId: locationStock!.warehouseId,
              toLocationId: slip.locationId,
              qty: slip.quantity,
              moveType: 'SALE',
              refType: 'Invoice',
              refId: invoice.id,
              note: description,
              createdBy: userId,
            },
          });
        }
      }

      const salesItems = Array.isArray(invoice.items) ? invoice.items : [];
      for (const item of salesItems) {
        if (!item.productId) continue;
        await prisma.productMovement.create({
          data: {
            productId: item.productId,
            movementType: 'SALE',
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            notes: description,
            warehouseId: transactionWarehouseId,
            invoiceItemId: item.id,
            ...(effectiveTenantId && { tenantId: effectiveTenantId }),
          },
        });
      }

      if (preparationSlips.length === 0 && invoice.deliveryNoteId) {
        const salesDeliveryNote = await prisma.salesDeliveryNote.findUnique({
          where: { id: invoice.deliveryNoteId },
          select: { warehouseId: true },
        });

        if (salesDeliveryNote?.warehouseId) {
          for (const item of salesItems) {
            await this.updateWarehouseStock(
              salesDeliveryNote.warehouseId,
              item.productId,
              item.quantity,
              'SALE',
              invoice.id,
              'Invoice',
              description,
              userId,
              prisma,
            );
          }
        }
      }
    } else if (invoice.invoiceType === InvoiceType.SALES_RETURN) {
      const items = Array.isArray(invoice.items) ? invoice.items : [];
      for (const item of items) {
        if (!item.productId) continue;
        await prisma.productMovement.create({
          data: {
            productId: item.productId,
            movementType: 'ENTRY',
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            notes: description,
            warehouseId: transactionWarehouseId,
            invoiceItemId: item.id,
            ...(effectiveTenantId && { tenantId: effectiveTenantId }),
          },
        });

        if (transactionWarehouseId) {
          await this.updateWarehouseStock(
            transactionWarehouseId,
            item.productId,
            item.quantity,
            'PUT_AWAY',
            invoice.id,
            'Invoice',
            description,
            userId,
            prisma,
          );
        }
      }
    } else if (invoice.invoiceType === InvoiceType.PURCHASE) {
      const purchaseItems = Array.isArray(invoice.items) ? invoice.items : [];
      for (const item of purchaseItems) {
        if (!item.productId) continue;
        await prisma.productMovement.create({
          data: {
            productId: item.productId,
            movementType: 'ENTRY',
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            notes: description,
            warehouseId: transactionWarehouseId,
            invoiceItemId: item.id,
            ...(effectiveTenantId && { tenantId: effectiveTenantId }),
          },
        });
      }

      const whId =
        transactionWarehouseId ||
        (invoice.purchaseDeliveryNoteId
          ? (
            await prisma.purchaseDeliveryNote.findUnique({
              where: { id: invoice.purchaseDeliveryNoteId },
              select: { warehouseId: true },
            })
          )?.warehouseId
          : null);

      if (whId) {
        for (const item of purchaseItems) {
          await this.updateWarehouseStock(
            whId,
            item.productId,
            item.quantity,
            'PUT_AWAY',
            invoice.id,
            'Invoice',
            description,
            userId,
            prisma,
          );
        }
      }
    } else if (invoice.invoiceType === InvoiceType.PURCHASE_RETURN) {
      const purchaseReturnItems = Array.isArray(invoice.items) ? invoice.items : [];
      for (const item of purchaseReturnItems) {
        if (!item.productId) continue;
        await prisma.productMovement.create({
          data: {
            productId: item.productId,
            movementType: 'EXIT',
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            notes: description,
            warehouseId: transactionWarehouseId || null,
            invoiceItemId: item.id,
            ...(effectiveTenantId && { tenantId: effectiveTenantId }),
          },
        });

        if (transactionWarehouseId) {
          await this.updateWarehouseStock(
            transactionWarehouseId,
            item.productId,
            item.quantity,
            'SALE',
            invoice.id,
            'Invoice',
            description,
            userId,
            prisma,
          );
        }
      }
    }
  }

  async createPaymentPlan(invoiceId: string, plan: any[]) {
    return this.prisma.extended.$transaction(async (tx) => {
      await (tx as any).invoicePaymentPlan.deleteMany({
        where: { invoiceId },
      });

      return (tx as any).invoicePaymentPlan.createMany({
        data: plan.map(p => ({
          ...p,
          invoiceId,
          dueDate: new Date(p.dueDate),
        })),
      });
    });
  }
}
