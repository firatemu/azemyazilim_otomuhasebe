import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateInvoiceDto } from './create-invoice.dto';
import { InvoiceStatus } from '../invoice.enums';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsEnum(InvoiceStatus)
  @IsOptional()
  @ApiProperty({ enum: InvoiceStatus, required: false })
  status?: InvoiceStatus;
}
