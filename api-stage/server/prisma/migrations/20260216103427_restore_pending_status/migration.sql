/*
  Warnings:

  - You are about to drop the `diagnoses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `diagnosis_approvals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `in_app_notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supply_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `technician_time_trackings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `technicians` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle_maintenance_reminders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_order_audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_order_lines` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_order_status_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_order_timeline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_orders` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TenantStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "TenantStatus" ADD VALUE 'PURGED';
ALTER TYPE "TenantStatus" ADD VALUE 'EXPIRED';

-- DropForeignKey
ALTER TABLE "diagnoses" DROP CONSTRAINT "diagnoses_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "diagnoses" DROP CONSTRAINT "diagnoses_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "diagnoses" DROP CONSTRAINT "diagnoses_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "diagnosis_approvals" DROP CONSTRAINT "diagnosis_approvals_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "diagnostic_notes" DROP CONSTRAINT "diagnostic_notes_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "in_app_notifications" DROP CONSTRAINT "in_app_notifications_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "in_app_notifications" DROP CONSTRAINT "in_app_notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "in_app_notifications" DROP CONSTRAINT "in_app_notifications_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "manager_approvals" DROP CONSTRAINT "manager_approvals_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "manager_rejections" DROP CONSTRAINT "manager_rejections_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "price_quotes" DROP CONSTRAINT "price_quotes_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "solution_packages" DROP CONSTRAINT "solution_packages_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "supply_requests" DROP CONSTRAINT "supply_requests_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "tahsilatlar" DROP CONSTRAINT "tahsilatlar_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "technical_findings" DROP CONSTRAINT "technical_findings_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "technician_time_trackings" DROP CONSTRAINT "technician_time_trackings_technicianId_fkey";

-- DropForeignKey
ALTER TABLE "technician_time_trackings" DROP CONSTRAINT "technician_time_trackings_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "technician_time_trackings" DROP CONSTRAINT "technician_time_trackings_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "technicians" DROP CONSTRAINT "technicians_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_maintenance_reminders" DROP CONSTRAINT "vehicle_maintenance_reminders_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_maintenance_reminders" DROP CONSTRAINT "vehicle_maintenance_reminders_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_customerId_fkey";

-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "work_order_audit_logs" DROP CONSTRAINT "work_order_audit_logs_technicianId_fkey";

-- DropForeignKey
ALTER TABLE "work_order_audit_logs" DROP CONSTRAINT "work_order_audit_logs_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "work_order_lines" DROP CONSTRAINT "work_order_lines_approvedBy_fkey";

-- DropForeignKey
ALTER TABLE "work_order_lines" DROP CONSTRAINT "work_order_lines_productId_fkey";

-- DropForeignKey
ALTER TABLE "work_order_lines" DROP CONSTRAINT "work_order_lines_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "work_order_status_history" DROP CONSTRAINT "work_order_status_history_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "work_order_timeline" DROP CONSTRAINT "work_order_timeline_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_claimedBy_fkey";

-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_customerId_fkey";

-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_technicianId_fkey";

-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_vehicleId_fkey";

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "purgedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "diagnoses";

-- DropTable
DROP TABLE "diagnosis_approvals";

-- DropTable
DROP TABLE "in_app_notifications";

-- DropTable
DROP TABLE "supply_requests";

-- DropTable
DROP TABLE "technician_time_trackings";

-- DropTable
DROP TABLE "technicians";

-- DropTable
DROP TABLE "vehicle_maintenance_reminders";

-- DropTable
DROP TABLE "vehicles";

-- DropTable
DROP TABLE "work_order_audit_logs";

-- DropTable
DROP TABLE "work_order_lines";

-- DropTable
DROP TABLE "work_order_status_history";

-- DropTable
DROP TABLE "work_order_timeline";

-- DropTable
DROP TABLE "work_orders";

-- DropEnum
DROP TYPE "ApprovalStatus";

-- DropEnum
DROP TYPE "DiagnosisStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "PartSource";

-- DropEnum
DROP TYPE "SupplyRequestStatus";

-- DropEnum
DROP TYPE "WorkOrderLineType";

-- DropEnum
DROP TYPE "WorkOrderStatus";

-- CreateTable
CREATE TABLE "tenant_purge_audits" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "deletedFiles" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_purge_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tenant_purge_audits_tenantId_idx" ON "tenant_purge_audits"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_purge_audits_adminId_idx" ON "tenant_purge_audits"("adminId");

-- CreateIndex
CREATE INDEX "tenant_purge_audits_createdAt_idx" ON "tenant_purge_audits"("createdAt");

-- AddForeignKey
ALTER TABLE "tenant_purge_audits" ADD CONSTRAINT "tenant_purge_audits_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
