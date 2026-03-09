import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { AccountType } from './create-account.dto';

export class DebtCreditReportQueryDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    search?: string;

    @IsOptional()
    @IsEnum(AccountType)
    @ApiProperty({ enum: AccountType, required: false })
    type?: AccountType;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    salesAgentId?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    status?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @ApiProperty({ required: false, default: 1 })
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @ApiProperty({ required: false, default: 50 })
    limit?: number = 50;
}
