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

import { CollectionType, PaymentMethod } from '../collection.enums';

/** Swagger circular dependency önleme - literal array */
const COLLECTION_TYPE_VALUES = ['COLLECTION', 'PAYMENT'] as const;
const PAYMENT_METHOD_VALUES = ['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHECK', 'PROMISSORY_NOTE'] as const;

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  accountId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  invoiceId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  serviceInvoiceId?: string;

  @IsEnum(CollectionType)
  @ApiProperty({ enum: COLLECTION_TYPE_VALUES })
  type: CollectionType;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  amount: number;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  date?: string;

  @IsEnum(PaymentMethod)
  @ApiProperty({ enum: PAYMENT_METHOD_VALUES })
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  cashboxId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  bankAccountId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  companyCreditCardId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  notes?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  salesAgentId?: string;
}
