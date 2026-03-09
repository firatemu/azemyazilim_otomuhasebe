import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateAdvanceDto } from './dto/create-advance.dto';
import { MahsuplastirAdvanceDto } from './dto/mahsuplastir-advance.dto';
import { AdvanceStatus } from '@prisma/client';

@Injectable()
export class AdvanceService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
    ) { }

    /**
     * Advance ver
     */
    async createAdvance(createDto: CreateAdvanceDto, userId: string) {
        const employee = await this.prisma.extended.employee.findUnique({
            where: { id: createDto.employeeId },
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        if (!employee.isActive) {
            throw new BadRequestException('Advance cannot be given to a passive employee');
        }

        // Cashbox kontrolü
        if (createDto.cashboxId) {
            const cashbox = await this.prisma.extended.cashbox.findUnique({
                where: { id: createDto.cashboxId },
            });

            if (!cashbox || !cashbox.isActive) {
                throw new NotFoundException('Valid cashbox not found');
            }
        }

        return this.prisma.extended.$transaction(async (prisma) => {
            const date = createDto.date ? new Date(createDto.date) : new Date();

            // Advance kaydı oluştur
            const advance = await prisma.advance.create({
                data: {
                    employeeId: createDto.employeeId,
                    amount: createDto.amount,
                    date: createDto.date ? new Date(createDto.date) : new Date(),
                    notes: createDto.notes,
                    cashboxId: createDto.cashboxId,
                    settledAmount: 0,
                    remainingAmount: createDto.amount,
                    status: AdvanceStatus.OPEN,
                    createdBy: userId,
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeCode: true,
                        },
                    },
                    cashbox: {
                        select: { id: true, name: true },
                    },
                    createdByUser: {
                        select: { id: true, fullName: true },
                    },
                },
            });

            // Cashboxdan düş
            if (createDto.cashboxId) {
                const cashbox = await prisma.cashbox.findUnique({
                    where: { id: createDto.cashboxId },
                });

                if (cashbox) {
                    const yeniCashboxBakiye = Number(cashbox.balance) - createDto.amount;

                    if (yeniCashboxBakiye < 0) {
                        throw new BadRequestException('Not enough balance in the cashbox');
                    }

                    await prisma.cashbox.update({
                        where: { id: createDto.cashboxId },
                        data: { balance: yeniCashboxBakiye },
                    });
                }
            }

            return advance;
        });
    }

    /**
     * Advance mahsuplaştır
     */
    async mahsuplastir(mahsupDto: MahsuplastirAdvanceDto) {
        const advance = await this.prisma.extended.advance.findUnique({
            where: { id: mahsupDto.advanceId },
            include: {
                employee: true,
            },
        });

        if (!advance) {
            throw new NotFoundException('Advance not found');
        }

        if (advance.status === AdvanceStatus.CLOSED) {
            throw new BadRequestException('This advance is already closed');
        }

        // Toplam mahsup amountını hesapla
        const toplamMahsup = mahsupDto.planlar.reduce(
            (sum, plan) => sum + plan.amount,
            0,
        );

        if (toplamMahsup > Number(advance.remainingAmount)) {
            throw new BadRequestException(
                `Settlement amount (${toplamMahsup}) cannot be greater than remaining advance amount (${advance.remainingAmount})`,
            );
        }

        // Planları kontrol et
        for (const planDto of mahsupDto.planlar) {
            const plan = await this.prisma.extended.salaryPlan.findUnique({
                where: { id: planDto.planId },
            });

            if (!plan) {
                throw new NotFoundException(`Plan not found: ${planDto.planId}`);
            }

            if (plan.employeeId !== advance.employeeId) {
                throw new BadRequestException('Plan belongs to a different employee');
            }
        }

        return this.prisma.extended.$transaction(async (prisma) => {
            // Mahsuplaşmaları oluştur
            for (const planDto of mahsupDto.planlar) {
                await prisma.advanceSettlement.create({
                    data: {
                        advanceId: mahsupDto.advanceId,
                        salaryPlanId: planDto.planId,
                        amount: planDto.amount,
                        description: planDto.notes,
                    },
                });

                // Planın remainingAmount amountını azalt
                const plan = await prisma.salaryPlan.findUnique({
                    where: { id: planDto.planId },
                });

                if (plan) {
                    const yeniKalanTutar = Number(plan.remainingAmount) - planDto.amount;
                    await prisma.salaryPlan.update({
                        where: { id: planDto.planId },
                        data: {
                            remainingAmount: yeniKalanTutar < 0 ? 0 : yeniKalanTutar,
                        },
                    });
                }
            }

            // Advance statusunu güncelle
            const yeniMahsupEdilen = Number(advance.settledAmount) + toplamMahsup;
            const yeniKalan = Number(advance.amount) - yeniMahsupEdilen;

            let newStatus: AdvanceStatus;
            if (yeniKalan <= 0.01) {
                newStatus = AdvanceStatus.CLOSED;
            } else if (yeniMahsupEdilen > 0) {
                newStatus = AdvanceStatus.PARTIAL;
            } else {
                newStatus = AdvanceStatus.OPEN;
            }

            return prisma.advance.update({
                where: { id: mahsupDto.advanceId },
                data: {
                    settledAmount: yeniMahsupEdilen,
                    remainingAmount: yeniKalan,
                    status: newStatus,
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeCode: true,
                        },
                    },
                    settlements: {
                        include: {
                            salaryPlan: {
                                select: {
                                    year: true,
                                    month: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }

    /**
     * Employee advancelarını getir
     */
    async getAdvanceByEmployee(employeeId: string) {
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

        return this.prisma.extended.advance.findMany({
            where: { employeeId },
            include: {
                cashbox: {
                    select: { id: true, name: true },
                },
                settlements: {
                    include: {
                        salaryPlan: {
                            select: {
                                year: true,
                                month: true,
                            },
                        },
                    },
                },
                createdByUser: {
                    select: { id: true, fullName: true },
                },
            },
            orderBy: { date: 'desc' },
        });
    }

    /**
     * Advance detayı
     */
    async getAdvanceDetay(id: string) {
        const advance = await this.prisma.extended.advance.findUnique({
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
                cashbox: {
                    select: { id: true, name: true },
                },
                settlements: {
                    include: {
                        salaryPlan: {
                            select: {
                                year: true,
                                month: true,
                                total: true,
                            },
                        },
                    },
                    orderBy: { date: 'desc' },
                },
                createdByUser: {
                    select: { id: true, fullName: true },
                },
            },
        });

        if (!advance) {
            throw new NotFoundException('Advance not found');
        }

        return advance;
    }
}
