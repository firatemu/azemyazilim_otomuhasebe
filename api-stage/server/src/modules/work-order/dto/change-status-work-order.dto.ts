import { IsEnum } from 'class-validator';

import { WorkOrderStatus } from '../work-order.enums';

export class ChangeStatusWorkOrderDto {
  @IsEnum(WorkOrderStatus)
  status: WorkOrderStatus;
}
