import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { BankMovementType, BankMovementSubType } from '@prisma/client';

export class CreateBankHareketDto {
    @IsEnum(BankMovementType)
    @ApiProperty({ enum: BankMovementType })
    movementType: BankMovementType;

    @IsEnum(BankMovementSubType)
    @IsOptional()
    @ApiProperty({ enum: BankMovementSubType, required: false })
    movementSubType?: BankMovementSubType;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    amount: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    notes?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    referenceNo?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    accountId?: string;

    @IsDateString()
    @IsOptional()
    @ApiProperty({ required: false })
    date?: string;
}

export class CreatePosHareketDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    amount: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    notes?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    referenceNo?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    accountId?: string;

    @IsDateString()
    @IsOptional()
    @ApiProperty({ required: false })
    date?: string;
}
