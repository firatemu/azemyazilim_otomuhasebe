import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { HareketTipi, Prisma } from '@prisma/client';

@Injectable()
export class StokHareketService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) { }

  async findAll(
    page = 1,
    limit = 100,
    stokId?: string,
    hareketTipi?: HareketTipi,
  ) {
    const skip = (page - 1) * limit;
    const tenantId = await this.tenantResolver.resolveForQuery();

    const where: Prisma.StokHareketWhereInput = {};

    // Tenant filtresi (Stok üzerinden)
    if (tenantId) {
      where.stok = {
        tenantId: tenantId
      };
    }

    if (stokId) {
      where.stokId = stokId;
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
