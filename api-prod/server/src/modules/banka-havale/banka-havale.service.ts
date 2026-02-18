import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BelgeTipi,
  BorcAlacak,
  HavaleTipi,
  KasaHareketTipi,
  KasaTipi,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { CreateBankaHavaleDto } from './dto/create-banka-havale.dto';
import { FilterBankaHavaleDto } from './dto/filter-banka-havale.dto';
import { UpdateBankaHavaleDto } from './dto/update-banka-havale.dto';

@Injectable()
export class BankaHavaleService {
  constructor(private prisma: PrismaService) { }

  async create(createDto: CreateBankaHavaleDto, userId: string) {
    // Banka hesabını kontrol et
    const bankaHesabi = await this.prisma.kasa.findUnique({
      where: { id: createDto.bankaHesabiId },
    });

    if (!bankaHesabi) {
      throw new NotFoundException('Banka hesabı bulunamadı');
    }

    if (bankaHesabi.kasaTipi !== KasaTipi.BANKA) {
      throw new BadRequestException('Seçilen kasa bir banka hesabı değil');
    }

    if (!bankaHesabi.aktif) {
      throw new BadRequestException('Banka hesabı aktif değil');
    }

    // Cari kontrolü
    const cari = await this.prisma.cari.findUnique({
      where: { id: createDto.cariId },
    });

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    if (!cari.aktif) {
      throw new BadRequestException('Cari hesap aktif değil');
    }

    // Transaction ile işlemleri gerçekleştir
    return this.prisma.$transaction(async (prisma) => {
      const tarih = createDto.tarih ? new Date(createDto.tarih) : new Date();

      // Banka havale kaydını oluştur
      const bankaHavale = await prisma.bankaHavale.create({
        data: {
          hareketTipi: createDto.hareketTipi,
          bankaHesabiId: createDto.bankaHesabiId,
          cariId: createDto.cariId,
          tutar: createDto.tutar,
          tarih: tarih,
          aciklama: createDto.aciklama,
          referansNo: createDto.referansNo,
          gonderen: createDto.gonderen,
          alici: createDto.alici,
          createdBy: userId,
        },
        include: {
          bankaHesabi: {
            select: {
              id: true,
              kasaKodu: true,
              kasaAdi: true,
            },
          },
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
      });

      // Banka hesabı bakiyesini güncelle
      const isGelen = createDto.hareketTipi === HavaleTipi.GELEN;
      const yeniBankaBakiye = isGelen
        ? Number(bankaHesabi.bakiye) + createDto.tutar
        : Number(bankaHesabi.bakiye) - createDto.tutar;

      if (!isGelen && yeniBankaBakiye < 0) {
        throw new BadRequestException('Banka hesabında yeterli bakiye yok');
      }

      await prisma.kasa.update({
        where: { id: createDto.bankaHesabiId },
        data: { bakiye: yeniBankaBakiye },
      });

      // Kasa hareket kaydı oluştur
      await prisma.kasaHareket.create({
        data: {
          kasaId: createDto.bankaHesabiId,
          hareketTipi: isGelen
            ? KasaHareketTipi.HAVALE_GELEN
            : KasaHareketTipi.HAVALE_GIDEN,
          tutar: createDto.tutar,
          bakiye: yeniBankaBakiye,
          belgeTipi: 'HAVALE',
          belgeNo: createDto.referansNo,
          cariId: createDto.cariId,
          aciklama:
            createDto.aciklama ||
            `${isGelen ? 'Gelen' : 'Giden'} Havale - ${cari.unvan}`,
          tarih: tarih,
          createdBy: userId,
        },
      });

      // BankaHesapHareket kaydı oluştur (eğer spesifik banka hesabı belirtilmişse)
      if (createDto.bankaHesapId) {
        // BankaHesabi'yi kontrol et
        const bankaHesap = await prisma.bankaHesabi.findUnique({
          where: { id: createDto.bankaHesapId },
        });

        if (bankaHesap && bankaHesap.kasaId === createDto.bankaHesabiId) {
          // BankaHesabi bakiyesini güncelle
          const yeniHesapBakiye = isGelen
            ? Number(bankaHesap.bakiye) + createDto.tutar
            : Number(bankaHesap.bakiye) - createDto.tutar;

          if (!isGelen && yeniHesapBakiye < 0) {
            throw new BadRequestException('Banka hesabında yeterli bakiye yok');
          }

          await prisma.bankaHesabi.update({
            where: { id: createDto.bankaHesapId },
            data: { bakiye: yeniHesapBakiye },
          });

          // BankaHesapHareket kaydı oluştur
          await prisma.bankaHesapHareket.create({
            data: {
              hesapId: createDto.bankaHesapId,
              hareketTipi: isGelen ? 'HAVALE_GELEN' : 'HAVALE_GIDEN',
              tutar: createDto.tutar,
              bakiye: yeniHesapBakiye,
              aciklama: createDto.aciklama || `${isGelen ? 'Gelen' : 'Giden'} Havale`,
              referansNo: createDto.referansNo,
              cariId: createDto.cariId,
              tarih: tarih,
            },
          });
        }
      }

      // Cari bakiyesini güncelle
      const yeniCariBakiye = isGelen
        ? Number(cari.bakiye) - createDto.tutar // Gelen havale -> müşterinin borcu azalır (alacağımız azalır)
        : Number(cari.bakiye) + createDto.tutar; // Giden havale -> tedarikçiye ödeme (borcumuz azalır, bakiye artar)

      await prisma.cari.update({
        where: { id: createDto.cariId },
        data: { bakiye: yeniCariBakiye },
      });

      // Cari hareket kaydı oluştur
      await prisma.cariHareket.create({
        data: {
          cariId: createDto.cariId,
          tip: isGelen ? BorcAlacak.BORC : BorcAlacak.ALACAK,
          tutar: createDto.tutar,
          bakiye: yeniCariBakiye,
          belgeTipi: BelgeTipi.TAHSILAT,
          belgeNo: createDto.referansNo,
          tarih: tarih,
          aciklama:
            createDto.aciklama ||
            `${isGelen ? 'Gelen' : 'Giden'} Havale - ${bankaHesabi.kasaAdi}`,
        },
      });

      // Log kaydı oluştur
      await prisma.bankaHavaleLog.create({
        data: {
          bankaHavaleId: bankaHavale.id,
          userId: userId,
          actionType: 'CREATE',
          changes: JSON.stringify({
            action: 'create',
            data: createDto,
          }),
        },
      });

      return bankaHavale;
    });
  }

  async findAll(filterDto?: FilterBankaHavaleDto) {
    const where: Prisma.BankaHavaleWhereInput = {
      deletedAt: null, // Soft delete kontrolü
    };

    if (filterDto?.hareketTipi) {
      where.hareketTipi = filterDto.hareketTipi;
    }

    if (filterDto?.bankaHesabiId) {
      where.bankaHesabiId = filterDto.bankaHesabiId;
    }

    if (filterDto?.cariId) {
      where.cariId = filterDto.cariId;
    }

    if (filterDto?.referansNo) {
      where.referansNo = {
        contains: filterDto.referansNo,
        mode: 'insensitive',
      };
    }

    if (filterDto?.baslangicTarihi || filterDto?.bitisTarihi) {
      where.tarih = {};
      if (filterDto.baslangicTarihi) {
        where.tarih.gte = new Date(filterDto.baslangicTarihi);
      }
      if (filterDto.bitisTarihi) {
        where.tarih.lte = new Date(filterDto.bitisTarihi);
      }
    }

    return this.prisma.bankaHavale.findMany({
      where,
      include: {
        bankaHesabi: {
          select: {
            id: true,
            kasaKodu: true,
            kasaAdi: true,
          },
        },
        cari: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            telefon: true,
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
      orderBy: { tarih: 'desc' },
    });
  }

  async findOne(id: string) {
    const bankaHavale = await this.prisma.bankaHavale.findUnique({
      where: { id },
      include: {
        bankaHesabi: {
          select: {
            id: true,
            kasaKodu: true,
            kasaAdi: true,
          },
        },
        cari: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            telefon: true,
            email: true,
            adres: true,
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

    if (!bankaHavale || bankaHavale.deletedAt) {
      throw new NotFoundException('Banka havale kaydı bulunamadı');
    }

    return bankaHavale;
  }

  async update(id: string, updateDto: UpdateBankaHavaleDto, userId: string) {
    const existingHavale = await this.prisma.bankaHavale.findUnique({
      where: { id },
      include: {
        bankaHesabi: true,
        cari: true,
      },
    });

    if (!existingHavale || existingHavale.deletedAt) {
      throw new NotFoundException('Banka havale kaydı bulunamadı');
    }

    // Yeni banka hesabı kontrolü (değiştirildiyse)
    if (
      updateDto.bankaHesabiId &&
      updateDto.bankaHesabiId !== existingHavale.bankaHesabiId
    ) {
      const yeniBankaHesabi = await this.prisma.kasa.findUnique({
        where: { id: updateDto.bankaHesabiId },
      });

      if (!yeniBankaHesabi) {
        throw new NotFoundException('Yeni banka hesabı bulunamadı');
      }

      if (yeniBankaHesabi.kasaTipi !== KasaTipi.BANKA) {
        throw new BadRequestException('Seçilen kasa bir banka hesabı değil');
      }

      if (!yeniBankaHesabi.aktif) {
        throw new BadRequestException('Yeni banka hesabı aktif değil');
      }
    }

    // Yeni cari kontrolü (değiştirildiyse)
    if (updateDto.cariId && updateDto.cariId !== existingHavale.cariId) {
      const yeniCari = await this.prisma.cari.findUnique({
        where: { id: updateDto.cariId },
      });

      if (!yeniCari) {
        throw new NotFoundException('Yeni cari bulunamadı');
      }

      if (!yeniCari.aktif) {
        throw new BadRequestException('Yeni cari hesap aktif değil');
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      // Eski işlemleri geri al
      const eskiBankaId = existingHavale.bankaHesabiId;
      const eskiCariId = existingHavale.cariId;
      const eskiTutar = Number(existingHavale.tutar);
      const eskiHareketTipi = existingHavale.hareketTipi;

      const eskiBanka = await prisma.kasa.findUnique({
        where: { id: eskiBankaId },
      });
      const eskiCari = await prisma.cari.findUnique({
        where: { id: eskiCariId },
      });

      if (!eskiBanka || !eskiCari) {
        throw new NotFoundException('Eski kayıtlar bulunamadı');
      }

      // Eski işlemi geri al - Banka
      const eskiBankaYeniBakiye =
        eskiHareketTipi === HavaleTipi.GELEN
          ? Number(eskiBanka.bakiye) - eskiTutar
          : Number(eskiBanka.bakiye) + eskiTutar;

      await prisma.kasa.update({
        where: { id: eskiBankaId },
        data: { bakiye: eskiBankaYeniBakiye },
      });

      // Eski işlemi geri al - Cari
      const eskiCariYeniBakiye =
        eskiHareketTipi === HavaleTipi.GELEN
          ? Number(eskiCari.bakiye) + eskiTutar
          : Number(eskiCari.bakiye) - eskiTutar;

      await prisma.cari.update({
        where: { id: eskiCariId },
        data: { bakiye: eskiCariYeniBakiye },
      });

      // Yeni değerleri hazırla
      const yeniBankaId = updateDto.bankaHesabiId || eskiBankaId;
      const yeniCariId = updateDto.cariId || eskiCariId;
      const yeniTutar =
        updateDto.tutar !== undefined ? updateDto.tutar : eskiTutar;
      const yeniHareketTipi = updateDto.hareketTipi || eskiHareketTipi;

      const yeniBanka = await prisma.kasa.findUnique({
        where: { id: yeniBankaId },
      });
      const yeniCari = await prisma.cari.findUnique({
        where: { id: yeniCariId },
      });

      if (!yeniBanka || !yeniCari) {
        throw new NotFoundException('Yeni kayıtlar bulunamadı');
      }

      // Yeni işlemi uygula - Banka
      const yeniBankaBakiye =
        yeniHareketTipi === HavaleTipi.GELEN
          ? Number(yeniBanka.bakiye) + yeniTutar
          : Number(yeniBanka.bakiye) - yeniTutar;

      if (yeniHareketTipi === HavaleTipi.GIDEN && yeniBankaBakiye < 0) {
        throw new BadRequestException('Banka hesabında yeterli bakiye yok');
      }

      await prisma.kasa.update({
        where: { id: yeniBankaId },
        data: { bakiye: yeniBankaBakiye },
      });

      // Yeni işlemi uygula - Cari
      const yeniCariBakiye =
        yeniHareketTipi === HavaleTipi.GELEN
          ? Number(yeniCari.bakiye) - yeniTutar
          : Number(yeniCari.bakiye) + yeniTutar;

      await prisma.cari.update({
        where: { id: yeniCariId },
        data: { bakiye: yeniCariBakiye },
      });

      // Havale kaydını güncelle
      const updateData: any = {
        hareketTipi: updateDto.hareketTipi,
        bankaHesabiId: updateDto.bankaHesabiId,
        cariId: updateDto.cariId,
        tutar: yeniTutar,
        aciklama: updateDto.aciklama,
        referansNo: updateDto.referansNo,
        gonderen: updateDto.gonderen,
        alici: updateDto.alici,
        updatedBy: userId,
      };

      // Tarih varsa ve geçerliyse ekle
      if (
        updateDto.tarih &&
        typeof updateDto.tarih === 'string' &&
        updateDto.tarih.trim() !== ''
      ) {
        updateData.tarih = new Date(updateDto.tarih);
      }

      const updatedHavale = await prisma.bankaHavale.update({
        where: { id },
        data: updateData,
        include: {
          bankaHesabi: {
            select: {
              id: true,
              kasaKodu: true,
              kasaAdi: true,
            },
          },
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
          updatedByUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
      });

      // Log kaydı oluştur
      await prisma.bankaHavaleLog.create({
        data: {
          bankaHavaleId: id,
          userId: userId,
          actionType: 'UPDATE',
          changes: JSON.stringify({
            action: 'update',
            before: existingHavale,
            after: updateDto,
          }),
        },
      });

      return updatedHavale;
    });
  }

  async remove(id: string, userId: string, deleteReason?: string) {
    const havale = await this.prisma.bankaHavale.findUnique({
      where: { id },
      include: {
        bankaHesabi: true,
        cari: true,
      },
    });

    if (!havale || havale.deletedAt) {
      throw new NotFoundException('Banka havale kaydı bulunamadı');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Silinen kayıt tablosuna ekle
      await prisma.deletedBankaHavale.create({
        data: {
          originalId: havale.id,
          hareketTipi: havale.hareketTipi,
          bankaHesabiId: havale.bankaHesabiId,
          bankaHesabiAdi: havale.bankaHesabi.kasaAdi,
          cariId: havale.cariId,
          cariUnvan: havale.cari.unvan,
          tutar: havale.tutar,
          tarih: havale.tarih,
          aciklama: havale.aciklama,
          referansNo: havale.referansNo,
          gonderen: havale.gonderen,
          alici: havale.alici,
          originalCreatedBy: havale.createdBy,
          originalUpdatedBy: havale.updatedBy,
          originalCreatedAt: havale.createdAt,
          originalUpdatedAt: havale.updatedAt,
          deletedBy: userId,
          deleteReason: deleteReason,
        },
      });

      // Soft delete
      await prisma.bankaHavale.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      // Banka bakiyesini geri al
      const yeniBankaBakiye =
        havale.hareketTipi === HavaleTipi.GELEN
          ? Number(havale.bankaHesabi.bakiye) - Number(havale.tutar)
          : Number(havale.bankaHesabi.bakiye) + Number(havale.tutar);

      await prisma.kasa.update({
        where: { id: havale.bankaHesabiId },
        data: { bakiye: yeniBankaBakiye },
      });

      // Cari bakiyesini geri al
      const yeniCariBakiye =
        havale.hareketTipi === HavaleTipi.GELEN
          ? Number(havale.cari.bakiye) + Number(havale.tutar)
          : Number(havale.cari.bakiye) - Number(havale.tutar);

      await prisma.cari.update({
        where: { id: havale.cariId },
        data: { bakiye: yeniCariBakiye },
      });

      // Log kaydı oluştur
      await prisma.bankaHavaleLog.create({
        data: {
          bankaHavaleId: id,
          userId: userId,
          actionType: 'DELETE',
          changes: JSON.stringify({
            action: 'delete',
            reason: deleteReason,
            data: havale,
          }),
        },
      });

      return { message: 'Banka havale kaydı başarıyla silindi' };
    });
  }

  // Silinen kayıtları listele
  async findDeleted() {
    return this.prisma.deletedBankaHavale.findMany({
      include: {
        deletedByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });
  }

  // İstatistikler
  async getStats(
    bankaHesabiId?: string,
    baslangicTarihi?: string,
    bitisTarihi?: string,
    hareketTipi?: HavaleTipi,
  ) {
    const where: Prisma.BankaHavaleWhereInput = {
      deletedAt: null,
    };

    if (bankaHesabiId) {
      where.bankaHesabiId = bankaHesabiId;
    }

    if (hareketTipi) {
      where.hareketTipi = hareketTipi;
    }

    if (baslangicTarihi || bitisTarihi) {
      where.tarih = {};
      if (baslangicTarihi) {
        where.tarih.gte = new Date(baslangicTarihi);
      }
      if (bitisTarihi) {
        where.tarih.lte = new Date(bitisTarihi);
      }
    }

    const [gelenHavaleler, gidenHavaleler, toplamKayit] = await Promise.all([
      this.prisma.bankaHavale.aggregate({
        where: { ...where, hareketTipi: HavaleTipi.GELEN },
        _sum: { tutar: true },
        _count: true,
      }),
      this.prisma.bankaHavale.aggregate({
        where: { ...where, hareketTipi: HavaleTipi.GIDEN },
        _sum: { tutar: true },
        _count: true,
      }),
      this.prisma.bankaHavale.count({ where }),
    ]);

    return {
      toplamKayit,
      gelenHavale: {
        adet: gelenHavaleler._count,
        toplam: gelenHavaleler._sum.tutar || 0,
      },
      gidenHavale: {
        adet: gidenHavaleler._count,
        toplam: gidenHavaleler._sum.tutar || 0,
      },
      net:
        Number(gelenHavaleler._sum.tutar || 0) -
        Number(gidenHavaleler._sum.tutar || 0),
    };
  }
}
