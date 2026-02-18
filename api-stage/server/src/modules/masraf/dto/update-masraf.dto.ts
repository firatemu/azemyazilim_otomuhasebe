import { PartialType } from '@nestjs/mapped-types';
import { CreateMasrafDto } from './create-masraf.dto';

export class UpdateMasrafDto extends PartialType(CreateMasrafDto) {}
