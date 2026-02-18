import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsEmail,
  Length,
  Min,
} from 'class-validator';
import { Cinsiyet, MedeniDurum } from '@prisma/client';

export class CreatePersonelDto {
  @IsOptional()
  @IsString()
  personelKodu?: string;

  @IsOptional()
  @IsString()
  @Length(11, 11, { message: 'TC Kimlik No 11 karakter olmalıdır' })
  tcKimlikNo?: string;

  @IsNotEmpty({ message: 'Ad alanı zorunludur' })
  @IsString()
  ad: string;

  @IsNotEmpty({ message: 'Soyad alanı zorunludur' })
  @IsString()
  soyad: string;

  @IsOptional()
  @IsDateString()
  dogumTarihi?: string;

  @IsOptional()
  @IsEnum(Cinsiyet)
  cinsiyet?: Cinsiyet;

  @IsOptional()
  @IsEnum(MedeniDurum)
  medeniDurum?: MedeniDurum;

  @IsOptional()
  @IsString()
  telefon?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email?: string;

  @IsOptional()
  @IsString()
  adres?: string;

  @IsOptional()
  @IsString()
  il?: string;

  @IsOptional()
  @IsString()
  ilce?: string;

  @IsOptional()
  @IsString()
  pozisyon?: string;

  @IsOptional()
  @IsString()
  departman?: string;

  @IsOptional()
  @IsDateString()
  iseBaslamaTarihi?: string;

  @IsOptional()
  @IsDateString()
  istenCikisTarihi?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maas?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maasGunu?: number; // 0 = Ay sonu, 1-31 = Ayın günü

  @IsOptional()
  @IsString()
  sgkNo?: string;

  @IsOptional()
  @IsString()
  ibanNo?: string;

  @IsOptional()
  @IsString()
  aciklama?: string;
}
