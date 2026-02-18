import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAracDto, UpdateAracDto } from './dto';

@Injectable()
export class AracService {
  constructor(private prisma: PrismaService) {}

  async create(createAracDto: CreateAracDto) {
    // Aynı araç zaten var mı kontrol et
    const existingArac = await this.prisma.arac.findFirst({
      where: {
        marka: createAracDto.marka,
        model: createAracDto.model,
        motorHacmi: createAracDto.motorHacmi,
        yakitTipi: createAracDto.yakitTipi,
      },
    });

    if (existingArac) {
      throw new BadRequestException(
        `Bu araç zaten mevcut: ${createAracDto.marka} ${createAracDto.model} (${createAracDto.motorHacmi}, ${createAracDto.yakitTipi})`,
      );
    }

    return this.prisma.arac.create({
      data: createAracDto,
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    search?: string,
    marka?: string,
    yakitTipi?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { marka: { contains: search, mode: 'insensitive' as const } },
        { model: { contains: search, mode: 'insensitive' as const } },
        { motorHacmi: { contains: search, mode: 'insensitive' as const } },
        { yakitTipi: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (marka) {
      where.marka = { equals: marka, mode: 'insensitive' as const };
    }

    if (yakitTipi) {
      where.yakitTipi = { equals: yakitTipi, mode: 'insensitive' as const };
    }

    const [data, total] = await Promise.all([
      this.prisma.arac.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ marka: 'asc' }, { model: 'asc' }, { motorHacmi: 'asc' }],
      }),
      this.prisma.arac.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const arac = await this.prisma.arac.findUnique({
      where: { id },
    });

    if (!arac) {
      throw new NotFoundException(`Araç bulunamadı: ${id}`);
    }

    return arac;
  }

  async update(id: string, updateAracDto: UpdateAracDto) {
    const mevcutArac = await this.findOne(id);

    // Güncellenecek alanları belirle
    const guncellenecekMarka = updateAracDto.marka ?? mevcutArac.marka;
    const guncellenecekModel = updateAracDto.model ?? mevcutArac.model;
    const guncellenecekMotorHacmi =
      updateAracDto.motorHacmi ?? mevcutArac.motorHacmi;
    const guncellenecekYakitTipi =
      updateAracDto.yakitTipi ?? mevcutArac.yakitTipi;

    // Eğer benzersiz alanlar değişiyorsa, çakışma kontrolü yap
    const benzersizAlanlarDegisti =
      updateAracDto.marka ||
      updateAracDto.model ||
      updateAracDto.motorHacmi ||
      updateAracDto.yakitTipi;

    if (benzersizAlanlarDegisti) {
      const existingArac = await this.prisma.arac.findFirst({
        where: {
          id: { not: id },
          marka: guncellenecekMarka,
          model: guncellenecekModel,
          motorHacmi: guncellenecekMotorHacmi,
          yakitTipi: guncellenecekYakitTipi,
        },
      });

      if (existingArac) {
        throw new BadRequestException(
          `Bu araç kombinasyonu zaten mevcut: ${guncellenecekMarka} ${guncellenecekModel} (${guncellenecekMotorHacmi}, ${guncellenecekYakitTipi})`,
        );
      }
    }

    return this.prisma.arac.update({
      where: { id },
      data: updateAracDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.arac.delete({
      where: { id },
    });
  }

  async getMarkalar() {
    const markalar = await this.prisma.arac.findMany({
      select: {
        marka: true,
      },
      distinct: ['marka'],
      orderBy: {
        marka: 'asc',
      },
    });

    return markalar.map((m) => m.marka);
  }

  async getYakitTipleri() {
    const yakitTipleri = await this.prisma.arac.findMany({
      select: {
        yakitTipi: true,
      },
      distinct: ['yakitTipi'],
      orderBy: {
        yakitTipi: 'asc',
      },
    });

    return yakitTipleri.map((y) => y.yakitTipi);
  }

  async getModeller(marka?: string) {
    const where = marka ? { marka } : {};

    const modeller = await this.prisma.arac.findMany({
      where,
      select: {
        model: true,
      },
      distinct: ['model'],
      orderBy: {
        model: 'asc',
      },
    });

    return modeller.map((m) => m.model);
  }
}
