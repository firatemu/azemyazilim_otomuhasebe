import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePriceCardDto } from './dto/create-price-card.dto';
import { PriceCardType } from './dto/create-price-card.dto';
import { FindPriceCardsDto } from './dto/find-price-cards.dto';

@Injectable()
export class PriceCardService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createDto: CreatePriceCardDto, userId?: string) {
    const {
      productId,
      type = PriceCardType.SALE,
      price,
      currency = 'TRY',
      effectiveFrom,
      effectiveTo,
      note,
    } = createDto;

    return this.prisma.extended.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new NotFoundException('Stock record not found');
      }

      const priceCard = await tx.priceCard.create({
        data: {
          productId,
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
        await tx.product.update({
          where: { id: productId },
          data: {
            satisFiyati: price,
          },
        });
      } else if (type === PriceCardType.PURCHASE) {
        await tx.product.update({
          where: { id: productId },
          data: {
            alisFiyati: price,
          },
        });
      }

      return priceCard;
    });
  }

  async findByStok(productId: string, query: FindPriceCardsDto) {
    const type = query.type ?? PriceCardType.SALE;
    return this.prisma.extended.priceCard.findMany({
      where: {
        productId,
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

  async findLatest(productId: string, type: PriceCardType = PriceCardType.SALE) {
    return this.prisma.extended.priceCard.findFirst({
      where: {
        productId,
        type,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
