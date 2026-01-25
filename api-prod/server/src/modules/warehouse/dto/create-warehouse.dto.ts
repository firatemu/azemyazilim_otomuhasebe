import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @IsOptional()
  code?: string; // Depo kodu (örn: DEPO01) - Boş bırakılırsa otomatik üretilir

  @IsString()
  @IsNotEmpty()
  name: string; // Depo adı

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean; // Varsayılan ambar mı?

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  manager?: string; // Yetkili
}
