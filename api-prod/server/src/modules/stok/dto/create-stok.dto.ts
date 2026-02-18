import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateStokDto {
  @IsOptional()
  @IsString()
  stokKodu?: string;

  @IsNotEmpty()
  @IsString()
  stokAdi: string;

  @IsOptional()
  @IsString()
  aciklama?: string;

  @IsNotEmpty()
  @IsString()
  birim: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  alisFiyati: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  satisFiyati: number;

  @IsOptional()
  @IsNumber()
  kdvOrani?: number;

  @IsOptional()
  @IsNumber()
  kritikStokMiktari?: number;

  @IsOptional()
  @IsString()
  kategori?: string;

  @IsOptional()
  @IsString()
  anaKategori?: string;

  @IsOptional()
  @IsString()
  altKategori?: string;

  @IsOptional()
  @IsString()
  marka?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  oem?: string;

  @IsOptional()
  @IsString()
  olcu?: string;

  @IsOptional()
  @IsString()
  raf?: string;

  @IsOptional()
  @IsString()
  barkod?: string;

  @IsOptional()
  @IsString()
  tedarikciKodu?: string;

  // Araç bilgileri
  @IsOptional()
  @IsString()
  aracMarka?: string;

  @IsOptional()
  @IsString()
  aracModel?: string;

  @IsOptional()
  @IsString()
  aracMotorHacmi?: string;

  @IsOptional()
  @IsString()
  aracYakitTipi?: string;
}
