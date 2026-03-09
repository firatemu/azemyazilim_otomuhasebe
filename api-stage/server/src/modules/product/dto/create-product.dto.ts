import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsOptional()
  @IsString()
  unitId?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  salePrice: number;

  @IsOptional()
  @IsNumber()
  vatRate?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  mainCategory?: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  oem?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  shelf?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  supplierCode?: string;

  // Araç bilgileri
  @IsOptional()
  @IsString()
  vehicleBrand?: string;

  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @IsOptional()
  @IsString()
  vehicleEngineSize?: string;

  @IsOptional()
  @IsString()
  vehicleFuelType?: string;

  // Kurumsal / ek özellikler
  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  weightUnit?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @IsOptional()
  @IsNumber()
  warrantyMonths?: number;

  @IsOptional()
  @IsString()
  internalNote?: string;

  @IsOptional()
  @IsNumber()
  minOrderQty?: number;

  @IsOptional()
  @IsNumber()
  leadTimeDays?: number;
}
