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
import { ModuleType } from '../../code-template/code-template.enums';
import { DeliveryNoteStatus, DeliveryNoteSourceType } from '../../sales-waybill/sales-waybill.enums';

import { InvoiceType, InvoiceStatus } from '../invoice.enums';

export class CreateInvoiceItemDto {
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

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  withholdingCode?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ required: false })
  withholdingRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ required: false })
  sctRate?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  vatExemptionReason?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  unit?: string;
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  invoiceNo: string;

  @IsEnum(InvoiceType)
  @ApiProperty({ enum: InvoiceType })
  type: InvoiceType;

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

  @IsEnum(InvoiceStatus)
  @IsOptional()
  @ApiProperty({ enum: InvoiceStatus, required: false })
  status?: InvoiceStatus;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  orderId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  deliveryNoteId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  warehouseId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  @ApiProperty({ type: [CreateInvoiceItemDto] })
  items: CreateInvoiceItemDto[];

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  salesAgentId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  currency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ required: false })
  exchangeRate?: number;

  // e-Dönüşüm Alanları
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  eScenario?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  eInvoiceType?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  gibAlias?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  shippingType?: string;
}
