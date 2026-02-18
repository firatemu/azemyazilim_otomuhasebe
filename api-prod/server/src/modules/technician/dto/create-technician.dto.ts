import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
} from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  code: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

