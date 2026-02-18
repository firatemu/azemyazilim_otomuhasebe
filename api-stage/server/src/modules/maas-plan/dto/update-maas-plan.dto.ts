import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsEnum, IsBoolean, Min } from 'class-validator';
import { MaasDurum } from '@prisma/client';

export class UpdateMaasPlanDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    maas?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    prim?: number;

    @IsOptional()
    @IsEnum(MaasDurum)
    durum?: MaasDurum;

    @IsOptional()
    @IsBoolean()
    aktif?: boolean;

    @IsOptional()
    aciklama?: string;
}
