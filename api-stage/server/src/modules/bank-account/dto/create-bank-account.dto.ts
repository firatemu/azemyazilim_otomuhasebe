import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { BankAccountType } from '@prisma/client';

export class CreateBankAccountDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  bankId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  code?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  name?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  bankName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  branchCode?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  branchName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  accountNo?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  iban?: string;

  @IsEnum(BankAccountType)
  @ApiProperty({ enum: BankAccountType })
  type: BankAccountType;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  isActive?: boolean;
}
