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
import { FaturaTipi, FaturaDurum } from '@prisma/client';

export class CreateFaturaKalemiDto {
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
}

export class CreateFaturaDto {
  @IsString()
  @IsNotEmpty()
  faturaNo: string;

  @IsEnum(FaturaTipi)
  faturaTipi: FaturaTipi;

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

  @IsEnum(FaturaDurum)
  @IsOptional()
  durum?: FaturaDurum;

  @IsString()
  @IsOptional()
  siparisId?: string;

  @IsString()
  @IsOptional()
  irsaliyeId?: string; // İrsaliye ID (irsaliye faturalandırıldığında)

  @IsString()
  @IsOptional()
  warehouseId?: string; // Ambar ID

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFaturaKalemiDto)
  kalemler: CreateFaturaKalemiDto[];
}
