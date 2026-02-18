import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  Matches,
  ValidateIf,
  IsIn,
} from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  // Bileşen bazlı giriş
  @IsInt()
  @Min(1)
  @Max(3)
  @ValidateIf((o) => !o.code)
  @IsOptional()
  layer?: number; // Kat (1..3)

  @IsString()
  @Matches(/^[A-T]$/, { message: 'Koridor A ile T arasında olmalı' })
  @ValidateIf((o) => !o.code)
  @IsOptional()
  corridor?: string; // Koridor (A..T - İlk 20 harf)

  @IsInt()
  @IsIn([1, 2], { message: 'Taraf 1 (Sol) veya 2 (Sağ) olmalı' })
  @ValidateIf((o) => !o.code)
  @IsOptional()
  side?: number; // Taraf (1=Sol, 2=Sağ)

  @IsInt()
  @Min(1)
  @Max(99)
  @ValidateIf((o) => !o.code)
  @IsOptional()
  section?: number; // Bölüm (1..99)

  @IsInt()
  @Min(1)
  @Max(50)
  @ValidateIf((o) => !o.code)
  @IsOptional()
  level?: number; // Raf seviyesi (1..50)

  // Tek satır adres girişi (alternatif)
  // Not: Mezanin formatı (K1-A1-3-5) veya serbest format (K1-RAF001, R-200) kabul edilir
  // Detaylı validasyon service katmanında yapılır
  @IsString()
  @ValidateIf(
    (o) => !o.layer && !o.corridor && !o.side && !o.section && !o.level,
  )
  @IsOptional()
  code?: string; // Format: Mezanin (K1-A1-3-5) veya Serbest (K1-RAF001, R-200)

  @IsString()
  @IsOptional()
  barcode?: string; // Barkod (genelde code ile aynı)

  @IsString()
  @IsOptional()
  name?: string; // Opsiyonel açıklama

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
