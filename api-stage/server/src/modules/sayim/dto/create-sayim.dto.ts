import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SayimTipi } from '@prisma/client';

export class CreateSayimKalemiDto {
  @IsString()
  @IsNotEmpty()
  stokId: string;

  @IsString()
  @IsOptional()
  locationId?: string; // Raf bazlı sayımda dolu

  @IsNumber()
  @Min(0)
  sayilanMiktar: number;
}

export class CreateSayimDto {
  @IsString()
  @IsNotEmpty()
  sayimNo: string;

  @IsEnum(SayimTipi)
  sayimTipi: SayimTipi;

  @IsString()
  @IsOptional()
  aciklama?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSayimKalemiDto)
  kalemler: CreateSayimKalemiDto[];
}
