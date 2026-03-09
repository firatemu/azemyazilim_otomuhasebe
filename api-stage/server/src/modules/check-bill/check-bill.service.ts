import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCheckBillDto, UpdateCheckBillDto } from './dto/create-check-bill.dto';
import { CheckBillActionDto } from './dto/check-bill-transaction.dto';
import { CheckBillStatus, PortfolioType, CashboxMovementType, BankMovementType } from '@prisma/client';

@Injectable()
export class CheckBillService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: any) {
        const { tenantId, ...where } = query;
        return this.prisma.extended.extended.checkBill.findMany({
            where: {
                ...where,
                deletedAt: null
            },
            include: {
                account: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
    }

    async findOne(id: string) {
        const checkBill = await this.prisma.extended.extended.checkBill.findUnique({
            where: { id },
            include: {
                account: true,
                journalItems: {
                    include: {
                        journal: true
                    }
                }
            }
        });

        if (!checkBill || checkBill.deletedAt) {
            throw new NotFoundException('Document not found');
        }

        return checkBill;
    }

    async getUpcomingChecks(startDate: Date, endDate: Date) {
        return this.prisma.extended.extended.checkBill.findMany({
            where: {
                dueDate: {
                    gte: startDate,
                    lte: endDate
                },
                status: {
                    in: [CheckBillStatus.IN_PORTFOLIO, CheckBillStatus.GIVEN_TO_BANK]
                },
                deletedAt: null
            },
            include: {
                account: { select: { title: true } }
            },
            orderBy: { dueDate: 'asc' }
        });
    }

    async processAction(dto: CheckBillActionDto, userId: string) {
        return this.prisma.extended.extended.$transaction(async (tx) => {
            const checkBill = await tx.checkBill.findUnique({
                where: { id: dto.checkBillId }
            });

            if (!checkBill) throw new NotFoundException('Document not found');

            // Update Status
            const updated = await tx.checkBill.update({
                where: { id: dto.checkBillId },
                data: {
                    status: dto.newStatus,
                    updatedBy: userId
                }
            });

            // Financial Integration
            if (dto.newStatus === CheckBillStatus.COLLECTED) {
                if (dto.cashboxId) {
                    await tx.cashboxMovement.create({
                        data: {
                            cashboxId: dto.cashboxId,
                            movementType: CashboxMovementType.COLLECTION,
                            amount: dto.transactionAmount,
                            balance: 0,
                            notes: dto.notes || 'Check Collection',
                            date: new Date(dto.date),
                            accountId: checkBill.accountId,
                            createdBy: userId
                        }
                    });
                } else if (dto.bankAccountId) {
                    await tx.bankAccountMovement.create({
                        data: {
                            bankAccountId: dto.bankAccountId,
                            movementType: BankMovementType.INCOMING,
                            amount: dto.transactionAmount,
                            balance: 0,
                            notes: dto.notes || 'Check Collection',
                            date: new Date(dto.date),
                            accountId: checkBill.accountId,
                        }
                    });
                }
            }

            return updated;
        });
    }

    async create(dto: CreateCheckBillDto, checkBillJournalId?: string) {
        return this.prisma.extended.extended.checkBill.create({
            data: {
                type: dto.type,
                portfolioType: PortfolioType.CREDIT, // Default
                amount: dto.amount,
                remainingAmount: dto.amount,
                dueDate: new Date(dto.dueDate),
                accountId: (dto as any).accountId, // Direct use if provided
                bank: dto.bank,
                branch: dto.branch,
                accountNo: dto.accountNo,
                checkNo: dto.checkNo,
                status: CheckBillStatus.IN_PORTFOLIO,
                notes: dto.notes,
                lastJournalId: checkBillJournalId
            }
        });
    }

    async update(id: string, dto: UpdateCheckBillDto) {
        return this.prisma.extended.extended.checkBill.update({
            where: { id },
            data: {
                checkNo: dto.checkNo,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                bank: dto.bank,
                branch: dto.branch,
                accountNo: dto.accountNo,
                notes: dto.notes
            }
        });
    }

    async remove(id: string) {
        return this.prisma.extended.extended.checkBill.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
