import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InvoicedPurchaseOrderDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    invoiceNo: string;
}
