import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) { }

  async create(createDto: CreateExpenseDto) {
    const tenantId = await this.tenantResolver.resolveForCreate();
    // Category kontrolü
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id: createDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    return this.prisma.expense.create({
      data: {
        tenantId: tenantId!,
        categoryId: createDto.categoryId,
        referenceNo: createDto.referenceNo?.trim() || null,
        notes: createDto.notes?.trim() || null,
        amount: createDto.amount,
        date: new Date(createDto.date),
        paymentType: createDto.paymentType || null,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(
    page = 1,
    limit = 50,
    categoryId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!expense) {
      throw new NotFoundException('Expense record not found');
    }

    return expense;
  }

  async update(id: string, updateDto: UpdateExpenseDto) {
    const existing = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Expense record not found');
    }

    const updateData: any = { ...updateDto };
    if (updateDto.date) {
      updateData.date = new Date(updateDto.date);
    }
    // Boş string'i null'a çevir (nullable field için)
    if (updateDto.notes !== undefined) {
      updateData.notes = updateDto.notes?.trim() || null;
    }

    return this.prisma.expense.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Expense record not found');
    }

    return this.prisma.expense.delete({
      where: { id },
    });
  }

  async getStats(
    categoryId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.ExpenseWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [toplam, categoryBazli] = await Promise.all([
      this.prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.expenseCategory.findMany({
        include: {
          _count: {
            select: { expenses: true },
          },
          expenses: {
            where,
            select: { amount: true },
          },
        },
      }),
    ]);

    const categoryler = categoryBazli.map((k) => ({
      categoryId: k.id,
      name: k.name,
      adet: k._count.expenses,
      toplam: k.expenses.reduce((sum, m) => sum + Number(m.amount), 0),
    }));

    return {
      toplamExpense: toplam._sum.amount || 0,
      toplamAdet: toplam._count,
      categoryler,
    };
  }

  // Category işlemleri
  async findAllCategoryler() {
    const tenantId = await this.tenantResolver.resolveForQuery();
    return this.prisma.expenseCategory.findMany({
      where: buildTenantWhereClause(tenantId ?? undefined),
      include: {
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(name: string, notes?: string) {
    const tenantId = await this.tenantResolver.resolveForCreate();
    return this.prisma.expenseCategory.create({
      data: { tenantId: tenantId!, name, notes },
    });
  }

  async updateCategory(id: string, name: string, notes?: string) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.expenseCategory.update({
      where: { id },
      data: { name, notes },
    });
  }

  async removeCategory(id: string) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (existing._count.expenses > 0) {
      throw new BadRequestException(
        'Bu categoryde expense kayıtları var, silinemez',
      );
    }

    return this.prisma.expenseCategory.delete({
      where: { id },
    });
  }
}
