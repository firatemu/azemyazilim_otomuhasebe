import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { CreateMasrafDto } from './dto/create-masraf.dto';
import { UpdateMasrafDto } from './dto/update-masraf.dto';

@Injectable()
export class MasrafService {
  constructor(private prisma: PrismaService) { }

  async create(createDto: CreateMasrafDto) {
    // Kategori kontrolü
    const kategori = await this.prisma.masrafKategori.findUnique({
      where: { id: createDto.kategoriId },
    });

    if (!kategori) {
      throw new NotFoundException('Masraf kategorisi bulunamadı');
    }

    return this.prisma.masraf.create({
      data: {
        kategoriId: createDto.kategoriId,
        aciklama: createDto.aciklama?.trim() || null,
        tutar: createDto.tutar,
        tarih: new Date(createDto.tarih),
        odemeTipi: createDto.odemeTipi,
      },
      include: {
        kategori: true,
      },
    });
  }

  async findAll(
    page = 1,
    limit = 50,
    kategoriId?: string,
    baslangicTarihi?: string,
    bitisTarihi?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.MasrafWhereInput = {};

    if (kategoriId) {
      where.kategoriId = kategoriId;
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

    const [data, total] = await Promise.all([
      this.prisma.masraf.findMany({
        where,
        skip,
        take: limit,
        include: { kategori: true },
        orderBy: { tarih: 'desc' },
      }),
      this.prisma.masraf.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const masraf = await this.prisma.masraf.findUnique({
      where: { id },
      include: { kategori: true },
    });

    if (!masraf) {
      throw new NotFoundException('Masraf kaydı bulunamadı');
    }

    return masraf;
  }

  async update(id: string, updateDto: UpdateMasrafDto) {
    const existing = await this.prisma.masraf.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Masraf kaydı bulunamadı');
    }

    const updateData: any = { ...updateDto };
    if (updateDto.tarih) {
      updateData.tarih = new Date(updateDto.tarih);
    }
    // Boş string'i null'a çevir (nullable field için)
    if (updateDto.aciklama !== undefined) {
      updateData.aciklama = updateDto.aciklama?.trim() || null;
    }

    return this.prisma.masraf.update({
      where: { id },
      data: updateData,
      include: { kategori: true },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.masraf.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Masraf kaydı bulunamadı');
    }

    return this.prisma.masraf.delete({
      where: { id },
    });
  }

  async getStats(
    kategoriId?: string,
    baslangicTarihi?: string,
    bitisTarihi?: string,
  ) {
    const where: Prisma.MasrafWhereInput = {};

    if (kategoriId) {
      where.kategoriId = kategoriId;
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

    const [toplam, kategoriBazli] = await Promise.all([
      this.prisma.masraf.aggregate({
        where,
        _sum: { tutar: true },
        _count: true,
      }),
      this.prisma.masrafKategori.findMany({
        include: {
          _count: {
            select: { masraflar: true },
          },
          masraflar: {
            where,
            select: { tutar: true },
          },
        },
      }),
    ]);

    const kategoriler = kategoriBazli.map((k) => ({
      kategoriId: k.id,
      kategoriAdi: k.kategoriAdi,
      adet: k._count.masraflar,
      toplam: k.masraflar.reduce((sum, m) => sum + Number(m.tutar), 0),
    }));

    return {
      toplamMasraf: toplam._sum.tutar || 0,
      toplamAdet: toplam._count,
      kategoriler,
    };
  }

  // Kategori işlemleri
  async findAllKategoriler() {
    return this.prisma.masrafKategori.findMany({
      include: {
        _count: {
          select: { masraflar: true },
        },
      },
      orderBy: { kategoriAdi: 'asc' },
    });
  }

  async createKategori(kategoriAdi: string, aciklama?: string) {
    return this.prisma.masrafKategori.create({
      data: { kategoriAdi, aciklama },
    });
  }

  async updateKategori(id: string, kategoriAdi: string, aciklama?: string) {
    const existing = await this.prisma.masrafKategori.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return this.prisma.masrafKategori.update({
      where: { id },
      data: { kategoriAdi, aciklama },
    });
  }

  async removeKategori(id: string) {
    const existing = await this.prisma.masrafKategori.findUnique({
      where: { id },
      include: {
        _count: {
          select: { masraflar: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    if (existing._count.masraflar > 0) {
      throw new BadRequestException(
        'Bu kategoride masraf kayıtları var, silinemez',
      );
    }

    return this.prisma.masrafKategori.delete({
      where: { id },
    });
  }
}
