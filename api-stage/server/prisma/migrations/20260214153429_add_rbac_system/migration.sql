/*
  Warnings:

  - The values [CEK_TAHSILAT] on the enum `BelgeTipi` will be removed. If these variants are still used in the database, this will fail.
  - The values [GIRIS_BORDROSU,CIKIS_BORDROSU] on the enum `BordroTipi` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bankaAdi` on the `banka_hesaplari` table. All the data in the column will be lost.
  - You are about to drop the column `kasaId` on the `banka_hesaplari` table. All the data in the column will be lost.
  - You are about to drop the column `subeAdi` on the `banka_hesaplari` table. All the data in the column will be lost.
  - You are about to drop the column `subeKodu` on the `banka_hesaplari` table. All the data in the column will be lost.
  - You are about to drop the column `borclu` on the `cek_senetler` table. All the data in the column will be lost.
  - You are about to drop the column `evrakNo` on the `cek_senetler` table. All the data in the column will be lost.
  - You are about to drop the column `girisTarihi` on the `cek_senetler` table. All the data in the column will be lost.
  - You are about to drop the column `portfoyNo` on the `cek_senetler` table. All the data in the column will be lost.
  - You are about to drop the column `vadeTarihi` on the `cek_senetler` table. All the data in the column will be lost.
  - The `durum` column on the `cek_senetler` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `cek_senet_islemler` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `hareketTipi` on the `banka_hesap_hareketler` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `bankaId` to the `banka_hesaplari` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cariId` to the `cek_senetler` table without a default value. This is not possible if the table is not empty.
  - Added the required column `portfoyTip` to the `cek_senetler` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vade` to the `cek_senetler` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tip` on the `cek_senetler` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "KrediTuru" AS ENUM ('ESIT_TAKSITLI', 'ROTATIF');

-- CreateEnum
CREATE TYPE "KrediDurum" AS ENUM ('AKTIF', 'KAPANDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "KrediPlanDurum" AS ENUM ('BEKLIYOR', 'ODENDI', 'GECIKMEDE', 'KISMI_ODENDI');

-- CreateEnum
CREATE TYPE "BankaHareketTipi" AS ENUM ('GELEN', 'GIDEN');

-- CreateEnum
CREATE TYPE "BankaHareketAltTipi" AS ENUM ('HAVALE_GELEN', 'HAVALE_GIDEN', 'KREDI_KULLANIM', 'KREDI_ODEME', 'TEMINAT_CEK', 'TEMINAT_SENET', 'POS_TAHSILAT', 'KART_HARCAMA', 'KART_ODEME', 'VIRMAN', 'KREDI_TAKSIT_ODEME', 'DIGER');

-- CreateEnum
CREATE TYPE "CekSenetTip" AS ENUM ('CEK', 'SENET');

-- CreateEnum
CREATE TYPE "PortfoyTip" AS ENUM ('ALACAK', 'BORC');

-- CreateEnum
CREATE TYPE "CekSenetDurum" AS ENUM ('PORTFOYDE', 'ODENMEDI', 'BANKAYA_VERILDI', 'BANKA_TAHSILDE', 'BANKA_TEMINATTA', 'AVUKAT_TAKIBINDE', 'TAHSIL_EDILDI', 'ODENDI', 'CIRO_EDILDI', 'IADE_EDILDI', 'KARSILIKSIZ');

-- CreateEnum
CREATE TYPE "RiskDurumu" AS ENUM ('NORMAL', 'RISKLI', 'BLOKELI', 'TAKIPTE');

-- CreateEnum
CREATE TYPE "AdresTipi" AS ENUM ('FATURA', 'SEVK', 'DIGER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BankaHesapTipi" ADD VALUE 'KREDI';
ALTER TYPE "BankaHesapTipi" ADD VALUE 'FIRMA_KREDI_KARTI';
ALTER TYPE "BankaHesapTipi" ADD VALUE 'VADELI';
ALTER TYPE "BankaHesapTipi" ADD VALUE 'YATIRIM';
ALTER TYPE "BankaHesapTipi" ADD VALUE 'ALTIN';
ALTER TYPE "BankaHesapTipi" ADD VALUE 'DOVIZ';
ALTER TYPE "BankaHesapTipi" ADD VALUE 'DIGER';

-- AlterEnum
BEGIN;
CREATE TYPE "BelgeTipi_new" AS ENUM ('FATURA', 'TAHSILAT', 'ODEME', 'CEK_SENET', 'DEVIR', 'DUZELTME', 'CEK_GIRIS', 'CEK_CIKIS', 'IADE');
ALTER TABLE "cari_hareketler" ALTER COLUMN "belgeTipi" TYPE "BelgeTipi_new" USING ("belgeTipi"::text::"BelgeTipi_new");
ALTER TYPE "BelgeTipi" RENAME TO "BelgeTipi_old";
ALTER TYPE "BelgeTipi_new" RENAME TO "BelgeTipi";
DROP TYPE "public"."BelgeTipi_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "BordroTipi_new" AS ENUM ('MUSTERI_EVRAK_GIRISI', 'BANKA_TAHSIL_CIROSU', 'BANKA_TEMINAT_CIROSU', 'BORC_EVRAK_CIKISI', 'CARIYE_EVRAK_CIROSU', 'IADE_BORDROSU');
ALTER TABLE "bordrolar" ALTER COLUMN "tip" TYPE "BordroTipi_new" USING ("tip"::text::"BordroTipi_new");
ALTER TYPE "BordroTipi" RENAME TO "BordroTipi_old";
ALTER TYPE "BordroTipi_new" RENAME TO "BordroTipi";
DROP TYPE "public"."BordroTipi_old";
COMMIT;

-- AlterEnum
ALTER TYPE "KasaTipi" ADD VALUE 'CEK_SENET';

-- AlterEnum
ALTER TYPE "LogAction" ADD VALUE 'CIRO';

-- AlterEnum
ALTER TYPE "ModuleType" ADD VALUE 'TECHNICIAN';

-- DropForeignKey
ALTER TABLE "banka_havaleler" DROP CONSTRAINT "banka_havaleler_bankaHesabiId_fkey";

-- DropForeignKey
ALTER TABLE "banka_hesaplari" DROP CONSTRAINT "banka_hesaplari_kasaId_fkey";

-- DropForeignKey
ALTER TABLE "bordrolar" DROP CONSTRAINT "bordrolar_createdById_fkey";

-- DropForeignKey
ALTER TABLE "cari_hareketler" DROP CONSTRAINT "cari_hareketler_cariId_fkey";

-- DropForeignKey
ALTER TABLE "cek_senet_islemler" DROP CONSTRAINT "cek_senet_islemler_bordroId_fkey";

-- DropForeignKey
ALTER TABLE "cek_senet_islemler" DROP CONSTRAINT "cek_senet_islemler_cekSenetId_fkey";

-- DropForeignKey
ALTER TABLE "fatura_tahsilatlar" DROP CONSTRAINT "fatura_tahsilatlar_faturaId_fkey";

-- DropForeignKey
ALTER TABLE "fatura_tahsilatlar" DROP CONSTRAINT "fatura_tahsilatlar_tahsilatId_fkey";

-- DropForeignKey
ALTER TABLE "stock_moves" DROP CONSTRAINT "stock_moves_productId_fkey";

-- DropForeignKey
ALTER TABLE "stok_hareketleri" DROP CONSTRAINT "stok_hareketleri_stokId_fkey";

-- DropForeignKey
ALTER TABLE "tahsilatlar" DROP CONSTRAINT "tahsilatlar_faturaId_fkey";

-- DropIndex
DROP INDEX "banka_hesaplari_kasaId_idx";

-- DropIndex
DROP INDEX "bordrolar_bordroNo_tenantId_key";

-- DropIndex
DROP INDEX "bordrolar_tenantId_idx";

-- DropIndex
DROP INDEX "cek_senetler_vadeTarihi_idx";

-- AlterTable
ALTER TABLE "banka_havaleler" ADD COLUMN     "bankaHesapId" TEXT,
ALTER COLUMN "bankaHesabiId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "banka_hesap_hareketler" ADD COLUMN     "hareketAltTipi" "BankaHareketAltTipi",
ADD COLUMN     "komisyonOrani" DECIMAL(5,2),
ADD COLUMN     "komisyonTutar" DECIMAL(15,2),
ADD COLUMN     "netTutar" DECIMAL(15,2),
DROP COLUMN "hareketTipi",
ADD COLUMN     "hareketTipi" "BankaHareketTipi" NOT NULL;

-- AlterTable
ALTER TABLE "banka_hesaplari" DROP COLUMN "bankaAdi",
DROP COLUMN "kasaId",
DROP COLUMN "subeAdi",
DROP COLUMN "subeKodu",
ADD COLUMN     "bankaId" TEXT NOT NULL,
ADD COLUMN     "hesapKesimGunu" INTEGER,
ADD COLUMN     "kartLimiti" DECIMAL(15,2),
ADD COLUMN     "komisyonOrani" DECIMAL(5,2),
ADD COLUMN     "krediLimiti" DECIMAL(15,2),
ADD COLUMN     "kullanilanLimit" DECIMAL(15,2),
ADD COLUMN     "sonOdemeGunu" INTEGER,
ADD COLUMN     "terminalNo" TEXT;

-- AlterTable
ALTER TABLE "bordrolar" ADD COLUMN     "bankaHesabiId" TEXT,
ALTER COLUMN "tenantId" DROP NOT NULL,
ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "cari_hareketler" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "cariler" ADD COLUMN     "bankaBilgileri" TEXT,
ADD COLUMN     "faks" TEXT,
ADD COLUMN     "ozelKod1" TEXT,
ADD COLUMN     "ozelKod2" TEXT,
ADD COLUMN     "paraBirimi" TEXT DEFAULT 'TRY',
ADD COLUMN     "riskDurumu" "RiskDurumu" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "riskLimiti" DECIMAL(15,2),
ADD COLUMN     "satisElemaniId" TEXT,
ADD COLUMN     "sektor" TEXT,
ADD COLUMN     "teminatTutar" DECIMAL(15,2),
ADD COLUMN     "vadeGun" INTEGER,
ADD COLUMN     "webSite" TEXT;

-- AlterTable
ALTER TABLE "cek_senetler" DROP COLUMN "borclu",
DROP COLUMN "evrakNo",
DROP COLUMN "girisTarihi",
DROP COLUMN "portfoyNo",
DROP COLUMN "vadeTarihi",
ADD COLUMN     "aciklama" TEXT,
ADD COLUMN     "cariId" TEXT NOT NULL,
ADD COLUMN     "cekNo" TEXT,
ADD COLUMN     "ciroEdildi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ciroEdilen" TEXT,
ADD COLUMN     "ciroTarihi" TIMESTAMP(3),
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "portfoyTip" "PortfoyTip" NOT NULL,
ADD COLUMN     "seriNo" TEXT,
ADD COLUMN     "tahsilKasaId" TEXT,
ADD COLUMN     "tahsilTarihi" TIMESTAMP(3),
ADD COLUMN     "updatedBy" TEXT,
ADD COLUMN     "vade" TIMESTAMP(3) NOT NULL,
DROP COLUMN "tip",
ADD COLUMN     "tip" "CekSenetTip" NOT NULL,
DROP COLUMN "durum",
ADD COLUMN     "durum" "CekSenetDurum",
ALTER COLUMN "kalanTutar" SET DEFAULT 0,
ALTER COLUMN "tenantId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "fatura_tahsilatlar" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "faturalar" ADD COLUMN     "dovizCinsi" TEXT DEFAULT 'TRY',
ADD COLUMN     "dovizKuru" DECIMAL(12,6),
ADD COLUMN     "dovizToplam" DECIMAL(12,2),
ADD COLUMN     "satisElemaniId" TEXT;

-- AlterTable
ALTER TABLE "invoice_profit" ALTER COLUMN "toplamSatisTutari" DROP DEFAULT,
ALTER COLUMN "toplamMaliyet" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "satis_irsaliyesi_kalemleri" ADD COLUMN     "faturalananMiktar" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "stok_hareketleri" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "tahsilatlar" ADD COLUMN     "satisElemaniId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "roleId" TEXT;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "bodyType" TEXT,
ADD COLUMN     "engineNumber" TEXT,
ADD COLUMN     "inspectionDate" TIMESTAMP(3),
ADD COLUMN     "insuranceDate" TIMESTAMP(3),
ADD COLUMN     "kaskoDate" TIMESTAMP(3),
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "licenseOwner" TEXT,
ADD COLUMN     "licenseSerial" TEXT,
ADD COLUMN     "transmission" TEXT,
ADD COLUMN     "warrantyDate" TIMESTAMP(3);

-- DropTable
DROP TABLE "cek_senet_islemler";

-- DropEnum
DROP TYPE "CekSenetDurumu";

-- DropEnum
DROP TYPE "CekSenetTipi";

-- CreateTable
CREATE TABLE "bankalar" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "sube" TEXT,
    "sehir" TEXT,
    "yetkili" TEXT,
    "telefon" TEXT,
    "durum" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logo" TEXT,

    CONSTRAINT "bankalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banka_krediler" (
    "id" TEXT NOT NULL,
    "bankaHesapId" TEXT NOT NULL,
    "tutar" DECIMAL(15,2) NOT NULL,
    "toplamGeriOdeme" DECIMAL(15,2) NOT NULL,
    "toplamFaiz" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "krediTuru" "KrediTuru" NOT NULL DEFAULT 'ESIT_TAKSITLI',
    "yillikFaizOrani" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "odemeSikligi" INTEGER NOT NULL DEFAULT 1,
    "taksitSayisi" INTEGER NOT NULL,
    "baslangicTarihi" TIMESTAMP(3) NOT NULL,
    "aciklama" TEXT,
    "durum" "KrediDurum" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banka_krediler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banka_kredi_planlari" (
    "id" TEXT NOT NULL,
    "krediId" TEXT NOT NULL,
    "taksitNo" INTEGER NOT NULL,
    "vadeTarihi" TIMESTAMP(3) NOT NULL,
    "tutar" DECIMAL(15,2) NOT NULL,
    "odenen" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "durum" "KrediPlanDurum" NOT NULL DEFAULT 'BEKLIYOR',

    CONSTRAINT "banka_kredi_planlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deleted_cek_senetler" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "tip" "CekSenetTip" NOT NULL,
    "portfoyTip" "PortfoyTip" NOT NULL,
    "cariId" TEXT NOT NULL,
    "cariUnvan" TEXT NOT NULL,
    "tutar" DECIMAL(15,2) NOT NULL,
    "vade" TIMESTAMP(3) NOT NULL,
    "banka" TEXT,
    "sube" TEXT,
    "hesapNo" TEXT,
    "cekNo" TEXT,
    "seriNo" TEXT,
    "durum" "CekSenetDurum" NOT NULL,
    "tahsilTarihi" TIMESTAMP(3),
    "tahsilKasaId" TEXT,
    "ciroEdildi" BOOLEAN NOT NULL,
    "ciroTarihi" TIMESTAMP(3),
    "ciroEdilen" TEXT,
    "aciklama" TEXT,
    "originalCreatedBy" TEXT,
    "originalUpdatedBy" TEXT,
    "originalCreatedAt" TIMESTAMP(3) NOT NULL,
    "originalUpdatedAt" TIMESTAMP(3) NOT NULL,
    "deletedBy" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleteReason" TEXT,

    CONSTRAINT "deleted_cek_senetler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cek_senet_logs" (
    "id" TEXT NOT NULL,
    "cekSenetId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cek_senet_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satis_elemanlari" (
    "id" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "satis_elemanlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cari_yetkililer" (
    "id" TEXT NOT NULL,
    "cariId" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "unvan" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "dahili" TEXT,
    "varsayilan" BOOLEAN NOT NULL DEFAULT false,
    "notlar" TEXT,

    CONSTRAINT "cari_yetkililer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cari_adresler" (
    "id" TEXT NOT NULL,
    "cariId" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "tip" "AdresTipi" NOT NULL DEFAULT 'SEVK',
    "adres" TEXT NOT NULL,
    "il" TEXT,
    "ilce" TEXT,
    "postaKodu" TEXT,
    "varsayilan" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cari_adresler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cari_bankalar" (
    "id" TEXT NOT NULL,
    "cariId" TEXT NOT NULL,
    "bankaAdi" TEXT NOT NULL,
    "subeAdi" TEXT,
    "subeKodu" TEXT,
    "hesapNo" TEXT,
    "iban" TEXT NOT NULL,
    "paraBirimi" TEXT NOT NULL DEFAULT 'TRY',
    "aciklama" TEXT,

    CONSTRAINT "cari_bankalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "roleId" TEXT,
    "permissionId" TEXT,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bankalar_tenantId_idx" ON "bankalar"("tenantId");

-- CreateIndex
CREATE INDEX "banka_krediler_bankaHesapId_idx" ON "banka_krediler"("bankaHesapId");

-- CreateIndex
CREATE INDEX "banka_kredi_planlari_krediId_idx" ON "banka_kredi_planlari"("krediId");

-- CreateIndex
CREATE INDEX "deleted_cek_senetler_originalId_idx" ON "deleted_cek_senetler"("originalId");

-- CreateIndex
CREATE INDEX "deleted_cek_senetler_deletedAt_idx" ON "deleted_cek_senetler"("deletedAt");

-- CreateIndex
CREATE INDEX "deleted_cek_senetler_cariId_idx" ON "deleted_cek_senetler"("cariId");

-- CreateIndex
CREATE INDEX "cek_senet_logs_cekSenetId_idx" ON "cek_senet_logs"("cekSenetId");

-- CreateIndex
CREATE INDEX "cek_senet_logs_userId_idx" ON "cek_senet_logs"("userId");

-- CreateIndex
CREATE INDEX "satis_elemanlari_tenantId_idx" ON "satis_elemanlari"("tenantId");

-- CreateIndex
CREATE INDEX "cari_yetkililer_cariId_idx" ON "cari_yetkililer"("cariId");

-- CreateIndex
CREATE INDEX "cari_adresler_cariId_idx" ON "cari_adresler"("cariId");

-- CreateIndex
CREATE INDEX "cari_bankalar_cariId_idx" ON "cari_bankalar"("cariId");

-- CreateIndex
CREATE INDEX "roles_tenantId_idx" ON "roles"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenantId_name_key" ON "roles"("tenantId", "name");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_module_action_key" ON "permissions"("module", "action");

-- CreateIndex
CREATE INDEX "role_permissions_roleId_idx" ON "role_permissions"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "permission_audit_logs_tenantId_idx" ON "permission_audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "permission_audit_logs_createdAt_idx" ON "permission_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "permission_audit_logs_roleId_idx" ON "permission_audit_logs"("roleId");

-- CreateIndex
CREATE INDEX "banka_hesap_hareketler_hareketTipi_idx" ON "banka_hesap_hareketler"("hareketTipi");

-- CreateIndex
CREATE INDEX "banka_hesaplari_bankaId_idx" ON "banka_hesaplari"("bankaId");

-- CreateIndex
CREATE INDEX "cari_hareketler_cariId_tenantId_idx" ON "cari_hareketler"("cariId", "tenantId");

-- CreateIndex
CREATE INDEX "cari_hareketler_tenantId_idx" ON "cari_hareketler"("tenantId");

-- CreateIndex
CREATE INDEX "cek_senetler_tenantId_vade_idx" ON "cek_senetler"("tenantId", "vade");

-- CreateIndex
CREATE INDEX "cek_senetler_cariId_idx" ON "cek_senetler"("cariId");

-- CreateIndex
CREATE INDEX "cek_senetler_vade_idx" ON "cek_senetler"("vade");

-- CreateIndex
CREATE INDEX "cek_senetler_durum_idx" ON "cek_senetler"("durum");

-- CreateIndex
CREATE INDEX "cek_senetler_tip_idx" ON "cek_senetler"("tip");

-- CreateIndex
CREATE INDEX "cek_senetler_portfoyTip_idx" ON "cek_senetler"("portfoyTip");

-- CreateIndex
CREATE INDEX "fatura_tahsilatlar_faturaId_tenantId_idx" ON "fatura_tahsilatlar"("faturaId", "tenantId");

-- CreateIndex
CREATE INDEX "fatura_tahsilatlar_tahsilatId_tenantId_idx" ON "fatura_tahsilatlar"("tahsilatId", "tenantId");

-- CreateIndex
CREATE INDEX "fatura_tahsilatlar_tenantId_idx" ON "fatura_tahsilatlar"("tenantId");

-- CreateIndex
CREATE INDEX "stok_hareketleri_stokId_tenantId_idx" ON "stok_hareketleri"("stokId", "tenantId");

-- CreateIndex
CREATE INDEX "stok_hareketleri_tenantId_idx" ON "stok_hareketleri"("tenantId");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_hareketleri" ADD CONSTRAINT "stok_hareketleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_hareketleri" ADD CONSTRAINT "stok_hareketleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cariler" ADD CONSTRAINT "cariler_satisElemaniId_fkey" FOREIGN KEY ("satisElemaniId") REFERENCES "satis_elemanlari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cari_hareketler" ADD CONSTRAINT "cari_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cari_hareketler" ADD CONSTRAINT "cari_hareketler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankalar" ADD CONSTRAINT "bankalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_hesaplari" ADD CONSTRAINT "banka_hesaplari_bankaId_fkey" FOREIGN KEY ("bankaId") REFERENCES "bankalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_krediler" ADD CONSTRAINT "banka_krediler_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES "banka_hesaplari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_kredi_planlari" ADD CONSTRAINT "banka_kredi_planlari_krediId_fkey" FOREIGN KEY ("krediId") REFERENCES "banka_krediler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_satisElemaniId_fkey" FOREIGN KEY ("satisElemaniId") REFERENCES "satis_elemanlari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_satisElemaniId_fkey" FOREIGN KEY ("satisElemaniId") REFERENCES "satis_elemanlari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_tahsilatlar" ADD CONSTRAINT "fatura_tahsilatlar_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_tahsilatlar" ADD CONSTRAINT "fatura_tahsilatlar_tahsilatId_fkey" FOREIGN KEY ("tahsilatId") REFERENCES "tahsilatlar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_tahsilatlar" ADD CONSTRAINT "fatura_tahsilatlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_productId_fkey" FOREIGN KEY ("productId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_havaleler" ADD CONSTRAINT "banka_havaleler_bankaHesabiId_fkey" FOREIGN KEY ("bankaHesabiId") REFERENCES "kasalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_havaleler" ADD CONSTRAINT "banka_havaleler_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES "banka_hesaplari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bordrolar" ADD CONSTRAINT "bordrolar_bankaHesabiId_fkey" FOREIGN KEY ("bankaHesabiId") REFERENCES "banka_hesaplari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bordrolar" ADD CONSTRAINT "bordrolar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bordrolar" ADD CONSTRAINT "bordrolar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_tahsilKasaId_fkey" FOREIGN KEY ("tahsilKasaId") REFERENCES "kasalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deleted_cek_senetler" ADD CONSTRAINT "deleted_cek_senetler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senet_logs" ADD CONSTRAINT "cek_senet_logs_cekSenetId_fkey" FOREIGN KEY ("cekSenetId") REFERENCES "cek_senetler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senet_logs" ADD CONSTRAINT "cek_senet_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_elemanlari" ADD CONSTRAINT "satis_elemanlari_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cari_yetkililer" ADD CONSTRAINT "cari_yetkililer_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cari_adresler" ADD CONSTRAINT "cari_adresler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cari_bankalar" ADD CONSTRAINT "cari_bankalar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_audit_logs" ADD CONSTRAINT "permission_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_audit_logs" ADD CONSTRAINT "permission_audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
