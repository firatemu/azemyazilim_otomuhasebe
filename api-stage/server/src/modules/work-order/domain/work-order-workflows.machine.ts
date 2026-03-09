import { PartWorkflowStatus, VehicleWorkflowStatus } from '../work-order.enums';

// Parça İş Akışı Geçişleri
export const PART_WORKFLOW_VALID_TRANSITIONS: Record<
  PartWorkflowStatus,
  PartWorkflowStatus[]
> = {
  NOT_STARTED: ['PARTS_SUPPLIED_DIRECT', 'PARTS_PENDING'],
  PARTS_SUPPLIED_DIRECT: [],
  PARTS_PENDING: ['PARTIALLY_SUPPLIED', 'ALL_PARTS_SUPPLIED'],
  PARTIALLY_SUPPLIED: ['PARTIALLY_SUPPLIED', 'ALL_PARTS_SUPPLIED'],
  ALL_PARTS_SUPPLIED: [],
};

// Araç İş Akışı Geçişleri
export const VEHICLE_WORKFLOW_VALID_TRANSITIONS: Record<
  VehicleWorkflowStatus,
  VehicleWorkflowStatus[]
> = {
  WAITING: ['IN_PROGRESS', 'DELIVERED'],
  IN_PROGRESS: ['READY', 'DELIVERED'],
  READY: ['DELIVERED'],
  DELIVERED: [],
};

export function canTransitionVehicleWorkflow(
  current: VehicleWorkflowStatus,
  next: VehicleWorkflowStatus,
): boolean {
  return VEHICLE_WORKFLOW_VALID_TRANSITIONS[current]?.includes(next) ?? false;
}
