import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, InvoiceStatus, InvoiceType, MovementType } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { GetCostingQueryDto } from './dto/get-costing-query.dto';

type TimelineEvent =
  | {
    type: 'increase';
    date: Date;
    quantity: number;
    unitCost: number;
  }
  | {
    type: 'decrease';
    date: Date;
    quantity: number;
  };

@Injectable()
export class CostingService {
  constructor(private readonly prisma: PrismaService) { }

  async getLatestCosts(query: GetCostingQueryDto) {
    const {
      search,
      brand,
      mainCategory,
      subCategory,
      limit: limitParam,
      page: pageParam,
    } = query;

    const parsedLimit =
      typeof limitParam === 'number' && !Number.isNaN(limitParam)
        ? limitParam
        : Number(limitParam);
    const parsedPage =
      typeof pageParam === 'number' && !Number.isNaN(pageParam)
        ? pageParam
        : Number(pageParam);

    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(Math.max(parsedLimit, 1), 500)
        : 100;
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const skip = (page - 1) * limit;

    const productWhere: Prisma.ProductWhereInput = {};

    if (search?.trim()) {
      const term = search.trim();
      productWhere.OR = [
        { code: { contains: term, mode: 'insensitive' } },
        { name: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (brand) {
      productWhere.brand = { equals: brand };
    }

    if (mainCategory) {
      productWhere.mainCategory = { equals: mainCategory };
    }

    if (subCategory) {
      productWhere.subCategory = { equals: subCategory };
    }

    const [total, stocks] = await this.prisma.extended.$transaction([
      this.prisma.extended.product.count({ where: productWhere }),
      this.prisma.extended.product.findMany({
        where: productWhere,
        select: {
          id: true,
          code: true,
          name: true,
          brand: true,
          mainCategory: true,
          subCategory: true,
        },
        orderBy: { code: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    if (stocks.length === 0) {
      return {
        data: [],
        total,
        page,
        limit,
      };
    }

    const productIds = stocks.map((stock) => stock.id);

    const histories = await this.prisma.extended.productCostHistory.findMany({
      where: {
        productId: { in: productIds },
      },
      orderBy: { computedAt: 'desc' },
    });

    const latestHistoryMap = new Map<string, (typeof histories)[number]>();
    for (const history of histories) {
      if (!latestHistoryMap.has((history as any).productId)) {
        latestHistoryMap.set((history as any).productId, history);
      }
    }

    const data = stocks.map((stock) => {
      const latest = latestHistoryMap.get(stock.id);
      return {
        productId: stock.id,
        code: (stock as any).code,
        name: (stock as any).name,
        brand: (stock as any).brand,
        mainCategory: (stock as any).mainCategory,
        subCategory: (stock as any).subCategory,
        cost: latest ? Number(latest.cost) : null,
        computedAt: latest?.computedAt?.toISOString() ?? null,
        note: latest?.note ?? null,
      };
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async calculateWeightedAverageCost(productId: string) {
    const product = await this.prisma.extended.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        code: true,
        name: true,
        brand: true,
        mainCategory: true,
        subCategory: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    // Tüm geçmiş hareketleri al (sadece ONAYLANDI değil, tüm statuslar)
    // Ancak silinmemiş faturaları al (deletedAt null olanlar)
    const purchaseLines = await this.prisma.extended.invoiceItem.findMany({
      where: {
        productId: productId,
        invoice: {
          invoiceType: InvoiceType.PURCHASE,
          status: InvoiceStatus.APPROVED,
          deletedAt: null, // Silinmemiş faturalar
        },
      },
      select: {
        quantity: true,
        unitPrice: true,
        amount: true,
        vatAmount: true, // KDV dahil hesaplama için
        invoice: {
          select: {
            date: true,
            invoiceNo: true,
          },
        },
      },
      orderBy: {
        invoice: {
          date: 'asc', // Tarih sırasına göre sırala
        },
      },
    });

    const salesLines = await this.prisma.extended.invoiceItem.findMany({
      where: {
        productId: productId,
        invoice: {
          invoiceType: { in: [InvoiceType.SALE, InvoiceType.PURCHASE_RETURN] as any },
          status: InvoiceStatus.APPROVED,
          deletedAt: null, // Silinmemiş faturalar
        },
      },
      select: {
        quantity: true,
        invoice: {
          select: {
            date: true,
            invoiceNo: true,
          },
        },
      },
      orderBy: {
        invoice: {
          date: 'asc', // Tarih sırasına göre sırala
        },
      },
    });

    const salesReturnLines = await this.prisma.extended.invoiceItem.findMany({
      where: {
        productId: productId,
        invoice: {
          invoiceType: InvoiceType.SALES_RETURN,
          status: InvoiceStatus.APPROVED,
          deletedAt: null, // Silinmemiş faturalar
        },
      },
      select: {
        quantity: true,
        unitPrice: true,
        amount: true,
        vatAmount: true, // KDV dahil hesaplama için
        invoice: {
          select: {
            date: true,
            invoiceNo: true,
          },
        },
      },
      orderBy: {
        invoice: {
          date: 'asc', // Tarih sırasına göre sırala
        },
      },
    });

    // Tüm geçmiş product hareketlerini al (onaylanmış tüm hareketler)
    // Stok hareketleri genellikle faturalardan otomatik oluşturulur,
    // ancak manuel girişler, sayımlar vb. de olabilir
    const stockMovements = await this.prisma.extended.productMovement.findMany({
      where: {
        productId: productId,
      },
      select: {
        movementType: true,
        quantity: true,
        unitPrice: true,
        createdAt: true,
        notes: true,
      },
      orderBy: {
        createdAt: 'asc', // Tarih sırasına göre sırala
      },
    });

    const timeline: TimelineEvent[] = [];

    for (const line of purchaseLines) {
      const qty = Number((line as any).quantity);
      if (!qty || qty <= 0) continue;
      const netAmount = Number((line as any).amount || 0);
      const vatAmount = Number((line as any).vatAmount || 0);
      const totalVatIncluded = netAmount + vatAmount; // Total amount including VAT
      const unitCost = qty ? totalVatIncluded / qty : 0;
      timeline.push({
        type: 'increase',
        date: (line as any).invoice.date,
        quantity: qty,
        unitCost,
      });
    }

    for (const line of salesLines) {
      const qty = Number((line as any).quantity);
      if (!qty || qty <= 0) continue;
      timeline.push({
        type: 'decrease',
        date: (line as any).invoice.date,
        quantity: qty,
      });
    }

    for (const line of salesReturnLines) {
      const qty = Number((line as any).quantity);
      if (!qty || qty <= 0) continue;
      const netAmount = Number((line as any).amount || 0);
      const vatAmount = Number((line as any).vatAmount || 0);
      const totalVatIncluded = netAmount + vatAmount; // Total amount including VAT
      const unitCost = qty ? totalVatIncluded / qty : 0;
      timeline.push({
        type: 'increase',
        date: (line as any).invoice.date,
        quantity: qty,
        unitCost,
      });
    }

    // Stok hareketlerini timeline'a ekle
    // Not: Stok hareketleri genellikle faturalardan otomatik oluşturulur
    // Bu yüzden sadece faturadan bağımsız hareketleri ekliyoruz
    // (notes'da "Invoice" kelimesi geçmeyenler veya manuel girişler)
    for (const movement of stockMovements) {
      const qty = Number((movement as any).quantity);
      if (!qty || qty <= 0) continue;

      // Eğer hareket bir faturadan kaynaklanıyorsa (notes'da "Invoice" geçiyorsa),
      // bu hareket zaten fatura itemsinde dahil edilmiştir, bu yüzden atlıyoruz
      const notes = (movement as any).notes?.toLowerCase() || '';
      if (notes.includes('invoice') || notes.includes('fatura:')) {
        continue; // Invoice kaynaklı hareketleri atla, zaten fatura itemsinde var
      }

      const unitCost = Number((movement as any).unitPrice) || 0;
      const date = movement.createdAt;

      // Hareket tipine göre increase veya decrease olarak ekle
      switch ((movement as any).movementType) {
        case MovementType.ENTRY:
        case MovementType.RETURN:
        case MovementType.COUNT_SURPLUS:
          // Stok artışı - birim fiyatı ile birlikte maliyete dahil et
          if (unitCost > 0) {
            timeline.push({
              type: 'increase',
              date,
              quantity: qty,
              unitCost,
            });
          }
          break;

        case MovementType.EXIT:
        case MovementType.SALE:
        case MovementType.COUNT_SHORTAGE:
          // Stok azalışı - maliyetten çıkar
          timeline.push({
            type: 'decrease',
            date,
            quantity: qty,
          });
          break;

        case MovementType.COUNT:
          // Sayım hareketleri genellikle quantity düzeltmesi için kullanılır
          // Birim fiyatı varsa artış, yoksa azalış olarak değerlendirilebilir
          // Ancak sayım hareketleri genellikle maliyet hesaplamasına dahil edilmez
          // Bu yüzden atlıyoruz veya birim fiyatı varsa artış olarak ekliyoruz
          if (unitCost > 0) {
            timeline.push({
              type: 'increase',
              date,
              quantity: qty,
              unitCost,
            });
          }
          break;
      }
    }

    if (timeline.length === 0) {
      await this.prisma.extended.productCostHistory.create({
        data: {
          productId: productId,
          cost: new Prisma.Decimal(0),
          note: 'No valid purchase movement found.',
          brand: (product as any).brand ?? undefined,
          mainCategory: (product as any).mainCategory ?? undefined,
          subCategory: (product as any).subCategory ?? undefined,
        },
      });

      return {
        productId: product.id,
        code: (product as any).code,
        name: (product as any).name,
        cost: 0,
        method: 'WEIGHTED_AVERAGE',
        message: 'No valid purchase movement found.',
      };
    }

    timeline.sort((a, b) => {
      const diff = a.date.getTime() - b.date.getTime();
      if (diff !== 0) return diff;
      if (a.type === b.type) return 0;
      return a.type === 'increase' ? -1 : 1;
    });

    let qtyOnHand = 0;
    let averageCost = 0;

    for (const event of timeline) {
      if (event.type === 'increase') {
        const qty = event.quantity;
        const unitCost = event.unitCost;
        if (qty <= 0 || !Number.isFinite(unitCost)) {
          continue;
        }

        if (qtyOnHand <= 0) {
          averageCost = unitCost;
          qtyOnHand = qty;
        } else {
          const totalCost = averageCost * qtyOnHand + unitCost * qty;
          qtyOnHand += qty;
          averageCost = totalCost / qtyOnHand;
        }
      } else {
        qtyOnHand -= event.quantity;
        if (qtyOnHand <= 0) {
          qtyOnHand = 0;
          averageCost = 0;
        }
      }
    }

    const roundedCost = averageCost > 0 ? Number(averageCost.toFixed(4)) : 0;

    try {
      await this.prisma.extended.productCostHistory.create({
        data: {
          productId: productId,
          cost: new Prisma.Decimal(roundedCost),
          brand: (product as any).brand ?? undefined,
          mainCategory: (product as any).mainCategory ?? undefined,
          subCategory: (product as any).subCategory ?? undefined,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // unique constraint violation if exists; continue
      } else {
        throw error;
      }
    }

    return {
      productId: product.id,
      code: (product as any).code,
      name: (product as any).name,
      cost: roundedCost,
      method: 'WEIGHTED_AVERAGE',
    };
  }

  /**
   * Toplu maliyet hesaplama (rate limit aşımını önlemek için tek istekte tüm products)
   */
  async calculateWeightedAverageCostBulk(productIds: string[]) {
    const results: Array<{
      productId: string;
      code: string;
      name: string;
      cost: number;
      status: 'success' | 'failed';
      message?: string;
    }> = [];

    for (const productId of productIds) {
      try {
        const result = await this.calculateWeightedAverageCost(productId);
        results.push({
          productId: result.productId,
          code: result.code,
          name: result.name,
          cost: result.cost,
          status: 'success',
        });
      } catch (error: any) {
        const product = await this.prisma.extended.product.findUnique({
          where: { id: productId },
          select: { code: true, name: true },
        });
        results.push({
          productId,
          code: (product as any)?.code ?? '-',
          name: (product as any)?.name ?? '-',
          cost: 0,
          status: 'failed',
          message: error?.message ?? 'Unexpected error',
        });
      }
    }

    return { results };
  }
}
