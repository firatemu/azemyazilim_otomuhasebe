import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SatınAlmaSiparisDurum } from '@prisma/client';

export class CreateSatinAlmaSiparisKalemiDto {
  @IsString()
  @IsNotEmpty()
  stokId: string;

  @IsNumber()
  @Min(1)
  miktar: number;

  @IsNumber()
  @Min(0)
  birimFiyat: number;

  @IsNumber()
  @Min(0)
  kdvOrani: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  iskontoOran?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  iskontoTutar?: number;
}

export class CreateSatinAlmaSiparisDto {
  @IsString()
  @IsNotEmpty()
  siparisNo: string;

  @IsString()
  @IsNotEmpty()
  cariId: string;

  @IsDateString()
  tarih: string;

  @IsDateString()
  @IsOptional()
  vade?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  iskonto?: number;

  @IsString()
  @IsOptional()
  aciklama?: string;

  @IsEnum(SatınAlmaSiparisDurum)
  @IsOptional()
  durum?: SatınAlmaSiparisDurum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSatinAlmaSiparisKalemiDto)
  kalemler: CreateSatinAlmaSiparisKalemiDto[];
}
