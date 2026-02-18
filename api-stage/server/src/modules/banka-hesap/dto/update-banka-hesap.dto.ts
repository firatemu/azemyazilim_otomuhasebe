import { PartialType } from '@nestjs/mapped-types';
import { CreateBankaHesapDto } from './create-banka-hesap.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateBankaHesapDto extends PartialType(
  OmitType(CreateBankaHesapDto, ['kasaId'] as const),
) {}
