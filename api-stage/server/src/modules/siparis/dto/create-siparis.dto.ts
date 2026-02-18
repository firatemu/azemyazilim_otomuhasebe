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
import { SiparisTipi, SiparisDurum } from '@prisma/client';

export class CreateSiparisKalemiDto {
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

export class CreateSiparisDto {
  @IsString()
  @IsNotEmpty()
  siparisNo: string;

  @IsEnum(SiparisTipi)
  siparisTipi: SiparisTipi;

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

  @IsEnum(SiparisDurum)
  @IsOptional()
  durum?: SiparisDurum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSiparisKalemiDto)
  kalemler: CreateSiparisKalemiDto[];
}
