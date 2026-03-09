import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { DeliveryNoteStatus } from '@prisma/client';

export class FilterPurchaseWaybillDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(DeliveryNoteStatus)
  status?: DeliveryNoteStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
