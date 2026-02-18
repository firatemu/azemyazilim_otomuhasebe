import { IsEnum } from 'class-validator';
import { ModuleType } from '@prisma/client';

export class GetNextCodeDto {
  @IsEnum(ModuleType)
  module: ModuleType;
}
