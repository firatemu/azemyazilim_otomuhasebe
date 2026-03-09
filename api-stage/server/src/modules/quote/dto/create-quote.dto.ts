import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { QuoteType, QuoteStatus } from '../quote.enums';

export class CreateQuoteItemDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  productId: string;

  @IsNumber()
  @Min(1)
  @ApiProperty()
  quantity: number;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  vatRate: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ required: false })
  discountRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ required: false })
  discountAmount?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  notes?: string;
}

export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  quoteNo: string;

  @IsEnum(QuoteType)
  @ApiProperty({ enum: QuoteType })
  quoteType: QuoteType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  accountId: string;

  @IsDateString()
  @ApiProperty()
  date: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  validUntil?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ required: false })
  discount?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  notes?: string;

  @IsEnum(QuoteStatus)
  @IsOptional()
  @ApiProperty({ enum: QuoteStatus, required: false })
  status?: QuoteStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  @ApiProperty({ type: [CreateQuoteItemDto] })
  items: CreateQuoteItemDto[];
}
