import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkInvoicedDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  invoiceNo: string;
}
