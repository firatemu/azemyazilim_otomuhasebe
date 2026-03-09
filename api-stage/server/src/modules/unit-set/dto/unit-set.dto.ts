import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUnitDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsNumber()
    @IsOptional()
    conversionRate?: number;

    @IsBoolean()
    @IsOptional()
    isBaseUnit?: boolean;
}

export class CreateUnitSetDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateUnitDto)
    @IsOptional()
    units?: CreateUnitDto[];
}

export class UpdateUnitSetDto extends CreateUnitSetDto { }
