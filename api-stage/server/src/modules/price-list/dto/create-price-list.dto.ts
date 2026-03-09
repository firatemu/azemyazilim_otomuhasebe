import { IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePriceListKalemiDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    @IsOptional()
    discountRate?: number;
}

export class CreatePriceListDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreatePriceListKalemiDto)
    items?: CreatePriceListKalemiDto[];
}
