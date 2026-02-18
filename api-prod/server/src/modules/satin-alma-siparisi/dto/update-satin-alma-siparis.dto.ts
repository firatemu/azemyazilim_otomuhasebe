import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSatinAlmaSiparisDto } from './create-satin-alma-siparis.dto';

export class UpdateSatinAlmaSiparisDto extends PartialType(
  OmitType(CreateSatinAlmaSiparisDto, ['siparisNo'] as const),
) {}
