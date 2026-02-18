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
import { IrsaliyeKaynakTip, IrsaliyeDurum } from '@prisma/client';

export class CreateSatisIrsaliyesiKalemiDto {
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

export class CreateSatisIrsaliyesiDto {
  @IsString()
  @IsNotEmpty()
  irsaliyeNo: string;

  @IsDateString()
  irsaliyeTarihi: string;

  @IsString()
  @IsNotEmpty()
  cariId: string;

  @IsString()
  @IsOptional()
  depoId?: string;

  @IsEnum(IrsaliyeKaynakTip)
  kaynakTip: IrsaliyeKaynakTip;

  @IsString()
  @IsOptional()
  kaynakId?: string; // Sipariş ID (eğer kaynakTip: SIPARIS ise)

  @IsEnum(IrsaliyeDurum)
  @IsOptional()
  durum?: IrsaliyeDurum;

  @IsNumber()
  @IsOptional()
  @Min(0)
  iskonto?: number;

  @IsString()
  @IsOptional()
  aciklama?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSatisIrsaliyesiKalemiDto)
  kalemler: CreateSatisIrsaliyesiKalemiDto[];
}

