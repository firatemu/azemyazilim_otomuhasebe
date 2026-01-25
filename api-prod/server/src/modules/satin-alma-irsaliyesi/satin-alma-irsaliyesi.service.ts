import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CodeTemplateService } from '../code-template/code-template.service';
import { CreateSatınAlmaIrsaliyesiDto } from './dto/create-satin-alma-irsaliyesi.dto';
import { UpdateSatınAlmaIrsaliyesiDto } from './dto/update-satin-alma-irsaliyesi.dto';
import { FilterSatınAlmaIrsaliyesiDto } from './dto/filter-satin-alma-irsaliyesi.dto';
import { IrsaliyeKaynakTip, IrsaliyeDurum, Prisma, LogAction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SatınAlmaIrsaliyesiService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    private codeTemplateService: CodeTemplateService,
  ) {}

  private async createLog(
    irsaliyeId: string,
    actionType: LogAction,
    userId?: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    await prisma.satınAlmaIrsaliyesiLog.create({
      data: {
        irsaliyeId,
        userId,
        actionType,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(filterDto: FilterSatınAlmaIrsaliyesiDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const page = filterDto.page ? parseInt(filterDto.page, 10) : 1;
    const limit = filterDto.limit ? parseInt(filterDto.limit, 10) : 50;
    const skip = (page - 1) * limit;

    const where: Prisma.SatınAlmaIrsaliyesiWhereInput = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (filterDto.durum) {
      where.durum = filterDto.durum;
    }

    if (filterDto.cariId) {
      where.cariId = filterDto.cariId;
    }

    if (filterDto.search) {
      where.OR = [
        { irsaliyeNo: { contains: filterDto.search, mode: 'insensitive' } },
        { cari: { unvan: { contains: filterDto.search, mode: 'insensitive' } } },
        { cari: { cariKodu: { contains: filterDto.search, mode: 'insensitive' } } },
      ];
    }

    if (filterDto.baslangicTarihi && filterDto.bitisTarihi) {
      where.irsaliyeTarihi = {
        gte: new Date(filterDto.baslangicTarihi),
        lte: new Date(filterDto.bitisTarihi),
      };
    } else if (filterDto.baslangicTarihi) {
      where.irsaliyeTarihi = {
        gte: new Date(filterDto.baslangicTarihi),
      };
    } else if (filterDto.bitisTarihi) {
      where.irsaliyeTarihi = {
        lte: new Date(filterDto.bitisTarihi),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.satınAlmaIrsaliyesi.findMany({
        where,
        skip,
        take: limit,
        include: {
          cari: {
            select: {
              id: true,
              cariKodu: true,
              unvan: true,
              tip: true,
            },
          },
          depo: {
            select: {
              id: true,
              name: true,
            },
          },
          kaynakSiparis: {
            select: {
              id: true,
              siparisNo: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
          _count: {
            select: {
              kalemler: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.satınAlmaIrsaliyesi.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const irsaliye = await this.prisma.satınAlmaIrsaliyesi.findUnique({
      where: { id },
      include: {
        cari: true,
        depo: true,
        kaynakSiparis: {
          include: {
            cari: {
              select: {
                id: true,
                cariKodu: true,
                unvan: true,
              },
            },
          },
        },
        kalemler: {
          include: {
            stok: true,
          },
        },
        faturalar: {
          select: {
            id: true,
            faturaNo: true,
            tarih: true,
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
      },
    });

    if (!irsaliye) {
      throw new NotFoundException(`İrsaliye bulunamadı: ${id}`);
    }

    return irsaliye;
  }

  async create(
    createDto: CreateSatınAlmaIrsaliyesiDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { kalemler, ...irsaliyeData } = createDto;

    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    const validKalemler = kalemler.filter(k => k.stokId && k.stokId.trim() !== '');
    if (validKalemler.length === 0) {
      throw new BadRequestException('En az bir kalem eklemelisiniz');
    }

    const existingIrsaliye = await this.prisma.satınAlmaIrsaliyesi.findFirst({
      where: {
        irsaliyeNo: irsaliyeData.irsaliyeNo,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (existingIrsaliye) {
      throw new BadRequestException(
        `Bu irsaliye numarası zaten mevcut: ${irsaliyeData.irsaliyeNo}`,
      );
    }

    // Cari kontrolü
    const cari = await this.prisma.cari.findUnique({
      where: { id: irsaliyeData.cariId },
    });

    if (!cari) {
      throw new NotFoundException(`Cari bulunamadı: ${irsaliyeData.cariId}`);
    }

    // Sipariş kontrolü (eğer kaynakTip: SIPARIS ise)
    if (irsaliyeData.kaynakTip === IrsaliyeKaynakTip.SIPARIS && irsaliyeData.kaynakId) {
      const siparis = await this.prisma.satınAlmaSiparisi.findUnique({
        where: { id: irsaliyeData.kaynakId },
      });

      if (!siparis) {
        throw new NotFoundException(`Sipariş bulunamadı: ${irsaliyeData.kaynakId}`);
      }
    }

    // Kalem tutarlarını hesapla
    let toplamTutar = 0;
    let kdvTutar = 0;

    const kalemlerWithCalculations = validKalemler.map((kalem) => {
      const tutar = kalem.miktar * kalem.birimFiyat;
      const kalemKdv = (tutar * kalem.kdvOrani) / 100;

      toplamTutar += tutar;
      kdvTutar += kalemKdv;

      return {
        stokId: kalem.stokId,
        miktar: kalem.miktar,
        birimFiyat: kalem.birimFiyat,
        kdvOrani: kalem.kdvOrani,
        tutar,
        kdvTutar: kalemKdv,
      };
    });

    const iskonto = irsaliyeData.iskonto || 0;
    toplamTutar -= iskonto;
    const genelToplam = toplamTutar + kdvTutar;

    // Transaction ile irsaliye ve kalemleri oluştur
    return this.prisma.$transaction(async (prisma) => {
      const irsaliye = await prisma.satınAlmaIrsaliyesi.create({
        data: {
          ...irsaliyeData,
          ...(tenantId != null && { tenantId }),
          toplamTutar: new Decimal(toplamTutar),
          kdvTutar: new Decimal(kdvTutar),
          genelToplam: new Decimal(genelToplam),
          iskonto: new Decimal(iskonto),
          durum: irsaliyeData.durum || IrsaliyeDurum.FATURALANMADI,
          createdBy: userId,
          kalemler: {
            create: kalemlerWithCalculations.map(k => ({
              ...k,
              birimFiyat: new Decimal(k.birimFiyat),
              tutar: new Decimal(k.tutar),
              kdvTutar: new Decimal(k.kdvTutar),
            })),
          },
        },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Stok hareketi oluştur (irsaliye oluşturulduğunda stok eklenir)
      for (const kalem of kalemlerWithCalculations) {
        await prisma.stokHareket.create({
          data: {
            stokId: kalem.stokId,
            hareketTipi: 'GIRIS',
            miktar: kalem.miktar,
            birimFiyat: kalem.birimFiyat,
            aciklama: `Satın Alma İrsaliyesi: ${irsaliyeData.irsaliyeNo}`,
          },
        });
      }

      // Sipariş'e deliveryNoteId bağla (eğer kaynakTip: SIPARIS ise)
      if (irsaliyeData.kaynakTip === IrsaliyeKaynakTip.SIPARIS && irsaliyeData.kaynakId) {
        await prisma.satınAlmaSiparisi.update({
          where: { id: irsaliyeData.kaynakId },
          data: {
            deliveryNoteId: irsaliye.id,
          },
        });
      }

      // Audit log oluştur
      await this.createLog(
        irsaliye.id,
        'CREATE',
        userId,
        { irsaliye: irsaliyeData, kalemler },
        ipAddress,
        userAgent,
        prisma,
      );

      return irsaliye;
    });
  }

  async update(
    id: string,
    updateDto: UpdateSatınAlmaIrsaliyesiDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const existingIrsaliye = await this.prisma.satınAlmaIrsaliyesi.findUnique({
      where: { id },
      include: {
        kalemler: true,
        faturalar: true,
      },
    });

    if (!existingIrsaliye) {
      throw new NotFoundException(`İrsaliye bulunamadı: ${id}`);
    }

    // FATURALANDI durumundaki irsaliye güncellenemez
    if (existingIrsaliye.durum === IrsaliyeDurum.FATURALANDI) {
      throw new BadRequestException('Faturalandırılmış irsaliye güncellenemez');
    }

    // Faturaya bağlı irsaliye güncellenemez
    if (existingIrsaliye.faturalar && existingIrsaliye.faturalar.length > 0) {
      throw new BadRequestException('Faturaya bağlı irsaliye güncellenemez');
    }

    const { kalemler, ...irsaliyeData } = updateDto;

    // Transaction ile güncelle
    return this.prisma.$transaction(async (prisma) => {
      // Eğer kalemler güncelleniyorsa
      if (kalemler && kalemler.length > 0) {
        // Mevcut kalemleri sil
        await prisma.satınAlmaIrsaliyesiKalemi.deleteMany({
          where: { irsaliyeId: id },
        });

        // Yeni kalemleri ekle ve tutarları hesapla
        let toplamTutar = 0;
        let kdvTutar = 0;

        const validKalemler = kalemler.filter(k => k.stokId && k.stokId.trim() !== '');

        if (validKalemler.length === 0) {
          throw new BadRequestException('En az bir kalem eklemelisiniz');
        }

        const kalemlerWithCalculations = validKalemler.map((kalem) => {
          const tutar = kalem.miktar * kalem.birimFiyat;
          const kalemKdv = (tutar * kalem.kdvOrani) / 100;

          toplamTutar += tutar;
          kdvTutar += kalemKdv;

          return {
            stokId: kalem.stokId,
            miktar: kalem.miktar,
            birimFiyat: kalem.birimFiyat,
            kdvOrani: kalem.kdvOrani,
            tutar,
            kdvTutar: kalemKdv,
          };
        });

        const iskonto = irsaliyeData.iskonto ?? existingIrsaliye.iskonto.toNumber();
        toplamTutar -= iskonto;
        const genelToplam = toplamTutar + kdvTutar;

        await prisma.satınAlmaIrsaliyesiKalemi.createMany({
          data: kalemlerWithCalculations.map(k => ({
            ...k,
            irsaliyeId: id,
            birimFiyat: new Decimal(k.birimFiyat),
            tutar: new Decimal(k.tutar),
            kdvTutar: new Decimal(k.kdvTutar),
          })),
        });

        // İrsaliye tutarlarını güncelle
        await prisma.satınAlmaIrsaliyesi.update({
          where: { id },
          data: {
            ...irsaliyeData,
            toplamTutar: new Decimal(toplamTutar),
            kdvTutar: new Decimal(kdvTutar),
            genelToplam: new Decimal(genelToplam),
            iskonto: new Decimal(iskonto),
            updatedBy: userId,
          },
        });
      } else {
        // Sadece irsaliye bilgileri güncelleniyor
        const iskonto = irsaliyeData.iskonto ?? existingIrsaliye.iskonto.toNumber();
        const toplamTutar = existingIrsaliye.toplamTutar.toNumber() - iskonto + existingIrsaliye.iskonto.toNumber();
        const genelToplam = toplamTutar + existingIrsaliye.kdvTutar.toNumber();

        await prisma.satınAlmaIrsaliyesi.update({
          where: { id },
          data: {
            ...irsaliyeData,
            toplamTutar: new Decimal(toplamTutar),
            kdvTutar: existingIrsaliye.kdvTutar,
            genelToplam: new Decimal(genelToplam),
            iskonto: new Decimal(iskonto),
            updatedBy: userId,
          },
        });
      }

      const updatedIrsaliye = await prisma.satınAlmaIrsaliyesi.findUnique({
        where: { id },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Audit log oluştur
      await this.createLog(
        id,
        'UPDATE',
        userId,
        { updateDto, oldData: existingIrsaliye },
        ipAddress,
        userAgent,
        prisma,
      );

      return updatedIrsaliye;
    });
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const irsaliye = await this.prisma.satınAlmaIrsaliyesi.findUnique({
      where: { id },
      include: {
        faturalar: true,
      },
    });

    if (!irsaliye) {
      throw new NotFoundException(`İrsaliye bulunamadı: ${id}`);
    }

    // FATURALANDI durumundaki irsaliye silinemez
    if (irsaliye.durum === IrsaliyeDurum.FATURALANDI) {
      throw new BadRequestException('Faturalandırılmış irsaliye silinemez');
    }

    // Faturaya bağlı irsaliye silinemez
    if (irsaliye.faturalar && irsaliye.faturalar.length > 0) {
      throw new BadRequestException('Faturaya bağlı irsaliye silinemez');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Soft delete
      await prisma.satınAlmaIrsaliyesi.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      // Sipariş'ten deliveryNoteId'yi kaldır
      if (irsaliye.kaynakTip === IrsaliyeKaynakTip.SIPARIS && irsaliye.kaynakId) {
        await prisma.satınAlmaSiparisi.update({
          where: { id: irsaliye.kaynakId },
          data: {
            deliveryNoteId: null,
          },
        });
      }

      // Audit log oluştur
      await this.createLog(
        id,
        'DELETE',
        userId,
        { irsaliye },
        ipAddress,
        userAgent,
        prisma,
      );
    });
  }
}
