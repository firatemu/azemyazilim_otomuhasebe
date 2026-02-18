import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { CariTip } from '@prisma/client';

export class DebtCreditReportQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(CariTip)
    tip?: CariTip;


    @IsOptional()
    @IsString()
    satisElemaniId?: string;

    @IsOptional()
    @IsString()
    durum?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    limit?: number = 50;
}
