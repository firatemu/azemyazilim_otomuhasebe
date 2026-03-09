import { IsString, IsOptional, IsNumber, IsDateString, IsUUID, IsEnum, Min } from 'class-validator';
import { VehicleExpenseType } from '@prisma/client';

export class CreateVehicleExpenseDto {
    @IsUUID()
    vehicleId: string;

    @IsEnum(VehicleExpenseType)
    expenseType: VehicleExpenseType;

    @IsDateString()
    @IsOptional()
    date?: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsOptional()
    documentNo?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    mileage?: number;
}
