import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PriceCardType } from './create-price-card.dto';

export class FindPriceCardsDto {
  @IsEnum(PriceCardType)
  @IsOptional()
  @Type(() => String)
  type?: PriceCardType = PriceCardType.SALE;
}

export class LatestPriceQueryDto extends FindPriceCardsDto { }
