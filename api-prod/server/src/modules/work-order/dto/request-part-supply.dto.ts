import {
  IsString,
  IsInt,
  Min,
  IsNotEmpty,
} from 'class-validator';

/**
 * DTO for requesting part supply (manual description, no productId initially)
 */
export class RequestPartSupplyDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

