import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export enum PartRequestStatus {
  REQUESTED = 'REQUESTED',
  SUPPLIED = 'SUPPLIED',
  USED = 'USED',
  CANCELLED = 'CANCELLED'
}

export class CreatePartRequestDto {
  @IsNotEmpty()
  @IsString()
  workOrderId: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsNumber()
  @Min(1)
  requestedQty: number;
}
