/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,warehouseId,code]` on the table `locations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,productId,barcode]` on the table `product_barcodes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,warehouseId,locationId,productId]` on the table `product_location_stocks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "locations_warehouseId_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "locations_tenantId_warehouseId_code_key" ON "locations"("tenantId", "warehouseId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "product_barcodes_tenantId_productId_barcode_key" ON "product_barcodes"("tenantId", "productId", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "product_location_stocks_tenantId_warehouseId_locationId_pro_key" ON "product_location_stocks"("tenantId", "warehouseId", "locationId", "productId");
