-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('ACCEPTED', 'DIAGNOSIS', 'WAITING_FOR_APPROVAL', 'APPROVED', 'PART_WAITING', 'IN_PROGRESS', 'QUALITY_CONTROL', 'READY_FOR_DELIVERY', 'INVOICED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkOrderLineType" AS ENUM ('LABOR', 'PART');

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "vin" TEXT,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "engineSize" TEXT,
    "fuelType" TEXT,
    "color" TEXT,
    "mileage" INTEGER,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "specialization" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderNo" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "technicianId" TEXT,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'ACCEPTED',
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosisAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "estimatedDelivery" TIMESTAMP(3),
    "complaint" TEXT,
    "findings" TEXT,
    "internalNotes" TEXT,
    "invoiceId" TEXT,
    "laborTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "partsTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_lines" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "lineType" "WorkOrderLineType" NOT NULL,
    "description" TEXT,
    "laborHours" DECIMAL(5,2),
    "hourlyRate" DECIMAL(10,2),
    "productId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "discountRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxRate" INTEGER NOT NULL DEFAULT 20,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_audit_logs" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousStatus" "WorkOrderStatus",
    "newStatus" "WorkOrderStatus",
    "technicianId" TEXT,
    "details" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_maintenance_reminders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "lastServiceDate" TIMESTAMP(3) NOT NULL,
    "lastWorkOrderId" TEXT,
    "lastMileage" INTEGER,
    "nextReminderDate" TIMESTAMP(3) NOT NULL,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_maintenance_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: vehicles
CREATE INDEX "vehicles_tenantId_idx" ON "vehicles"("tenantId");
CREATE INDEX "vehicles_tenantId_plateNumber_idx" ON "vehicles"("tenantId", "plateNumber");
CREATE INDEX "vehicles_customerId_idx" ON "vehicles"("customerId");
CREATE INDEX "vehicles_vin_idx" ON "vehicles"("vin");
CREATE UNIQUE INDEX "vehicles_tenantId_plateNumber_key" ON "vehicles"("tenantId", "plateNumber");

-- CreateIndex: technicians
CREATE INDEX "technicians_tenantId_idx" ON "technicians"("tenantId");
CREATE INDEX "technicians_tenantId_code_idx" ON "technicians"("tenantId", "code");
CREATE INDEX "technicians_isActive_idx" ON "technicians"("isActive");
CREATE UNIQUE INDEX "technicians_tenantId_code_key" ON "technicians"("tenantId", "code");

-- CreateIndex: work_orders
CREATE UNIQUE INDEX "work_orders_invoiceId_key" ON "work_orders"("invoiceId");
CREATE INDEX "work_orders_tenantId_idx" ON "work_orders"("tenantId");
CREATE INDEX "work_orders_tenantId_workOrderNo_idx" ON "work_orders"("tenantId", "workOrderNo");
CREATE INDEX "work_orders_vehicleId_idx" ON "work_orders"("vehicleId");
CREATE INDEX "work_orders_customerId_idx" ON "work_orders"("customerId");
CREATE INDEX "work_orders_technicianId_idx" ON "work_orders"("technicianId");
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");
CREATE INDEX "work_orders_acceptedAt_idx" ON "work_orders"("acceptedAt");
CREATE INDEX "work_orders_closedAt_idx" ON "work_orders"("closedAt");
CREATE UNIQUE INDEX "work_orders_tenantId_workOrderNo_key" ON "work_orders"("tenantId", "workOrderNo");

-- CreateIndex: work_order_lines
CREATE INDEX "work_order_lines_workOrderId_idx" ON "work_order_lines"("workOrderId");
CREATE INDEX "work_order_lines_lineType_idx" ON "work_order_lines"("lineType");
CREATE INDEX "work_order_lines_productId_idx" ON "work_order_lines"("productId");
CREATE INDEX "work_order_lines_isUsed_idx" ON "work_order_lines"("isUsed");

-- CreateIndex: work_order_audit_logs
CREATE INDEX "work_order_audit_logs_workOrderId_idx" ON "work_order_audit_logs"("workOrderId");
CREATE INDEX "work_order_audit_logs_action_idx" ON "work_order_audit_logs"("action");
CREATE INDEX "work_order_audit_logs_createdAt_idx" ON "work_order_audit_logs"("createdAt");

-- CreateIndex: vehicle_maintenance_reminders
CREATE UNIQUE INDEX "vehicle_maintenance_reminders_vehicleId_key" ON "vehicle_maintenance_reminders"("vehicleId");
CREATE INDEX "vehicle_maintenance_reminders_tenantId_idx" ON "vehicle_maintenance_reminders"("tenantId");
CREATE INDEX "vehicle_maintenance_reminders_vehicleId_idx" ON "vehicle_maintenance_reminders"("vehicleId");
CREATE INDEX "vehicle_maintenance_reminders_nextReminderDate_idx" ON "vehicle_maintenance_reminders"("nextReminderDate");
CREATE INDEX "vehicle_maintenance_reminders_reminderSent_idx" ON "vehicle_maintenance_reminders"("reminderSent");
CREATE UNIQUE INDEX "vehicle_maintenance_reminders_tenantId_vehicleId_key" ON "vehicle_maintenance_reminders"("tenantId", "vehicleId");

-- AddForeignKey: vehicles
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: technicians
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: work_orders
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "faturalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: work_order_lines
ALTER TABLE "work_order_lines" ADD CONSTRAINT "work_order_lines_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_order_lines" ADD CONSTRAINT "work_order_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "stoklar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: work_order_audit_logs
ALTER TABLE "work_order_audit_logs" ADD CONSTRAINT "work_order_audit_logs_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_order_audit_logs" ADD CONSTRAINT "work_order_audit_logs_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: vehicle_maintenance_reminders
ALTER TABLE "vehicle_maintenance_reminders" ADD CONSTRAINT "vehicle_maintenance_reminders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_maintenance_reminders" ADD CONSTRAINT "vehicle_maintenance_reminders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
