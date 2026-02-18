import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateBasitSiparisDto {
  @IsString()
  @IsNotEmpty()
  firmaId: string; // Cari ID (tedarikçi)

  @IsString()
  @IsNotEmpty()
  urunId: string; // Stok ID

  @IsNumber()
  @Min(1)
  miktar: number;
}
