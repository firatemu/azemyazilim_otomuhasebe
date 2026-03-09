import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export enum OrderStatus { PENDING = 'PENDING', PARTIAL = 'PARTIAL', COMPLETED = 'COMPLETED', CANCELLED = 'CANCELLED' }

export class PurchaseOrderFilterDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  supplierId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
