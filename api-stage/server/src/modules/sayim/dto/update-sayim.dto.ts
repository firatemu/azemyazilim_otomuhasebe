import { PartialType } from '@nestjs/mapped-types';
import { CreateSayimDto } from './create-sayim.dto';

export class UpdateSayimDto extends PartialType(CreateSayimDto) {}
