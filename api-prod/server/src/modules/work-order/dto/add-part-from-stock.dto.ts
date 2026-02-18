import {
  IsString,
  IsInt,
  IsUUID,
  Min,
  IsOptional,
} from 'class-validator';

/**
 * DTO for adding part directly from stock (no price)
 */
export class AddPartFromStockDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

