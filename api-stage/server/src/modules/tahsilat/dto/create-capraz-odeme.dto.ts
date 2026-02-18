import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { OdemeTipi } from '@prisma/client';

export class CreateCaprazOdemeDto {
  @IsString()
  @IsNotEmpty()
  tahsilatCariId: string; // Tahsilat yapılacak cari

  @IsString()
  @IsNotEmpty()
  odemeCariId: string; // Ödeme yapılacak cari

  @IsNumber()
  @Min(0)
  tutar: number; // Ortak tutar

  @IsDateString()
  @IsOptional()
  tarih?: string;

  @IsEnum(OdemeTipi)
  @IsOptional()
  odemeTipi?: OdemeTipi; // NAKIT, KREDI_KARTI (çapraz ödemede opsiyonel)

  @IsString()
  @IsOptional()
  kasaId?: string;

  @IsString()
  @IsOptional()
  aciklama?: string;
}
