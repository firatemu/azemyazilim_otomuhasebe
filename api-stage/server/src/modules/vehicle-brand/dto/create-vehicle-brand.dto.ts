import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateVehicleBrandDto {
  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  engineVolume: string;

  @IsNotEmpty()
  @IsString()
  fuelType: string;
}
