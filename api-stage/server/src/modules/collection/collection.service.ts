import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SystemParameterService } from '../system-parameter/system-parameter.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CreateCrossPaymentDto } from './dto/create-cross-payment.dto';
import { CollectionType, PaymentMethod } from './collection.enums';
import { CashboxMovementType } from '@prisma/client';

@Injectable()
export class CollectionService {
  constructor(
    private prisma: PrismaService,
    private systemParameterService: SystemParameterService,
  ) { }

  async create(dto: CreateCollectionDto, userId: string) {
    const cashboxId = (!dto.cashboxId || dto.cashboxId === 'null' || dto.cashboxId === 'undefined' || dto.cashboxId.trim() === '') ? null : dto.cashboxId;
    const bankAccountId = (!dto.bankAccountId || dto.bankAccountId === 'null' || dto.bankAccountId === 'undefined' || dto.bankAccountId.trim() === '') ? null : dto.bankAccountId;
    const companyCreditCardId = (!dto.companyCreditCardId || dto.companyCreditCardId === 'null' || dto.companyCreditCardId === 'undefined' || dto.companyCreditCardId.trim() === '') ? null : dto.companyCreditCardId;

    const account = await this.prisma.extended.account.findUnique({
      where: { id: dto.accountId },
      select: { id: true, salesAgentId: true }
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (dto.invoiceId) {
      const invoice = await this.prisma.extended.invoice.findUnique({
        where: { id: dto.invoiceId },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
    }

    if (dto.serviceInvoiceId) {
      const serviceInvoice = await this.prisma.extended.serviceInvoice.findUnique({
        where: { id: dto.serviceInvoiceId },
      });
      if (!serviceInvoice) {
        throw new NotFoundException('Service invoice not found');
      }
    }

    if (cashboxId) {
      const cashbox = await this.prisma.extended.cashbox.findUnique({
        where: { id: cashboxId },
      });

      if (!cashbox) {
        throw new NotFoundException('Cashbox not found');
      }

      if (!cashbox.isActive) {
        throw new BadRequestException('Selected cashbox is not active');
      }
    }

    if (dto.type === 'PAYMENT') {
      const riskControlEnabled = await this.systemParameterService.getParameterAsBoolean(
        'CARI_RISK_CONTROL',
        false,
      );

      if (riskControlEnabled) {
        const accountWithRisk = await this.prisma.extended.account.findUnique({
          where: { id: dto.accountId },
          select: { balance: true, creditLimit: true, title: true },
        });

        const creditLimit = accountWithRisk?.creditLimit
          ? Number(accountWithRisk.creditLimit)
          : 0;

        if (creditLimit > 0) {
          const currentBalance = Number(accountWithRisk?.balance || 0);
          const newBalance = currentBalance + dto.amount;

          if (newBalance > creditLimit) {
            throw new BadRequestException(`Risk limit exceeded!`);
          }
        }
      }
    }

    return await this.prisma.extended.$transaction(async (tx) => {
      const collection = await tx.collection.create({
        data: {
          accountId: dto.accountId,
          invoiceId: dto.invoiceId,
          serviceInvoiceId: dto.serviceInvoiceId,
          type: dto.type,
          amount: dto.amount,
          date: dto.date ? new Date(dto.date) : new Date(),
          paymentType: dto.paymentMethod,
          cashboxId: cashboxId,
          bankAccountId: bankAccountId,
          companyCreditCardId: companyCreditCardId,
          notes: dto.notes,
          createdBy: userId,
          salesAgentId: dto.salesAgentId || account?.salesAgentId,
        },
        include: {
          account: true,
          cashbox: true,
          invoice: true,
          bankAccount: true,
          companyCreditCard: true,
        },
      });

      if (!dto.serviceInvoiceId) {
        await this.applyFIFO(
          tx,
          collection.id,
          dto.accountId,
          dto.type,
          dto.amount,
        );
      }

      const accountRecord = await tx.account.findUnique({
        where: { id: dto.accountId },
        select: { balance: true },
      });

      const accountBalanceDelta = dto.type === 'COLLECTION' ? -dto.amount : dto.amount;
      const newAccountBalance = accountRecord!.balance.toNumber() + accountBalanceDelta;

      await tx.accountMovement.create({
        data: {
          accountId: dto.accountId,
          type: dto.type === 'COLLECTION' ? 'CREDIT' : 'DEBIT',
          amount: dto.amount as any,
          balance: newAccountBalance as any,
          notes: dto.notes || `${dto.paymentMethod} ${dto.type.toLowerCase()}`,
          documentType: 'COLLECTION',
          documentNo: collection.id,
          date: dto.date ? new Date(dto.date) : new Date(),
        },
      });

      await tx.account.update({
        where: { id: dto.accountId },
        data: { balance: newAccountBalance },
      });

      if (dto.cashboxId) {
        const movementType: CashboxMovementType = dto.type === 'COLLECTION' ? 'COLLECTION' : 'PAYMENT';
        const cashbox = await tx.cashbox.findUnique({
          where: { id: dto.cashboxId },
          select: { balance: true },
        });

        const cashboxBalanceDelta = dto.type === 'COLLECTION' ? dto.amount : -dto.amount;
        const newCashboxBalance = cashbox!.balance.toNumber() + cashboxBalanceDelta;

        await tx.cashboxMovement.create({
          data: {
            cashboxId: dto.cashboxId,
            movementType: movementType,
            amount: dto.amount,
            balance: newCashboxBalance,
            documentType: 'COLLECTION',
            documentNo: collection.id,
            accountId: dto.accountId,
            notes: dto.notes,
            date: dto.date ? new Date(dto.date) : new Date(),
            createdBy: userId,
          },
        });

        await tx.cashbox.update({
          where: { id: dto.cashboxId },
          data: { balance: newCashboxBalance },
        });
      }

      return collection;
    });
  }

  async createCrossPayment(dto: CreateCrossPaymentDto, userId: string) {
    if (dto.collectionAccountId === dto.paymentAccountId) {
      throw new BadRequestException('Collection and payment accounts must be different');
    }

    const collectionAccount = await this.prisma.extended.account.findUnique({
      where: { id: dto.collectionAccountId },
    });

    if (!collectionAccount) {
      throw new NotFoundException('Collection account not found');
    }

    const paymentAccount = await this.prisma.extended.account.findUnique({
      where: { id: dto.paymentAccountId },
    });

    if (!paymentAccount) {
      throw new NotFoundException('Payment account not found');
    }

    return await this.prisma.extended.$transaction(async (tx) => {
      const date = dto.date ? new Date(dto.date) : new Date();
      const notes = dto.notes || `Cross payment: ${collectionAccount.title} -> ${paymentAccount.title}`;
      const paymentMethod = dto.paymentMethod || 'CREDIT_CARD';

      const collection = await tx.collection.create({
        data: {
          accountId: dto.collectionAccountId,
          type: 'COLLECTION',
          amount: dto.amount,
          date,
          paymentType: paymentMethod,
          notes: notes,
          createdBy: userId,
        },
      });

      const payment = await tx.collection.create({
        data: {
          accountId: dto.paymentAccountId,
          type: 'PAYMENT',
          amount: dto.amount,
          date,
          paymentType: paymentMethod,
          notes: notes,
          createdBy: userId,
        },
      });

      await this.applyFIFO(tx, collection.id, dto.collectionAccountId, CollectionType.COLLECTION, dto.amount);
      await this.applyFIFO(tx, payment.id, dto.paymentAccountId, CollectionType.PAYMENT, dto.amount);

      const collectionAccountBefore = await tx.account.findUnique({ where: { id: dto.collectionAccountId }, select: { balance: true } });
      const collectionAccountNewBalance = collectionAccountBefore!.balance.toNumber() - dto.amount;
      await tx.account.update({ where: { id: dto.collectionAccountId }, data: { balance: collectionAccountNewBalance } });

      const paymentAccountBefore = await tx.account.findUnique({ where: { id: dto.paymentAccountId }, select: { balance: true } });
      const paymentAccountNewBalance = paymentAccountBefore!.balance.toNumber() + dto.amount;
      await tx.account.update({ where: { id: dto.paymentAccountId }, data: { balance: paymentAccountNewBalance } });

      await tx.accountMovement.create({
        data: {
          accountId: dto.collectionAccountId,
          type: 'CREDIT',
          amount: dto.amount as any,
          balance: collectionAccountNewBalance as any,
          notes,
          documentType: 'COLLECTION',
          documentNo: collection.id,
          date,
        },
      });

      await tx.accountMovement.create({
        data: {
          accountId: dto.paymentAccountId,
          type: 'DEBIT',
          amount: dto.amount as any,
          balance: paymentAccountNewBalance as any,
          notes,
          documentType: 'COLLECTION',
          documentNo: payment.id,
          date,
        },
      });

      return { collection, payment };
    });
  }

  async findAll(
    page = 1,
    limit = 50,
    type?: CollectionType,
    paymentMethod?: PaymentMethod,
    accountId?: string,
    startDate?: string,
    endDate?: string,
    cashboxId?: string,
    bankAccountId?: string,
    companyCreditCardId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      deletedAt: null,
      OR: [
        { invoiceId: null },
        { invoice: { deletedAt: null } }
      ]
    };

    if (type) where.type = type;
    if (paymentMethod) where.paymentType = paymentMethod;
    if (accountId) where.accountId = accountId;
    if (cashboxId) where.cashboxId = cashboxId;
    if (bankAccountId) where.bankAccountId = bankAccountId;
    if (companyCreditCardId) where.companyCreditCardId = companyCreditCardId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.extended.collection.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: {
          account: true,
          cashbox: true,
          bankAccount: true,
          companyCreditCard: true,
          invoice: true,
        },
      }),
      this.prisma.extended.collection.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const data = await this.prisma.extended.collection.findFirst({
      where: { id, deletedAt: null },
      include: { account: true, cashbox: true, invoice: true },
    });

    if (!data) throw new NotFoundException('Collection record not found');

    const movement = await this.prisma.extended.accountMovement.findFirst({
      where: { documentType: 'COLLECTION', documentNo: id, accountId: data.accountId },
      select: { balance: true },
    });

    return { ...data, remainingBalance: movement?.balance || 0 };
  }

  async getStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const baseWhere = {
      deletedAt: null,
      OR: [{ invoiceId: null }, { invoice: { deletedAt: null } }]
    };

    const [tCollection, tOdeme, aCollection, aOdeme, nCollection, kCollection] = await Promise.all([
      this.prisma.extended.collection.aggregate({ where: { ...baseWhere, type: 'COLLECTION' }, _sum: { amount: true } }),
      this.prisma.extended.collection.aggregate({ where: { ...baseWhere, type: 'PAYMENT' }, _sum: { amount: true } }),
      this.prisma.extended.collection.aggregate({ where: { ...baseWhere, type: 'COLLECTION', date: { gte: startOfMonth } }, _sum: { amount: true } }),
      this.prisma.extended.collection.aggregate({ where: { ...baseWhere, type: 'PAYMENT', date: { gte: startOfMonth } }, _sum: { amount: true } }),
      this.prisma.extended.collection.aggregate({ where: { ...baseWhere, type: 'COLLECTION', paymentType: 'CASH' }, _sum: { amount: true } }),
      this.prisma.extended.collection.aggregate({ where: { ...baseWhere, type: 'COLLECTION', paymentType: 'CREDIT_CARD' }, _sum: { amount: true } }),
    ]);

    return {
      totalCollection: tCollection._sum.amount || 0,
      totalPayment: tOdeme._sum.amount || 0,
      monthlyCollection: aCollection._sum.amount || 0,
      monthlyPayment: aOdeme._sum.amount || 0,
      cashCollection: nCollection._sum.amount || 0,
      creditCardCollection: kCollection._sum.amount || 0,
    };
  }

  async delete(id: string) {
    const data = await this.findOne(id);

    return await this.prisma.extended.$transaction(async (tx) => {
      const balanceChange = data.type === 'COLLECTION' ? (data.amount as any) : -(data.amount as any);
      await tx.account.update({ where: { id: data.accountId }, data: { balance: { increment: balanceChange } } });

      if (data.cashboxId) {
        const cashboxBalanceChange = data.type === 'COLLECTION' ? -(data.amount as any) : (data.amount as any);
        await tx.cashbox.update({ where: { id: data.cashboxId }, data: { balance: { increment: cashboxBalanceChange } } });
        await tx.cashboxMovement.deleteMany({ where: { documentType: 'COLLECTION', documentNo: id } });
      }

      await tx.accountMovement.deleteMany({ where: { documentType: 'COLLECTION', documentNo: id } });
      await tx.collection.update({ where: { id }, data: { deletedAt: new Date() } });

      return { message: 'Collection record deleted' };
    });
  }

  private async applyFIFO(tx: any, collectionId: string, accountId: string, type: CollectionType, amount: number) {
    const invoiceType = type === 'COLLECTION' ? 'SALE' : 'PURCHASE';
    const returnType = type === 'COLLECTION' ? 'SALES_RETURN' : 'PURCHASE_RETURN';
    const invoices = await tx.invoice.findMany({
      where: {
        accountId,
        invoiceType: { in: [invoiceType, returnType] },
        status: 'APPROVED',
        deletedAt: null,
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });

    if (invoices.length === 0) return;

    let remainingAmount = amount;
    for (const invoice of invoices) {
      if (remainingAmount <= 0) break;
      const invoiceTotal = invoice.grandTotal.toNumber();
      const invoicePaid = invoice.paidAmount?.toNumber() || 0;
      const invoiceRemaining = invoiceTotal - invoicePaid;
      if (invoiceRemaining <= 0) continue;

      const paymentAmount = Math.min(remainingAmount, invoiceRemaining);
      await tx.invoiceCollection.create({ data: { invoiceId: invoice.id, collectionId: collectionId, amount: paymentAmount } });

      const newPaid = invoicePaid + paymentAmount;
      const newRemaining = invoiceTotal - newPaid;
      let newStatus = invoice.status;
      if (newRemaining <= 0.01) newStatus = 'CLOSED';
      else if (newPaid > 0.01) newStatus = 'PARTIALLY_PAID';
      else newStatus = 'APPROVED';

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { paidAmount: newPaid, status: newStatus },
      });
      remainingAmount -= paymentAmount;
    }
  }
}
