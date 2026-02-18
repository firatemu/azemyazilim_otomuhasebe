import { PartialType } from '@nestjs/mapped-types';
import { CreateSatisIrsaliyesiDto } from './create-satis-irsaliyesi.dto';

export class UpdateSatisIrsaliyesiDto extends PartialType(
  CreateSatisIrsaliyesiDto,
) {}

