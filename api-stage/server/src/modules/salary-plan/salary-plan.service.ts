import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateSalaryPlanDto } from './dto/create-salary-plan.dto';
import { UpdateSalaryPlanDto } from './dto/update-salary-plan.dto';
import { SalaryStatus } from '@prisma/client';

@Injectable()
export class SalaryPlanService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
    ) { }

    /**
     * Employee için 12 monthlık maaş planı oluşturur
     * Employeein işe başlama tarihinden itibaren planlar doldurulur
     */
    async createPlanForEmployee(createDto: CreateSalaryPlanDto) {
        const employee = await this.prisma.extended.employee.findUnique({
            where: { id: createDto.employeeId },
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        // Maaş ve bonus bilgilerini al (DTO'dan veya employeeden)
        const salary = createDto.salary ?? employee.salary ?? 0;
        const bonus = createDto.bonus ?? employee.bonus ?? 0;
        const total = Number(salary) + Number(bonus);

        // İşe başlama tarihi
        const startDate = employee.startDate
            ? new Date(employee.startDate)
            : new Date();
        const baslamaAy = startDate.getMonth() + 1; // 1-12

        // Mevcut planları kontrol et
        const mevcutPlanlar = await this.prisma.extended.salaryPlan.findMany({
            where: {
                employeeId: createDto.employeeId,
                year: createDto.year,
            },
        });

        if (mevcutPlanlar.length > 0) {
            throw new BadRequestException(
                `Plan for year ${createDto.year} already exists`,
            );
        }

        // 12 monthlık plan oluştur
        const planlar: any[] = [];
        for (let month = 1; month <= 12; month++) {
            // Employee bu monthda çalışıyor mu?
            const monthinYili = createDto.year;
            const employeeCalisiyorMu =
                monthinYili > startDate.getFullYear() ||
                (monthinYili === startDate.getFullYear() && month >= baslamaAy);

            // Çıkış tarihi varsa kontrol et
            let isActive = employeeCalisiyorMu;
            if (employee.endDate) {
                const cikisTarihi = new Date(employee.endDate);
                const cikisYili = cikisTarihi.getFullYear();
                const cikisAyi = cikisTarihi.getMonth() + 1;

                if (
                    monthinYili > cikisYili ||
                    (monthinYili === cikisYili && month > cikisAyi)
                ) {
                    isActive = false;
                }
            }

            const planMaas = isActive ? salary : 0;
            const planPrim = isActive ? bonus : 0;
            const planToplam = Number(planMaas) + Number(planPrim);

            planlar.push({
                employeeId: createDto.employeeId,
                year: createDto.year,
                month,
                salary: planMaas,
                bonus: planPrim,
                total: planToplam,
                status: SalaryStatus.UNPAID,
                paidAmount: 0,
                remainingAmount: planToplam,
                isActive,
            });
        }

        // Toplu oluştur
        const result = await this.prisma.extended.salaryPlan.createMany({
            data: planlar,
        });

        return {
            message: `12-month plan created for year ${createDto.year}`,
            count: result.count,
            year: createDto.year,
            employeeId: createDto.employeeId,
        };
    }

    /**
     * Employeein yıllık planını getir
     */
    async getPlanByEmployee(employeeId: string, year: number) {
        const tenantId = await this.tenantResolver.resolveForQuery();

        const employee = await this.prisma.extended.employee.findFirst({
            where: {
                id: employeeId,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        const planlar = await this.prisma.extended.salaryPlan.findMany({
            where: {
                employeeId,
                year,
            },
            include: {
                payments: {
                    include: {
                        paymentDetails: {
                            include: {
                                cashbox: { select: { id: true, name: true } },
                                bankAccount: { select: { id: true, name: true } },
                            },
                        },
                        createdByUser: {
                            select: { id: true, fullName: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                settlements: {
                    include: {
                        advance: {
                            select: { id: true, amount: true, date: true },
                        },
                    },
                },
            },
            orderBy: { month: 'asc' },
        });

        return {
            employee: {
                id: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                employeeCode: employee.employeeCode,
                salary: employee.salary,
                bonus: employee.bonus,
            },
            year,
            planlar,
        };
    }

    /**
     * Tek plan detmonthı
     */
    async getPlanById(id: string) {
        const plan = await this.prisma.extended.salaryPlan.findUnique({
            where: { id },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeCode: true,
                    },
                },
                payments: {
                    include: {
                        paymentDetails: {
                            include: {
                                cashbox: { select: { id: true, name: true } },
                                bankAccount: { select: { id: true, name: true } },
                            },
                        },
                        createdByUser: {
                            select: { id: true, fullName: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                settlements: {
                    include: {
                        advance: true,
                    },
                },
            },
        });

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        return plan;
    }

    /**
     * Plan güncelle
     */
    async updatePlan(id: string, updateDto: UpdateSalaryPlanDto) {
        const existing = await this.prisma.extended.salaryPlan.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('Plan not found');
        }

        const updateData: any = { ...updateDto };

        // Maaş veya bonus değiştiyse total ve kalan amountı yeniden hesapla
        if (updateDto.salary !== undefined || updateDto.bonus !== undefined) {
            const yeniMaas = updateDto.salary ?? existing.salary;
            const yeniPrim = updateDto.bonus ?? existing.bonus;
            updateData.total = Number(yeniMaas) + Number(yeniPrim);
            updateData.remainingAmount =
                Number(updateData.total) - Number(existing.paidAmount);
        }

        return this.prisma.extended.salaryPlan.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Belirli monthdaki ödenecek maaşları getir
     */
    async getOdenecekMaaslar(year: number, month: number) {
        console.log(`getOdenecekMaaslar called for ${year}/${month}`);
        try {
            const tenantId = await this.tenantResolver.resolveForQuery();
            console.log('Tenant resolved:', tenantId);


            const planlar = await this.prisma.extended.salaryPlan.findMany({
                where: {
                    year,
                    month,
                    isActive: true,
                    status: {
                        in: [SalaryStatus.UNPAID, SalaryStatus.PARTIALLY_PAID],
                    },
                    employee: {
                        ...buildTenantWhereClause(tenantId ?? undefined),
                        isActive: true,
                    },
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeCode: true,
                            department: true,
                        },
                    },
                },
                orderBy: {
                    employee: {
                        firstName: 'asc',
                    },
                },
            });

            // Decimal alanları number'a çevir
            const safePlanlar = planlar.map(p => ({
                ...p,
                salary: Number(p.salary),
                bonus: Number(p.bonus),
                total: Number(p.total),
                paidAmount: Number(p.paidAmount),
                remainingAmount: Number(p.remainingAmount),
            }));

            const total = planlar.reduce(
                (sum, plan) => sum + Number(plan.remainingAmount),
                0,
            );

            return {
                year,
                month,
                planlar: safePlanlar,
                totalOdenecek: total,
                employeeCount: planlar.length,
            };
        } catch (error) {
            console.error('getOdenecekMaaslar ERROR:', error);
            throw error;
        }
    }

    /**
     * Planı sil
     */
    async deletePlan(id: string) {
        const plan = await this.prisma.extended.salaryPlan.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { payments: true },
                },
            },
        });

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        if (plan._count.payments > 0) {
            throw new BadRequestException(
                'There are payment records for this plan. You must delete the payments first.',
            );
        }

        return this.prisma.extended.salaryPlan.delete({
            where: { id },
        });
    }

    /**
     * Yıllık planı sil (tüm monthlar)
     */
    async deleteYillikPlan(employeeId: string, year: number) {
        const planlar = await this.prisma.extended.salaryPlan.findMany({
            where: { employeeId, year },
            include: {
                _count: { select: { payments: true } },
            },
        });

        const odemeliPlanlar = planlar.filter((p) => p._count.payments > 0);
        if (odemeliPlanlar.length > 0) {
            throw new BadRequestException(
                'There are payment records for some plans. You must delete the payments first.',
            );
        }

        const result = await this.prisma.extended.salaryPlan.deleteMany({
            where: { employeeId, year },
        });

        return {
            message: `Plan for year ${year} deleted`,
            count: result.count,
        };
    }
}
