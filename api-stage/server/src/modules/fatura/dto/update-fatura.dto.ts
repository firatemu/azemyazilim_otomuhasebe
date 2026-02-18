import { PartialType } from '@nestjs/mapped-types';
import { CreateFaturaDto } from './create-fatura.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { FaturaDurum } from '@prisma/client';

export class UpdateFaturaDto extends PartialType(CreateFaturaDto) {
  @IsEnum(FaturaDurum)
  @IsOptional()
  durum?: FaturaDurum;
}
