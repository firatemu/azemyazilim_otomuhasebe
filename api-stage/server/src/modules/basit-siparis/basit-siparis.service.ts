import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateBasitSiparisDto } from './dto';
import { BasitSiparisDurum } from '@prisma/client';

@Injectable()
export class BasitSiparisService {
  constructor(
    private readonly prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) {}

  /**
   * Yeni sipariş oluştur
   * Durum otomatik olarak ONAY_BEKLIYOR olarak ayarlanır
   */
  async create(dto: CreateBasitSiparisDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({});
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const [firma, urun] = await Promise.all([
      this.prisma.cari.findFirst({
        where: { id: dto.firmaId, ...buildTenantWhereClause(tenantId) },
      }),
      this.prisma.stok.findFirst({
        where: { id: dto.urunId, ...buildTenantWhereClause(tenantId) },
      }),
    ]);

    if (!firma) {
      throw new NotFoundException('Firma bulunamadı');
    }

    if (!urun) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const siparis = await this.prisma.basitSiparis.create({
      data: {
        firmaId: dto.firmaId,
        urunId: dto.urunId,
        tenantId,
        miktar: dto.miktar,
        durum: BasitSiparisDurum.ONAY_BEKLIYOR,
        tedarikEdilenMiktar: 0,
      },
      include: {
        firma: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
          },
        },
        urun: {
          select: {
            id: true,
            stokKodu: true,
            stokAdi: true,
            birim: true,
            alisFiyati: true,
          },
        },
      },
    });

    return siparis;
  }

  async findAll(page = 1, limit = 50, durum?: BasitSiparisDurum) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;
    const where: any = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };
    if (durum) where.durum = durum;

    const [siparisler, total] = await Promise.all([
      this.prisma.basitSiparis.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          firma: {
            select: {
              id: true,
              cariKodu: true,
              unvan: true,
            },
          },
          urun: {
            select: {
              id: true,
              stokKodu: true,
              stokAdi: true,
              birim: true,
              alisFiyati: true,
            },
          },
        },
      }),
      this.prisma.basitSiparis.count({ where }),
    ]);

    return {
      data: siparisler,
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
    const siparis = await this.prisma.basitSiparis.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        firma: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            telefon: true,
            email: true,
          },
        },
        urun: {
          select: {
            id: true,
            stokKodu: true,
            stokAdi: true,
            birim: true,
            alisFiyati: true,
            kdvOrani: true,
          },
        },
      },
    });

    if (!siparis) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    return siparis;
  }
}
