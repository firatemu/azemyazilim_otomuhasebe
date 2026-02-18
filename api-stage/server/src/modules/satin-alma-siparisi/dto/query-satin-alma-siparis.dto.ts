import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SatınAlmaSiparisDurum } from '@prisma/client';

export class QuerySatinAlmaSiparisDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(SatınAlmaSiparisDurum)
  durum?: SatınAlmaSiparisDurum;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  cariId?: string;
}
