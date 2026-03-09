import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsArray,
    IsOptional,
    IsNumber,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum InventoryCountType {
    PRODUCT_BASED = 'PRODUCT_BASED',
    SHELF_BASED = 'SHELF_BASED',
}

export enum InventoryCountStatus {
    DRAFT = 'DRAFT',
    COMPLETED = 'COMPLETED',
    APPROVED = 'APPROVED',
    CANCELLED = 'CANCELLED',
}

const INVENTORY_COUNT_TYPE_VALUES = Object.values(
    InventoryCountType,
) as [string, ...string[]];

export class CreateInventoryCountItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsOptional()
    locationId?: string;

    @IsNumber()
    @Min(0)
    countedQuantity: number;
}

export class CreateInventoryCountDto {
    @IsString()
    @IsNotEmpty()
    countNumber: string;

    @ApiProperty({ enum: INVENTORY_COUNT_TYPE_VALUES })
    @IsEnum(InventoryCountType)
    countType: InventoryCountType;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateInventoryCountItemDto)
    items: CreateInventoryCountItemDto[];
}
