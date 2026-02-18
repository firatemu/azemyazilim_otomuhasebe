import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { PersonelOdemeTip } from '@prisma/client';

export class CreatePersonelOdemeDto {
  @IsNotEmpty()
  @IsString()
  personelId: string;

  @IsNotEmpty()
  @IsEnum(PersonelOdemeTip)
  tip: PersonelOdemeTip;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  tutar: number;

  @IsOptional()
  @IsDateString()
  tarih?: string;

  @IsOptional()
  @IsString()
  donem?: string;

  @IsOptional()
  @IsString()
  aciklama?: string;

  @IsOptional()
  @IsString()
  kasaId?: string;
}
