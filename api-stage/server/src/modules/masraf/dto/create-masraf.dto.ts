import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  IsOptional,
} from 'class-validator';
import { OdemeTipi } from '@prisma/client';

export class CreateMasrafDto {
  @IsNotEmpty()
  @IsString()
  kategoriId: string;

  @IsOptional()
  @IsString()
  aciklama?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  tutar: number;

  @IsNotEmpty()
  @IsDateString()
  tarih: string;

  @IsNotEmpty()
  @IsEnum(OdemeTipi)
  odemeTipi: OdemeTipi;
}
