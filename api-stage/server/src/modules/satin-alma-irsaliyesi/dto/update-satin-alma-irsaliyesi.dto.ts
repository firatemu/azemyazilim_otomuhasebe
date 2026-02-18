import { PartialType } from '@nestjs/mapped-types';
import { CreateSatınAlmaIrsaliyesiDto } from './create-satin-alma-irsaliyesi.dto';

export class UpdateSatınAlmaIrsaliyesiDto extends PartialType(
  CreateSatınAlmaIrsaliyesiDto,
) {}

