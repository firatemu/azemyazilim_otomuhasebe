import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export enum PriceCardType { SALE = 'SALE', PURCHASE = 'PURCHASE' }

export class CreatePriceCardDto {
  @IsUUID()
  productId!: string;

  @IsEnum(PriceCardType)
  @IsOptional()
  type?: PriceCardType = PriceCardType.SALE;

  @IsNumber()
  @Type(() => Number)
  price!: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string = 'TRY';

  @IsString()
  @IsOptional()
  effectiveFrom?: string | null;

  @IsString()
  @IsOptional()
  effectiveTo?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string | null;
}
