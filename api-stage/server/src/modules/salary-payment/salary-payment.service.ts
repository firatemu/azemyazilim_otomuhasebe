import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateSalaryPaymentDto } from './dto/create-salary-payment.dto';
import { SalaryStatus, SalaryPaymentDetail } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SalaryPaymentService {
    constructor(private prisma: PrismaService) { }

    async createOdeme(dto: CreateSalaryPaymentDto, userId: string) {
        return this.prisma.extended.$transaction(async (tx) => {
            const plan = await tx.salaryPlan.findUnique({
                where: { id: dto.salaryPlanId },
            });

            if (!plan) throw new NotFoundException('Salary plan not found');

            const payment = await tx.salaryPayment.create({
                data: {
                    employeeId: dto.employeeId,
                    salaryPlanId: dto.salaryPlanId,
                    month: plan.month,
                    year: plan.year,
                    totalAmount: dto.amount,
                    paymentDate: dto.date ? new Date(dto.date) : new Date(),
                    notes: dto.notes,
                    createdBy: userId,
                    status: 'PENDING', // Default
                    paymentDetails: {
                        create: dto.paymentDetails.map(d => ({
                            cashboxId: d.cashboxId,
                            bankAccountId: d.bankAccountId,
                            amount: d.amount,
                            paymentMethod: d.paymentMethod,
                            referenceNo: d.referenceNo,
                            notes: d.notes,
                        }))
                    }
                }
            });

            // Update plan status and paid amounts
            const newPaidAmount = new Decimal(plan.paidAmount.toString()).add(new Decimal(dto.amount.toString()));
            const newRemainingAmount = new Decimal(plan.total.toString()).sub(newPaidAmount);

            let status: SalaryStatus = SalaryStatus.PARTIALLY_PAID;
            if (newRemainingAmount.lte(0)) {
                status = SalaryStatus.FULLY_PAID;
            }

            await tx.salaryPlan.update({
                where: { id: dto.salaryPlanId },
                data: {
                    paidAmount: newPaidAmount,
                    remainingAmount: newRemainingAmount,
                    status: status
                }
            });

            // Update Employee balance
            await tx.employee.update({
                where: { id: dto.employeeId },
                data: {
                    balance: { decrement: dto.amount }
                }
            });

            // Update Cashbox/Bank balances based on details
            for (const detail of dto.paymentDetails) {
                if (detail.cashboxId) {
                    await tx.cashbox.update({
                        where: { id: detail.cashboxId },
                        data: { balance: { decrement: detail.amount } }
                    });
                } else if (detail.bankAccountId) {
                    await tx.bankAccount.update({
                        where: { id: detail.bankAccountId },
                        data: { balance: { decrement: detail.amount } }
                    });
                }
            }

            return payment;
        });
    }

    async getOdemelerByPlan(salaryPlanId: string) {
        return this.prisma.extended.salaryPayment.findMany({
            where: { salaryPlanId },
            include: {
                paymentDetails: {
                    include: {
                        cashbox: { select: { name: true } },
                        bankAccount: { select: { name: true } }
                    }
                },
                createdByUser: { select: { fullName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getOdemelerByPersonel(employeeId: string, year: number) {
        return this.prisma.extended.salaryPayment.findMany({
            where: { employeeId, year },
            include: {
                paymentDetails: true,
                salaryPlan: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Placeholder for required methods in controller (to be implemented if needed)
    async exportExcel(year: number, month: number): Promise<any> {
        throw new BadRequestException('Excel export not implemented yet');
    }

    async generateMakbuz(id: string): Promise<any> {
        throw new BadRequestException('Makbuz generation not implemented yet');
    }
}