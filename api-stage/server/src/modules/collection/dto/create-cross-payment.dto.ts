import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../collection.enums';

export class CreateCrossPaymentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  collectionAccountId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  paymentAccountId: string;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  amount: number;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  date?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  @ApiProperty({ enum: PaymentMethod, required: false })
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  notes?: string;
}
