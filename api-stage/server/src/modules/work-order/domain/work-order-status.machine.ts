import { WorkOrderStatus } from '../work-order.enums';

export const WORK_ORDER_VALID_TRANSITIONS: Record<
  WorkOrderStatus,
  WorkOrderStatus[]
> = {
  WAITING_DIAGNOSIS: ['PENDING_APPROVAL', 'APPROVED_IN_PROGRESS', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED_IN_PROGRESS', 'CANCELLED'],
  APPROVED_IN_PROGRESS: ['PART_WAITING', 'VEHICLE_READY', 'CANCELLED'],
  PART_WAITING: ['PARTS_SUPPLIED', 'CANCELLED'],
  PARTS_SUPPLIED: ['VEHICLE_READY', 'CANCELLED'],
  VEHICLE_READY: ['INVOICED_CLOSED', 'CLOSED_WITHOUT_INVOICE', 'CANCELLED'],
  INVOICED_CLOSED: [],
  CLOSED_WITHOUT_INVOICE: [],
  CANCELLED: [],
};

export function canTransitionWorkOrderStatus(
  currentStatus: WorkOrderStatus,
  newStatus: WorkOrderStatus,
): boolean {
  const allowed = WORK_ORDER_VALID_TRANSITIONS[currentStatus];
  return Boolean(allowed?.includes(newStatus));
}

export function validateWorkOrderStatusTransition(
  currentStatus: WorkOrderStatus,
  newStatus: WorkOrderStatus,
): void {
  if (!canTransitionWorkOrderStatus(currentStatus, newStatus)) {
    throw new Error(
      `Geçersiz status geçişi: ${currentStatus} -> ${newStatus}`,
    );
  }
}
