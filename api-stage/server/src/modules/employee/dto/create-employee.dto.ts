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

export enum Cinsiyet { MALE = 'MALE', FEMALE = 'FEMALE', NOT_SPECIFIED = 'NOT_SPECIFIED' }
export enum MedeniDurum { SINGLE = 'SINGLE', MARRIED = 'MARRIED' }

export class CreateEmployeeDto {
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @IsOptional()
  @IsString()
  @Length(11, 11, { message: 'TC Kimlik No 11 karakter olmalıdır' })
  identityNumber?: string;

  @IsNotEmpty({ message: 'Ad alanı zorunludur' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Soyad alanı zorunludur' })
  @IsString()
  lastName: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(Cinsiyet)
  gender?: Cinsiyet;

  @IsOptional()
  @IsEnum(MedeniDurum)
  maritalStatus?: MedeniDurum;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir email addressi giriniz' })
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  il?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  pozisyon?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryGunu?: number; // 0 = Ay sonu, 1-31 = Ayın günü


  @IsOptional()
  @IsString()
  sgkNo?: string;

  @IsOptional()
  @IsString()
  ibanNo?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
