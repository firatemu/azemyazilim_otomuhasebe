import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { HavaleTipi } from '@prisma/client';

export class CreateBankaHavaleDto {
  @IsNotEmpty()
  @IsEnum(HavaleTipi)
  hareketTipi: HavaleTipi;

  @IsOptional()
  @IsString()
  bankaHesabiId?: string; // Kasa.id (opsiyonel)

  @IsOptional()
  @IsString()
  bankaHesapId?: string; // BankaHesabi.id (yeni sistem)

  @IsNotEmpty()
  @IsString()
  cariId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  tutar: number;

  @IsOptional()
  @IsDateString()
  tarih?: string;

  @IsOptional()
  @IsString()
  aciklama?: string;

  @IsOptional()
  @IsString()
  referansNo?: string;

  @IsOptional()
  @IsString()
  gonderen?: string;

  @IsOptional()
  @IsString()
  alici?: string;
}
