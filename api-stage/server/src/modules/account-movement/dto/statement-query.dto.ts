import { IsOptional, IsDateString, IsString } from 'class-validator';

export class StatementQueryDto {
    @IsString()
    accountId: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}
