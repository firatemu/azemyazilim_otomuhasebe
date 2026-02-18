import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductBarcodeDto {
  @IsString()
  @IsNotEmpty()
  productId: string; // Stok ID

  @IsString()
  @IsNotEmpty()
  barcode: string; // Barkod değeri

  @IsString()
  @IsNotEmpty()
  symbology: string; // QR, EAN13, Code128, vb.

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean; // Birincil barkod mu?
}
