import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  categoryId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  notes?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @ApiProperty()
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  date: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  @ApiProperty({ enum: PaymentMethod })
  paymentType: PaymentMethod;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  cashboxId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  bankAccountId?: string;
}
