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

import { OrderType, SalesOrderStatus } from '../order.enums';

export class CreateOrderItemDto {
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

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ required: false })
  discountRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ required: false })
  discountAmount?: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  orderNo: string;

  @IsEnum(OrderType)
  @ApiProperty({ enum: OrderType })
  orderType: OrderType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  accountId: string;

  @IsDateString()
  @ApiProperty()
  date: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  dueDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ required: false })
  discount?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  notes?: string;

  @IsEnum(SalesOrderStatus)
  @IsOptional()
  @ApiProperty({ enum: SalesOrderStatus, required: false })
  status?: SalesOrderStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ApiProperty({ type: [CreateOrderItemDto] })
  items: CreateOrderItemDto[];
}
