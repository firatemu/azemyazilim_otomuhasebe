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
  BankaHareketTipi,
  BankaHareketAltTipi,
  Kasa,
  BankaHesabi,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { CreateBankaHavaleDto } from './dto/create-banka-havale.dto';
import { FilterBankaHavaleDto } from './dto/filter-banka-havale.dto';
import { UpdateBankaHavaleDto } from './dto/update-banka-havale.dto';
import { SystemParameterService } from '../system-parameter/system-parameter.service';

@Injectable()
export class BankaHavaleService {
  constructor(
    private prisma: PrismaService,
    private systemParameterService: SystemParameterService,
  ) { }

  async create(createDto: CreateBankaHavaleDto, userId: string) {
    console.log('[BankaHavaleService] createDto received:', JSON.stringify(createDto, null, 2));
    let bankaHesabiKasa: Kasa | null = null;
    let bankaHesabiYeni: BankaHesabi | null = null;

    // 1. Durum: Eski sistem (Kasa ID ile)
    if (createDto.bankaHesabiId) {
      bankaHesabiKasa = await this.prisma.kasa.findUnique({
        where: { id: createDto.bankaHesabiId },
      });

      if (!bankaHesabiKasa) {
        throw new NotFoundException('Kasa bulunamadı');
      }

      if (bankaHesabiKasa.kasaTipi !== KasaTipi.BANKA) {
        throw new BadRequestException('Seçilen kasa bir banka hesabı değil');
      }

      if (!bankaHesabiKasa.aktif) {
        throw new BadRequestException('Banka hesabı aktif değil');
      }
    }

    // 2. Durum: Yeni sistem (BankaHesabi ID ile)
    if (createDto.bankaHesapId) {
      bankaHesabiYeni = await this.prisma.bankaHesabi.findUnique({
        where: { id: createDto.bankaHesapId },
      });

      if (!bankaHesabiYeni) {
        throw new NotFoundException('Banka hesabı bulunamadı');
      }

      if (!bankaHesabiYeni.aktif) {
        throw new BadRequestException('Banka hesabı aktif değil');
      }
    }

    // En az biri seçili olmalı
    if (!bankaHesabiKasa && !bankaHesabiYeni) {
      throw new BadRequestException('Bir banka hesabı seçilmelidir');
    }

    // Transaction ile işlemleri gerçekleştir
    return this.prisma.$transaction(async (prisma) => {
      // Cari kontrolü
      const cari = await prisma.cari.findUnique({
        where: { id: createDto.cariId },
      });

      if (!cari) {
        throw new NotFoundException('Cari bulunamadı');
      }

      if (!cari.aktif) {
        throw new BadRequestException('Cari hesap aktif değil');
      }

      const tarih = createDto.tarih ? new Date(createDto.tarih) : new Date();

      // Banka havale kaydını oluştur
      const bankaHavale = await prisma.bankaHavale.create({
        data: {
          hareketTipi: createDto.hareketTipi,
          bankaHesabiId: createDto.bankaHesabiId, // Optional olabilir
          bankaHesapId: createDto.bankaHesapId,   // Optional olabilir
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

      const isGelen = createDto.hareketTipi === HavaleTipi.GELEN;

      // 1. Kasa Bakiyesi Güncelleme (Eğer seçildiyse)
      if (bankaHesabiKasa) {
        const yeniBankaBakiye = isGelen
          ? Number(bankaHesabiKasa.bakiye) + createDto.tutar
          : Number(bankaHesabiKasa.bakiye) - createDto.tutar;

        if (!isGelen && yeniBankaBakiye < 0) {
          const negativeBalanceControl = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_BANK_BALANCE_CONTROL', false);
          console.log(`[BankaHavaleService] Kasa check - Bakiye: ${yeniBankaBakiye}, Control: ${negativeBalanceControl}`);
          if (negativeBalanceControl) {
            throw new BadRequestException('Banka hesabında yeterli bakiye yok (Kasa)');
          }
        }

        await prisma.kasa.update({
          where: { id: bankaHesabiKasa.id },
          data: { bakiye: yeniBankaBakiye },
        });

        // Kasa hareket kaydı oluştur
        await prisma.kasaHareket.create({
          data: {
            kasaId: bankaHesabiKasa.id,
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
      }

      // 2. BankaHesabi Bakiyesi Güncelleme (Eğer seçildiyse)
      if (bankaHesabiYeni) {
        const yeniHesapBakiye = isGelen
          ? Number(bankaHesabiYeni.bakiye) + createDto.tutar
          : Number(bankaHesabiYeni.bakiye) - createDto.tutar;

        if (!isGelen && yeniHesapBakiye < 0) {
          const negativeBalanceControl = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_BANK_BALANCE_CONTROL', false);
          console.log(`[BankaHavaleService] BankaHesap check - Bakiye: ${yeniHesapBakiye}, Control: ${negativeBalanceControl}`);
          if (negativeBalanceControl) {
            throw new BadRequestException('Banka hesabında yeterli bakiye yok (Banka Hesabı)');
          }
        }

        await prisma.bankaHesabi.update({
          where: { id: bankaHesabiYeni.id },
          data: { bakiye: yeniHesapBakiye },
        });

        // BankaHesapHareket kaydı oluştur
        await prisma.bankaHesapHareket.create({
          data: {
            hesapId: bankaHesabiYeni.id,
            hareketTipi: isGelen ? BankaHareketTipi.GELEN : BankaHareketTipi.GIDEN,
            hareketAltTipi: isGelen ? BankaHareketAltTipi.HAVALE_GELEN : BankaHareketAltTipi.HAVALE_GIDEN,
            tutar: createDto.tutar,
            netTutar: createDto.tutar,
            bakiye: yeniHesapBakiye,
            aciklama: createDto.aciklama || `${isGelen ? 'Gelen' : 'Giden'} Havale`,
            referansNo: createDto.referansNo,
            cariId: createDto.cariId,
            tarih: tarih,
          },
        });
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
            `${isGelen ? 'Gelen' : 'Giden'} Havale - ${bankaHesabiKasa ? bankaHesabiKasa.kasaAdi : (bankaHesabiYeni ? bankaHesabiYeni.hesapAdi : '')}`,
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
        bankaHesap: {
          select: {
            id: true,
            hesapKodu: true,
            hesapAdi: true,
            banka: {
              select: {
                ad: true,
                logo: true,
              },
            },
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
        bankaHesap: {
          select: {
            id: true,
            hesapKodu: true,
            hesapAdi: true,
            banka: {
              select: {
                ad: true,
                logo: true,
              },
            },
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
        bankaHesabi: true, // Kasa
        bankaHesap: true, // BankaHesabi
      },
    });

    if (!existingHavale) {
      throw new NotFoundException('Banka havale kaydı bulunamadı');
    }

    // 1. Yeni girilen (veya eski) Banka/Kasa kontrolü
    let yeniKasa: Kasa | null = null;
    let yeniBankaHesap: BankaHesabi | null = null;

    // Eğer updateDto'da yeni bir ID varsa onu kullan, yoksa eskisine bak
    // Not: DTO'da bankaHesabiId veya bankaHesapId gönderilmemişse, eski kayıttakini baz alacağız.
    // Ancak mekanizma karışık olabilir: Kullanıcı bankaHesabiId gönderdiyse, bankaHesapId null mu kabul edilmeli?
    // Basitlik adina: DTO'da hangisi varsa veya eskisi neyse onu bulalım.

    const targetKasaId = updateDto.bankaHesabiId !== undefined ? updateDto.bankaHesabiId : existingHavale.bankaHesabiId;
    const targetBankaHesapId = updateDto.bankaHesapId !== undefined ? updateDto.bankaHesapId : existingHavale.bankaHesapId;

    if (targetKasaId) {
      yeniKasa = await this.prisma.kasa.findUnique({ where: { id: targetKasaId } });
      if (!yeniKasa || !yeniKasa.aktif || yeniKasa.kasaTipi !== KasaTipi.BANKA) {
        // Eğer updateDto ile geldiyse hata fırlat, eskisi ise ve pasifse belki işlem yapmayabiliriz ama genelde hata fırlatılır.
        if (updateDto.bankaHesabiId) throw new BadRequestException('Geçersiz veya pasif kasa');
      }
    }

    if (targetBankaHesapId) {
      yeniBankaHesap = await this.prisma.bankaHesabi.findUnique({ where: { id: targetBankaHesapId } });
      if (!yeniBankaHesap || !yeniBankaHesap.aktif) {
        if (updateDto.bankaHesapId) throw new BadRequestException('Geçersiz veya pasif banka hesabı');
      }
    }

    // 2. Yeni Cari Kontrolü
    const targetCariId = updateDto.cariId || existingHavale.cariId;
    const yeniCari = await this.prisma.cari.findUnique({ where: { id: targetCariId } });
    if (!yeniCari || !yeniCari.aktif) {
      throw new BadRequestException('Geçersiz veya pasif cari');
    }

    return this.prisma.$transaction(async (prisma) => {
      // A. ESKİ BAKİYELERİ GERİ AL
      const eskiTutar = Number(existingHavale.tutar);
      const eskiHareketTipi = existingHavale.hareketTipi;

      // A1. Eski Kasa Bakiyesi Geri Al
      if (existingHavale.bankaHesabiId && existingHavale.bankaHesabi) {
        const eskiKasa = existingHavale.bankaHesabi;
        const revertKasaBakiye = eskiHareketTipi === HavaleTipi.GELEN
          ? Number(eskiKasa.bakiye) - eskiTutar
          : Number(eskiKasa.bakiye) + eskiTutar;

        await prisma.kasa.update({
          where: { id: existingHavale.bankaHesabiId },
          data: { bakiye: revertKasaBakiye }
        });
      }

      // A2. Eski BankaHesap Bakiyesi Geri Al
      if (existingHavale.bankaHesapId && existingHavale.bankaHesap) {
        const eskiHesap = existingHavale.bankaHesap;
        const revertHesapBakiye = eskiHareketTipi === HavaleTipi.GELEN
          ? Number(eskiHesap.bakiye) - eskiTutar
          : Number(eskiHesap.bakiye) + eskiTutar;

        await prisma.bankaHesabi.update({
          where: { id: existingHavale.bankaHesapId },
          data: { bakiye: revertHesapBakiye }
        });
      }

      // A3. Eski Cari Bakiyesi Geri Al
      // Eski cari bilgisini findUnique ile taze çekmek daha güvenli olabilir ama
      // existingHavale üzerinden gelen cari ID ile işlem yapacağız. 
      // Ancak transaction içinde bakiye güncellemeleri için "anlık" veri okumalıyız.
      const guncelEskiCari = await prisma.cari.findUnique({ where: { id: existingHavale.cariId } });
      if (guncelEskiCari) {
        const revertCariBakiye = eskiHareketTipi === HavaleTipi.GELEN
          ? Number(guncelEskiCari.bakiye) + eskiTutar
          : Number(guncelEskiCari.bakiye) - eskiTutar;

        await prisma.cari.update({
          where: { id: existingHavale.cariId },
          data: { bakiye: revertCariBakiye }
        });
      }

      // B. YENİ BAKİYELERİ UYGULA
      // Burada "yeniKasa", "yeniBankaHesap", "yeniCari" nesnelerini tazeledik mi? 
      // Transaction başında okumuştuk (if (targetKasaId)...), ancak bakiyeler değişmiş olabilir (özellikle aynı hesapsa).
      // En doğrusu: Revert işleminden sonra "taze" hallerini tekrar okumak veya revert bakiyelerini baz almak.
      // Revert işleminden sonra tekrar okumak en garantisi.

      const tazeYeniTutar = updateDto.tutar !== undefined ? updateDto.tutar : eskiTutar;
      const tazeHareketTipi = updateDto.hareketTipi || eskiHareketTipi;

      // B1. Kasa Güncelle (Varsa)
      if (targetKasaId) {
        const tazeKasa = await prisma.kasa.findUnique({ where: { id: targetKasaId } });
        if (tazeKasa) {
          const updateKasaBakiye = tazeHareketTipi === HavaleTipi.GELEN
            ? Number(tazeKasa.bakiye) + tazeYeniTutar
            : Number(tazeKasa.bakiye) - tazeYeniTutar;

          if (tazeHareketTipi === HavaleTipi.GIDEN && updateKasaBakiye < 0) {
            const negativeBalanceControl = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_BANK_BALANCE_CONTROL', false);
            if (negativeBalanceControl) {
              throw new BadRequestException('Kasa bakiyesi yetersiz');
            }
          }

          await prisma.kasa.update({
            where: { id: targetKasaId },
            data: { bakiye: updateKasaBakiye }
          });
        }
      }

      // B2. BankaHesap Güncelle (Varsa)
      if (targetBankaHesapId) {
        const tazeHesap = await prisma.bankaHesabi.findUnique({ where: { id: targetBankaHesapId } });
        if (tazeHesap) {
          const updateHesapBakiye = tazeHareketTipi === HavaleTipi.GELEN
            ? Number(tazeHesap.bakiye) + tazeYeniTutar
            : Number(tazeHesap.bakiye) - tazeYeniTutar;

          if (tazeHareketTipi === HavaleTipi.GIDEN && updateHesapBakiye < 0) {
            const negativeBalanceControl = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_BANK_BALANCE_CONTROL', false);
            if (negativeBalanceControl) {
              throw new BadRequestException('Banka hesap bakiyesi yetersiz');
            }
          }

          await prisma.bankaHesabi.update({
            where: { id: targetBankaHesapId },
            data: { bakiye: updateHesapBakiye }
          });
        }
      }

      // B3. Cari Güncelle
      const tazeCari = await prisma.cari.findUnique({ where: { id: targetCariId } });
      if (tazeCari) {
        const updateCariBakiye = tazeHareketTipi === HavaleTipi.GELEN
          ? Number(tazeCari.bakiye) - tazeYeniTutar
          : Number(tazeCari.bakiye) + tazeYeniTutar;

        await prisma.cari.update({
          where: { id: targetCariId },
          data: { bakiye: updateCariBakiye }
        });
      }

      // C. HAVALE KAYDINI GÜNCELLE
      const updateData: any = {
        hareketTipi: tazeHareketTipi,
        bankaHesabiId: targetKasaId || null,
        bankaHesapId: targetBankaHesapId || null,
        cariId: targetCariId,
        tutar: tazeYeniTutar,
        aciklama: updateDto.aciklama,
        referansNo: updateDto.referansNo,
        gonderen: updateDto.gonderen,
        alici: updateDto.alici,
        updatedBy: userId,
      };

      if (updateDto.tarih) {
        updateData.tarih = new Date(updateDto.tarih);
      }

      const updatedHavale = await prisma.bankaHavale.update({
        where: { id },
        data: updateData,
        include: {
          bankaHesabi: { select: { id: true, kasaKodu: true, kasaAdi: true } },
          bankaHesap: { select: { id: true, hesapAdi: true, hesapNo: true, iban: true } },
          cari: { select: { id: true, cariKodu: true, unvan: true } },
          createdByUser: { select: { id: true, fullName: true, username: true } },
          updatedByUser: { select: { id: true, fullName: true, username: true } },
        },
      });

      // Log
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
        bankaHesap: true,
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
          bankaHesabiId: havale.bankaHesabiId ?? havale.bankaHesapId ?? '',
          bankaHesabiAdi: havale.bankaHesabi?.kasaAdi ?? havale.bankaHesap?.hesapAdi ?? 'Bilinmiyor',
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

      // Banka bakiyesini geri al (Kasa)
      if (havale.bankaHesabiId && havale.bankaHesabi) {
        const yeniBankaBakiye =
          havale.hareketTipi === HavaleTipi.GELEN
            ? Number(havale.bankaHesabi.bakiye) - Number(havale.tutar)
            : Number(havale.bankaHesabi.bakiye) + Number(havale.tutar);

        await prisma.kasa.update({
          where: { id: havale.bankaHesabiId },
          data: { bakiye: yeniBankaBakiye },
        });
      }

      // Banka bakiyesini geri al (BankaHesabi)
      if (havale.bankaHesapId && havale.bankaHesap) {
        const yeniBankaBakiye =
          havale.hareketTipi === HavaleTipi.GELEN
            ? Number(havale.bankaHesap.bakiye) - Number(havale.tutar)
            : Number(havale.bankaHesap.bakiye) + Number(havale.tutar);

        await prisma.bankaHesabi.update({
          where: { id: havale.bankaHesapId },
          data: { bakiye: yeniBankaBakiye },
        });
      }

      // Cari bakiyesini geri al
      const guncelCari = await prisma.cari.findUnique({
        where: { id: havale.cariId },
      });
      if (!guncelCari) throw new NotFoundException('Cari bulunamadı');

      const yeniCariBakiye =
        havale.hareketTipi === HavaleTipi.GELEN
          ? Number(guncelCari.bakiye) + Number(havale.tutar)
          : Number(guncelCari.bakiye) - Number(havale.tutar);

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
      where.OR = [
        { bankaHesabiId: bankaHesabiId },
        { bankaHesapId: bankaHesabiId },
      ];
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
