import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuoteType } from '../quote.enums';

export class QueryQuoteDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  page?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  limit?: string;

  @IsOptional()
  @IsEnum(QuoteType)
  @ApiProperty({ enum: QuoteType, required: false })
  quoteTipi?: QuoteType;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  accountId?: string;
}
