import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { MovementType } from './product-movement.controller';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductMovementService {
  constructor(private prisma: PrismaService) { }

  async findAll(
    page = 1,
    limit = 100,
    productId?: string,
    movementType?: MovementType,
    tenantId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.ProductMovementWhereInput = {};

    if (productId) {
      where.productId = productId;
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (movementType) {
      where.movementType = movementType as any;
    }

    const [data, total] = await Promise.all([
      this.prisma.extended.productMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
              brand: true,
              unit: true,
            },
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          invoiceItem: {
            select: {
              id: true,
              unitPrice: true,
              discountRate: true,
              discountAmount: true,
              amount: true,
              invoice: {
                select: {
                  invoiceNo: true,
                  invoiceType: true,
                  status: true,
                  account: {
                    select: {
                      title: true,
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.extended.productMovement.count({ where }),
    ]);

    return {
      data: data.map((row: any) => ({
        ...row,
        product: row.product
          ? {
            id: row.product.id,
            code: row.product.code,
            name: row.product.name,
            brand: row.product.brand,
            unit: row.product.unit,
          }
          : null,
        invoiceItem: row.invoiceItem
          ? {
            id: row.invoiceItem.id,
            unitPrice: row.invoiceItem.unitPrice,
            discountRate: row.invoiceItem.discountRate,
            discountAmount: row.invoiceItem.discountAmount,
            amount: row.invoiceItem.amount,
            invoice: row.invoiceItem.invoice
              ? {
                invoiceNo: row.invoiceItem.invoice.invoiceNo,
                invoiceType: row.invoiceItem.invoice.invoiceType,
                status: row.invoiceItem.invoice.status,
                account: row.invoiceItem.invoice.account
                  ? {
                    title: row.invoiceItem.invoice.account.title,
                    code: row.invoiceItem.invoice.account.code,
                  }
                  : null,
              }
              : null,
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
}
