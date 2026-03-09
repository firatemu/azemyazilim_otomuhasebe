import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderPreparationItemDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  orderItemId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  locationId: string;

  @IsNumber()
  @Min(1)
  @ApiProperty()
  quantity: number;
}

export class PrepareOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderPreparationItemDto)
  @ApiProperty({ type: [OrderPreparationItemDto] })
  items: OrderPreparationItemDto[];
}
