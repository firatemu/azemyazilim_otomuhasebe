import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { PriceCardService } from './price-card.service';
import { CreatePriceCardDto } from './dto/create-price-card.dto';
import {
  FindPriceCardsDto,
  LatestPriceQueryDto,
} from './dto/find-price-cards.dto';
import { type Request } from 'express';
import { PriceCardType } from './dto/create-price-card.dto';

@Controller('price-cards')
export class PriceCardController {
  constructor(private readonly priceCardService: PriceCardService) { }

  @Post()
  create(@Body() createDto: CreatePriceCardDto, @Req() req: Request) {
    const userId = (req as any)?.user?.id as string | undefined;
    return this.priceCardService.create(createDto, userId);
  }

  @Get('product/:productId')
  findByStok(
    @Param('productId') productId: string,
    @Query() query: FindPriceCardsDto,
  ) {
    return this.priceCardService.findByStok(productId, query);
  }

  @Get('product/:productId/latest')
  findLatest(
    @Param('productId') productId: string,
    @Query() query: LatestPriceQueryDto,
  ) {
    const type = query.type ?? PriceCardType.SALE;
    return this.priceCardService.findLatest(productId, type);
  }
}
