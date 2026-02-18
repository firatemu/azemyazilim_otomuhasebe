import { PartialType } from '@nestjs/mapped-types';
import { CreateCariDto } from './create-cari.dto';

export class UpdateCariDto extends PartialType(CreateCariDto) {}
