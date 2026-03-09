import { PaymentMethod } from '@prisma/client';

export enum PosInvoiceType {
  SALE = 'SALE',
  RETURN = 'RETURN',
}

export enum PosSessionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface PosCartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  vatRate: number;
  variantId?: string;
  variantName?: string;
}
