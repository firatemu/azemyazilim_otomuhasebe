import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  productId: string; // Ürün ID

  @IsString()
  @IsNotEmpty()
  fromWarehouseId: string; // Kaynak depo

  @IsString()
  @IsNotEmpty()
  fromLocationId: string; // Kaynak raf

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
