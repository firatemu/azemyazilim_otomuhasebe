import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { Prisma } from '@prisma/client';
import { CreateTechnicianDto, UpdateTechnicianDto } from './dto';

@Injectable()
export class TechnicianService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) {}

  async create(dto: CreateTechnicianDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const existing = await this.prisma.technician.findFirst({
      where: {
        code: dto.code,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });
    if (existing) {
      throw new ConflictException('Bu teknisyen kodu zaten kullanılıyor');
    }
    const createData: any = {
      ...dto,
      isActive: dto.isActive ?? true,
      ...(tenantId != null && { tenantId }),
    };
    return this.prisma.technician.create({
      data: createData,
    });
  }

  async update(id: string, dto: UpdateTechnicianDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const technician = await this.prisma.technician.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });
    if (!technician) {
      throw new NotFoundException('Teknisyen bulunamadı');
    }

    // Kod benzersizlik kontrolü - staging'de tenantId opsiyonel
    if (dto.code && dto.code !== technician.code) {
      const existing = await this.prisma.technician.findFirst({
        where: {
          code: dto.code,
          NOT: { id },
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (existing) {
        throw new ConflictException('Bu teknisyen kodu zaten kullanılıyor');
      }
    }

    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const technician = await this.prisma.technician.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: { workOrders: { take: 1 } },
    });
    if (!technician) {
      throw new NotFoundException('Teknisyen bulunamadı');
    }

    if (technician.workOrders.length > 0) {
      throw new BadRequestException(
        'Bu teknisyenin atandığı iş emirleri var. Silmek yerine pasif yapın.',
      );
    }

    return this.prisma.technician.delete({
      where: { id },
    });
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const technician = await this.prisma.technician.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        _count: {
          select: { workOrders: true },
        },
      },
    });

    if (!technician) {
      throw new NotFoundException('Teknisyen bulunamadı');
    }

    return technician;
  }

  async findAll(
    page = 1,
    limit = 50,
    search?: string,
    isActive?: boolean,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;
    const where: Prisma.TechnicianWhereInput = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };
    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.technician.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { workOrders: true },
          },
        },
      }),
      this.prisma.technician.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Teknisyenin iş yükünü getir
   */
  async getWorkload(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const technician = await this.prisma.technician.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });
    if (!technician) {
      throw new NotFoundException('Teknisyen bulunamadı');
    }

    const workOrderWhere: any = {
      technicianId: id,
      status: { notIn: ['CLOSED', 'CANCELLED'] },
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    const activeWorkOrders = await this.prisma.workOrder.findMany({
      where: workOrderWhere,
      orderBy: { acceptedAt: 'desc' },
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            brand: true,
            model: true,
          },
        },
        customer: {
          select: {
            id: true,
            unvan: true,
          },
        },
      },
    });

    const statsWhere: any = {
      technicianId: id,
      ...buildTenantWhereClause(tenantId ?? undefined),
    };
    const stats = await this.prisma.workOrder.groupBy({
      by: ['status'],
      where: statsWhere,
      _count: true,
    });

    return {
      technician: {
        id: technician.id,
        code: technician.code,
        firstName: technician.firstName,
        lastName: technician.lastName,
        specialization: technician.specialization,
      },
      activeWorkOrders,
      stats: stats.reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

