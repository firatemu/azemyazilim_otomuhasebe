import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  Length,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CariTip, SirketTipi } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateCariDto {
  @IsOptional()
  @IsString()
  cariKodu?: string;

  @IsNotEmpty({ message: 'Ünvan boş olamaz' })
  @IsString()
  unvan: string;

  @IsOptional()
  @IsEnum(CariTip, { message: 'Geçersiz müşteri tipi. MUSTERI, TEDARIKCI veya HER_IKISI kullanılmalıdır.' })
  @Type(() => String)
  tip?: CariTip;

  @IsOptional()
  @IsEnum(SirketTipi, { message: 'Geçersiz şirket tipi. KURUMSAL veya SAHIS kullanılmalıdır.' })
  @Type(() => String)
  sirketTipi?: SirketTipi;

  @IsOptional()
  @IsString()
  vergiNo?: string;

  @IsOptional()
  @IsString()
  vergiDairesi?: string;

  @IsOptional()
  @IsString()
  @Length(11, 11, { message: 'TC Kimlik No 11 karakter olmalıdır' })
  tcKimlikNo?: string;

  @IsOptional()
  @IsString()
  isimSoyisim?: string;

  @IsOptional()
  @IsString()
  telefon?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  ulke?: string;

  @IsOptional()
  @IsString()
  il?: string;

  @IsOptional()
  @IsString()
  ilce?: string;

  @IsOptional()
  @IsString()
  adres?: string;

  @IsOptional()
  @IsString()
  yetkili?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  vadeSuresi?: number; // Varsayılan vade süresi (gün cinsinden)

  @IsOptional()
  @IsBoolean()
  aktif?: boolean;
}
