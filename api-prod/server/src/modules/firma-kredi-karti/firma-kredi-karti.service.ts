import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateFirmaKrediKartiDto } from './dto/create-firma-kredi-karti.dto';
import { UpdateFirmaKrediKartiDto } from './dto/update-firma-kredi-karti.dto';

@Injectable()
export class FirmaKrediKartiService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tarihten ayın gününü çıkarır (1-31)
   */
  private getDayOfMonth(date: Date | string | null | undefined): number | null {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return null;
    return d.getDate();
  }

  /**
   * Hatırlatıcı oluşturur veya günceller
   */
  private async upsertHatirlatici(
    kartId: string,
    tip: 'HESAP_KESIM_TARIHI' | 'SON_ODEME_TARIHI',
    tarih: Date | string | null | undefined,
  ) {
    if (!tarih) {
      // Tarih yoksa hatırlatıcıyı sil
      await this.prisma.firmaKrediKartiHatirlatici.deleteMany({
        where: { kartId, tip },
      });
      return;
    }

    const gun = this.getDayOfMonth(tarih);
    if (gun === null) return;

    // Upsert: varsa güncelle, yoksa oluştur
    await this.prisma.firmaKrediKartiHatirlatici.upsert({
      where: {
        kartId_tip: {
          kartId,
          tip,
        },
      },
      update: {
        gun,
        aktif: true,
      },
      create: {
        kartId,
        tip,
        gun,
        aktif: true,
      },
    });
  }

  async create(createDto: CreateFirmaKrediKartiDto) {
    // Kasa kontrolü
    const kasa = await this.prisma.kasa.findUnique({
      where: { id: createDto.kasaId },
    });

    if (!kasa) {
      throw new NotFoundException('Kasa bulunamadı');
    }

    if (kasa.kasaTipi !== 'FIRMA_KREDI_KARTI') {
      throw new BadRequestException(
        'Sadece FIRMA_KREDI_KARTI tipindeki kasalara kart eklenebilir',
      );
    }

    // Kart kodu kontrolü veya otomatik üret
    let kartKodu = createDto.kartKodu;
    if (!kartKodu || kartKodu.trim() === '') {
      // Otomatik kod üret: KASA_KODU-001, KASA_KODU-002...
      const kartSayisi = await this.prisma.firmaKrediKarti.count({
        where: { kasaId: createDto.kasaId },
      });
      kartKodu = `${kasa.kasaKodu}-${String(kartSayisi + 1).padStart(3, '0')}`;
    }

    const data = {
      kasaId: createDto.kasaId,
      kartKodu,
      kartAdi: createDto.kartAdi,
      bankaAdi: createDto.bankaAdi,
      kartTipi: createDto.kartTipi,
      sonDortHane: createDto.sonDortHane,
      limit: createDto.limit,
      hesapKesimTarihi: createDto.hesapKesimTarihi
        ? new Date(createDto.hesapKesimTarihi)
        : null,
      sonOdemeTarihi: createDto.sonOdemeTarihi
        ? new Date(createDto.sonOdemeTarihi)
        : null,
      aktif: createDto.aktif ?? true,
    };

    const kart = await this.prisma.firmaKrediKarti.create({
      data,
      include: {
        kasa: true,
      },
    });

    // Hatırlatıcıları oluştur
    await this.upsertHatirlatici(
      kart.id,
      'HESAP_KESIM_TARIHI',
      createDto.hesapKesimTarihi,
    );
    await this.upsertHatirlatici(
      kart.id,
      'SON_ODEME_TARIHI',
      createDto.sonOdemeTarihi,
    );

    return kart;
  }

  async findAll(kasaId?: string) {
    const where: any = {};
    if (kasaId) {
      where.kasaId = kasaId;
    }

    return this.prisma.firmaKrediKarti.findMany({
      where,
      include: {
        kasa: {
          select: {
            id: true,
            kasaKodu: true,
            kasaAdi: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const kart = await this.prisma.firmaKrediKarti.findUnique({
      where: { id },
      include: {
        kasa: true,
        hareketler: {
          include: {
            cari: {
              select: {
                id: true,
                cariKodu: true,
                unvan: true,
              },
            },
          },
          orderBy: { tarih: 'desc' },
          take: 50,
        },
      },
    });

    if (!kart) {
      throw new NotFoundException('Firma kredi kartı bulunamadı');
    }

    return kart;
  }

  async update(id: string, updateDto: UpdateFirmaKrediKartiDto) {
    await this.findOne(id);

    // kasaId burada olmamalı - update'te kasa değiştirilemez
    const { kasaId, ...updateData } = updateDto as any;
    if (kasaId !== undefined) {
      throw new BadRequestException(
        'Kasa değiştirilemez. Lütfen kasaId alanını göndermeyin.',
      );
    }

    // Tarih alanlarını Date'e çevir
    const dataToUpdate: any = { ...updateData };
    if (updateDto.hesapKesimTarihi !== undefined) {
      dataToUpdate.hesapKesimTarihi = updateDto.hesapKesimTarihi
        ? new Date(updateDto.hesapKesimTarihi)
        : null;
    }
    if (updateDto.sonOdemeTarihi !== undefined) {
      dataToUpdate.sonOdemeTarihi = updateDto.sonOdemeTarihi
        ? new Date(updateDto.sonOdemeTarihi)
        : null;
    }

    const kart = await this.prisma.firmaKrediKarti.update({
      where: { id },
      data: dataToUpdate,
    });

    // Hatırlatıcıları güncelle
    if (updateDto.hesapKesimTarihi !== undefined) {
      await this.upsertHatirlatici(
        id,
        'HESAP_KESIM_TARIHI',
        updateDto.hesapKesimTarihi,
      );
    }
    if (updateDto.sonOdemeTarihi !== undefined) {
      await this.upsertHatirlatici(
        id,
        'SON_ODEME_TARIHI',
        updateDto.sonOdemeTarihi,
      );
    }

    return kart;
  }

  async remove(id: string) {
    const kart = await this.findOne(id);

    // Hareket kontrolü
    const hareketSayisi = await this.prisma.firmaKrediKartiHareket.count({
      where: { kartId: id },
    });

    if (hareketSayisi > 0) {
      throw new BadRequestException('Bu kartta hareket var, silinemez');
    }

    return this.prisma.firmaKrediKarti.delete({
      where: { id },
    });
  }

  /**
   * Bugünün gününe göre aktif hatırlatıcıları getirir
   */
  async getTodayReminders() {
    const today = new Date().getDate(); // Ayın kaçıncı günü (1-31)

    const reminders = await this.prisma.firmaKrediKartiHatirlatici.findMany({
      where: {
        gun: today,
        aktif: true,
      },
      include: {
        kart: {
          include: {
            kasa: {
              select: {
                kasaKodu: true,
                kasaAdi: true,
              },
            },
          },
        },
      },
    });

    return reminders.map((r) => ({
      id: r.id,
      kartId: r.kartId,
      tip: r.tip,
      gun: r.gun,
      kart: {
        id: r.kart.id,
        kartKodu: r.kart.kartKodu,
        kartAdi: r.kart.kartAdi,
        bankaAdi: r.kart.bankaAdi,
        kasa: r.kart.kasa,
      },
    }));
  }
}
