import { PartialType } from '@nestjs/mapped-types';
import { CreateCekSenetDto } from './create-cek-senet.dto';

export class UpdateCekSenetDto extends PartialType(CreateCekSenetDto) {}
