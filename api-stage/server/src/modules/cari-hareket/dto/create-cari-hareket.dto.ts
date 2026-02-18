import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDecimal,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { BorcAlacak, BelgeTipi } from '@prisma/client';

export class CreateCariHareketDto {
  @IsString()
  @IsNotEmpty()
  cariId: string;

  @IsEnum(BorcAlacak)
  @IsNotEmpty()
  tip: BorcAlacak;

  @IsNotEmpty()
  tutar: number;

  @IsOptional()
  @IsEnum(BelgeTipi)
  belgeTipi?: BelgeTipi;

  @IsOptional()
  @IsString()
  belgeNo?: string;

  @IsOptional()
  @IsDateString()
  tarih?: string;

  @IsString()
  @IsNotEmpty()
  aciklama: string;
}
