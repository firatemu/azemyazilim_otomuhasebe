import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceType } from '../invoice.enums';

export class QueryInvoiceDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @IsEnum(InvoiceType)
  @ApiProperty({ enum: InvoiceType, required: false })
  type?: InvoiceType;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  accountId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  page?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  limit?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  sortBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  sortOrder?: 'asc' | 'desc';
}
