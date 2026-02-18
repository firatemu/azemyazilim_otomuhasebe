import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class PostalCodeService {
  constructor(private prisma: PrismaService) { }

  /**
   * İl, ilçe ve mahalle bilgisine göre posta kodunu bulur
   * @param city - İl adı
   * @param district - İlçe adı
   * @param neighborhood - Mahalle adı
   * @returns Posta kodu veya null
   */
  async findPostalCode(
    city: string,
    district: string,
    neighborhood: string,
  ): Promise<string | null> {
    if (!city || !district || !neighborhood) {
      return null;
    }

    // Normalize: Büyük/küçük harf duyarsız arama
    const postalCode = await this.prisma.postalCode.findFirst({
      where: {
        city: {
          equals: city.trim(),
          mode: 'insensitive',
        },
        district: {
          equals: district.trim(),
          mode: 'insensitive',
        },
        neighborhood: {
          equals: neighborhood.trim(),
          mode: 'insensitive',
        },
      },
      select: {
        postalCode: true,
      },
    });

    return postalCode?.postalCode || null;
  }

  /**
   * İl ve ilçe bilgisine göre posta kodlarını bulur (birden fazla mahalle olabilir)
   * @param city - İl adı
   * @param district - İlçe adı
   * @returns Posta kodları listesi
   */
  async findPostalCodesByCityAndDistrict(
    city: string,
    district: string,
  ): Promise<string[]> {
    if (!city || !district) {
      return [];
    }

    const postalCodes = await this.prisma.postalCode.findMany({
      where: {
        city: {
          equals: city.trim(),
          mode: 'insensitive',
        },
        district: {
          equals: district.trim(),
          mode: 'insensitive',
        },
      },
      select: {
        postalCode: true,
      },
      distinct: ['postalCode'],
    });

    return postalCodes.map((pc) => pc.postalCode);
  }

  /**
   * Posta kodunu veritabanına ekler veya günceller
   * @param city - İl adı
   * @param district - İlçe adı
   * @param neighborhood - Mahalle adı
   * @param postalCode - Posta kodu
   */
  async upsertPostalCode(
    city: string,
    district: string,
    neighborhood: string,
    postalCode: string,
  ): Promise<void> {
    await this.prisma.postalCode.upsert({
      where: {
        city_district_neighborhood: {
          city: city.trim(),
          district: district.trim(),
          neighborhood: neighborhood.trim(),
        },
      },
      update: {
        postalCode: postalCode.trim(),
      },
      create: {
        city: city.trim(),
        district: district.trim(),
        neighborhood: neighborhood.trim(),
        postalCode: postalCode.trim(),
      },
    });
  }

  /**
   * Toplu posta kodu ekleme
   * @param postalCodes - Posta kodu listesi
   */
  async bulkUpsertPostalCodes(
    postalCodes: Array<{
      city: string;
      district: string;
      neighborhood: string;
      postalCode: string;
    }>,
  ): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    for (const pc of postalCodes) {
      try {
        const existing = await this.prisma.postalCode.findUnique({
          where: {
            city_district_neighborhood: {
              city: pc.city.trim(),
              district: pc.district.trim(),
              neighborhood: pc.neighborhood.trim(),
            },
          },
        });

        if (existing) {
          await this.prisma.postalCode.update({
            where: { id: existing.id },
            data: { postalCode: pc.postalCode.trim() },
          });
          updated++;
        } else {
          await this.prisma.postalCode.create({
            data: {
              city: pc.city.trim(),
              district: pc.district.trim(),
              neighborhood: pc.neighborhood.trim(),
              postalCode: pc.postalCode.trim(),
            },
          });
          created++;
        }
      } catch (error) {
        console.error(`Error upserting postal code for ${pc.city}/${pc.district}/${pc.neighborhood}:`, error);
      }
    }

    return { created, updated };
  }

  /**
   * İl ve ilçe bilgisine göre mahalleleri bulur
   * @param city - İl adı
   * @param district - İlçe adı
   * @returns Mahalle listesi
   */
  async findNeighborhoodsByCityAndDistrict(
    city: string,
    district: string,
  ): Promise<any[]> {
    if (!city || !district) {
      return [];
    }

    const neighborhoods = await this.prisma.postalCode.findMany({
      where: {
        city: {
          equals: city.trim(),
          mode: 'insensitive',
        },
        district: {
          equals: district.trim(),
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        neighborhood: true,
        postalCode: true,
      },
      orderBy: {
        neighborhood: 'asc',
      },
    });

    return neighborhoods.map(n => ({
      id: n.id,
      name: n.neighborhood,
      postalCode: n.postalCode
    }));
  }
}
