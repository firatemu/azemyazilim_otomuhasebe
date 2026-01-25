import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateTeklifDto } from './dto/create-teklif.dto';
import { UpdateTeklifDto } from './dto/update-teklif.dto';
import { TeklifTipi, TeklifDurum, Prisma, LogAction } from '@prisma/client';

@Injectable()
export class TeklifService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) {}

  private async createLog(
    teklifId: string,
    actionType: LogAction,
    userId?: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    await prisma.teklifLog.create({
      data: {
        teklifId,
        userId,
        actionType,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  private async generateUniqueSiparisNo(
    prisma: Prisma.TransactionClient,
    prefix: string,
    year: number,
  ): Promise<string> {
    let currentNumber = 0;

    const lastSiparis = await prisma.siparis.findFirst({
      where: {
        siparisNo: {
          startsWith: `${prefix}-${year}-`,
        },
      },
      orderBy: {
        siparisNo: 'desc',
      },
      select: {
        siparisNo: true,
      },
    });

    if (lastSiparis) {
      const parsed = parseInt(lastSiparis.siparisNo.split('-')[2], 10);
      currentNumber = Number.isNaN(parsed) ? 0 : parsed;
    }

    for (let attempt = 0; attempt < 1000; attempt += 1) {
      currentNumber += 1;
      const candidate = `${prefix}-${year}-${currentNumber.toString().padStart(3, '0')}`;

      // TODO: TenantContextService inject et ve tenantId kontrolü yap
      const exists = await prisma.siparis.findFirst({
        where: { siparisNo: candidate },
        select: { id: true },
      });

      if (!exists) {
        return candidate;
      }
    }

    throw new BadRequestException(
      'Yeni sipariş numarası oluşturulamadı. Lütfen daha sonra tekrar deneyin.',
    );
  }

  async findAll(
    page = 1,
    limit = 50,
    teklifTipi?: TeklifTipi,
    search?: string,
    cariId?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;

    const where: Prisma.TeklifWhereInput = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (teklifTipi) {
      where.teklifTipi = teklifTipi;
    }

    if (cariId) {
      where.cariId = cariId;
    }

    if (search) {
      where.OR = [
        { teklifNo: { contains: search, mode: 'insensitive' } },
        { cari: { unvan: { contains: search, mode: 'insensitive' } } },
        { cari: { cariKodu: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.teklif.findMany({
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
          _count: {
            select: {
              kalemler: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.teklif.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const teklif = await this.prisma.teklif.findUnique({
      where: { id },
      include: {
        cari: true,
        kalemler: {
          include: {
            stok: true,
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
        deletedByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        logs: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!teklif) {
      throw new NotFoundException(`Teklif bulunamadı: ${id}`);
    }

    return teklif;
  }

  async create(
    createTeklifDto: CreateTeklifDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { kalemler, ...teklifData } = createTeklifDto;

    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    const existingTeklif = await this.prisma.teklif.findFirst({
      where: {
        teklifNo: teklifData.teklifNo,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (existingTeklif) {
      throw new BadRequestException(
        `Bu teklif numarası zaten mevcut: ${teklifData.teklifNo}`,
      );
    }

    // Cari kontrolü
    const cari = await this.prisma.cari.findUnique({
      where: { id: teklifData.cariId },
    });

    if (!cari) {
      throw new NotFoundException(`Cari bulunamadı: ${teklifData.cariId}`);
    }

    // Kalem tutarlarını hesapla
    let araToplam = 0;
    let toplamKalemIskontosu = 0;
    let kdvTutar = 0;

    const kalemlerWithCalculations = kalemler.map((kalem) => {
      const birimFiyat = kalem.birimFiyat;
      const kalemAraToplam = kalem.miktar * birimFiyat;
      const kalemIskontoTutar = kalem.iskontoTutar || 0;
      const netTutar = kalemAraToplam - kalemIskontoTutar;
      const kalemKdv = (netTutar * kalem.kdvOrani) / 100;

      araToplam += kalemAraToplam;
      toplamKalemIskontosu += kalemIskontoTutar;
      kdvTutar += kalemKdv;

      return {
        stokId: kalem.stokId,
        miktar: kalem.miktar,
        birimFiyat,
        kdvOrani: kalem.kdvOrani,
        tutar: netTutar,
        kdvTutar: kalemKdv,
        iskontoOran: kalem.iskontoOran || null,
        iskontoTutar: kalem.iskontoTutar || null,
      };
    });

    const genelIskonto = teklifData.iskonto || 0;
    const toplamIskonto = toplamKalemIskontosu + genelIskonto;
    const toplamTutar = araToplam - toplamIskonto;
    const genelToplam = toplamTutar + kdvTutar;

    // Transaction ile teklif ve kalemleri oluştur
    return this.prisma.$transaction(async (prisma) => {
      const teklif = await prisma.teklif.create({
        data: {
          ...teklifData,
          ...(tenantId != null && { tenantId }),
          gecerlilikTarihi: teklifData.gecerlilikTarihi
            ? new Date(teklifData.gecerlilikTarihi)
            : null,
          toplamTutar,
          kdvTutar,
          genelToplam,
          createdBy: userId,
          kalemler: {
            create: kalemlerWithCalculations,
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

      // Audit log oluştur
      await this.createLog(
        teklif.id,
        'CREATE',
        userId,
        { teklif: teklifData, kalemler },
        ipAddress,
        userAgent,
        prisma,
      );

      return teklif;
    });
  }

  async update(
    id: string,
    updateTeklifDto: UpdateTeklifDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const teklif = await this.findOne(id);

    if (teklif.durum === 'SIPARISE_DONUSTU') {
      throw new BadRequestException(
        'Siparişe dönüştürülmüş teklif güncellenemez',
      );
    }

    if (teklif.deletedAt) {
      throw new BadRequestException('Silinmiş teklif güncellenemez');
    }

    const { kalemler, ...teklifData } = updateTeklifDto;

    // Eğer kalemler güncellenmiyorsa sadece teklif bilgilerini güncelle
    if (!kalemler) {
      const updated = await this.prisma.teklif.update({
        where: { id },
        data: {
          ...teklifData,
          gecerlilikTarihi: teklifData.gecerlilikTarihi
            ? new Date(teklifData.gecerlilikTarihi)
            : null,
          updatedBy: userId,
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

      await this.createLog(
        id,
        'UPDATE',
        userId,
        { changes: updateTeklifDto },
        ipAddress,
        userAgent,
      );

      return updated;
    }

    // Kalemler güncelleniyorsa transaction içinde işle
    return this.prisma.$transaction(async (prisma) => {
      // Mevcut kalemleri sil
      await prisma.teklifKalemi.deleteMany({
        where: { teklifId: id },
      });

      // Kalem tutarlarını hesapla
      let araToplam = 0;
      let toplamKalemIskontosu = 0;
      let kdvTutar = 0;

      const kalemlerWithCalculations = kalemler.map((kalem) => {
        const birimFiyat = kalem.birimFiyat;
        const kalemAraToplam = kalem.miktar * birimFiyat;
        const kalemIskontoTutar = kalem.iskontoTutar || 0;
        const netTutar = kalemAraToplam - kalemIskontoTutar;
        const kalemKdv = (netTutar * kalem.kdvOrani) / 100;

        araToplam += kalemAraToplam;
        toplamKalemIskontosu += kalemIskontoTutar;
        kdvTutar += kalemKdv;

        return {
          stokId: kalem.stokId,
          miktar: kalem.miktar,
          birimFiyat,
          kdvOrani: kalem.kdvOrani,
          tutar: netTutar,
          kdvTutar: kalemKdv,
          iskontoOran: kalem.iskontoOran || null,
          iskontoTutar: kalem.iskontoTutar || null,
        };
      });

      const genelIskonto = teklifData.iskonto || 0;
      const toplamIskonto = toplamKalemIskontosu + genelIskonto;
      const toplamTutar = araToplam - toplamIskonto;
      const genelToplam = toplamTutar + kdvTutar;

      const updated = await prisma.teklif.update({
        where: { id },
        data: {
          ...teklifData,
          gecerlilikTarihi: teklifData.gecerlilikTarihi
            ? new Date(teklifData.gecerlilikTarihi)
            : null,
          toplamTutar,
          kdvTutar,
          genelToplam,
          updatedBy: userId,
          kalemler: {
            create: kalemlerWithCalculations,
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

      await this.createLog(
        id,
        'UPDATE',
        userId,
        { changes: updateTeklifDto },
        ipAddress,
        userAgent,
        prisma,
      );

      return updated;
    });
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const teklif = await this.findOne(id);

    if (teklif.durum === 'SIPARISE_DONUSTU') {
      throw new BadRequestException('Siparişe dönüştürülmüş teklif silinemez');
    }

    await this.prisma.teklif.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    await this.createLog(id, 'DELETE', userId, null, ipAddress, userAgent);

    return { message: 'Teklif silindi' };
  }

  async changeDurum(
    id: string,
    durum: TeklifDurum,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const teklif = await this.findOne(id);

    if (teklif.durum === 'SIPARISE_DONUSTU') {
      throw new BadRequestException(
        'Siparişe dönüştürülmüş teklifin durumu değiştirilemez',
      );
    }

    const updated = await this.prisma.teklif.update({
      where: { id },
      data: {
        durum,
        updatedBy: userId,
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

    await this.createLog(
      id,
      'DURUM_DEGISIKLIK',
      userId,
      { oldDurum: teklif.durum, newDurum: durum },
      ipAddress,
      userAgent,
    );

    return updated;
  }

  async sipariseDonustur(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const teklif = await this.findOne(id);

    if (teklif.durum === 'SIPARISE_DONUSTU') {
      throw new BadRequestException('Bu teklif zaten siparişe dönüştürülmüş');
    }

    if (teklif.deletedAt) {
      throw new BadRequestException('Silinmiş teklif siparişe dönüştürülemez');
    }

    // Sipariş numarası oluştur
    const siparisTipi = teklif.teklifTipi === 'SATIS' ? 'SATIS' : 'SATIN_ALMA';
    const prefix = siparisTipi === 'SATIS' ? 'SS' : 'SA';
    const year = new Date().getFullYear();

    return this.prisma.$transaction(async (prisma) => {
      const siparisNo = await this.generateUniqueSiparisNo(
        prisma,
        prefix,
        year,
      );

      // Sipariş oluştur
      const siparis = await prisma.siparis.create({
        data: {
          siparisNo,
          siparisTipi: siparisTipi as any,
          cariId: teklif.cariId,
          tarih: new Date(),
          vade: teklif.gecerlilikTarihi,
          iskonto: teklif.iskonto,
          toplamTutar: teklif.toplamTutar,
          kdvTutar: teklif.kdvTutar,
          genelToplam: teklif.genelToplam,
          aciklama:
            teklif.aciklama ||
            `Teklif ${teklif.teklifNo} numaralı tekliften oluşturuldu`,
          durum: 'BEKLEMEDE' as any,
          createdBy: userId,
          kalemler: {
            create: teklif.kalemler.map((kalem) => ({
              stokId: kalem.stokId,
              miktar: kalem.miktar,
              birimFiyat: kalem.birimFiyat,
              kdvOrani: kalem.kdvOrani,
              tutar: kalem.tutar,
              kdvTutar: kalem.kdvTutar,
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

      // Teklif durumunu güncelle
      await prisma.teklif.update({
        where: { id },
        data: {
          durum: 'SIPARISE_DONUSTU',
          siparisId: siparis.id,
          updatedBy: userId,
        },
      });

      // Log oluştur
      await this.createLog(
        id,
        LogAction.SIPARISE_DONUSTU,
        userId,
        { siparisId: siparis.id, siparisNo },
        ipAddress,
        userAgent,
        prisma,
      );

      return {
        message: 'Teklif başarıyla siparişe dönüştürüldü',
        siparisId: siparis.id,
        siparisNo: siparis.siparisNo,
        siparis,
      };
    });
  }
}
