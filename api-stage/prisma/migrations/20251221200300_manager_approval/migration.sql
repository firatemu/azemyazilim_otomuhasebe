-- CreateTable: ManagerApproval
CREATE TABLE "manager_approvals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "solutionPackageId" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalNote" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "manager_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ManagerRejection
CREATE TABLE "manager_rejections" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "solutionPackageId" TEXT NOT NULL,
    "rejectedBy" TEXT NOT NULL,
    "rejectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejectionReason" TEXT NOT NULL,

    CONSTRAINT "manager_rejections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manager_approvals_workOrderId_key" ON "manager_approvals"("workOrderId");

-- CreateIndex
CREATE INDEX "manager_approvals_tenantId_workOrderId_idx" ON "manager_approvals"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "manager_approvals_tenantId_approvedAt_idx" ON "manager_approvals"("tenantId", "approvedAt");

-- CreateIndex
CREATE INDEX "manager_approvals_deletedAt_idx" ON "manager_approvals"("deletedAt");

-- CreateIndex
CREATE INDEX "manager_rejections_tenantId_workOrderId_idx" ON "manager_rejections"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "manager_rejections_tenantId_rejectedAt_idx" ON "manager_rejections"("tenantId", "rejectedAt");

-- AddForeignKey
ALTER TABLE "manager_approvals" ADD CONSTRAINT "manager_approvals_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_approvals" ADD CONSTRAINT "manager_approvals_solutionPackageId_fkey" FOREIGN KEY ("solutionPackageId") REFERENCES "solution_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_rejections" ADD CONSTRAINT "manager_rejections_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_rejections" ADD CONSTRAINT "manager_rejections_solutionPackageId_fkey" FOREIGN KEY ("solutionPackageId") REFERENCES "solution_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

