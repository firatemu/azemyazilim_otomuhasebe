import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWarehouseTransferItemDto {
  @IsString()
  @IsNotEmpty()
  stokId: string;

  @IsNumber()
  @Min(1)
  miktar: number;

  @IsString()
  @IsOptional()
  fromLocationId?: string;

  @IsString()
  @IsOptional()
  toLocationId?: string;
}

export class CreateWarehouseTransferDto {
  @IsDateString()
  tarih: string;

  @IsString()
  @IsNotEmpty()
  fromWarehouseId: string;

  @IsString()
  @IsNotEmpty()
  toWarehouseId: string;

  @IsString()
  @IsOptional()
  driverName?: string;

  @IsString()
  @IsOptional()
  vehiclePlate?: string;

  @IsString()
  @IsOptional()
  aciklama?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWarehouseTransferItemDto)
  kalemler: CreateWarehouseTransferItemDto[];

  @IsString()
  @IsOptional()
  userId?: string;
}
