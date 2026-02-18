import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
} from 'class-validator';

export class UpdateTechnicianDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

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

