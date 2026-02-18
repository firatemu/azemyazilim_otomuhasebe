-- CreateTable
CREATE TABLE IF NOT EXISTS "warehouse_critical_stocks" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "criticalQty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_critical_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_critical_stocks_warehouseId_productId_key" ON "warehouse_critical_stocks"("warehouseId", "productId");

-- CreateIndex
CREATE INDEX "warehouse_critical_stocks_warehouseId_idx" ON "warehouse_critical_stocks"("warehouseId");

-- CreateIndex
CREATE INDEX "warehouse_critical_stocks_productId_idx" ON "warehouse_critical_stocks"("productId");

-- AddForeignKey
ALTER TABLE "warehouse_critical_stocks" ADD CONSTRAINT "warehouse_critical_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_critical_stocks" ADD CONSTRAINT "warehouse_critical_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
