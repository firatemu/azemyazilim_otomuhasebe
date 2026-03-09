import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(search?: string, limit: number = 100, page: number = 1, role?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.extended.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
          tenant: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.extended.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.extended.user.findUnique({
      where: { id },
      include: {
        tenant: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async remove(id: string) {
    // Kullanıcıyı kontrol et
    const user = await this.prisma.extended.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Kullanıcıyı sil
    // Not: Prisma cascade ayarlarına göre ilgili kayıtlar otomatik silinir
    await this.prisma.extended.user.delete({
      where: { id },
    });
  }

  async suspend(id: string) {
    // Kullanıcıyı kontrol et
    const user = await this.prisma.extended.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Kullanıcının aktif statusunu tersine çevir
    const updatedUser = await this.prisma.extended.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    return updatedUser;
  }

  async updateRole(userId: string, newRole: string) {
    // Validate user exists
    const user = await this.prisma.extended.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Update role
    const updatedUser = await this.prisma.extended.user.update({
      where: { id: userId },
      data: {
        role: newRole as any,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    return updatedUser;
  }

  async getStats() {
    // Get total counts
    const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
      this.prisma.extended.user.count(),
      this.prisma.extended.user.count({ where: { isActive: true } }),
      this.prisma.extended.user.count({ where: { isActive: false } }),
    ]);

    // Get counts by role
    const roleStats = await this.prisma.extended.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    const byRole = roleStats.reduce((acc, stat) => {
      acc[stat.role] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole,
    };
  }
}

