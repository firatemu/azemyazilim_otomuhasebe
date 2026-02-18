import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { TahsilatTip, OdemeTipi } from '@prisma/client';

export class CreateTahsilatDto {
  @IsString()
  @IsNotEmpty()
  cariId: string;

  @IsString()
  @IsOptional()
  faturaId?: string;

  @IsEnum(TahsilatTip)
  tip: TahsilatTip; // TAHSILAT veya ODEME

  @IsNumber()
  @Min(0)
  tutar: number;

  @IsDateString()
  @IsOptional()
  tarih?: string;

  @IsEnum(OdemeTipi)
  odemeTipi: OdemeTipi; // NAKIT, KREDI_KARTI, BANKA_HAVALESI, CEK, SENET

  @IsString()
  @IsOptional()
  kasaId?: string;

  @IsString()
  @IsOptional()
  bankaHesapId?: string; // POS tahsilat için banka hesabı

  @IsString()
  @IsOptional()
  firmaKrediKartiId?: string; // Firma kredi kartı ödeme için

  @IsString()
  @IsOptional()
  aciklama?: string;

  // Kredi kartı için ekstra bilgiler (POS tahsilat için)
  @IsString()
  @IsOptional()
  kartSahibi?: string;

  @IsString()
  @IsOptional()
  kartSonDort?: string;

  @IsString()
  @IsOptional()
  bankaAdi?: string;
}
