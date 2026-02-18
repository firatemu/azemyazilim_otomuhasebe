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
  cariKodu: string;
  unvan: string;
}

interface StokSummary {
  id: string;
  stokKodu: string;
  stokAdi: string;
  birim: string;
}

@Injectable()
export class RaporlamaService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(query: OverviewQueryDto) {
    const range = this.resolveRange(query);

    const now = new Date();

    const faturaWhereBase: Prisma.FaturaWhereInput = {
      deletedAt: null,
      tarih: {
        gte: range.startDate,
        lte: range.endDate,
      },
    };

    const approvedSalesWhereBase: Prisma.FaturaWhereInput = {
      ...faturaWhereBase,
      durum: 'ONAYLANDI',
    };

    const approvedPurchaseWhereBase: Prisma.FaturaWhereInput = {
      ...faturaWhereBase,
      durum: 'ONAYLANDI',
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
      this.prisma.fatura.aggregate({
        where: { ...approvedSalesWhereBase, faturaTipi: 'SATIS' },
        _sum: { genelToplam: true },
        _count: { id: true },
      }),
      this.prisma.fatura.aggregate({
        where: { ...approvedSalesWhereBase, faturaTipi: 'SATIS_IADE' },
        _sum: { genelToplam: true },
        _count: { id: true },
      }),
      this.prisma.fatura.aggregate({
        where: { ...approvedPurchaseWhereBase, faturaTipi: 'ALIS' },
        _sum: { genelToplam: true },
        _count: { id: true },
      }),
      this.prisma.fatura.aggregate({
        where: { ...approvedPurchaseWhereBase, faturaTipi: 'ALIS_IADE' },
        _sum: { genelToplam: true },
        _count: { id: true },
      }),
      this.prisma.tahsilat.aggregate({
        where: {
          tip: 'TAHSILAT',
          tarih: {
            gte: range.startDate,
            lte: range.endDate,
          },
        },
        _sum: { tutar: true },
        _count: { id: true },
      }),
      this.prisma.tahsilat.aggregate({
        where: {
          tip: 'ODEME',
          tarih: {
            gte: range.startDate,
            lte: range.endDate,
          },
        },
        _sum: { tutar: true },
        _count: { id: true },
      }),
      this.prisma.masraf.aggregate({
        where: {
          tarih: {
            gte: range.startDate,
            lte: range.endDate,
          },
        },
        _sum: { tutar: true },
        _count: { id: true },
      }),
      this.prisma.fatura.findMany({
        where: {
          ...approvedSalesWhereBase,
          faturaTipi: { in: ['SATIS', 'SATIS_IADE'] },
          odenecekTutar: { gt: 0 },
        },
        select: {
          id: true,
          faturaTipi: true,
          odenecekTutar: true,
          vade: true,
          cariId: true,
        },
      }),
      this.prisma.fatura.findMany({
        where: {
          ...approvedPurchaseWhereBase,
          faturaTipi: { in: ['ALIS', 'ALIS_IADE'] },
          odenecekTutar: { gt: 0 },
        },
        select: {
          id: true,
          faturaTipi: true,
          odenecekTutar: true,
          vade: true,
          cariId: true,
        },
      }),
      this.prisma.fatura.groupBy({
        by: ['cariId'],
        where: {
          ...approvedSalesWhereBase,
          faturaTipi: 'SATIS',
        },
        _sum: { genelToplam: true },
        _count: { _all: true },
        orderBy: {
          _sum: {
            genelToplam: 'desc',
          },
        },
        take: 5,
      }),
      this.prisma.faturaKalemi.groupBy({
        by: ['stokId'],
        where: {
          fatura: {
            ...approvedSalesWhereBase,
            faturaTipi: 'SATIS',
          },
        },
        _sum: {
          tutar: true,
          miktar: true,
        },
        _count: { _all: true },
        orderBy: {
          _sum: {
            tutar: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    const totalSales =
      this.toNumber(satisSum._sum.genelToplam) -
      this.toNumber(satisIadeSum._sum.genelToplam);
    const totalPurchases =
      this.toNumber(alisSum._sum.genelToplam) -
      this.toNumber(alisIadeSum._sum.genelToplam);
    const collections = this.toNumber(collectionsSum._sum.tutar);
    const payments = this.toNumber(paymentsSum._sum.tutar);
    const expenses = this.toNumber(expenseSum._sum.tutar);
    const grossProfit = totalSales - totalPurchases;
    const netCashFlow = collections - payments;

    const receivablesTotal = receivableInvoices.reduce(
      (sum, fatura) => sum + this.toNumber(fatura.odenecekTutar),
      0,
    );
    const receivablesOverdue = receivableInvoices
      .filter((fatura) => fatura.vade && fatura.vade < now)
      .reduce((sum, fatura) => sum + this.toNumber(fatura.odenecekTutar), 0);

    const payablesTotal = payableInvoices.reduce(
      (sum, fatura) => sum + this.toNumber(fatura.odenecekTutar),
      0,
    );
    const payablesOverdue = payableInvoices
      .filter((fatura) => fatura.vade && fatura.vade < now)
      .reduce((sum, fatura) => sum + this.toNumber(fatura.odenecekTutar), 0);

    const cariIds = topCustomersRaw.map((item) => item.cariId);
    const [cariler, stoklar] = await Promise.all([
      cariIds.length
        ? this.prisma.cari.findMany({
            where: { id: { in: cariIds } },
            select: { id: true, cariKodu: true, unvan: true },
          })
        : Promise.resolve<CariSummary[]>([]),
      topProductsRaw.length
        ? this.prisma.stok.findMany({
            where: { id: { in: topProductsRaw.map((item) => item.stokId) } },
            select: { id: true, stokKodu: true, stokAdi: true, birim: true },
          })
        : Promise.resolve<StokSummary[]>([]),
    ]);

    const cariMap = new Map<string, CariSummary>(
      cariler.map<[string, CariSummary]>((cari) => [cari.id, cari]),
    );
    const stokMap = new Map<string, StokSummary>(
      stoklar.map<[string, StokSummary]>((stok) => [stok.id, stok]),
    );

    const topCustomers = topCustomersRaw.map((item) => {
      const cari = cariMap.get(item.cariId);
      return {
        cariId: item.cariId,
        cariKodu: cari?.cariKodu ?? 'Bilinmiyor',
        unvan: cari?.unvan ?? 'Bilinmeyen Cari',
        toplamTutar: this.toNumber(item._sum?.genelToplam),
        faturaAdedi: item._count?._all ?? 0,
      };
    });

    const topProducts = topProductsRaw.map((item) => {
      const stok = stokMap.get(item.stokId);
      return {
        stokId: item.stokId,
        stokKodu: stok?.stokKodu ?? 'Bilinmiyor',
        stokAdi: stok?.stokAdi ?? 'Bilinmeyen Ürün',
        birim: stok?.birim ?? '-',
        toplamTutar: this.toNumber(item._sum?.tutar),
        toplamMiktar: item._sum?.miktar ?? 0,
        satilanKalemSayisi: item._count?._all ?? 0,
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
        totalSalesReturns: this.toNumber(satisIadeSum._sum.genelToplam),
        totalPurchases,
        totalPurchaseCount: alisSum._count.id ?? 0,
        totalPurchaseReturns: this.toNumber(alisIadeSum._sum.genelToplam),
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
    const candidates = await this.prisma.stok.findMany({
      where: {
        kritikStokMiktari: { gt: 0 },
      },
      select: {
        id: true,
        stokKodu: true,
        stokAdi: true,
        birim: true,
        kritikStokMiktari: true,
      },
      take: 25,
      orderBy: {
        kritikStokMiktari: 'desc',
      },
    });

    const itemsWithStock = await Promise.all(
      candidates.map(async (stok) => {
        const hareketler = await this.prisma.stokHareket.groupBy({
          by: ['hareketTipi'],
          where: { stokId: stok.id },
          _sum: { miktar: true },
        });

        const netMiktar = hareketler.reduce((total, hareket) => {
          const miktar = hareket._sum.miktar ?? 0;
          switch (hareket.hareketTipi) {
            case 'GIRIS':
            case 'SAYIM_FAZLA':
            case 'IADE':
              return total + miktar;
            case 'CIKIS':
            case 'SATIS':
            case 'SAYIM_EKSIK':
              return total - miktar;
            default:
              return total;
          }
        }, 0);

        const kritik = Number(stok.kritikStokMiktari);

        return {
          stokId: stok.id,
          stokKodu: stok.stokKodu,
          stokAdi: stok.stokAdi,
          birim: stok.birim,
          miktar: netMiktar,
          kritikStokMiktari: kritik,
          acik: kritik - netMiktar,
        };
      }),
    );

    return itemsWithStock
      .filter((item) => item.miktar <= item.kritikStokMiktari)
      .sort((a, b) => b.acik - a.acik)
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
            'Özel tarih aralığı için başlangıç ve bitiş tarihi gereklidir.',
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
}
