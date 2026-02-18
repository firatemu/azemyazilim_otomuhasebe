import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
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
  kdvOrani: number;

  @IsString()
  @IsOptional()
  purchaseOrderItemId?: string;
}

export class CreateInvoiceFromOrderDto {
  @IsString()
  @IsNotEmpty()
  faturaNo: string;

  @IsDateString()
  @IsOptional()
  tarih?: string;

  @IsDateString()
  @IsOptional()
  vade?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  iskonto?: number;

  @IsString()
  @IsOptional()
  aciklama?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  kalemler: CreateInvoiceItemDto[];
}
