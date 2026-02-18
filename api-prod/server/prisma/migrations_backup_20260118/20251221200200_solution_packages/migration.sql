-- CreateTable: SolutionPackage
CREATE TABLE "solution_packages" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedDurationMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "solution_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SolutionPackagePart
CREATE TABLE "solution_package_parts" (
    "id" TEXT NOT NULL,
    "solutionPackageId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "solution_package_parts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "solution_packages_tenantId_workOrderId_idx" ON "solution_packages"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "solution_packages_tenantId_createdAt_idx" ON "solution_packages"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "solution_package_parts_solutionPackageId_idx" ON "solution_package_parts"("solutionPackageId");

-- CreateIndex
CREATE UNIQUE INDEX "solution_package_parts_solutionPackageId_productId_key" ON "solution_package_parts"("solutionPackageId", "productId");

-- AddForeignKey
ALTER TABLE "solution_packages" ADD CONSTRAINT "solution_packages_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_package_parts" ADD CONSTRAINT "solution_package_parts_solutionPackageId_fkey" FOREIGN KEY ("solutionPackageId") REFERENCES "solution_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_package_parts" ADD CONSTRAINT "solution_package_parts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

