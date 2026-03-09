import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCheckBillJournalDto } from './dto/create-check-bill-journal.dto';
import { JournalType, CheckBillStatus } from '@prisma/client';
import { ClsService } from '../../common/services/cls.service';
import { CheckBillService } from './check-bill.service';

@Injectable()
export class CheckBillJournalService {
    constructor(
        private prisma: PrismaService,
        private checkBillService: CheckBillService
    ) { }

    async findAll() {
        const items = await this.prisma.extended.extended.checkBillJournal.findMany({
            orderBy: { date: 'desc' },
            include: {
                account: { select: { title: true } },
                items: {
                    include: {
                        checkBill: { select: { amount: true } }
                    }
                },
                _count: { select: { items: true } }
            }
        });

        return items.map(item => {
            const totalAmount = item.items.reduce((sum, bi) => sum + Number(bi.checkBill.amount), 0);
            const { items: journalItems, _count, ...rest } = item;
            return {
                ...rest,
                totalAmount,
                documentCount: _count.items
            };
        });
    }

    async findOne(id: string) {
        const item = await this.prisma.extended.extended.checkBillJournal.findUnique({
            where: { id },
            include: {
                account: true,
                items: {
                    include: {
                        checkBill: true
                    }
                },
            }
        });

        if (!item) return null;

        const checkBills = item.items.map(bi => bi.checkBill);
        const totalAmount = checkBills.reduce((sum, cs) => sum + Number(cs.amount), 0);
        return {
            ...item,
            checkBills,
            totalAmount
        };
    }

    async create(dto: CreateCheckBillJournalDto, userId: string) {
        return this.prisma.extended.extended.$transaction(async (tx) => {
            // 1. Create CheckBillJournal
            const checkBillJournal = await tx.checkBillJournal.create({
                data: {
                    journalNo: dto.journalNo,
                    type: dto.type,
                    date: new Date(dto.date),
                    accountId: dto.accountId,
                    bankAccountId: dto.bankAccountId,
                    notes: dto.notes,
                    createdById: userId,
                }
            });

            // 2. Handle Logic based on CheckBillJournal Type
            switch (dto.type) {
                case JournalType.CUSTOMER_DOCUMENT_ENTRY:
                    if (dto.newDocuments && dto.newDocuments.length > 0) {
                        for (const docDto of dto.newDocuments) {
                            const cek = await tx.checkBill.create({
                                data: {
                                    type: docDto.type,
                                    portfolioType: 'CREDIT',
                                    accountId: dto.accountId!,
                                    amount: docDto.amount,
                                    remainingAmount: docDto.amount,
                                    dueDate: new Date(docDto.dueDate),
                                    bank: docDto.bank,
                                    branch: docDto.branch,
                                    accountNo: docDto.accountNo,
                                    checkNo: docDto.checkNo,
                                    status: CheckBillStatus.IN_PORTFOLIO,
                                    notes: docDto.notes,
                                    lastJournalId: checkBillJournal.id
                                }
                            });

                            await tx.checkBillJournalItem.create({
                                data: {
                                    journalId: checkBillJournal.id,
                                    checkBillId: cek.id,
                                }
                            });
                        }
                    }
                    break;

                case JournalType.CUSTOMER_DOCUMENT_EXIT:
                case JournalType.BANK_COLLECTION_ENDORSEMENT:
                case JournalType.BANK_GUARANTEE_ENDORSEMENT:
                case JournalType.ACCOUNT_DOCUMENT_ENDORSEMENT:
                    if (dto.selectedDocumentIds && dto.selectedDocumentIds.length > 0) {
                        for (const cekId of dto.selectedDocumentIds) {
                            let newStatus: CheckBillStatus;
                            if (dto.type === JournalType.BANK_COLLECTION_ENDORSEMENT) newStatus = CheckBillStatus.IN_BANK_COLLECTION;
                            else if (dto.type === JournalType.BANK_GUARANTEE_ENDORSEMENT) newStatus = CheckBillStatus.IN_BANK_GUARANTEE;
                            else newStatus = CheckBillStatus.ENDORSED;

                            await tx.checkBill.update({
                                where: { id: cekId },
                                data: {
                                    status: newStatus,
                                    lastJournalId: checkBillJournal.id
                                }
                            });

                            await tx.checkBillJournalItem.create({
                                data: {
                                    journalId: checkBillJournal.id,
                                    checkBillId: cekId,
                                }
                            });
                        }
                    }
                    break;
            }

            return checkBillJournal;
        });
    }
}
