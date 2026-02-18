import { PartialType } from '@nestjs/mapped-types';
import { CreateAracDto } from './create-arac.dto';

export class UpdateAracDto extends PartialType(CreateAracDto) {}
