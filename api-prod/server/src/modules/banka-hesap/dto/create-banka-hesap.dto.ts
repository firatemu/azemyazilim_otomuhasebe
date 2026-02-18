import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { BankaHesapTipi } from '@prisma/client';

export class CreateBankaHesapDto {
  @IsString()
  @IsNotEmpty()
  kasaId: string; // Hangi Banka kasasına bağlı

  @IsString()
  @IsOptional()
  hesapKodu?: string;

  @IsString()
  @IsOptional()
  hesapAdi?: string;

  @IsString()
  @IsNotEmpty()
  bankaAdi: string;

  @IsString()
  @IsOptional()
  subeKodu?: string;

  @IsString()
  @IsOptional()
  subeAdi?: string;

  @IsString()
  @IsOptional()
  hesapNo?: string;

  @IsString()
  @IsOptional()
  iban?: string;

  @IsEnum(BankaHesapTipi)
  hesapTipi: BankaHesapTipi; // VADESIZ veya POS

  @IsBoolean()
  @IsOptional()
  aktif?: boolean;
}
