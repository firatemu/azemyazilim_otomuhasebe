import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export enum SimpleOrderStatus {
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  ORDER_PLACED = 'ORDER_PLACED',
  INVOICED = 'INVOICED',
  CANCELLED = 'CANCELLED'
}

// Legacy alias for backward compatibility
export const SimpleOrderDurum = SimpleOrderStatus;
export type SimpleOrderDurum = SimpleOrderStatus;

export class CreateSimpleOrderDto {
  @IsString()
  @IsNotEmpty()
  companyId: string; // Cari ID (tedarikçi)

  @IsString()
  @IsNotEmpty()
  productId: string; // Stok ID

  @IsNumber()
  @Min(1)
  quantity: number;
}
