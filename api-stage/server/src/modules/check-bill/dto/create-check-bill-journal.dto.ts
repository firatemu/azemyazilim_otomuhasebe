import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCheckBillDto } from './create-check-bill.dto';
import { JournalType } from '@prisma/client';

export class CreateCheckBillJournalDto {
    @IsEnum(JournalType)
    type: JournalType;

    @IsString()
    @IsNotEmpty()
    journalNo: string;

    @IsDateString()
    date: string;

    @IsString()
    @IsOptional()
    accountId?: string;

    @IsString()
    @IsOptional()
    bankAccountId?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCheckBillDto)
    @IsOptional()
    newDocuments?: CreateCheckBillDto[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    selectedDocumentIds?: string[];
}
