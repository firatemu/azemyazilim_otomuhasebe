import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePriceCardDto } from './dto/create-price-card.dto';
import { PriceCardType } from '@prisma/client';
import { FindPriceCardsDto } from './dto/find-price-cards.dto';

@Injectable()
export class PriceCardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePriceCardDto, userId?: string) {
    const {
      stokId,
      type = PriceCardType.SALE,
      price,
      currency = 'TRY',
      effectiveFrom,
      effectiveTo,
      note,
    } = createDto;

    return this.prisma.$transaction(async (tx) => {
      const stok = await tx.stok.findUnique({ where: { id: stokId } });
      if (!stok) {
        throw new NotFoundException('Stok kaydı bulunamadı');
      }

      const priceCard = await tx.priceCard.create({
        data: {
          stokId,
          type,
          price,
          currency,
          effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : undefined,
          effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined,
          note: note || undefined,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      if (type === PriceCardType.SALE) {
        await tx.stok.update({
          where: { id: stokId },
          data: {
            satisFiyati: price,
          },
        });
      } else if (type === PriceCardType.PURCHASE) {
        await tx.stok.update({
          where: { id: stokId },
          data: {
            alisFiyati: price,
          },
        });
      }

      return priceCard;
    });
  }

  async findByStok(stokId: string, query: FindPriceCardsDto) {
    const type = query.type ?? PriceCardType.SALE;
    return this.prisma.priceCard.findMany({
      where: {
        stokId,
        type,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
    });
  }

  async findLatest(stokId: string, type: PriceCardType = PriceCardType.SALE) {
    return this.prisma.priceCard.findFirst({
      where: {
        stokId,
        type,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
