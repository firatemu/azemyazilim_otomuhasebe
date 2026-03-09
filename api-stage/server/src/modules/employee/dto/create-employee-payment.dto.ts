import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';

export enum EmployeeOdemeTip { ENTITLEMENT = 'ENTITLEMENT', SALARY = 'SALARY', ADVANCE = 'ADVANCE', BONUS = 'BONUS', DEDUCTION = 'DEDUCTION', ALLOCATION = 'ALLOCATION', ALLOCATION_RETURN = 'ALLOCATION_RETURN' }

export class CreateEmployeeOdemeDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsEnum(EmployeeOdemeTip)
  tip: EmployeeOdemeTip;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  donem?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  cashboxId?: string;
}
