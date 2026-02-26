import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateSayimDto } from './dto/create-sayim.dto';
import { UpdateSayimDto } from './dto/update-sayim.dto';
import { AddKalemDto } from './dto/add-kalem.dto';
import { SayimTipi, SayimDurum, Prisma } from '@prisma/client';

@Injectable()
export class SayimService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) {}

  async findAll(sayimTipi?: SayimTipi, durum?: SayimDurum) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: Prisma.SayimWhereInput = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (sayimTipi) {
      where.sayimTipi = sayimTipi;
    }

    if (durum) {
      where.durum = durum;
    }

    const sayimlar = await this.prisma.sayim.findMany({
      where,
      include: {
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
    });

    return sayimlar;
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const sayim = await this.prisma.sayim.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        kalemler: {
          include: {
            stok: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
                birim: true,
              },
            },
            location: {
              select: {
                id: true,
                code: true,
                name: true,
                warehouse: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
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
        onaylayan: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
    });

    if (!sayim) {
      throw new NotFoundException('Sayım bulunamadı');
    }

    return sayim;
  }

  async create(createSayimDto: CreateSayimDto, userId?: string) {
    const { kalemler, ...sayimData } = createSayimDto;

    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    const existingSayim = await this.prisma.sayim.findFirst({
      where: {
        sayimNo: sayimData.sayimNo,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (existingSayim) {
      throw new BadRequestException(
        `Bu sayım numarası zaten mevcut: ${sayimData.sayimNo}`,
      );
    }

    // Her kalem için sistem miktarını hesapla
    const kalemlerWithSystemQty = await Promise.all(
      kalemler.map(async (kalem) => {
        let sistemMiktari = 0;

        if (sayimData.sayimTipi === 'RAF_BAZLI' && kalem.locationId) {
          // Raf bazlı: Belirli raftaki miktar
          const locationStock =
            await this.prisma.productLocationStock.findUnique({
              where: {
                warehouseId_locationId_productId: {
                  warehouseId: (await this.prisma.location.findUnique({
                    where: { id: kalem.locationId },
                  }))!.warehouseId,
                  locationId: kalem.locationId,
                  productId: kalem.stokId,
                },
              },
            });
          sistemMiktari = locationStock?.qtyOnHand || 0;
        } else {
          // Ürün bazlı: Toplam stok (iptal faturalar hariç)
          const stokHareketler = await this.prisma.stokHareket.findMany({
            where: { stokId: kalem.stokId },
            include: { faturaKalemi: { include: { fatura: { select: { durum: true } } } } },
          });

          stokHareketler.forEach((hareket) => {
            if ((hareket as any).faturaKalemi?.fatura?.durum === 'IPTAL') return;
            if (
              hareket.hareketTipi === 'GIRIS' ||
              hareket.hareketTipi === 'SAYIM_FAZLA' ||
              hareket.hareketTipi === 'IADE' ||
              hareket.hareketTipi === 'IPTAL_GIRIS'
            ) {
              sistemMiktari += hareket.miktar;
            } else if (
              hareket.hareketTipi === 'CIKIS' ||
              hareket.hareketTipi === 'SATIS' ||
              hareket.hareketTipi === 'SAYIM_EKSIK' ||
              hareket.hareketTipi === 'IPTAL_CIKIS'
            ) {
              sistemMiktari -= hareket.miktar;
            }
          });
        }

        const farkMiktari = kalem.sayilanMiktar - sistemMiktari;

        return {
          stokId: kalem.stokId,
          locationId: kalem.locationId || null,
          sistemMiktari,
          sayilanMiktar: kalem.sayilanMiktar,
          farkMiktari,
        };
      }),
    );

    // Transaction ile sayım oluştur
    return this.prisma.$transaction(async (prisma) => {
      const sayim = await prisma.sayim.create({
        data: {
          ...sayimData,
          ...(tenantId != null && { tenantId }),
          createdBy: userId,
          kalemler: {
            create: kalemlerWithSystemQty,
          },
        },
        include: {
          kalemler: {
            include: {
              stok: true,
              location: true,
            },
          },
        },
      });

      return sayim;
    });
  }

  async update(id: string, updateSayimDto: UpdateSayimDto, userId?: string) {
    const sayim = await this.findOne(id);

    if (sayim.durum === 'ONAYLANDI') {
      throw new BadRequestException('Onaylanmış sayım güncellenemez');
    }

    const { kalemler, ...sayimData } = updateSayimDto;

    if (!kalemler) {
      // Sadece sayım bilgilerini güncelle
      return this.prisma.sayim.update({
        where: { id },
        data: {
          ...sayimData,
          updatedBy: userId,
        },
        include: {
          kalemler: {
            include: {
              stok: true,
              location: true,
            },
          },
        },
      });
    }

    // Kalemler güncelleniyorsa
    return this.prisma.$transaction(async (prisma) => {
      // Mevcut kalemleri sil
      await prisma.sayimKalemi.deleteMany({
        where: { sayimId: id },
      });

      // Yeni kalemlerle sistem miktarını hesapla
      const kalemlerWithSystemQty = await Promise.all(
        kalemler.map(async (kalem) => {
          let sistemMiktari = 0;

          if (sayim.sayimTipi === 'RAF_BAZLI' && kalem.locationId) {
            const locationStock = await prisma.productLocationStock.findUnique({
              where: {
                warehouseId_locationId_productId: {
                  warehouseId: (await prisma.location.findUnique({
                    where: { id: kalem.locationId },
                  }))!.warehouseId,
                  locationId: kalem.locationId,
                  productId: kalem.stokId,
                },
              },
            });
            sistemMiktari = locationStock?.qtyOnHand || 0;
          } else {
            const stokHareketler = await prisma.stokHareket.findMany({
              where: { stokId: kalem.stokId },
              include: { faturaKalemi: { include: { fatura: { select: { durum: true } } } } },
            });

            stokHareketler.forEach((hareket) => {
              if ((hareket as any).faturaKalemi?.fatura?.durum === 'IPTAL') return;
              if (
                hareket.hareketTipi === 'GIRIS' ||
                hareket.hareketTipi === 'SAYIM_FAZLA' ||
                hareket.hareketTipi === 'IADE' ||
                hareket.hareketTipi === 'IPTAL_GIRIS'
              ) {
                sistemMiktari += hareket.miktar;
              } else if (
                hareket.hareketTipi === 'CIKIS' ||
                hareket.hareketTipi === 'SATIS' ||
                hareket.hareketTipi === 'SAYIM_EKSIK' ||
                hareket.hareketTipi === 'IPTAL_CIKIS'
              ) {
                sistemMiktari -= hareket.miktar;
              }
            });
          }

          const farkMiktari = kalem.sayilanMiktar - sistemMiktari;

          return {
            stokId: kalem.stokId,
            locationId: kalem.locationId || null,
            sistemMiktari,
            sayilanMiktar: kalem.sayilanMiktar,
            farkMiktari,
          };
        }),
      );

      // Yeni kalemleri ekle
      return prisma.sayim.update({
        where: { id },
        data: {
          ...sayimData,
          updatedBy: userId,
          kalemler: {
            create: kalemlerWithSystemQty,
          },
        },
        include: {
          kalemler: {
            include: {
              stok: true,
              location: true,
            },
          },
        },
      });
    });
  }

  async remove(id: string) {
    const sayim = await this.findOne(id);

    if (sayim.durum === 'ONAYLANDI') {
      throw new BadRequestException('Onaylanmış sayım silinemez');
    }

    await this.prisma.sayim.delete({
      where: { id },
    });

    return { message: 'Sayım silindi' };
  }

  async tamamla(id: string, userId?: string) {
    const sayim = await this.findOne(id);

    if (sayim.durum !== 'TASLAK') {
      throw new BadRequestException('Sadece taslak sayımlar tamamlanabilir');
    }

    return this.prisma.sayim.update({
      where: { id },
      data: {
        durum: 'TAMAMLANDI',
        updatedBy: userId,
      },
      include: {
        kalemler: {
          include: {
            stok: true,
            location: true,
          },
        },
      },
    });
  }

  async onayla(id: string, userId?: string) {
    const sayim = await this.findOne(id);

    if (sayim.durum !== 'TAMAMLANDI') {
      throw new BadRequestException(
        'Sadece tamamlanmış sayımlar onaylanabilir',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // Her kalem için stok düzeltmesi yap
      for (const kalem of sayim.kalemler) {
        if (kalem.farkMiktari === 0) continue; // Fark yoksa işlem yapma

        if (sayim.sayimTipi === 'RAF_BAZLI' && kalem.locationId) {
          // Raf bazlı: ProductLocationStock güncelle
          const location = await prisma.location.findUnique({
            where: { id: kalem.locationId },
          });

          if (!location) continue;

          const locationStock = await prisma.productLocationStock.findUnique({
            where: {
              warehouseId_locationId_productId: {
                warehouseId: location.warehouseId,
                locationId: kalem.locationId,
                productId: kalem.stokId,
              },
            },
          });

          if (locationStock) {
            // Mevcut stok varsa güncelle
            await prisma.productLocationStock.update({
              where: { id: locationStock.id },
              data: {
                qtyOnHand: kalem.sayilanMiktar, // Sayılan miktara eşitle
              },
            });
          } else if (kalem.sayilanMiktar > 0) {
            // Yeni stok oluştur
            await prisma.productLocationStock.create({
              data: {
                warehouseId: location.warehouseId,
                locationId: kalem.locationId,
                productId: kalem.stokId,
                qtyOnHand: kalem.sayilanMiktar,
              },
            });
          }
        }

        // Stok hareket kaydı oluştur (hem raf bazlı hem ürün bazlı için)
        // SAYIM_FAZLA = artış (GIRIS gibi), SAYIM_EKSIK = azalış (CIKIS gibi)
        const hareketTipi =
          kalem.farkMiktari > 0 ? 'SAYIM_FAZLA' : 'SAYIM_EKSIK';
        const miktar = Math.abs(kalem.farkMiktari);
        const aciklama =
          kalem.farkMiktari > 0
            ? `Sayım Fazlası: ${sayim.sayimNo}`
            : `Sayım Eksiği: ${sayim.sayimNo}`;

        await prisma.stokHareket.create({
          data: {
            stokId: kalem.stokId,
            hareketTipi,
            miktar,
            birimFiyat: 0,
            aciklama,
          },
        });
      }

      // Sayım durumunu güncelle
      return prisma.sayim.update({
        where: { id },
        data: {
          durum: 'ONAYLANDI',
          onaylayanId: userId,
          onayTarihi: new Date(),
        },
        include: {
          kalemler: {
            include: {
              stok: true,
              location: true,
            },
          },
        },
      });
    });
  }

  // Barkod ile ürün ara
  async findProductByBarcode(barcode: string) {
    console.log('🔍 Barkod aranıyor:', barcode);

    // Önce product_barcodes tablosundan ara
    const productBarcode = await this.prisma.productBarcode.findUnique({
      where: { barcode },
      include: {
        product: true,
      },
    });

    console.log(
      '📦 product_barcodes sonucu:',
      productBarcode ? 'Bulundu' : 'Bulunamadı',
    );

    if (productBarcode) {
      return productBarcode.product;
    }

    // Bulunamazsa stok tablosundaki barkod alanından ara (findFirst kullan)
    const stok = await this.prisma.stok.findFirst({
      where: { barkod: barcode },
    });

    console.log(
      '📋 stok tablosu sonucu:',
      stok ? `Bulundu: ${stok.stokKodu}` : 'Bulunamadı',
    );

    if (!stok) {
      throw new NotFoundException('Barkod bulunamadı');
    }

    return stok;
  }

  // Barkod ile lokasyon ara
  async findLocationByBarcode(barcode: string) {
    const location = await this.prisma.location.findUnique({
      where: { barcode },
      include: {
        warehouse: true,
      },
    });

    if (!location) {
      throw new NotFoundException('Raf barkodu bulunamadı');
    }

    return location;
  }

  // Sayıma kalem ekle
  async addKalem(sayimId: string, addKalemDto: AddKalemDto) {
    const sayim = await this.findOne(sayimId);

    if (sayim.durum !== 'TASLAK') {
      throw new BadRequestException(
        'Sadece taslak sayımlara kalem eklenebilir',
      );
    }

    // Sistem miktarını hesapla
    let sistemMiktari = 0;

    if (sayim.sayimTipi === 'RAF_BAZLI' && addKalemDto.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: addKalemDto.locationId },
      });

      if (!location) {
        throw new NotFoundException('Lokasyon bulunamadı');
      }

      const locationStock = await this.prisma.productLocationStock.findUnique({
        where: {
          warehouseId_locationId_productId: {
            warehouseId: location.warehouseId,
            locationId: addKalemDto.locationId,
            productId: addKalemDto.stokId,
          },
        },
      });

      sistemMiktari = locationStock?.qtyOnHand || 0;
    } else {
      // Ürün bazlı: Toplam stok (iptal faturalar hariç)
      const stokHareketler = await this.prisma.stokHareket.findMany({
        where: { stokId: addKalemDto.stokId },
        include: { faturaKalemi: { include: { fatura: { select: { durum: true } } } } },
      });

      stokHareketler.forEach((hareket) => {
        if ((hareket as any).faturaKalemi?.fatura?.durum === 'IPTAL') return;
        if (
          hareket.hareketTipi === 'GIRIS' ||
          hareket.hareketTipi === 'SAYIM_FAZLA' ||
          hareket.hareketTipi === 'IADE' ||
          hareket.hareketTipi === 'IPTAL_GIRIS'
        ) {
          sistemMiktari += hareket.miktar;
        } else if (
          hareket.hareketTipi === 'CIKIS' ||
          hareket.hareketTipi === 'SATIS' ||
          hareket.hareketTipi === 'SAYIM_EKSIK' ||
          hareket.hareketTipi === 'IPTAL_CIKIS'
        ) {
          sistemMiktari -= hareket.miktar;
        }
      });
    }

    const farkMiktari = addKalemDto.sayilanMiktar - sistemMiktari;

    // Aynı ürün ve lokasyon için kalem var mı kontrol et
    const existingKalem = await this.prisma.sayimKalemi.findFirst({
      where: {
        sayimId,
        stokId: addKalemDto.stokId,
        locationId: addKalemDto.locationId || null,
      },
    });

    if (existingKalem) {
      // Güncelle
      return this.prisma.sayimKalemi.update({
        where: { id: existingKalem.id },
        data: {
          sayilanMiktar: addKalemDto.sayilanMiktar,
          farkMiktari,
        },
        include: {
          stok: true,
          location: true,
        },
      });
    }

    // Yeni kalem ekle
    return this.prisma.sayimKalemi.create({
      data: {
        sayimId,
        stokId: addKalemDto.stokId,
        locationId: addKalemDto.locationId || null,
        sistemMiktari,
        sayilanMiktar: addKalemDto.sayilanMiktar,
        farkMiktari,
      },
      include: {
        stok: true,
        location: true,
      },
    });
  }
}
