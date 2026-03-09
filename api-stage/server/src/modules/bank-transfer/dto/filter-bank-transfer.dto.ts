import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { TransferType } from './create-bank-transfer.dto';

export class FilterBankTransferDto {
  @IsOptional()
  @IsEnum(TransferType)
  transferType?: TransferType;

  @IsOptional()
  @IsString()
  cashboxId?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  referenceNo?: string;
}
