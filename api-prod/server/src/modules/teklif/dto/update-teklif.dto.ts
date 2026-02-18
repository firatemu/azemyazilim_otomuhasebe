import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTeklifDto } from './create-teklif.dto';

export class UpdateTeklifDto extends PartialType(
  OmitType(CreateTeklifDto, ['teklifNo'] as const),
) {}
