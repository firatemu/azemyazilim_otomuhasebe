import { IsOptional, IsEnum, IsString } from 'class-validator';
import { FaturaTipi } from '@prisma/client';

export class QueryFaturaDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(FaturaTipi)
  faturaTipi?: FaturaTipi;

  @IsOptional()
  @IsString()
  cariId?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
