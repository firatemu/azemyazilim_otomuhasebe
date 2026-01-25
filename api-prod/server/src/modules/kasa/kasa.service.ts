import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateKasaDto } from './dto/create-kasa.dto';
import { UpdateKasaDto } from './dto/update-kasa.dto';
import { CreateKasaHareketDto } from './dto/create-kasa-hareket.dto';
import { KasaTipi, Prisma } from '@prisma/client';
import { CodeTemplateService } from '../code-template/code-template.service';

@Injectable()
export class KasaService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
  ) {}

  async findAll(kasaTipi?: KasaTipi, aktif?: boolean) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: Prisma.KasaWhereInput = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (kasaTipi) {
      where.kasaTipi = kasaTipi;
    }

    if (aktif !== undefined) {
      where.aktif = aktif;
    }

    const kasalar = await this.prisma.kasa.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Her kasa için count'ları manuel olarak ekle
    const kasalarWithCount = await Promise.all(
      kasalar.map(async (kasa) => {
        const [hareketler, bankaHesaplari, firmaKrediKartlari] =
          await Promise.all([
            this.prisma.kasaHareket.count({ where: { kasaId: kasa.id } }),
            this.prisma.bankaHesabi.count({ where: { kasaId: kasa.id } }),
            this.prisma.firmaKrediKarti.count({ where: { kasaId: kasa.id } }),
          ]);

        return {
          ...kasa,
          _count: {
            hareketler,
            bankaHesaplari,
            firmaKrediKartlari,
          },
        };
      }),
    );

    return kasalarWithCount;
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const kasa = await this.prisma.kasa.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        bankaHesaplari: {
          orderBy: { createdAt: 'asc' },
        },
        firmaKrediKartlari: {
          orderBy: { createdAt: 'asc' },
        },
        hareketler: {
          include: {
            cari: {
              select: {
                id: true,
                cariKodu: true,
                unvan: true,
              },
            },
            createdByUser: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
          },
          orderBy: {
            tarih: 'desc',
          },
          take: 100,
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

    if (!kasa) {
      throw new NotFoundException(`Kasa bulunamadı: ${id}`);
    }

    return kasa;
  }

  async create(createKasaDto: CreateKasaDto, userId?: string) {
    let kasaKodu = createKasaDto.kasaKodu;

    // Eğer kod girilmemişse, otomatik kod üret
    if (!kasaKodu || kasaKodu.trim() === '') {
      try {
        kasaKodu = await this.codeTemplateService.getNextCode('CASHBOX');
      } catch (error) {
        throw new BadRequestException(
          'Otomatik kod oluşturulamadı. Lütfen manuel kod girin veya "Numara Şablonları" ayarlarını kontrol edin.',
        );
      }
    }

    const tenantId = await this.tenantResolver.resolveForCreate({
      userId,
      allowNull: true, // Staging ortamı için tenantId null olabilir
    });

    const existing = await this.prisma.kasa.findFirst({
      where: {
        kasaKodu,
        ...(tenantId != null && { tenantId }),
      },
    });

    if (existing) {
      throw new BadRequestException('Bu kasa kodu zaten kullanımda');
    }

    const data = {
      kasaKodu,
      ...(tenantId != null && { tenantId }),
      kasaAdi: createKasaDto.kasaAdi,
      kasaTipi: createKasaDto.kasaTipi,
      aktif: createKasaDto.aktif ?? true,
      createdBy: userId,
    };

    return this.prisma.kasa.create({
      data,
    });
  }

  async update(id: string, updateKasaDto: UpdateKasaDto, userId?: string) {
    await this.findOne(id); // Varlık kontrolü

    const data = {
      ...updateKasaDto,
      updatedBy: userId,
    };

    return this.prisma.kasa.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const kasa = await this.findOne(id);

    // Kredi kartı (POS) veya firma kredi kartı kasaları için özel kontrol
    if (kasa.kasaTipi === 'POS' || kasa.kasaTipi === 'FIRMA_KREDI_KARTI') {
      // Kasa hareketleri kontrolü
      const kasaHareketSayisi = await this.prisma.kasaHareket.count({
        where: { kasaId: id },
      });

      // Tahsilat kayıtları kontrolü (kasa ile ilişkili tahsilat/ödeme kayıtları)
      const tahsilatSayisi = await this.prisma.tahsilat.count({
        where: { kasaId: id },
      });

      // Toplam hareket sayısı
      const toplamHareketSayisi = kasaHareketSayisi + tahsilatSayisi;

      if (toplamHareketSayisi > 0) {
        throw new BadRequestException(
          `Bu ${kasa.kasaTipi === 'POS' ? 'kredi kartı (POS)' : 'firma kredi kartı'} kasası hareket görmüştür ve silinemez. Lütfen "Kullanım Dışı" olarak işaretleyin.`,
        );
      }
    } else {
      // Diğer kasa tipleri için genel kontrol
      const kasaHareketSayisi = await this.prisma.kasaHareket.count({
        where: { kasaId: id },
      });

      if (kasaHareketSayisi > 0) {
        throw new BadRequestException(
          'Bu kasa hareket görmüştür ve silinemez. Lütfen "Kullanım Dışı" olarak işaretleyin.',
        );
      }
    }

    // Alt hesap kontrolü (Banka Hesapları veya Firma Kredi Kartları)
    const bankaHesapSayisi = await this.prisma.bankaHesabi.count({
      where: { kasaId: id },
    });
    const firmaKartSayisi = await this.prisma.firmaKrediKarti.count({
      where: { kasaId: id },
    });

    if (bankaHesapSayisi > 0 || firmaKartSayisi > 0) {
      throw new BadRequestException(
        'Bu kasaya bağlı hesaplar veya kartlar var, önce onları silin.',
      );
    }

    return this.prisma.kasa.delete({
      where: { id },
    });
  }

  // Kasa hareketleri
  async createHareket(createHareketDto: CreateKasaHareketDto, userId?: string) {
    const kasa = await this.findOne(createHareketDto.kasaId);

    return this.prisma.$transaction(async (prisma) => {
      let bakiyeDegisim = createHareketDto.tutar;

      // Hareket tipine göre bakiye değişimini belirle
      if (
        ['TAHSILAT', 'HAVALE_GELEN', 'KREDI_KARTI'].includes(
          createHareketDto.hareketTipi,
        )
      ) {
        // Gelen işlemler: bakiye artar
        bakiyeDegisim = createHareketDto.tutar;
      } else if (
        ['ODEME', 'HAVALE_GIDEN'].includes(createHareketDto.hareketTipi)
      ) {
        // Giden işlemler: bakiye azalır
        bakiyeDegisim = -createHareketDto.tutar;
      } else if (createHareketDto.hareketTipi === 'VIRMAN') {
        // Virman: çıkış
        bakiyeDegisim = -createHareketDto.tutar;
      }

      const yeniBakiye = kasa.bakiye.toNumber() + bakiyeDegisim;

      // Hareket kaydı oluştur
      const hareket = await prisma.kasaHareket.create({
        data: {
          kasaId: createHareketDto.kasaId,
          hareketTipi: createHareketDto.hareketTipi,
          tutar: createHareketDto.tutar,
          bakiye: yeniBakiye,
          belgeTipi: createHareketDto.belgeTipi,
          belgeNo: createHareketDto.belgeNo,
          cariId: createHareketDto.cariId,
          aciklama: createHareketDto.aciklama,
          tarih: createHareketDto.tarih
            ? new Date(createHareketDto.tarih)
            : new Date(),
          createdBy: userId,
        },
        include: {
          kasa: true,
          cari: true,
        },
      });

      // Kasa bakiyesini güncelle
      await prisma.kasa.update({
        where: { id: createHareketDto.kasaId },
        data: { bakiye: yeniBakiye },
      });

      return hareket;
    });
  }

  async deleteHareket(hareketId: string) {
    const hareket = await this.prisma.kasaHareket.findUnique({
      where: { id: hareketId },
      include: { kasa: true },
    });

    if (!hareket) {
      throw new NotFoundException('Hareket bulunamadı');
    }

    if (hareket.transferEdildi) {
      throw new BadRequestException('Transfer edilmiş hareket silinemez');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Bakiyeyi geri al
      let bakiyeDegisim = 0;
      if (
        ['TAHSILAT', 'HAVALE_GELEN', 'KREDI_KARTI'].includes(
          hareket.hareketTipi,
        )
      ) {
        bakiyeDegisim = -hareket.tutar.toNumber();
      } else if (
        ['ODEME', 'HAVALE_GIDEN', 'VIRMAN'].includes(hareket.hareketTipi)
      ) {
        bakiyeDegisim = hareket.tutar.toNumber();
      }

      await prisma.kasa.update({
        where: { id: hareket.kasaId },
        data: {
          bakiye: { increment: bakiyeDegisim },
        },
      });

      return prisma.kasaHareket.delete({
        where: { id: hareketId },
      });
    });
  }

  // POS'tan Banka'ya transfer - YENİ YAPIYLA KULLANILMIYOR
  async transferPOStoBanka(posKasaId: string, userId?: string): Promise<any> {
    throw new BadRequestException(
      'Bu fonksiyon yeni kasa yapısında kullanılmamaktadır. POS tahsilatları otomatik olarak BankaHesabi ile işlenir.',
    );
  }

  // Bekleyen POS transferlerini listele
  async getBekleyenPOSTransferler(posKasaId: string) {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    oneDayAgo.setHours(23, 59, 59, 999);

    const bekleyenHareketler = await this.prisma.kasaHareket.findMany({
      where: {
        kasaId: posKasaId,
        hareketTipi: 'KREDI_KARTI',
        transferEdildi: false,
        tarih: {
          lte: oneDayAgo,
        },
      },
      include: {
        cari: {
          select: {
            cariKodu: true,
            unvan: true,
          },
        },
      },
      orderBy: {
        tarih: 'asc',
      },
    });

    const toplamBrutTutar = bekleyenHareketler.reduce(
      (sum, h) => sum + h.tutar.toNumber(),
      0,
    );
    const toplamKomisyon = bekleyenHareketler.reduce(
      (sum, h) => sum + (h.komisyonTutari?.toNumber() || 0),
      0,
    );
    const toplamBSMV = bekleyenHareketler.reduce(
      (sum, h) => sum + (h.bsmvTutari?.toNumber() || 0),
      0,
    );
    const toplamNetTutar = bekleyenHareketler.reduce(
      (sum, h) => sum + (h.netTutar?.toNumber() || 0),
      0,
    );

    return {
      hareketler: bekleyenHareketler,
      ozet: {
        adet: bekleyenHareketler.length,
        toplamBrutTutar,
        toplamKomisyon,
        toplamBSMV,
        toplamNetTutar,
      },
    };
  }
}
