-- CreateEnum: ServiceWorkStatus
CREATE TYPE "ServiceWorkStatus" AS ENUM (
  'SERVICE_ACCEPTED',
  'PRE_DIAGNOSIS',
  'TECHNICAL_DIAGNOSIS',
  'SOLUTION_PROPOSED',
  'WAITING_MANAGER_APPROVAL',
  'APPROVED',
  'PART_SUPPLY',
  'IN_PROGRESS',
  'QUALITY_CONTROL',
  'READY_FOR_BILLING',
  'INVOICED',
  'CLOSED',
  'CANCELLED'
);

-- CreateTable: WorkOrderStatusHistory
CREATE TABLE "work_order_status_history" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "fromStatus" "ServiceWorkStatus",
    "toStatus" "ServiceWorkStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "work_order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_order_status_history_tenantId_idx" ON "work_order_status_history"("tenantId");

-- CreateIndex
CREATE INDEX "work_order_status_history_tenantId_workOrderId_idx" ON "work_order_status_history"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "work_order_status_history_tenantId_changedAt_idx" ON "work_order_status_history"("tenantId", "changedAt");

-- AddForeignKey
ALTER TABLE "work_order_status_history" ADD CONSTRAINT "work_order_status_history_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

