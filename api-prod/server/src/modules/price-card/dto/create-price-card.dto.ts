import { PriceCardType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePriceCardDto {
  @IsUUID()
  stokId!: string;

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
