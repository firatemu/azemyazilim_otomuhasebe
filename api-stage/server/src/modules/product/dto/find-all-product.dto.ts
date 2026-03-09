import { IsOptional, IsInt, Min, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllProductDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 50;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isActive?: boolean;
}
