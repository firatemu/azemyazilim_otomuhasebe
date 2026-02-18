/*
  Warnings:

  - The values [SEVK] on the enum `AdresTipi` will be removed. If these variants are still used in the database, this will fail.
  - The values [AVUKAT_TAKIBINDE,KARSILIKSIZ] on the enum `CekSenetDurum` will be removed. If these variants are still used in the database, this will fail.
  - The values [BLOKELI] on the enum `RiskDurumu` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `riskLimiti` on the `cariler` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(12,2)`.
  - You are about to alter the column `teminatTutar` on the `cariler` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(12,2)`.
  - You are about to alter the column `dovizKuru` on the `faturalar` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,6)` to `Decimal(10,4)`.
  - You are about to drop the column `bodyType` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `engineNumber` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `inspectionDate` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceDate` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `kaskoDate` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `licenseOwner` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `licenseSerial` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `transmission` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyDate` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the `permission_audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `cari_adresler` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `cari_bankalar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `cari_yetkililer` table without a default value. This is not possible if the table is not empty.
  - Made the column `dovizCinsi` on table `faturalar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dovizKuru` on table `faturalar` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_APPROVED');

-- AlterEnum
BEGIN;
CREATE TYPE "AdresTipi_new" AS ENUM ('TESLIMAT', 'FATURA', 'MERKEZ', 'SUBE', 'DEPO', 'DIGER');
ALTER TABLE "public"."cari_adresler" ALTER COLUMN "tip" DROP DEFAULT;
ALTER TABLE "cari_adresler" ALTER COLUMN "tip" TYPE "AdresTipi_new" USING ("tip"::text::"AdresTipi_new");
ALTER TYPE "AdresTipi" RENAME TO "AdresTipi_old";
ALTER TYPE "AdresTipi_new" RENAME TO "AdresTipi";
DROP TYPE "public"."AdresTipi_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BordroTipi" ADD VALUE 'GIRIS_BORDROSU';
ALTER TYPE "BordroTipi" ADD VALUE 'CIKIS_BORDROSU';
ALTER TYPE "BordroTipi" ADD VALUE 'MUSTERI_EVRAK_CIKIS';
ALTER TYPE "BordroTipi" ADD VALUE 'KENDI_EVRAK_GIRIS';
ALTER TYPE "BordroTipi" ADD VALUE 'KENDI_EVRAK_CIKIS';

-- AlterEnum
BEGIN;
CREATE TYPE "CekSenetDurum_new" AS ENUM ('PORTFOYDE', 'ODENMEDI', 'BANKAYA_VERILDI', 'TAHSIL_EDILDI', 'ODENDI', 'CIRO_EDILDI', 'IADE_EDILDI', 'KARSILIKIZ', 'BANKA_TAHSILDE', 'BANKA_TEMINATTA');
ALTER TABLE "cek_senetler" ALTER COLUMN "durum" TYPE "CekSenetDurum_new" USING ("durum"::text::"CekSenetDurum_new");
ALTER TABLE "deleted_cek_senetler" ALTER COLUMN "durum" TYPE "CekSenetDurum_new" USING ("durum"::text::"CekSenetDurum_new");
ALTER TYPE "CekSenetDurum" RENAME TO "CekSenetDurum_old";
ALTER TYPE "CekSenetDurum_new" RENAME TO "CekSenetDurum";
DROP TYPE "public"."CekSenetDurum_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RiskDurumu_new" AS ENUM ('NORMAL', 'RISKLI', 'KARA_LISTE', 'TAKIPTE');
ALTER TABLE "public"."cariler" ALTER COLUMN "riskDurumu" DROP DEFAULT;
ALTER TABLE "cariler" ALTER COLUMN "riskDurumu" TYPE "RiskDurumu_new" USING ("riskDurumu"::text::"RiskDurumu_new");
ALTER TYPE "RiskDurumu" RENAME TO "RiskDurumu_old";
ALTER TYPE "RiskDurumu_new" RENAME TO "RiskDurumu";
DROP TYPE "public"."RiskDurumu_old";
ALTER TABLE "cariler" ALTER COLUMN "riskDurumu" SET DEFAULT 'NORMAL';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SupplyRequestStatus" ADD VALUE 'ORDERED';
ALTER TYPE "SupplyRequestStatus" ADD VALUE 'IN_TRANSIT';
ALTER TYPE "SupplyRequestStatus" ADD VALUE 'RECEIVED';
ALTER TYPE "SupplyRequestStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'TECHNICIAN';
ALTER TYPE "UserRole" ADD VALUE 'WORKSHOP_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'RECEPTION';
ALTER TYPE "UserRole" ADD VALUE 'SERVICE_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'PROCUREMENT';
ALTER TYPE "UserRole" ADD VALUE 'WAREHOUSE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WorkOrderStatus" ADD VALUE 'PENDING_ASSIGNMENT';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'AWAITING_CUSTOMER_APPROVAL';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'PARTIALLY_APPROVED';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'PROCUREMENT_PENDING';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'PARTS_ARRIVED';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'QUALITY_CHECK';

-- DropForeignKey
ALTER TABLE "cari_hareketler" DROP CONSTRAINT "cari_hareketler_cariId_fkey";

-- DropForeignKey
ALTER TABLE "fatura_tahsilatlar" DROP CONSTRAINT "fatura_tahsilatlar_faturaId_fkey";

-- DropForeignKey
ALTER TABLE "fatura_tahsilatlar" DROP CONSTRAINT "fatura_tahsilatlar_tahsilatId_fkey";

-- DropForeignKey
ALTER TABLE "permission_audit_logs" DROP CONSTRAINT "permission_audit_logs_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "permission_audit_logs" DROP CONSTRAINT "permission_audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "stock_moves" DROP CONSTRAINT "stock_moves_productId_fkey";

-- DropForeignKey
ALTER TABLE "stok_hareketleri" DROP CONSTRAINT "stok_hareketleri_stokId_fkey";

-- DropForeignKey
ALTER TABLE "tahsilatlar" DROP CONSTRAINT "tahsilatlar_faturaId_fkey";

-- DropIndex
DROP INDEX "cari_hareketler_cariId_tenantId_idx";

-- DropIndex
DROP INDEX "fatura_tahsilatlar_faturaId_tenantId_idx";

-- DropIndex
DROP INDEX "fatura_tahsilatlar_tahsilatId_tenantId_idx";

-- DropIndex
DROP INDEX "permissions_module_idx";

-- DropIndex
DROP INDEX "role_permissions_roleId_idx";

-- DropIndex
DROP INDEX "stok_hareketleri_stokId_tenantId_idx";

-- DropIndex
DROP INDEX "users_roleId_idx";

-- AlterTable
ALTER TABLE "banka_kredi_planlari" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "banka_krediler" ADD COLUMN     "tenantId" TEXT,
ALTER COLUMN "toplamFaiz" DROP DEFAULT,
ALTER COLUMN "yillikFaizOrani" DROP NOT NULL,
ALTER COLUMN "yillikFaizOrani" DROP DEFAULT;

-- AlterTable
ALTER TABLE "cari_adresler" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "tip" DROP DEFAULT;

-- AlterTable
ALTER TABLE "cari_bankalar" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "paraBirimi" DROP NOT NULL,
ALTER COLUMN "paraBirimi" DROP DEFAULT;

-- AlterTable
ALTER TABLE "cari_yetkililer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "cariler" ALTER COLUMN "paraBirimi" DROP DEFAULT,
ALTER COLUMN "riskDurumu" DROP NOT NULL,
ALTER COLUMN "riskLimiti" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "teminatTutar" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "faturalar" ALTER COLUMN "dovizCinsi" SET NOT NULL,
ALTER COLUMN "dovizKuru" SET NOT NULL,
ALTER COLUMN "dovizKuru" SET DEFAULT 1,
ALTER COLUMN "dovizKuru" SET DATA TYPE DECIMAL(10,4);

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "tenantId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tahsilatlar" ADD COLUMN     "workOrderId" TEXT;

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "bodyType",
DROP COLUMN "engineNumber",
DROP COLUMN "inspectionDate",
DROP COLUMN "insuranceDate",
DROP COLUMN "kaskoDate",
DROP COLUMN "licenseNumber",
DROP COLUMN "licenseOwner",
DROP COLUMN "licenseSerial",
DROP COLUMN "transmission",
DROP COLUMN "warrantyDate";

-- DropTable
DROP TABLE "permission_audit_logs";

-- CreateTable
CREATE TABLE "diagnosis_approvals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "rejectedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "approvedItems" JSONB,
    "rejectedItems" JSONB,
    "customerNotes" TEXT,
    "internalNotes" TEXT,
    "totalEstimate" DECIMAL(12,2) NOT NULL,
    "laborEstimate" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "partsEstimate" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnosis_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_requests" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "status" "SupplyRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedParts" JSONB NOT NULL,
    "estimatedArrival" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "supplierInfo" JSONB,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "orderedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supply_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_timeline" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "description" TEXT,
    "performedBy" TEXT,
    "performedByName" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_quotes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "quotedBy" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "laborCost" DECIMAL(12,2) NOT NULL,
    "partsCost" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "customerResponse" TEXT,
    "customerNotes" TEXT,
    "itemsBreakdown" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "diagnosis_approvals_tenantId_idx" ON "diagnosis_approvals"("tenantId");

-- CreateIndex
CREATE INDEX "diagnosis_approvals_workOrderId_idx" ON "diagnosis_approvals"("workOrderId");

-- CreateIndex
CREATE INDEX "diagnosis_approvals_approvalStatus_idx" ON "diagnosis_approvals"("approvalStatus");

-- CreateIndex
CREATE INDEX "diagnosis_approvals_createdAt_idx" ON "diagnosis_approvals"("createdAt");

-- CreateIndex
CREATE INDEX "supply_requests_tenantId_idx" ON "supply_requests"("tenantId");

-- CreateIndex
CREATE INDEX "supply_requests_workOrderId_idx" ON "supply_requests"("workOrderId");

-- CreateIndex
CREATE INDEX "supply_requests_status_idx" ON "supply_requests"("status");

-- CreateIndex
CREATE INDEX "supply_requests_requestedAt_idx" ON "supply_requests"("requestedAt");

-- CreateIndex
CREATE INDEX "work_order_timeline_tenantId_idx" ON "work_order_timeline"("tenantId");

-- CreateIndex
CREATE INDEX "work_order_timeline_workOrderId_idx" ON "work_order_timeline"("workOrderId");

-- CreateIndex
CREATE INDEX "work_order_timeline_timestamp_idx" ON "work_order_timeline"("timestamp");

-- CreateIndex
CREATE INDEX "work_order_timeline_eventType_idx" ON "work_order_timeline"("eventType");

-- CreateIndex
CREATE INDEX "price_quotes_tenantId_idx" ON "price_quotes"("tenantId");

-- CreateIndex
CREATE INDEX "price_quotes_workOrderId_idx" ON "price_quotes"("workOrderId");

-- CreateIndex
CREATE INDEX "price_quotes_createdAt_idx" ON "price_quotes"("createdAt");

-- CreateIndex
CREATE INDEX "tahsilatlar_workOrderId_idx" ON "tahsilatlar"("workOrderId");

-- AddForeignKey
ALTER TABLE "stok_hareketleri" ADD CONSTRAINT "stok_hareketleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cari_hareketler" ADD CONSTRAINT "cari_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_tahsilatlar" ADD CONSTRAINT "fatura_tahsilatlar_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_tahsilatlar" ADD CONSTRAINT "fatura_tahsilatlar_tahsilatId_fkey" FOREIGN KEY ("tahsilatId") REFERENCES "tahsilatlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_productId_fkey" FOREIGN KEY ("productId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_approvals" ADD CONSTRAINT "diagnosis_approvals_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_requests" ADD CONSTRAINT "supply_requests_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_timeline" ADD CONSTRAINT "work_order_timeline_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_quotes" ADD CONSTRAINT "price_quotes_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
