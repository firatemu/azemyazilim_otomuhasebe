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
  ValidateNested,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CariTip, SirketTipi, RiskDurumu, AdresTipi } from '@prisma/client';
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

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? null : value)
  satisElemaniId?: string;

  // Risk Yönetimi
  @IsOptional()
  @IsNumber()
  @Min(0)
  riskLimiti?: number;

  @IsOptional()
  @IsEnum(RiskDurumu)
  riskDurumu?: RiskDurumu;

  @IsOptional()
  @IsNumber()
  @Min(0)
  teminatTutar?: number;

  // Gruplama ve Detaylar
  @IsOptional() @IsString() sektor?: string;
  @IsOptional() @IsString() ozelKod1?: string;
  @IsOptional() @IsString() ozelKod2?: string;
  @IsOptional() @IsString() webSite?: string;
  @IsOptional() @IsString() faks?: string;

  // Finansal Ayarlar
  @IsOptional() @IsInt() vadeGun?: number;
  @IsOptional() @IsString() paraBirimi?: string;
  @IsOptional() @IsString() bankaBilgileri?: string;

  // İlişkiler
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCariYetkiliDto)
  yetkililer?: CreateCariYetkiliDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCariAdresDto)
  ekAdresler?: CreateCariAdresDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCariBankaDto)
  tedarikciBankalar?: CreateCariBankaDto[];
}

export class CreateCariYetkiliDto {
  @IsNotEmpty() @IsString() adSoyad: string;
  @IsOptional() @IsString() unvan?: string;
  @IsOptional() @IsString() telefon?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() dahili?: string;
  @IsOptional() @IsBoolean() varsayilan?: boolean;
  @IsOptional() @IsString() notlar?: string;
}

export class CreateCariAdresDto {
  @IsNotEmpty() @IsString() baslik: string;
  @IsEnum(AdresTipi) tip: AdresTipi;
  @IsNotEmpty() @IsString() adres: string;
  @IsOptional() @IsString() il?: string;
  @IsOptional() @IsString() ilce?: string;
  @IsOptional() @IsString() postaKodu?: string;
  @IsOptional() @IsBoolean() varsayilan?: boolean;
}

export class CreateCariBankaDto {
  @IsNotEmpty() @IsString() bankaAdi: string;
  @IsOptional() @IsString() subeAdi?: string;
  @IsOptional() @IsString() subeKodu?: string;
  @IsOptional() @IsString() hesapNo?: string;
  @IsNotEmpty() @IsString() iban: string;
  @IsOptional() @IsString() paraBirimi?: string;
  @IsOptional() @IsString() aciklama?: string;
}
