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
import { CreateStokDto, UpdateStokDto } from './dto';
import { CodeTemplateService } from '../code-template/code-template.service';
import { HareketTipi } from '@prisma/client';

@Injectable()
export class StokService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
  ) {}

  async create(dto: CreateStokDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({ allowNull: true });

    // Eğer stokKodu girilmemişse otomatik üret
    let stokKodu = dto.stokKodu;
    if (!stokKodu) {
      try {
        stokKodu = await this.codeTemplateService.getNextCode('PRODUCT');
      } catch (error) {
        // Şablon yoksa veya aktif değilse, kullanıcı elle girmeli
        throw new Error(
          'Stok kodu girilmeli veya otomatik kod şablonu tanımlanmalı',
        );
      }
    }

    const finalTenantId = (dto as any).tenantId ?? tenantId ?? undefined;
    const existingWhere: any = { stokKodu };
    if (finalTenantId) existingWhere.tenantId = finalTenantId;
    const existing = await this.prisma.stok.findFirst({
      where: existingWhere,
    });
    if (existing) {
      throw new BadRequestException('Bu stok kodu zaten kullanılıyor');
    }

    try {
      const createData: any = {
        ...dto,
        stokKodu,
        ...(finalTenantId != null && { tenantId: finalTenantId }),
      };
      return await this.prisma.stok.create({
        data: createData,
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const field = error?.meta?.target?.[0] || 'alan';
        throw new BadRequestException(`${field} zaten kullanılıyor`);
      }
      throw new BadRequestException(
        error?.message || 'Stok kaydedilirken hata oluştu',
      );
    }
  }

  async findAll(page = 1, limit = 50, search?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;
    const where: any = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };
    if (search) {
      where.OR = [
        { stokKodu: { contains: search, mode: 'insensitive' as const } },
        { stokAdi: { contains: search, mode: 'insensitive' as const } },
        { barkod: { contains: search, mode: 'insensitive' as const } },
        { oem: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    try {
      const [initialData, total] = await Promise.all([
        this.prisma.stok.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            productLocationStocks: {
              take: 1,
              include: {
                location: true,
              },
            },
          },
        }),
        this.prisma.stok.count({ where }),
      ]);


      // Eğer raf field'ı boşsa, productLocationStocks'ten al ve miktar hesapla
      const dataWithDetails = await Promise.all(
        initialData.map(async (stok) => {
          // Stok hareketlerinden toplam miktarı hesapla
          const stokHareketler = await this.prisma.stokHareket.findMany({
            where: { stokId: stok.id },
          });

          let miktar = 0;
          stokHareketler.forEach((hareket) => {
            if (
              hareket.hareketTipi === 'GIRIS' ||
              hareket.hareketTipi === 'SAYIM_FAZLA'
            ) {
              miktar += hareket.miktar;
            } else if (
              hareket.hareketTipi === 'CIKIS' ||
              hareket.hareketTipi === 'SATIS' ||
              hareket.hareketTipi === 'SAYIM_EKSIK'
            ) {
              miktar -= hareket.miktar;
            }
          });

          return {
            ...stok,
            raf:
              stok.raf ||
              (stok.productLocationStocks?.[0]?.location?.code ?? null),
            miktar,
          };
        }),
      );

      return {
        data: dataWithDetails,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error('❌ [Stok Service] findAll hatası:', error);
      console.error('❌ [Stok Service] Hata detayları:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
        stack: error?.stack,
      });
      throw new BadRequestException(
        error?.message || 'Stok verileri alınırken hata oluştu'
      );
    }
  }

  async findOne(id: string) {
    const stok = await this.prisma.stok.findUnique({
      where: { id },
      include: {
        stokHareketleri: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        urunRaflar: {
          include: {
            raf: {
              include: {
                depo: true,
              },
            },
          },
        },
      },
    });

    if (!stok) {
      throw new NotFoundException('Stok bulunamadı');
    }

    const [productLocationStocks, girisAggregate, cikisAggregate] =
      await Promise.all([
        this.prisma.productLocationStock.findMany({
          where: { productId: id },
          include: {
            warehouse: true,
            location: {
              include: {
                warehouse: true,
              },
            },
          },
          orderBy: [
            {
              warehouse: {
                code: 'asc',
              },
            },
            {
              location: {
                code: 'asc',
              },
            },
          ],
        }),
        this.prisma.stokHareket.aggregate({
          where: {
            stokId: id,
            hareketTipi: {
              in: [
                HareketTipi.GIRIS,
                HareketTipi.IADE,
                HareketTipi.SAYIM_FAZLA,
              ],
            },
          },
          _sum: { miktar: true },
        }),
        this.prisma.stokHareket.aggregate({
          where: {
            stokId: id,
            hareketTipi: {
              in: [
                HareketTipi.CIKIS,
                HareketTipi.SATIS,
                HareketTipi.SAYIM_EKSIK,
              ],
            },
          },
          _sum: { miktar: true },
        }),
      ]);

    const productLocationStockTotal = productLocationStocks.reduce(
      (total, stock) => total + (stock.qtyOnHand ?? 0),
      0,
    );

    const totalStock =
      (girisAggregate._sum.miktar ?? 0) - (cikisAggregate._sum.miktar ?? 0);

    return {
      ...stok,
      productLocationStocks,
      productLocationStockTotal,
      totalStock,
    };
  }

  async update(id: string, dto: UpdateStokDto) {
    await this.findOne(id);

    return this.prisma.stok.update({
      where: { id },
      data: dto,
    });
  }

  async canDelete(id: string) {
    // Stok hareketi var mı kontrol et
    const hareketSayisi = await this.prisma.stokHareket.count({
      where: { stokId: id },
    });

    // Fatura kalemi var mı kontrol et
    const faturaKalemSayisi = await this.prisma.faturaKalemi.count({
      where: { stokId: id },
    });

    // Sipariş kalemi var mı kontrol et
    const siparisKalemSayisi = await this.prisma.siparisKalemi.count({
      where: { stokId: id },
    });

    // Teklif kalemi var mı kontrol et
    const teklifKalemSayisi = await this.prisma.teklifKalemi.count({
      where: { stokId: id },
    });

    // Sayım kalemi var mı kontrol et
    const sayimKalemSayisi = await this.prisma.sayimKalemi.count({
      where: { stokId: id },
    });

    // Stock move var mı kontrol et
    const stockMoveSayisi = await this.prisma.stockMove.count({
      where: { productId: id },
    });

    // Toplam hareket sayısı
    const toplamHareketSayisi =
      hareketSayisi +
      faturaKalemSayisi +
      siparisKalemSayisi +
      teklifKalemSayisi +
      sayimKalemSayisi +
      stockMoveSayisi;

    return {
      canDelete: toplamHareketSayisi === 0,
      hareketSayisi,
      faturaKalemSayisi,
      siparisKalemSayisi,
      teklifKalemSayisi,
      sayimKalemSayisi,
      stockMoveSayisi,
      toplamHareketSayisi,
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    const canDeleteResult = await this.canDelete(id);

    if (!canDeleteResult.canDelete) {
      throw new BadRequestException(
        `Bu malzeme silinemez. Malzeme ${canDeleteResult.toplamHareketSayisi} işlemde kullanılmıştır. ` +
          `(Hareket: ${canDeleteResult.hareketSayisi}, Fatura: ${canDeleteResult.faturaKalemSayisi}, Sipariş: ${canDeleteResult.siparisKalemSayisi}, ` +
          `Teklif: ${canDeleteResult.teklifKalemSayisi}, Sayım: ${canDeleteResult.sayimKalemSayisi}, Depo Hareketi: ${canDeleteResult.stockMoveSayisi})`,
      );
    }

    return this.prisma.stok.delete({
      where: { id },
    });
  }

  async addEsdeger(stok1Id: string, stok2Id: string) {
    return this.prisma.stokEsdeger.create({
      data: {
        stok1Id,
        stok2Id,
      },
    });
  }

  async getStokHareketleri(stokId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.stokHareket.findMany({
        where: { stokId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stokHareket.count({ where: { stokId } }),
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

  async eslestirUrunler(anaUrunId: string, esUrunIds: string[]) {
    // Ana ürünü kontrol et
    const anaUrun = await this.findOne(anaUrunId);

    // Eş ürünleri kontrol et
    const esUrunler = await this.prisma.stok.findMany({
      where: { id: { in: esUrunIds } },
      include: { esdegerGrup: true },
    });

    if (esUrunler.length !== esUrunIds.length) {
      throw new NotFoundException('Bazı eş ürünler bulunamadı');
    }

    // Tüm ürünlerin grup ID'lerini topla (null olmayanlar)
    const mevcutGrupIds = new Set<string>();

    if (anaUrun.esdegerGrupId) {
      mevcutGrupIds.add(anaUrun.esdegerGrupId);
    }

    esUrunler.forEach((urun) => {
      if (urun.esdegerGrupId) {
        mevcutGrupIds.add(urun.esdegerGrupId);
      }
    });

    let hedefGrupId: string;

    if (mevcutGrupIds.size === 0) {
      // Hiçbir ürünün grubu yok, yeni grup oluştur
      const yeniGrup = await this.prisma.esdegerGrup.create({
        data: {
          grupAdi: `Grup - ${anaUrun.stokKodu}`,
        },
      });
      hedefGrupId = yeniGrup.id;
    } else if (mevcutGrupIds.size === 1) {
      // Bir grup var, onu kullan
      hedefGrupId = Array.from(mevcutGrupIds)[0];
    } else {
      // Birden fazla grup var, hepsini birleştir
      const grupIds = Array.from(mevcutGrupIds);
      hedefGrupId = grupIds[0];

      // Diğer gruplardaki tüm ürünleri hedef gruba taşı
      for (let i = 1; i < grupIds.length; i++) {
        await this.prisma.stok.updateMany({
          where: { esdegerGrupId: grupIds[i] },
          data: { esdegerGrupId: hedefGrupId },
        });

        // Boş kalan grupları sil
        await this.prisma.esdegerGrup.delete({
          where: { id: grupIds[i] },
        });
      }
    }

    // Ana ürünü gruba ekle
    await this.prisma.stok.update({
      where: { id: anaUrunId },
      data: { esdegerGrupId: hedefGrupId },
    });

    // Eş ürünleri gruba ekle (tümünü güncelle)
    if (esUrunIds.length > 0) {
      await this.prisma.stok.updateMany({
        where: {
          id: { in: esUrunIds },
        },
        data: { esdegerGrupId: hedefGrupId },
      });
    }

    // Grup içindeki tüm ürünleri getir
    const grupUrunler = await this.prisma.stok.findMany({
      where: { esdegerGrupId: hedefGrupId },
      select: {
        id: true,
        stokKodu: true,
        stokAdi: true,
        marka: true,
        oem: true,
      },
    });

    return {
      message: 'Ürünler başarıyla eşleştirildi',
      grupId: hedefGrupId,
      toplamUrun: grupUrunler.length,
      urunler: grupUrunler,
    };
  }

  async getEsdegerUrunler(stokId: string) {
    const stok = await this.prisma.stok.findUnique({
      where: { id: stokId },
      select: { esdegerGrupId: true },
    });

    if (!stok) {
      throw new NotFoundException('Stok bulunamadı');
    }

    if (!stok.esdegerGrupId) {
      return {
        message: 'Bu ürünün eşdeğeri yok',
        esdegerler: [],
      };
    }

    // Aynı gruptaki diğer ürünleri getir (kendisi hariç)
    const esdegerler = await this.prisma.stok.findMany({
      where: {
        esdegerGrupId: stok.esdegerGrupId,
        id: { not: stokId },
      },
      select: {
        id: true,
        stokKodu: true,
        stokAdi: true,
        marka: true,
        oem: true,
        alisFiyati: true,
        satisFiyati: true,
        birim: true,
      },
    });

    // Eğer grupta başka ürün yoksa, bu "yetim grup" durumu - temizle
    if (esdegerler.length === 0) {
      const grupId = stok.esdegerGrupId;

      // Ürünü gruptan çıkar
      await this.prisma.stok.update({
        where: { id: stokId },
        data: { esdegerGrupId: null },
      });

      // Grubu sil
      try {
        await this.prisma.esdegerGrup.delete({
          where: { id: grupId },
        });
      } catch (err) {
        // Grup zaten silinmiş olabilir, hata vermemeli
      }

      return {
        message: 'Bu ürünün eşdeğeri yok (yetim grup temizlendi)',
        esdegerler: [],
      };
    }

    // Her eşdeğer ürün için miktar hesapla
    const esdegerlerWithMiktar = await Promise.all(
      esdegerler.map(async (urun) => {
        const stokHareketler = await this.prisma.stokHareket.findMany({
          where: { stokId: urun.id },
        });

        let miktar = 0;
        stokHareketler.forEach((hareket) => {
          if (
            hareket.hareketTipi === 'GIRIS' ||
            hareket.hareketTipi === 'SAYIM_FAZLA'
          ) {
            miktar += hareket.miktar;
          } else if (
            hareket.hareketTipi === 'CIKIS' ||
            hareket.hareketTipi === 'SATIS' ||
            hareket.hareketTipi === 'SAYIM_EKSIK'
          ) {
            miktar -= hareket.miktar;
          }
        });

        return {
          ...urun,
          miktar,
        };
      }),
    );

    return {
      message: 'Eşdeğer ürünler getirildi',
      toplamEsdeger: esdegerlerWithMiktar.length,
      esdegerler: esdegerlerWithMiktar,
    };
  }

  async eslestirmeKaldir(stokId: string) {
    const stok = await this.findOne(stokId);

    if (!stok.esdegerGrupId) {
      return {
        message: 'Bu ürünün zaten eşleştirmesi yok',
      };
    }

    const grupId = stok.esdegerGrupId;

    // Gruptaki diğer ürünleri say
    const gruptakiUrunSayisi = await this.prisma.stok.count({
      where: { esdegerGrupId: grupId },
    });

    // Bu ürünü gruptan çıkar
    await this.prisma.stok.update({
      where: { id: stokId },
      data: { esdegerGrupId: null },
    });

    // Eğer grupta sadece 1 ürün kaldıysa, onu da gruptan çıkar ve grubu sil
    if (gruptakiUrunSayisi === 2) {
      const kalanUrun = await this.prisma.stok.findFirst({
        where: { esdegerGrupId: grupId },
      });

      if (kalanUrun) {
        await this.prisma.stok.update({
          where: { id: kalanUrun.id },
          data: { esdegerGrupId: null },
        });
      }

      await this.prisma.esdegerGrup.delete({
        where: { id: grupId },
      });
    }

    return {
      message: 'Eşleştirme başarıyla kaldırıldı',
      stokKodu: stok.stokKodu,
    };
  }

  async eslestirmeCiftiKaldir(stokId: string, eslesikId: string) {
    if (stokId === eslesikId) {
      throw new NotFoundException('Kaldırılacak eşdeğer ürün bulunamadı');
    }

    const urunler = await this.prisma.stok.findMany({
      where: { id: { in: [stokId, eslesikId] } },
      select: {
        id: true,
        stokKodu: true,
        esdegerGrupId: true,
      },
    });

    if (urunler.length !== 2) {
      throw new NotFoundException('Ürünlerden biri bulunamadı');
    }

    const anaUrun = urunler.find((u) => u.id === stokId)!;
    const eslesikUrun = urunler.find((u) => u.id === eslesikId)!;

    if (!anaUrun.esdegerGrupId || !eslesikUrun.esdegerGrupId) {
      throw new NotFoundException('Ürünlerden biri eşdeğer gruba bağlı değil');
    }

    if (anaUrun.esdegerGrupId !== eslesikUrun.esdegerGrupId) {
      throw new NotFoundException('Ürünler aynı eşdeğer grupta değil');
    }

    const grupId = anaUrun.esdegerGrupId;

    await this.prisma.stok.update({
      where: { id: eslesikId },
      data: { esdegerGrupId: null },
    });

    const kalanUrunler = await this.prisma.stok.findMany({
      where: { esdegerGrupId: grupId },
      select: {
        id: true,
        stokKodu: true,
        stokAdi: true,
        marka: true,
        oem: true,
      },
    });

    if (kalanUrunler.length <= 1) {
      const kalan = kalanUrunler[0];

      if (kalan) {
        await this.prisma.stok.update({
          where: { id: kalan.id },
          data: { esdegerGrupId: null },
        });
      }

      await this.prisma.esdegerGrup.delete({
        where: { id: grupId },
      });

      return {
        message: 'Eşleştirme kaldırıldı ve grup temizlendi',
        kalanUrunler: kalan ? [kalan] : [],
      };
    }

    return {
      message: 'Eşleştirme başarıyla kaldırıldı',
      kalanUrunler,
    };
  }

  async eslestirOemIle() {
    // OEM numarası olan tüm ürünleri getir
    const urunler = await this.prisma.stok.findMany({
      where: {
        oem: { not: null },
      },
      select: {
        id: true,
        stokKodu: true,
        stokAdi: true,
        oem: true,
        esdegerGrupId: true,
      },
    });

    // OEM numaralarına göre grupla
    const oemGruplari = new Map<string, typeof urunler>();

    urunler.forEach((urun) => {
      if (urun.oem) {
        const oemKey = urun.oem.trim().toUpperCase();
        if (!oemGruplari.has(oemKey)) {
          oemGruplari.set(oemKey, []);
        }
        oemGruplari.get(oemKey)!.push(urun);
      }
    });

    let toplamEslestirme = 0;
    let toplamGrup = 0;
    const hatalar: string[] = [];

    // Her OEM grubu için eşleştirme yap
    for (const [oem, grupUrunler] of oemGruplari.entries()) {
      // Aynı OEM'e sahip 2'den fazla ürün varsa eşleştir
      if (grupUrunler.length < 2) {
        continue;
      }

      try {
        // İlk ürünü ana ürün olarak seç, diğerlerini eş ürün olarak eşleştir
        const anaUrun = grupUrunler[0];
        const esUrunIds = grupUrunler.slice(1).map((u) => u.id);

        // Mevcut eşleştirme metodunu kullan
        await this.eslestirUrunler(anaUrun.id, esUrunIds);

        toplamEslestirme += grupUrunler.length;
        toplamGrup++;
      } catch (error: any) {
        hatalar.push(`OEM ${oem}: ${error.message || 'Bilinmeyen hata'}`);
      }
    }

    return {
      message: 'OEM ile eşleştirme tamamlandı',
      toplamEslestirilenUrun: toplamEslestirme,
      toplamGrup,
      hatalar: hatalar.length > 0 ? hatalar : undefined,
    };
  }
}
