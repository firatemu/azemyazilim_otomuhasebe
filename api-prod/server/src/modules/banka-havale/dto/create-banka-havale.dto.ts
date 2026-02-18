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

  @IsNotEmpty()
  @IsString()
  bankaHesabiId: string; // Kasa.id

  @IsOptional()
  @IsString()
  bankaHesapId?: string; // BankaHesabi.id (spesifik hesap)

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
