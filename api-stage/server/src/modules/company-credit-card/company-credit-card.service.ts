import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCompanyCreditCardDto } from './dto/create-company-credit-card.dto';
import { UpdateCompanyCreditCardDto } from './dto/update-company-credit-card.dto';

@Injectable()
export class CompanyCreditCardService {
  constructor(private prisma: PrismaService) { }

  async create(createDto: CreateCompanyCreditCardDto) {
    // Cashbox kontrolü
    const cashbox = await this.prisma.extended.cashbox.findUnique({
      where: { id: createDto.cashboxId },
    });

    if (!cashbox) {
      throw new NotFoundException('Cashbox not found');
    }

    if (cashbox.type !== 'COMPANY_CREDIT_CARD') {
      throw new BadRequestException(
        'Cards can only be added to cashboxes of type COMPANY_CREDIT_CARD',
      );
    }

    // Kart kodu kontrolü veya otomatik üret
    let code = createDto.code;
    if (!code || code.trim() === '') {
      // Otomatik kod üret: KASA_KODU-001, KASA_KODU-002...
      const kartSayisi = await this.prisma.extended.companyCreditCard.count({
        where: { cashboxId: createDto.cashboxId },
      });
      code = `${cashbox.code}-${String(kartSayisi + 1).padStart(3, '0')}`;
    }

    const data = {
      cashboxId: createDto.cashboxId,
      code,
      name: createDto.name,
      bankName: createDto.bankName,
      cardType: createDto.cardType,
      lastFourDigits: createDto.lastFourDigits,
      creditLimit: createDto.creditLimit,
      statementDate: createDto.statementDate
        ? new Date(createDto.statementDate)
        : null,
      paymentDueDate: createDto.paymentDueDate
        ? new Date(createDto.paymentDueDate)
        : null,
      isActive: createDto.isActive ?? true,
    };

    const kart = await this.prisma.extended.companyCreditCard.create({
      data,
      include: {
        cashbox: true,
      },
    });

    return kart;
  }

  async findAll(cashboxId?: string) {
    const where: any = {};
    if (cashboxId) {
      where.cashboxId = cashboxId;
    }

    return this.prisma.extended.companyCreditCard.findMany({
      where,
      include: {
        cashbox: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const kart = await this.prisma.extended.companyCreditCard.findUnique({
      where: { id },
      include: {
        cashbox: true,
        movements: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
          },
          orderBy: { date: 'desc' },
          take: 50,
        },
      },
    });

    if (!kart) {
      throw new NotFoundException('Company credit card not found');
    }

    return kart;
  }

  async update(id: string, updateDto: UpdateCompanyCreditCardDto) {
    await this.findOne(id);

    // cashboxId burada olmamalı - update'te cashbox değiştirilemez
    const { cashboxId, ...updateData } = updateDto as any;
    if (cashboxId !== undefined) {
      throw new BadRequestException(
        'Cashbox cannot be changed. Please do not send the cashboxId field.',
      );
    }

    // Tarih alanlarını Date'e çevir
    const dataToUpdate: any = { ...updateData };
    if (updateDto.statementDate !== undefined) {
      dataToUpdate.statementDate = updateDto.statementDate
        ? new Date(updateDto.statementDate)
        : null;
    }
    if (updateDto.paymentDueDate !== undefined) {
      dataToUpdate.paymentDueDate = updateDto.paymentDueDate
        ? new Date(updateDto.paymentDueDate)
        : null;
    }

    const kart = await this.prisma.extended.companyCreditCard.update({
      where: { id },
      data: dataToUpdate,
    });

    return kart;
  }

  async remove(id: string) {
    const kart = await this.findOne(id);

    // Hareket kontrolü
    const hareketSayisi = await this.prisma.extended.companyCreditCardMovement.count({
      where: { cardId: id },
    });

    if (hareketSayisi > 0) {
      throw new BadRequestException('This card has movements, it cannot be deleted');
    }

    return this.prisma.extended.companyCreditCard.delete({
      where: { id },
    });
  }
}
