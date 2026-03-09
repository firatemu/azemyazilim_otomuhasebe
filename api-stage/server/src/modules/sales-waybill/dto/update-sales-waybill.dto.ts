import { PartialType } from '@nestjs/swagger';
import { CreateSalesWaybillDto } from './create-sales-waybill.dto';

export class UpdateSalesWaybillDto extends PartialType(CreateSalesWaybillDto) { }
