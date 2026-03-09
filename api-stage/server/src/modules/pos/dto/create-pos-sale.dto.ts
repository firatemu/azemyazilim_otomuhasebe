import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreatePosSaleDto {
  @ApiProperty({ description: 'Müşteri ID' })
  @IsOptional()
  accountId?: string;

  @ApiProperty({ description: 'Sepetteki ürünler' })
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    discountRate?: number;
    variantId?: string;
  }[];

  @ApiProperty({ description: 'Ödemeler' })
  payments: {
    paymentMethod: PaymentMethod;
    amount: number;
    giftCardId?: string;
    cashboxId?: string;
    bankAccountId?: string;
  }[];

  @ApiProperty({ description: 'Kasa ID (opsiyonel)' })
  @IsOptional()
  cashboxId?: string;

  @ApiProperty({ description: 'Depo ID (opsiyonel)' })
  @IsOptional()
  warehouseId?: string;

  @ApiProperty({ description: 'Notlar' })
  @IsOptional()
  notes?: string;
}
