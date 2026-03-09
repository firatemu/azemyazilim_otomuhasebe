import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ShippedPurchaseOrderItemDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    itemId: string;

    @IsNumber()
    @Min(1)
    @ApiProperty()
    shippedQuantity: number;
}

export class ShippedPurchaseOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ShippedPurchaseOrderItemDto)
    @ApiProperty({ type: [ShippedPurchaseOrderItemDto] })
    items: ShippedPurchaseOrderItemDto[];
}
