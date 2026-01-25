import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateCekSenetDto } from './dto/create-cek-senet.dto';
import { UpdateCekSenetDto } from './dto/update-cek-senet.dto';
import { FilterCekSenetDto } from './dto/filter-cek-senet.dto';
import { TahsilCekSenetDto } from './dto/tahsil-cek-senet.dto';
import { CiroCekSenetDto } from './dto/ciro-cek-senet.dto';
import {
  CekSenetTip,
  PortfoyTip,
  CekSenetDurum,
  Prisma,
  BelgeTipi,
  BorcAlacak,
  KasaTipi,
  KasaHareketTipi,
} from '@prisma/client';

@Injectable()
export class CekSenetService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) {}

  async create(createDto: CreateCekSenetDto, userId: string) {
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

    // Kasa kontrolü
    const kasa = await this.prisma.kasa.findUnique({
      where: { id: createDto.kasaId },
    });

    if (!kasa) {
      throw new NotFoundException('Çek/Senet kasası bulunamadı');
    }

    if (!kasa.aktif) {
      throw new BadRequestException('Çek/Senet kasası aktif değil');
    }

    if (kasa.kasaTipi !== KasaTipi.CEK_SENET) {
      throw new BadRequestException('Seçilen kasa Çek/Senet kasası değil');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Portföy tipine göre durum belirle
      let durum: CekSenetDurum;
      if (createDto.durum) {
        // Manuel olarak durum belirtildiyse onu kullan
        durum = createDto.durum;
      } else if (createDto.portfoyTip === 'BORC') {
        // ✅ Verilen çek/senet = ödenmedi (henüz ödemedik)
        durum = CekSenetDurum.ODENMEDI;
      } else {
        // ✅ Alınan çek/senet = portföyde (tahsil etmedik)
        durum = CekSenetDurum.PORTFOYDE;
      }

      const tenantId = await this.tenantResolver.resolveForCreate({
        userId,
        allowNull: true,
      });
      const finalTenantId = (createDto as any).tenantId ?? tenantId ?? undefined;

      const cekSenet = await prisma.cekSenet.create({
        data: {
          tip: createDto.tip,
          portfoyTip: createDto.portfoyTip,
          cariId: createDto.cariId,
          tutar: createDto.tutar,
          vade: new Date(createDto.vade),
          banka: createDto.banka,
          sube: createDto.sube,
          hesapNo: createDto.hesapNo,
          cekNo: createDto.cekNo,
          seriNo: createDto.seriNo,
          durum: durum,
          aciklama: createDto.aciklama,
          createdBy: userId,
          ...(finalTenantId != null && { tenantId: finalTenantId }),
        },
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
      });

      // Cari bakiyesini güncelle
      const yeniCariBakiye =
        createDto.portfoyTip === PortfoyTip.ALACAK
          ? Number(cari.bakiye) + createDto.tutar // Müşteriden aldık -> alacağımız arttı
          : Number(cari.bakiye) - createDto.tutar; // Tedarikçiye verdik -> borcumuz arttı (bakiye azaldı)

      await prisma.cari.update({
        where: { id: createDto.cariId },
        data: { bakiye: yeniCariBakiye },
      });

      // Cari hareket kaydı oluştur
      await prisma.cariHareket.create({
        data: {
          cariId: createDto.cariId,
          tip:
            createDto.portfoyTip === PortfoyTip.ALACAK
              ? BorcAlacak.ALACAK
              : BorcAlacak.BORC,
          tutar: createDto.tutar,
          bakiye: yeniCariBakiye,
          belgeTipi: BelgeTipi.TAHSILAT,
          belgeNo: createDto.cekNo || createDto.seriNo,
          tarih: new Date(createDto.vade),
          aciklama: `${createDto.tip === CekSenetTip.CEK ? 'Çek' : 'Senet'} - ${createDto.aciklama || ''}`,
        },
      });

      // Çek/Senet Kasası bakiyesini güncelle ve hareket kaydı oluştur
      const yeniKasaBakiye =
        createDto.portfoyTip === PortfoyTip.ALACAK
          ? Number(kasa.bakiye) + createDto.tutar // Müşteriden aldık -> kasa artar
          : Number(kasa.bakiye) - createDto.tutar; // Tedarikçiye verdik -> kasa azalır

      await prisma.kasa.update({
        where: { id: createDto.kasaId },
        data: { bakiye: yeniKasaBakiye },
      });

      // Kasa hareket tipi belirleme
      let kasaHareketTipi: KasaHareketTipi;
      if (createDto.tip === CekSenetTip.CEK) {
        kasaHareketTipi =
          createDto.portfoyTip === PortfoyTip.ALACAK
            ? KasaHareketTipi.CEK_ALINDI
            : KasaHareketTipi.CEK_VERILDI;
      } else {
        kasaHareketTipi =
          createDto.portfoyTip === PortfoyTip.ALACAK
            ? KasaHareketTipi.SENET_ALINDI
            : KasaHareketTipi.SENET_VERILDI;
      }

      await prisma.kasaHareket.create({
        data: {
          kasaId: createDto.kasaId,
          hareketTipi: kasaHareketTipi,
          tutar: createDto.tutar,
          bakiye: yeniKasaBakiye,
          belgeTipi: createDto.tip === CekSenetTip.CEK ? 'CEK' : 'SENET',
          belgeNo: createDto.cekNo || createDto.seriNo,
          cariId: createDto.cariId,
          aciklama: `${createDto.tip === CekSenetTip.CEK ? 'Çek' : 'Senet'} ${createDto.portfoyTip === PortfoyTip.ALACAK ? 'Alındı' : 'Verildi'} - ${cari.unvan}`,
          tarih: new Date(),
          createdBy: userId,
        },
      });

      // Log kaydı
      await prisma.cekSenetLog.create({
        data: {
          cekSenetId: cekSenet.id,
          userId: userId,
          actionType: 'CREATE',
          changes: JSON.stringify({ action: 'create', data: createDto }),
        },
      });

      return cekSenet;
    });
  }

  async findAll(filterDto?: FilterCekSenetDto) {
    try {
      const tenantId = await this.tenantResolver.resolveForQuery();
      const where: Prisma.CekSenetWhereInput = {
        deletedAt: null,
        ...buildTenantWhereClause(tenantId ?? undefined),
      };

      if (filterDto?.tip) {
        where.tip = filterDto.tip;
      }

      if (filterDto?.portfoyTip) {
        where.portfoyTip = filterDto.portfoyTip;
      }

      if (filterDto?.durum) {
        where.durum = filterDto.durum;
      }

      if (filterDto?.cariId) {
        where.cariId = filterDto.cariId;
      }

      if (filterDto?.cekNo) {
        where.cekNo = {
          contains: filterDto.cekNo,
          mode: 'insensitive',
        };
      }

      if (filterDto?.seriNo) {
        where.seriNo = {
          contains: filterDto.seriNo,
          mode: 'insensitive',
        };
      }

      if (filterDto?.vadeBaslangic || filterDto?.vadeBitis) {
        const vadeFilter: Prisma.DateTimeFilter = {};
        if (filterDto.vadeBaslangic) {
          // Başlangıç tarihinin günün başı (UTC-3 için 21:00 önceki gün)
          const baslangic = new Date(filterDto.vadeBaslangic);
          baslangic.setUTCHours(0, 0, 0, 0);
          baslangic.setUTCHours(baslangic.getUTCHours() - 3); // Istanbul UTC+3
          vadeFilter.gte = baslangic;
          console.log('  📅 Vade başlangıç:', baslangic.toISOString());
        }
        if (filterDto.vadeBitis) {
          // Bitiş tarihinin günün sonu (UTC-3 için 20:59:59.999 aynı gün)
          const bitis = new Date(filterDto.vadeBitis);
          bitis.setUTCHours(23, 59, 59, 999);
          bitis.setUTCHours(bitis.getUTCHours() - 3); // Istanbul UTC+3
          vadeFilter.lte = bitis;
          console.log('  📅 Vade bitiş:', bitis.toISOString());
        }
        where.vade = vadeFilter;
      }

      // JSON.stringify Date nesnelerini serialize edemediği için dikkatli loglama
      const whereLog: any = { ...where };
      if (where.vade && typeof where.vade === 'object' && 'gte' in where.vade) {
        const vadeFilter = where.vade as Prisma.DateTimeFilter;
        whereLog.vade = {
          gte:
            vadeFilter.gte instanceof Date
              ? vadeFilter.gte.toISOString()
              : vadeFilter.gte,
          lte:
            vadeFilter.lte instanceof Date
              ? vadeFilter.lte.toISOString()
              : vadeFilter.lte,
        };
      }
      console.log('  🔎 Where condition:', JSON.stringify(whereLog, null, 2));

      const result = await this.prisma.cekSenet.findMany({
        where,
        include: {
          cari: {
            select: {
              id: true,
              cariKodu: true,
              unvan: true,
              telefon: true,
            },
          },
          tahsilKasa: {
            select: {
              id: true,
              kasaKodu: true,
              kasaAdi: true,
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
        orderBy: { vade: 'asc' },
      });

      console.log('  ✅ Sonuç:', result.length, 'adet çek/senet bulundu');

      // Decimal alanları Number'a dönüştür
      const formattedResult = result.map((cek) => ({
        ...cek,
        tutar: Number(cek.tutar),
      }));

      console.log(
        '  📤 Response sample:',
        formattedResult.length > 0
          ? {
              id: formattedResult[0].id,
              tip: formattedResult[0].tip,
              tutar: formattedResult[0].tutar,
              tutarType: typeof formattedResult[0].tutar,
            }
          : 'empty',
      );

      return formattedResult;
    } catch (error) {
      console.error('❌ [CekSenet Service] findAll hatası:', error);
      console.error('❌ [CekSenet Service] Hata stack:', error?.stack);
      throw error;
    }
  }

  async findOne(id: string) {
    const cekSenet = await this.prisma.cekSenet.findUnique({
      where: { id },
      include: {
        cari: true,
        tahsilKasa: true,
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

    if (!cekSenet || cekSenet.deletedAt) {
      throw new NotFoundException('Çek/Senet kaydı bulunamadı');
    }

    return cekSenet;
  }

  async update(id: string, updateDto: UpdateCekSenetDto, userId: string) {
    const existing = await this.prisma.cekSenet.findUnique({
      where: { id },
      include: { cari: true },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Çek/Senet kaydı bulunamadı');
    }

    // Tahsil edilmiş veya ödenmiş kayıtlar güncellenemez
    if (
      existing.durum === CekSenetDurum.TAHSIL_EDILDI ||
      existing.durum === CekSenetDurum.ODENDI
    ) {
      throw new BadRequestException(
        'Tahsil edilmiş veya ödenmiş çek/senet güncellenemez',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // Eski işlemi geri al
      const eskiTutar = Number(existing.tutar);
      const yeniTutar =
        updateDto.tutar !== undefined ? updateDto.tutar : eskiTutar;

      // Cari bakiyesini düzelt
      const eskiCari = existing.cari;
      const cariBakiyeDuzeltme =
        existing.portfoyTip === PortfoyTip.ALACAK
          ? -eskiTutar // Eski alacağı geri al
          : eskiTutar; // Eski borcu geri al

      const yeniCariBakiye =
        existing.portfoyTip === PortfoyTip.ALACAK
          ? Number(eskiCari.bakiye) + cariBakiyeDuzeltme + yeniTutar
          : Number(eskiCari.bakiye) + cariBakiyeDuzeltme - yeniTutar;

      await prisma.cari.update({
        where: { id: existing.cariId },
        data: { bakiye: yeniCariBakiye },
      });

      // Çek/Senet güncelle
      const updateData: any = { ...updateDto, updatedBy: userId };
      if (updateDto.vade) {
        updateData.vade = new Date(updateDto.vade);
      }

      const updated = await prisma.cekSenet.update({
        where: { id },
        data: updateData,
        include: {
          cari: true,
          createdByUser: {
            select: { id: true, fullName: true, username: true },
          },
          updatedByUser: {
            select: { id: true, fullName: true, username: true },
          },
        },
      });

      // Log
      await prisma.cekSenetLog.create({
        data: {
          cekSenetId: id,
          userId: userId,
          actionType: 'UPDATE',
          changes: JSON.stringify({
            action: 'update',
            before: existing,
            after: updateDto,
          }),
        },
      });

      return updated;
    });
  }

  async remove(id: string, userId: string, deleteReason?: string) {
    const cekSenet = await this.prisma.cekSenet.findUnique({
      where: { id },
      include: { cari: true, tahsilKasa: true },
    });

    if (!cekSenet || cekSenet.deletedAt) {
      throw new NotFoundException('Çek/Senet kaydı bulunamadı');
    }

    // Tahsil edilmiş kayıtlar silinemez
    if (
      cekSenet.durum === CekSenetDurum.TAHSIL_EDILDI ||
      cekSenet.durum === CekSenetDurum.ODENDI
    ) {
      throw new BadRequestException(
        'Tahsil edilmiş veya ödenmiş çek/senet silinemez',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // Silinen kayıt tablosuna ekle
      await prisma.deletedCekSenet.create({
        data: {
          originalId: cekSenet.id,
          tip: cekSenet.tip,
          portfoyTip: cekSenet.portfoyTip,
          cariId: cekSenet.cariId,
          cariUnvan: cekSenet.cari.unvan,
          tutar: cekSenet.tutar,
          vade: cekSenet.vade,
          banka: cekSenet.banka,
          sube: cekSenet.sube,
          hesapNo: cekSenet.hesapNo,
          cekNo: cekSenet.cekNo,
          seriNo: cekSenet.seriNo,
          durum: cekSenet.durum || CekSenetDurum.PORTFOYDE,
          tahsilTarihi: cekSenet.tahsilTarihi,
          tahsilKasaId: cekSenet.tahsilKasaId,
          ciroEdildi: cekSenet.ciroEdildi,
          ciroTarihi: cekSenet.ciroTarihi,
          ciroEdilen: cekSenet.ciroEdilen,
          aciklama: cekSenet.aciklama,
          originalCreatedBy: cekSenet.createdBy,
          originalUpdatedBy: cekSenet.updatedBy,
          originalCreatedAt: cekSenet.createdAt,
          originalUpdatedAt: cekSenet.updatedAt,
          deletedBy: userId,
          deleteReason: deleteReason,
        },
      });

      // Soft delete
      await prisma.cekSenet.update({
        where: { id },
        data: { deletedAt: new Date(), deletedBy: userId },
      });

      // Cari bakiyesini geri al
      const yeniCariBakiye =
        cekSenet.portfoyTip === PortfoyTip.ALACAK
          ? Number(cekSenet.cari.bakiye) - Number(cekSenet.tutar)
          : Number(cekSenet.cari.bakiye) + Number(cekSenet.tutar);

      await prisma.cari.update({
        where: { id: cekSenet.cariId },
        data: { bakiye: yeniCariBakiye },
      });

      // Log
      await prisma.cekSenetLog.create({
        data: {
          cekSenetId: id,
          userId: userId,
          actionType: 'DELETE',
          changes: JSON.stringify({
            action: 'delete',
            reason: deleteReason,
            data: cekSenet,
          }),
        },
      });

      return { message: 'Çek/Senet kaydı başarıyla silindi' };
    });
  }

  // Çek/Senet tahsil et
  async tahsilEt(id: string, tahsilDto: TahsilCekSenetDto, userId: string) {
    const cekSenet = await this.prisma.cekSenet.findUnique({
      where: { id },
      include: { cari: true },
    });

    if (!cekSenet || cekSenet.deletedAt) {
      throw new NotFoundException('Çek/Senet kaydı bulunamadı');
    }

    if (
      cekSenet.durum !== CekSenetDurum.PORTFOYDE &&
      cekSenet.durum !== CekSenetDurum.BANKAYA_VERILDI
    ) {
      throw new BadRequestException(
        'Sadece portföydeki veya bankaya verilmiş çek/senet tahsil edilebilir',
      );
    }

    // Tahsil kasası kontrolü (nakit veya banka)
    const tahsilKasa = await this.prisma.kasa.findUnique({
      where: { id: tahsilDto.kasaId },
    });

    if (!tahsilKasa || !tahsilKasa.aktif) {
      throw new NotFoundException('Geçerli bir tahsil kasası bulunamadı');
    }

    // Çek/Senet kasasını bul (orijinal çek/senet kasasından çıkmalı)
    const cekSenetKasalar = await this.prisma.kasa.findMany({
      where: {
        kasaTipi: KasaTipi.CEK_SENET,
        aktif: true,
      },
    });

    if (cekSenetKasalar.length === 0) {
      throw new NotFoundException('Aktif Çek/Senet kasası bulunamadı');
    }

    const cekSenetKasa = cekSenetKasalar[0]; // İlk aktif çek/senet kasasını kullan

    return this.prisma.$transaction(async (prisma) => {
      const tahsilTarihi = tahsilDto.tahsilTarihi
        ? new Date(tahsilDto.tahsilTarihi)
        : new Date();

      // Çek/Senet durumunu güncelle
      await prisma.cekSenet.update({
        where: { id },
        data: {
          durum:
            cekSenet.portfoyTip === PortfoyTip.ALACAK
              ? CekSenetDurum.TAHSIL_EDILDI
              : CekSenetDurum.ODENDI,
          tahsilTarihi: tahsilTarihi,
          tahsilKasaId: tahsilDto.kasaId,
          updatedBy: userId,
        },
      });

      // 1. Çek/Senet Kasası'ndan çıkar
      const yeniCekSenetKasaBakiye =
        cekSenet.portfoyTip === PortfoyTip.ALACAK
          ? Number(cekSenetKasa.bakiye) - Number(cekSenet.tutar) // Alacak tahsil edilince çek kasasından çıkar
          : Number(cekSenetKasa.bakiye) + Number(cekSenet.tutar); // Borç ödeme yapılınca çek kasasına geri girer (çıkmış borç geri dönüyor)

      await prisma.kasa.update({
        where: { id: cekSenetKasa.id },
        data: { bakiye: yeniCekSenetKasaBakiye },
      });

      await prisma.kasaHareket.create({
        data: {
          kasaId: cekSenetKasa.id,
          hareketTipi:
            cekSenet.tip === CekSenetTip.CEK
              ? KasaHareketTipi.CEK_TAHSIL
              : KasaHareketTipi.SENET_TAHSIL,
          tutar: Number(cekSenet.tutar),
          bakiye: yeniCekSenetKasaBakiye,
          belgeTipi: cekSenet.tip === CekSenetTip.CEK ? 'CEK' : 'SENET',
          belgeNo: cekSenet.cekNo || cekSenet.seriNo,
          cariId: cekSenet.cariId,
          aciklama: `${cekSenet.tip === CekSenetTip.CEK ? 'Çek' : 'Senet'} Tahsil Edildi - ${cekSenet.cari.unvan}`,
          tarih: tahsilTarihi,
          createdBy: userId,
        },
      });

      // 2. Tahsil Kasası'na gir (sadece alacak tahsilatında)
      if (cekSenet.portfoyTip === PortfoyTip.ALACAK) {
        const yeniTahsilKasaBakiye =
          Number(tahsilKasa.bakiye) + Number(cekSenet.tutar);

        await prisma.kasa.update({
          where: { id: tahsilDto.kasaId },
          data: { bakiye: yeniTahsilKasaBakiye },
        });

        // Tahsil kasası için hareket tipi belirleme
        let tahsilHareketTipi: KasaHareketTipi = KasaHareketTipi.TAHSILAT;
        if (tahsilKasa.kasaTipi === KasaTipi.BANKA) {
          tahsilHareketTipi = KasaHareketTipi.HAVALE_GELEN;
        }

        await prisma.kasaHareket.create({
          data: {
            kasaId: tahsilDto.kasaId,
            hareketTipi: tahsilHareketTipi,
            tutar: Number(cekSenet.tutar),
            bakiye: yeniTahsilKasaBakiye,
            belgeTipi:
              cekSenet.tip === CekSenetTip.CEK
                ? 'CEK_TAHSILAT'
                : 'SENET_TAHSILAT',
            belgeNo: cekSenet.cekNo || cekSenet.seriNo,
            cariId: cekSenet.cariId,
            aciklama: `${cekSenet.tip === CekSenetTip.CEK ? 'Çek' : 'Senet'} Tahsil Edildi - ${cekSenet.cari.unvan}`,
            tarih: tahsilTarihi,
            createdBy: userId,
          },
        });
      }

      // Log
      await prisma.cekSenetLog.create({
        data: {
          cekSenetId: id,
          userId: userId,
          actionType: 'UPDATE',
          changes: JSON.stringify({ action: 'tahsil', data: tahsilDto }),
        },
      });

      return { message: 'Çek/Senet başarıyla tahsil edildi' };
    });
  }

  // Çek/Senet ciro et
  async ciroEt(id: string, ciroDto: CiroCekSenetDto, userId: string) {
    const cekSenet = await this.prisma.cekSenet.findUnique({
      where: { id },
      include: {
        cari: { select: { unvan: true } },
      },
    });

    if (!cekSenet || cekSenet.deletedAt) {
      throw new NotFoundException('Çek/Senet kaydı bulunamadı');
    }

    if (cekSenet.durum !== CekSenetDurum.PORTFOYDE) {
      throw new BadRequestException(
        'Sadece portföydeki çek/senet ciro edilebilir',
      );
    }

    if (cekSenet.portfoyTip !== PortfoyTip.ALACAK) {
      throw new BadRequestException('Sadece alacak çek/senet ciro edilebilir');
    }

    // Ciro edilecek cariyi kontrol et
    const ciroEdilecekCari = await this.prisma.cari.findUnique({
      where: { id: ciroDto.ciroEdilen },
    });

    if (!ciroEdilecekCari) {
      throw new NotFoundException('Ciro edilecek cari bulunamadı');
    }

    return this.prisma.$transaction(async (prisma) => {
      const ciroTarihi = ciroDto.ciroTarihi
        ? new Date(ciroDto.ciroTarihi)
        : new Date();

      // 1. Çek/Senet durumunu güncelle
      await prisma.cekSenet.update({
        where: { id },
        data: {
          durum: CekSenetDurum.CIRO_EDILDI,
          ciroEdildi: true,
          ciroTarihi: ciroTarihi,
          ciroEdilen: ciroDto.ciroEdilen,
          updatedBy: userId,
        },
      });

      // 2. Eski carinin bakiyesini hesapla
      const eskiCari = await prisma.cari.findUnique({
        where: { id: cekSenet.cariId },
      });
      if (!eskiCari) {
        throw new NotFoundException('Eski cari bulunamadı');
      }
      const eskiCariBakiye =
        eskiCari.bakiye.toNumber() - cekSenet.tutar.toNumber(); // ALACAK azalır

      // Eski cariye (çeki veren) alacak kaydı - tahsil edildi sayılır
      await prisma.cariHareket.create({
        data: {
          cariId: cekSenet.cariId,
          tarih: ciroTarihi,
          tip: BorcAlacak.ALACAK, // Bizim alacağımız tahsil edildi
          tutar: cekSenet.tutar,
          bakiye: eskiCariBakiye,
          aciklama: `${cekSenet.tip} ciro edildi - ${ciroEdilecekCari.unvan} adına`,
          belgeNo: cekSenet.cekNo || cekSenet.seriNo || '-',
          belgeTipi: BelgeTipi.CEK_SENET,
        },
      });

      // Eski carinin bakiyesini güncelle
      await prisma.cari.update({
        where: { id: cekSenet.cariId },
        data: { bakiye: eskiCariBakiye },
      });

      // 3. Yeni carinin bakiyesini hesapla
      const yeniCari = await prisma.cari.findUnique({
        where: { id: ciroDto.ciroEdilen },
      });
      if (!yeniCari) {
        throw new NotFoundException('Ciro edilecek cari bulunamadı');
      }
      const yeniCariBakiye =
        yeniCari.bakiye.toNumber() + cekSenet.tutar.toNumber(); // BORC artar

      // Yeni cariye (ciro edilen) borç kaydı - ona ödeme yaptık
      await prisma.cariHareket.create({
        data: {
          cariId: ciroDto.ciroEdilen,
          tarih: ciroTarihi,
          tip: BorcAlacak.BORC, // Ona ödeme yaptık
          tutar: cekSenet.tutar,
          bakiye: yeniCariBakiye,
          aciklama: `${cekSenet.cari.unvan} adına gelen ${cekSenet.tip} ciro alındı`,
          belgeNo: cekSenet.cekNo || cekSenet.seriNo || '-',
          belgeTipi: BelgeTipi.CEK_SENET,
        },
      });

      // Yeni carinin bakiyesini güncelle
      await prisma.cari.update({
        where: { id: ciroDto.ciroEdilen },
        data: { bakiye: yeniCariBakiye },
      });

      // 4. Log
      await prisma.cekSenetLog.create({
        data: {
          cekSenetId: id,
          userId: userId,
          actionType: 'UPDATE',
          changes: JSON.stringify({
            action: 'ciro',
            ciroEdilen: ciroEdilecekCari.unvan,
            ciroEdilecekCariId: ciroDto.ciroEdilen,
            tutar: cekSenet.tutar,
            data: ciroDto,
          }),
        },
      });

      return { message: 'Çek/Senet başarıyla ciro edildi' };
    });
  }

  // Durum değiştir (bankaya verildi, iade edildi, karşılıksız vb.)
  async durumDegistir(
    id: string,
    durum: CekSenetDurum,
    userId: string,
    aciklama?: string,
  ) {
    const cekSenet = await this.prisma.cekSenet.findUnique({
      where: { id },
    });

    if (!cekSenet || cekSenet.deletedAt) {
      throw new NotFoundException('Çek/Senet kaydı bulunamadı');
    }

    return this.prisma.$transaction(async (prisma) => {
      await prisma.cekSenet.update({
        where: { id },
        data: {
          durum: durum,
          updatedBy: userId,
        },
      });

      // Log
      await prisma.cekSenetLog.create({
        data: {
          cekSenetId: id,
          userId: userId,
          actionType: 'DURUM_DEGISIKLIK',
          changes: JSON.stringify({
            action: 'durum_degistir',
            eskiDurum: cekSenet.durum,
            yeniDurum: durum,
            aciklama,
          }),
        },
      });

      return { message: 'Durum başarıyla güncellendi' };
    });
  }

  async findDeleted() {
    return this.prisma.deletedCekSenet.findMany({
      include: {
        deletedByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });
  }

  async getStats(
    tip?: CekSenetTip,
    portfoyTip?: PortfoyTip,
    vadeBaslangic?: string,
    vadeBitis?: string,
  ) {
    const where: Prisma.CekSenetWhereInput = {
      deletedAt: null,
    };

    if (tip) {
      where.tip = tip;
    }

    if (portfoyTip) {
      where.portfoyTip = portfoyTip;
    }

    if (vadeBaslangic || vadeBitis) {
      where.vade = {};
      if (vadeBaslangic) {
        where.vade.gte = new Date(vadeBaslangic);
      }
      if (vadeBitis) {
        where.vade.lte = new Date(vadeBitis);
      }
    }

    const [portfoyde, tahsilEdildi, ciroEdildi, karsilikiz, toplamTutar] =
      await Promise.all([
        this.prisma.cekSenet.count({
          where: { ...where, durum: CekSenetDurum.PORTFOYDE },
        }),
        this.prisma.cekSenet.count({
          where: { ...where, durum: CekSenetDurum.TAHSIL_EDILDI },
        }),
        this.prisma.cekSenet.count({
          where: { ...where, durum: CekSenetDurum.CIRO_EDILDI },
        }),
        this.prisma.cekSenet.count({
          where: { ...where, durum: CekSenetDurum.KARSILIKIZ },
        }),
        this.prisma.cekSenet.aggregate({
          where,
          _sum: { tutar: true },
          _count: true,
        }),
      ]);

    return {
      toplamKayit: toplamTutar._count,
      toplamTutar: toplamTutar._sum.tutar || 0,
      portfoyde,
      tahsilEdildi,
      ciroEdildi,
      karsilikiz,
    };
  }

  // Vadesi geçen çek/senetler
  async getVadesiGecenler() {
    const bugun = new Date();
    return this.prisma.cekSenet.findMany({
      where: {
        deletedAt: null,
        vade: { lt: bugun },
        durum: CekSenetDurum.PORTFOYDE,
      },
      include: {
        cari: {
          select: { id: true, cariKodu: true, unvan: true, telefon: true },
        },
      },
      orderBy: { vade: 'asc' },
    });
  }

  // Çek/Senet Kasa Bakiyesi - Evraklı İşlemler
  async getCekSenetKasaBakiyesi() {
    // Tüm çek ve senetleri getir (silinmemiş)
    const cekSenetler = await this.prisma.cekSenet.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        cari: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
          },
        },
        tahsilKasa: {
          select: {
            id: true,
            kasaKodu: true,
            kasaAdi: true,
          },
        },
      },
      orderBy: { vade: 'asc' },
    });

    // Bakiye hesaplama
    let toplamBakiye = 0;
    let toplamAlacak = 0;
    let toplamBorc = 0;

    const hareketler = cekSenetler.map((item) => {
      const tutar = Number(item.tutar);
      const islemTipi =
        item.portfoyTip === PortfoyTip.ALACAK ? 'GIRIS' : 'CIKIS';

      // Alınan çek/senet → + (artı)
      // Verilen çek/senet → - (eksi)
      if (item.portfoyTip === PortfoyTip.ALACAK) {
        toplamAlacak += tutar;
        toplamBakiye += tutar;
      } else {
        toplamBorc += tutar;
        toplamBakiye -= tutar;
      }

      return {
        id: item.id,
        tarih: item.vade,
        tip: item.tip,
        portfoyTip: item.portfoyTip,
        islemTipi,
        cari: item.cari,
        tutar,
        durum: item.durum,
        banka: item.banka,
        sube: item.sube,
        cekNo: item.cekNo,
        seriNo: item.seriNo,
        tahsilTarihi: item.tahsilTarihi,
        tahsilKasa: item.tahsilKasa,
        aciklama: item.aciklama,
        bakiye: toplamBakiye, // Yürüyen bakiye
      };
    });

    // Duruma göre istatistikler
    const durumaGore = {
      portfoyde: cekSenetler.filter((c) => c.durum === CekSenetDurum.PORTFOYDE),
      bankayaVerildi: cekSenetler.filter(
        (c) => c.durum === CekSenetDurum.BANKAYA_VERILDI,
      ),
      tahsilEdildi: cekSenetler.filter(
        (c) => c.durum === CekSenetDurum.TAHSIL_EDILDI,
      ),
      odendi: cekSenetler.filter((c) => c.durum === CekSenetDurum.ODENDI),
      ciroEdildi: cekSenetler.filter(
        (c) => c.durum === CekSenetDurum.CIRO_EDILDI,
      ),
      iadeEdildi: cekSenetler.filter(
        (c) => c.durum === CekSenetDurum.IADE_EDILDI,
      ),
      karsilikiz: cekSenetler.filter(
        (c) => c.durum === CekSenetDurum.KARSILIKIZ,
      ),
    };

    return {
      toplamBakiye,
      toplamAlacak,
      toplamBorc,
      toplamKayit: cekSenetler.length,
      hareketler,
      istatistikler: {
        portfoyde: {
          adet: durumaGore.portfoyde.length,
          tutar: durumaGore.portfoyde.reduce(
            (sum, c) => sum + Number(c.tutar),
            0,
          ),
        },
        bankayaVerildi: {
          adet: durumaGore.bankayaVerildi.length,
          tutar: durumaGore.bankayaVerildi.reduce(
            (sum, c) => sum + Number(c.tutar),
            0,
          ),
        },
        tahsilEdildi: {
          adet: durumaGore.tahsilEdildi.length,
          tutar: durumaGore.tahsilEdildi.reduce(
            (sum, c) => sum + Number(c.tutar),
            0,
          ),
        },
        odendi: {
          adet: durumaGore.odendi.length,
          tutar: durumaGore.odendi.reduce((sum, c) => sum + Number(c.tutar), 0),
        },
        ciroEdildi: {
          adet: durumaGore.ciroEdildi.length,
          tutar: durumaGore.ciroEdildi.reduce(
            (sum, c) => sum + Number(c.tutar),
            0,
          ),
        },
        iadeEdildi: {
          adet: durumaGore.iadeEdildi.length,
          tutar: durumaGore.iadeEdildi.reduce(
            (sum, c) => sum + Number(c.tutar),
            0,
          ),
        },
        karsilikiz: {
          adet: durumaGore.karsilikiz.length,
          tutar: durumaGore.karsilikiz.reduce(
            (sum, c) => sum + Number(c.tutar),
            0,
          ),
        },
      },
    };
  }
}
