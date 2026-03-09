import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BankAccountType, BankMovementType, BankMovementSubType, LoanType, LoanStatus, CreditPlanStatus } from '@prisma/client';
import { CreateBankDto, UpdateBankDto } from './dto/create-bank.dto';
import { BankAccountCreateDto, BankAccountUpdateDto } from './dto/create-account.dto';
import { CreateBankHareketDto, CreatePosHareketDto } from './dto/create-movement.dto';
import { CreateLoanKullanimDto } from './dto/create-loan.dto';
import { PayCreditInstallmentDto, PaymentType } from './dto/pay-credit-installment.dto';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BankService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
    ) { }

    // ============ BANK CRUD ============

    async create(createBankDto: CreateBankDto) {
        const tenantId = this.tenantContext.getTenantId();
        return this.prisma.extended.bank.create({
            data: {
                ...createBankDto,
                tenantId,
            },
            include: {
                accounts: true,
            },
        });
    }

    async findAll() {
        const tenantId = this.tenantContext.getTenantId();
        return this.prisma.extended.bank.findMany({
            where: { tenantId },
            include: {
                accounts: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        balance: true,
                        accountNo: true,
                        iban: true,
                    }
                },
                _count: {
                    select: { accounts: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const tenantId = this.tenantContext.getTenantId();
        const bank = await this.prisma.extended.bank.findFirst({
            where: { id, tenantId },
            include: {
                accounts: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        loans: {
                            include: {
                                plans: true
                            }
                        }
                    }
                },
            },
        });

        if (!bank) {
            throw new NotFoundException(`Bank #id not found`);
        }

        return bank;
    }

    async update(id: string, updateBankDto: UpdateBankDto) {
        await this.findOne(id);
        return this.prisma.extended.bank.update({
            where: { id },
            data: updateBankDto,
        });
    }

    async remove(id: string) {
        const bank = await this.findOne(id);
        const accountIds = bank.accounts.map(h => h.id);

        if (accountIds.length > 0) {
            const [hareketCount, havaleCount, tahsilatCount, salaryCount, loanCount] = await Promise.all([
                this.prisma.extended.bankAccountMovement.count({ where: { bankAccountId: { in: accountIds } } }),
                this.prisma.extended.bankTransfer.count({ where: { bankAccountId: { in: accountIds } } }), // CHECK FIELD NAME
                this.prisma.extended.collection.count({ where: { bankAccountId: { in: accountIds } } }),
                this.prisma.extended.salaryPaymentDetail.count({ where: { bankAccountId: { in: accountIds } } }),
                this.prisma.extended.bankLoan.count({ where: { bankAccountId: { in: accountIds } } }),
            ]);

            if (hareketCount > 0 || havaleCount > 0 || tahsilatCount > 0 || salaryCount > 0 || loanCount > 0) {
                throw new BadRequestException('Bank üzerinde işlem görmüş hesaplar bulunduğu için silinemez. Pasife alabilirsiniz.');
            }
        }

        return this.prisma.extended.bank.delete({ where: { id } });
    }

    // ============ HESAP İŞLEMLERİ ============

    async createAccount(bankId: string, createHesapDto: BankAccountCreateDto) {
        await this.findOne(bankId);

        return this.prisma.extended.bankAccount.create({
            data: {
                bankId,
                code: createHesapDto.code || `ACC-${Date.now()}`,
                name: createHesapDto.name,
                accountNo: createHesapDto.accountNo,
                iban: createHesapDto.iban,
                type: createHesapDto.type,
                commissionRate: createHesapDto.commissionRate,
                creditLimit: createHesapDto.creditLimit,
                cardLimit: createHesapDto.cardLimit,
                isActive: createHesapDto.isActive ?? true,
            },
        });
    }

    async findAccount(accountId: string) {
        const tenantId = this.tenantContext.getTenantId();
        const hesap = await this.prisma.extended.bankAccount.findUnique({
            where: { id: accountId },
            include: {
                bank: true,
            },
        });

        if (!hesap || hesap.bank.tenantId !== tenantId) {
            throw new NotFoundException('Bank account not found');
        }

        return hesap;
    }

    async updateAccount(accountId: string, updateHesapDto: BankAccountUpdateDto) {
        await this.findAccount(accountId);

        return this.prisma.extended.bankAccount.update({
            where: { id: accountId },
            data: {
                name: updateHesapDto.name,
                accountNo: updateHesapDto.accountNo,
                iban: updateHesapDto.iban,
                isActive: updateHesapDto.isActive,
            },
        });
    }

    async removeAccount(accountId: string) {
        const hesap = await this.findAccount(accountId);

        const [hareketCount, havaleCount, tahsilatCount, salaryCount, loanCount] = await Promise.all([
            this.prisma.extended.bankAccountMovement.count({ where: { bankAccountId: accountId } }),
            this.prisma.extended.bankTransfer.count({ where: { bankAccountId: accountId } }),
            this.prisma.extended.collection.count({ where: { bankAccountId: accountId } }),
            this.prisma.extended.salaryPaymentDetail.count({ where: { bankAccountId: accountId } }),
            this.prisma.extended.bankLoan.count({ where: { bankAccountId: accountId } }),
        ]);

        if (hareketCount > 0 || havaleCount > 0 || tahsilatCount > 0 || salaryCount > 0 || loanCount > 0) {
            return this.prisma.extended.bankAccount.update({
                where: { id: accountId },
                data: { isActive: false },
            });
        }

        return this.prisma.extended.bankAccount.delete({ where: { id: accountId } });
    }

    // ============ HAREKET İŞLEMLERİ ============

    async createHareket(accountId: string, dto: CreateBankHareketDto) {
        const hesap = await this.findAccount(accountId);

        const currentBalance = new Decimal(hesap.balance.toString());
        const amount = new Decimal(dto.amount);
        const yeniBakiye = dto.movementType === BankMovementType.INCOMING
            ? currentBalance.add(amount)
            : currentBalance.sub(amount);

        return this.prisma.extended.$transaction(async (tx) => {
            const hareket = await tx.bankAccountMovement.create({
                data: {
                    bankAccountId: accountId,
                    movementType: dto.movementType,
                    movementSubType: dto.movementSubType,
                    amount: amount,
                    balance: yeniBakiye,
                    notes: dto.notes,
                    referenceNo: dto.referenceNo,
                    date: dto.date ? new Date(dto.date) : new Date(),
                },
            });

            await tx.bankAccount.update({
                where: { id: accountId },
                data: { balance: yeniBakiye },
            });

            return hareket;
        });
    }

    async createPosHareket(accountId: string, dto: CreatePosHareketDto) {
        const hesap = await this.findAccount(accountId);

        if (hesap.type !== BankAccountType.POS) {
            throw new BadRequestException('Sadece POS hesapları için POS hareketi oluşturulabilir');
        }

        const currentBalance = new Decimal(hesap.balance.toString());
        const amount = new Decimal(dto.amount);
        const komisyonOrani = new Decimal(hesap.commissionRate?.toString() || '0');
        const komisyonTutar = amount.mul(komisyonOrani).div(100);
        const netTutar = amount.sub(komisyonTutar);
        const yeniBakiye = currentBalance.add(netTutar);

        return this.prisma.extended.$transaction(async (tx) => {
            const hareket = await tx.bankAccountMovement.create({
                data: {
                    bankAccountId: accountId,
                    movementType: BankMovementType.INCOMING,
                    movementSubType: BankMovementSubType.POS_COLLECTION,
                    amount: amount,
                    commissionRate: komisyonOrani,
                    commissionAmount: komisyonTutar,
                    netAmount: netTutar,
                    balance: yeniBakiye,
                    notes: dto.notes || `POS Collection - Komisyon: %${komisyonOrani}`,
                    referenceNo: dto.referenceNo,
                    date: dto.date ? new Date(dto.date) : new Date(),
                },
            });

            await tx.bankAccount.update({
                where: { id: accountId },
                data: { balance: yeniBakiye },
            });

            return hareket;
        });
    }

    async getHareketler(accountId: string, options?: { baslangic?: Date; bitis?: Date; limit?: number }) {
        await this.findAccount(accountId);

        const where: any = { bankAccountId: accountId };
        if (options?.baslangic || options?.bitis) {
            where.date = {};
            if (options.baslangic) where.date.gte = options.baslangic;
            if (options.bitis) where.date.lte = options.bitis;
        }

        return this.prisma.extended.bankAccountMovement.findMany({
            where,
            orderBy: { date: 'desc' },
            take: options?.limit || 50,
        });
    }

    // ============ KREDİ İŞLEMLERİ ============

    async loanKullan(accountId: string, dto: CreateLoanKullanimDto) {
        const hesap = await this.findAccount(accountId);

        if (hesap.type !== BankAccountType.LOAN) {
            throw new BadRequestException('Sadece KREDİ hesapları için loan kullanımı oluşturulabilir');
        }

        const amount = new Decimal(dto.amount);
        const installmentCount = dto.installmentCount;
        const startDate = new Date(dto.startDate);
        const firstInstallmentDate = new Date(dto.firstInstallmentDate);

        const installmentAmount = new Decimal(dto.installmentAmount);
        const totalRepayment = installmentAmount.mul(installmentCount);
        const totalInterest = totalRepayment.sub(amount);

        const plans: any[] = [];
        for (let i = 0; i < installmentCount; i++) {
            const dueDate = new Date(firstInstallmentDate);
            dueDate.setMonth(dueDate.getMonth() + i);

            plans.push({
                installmentNo: i + 1,
                dueDate: dueDate,
                amount: installmentAmount,
                status: CreditPlanStatus.PENDING
            });
        }

        return this.prisma.extended.$transaction(async (tx) => {
            const loan = await tx.bankLoan.create({
                data: {
                    bankAccountId: accountId,
                    amount: amount,
                    totalRepayment: totalRepayment,
                    totalInterest: totalInterest,
                    installmentCount: installmentCount,
                    startDate: startDate,
                    notes: dto.notes,
                    loanType: dto.loanType,
                    annualInterestRate: new Decimal(dto.annualInterestRate),
                    paymentFrequency: dto.paymentFrequency || 1,
                    status: LoanStatus.ACTIVE,
                    plans: {
                        create: plans
                    }
                }
            });

            const yeniBakiye = new Decimal(hesap.balance.toString()).add(amount);
            await tx.bankAccountMovement.create({
                data: {
                    bankAccountId: accountId,
                    movementType: BankMovementType.INCOMING,
                    movementSubType: BankMovementSubType.LOAN_USAGE,
                    amount: amount,
                    balance: yeniBakiye,
                    notes: `Loan Kullanımı - ${dto.loanType} - %${dto.annualInterestRate} Faiz`,
                    date: startDate,
                }
            });

            await tx.bankAccount.update({
                where: { id: accountId },
                data: { balance: yeniBakiye }
            });

            return loan;
        });
    }

    async payInstallment(planId: string, dto: PayCreditInstallmentDto) {
        return this.prisma.extended.$transaction(async (tx) => {
            const plan = await tx.bankLoanPlan.findUnique({
                where: { id: planId },
                include: { loan: { include: { bankAccount: true } } }
            });

            if (!plan) throw new NotFoundException('Installment plan not found');

            const paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();
            const amount = new Decimal(dto.amount);
            const newPaidAmount = new Decimal(plan.paidAmount.toString()).add(amount);
            const isFullyPaid = newPaidAmount.gte(plan.amount);

            await tx.bankLoanPlan.update({
                where: { id: planId },
                data: {
                    paidAmount: newPaidAmount,
                    status: isFullyPaid ? CreditPlanStatus.PAID : CreditPlanStatus.PARTIALLY_PAID
                }
            });

            const currentBalance = new Decimal(plan.loan.bankAccount.balance.toString());
            const yeniBakiye = currentBalance.sub(amount);

            await tx.bankAccountMovement.create({
                data: {
                    bankAccountId: plan.loan.bankAccountId,
                    movementType: BankMovementType.OUTGOING,
                    movementSubType: BankMovementSubType.LOAN_INSTALLMENT_PAYMENT,
                    amount: amount,
                    balance: yeniBakiye,
                    notes: dto.notes || `Loan Installment Ödemesi - Installment #${plan.installmentNo}`,
                    date: paymentDate,
                }
            });

            await tx.bankAccount.update({
                where: { id: plan.loan.bankAccountId },
                data: { balance: yeniBakiye }
            });

            return { success: true };
        });
    }

    async getBanklarOzet() {
        // Implementation needed or dummy
        return [];
    }

    async findAllAccounts() {
        const tenantId = this.tenantContext.getTenantId();
        return this.prisma.extended.bankAccount.findMany({
            where: {
                bank: { tenantId }
            },
            include: { bank: true }
        });
    }

    async getAllLoanler() {
        const tenantId = this.tenantContext.getTenantId();
        return this.prisma.extended.bankLoan.findMany({
            where: {
                bankAccount: { bank: { tenantId } }
            },
            include: { bankAccount: { include: { bank: true } } }
        });
    }

    async getLoanler(accountId: string) {
        return this.prisma.extended.bankLoan.findMany({
            where: { bankAccountId: accountId },
            include: { plans: true }
        });
    }

    async getLoanDetay(loanId: string) {
        return this.prisma.extended.bankLoan.findUnique({
            where: { id: loanId },
            include: { plans: true, bankAccount: { include: { bank: true } } }
        });
    }

    async getYaklasanInstallmentler(baslangic: Date, bitis: Date) {
        const tenantId = this.tenantContext.getTenantId();
        return this.prisma.extended.bankLoanPlan.findMany({
            where: {
                dueDate: { gte: baslangic, lte: bitis },
                status: { not: CreditPlanStatus.PAID },
                loan: { bankAccount: { bank: { tenantId } } }
            },
            include: { loan: { include: { bankAccount: { include: { bank: true } } } } }
        });
    }

    async getUpcomingCreditCardDates(baslangic: Date, bitis: Date) {
        const tenantId = this.tenantContext.getTenantId();
        return this.prisma.extended.companyCreditCard.findMany({
            where: {
                paymentDueDate: { gte: baslangic, lte: bitis },
                isActive: true,
                cashbox: { tenantId }
            },
            include: {
                cashbox: true
            }
        });
    }

    async addLoanPlan(loanId: string, dto: { amount: number; dueDate: Date }) {
        return this.prisma.extended.bankLoanPlan.create({
            data: {
                loanId,
                amount: new Decimal(dto.amount),
                dueDate: dto.dueDate,
                installmentNo: 99, // Dummy for added plan
                status: CreditPlanStatus.PENDING
            }
        });
    }

    async updateLoanPlan(id: string, dto: { amount?: number; dueDate?: Date }) {
        return this.prisma.extended.bankLoanPlan.update({
            where: { id },
            data: {
                amount: dto.amount ? new Decimal(dto.amount) : undefined,
                dueDate: dto.dueDate
            }
        });
    }

    async deleteLoanPlan(id: string) {
        return this.prisma.extended.bankLoanPlan.delete({ where: { id } });
    }
}
