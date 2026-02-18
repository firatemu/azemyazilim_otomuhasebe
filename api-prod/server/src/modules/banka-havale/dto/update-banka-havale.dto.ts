import { PartialType } from '@nestjs/mapped-types';
import { CreateBankaHavaleDto } from './create-banka-havale.dto';

export class UpdateBankaHavaleDto extends PartialType(CreateBankaHavaleDto) {}
