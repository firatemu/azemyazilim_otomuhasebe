import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CreateCompanyVehicleDto {
    @IsString()
    plate: string;

    @IsString()
    brand: string;

    @IsString()
    model: string;

    @IsNumber()
    @IsOptional()
    year?: number;

    @IsString()
    @IsOptional()
    chassisno?: string;

    @IsString()
    @IsOptional()
    engineNo?: string;

    @IsDateString()
    @IsOptional()
    registrationDate?: string;

    @IsString()
    @IsOptional()
    vehicleType?: string;

    @IsString()
    @IsOptional()
    fuelType?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsUUID()
    @IsOptional()
    assignedEmployeeId?: string;

    @IsString()
    @IsOptional()
    registrationImageUrl?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
