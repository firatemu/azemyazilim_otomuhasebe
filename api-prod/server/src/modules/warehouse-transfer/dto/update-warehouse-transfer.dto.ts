import { PartialType } from '@nestjs/mapped-types';
import { CreateWarehouseTransferDto } from './create-warehouse-transfer.dto';

export class UpdateWarehouseTransferDto extends PartialType(
  CreateWarehouseTransferDto,
) {}
