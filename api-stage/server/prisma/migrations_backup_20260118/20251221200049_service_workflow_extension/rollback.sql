-- Rollback: Service Workflow Extension

-- DropForeignKey
ALTER TABLE "work_order_status_history" DROP CONSTRAINT IF EXISTS "work_order_status_history_workOrderId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "work_order_status_history_tenantId_changedAt_idx";
DROP INDEX IF EXISTS "work_order_status_history_tenantId_workOrderId_idx";
DROP INDEX IF EXISTS "work_order_status_history_tenantId_idx";

-- DropTable
DROP TABLE IF EXISTS "work_order_status_history";

-- DropEnum
DROP TYPE IF EXISTS "ServiceWorkStatus";

