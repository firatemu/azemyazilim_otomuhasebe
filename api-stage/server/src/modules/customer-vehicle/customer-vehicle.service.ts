import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateCustomerVehicleDto, UpdateCustomerVehicleDto } from './dto';

@Injectable()
export class CustomerVehicleService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) {}

  async create(dto: CreateCustomerVehicleDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({
      allowNull: true,
    });

    const finalTenantId = (dto as any).tenantId ?? tenantId ?? undefined;

    const existingWhere: any = { plate: dto.plaka };
    if (finalTenantId) existingWhere.tenantId = finalTenantId;
    const existingPlaka = await this.prisma.extended.customerVehicle.findFirst({
      where: existingWhere,
    });
    if (existingPlaka) {
      throw new BadRequestException('Bu plaka zaten kayıtlı');
    }

    if (dto.saseno) {
      const existingSasenoWhere: any = { chassisno: dto.saseno };
      if (finalTenantId) existingSasenoWhere.tenantId = finalTenantId;
      const existingSaseno = await this.prisma.extended.customerVehicle.findFirst({
        where: existingSasenoWhere,
      });
      if (existingSaseno) {
        throw new BadRequestException('Bu şase no zaten kayıtlı');
      }
    }

    const cari = await this.prisma.extended.account.findFirst({
      where: { id: dto.accountId, ...buildTenantWhereClause(finalTenantId) },
    });
    if (!cari) {
      throw new BadRequestException('Account not found');
    }

    const data: any = {
      tenantId: finalTenantId,
      accountId: dto.accountId,
      plate: dto.plaka,
      chassisno: dto.saseno,
      year: dto.yil,
      mileage: dto.km,
      brand: dto.aracMarka,
      model: dto.aracModel,
      engineSize: dto.aracMotorHacmi,
      fuelType: dto.aracYakitTipi,
      registrationNo: dto.ruhsatNo,
      registrationOwner: dto.ruhsatSahibi,
      enginePower: dto.motorGucu,
      transmission: dto.sanziman,
      color: dto.renk,
      notes: dto.notes,
      ...(dto.tescilTarihi && { registrationDate: new Date(dto.tescilTarihi) }),
    };
    return this.prisma.extended.customerVehicle.create({
      data,
      include: {
        account: { select: { id: true, code: true, title: true } },
      },
    });
  }

  async findAll(
    page = 1,
    limit = 50,
    search?: string,
    accountId?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;
    const where: any = buildTenantWhereClause(tenantId ?? undefined);

    if (search) {
      where.OR = [
        { plate: { contains: search, mode: 'insensitive' } },
        { chassisno: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (accountId) {
      where.accountId = accountId;
    }

    const [data, total] = await Promise.all([
      this.prisma.extended.customerVehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          account: { select: { id: true, code: true, title: true } },
        },
      }),
      this.prisma.extended.customerVehicle.count({ where }),
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
    const tenantId = await this.tenantResolver.resolveForQuery();
    const vehicle = await this.prisma.extended.customerVehicle.findFirst({
      where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
      include: {
        account: { select: { id: true, code: true, title: true } },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Customer vehicle not found: id`);
    }

    return vehicle;
  }

  async update(id: string, dto: UpdateCustomerVehicleDto) {
    await this.findOne(id);
    const tenantId = await this.tenantResolver.resolveForQuery();

    if (dto.plaka) {
      const existingPlaka = await this.prisma.extended.customerVehicle.findFirst({
        where: {
          plate: dto.plaka,
          id: { not: id },
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (existingPlaka) {
        throw new BadRequestException('Bu plaka zaten kayıtlı');
      }
    }

    if (dto.saseno) {
      const existingSaseno = await this.prisma.extended.customerVehicle.findFirst({
        where: {
          chassisno: dto.saseno,
          id: { not: id },
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (existingSaseno) {
        throw new BadRequestException('Bu şase no zaten kayıtlı');
      }
    }

    const updateData: any = {
      ...(dto.accountId && { accountId: dto.accountId }),
      ...(dto.plaka && { plate: dto.plaka }),
      ...(dto.saseno !== undefined && { chassisno: dto.saseno }),
      ...(dto.yil !== undefined && { year: dto.yil }),
      ...(dto.km !== undefined && { mileage: dto.km }),
      ...(dto.aracMarka && { brand: dto.aracMarka }),
      ...(dto.aracModel && { model: dto.aracModel }),
      ...(dto.aracMotorHacmi !== undefined && { engineSize: dto.aracMotorHacmi }),
      ...(dto.aracYakitTipi !== undefined && { fuelType: dto.aracYakitTipi }),
      ...(dto.ruhsatNo !== undefined && { registrationNo: dto.ruhsatNo }),
      ...(dto.ruhsatSahibi !== undefined && { registrationOwner: dto.ruhsatSahibi }),
      ...(dto.motorGucu !== undefined && { enginePower: dto.motorGucu }),
      ...(dto.sanziman !== undefined && { transmission: dto.sanziman }),
      ...(dto.renk !== undefined && { color: dto.renk }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    };
    if (dto.tescilTarihi !== undefined) {
      updateData.registrationDate = dto.tescilTarihi ? new Date(dto.tescilTarihi) : null;
    }
    return this.prisma.extended.customerVehicle.update({
      where: { id },
      data: updateData,
      include: {
        account: { select: { id: true, code: true, title: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.extended.customerVehicle.delete({
      where: { id },
    });
  }
}
