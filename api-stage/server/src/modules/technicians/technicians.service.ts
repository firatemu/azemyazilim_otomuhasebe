import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TechniciansService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) {}

  async findAll(search?: string, limit = 100, page = 1) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;

    const where: any = { role: 'TECHNICIAN' };
    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.extended.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          department: true,
          role: true,
          isActive: true,
          createdAt: true,
          tenant: {
            select: { id: true, name: true, status: true },
          },
        },
        orderBy: { fullName: 'asc' },
      }),
      this.prisma.extended.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(dto: CreateTechnicianDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({
      allowNull: false,
    });

    const uniqueId = crypto.randomBytes(4).toString('hex');
    const email = `t-${uniqueId}@servis.local`;
    const username = `teknisyen-${uniqueId}`;

    const rawPassword = dto.password ?? crypto.randomBytes(12).toString('hex');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    return this.prisma.extended.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        fullName: dto.fullName,
        department: dto.department,
        phone: dto.phone,
        tenantId,
        role: 'TECHNICIAN',
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        department: true,
        role: true,
        isActive: true,
        createdAt: true,
        tenant: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
