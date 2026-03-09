import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsEnum, IsBoolean, Min } from 'class-validator';

export enum SalaryStatus { UNPAID = 'UNPAID', KISMI_PAID = 'KISMI_PAID', TAMAMEN_PAID = 'TAMAMEN_PAID', PENDING = 'PENDING' }

export class UpdateSalaryPlanDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    salary?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    bonus?: number;

    @IsOptional()
    @IsEnum(SalaryStatus)
    status?: SalaryStatus;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    notes?: string;
}
