import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateVehicleBrandDto, UpdateVehicleBrandDto } from './dto';

@Injectable()
export class VehicleBrandService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleBrandDto: CreateVehicleBrandDto) {
    // Aynı araç zaten var mı kontrol et
    const existingArac = await this.prisma.extended.vehicleCatalog.findFirst({
      where: {
        brand: createVehicleBrandDto.brand,
        model: createVehicleBrandDto.model,
        engineVolume: createVehicleBrandDto.engineVolume,
        fuelType: createVehicleBrandDto.fuelType,
      },
    });

    if (existingArac) {
      throw new BadRequestException(
        `Bu araç zaten mevcut: ${createVehicleBrandDto.brand} ${createVehicleBrandDto.model} (${createVehicleBrandDto.engineVolume}, ${createVehicleBrandDto.fuelType})`,
      );
    }

    return this.prisma.extended.vehicleCatalog.create({
      data: {
        brand: createVehicleBrandDto.brand,
        model: createVehicleBrandDto.model,
        engineVolume: createVehicleBrandDto.engineVolume,
        fuelType: createVehicleBrandDto.fuelType,
      },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    search?: string,
    brand?: string,
    fuelType?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' as const } },
        { model: { contains: search, mode: 'insensitive' as const } },
        { engineVolume: { contains: search, mode: 'insensitive' as const } },
        { fuelType: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' as const };
    }

    if (fuelType) {
      where.fuelType = { equals: fuelType, mode: 'insensitive' as const };
    }

    const [data, total] = await Promise.all([
      this.prisma.extended.vehicleCatalog.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ brand: 'asc' }, { model: 'asc' }, { engineVolume: 'asc' }],
      }),
      this.prisma.extended.vehicleCatalog.count({ where }),
    ]);

    return {
      data: data.map((v) => ({
        id: v.id,
        brand: v.brand,
        model: v.model,
        engineVolume: v.engineVolume,
        fuelType: v.fuelType,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const vehicleBrand = await this.prisma.extended.vehicleCatalog.findUnique({
      where: { id },
    });

    if (!vehicleBrand) {
      throw new NotFoundException(`Vehicle not found: id`);
    }

    return {
      id: vehicleBrand.id,
      brand: vehicleBrand.brand,
      model: vehicleBrand.model,
      engineVolume: vehicleBrand.engineVolume,
      fuelType: vehicleBrand.fuelType,
      createdAt: vehicleBrand.createdAt,
      updatedAt: vehicleBrand.updatedAt,
    };
  }

  async update(id: string, updateVehicleBrandDto: UpdateVehicleBrandDto) {
    const existingVehicle = await this.findOne(id);

    // Güncellenecek alanları belirle
    const brandToUpdate = updateVehicleBrandDto.brand ?? existingVehicle.brand;
    const modelToUpdate = updateVehicleBrandDto.model ?? existingVehicle.model;
    const engineVolumeToUpdate =
      updateVehicleBrandDto.engineVolume ?? existingVehicle.engineVolume;
    const fuelTypeToUpdate =
      updateVehicleBrandDto.fuelType ?? existingVehicle.fuelType;

    // Eğer benzersiz alanlar değişiyorsa, çakışma kontrolü yap
    const uniqueFieldsChanged =
      updateVehicleBrandDto.brand ||
      updateVehicleBrandDto.model ||
      updateVehicleBrandDto.engineVolume ||
      updateVehicleBrandDto.fuelType;

    if (uniqueFieldsChanged) {
      const existingArac = await this.prisma.extended.vehicleCatalog.findFirst({
        where: {
          id: { not: id },
          brand: brandToUpdate,
          model: modelToUpdate,
          engineVolume: engineVolumeToUpdate,
          fuelType: fuelTypeToUpdate,
        },
      });

      if (existingArac) {
        throw new BadRequestException(
          `Bu araç kombinasyonu zaten mevcut: ${brandToUpdate} ${modelToUpdate} (${engineVolumeToUpdate}, ${fuelTypeToUpdate})`,
        );
      }
    }

    const updated = await this.prisma.extended.vehicleCatalog.update({
      where: { id },
      data: {
        brand: updateVehicleBrandDto.brand,
        model: updateVehicleBrandDto.model,
        engineVolume: updateVehicleBrandDto.engineVolume,
        fuelType: updateVehicleBrandDto.fuelType,
      },
    });
    return {
      id: updated.id,
      brand: updated.brand,
      model: updated.model,
      engineVolume: updated.engineVolume,
      fuelType: updated.fuelType,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.extended.vehicleCatalog.delete({
      where: { id },
    });
  }

  async getBrands() {
    const brands = await this.prisma.extended.vehicleCatalog.findMany({
      select: {
        brand: true,
      },
      distinct: ['brand'],
      orderBy: {
        brand: 'asc',
      },
    });

    return brands.map((m) => m.brand);
  }

  async getFuelTypes() {
    const yakitTipleri = await this.prisma.extended.vehicleCatalog.findMany({
      select: {
        fuelType: true,
      },
      distinct: ['fuelType'],
      orderBy: {
        fuelType: 'asc',
      },
    });

    return yakitTipleri.map((y) => y.fuelType);
  }

  async getModels(brand?: string) {
    const where = brand ? { brand: brand } : {};

    const models = await this.prisma.extended.vehicleCatalog.findMany({
      where,
      select: {
        model: true,
      },
      distinct: ['model'],
      orderBy: {
        model: 'asc',
      },
    });

    return models.map((m) => m.model);
  }
}
