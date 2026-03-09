import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

// Transaction içindeki prisma client tipi
type PrismaTransactionClient = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

@Injectable()
export class InvoiceProfitService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) { }

  /**
   * Ürünün güncel maliyetini StockCostHistory'den al
   * @param productId Stok ID
   * @param tenantId Tenant ID (opsiyonel, tenant kontrolü için)
   * @param prisma Prisma client instance (opsiyonel, transaction için)
   */
  private async getCurrentCost(
    productId: string,
    tenantId?: string | null,
    prisma?: PrismaTransactionClient,
  ): Promise<number> {
    const db = prisma || this.prisma;
    const currentTenantId = tenantId ?? (await this.tenantResolver.resolveForQuery());

    // Check tenant through product
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { tenantId: true },
    });

    if (!product) {
      console.warn(`Product not found: ${productId}`);
      return 0;
    }

    // Tenant check: If tenantId exists and product's tenantId is different, return 0
    if (currentTenantId && product.tenantId && product.tenantId !== currentTenantId) {
      console.warn(
        `Product tenantId (${product.tenantId}) doesn't match current tenantId (${currentTenantId}): ${productId}`,
      );
      return 0;
    }

    const latestCost = await db.productCostHistory.findFirst({
      where: {
        productId: productId,
      },
      orderBy: { computedAt: 'desc' },
      select: { cost: true },
    });

    return latestCost ? Number(latestCost.cost) : 0;
  }

  /**
   * Invoice için kar hesapla ve kaydet
   * @param invoiceId Invoice ID
   * @param userId User ID (opsiyonel)
   * @param prisma Prisma client instance (opsiyonel, transaction için)
   */
  async calculateAndSaveProfit(
    invoiceId: string,
    userId?: string,
    prisma?: PrismaTransactionClient,
  ): Promise<void> {
    const db = prisma || this.prisma;
    const tenantId = await this.tenantResolver.resolveForQuery();

    try {
      // Get invoice with items
      const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  tenantId: true,
                },
              },
            },
          },
        },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice not found: ${invoiceId}`);
      }

      // Calculate profit for SALES invoices only
      if (invoice.invoiceType !== 'SALE') {
        console.log(
          `Invoice ${invoiceId} is not SALE type (${invoice.invoiceType}), profit calculation skipped`,
        );
        return;
      }

      // No items, skip profit calculation
      if (!invoice.items || invoice.items.length === 0) {
        console.warn(`No items found for invoice ${invoiceId}, profit calculation skipped`);
        return;
      }

      // Delete existing profit records (for recalculation)
      const existingCount = await db.invoiceProfit.count({
        where: { invoiceId: invoiceId },
      });

      if (existingCount > 0) {
        console.log(`Deleting ${existingCount} existing profit records for invoice ${invoiceId}...`);
        const deleteResult = await db.invoiceProfit.deleteMany({
          where: { invoiceId: invoiceId },
        });
        console.log(`Deleted ${deleteResult.count} profit records for invoice ${invoiceId}`);

        // Re-check after deletion
        const remainingCount = await db.invoiceProfit.count({
          where: { invoiceId: invoiceId },
        });
        if (remainingCount > 0) {
          console.warn(`${remainingCount} records still exist for invoice ${invoiceId}, retrying delete...`);
          await db.invoiceProfit.deleteMany({
            where: { invoiceId: invoiceId },
          });
        }
      }

      let totalSalesAmount = new Decimal(0);
      let totalCost = new Decimal(0);
      const profitRecords: Prisma.InvoiceProfitCreateManyInput[] = [];
      const seenItemIds = new Set<string>(); // For duplicate item check

      // Calculate profit for each item
      for (const item of invoice.items) {
        // Duplicate item check - avoid multiple records for same item.id
        if (seenItemIds.has(item.id)) {
          console.warn(
            `Duplicate item found for invoice ${invoiceId} (item.id: ${item.id}), skipped`,
          );
          continue;
        }
        seenItemIds.add(item.id);

        // Skip if productId is missing
        if (!item.productId) {
          console.warn(
            `productId not found for invoice ${invoiceId} item ${item.id}, skipped`,
          );
          continue;
        }

        // Product tenant check
        const productTenantId = item.product?.tenantId;
        if (tenantId && productTenantId && productTenantId !== tenantId) {
          console.warn(
            `Product tenantId (${productTenantId}) doesn't match current tenantId (${tenantId}) for invoice ${invoiceId} item ${item.id}, skipped`,
          );
          continue;
        }

        const quantity = item.quantity;
        const netAmount = Number(item.amount || 0);
        const vatAmount = Number(item.vatAmount || 0);
        const totalSalesVatIncluded = netAmount + vatAmount; // Sales amount including VAT
        const unitPriceVatIncluded = quantity > 0 ? totalSalesVatIncluded / quantity : 0;
        const unitCost = await this.getCurrentCost(
          item.productId,
          tenantId,
          db,
        );

        const totalSales = new Decimal(totalSalesVatIncluded);
        const totalCostItem = new Decimal(unitCost * quantity);
        const profit = totalSales.minus(totalCostItem);
        const profitRate =
          totalCostItem.gt(0)
            ? profit.dividedBy(totalCostItem).times(100)
            : new Decimal(0);

        totalSalesAmount = totalSalesAmount.plus(totalSales);
        totalCost = totalCost.plus(totalCostItem);

        // Item-based profit record (based on price including VAT)
        profitRecords.push({
          invoiceId: invoiceId,
          invoiceItemId: item.id,
          productId: item.productId,
          tenantId: tenantId || null,
          quantity: quantity,
          unitPrice: new Decimal(unitPriceVatIncluded),
          unitCost: new Decimal(unitCost),
          totalSalesAmount: totalSales,
          totalCost: totalCostItem,
          profit: profit,
          profitRate: profitRate,
        });
      }

      // Invoice-based total profit record (invoiceItemId = null)
      const totalProfit = totalSalesAmount.minus(totalCost);
      const totalProfitRate =
        totalCost.gt(0)
          ? totalProfit.dividedBy(totalCost).times(100)
          : new Decimal(0);

      // Get first item productId (as reference for total record)
      const firstItemProductId = invoice.items.find((k) => k.productId)?.productId;

      if (!firstItemProductId) {
        console.warn(
          `No valid productId found for invoice ${invoiceId}, total record not created`,
        );
        // Save item-based records if they exist
        if (profitRecords.length > 0) {
          await db.invoiceProfit.createMany({
            data: profitRecords,
          });
        }
        return;
      }

      profitRecords.push({
        invoiceId: invoiceId,
        invoiceItemId: null, // null for total record
        productId: firstItemProductId, // first item productId (for reference only)
        tenantId: tenantId || null,
        quantity: invoice.items.reduce((sum, k) => sum + k.quantity, 0),
        unitPrice: new Decimal(0), // 0 for total record
        unitCost: new Decimal(0), // 0 for total record
        totalSalesAmount: totalSalesAmount,
        totalCost: totalCost,
        profit: totalProfit,
        profitRate: totalProfitRate,
      });

      // Create all records (if any)
      if (profitRecords.length > 0) {
        // Duplicate check - based on invoiceItemId
        const uniqueRecords = new Map<string, Prisma.InvoiceProfitCreateManyInput>();
        for (const record of profitRecords) {
          const key = record.invoiceItemId || 'total';
          if (!uniqueRecords.has(key)) {
            uniqueRecords.set(key, record);
          } else {
            console.warn(
              `Duplicate profit record found for invoice ${invoiceId} (invoiceItemId: ${record.invoiceItemId}), skipped`,
            );
          }
        }

        const finalRecords = Array.from(uniqueRecords.values());
        await db.invoiceProfit.createMany({
          data: finalRecords,
        });
        console.log(
          `Created ${finalRecords.length} profit records for invoice ${invoiceId}`,
        );
      } else {
        console.warn(`Could not create profit record for invoice ${invoiceId} (no items or invalid)`);
      }
    } catch (error: any) {
      console.error(
        `Error calculating profit for invoice ${invoiceId}:`,
        error?.message || error,
        error?.stack,
      );
      throw error;
    }
  }

  /**
   * Recalculate invoice profit (in draft status)
   */
  async recalculateProfit(
    invoiceId: string,
    userId?: string,
  ): Promise<void> {
    await this.calculateAndSaveProfit(invoiceId, userId);
  }

  /**
   * Invoice bazlı kar bilgisi
   */
  async getProfitByInvoice(invoiceId: string) {
    const invoice = await this.prisma.extended.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        account: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice not found: ${invoiceId}`);
    }

    // Invoice total profit record (invoiceItemId = null)
    const totalProfitRecord = await this.prisma.extended.invoiceProfit.findFirst({
      where: {
        invoiceId: invoiceId,
        invoiceItemId: null,
      },
    });

    // Item-based profit records
    const itemProfitRecords = await this.prisma.extended.invoiceProfit.findMany({
      where: {
        invoiceId: invoiceId,
        invoiceItemId: { not: null },
      },
      include: {
        invoiceItem: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        computedAt: 'asc',
      },
    });

    return {
      invoice: {
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        date: invoice.date,
        account: invoice.account,
        totalSalesAmount: totalProfitRecord
          ? Number(totalProfitRecord.totalSalesAmount)
          : 0,
        totalCost: totalProfitRecord ? Number(totalProfitRecord.totalCost) : 0,
        totalProfit: totalProfitRecord ? Number(totalProfitRecord.profit) : 0,
        profitRate: totalProfitRecord ? Number(totalProfitRecord.profitRate) : 0,
      },
      items: itemProfitRecords.map((record) => ({
        id: record.id,
        invoiceItemId: record.invoiceItemId,
        product: record.invoiceItem?.product,
        quantity: record.quantity,
        unitPrice: Number(record.unitPrice),
        unitCost: Number(record.unitCost),
        totalSalesAmount: Number(record.totalSalesAmount),
        totalCost: Number(record.totalCost),
        profit: Number(record.profit),
        profitRate: Number(record.profitRate),
      })),
    };
  }

  /**
   * Ürün bazlı kar bilgisi
   */
  async getProfitByProduct(filters?: {
    productId?: string;
    startDate?: Date;
    endDate?: Date;
    tenantId?: string;
  }) {
    const tenantId = filters?.tenantId ?? (await this.tenantResolver.resolveForQuery());

    const where: Prisma.InvoiceProfitWhereInput = {
      invoiceItemId: { not: null }, // Sadece kalem bazlı kayıtlar
      ...(filters?.productId && { productId: filters.productId }),
      ...(filters?.startDate || filters?.endDate
        ? {
          invoice: {
            date: {
              ...(filters?.startDate && { gte: filters.startDate }),
              ...(filters?.endDate && { lte: filters.endDate }),
            },
          },
        }
        : {}),
    };

    // TenantId varsa filtre ekle, yoksa ekleme (null tenantId'li kayıtlar da dahil)
    if (tenantId) {
      where.tenantId = tenantId;
    }

    let profitRecords = await this.prisma.extended.invoiceProfit.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNo: true,
            date: true,
            account: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        invoice: {
          date: 'desc',
        },
      },
    });

    // If no profit records found, calculate automatically for SALE invoices
    if (profitRecords.length === 0) {
      console.log('[getProfitByProduct] No profit records found, starting automatic calculation for SALE invoices...');

      // Find SALE invoices
      const invoiceWhere: Prisma.InvoiceWhereInput = {
        invoiceType: 'SALE',
        ...(filters?.startDate || filters?.endDate
          ? {
            date: {
              ...(filters?.startDate && { gte: filters.startDate }),
              ...(filters?.endDate && { lte: filters.endDate }),
            },
          }
          : {}),
      };

      // TenantId varsa filtre ekle
      if (tenantId) {
        invoiceWhere.tenantId = tenantId;
      }

      const invoices = await this.prisma.extended.invoice.findMany({
        where: invoiceWhere,
        select: {
          id: true,
        },
        take: 100, // Handle first 100 invoices (for performance)
      });

      console.log(`[getProfitByProduct] Calculating profit for ${invoices.length} invoices...`);

      // Bulk calculate profit
      await Promise.allSettled(
        invoices.map((invoice) =>
          this.calculateAndSaveProfit(invoice.id).catch((err) => {
            console.error(`[getProfitByProduct] Profit calculation error (invoice ${invoice.id}):`, err);
          })
        )
      );

      // Yeniden sorgula
      profitRecords = await this.prisma.extended.invoiceProfit.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          invoice: {
            select: {
              id: true,
              invoiceNo: true,
              date: true,
              account: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: {
          invoice: {
            date: 'desc',
          },
        },
      });

      console.log(`[getProfitByProduct] ${profitRecords.length} profit records found`);
    }

    // Product-based totals
    const productMap = new Map<
      string,
      {
        product: { id: string; code: string; name: string };
        totalQuantity: number;
        totalSalesAmount: number;
        totalCost: number;
        totalProfit: number;
        invoices: Array<{
          invoiceId: string;
          invoiceNo: string;
          date: Date;
          account: { id: string; title: string };
          quantity: number;
          salesAmount: number;
          cost: number;
          profit: number;
        }>;
      }
    >();

    for (const record of profitRecords) {
      // Skip if product is null
      if (!record.product) {
        continue;
      }

      const productId = record.productId;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product: record.product,
          totalQuantity: 0,
          totalSalesAmount: 0,
          totalCost: 0,
          totalProfit: 0,
          invoices: [],
        });
      }

      const productEntry = productMap.get(productId)!;
      productEntry.totalQuantity += record.quantity;
      productEntry.totalSalesAmount += Number(record.totalSalesAmount);
      productEntry.totalCost += Number(record.totalCost);
      productEntry.totalProfit += Number(record.profit);

      productEntry.invoices.push({
        invoiceId: record.invoiceId,
        invoiceNo: record.invoice.invoiceNo,
        date: record.invoice.date,
        account: record.invoice.account,
        quantity: record.quantity,
        salesAmount: Number(record.totalSalesAmount),
        cost: Number(record.totalCost),
        profit: Number(record.profit),
      });
    }

    // Convert Map to array and calculate profit rate
    const result = Array.from(productMap.values()).map((product) => ({
      ...product,
      profitRate:
        product.totalCost > 0
          ? (product.totalProfit / product.totalCost) * 100
          : 0,
    }));

    return result;
  }

  /**
   * Invoice bazlı karlılık listesi (master-detail için)
   */
  async getProfitList(filters?: {
    startDate?: Date;
    endDate?: Date;
    accountId?: string;
    status?: string;
    tenantId?: string;
  }) {
    const tenantId = filters?.tenantId ?? (await this.tenantResolver.resolveForQuery());

    const where: Prisma.InvoiceWhereInput = {
      invoiceType: 'SALE',
      ...(filters?.accountId && { accountId: filters.accountId }),
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.startDate || filters?.endDate
        ? {
          date: {
            ...(filters?.startDate && { gte: filters.startDate }),
            ...(filters?.endDate && { lte: filters.endDate }),
          },
        }
        : {}),
    };

    // TenantId varsa filtre ekle, yoksa ekleme (null tenantId'li faturalar da dahil)
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const invoices = await this.prisma.extended.invoice.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Get total profit record for each invoice with separate query
    const invoiceIds = invoices.map((f) => f.id);

    // TenantId null ise filtre eklemeyelim, varsa filtreleyelim
    const profitWhere: Prisma.InvoiceProfitWhereInput = {
      invoiceId: { in: invoiceIds },
      invoiceItemId: null, // Sadece toplam kayıtları
    };

    // TenantId varsa filtre ekle, yoksa ekleme (null tenantId'li kayıtlar da dahil)
    if (tenantId) {
      profitWhere.tenantId = tenantId;
    }

    const totalProfitRecords = await this.prisma.extended.invoiceProfit.findMany({
      where: profitWhere,
    });

    const profitMap = new Map(
      totalProfitRecords.map((k) => [k.invoiceId, k]),
    );

    // Calculate profit automatically for invoices without profit record
    const invoicesWithoutProfit = invoices.filter((f) => !profitMap.has(f.id));

    // Bulk calculate profit (async, continue silently on error)
    if (invoicesWithoutProfit.length > 0) {
      console.log(`[getProfitList] Calculating profit for ${invoicesWithoutProfit.length} invoices...`);

      await Promise.allSettled(
        invoicesWithoutProfit.map((invoice) =>
          this.calculateAndSaveProfit(invoice.id).catch((err) => {
            console.error(`[getProfitList] Profit calculation error (invoice ${invoice.id}):`, err);
          })
        )
      );

      // Re-query (with tenantId check)
      const newProfitWhere: Prisma.InvoiceProfitWhereInput = {
        invoiceId: { in: invoiceIds },
        invoiceItemId: null,
      };

      if (tenantId) {
        newProfitWhere.tenantId = tenantId;
      }

      const newTotalProfitRecords = await this.prisma.extended.invoiceProfit.findMany({
        where: newProfitWhere,
      });

      newTotalProfitRecords.forEach((k) => {
        profitMap.set(k.invoiceId, k);
      });

      console.log(`[getProfitList] ${newTotalProfitRecords.length} profit records found`);
    }

    return invoices.map((invoice) => {
      const totalProfit = profitMap.get(invoice.id);

      return {
        invoice: {
          id: invoice.id,
          invoiceNo: invoice.invoiceNo,
          date: invoice.date,
          account: invoice.account,
          status: invoice.status,
        },
        totalSalesAmount: totalProfit
          ? Number(totalProfit.totalSalesAmount)
          : Number(invoice.grandTotal || 0), // VAT included (fallback)
        totalCost: totalProfit ? Number(totalProfit.totalCost) : 0,
        totalProfit: totalProfit ? Number(totalProfit.profit) : 0,
        profitRate: totalProfit ? Number(totalProfit.profitRate) : 0,
      };
    });
  }

  async getProfitDetailByInvoice(invoiceId: string) {
    // First check profit records
    let itemProfitRecords = await this.prisma.extended.invoiceProfit.findMany({
      where: {
        invoiceId: invoiceId,
        invoiceItemId: { not: null },
      },
      include: {
        invoiceItem: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        computedAt: 'desc', // Latest records first
      },
    });

    // If no profit records found, calculate automatically
    const hasValidRecords = itemProfitRecords.some(
      (k) => k.invoiceItemId !== null && k.invoiceItem !== null,
    );

    if (!hasValidRecords) {
      try {
        console.log(`[getProfitDetailByInvoice] No valid profit record for invoice ${invoiceId}, starting automatic calculation...`);
        await this.calculateAndSaveProfit(invoiceId);
        // Re-query
        itemProfitRecords = await this.prisma.extended.invoiceProfit.findMany({
          where: {
            invoiceId: invoiceId,
            invoiceItemId: { not: null },
          },
          include: {
            invoiceItem: {
              include: {
                product: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            computedAt: 'desc',
          },
        });
        console.log(`[getProfitDetailByInvoice] Found ${itemProfitRecords.length} profit records for invoice ${invoiceId}`);
      } catch (error) {
        console.error(`Profit calculation error (invoice ${invoiceId}):`, error);
        // Return empty array on error
        return [];
      }
    }

    // Filter duplicate records - each invoiceItemId should have only one record
    // If duplicates exist, take the latest one (for safety)
    const uniqueItemMap = new Map<string, typeof itemProfitRecords[0]>();

    for (const record of itemProfitRecords) {
      // Skip null invoiceItemId (total records)
      if (!record.invoiceItemId) {
        continue;
      }

      // If no record for this invoiceItemId or existing is older, update
      const existing = uniqueItemMap.get(record.invoiceItemId);
      if (!existing || record.computedAt > existing.computedAt) {
        uniqueItemMap.set(record.invoiceItemId, record);
      } else if (existing && record.computedAt <= existing.computedAt) {
        // Duplicate record found
        console.warn(`[getProfitDetailByInvoice] Duplicate record found (invoiceItemId: ${record.invoiceItemId}, id: ${record.id}), skipped`);
      }
    }

    // Convert from Map to array and filter null invoiceItem
    return Array.from(uniqueItemMap.values())
      .filter((record) => record.invoiceItem !== null)
      .sort((a, b) => {
        // Sort by calculation date (older records first)
        return a.computedAt.getTime() - b.computedAt.getTime();
      })
      .map((record) => ({
        id: record.id,
        product: record.invoiceItem?.product || null,
        quantity: record.quantity,
        unitPrice: Number(record.unitPrice),
        unitCost: Number(record.unitCost),
        totalSalesAmount: Number(record.totalSalesAmount),
        totalCost: Number(record.totalCost),
        profit: Number(record.profit),
        profitRate: Number(record.profitRate),
      }));
  }
}
