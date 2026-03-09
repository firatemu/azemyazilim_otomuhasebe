import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    Min,
    Max,
} from 'class-validator';

export class CreateSalaryPlanDto {
    @IsNotEmpty({ message: 'Employee ID zorunludur' })
    @IsString()
    employeeId: string;

    @IsNotEmpty({ message: 'Yıl zorunludur' })
    @IsNumber()
    @Min(2020)
    @Max(2100)
    year: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    salary?: number; // Employeeden alınacak, opsiyonel override

    @IsOptional()
    @IsNumber()
    @Min(0)
    bonus?: number; // Employeeden alınacak, opsiyonel override
}
