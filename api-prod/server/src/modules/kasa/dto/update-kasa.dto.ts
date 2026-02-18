import { PartialType } from '@nestjs/mapped-types';
import { CreateKasaDto } from './create-kasa.dto';

export class UpdateKasaDto extends PartialType(CreateKasaDto) {}
