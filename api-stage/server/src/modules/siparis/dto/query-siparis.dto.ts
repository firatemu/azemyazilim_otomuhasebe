import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SiparisTipi } from '@prisma/client';

export class QuerySiparisDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(SiparisTipi)
  siparisTipi?: SiparisTipi;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  cariId?: string;
}
