import { PartialType } from '@nestjs/mapped-types';
import { CreateStokDto } from './create-stok.dto';

export class UpdateStokDto extends PartialType(CreateStokDto) {}
