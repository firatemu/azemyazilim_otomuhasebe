import {
  IsEnum,
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ModuleType } from '@prisma/client';

export class CreateCodeTemplateDto {
  @IsEnum(ModuleType)
  module: ModuleType;

  @IsString()
  name: string; // Görünen isim (örn: "Depo Kodu", "Kasa Kodu")

  @IsString()
  prefix: string; // Ön ek (örn: "D", "K", "P")

  @IsInt()
  @Min(1)
  @Max(10)
  digitCount: number; // Kaç haneli (001, 0001, vb.)

  @IsInt()
  @Min(0)
  @IsOptional()
  currentValue?: number; // Mevcut değer (varsayılan: 0)

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  includeYear?: boolean; // Yıl bilgisini ekle (örn: AZM2025000000001)
}
