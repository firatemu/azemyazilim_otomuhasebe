import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';

export enum TransferType { INCOMING = 'INCOMING', OUTGOING = 'OUTGOING' }

export class CreateBankTransferDto {
  @IsNotEmpty()
  @IsEnum(TransferType)
  transferType: TransferType;

  @IsOptional()
  @IsString()
  cashboxId?: string; // Kasa.id (opsiyonel)

  @IsOptional()
  @IsString()
  bankAccountId?: string; // BankAccount.id (yeni sistem)

  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  referenceNo?: string;

  @IsOptional()
  @IsString()
  sender?: string;

  @IsOptional()
  @IsString()
  receiver?: string;
}
