import {
  IsUUID,
  IsString,
  IsOptional,
} from 'class-validator';

/**
 * DTO for approving supply request and matching with stock product
 */
export class ApproveSupplyRequestDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsString()
  note?: string;
}

