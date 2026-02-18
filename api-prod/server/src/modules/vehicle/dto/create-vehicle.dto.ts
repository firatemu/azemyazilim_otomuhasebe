import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  plateNumber: string;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsDateString()
  firstRegistrationDate?: string;

  @IsOptional()
  @IsString()
  engineSize?: string;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsUUID()
  customerId: string;
}

