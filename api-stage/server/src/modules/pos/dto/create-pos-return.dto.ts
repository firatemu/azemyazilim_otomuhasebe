import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreatePosReturnDto {
  @ApiProperty({ description: 'İade edilen fatura ID' })
  originalInvoiceId: string;

  @ApiProperty({ description: 'İade edilen ürünler' })
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
  }[];

  @ApiProperty({ description: 'İade amountı' })
  totalAmount: number;

  @ApiProperty({ description: 'Ödeme yöntemi' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'İade notesı' })
  @IsOptional()
  notes?: string;
}
