import { IsUUID } from 'class-validator';

export class CalculateCostDto {
  @IsUUID()
  productId!: string;
}
