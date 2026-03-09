import { IsEnum } from 'class-validator';
import { ModuleType } from '../code-template.enums';
import { ApiProperty } from '@nestjs/swagger';

export class GetNextCodeDto {
  @ApiProperty({ enum: ModuleType })
  @IsEnum(ModuleType)
  module: ModuleType;
}
