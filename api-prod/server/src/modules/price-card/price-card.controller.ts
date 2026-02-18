import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { PriceCardService } from './price-card.service';
import { CreatePriceCardDto } from './dto/create-price-card.dto';
import {
  FindPriceCardsDto,
  LatestPriceQueryDto,
} from './dto/find-price-cards.dto';
import { type Request } from 'express';
import { PriceCardType } from '@prisma/client';

@Controller('price-cards')
export class PriceCardController {
  constructor(private readonly priceCardService: PriceCardService) {}

  @Post()
  create(@Body() createDto: CreatePriceCardDto, @Req() req: Request) {
    const userId = (req as any)?.user?.id as string | undefined;
    return this.priceCardService.create(createDto, userId);
  }

  @Get('stok/:stokId')
  findByStok(
    @Param('stokId') stokId: string,
    @Query() query: FindPriceCardsDto,
  ) {
    return this.priceCardService.findByStok(stokId, query);
  }

  @Get('stok/:stokId/latest')
  findLatest(
    @Param('stokId') stokId: string,
    @Query() query: LatestPriceQueryDto,
  ) {
    const type = query.type ?? PriceCardType.SALE;
    return this.priceCardService.findLatest(stokId, type);
  }
}
