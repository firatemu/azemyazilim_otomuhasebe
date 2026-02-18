import { PriceCardType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class FindPriceCardsDto {
  @IsEnum(PriceCardType)
  @IsOptional()
  @Type(() => String)
  type?: PriceCardType = PriceCardType.SALE;
}

export class LatestPriceQueryDto extends FindPriceCardsDto {}
