import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class SupplyPartRequestDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  suppliedQty: number;
}
