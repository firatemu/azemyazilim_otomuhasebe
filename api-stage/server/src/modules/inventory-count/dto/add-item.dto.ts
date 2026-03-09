import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    Min,
} from 'class-validator';

export class AddItemDto {
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
