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
import { ApiProperty } from '@nestjs/swagger';

import { DeliveryNoteSourceType, DeliveryNoteStatus } from '../sales-waybill.enums';

export class CreateSalesWaybillItemDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  productId: string;

  @IsNumber()
  @Min(1)
  @ApiProperty()
  quantity: number;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  vatRate: number;
}

export class CreateSalesWaybillDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  deliveryNoteNo: string;

  @IsDateString()
  @ApiProperty()
  date: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  accountId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  warehouseId?: string;

  @IsEnum(DeliveryNoteSourceType)
  @ApiProperty({ enum: DeliveryNoteSourceType })
  sourceType: DeliveryNoteSourceType;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sourceId?: string;

  @IsEnum(DeliveryNoteStatus)
  @IsOptional()
  @ApiProperty({ enum: DeliveryNoteStatus, required: false })
  status?: DeliveryNoteStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ required: false })
  discount?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesWaybillItemDto)
  @ApiProperty({ type: [CreateSalesWaybillItemDto] })
  items: CreateSalesWaybillItemDto[];
}
