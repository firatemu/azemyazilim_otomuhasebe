import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { HavaleTipi } from '@prisma/client';

export class FilterBankaHavaleDto {
  @IsOptional()
  @IsEnum(HavaleTipi)
  hareketTipi?: HavaleTipi;

  @IsOptional()
  @IsString()
  bankaHesabiId?: string;

  @IsOptional()
  @IsString()
  cariId?: string;

  @IsOptional()
  @IsDateString()
  baslangicTarihi?: string;

  @IsOptional()
  @IsDateString()
  bitisTarihi?: string;

  @IsOptional()
  @IsString()
  referansNo?: string;
}
