import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateBankaHesapDto } from './dto/create-banka-hesap.dto';
import { UpdateBankaHesapDto } from './dto/update-banka-hesap.dto';

@Injectable()
export class BankaHesapService {
  constructor(private prisma: PrismaService) { }

  async create(createDto: CreateBankaHesapDto) {
    // Kasa kontrolü
    const kasa = await this.prisma.kasa.findUnique({
      where: { id: createDto.kasaId },
    });

    if (!kasa) {
      throw new NotFoundException('Kasa bulunamadı');
    }

    if (kasa.kasaTipi !== 'BANKA') {
      throw new BadRequestException(
        'Sadece BANKA tipindeki kasalara hesap eklenebilir',
      );
    }

    // Hesap kodu kontrolü veya otomatik üret
    let hesapKodu = createDto.hesapKodu;
    if (!hesapKodu || hesapKodu.trim() === '') {
      // Otomatik kod üret: KASA_KODU-001, KASA_KODU-002...
      const hesapSayisi = await this.prisma.bankaHesabi.count({
        where: { kasaId: createDto.kasaId },
      });
      hesapKodu = `${kasa.kasaKodu}-${String(hesapSayisi + 1).padStart(3, '0')}`;
    }

    const data = {
      kasaId: createDto.kasaId,
      hesapKodu,
      hesapAdi: createDto.hesapAdi?.trim() || null,
      bankaAdi: createDto.bankaAdi,
      subeKodu: createDto.subeKodu,
      subeAdi: createDto.subeAdi,
      hesapNo: createDto.hesapNo,
      iban: createDto.iban,
      hesapTipi: createDto.hesapTipi,
      aktif: createDto.aktif ?? true,
    };

    return this.prisma.bankaHesabi.create({
      data,
      include: {
        kasa: true,
      },
    });
  }

  async findAll(kasaId?: string, hesapTipi?: string) {
    const where: any = {};
    if (kasaId) {
      where.kasaId = kasaId;
    }
    if (hesapTipi) {
      where.hesapTipi = hesapTipi;
    }

    return this.prisma.bankaHesabi.findMany({
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
    const hesap = await this.prisma.bankaHesabi.findUnique({
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
          take: 1000, // Daha fazla hareket göstermek için limit artırıldı
        },
      },
    });

    if (!hesap) {
      throw new NotFoundException('Banka hesabı bulunamadı');
    }

    return hesap;
  }

  async update(id: string, updateDto: UpdateBankaHesapDto) {
    await this.findOne(id);

    const updateData: any = { ...updateDto };
    // Boş string'i null'a çevir (nullable field için)
    if (updateDto.hesapAdi !== undefined) {
      updateData.hesapAdi = updateDto.hesapAdi?.trim() || null;
    }

    return this.prisma.bankaHesabi.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const hesap = await this.findOne(id);

    // Hareket kontrolü
    const hareketSayisi = await this.prisma.bankaHesapHareket.count({
      where: { hesapId: id },
    });

    if (hareketSayisi > 0) {
      throw new BadRequestException('Bu hesapta hareket var, silinemez');
    }

    return this.prisma.bankaHesabi.delete({
      where: { id },
    });
  }
}
