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
import { TeklifTipi, TeklifDurum } from '@prisma/client';

export class CreateTeklifKalemiDto {
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

export class CreateTeklifDto {
  @IsString()
  @IsNotEmpty()
  teklifNo: string;

  @IsEnum(TeklifTipi)
  teklifTipi: TeklifTipi;

  @IsString()
  @IsNotEmpty()
  cariId: string;

  @IsDateString()
  tarih: string;

  @IsDateString()
  @IsOptional()
  gecerlilikTarihi?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  iskonto?: number;

  @IsString()
  @IsOptional()
  aciklama?: string;

  @IsEnum(TeklifDurum)
  @IsOptional()
  durum?: TeklifDurum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTeklifKalemiDto)
  kalemler: CreateTeklifKalemiDto[];
}
