import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateEmployeeOdemeDto } from './dto/create-employee-payment.dto';
import { Prisma, EmployeePaymentType } from '@prisma/client';
import { CodeTemplateService } from '../code-template/code-template.service';
import { ModuleType } from '../code-template/code-template.enums';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
  ) { }

  async create(createDto: CreateEmployeeDto, userId: string) {
    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    if (createDto.identityNumber && tenantId) {
      const existingTc = await this.prisma.extended.employee.findFirst({
        where: {
          identityNumber: createDto.identityNumber,
          tenantId,
        },
      });
      if (existingTc) {
        throw new BadRequestException(
          'Bu TC Kimlik No ile kayıtlı employee var',
        );
      }
    }

    if (!createDto.employeeCode) {
      try {
        createDto.employeeCode =
          await this.codeTemplateService.getNextCode(ModuleType.PERSONNEL);
      } catch (error) {
        throw new Error(
          'Employee kodu girilmeli veya otomatik kod şablonu tanımlanmalı',
        );
      }
    }

    const finalTenantId = (createDto as any).tenantId ?? tenantId;
    if (finalTenantId) {
      const existingKod = await this.prisma.extended.employee.findFirst({
        where: {
          employeeCode: createDto.employeeCode,
          tenantId: finalTenantId,
        },
      });
      if (existingKod) {
        throw new BadRequestException('Bu employee kodu kullanılıyor');
      }
    }

    const data: any = {
      employeeCode: createDto.employeeCode,
      identityNumber: createDto.identityNumber,
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      phone: createDto.phone,
      email: createDto.email,
      address: createDto.address,
      city: createDto.il,
      district: createDto.district,
      position: createDto.pozisyon,
      department: createDto.department,
      salary: createDto.salary,
      salaryDay: createDto.salaryGunu,
      socialSecurityNo: createDto.sgkNo,
      iban: createDto.ibanNo,
      notes: createDto.notes,
      ...(finalTenantId != null && { tenantId: finalTenantId }),
      createdBy: userId,
    };

    if (createDto.birthDate) {
      data.birthDate = new Date(createDto.birthDate);
    }
    if (createDto.startDate) {
      data.startDate = new Date(createDto.startDate);
    }
    if (createDto.endDate) {
      data.endDate = new Date(createDto.endDate);
    }

    return this.prisma.extended.employee.create({
      data,
      include: {
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });
  }

  async findAll(isActive?: boolean, department?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: Prisma.EmployeeWhereInput = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (department) {
      where.department = department;
    }

    return this.prisma.extended.employee.findMany({
      where,
      include: {
        _count: {
          select: { payments: true },
        },
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
        updatedByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const employee = await this.prisma.extended.employee.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        payments: {
          include: {
            cashbox: {
              select: { id: true, name: true },
            },
            createdByUser: {
              select: { id: true, fullName: true, username: true },
            },
          },
          orderBy: { date: 'desc' },
          take: 50,
        },
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
        updatedByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(id: string, updateDto: UpdateEmployeeDto, userId: string) {
    const existing = await this.prisma.extended.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Employee not found');
    }

    const updateData: any = {
      employeeCode: updateDto.employeeCode,
      identityNumber: updateDto.identityNumber,
      firstName: updateDto.firstName,
      lastName: updateDto.lastName,
      phone: updateDto.phone,
      email: updateDto.email,
      address: updateDto.address,
      city: updateDto.il,
      district: updateDto.district,
      position: updateDto.pozisyon,
      department: updateDto.department,
      salary: updateDto.salary,
      salaryDay: updateDto.salaryGunu,
      socialSecurityNo: updateDto.sgkNo,
      iban: updateDto.ibanNo,
      notes: updateDto.notes,
      updatedBy: userId,
    };

    if (updateDto.birthDate) {
      updateData.birthDate = new Date(updateDto.birthDate);
    }
    if (updateDto.startDate) {
      updateData.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      updateData.endDate = new Date(updateDto.endDate);
    }

    return this.prisma.extended.employee.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
        updatedByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });
  }

  async remove(id: string) {
    const employee = await this.prisma.extended.employee.findUnique({
      where: { id },
      include: {
        _count: { select: { payments: true } },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee._count.payments > 0) {
      throw new BadRequestException(
        'Bu employeee ait ödeme kayıtları var. Önce bunları silmeniz gerekir.',
      );
    }

    return this.prisma.extended.employee.delete({
      where: { id },
    });
  }

  // Ödeme işlemleri
  async createOdeme(createOdemeDto: CreateEmployeeOdemeDto, userId: string) {
    const employee = await this.prisma.extended.employee.findUnique({
      where: { id: createOdemeDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (!employee.isActive) {
      throw new BadRequestException('Pasif employeee ödeme yapılamaz');
    }

    // Kasa varsa kontrol et
    if (createOdemeDto.cashboxId) {
      const cashbox = await this.prisma.extended.cashbox.findUnique({
        where: { id: createOdemeDto.cashboxId },
      });

      if (!cashbox || !cashbox.isActive) {
        throw new NotFoundException('Valid cashbox not found');
      }
    }

    return this.prisma.extended.$transaction(async (prisma) => {
      const date = createOdemeDto.date
        ? new Date(createOdemeDto.date)
        : new Date();

      // Ödeme kaydı oluştur
      const odeme = await prisma.employeePayment.create({
        data: {
          employeeId: createOdemeDto.employeeId,
          type: createOdemeDto.tip as any,
          amount: createOdemeDto.amount,
          date: date,
          period: createOdemeDto.donem,
          notes: createOdemeDto.notes,
          cashboxId: createOdemeDto.cashboxId,
          createdBy: userId,
        },
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeCode: true },
          },
          cashbox: {
            select: { id: true, name: true },
          },
          createdByUser: {
            select: { id: true, fullName: true, username: true },
          },
        },
      });

      // Employee bakiyesini güncelle
      // Bakiye mantığı: Pozitif bakiye = Employeee ödenecek, Negatif bakiye = Employeeden alınacak (fazla ödeme)
      let yeniBakiye = Number(employee.balance);

      switch (createOdemeDto.tip) {
        case EmployeePaymentType.ENTITLEMENT:
          // Hak ediş tanımlandı -> employeein alacağı artar (bakiye artar)
          yeniBakiye += createOdemeDto.amount;
          break;
        case EmployeePaymentType.SALARY:
        case EmployeePaymentType.BONUS:
        case EmployeePaymentType.ADVANCE:
          // Ödeme yapıldı -> employeein alacağı azalır (bakiye azalır)
          yeniBakiye -= createOdemeDto.amount;
          break;
        case EmployeePaymentType.DEDUCTION:
          // Kesinti -> employeein alacağı artar (ödenmeyecek quantity artar)
          yeniBakiye += createOdemeDto.amount;
          break;
        case EmployeePaymentType.ALLOCATION:
          // Zimmet -> employeein borcu artar (bakiye azalır)
          yeniBakiye -= createOdemeDto.amount;
          break;
        case EmployeePaymentType.ALLOCATION_RETURN:
          // Zimmet iadesi -> employeein borcu azalır (bakiye artar)
          yeniBakiye += createOdemeDto.amount;
          break;
      }

      await prisma.employee.update({
        where: { id: createOdemeDto.employeeId },
        data: { balance: yeniBakiye },
      });

      // Kasadan ödendi ise kasa bakiyesini güncelle
      if (createOdemeDto.cashboxId) {
        const cashbox = await prisma.cashbox.findUnique({
          where: { id: createOdemeDto.cashboxId },
        });

        if (cashbox) {
          const yeniKasaBakiye =
            createOdemeDto.tip === (EmployeePaymentType.ALLOCATION_RETURN as any)
              ? Number(cashbox.balance) + createOdemeDto.amount // Zimmet iadesi -> kasa artar
              : Number(cashbox.balance) - createOdemeDto.amount; // Ödeme -> kasa azalır

          if (
            yeniKasaBakiye < 0 &&
            createOdemeDto.tip !== (EmployeePaymentType.ALLOCATION_RETURN as any)
          ) {
            throw new BadRequestException('Kasada yeterli bakiye yok');
          }

          await prisma.cashbox.update({
            where: { id: createOdemeDto.cashboxId },
            data: { balance: yeniKasaBakiye },
          });
        }
      }

      return odeme;
    });
  }

  async getOdemeler(employeeId: string) {
    return this.prisma.extended.employeePayment.findMany({
      where: { employeeId: employeeId },
      include: {
        cashbox: {
          select: { id: true, name: true },
        },
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getStats(department?: string, isActive?: boolean) {
    const where: Prisma.EmployeeWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (department) {
      where.department = department;
    }

    const [employeeler, toplamMaas, departmentlar] = await Promise.all([
      this.prisma.extended.employee.count({ where }),
      this.prisma.extended.employee.aggregate({
        where,
        _sum: { salary: true, balance: true },
      }),
      this.prisma.extended.employee.groupBy({
        by: ['department'],
        where,
        _count: true,
        _sum: { salary: true },
      }),
    ]);

    return {
      toplamEmployee: employeeler,
      toplamMaasBordro: toplamMaas._sum.salary || 0,
      toplamBakiye: toplamMaas._sum.balance || 0,
      departmentlar: departmentlar.map((d) => ({
        department: d.department || 'Belirtilmemiş',
        employeeSayisi: d._count,
        toplamMaas: d._sum.salary || 0,
      })),
    };
  }

  async getDepartmanlar() {
    const result = await this.prisma.extended.employee.groupBy({
      by: ['department'],
      _count: true,
    });

    return result
      .filter((r) => r.department)
      .map((r) => ({
        department: r.department,
        employeeSayisi: r._count,
      }));
  }
}
