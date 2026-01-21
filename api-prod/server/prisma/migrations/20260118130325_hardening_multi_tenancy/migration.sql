/*
  Warnings:

  - A unique constraint covering the columns `[module,tenantId]` on the table `code_templates` will be added. If there are existing duplicate values, this will fail.
  - Made the column `tenantId` on table `banka_havaleler` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `banka_hesap_hareketler` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `banka_hesaplari` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `basit_siparisler` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `cari_hareketler` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `cariler` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `cek_senetler` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `code_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `efatura_inbox` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `efatura_xml` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `fatura_kalemleri` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `fatura_tahsilatlar` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `faturalar` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `firma_kredi_karti_hareketler` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `firma_kredi_kartlari` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `kasa_hareketler` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `kasalar` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `locations` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `masraflar` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `personel_odemeler` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `personeller` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `product_barcodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `product_location_stocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `purchase_order_items` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `purchase_orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `satin_alma_irsaliyeleri` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `satin_alma_irsaliyesi_kalemleri` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `satin_alma_siparis_kalemleri` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `satin_alma_siparisleri` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `satis_irsaliyeleri` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `satis_irsaliyesi_kalemleri` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `sayim_kalemleri` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `sayimlar` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `siparis_hazirliklar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `siparis_kalemleri` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `siparisler` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `solution_package_parts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `stock_moves` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `stok_hareketleri` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `stoklar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `tahsilatlar` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `teklif_kalemleri` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `teklifler` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `urun_raflar` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `warehouses` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `work_order_audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `work_order_lines` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "code_templates_module_key";

-- DropIndex
DROP INDEX "product_location_stocks_warehouseId_locationId_productId_key";

-- AlterTable
ALTER TABLE "banka_havale_logs" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "banka_havaleler" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "banka_hesap_hareketler" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "banka_hesaplari" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "basit_siparisler" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "cari_hareketler" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "cariler" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "cek_senet_logs" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "cek_senetler" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "code_templates" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "efatura_inbox" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "efatura_xml" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "fatura_kalemleri" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "fatura_logs" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "fatura_tahsilatlar" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "faturalar" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "firma_kredi_karti_hareketler" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "firma_kredi_kartlari" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "kasa_hareketler" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "kasalar" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "masraflar" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "personel_odemeler" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "personeller" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "product_barcodes" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_location_stocks" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchase_order_items" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchase_orders" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "satin_alma_irsaliyeleri" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "satin_alma_irsaliyesi_kalemleri" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "satin_alma_irsaliyesi_logs" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "satin_alma_siparis_kalemleri" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "satin_alma_siparis_logs" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "satin_alma_siparisleri" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "satis_irsaliyeleri" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "satis_irsaliyesi_kalemleri" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "satis_irsaliyesi_logs" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "sayim_kalemleri" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sayimlar" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "siparis_hazirliklar" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "siparis_kalemleri" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "siparis_logs" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "siparisler" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "solution_package_parts" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stock_moves" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stok_hareketleri" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stoklar" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "tahsilatlar" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "teklif_kalemleri" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "teklif_logs" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "teklifler" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "urun_raflar" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "warehouses" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "work_order_audit_logs" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "work_order_lines" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "banka_havale_logs_tenantId_idx" ON "banka_havale_logs"("tenantId");

-- CreateIndex
CREATE INDEX "banka_hesap_hareketler_tenantId_idx" ON "banka_hesap_hareketler"("tenantId");

-- CreateIndex
CREATE INDEX "banka_hesaplari_tenantId_idx" ON "banka_hesaplari"("tenantId");

-- CreateIndex
CREATE INDEX "cari_hareketler_tenantId_idx" ON "cari_hareketler"("tenantId");

-- CreateIndex
CREATE INDEX "cek_senet_logs_tenantId_idx" ON "cek_senet_logs"("tenantId");

-- CreateIndex
CREATE INDEX "code_templates_tenantId_idx" ON "code_templates"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "code_templates_module_tenantId_key" ON "code_templates"("module", "tenantId");

-- CreateIndex
CREATE INDEX "efatura_inbox_tenantId_idx" ON "efatura_inbox"("tenantId");

-- CreateIndex
CREATE INDEX "efatura_xml_tenantId_idx" ON "efatura_xml"("tenantId");

-- CreateIndex
CREATE INDEX "fatura_kalemleri_tenantId_idx" ON "fatura_kalemleri"("tenantId");

-- CreateIndex
CREATE INDEX "fatura_logs_tenantId_idx" ON "fatura_logs"("tenantId");

-- CreateIndex
CREATE INDEX "fatura_tahsilatlar_tenantId_idx" ON "fatura_tahsilatlar"("tenantId");

-- CreateIndex
CREATE INDEX "firma_kredi_karti_hareketler_tenantId_idx" ON "firma_kredi_karti_hareketler"("tenantId");

-- CreateIndex
CREATE INDEX "firma_kredi_kartlari_tenantId_idx" ON "firma_kredi_kartlari"("tenantId");

-- CreateIndex
CREATE INDEX "kasa_hareketler_tenantId_idx" ON "kasa_hareketler"("tenantId");

-- CreateIndex
CREATE INDEX "locations_tenantId_idx" ON "locations"("tenantId");

-- CreateIndex
CREATE INDEX "personel_odemeler_tenantId_idx" ON "personel_odemeler"("tenantId");

-- CreateIndex
CREATE INDEX "product_barcodes_tenantId_idx" ON "product_barcodes"("tenantId");

-- CreateIndex
CREATE INDEX "product_location_stocks_tenantId_idx" ON "product_location_stocks"("tenantId");

-- CreateIndex
CREATE INDEX "purchase_order_items_tenantId_idx" ON "purchase_order_items"("tenantId");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyesi_kalemleri_tenantId_idx" ON "satin_alma_irsaliyesi_kalemleri"("tenantId");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyesi_logs_tenantId_idx" ON "satin_alma_irsaliyesi_logs"("tenantId");

-- CreateIndex
CREATE INDEX "satin_alma_siparis_kalemleri_tenantId_idx" ON "satin_alma_siparis_kalemleri"("tenantId");

-- CreateIndex
CREATE INDEX "satin_alma_siparis_logs_tenantId_idx" ON "satin_alma_siparis_logs"("tenantId");

-- CreateIndex
CREATE INDEX "satis_irsaliyesi_kalemleri_tenantId_idx" ON "satis_irsaliyesi_kalemleri"("tenantId");

-- CreateIndex
CREATE INDEX "satis_irsaliyesi_logs_tenantId_idx" ON "satis_irsaliyesi_logs"("tenantId");

-- CreateIndex
CREATE INDEX "sayim_kalemleri_tenantId_idx" ON "sayim_kalemleri"("tenantId");

-- CreateIndex
CREATE INDEX "siparis_hazirliklar_tenantId_idx" ON "siparis_hazirliklar"("tenantId");

-- CreateIndex
CREATE INDEX "siparis_kalemleri_tenantId_idx" ON "siparis_kalemleri"("tenantId");

-- CreateIndex
CREATE INDEX "siparis_logs_tenantId_idx" ON "siparis_logs"("tenantId");

-- CreateIndex
CREATE INDEX "solution_package_parts_tenantId_idx" ON "solution_package_parts"("tenantId");

-- CreateIndex
CREATE INDEX "stock_moves_tenantId_idx" ON "stock_moves"("tenantId");

-- CreateIndex
CREATE INDEX "stok_hareketleri_tenantId_idx" ON "stok_hareketleri"("tenantId");

-- CreateIndex
CREATE INDEX "teklif_kalemleri_tenantId_idx" ON "teklif_kalemleri"("tenantId");

-- CreateIndex
CREATE INDEX "teklif_logs_tenantId_idx" ON "teklif_logs"("tenantId");

-- CreateIndex
CREATE INDEX "urun_raflar_tenantId_idx" ON "urun_raflar"("tenantId");

-- CreateIndex
CREATE INDEX "work_order_audit_logs_tenantId_idx" ON "work_order_audit_logs"("tenantId");

-- AddForeignKey
ALTER TABLE "stok_hareketleri" ADD CONSTRAINT "stok_hareketleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cari_hareketler" ADD CONSTRAINT "cari_hareketler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_hesaplari" ADD CONSTRAINT "banka_hesaplari_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_hesap_hareketler" ADD CONSTRAINT "banka_hesap_hareketler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firma_kredi_kartlari" ADD CONSTRAINT "firma_kredi_kartlari_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firma_kredi_karti_hareketler" ADD CONSTRAINT "firma_kredi_karti_hareketler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kasa_hareketler" ADD CONSTRAINT "kasa_hareketler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_logs" ADD CONSTRAINT "fatura_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_kalemleri" ADD CONSTRAINT "fatura_kalemleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_tahsilatlar" ADD CONSTRAINT "fatura_tahsilatlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "efatura_xml" ADD CONSTRAINT "efatura_xml_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_kalemleri" ADD CONSTRAINT "siparis_kalemleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_logs" ADD CONSTRAINT "siparis_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_hazirliklar" ADD CONSTRAINT "siparis_hazirliklar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyesi_kalemleri" ADD CONSTRAINT "satis_irsaliyesi_kalemleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyesi_logs" ADD CONSTRAINT "satis_irsaliyesi_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklif_kalemleri" ADD CONSTRAINT "teklif_kalemleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklif_logs" ADD CONSTRAINT "teklif_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sayim_kalemleri" ADD CONSTRAINT "sayim_kalemleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urun_raflar" ADD CONSTRAINT "urun_raflar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_barcodes" ADD CONSTRAINT "product_barcodes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_location_stocks" ADD CONSTRAINT "product_location_stocks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_havale_logs" ADD CONSTRAINT "banka_havale_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senet_logs" ADD CONSTRAINT "cek_senet_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personel_odemeler" ADD CONSTRAINT "personel_odemeler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_templates" ADD CONSTRAINT "code_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparis_kalemleri" ADD CONSTRAINT "satin_alma_siparis_kalemleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparis_logs" ADD CONSTRAINT "satin_alma_siparis_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyesi_kalemleri" ADD CONSTRAINT "satin_alma_irsaliyesi_kalemleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyesi_logs" ADD CONSTRAINT "satin_alma_irsaliyesi_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "efatura_inbox" ADD CONSTRAINT "efatura_inbox_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_lines" ADD CONSTRAINT "work_order_lines_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_audit_logs" ADD CONSTRAINT "work_order_audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_status_history" ADD CONSTRAINT "work_order_status_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_findings" ADD CONSTRAINT "technical_findings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_notes" ADD CONSTRAINT "diagnostic_notes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_packages" ADD CONSTRAINT "solution_packages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_package_parts" ADD CONSTRAINT "solution_package_parts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_approvals" ADD CONSTRAINT "manager_approvals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_rejections" ADD CONSTRAINT "manager_rejections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
