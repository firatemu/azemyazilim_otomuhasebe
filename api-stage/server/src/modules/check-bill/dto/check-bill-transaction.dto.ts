import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { CheckBillStatus } from '@prisma/client';

export class CheckBillActionDto {
    @IsString()
    @IsNotEmpty()
    checkBillId: string;

    @IsEnum(CheckBillStatus)
    newStatus: CheckBillStatus;

    @IsDateString()
    date: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsNumber()
    @Min(0)
    transactionAmount: number;

    @IsOptional()
    @IsString()
    cashboxId?: string;

    @IsOptional()
    @IsString()
    bankAccountId?: string;
}
