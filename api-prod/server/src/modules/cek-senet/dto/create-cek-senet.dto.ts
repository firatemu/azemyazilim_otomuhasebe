import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  IsBoolean,
} from 'class-validator';
import { CekSenetTip, PortfoyTip, CekSenetDurum } from '@prisma/client';

export class CreateCekSenetDto {
  @IsNotEmpty()
  @IsEnum(CekSenetTip)
  tip: CekSenetTip;

  @IsNotEmpty()
  @IsEnum(PortfoyTip)
  portfoyTip: PortfoyTip;

  @IsNotEmpty()
  @IsString()
  cariId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  tutar: number;

  @IsNotEmpty()
  @IsDateString()
  vade: string;

  @IsOptional()
  @IsString()
  banka?: string;

  @IsOptional()
  @IsString()
  sube?: string;

  @IsOptional()
  @IsString()
  hesapNo?: string;

  @IsOptional()
  @IsString()
  cekNo?: string;

  @IsOptional()
  @IsString()
  seriNo?: string;

  @IsOptional()
  @IsEnum(CekSenetDurum)
  durum?: CekSenetDurum;

  @IsOptional()
  @IsString()
  aciklama?: string;

  @IsNotEmpty()
  @IsString()
  kasaId: string; // Çek/Senet Kasası ID'si
}
