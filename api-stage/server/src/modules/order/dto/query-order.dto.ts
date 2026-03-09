import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { OrderType, SalesOrderStatus } from '../order.enums';

export class QueryOrderDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  page?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  limit?: string;

  @IsOptional()
  @IsEnum(OrderType)
  @ApiProperty({ enum: OrderType, required: false })
  orderType?: OrderType;

  @IsOptional()
  @IsEnum(SalesOrderStatus)
  @ApiProperty({ enum: SalesOrderStatus, required: false })
  status?: SalesOrderStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  accountId?: string;
}
