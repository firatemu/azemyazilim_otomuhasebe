import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { LoanType } from '@prisma/client';

export class CreateLoanKullanimDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiProperty()
    amount: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @ApiProperty()
    installmentCount: number;

    @IsNotEmpty()
    @IsEnum(LoanType)
    @ApiProperty({ enum: LoanType })
    loanType: LoanType;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiProperty()
    annualInterestRate: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @ApiProperty({ required: false, default: 1 })
    paymentFrequency?: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiProperty()
    installmentAmount: number;

    @IsNotEmpty()
    @IsDateString()
    @ApiProperty()
    startDate: string;

    @IsNotEmpty()
    @IsDateString()
    @ApiProperty()
    firstInstallmentDate: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    notes?: string;
}
