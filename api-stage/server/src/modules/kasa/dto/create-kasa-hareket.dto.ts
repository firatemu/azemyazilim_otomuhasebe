import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { KasaHareketTipi } from '@prisma/client';

export class CreateKasaHareketDto {
  @IsString()
  @IsNotEmpty()
  kasaId: string;

  @IsEnum(KasaHareketTipi)
  hareketTipi: KasaHareketTipi;

  @IsNumber()
  @Min(0)
  tutar: number;

  @IsString()
  @IsOptional()
  belgeTipi?: string;

  @IsString()
  @IsOptional()
  belgeNo?: string;

  @IsString()
  @IsOptional()
  cariId?: string;

  @IsString()
  @IsOptional()
  aciklama?: string;

  @IsDateString()
  @IsOptional()
  tarih?: string;
}
