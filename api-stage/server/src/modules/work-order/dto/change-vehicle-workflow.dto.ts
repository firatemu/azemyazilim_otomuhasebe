import { IsEnum } from 'class-validator';

import { VehicleWorkflowStatus } from '../work-order.enums';

export class ChangeVehicleWorkflowDto {
  @IsEnum(VehicleWorkflowStatus)
  vehicleWorkflowStatus: VehicleWorkflowStatus;
}
