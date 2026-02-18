import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class PutAwayDto {
  @IsString()
  @IsNotEmpty()
  productId: string; // Ürün ID

  @IsString()
  @IsNotEmpty()
  toWarehouseId: string; // Hedef depo

  @IsString()
  @IsNotEmpty()
  toLocationId: string; // Hedef raf

  @IsInt()
  @Min(1)
  qty: number; // Miktar (pozitif)

  @IsString()
  @IsOptional()
  note?: string; // Açıklama
}
