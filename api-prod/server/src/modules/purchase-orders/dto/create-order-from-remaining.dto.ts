import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RemainingItemDto {
  @IsString()
  @IsNotEmpty()
  purchaseOrderItemId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;
}

export class CreateOrderFromRemainingDto {
  @IsString()
  @IsNotEmpty()
  originalOrderId: string;

  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RemainingItemDto)
  items: RemainingItemDto[];
}
