import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class CalculateBulkCostDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(500, { message: 'En fazla 500 product aynı anda hesaplanabilir.' })
  productIds!: string[];
}
