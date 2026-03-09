import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { OverviewQueryDto } from './dto/overview-query.dto';

interface DateRangeResult {
  startDate: Date;
  endDate: Date;
  preset: string;
}

interface CariSummary {
  id: string;
  code: string;
  title: string;
}

interface StokSummary {
  id: string;
  code: string;
  name: string;
  unit: string;
}

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) { }

  async getOverview(query: OverviewQueryDto) {
    const range = this.resolveRange(query);

    const now = new Date();

    const faturaWhereBase: Prisma.InvoiceWhereInput = {
      deletedAt: null,
      date: {
        gte: range.startDate,
        lte: range.endDate,
      },
    };

    const approvedSalesWhereBase: Prisma.InvoiceWhereInput = {
      ...faturaWhereBase,
      status: 'APPROVED',
    };

    const approvedPurchaseWhereBase: Prisma.InvoiceWhereInput = {
      ...faturaWhereBase,
      status: 'APPROVED',
    };

    const [
      satisSum,
      satisIadeSum,
      alisSum,
      alisIadeSum,
      collectionsSum,
      paymentsSum,
      expenseSum,
      receivableInvoices,
      payableInvoices,
      topCustomersRaw,
      topProductsRaw,
    ] = await Promise.all([
      this.prisma.extended.invoice.aggregate({
        where: { ...approvedSalesWhereBase, invoiceType: 'SALE' as any },
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
      this.prisma.extended.invoice.aggregate({
        where: { ...approvedSalesWhereBase, invoiceType: 'SALES_RETURN' as any },
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
      this.prisma.extended.invoice.aggregate({
        where: { ...approvedPurchaseWhereBase, invoiceType: 'PURCHASE' as any },
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
      this.prisma.extended.invoice.aggregate({
        where: { ...approvedPurchaseWhereBase, invoiceType: 'PURCHASE_RETURN' as any },
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
      this.prisma.extended.collection.aggregate({
        where: {
          type: 'COLLECTION',
          date: {
            gte: range.startDate,
            lte: range.endDate,
          },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.extended.collection.aggregate({
        where: {
          type: 'PAYMENT',
          date: {
            gte: range.startDate,
            lte: range.endDate,
          },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.extended.expense.aggregate({
        where: {
          date: {
            gte: range.startDate,
            lte: range.endDate,
          },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.extended.invoice.findMany({
        where: {
          ...approvedSalesWhereBase,
          invoiceType: { in: ['SALE', 'SALES_RETURN'] as any },
          payableAmount: { gt: 0 },
        },
        select: {
          id: true,
          invoiceType: true,
          payableAmount: true,
          dueDate: true,
          accountId: true,
        },
      }),
      this.prisma.extended.invoice.findMany({
        where: {
          ...approvedPurchaseWhereBase,
          invoiceType: { in: ['PURCHASE', 'PURCHASE_RETURN'] as any },
          payableAmount: { gt: 0 },
        },
        select: {
          id: true,
          invoiceType: true,
          payableAmount: true,
          dueDate: true,
          accountId: true,
        },
      }),
      this.prisma.extended.invoice.groupBy({
        by: ['accountId'],
        where: {
          ...approvedSalesWhereBase,
          invoiceType: 'SALE' as any,
        },
        _sum: { grandTotal: true },
        _count: { _all: true },
        orderBy: {
          _sum: {
            grandTotal: 'desc',
          },
        },
        take: 5,
      }),
      this.prisma.extended.invoiceItem.groupBy({
        by: ['productId'],
        where: {
          invoice: {
            ...approvedSalesWhereBase,
            invoiceType: 'SALE' as any,
          },
        },
        _sum: {
          amount: true,
          quantity: true,
        },
        _count: { _all: true },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    const totalSales =
      this.toNumber((satisSum as any)._sum.grandTotal) -
      this.toNumber((satisIadeSum as any)._sum.grandTotal);
    const totalPurchases =
      this.toNumber((alisSum as any)._sum.grandTotal) -
      this.toNumber((alisIadeSum as any)._sum.grandTotal);
    const collections = this.toNumber((collectionsSum as any)._sum.amount);
    const payments = this.toNumber((paymentsSum as any)._sum.amount);
    const expenses = this.toNumber((expenseSum as any)._sum.amount);
    const grossProfit = totalSales - totalPurchases;
    const netCashFlow = collections - payments;

    const receivablesTotal = receivableInvoices.reduce(
      (sum, fatura: any) => sum + this.toNumber(fatura.payableAmount),
      0,
    );
    const receivablesOverdue = receivableInvoices
      .filter((fatura: any) => fatura.dueDate && fatura.dueDate < now)
      .reduce((sum, fatura: any) => sum + this.toNumber(fatura.payableAmount), 0);

    const payablesTotal = payableInvoices.reduce(
      (sum, fatura: any) => sum + this.toNumber(fatura.payableAmount),
      0,
    );
    const payablesOverdue = payableInvoices
      .filter((fatura: any) => fatura.dueDate && fatura.dueDate < now)
      .reduce((sum, fatura: any) => sum + this.toNumber(fatura.payableAmount), 0);

    const accountIds = topCustomersRaw.map((item: any) => item.accountId);
    const [accounts, products] = await Promise.all([
      accountIds.length
        ? this.prisma.extended.account.findMany({
          where: { id: { in: accountIds } },
          select: { id: true, code: true, title: true },
        })
        : Promise.resolve<CariSummary[]>([]),
      topProductsRaw.length
        ? this.prisma.extended.product.findMany({
          where: { id: { in: topProductsRaw.map((item: any) => item.productId) } },
          select: { id: true, code: true, name: true, unit: true },
        })
        : Promise.resolve<StokSummary[]>([]),
    ]);

    const cariMap = new Map<string, CariSummary>(
      accounts.map<[string, CariSummary]>((cari) => [cari.id, cari]),
    );
    const stokMap = new Map<string, StokSummary>(
      products.map<[string, StokSummary]>((product) => [product.id, product]),
    );

    const topCustomers = topCustomersRaw.map((item) => {
      const cari = cariMap.get((item as any).accountId);
      return {
        accountId: (item as any).accountId,
        code: (cari as any)?.code ?? 'Bilinmiyor',
        title: (cari as any)?.title ?? 'Bilinmeyen Cari',
        totalAmount: this.toNumber((item as any)._sum?.grandTotal),
        invoiceCount: item._count?._all ?? 0,
      };
    });

    const topProducts = topProductsRaw.map((item) => {
      const product = stokMap.get((item as any).productId);
      return {
        productId: (item as any).productId,
        code: (product as any)?.code ?? 'Bilinmiyor',
        name: (product as any)?.name ?? 'Bilinmeyen Ürün',
        unit: (product as any)?.unit ?? '-',
        totalAmount: this.toNumber((item as any)._sum?.amount),
        totalQuantity: (item as any)._sum?.quantity ?? 0,
        soldItemCount: item._count?._all ?? 0,
      };
    });

    const lowStockItems = await this.getLowStockItems();

    return {
      range: {
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
        preset: range.preset,
      },
      financialSummary: {
        totalSales,
        totalSalesCount: satisSum._count.id ?? 0,
        totalSalesReturns: this.toNumber((satisIadeSum as any)._sum.grandTotal),
        totalPurchases,
        totalPurchaseCount: alisSum._count.id ?? 0,
        totalPurchaseReturns: this.toNumber((alisIadeSum as any)._sum.grandTotal),
        grossProfit,
        collections,
        collectionsCount: collectionsSum._count.id ?? 0,
        payments,
        paymentsCount: paymentsSum._count.id ?? 0,
        expenses,
        expensesCount: expenseSum._count.id ?? 0,
        netCashFlow,
      },
      receivables: {
        total: receivablesTotal,
        overdue: receivablesOverdue,
      },
      payables: {
        total: payablesTotal,
        overdue: payablesOverdue,
      },
      topCustomers,
      topProducts,
      lowStockItems,
    };
  }

  private async getLowStockItems() {
    const candidates = await this.prisma.extended.product.findMany({
      where: {
        criticalQty: { gt: 0 },
      },
      select: {
        id: true,
        code: true,
        name: true,
        unit: true,
        criticalQty: true,
      },
      take: 25,
      orderBy: {
        criticalQty: 'desc',
      },
    });

    const itemsWithStock = await Promise.all(
      candidates.map(async (product) => {
        const hareketler = await this.prisma.extended.productMovement.groupBy({
          by: ['movementType'],
          where: { productId: product.id },
          _sum: { quantity: true },
        });

        const netMiktar = hareketler.reduce((total, hareket) => {
          const quantity = (hareket as any)._sum.quantity ?? 0;
          switch ((hareket as any).movementType) {
            case 'ENTRY':
            case 'COUNT_SURPLUS':
            case 'RETURN':
            case 'CANCELLATION_ENTRY':
              return total + quantity;
            case 'EXIT':
            case 'SALE':
            case 'COUNT_SHORTAGE':
            case 'CANCELLATION_EXIT':
              return total - quantity;
            default:
              return total;
          }
        }, 0);

        const kritik = Number((product as any).criticalQty);

        return {
          productId: product.id,
          code: (product as any).code,
          name: (product as any).name,
          unit: (product as any).unit,
          quantity: netMiktar,
          criticalQty: kritik,
          shortage: kritik - netMiktar,
        };
      }),
    );

    return itemsWithStock
      .filter((item) => item.quantity <= item.criticalQty)
      .sort((a, b) => b.shortage - a.shortage)
      .slice(0, 5);
  }

  private toNumber(value: Prisma.Decimal | number | null | undefined): number {
    if (!value) {
      return 0;
    }
    if (typeof value === 'number') {
      return value;
    }
    return Number(value.toString());
  }

  private resolveRange(query: OverviewQueryDto): DateRangeResult {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);

    let startDate: Date;
    let preset = query.preset ?? 'last30';

    switch (preset) {
      case 'today': {
        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'thisMonth': {
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      }
      case 'lastMonth': {
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        endDate.setTime(
          new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            0,
            23,
            59,
            59,
            999,
          ).getTime(),
        );
        break;
      }
      case 'last90': {
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 89);
        break;
      }
      case 'custom': {
        if (!query.startDate || !query.endDate) {
          throw new Error(
            'Özel date aralığı için başlangıç ve bitiş tarihi gereklidir.',
          );
        }
        startDate = new Date(query.startDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'last30':
      default: {
        preset = 'last30';
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 29);
        break;
      }
    }

    return { startDate, endDate, preset };
  }

  async getSalespersonPerformance(query: OverviewQueryDto) {
    const range = this.resolveRange(query);

    const [salesRaw, collectionsRaw, salespersons] = await Promise.all([
      this.prisma.extended.invoice.groupBy({
        by: ['salesAgentId'],
        where: {
          invoiceType: 'SALE' as any,
          status: 'APPROVED',
          date: {
            gte: range.startDate,
            lte: range.endDate,
          },
          deletedAt: null,
          salesAgentId: { not: null },
        },
        _sum: {
          grandTotal: true,
        },
        _count: {
          id: true,
        },
      }),
      this.prisma.extended.collection.groupBy({
        by: ['salesAgentId'],
        where: {
          type: 'COLLECTION',
          date: {
            gte: range.startDate,
            lte: range.endDate,
          },
          salesAgentId: { not: null },
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),
      this.prisma.extended.salesAgent.findMany({
        where: { isActive: true },
        select: { id: true, fullName: true },
      }),
    ]);

    const performanceData = salespersons.map((se) => {
      const sales = salesRaw.find((s: any) => s.salesAgentId === se.id);
      const collections = collectionsRaw.find((c: any) => c.salesAgentId === se.id);

      return {
        salespersonId: se.id,
        fullName: (se as any).fullName,
        totalSales: this.toNumber((sales as any)?._sum?.grandTotal),
        salesCount: sales?._count?.id ?? 0,
        totalCollections: this.toNumber((collections as any)?._sum?.amount),
        collectionsCount: collections?._count?.id ?? 0,
      };
    });

    return {
      range: {
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
        preset: range.preset,
      },
      performance: performanceData.sort((a, b) => b.totalSales - a.totalSales),
    };
  }
}
