import { PartialType } from '@nestjs/mapped-types';
import { CreateSatisElemaniDto } from './create-satis-elemani.dto';

export class UpdateSatisElemaniDto extends PartialType(CreateSatisElemaniDto) { }
