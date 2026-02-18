import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { IrsaliyeDurum } from '@prisma/client';

export class FilterSatınAlmaIrsaliyesiDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(IrsaliyeDurum)
  durum?: IrsaliyeDurum;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  cariId?: string;

  @IsOptional()
  @IsDateString()
  baslangicTarihi?: string;

  @IsOptional()
  @IsDateString()
  bitisTarihi?: string;
}

