import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryNoteSourceType, DeliveryNoteStatus } from '@prisma/client';

export class CreatePurchaseWaybillItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  vatRate: number;
}

export class CreatePurchaseWaybillDto {
  @IsString()
  @IsNotEmpty()
  deliveryNoteNo: string;

  @IsDateString()
  deliveryNoteDate: string;

  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsString()
  @IsOptional()
  warehouseId?: string;

  @IsEnum(DeliveryNoteSourceType)
  sourceType: DeliveryNoteSourceType;

  @IsString()
  @IsOptional()
  sourceId?: string;

  @IsEnum(DeliveryNoteStatus)
  @IsOptional()
  status?: DeliveryNoteStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseWaybillItemDto)
  items: CreatePurchaseWaybillItemDto[];
}
