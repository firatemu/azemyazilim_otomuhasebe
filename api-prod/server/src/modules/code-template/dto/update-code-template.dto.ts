import {
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class UpdateCodeTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  prefix?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  digitCount?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  currentValue?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  includeYear?: boolean; // Yıl bilgisini ekle (örn: AZM2025000000001)
}
