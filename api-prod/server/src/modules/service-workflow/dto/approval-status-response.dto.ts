import { ServiceWorkStatus } from '@prisma/client';

export class ApprovalStatusResponse {
  workOrderId: string;
  status: ServiceWorkStatus;
  hasActiveApproval: boolean;
  approvedPackageId?: string;
  approvedBy?: string;
  approvedAt?: Date;
  approvalNote?: string;
}

