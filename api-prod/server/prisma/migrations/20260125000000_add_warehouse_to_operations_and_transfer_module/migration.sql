-- AlterTable: Add warehouseId to Fatura
ALTER TABLE "faturalar" ADD COLUMN "warehouseId" TEXT;

-- AlterTable: Add warehouseId to Siparis
ALTER TABLE "siparisler" ADD COLUMN "warehouseId" TEXT;

-- AlterTable: Add warehouseId to Teklif
ALTER TABLE "teklifler" ADD COLUMN "warehouseId" TEXT;

-- AlterTable: Add warehouseId to SatınAlmaSiparisi
ALTER TABLE "satin_alma_siparisleri" ADD COLUMN "warehouseId" TEXT;

-- AlterTable: Add isDefault to Warehouse
ALTER TABLE "warehouses" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum: TransferStatus
CREATE TYPE "TransferStatus" AS ENUM ('HAZIRLANIYOR', 'YOLDA', 'TAMAMLANDI', 'IPTAL');

-- CreateTable: WarehouseTransfer
CREATE TABLE "warehouse_transfers" (
    "id" TEXT NOT NULL,
    "transferNo" TEXT NOT NULL,
    "tenantId" TEXT,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromWarehouseId" TEXT NOT NULL,
    "toWarehouseId" TEXT NOT NULL,
    "durum" "TransferStatus" NOT NULL DEFAULT 'HAZIRLANIYOR',
    "driverName" TEXT,
    "vehiclePlate" TEXT,
    "aciklama" TEXT,
    "hazirlayanUserId" TEXT,
    "onaylayanUserId" TEXT,
    "teslimAlanUserId" TEXT,
    "sevkTarihi" TIMESTAMP(3),
    "teslimTarihi" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WarehouseTransferItem
CREATE TABLE "warehouse_transfer_items" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WarehouseTransferLog
CREATE TABLE "warehouse_transfer_logs" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_transfer_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_transfers_transferNo_tenantId_key" ON "warehouse_transfers"("transferNo", "tenantId");

-- CreateIndex
CREATE INDEX "warehouse_transfers_tenantId_idx" ON "warehouse_transfers"("tenantId");

-- CreateIndex
CREATE INDEX "warehouse_transfers_tenantId_durum_idx" ON "warehouse_transfers"("tenantId", "durum");

-- CreateIndex
CREATE INDEX "warehouse_transfers_fromWarehouseId_idx" ON "warehouse_transfers"("fromWarehouseId");

-- CreateIndex
CREATE INDEX "warehouse_transfers_toWarehouseId_idx" ON "warehouse_transfers"("toWarehouseId");

-- CreateIndex
CREATE INDEX "warehouse_transfers_tarih_idx" ON "warehouse_transfers"("tarih");

-- CreateIndex
CREATE INDEX "warehouse_transfer_items_transferId_idx" ON "warehouse_transfer_items"("transferId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_items_stokId_idx" ON "warehouse_transfer_items"("stokId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_logs_transferId_idx" ON "warehouse_transfer_logs"("transferId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_logs_userId_idx" ON "warehouse_transfer_logs"("userId");

-- CreateIndex
CREATE INDEX "faturalar_warehouseId_idx" ON "faturalar"("warehouseId");

-- CreateIndex
CREATE INDEX "siparisler_warehouseId_idx" ON "siparisler"("warehouseId");

-- CreateIndex
CREATE INDEX "teklifler_warehouseId_idx" ON "teklifler"("warehouseId");

-- CreateIndex
CREATE INDEX "satin_alma_siparisleri_warehouseId_idx" ON "satin_alma_siparisleri"("warehouseId");

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparisleri" ADD CONSTRAINT "satin_alma_siparisleri_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_hazirlayanUserId_fkey" FOREIGN KEY ("hazirlayanUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_onaylayanUserId_fkey" FOREIGN KEY ("onaylayanUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_teslimAlanUserId_fkey" FOREIGN KEY ("teslimAlanUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_items" ADD CONSTRAINT "warehouse_transfer_items_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "warehouse_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_items" ADD CONSTRAINT "warehouse_transfer_items_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_items" ADD CONSTRAINT "warehouse_transfer_items_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_items" ADD CONSTRAINT "warehouse_transfer_items_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_logs" ADD CONSTRAINT "warehouse_transfer_logs_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "warehouse_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_logs" ADD CONSTRAINT "warehouse_transfer_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Data Migration: Create default warehouse for existing tenants
INSERT INTO warehouses (id, code, name, active, "isDefault", "tenantId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'MERKEZ-001',
  'Merkez Ambar',
  true,
  true,
  id,
  NOW(),
  NOW()
FROM tenants
WHERE NOT EXISTS (
  SELECT 1 FROM warehouses WHERE "tenantId" = tenants.id AND "isDefault" = true
);

-- Data Migration: Update existing irsaliyeler without depoId
UPDATE satis_irsaliyeleri
SET "depoId" = (
  SELECT id FROM warehouses WHERE "isDefault" = true AND "tenantId" = satis_irsaliyeleri."tenantId" LIMIT 1
)
WHERE "depoId" IS NULL;

UPDATE satin_alma_irsaliyeleri
SET "depoId" = (
  SELECT id FROM warehouses WHERE "isDefault" = true AND "tenantId" = satin_alma_irsaliyeleri."tenantId" LIMIT 1
)
WHERE "depoId" IS NULL;
