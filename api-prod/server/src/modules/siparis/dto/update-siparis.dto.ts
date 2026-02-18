import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSiparisDto } from './create-siparis.dto';

export class UpdateSiparisDto extends PartialType(
  OmitType(CreateSiparisDto, ['siparisNo'] as const),
) {}
