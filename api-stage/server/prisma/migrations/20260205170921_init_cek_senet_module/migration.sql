/*
  Warnings:

  - You are about to drop the column `created_at` on the `system_parameters` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `system_parameters` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `system_parameters` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId,key]` on the table `system_parameters` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `system_parameters` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('HAZIRLANIYOR', 'YOLDA', 'TAMAMLANDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "MaasDurum" AS ENUM ('ODENMEDI', 'KISMI_ODENDI', 'TAMAMEN_ODENDI');

-- CreateEnum
CREATE TYPE "AvansDurum" AS ENUM ('ACIK', 'KISMI', 'KAPALI');

-- CreateEnum
CREATE TYPE "CekSenetTipi" AS ENUM ('MUSTERI_CEK', 'MUSTERI_SENET', 'KENDI_CEKIMIZ', 'KENDI_SENEDIMIZ');

-- CreateEnum
CREATE TYPE "CekSenetDurumu" AS ENUM ('PORTFOY', 'CIRO', 'TAHSIL', 'TEMINAT', 'ODENDI', 'KARSILIKSIZ', 'IADE', 'IPTAL');

-- CreateEnum
CREATE TYPE "BordroTipi" AS ENUM ('GIRIS_BORDROSU', 'CIKIS_BORDROSU');

-- AlterEnum
ALTER TYPE "ModuleType" ADD VALUE 'WAREHOUSE_TRANSFER';

-- DropForeignKey
ALTER TABLE "system_parameters" DROP CONSTRAINT "system_parameters_tenant_id_fkey";

-- DropIndex
DROP INDEX "system_parameters_tenant_id_idx";

-- DropIndex
DROP INDEX "system_parameters_tenant_id_key_key";

-- AlterTable
ALTER TABLE "firma_kredi_kartlari" ADD COLUMN     "hesapKesimTarihi" TIMESTAMP(3),
ADD COLUMN     "sonOdemeTarihi" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "personeller" ADD COLUMN     "prim" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "stok_hareketleri" ADD COLUMN     "warehouseId" TEXT;

-- AlterTable
ALTER TABLE "system_parameters" DROP COLUMN "created_at",
DROP COLUMN "tenant_id",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tenant_settings" ADD COLUMN     "city" TEXT,
ADD COLUMN     "companyType" TEXT DEFAULT 'COMPANY',
ADD COLUMN     "country" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "mersisNo" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "taxOffice" TEXT,
ADD COLUMN     "tcNo" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "warehouses" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "firma_kredi_karti_hatirlaticilar" (
    "id" TEXT NOT NULL,
    "kartId" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "gun" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "firma_kredi_karti_hatirlaticilar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_profit" (
    "id" TEXT NOT NULL,
    "faturaId" TEXT NOT NULL,
    "faturaKalemiId" TEXT,
    "stokId" TEXT NOT NULL,
    "tenantId" TEXT,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "birimMaliyet" DECIMAL(12,4) NOT NULL,
    "toplamSatisTutari" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "toplamMaliyet" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "kar" DECIMAL(12,2) NOT NULL,
    "karOrani" DECIMAL(10,2) NOT NULL,
    "hesaplamaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_profit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_critical_stocks" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "criticalQty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_critical_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "maas_planlari" (
    "id" TEXT NOT NULL,
    "personelId" TEXT NOT NULL,
    "yil" INTEGER NOT NULL,
    "ay" INTEGER NOT NULL,
    "maas" DECIMAL(10,2) NOT NULL,
    "prim" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "toplam" DECIMAL(10,2) NOT NULL,
    "durum" "MaasDurum" NOT NULL DEFAULT 'ODENMEDI',
    "odenenTutar" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "kalanTutar" DECIMAL(10,2) NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "maas_planlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maas_odemeler" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "personelId" TEXT NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aciklama" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,

    CONSTRAINT "maas_odemeler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maas_odeme_detaylari" (
    "id" TEXT NOT NULL,
    "odemeId" TEXT NOT NULL,
    "odemeTipi" "OdemeTipi" NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "kasaId" TEXT,
    "bankaHesapId" TEXT,
    "referansNo" TEXT,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,

    CONSTRAINT "maas_odeme_detaylari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avanslar" (
    "id" TEXT NOT NULL,
    "personelId" TEXT NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aciklama" TEXT,
    "kasaId" TEXT,
    "mahsupEdilen" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "kalan" DECIMAL(10,2) NOT NULL,
    "durum" "AvansDurum" NOT NULL DEFAULT 'ACIK',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "avanslar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avans_mahsuplasmalar" (
    "id" TEXT NOT NULL,
    "avansId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aciklama" TEXT,
    "tenantId" TEXT,

    CONSTRAINT "avans_mahsuplasmalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bordrolar" (
    "id" TEXT NOT NULL,
    "bordroNo" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tip" "BordroTipi" NOT NULL,
    "aciklama" TEXT,
    "cariId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "bordrolar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cek_senetler" (
    "id" TEXT NOT NULL,
    "tip" "CekSenetTipi" NOT NULL,
    "durum" "CekSenetDurumu" NOT NULL DEFAULT 'PORTFOY',
    "portfoyNo" SERIAL NOT NULL,
    "evrakNo" TEXT NOT NULL,
    "vadeTarihi" TIMESTAMP(3) NOT NULL,
    "girisTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tutar" DECIMAL(15,2) NOT NULL,
    "kalanTutar" DECIMAL(15,2) NOT NULL,
    "borclu" TEXT,
    "banka" TEXT,
    "sube" TEXT,
    "hesapNo" TEXT,
    "sonBordroId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cek_senetler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cek_senet_islemler" (
    "id" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "islemTipi" TEXT NOT NULL,
    "aciklama" TEXT,
    "tutar" DECIMAL(15,2) NOT NULL,
    "cekSenetId" TEXT NOT NULL,
    "bordroId" TEXT,
    "bankaIslemId" TEXT,
    "kasaIslemId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cek_senet_islemler_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "firma_kredi_karti_hatirlaticilar_gun_aktif_idx" ON "firma_kredi_karti_hatirlaticilar"("gun", "aktif");

-- CreateIndex
CREATE INDEX "firma_kredi_karti_hatirlaticilar_kartId_idx" ON "firma_kredi_karti_hatirlaticilar"("kartId");

-- CreateIndex
CREATE UNIQUE INDEX "firma_kredi_karti_hatirlaticilar_kartId_tip_key" ON "firma_kredi_karti_hatirlaticilar"("kartId", "tip");

-- CreateIndex
CREATE INDEX "invoice_profit_faturaId_idx" ON "invoice_profit"("faturaId");

-- CreateIndex
CREATE INDEX "invoice_profit_faturaKalemiId_idx" ON "invoice_profit"("faturaKalemiId");

-- CreateIndex
CREATE INDEX "invoice_profit_stokId_idx" ON "invoice_profit"("stokId");

-- CreateIndex
CREATE INDEX "invoice_profit_tenantId_faturaId_idx" ON "invoice_profit"("tenantId", "faturaId");

-- CreateIndex
CREATE INDEX "warehouse_critical_stocks_productId_idx" ON "warehouse_critical_stocks"("productId");

-- CreateIndex
CREATE INDEX "warehouse_critical_stocks_warehouseId_idx" ON "warehouse_critical_stocks"("warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_critical_stocks_warehouseId_productId_key" ON "warehouse_critical_stocks"("warehouseId", "productId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_items_stokId_idx" ON "warehouse_transfer_items"("stokId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_items_transferId_idx" ON "warehouse_transfer_items"("transferId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_logs_transferId_idx" ON "warehouse_transfer_logs"("transferId");

-- CreateIndex
CREATE INDEX "warehouse_transfer_logs_userId_idx" ON "warehouse_transfer_logs"("userId");

-- CreateIndex
CREATE INDEX "warehouse_transfers_fromWarehouseId_idx" ON "warehouse_transfers"("fromWarehouseId");

-- CreateIndex
CREATE INDEX "warehouse_transfers_tarih_idx" ON "warehouse_transfers"("tarih");

-- CreateIndex
CREATE INDEX "warehouse_transfers_tenantId_durum_idx" ON "warehouse_transfers"("tenantId", "durum");

-- CreateIndex
CREATE INDEX "warehouse_transfers_tenantId_idx" ON "warehouse_transfers"("tenantId");

-- CreateIndex
CREATE INDEX "warehouse_transfers_toWarehouseId_idx" ON "warehouse_transfers"("toWarehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_transfers_transferNo_tenantId_key" ON "warehouse_transfers"("transferNo", "tenantId");

-- CreateIndex
CREATE INDEX "maas_planlari_personelId_yil_idx" ON "maas_planlari"("personelId", "yil");

-- CreateIndex
CREATE INDEX "maas_planlari_durum_idx" ON "maas_planlari"("durum");

-- CreateIndex
CREATE INDEX "maas_planlari_yil_ay_idx" ON "maas_planlari"("yil", "ay");

-- CreateIndex
CREATE INDEX "maas_planlari_tenantId_idx" ON "maas_planlari"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "maas_planlari_personelId_yil_ay_key" ON "maas_planlari"("personelId", "yil", "ay");

-- CreateIndex
CREATE INDEX "maas_odemeler_planId_idx" ON "maas_odemeler"("planId");

-- CreateIndex
CREATE INDEX "maas_odemeler_personelId_idx" ON "maas_odemeler"("personelId");

-- CreateIndex
CREATE INDEX "maas_odemeler_tarih_idx" ON "maas_odemeler"("tarih");

-- CreateIndex
CREATE INDEX "maas_odemeler_tenantId_idx" ON "maas_odemeler"("tenantId");

-- CreateIndex
CREATE INDEX "maas_odeme_detaylari_odemeId_idx" ON "maas_odeme_detaylari"("odemeId");

-- CreateIndex
CREATE INDEX "maas_odeme_detaylari_kasaId_idx" ON "maas_odeme_detaylari"("kasaId");

-- CreateIndex
CREATE INDEX "maas_odeme_detaylari_bankaHesapId_idx" ON "maas_odeme_detaylari"("bankaHesapId");

-- CreateIndex
CREATE INDEX "maas_odeme_detaylari_tenantId_idx" ON "maas_odeme_detaylari"("tenantId");

-- CreateIndex
CREATE INDEX "avanslar_personelId_idx" ON "avanslar"("personelId");

-- CreateIndex
CREATE INDEX "avanslar_durum_idx" ON "avanslar"("durum");

-- CreateIndex
CREATE INDEX "avanslar_tarih_idx" ON "avanslar"("tarih");

-- CreateIndex
CREATE INDEX "avanslar_kasaId_idx" ON "avanslar"("kasaId");

-- CreateIndex
CREATE INDEX "avanslar_tenantId_idx" ON "avanslar"("tenantId");

-- CreateIndex
CREATE INDEX "avans_mahsuplasmalar_avansId_idx" ON "avans_mahsuplasmalar"("avansId");

-- CreateIndex
CREATE INDEX "avans_mahsuplasmalar_planId_idx" ON "avans_mahsuplasmalar"("planId");

-- CreateIndex
CREATE INDEX "avans_mahsuplasmalar_tenantId_idx" ON "avans_mahsuplasmalar"("tenantId");

-- CreateIndex
CREATE INDEX "bordrolar_tenantId_idx" ON "bordrolar"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "bordrolar_bordroNo_tenantId_key" ON "bordrolar"("bordroNo", "tenantId");

-- CreateIndex
CREATE INDEX "cek_senetler_tenantId_idx" ON "cek_senetler"("tenantId");

-- CreateIndex
CREATE INDEX "cek_senetler_vadeTarihi_idx" ON "cek_senetler"("vadeTarihi");

-- CreateIndex
CREATE INDEX "cek_senetler_durum_idx" ON "cek_senetler"("durum");

-- CreateIndex
CREATE INDEX "cek_senet_islemler_tenantId_idx" ON "cek_senet_islemler"("tenantId");

-- CreateIndex
CREATE INDEX "cek_senet_islemler_cekSenetId_idx" ON "cek_senet_islemler"("cekSenetId");

-- CreateIndex
CREATE INDEX "system_parameters_tenantId_idx" ON "system_parameters"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "system_parameters_tenantId_key_key" ON "system_parameters"("tenantId", "key");

-- AddForeignKey
ALTER TABLE "stok_hareketleri" ADD CONSTRAINT "stok_hareketleri_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firma_kredi_karti_hatirlaticilar" ADD CONSTRAINT "firma_kredi_karti_hatirlaticilar_kartId_fkey" FOREIGN KEY ("kartId") REFERENCES "firma_kredi_kartlari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_profit" ADD CONSTRAINT "invoice_profit_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_profit" ADD CONSTRAINT "invoice_profit_faturaKalemiId_fkey" FOREIGN KEY ("faturaKalemiId") REFERENCES "fatura_kalemleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_profit" ADD CONSTRAINT "invoice_profit_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_profit" ADD CONSTRAINT "invoice_profit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_parameters" ADD CONSTRAINT "system_parameters_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_critical_stocks" ADD CONSTRAINT "warehouse_critical_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_critical_stocks" ADD CONSTRAINT "warehouse_critical_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_items" ADD CONSTRAINT "warehouse_transfer_items_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_items" ADD CONSTRAINT "warehouse_transfer_items_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_items" ADD CONSTRAINT "warehouse_transfer_items_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_items" ADD CONSTRAINT "warehouse_transfer_items_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "warehouse_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_logs" ADD CONSTRAINT "warehouse_transfer_logs_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "warehouse_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfer_logs" ADD CONSTRAINT "warehouse_transfer_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_hazirlayanUserId_fkey" FOREIGN KEY ("hazirlayanUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_onaylayanUserId_fkey" FOREIGN KEY ("onaylayanUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_teslimAlanUserId_fkey" FOREIGN KEY ("teslimAlanUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maas_planlari" ADD CONSTRAINT "maas_planlari_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES "personeller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maas_planlari" ADD CONSTRAINT "maas_planlari_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maas_odemeler" ADD CONSTRAINT "maas_odemeler_planId_fkey" FOREIGN KEY ("planId") REFERENCES "maas_planlari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maas_odemeler" ADD CONSTRAINT "maas_odemeler_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES "personeller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maas_odemeler" ADD CONSTRAINT "maas_odemeler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maas_odemeler" ADD CONSTRAINT "maas_odemeler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maas_odeme_detaylari" ADD CONSTRAINT "maas_odeme_detaylari_odemeId_fkey" FOREIGN KEY ("odemeId") REFERENCES "maas_odemeler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maas_odeme_detaylari" ADD CONSTRAINT "maas_odeme_detaylari_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES "kasalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maas_odeme_detaylari" ADD CONSTRAINT "maas_odeme_detaylari_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES "banka_hesaplari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maas_odeme_detaylari" ADD CONSTRAINT "maas_odeme_detaylari_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avanslar" ADD CONSTRAINT "avanslar_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES "personeller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avanslar" ADD CONSTRAINT "avanslar_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES "kasalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avanslar" ADD CONSTRAINT "avanslar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avanslar" ADD CONSTRAINT "avanslar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avans_mahsuplasmalar" ADD CONSTRAINT "avans_mahsuplasmalar_avansId_fkey" FOREIGN KEY ("avansId") REFERENCES "avanslar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avans_mahsuplasmalar" ADD CONSTRAINT "avans_mahsuplasmalar_planId_fkey" FOREIGN KEY ("planId") REFERENCES "maas_planlari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avans_mahsuplasmalar" ADD CONSTRAINT "avans_mahsuplasmalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bordrolar" ADD CONSTRAINT "bordrolar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bordrolar" ADD CONSTRAINT "bordrolar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_sonBordroId_fkey" FOREIGN KEY ("sonBordroId") REFERENCES "bordrolar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senet_islemler" ADD CONSTRAINT "cek_senet_islemler_cekSenetId_fkey" FOREIGN KEY ("cekSenetId") REFERENCES "cek_senetler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senet_islemler" ADD CONSTRAINT "cek_senet_islemler_bordroId_fkey" FOREIGN KEY ("bordroId") REFERENCES "bordrolar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
