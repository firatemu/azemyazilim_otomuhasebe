import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { CheckBillType } from '@prisma/client';

export class CreateCheckBillDto {
    @IsEnum(CheckBillType)
    type: CheckBillType;

    @IsString()
    @IsNotEmpty()
    checkNo: string;

    @IsDateString()
    dueDate: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsString()
    @IsOptional()
    debtor?: string;

    @IsString()
    @IsOptional()
    bank?: string;

    @IsString()
    @IsOptional()
    branch?: string;

    @IsString()
    @IsOptional()
    accountNo?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateCheckBillDto {
    @IsString()
    @IsOptional()
    checkNo?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsString()
    @IsOptional()
    debtor?: string;

    @IsString()
    @IsOptional()
    bank?: string;

    @IsString()
    @IsOptional()
    branch?: string;

    @IsString()
    @IsOptional()
    accountNo?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
