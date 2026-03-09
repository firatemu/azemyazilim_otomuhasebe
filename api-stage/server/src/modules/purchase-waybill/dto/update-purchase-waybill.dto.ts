import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseWaybillDto } from './create-purchase-waybill.dto';

export class UpdatePurchaseWaybillDto extends PartialType(
  CreatePurchaseWaybillDto,
) {}

