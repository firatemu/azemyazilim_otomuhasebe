import { PartRequestStatus } from '@prisma/client';

export const PART_REQUEST_VALID_TRANSITIONS: Record<
  PartRequestStatus,
  PartRequestStatus[]
> = {
  REQUESTED: ['SUPPLIED', 'CANCELLED'],
  SUPPLIED: ['USED'],
  USED: [],
  CANCELLED: [],
};

export function canTransitionPartRequestStatus(
  currentStatus: PartRequestStatus,
  newStatus: PartRequestStatus,
): boolean {
  const allowed = PART_REQUEST_VALID_TRANSITIONS[currentStatus];
  return Boolean(allowed?.includes(newStatus));
}

export function validatePartRequestStatusTransition(
  currentStatus: PartRequestStatus,
  newStatus: PartRequestStatus,
): void {
  if (!canTransitionPartRequestStatus(currentStatus, newStatus)) {
    throw new Error(
      `Geçersiz parça talebi status geçişi: ${currentStatus} -> ${newStatus}`,
    );
  }
}
