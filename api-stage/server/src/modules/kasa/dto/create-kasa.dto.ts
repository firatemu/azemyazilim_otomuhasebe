import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { KasaTipi } from '@prisma/client';

export class CreateKasaDto {
  @IsString()
  @IsOptional()
  kasaKodu?: string; // Boş bırakılırsa otomatik üretilir

  @IsString()
  @IsNotEmpty()
  kasaAdi: string;

  @IsEnum(KasaTipi)
  kasaTipi: KasaTipi;

  @IsBoolean()
  @IsOptional()
  aktif?: boolean;
}
