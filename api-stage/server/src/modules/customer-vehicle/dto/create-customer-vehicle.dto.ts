import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateCustomerVehicleDto {
  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsNotEmpty()
  @IsString()
  plaka: string;

  @IsOptional()
  @IsString()
  saseno?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  yil?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  km?: number;

  @IsNotEmpty()
  @IsString()
  aracMarka: string;

  @IsNotEmpty()
  @IsString()
  aracModel: string;

  @IsOptional()
  @IsString()
  aracMotorHacmi?: string;

  @IsOptional()
  @IsString()
  aracYakitTipi?: string;

  @IsOptional()
  @IsString()
  ruhsatNo?: string;

  @IsOptional()
  @IsDateString()
  tescilTarihi?: string;

  @IsOptional()
  @IsString()
  ruhsatSahibi?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  motorGucu?: number;

  @IsOptional()
  @IsString()
  sanziman?: string;

  @IsOptional()
  @IsString()
  renk?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  ruhsatPhotoUrl?: string;
}
