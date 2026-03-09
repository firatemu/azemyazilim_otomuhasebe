import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateSimpleOrderDto } from './dto';
import { SimpleOrderDurum } from './dto/create-simple-order.dto';

@Injectable()
export class SimpleOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) { }

  /**
   * Yeni sipariş oluştur
   * Durum otomatik olarak AWAITING_APPROVAL olarak ayarlanır
   */
  async create(dto: CreateSimpleOrderDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({});
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const [firma, urun] = await Promise.all([
      this.prisma.extended.account.findFirst({
        where: { id: dto.companyId, ...buildTenantWhereClause(tenantId) },
      }),
      this.prisma.extended.product.findFirst({
        where: { id: dto.productId, ...buildTenantWhereClause(tenantId) },
      }),
    ]);

    if (!firma) {
      throw new NotFoundException('Company not found');
    }

    if (!urun) {
      throw new NotFoundException('Product not found');
    }

    const order = await this.prisma.extended.simpleOrder.create({
      data: {
        companyId: dto.companyId,
        productId: dto.productId,
        tenantId,
        quantity: dto.quantity,
        status: SimpleOrderDurum.AWAITING_APPROVAL as any,
        suppliedQuantity: 0,
      },
      include: {
        company: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true,
            purchasePrice: true,
          },
        },
      },
    });

    return {
      ...order,
      // Backward-compatible aliases
      firma: (order as any).company
        ? {
            id: (order as any).company.id,
            code: (order as any).company.code,
            unvan: (order as any).company.title,
          }
        : null,
      urun: (order as any).product
        ? {
            id: (order as any).product.id,
            code: (order as any).product.code,
            name: (order as any).product.name,
            birim: (order as any).product.unit,
            alisFiyati: (order as any).product.purchasePrice,
          }
        : null,
    };
  }

  async findAll(page = 1, limit = 50, status?: SimpleOrderDurum) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;
    const where: any = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };
    if (status) where.status = status;

    const [salesOrders, total] = await Promise.all([
      this.prisma.extended.simpleOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              code: true,
              title: true,
            },
          },
          product: {
            select: {
              id: true,
              code: true,
              name: true,
              unit: true,
              purchasePrice: true,
            },
          },
        },
      }),
      this.prisma.extended.simpleOrder.count({ where }),
    ]);

    return {
      data: salesOrders.map((s: any) => ({
        ...s,
        firma: s.company
          ? { id: s.company.id, code: s.company.code, unvan: s.company.title }
          : null,
        urun: s.product
          ? {
              id: s.product.id,
              code: s.product.code,
              name: s.product.name,
              birim: s.product.unit,
              alisFiyati: s.product.purchasePrice,
            }
          : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const order = await this.prisma.extended.simpleOrder.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        company: {
          select: {
            id: true,
            code: true,
            title: true,
            phone: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true,
            purchasePrice: true,
            vatRate: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      ...order,
      firma: (order as any).company
        ? {
            id: (order as any).company.id,
            code: (order as any).company.code,
            unvan: (order as any).company.title,
            telefon: (order as any).company.phone,
            email: (order as any).company.email,
          }
        : null,
      urun: (order as any).product
        ? {
            id: (order as any).product.id,
            code: (order as any).product.code,
            name: (order as any).product.name,
            birim: (order as any).product.unit,
            alisFiyati: (order as any).product.purchasePrice,
            vatRate: (order as any).product.vatRate,
          }
        : null,
    };
  }
}
