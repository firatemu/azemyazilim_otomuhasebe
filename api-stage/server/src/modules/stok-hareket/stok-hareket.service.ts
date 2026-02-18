import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { HareketTipi, Prisma } from '@prisma/client';

@Injectable()
export class StokHareketService {
  constructor(private prisma: PrismaService) { }

  async findAll(
    page = 1,
    limit = 100,
    stokId?: string,
    hareketTipi?: HareketTipi,
    tenantId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.StokHareketWhereInput = {};

    if (stokId) {
      where.stokId = stokId;
    }

    // Tenant filtresi (Stok üzerinden)
    if (tenantId) {
      where.stok = {
        tenantId: tenantId
      };
    }

    if (hareketTipi) {
      where.hareketTipi = hareketTipi;
    }

    const [data, total] = await Promise.all([
      this.prisma.stokHareket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          stok: {
            select: {
              id: true,
              stokKodu: true,
              stokAdi: true,
              marka: true,
              birim: true,
            },
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      this.prisma.stokHareket.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
