import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SiparisTipi, SiparisDurum } from '@prisma/client';

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
  @IsEnum(SiparisDurum)
  durum?: SiparisDurum;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  cariId?: string;
}
