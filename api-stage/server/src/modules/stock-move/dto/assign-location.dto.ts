import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class AssignLocationDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  toWarehouseId: string;

  @IsString()
  @IsNotEmpty()
  toLocationId: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  qty?: number; // Opsiyonel - Sadece raf adresi tanımlamak için kullanılabilir

  @IsString()
  @IsOptional()
  note?: string;
}
