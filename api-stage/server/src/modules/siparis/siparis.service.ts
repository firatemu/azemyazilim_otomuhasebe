import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { IrsaliyeDurum, IrsaliyeKaynakTip, Prisma, SiparisDurum, SiparisTipi } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CodeTemplateService } from '../code-template/code-template.service';
import { SatisIrsaliyesiService } from '../satis-irsaliyesi/satis-irsaliyesi.service';
import { CreateSiparisDto } from './dto/create-siparis.dto';
import { UpdateSiparisDto } from './dto/update-siparis.dto';

@Injectable()
export class SiparisService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => SatisIrsaliyesiService))
    private satisIrsaliyesiService: SatisIrsaliyesiService,
    private codeTemplateService: CodeTemplateService,
  ) { }

  private async createLog(
    siparisId: string,
    actionType: string,
    userId?: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    await prisma.siparisLog.create({
      data: {
        siparisId,
        userId,
        actionType: actionType as any,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(
    page = 1,
    limit = 50,
    siparisTipi?: SiparisTipi,
    search?: string,
    cariId?: string,
    durum?: SiparisDurum,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;

    const where: Prisma.SiparisWhereInput = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (siparisTipi) {
      where.siparisTipi = siparisTipi;
    }

    if (cariId) {
      where.cariId = cariId;
    }

    if (durum) {
      where.durum = durum;
    }

    if (search) {
      where.OR = [
        { siparisNo: { contains: search, mode: 'insensitive' } },
        { cari: { unvan: { contains: search, mode: 'insensitive' } } },
        { cari: { cariKodu: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Not: Bazı siparişlerde cari kaydı silinmiş olabilir (foreign key constraint ihlali)
    // Bu yüzden cari null olan kayıtları filtrelemek için önce cariId'leri kontrol ediyoruz
    let data;
    try {
      data = await this.prisma.siparis.findMany({
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
          kaynakIrsaliyeleri: {
            select: {
              id: true,
              irsaliyeNo: true,
              durum: true,
            },
          },
          _count: {
            select: {
              kalemler: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      // cari null olan kayıtları filtrele (veri tutarsızlığı varsa)
      data = data.filter((siparis) => siparis.cari !== null);
    } catch (error: any) {
      // Eğer cari null olan kayıtlar varsa, bunları filtrele
      if (
        error.message?.includes('Field cari is required') ||
        error.message?.includes('Inconsistent query result')
      ) {
        // Önce cariId'leri al, sonra cari kaydı olanları filtrele
        const siparisIds = await this.prisma.siparis.findMany({
          where,
          select: { id: true, cariId: true },
        });

        // Cari kaydı olan sipariş ID'lerini al
        const validCariIds = await this.prisma.cari.findMany({
          where: {
            id: { in: siparisIds.map((s) => s.cariId).filter(Boolean) },
          },
          select: { id: true },
        });
        const validCariIdSet = new Set(validCariIds.map((c) => c.id));

        // Sadece geçerli cariId'ye sahip siparişleri al
        const validSiparisIds = siparisIds
          .filter((s) => s.cariId && validCariIdSet.has(s.cariId))
          .map((s) => s.id);

        data = await this.prisma.siparis.findMany({
          where: {
            ...where,
            id: { in: validSiparisIds },
          },
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
        });
      } else {
        throw error;
      }
    }

    const total = await this.prisma.siparis.count({ where });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const siparis = await this.prisma.siparis.findUnique({
      where: { id },
      include: {
        cari: true,
        kalemler: {
          include: {
            stok: true,
            hazirlananlar: {
              include: {
                location: true,
              },
            },
          },
        },
        hazirlananlar: {
          include: {
            location: true,
            hazirlayici: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
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

    if (!siparis) {
      throw new NotFoundException(`Sipariş bulunamadı: ${id}`);
    }

    return siparis;
  }

  async create(
    createSiparisDto: CreateSiparisDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { kalemler, ...siparisData } = createSiparisDto;

    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    // Boş stok satırlarını filtrele (stokId boş olanları sil)
    const validKalemler = kalemler.filter(k => k.stokId && k.stokId.trim() !== '');

    if (validKalemler.length === 0) {
      throw new BadRequestException('En az bir kalem eklemelisiniz');
    }

    const finalTenantId = (siparisData as any).tenantId || tenantId || undefined;

    // Sipariş numarası kontrolü (tenant-aware)
    const whereSiparisNo: any = {
      siparisNo: siparisData.siparisNo,
    };

    // SUPER_ADMIN için tenantId filtresi ekleme
    if (finalTenantId) {
      whereSiparisNo.tenantId = finalTenantId;
    }

    const existingSiparis = await this.prisma.siparis.findFirst({
      where: whereSiparisNo,
    });

    if (existingSiparis) {
      throw new BadRequestException(
        `Bu sipariş numarası zaten mevcut: ${siparisData.siparisNo}`,
      );
    }

    // Cari kontrolü
    const cari = await this.prisma.cari.findUnique({
      where: { id: siparisData.cariId },
    });

    if (!cari) {
      throw new NotFoundException(`Cari bulunamadı: ${siparisData.cariId}`);
    }

    // Kalem tutarlarını hesapla (sadece geçerli kalemler için)
    let araToplam = 0;
    let toplamKalemIskontosu = 0;
    let kdvTutar = 0;

    const kalemlerWithCalculations = validKalemler.map((kalem) => {
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
      };
    });

    const genelIskonto = siparisData.iskonto || 0;
    const toplamIskonto = toplamKalemIskontosu + genelIskonto;
    const toplamTutar = araToplam - toplamIskonto;
    const genelToplam = toplamTutar + kdvTutar;

    // Transaction ile sipariş ve kalemleri oluştur
    // ÖNEMLİ: Cari ve stok hareketi yapılmıyor!
    return this.prisma.$transaction(async (prisma) => {
      const siparis = await prisma.siparis.create({
        data: {
          ...siparisData,
          tenantId: finalTenantId,
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
        siparis.id,
        'CREATE',
        userId,
        { siparis: siparisData, kalemler },
        ipAddress,
        userAgent,
        prisma,
      );

      return siparis;
    });
  }

  async update(
    id: string,
    updateSiparisDto: UpdateSiparisDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const siparis = await this.findOne(id);

    if (siparis.durum === 'FATURALANDI') {
      throw new BadRequestException('Faturalanmış sipariş güncellenemez');
    }

    if (siparis.deletedAt) {
      throw new BadRequestException('Silinmiş sipariş güncellenemez');
    }

    const { kalemler, ...siparisData } = updateSiparisDto;

    // Eğer kalemler güncellenmiyorsa sadece sipariş bilgilerini güncelle
    if (!kalemler) {
      const updated = await this.prisma.siparis.update({
        where: { id },
        data: {
          ...siparisData,
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
        { changes: updateSiparisDto },
        ipAddress,
        userAgent,
      );

      return updated;
    }

    // Kalemler güncelleniyorsa transaction içinde işle
    return this.prisma.$transaction(async (prisma) => {
      // Mevcut kalemleri sil
      await prisma.siparisKalemi.deleteMany({
        where: { siparisId: id },
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
        };
      });

      const genelIskonto = siparisData.iskonto ?? siparis.iskonto.toNumber();
      const toplamIskonto = toplamKalemIskontosu + genelIskonto;
      const toplamTutar = araToplam - toplamIskonto;
      const genelToplam = toplamTutar + kdvTutar;

      // Sipariş ve yeni kalemleri oluştur
      const updated = await prisma.siparis.update({
        where: { id },
        data: {
          ...siparisData,
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
        { changes: updateSiparisDto },
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
    const siparis = await this.findOne(id);

    if (siparis.durum === 'FATURALANDI') {
      throw new BadRequestException('Faturalanmış sipariş silinemez');
    }

    await this.prisma.siparis.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    await this.createLog(id, 'DELETE', userId, null, ipAddress, userAgent);

    return { message: 'Sipariş silindi' };
  }

  async restore(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const siparis = await this.prisma.siparis.findUnique({
      where: { id },
    });

    if (!siparis) {
      throw new NotFoundException(`Sipariş bulunamadı: ${id}`);
    }

    if (!siparis.deletedAt) {
      throw new BadRequestException('Sipariş zaten aktif');
    }

    const restored = await this.prisma.siparis.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
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

    await this.createLog(id, 'RESTORE', userId, null, ipAddress, userAgent);

    return restored;
  }

  async changeDurum(
    id: string,
    durum: SiparisDurum,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const siparis = await this.findOne(id);

    if (siparis.durum === 'FATURALANDI') {
      throw new BadRequestException(
        'Faturalanmış siparişin durumu değiştirilemez',
      );
    }

    const updated = await this.prisma.siparis.update({
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
      { oldDurum: siparis.durum, newDurum: durum },
      ipAddress,
      userAgent,
    );

    return updated;
  }

  async iptalEt(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.changeDurum(id, 'IPTAL', userId, ipAddress, userAgent);
  }

  async findDeleted(
    page = 1,
    limit = 50,
    siparisTipi?: SiparisTipi,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.SiparisWhereInput = {
      deletedAt: { not: null },
    };

    if (siparisTipi) {
      where.siparisTipi = siparisTipi;
    }

    if (search) {
      where.OR = [
        { siparisNo: { contains: search, mode: 'insensitive' } },
        { cari: { unvan: { contains: search, mode: 'insensitive' } } },
        { cari: { cariKodu: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.siparis.findMany({
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
          deletedByUser: {
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
        orderBy: { deletedAt: 'desc' },
      }),
      this.prisma.siparis.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // Sipariş faturalandırma
  async faturalandi(
    id: string,
    faturaNo: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const siparis = await this.findOne(id);

    if (siparis.durum === 'FATURALANDI') {
      throw new BadRequestException('Sipariş zaten faturalandırılmış');
    }

    if (siparis.durum === 'IPTAL') {
      throw new BadRequestException('İptal edilmiş sipariş faturalandırılamaz');
    }

    const updated = await this.prisma.siparis.update({
      where: { id },
      data: {
        durum: 'FATURALANDI',
        faturaNo,
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
      { oldDurum: siparis.durum, newDurum: 'FATURALANDI', faturaNo },
      ipAddress,
      userAgent,
    );

    return updated;
  }

  // Sipariş hazırlama detayları
  async getHazirlamaDetaylari(id: string) {
    const siparis = await this.findOne(id);

    // Her kalem için ürünün lokasyonlarını ve stok miktarlarını getir
    const kalemlerWithLocations = await Promise.all(
      siparis.kalemler.map(async (kalem) => {
        const locations = await this.prisma.productLocationStock.findMany({
          where: {
            productId: kalem.stokId,
            qtyOnHand: { gt: 0 },
          },
          include: {
            location: {
              include: {
                warehouse: true,
              },
            },
          },
          orderBy: {
            location: {
              code: 'asc',
            },
          },
        });

        return {
          ...kalem,
          locations,
        };
      }),
    );

    return {
      ...siparis,
      kalemler: kalemlerWithLocations,
    };
  }

  // Sipariş hazırlama işlemi
  async hazirla(id: string, hazirlananlar: any[], userId?: string) {
    const siparis = await this.findOne(id);

    if (siparis.durum !== 'HAZIRLANIYOR') {
      throw new BadRequestException('Sipariş hazırlama durumunda değil');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Mevcut hazırlama kayıtlarını sil
      await prisma.siparisHazirlik.deleteMany({
        where: { siparisId: id },
      });

      // Yeni hazırlama kayıtlarını ekle
      for (const hazirlik of hazirlananlar) {
        await prisma.siparisHazirlik.create({
          data: {
            siparisId: id,
            siparisKalemiId: hazirlik.siparisKalemiId,
            locationId: hazirlik.locationId,
            miktar: hazirlik.miktar,
            hazirlayan: userId,
          },
        });
      }

      // Her kalem için toplam hazırlanan miktarı kontrol et
      const kalemler = await prisma.siparisKalemi.findMany({
        where: { siparisId: id },
      });

      let tumKalemlerHazir = true;
      for (const kalem of kalemler) {
        const toplamHazirlanan = await prisma.siparisHazirlik.aggregate({
          where: { siparisKalemiId: kalem.id },
          _sum: { miktar: true },
        });

        if (
          !toplamHazirlanan._sum.miktar ||
          toplamHazirlanan._sum.miktar < kalem.miktar
        ) {
          tumKalemlerHazir = false;
          break;
        }
      }

      // Eğer tüm kalemler hazırsa durumu güncelle
      if (tumKalemlerHazir) {
        await prisma.siparis.update({
          where: { id },
          data: {
            durum: 'HAZIRLANDI',
            updatedBy: userId,
          },
        });
      }

      return this.findOne(id);
    });
  }

  async sevkEt(
    id: string,
    sevkKalemler: Array<{ kalemId: string; sevkMiktar: number }>,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const siparis = await this.prisma.siparis.findUnique({
      where: { id },
      include: {
        kalemler: {
          include: {
            stok: true,
          },
        },
      },
    });

    if (!siparis) {
      throw new NotFoundException(`Sipariş bulunamadı: ${id}`);
    }

    if (siparis.durum === 'FATURALANDI' || siparis.durum === 'IPTAL') {
      throw new BadRequestException('Faturalandırılmış veya iptal edilmiş siparişler sevk edilemez');
    }

    // Transaction ile sevk işlemini yap
    return this.prisma.$transaction(async (prisma) => {
      // Her kalem için sevk miktarını güncelle
      for (const sevkKalem of sevkKalemler) {
        const kalem = siparis.kalemler.find(k => k.id === sevkKalem.kalemId);

        if (!kalem) {
          throw new NotFoundException(`Sipariş kalemi bulunamadı: ${sevkKalem.kalemId}`);
        }

        const yeniSevkMiktar = (kalem.sevkEdilenMiktar || 0) + sevkKalem.sevkMiktar;

        if (yeniSevkMiktar > kalem.miktar) {
          throw new BadRequestException(
            `${kalem.stok.stokAdi} için sevk edilen miktar (${yeniSevkMiktar}) sipariş miktarını (${kalem.miktar}) aşamaz`
          );
        }

        // Kalem sevk miktarını güncelle
        await prisma.siparisKalemi.update({
          where: { id: kalem.id },
          data: { sevkEdilenMiktar: yeniSevkMiktar },
        });
      }

      // Sipariş durumunu kontrol et ve güncelle
      const siparisGuncelle = await prisma.siparis.findUnique({
        where: { id },
        include: {
          kalemler: true,
        },
      });

      if (!siparisGuncelle) {
        throw new NotFoundException(`Sipariş bulunamadı: ${id}`);
      }

      // Sevk durumunu kontrol et
      const tumKalemlerSevkEdildi = siparisGuncelle.kalemler.every(
        k => (k.sevkEdilenMiktar || 0) >= k.miktar
      );
      const enAzBirKalemSevkEdildi = siparisGuncelle.kalemler.some(
        k => (k.sevkEdilenMiktar || 0) > 0
      );

      // Sipariş durumunu güncelle
      let yeniDurum: SiparisDurum | undefined;

      if (tumKalemlerSevkEdildi) {
        // Tüm kalemler sevk edildiyse SEVK_EDILDI
        yeniDurum = SiparisDurum.SEVK_EDILDI;
      } else if (enAzBirKalemSevkEdildi) {
        // En az bir kalem sevk edildiyse ama hepsi değilse KISMI_SEVK
        yeniDurum = SiparisDurum.KISMI_SEVK;
      }

      if (yeniDurum && siparisGuncelle.durum !== yeniDurum) {
        await prisma.siparis.update({
          where: { id },
          data: { durum: yeniDurum },
        });
      }

      // Audit log oluştur
      await this.createLog(
        id,
        'SEVK',
        userId,
        { sevkKalemler },
        ipAddress,
        userAgent,
        prisma,
      );

      return this.findOne(id);
    });
  }

  async createIrsaliyeFromSiparis(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    // Siparişi bul (kalemler dahil, sevkEdilenMiktar ile)
    const siparis = await this.prisma.siparis.findUnique({
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

    if (!siparis) {
      throw new NotFoundException(`Sipariş bulunamadı: ${id}`);
    }

    if (siparis.siparisTipi !== 'SATIS') {
      throw new BadRequestException('Sadece satış siparişlerinden irsaliye oluşturulabilir');
    }

    if (siparis.durum === 'FATURALANDI' || siparis.durum === 'IPTAL') {
      throw new BadRequestException('Faturalandırılmış veya iptal edilmiş siparişlerden irsaliye oluşturulamaz');
    }

    // Daha önce oluşturulmuş irsaliyeleri bul
    const olusturulanIrsaliyeler = await this.prisma.satisIrsaliyesi.findMany({
      where: {
        kaynakId: siparis.id,
        kaynakTip: IrsaliyeKaynakTip.SIPARIS,
        deletedAt: null,
      },
      include: {
        kalemler: true,
      },
    });

    // Her kalem için, daha önce irsaliyeye alınmış toplam miktarı hesapla
    const irsaliyeyeAlinmisMiktarlar = new Map<string, number>();
    olusturulanIrsaliyeler.forEach(irsaliye => {
      irsaliye.kalemler.forEach(kalem => {
        const mevcutMiktar = irsaliyeyeAlinmisMiktarlar.get(kalem.stokId) || 0;
        irsaliyeyeAlinmisMiktarlar.set(kalem.stokId, mevcutMiktar + kalem.miktar);
      });
    });

    // Sevk edilmiş ama henüz irsaliyeye alınmamış kalemleri bul
    const sevkEdilenKalemler = siparis.kalemler
      .filter(kalem => (kalem.sevkEdilenMiktar || 0) > 0)
      .map(kalem => {
        const irsaliyeyeAlinmisMiktar = irsaliyeyeAlinmisMiktarlar.get(kalem.stokId) || 0;
        const kalanSevkMiktar = (kalem.sevkEdilenMiktar || 0) - irsaliyeyeAlinmisMiktar;

        return {
          ...kalem,
          kalanSevkMiktar: Math.max(0, kalanSevkMiktar),
        };
      })
      .filter(kalem => kalem.kalanSevkMiktar > 0);

    if (sevkEdilenKalemler.length === 0) {
      throw new BadRequestException('Siparişte irsaliyeye alınmamış sevk edilmiş kalem bulunamadı.');
    }

    // İrsaliye numarası oluştur
    let irsaliyeNo: string;
    try {
      irsaliyeNo = await this.codeTemplateService.getNextCode('DELIVERY_NOTE_SALES');
    } catch (error: any) {
      // Şablon yoksa fallback
      const year = new Date().getFullYear();
      const lastIrsaliye = await this.prisma.satisIrsaliyesi.findFirst({
        where: { ...(tenantId && { tenantId }) },
        orderBy: { createdAt: 'desc' },
      });
      const lastNoStr = lastIrsaliye?.irsaliyeNo || '';
      const lastNo = lastNoStr ? parseInt(lastNoStr.split('-').pop() || '0') : 0;
      irsaliyeNo = `IRS-${year}-${(lastNo + 1).toString().padStart(6, '0')}`;
    }

    // İrsaliye kalemlerini hazırla (sadece henüz irsaliyeye alınmamış sevk edilen miktarları kullan)
    const irsaliyeKalemler = sevkEdilenKalemler.map(kalem => ({
      stokId: kalem.stokId,
      miktar: kalem.kalanSevkMiktar, // Henüz irsaliyeye alınmamış sevk edilen miktar
      birimFiyat: Number(kalem.birimFiyat),
      kdvOrani: kalem.kdvOrani,
    }));

    // CreateSatisIrsaliyesiDto oluştur
    const createDto = {
      irsaliyeNo,
      irsaliyeTarihi: new Date().toISOString(),
      cariId: siparis.cariId,
      kaynakTip: IrsaliyeKaynakTip.SIPARIS,
      kaynakId: siparis.id,
      durum: IrsaliyeDurum.FATURALANMADI,
      iskonto: siparis.iskonto || 0,
      aciklama: `Sipariş ${siparis.siparisNo} numaralı siparişten oluşturuldu`,
      kalemler: irsaliyeKalemler,
    };

    // SatisIrsaliyesiService'in create metodunu kullan
    return this.satisIrsaliyesiService.create(
      createDto as any,
      userId,
      ipAddress,
      userAgent,
    );
  }

  async findSiparislerForInvoice(cariId?: string, search?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: Prisma.SiparisWhereInput = {
      deletedAt: null,
      siparisTipi: 'SATIS',
      durum: 'SEVK_EDILDI',
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (cariId) {
      where.cariId = cariId;
    }

    if (search) {
      where.OR = [
        { siparisNo: { contains: search, mode: 'insensitive' } },
        { cari: { unvan: { contains: search, mode: 'insensitive' } } },
        { cari: { cariKodu: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Siparişleri getir
    const siparisler = await this.prisma.siparis.findMany({
      where,
      include: {
        cari: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
          },
        },
        kalemler: {
          include: {
            stok: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
              },
            },
          },
        },
        kaynakIrsaliyeleri: true, // İrsaliye var mı kontrol etmek için
      },
      orderBy: { tarih: 'desc' },
    });

    // İrsaliyesi olmayan siparişleri filtrele
    const filteredSiparisler = siparisler.filter(
      siparis => !(siparis as any).kaynakIrsaliyeleri || (siparis as any).kaynakIrsaliyeleri.length === 0
    );

    return {
      data: filteredSiparisler,
      total: filteredSiparisler.length,
    };
  }
}
