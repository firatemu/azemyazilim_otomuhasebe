import { IsString, IsOptional, IsEmail, IsIn } from 'class-validator';

export class UpdateTenantSettingsDto {
  @IsString()
  @IsOptional()
  @IsIn(['COMPANY', 'INDIVIDUAL'])
  companyType?: string;

  // Şirket Bilgileri
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  taxNumber?: string;

  @IsString()
  @IsOptional()
  taxOffice?: string;

  @IsString()
  @IsOptional()
  mersisNo?: string;

  // Şahıs Bilgileri
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  tcNo?: string;

  // İletişim
  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  // Adres Bilgileri
  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
