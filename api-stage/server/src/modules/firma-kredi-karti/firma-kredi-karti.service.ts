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
  constructor(private prisma: PrismaService) { }

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
}
